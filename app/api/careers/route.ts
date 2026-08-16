// Static export drops this route; it exists so the form works under
// `next dev`. Production is served by worker/index.ts, which calls the same
// handler. Keep the logic in lib/webhook-proxy.ts so the two cannot drift.
import { proxyCareers } from "@/lib/webhook-proxy";

export const POST = proxyCareers;
