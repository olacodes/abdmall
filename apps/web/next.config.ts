import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Compile the monorepo's TypeScript-source workspace packages.
  transpilePackages: ["@abdmall/core", "@abdmall/supabase"],
};

export default nextConfig;
