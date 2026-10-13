import { SearchService } from "../services/search-service.js";
import type { SearchInput } from "../schemas/search-schema.js";

export class SearchController {
    constructor(private readonly service = new SearchService()) {}
    search(input: SearchInput) { return this.service.search(input); }
}
