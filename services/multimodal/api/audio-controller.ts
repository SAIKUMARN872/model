import { AudioService } from "../audio-service.js";
import type { AudioInput } from "../audio-schema.js";

export class AudioController {
  constructor(private readonly service = new AudioService()) {}
  process(input: AudioInput) { return this.service.process(input); }
}
