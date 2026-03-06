import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Provide a fallback NEXTAUTH_URL for build-time static analysis so
  // Next.js doesn't crash with "Invalid URL" when the env var isn't set.
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? "http://localhost:3000",
  },
};

export default nextConfig;
