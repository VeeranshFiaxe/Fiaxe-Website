"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CallReport } from "@/lib/call-summary";
import { CallReportView } from "./CallReportView";

/* A live call with our voice agent, in the page. The provider's widget runs
   headless (no UI of its own), so everything the visitor sees is ours.

   Captions come from the voice server itself: it already transcribes the
   caller to answer them and knows every word the agent says, and it sends
   both down the widget's signaling socket as the call runs. So captions cost
   nothing extra and who spoke is never a guess. When the call ends, those
   words go to /api/call-summary, which writes the report shown here
   (lib/call-summary.ts); the recording is only a fallback. */

const TOKEN =
  process.env.NEXT_PUBLIC_VOICE_WIDGET_TOKEN ?? "emb_q9JQkqck36Exq0CXCgi1ZxGP07yVIaz7SgKSBI7UD_s";
const ENDPOINT = process.env.NEXT_PUBLIC_VOICE_WIDGET_ENDPOINT ?? "https://voice.fiaxe.com";
const SCRIPT_ID = "fiaxe-voice-widget";

type Status = "idle" | "loading" | "connecting" | "connected" | "summarising" | "report" | "failed";

type Widget = {
  start: () => Promise<void> | void;
  stop: () => Promise<void> | void;
  getState: () => { stream?: MediaStream | null; ws?: WebSocket | null };
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

type Line = { id: number; text: string; who: "agent" | "caller"; live?: boolean };

/* What the voice server sends down the widget's socket as the call runs.
   Agent words arrive one at a time, as they are spoken; the caller's come as
   guesses that settle into final text. */
type Feed =
  | { type: "rtf-bot-text"; payload: { text: string } }
  | { type: "rtf-user-transcription"; payload: { text: string; final: boolean } }
  | { type: "rtf-bot-started-speaking" | "rtf-bot-stopped-speaking" };

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
  // the last few lines on screen, the newest possibly still being spoken
  const [lines, setLines] = useState<Line[]>([]);
  const bars = useRef<HTMLDivElement>(null);
  const audio = useRef<{ ctx: AudioContext } | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<BlobPart[]>([]);
  // the whole call, line by line; `open` is whose turn is still running, so
  // their next words join the same line
  const said = useRef<{ lines: Line[]; open: Line["who"] | null }>({ lines: [], open: null });
  const widget = useRef<Widget | null>(null);

  const live = status === "connected";

  // One message from the voice server. Consecutive words from the same side
  // join one line until the other side takes the floor.
  const hear = useCallback((e: MessageEvent) => {
    let msg: Feed;
    try {
      msg = JSON.parse(e.data as string);
    } catch {
      return;
    }
    const s = said.current;
    const add = (who: Line["who"], text: string) => {
      const last = s.lines[s.lines.length - 1];
      if (s.open === who && last) s.lines[s.lines.length - 1] = { ...last, text: `${last.text} ${text}` };
      else s.lines.push({ id: s.lines.length, who, text });
      s.open = who;
    };
    let guess = "";
    switch (msg.type) {
      case "rtf-bot-text":
        if (!msg.payload.text?.trim()) return;
        add("agent", msg.payload.text.trim());
        break;
      case "rtf-user-transcription": {
        const text = msg.payload.text?.trim();
        if (!text) return;
        if (msg.payload.final) add("caller", text);
        else guess = text;
        break;
      }
      case "rtf-bot-started-speaking":
      case "rtf-bot-stopped-speaking":
        // either way, whoever was talking has finished their turn
        s.open = null;
        break;
      default:
        return;
    }
    const shown = s.lines.slice(-2);
    if (guess) {
      const last = shown[shown.length - 1];
      if (s.open === "caller" && last) shown[shown.length - 1] = { ...last, text: `${last.text} ${guess}`, live: true };
      else shown.push({ id: s.lines.length, who: "caller", text: guess, live: true });
    }
    setLines(shown.slice(-2));
  }, []);
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
    const text = said.current.lines.map((l) => `${l.who === "agent" ? "Agent" : "Caller"}: ${l.text}`).join("\n");
    if (blob.size < 20_000 && text.length < 120) return onClose();
    setStatus("summarising");
    try {
      // The captions already transcribed the call, so send those words and
      // skip a second pass over the audio; the recording is the fallback.
      const useText = text.length >= 120;
      const res = await fetch("/api/call-summary", {
        method: "POST",
        headers: { "content-type": useText ? "application/json" : blob.type || "audio/webm" },
        body: useText ? JSON.stringify({ transcript: text }) : blob,
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
    // one analyser per side, so the bars follow whoever is speaking
    const sides: { who: "agent" | "caller"; an: AnalyserNode }[] = [];
    for (const [who, stream] of [
      ["agent", agent],
      ["caller", mic],
    ] as const) {
      if (!stream) continue;
      const src = ctx.createMediaStreamSource(stream);
      src.connect(mix);
      const side = ctx.createAnalyser();
      side.fftSize = 256;
      side.smoothingTimeConstant = 0.78;
      src.connect(side);
      sides.push({ who, an: side });
    }
    audio.current = { ctx };
    chunks.current = [];

    try {
      const rec = new MediaRecorder(mix.stream);
      rec.ondataavailable = (e) => {
        if (!e.data.size) return;
        chunks.current.push(e.data);
      };
      rec.onstop = () => {
        const blob = new Blob(chunks.current, { type: rec.mimeType || "audio/webm" });
        chunks.current = [];
        audio.current?.ctx.close();
        audio.current = null;
        summarise(blob);
      };
      rec.start(1000);
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
    return () => cancelAnimationFrame(raf);
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
    said.current = { lines: [], open: null };
    setLines([]);
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
      // the socket exists once start() has sent the offer, before the
      // server has said a word
      w.getState().ws?.addEventListener("message", hear);
    } catch {
      setStatus("failed");
    }
  }, [live, busy, endCall, stopAudio, hear]);


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
            {live && lines.length > 0 ? (
              <div className="lc-caps mt-4 flex h-[7rem] flex-col justify-end gap-1.5 overflow-hidden">
                {lines.map((l) => (
                  <Bubble key={l.id} who={l.who} text={l.text} live={l.live} />
                ))}
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
