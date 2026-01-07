import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "eduapp2026-s3-bucket.s3.us-east-1.amazonaws.com",
      },
    ],
    domains: ["example.com", "another-domain.com", "res.cloudinary.com", "eduapp2026-s3-bucket.s3.us-east-1.amazonaws.com"],
  },
};

export default nextConfig;

