import type { CreateFileInput, CreateFolderInput } from "../library.types.js";
import { FileRepository } from "../repository/file-repository.js";
import { FolderRepository } from "../repository/folder-repository.js";
import { LibraryRepository } from "../repository/library-repository.js";
import { FileService } from "./file-service.js";
import { FolderService } from "./folder-service.js";
import { SearchService } from "./search-service.js";

export class LibraryService {
  readonly repository: LibraryRepository;
  readonly files: FileService;
  readonly folders: FolderService;
  readonly search: SearchService;

  constructor(repository = new LibraryRepository()) {
    this.repository = repository;
    this.files = new FileService(repository.files);
    this.folders = new FolderService(repository.folders);
    this.search = new SearchService(repository.files);
  }

  createFile(input: CreateFileInput) {
    if (input.folderId && !this.repository.getFolder(input.folderId)) {
      throw new Error(`Folder not found: ${input.folderId}`);
    }
    return this.files.create(input);
  }

  createFolder(input: CreateFolderInput) {
    return this.folders.create(input);
  }

  deleteFolder(id: string): boolean {
    return this.repository.deleteFolder(id);
  }
}
