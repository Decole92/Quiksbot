/** @type {import('next').NextConfig} */

const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["puppeteer-core", "@sparticuz/chromium"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "e7.pngegg.com",
      },
      {
        protocol: "https",
        hostname: "files.edgestore.dev",
      },
    ],
  },
};

export default nextConfig;
