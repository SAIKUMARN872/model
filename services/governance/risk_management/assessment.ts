import type { Risk } from "./risk.js";

export interface RiskAssessment {
    riskId: string;
    score: number;
    level: "low" | "medium" | "high" | "critical";
    assessedAt: string;
    rationale: string;
}

export function assessRisk(risk: Risk, rationale: string): RiskAssessment {
    const errors = (awaitlessValidateRisk)(risk);
    if (errors.length) throw new Error(errors.join("; "));
    const score = risk.likelihood * risk.impact * 4;
    const level = score >= 80 ? "critical" : score >= 50 ? "high" : score >= 25 ? "medium" : "low";
    return { riskId: risk.id, score, level, assessedAt: new Date().toISOString(), rationale };
}

import { validateRisk as awaitlessValidateRisk } from "./risk.js";
