import { NextResponse } from "next/server";

// Server-side proxy to the n8n careers webhook. Posting from the browser
// directly to n8n.fiaxe.com is blocked by CORS, so we forward here instead.
const WEBHOOK_URL = "https://n8n.fiaxe.com/webhook/6307d669-2cfb-403f-92b3-26754074f984";

export async function POST(request: Request) {
  try {
    // Pass the raw multipart body straight through with its original
    // Content-Type (which carries the boundary). Re-parsing and re-building
    // the FormData can produce a payload n8n's parser rejects, so we forward
    // the exact bytes the browser sent instead.
    const body = await request.arrayBuffer();
    const contentType = request.headers.get("content-type") ?? "application/octet-stream";

    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "content-type": contentType },
      body,
    });

    if (!res.ok) {
      // Surface n8n's real status + body so the failure is diagnosable.
      const body = await res.text().catch(() => "");
      console.error("n8n webhook responded with", res.status, body);
      return NextResponse.json(
        { error: `Webhook responded with ${res.status}`, upstreamStatus: res.status, upstreamBody: body },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Careers webhook proxy failed:", err);
    return NextResponse.json({ error: "Failed to forward application" }, { status: 500 });
  }
}
