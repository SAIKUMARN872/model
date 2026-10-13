import type { CreateFolderInput, LibraryFolder } from "../library.types.js";
import { FolderRepository } from "../repository/folder-repository.js";
import { LibraryEventBus } from "../events/library-events.js";

export class FolderService {
  constructor(
    readonly repository = new FolderRepository(),
    private readonly events = new LibraryEventBus(),
  ) {}

  create(input: CreateFolderInput): LibraryFolder {
    const folder = this.repository.create(input);
    this.events.publish({ type: "folder.created", folder });
    return folder;
  }

  get(id: string): LibraryFolder {
    const folder = this.repository.getById(id);
    if (!folder) throw new Error(`Folder not found: ${id}`);
    return folder;
  }

  list(parentId?: string): LibraryFolder[] {
    return this.repository.list(parentId);
  }

  update(id: string, patch: Partial<Pick<LibraryFolder, "name" | "parentId">>): LibraryFolder {
    return this.repository.update(id, patch);
  }

  delete(id: string): boolean {
    const deleted = this.repository.delete(id);
    if (deleted) this.events.publish({ type: "folder.deleted", folderId: id });
    return deleted;
  }
}
