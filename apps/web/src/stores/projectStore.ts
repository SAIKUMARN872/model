import { create } from "zustand";

interface Project {
  id: number;
  name: string;
}

interface ProjectStore {
  projects: Project[];
  addProject: (project: Project) => void;
  deleteProject: (id: number) => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],

  addProject: (project) =>
    set((state) => ({
      projects: [...state.projects, project],
    })),

  deleteProject: (id) =>
    set((state) => ({
      projects: state.projects.filter(
        (project) => project.id !== id
      ),
    })),
}));