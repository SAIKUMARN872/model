import { randomUUID } from "node:crypto";
import type {
  CreateProjectInput,
  DeveloperProject,
  UpdateProjectInput,
} from "./project-schema.js";
import { validateCreateProjectInput, validateUpdateProjectInput } from "./project-schema.js";
import { ProjectRepository } from "./project-repository.js";

export class ProjectService {
  constructor(private readonly repository = new ProjectRepository()) {}

  create(input: CreateProjectInput): DeveloperProject {
    validateCreateProjectInput(input);
    const now = new Date();
    return this.repository.save({
      id: randomUUID(),
      ownerId: input.ownerId.trim(),
      name: input.name.trim(),
      description: input.description?.trim() ?? "",
      status: "active",
      createdAt: now,
      updatedAt: now,
    });
  }

  get(id: string, ownerId: string): DeveloperProject | undefined {
    const project = this.repository.getById(id);
    if (project && project.ownerId !== ownerId) {
      throw new Error("Project does not belong to this owner.");
    }
    return project;
  }

  list(ownerId: string): DeveloperProject[] {
    return this.repository.listByOwner(ownerId);
  }

  update(id: string, ownerId: string, input: UpdateProjectInput): DeveloperProject {
    validateUpdateProjectInput(input);
    const project = this.get(id, ownerId);
    if (!project) throw new Error("Project not found.");

    return this.repository.save({
      ...project,
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.description !== undefined ? { description: input.description.trim() } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      updatedAt: new Date(),
    });
  }

  delete(id: string, ownerId: string): boolean {
    const project = this.get(id, ownerId);
    if (!project) return false;
    return this.repository.delete(id);
  }
}
