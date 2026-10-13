export interface Customization {
    id: string;
    ownerId: string;
    name: string;
    enabled: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateCustomizationInput {
    ownerId: string;
    name: string;
    enabled?: boolean;
}

export function validateCreateCustomization(
    input: CreateCustomizationInput
): void {
    if (!input || typeof input !== "object") {
        throw new Error("Customization input is required");
    }

    if (typeof input.ownerId !== "string" || !input.ownerId.trim()) {
        throw new Error("ownerId is required");
    }

    if (typeof input.name !== "string" || !input.name.trim()) {
        throw new Error("name is required");
    }

    if (input.enabled !== undefined && typeof input.enabled !== "boolean") {
        throw new Error("enabled must be a boolean");
    }
}

export function validateCustomization(value: Customization): void {
    if (!value || typeof value !== "object") {
        throw new Error("Customization is required");
    }

    if (!value.id || !value.ownerId || !value.name) {
        throw new Error("Customization id, ownerId and name are required");
    }

    if (typeof value.enabled !== "boolean") {
        throw new Error("enabled must be a boolean");
    }

    if (
        !(value.createdAt instanceof Date) ||
        Number.isNaN(value.createdAt.getTime())
    ) {
        throw new Error("createdAt must be a valid Date");
    }

    if (
        !(value.updatedAt instanceof Date) ||
        Number.isNaN(value.updatedAt.getTime())
    ) {
        throw new Error("updatedAt must be a valid Date");
    }
}
