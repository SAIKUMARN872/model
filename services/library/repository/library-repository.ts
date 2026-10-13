import type { LibraryFile, LibraryFolder } from "../library.types.js";
import { FileRepository } from "./file-repository.js";
import { FolderRepository } from "./folder-repository.js";

export class LibraryRepository {
  constructor(
    readonly files = new FileRepository(),
    readonly folders = new FolderRepository(),
  ) {}

  getFile(id: string): LibraryFile | undefined {
    return this.files.getById(id);
  }

  getFolder(id: string): LibraryFolder | undefined {
    return this.folders.getById(id);
  }

  deleteFolder(id: string): boolean {
    if (this.files.list(id).length > 0) throw new Error("Cannot delete a folder that contains files.");
    return this.folders.delete(id);
  }
}
