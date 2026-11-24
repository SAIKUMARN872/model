"use client";

import { FolderKanban } from "lucide-react";

export type Project = {
  id: number;
  name: string;
  description: string;
};

type ProjectListProps = {
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (project: Project) => void;
};

export default function ProjectList({
  projects,
  selectedProject,
  onSelectProject,
}: ProjectListProps) {
  return (
    <div className="space-y-1">
      {projects.map((project) => {
        const isSelected = selectedProject?.id === project.id;

        return (
          <button
            key={project.id}
            type="button"
            onClick={() => onSelectProject(project)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition ${
              isSelected
                ? "bg-gray-100 font-medium text-gray-900"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <FolderKanban
              size={17}
              className="shrink-0"
            />

            <span className="truncate">
              {project.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}