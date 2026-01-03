import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
    domains: ["example.com", "another-domain.com", "res.cloudinary.com"],
  },
};

export default nextConfig;
