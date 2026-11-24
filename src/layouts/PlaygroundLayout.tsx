"use client";

import { ReactNode } from "react";

interface PlaygroundLayoutProps {
  children: ReactNode;
}

export default function PlaygroundLayout({
  children,
}: PlaygroundLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="border-b border-gray-700 px-6 py-4">
        <h1 className="text-xl font-bold">
          AI Playground
        </h1>
      </header>

      <main className="p-6">
        {children}
      </main>
    </div>
  );
}