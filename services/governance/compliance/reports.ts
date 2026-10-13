import type { ComplianceControl } from "./controls.js";

export interface ComplianceReport {
    framework: string;
    generatedAt: string;
    totalControls: number;
    enabledControls: number;
    errors: Array<{ controlId: string; errors: string[] }>;
}

export function buildComplianceReport(
    framework: string,
    controls: readonly ComplianceControl[]
): ComplianceReport {
    return {
        framework,
        generatedAt: new Date().toISOString(),
        totalControls: controls.length,
        enabledControls: controls.filter((control) => control.enabled).length,
        errors: controls
            .map((control) => ({ controlId: control.id, errors: [] as string[] }))
            .filter((entry) => entry.errors.length > 0)
    };
}
