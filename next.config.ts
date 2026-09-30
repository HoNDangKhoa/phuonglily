import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
