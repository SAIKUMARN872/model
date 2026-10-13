export interface KnowledgeHubSettings {
    allowDocumentCreation: boolean;
    allowDocumentDeletion: boolean;
    allowSourceCreation: boolean;
}

export const defaultKnowledgeHubSettings: KnowledgeHubSettings = {
    allowDocumentCreation: true,
    allowDocumentDeletion: true,
    allowSourceCreation: true
};
