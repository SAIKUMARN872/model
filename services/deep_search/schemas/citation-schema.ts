export interface Citation {
  id: string;
  researchId: string;
  sourceId: string;
  quote: string;
  locator?: string;
  createdAt: Date;
}

export interface CreateCitationInput {
  researchId: string;
  sourceId: string;
  quote: string;
  locator?: string;
}

export function validateCreateCitationInput(input: CreateCitationInput): void {
  if (!input.researchId.trim()) throw new Error("researchId is required.");
  if (!input.sourceId.trim()) throw new Error("sourceId is required.");
  if (!input.quote.trim()) throw new Error("quote is required.");
}
