// services/analytics/database/models.ts

export type DatabaseRecordStatus =
  | "active"
  | "inactive"
  | "deleted";

export interface AnalyticsRecord {
  id: string;
  organizationId: string;
  eventType: string;
  status: DatabaseRecordStatus;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnalyticsRecordInput {
  organizationId: string;
  eventType: string;
  data?: Record<string, unknown>;
  status?: DatabaseRecordStatus;
}

export interface UpdateAnalyticsRecordInput {
  eventType?: string;
  status?: DatabaseRecordStatus;
  data?: Record<string, unknown>;
}

export interface RecordFilter {
  organizationId?: string;
  eventType?: string;
  status?: DatabaseRecordStatus;
  createdAfter?: string;
  createdBefore?: string;
}

export interface DatabaseStats {
  totalRecords: number;
  activeRecords: number;
  inactiveRecords: number;
  deletedRecords: number;
  organizations: number;
}

export interface DatabaseHealth {
  healthy: boolean;
  connected: boolean;
  totalRecords: number;
  organizations: number;
}

export function validateOrganizationId(
  organizationId: string,
): void {
  if (
    !organizationId ||
    organizationId.trim().length === 0
  ) {
    throw new Error(
      "Organization ID cannot be empty",
    );
  }
}

export function validateEventType(
  eventType: string,
): void {
  if (
    !eventType ||
    eventType.trim().length === 0
  ) {
    throw new Error(
      "Event type cannot be empty",
    );
  }
}

export function validateRecordStatus(
  status: DatabaseRecordStatus,
): void {
  const validStatuses: DatabaseRecordStatus[] = [
    "active",
    "inactive",
    "deleted",
  ];

  if (!validStatuses.includes(status)) {
    throw new Error(
      `Invalid record status: ${status}`,
    );
  }
}