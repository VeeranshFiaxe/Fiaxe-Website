import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export into out/, served by Cloudflare Workers Static Assets.
  // The only server-side code is the pair of n8n proxies, which the Worker in
  // worker/index.ts handles (see wrangler.jsonc).
  output: "export",
};

export default nextConfig;
