export interface GovernanceAlert {
    id: string;
    severity: "info" | "warning" | "critical";
    message: string;
    resource: string;
    createdAt: string;
    acknowledgedAt?: string;
    acknowledgedBy?: string;
}

export class AlertManager {
    private readonly alerts = new Map<string, GovernanceAlert>();

    create(input: Omit<GovernanceAlert, "createdAt">): GovernanceAlert {
        if (this.alerts.has(input.id)) throw new Error("Alert already exists");
        const alert: GovernanceAlert = { ...input, createdAt: new Date().toISOString() };
        this.alerts.set(alert.id, structuredClone(alert));
        return structuredClone(alert);
    }

    acknowledge(id: string, actor: string): GovernanceAlert {
        const alert = this.alerts.get(id);
        if (!alert) throw new Error("Alert not found");
        alert.acknowledgedAt = new Date().toISOString();
        alert.acknowledgedBy = actor;
        return structuredClone(alert);
    }

    list(unacknowledgedOnly = false): GovernanceAlert[] {
        return [...this.alerts.values()]
            .filter((alert) => !unacknowledgedOnly || !alert.acknowledgedAt)
            .map((alert) => structuredClone(alert));
    }
}
