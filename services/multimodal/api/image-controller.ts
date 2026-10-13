import { ImageService } from "../image-service.js";
import type { ImageInput } from "../image-schema.js";

export class ImageController {
  constructor(private readonly service = new ImageService()) {}
  process(input: ImageInput) { return this.service.process(input); }
}
