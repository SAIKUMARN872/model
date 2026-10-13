import type { CreateSessionInput, Session } from "../interfaces.js";
import { createId } from "../utils.js";

export class SessionRepository {
  private records = new Map<string, Session>();

  async create(input: CreateSessionInput): Promise<Session> {
    const record = {
      id: createId("session"),
      name: input.name,
      createdAt: new Date(),
    };
    this.records.set(record.id, record);
    return { ...record };
  }

  async getById(id: string): Promise<Session | null> {
    const item = this.records.get(id);
    return item ? { ...item } : null;
  }

  async list(): Promise<Session[]> {
    return [...this.records.values()].map((item) => ({ ...item }));
  }

  async delete(id: string): Promise<boolean> {
    return this.records.delete(id);
  }
}
