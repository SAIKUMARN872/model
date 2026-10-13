import type { CreateFolderInput, LibraryFolder } from "../library.types.js";
import { clone, createId, now } from "../library.types.js";
import { validateCreateFolder } from "../schemas/folder-schema.js";

export class FolderRepository {
  private readonly records = new Map<string, LibraryFolder>();

  create(input: CreateFolderInput): LibraryFolder {
    const valid = validateCreateFolder(input);
    if (valid.parentId && !this.records.has(valid.parentId)) throw new Error(`Parent folder not found: ${valid.parentId}`);
    const timestamp = now();
    const folder: LibraryFolder = {
      id: createId("folder"),
      name: valid.name,
      parentId: valid.parentId,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    this.records.set(folder.id, clone(folder));
    return clone(folder);
  }

  getById(id: string): LibraryFolder | undefined {
    const folder = this.records.get(id);
    return folder ? clone(folder) : undefined;
  }

  list(parentId?: string): LibraryFolder[] {
    return [...this.records.values()]
      .filter(folder => folder.parentId === parentId)
      .map(clone);
  }

  update(id: string, patch: Partial<Pick<LibraryFolder, "name" | "parentId">>): LibraryFolder {
    const current = this.records.get(id);
    if (!current) throw new Error(`Folder not found: ${id}`);
    if (patch.parentId === id) throw new Error("A folder cannot be its own parent.");
    if (patch.parentId && !this.records.has(patch.parentId)) throw new Error(`Parent folder not found: ${patch.parentId}`);
    const next = { ...current, ...patch, updatedAt: now() };
    validateCreateFolder(next);
    this.records.set(id, clone(next));
    return clone(next);
  }

  delete(id: string): boolean {
    if ([...this.records.values()].some(folder => folder.parentId === id)) {
      throw new Error("Cannot delete a folder that contains subfolders.");
    }
    return this.records.delete(id);
  }
}
