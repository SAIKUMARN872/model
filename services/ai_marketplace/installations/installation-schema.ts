export type InstallationStatus =
  | "pending"
  | "active"
  | "suspended"
  | "uninstalled";

export interface Installation {
  id: string;
  listingId: string;
  developerId: string;
  tenantId: string;
  installedBy: string;
  version: string;
  status: InstallationStatus;
  configuration: Record<string, unknown>;
  installedAt: Date;
  updatedAt: Date;
  uninstalledAt?: Date;
}

export interface CreateInstallationInput {
  listingId: string;
  developerId: string;
  tenantId: string;
  installedBy: string;
  version?: string;
  configuration?: Record<string, unknown>;
}

export interface UpdateInstallationInput {
  version?: string;
  configuration?: Record<string, unknown>;
  status?: InstallationStatus;
}

export interface InstallationListOptions {
  tenantId?: string;
  listingId?: string;
  developerId?: string;
  status?: InstallationStatus;
}
