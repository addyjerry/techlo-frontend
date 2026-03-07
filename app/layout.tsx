import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/app/context/CartContext";
import { SearchProvider } from "@/app/context/SearchContext";
import TechloHeader from "./components/Header";
import TechloFooter from "./components/Footer";

// ── Viewport (theme colour, mobile scaling) ───────────────────────────────────
// Exported separately as Next.js 14+ requires it
export const viewport: Viewport = {
  themeColor: "#00f5e0",          // Colours the browser chrome / status bar on Android
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,                // Prevents accidental zoom on input focus (common mobile issue)
  userScalable: false,
};

// ── SEO + PWA metadata ────────────────────────────────────────────────────────
export const metadata: Metadata = {
  // Basic SEO
  title: {
    default: "Techlo — Ghana's #1 Second-Hand Electronics Marketplace",
    template: "%s | Techlo",     // Child pages can set their own title prefix
  },
  description: "Find the best deals on second-hand phones, laptops, cameras, gaming, and more across Ghana. Verified condition. Fast delivery. MoMo accepted.",
  keywords: ["second hand electronics Ghana", "buy phones Ghana", "used laptops Accra", "Techlo"],

  // PWA manifest link
  manifest: "/manifest.json",

  // Apple-specific PWA tags (iOS treats these specially)
  appleWebApp: {
    capable: true,                              // Enables full-screen mode when launched from home screen
    statusBarStyle: "black-translucent",        // Makes iOS status bar transparent over your dark bg
    title: "Techlo",
    startupImage: [
      {
        url: "/splash/apple-splash-2048-2732.png",
        media: "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/splash/apple-splash-1668-2388.png",
        media: "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/splash/apple-splash-1290-2796.png",
        media: "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/splash/apple-splash-1179-2556.png",
        media: "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/splash/apple-splash-1170-2532.png",
        media: "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/splash/apple-splash-750-1334.png",
        media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)",
      },
    ],
  },

  // Open Graph (WhatsApp / Twitter previews when sharing links)
  openGraph: {
    type: "website",
    locale: "en_GH",
    url: "https://techlo.gh",
    siteName: "Techlo",
    title: "Techlo — Ghana's #1 Second-Hand Electronics Marketplace",
    description: "Find phones, laptops, cameras and more at the best prices across Ghana.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Techlo Marketplace" }],
  },

  // Icons (browser tab, bookmarks, etc.)
  icons: {
    icon: [
      { url: "/icons/pwa-32x32.png",  sizes: "32x32",  type: "image/png" },
      { url: "/icons/pwa-96x96.png",  sizes: "96x96",  type: "image/png" },
      { url: "/icons/pwa-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-icon-180.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/icons/pwa-32x32.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/*
          Extra tags Next.js metadata doesn't cover natively.
          These are important for a polished PWA experience.
        */}

        {/* Prevents iOS from auto-detecting phone numbers and styling them as links */}
        <meta name="format-detection" content="telephone=no" />

        {/* Tells Android Chrome to use the standalone display mode */}
        <meta name="mobile-web-app-capable" content="yes" />

        {/* Microsoft tile colour (Windows pinned sites) */}
        <meta name="msapplication-TileColor" content="#080810" />
        <meta name="msapplication-TileImage" content="/icons/pwa-144x144.png" />

        {/* Stops the browser from guessing MIME types — minor security improvement */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      </head>
      <body className="bg-[#080810] text-white antialiased">
        {/*
          Both providers wrap the entire app so any page can access
          cart state and search state without prop drilling.
        */}
        <TechloHeader/>
        <CartProvider>
          <SearchProvider>
            {children}
          </SearchProvider>
        </CartProvider>
        <TechloFooter/>
      </body>
    </html>
  );
}