import { KnowledgeService } from "../services/knowledge-service.js";

export class KnowledgeController {
    constructor(private readonly service = new KnowledgeService()) {}
    createJob(type: "ingestion" | "indexing" | "embedding" | "sync", payload: Record<string, unknown> = {}) {
        return this.service.createJob(type, payload);
    }
    getJob(id: string) { return this.service.getJob(id); }
    listJobs() { return this.service.listJobs(); }
}
