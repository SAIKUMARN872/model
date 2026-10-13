import { NotFoundError, ValidationError } from "./exceptions.js";
import { AssetRepository } from "./repository/asset-repository.js";
import { ResultRepository } from "./repository/result-repository.js";
import type { CreateAssetInput, MediaAsset, ProcessingResult } from "./interfaces.js";

export class ProcessingService {
  constructor(
    private readonly assets = new AssetRepository(),
    private readonly results = new ResultRepository(),
  ) {}

  async submit(input: CreateAssetInput): Promise<MediaAsset> {
    if (!input.sessionId.trim()) throw new ValidationError("sessionId is required");
    if (!input.filename.trim()) throw new ValidationError("filename is required");
    if (!input.content) throw new ValidationError("content is required");
    return this.assets.create(input);
  }

  async getAsset(id: string): Promise<MediaAsset> {
    const asset = await this.assets.getById(id);
    if (!asset) throw new NotFoundError("Asset not found");
    return asset;
  }

  async process(id: string): Promise<ProcessingResult> {
    const asset = await this.getAsset(id);
    return this.results.create({
      assetId: asset.id,
      status: "completed",
      output: {
        type: asset.type,
        filename: asset.filename,
        message: "Mock processing completed",
      },
    });
  }

  async listAssets(): Promise<MediaAsset[]> {
    return this.assets.list();
  }
}
