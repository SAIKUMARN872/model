export interface IntegrationConfig {
    requestTimeoutMs: number;
    maxRetries: number;
    retryDelayMs: number;
    syncBatchSize: number;
    credentialEncryptionKey?: string;
}

export const defaultIntegrationConfig: IntegrationConfig = {
    requestTimeoutMs: 30_000,
    maxRetries: 3,
    retryDelayMs: 1_000,
    syncBatchSize: 100
};

export function validateIntegrationConfig(config: IntegrationConfig): string[] {
    const errors: string[] = [];

    if (!Number.isInteger(config.requestTimeoutMs) || config.requestTimeoutMs <= 0) {
        errors.push("requestTimeoutMs must be a positive integer");
    }
    if (!Number.isInteger(config.maxRetries) || config.maxRetries < 0) {
        errors.push("maxRetries must be a non-negative integer");
    }
    if (!Number.isInteger(config.retryDelayMs) || config.retryDelayMs < 0) {
        errors.push("retryDelayMs must be a non-negative integer");
    }
    if (!Number.isInteger(config.syncBatchSize) || config.syncBatchSize <= 0) {
        errors.push("syncBatchSize must be a positive integer");
    }

    return errors;
}
