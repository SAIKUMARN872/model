export interface SummarizeOptions {
  maxSentences?: number;
  maxCharacters?: number;
}

export interface SummaryResult {
  summary: string;
  sentenceCount: number;
  originalCharacterCount: number;
  summaryCharacterCount: number;
}

function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/gu, " ")
    .trim()
    .match(/[^.!?]+(?:[.!?]+|$)/gu)
    ?.map((sentence) => sentence.trim())
    .filter(Boolean) ?? [];
}

export function summarizeText(
  text: string,
  options: SummarizeOptions = {},
): SummaryResult {
  const maxSentences = options.maxSentences ?? 3;
  const maxCharacters = options.maxCharacters ?? 1_000_000;

  if (!Number.isSafeInteger(maxSentences) || maxSentences < 1) {
    throw new RangeError("maxSentences must be a positive safe integer.");
  }

  if (!Number.isSafeInteger(maxCharacters) || maxCharacters < 0) {
    throw new RangeError("maxCharacters must be a non-negative safe integer.");
  }

  const sentences = splitSentences(text);
  const summary = sentences.slice(0, maxSentences).join(" ");
  const limitedSummary = summary.slice(0, maxCharacters);

  return {
    summary: limitedSummary,
    sentenceCount: limitedSummary ? splitSentences(limitedSummary).length : 0,
    originalCharacterCount: text.length,
    summaryCharacterCount: limitedSummary.length,
  };
}
