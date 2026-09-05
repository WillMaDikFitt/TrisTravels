import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Avoid Auth SDK duplication edge cases that can cause Google sign-in
  // auth/argument-error in production builds.
  serverExternalPackages: ["firebase", "firebase-admin"],
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 80, 90],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "static.wixstatic.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
