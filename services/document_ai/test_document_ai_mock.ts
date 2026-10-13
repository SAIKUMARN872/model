import test from "node:test";
import assert from "node:assert/strict";

import {
  classifyDocument,
  extractText,
  extractMetadata,
  parseDocument,
  answerQuestion,
  summarizeText,
} from "./index.js";

test("classifier identifies plain text from a string", () => {
  const result = classifyDocument("Hello world");

  assert.equal(result.type, "text");
  assert.equal(result.mimeType, "text/plain");
  assert.equal(result.confidence, 0.7);
  assert.equal(result.extension, ".txt");
});

test("classifier identifies PDF by MIME type", () => {
  const result = classifyDocument("content", "file.bin", "application/pdf");

  assert.equal(result.type, "pdf");
  assert.equal(result.mimeType, "application/pdf");
  assert.equal(result.confidence, 1);
});

test("classifier identifies images by filename extension", () => {
  const result = classifyDocument(new Uint8Array([1, 2, 3]), "photo.png");

  assert.equal(result.type, "image");
  assert.equal(result.mimeType, "image/png");
  assert.equal(result.extension, ".png");
});

test("classifier detects PDF magic bytes", () => {
  const result = classifyDocument(
    new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]),
  );

  assert.equal(result.type, "pdf");
  assert.equal(result.confidence, 0.99);
});

test("classifier detects PNG magic bytes", () => {
  const result = classifyDocument(
    new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  );

  assert.equal(result.type, "image");
  assert.equal(result.mimeType, "image/png");
});

test("classifier detects JPEG magic bytes", () => {
  const result = classifyDocument(new Uint8Array([0xff, 0xd8, 0xff]));

  assert.equal(result.type, "image");
  assert.equal(result.mimeType, "image/jpeg");
});

test("classifier returns unknown for unrecognized binary input", () => {
  const result = classifyDocument(new Uint8Array([0, 1, 2, 3]));

  assert.equal(result.type, "unknown");
  assert.equal(result.confidence, 0);
});

test("classifier normalizes MIME type parameters", () => {
  const result = classifyDocument(
    "example",
    undefined,
    "text/plain; charset=utf-8",
  );

  assert.equal(result.mimeType, "text/plain");
  assert.equal(result.type, "text");
});

test("extractor returns text input unchanged by default", () => {
  const result = extractText("Hello\nworld");

  assert.equal(result.text, "Hello\nworld");
  assert.equal(result.characterCount, 11);
  assert.equal(result.truncated, false);
});

test("extractor decodes UTF-8 bytes", () => {
  const bytes = new TextEncoder().encode("Hello");
  const result = extractText(bytes);

  assert.equal(result.text, "Hello");
  assert.equal(result.characterCount, 5);
});

test("extractor normalizes Windows line endings", () => {
  const result = extractText("first\r\nsecond\rthird");

  assert.equal(result.text, "first\nsecond\nthird");
});

test("extractor normalizes whitespace when requested", () => {
  const result = extractText("  hello   world  \n  next  ", {
    normalizeWhitespace: true,
  });

  assert.equal(result.text, "hello world\nnext");
});

test("extractor removes empty lines when requested", () => {
  const result = extractText("one\n\n two \n\nthree", {
    includeEmptyLines: false,
  });

  assert.equal(result.text, "one\n two \nthree");
});

test("extractor truncates text at the configured maximum", () => {
  const result = extractText("abcdefgh", { maxCharacters: 4 });

  assert.equal(result.text, "abcd");
  assert.equal(result.characterCount, 4);
  assert.equal(result.truncated, true);
});

test("extractor allows a zero character limit", () => {
  const result = extractText("content", { maxCharacters: 0 });

  assert.equal(result.text, "");
  assert.equal(result.truncated, true);
});

test("extractor rejects a negative character limit", () => {
  assert.throws(
    () => extractText("content", { maxCharacters: -1 }),
    RangeError,
  );
});

test("extractor rejects a fractional character limit", () => {
  assert.throws(
    () => extractText("content", { maxCharacters: 1.5 }),
    RangeError,
  );
});

test("extractMetadata counts characters, words, and lines", () => {
  const result = extractMetadata("hello world\nsecond line");

  assert.equal(result.characterCount, 23);
  assert.equal(result.wordCount, 4);
  assert.equal(result.lineCount, 2);
});

test("extractMetadata handles empty text", () => {
  const result = extractMetadata("");

  assert.deepEqual(result, {
    characterCount: 0,
    wordCount: 0,
    lineCount: 0,
  });
});

test("parser extracts paragraphs and headings", () => {
  const result = parseDocument(
    "# Overview\nThis is the first paragraph.\n\n## Details\nMore information.",
  );

  assert.equal(result.title, "Overview");
  assert.deepEqual(result.headings, ["Overview", "Details"]);
  assert.equal(result.paragraphs.length, 2);
  assert.equal(result.metadata.headingCount, 2);
});

test("parser uses a custom title", () => {
  const result = parseDocument("# Heading\nText.", { title: "Custom title" });

  assert.equal(result.title, "Custom title");
});

test("parser uses default title when no heading exists", () => {
  const result = parseDocument("Plain text without a heading.");

  assert.equal(result.title, "Untitled document");
});

test("parser handles empty text", () => {
  const result = parseDocument("");

  assert.equal(result.title, "Untitled document");
  assert.deepEqual(result.paragraphs, []);
  assert.deepEqual(result.headings, []);
  assert.equal(result.metadata.wordCount, 0);
});

test("parser normalizes Windows line endings", () => {
  const result = parseDocument("First paragraph.\r\n\r\nSecond paragraph.");

  assert.equal(result.paragraphs.length, 2);
});

test("parser limits the number of paragraphs", () => {
  const result = parseDocument("One.\n\nTwo.\n\nThree.", {
    maxParagraphs: 2,
  });

  assert.equal(result.paragraphs.length, 2);
});

test("parser rejects non-string input", () => {
  assert.throws(
    () => parseDocument(123 as unknown as string),
    TypeError,
  );
});

test("parser rejects negative paragraph limits", () => {
  assert.throws(
    () => parseDocument("text", { maxParagraphs: -1 }),
    RangeError,
  );
});

test("parser rejects fractional paragraph limits", () => {
  assert.throws(
    () => parseDocument("text", { maxParagraphs: 1.5 }),
    RangeError,
  );
});

test("QA answers with the most relevant paragraph", () => {
  const result = answerQuestion(
    "What is TypeScript?",
    [
      "Cats are common household pets.",
      "TypeScript is a typed programming language built on JavaScript.",
      "Water freezes at zero degrees Celsius.",
    ],
  );

  assert.match(result.answer, /TypeScript is a typed programming language/);
  assert.equal(result.matchedParagraphs[0], 1);
  assert.ok(result.confidence > 0);
});

test("QA returns a fallback when no paragraph matches", () => {
  const result = answerQuestion("What is astronomy?", [
    "The garden contains flowers.",
  ]);

  assert.equal(
    result.answer,
    "No answer found in the supplied document.",
  );
  assert.equal(result.confidence, 0);
  assert.deepEqual(result.matchedParagraphs, []);
});

test("QA rejects an empty question", () => {
  assert.throws(
    () => answerQuestion("  ", ["Some text"]),
    TypeError,
  );
});

test("QA handles an empty paragraph list", () => {
  const result = answerQuestion("What is the answer?", []);

  assert.equal(result.confidence, 0);
  assert.deepEqual(result.matchedParagraphs, []);
});

test("QA respects maxMatches", () => {
  const result = answerQuestion(
    "apple fruit",
    [
      "Apple is a fruit.",
      "Fruit includes apple.",
      "Apple and fruit are discussed.",
      "Unrelated topic.",
    ],
    { maxMatches: 2 },
  );

  assert.equal(result.matchedParagraphs.length, 2);
});

test("QA rejects invalid maxMatches", () => {
  assert.throws(
    () => answerQuestion("question", ["answer"], { maxMatches: 0 }),
    RangeError,
  );
});

test("QA rejects invalid minimum token length", () => {
  assert.throws(
    () =>
      answerQuestion("question", ["answer"], { minTokenLength: 0 }),
    RangeError,
  );
});

test("QA ignores tokens shorter than the configured minimum", () => {
  const result = answerQuestion("a x", ["a x"], { minTokenLength: 2 });

  assert.equal(result.confidence, 0);
});

test("summarizer returns the first three sentences by default", () => {
  const result = summarizeText(
    "First sentence. Second sentence! Third sentence? Fourth sentence.",
  );

  assert.equal(
    result.summary,
    "First sentence. Second sentence! Third sentence?",
  );
  assert.equal(result.sentenceCount, 3);
});

test("summarizer respects maxSentences", () => {
  const result = summarizeText("One. Two. Three. Four.", {
    maxSentences: 2,
  });

  assert.equal(result.summary, "One. Two.");
  assert.equal(result.sentenceCount, 2);
});

test("summarizer handles empty text", () => {
  const result = summarizeText("");

  assert.equal(result.summary, "");
  assert.equal(result.sentenceCount, 0);
  assert.equal(result.originalCharacterCount, 0);
});

test("summarizer truncates to maxCharacters", () => {
  const result = summarizeText("A longer sentence.", {
    maxCharacters: 5,
  });

  assert.equal(result.summary, "A lon");
  assert.equal(result.summaryCharacterCount, 5);
});

test("summarizer allows a zero character limit", () => {
  const result = summarizeText("Some text.", { maxCharacters: 0 });

  assert.equal(result.summary, "");
  assert.equal(result.sentenceCount, 0);
});

test("summarizer rejects zero maxSentences", () => {
  assert.throws(
    () => summarizeText("Text.", { maxSentences: 0 }),
    RangeError,
  );
});

test("summarizer rejects a negative character limit", () => {
  assert.throws(
    () => summarizeText("Text.", { maxCharacters: -1 }),
    RangeError,
  );
});

test("summarizer reports original and summary character counts", () => {
  const input = "First sentence. Second sentence.";
  const result = summarizeText(input, { maxSentences: 1 });

  assert.equal(result.originalCharacterCount, input.length);
  assert.equal(result.summaryCharacterCount, result.summary.length);
});
