export interface ExtractionOptions {
  includeEmptyLines?: boolean;
  normalizeWhitespace?: boolean;
  maxCharacters?: number;
}

export interface ExtractionResult {
  text: string;
  characterCount: number;
  truncated: boolean;
}

export function extractText(
  input: string | Uint8Array,
  options: ExtractionOptions = {},
): ExtractionResult {
  const maxCharacters = options.maxCharacters ?? 1_000_000;

  if (!Number.isSafeInteger(maxCharacters) || maxCharacters < 0) {
    throw new RangeError("maxCharacters must be a non-negative safe integer.");
  }

  let text =
    typeof input === "string"
      ? input
      : new TextDecoder("utf-8", { fatal: false }).decode(input);

  text = text.replace(/\r\n?/g, "\n");

  if (options.normalizeWhitespace) {
    text = text
      .split("\n")
      .map((line) => line.replace(/[ \t]+/g, " ").trim())
      .join("\n");
  }

  if (options.includeEmptyLines === false) {
    text = text
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .join("\n");
  }

  const truncated = text.length > maxCharacters;
  if (truncated) {
    text = text.slice(0, maxCharacters);
  }

  return {
    text,
    characterCount: text.length,
    truncated,
  };
}

export function extractMetadata(
  text: string,
): { characterCount: number; wordCount: number; lineCount: number } {
  const trimmed = text.trim();

  return {
    characterCount: text.length,
    wordCount: trimmed ? trimmed.split(/\s+/u).length : 0,
    lineCount: text.length === 0 ? 0 : text.split("\n").length,
  };
}
