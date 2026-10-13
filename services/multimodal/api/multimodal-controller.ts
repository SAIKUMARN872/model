import { MultimodalService } from "../services/multimodal-service.js";

export class MultimodalController {
  constructor(private readonly service = new MultimodalService()) {}

  health() {
    return this.service.health();
  }

  submit(input: Parameters<typeof this.service.processing.submit>[0]) {
    return this.service.processing.submit(input);
  }

  process(assetId: string) {
    return this.service.processing.process(assetId);
  }
}
