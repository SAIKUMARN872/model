export interface VideoInput {
  filename: string;
  mimeType: string;
  content: string;
}

export interface VideoOutput {
  filename: string;
  frameCount?: number;
  summary?: string;
}
