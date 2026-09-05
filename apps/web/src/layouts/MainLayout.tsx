"use client";

import { ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({
  children,
}: MainLayoutProps) {
  return (
    <main className="min-h-screen bg-gray-100 text-gray-900">
      <div className="mx-auto max-w-7xl px-6 py-6">
        {children}
      </div>
    </main>
  );
}