import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias["@shared"] = path.resolve(__dirname, "../shared");
    return config;
  },
  turbopack: {
    resolveAlias: {
      "@shared/types/*": ["../shared/types/*"],
      "@shared/constants/*": ["../shared/constants/*"],
      "@shared/*": ["../shared/*"],
    },
  },
  // Allow Next.js to compile files outside of the project root (shared/)
  transpilePackages: [],
  experimental: {
    externalDir: true,
  },
};

export default nextConfig;
