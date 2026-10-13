export interface AudioInput {
  filename: string;
  mimeType: string;
  content: string;
  language?: string;
}

export interface AudioOutput {
  filename: string;
  durationSeconds?: number;
  transcript?: string;
}
