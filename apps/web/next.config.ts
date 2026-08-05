import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Compile the monorepo's TypeScript-source workspace packages.
  transpilePackages: ["@abdmall/core", "@abdmall/supabase"],
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
