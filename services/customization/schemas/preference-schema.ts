export type PreferenceValue = string | number | boolean | null;

export interface Preference {
    id: string;
    ownerId: string;
    key: string;
    value: PreferenceValue;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreatePreferenceInput {
    ownerId: string;
    key: string;
    value: PreferenceValue;
}

export function validateCreatePreference(input: CreatePreferenceInput): void {
    if (!input || typeof input !== "object") {
        throw new Error("Preference input is required");
    }

    if (typeof input.ownerId !== "string" || !input.ownerId.trim()) {
        throw new Error("ownerId is required");
    }

    if (typeof input.key !== "string" || !input.key.trim()) {
        throw new Error("key is required");
    }

    const validValue =
        input.value === null ||
        typeof input.value === "string" ||
        typeof input.value === "number" ||
        typeof input.value === "boolean";

    if (!validValue) {
        throw new Error("Preference value must be a string, number, boolean or null");
    }

    if (typeof input.value === "number" && !Number.isFinite(input.value)) {
        throw new Error("Numeric preference values must be finite");
    }
}
