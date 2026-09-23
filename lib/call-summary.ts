/* Turns a recording of a live web call into a short report: Deepgram
   transcribes it (diarized, multilingual), then DeepSeek writes the summary.
   Runs on the Cloudflare Worker in production (worker/index.ts) and behind
   app/api/call-summary under `next dev`, so the logic lives here once. */

export type CallReport = {
  summary: string;
  outcome: string;
  sentiment: "positive" | "neutral" | "negative";
  intentScore: number;
  language: string;
  details: { label: string; value: string }[];
  nextSteps: string[];
};

export type SummaryKeys = { DEEPGRAM_API_KEY?: string; DEEPSEEK_API_KEY?: string };

// A minute of Opus is well under 1MB; this only stops something pathological.
const MAX_BYTES = 12 * 1024 * 1024;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

const SYSTEM = `You analyse a phone call between a Fiaxe AI voice agent and a caller, and reply with JSON only.

Keys, all required:
"summary": 2 plain sentences, 320 characters at most, on what the caller wanted and what happened.
"outcome": under 8 words, e.g. "Demo booked" or "Question answered, no action".
"sentiment": "positive", "neutral" or "negative".
"intentScore": 0-100, how strongly the caller signalled buying intent.
"language": the language(s) spoken, e.g. "English" or "Hindi + English".
"details": up to 4 {"label","value"} pairs of facts the agent captured (name, need, budget, timing, contact), each value under 40 characters. Leave the array empty if the call carried none.
"nextSteps": up to 2 actions for the Fiaxe team, under 90 characters each.

Write for the caller to read about their own call. Be concrete, never invent anything that was not said, and skip anything the transcript does not support.`;

/* Deepgram's word list carries speaker numbers; fold it back into lines. */
function toTranscript(dg: {
  results?: {
    channels?: {
      alternatives?: {
        transcript?: string;
        words?: { word?: string; punctuated_word?: string; speaker?: number }[];
      }[];
    }[];
  };
}): string {
  const alt = dg?.results?.channels?.[0]?.alternatives?.[0];
  const words = alt?.words ?? [];
  if (!words.length) return alt?.transcript?.trim() ?? "";
  const lines: string[] = [];
  let speaker: number | undefined;
  let line: string[] = [];
  const flush = () => {
    if (line.length) lines.push(`Speaker ${speaker ?? 0}: ${line.join(" ")}`);
    line = [];
  };
  for (const w of words) {
    if (w.speaker !== speaker) {
      flush();
      speaker = w.speaker;
    }
    line.push(w.punctuated_word ?? w.word ?? "");
  }
  flush();
  return lines.join("\n");
}

function clamp(report: Partial<CallReport>): CallReport {
  const sentiment = report.sentiment;
  return {
    summary: String(report.summary ?? "").slice(0, 900),
    outcome: String(report.outcome ?? "Call completed").slice(0, 80),
    sentiment: sentiment === "positive" || sentiment === "negative" ? sentiment : "neutral",
    intentScore: Math.max(0, Math.min(100, Math.round(Number(report.intentScore) || 0))),
    language: String(report.language ?? "").slice(0, 60),
    details: (Array.isArray(report.details) ? report.details : [])
      .slice(0, 4)
      .map((d) => ({ label: String(d?.label ?? "").slice(0, 40), value: String(d?.value ?? "").slice(0, 120) }))
      .filter((d) => d.label && d.value),
    nextSteps: (Array.isArray(report.nextSteps) ? report.nextSteps : [])
      .slice(0, 2)
      .map((s) => String(s).slice(0, 110))
      .filter(Boolean),
  };
}

export async function summarizeCall(request: Request, env: SummaryKeys): Promise<Response> {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!env.DEEPSEEK_API_KEY) return json({ error: "Summaries are not configured" }, 503);

  // The page streamed the call to Deepgram for captions, so it already has a
  // transcript: analyse that instead of transcribing the audio a second time.
  if (request.headers.get("content-type")?.includes("application/json")) {
    const sent = ((await request.json()) as { transcript?: unknown })?.transcript;
    return analyse(typeof sent === "string" ? sent : "", env);
  }

  if (!env.DEEPGRAM_API_KEY) return json({ error: "Summaries are not configured" }, 503);

  const audio = await request.arrayBuffer();
  if (!audio.byteLength) return json({ error: "No audio" }, 400);
  if (audio.byteLength > MAX_BYTES) return json({ error: "Recording too large" }, 413);

  const dgUrl =
    "https://api.deepgram.com/v1/listen?model=nova-3&language=multi&smart_format=true&punctuate=true&diarize=true";
  const dgRes = await fetch(dgUrl, {
    method: "POST",
    headers: {
      Authorization: `Token ${env.DEEPGRAM_API_KEY}`,
      "content-type": request.headers.get("content-type") ?? "audio/webm",
    },
    body: audio,
  });
  if (!dgRes.ok) return json({ error: "Transcription failed" }, 502);

  return analyse(toTranscript(await dgRes.json()), env);
}

async function analyse(transcript: string, env: SummaryKeys): Promise<Response> {
  if (!env.DEEPSEEK_API_KEY) return json({ error: "Summaries are not configured" }, 503);
  // Anything shorter is a hang-up or silence, not a conversation worth summarising.
  if (transcript.replace(/(Speaker \d+|Agent|Caller):/g, "").trim().length < 40) return json({ error: "Call too short to summarise" }, 422);

  const dsRes = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({
      model: "deepseek-chat",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: `Transcript:\n\n${transcript.slice(0, 20000)}` },
      ],
    }),
  });
  if (!dsRes.ok) return json({ error: "Analysis failed" }, 502);

  const content = (await dsRes.json())?.choices?.[0]?.message?.content ?? "{}";
  let parsed: Partial<CallReport>;
  try {
    parsed = JSON.parse(content);
  } catch {
    return json({ error: "Analysis failed" }, 502);
  }

  return json({ report: clamp(parsed), transcript });
}
