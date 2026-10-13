import type { MultimodalJob } from "./multimodal-job.js";

export type ProcessingJob = MultimodalJob & { type: "processing" };
