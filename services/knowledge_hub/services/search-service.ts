import { DocumentRepository } from "../repository/document-repository.js";
import { validateSearchInput } from "../schemas/search-schema.js";
import { SearchEventBus } from "../events/search-events.js";
import type { SearchInput } from "../schemas/search-schema.js";

export class SearchService {
    constructor(
        private readonly documents = new DocumentRepository(),
        private readonly events = new SearchEventBus()
    ) {}

    async search(input: SearchInput) {
        const valid = validateSearchInput(input);
        const terms = valid.query.toLowerCase().split(/\s+/).filter(Boolean);
        const all = await this.documents.getAll();

        const results = all
            .filter(document =>
                (!valid.collectionId || document.collectionId === valid.collectionId) &&
                terms.every(term =>
                    `${document.title} ${document.content}`.toLowerCase().includes(term)
                )
            )
            .slice(0, valid.limit);

        await this.events.emit({
            query: valid.query,
            resultCount: results.length,
            timestamp: new Date().toISOString()
        });

        return results;
    }
}
