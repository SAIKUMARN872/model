export interface ComplianceControl {
  id: string;
  name: string;
  description: string;
  frameworkIds: string[];
  category: string;
  severity: "low" | "medium" | "high" | "critical";
  enabled: boolean;
  requirements: string[];
  metadata: Record<string, unknown>;
}

export interface ComplianceFramework {
  id: string;
  name: string;
  version: string;
  description: string;
  controls: string[];
  standards: string[];
  enabled: boolean;
}

export interface CompliancePolicy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rules: CompliancePolicyRule[];
  metadata: Record<string, unknown>;
}

export interface CompliancePolicyRule {
  id: string;
  field: string;
  operator:
    | "equals"
    | "not_equals"
    | "contains"
    | "not_contains"
    | "greater_than"
    | "less_than"
    | "exists";
  value?: unknown;
  action: "allow" | "deny" | "flag";
}

export interface ComplianceViolation {
  id: string;
  controlId?: string;
  policyId?: string;
  frameworkId?: string;
  subjectId: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "resolved" | "ignored";
  detectedAt: Date;
  resolvedAt?: Date;
  metadata: Record<string, unknown>;
}

export interface ComplianceMetric {
  name: string;
  value: number;
  timestamp: Date;
}

export interface ComplianceRisk {
  id: string;
  subjectId: string;
  description: string;
  likelihood: number;
  impact: number;
  score: number;
  level: "low" | "medium" | "high" | "critical";
  mitigations: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ComplianceReport {
  id: string;
  name: string;
  frameworkId?: string;
  generatedAt: Date;
  controls: number;
  compliant: number;
  violations: number;
  risks: number;
  score: number;
  findings: ComplianceViolation[];
  metadata: Record<string, unknown>;
}
