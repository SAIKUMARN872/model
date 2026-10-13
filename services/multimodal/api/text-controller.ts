import { TextService } from "../text-service.js";
import type { TextInput } from "../text-schema.js";

export class TextController {
  constructor(private readonly service = new TextService()) {}
  process(input: TextInput) { return this.service.process(input); }
}
