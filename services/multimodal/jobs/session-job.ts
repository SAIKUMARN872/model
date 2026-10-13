import type { MultimodalJob } from "./multimodal-job.js";

export type SessionJob = MultimodalJob & { type: "session" };
