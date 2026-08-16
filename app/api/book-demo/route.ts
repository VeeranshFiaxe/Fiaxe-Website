import { NextResponse } from "next/server";

// Server-side proxy to the n8n book-demo webhook. Posting from the browser
// directly to n8n.fiaxe.com is blocked by CORS, so we forward here instead.
const WEBHOOK_URL = "https://n8n.fiaxe.com/webhook/6307d669-2cfb-403f-92b3-26754074f984";

export async function POST(request: Request) {
  try {
    const bodyText = await request.text();
    const contentType = request.headers.get("content-type") ?? "application/json";

    // Honeypot check
    try {
      const data = JSON.parse(bodyText);
      if (data.website_url) {
        // Fake success to the bot
        return NextResponse.json({ ok: true });
      }
    } catch {}

    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "content-type": contentType },
      body: bodyText,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("n8n book-demo webhook responded with", res.status, text);
      return NextResponse.json(
        { error: `Webhook responded with ${res.status}` },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Book demo webhook proxy failed:", err);
    return NextResponse.json({ error: "Failed to forward booking" }, { status: 500 });
  }
}
