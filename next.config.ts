import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/favicon.ico", destination: "/icon" }];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      // Admins may paste image URLs from any host in the CMS.
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
