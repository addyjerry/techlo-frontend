import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  disable: process.env.NODE_ENV === "development",
  cacheOnFrontEndNav: true,   // Cache pages as the user navigates — great for slow connections
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,       // Reload stale content automatically when connection returns
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      {
        // Pages — try network first, serve cache if offline
        urlPattern: /^https?.*/,
        handler: "NetworkFirst",
        options: {
          cacheName: "techlo-pages",
          expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
          networkTimeoutSeconds: 10,
        },
      },
      {
        // Product images — serve from cache instantly
        urlPattern: /\.(?:jpg|jpeg|png|webp|svg|gif|ico)$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "techlo-images",
          expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },
      {
        // Google Fonts
        urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com/,
        handler: "CacheFirst",
        options: {
          cacheName: "techlo-fonts",
          expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  turbopack: {}, // Silences the Turbopack warning — keeps fast dev builds
  images: {
    domains: [],
  },
};

export default withPWA(nextConfig);