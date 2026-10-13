import type { FineTuningDataset } from "../fine-tuning.types.js";

function cloneDataset(dataset: FineTuningDataset): FineTuningDataset {
  return structuredClone(dataset);
}

export class DatasetRepository {
  private readonly datasets = new Map<string, FineTuningDataset>();

  async create(dataset: FineTuningDataset): Promise<FineTuningDataset> {
    if (this.datasets.has(dataset.id)) {
      throw new Error(`Dataset '${dataset.id}' already exists.`);
    }

    this.datasets.set(dataset.id, cloneDataset(dataset));
    return cloneDataset(dataset);
  }

  async getById(id: string): Promise<FineTuningDataset | undefined> {
    const dataset = this.datasets.get(id);
    return dataset ? cloneDataset(dataset) : undefined;
  }

  async list(): Promise<FineTuningDataset[]> {
    return [...this.datasets.values()]
      .map(cloneDataset)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async update(
    id: string,
    changes: Partial<Pick<FineTuningDataset, "name" | "description">>
  ): Promise<FineTuningDataset> {
    const existing = this.datasets.get(id);

    if (!existing) {
      throw new Error(`Dataset '${id}' not found.`);
    }

    const updated: FineTuningDataset = {
      ...existing,
      ...changes,
      id: existing.id,
      records: existing.records,
      format: existing.format,
      createdAt: existing.createdAt,
      updatedAt: new Date()
    };

    this.datasets.set(id, cloneDataset(updated));
    return cloneDataset(updated);
  }

  async delete(id: string): Promise<boolean> {
    return this.datasets.delete(id);
  }

  async count(): Promise<number> {
    return this.datasets.size;
  }

  async clear(): Promise<void> {
    this.datasets.clear();
  }
}
