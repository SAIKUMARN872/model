"use client";

import { useState } from "react";

import ProjectsHeader from "../../components/projects/ProjectsHeader";
import ProjectsSidebar from "../../components/projects/ProjectsSidebar";
import ProjectWorkspace from "../../components/projects/ProjectWorkspace";
import CreateProjectModal from "../../components/projects/CreateProjectModal";
import type { Project } from "../../components/projects/ProjectList";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);

  const [selectedProject, setSelectedProject] =
    useState<Project | null>(null);

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const createProject = (
    name: string,
    description: string
  ) => {
    const newProject: Project = {
      id: Date.now(),
      name,
      description:
        description || "New ModelNow project",
    };

    setProjects((currentProjects) => [
      ...currentProjects,
      newProject,
    ]);

    setSelectedProject(newProject);
    setShowCreateModal(false);
  };

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-gray-900">
      {/* HEADER */}
      <ProjectsHeader
        onCreateProject={() => {
          setShowCreateModal(true);
        }}
      />

      {/* PROJECT AREA */}
      <div className="flex min-h-[calc(100vh-73px)]">
        {/* SIDEBAR */}
        <ProjectsSidebar
          projects={projects}
          selectedProject={selectedProject}
          onSelectProject={setSelectedProject}
        />

        {/* WORKSPACE */}
        <ProjectWorkspace
          project={selectedProject}
        />
      </div>

      {/* CREATE PROJECT MODAL */}
      <CreateProjectModal
        open={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
        }}
        onCreate={createProject}
      />
    </main>
  );
}