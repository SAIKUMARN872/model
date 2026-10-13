import { ConnectionRepository } from "./connection-repository.js";
import type { ModelConnection, CreateConnectionInput, UpdateConnectionInput } from "./connection-schema.js";

export class ConnectionService {
  constructor(private readonly repository: ConnectionRepository) {}

  async create(input: CreateConnectionInput): Promise<ModelConnection> {
    if (!input.modelId.trim() || !input.name.trim() || !input.endpoint.trim()) {
      throw new Error("modelId, name, and endpoint are required");
    }
    return this.repository.create(input);
  }

  async getById(id: string): Promise<ModelConnection | null> {
    return this.repository.getById(id);
  }

  async list(): Promise<ModelConnection[]> {
    return this.repository.list();
  }

  async update(id: string, input: UpdateConnectionInput): Promise<ModelConnection> {
    const result = await this.repository.update(id, input);
    if (!result) throw new Error("Connection not found");
    return result;
  }

  async delete(id: string): Promise<void> {
    if (!(await this.repository.delete(id))) throw new Error("Connection not found");
  }
}
