export type DataClassification = "public" | "internal" | "confidential" | "restricted";

export interface ClassifiedData {
    resourceId: string;
    classification: DataClassification;
    owner: string;
    tags: string[];
}

export function validateClassification(data: ClassifiedData): string[] {
    const errors: string[] = [];
    if (!data.resourceId.trim()) errors.push("resourceId is required");
    if (!data.owner.trim()) errors.push("owner is required");
    if (!["public", "internal", "confidential", "restricted"].includes(data.classification)) {
        errors.push("Invalid classification");
    }
    return errors;
}

export function canAccessClassification(
    actorClearance: DataClassification,
    dataClassification: DataClassification
): boolean {
    const rank: Record<DataClassification, number> = {
        public: 0, internal: 1, confidential: 2, restricted: 3
    };
    return rank[actorClearance] >= rank[dataClassification];
}
