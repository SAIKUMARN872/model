import type {
    CreateIntelligenceInput,
    UpdateIntelligenceInput
} from "../intelligence.types.js";
import { IntelligenceService } from "../services/intelligence-service.js";

export class IntelligenceController {
    constructor(
        private readonly service: IntelligenceService =
            new IntelligenceService()
    ) {}

    async create(body: CreateIntelligenceInput) {
        return this.service.create(body);
    }

    async getById(id: string) {
        return this.service.getById(id);
    }

    async getAll() {
        return this.service.getAll();
    }

    async update(id: string, body: UpdateIntelligenceInput) {
        return this.service.update(id, body);
    }

    async delete(id: string) {
        return this.service.delete(id);
    }
}
