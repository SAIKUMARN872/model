import type { DeveloperProject } from "./project-schema.js";

function clone(item: DeveloperProject): DeveloperProject {
  return {
    ...item,
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
  };
}

export class ProjectRepository {
  private readonly items = new Map<string, DeveloperProject>();

  save(item: DeveloperProject): DeveloperProject {
    const copy = clone(item);
    this.items.set(copy.id, copy);
    return clone(copy);
  }

  getById(id: string): DeveloperProject | undefined {
    const item = this.items.get(id);
    return item ? clone(item) : undefined;
  }

  listByOwner(ownerId: string): DeveloperProject[] {
    return [...this.items.values()]
      .filter((item) => item.ownerId === ownerId)
      .map(clone);
  }

  delete(id: string): boolean {
    return this.items.delete(id);
  }
}
