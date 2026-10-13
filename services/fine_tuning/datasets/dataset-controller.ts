import type { DatasetService } from "./dataset-service.js";
import type { CreateDatasetInput } from "../fine-tuning.types.js";

export class DatasetController {
  constructor(private readonly service: DatasetService) {}

  async create(body: unknown) {
    try {
      const dataset = await this.service.create(body as CreateDatasetInput);
      return { statusCode: 201, body: dataset };
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

  async delete(id: string) {
    const deleted = await this.service.delete(id);

    return deleted
      ? { statusCode: 204, body: null }
      : { statusCode: 404, body: { error: "Dataset not found." } };
  }
}
