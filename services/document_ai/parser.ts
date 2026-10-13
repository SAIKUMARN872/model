export interface ParsedDocument {
  title: string;
  paragraphs: string[];
  headings: string[];
  metadata: {
    characterCount: number;
    wordCount: number;
    paragraphCount: number;
    headingCount: number;
  };
}

export interface ParseOptions {
  title?: string;
  maxParagraphs?: number;
}

export function parseDocument(
  text: string,
  options: ParseOptions = {},
): ParsedDocument {
  if (typeof text !== "string") {
    throw new TypeError("Document text must be a string.");
  }

  const maxParagraphs = options.maxParagraphs ?? 10_000;

  if (!Number.isSafeInteger(maxParagraphs) || maxParagraphs < 0) {
    throw new RangeError("maxParagraphs must be a non-negative safe integer.");
  }

  const normalized = text.replace(/\r\n?/g, "\n").trim();
  const lines = normalized.split("\n");
  const headings = lines
    .filter((line) => /^#{1,6}\s+\S/.test(line.trim()))
    .map((line) => line.trim().replace(/^#{1,6}\s+/, ""));

  const paragraphs = normalized
    ? normalized
        .split(/\n\s*\n/u)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
        .slice(0, maxParagraphs)
    : [];

  const plainText = paragraphs.join("\n\n");
  const trimmed = plainText.trim();

  return {
    title: options.title?.trim() || headings[0] || "Untitled document",
    paragraphs,
    headings,
    metadata: {
      characterCount: plainText.length,
      wordCount: trimmed ? trimmed.split(/\s+/u).length : 0,
      paragraphCount: paragraphs.length,
      headingCount: headings.length,
    },
  };
}
