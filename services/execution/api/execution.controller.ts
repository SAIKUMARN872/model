import type { CreateExecutionInput, ExecutionFilter } from "../execution.types.js";
import { ExecutionService } from "../services/execution.service.js";

export interface ExecutionRequest {
  body?: unknown;
  params?: Record<string, string | undefined>;
  query?: Record<string, string | undefined>;
}

export interface ExecutionHttpResponse {
  statusCode: number;
  body: unknown;
}

export class ExecutionController {
  constructor(private readonly service: ExecutionService) {}

  async create(request: ExecutionRequest): Promise<ExecutionHttpResponse> {
    try {
      const execution = await this.service.create(
        request.body as CreateExecutionInput
      );
      return { statusCode: 201, body: execution };
    } catch (error) {
      return {
        statusCode: 400,
        body: { error: error instanceof Error ? error.message : String(error) }
      };
    }
  }

  async get(request: ExecutionRequest): Promise<ExecutionHttpResponse> {
    try {
      const id = request.params?.id;
      if (!id) return { statusCode: 400, body: { error: "id is required." } };

      return { statusCode: 200, body: await this.service.get(id) };
    } catch (error) {
      return {
        statusCode: 404,
        body: { error: error instanceof Error ? error.message : String(error) }
      };
    }
  }

  async list(request: ExecutionRequest): Promise<ExecutionHttpResponse> {
    const filter: ExecutionFilter = {
      ...(request.query?.status
        ? { status: request.query.status as ExecutionFilter["status"] }
        : {}),
      ...(request.query?.task ? { task: request.query.task } : {}),
      ...(request.query?.limit
        ? { limit: Number(request.query.limit) }
        : {}),
      ...(request.query?.offset
        ? { offset: Number(request.query.offset) }
        : {})
    };

    return { statusCode: 200, body: await this.service.list(filter) };
  }

  async cancel(request: ExecutionRequest): Promise<ExecutionHttpResponse> {
    try {
      const id = request.params?.id;
      if (!id) return { statusCode: 400, body: { error: "id is required." } };

      return { statusCode: 200, body: await this.service.cancel(id) };
    } catch (error) {
      return {
        statusCode: 400,
        body: { error: error instanceof Error ? error.message : String(error) }
      };
    }
  }

  async retry(request: ExecutionRequest): Promise<ExecutionHttpResponse> {
    try {
      const id = request.params?.id;
      if (!id) return { statusCode: 400, body: { error: "id is required." } };

      return { statusCode: 200, body: await this.service.retry(id) };
    } catch (error) {
      return {
        statusCode: 400,
        body: { error: error instanceof Error ? error.message : String(error) }
      };
    }
  }
}
