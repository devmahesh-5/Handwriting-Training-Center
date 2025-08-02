import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        // Optionally restrict to specific path patterns
        // pathname: '/dpdkuigkh/image/upload/**',
      },
    ],
    // You can also use the legacy 'domains' option if preferred
    // domains: ['res.cloudinary.com'],
  },
  /* other config options here */
};

export default nextConfig;
