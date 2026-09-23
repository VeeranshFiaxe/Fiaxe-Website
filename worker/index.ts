// Cloudflare Worker that fronts the static export in `out/`.
//
// Requests under /_next/* are served straight from Workers Static Assets
// without invoking this script; everything else runs the Worker first (see
// `assets.run_worker_first` in wrangler.jsonc) so the www redirect below sees
// real navigations. The two API paths are the n8n proxies that a static export
// cannot emit on its own.

import { proxyBookDemo, proxyCareers } from "../lib/webhook-proxy";
import { summarizeCall } from "../lib/call-summary";
import { liveTranscribe } from "../lib/live-transcribe";

// Minimal shape of the static-assets binding. Declared locally so this file
// type-checks under the Next.js tsconfig without pulling in workers-types.
interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  // URL of worker/n8n-forwarder.ts. See lib/webhook-proxy.ts for why the n8n
  // call cannot be made from this Worker directly.
  N8N_FORWARD_URL: string;
  // Secrets behind /api/call-summary (`wrangler secret put`). Absent in a
  // fresh checkout, in which case the endpoint answers 503 and the live-call
  // dock simply skips the report.
  DEEPGRAM_API_KEY?: string;
  DEEPSEEK_API_KEY?: string;
}

const ROUTES: Record<
  string,
  (request: Request, forwardUrl: string) => Promise<Response>
> = {
  "/api/book-demo": proxyBookDemo,
  "/api/careers": proxyCareers,
};

// The workers.dev hostname serves a byte-identical copy of the production
// site. Left crawlable it would compete with fiaxe.com in search, so it gets
// a disallow-all robots.txt instead of the one Next.js generates.
function isNonCanonicalHost(hostname: string): boolean {
  return hostname.endsWith(".workers.dev");
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // The apex is canonical: sitemap.xml, the metadataBase in app/layout.tsx
    // and the Schema.org blocks all point at it. www is a custom domain on
    // this same Worker, so redirect rather than serve to keep it from becoming
    // a duplicate of the same content. 308 preserves method and body, so the
    // /api/* POSTs survive the hop.
    if (url.hostname === "www.fiaxe.com") {
      url.hostname = "fiaxe.com";
      return Response.redirect(url.toString(), 308);
    }

    if (url.pathname === "/robots.txt" && isNonCanonicalHost(url.hostname)) {
      return new Response("User-agent: *\nDisallow: /\n", {
        headers: {
          "content-type": "text/plain; charset=utf-8",
          "x-robots-tag": "noindex, nofollow",
        },
      });
    }

    // Posts an audio recording rather than a form, so it takes the whole env
    // instead of the n8n forward URL.
    if (url.pathname === "/api/call-summary") {
      return summarizeCall(request, env);
    }

    // Live captions: the page streams call audio up this socket and the
    // Worker relays it to Deepgram, so the key stays server-side.
    if (url.pathname === "/api/live-transcribe") {
      return liveTranscribe(request, env);
    }

    const handler = ROUTES[url.pathname];

    if (handler) {
      if (request.method !== "POST") {
        return new Response("Method Not Allowed", {
          status: 405,
          headers: { allow: "POST" },
        });
      }
      return handler(request, env.N8N_FORWARD_URL);
    }

    // Anything the asset router did not match falls through to here.
    return env.ASSETS.fetch(request);
  },
};
