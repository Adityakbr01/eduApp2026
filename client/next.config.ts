import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  productionBrowserSourceMaps: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "eduapp2026-s3-bucket.s3.us-east-1.amazonaws.com" },
      { protocol: "https", hostname: "eduapp-bucket-prod.s3.us-east-1.amazonaws.com" },
      { protocol: "https", hostname: "eduapp-bucket-temp.s3.us-east-1.amazonaws.com" },
      { protocol: "https", hostname: "dfdx9u0psdezh.cloudfront.net" },
            { protocol: "https", hostname: "ik.imagekit.io" },
    ],
  },
};


export default nextConfig;

