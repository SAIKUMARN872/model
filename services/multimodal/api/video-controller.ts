import { VideoService } from "../video-service.js";
import type { VideoInput } from "../video-schema.js";

export class VideoController {
  constructor(private readonly service = new VideoService()) {}
  process(input: VideoInput) { return this.service.process(input); }
}
