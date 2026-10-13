export type ProjectStatus = "active" | "archived";

export interface DeveloperProject {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectInput {
  ownerId: string;
  name: string;
  description?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  status?: ProjectStatus;
}

export function validateCreateProjectInput(input: CreateProjectInput): void {
  if (!input.ownerId.trim()) throw new Error("ownerId is required.");
  if (!input.name.trim()) throw new Error("name is required.");
}

export function validateUpdateProjectInput(input: UpdateProjectInput): void {
  if (input.name !== undefined && !input.name.trim()) {
    throw new Error("name cannot be blank.");
  }
  if (input.status !== undefined && !["active", "archived"].includes(input.status)) {
    throw new Error("Invalid project status.");
  }
}
