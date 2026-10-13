import { NotFoundError, ValidationError } from "./exceptions.js";
import { SessionRepository } from "./repository/session-repository.js";
import type { CreateSessionInput, Session } from "./interfaces.js";

export class SessionService {
  constructor(private readonly repository = new SessionRepository()) {}

  async create(input: CreateSessionInput): Promise<Session> {
    if (!input.name.trim()) throw new ValidationError("Session name is required");
    return this.repository.create(input);
  }

  async getById(id: string): Promise<Session> {
    const item = await this.repository.getById(id);
    if (!item) throw new NotFoundError("Session not found");
    return item;
  }

  async list(): Promise<Session[]> {
    return this.repository.list();
  }

  async delete(id: string): Promise<void> {
    if (!(await this.repository.delete(id))) throw new NotFoundError("Session not found");
  }
}
