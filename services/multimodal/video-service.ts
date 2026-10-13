import type { VideoInput, VideoOutput } from "./video-schema.js";

export class VideoService {
  async process(input: VideoInput): Promise<VideoOutput> {
    if (!input.content) throw new Error("Video content is required");
    return { filename: input.filename, summary: "[Mock video summary]" };
  }
}
