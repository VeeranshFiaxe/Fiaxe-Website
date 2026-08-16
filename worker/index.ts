// Cloudflare Worker that fronts the static export in `out/`.
//
// Everything except /api/* is served straight from Workers Static Assets
// without invoking this script (see `assets.run_worker_first` in
// wrangler.jsonc). The two API paths are the n8n proxies that a static export
// cannot emit on its own.

import { proxyBookDemo, proxyCareers } from "../lib/webhook-proxy";

// Minimal shape of the static-assets binding. Declared locally so this file
// type-checks under the Next.js tsconfig without pulling in workers-types.
interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

const ROUTES: Record<string, (request: Request) => Promise<Response>> = {
  "/api/book-demo": proxyBookDemo,
  "/api/careers": proxyCareers,
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const handler = ROUTES[new URL(request.url).pathname];

    if (handler) {
      if (request.method !== "POST") {
        return new Response("Method Not Allowed", {
          status: 405,
          headers: { allow: "POST" },
        });
      }
      return handler(request);
    }

    // Anything the asset router did not match falls through to here.
    return env.ASSETS.fetch(request);
  },
};
