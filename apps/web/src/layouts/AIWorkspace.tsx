"use client";

import { ReactNode } from "react";

interface AIWorkspaceProps {
  children: ReactNode;
}

export default function AIWorkspace({
  children,
}: AIWorkspaceProps) {
  return (
    <section className="flex h-screen flex-col">
      <header className="border-b bg-white px-6 py-4">
        <h1 className="text-2xl font-semibold">
          AI Workspace
        </h1>
      </header>

      <div className="flex-1 overflow-auto p-6">
        {children}
      </div>
    </section>
  );
}