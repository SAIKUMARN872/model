export interface DocumentInput {
  filename: string;
  mimeType: string;
  content: string;
}

export interface DocumentOutput {
  filename: string;
  extractedText: string;
}
