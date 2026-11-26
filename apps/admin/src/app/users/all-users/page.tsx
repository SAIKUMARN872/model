// ModelNow Admin Users page
"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  Search,
  UserPlus,
  Users,
  Download,
  Eye,
  Ban,
  CheckCircle2,
  Clock3,
  X,
  RefreshCw,
  Filter,
} from "lucide-react";

type UserStatus = "Active" | "Suspended" | "Pending";

type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: string;
  status: UserStatus;
  lastActive: string;
  joined: string;
};

const initialUsers: UserRecord[] = [
  {
    id: "USR-1001",
    name: "Alex Morgan",
    email: "alex.morgan@example.com",
    role: "Super Administrator",
    organization: "Acme Corporation",
    status: "Active",
    lastActive: "2 minutes ago",
    joined: "Jan 12, 2026",
  },
  {
    id: "USR-1002",
    name: "Jordan Lee",
    email: "jordan.lee@example.com",
    role: "Organization Administrator",
    organization: "Northstar Technologies",
    status: "Active",
    lastActive: "15 minutes ago",
    joined: "Feb 04, 2026",
  },
  {
    id: "USR-1003",
    name: "Taylor Smith",
    email: "taylor.smith@example.com",
    role: "Workspace Administrator",
    organization: "Vertex Labs",
    status: "Active",
    lastActive: "32 minutes ago",
    joined: "Mar 18, 2026",
  },
  {
    id: "USR-1004",
    name: "Morgan Davis",
    email: "morgan.davis@example.com",
    role: "Security Auditor",
    organization: "CloudWorks",
    status: "Pending",
    lastActive: "Never",
    joined: "Nov 02, 2026",
  },
  {
    id: "USR-1005",
    name: "Casey Wilson",
    email: "casey.wilson@example.com",
    role: "Member",
    organization: "Nova Research",
    status: "Suspended",
    lastActive: "2 days ago",
    joined: "Aug 21, 2026",
  },
  {
    id: "USR-1006",
    name: "Riley Johnson",
    email: "riley.johnson@example.com",
    role: "Member",
    organization: "Acme Corporation",
    status: "Active",
    lastActive: "1 hour ago",
    joined: "Sep 05, 2026",
  },
  {
    id: "USR-1007",
    name: "Avery Brown",
    email: "avery.brown@example.com",
    role: "Security Auditor",
    organization: "Northstar Technologies",
    status: "Pending",
    lastActive: "Never",
    joined: "Oct 28, 2026",
  },
];

const roles = [
  "Super Administrator",
  "Organization Administrator",
  "Workspace Administrator",
  "Security Auditor",
  "Member",
];

const organizations = [
  "Acme Corporation",
  "Northstar Technologies",
  "Vertex Labs",
  "CloudWorks",
  "Nova Research",
];

export default function AllUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [organizationFilter, setOrganizationFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [notice, setNotice] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "Member",
    organization: "Acme Corporation",
  });

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !term ||
        user.id.toLowerCase().includes(term) ||
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.organization.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "All" || user.status === statusFilter;
      const matchesRole = roleFilter === "All" || user.role === roleFilter;
      const matchesOrganization =
        organizationFilter === "All" ||
        user.organization === organizationFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesRole &&
        matchesOrganization
      );
    });
  }, [users, search, statusFilter, roleFilter, organizationFilter]);

  const activeCount = users.filter((user) => user.status === "Active").length;
  const pendingCount = users.filter((user) => user.status === "Pending").length;
  const suspendedCount = users.filter(
    (user) => user.status === "Suspended"
  ).length;

  function handleAddUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = form.email.trim().toLowerCase();

    if (
      users.some((user) => user.email.toLowerCase() === normalizedEmail)
    ) {
      setNotice("A user with this email address already exists.");
      return;
    }

    const newUser: UserRecord = {
      id: `USR-${Date.now().toString().slice(-6)}`,
      name: form.name.trim(),
      email: normalizedEmail,
      role: form.role,
      organization: form.organization,
      status: "Pending",
      lastActive: "Never",
      joined: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
    };

    setUsers((current) => [newUser, ...current]);
    setShowAddModal(false);
    setForm({
      name: "",
      email: "",
      role: "Member",
      organization: "Acme Corporation",
    });
    setNotice("User added successfully. Verification is pending.");
  }

  function toggleUserStatus(user: UserRecord) {
    const nextStatus: UserStatus =
      user.status === "Active" ? "Suspended" : "Active";

    setUsers((current) =>
      current.map((item) =>
        item.id === user.id ? { ...item, status: nextStatus } : item
      )
    );

    if (selectedUser?.id === user.id) {
      setSelectedUser({ ...user, status: nextStatus });
    }

    setNotice(`${user.name} is now ${nextStatus.toLowerCase()}.`);
  }

  function exportUsers() {
    const headers = [
      "User ID",
      "Name",
      "Email",
      "Role",
      "Organization",
      "Status",
      "Last Active",
      "Joined",
    ];

    const rows = filteredUsers.map((user) => [
      user.id,
      user.name,
      user.email,
      user.role,
      user.organization,
      user.status,
      user.lastActive,
      user.joined,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "modelnow-users.csv";
    anchor.click();

    URL.revokeObjectURL(url);
    setNotice("User list exported.");
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("All");
    setRoleFilter("All");
    setOrganizationFilter("All");
  }

  return (
    <main className="all-users-page">
      <div className="page-header">
        <div>
          <div className="breadcrumbs">
            Administration <span>/</span> Users <span>/</span> All Users
          </div>
          <h1>All Users</h1>
          <p className="subtitle">
            View, search, filter, and manage every user on the ModelNow
            platform.
          </p>
        </div>

        <div className="header-actions">
          <button className="button secondary" onClick={exportUsers}>
            <Download size={16} />
            Export CSV
          </button>
          <button
            className="button primary"
            onClick={() => {
              setNotice("");
              setShowAddModal(true);
            }}
          >
            <UserPlus size={16} />
            Add User
          </button>
        </div>
      </div>

      {notice && (
        <div className="notice" role="status">
          <span>{notice}</span>
          <button
            className="icon-button"
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
          >
            <X size={16} />
          </button>
        </div>
      )}

      <section className="metrics-grid">
        <MetricCard
          icon={<Users size={19} />}
          label="Total Users"
          value={users.length}
          detail="All registered accounts"
          color="blue"
        />
        <MetricCard
          icon={<CheckCircle2 size={19} />}
          label="Active Users"
          value={activeCount}
          detail="Accounts enabled"
          color="green"
        />
        <MetricCard
          icon={<Clock3 size={19} />}
          label="Pending Verification"
          value={pendingCount}
          detail="Awaiting verification"
          color="orange"
        />
        <MetricCard
          icon={<Ban size={19} />}
          label="Suspended Users"
          value={suspendedCount}
          detail="Access currently restricted"
          color="red"
        />
      </section>

      <section className="users-panel">
        <div className="panel-heading">
          <div>
            <h2>User directory</h2>
            <p>
              Showing {filteredUsers.length} of {users.length} users
            </p>
          </div>
          <button
            className={`button secondary filter-toggle ${
              showFilters ? "selected" : ""
            }`}
            onClick={() => setShowFilters((value) => !value)}
          >
            <Filter size={16} />
            Filters
          </button>
        </div>

        <div className="toolbar">
          <div className="search-box">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, user ID, or organization..."
              aria-label="Search users"
            />
            {search && (
              <button
                className="icon-button"
                aria-label="Clear search"
                onClick={() => setSearch("")}
              >
                <X size={15} />
              </button>
            )}
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter by status"
          >
            <option value="All">All statuses</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>

        {showFilters && (
          <div className="advanced-filters">
            <label>
              Role
              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
              >
                <option value="All">All roles</option>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Organization
              <select
                value={organizationFilter}
                onChange={(event) =>
                  setOrganizationFilter(event.target.value)
                }
              >
                <option value="All">All organizations</option>
                {organizations.map((organization) => (
                  <option key={organization} value={organization}>
                    {organization}
                  </option>
                ))}
              </select>
            </label>

            <button className="button text-button" onClick={clearFilters}>
              <RefreshCw size={15} />
              Reset filters
            </button>
          </div>
        )}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>
                  <span className="th-label">User</span>
                </th>
                <th>Role</th>
                <th>Organization</th>
                <th>Status</th>
                <th>Last active</th>
                <th className="actions-heading">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-cell">
                      <div className="avatar">
                        {user.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="user-info">
                        <strong>{user.name}</strong>
                        <span>{user.email}</span>
                        <small>{user.id}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="role-text">{user.role}</span>
                  </td>
                  <td>{user.organization}</td>
                  <td>
                    <span className={`status status-${user.status.toLowerCase()}`}>
                      <span className="status-dot" />
                      {user.status}
                    </span>
                  </td>
                  <td className="last-active">{user.lastActive}</td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="icon-button"
                        title="View user details"
                        aria-label={`View ${user.name}`}
                        onClick={() => setSelectedUser(user)}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className={`icon-button ${
                          user.status === "Active" ? "danger-icon" : "success-icon"
                        }`}
                        title={
                          user.status === "Active"
                            ? "Suspend user"
                            : "Activate user"
                        }
                        aria-label={
                          user.status === "Active"
                            ? `Suspend ${user.name}`
                            : `Activate ${user.name}`
                        }
                        onClick={() => toggleUserStatus(user)}
                        disabled={user.status === "Pending"}
                      >
                        {user.status === "Active" ? (
                          <Ban size={16} />
                        ) : (
                          <CheckCircle2 size={16} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <Search size={27} />
                      <strong>No users found</strong>
                      <span>Try changing your search or filters.</span>
                      <button className="button secondary" onClick={clearFilters}>
                        Clear filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>
            {filteredUsers.length} {filteredUsers.length === 1 ? "user" : "users"}{" "}
            displayed
          </span>
          <span>ModelNow Admin · User Directory</span>
        </div>
      </section>

      {showAddModal && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowAddModal(false);
            }
          }}
        >
          <section className="modal" role="dialog" aria-modal="true">
            <div className="modal-heading">
              <div>
                <h2>Add user</h2>
                <p>Create a user account for an organization.</p>
              </div>
              <button
                className="icon-button"
                aria-label="Close"
                onClick={() => setShowAddModal(false)}
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleAddUser}>
              <label>
                Full name
                <input
                  required
                  minLength={2}
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="Enter full name"
                />
              </label>

              <label>
                Email address
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm({ ...form, email: event.target.value })
                  }
                  placeholder="name@company.com"
                />
              </label>

              <label>
                Role
                <select
                  value={form.role}
                  onChange={(event) =>
                    setForm({ ...form, role: event.target.value })
                  }
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Organization
                <select
                  value={form.organization}
                  onChange={(event) =>
                    setForm({ ...form, organization: event.target.value })
                  }
                >
                  {organizations.map((organization) => (
                    <option key={organization} value={organization}>
                      {organization}
                    </option>
                  ))}
                </select>
              </label>

              <div className="modal-note">
                New users are added with Pending status in this demo. Connect
                your backend to send invitations and persist changes.
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="button primary">
                  <UserPlus size={16} />
                  Create user
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {selectedUser && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedUser(null);
            }
          }}
        >
          <section className="modal details-modal" role="dialog" aria-modal="true">
            <div className="modal-heading">
              <div>
                <h2>User details</h2>
                <p>Account information and current access status.</p>
              </div>
              <button
                className="icon-button"
                aria-label="Close"
                onClick={() => setSelectedUser(null)}
              >
                <X size={19} />
              </button>
            </div>

            <div className="profile-header">
              <div className="avatar large">
                {selectedUser.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div>
                <h3>{selectedUser.name}</h3>
                <p>{selectedUser.email}</p>
                <span
                  className={`status status-${selectedUser.status.toLowerCase()}`}
                >
                  <span className="status-dot" />
                  {selectedUser.status}
                </span>
              </div>
            </div>

            <div className="detail-grid">
              <Detail label="User ID" value={selectedUser.id} />
              <Detail label="Role" value={selectedUser.role} />
              <Detail label="Organization" value={selectedUser.organization} />
              <Detail label="Last active" value={selectedUser.lastActive} />
              <Detail label="Joined" value={selectedUser.joined} />
            </div>

            <div className="modal-actions">
              <button
                className="button secondary"
                onClick={() => setSelectedUser(null)}
              >
                Close
              </button>
              {selectedUser.status !== "Pending" && (
                <button
                  className={`button ${
                    selectedUser.status === "Active" ? "danger" : "primary"
                  }`}
                  onClick={() => toggleUserStatus(selectedUser)}
                >
                  {selectedUser.status === "Active" ? (
                    <>
                      <Ban size={16} />
                      Suspend user
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      Activate user
                    </>
                  )}
                </button>
              )}
            </div>
          </section>
        </div>
      )}

      <style jsx>{`
        .all-users-page {
          --text: #172033;
          --muted: #687386;
          --border: #e4e8ef;
          --surface: #ffffff;
          --page-bg: #f7f8fb;
          --primary: #315fea;
          color: var(--text);
          min-height: 100%;
          padding: 30px;
          background: var(--page-bg);
          font-family: Arial, Helvetica, sans-serif;
        }

        .page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 25px;
        }

        .breadcrumbs {
          color: var(--muted);
          font-size: 12px;
          margin-bottom: 12px;
        }

        .breadcrumbs span {
          margin: 0 8px;
          color: #a3aab7;
        }

        h1 {
          margin: 0;
          font-size: 29px;
          letter-spacing: -0.8px;
          font-weight: 750;
        }

        .subtitle {
          margin: 9px 0 0;
          color: var(--muted);
          font-size: 14px;
          line-height: 1.6;
        }

        .header-actions,
        .toolbar,
        .panel-heading,
        .row-actions,
        .modal-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .button {
          min-height: 39px;
          display: inline-flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          padding: 0 14px;
          border-radius: 8px;
          border: 1px solid transparent;
          font-size: 13px;
          font-weight: 650;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
          white-space: nowrap;
        }

        .button.primary {
          background: var(--primary);
          color: #fff;
        }

        .button.primary:hover {
          background: #244dc9;
        }

        .button.secondary {
          color: #344054;
          background: #fff;
          border-color: #dce1e9;
        }

        .button.secondary:hover,
        .button.secondary.selected {
          background: #f0f4ff;
          border-color: #bdccff;
        }

        .button.danger {
          color: #fff;
          background: #dc3545;
        }

        .text-button {
          color: var(--primary);
          border: 0;
          background: transparent;
        }

        .notice {
          margin-bottom: 18px;
          padding: 12px 14px;
          border: 1px solid #c7d7fe;
          background: #eef4ff;
          color: #2447a7;
          border-radius: 9px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          font-size: 13px;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 22px;
        }

        .metric-card {
          display: flex;
          gap: 13px;
          align-items: flex-start;
          padding: 19px;
          border: 1px solid var(--border);
          border-radius: 12px;
          background: var(--surface);
          min-width: 0;
        }

        .metric-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }

        .metric-icon.blue {
          color: #315fea;
          background: #edf2ff;
        }

        .metric-icon.green {
          color: #16804a;
          background: #e7f8ef;
        }

        .metric-icon.orange {
          color: #b96a09;
          background: #fff3dc;
        }

        .metric-icon.red {
          color: #d13f4c;
          background: #fff0f1;
        }

        .metric-label {
          color: var(--muted);
          font-size: 12px;
          font-weight: 550;
        }

        .metric-value {
          margin-top: 6px;
          font-size: 27px;
          font-weight: 750;
          letter-spacing: -0.5px;
        }

        .metric-detail {
          margin-top: 5px;
          color: #8992a2;
          font-size: 11px;
          line-height: 1.4;
        }

        .users-panel {
          overflow: hidden;
          border: 1px solid var(--border);
          border-radius: 12px;
          background: var(--surface);
        }

        .panel-heading {
          justify-content: space-between;
          padding: 21px 22px 16px;
        }

        .panel-heading h2 {
          margin: 0;
          font-size: 16px;
          font-weight: 750;
        }

        .panel-heading p {
          margin: 6px 0 0;
          color: var(--muted);
          font-size: 12px;
        }

        .toolbar {
          padding: 0 22px 18px;
        }

        .search-box {
          min-width: 180px;
          flex: 1;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 0 11px;
          height: 40px;
          border: 1px solid #dfe4ec;
          border-radius: 8px;
          color: #7a8495;
          background: #fff;
        }

        .search-box:focus-within {
          border-color: #9db4ff;
          box-shadow: 0 0 0 3px #315fea12;
        }

        .search-box input {
          border: 0;
          outline: 0;
          flex: 1;
          min-width: 0;
          color: var(--text);
          font-size: 12px;
          background: transparent;
        }

        .search-box input::placeholder {
          color: #9aa3b1;
        }

        select,
        .modal input {
          height: 40px;
          padding: 0 11px;
          border: 1px solid #dfe4ec;
          border-radius: 8px;
          color: #344054;
          background: #fff;
          font-size: 12px;
          outline: none;
        }

        select:focus,
        .modal input:focus {
          border-color: #9db4ff;
        }

        .toolbar select {
          min-width: 145px;
        }

        .advanced-filters {
          display: flex;
          align-items: flex-end;
          gap: 15px;
          padding: 0 22px 18px;
          border-bottom: 1px solid #edf0f5;
        }

        .advanced-filters label {
          display: grid;
          gap: 7px;
          color: #566174;
          font-size: 11px;
          font-weight: 650;
        }

        .advanced-filters select {
          min-width: 190px;
        }

        .table-wrap {
          width: 100%;
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          white-space: nowrap;
        }

        thead {
          background: #f8f9fc;
        }

        th {
          height: 43px;
          padding: 0 16px;
          border-top: 1px solid #edf0f5;
          border-bottom: 1px solid #edf0f5;
          color: #697386;
          font-size: 10px;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: 0.45px;
        }

        th:first-child,
        td:first-child {
          padding-left: 22px;
        }

        th:last-child,
        td:last-child {
          padding-right: 22px;
        }

        td {
          padding: 14px 16px;
          border-bottom: 1px solid #edf0f5;
          color: #465165;
          font-size: 12px;
        }

        tbody tr:hover {
          background: #fafbfe;
        }

        .user-cell {
          display: flex;
          align-items: center;
          gap: 11px;
          min-width: 220px;
        }

        .avatar {
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #eaf0ff;
          color: #3155bd;
          font-size: 11px;
          font-weight: 750;
        }

        .user-info {
          display: grid;
          gap: 4px;
        }

        .user-info strong {
          color: #202b3e;
          font-size: 12px;
          font-weight: 700;
        }

        .user-info span {
          color: #687386;
          font-size: 11px;
        }

        .user-info small {
          color: #9aa2b1;
          font-size: 10px;
        }

        .role-text {
          color: #475467;
          font-size: 11px;
        }

        .status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 8px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 700;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        .status-active {
          color: #167647;
          background: #e9f8ef;
        }

        .status-pending {
          color: #a96508;
          background: #fff4df;
        }

        .status-suspended {
          color: #c23645;
          background: #fff0f1;
        }

        .last-active {
          color: #7b8494;
          font-size: 11px;
        }

        .actions-heading {
          text-align: right;
        }

        .row-actions {
          justify-content: flex-end;
        }

        .icon-button {
          width: 31px;
          height: 31px;
          display: inline-grid;
          place-items: center;
          border: 1px solid transparent;
          border-radius: 7px;
          color: #737e90;
          background: transparent;
          cursor: pointer;
        }

        .icon-button:hover:not(:disabled) {
          color: #315fea;
          background: #edf2ff;
          border-color: #dce5ff;
        }

        .icon-button:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .danger-icon:hover:not(:disabled) {
          color: #c23645;
          background: #fff0f1;
          border-color: #ffdade;
        }

        .success-icon:hover:not(:disabled) {
          color: #167647;
          background: #e9f8ef;
          border-color: #c9efd8;
        }

        .table-footer {
          min-height: 48px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 12px 22px;
          color: #8992a2;
          font-size: 11px;
        }

        .empty-state {
          min-height: 210px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 10px;
          color: #929bab;
        }

        .empty-state strong {
          color: #344054;
          font-size: 14px;
        }

        .empty-state span {
          font-size: 12px;
        }

        .empty-state .button {
          margin-top: 5px;
        }

        .modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(15, 23, 42, 0.48);
          backdrop-filter: blur(3px);
        }

        .modal {
          width: 100%;
          max-width: 490px;
          max-height: calc(100vh - 40px);
          overflow-y: auto;
          padding: 24px;
          border: 1px solid #e4e8ef;
          border-radius: 14px;
          background: #fff;
          box-shadow: 0 22px 70px #0f172a30;
        }

        .modal-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 15px;
          margin-bottom: 22px;
        }

        .modal-heading h2 {
          margin: 0;
          color: #1b2638;
          font-size: 19px;
        }

        .modal-heading p {
          margin: 7px 0 0;
          color: #778194;
          font-size: 12px;
          line-height: 1.5;
        }

        .modal form {
          display: grid;
          gap: 16px;
        }

        .modal form label {
          display: grid;
          gap: 7px;
          color: #475467;
          font-size: 12px;
          font-weight: 650;
        }

        .modal form input,
        .modal form select {
          width: 100%;
          box-sizing: border-box;
          font-weight: 400;
        }

        .modal-note {
          padding: 11px 12px;
          border: 1px solid #dce7ff;
          border-radius: 8px;
          background: #f3f6ff;
          color: #5b6c91;
          font-size: 11px;
          line-height: 1.6;
        }

        .modal-actions {
          justify-content: flex-end;
          margin-top: 5px;
        }

        .details-modal {
          max-width: 540px;
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px;
          border: 1px solid #e9edf4;
          border-radius: 10px;
          background: #fafbfe;
        }

        .avatar.large {
          width: 54px;
          height: 54px;
          font-size: 15px;
        }

        .profile-header h3 {
          margin: 0 0 5px;
          font-size: 16px;
        }

        .profile-header p {
          margin: 0 0 9px;
          color: #737e90;
          font-size: 12px;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          padding: 22px 2px;
        }

        .detail-item {
          display: grid;
          gap: 6px;
          min-width: 0;
        }

        .detail-label {
          color: #8992a2;
          font-size: 10px;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        .detail-value {
          color: #344054;
          font-size: 12px;
          line-height: 1.5;
          overflow-wrap: anywhere;
        }

        @media (max-width: 1050px) {
          .all-users-page {
            padding: 22px;
          }

          .metrics-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .page-header {
            flex-direction: column;
          }
        }

        @media (max-width: 640px) {
          .all-users-page {
            padding: 15px;
          }

          .header-actions {
            width: 100%;
          }

          .header-actions .button {
            flex: 1;
          }

          .metrics-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .metric-card {
            padding: 14px;
          }

          .toolbar {
            align-items: stretch;
            flex-direction: column;
          }

          .toolbar select {
            width: 100%;
          }

          .advanced-filters {
            align-items: stretch;
            flex-direction: column;
          }

          .advanced-filters select {
            width: 100%;
          }

          .panel-heading {
            padding: 17px 15px;
          }

          .toolbar,
          .advanced-filters {
            padding-left: 15px;
            padding-right: 15px;
          }

          .table-footer {
            align-items: flex-start;
            flex-direction: column;
            padding: 13px 15px;
          }

          .detail-grid {
            grid-template-columns: 1fr;
          }

          .modal {
            padding: 18px;
          }
        }
      `}</style>
    </main>
  );
}

function MetricCard({
  icon,
  label,
  value,
  detail,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  detail: string;
  color: "blue" | "green" | "orange" | "red";
}) {
  return (
    <div className="metric-card">
      <div className={`metric-icon ${color}`}>{icon}</div>
      <div>
        <div className="metric-label">{label}</div>
        <div className="metric-value">{value}</div>
        <div className="metric-detail">{detail}</div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-item">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value}</span>
    </div>
  );
}