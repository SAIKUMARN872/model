export interface GovernancePolicy {
  id: number;
  name: string;
  status: string;
}

export async function fetchPolicies(): Promise<GovernancePolicy[]> {
  return Promise.resolve([
    {
      id: 1,
      name: "AI Usage Policy",
      status: "Approved",
    },
    {
      id: 2,
      name: "Data Governance",
      status: "Pending",
    },
    {
      id: 3,
      name: "Privacy Policy",
      status: "Review",
    },
  ]);
}