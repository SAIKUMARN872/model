export interface KnowledgeHubConfig {
    maxDocuments: number;
    maxChunksPerDocument: number;
    chunkSize: number;
}

export const defaultKnowledgeHubConfig: KnowledgeHubConfig = {
    maxDocuments: 10000,
    maxChunksPerDocument: 1000,
    chunkSize: 1000
};

export function validateConfig(config: KnowledgeHubConfig): KnowledgeHubConfig {
    for (const [key, value] of Object.entries(config)) {
        if (!Number.isInteger(value) || value < 1) {
            throw new Error(`${key} must be a positive integer`);
        }
    }

    return { ...config };
}
