export interface SearchInput {
    query: string;
    collectionId?: string;
    limit?: number;
}

export function validateSearchInput(input: SearchInput): SearchInput {
    if (!input || typeof input.query !== "string" || !input.query.trim()) {
        throw new Error("Search query is required");
    }

    const limit = input.limit ?? 10;
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
        throw new Error("Search limit must be between 1 and 100");
    }

    return { ...input, query: input.query.trim(), limit };
}
