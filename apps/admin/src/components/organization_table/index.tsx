type Organization = {
  id: string;
  name: string;
  owner: string;
  members: number;
  workspaces: number;
  plan: "Enterprise" | "Business" | "Starter";
  status: "Active" | "Suspended" | "Pending";
  createdAt: string;
};

type OrganizationTableProps = {
  organizations?: Organization[];
};

const defaultOrganizations: Organization[] = [
  {
    id: "ORG-1001",
    name: "Acme Corporation",
    owner: "admin@acme.example",
    members: 842,
    workspaces: 24,
    plan: "Enterprise",
    status: "Active",
    createdAt: "January 12, 2025",
  },
  {
    id: "ORG-1002",
    name: "Northstar Technologies",
    owner: "admin@northstar.example",
    members: 624,
    workspaces: 18,
    plan: "Enterprise",
    status: "Active",
    createdAt: "February 8, 2025",
  },
  {
    id: "ORG-1003",
    name: "Vertex Labs",
    owner: "owner@vertex.example",
    members: 186,
    workspaces: 9,
    plan: "Business",
    status: "Active",
    createdAt: "March 21, 2025",
  },
  {
    id: "ORG-1004",
    name: "CloudWorks",
    owner: "admin@cloudworks.example",
    members: 94,
    workspaces: 6,
    plan: "Business",
    status: "Suspended",
    createdAt: "April 15, 2025",
  },
  {
    id: "ORG-1005",
    name: "Nova Research",
    owner: "owner@novaresearch.example",
    members: 28,
    workspaces: 3,
    plan: "Starter",
    status: "Pending",
    createdAt: "May 4, 2025",
  },
];

export default function OrganizationTable({
  organizations = defaultOrganizations,
}: OrganizationTableProps) {
  return (
    <section>
      <header>
        <h2>Organization Directory</h2>

        <p>
          Manage organizations, members, workspaces, subscription plans, and
          account status across the ModelNow platform.
        </p>
      </header>

      <div>
        <table>
          <caption>
            Registered organizations and platform access information
          </caption>

          <thead>
            <tr>
              <th scope="col">Organization ID</th>
              <th scope="col">Organization</th>
              <th scope="col">Owner</th>
              <th scope="col">Members</th>
              <th scope="col">Workspaces</th>
              <th scope="col">Plan</th>
              <th scope="col">Status</th>
              <th scope="col">Created</th>
            </tr>
          </thead>

          <tbody>
            {organizations.map((organization) => (
              <tr key={organization.id}>
                <td>{organization.id}</td>
                <td>{organization.name}</td>
                <td>{organization.owner}</td>
                <td>{organization.members}</td>
                <td>{organization.workspaces}</td>
                <td>{organization.plan}</td>
                <td>{organization.status}</td>
                <td>{organization.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {organizations.length === 0 && (
        <p>
          No organizations are currently available.
        </p>
      )}
    </section>
  );
}