import { randomUUID } from "node:crypto";
import type {
  ComplianceControl,
  ComplianceFramework,
  ComplianceMetric,
  CompliancePolicy,
  CompliancePolicyRule,
  ComplianceReport,
  ComplianceRisk,
  ComplianceViolation
} from "./interfaces.js";

export * from "./interfaces.js";

export class ComplianceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ComplianceError";
  }
}

export class ComplianceValidationError extends ComplianceError {
  constructor(message: string) {
    super(message);
    this.name = "ComplianceValidationError";
  }
}

const clone = <T>(value: T): T =>
  value === undefined
    ? value
    : JSON.parse(JSON.stringify(value));

const id = (): string => randomUUID();
const now = (): Date => new Date();

export class ControlRegistry {
  private readonly controls = new Map<string, ComplianceControl>();

  register(control: ComplianceControl): ComplianceControl {
    if (!control.id.trim()) {
      throw new ComplianceValidationError("control id is required");
    }

    if (!control.name.trim()) {
      throw new ComplianceValidationError("control name is required");
    }

    this.controls.set(control.id, clone(control));
    return clone(control);
  }

  get(id: string): ComplianceControl | undefined {
    return clone(this.controls.get(id));
  }

  has(id: string): boolean {
    return this.controls.has(id);
  }

  list(): ComplianceControl[] {
    return [...this.controls.values()].map(clone);
  }

  remove(id: string): boolean {
    return this.controls.delete(id);
  }

  clear(): void {
    this.controls.clear();
  }
}

export class ControlValidator {
  validate(control: ComplianceControl): true {
    if (!control.id?.trim()) {
      throw new ComplianceValidationError("control id is required");
    }

    if (!control.name?.trim()) {
      throw new ComplianceValidationError("control name is required");
    }

    if (!Array.isArray(control.frameworkIds)) {
      throw new ComplianceValidationError(
        "frameworkIds must be an array"
      );
    }

    if (!Array.isArray(control.requirements)) {
      throw new ComplianceValidationError(
        "requirements must be an array"
      );
    }

    return true;
  }
}

export class ControlManager {
  constructor(
    public readonly registry: ControlRegistry = new ControlRegistry(),
    public readonly validator: ControlValidator = new ControlValidator()
  ) {}

  create(
    input: Omit<ComplianceControl, "id"> & { id?: string }
  ): ComplianceControl {
    const control: ComplianceControl = {
      id: input.id ?? id(),
      name: input.name,
      description: input.description,
      frameworkIds: [...input.frameworkIds],
      category: input.category,
      severity: input.severity,
      enabled: input.enabled ?? true,
      requirements: [...input.requirements],
      metadata: clone(input.metadata ?? {})
    };

    this.validator.validate(control);
    return this.registry.register(control);
  }

  get(controlId: string): ComplianceControl | undefined {
    return this.registry.get(controlId);
  }

  list(): ComplianceControl[] {
    return this.registry.list();
  }

  update(
    controlId: string,
    patch: Partial<ComplianceControl>
  ): ComplianceControl {
    const current = this.registry.get(controlId);

    if (!current) {
      throw new ComplianceError(`Control ${controlId} not found`);
    }

    const updated: ComplianceControl = {
      ...current,
      ...clone(patch),
      id: current.id
    };

    this.validator.validate(updated);
    return this.registry.register(updated);
  }

  remove(controlId: string): boolean {
    return this.registry.remove(controlId);
  }
}

export interface ComplianceStandard {
  id: string;
  name: string;
  version: string;
  description: string;
  requirements: string[];
}

export class StandardsRegistry {
  private readonly standards = new Map<string, ComplianceStandard>();

  register(standard: ComplianceStandard): ComplianceStandard {
    this.standards.set(standard.id, clone(standard));
    return clone(standard);
  }

  get(id: string): ComplianceStandard | undefined {
    return clone(this.standards.get(id));
  }

  list(): ComplianceStandard[] {
    return [...this.standards.values()].map(clone);
  }
}

export class FrameworkRegistry {
  private readonly frameworks = new Map<string, ComplianceFramework>();

  register(framework: ComplianceFramework): ComplianceFramework {
    if (!framework.id.trim()) {
      throw new ComplianceValidationError(
        "framework id is required"
      );
    }

    this.frameworks.set(framework.id, clone(framework));
    return clone(framework);
  }

  get(id: string): ComplianceFramework | undefined {
    return clone(this.frameworks.get(id));
  }

  list(): ComplianceFramework[] {
    return [...this.frameworks.values()].map(clone);
  }

  remove(id: string): boolean {
    return this.frameworks.delete(id);
  }
}

export class FrameworkManager {
  constructor(
    public readonly registry: FrameworkRegistry = new FrameworkRegistry(),
    public readonly controls: ControlManager = new ControlManager(),
    public readonly standards: StandardsRegistry = new StandardsRegistry()
  ) {}

  create(
    input: Omit<ComplianceFramework, "id"> & { id?: string }
  ): ComplianceFramework {
    return this.registry.register({
      id: input.id ?? id(),
      name: input.name,
      version: input.version,
      description: input.description,
      controls: [...input.controls],
      standards: [...input.standards],
      enabled: input.enabled ?? true
    });
  }

  addControl(
    frameworkId: string,
    controlId: string
  ): ComplianceFramework {
    const framework = this.registry.get(frameworkId);

    if (!framework) {
      throw new ComplianceError(
        `Framework ${frameworkId} not found`
      );
    }

    if (!this.controls.registry.has(controlId)) {
      throw new ComplianceError(
        `Control ${controlId} not found`
      );
    }

    if (!framework.controls.includes(controlId)) {
      framework.controls.push(controlId);
    }

    return this.registry.register(framework);
  }

  get(id: string): ComplianceFramework | undefined {
    return this.registry.get(id);
  }

  list(): ComplianceFramework[] {
    return this.registry.list();
  }
}

export class PolicyValidator {
  validate(policy: CompliancePolicy): true {
    if (!policy.id?.trim()) {
      throw new ComplianceValidationError("policy id is required");
    }

    if (!policy.name?.trim()) {
      throw new ComplianceValidationError("policy name is required");
    }

    if (!Array.isArray(policy.rules)) {
      throw new ComplianceValidationError(
        "policy rules must be an array"
      );
    }

    return true;
  }
}

export class PolicyRegistry {
  private readonly policies = new Map<string, CompliancePolicy>();

  register(policy: CompliancePolicy): CompliancePolicy {
    this.policies.set(policy.id, clone(policy));
    return clone(policy);
  }

  get(id: string): CompliancePolicy | undefined {
    return clone(this.policies.get(id));
  }

  list(): CompliancePolicy[] {
    return [...this.policies.values()].map(clone);
  }

  remove(id: string): boolean {
    return this.policies.delete(id);
  }
}

export class PolicyManager {
  constructor(
    public readonly registry: PolicyRegistry = new PolicyRegistry(),
    public readonly validator: PolicyValidator = new PolicyValidator()
  ) {}

  create(
    input: Omit<CompliancePolicy, "id"> & { id?: string }
  ): CompliancePolicy {
    const policy: CompliancePolicy = {
      id: input.id ?? id(),
      name: input.name,
      description: input.description,
      enabled: input.enabled ?? true,
      rules: clone(input.rules),
      metadata: clone(input.metadata ?? {})
    };

    this.validator.validate(policy);
    return this.registry.register(policy);
  }

  get(id: string): CompliancePolicy | undefined {
    return this.registry.get(id);
  }

  list(): CompliancePolicy[] {
    return this.registry.list();
  }
}

export class PolicyEngine {
  evaluate(
    policy: CompliancePolicy,
    context: Record<string, unknown>
  ): {
    allowed: boolean;
    violations: CompliancePolicyRule[];
  } {
    const violations: CompliancePolicyRule[] = [];

    if (!policy.enabled) {
      return {
        allowed: true,
        violations
      };
    }

    for (const rule of policy.rules) {
      const actual = context[rule.field];
      let matched = false;

      switch (rule.operator) {
        case "equals":
          matched = actual === rule.value;
          break;
        case "not_equals":
          matched = actual !== rule.value;
          break;
        case "contains":
          matched =
            typeof actual === "string"
              ? actual.includes(String(rule.value))
              : Array.isArray(actual)
                ? actual.includes(rule.value)
                : false;
          break;
        case "not_contains":
          matched =
            typeof actual === "string"
              ? !actual.includes(String(rule.value))
              : Array.isArray(actual)
                ? !actual.includes(rule.value)
                : true;
          break;
        case "greater_than":
          matched =
            typeof actual === "number" &&
            typeof rule.value === "number" &&
            actual > rule.value;
          break;
        case "less_than":
          matched =
            typeof actual === "number" &&
            typeof rule.value === "number" &&
            actual < rule.value;
          break;
        case "exists":
          matched =
            rule.value === true
              ? actual !== undefined && actual !== null
              : actual === undefined || actual === null;
          break;
      }

      if (matched && rule.action !== "allow") {
        violations.push(rule);
      }
    }

    return {
      allowed: violations.every(
        (rule) => rule.action !== "deny"
      ),
      violations
    };
  }
}

export class ViolationDetector {
  detect(
    subjectId: string,
    controls: ComplianceControl[],
    context: Record<string, unknown>
  ): ComplianceViolation[];
  detect(
    controls: ComplianceControl[],
    policies: CompliancePolicy[],
    context: Record<string, unknown>
  ): ComplianceViolation[];
  detect(
    arg1: string | ComplianceControl[],
    arg2?: ComplianceControl[] | CompliancePolicy[] | Record<string, unknown>,
    arg3?: Record<string, unknown>
  ): ComplianceViolation[] {
    let subjectId = "system";
    let controls: ComplianceControl[] = [];
    let policies: CompliancePolicy[] = [];
    let context: Record<string, unknown> = {};

    if (typeof arg1 === "string") {
      subjectId = arg1;
      controls = (Array.isArray(arg2) ? arg2 : []) as ComplianceControl[];
      context = (arg3 ?? (!Array.isArray(arg2) && typeof arg2 === "object" ? arg2 : {})) as Record<string, unknown>;
    } else if (Array.isArray(arg1)) {
      controls = arg1;
      if (Array.isArray(arg2)) {
        policies = arg2 as CompliancePolicy[];
        context = arg3 ?? {};
      } else if (typeof arg2 === "object" && arg2 !== null) {
        context = arg2 as Record<string, unknown>;
      }
    }

    const violations: ComplianceViolation[] = [];

    for (const control of controls) {
      if (control.enabled === false) {
        continue;
      }

      const reqs = control.requirements ?? [];
      for (const requirement of reqs) {
        if (context[requirement] === false) {
          violations.push({
            id: id(),
            controlId: control.id,
            subjectId,
            description: `Requirement failed: ${requirement}`,
            severity: control.severity ?? "high",
            status: "open",
            detectedAt: now(),
            metadata: {}
          });
        }
      }
    }

    for (const pol of policies) {
      if (pol.enabled === false) {
        continue;
      }

      for (const rule of pol.rules ?? []) {
        const actual = context[rule.field];
        let matched = false;

        switch (rule.operator) {
          case "equals":
            matched = actual === rule.value;
            break;
          case "not_equals":
            matched = actual !== rule.value;
            break;
          case "contains":
            matched =
              typeof actual === "string"
                ? actual.includes(String(rule.value))
                : Array.isArray(actual)
                  ? actual.includes(rule.value)
                  : false;
            break;
          case "not_contains":
            matched =
              typeof actual === "string"
                ? !actual.includes(String(rule.value))
                : Array.isArray(actual)
                  ? !actual.includes(rule.value)
                  : true;
            break;
          case "greater_than":
            matched =
              typeof actual === "number" &&
              typeof rule.value === "number" &&
              actual > rule.value;
            break;
          case "less_than":
            matched =
              typeof actual === "number" &&
              typeof rule.value === "number" &&
              actual < rule.value;
            break;
          case "exists":
            matched =
              rule.value === true
                ? actual !== undefined && actual !== null
                : actual === undefined || actual === null;
            break;
          default:
            matched = actual === rule.value;
            break;
        }

        const isViolation =
          (rule.action === "allow" && !matched) ||
          (rule.action === "deny" && matched) ||
          (rule.action === "flag" && matched) ||
          (!rule.action && !matched);

        if (isViolation) {
          violations.push({
            id: id(),
            policyId: pol.id,
            subjectId,
            description: `Policy violation: ${rule.id || rule.field}`,
            severity: "high",
            status: "open",
            detectedAt: now(),
            metadata: {}
          });
        }
      }
    }

    return violations;
  }
}

export class ComplianceMetrics {
  private readonly metrics = new Map<string, ComplianceMetric>();

  record(name: string, value: number): ComplianceMetric {
    const metric: ComplianceMetric = {
      name,
      value,
      timestamp: now()
    };

    this.metrics.set(name, metric);
    return clone(metric);
  }

  increment(name: string, amount = 1): ComplianceMetric {
    const current = this.metrics.get(name)?.value ?? 0;
    return this.record(name, current + amount);
  }

  get(name: string): ComplianceMetric | undefined {
    return clone(this.metrics.get(name));
  }

  list(): ComplianceMetric[] {
    return [...this.metrics.values()].map(clone);
  }
}

export class ComplianceMonitor {
  private readonly violations = new Map<
    string,
    ComplianceViolation
  >();

  constructor(
    public readonly detector: ViolationDetector = new ViolationDetector(),
    public readonly metrics: ComplianceMetrics = new ComplianceMetrics()
  ) {}

  scan(
    subjectId: string,
    controls: ComplianceControl[],
    context: Record<string, unknown>
  ): ComplianceViolation[] {
    const detected = this.detector.detect(
      subjectId,
      controls,
      context
    );

    for (const violation of detected) {
      this.violations.set(
        violation.id,
        clone(violation)
      );
    }

    this.metrics.record(
      "compliance.violations",
      this.violations.size
    );

    return detected.map(clone);
  }

  listViolations(): ComplianceViolation[] {
    return [...this.violations.values()].map(clone);
  }

  resolve(violationId: string): ComplianceViolation {
    const violation = this.violations.get(violationId);

    if (!violation) {
      throw new ComplianceError(
        `Violation ${violationId} not found`
      );
    }

    violation.status = "resolved";
    violation.resolvedAt = now();

    this.violations.set(
      violationId,
      violation
    );

    return clone(violation);
  }
}

export class RiskScoring {
  score(likelihood: number, impact: number): number {
    const normalizedLikelihood = Math.max(
      0,
      Math.min(5, likelihood)
    );

    const normalizedImpact = Math.max(
      0,
      Math.min(5, impact)
    );

    return normalizedLikelihood * normalizedImpact;
  }

  level(
    score: number
  ): ComplianceRisk["level"] {
    if (score >= 20) {
      return "critical";
    }

    if (score >= 12) {
      return "high";
    }

    if (score >= 6) {
      return "medium";
    }

    return "low";
  }
}

export class RiskAssessment {
  constructor(
    public readonly scoring: RiskScoring = new RiskScoring()
  ) {}

  assess(input: {
    subjectId: string;
    description: string;
    likelihood: number;
    impact: number;
    mitigations?: string[];
  }): ComplianceRisk {
    const score = this.scoring.score(
      input.likelihood,
      input.impact
    );

    const timestamp = now();

    return {
      id: id(),
      subjectId: input.subjectId,
      description: input.description,
      likelihood: input.likelihood,
      impact: input.impact,
      score,
      level: this.scoring.level(score),
      mitigations: [
        ...(input.mitigations ?? [])
      ],
      createdAt: timestamp,
      updatedAt: timestamp
    };
  }
}

export class RiskEngine {
  private readonly risks = new Map<string, ComplianceRisk>();

  constructor(
    public readonly assessment: RiskAssessment = new RiskAssessment()
  ) {}

  assess(input: {
    subjectId: string;
    description: string;
    likelihood: number;
    impact: number;
    mitigations?: string[];
  }): ComplianceRisk {
    const risk = this.assessment.assess(input);
    this.risks.set(risk.id, clone(risk));
    return clone(risk);
  }

  get(id: string): ComplianceRisk | undefined {
    return clone(this.risks.get(id));
  }

  list(): ComplianceRisk[] {
    return [...this.risks.values()].map(clone);
  }

  remove(id: string): boolean {
    return this.risks.delete(id);
  }
}

export class ComplianceReportGenerator {
  constructor(
    private readonly controls: ControlManager = new ControlManager(),
    private readonly violations: ComplianceMonitor =
      new ComplianceMonitor(),
    private readonly risks: RiskEngine = new RiskEngine()
  ) {}

  generate(
    name: string,
    frameworkId?: string
  ): ComplianceReport {
    const allControls = this.controls.list();

    const controls = frameworkId
      ? allControls.filter((control) =>
          control.frameworkIds.includes(frameworkId)
        )
      : allControls;

    const findings = this.violations.listViolations();
    const risks = this.risks.list();

    const violations = findings.filter(
      (finding) => finding.status === "open"
    ).length;

    const compliant = Math.max(
      controls.length - violations,
      0
    );

    const score =
      controls.length === 0
        ? 100
        : Math.round(
            (compliant / controls.length) * 100
          );

    return {
      id: id(),
      name,
      frameworkId,
      generatedAt: now(),
      controls: controls.length,
      compliant,
      violations,
      risks: risks.length,
      score,
      findings: clone(findings),
      metadata: {}
    };
  }
}

export class ComplianceReportExporter {
  toJson(report: ComplianceReport): string {
    return JSON.stringify(report, null, 2);
  }

  toCsv(report: ComplianceReport): string {
    const rows = [
      [
        "id",
        "name",
        "controls",
        "compliant",
        "violations",
        "risks",
        "score"
      ],
      [
        report.id,
        report.name,
        String(report.controls),
        String(report.compliant),
        String(report.violations),
        String(report.risks),
        String(report.score)
      ]
    ];

    return rows
      .map((row) =>
        row
          .map((value) =>
            `"${String(value).replaceAll('"', '""')}"`
          )
          .join(",")
      )
      .join("\n");
  }
}

export class ComplianceReportService {
  constructor(
    public readonly generator: ComplianceReportGenerator =
      new ComplianceReportGenerator()
  ) {}

  generate(
    name: string,
    frameworkId?: string
  ): ComplianceReport {
    return this.generator.generate(
      name,
      frameworkId
    );
  }
}

export const controlRegistry =
  new ControlRegistry();

export const controlValidator =
  new ControlValidator();

export const controlManager =
  new ControlManager(
    controlRegistry,
    controlValidator
  );

export const frameworkRegistry =
  new FrameworkRegistry();

export const standardsRegistry =
  new StandardsRegistry();

export const frameworkManager =
  new FrameworkManager(
    frameworkRegistry,
    controlManager,
    standardsRegistry
  );

export const policyRegistry =
  new PolicyRegistry();

export const policyValidator =
  new PolicyValidator();

export const policyManager =
  new PolicyManager(
    policyRegistry,
    policyValidator
  );

export const policyEngine =
  new PolicyEngine();

export const violationDetector =
  new ViolationDetector();

export const complianceMetrics =
  new ComplianceMetrics();

export const complianceMonitor =
  new ComplianceMonitor(
    violationDetector,
    complianceMetrics
  );

export const riskScoring =
  new RiskScoring();

export const riskAssessment =
  new RiskAssessment(
    riskScoring
  );

export const riskEngine =
  new RiskEngine(
    riskAssessment
  );

export const complianceReportGenerator =
  new ComplianceReportGenerator(
    controlManager,
    complianceMonitor,
    riskEngine
  );

export const complianceReportExporter =
  new ComplianceReportExporter();

export const complianceReportService =
  new ComplianceReportService(
    complianceReportGenerator
  );

export const complianceService = {
  controls: controlManager,
  frameworks: frameworkManager,
  policies: policyManager,
  policyEngine,
  monitoring: complianceMonitor,
  risks: riskEngine,
  reports: complianceReportService
};
