export interface OrganizationMetrics {
  organizationId: string;
  requests: number;
  tokens: number;
  cost: number;
  activeUsers: number;
  updatedAt: string;
}

export function createOrganizationMetrics(
  organizationId: string,
): OrganizationMetrics {
  if (!organizationId.trim()) {
    throw new Error("Organization ID is required");
  }

  return {
    organizationId,
    requests: 0,
    tokens: 0,
    cost: 0,
    activeUsers: 0,
    updatedAt: new Date().toISOString(),
  };
}
