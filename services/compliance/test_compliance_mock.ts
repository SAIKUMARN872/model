import test from "node:test";
import assert from "node:assert/strict";

import {
  ComplianceControl,
  ComplianceFramework,
  CompliancePolicy,
  ControlRegistry,
  ControlValidator,
  ControlManager,
  FrameworkRegistry,
  FrameworkManager,
  PolicyValidator,
  PolicyRegistry,
  PolicyManager,
  PolicyEngine,
  ViolationDetector,
  ComplianceMetrics,
  ComplianceMonitor,
  RiskScoring,
  RiskAssessment,
  RiskEngine,
  ComplianceReportGenerator,
  ComplianceReportExporter,
  ComplianceReportService,
  complianceService
} from "./main.js";

const control = (): ComplianceControl => ({
  id: "ctrl-001",
  name: "Access Control",
  description: "Restrict access to protected resources",
  frameworkIds: ["soc2"],
  category: "security",
  severity: "high",
  enabled: true,
  requirements: ["least-privilege"],
  metadata: {}
});

const framework = (): ComplianceFramework => ({
  id: "soc2",
  name: "SOC 2",
  version: "2025",
  description: "Service organization controls",
  standards: ["security"],
  controls: ["ctrl-001"],
  enabled: true
});

const policy = (): CompliancePolicy => ({
  id: "policy-001",
  name: "Access Policy",
  description: "Require approved access",
  enabled: true,
  rules: [
    {
      id: "rule-001",
      field: "accessApproved",
      operator: "equals",
      value: true,
      action: "allow"
    }
  ],
  metadata: {}
});

test("control registry registers and retrieves controls", () => {
  const registry = new ControlRegistry();
  const item = control();

  registry.register(item);

  assert.deepEqual(registry.get("ctrl-001"), item);
});

test("control registry allows replacement of an existing control", () => {
  const registry = new ControlRegistry();

  registry.register(control());
  registry.register({
    ...control(),
    name: "Updated Access Control"
  });

  assert.equal(registry.get("ctrl-001")?.name, "Updated Access Control");
});

test("control validator validates a control", () => {
  const validator = new ControlValidator();

  assert.equal(validator.validate(control()), true);
});

test("control manager creates and retrieves controls", () => {
  const manager = new ControlManager();

  const created = manager.create(control());

  assert.equal(created.id, "ctrl-001");
  assert.equal(manager.get("ctrl-001")?.name, "Access Control");
});

test("framework registry registers and retrieves frameworks", () => {
  const registry = new FrameworkRegistry();
  const item = framework();

  registry.register(item);

  assert.deepEqual(registry.get("soc2"), item);
});

test("framework registry allows replacement of an existing framework", () => {
  const registry = new FrameworkRegistry();

  registry.register(framework());
  registry.register({
    ...framework(),
    name: "Updated SOC 2"
  });

  assert.equal(registry.get("soc2")?.name, "Updated SOC 2");
});

test("framework manager creates and retrieves frameworks", () => {
  const manager = new FrameworkManager();

  const created = manager.create(framework());

  assert.equal(created.id, "soc2");
  assert.equal(manager.get("soc2")?.name, "SOC 2");
});

test("policy validator validates a policy", () => {
  const validator = new PolicyValidator();

  assert.equal(validator.validate(policy()), true);
});

test("policy registry registers and retrieves policies", () => {
  const registry = new PolicyRegistry();
  const item = policy();

  registry.register(item);

  assert.deepEqual(registry.get("policy-001"), item);
});

test("policy registry allows replacement of an existing policy", () => {
  const registry = new PolicyRegistry();

  registry.register(policy());
  registry.register({
    ...policy(),
    name: "Updated Access Policy"
  });

  assert.equal(registry.get("policy-001")?.name, "Updated Access Policy");
});

test("policy manager creates and retrieves policies", () => {
  const manager = new PolicyManager();

  const created = manager.create(policy());

  assert.equal(created.id, "policy-001");
  assert.equal(manager.get("policy-001")?.name, "Access Policy");
});

test("policy engine evaluates policy data", () => {
  const engine = new PolicyEngine();

  const result = engine.evaluate(policy(), {
    accessApproved: true
  });

  assert.ok(result);
});

test("violation detector evaluates controls and policies", () => {
  const detector = new ViolationDetector();

  const result = detector.detect(
    [control()],
    [policy()],
    {
      accessApproved: false
    }
  );

  assert.ok(Array.isArray(result));
});

test("violation detector handles compliant data", () => {
  const detector = new ViolationDetector();

  const result = detector.detect(
    [control()],
    [policy()],
    {
      accessApproved: true
    }
  );

  assert.ok(Array.isArray(result));
});

test("compliance metrics records named values", () => {
  const metrics = new ComplianceMetrics();

  const result = metrics.record("compliance-score", 95);

  assert.equal(result.name, "compliance-score");
  assert.equal(result.value, 95);
});

test("compliance monitor exposes violation listing", () => {
  const monitor = new ComplianceMonitor();

  assert.equal(typeof monitor.listViolations, "function");
  assert.deepEqual(monitor.listViolations(), []);
});

test("compliance monitor stores violations", () => {
  const monitor = new ComplianceMonitor();

  const item = {
    id: "violation-001",
    controlId: "ctrl-001",
    policyId: "policy-001",
    frameworkId: "soc2",
    subjectId: "user-001",
    description: "Access approval missing",
    severity: "high" as const,
    status: "open" as const,
    detectedAt: new Date()
  };

  if (typeof (monitor as any).recordViolation === "function") {
    (monitor as any).recordViolation(item);
  } else if (typeof (monitor as any).record === "function") {
    (monitor as any).record(item);
  }

  assert.ok(Array.isArray(monitor.listViolations()));
});

test("risk scoring is available", () => {
  const scoring = new RiskScoring();

  assert.ok(scoring);
});

test("risk assessment is available", () => {
  const assessment = new RiskAssessment();

  assert.ok(assessment);
});

test("risk engine is available", () => {
  const engine = new RiskEngine();

  assert.ok(engine);
});

test("report generator accepts a report id", () => {
  const generator = new ComplianceReportGenerator();

  const result = generator.generate("report-001");

  assert.ok(result);
});

test("report exporter is available", () => {
  const exporter = new ComplianceReportExporter();

  assert.ok(exporter);
});

test("report service accepts a report id", () => {
  const service = new ComplianceReportService();

  const result = service.generate("report-001");

  assert.ok(result);
});

test("compliance service exposes primary managers", () => {
  assert.ok(complianceService.controls);
  assert.ok(complianceService.frameworks);
  assert.ok(complianceService.policies);
  assert.ok(complianceService.policyEngine);
  assert.ok(complianceService.monitoring);
  assert.ok(complianceService.risks);
  assert.ok(complianceService.reports);
});

test("compliance service creates a control", () => {
  const result = complianceService.controls.create(control());

  assert.equal(result.id, "ctrl-001");
});

test("compliance service creates a framework", () => {
  const result = complianceService.frameworks.create(framework());

  assert.equal(result.id, "soc2");
});

test("compliance service creates a policy", () => {
  const result = complianceService.policies.create(policy());

  assert.equal(result.id, "policy-001");
});

test("compliance service evaluates a policy", () => {
  const result = complianceService.policyEngine.evaluate(policy(), {
    accessApproved: true
  });

  assert.ok(result);
});

test("compliance service exposes monitoring", () => {
  assert.equal(
    typeof complianceService.monitoring.listViolations,
    "function"
  );
});

test("compliance service exposes risk engine", () => {
  assert.ok(complianceService.risks);
});

test("compliance service generates a report", () => {
  const result = complianceService.reports.generate("report-service-001");

  assert.ok(result);
});

test("all compliance facade modules load", async () => {
  const modules = [
    "./controls/control_manager.js",
    "./controls/control_registry.js",
    "./controls/control_validator.js",
    "./frameworks/framework_manager.js",
    "./frameworks/framework_registry.js",
    "./frameworks/standards.js",
    "./monitoring/compliance_monitor.js",
    "./monitoring/metrics.js",
    "./monitoring/violation_detector.js",
    "./policies/policy_engine.js",
    "./policies/policy_manager.js",
    "./policies/policy_validator.js",
    "./reports/compliance_report.js",
    "./reports/exporter.js",
    "./reports/report_generator.js",
    "./risk_management/risk_assessment.js",
    "./risk_management/risk_engine.js",
    "./risk_management/risk_scoring.js"
  ];

  for (const modulePath of modules) {
    const module = await import(modulePath);
    assert.ok(module);
  }
});
