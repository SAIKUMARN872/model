import type { TextInput, TextOutput } from "./text-schema.js";

export class TextService {
  async process(input: TextInput): Promise<TextOutput> {
    if (!input.text.trim()) throw new Error("Text is required");
    return {
      originalText: input.text,
      characterCount: input.text.length,
      wordCount: input.text.trim().split(/\s+/).length,
    };
  }
}
