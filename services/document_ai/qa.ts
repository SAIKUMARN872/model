export interface QuestionAnswer {
  question: string;
  answer: string;
  confidence: number;
  matchedParagraphs: number[];
}

export interface QAOptions {
  maxMatches?: number;
  minTokenLength?: number;
}

function tokenize(value: string, minTokenLength: number): string[] {
  return value
    .toLocaleLowerCase()
    .match(/[\p{L}\p{N}]+/gu)
    ?.filter((token) => token.length >= minTokenLength) ?? [];
}

export function answerQuestion(
  question: string,
  paragraphs: string[],
  options: QAOptions = {},
): QuestionAnswer {
  if (!question.trim()) {
    throw new TypeError("Question must not be empty.");
  }

  const maxMatches = options.maxMatches ?? 3;
  const minTokenLength = options.minTokenLength ?? 2;

  if (!Number.isSafeInteger(maxMatches) || maxMatches < 1) {
    throw new RangeError("maxMatches must be a positive safe integer.");
  }

  if (!Number.isSafeInteger(minTokenLength) || minTokenLength < 1) {
    throw new RangeError("minTokenLength must be a positive safe integer.");
  }

  const questionTokens = [...new Set(tokenize(question, minTokenLength))];

  if (questionTokens.length === 0) {
    return {
      question,
      answer: "No answer found in the supplied document.",
      confidence: 0,
      matchedParagraphs: [],
    };
  }

  const scored = paragraphs.map((paragraph, index) => {
    const paragraphTokens = tokenize(paragraph, minTokenLength);
    const tokenSet = new Set(paragraphTokens);
    const matches = questionTokens.filter((token) => tokenSet.has(token));
    const score = matches.length / questionTokens.length;

    return { paragraph, index, score };
  });

  const best = scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, maxMatches);

  if (best.length === 0) {
    return {
      question,
      answer: "No answer found in the supplied document.",
      confidence: 0,
      matchedParagraphs: [],
    };
  }

  return {
    question,
    answer: best.map((item) => item.paragraph).join("\n\n"),
    confidence: Math.max(...best.map((item) => item.score)),
    matchedParagraphs: best.map((item) => item.index),
  };
}
