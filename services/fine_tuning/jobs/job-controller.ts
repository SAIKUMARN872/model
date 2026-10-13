import type { JobService } from "./job-service.js";
import type { CreateFineTuningJobInput } from "../fine-tuning.types.js";

export class JobController {
  constructor(private readonly service: JobService) {}

  async create(body: unknown) {
    try {
      const job = await this.service.create(body as CreateFineTuningJobInput);
      return { statusCode: 201, body: job };
    } catch (error) {
      return {
        statusCode: 400,
        body: { error: error instanceof Error ? error.message : String(error) }
      };
    }
  }

  async get(id: string) {
    try {
      return { statusCode: 200, body: await this.service.get(id) };
    } catch (error) {
      return {
        statusCode: 404,
        body: { error: error instanceof Error ? error.message : String(error) }
      };
    }
  }

  async list() {
    return { statusCode: 200, body: await this.service.list() };
  }

  async cancel(id: string) {
    try {
      return { statusCode: 200, body: await this.service.cancel(id) };
    } catch (error) {
      return {
        statusCode: 400,
        body: { error: error instanceof Error ? error.message : String(error) }
      };
    }
  }

  async retry(id: string) {
    try {
      return { statusCode: 200, body: await this.service.retry(id) };
    } catch (error) {
      return {
        statusCode: 400,
        body: { error: error instanceof Error ? error.message : String(error) }
      };
    }
  }
}
