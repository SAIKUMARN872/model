export interface Source {
  id: string;
  researchId: string;
  url: string;
  title: string;
  snippet: string;
  retrievedAt: Date;
  createdAt: Date;
}

export interface CreateSourceInput {
  researchId: string;
  url: string;
  title: string;
  snippet?: string;
}

export function validateCreateSourceInput(input: CreateSourceInput): void {
  if (!input.researchId.trim()) throw new Error("researchId is required.");
  if (!input.title.trim()) throw new Error("title is required.");
  if (!input.url.trim()) throw new Error("url is required.");

  let parsed: URL;
  try {
    parsed = new URL(input.url);
  } catch {
    throw new Error("url must be a valid URL.");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("url must use HTTP or HTTPS.");
  }
}
