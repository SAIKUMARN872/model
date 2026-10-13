import { DocumentService } from "../document-service.js";
import type { DocumentInput } from "../document-schema.js";

export class DocumentController {
  constructor(private readonly service = new DocumentService()) {}
  process(input: DocumentInput) { return this.service.process(input); }
}
