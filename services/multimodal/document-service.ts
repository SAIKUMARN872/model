import type { DocumentInput, DocumentOutput } from "./document-schema.js";

export class DocumentService {
  async process(input: DocumentInput): Promise<DocumentOutput> {
    if (!input.content) throw new Error("Document content is required");
    return { filename: input.filename, extractedText: input.content };
  }
}
