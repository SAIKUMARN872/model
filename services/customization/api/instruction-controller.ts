import { InstructionService } from "../services/instruction-service.js";
import type { CreateInstructionInput } from "../schemas/instruction-schema.js";

export class InstructionController {
    constructor(
        private readonly service = new InstructionService()
    ) {}

    create(input: CreateInstructionInput) {
        return this.service.create(input);
    }

    get(id: string, ownerId: string) {
        return this.service.get(id, ownerId);
    }

    list(ownerId: string) {
        return this.service.list(ownerId);
    }

    update(
        id: string,
        ownerId: string,
        patch: { content?: string; enabled?: boolean }
    ) {
        return this.service.update(id, ownerId, patch);
    }

    delete(id: string, ownerId: string): void {
        this.service.delete(id, ownerId);
    }
}
