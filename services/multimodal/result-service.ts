import { ResultRepository } from "./repository/result-repository.js";
import type { ProcessingResult } from "./interfaces.js";
import type { ProcessingStatus } from "./constants.js";

export class ResultService {
  constructor(private readonly repository = new ResultRepository()) {}

  async create(input: {
    assetId: string;
    status: ProcessingStatus;
    output: unknown;
    error?: string;
  }): Promise<ProcessingResult> {
    return this.repository.create(input);
  }

  async getById(id: string): Promise<ProcessingResult | null> {
    return this.repository.getById(id);
  }

  async list(): Promise<ProcessingResult[]> {
    return this.repository.list();
  }
}


