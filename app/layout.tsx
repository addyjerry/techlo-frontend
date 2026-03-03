import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TechloHeader from "./components/Header";

import TechloFooter from "./components/Footer";
import { CartProvider } from "./context/CartContext";
import { SearchProvider } from "./context/SearchContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Techlo-electronics",
  description: "Your next stop shop for all your electronic needs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TechloHeader/>
        <CartProvider>
          <SearchProvider>{children}</SearchProvider></CartProvider>
      
        <TechloFooter/>
      </body>
    </html>
  );
}
