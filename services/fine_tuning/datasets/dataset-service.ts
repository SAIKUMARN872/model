import { randomUUID } from "node:crypto";
import type {
  CreateDatasetInput,
  FineTuningDataset
} from "../fine-tuning.types.js";
import { fineTuningConfig } from "../config/config.js";
import { DatasetRepository } from "./dataset-repository.js";
import {
  createDatasetRecord,
  validateDatasetInput
} from "./dataset-schema.js";

export class DatasetService {
  constructor(
    readonly repository = new DatasetRepository(),
    private readonly idFactory: () => string = randomUUID
  ) {}

  async create(input: CreateDatasetInput): Promise<FineTuningDataset> {
    const valid = validateDatasetInput(input);

    if (valid.records.length > fineTuningConfig.maxDatasetRecords) {
      throw new Error(
        `Dataset exceeds the maximum of ${fineTuningConfig.maxDatasetRecords} records.`
      );
    }

    return this.repository.create(
      createDatasetRecord(this.idFactory(), valid)
    );
  }

  async get(id: string): Promise<FineTuningDataset> {
    const dataset = await this.repository.getById(id);

    if (!dataset) throw new Error(`Dataset '${id}' not found.`);
    return dataset;
  }

  async list(): Promise<FineTuningDataset[]> {
    return this.repository.list();
  }

  async update(
    id: string,
    changes: Partial<Pick<FineTuningDataset, "name" | "description">>
  ): Promise<FineTuningDataset> {
    if (changes.name !== undefined && !changes.name.trim()) {
      throw new TypeError("Dataset name cannot be empty.");
    }

    return this.repository.update(id, {
      ...changes,
      ...(changes.name !== undefined ? { name: changes.name.trim() } : {})
    });
  }

  async delete(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }
}
