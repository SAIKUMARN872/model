export interface IntelligenceConfig {
    serviceName: string;
    maxRecords: number;
}

export const defaultIntelligenceConfig: IntelligenceConfig = {
    serviceName: "intelligence",
    maxRecords: 10000
};

export function validateIntelligenceConfig(
    config: IntelligenceConfig
): IntelligenceConfig {
    if (!config.serviceName.trim()) {
        throw new Error("serviceName must not be empty");
    }

    if (!Number.isInteger(config.maxRecords) || config.maxRecords < 1) {
        throw new Error("maxRecords must be a positive integer");
    }

    return { ...config };
}
