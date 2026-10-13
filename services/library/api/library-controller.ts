import type { CreateFileInput, CreateFolderInput, SearchInput } from "../library.types.js";
import { LibraryService } from "../services/library-service.js";

export class LibraryController {
  constructor(readonly service = new LibraryService()) {}

  createFile(input: CreateFileInput) {
    return this.service.createFile(input);
  }

  createFolder(input: CreateFolderInput) {
    return this.service.createFolder(input);
  }

  search(input: SearchInput) {
    return this.service.search.search(input);
  }

  deleteFolder(id: string) {
    return this.service.deleteFolder(id);
  }
}
