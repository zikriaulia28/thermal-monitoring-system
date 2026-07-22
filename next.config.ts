import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer =
  process.env.ANALYZE === "true"
    ? bundleAnalyzer({ enabled: true })
    : (c: NextConfig) => c;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["recharts", "lucide-react", "date-fns"],
  },
};

export default withBundleAnalyzer(nextConfig);
