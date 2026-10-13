import type { AudioInput, AudioOutput } from "./audio-schema.js";

export class AudioService {
  async process(input: AudioInput): Promise<AudioOutput> {
    if (!input.content) throw new Error("Audio content is required");
    return { filename: input.filename, transcript: "[Mock transcript]" };
  }
}
