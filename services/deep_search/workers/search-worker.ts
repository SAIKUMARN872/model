import type { DeepSearchInput } from "../schemas/deep-search-schema.js";
import type { DeepSearchService } from "../services/deep-search-service.js";

export class SearchWorker {
  constructor(private readonly service: DeepSearchService) {}

  run(input: DeepSearchInput) {
    return this.service.search(input);
  }
}
