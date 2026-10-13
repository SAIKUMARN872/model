import type { CreateFileInput, LibraryFile } from "../library.types.js";
import { clone, createId, now } from "../library.types.js";
import { validateCreateFile } from "../schemas/file-schema.js";

export class FileRepository {
  private readonly records = new Map<string, LibraryFile>();

  create(input: CreateFileInput): LibraryFile {
    const valid = validateCreateFile(input);
    const timestamp = now();
    const file: LibraryFile = {
      id: createId("file"),
      name: valid.name,
      path: valid.path,
      mimeType: valid.mimeType!,
      size: valid.size!,
      folderId: valid.folderId,
      metadata: valid.metadata!,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    this.records.set(file.id, clone(file));
    return clone(file);
  }

  getById(id: string): LibraryFile | undefined {
    const file = this.records.get(id);
    return file ? clone(file) : undefined;
  }

  list(folderId?: string): LibraryFile[] {
    return [...this.records.values()]
      .filter(file => folderId === undefined || file.folderId === folderId)
      .map(clone);
  }

  update(id: string, patch: Partial<Pick<LibraryFile, "name" | "path" | "mimeType" | "size" | "folderId" | "metadata">>): LibraryFile {
    const current = this.records.get(id);
    if (!current) throw new Error(`File not found: ${id}`);
    const next = {
      ...current,
      ...patch,
      metadata: patch.metadata ? clone(patch.metadata) : current.metadata,
      updatedAt: now(),
    };
    validateCreateFile(next);
    this.records.set(id, clone(next));
    return clone(next);
  }

  delete(id: string): boolean {
    return this.records.delete(id);
  }
}
