import type { LibraryFile, SearchInput } from "../library.types.js";
import { validateSearchInput } from "../schemas/library-schema.js";
import { FileRepository } from "../repository/file-repository.js";

export class SearchService {
  constructor(private readonly files = new FileRepository()) {}

  search(input: SearchInput): LibraryFile[] {
    const valid = validateSearchInput(input);
    const query = valid.query.toLocaleLowerCase();
    return this.files.list(valid.folderId)
      .filter(file =>
        file.name.toLocaleLowerCase().includes(query) ||
        file.path.toLocaleLowerCase().includes(query) ||
        file.mimeType.toLocaleLowerCase().includes(query),
      )
      .slice(0, valid.limit);
  }
}
