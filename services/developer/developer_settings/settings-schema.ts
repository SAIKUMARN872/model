export interface DeveloperSettings {
  id: string;
  ownerId: string;
  defaultProjectId?: string;
  notificationsEnabled: boolean;
  usageAlertsEnabled: boolean;
  monthlyLimit?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateDeveloperSettingsInput {
  defaultProjectId?: string;
  notificationsEnabled?: boolean;
  usageAlertsEnabled?: boolean;
  monthlyLimit?: number | null;
}

export function validateUpdateDeveloperSettingsInput(
  input: UpdateDeveloperSettingsInput,
): void {
  if (
    input.notificationsEnabled !== undefined &&
    typeof input.notificationsEnabled !== "boolean"
  ) {
    throw new Error("notificationsEnabled must be a boolean.");
  }

  if (
    input.usageAlertsEnabled !== undefined &&
    typeof input.usageAlertsEnabled !== "boolean"
  ) {
    throw new Error("usageAlertsEnabled must be a boolean.");
  }

  if (
    input.monthlyLimit !== undefined &&
    input.monthlyLimit !== null &&
    (!Number.isFinite(input.monthlyLimit) || input.monthlyLimit < 0)
  ) {
    throw new Error("monthlyLimit must be a non-negative number or null.");
  }
}
