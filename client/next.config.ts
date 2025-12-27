import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["example.com", "another-domain.com"],
  },
};

export default nextConfig;
