import { DocumentService } from "../services/document-service.js";

export class DocumentController {
    constructor(private readonly service = new DocumentService()) {}
    create(input: Parameters<DocumentService["create"]>[0]) { return this.service.create(input); }
    getById(id: string) { return this.service.getById(id); }
    getAll() { return this.service.getAll(); }
    update(id: string, input: Parameters<DocumentService["update"]>[1]) { return this.service.update(id, input); }
    delete(id: string) { return this.service.delete(id); }
}
