import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "phuonglily.vercel.app" }],
        destination: "https://phuonglilyacademy.com/:path*",
        permanent: true,
      },
    ];
  },
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
