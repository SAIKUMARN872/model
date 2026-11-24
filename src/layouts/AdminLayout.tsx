"use client";

import { ReactNode } from "react";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-72 bg-slate-900 p-6 text-white">
        <h2 className="mb-8 text-2xl font-bold">
          Admin Panel
        </h2>

        <nav className="space-y-4">
          <a href="/admin">Dashboard</a>

          <a href="/users">Users</a>

          <a href="/analytics">Analytics</a>

          <a href="/settings">Settings</a>
        </nav>
      </aside>

      <main className="flex-1 bg-slate-50 p-6">
        {children}
      </main>
    </div>
  );
}