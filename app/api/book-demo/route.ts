// Static export drops this route; it exists so the form works under
// `next dev`. Production is served by worker/index.ts, which calls the same
// handler. Keep the logic in lib/webhook-proxy.ts so the two cannot drift.
import { proxyBookDemo } from "@/lib/webhook-proxy";

// Wrapped rather than exported directly: proxyBookDemo takes an optional
// service binding as its second argument, which would collide with the
// context object Next.js passes route handlers. There is no binding (and no
// zone to trip over) under `next dev`, so it forwards to n8n directly.
export const POST = (request: Request) => proxyBookDemo(request);
