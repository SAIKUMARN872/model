import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "ModelNow Admin",
    template: "%s | ModelNow Admin",
  },
  description:
    "ModelNow enterprise administration and platform management console.",
  applicationName: "ModelNow Admin",
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