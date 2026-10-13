export interface IntelligenceSettings {
    allowCreate: boolean;
    allowUpdate: boolean;
    allowDelete: boolean;
}

export const defaultIntelligenceSettings: IntelligenceSettings = {
    allowCreate: true,
    allowUpdate: true,
    allowDelete: true
};
