import type { Metadata } from "next";
import Script from "next/script";
import { BOOKING_URL } from "../lib/booking";
import BookingModal from "../components/BookingModal";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://yaralabs.io"),
  title: "YARA LABS",
  description:
    "Automation, AI agents, CRMs and custom apps for growing businesses.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

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
        <Script src="/assets/yara-pet.js?v=1" strategy="afterInteractive" data-booking-url={BOOKING_URL} />
      </body>
    </html>
  );
}
