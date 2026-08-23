import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YARA LABS",
  description:
    "Systems, automation, and infrastructure for growing businesses.",
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
      <body>{children}</body>
    </html>
  );
}
