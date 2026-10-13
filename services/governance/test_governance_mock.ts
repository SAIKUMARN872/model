import test from "node:test";
import assert from "node:assert/strict";

import {
    validateAccess,
    createApproval,
    ApprovalManager,
    ApprovalWorkflow,
    createAuditEvent,
    AuditHistory,
    AuditLogger,
    validateControl,
    buildComplianceReport,
    defaultGovernanceSettings,
    validateGovernanceSettings,
    validateClassification,
    canAccessClassification,
    validateDataPolicy,
    DataLineage,
    validateGovernedModel,
    ModelRegistry,
    ModelApprovalService,
    AlertManager,
    MetricsCollector,
    validatePolicy,
    PolicyManager,
    policyTemplates,
    createReport,
    exportReport,
    validateReview,
    createReviewFeedback,
    validateRisk,
    assessRisk,
    calculateRiskScore,
    riskLevel,
    validateRule,
    RuleEngine,
    validateRules,
    createWorkflow,
    canTransition,
    transitionWorkflow,
    WorkflowExecutor
} from "./index.js";

test("access control allows governance administrators", () => {
    assert.equal(
        validateAccess({
            role: "governance_admin",
            resource: "models",
            action: "delete"
        }).allowed,
        true
    );
});

test("access control denies unknown roles", () => {
    assert.equal(
        validateAccess({
            role: "unknown",
            resource: "models",
            action: "read"
        }).allowed,
        false
    );
});

test("viewer cannot delete resources", () => {
    assert.equal(
        validateAccess({
            role: "viewer",
            resource: "policies",
            action: "delete"
        }).allowed,
        false
    );
});

test("approval creation requires a subject and approvers", () => {
    assert.throws(
        () => createApproval({
            id: "a1",
            subject: " ",
            requestedBy: "alice",
            approvers: ["bob"]
        }),
        /subject/
    );

    assert.throws(
        () => createApproval({
            id: "a2",
            subject: "Policy change",
            requestedBy: "alice",
            approvers: []
        }),
        /approver/
    );
});

test("approval manager rejects duplicate approval IDs", () => {
    const manager = new ApprovalManager();
    const approval = createApproval({
        id: "a3",
        subject: "Policy update",
        requestedBy: "alice",
        approvers: ["bob"]
    });

    manager.create(approval);
    assert.throws(() => manager.create(approval), /already exists/);
});

test("approval completes when every approver approves", () => {
    const manager = new ApprovalManager();
    const workflow = new ApprovalWorkflow(manager);

    workflow.submit(createApproval({
        id: "a4",
        subject: "Model release",
        requestedBy: "alice",
        approvers: ["bob", "carol"]
    }));

    assert.equal(workflow.approve("a4", "bob").status, "pending");
    assert.equal(workflow.approve("a4", "carol").status, "approved");
});

test("approval rejects unauthorized approvers", () => {
    const manager = new ApprovalManager();

    manager.create(createApproval({
        id: "a5",
        subject: "Data policy",
        requestedBy: "alice",
        approvers: ["bob"]
    }));

    assert.throws(
        () => manager.decide("a5", "mallory", "approved"),
        /not an approver/
    );
});

test("approval cannot be changed after rejection", () => {
    const manager = new ApprovalManager();

    manager.create(createApproval({
        id: "a6",
        subject: "Review",
        requestedBy: "alice",
        approvers: ["bob"]
    }));

    manager.decide("a6", "bob", "rejected");
    assert.throws(
        () => manager.decide("a6", "bob", "approved"),
        /not pending/
    );
});

test("audit event validates actor and resource", () => {
    assert.throws(() => createAuditEvent({
        id: "e1",
        type: "custom",
        actor: "",
        resource: "policy/1",
        details: {}
    }), /actor/);

    assert.throws(() => createAuditEvent({
        id: "e2",
        type: "custom",
        actor: "alice",
        resource: "",
        details: {}
    }), /resource/);
});

test("audit history filters by actor and type", () => {
    const history = new AuditHistory();

    history.append(createAuditEvent({
        id: "e3",
        type: "policy.changed",
        actor: "alice",
        resource: "policy/1",
        details: {}
    }));

    history.append(createAuditEvent({
        id: "e4",
        type: "access.denied",
        actor: "bob",
        resource: "model/1",
        details: {}
    }));

    assert.equal(history.list({ actor: "alice" }).length, 1);
    assert.equal(history.list({ type: "access.denied" }).length, 1);
    assert.equal(history.list({ actor: "nobody" }).length, 0);
});

test("audit logger writes events to history", () => {
    const history = new AuditHistory();
    const logger = new AuditLogger(history, () => "event-1");

    logger.log({
        type: "custom",
        actor: "alice",
        resource: "test",
        details: { source: "mock-test" }
    });

    assert.equal(history.list().length, 1);
    assert.equal(history.list()[0]?.id, "event-1");
});

test("compliance controls require evidence when enabled", () => {
    assert.ok(validateControl({
        id: "c1",
        name: "Access control",
        description: "Review permissions",
        requiredEvidence: [],
        enabled: true
    }).some((error) => error.includes("evidence")));
});

test("compliance report counts enabled controls", () => {
    const report = buildComplianceReport("CUSTOM", [
        {
            id: "c1",
            name: "Access",
            description: "Check access",
            requiredEvidence: ["audit log"],
            enabled: true
        },
        {
            id: "c2",
            name: "Retention",
            description: "Check retention",
            requiredEvidence: [],
            enabled: false
        }
    ]);

    assert.equal(report.totalControls, 2);
    assert.equal(report.enabledControls, 1);
});

test("default governance settings are valid", () => {
    assert.deepEqual(
        validateGovernanceSettings(defaultGovernanceSettings),
        []
    );
});

test("invalid governance risk threshold is rejected", () => {
    assert.ok(validateGovernanceSettings({
        ...defaultGovernanceSettings,
        riskThreshold: 101
    }).some((error) => error.includes("riskThreshold")));
});

test("invalid audit retention period is rejected", () => {
    assert.ok(validateGovernanceSettings({
        ...defaultGovernanceSettings,
        auditRetentionDays: 0
    }).some((error) => error.includes("auditRetentionDays")));
});

test("data classification validates required fields", () => {
    assert.ok(validateClassification({
        resourceId: "",
        classification: "public",
        owner: "",
        tags: []
    }).length >= 2);
});

test("classification clearance enforces sensitivity order", () => {
    assert.equal(canAccessClassification("restricted", "confidential"), true);
    assert.equal(canAccessClassification("internal", "restricted"), false);
    assert.equal(canAccessClassification("public", "public"), true);
});

test("data policy rejects invalid retention periods", () => {
    assert.ok(validateDataPolicy({
        id: "dp1",
        name: "Retention policy",
        allowedClassifications: ["internal"],
        retentionDays: 0,
        encryptionRequired: true,
        purpose: "Protect data"
    }).some((error) => error.includes("retentionDays")));
});

test("data lineage traces parent resources", () => {
    const lineage = new DataLineage();

    lineage.record({
        resourceId: "source",
        parents: [],
        operation: "ingest",
        actor: "alice"
    });

    lineage.record({
        resourceId: "derived",
        parents: ["source"],
        operation: "transform",
        actor: "alice"
    });

    assert.deepEqual(lineage.traceAncestors("derived"), ["source"]);
});

test("data lineage rejects self-parenting", () => {
    const lineage = new DataLineage();

    assert.throws(() => lineage.record({
        resourceId: "same",
        parents: ["same"],
        operation: "transform",
        actor: "alice"
    }), /own parent/);
});

test("data lineage detects indirect cycles", () => {
    const lineage = new DataLineage();

    lineage.record({
        resourceId: "first",
        parents: ["second"],
        operation: "transform",
        actor: "alice"
    });

    lineage.record({
        resourceId: "second",
        parents: ["first"],
        operation: "transform",
        actor: "alice"
    });

    assert.throws(() => lineage.traceAncestors("first"), /Cycle detected/);
});

test("model validation detects missing fields", () => {
    assert.ok(validateGovernedModel({
        id: "",
        name: "",
        version: "",
        owner: "",
        riskLevel: "low",
        status: "registered",
        metadata: {},
        createdAt: "",
        updatedAt: ""
    }).length >= 4);
});

test("model registry rejects duplicate models", () => {
    const registry = new ModelRegistry();

    const model = {
        id: "m1",
        name: "Test model",
        version: "1.0",
        owner: "alice",
        riskLevel: "low" as const,
        status: "registered" as const,
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    registry.register(model);
    assert.throws(() => registry.register(model), /already registered/);
});

test("model approval requires review first", () => {
    const registry = new ModelRegistry();

    registry.register({
        id: "m2",
        name: "Test model",
        version: "1.0",
        owner: "alice",
        riskLevel: "medium",
        status: "registered",
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });

    const approval = new ModelApprovalService(registry);

    assert.throws(() => approval.approve("m2"), /under review/);
    approval.requestReview("m2");
    assert.equal(approval.approve("m2").status, "approved");
});

test("alert manager acknowledges alerts", () => {
    const alerts = new AlertManager();

    alerts.create({
        id: "alert1",
        severity: "warning",
        message: "Risk threshold exceeded",
        resource: "model/1"
    });

    alerts.acknowledge("alert1", "alice");

    assert.equal(alerts.list(true).length, 0);
    assert.equal(alerts.list()[0]?.acknowledgedBy, "alice");
});

test("alert manager throws for missing alerts", () => {
    const alerts = new AlertManager();
    assert.throws(() => alerts.acknowledge("missing", "alice"), /not found/);
});

test("metrics collector records and queries metrics", () => {
    const metrics = new MetricsCollector();

    metrics.record({ name: "latency", value: 15, unit: "ms" });
    metrics.record({ name: "requests", value: 10, unit: "count" });

    assert.equal(metrics.query().length, 2);
    assert.equal(metrics.query("latency").length, 1);
});

test("metrics collector rejects non-finite values", () => {
    const metrics = new MetricsCollector();

    assert.throws(
        () => metrics.record({ name: "latency", value: Number.NaN, unit: "ms" }),
        /finite/
    );
});

test("policy validation rejects invalid versions", () => {
    assert.ok(validatePolicy({
        id: "p1",
        name: "Access policy",
        description: "Access rules",
        version: 0,
        status: "draft",
        rules: {},
        createdBy: "alice",
        updatedAt: new Date().toISOString()
    }).some((error) => error.includes("version")));
});

test("policy manager creates, reads, and updates policies", () => {
    const manager = new PolicyManager();

    manager.create({
        id: "p2",
        name: "Access policy",
        description: "Access rules",
        version: 1,
        status: "draft",
        rules: {},
        createdBy: "alice",
        updatedAt: new Date().toISOString()
    });

    const updated = manager.update("p2", { status: "active" });

    assert.equal(updated.status, "active");
    assert.equal(updated.version, 2);
    assert.equal(manager.get("p2")?.status, "active");
});

test("policy manager rejects updates for missing policies", () => {
    const manager = new PolicyManager();
    assert.throws(() => manager.update("missing", { status: "active" }), /not found/);
});

test("policy templates are available", () => {
    assert.ok(policyTemplates.length >= 1);
    assert.ok(policyTemplates.every((policy) => policy.id.startsWith("template-")));
});

test("JSON report exports valid JSON", () => {
    const report = createReport({
        id: "r1",
        title: "Governance report",
        format: "json",
        sections: [{ heading: "Summary", content: { passed: true } }]
    });

    const parsed: unknown = JSON.parse(exportReport(report));
    assert.ok(parsed);
});

test("Markdown report includes section headings", () => {
    const report = createReport({
        id: "r2",
        title: "Governance report",
        format: "markdown",
        sections: [{ heading: "Summary", content: "All checks passed" }]
    });

    assert.match(exportReport(report), /## Summary/);
    assert.match(exportReport(report), /All checks passed/);
});

test("CSV report escapes quotes and commas", () => {
    const report = createReport({
        id: "r3",
        title: "Governance report",
        format: "csv",
        sections: [{ heading: "Summary", content: 'value, with "quotes"' }]
    });

    const output = exportReport(report);
    assert.match(output, /report_id,title,generated_at,section,content/);
    assert.match(output, /""quotes""/);
});

test("report creation requires a title", () => {
    assert.throws(() => createReport({
        id: "r4",
        title: " ",
        format: "json",
        sections: []
    }), /title/);
});

test("review validation checks rating range", () => {
    assert.ok(validateReview({
        id: "rev1",
        subjectType: "model",
        subjectId: "m1",
        reviewer: "alice",
        rating: 6,
        comments: "Needs work",
        createdAt: new Date().toISOString()
    }).some((error) => error.includes("Rating")));
});

test("review feedback creates a timestamped record", () => {
    const feedback = createReviewFeedback({
        reviewId: "rev1",
        submittedBy: "bob",
        helpful: true
    }, "2026-01-01T00:00:00.000Z");

    assert.equal(feedback.submittedAt, "2026-01-01T00:00:00.000Z");
});

test("review feedback requires submitter", () => {
    assert.throws(() => createReviewFeedback({
        reviewId: "rev1",
        submittedBy: "",
        helpful: false
    }), /submittedBy/);
});

test("risk validation checks likelihood and impact", () => {
    assert.ok(validateRisk({
        id: "risk1",
        title: "Data leak",
        description: "Sensitive data exposure",
        likelihood: 6,
        impact: 3,
        status: "identified",
        owner: "alice"
    }).length > 0);
});

test("risk assessment calculates score and level", () => {
    const assessment = assessRisk({
        id: "risk2",
        title: "Service outage",
        description: "Service unavailable",
        likelihood: 5,
        impact: 5,
        status: "identified",
        owner: "alice"
    }, "High impact and likely");

    assert.equal(assessment.score, 100);
    assert.equal(assessment.level, "critical");
});

test("risk scoring calculates expected values", () => {
    assert.equal(calculateRiskScore({ likelihood: 3, impact: 4 }), 48);
    assert.equal(riskLevel(48), "medium");
    assert.equal(riskLevel(85), "critical");
    assert.equal(riskLevel(10), "low");
});

test("risk scoring rejects out-of-range values", () => {
    assert.throws(() => calculateRiskScore({ likelihood: 6, impact: 3 }), /between 1 and 5/);
    assert.throws(() => riskLevel(101), /between 0 and 100/);
});

test("rule validation checks required fields", () => {
    assert.ok(validateRule({
        id: "",
        description: "",
        enabled: true,
        severity: "error",
        predicate: ""
    }).length >= 3);
});

test("rule engine evaluates enabled rules", () => {
    const engine = new RuleEngine();

    engine.register({
        id: "rule1",
        description: "Access must be approved",
        enabled: true,
        severity: "error",
        predicate: "accessApproved"
    });

    engine.register({
        id: "rule2",
        description: "Disabled check",
        enabled: false,
        severity: "warning",
        predicate: "otherCheck"
    });

    const results = engine.evaluate({ accessApproved: true, otherCheck: false });

    assert.equal(results.length, 1);
    assert.equal(results[0]?.passed, true);
});

test("rule engine rejects duplicate rule IDs", () => {
    const engine = new RuleEngine();

    const rule = {
        id: "rule1",
        description: "Check",
        enabled: true,
        severity: "warning" as const,
        predicate: "passed"
    };

    engine.register(rule);
    assert.throws(() => engine.register(rule), /already registered/);
});

test("rule validator detects duplicate IDs", () => {
    const rule = {
        id: "duplicate",
        description: "Check",
        enabled: true,
        severity: "warning" as const,
        predicate: "passed"
    };

    assert.ok(validateRules([rule, rule]).some((error) => error.includes("Duplicate")));
});

test("workflow creation requires at least one step", () => {
    assert.throws(() => createWorkflow("wf1", "Review", [], "alice"), /at least one step/);
});

test("workflow transition table enforces allowed transitions", () => {
    assert.equal(canTransition("pending", "running"), true);
    assert.equal(canTransition("running", "completed"), true);
    assert.equal(canTransition("completed", "running"), false);
    assert.equal(canTransition("cancelled", "running"), false);
});

test("workflow transition updates state and actor", () => {
    const workflow = createWorkflow("wf2", "Review", ["check", "approve"], "alice");
    const running = transitionWorkflow(workflow.state, "running", "bob");

    assert.equal(running.state, "running");
    assert.equal(running.changedBy, "bob");
});

test("workflow executor stores and transitions workflows", () => {
    const executor = new WorkflowExecutor();

    executor.register(createWorkflow("wf3", "Audit", ["inspect"], "alice"));

    assert.equal(executor.transition("wf3", "running", "bob").state.state, "running");
    assert.equal(executor.get("wf3")?.state.state, "running");
});

test("workflow executor rejects missing workflow IDs", () => {
    const executor = new WorkflowExecutor();
    assert.throws(() => executor.transition("missing", "running", "alice"), /not found/);
});
