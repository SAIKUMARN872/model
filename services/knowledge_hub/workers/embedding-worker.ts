import { EmbeddingJob } from "../jobs/embedding-job.js";

export class EmbeddingWorker {
    constructor(private readonly job = new EmbeddingJob()) {}
    enqueue(documentId: string) { return this.job.enqueue(documentId); }
}
