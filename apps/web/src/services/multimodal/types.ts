export type MultimodalInputType =
  | "text"
  | "image"
  | "pdf"
  | "audio"
  | "video"
  | "document";

export type MultimodalInput = {
  type: MultimodalInputType;
  name?: string;
  mimeType?: string;
  size?: number;
};

export type MultimodalRequest = {
  message: string;
  inputs: MultimodalInput[];
  tool?: string;
  category?: string;
};

export type MultimodalPipelineStage = {
  stage: string;
  status: "completed" | "pending" | "failed";
};

export type MultimodalResponse = {
  success: boolean;
  requestId: string;
  message: string;
  pipeline: MultimodalPipelineStage[];
};