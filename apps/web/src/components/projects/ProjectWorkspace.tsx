"use client";

import { FolderKanban } from "lucide-react";

import StandaloneChatComposer from "../StandaloneChatComposer";
import type { Project } from "./ProjectList";

type ProjectWorkspaceProps = {
  project: Project | null;
};

export default function ProjectWorkspace({
  project,
}: ProjectWorkspaceProps) {
  if (!project) {
    return (
      <section className="flex min-w-0 flex-1 items-center justify-center bg-[#f7f8fa]">
        <div className="px-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
            <FolderKanban
              size={30}
              className="text-gray-400"
            />
          </div>

          <h2 className="mt-5 text-xl font-semibold text-gray-900">
            Select a project
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Create or select a project to start chatting.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-white">
      {/* Chat workspace */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <StandaloneChatComposer />
      </div>
    </section>
  );
}