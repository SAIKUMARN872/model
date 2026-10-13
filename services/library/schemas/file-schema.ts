import type { CreateFileInput, LibraryFile } from "../library.types.js";
import { libraryConfig } from "../config/config.js";

export function validateCreateFile(input: CreateFileInput): CreateFileInput {
  if (!input.name?.trim()) throw new Error("File name is required.");
  if (input.name.length > libraryConfig.allowedNameLength) throw new Error("File name is too long.");
  if (!input.path?.trim()) throw new Error("File path is required.");
  if ((input.size ?? 0) < 0) throw new Error("File size cannot be negative.");
  if ((input.size ?? 0) > libraryConfig.maxFileSize) throw new Error("File exceeds maximum size.");
  if (input.folderId !== undefined && !input.folderId.trim()) throw new Error("Folder ID cannot be empty.");
  return {
    ...input,
    name: input.name.trim(),
    path: input.path.trim(),
    mimeType: input.mimeType?.trim() || "application/octet-stream",
    size: input.size ?? 0,
    metadata: input.metadata ? structuredClone(input.metadata) : {},
  };
}

export function validateLibraryFile(file: LibraryFile): LibraryFile {
  validateCreateFile(file);
  if (!file.id?.trim()) throw new Error("File ID is required.");
  if (!file.createdAt || !file.updatedAt) throw new Error("File timestamps are required.");
  return file;
}
