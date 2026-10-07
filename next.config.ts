import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    resolveAlias: {
      "@farcaster/mini-app-solana": "./src/shared/lib/empty-module.ts",
    },
  },
  webpack: (config, { isServer }) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "@farcaster/mini-app-solana": false,
    };
    config.externals = config.externals || [];
    if (isServer) {
      // Avoid bundling optional Privy onramp peers that are unused
      if (Array.isArray(config.externals)) {
        config.externals.push("pino-pretty", "lokijs", "encoding");
      }
    }
    return config;
  },
};

export default nextConfig;
