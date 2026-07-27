type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: string;
  status: "Active" | "Suspended" | "Pending";
  lastActive: string;
};

type UserTableProps = {
  users?: User[];
};

const defaultUsers: User[] = [
  {
    id: "USR-1001",
    name: "Alex Morgan",
    email: "alex.morgan@example.com",
    role: "Super Administrator",
    organization: "Acme Corporation",
    status: "Active",
    lastActive: "2 minutes ago",
  },
  {
    id: "USR-1002",
    name: "Jordan Lee",
    email: "jordan.lee@example.com",
    role: "Organization Administrator",
    organization: "Northstar Technologies",
    status: "Active",
    lastActive: "15 minutes ago",
  },
  {
    id: "USR-1003",
    name: "Taylor Smith",
    email: "taylor.smith@example.com",
    role: "Workspace Administrator",
    organization: "Vertex Labs",
    status: "Active",
    lastActive: "32 minutes ago",
  },
  {
    id: "USR-1004",
    name: "Morgan Davis",
    email: "morgan.davis@example.com",
    role: "Security Auditor",
    organization: "CloudWorks",
    status: "Pending",
    lastActive: "1 hour ago",
  },
  {
    id: "USR-1005",
    name: "Casey Wilson",
    email: "casey.wilson@example.com",
    role: "Member",
    organization: "Nova Research",
    status: "Suspended",
    lastActive: "2 days ago",
  },
];

export default function UserTable({
  users = defaultUsers,
}: UserTableProps) {
  return (
    <section>
      <header>
        <h2>User Directory</h2>

        <p>
          Manage users, roles, organizations, account status, and recent
          authentication activity across the ModelNow platform.
        </p>
      </header>

      <div>
        <table>
          <caption>
            Registered users and access information
          </caption>

          <thead>
            <tr>
              <th scope="col">User ID</th>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Role</th>
              <th scope="col">Organization</th>
              <th scope="col">Status</th>
              <th scope="col">Last Active</th>
            </tr>
          </thead>

          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.organization}</td>
                  <td>{user.status}</td>
                  <td>{user.lastActive}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7}>
                  No users are currently available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}