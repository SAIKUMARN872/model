import type { Risk } from "./risk.js";

export function calculateRiskScore(risk: Pick<Risk, "likelihood" | "impact">): number {
    if (risk.likelihood < 1 || risk.likelihood > 5 || risk.impact < 1 || risk.impact > 5) {
        throw new Error("Likelihood and impact must be between 1 and 5");
    }
    return risk.likelihood * risk.impact * 4;
}

export function riskLevel(score: number): "low" | "medium" | "high" | "critical" {
    if (!Number.isFinite(score) || score < 0 || score > 100) throw new Error("Score must be between 0 and 100");
    if (score >= 80) return "critical";
    if (score >= 50) return "high";
    if (score >= 25) return "medium";
    return "low";
}
