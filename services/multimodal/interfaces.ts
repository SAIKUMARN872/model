import type { MediaType, ProcessingStatus } from "./constants.js";

export interface MediaAsset {
  id: string;
  sessionId: string;
  type: MediaType;
  filename: string;
  mimeType: string;
  content: string;
  status: ProcessingStatus;
  createdAt: Date;
}

export interface ProcessingResult {
  id: string;
  assetId: string;
  status: ProcessingStatus;
  output: unknown;
  error?: string;
  createdAt: Date;
}

export interface Session {
  id: string;
  name: string;
  createdAt: Date;
}

export interface CreateAssetInput {
  sessionId: string;
  type: MediaType;
  filename: string;
  mimeType: string;
  content: string;
}

export interface CreateSessionInput {
  name: string;
}
