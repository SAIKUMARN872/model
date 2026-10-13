import type { ExecutionRecord } from "../execution.types.js";
import { ExecutionService } from "../services/execution.service.js";

export class ExecutionWorker {
  private running = false;

  constructor(
    private readonly service: ExecutionService,
    private readonly concurrency = 1
  ) {
    if (!Number.isInteger(concurrency) || concurrency < 1) {
      throw new TypeError("concurrency must be a positive integer.");
    }
  }

  async process(id: string): Promise<ExecutionRecord> {
    return this.service.execute(id);
  }

  async processQueued(): Promise<ExecutionRecord[]> {
    if (this.running) return [];

    this.running = true;

    try {
      const queued = await this.service.list({
        status: "queued",
        limit: this.concurrency
      });

      return await Promise.all(
        queued.map((record) => this.service.execute(record.id))
      );
    } finally {
      this.running = false;
    }
  }

  async runOnce(): Promise<number> {
    const results = await this.processQueued();
    return results.length;
  }

  isRunning(): boolean {
    return this.running;
  }
}
