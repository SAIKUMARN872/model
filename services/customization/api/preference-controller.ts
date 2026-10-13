import { PreferenceService } from "../services/preference-service.js";
import type {
    CreatePreferenceInput,
    PreferenceValue
} from "../schemas/preference-schema.js";

export class PreferenceController {
    constructor(
        private readonly service = new PreferenceService()
    ) {}

    create(input: CreatePreferenceInput) {
        return this.service.create(input);
    }

    get(id: string, ownerId: string) {
        return this.service.get(id, ownerId);
    }

    getByKey(ownerId: string, key: string) {
        return this.service.getByKey(ownerId, key);
    }

    list(ownerId: string) {
        return this.service.list(ownerId);
    }

    update(id: string, ownerId: string, value: PreferenceValue) {
        return this.service.update(id, ownerId, value);
    }

    delete(id: string, ownerId: string): void {
        this.service.delete(id, ownerId);
    }
}
