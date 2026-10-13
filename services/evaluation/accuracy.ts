export interface AccuracyResult {
  total: number;
  correct: number;
  incorrect: number;
  accuracy: number;
  accuracyPercent: number;
}

export interface AccuracyOptions {
  caseSensitive?: boolean;
  trimWhitespace?: boolean;
}

export interface AccuracyExample {
  expected: string;
  actual: string;
}

export function calculateAccuracy(
  expected: readonly string[],
  actual: readonly string[],
  options: AccuracyOptions = {},
): AccuracyResult {
  if (expected.length !== actual.length) {
    throw new RangeError(
      "Expected and actual arrays must have the same length.",
    );
  }

  let correct = 0;

  for (let i = 0; i < expected.length; i += 1) {
    let expectedValue = expected[i] ?? "";
    let actualValue = actual[i] ?? "";

    if (options.trimWhitespace !== false) {
      expectedValue = expectedValue.trim();
      actualValue = actualValue.trim();
    }

    if (options.caseSensitive !== true) {
      expectedValue = expectedValue.toLocaleLowerCase();
      actualValue = actualValue.toLocaleLowerCase();
    }

    if (expectedValue === actualValue) {
      correct += 1;
    }
  }

  const total = expected.length;
  const incorrect = total - correct;
  const accuracy = total === 0 ? 0 : correct / total;

  return {
    total,
    correct,
    incorrect,
    accuracy,
    accuracyPercent: accuracy * 100,
  };
}

export function calculateExampleAccuracy(
  examples: readonly AccuracyExample[],
  options: AccuracyOptions = {},
): AccuracyResult {
  return calculateAccuracy(
    examples.map((example) => example.expected),
    examples.map((example) => example.actual),
    options,
  );
}
