import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["firebasestorage.googleapis.com", "example.com"], 
  },
  // Skip ESLint during build (remove this for production)
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
