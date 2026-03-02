import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    // In development, disable optimization for unoptimized images
    // (avoids errors with localhost:9199 and other private IPs)
    unoptimized: process.env.NODE_ENV === "development",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.app",
      },
      {
        protocol: "https",
        hostname: "*.firebasestorage.app",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "9199",
      },
      {
        protocol: "https",
        hostname: "example.com",
      },
    ],
  },
};

export default nextConfig;
