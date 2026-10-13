import type { DeepSearchInput } from "../schemas/deep-search-schema.js";
import type { DeepSearchService } from "../services/deep-search-service.js";

export class DeepSearchController {
  constructor(private readonly service: DeepSearchService) {}

  search(input: DeepSearchInput) {
    return this.service.search(input);
  }
}
