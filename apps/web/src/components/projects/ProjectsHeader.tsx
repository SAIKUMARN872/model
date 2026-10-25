"use client";

import { ArrowLeft, FolderKanban, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

type ProjectsHeaderProps = {
  onCreateProject: () => void;
};

export default function ProjectsHeader({
  onCreateProject,
}: ProjectsHeaderProps) {
  const router = useRouter();

  return (
    <header className="flex h-[73px] items-center justify-between border-b border-gray-200 bg-white px-4 md:px-7">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50"
          aria-label="Back to home"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex items-center gap-2">
          <FolderKanban size={21} />

          <h1 className="text-xl font-semibold text-gray-900">
            Projects
          </h1>
        </div>
      </div>

      <button
        type="button"
        onClick={onCreateProject}
        className="flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
      >
        <Plus size={18} />
        Create Project
      </button>
    </header>
  );
}