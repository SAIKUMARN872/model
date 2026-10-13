import type { CreateFolderInput, LibraryFolder } from "../library.types.js";
import { LibraryService } from "../services/library-service.js";

export class FolderController {
  constructor(private readonly library = new LibraryService()) {}

  create(input: CreateFolderInput): LibraryFolder {
    return this.library.createFolder(input);
  }

  get(id: string): LibraryFolder {
    return this.library.folders.get(id);
  }

  list(parentId?: string): LibraryFolder[] {
    return this.library.folders.list(parentId);
  }

  update(id: string, patch: Partial<Pick<LibraryFolder, "name" | "parentId">>): LibraryFolder {
    return this.library.folders.update(id, patch);
  }

  delete(id: string): boolean {
    return this.library.deleteFolder(id);
  }
}
