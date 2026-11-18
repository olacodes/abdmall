import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Compile the monorepo's TypeScript-source workspace packages.
  transpilePackages: ["@abdmall/core", "@abdmall/supabase"],
  experimental: {
    // Opt in to Next's agent-assisted upgrades for security advisories only,
    // set when taking 16.4.1 → 16.4.6. Feature upgrades stay manual.
    agentUpgrade: "security",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "acmkyuwkfualxwlluwbs.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
