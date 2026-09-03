// Server-side proxies to the n8n webhooks. Posting from the browser directly
// to n8n.fiaxe.com is blocked by CORS, so we forward here instead.
//
// The site is a static export, so these never ship as Next.js routes in a
// build. Two callers share this module instead:
//   - app/api/*/route.ts, so the forms work under `next dev`
//   - worker/index.ts, which serves the deployed site on Cloudflare Workers
// It is written against the standard Request/Response types only, so the same
// code runs unchanged in Node and on workerd.

export const WEBHOOK_URL =
  "https://n8n.fiaxe.com/webhook/6307d669-2cfb-403f-92b3-26754074f984";

function json(body: unknown, status = 200): Response {
  return Response.json(body, { status });
}

// On Workers, `forwardUrl` is worker/n8n-forwarder.ts and the payload takes an
// extra HTTP hop: a subrequest from the zone-bound site Worker to n8n.fiaxe.com
// is answered by the edge with a 307 back to the same URL, so fetch() loops
// until it throws. The forwarder is not attached to the zone, so its own call
// to n8n resolves normally. Under `next dev` there is no forwarder and no zone,
// so callers pass nothing and we post to n8n directly.
function postToWebhook(
  body: BodyInit | null,
  contentType: string,
  forwardUrl?: string,
): Promise<Response> {
  return fetch(forwardUrl ?? WEBHOOK_URL, {
    method: "POST",
    headers: { "content-type": contentType },
    body,
  });
}

export async function proxyBookDemo(request: Request, forwardUrl?: string): Promise<Response> {
  try {
    const bodyText = await request.text();
    const contentType = request.headers.get("content-type") ?? "application/json";

    // Honeypot check
    try {
      const data = JSON.parse(bodyText);
      if (data.website_url) {
        // Fake success to the bot
        return json({ ok: true });
      }
    } catch {}

    const res = await postToWebhook(bodyText, contentType, forwardUrl);

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("n8n book-demo webhook responded with", res.status, text);
      return json({ error: `Webhook responded with ${res.status}` }, 502);
    }

    return json({ ok: true });
  } catch (err) {
    console.error("Book demo webhook proxy failed:", err);
    return json({ error: "Failed to forward booking" }, 500);
  }
}

export async function proxyCareers(request: Request, forwardUrl?: string): Promise<Response> {
  try {
    // Pass the raw multipart body straight through with its original
    // Content-Type (which carries the boundary). Re-parsing and re-building
    // the FormData can produce a payload n8n's parser rejects, so we forward
    // the exact bytes the browser sent instead.
    const body = await request.arrayBuffer();
    const contentType = request.headers.get("content-type") ?? "application/octet-stream";

    const res = await postToWebhook(body, contentType, forwardUrl);

    if (!res.ok) {
      // Surface n8n's real status + body so the failure is diagnosable.
      const upstreamBody = await res.text().catch(() => "");
      console.error("n8n webhook responded with", res.status, upstreamBody);
      return json(
        { error: `Webhook responded with ${res.status}`, upstreamStatus: res.status, upstreamBody },
        502,
      );
    }

    return json({ ok: true });
  } catch (err) {
    console.error("Careers webhook proxy failed:", err);
    return json({ error: "Failed to forward application" }, 500);
  }
}
