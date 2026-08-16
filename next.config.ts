import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // static export; the site has no server-side code, deployed to Cloudflare Pages
  output: "export",
};

export default nextConfig;
