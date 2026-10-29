import type { Metadata } from "next";
import Script from "next/script";
import { BOOKING_URL } from "../lib/booking";
import BookingModal from "../components/BookingModal";
import Analytics from "../components/Analytics";
import { brandOpenGraph, brandTwitter } from "../lib/brand-metadata";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://yaralabs.io"),
  title: "YARA LABS",
  description:
    "Automation, AI agents, CRMs and custom apps for growing businesses.",
  icons: {
    icon: [
      { url: "/favicon.svg?v=20261029", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
  openGraph: brandOpenGraph,
  twitter: brandTwitter,
};

export const viewport = { width: "device-width", initialScale: 1, themeColor: "#2A62F5" };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <BookingModal />
        <Analytics />
        <Script src="/assets/yara-pet.js?v=1" strategy="afterInteractive" data-booking-url={BOOKING_URL} />
      </body>
    </html>
  );
}
