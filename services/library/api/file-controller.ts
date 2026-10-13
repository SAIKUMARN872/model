import type { CreateFileInput, LibraryFile } from "../library.types.js";
import { LibraryService } from "../services/library-service.js";

export class FileController {
  constructor(private readonly library = new LibraryService()) {}

  create(input: CreateFileInput): LibraryFile {
    return this.library.createFile(input);
  }

  get(id: string): LibraryFile {
    return this.library.files.get(id);
  }

  list(folderId?: string): LibraryFile[] {
    return this.library.files.list(folderId);
  }

  update(id: string, patch: Partial<Pick<LibraryFile, "name" | "path" | "mimeType" | "size" | "folderId" | "metadata">>): LibraryFile {
    return this.library.files.update(id, patch);
  }

  delete(id: string): boolean {
    return this.library.files.delete(id);
  }
}
