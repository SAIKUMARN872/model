export interface TextInput {
  text: string;
  language?: string;
}

export interface TextOutput {
  originalText: string;
  characterCount: number;
  wordCount: number;
}
