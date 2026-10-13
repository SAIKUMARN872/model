import type { ImageInput, ImageOutput } from "./image-schema.js";

export class ImageService {
  async process(input: ImageInput): Promise<ImageOutput> {
    if (!input.content) throw new Error("Image content is required");
    return { filename: input.filename, description: "[Mock image description]" };
  }
}
