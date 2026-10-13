import type { SearchInput, LibraryFile } from "../library.types.js";
import { LibraryService } from "../services/library-service.js";

export class SearchController {
  constructor(private readonly library = new LibraryService()) {}

  search(input: SearchInput): LibraryFile[] {
    return this.library.search.search(input);
  }
}
