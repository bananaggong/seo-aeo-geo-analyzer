import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["cheerio", "turndown"],
  },
};

export default nextConfig;
