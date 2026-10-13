import type { SearchInput } from "../library.types.js";
import { libraryConfig } from "../config/config.js";

export function validateSearchInput(input: SearchInput): SearchInput {
  if (!input.query?.trim()) throw new Error("Search query is required.");
  const limit = input.limit ?? libraryConfig.defaultSearchLimit;
  if (!Number.isInteger(limit) || limit < 1 || limit > libraryConfig.maxSearchLimit) {
    throw new Error(`Search limit must be between 1 and ${libraryConfig.maxSearchLimit}.`);
  }
  return { ...input, query: input.query.trim(), limit };
}
