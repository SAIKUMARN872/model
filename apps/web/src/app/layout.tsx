import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ModelNow",
  description:
    "ModelNow — One AI platform. Every model. Every task. Cost, latency and quality optimization.",
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