export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 100;

export interface PaginationMetadata {
  readonly page: number;
  readonly limit: number;
  readonly total: number;
  readonly hasNextPage: boolean;
}

function validatePageAndLimit(page: number, limit: number): void {
  if (!Number.isSafeInteger(page) || page < 1) {
    throw new RangeError("Page must be a positive safe integer.");
  }

  if (!Number.isSafeInteger(limit) || limit < 1 || limit > MAX_PAGE_LIMIT) {
    throw new RangeError(
      `Limit must be an integer between 1 and ${MAX_PAGE_LIMIT}.`,
    );
  }
}

export function calculateOffset(page: number, limit: number): number {
  validatePageAndLimit(page, limit);

  const offset = (page - 1) * limit;

  if (!Number.isSafeInteger(offset)) {
    throw new RangeError("Calculated pagination offset exceeds the safe integer range.");
  }

  return offset;
}

export function createPaginationMetadata(
  page: number,
  limit: number,
  total: number,
): PaginationMetadata {
  const offset = calculateOffset(page, limit);

  if (!Number.isSafeInteger(total) || total < 0) {
    throw new RangeError("Total must be a non-negative safe integer.");
  }

  return {
    page,
    limit,
    total,
    hasNextPage: offset < total && limit < total - offset,
  };
}