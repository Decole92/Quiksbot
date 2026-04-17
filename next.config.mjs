/** @type {import('next').NextConfig} */

const nextConfig = {
  output: "standalone",

  // In Next.js 15, serverComponentsExternalPackages moved to top-level
  serverExternalPackages: ["puppeteer-core", "@sparticuz/chromium"],

  experimental: {
    serverActions: {
      bodySizeLimit: "15mb",
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "e7.pngegg.com",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      // Convex file storage
      {
        protocol: "https",
        hostname: "*.convex.cloud",
      },
      {
        protocol: "https",
        hostname: "*.convex.site",
      },
    ],
  },

  // Turbopack (Next.js 16 default) handles Node.js built-in exclusions automatically.
  turbopack: {},

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        net: false,
        tls: false,
        fs: false,
      };
    }
    return config;
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
