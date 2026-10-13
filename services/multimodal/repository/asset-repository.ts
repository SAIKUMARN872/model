import type { CreateAssetInput, MediaAsset } from "../interfaces.js";
import { createId } from "../utils.js";

export class AssetRepository {
  private records = new Map<string, MediaAsset>();

  async create(input: CreateAssetInput): Promise<MediaAsset> {
    const record: MediaAsset = {
      id: createId("asset"),
      ...input,
      status: "pending",
      createdAt: new Date(),
    };
    this.records.set(record.id, record);
    return { ...record };
  }

  async getById(id: string): Promise<MediaAsset | null> {
    const item = this.records.get(id);
    return item ? { ...item } : null;
  }

  async list(): Promise<MediaAsset[]> {
    return [...this.records.values()].map((item) => ({ ...item }));
  }

  async delete(id: string): Promise<boolean> {
    return this.records.delete(id);
  }
}
