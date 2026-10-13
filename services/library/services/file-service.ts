import type { CreateFileInput, LibraryFile } from "../library.types.js";
import { FileRepository } from "../repository/file-repository.js";
import { LibraryEventBus } from "../events/library-events.js";

export class FileService {
  constructor(
    readonly repository = new FileRepository(),
    private readonly events = new LibraryEventBus(),
  ) {}

  create(input: CreateFileInput): LibraryFile {
    const file = this.repository.create(input);
    this.events.publish({ type: "file.created", file });
    return file;
  }

  get(id: string): LibraryFile {
    const file = this.repository.getById(id);
    if (!file) throw new Error(`File not found: ${id}`);
    return file;
  }

  list(folderId?: string): LibraryFile[] {
    return this.repository.list(folderId);
  }

  update(id: string, patch: Partial<Pick<LibraryFile, "name" | "path" | "mimeType" | "size" | "folderId" | "metadata">>): LibraryFile {
    return this.repository.update(id, patch);
  }

  delete(id: string): boolean {
    const deleted = this.repository.delete(id);
    if (deleted) this.events.publish({ type: "file.deleted", fileId: id });
    return deleted;
  }
}
