import type { CreateFolderInput, LibraryFolder } from "../library.types.js";
import { libraryConfig } from "../config/config.js";

export function validateCreateFolder(input: CreateFolderInput): CreateFolderInput {
  if (!input.name?.trim()) throw new Error("Folder name is required.");
  if (input.name.length > libraryConfig.allowedNameLength) throw new Error("Folder name is too long.");
  if (input.parentId !== undefined && !input.parentId.trim()) throw new Error("Parent folder ID cannot be empty.");
  return { ...input, name: input.name.trim() };
}

export function validateLibraryFolder(folder: LibraryFolder): LibraryFolder {
  validateCreateFolder(folder);
  if (!folder.id?.trim()) throw new Error("Folder ID is required.");
  if (!folder.createdAt || !folder.updatedAt) throw new Error("Folder timestamps are required.");
  return folder;
}
