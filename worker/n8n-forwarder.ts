// Forwards webhook payloads to n8n on behalf of the main site Worker.
//
// Why this exists: n8n.fiaxe.com is a DNS-only record on the same zone that
// serves the site, and a subrequest originating from a Worker bound to that
// zone cannot reach it -- Cloudflare's edge answers with a 307 whose Location
// is the request URL itself, so fetch() loops until it throws "Too many
// redirects". A service binding does not help: the callee inherits the
// caller's zone context and loops identically. Only a request that genuinely
// originates outside the zone escapes, so the site Worker calls this one over
// its workers.dev URL and this Worker makes the n8n call.
//
// The n8n URL is hardcoded rather than taken from a header so this cannot be
// driven as an open proxy. It adds no attack surface beyond what already
// exists: the n8n webhook is itself public and unauthenticated.

import { WEBHOOK_URL } from "../lib/webhook-proxy";

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405, headers: { allow: "POST" } });
    }

    // Buffer rather than passing request.body straight through: n8n can answer
    // with a redirect, and fetch() cannot replay a stream across one.
    const body = await request.arrayBuffer();

    return fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "content-type": request.headers.get("content-type") ?? "application/octet-stream",
      },
      body,
    });
  },
};
