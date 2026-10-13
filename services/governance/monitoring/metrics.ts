export interface GovernanceMetric {
    name: string;
    value: number;
    unit: string;
    recordedAt: string;
    dimensions?: Record<string, string>;
}

export class MetricsCollector {
    private readonly metrics: GovernanceMetric[] = [];

    record(input: Omit<GovernanceMetric, "recordedAt">): GovernanceMetric {
        if (!input.name.trim()) throw new Error("Metric name is required");
        if (!Number.isFinite(input.value)) throw new Error("Metric value must be finite");
        const metric: GovernanceMetric = { ...input, recordedAt: new Date().toISOString() };
        this.metrics.push(structuredClone(metric));
        return metric;
    }

    query(name?: string): GovernanceMetric[] {
        return this.metrics
            .filter((metric) => !name || metric.name === name)
            .map((metric) => structuredClone(metric));
    }
}
