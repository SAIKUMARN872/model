export interface Risk {
    id: string;
    title: string;
    description: string;
    likelihood: number;
    impact: number;
    status: "identified" | "mitigating" | "accepted" | "closed";
    owner: string;
}

export function validateRisk(risk: Risk): string[] {
    const errors: string[] = [];
    if (!risk.id.trim()) errors.push("Risk id is required");
    if (!risk.title.trim()) errors.push("Risk title is required");
    if (!risk.owner.trim()) errors.push("Risk owner is required");
    if (!Number.isFinite(risk.likelihood) || risk.likelihood < 1 || risk.likelihood > 5) {
        errors.push("Likelihood must be between 1 and 5");
    }
    if (!Number.isFinite(risk.impact) || risk.impact < 1 || risk.impact > 5) {
        errors.push("Impact must be between 1 and 5");
    }
    return errors;
}
