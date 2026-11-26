"use client";

import { FolderKanban } from "lucide-react";
import ProjectList, { type Project } from "./ProjectList";

type ProjectsSidebarProps = {
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (project: Project) => void;
};

export default function ProjectsSidebar({
  projects,
  selectedProject,
  onSelectProject,
}: ProjectsSidebarProps) {
  return (
    <aside className="w-[280px] shrink-0 border-r border-gray-200 bg-white">
      <div className="p-5">
        <div className="mb-5 flex items-center gap-2 px-2">
          <FolderKanban size={18} />

          <h2 className="text-sm font-semibold text-gray-900">
            Projects
          </h2>
        </div>

        <ProjectList
          projects={projects}
          selectedProject={selectedProject}
          onSelectProject={onSelectProject}
        />
      </div>
    </aside>
  );
}