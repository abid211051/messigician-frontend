import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      // add others here as needed e.g. s3, cloudinary
    ],
  },
};

export default nextConfig;
