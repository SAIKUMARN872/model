"use client";

import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-white p-5">
        <h2 className="mb-6 text-xl font-bold">
          Dashboard
        </h2>

        <nav className="space-y-3">
          <a href="/dashboard" className="block">
            Home
          </a>

          <a href="/chat" className="block">
            Chat
          </a>

          <a href="/agents" className="block">
            Agents
          </a>

          <a href="/settings" className="block">
            Settings
          </a>
        </nav>
      </aside>

      <main className="flex-1 bg-gray-50 p-6">
        {children}
      </main>
    </div>
  );
}