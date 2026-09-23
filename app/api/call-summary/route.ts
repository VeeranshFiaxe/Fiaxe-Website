// Static export drops this route; it exists so the live-call report works
// under `next dev`, reading the keys from .env. Production is served by
// worker/index.ts, which calls the same handler with Worker secrets.
import { summarizeCall } from "@/lib/call-summary";

export const POST = (request: Request) =>
  summarizeCall(request, {
    DEEPGRAM_API_KEY: process.env.DEEPGRAM_API_KEY,
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
  });
