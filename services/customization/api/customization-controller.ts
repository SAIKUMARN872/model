import {
    CustomizationService
} from "../services/customization-service.js";
import type {
    CreateCustomizationInput
} from "../schemas/customization-schema.js";

export class CustomizationController {
    constructor(
        private readonly service = new CustomizationService()
    ) {}

    create(input: CreateCustomizationInput) {
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
        patch: { name?: string; enabled?: boolean }
    ) {
        return this.service.update(id, ownerId, patch);
    }

    delete(id: string, ownerId: string): void {
        this.service.delete(id, ownerId);
    }
}
