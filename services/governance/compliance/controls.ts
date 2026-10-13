export interface ComplianceControl {
    id: string;
    name: string;
    description: string;
    requiredEvidence: string[];
    enabled: boolean;
}

export function validateControl(control: ComplianceControl): string[] {
    const errors: string[] = [];
    if (!control.id.trim()) errors.push("Control id is required");
    if (!control.name.trim()) errors.push("Control name is required");
    if (!control.description.trim()) errors.push("Control description is required");
    if (control.enabled && control.requiredEvidence.length === 0) {
        errors.push("Enabled controls must define required evidence");
    }
    return errors;
}
