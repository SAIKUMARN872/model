import type { LibraryFile, LibraryFolder } from "../library.types.js";

export type LibraryEvent =
  | { type: "file.created"; file: LibraryFile }
  | { type: "file.deleted"; fileId: string }
  | { type: "folder.created"; folder: LibraryFolder }
  | { type: "folder.deleted"; folderId: string };

export type LibraryEventHandler = (event: LibraryEvent) => void;

export class LibraryEventBus {
  private readonly handlers = new Set<LibraryEventHandler>();

  subscribe(handler: LibraryEventHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  publish(event: LibraryEvent): void {
    for (const handler of this.handlers) handler(structuredClone(event));
  }

  clear(): void {
    this.handlers.clear();
  }
}
