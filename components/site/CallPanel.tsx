"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CallReport } from "@/lib/call-summary";
import { CallReportView } from "./CallReportView";

/* A live call with our voice agent, in the page. The provider's widget runs
   headless (no UI of its own), so everything the visitor sees is ours.

   While the call runs both sides are recorded -- the agent on the left
   channel, the caller on the right -- and streamed to /api/live-transcribe
   for captions. When it ends, those words go to /api/call-summary, which
   writes the report shown here (lib/call-summary.ts). */

const TOKEN =
  process.env.NEXT_PUBLIC_VOICE_WIDGET_TOKEN ?? "emb_q9JQkqck36Exq0CXCgi1ZxGP07yVIaz7SgKSBI7UD_s";
const ENDPOINT = process.env.NEXT_PUBLIC_VOICE_WIDGET_ENDPOINT ?? "https://voice.fiaxe.com";
const SCRIPT_ID = "fiaxe-voice-widget";

type Status = "idle" | "loading" | "connecting" | "connected" | "summarising" | "report" | "failed";

type Widget = {
  start: () => Promise<void> | void;
  stop: () => Promise<void> | void;
  getState: () => { stream?: MediaStream | null };
  onStatusChange: (cb: (status: string) => void) => void;
  onCallEnd: (cb: () => void) => void;
  onError: (cb: (e: unknown) => void) => void;
};

declare global {
  interface Window {
    DograhWidget?: Widget;
  }
}

const BARS = 40;

type Line = { text: string; who: "agent" | "caller" };

function loadWidget(): Promise<Widget> {
  if (window.DograhWidget) return Promise.resolve(window.DograhWidget);
  return new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    const script = existing ?? document.createElement("script");
    const done = () => (window.DograhWidget ? resolve(window.DograhWidget) : reject(new Error("widget missing")));
    script.addEventListener("load", done, { once: true });
    script.addEventListener("error", () => reject(new Error("widget failed to load")), { once: true });
    if (existing) return;
    script.id = SCRIPT_ID;
    script.async = true;
    script.setAttribute(
      "data-dograh-context",
      JSON.stringify({ page_url: window.location.href, today: new Date().toISOString().slice(0, 10) }),
    );
    script.src = `${ENDPOINT}/embed/dograh-widget.js?token=${TOKEN}&environment=production&apiEndpoint=${ENDPOINT}`;
    document.body.appendChild(script);
  });
}

/* One line of the call. The agent sits on the left, the caller on the
   right, the way a chat reads. */
function Bubble({ who, text, live = false }: { who: "agent" | "caller"; text: string; live?: boolean }) {
  const agent = who === "agent";
  return (
    <p
      className={`lc-line max-w-[85%] rounded-2xl px-3 py-1.5 text-[13px] leading-snug ${
        agent
          ? "self-start rounded-tl-sm bg-surface-2 text-cream"
          : "self-end rounded-tr-sm bg-[color-mix(in_srgb,var(--accent)_14%,var(--surface-2))] text-cream"
      } ${live ? "opacity-80" : ""}`}
    >
      <span className="mb-0.5 block font-mono text-[9px] tracking-wider text-faint uppercase">
        {agent ? "Agent" : "You"}
      </span>
      {text}
    </p>
  );
}

const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;


/* The call itself: audio, captions, the report. Loaded only once someone
   starts a call, so the page does not carry it for everyone. */
export function CallPanel({ onClose }: { onClose: () => void }) {
  const [status, setStatus] = useState<Status>("idle");
  const [seconds, setSeconds] = useState(0);
  const [report, setReport] = useState<CallReport | null>(null);
  const [note, setNote] = useState("");
  // what has been said so far: settled lines, plus the words Deepgram is
  // still making up its mind about. Deepgram hears one mixed stream, so who
  // spoke is decided here, from which side's microphone was loud (see below).
  const [lines, setLines] = useState<Line[]>([]);
  const [draft, setDraft] = useState<Line | null>(null);
  const bars = useRef<HTMLDivElement>(null);
  const audio = useRef<{ ctx: AudioContext; mix: MediaStreamAudioDestinationNode; an: AnalyserNode } | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<BlobPart[]>([]);
  const socket = useRef<WebSocket | null>(null);
  const transcript = useRef<string[]>([]);
  // energy heard from each side since the last settled line
  const heard = useRef({ agent: 0, caller: 0 });
  const widget = useRef<Widget | null>(null);

  const live = status === "connected";
  const busy = status === "loading" || status === "connecting";

  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [live]);

  // Stops the recording and lets its onstop close the audio graph: closing
  // the context first would cut the recorder's last chunk off.
  const stopAudio = useCallback(() => {
    if (recorder.current?.state === "recording") {
      recorder.current.stop();
      recorder.current = null;
      return;
    }
    recorder.current = null;
    audio.current?.ctx.close();
    audio.current = null;
  }, []);

  const summarise = useCallback(async (blob: Blob) => {
    const said = transcript.current.join("\n");
    if (blob.size < 20_000 && said.length < 120) return onClose();
    setStatus("summarising");
    try {
      // The captions already transcribed the call, so send those words and
      // skip a second pass over the audio; the recording is the fallback.
      const useText = said.length >= 120;
      const res = await fetch("/api/call-summary", {
        method: "POST",
        headers: { "content-type": useText ? "application/json" : blob.type || "audio/webm" },
        body: useText ? JSON.stringify({ transcript: said }) : blob,
      });
      if (!res.ok) {
        // 503 means summaries are not configured: say nothing, just close
        if (res.status === 503) return onClose();
        setNote("We couldn't put a summary together for this one.");
        return setStatus("report");
      }
      const data = (await res.json()) as { report: CallReport };
      setReport(data.report);
      setNote("");
      setStatus("report");
    } catch {
      setNote("We couldn't put a summary together for this one.");
      setStatus("report");
    }
  }, [onClose]);

  // Mix both sides of the call: our mic (the widget's stream) and the agent's
  // audio. The same graph feeds the bars, so it is built once per call.
  useEffect(() => {
    if (!live) return;
    const agent = (document.getElementById("dograh-widget-audio") as HTMLAudioElement | null)?.srcObject as
      | MediaStream
      | null;
    const mic = widget.current?.getState()?.stream ?? null;
    if (!agent && !mic) return;

    const ctx = new AudioContext();
    const mix = ctx.createMediaStreamDestination();
    // Keep the two sides on separate channels -- agent left, caller right --
    // rather than mixing them down. Deepgram then transcribes each channel on
    // its own, which is what makes the speaker labels exact.
    mix.channelCount = 2;
    mix.channelCountMode = "explicit";
    mix.channelInterpretation = "discrete";
    const merger = ctx.createChannelMerger(2);
    merger.connect(mix);

    const an = ctx.createAnalyser();
    an.fftSize = 256;
    an.smoothingTimeConstant = 0.78;
    // one analyser per side, so the bars follow whoever is speaking
    const sides: { who: "agent" | "caller"; an: AnalyserNode }[] = [];
    for (const [who, stream, channel] of [
      ["agent", agent, 0],
      ["caller", mic, 1],
    ] as const) {
      if (!stream) continue;
      const src = ctx.createMediaStreamSource(stream);
      src.connect(merger, 0, channel);
      const side = ctx.createAnalyser();
      side.fftSize = 256;
      side.smoothingTimeConstant = 0.78;
      src.connect(side);
      sides.push({ who, an: side });
    }
    audio.current = { ctx, mix, an };



    chunks.current = [];
    transcript.current = [];
    setLines([]);
    setDraft(null);

    // Live captions: the page streams the same mixed audio up to our Worker,
    // which relays it to Deepgram (lib/live-transcribe.ts). Captions are a
    // bonus -- under `next dev` there is no Worker, so they simply stay off
    // and the call and its report are unaffected.
    // The recorder starts before the socket finishes connecting, and the very
    // first chunk carries the WebM header: drop it and Deepgram cannot decode
    // anything that follows. So chunks queue until the socket is open.
    let queued: Blob[] | null = [];
    try {
      const ws = new WebSocket(
        `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/api/live-transcribe`,
      );
      ws.onopen = () => {
        for (const chunk of queued ?? []) ws.send(chunk);
        queued = null;
      };
      ws.onclose = () => {
        queued = null;
      };
      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data as string);
        if (msg.type !== "Results") return;
        const text: string = msg.channel?.alternatives?.[0]?.transcript?.trim() ?? "";
        if (!text) return;
        // channel_index is [index, total]: channel 0 is the agent, 1 the
        // caller. If the stream ended up mono, fall back to guessing from
        // whichever side has been louder.
        const [index, total]: [number?, number?] = msg.channel_index ?? [];
        let who: Line["who"];
        if (total !== undefined && total >= 2 && (index === 0 || index === 1)) {
          who = index === 0 ? "agent" : "caller";
        } else {
          const { agent: a, caller: c } = heard.current;
          who = a >= c ? "agent" : "caller";
        }
        if (msg.is_final) {
          heard.current = { agent: 0, caller: 0 };
          transcript.current.push(`${who === "agent" ? "Agent" : "Caller"}: ${text}`);
          setLines((l) => [...l.slice(-6), { text, who }]);
          setDraft(null);
        } else {
          setDraft({ text, who });
        }
      };
      ws.onerror = () => ws.close();
      socket.current = ws;
    } catch {
      socket.current = null;
      queued = null;
    }

    try {
      const rec = new MediaRecorder(mix.stream);
      rec.ondataavailable = (e) => {
        if (!e.data.size) return;
        chunks.current.push(e.data);
        const ws = socket.current;
        if (ws?.readyState === WebSocket.OPEN) ws.send(e.data);
        // still connecting: hold the chunk, but not for ever
        else if (queued && queued.length < 40) queued.push(e.data);
      };
      rec.onstop = () => {
        const blob = new Blob(chunks.current, { type: rec.mimeType || "audio/webm" });
        chunks.current = [];
        audio.current?.ctx.close();
        audio.current = null;
        summarise(blob);
      };
      // chunked, so the same blobs feed the captions as they are recorded
      rec.start(250);
      recorder.current = rec;
    } catch {
      recorder.current = null;
    }

    const spectrum = new Uint8Array(sides[0]?.an.frequencyBinCount ?? 0);
    const wave = new Uint8Array(sides[0]?.an.fftSize ?? 0);
    const level = (node: AnalyserNode) => {
      node.getByteTimeDomainData(wave);
      let sum = 0;
      for (let i = 0; i < wave.length; i++) sum += ((wave[i] - 128) / 128) ** 2;
      return Math.sqrt(sum / wave.length);
    };
    let raf = 0;
    const draw = () => {
      // who holds the floor right now
      let loudest = sides[0];
      let best = 0;
      for (const side of sides) {
        const l = level(side.an);
        heard.current[side.who] += l;
        if (l > best) {
          best = l;
          loudest = side;
        }
      }
      const kids = bars.current?.children;
      if (kids && loudest) {
        bars.current?.setAttribute("data-speaker", best > 0.015 ? loudest.who : "quiet");
        loudest.an.getByteFrequencyData(spectrum);
        const mid = (kids.length - 1) / 2;
        for (let i = 0; i < kids.length; i++) {
          // mirrored around the middle, so it reads as one voice, not a chart
          const d = Math.abs(i - mid) / mid;
          const v = Math.min(1, (spectrum[Math.floor(d * spectrum.length * 0.55)] / 255) * 1.35);
          (kids[i] as HTMLElement).style.transform = `scaleY(${0.06 + v * 0.94})`;
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      if (socket.current?.readyState === WebSocket.OPEN) socket.current.send(JSON.stringify({ type: "CloseStream" }));
      socket.current?.close();
      socket.current = null;
    };
  }, [live, summarise]);

  // leaving the page must hang up
  useEffect(
    () => () => {
      widget.current?.stop();
      audio.current?.ctx.close();
    },
    [],
  );

  // the agent can end the call itself, so the recorder follows the status
  const endCall = useCallback(() => {
    widget.current?.stop();
    stopAudio();
  }, [stopAudio]);

  const close = useCallback(() => {
    endCall();
    onClose();
  }, [endCall, onClose]);

  const call = useCallback(async () => {
    if (live || busy) return endCall();
    setStatus("loading");
    setSeconds(0);
    setReport(null);
    setNote("");
    try {
      const w = await loadWidget();
      widget.current = w;
      w.onStatusChange((s) => {
        if (s === "connected") return setStatus("connected");
        if (s === "connecting") return setStatus("connecting");
        if (s === "failed") {
          stopAudio();
          return setStatus("failed");
        }
        // idle: the call ended, so the recorder's onstop takes over from here
        stopAudio();
      });
      w.onCallEnd(() => stopAudio());
      w.onError(() => {
        stopAudio();
        setStatus("failed");
      });
      await w.start();
    } catch {
      setStatus("failed");
    }
  }, [live, busy, endCall, stopAudio]);


  // the panel only exists because someone pressed the button
  const begin = useRef(false);
  useEffect(() => {
    if (begin.current) return;
    begin.current = true;
    call();
  }, [call]);

  const statusLine =
    status === "failed"
      ? "Couldn't connect"
      : status === "summarising"
        ? "Writing your summary"
        : status === "report"
          ? "Call report"
          : live
            ? "On a call"
            : "Connecting…";

  return (
    <div
      role="status"
      className={`lc-in lc-panel relative flex w-full flex-col overflow-hidden rounded-[1.5rem] border border-line ${live ? "lc-live" : ""}`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
        <p className="flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] text-muted uppercase">
          <span className={`size-1.5 rounded-full ${live ? "animate-pulse bg-[var(--accent)]" : "bg-faint"}`} />
          {statusLine}
        </p>
        <div className="flex items-center gap-3">
          {seconds > 0 && (live || status === "report") && (
            <span className="font-mono text-[12px] tabular-nums text-cream">{fmt(seconds)}</span>
          )}
          <button
            type="button"
            onClick={close}
            aria-label="Close and go back"
            className="grid size-7 place-items-center rounded-full border border-line text-[11px] text-muted transition-colors hover:border-line-bright hover:text-cream"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {status === "report" ? (
          report ? (
            <CallReportView report={report} />
          ) : (
            <p className="text-[13.5px] text-muted">{note || "No summary for this call."}</p>
          )
        ) : (
          <div className="flex h-full flex-col justify-center py-2">
            <div
              ref={bars}
              aria-hidden
              data-speaker="quiet"
              className="lc-bars flex h-12 items-center justify-between gap-[2px]"
            >
              {Array.from({ length: BARS }, (_, i) => (
                <span
                  key={i}
                  className={`h-full w-[2px] origin-center rounded-full ${live ? "" : "animate-eq"}`}
                  style={{
                    opacity: +(0.3 + 0.7 * Math.sin((i / BARS) * Math.PI)).toFixed(3),
                    transform: live ? "scaleY(0.06)" : undefined,
                    animationDelay: `${(i % 11) * -0.1}s`,
                    animationDuration: `${1 + (i % 5) * 0.18}s`,
                  }}
                />
              ))}
            </div>
            {live && (lines.length > 0 || draft) ? (
              <div className="lc-caps mt-4 flex h-[7rem] flex-col justify-end gap-1.5 overflow-hidden">
                {lines.slice(draft ? -1 : -2).map((l, i) => (
                  <Bubble key={`${l.text}-${i}`} who={l.who} text={l.text} />
                ))}
                {draft && <Bubble who={draft.who} text={draft.text} live />}
              </div>
            ) : (
              <p className={`mt-5 text-[13.5px] leading-relaxed text-muted ${live ? "flex h-[5.5rem] items-end" : ""}`}>
                {status === "failed"
                  ? "We need your microphone to talk. Allow it in your browser and try again."
                  : status === "summarising"
                    ? "Reading the transcript and pulling out what mattered. A few seconds."
                    : live
                      ? "Speak normally, and interrupt whenever you like. Your words appear here as you talk."
                      : "Allow microphone access when your browser asks."}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 border-t border-line px-5 py-3.5">
        {status === "failed" && (
          <button type="button" onClick={call} className="btn btn-sm bg-[var(--accent)] text-black hover:opacity-90">
            Try again
          </button>
        )}
        {live && (
          <button type="button" onClick={endCall} className="btn btn-sm bg-white text-black hover:opacity-90">
            End call
          </button>
        )}
        {status === "report" && (
          <>
            <Link href="/contact-us" className="btn btn-sm bg-white text-black hover:opacity-90">
              Get this for your calls
            </Link>
            <button type="button" onClick={call} className="btn btn-sm btn-ghost">
              Call again
            </button>
          </>
        )}
        {status !== "report" && (
          <button type="button" onClick={close} className="btn btn-sm btn-ghost">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
