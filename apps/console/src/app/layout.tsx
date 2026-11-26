import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import "../styles/console.css";
import ConsoleShell from "../components/layout/ConsoleShell";

export const metadata: Metadata = {
  title: "ModelNow Console",
  description: "ModelNow AI platform console",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={null}>
          <ConsoleShell>{children}</ConsoleShell>
        </Suspense>
      </body>
    </html>
  );
}

