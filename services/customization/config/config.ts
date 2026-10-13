export interface CustomizationConfig {
    maxInstructions: number;
    maxPreferences: number;
    allowCustomInstructions: boolean;
}

export function loadCustomizationConfig(
    overrides: Partial<CustomizationConfig> = {}
): CustomizationConfig {
    const config: CustomizationConfig = {
        maxInstructions: 100,
        maxPreferences: 100,
        allowCustomInstructions: true,
        ...overrides
    };

    if (!Number.isInteger(config.maxInstructions) || config.maxInstructions < 1) {
        throw new Error("maxInstructions must be a positive integer");
    }

    if (!Number.isInteger(config.maxPreferences) || config.maxPreferences < 1) {
        throw new Error("maxPreferences must be a positive integer");
    }

    return config;
}
