// ModelNow Admin Users page
"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Users,
  Activity,
  Clock3,
  Download,
  Eye,
  Ban,
  RefreshCw,
  X,
  CheckCircle2,
} from "lucide-react";

type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: string;
  lastActive: string;
  lastActiveMinutes: number;
  joined: string;
  device: string;
};

const initialUsers: UserRecord[] = [
  {
    id: "USR-1001",
    name: "Alex Morgan",
    email: "alex.morgan@example.com",
    role: "Super Administrator",
    organization: "Acme Corporation",
    lastActive: "2 minutes ago",
    lastActiveMinutes: 2,
    joined: "Jan 12, 2026",
    device: "Chrome · Windows",
  },
  {
    id: "USR-1002",
    name: "Jordan Lee",
    email: "jordan.lee@example.com",
    role: "Organization Administrator",
    organization: "Northstar Technologies",
    lastActive: "15 minutes ago",
    lastActiveMinutes: 15,
    joined: "Feb 04, 2026",
    device: "Edge · Windows",
  },
  {
    id: "USR-1003",
    name: "Taylor Smith",
    email: "taylor.smith@example.com",
    role: "Workspace Administrator",
    organization: "Vertex Labs",
    lastActive: "32 minutes ago",
    lastActiveMinutes: 32,
    joined: "Mar 18, 2026",
    device: "Chrome · macOS",
  },
  {
    id: "USR-1006",
    name: "Riley Johnson",
    email: "riley.johnson@example.com",
    role: "Member",
    organization: "Acme Corporation",
    lastActive: "1 hour ago",
    lastActiveMinutes: 60,
    joined: "Sep 05, 2026",
    device: "Safari · macOS",
  },
  {
    id: "USR-1008",
    name: "Jamie Wilson",
    email: "jamie.wilson@example.com",
    role: "Member",
    organization: "CloudWorks",
    lastActive: "3 hours ago",
    lastActiveMinutes: 180,
    joined: "Oct 11, 2026",
    device: "Chrome · Android",
  },
  {
    id: "USR-1009",
    name: "Drew Taylor",
    email: "drew.taylor@example.com",
    role: "Security Auditor",
    organization: "Nova Research",
    lastActive: "6 hours ago",
    lastActiveMinutes: 360,
    joined: "Oct 16, 2026",
    device: "Firefox · Windows",
  },
];

export default function ActiveUsersPage() {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All roles");
  const [organizationFilter, setOrganizationFilter] = useState("All organizations");
  const [activityFilter, setActivityFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [suspendedIds, setSuspendedIds] = useState<string[]>([]);
  const [notice, setNotice] = useState("");

  const organizations = [...new Set(users.map((user) => user.organization))];
  const roles = [...new Set(users.map((user) => user.role))];

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !term ||
        user.id.toLowerCase().includes(term) ||
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.organization.toLowerCase().includes(term);

      const matchesRole =
        roleFilter === "All roles" || user.role === roleFilter;

      const matchesOrganization =
        organizationFilter === "All organizations" ||
        user.organization === organizationFilter;

      const matchesActivity =
        activityFilter === "all" ||
        (activityFilter === "hour" && user.lastActiveMinutes <= 60) ||
        (activityFilter === "day" && user.lastActiveMinutes <= 1440);

      return (
        matchesSearch &&
        matchesRole &&
        matchesOrganization &&
        matchesActivity &&
        !suspendedIds.includes(user.id)
      );
    });
  }, [
    users,
    search,
    roleFilter,
    organizationFilter,
    activityFilter,
    suspendedIds,
  ]);

  function suspendUser(user: UserRecord) {
    setSuspendedIds((current) =>
      current.includes(user.id) ? current : [...current, user.id]
    );
    setSelectedUser(null);
    setNotice(`${user.name} was suspended in this demo.`);
  }

  function exportCsv() {
    const headers = [
      "User ID",
      "Name",
      "Email",
      "Role",
      "Organization",
      "Last Active",
      "Device",
      "Joined",
    ];

    const rows = filteredUsers.map((user) => [
      user.id,
      user.name,
      user.email,
      user.role,
      user.organization,
      user.lastActive,
      user.device,
      user.joined,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" })
    );

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "modelnow-active-users.csv";
    anchor.click();
    URL.revokeObjectURL(url);

    setNotice("Active users exported to CSV.");
  }

  return (
    <main className="active-users-page">
      <header className="page-header">
        <div>
          <div className="breadcrumbs">
            Administration <span>/</span> Users <span>/</span> Active Users
          </div>
          <h1>Active Users</h1>
          <p>Monitor enabled accounts and their recent platform activity.</p>
        </div>

        <button className="button secondary" onClick={exportCsv}>
          <Download size={16} />
          Export CSV
        </button>
      </header>

      {notice && (
        <div className="notice" role="status">
          {notice}
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
        <Metric
          icon={<Users size={19} />}
          label="Active accounts"
          value={users.length - suspendedIds.length}
          detail="Enabled demo accounts"
          color="blue"
        />
        <Metric
          icon={<Activity size={19} />}
          label="Active this hour"
          value={users.filter(
            (user) =>
              user.lastActiveMinutes <= 60 &&
              !suspendedIds.includes(user.id)
          ).length}
          detail="Activity within 60 minutes"
          color="green"
        />
        <Metric
          icon={<Clock3 size={19} />}
          label="Active today"
          value={users.filter(
            (user) =>
              user.lastActiveMinutes <= 1440 &&
              !suspendedIds.includes(user.id)
          ).length}
          detail="Activity within 24 hours"
          color="purple"
        />
        <Metric
          icon={<CheckCircle2 size={19} />}
          label="Organizations"
          value={new Set(users.map((user) => user.organization)).size}
          detail="Represented in demo data"
          color="orange"
        />
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Active account directory</h2>
            <p>
              {filteredUsers.length} matching{" "}
              {filteredUsers.length === 1 ? "account" : "accounts"}
            </p>
          </div>
          <span className="live-label">
            <span className="live-dot" />
            Active status
          </span>
        </div>

        <div className="filters">
          <div className="search-box">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search users, email, ID..."
              aria-label="Search active users"
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
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            aria-label="Filter by role"
          >
            <option>All roles</option>
            {roles.map((role) => (
              <option key={role}>{role}</option>
            ))}
          </select>

          <select
            value={organizationFilter}
            onChange={(event) => setOrganizationFilter(event.target.value)}
            aria-label="Filter by organization"
          >
            <option>All organizations</option>
            {organizations.map((organization) => (
              <option key={organization}>{organization}</option>
            ))}
          </select>

          <select
            value={activityFilter}
            onChange={(event) => setActivityFilter(event.target.value)}
            aria-label="Filter by recent activity"
          >
            <option value="all">Any activity</option>
            <option value="hour">Within 1 hour</option>
            <option value="day">Within 24 hours</option>
          </select>

          <button
            className="button secondary reset-button"
            onClick={() => {
              setSearch("");
              setRoleFilter("All roles");
              setOrganizationFilter("All organizations");
              setActivityFilter("all");
            }}
            title="Reset filters"
          >
            <RefreshCw size={15} />
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Organization</th>
                <th>Last active</th>
                <th>Device</th>
                <th>Status</th>
                <th className="right">Actions</th>
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
                          .join("")}
                      </div>
                      <div className="user-info">
                        <strong>{user.name}</strong>
                        <span>{user.email}</span>
                        <small>{user.id}</small>
                      </div>
                    </div>
                  </td>
                  <td>{user.role}</td>
                  <td>{user.organization}</td>
                  <td>
                    <span className="activity-time">
                      <span className="activity-dot" />
                      {user.lastActive}
                    </span>
                  </td>
                  <td>{user.device}</td>
                  <td>
                    <span className="status">
                      <span className="status-dot" />
                      Active
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button
                        className="icon-button"
                        aria-label={`View ${user.name}`}
                        title="View details"
                        onClick={() => setSelectedUser(user)}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="icon-button danger-icon"
                        aria-label={`Suspend ${user.name}`}
                        title="Suspend user"
                        onClick={() => suspendUser(user)}
                      >
                        <Ban size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <Users size={28} />
                      <strong>No active users found</strong>
                      <span>Change your search or reset the filters.</span>
                      <button
                        className="button secondary"
                        onClick={() => {
                          setSearch("");
                          setRoleFilter("All roles");
                          setOrganizationFilter("All organizations");
                          setActivityFilter("all");
                        }}
                      >
                        Reset filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>Displaying {filteredUsers.length} active demo accounts</span>
          <span>ModelNow Admin · User Management</span>
        </div>
      </section>

      {selectedUser && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedUser(null);
            }
          }}
        >
          <section className="modal" role="dialog" aria-modal="true">
            <div className="modal-heading">
              <div>
                <h2>User overview</h2>
                <p>Account details and recent access information.</p>
              </div>
              <button
                className="icon-button"
                aria-label="Close"
                onClick={() => setSelectedUser(null)}
              >
                <X size={19} />
              </button>
            </div>

            <div className="profile">
              <div className="avatar large">
                {selectedUser.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")}
              </div>
              <div>
                <h3>{selectedUser.name}</h3>
                <p>{selectedUser.email}</p>
                <span className="status">
                  <span className="status-dot" />
                  Active
                </span>
              </div>
            </div>

            <div className="details">
              <Detail label="User ID" value={selectedUser.id} />
              <Detail label="Role" value={selectedUser.role} />
              <Detail label="Organization" value={selectedUser.organization} />
              <Detail label="Last active" value={selectedUser.lastActive} />
              <Detail label="Device" value={selectedUser.device} />
              <Detail label="Joined" value={selectedUser.joined} />
            </div>

            <div className="modal-actions">
              <button
                className="button secondary"
                onClick={() => setSelectedUser(null)}
              >
                Close
              </button>
              <button
                className="button danger"
                onClick={() => suspendUser(selectedUser)}
              >
                <Ban size={16} />
                Suspend user
              </button>
            </div>
          </section>
        </div>
      )}

      <style jsx>{`
        .active-users-page {
          --text: #172033;
          --muted: #748094;
          --border: #e4e8ef;
          --primary: #315fea;
          padding: 30px;
          min-height: 100%;
          color: var(--text);
          background: #f7f8fb;
          font-family: Arial, Helvetica, sans-serif;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 25px;
        }

        .breadcrumbs {
          margin-bottom: 11px;
          color: var(--muted);
          font-size: 12px;
        }

        .breadcrumbs span {
          margin: 0 8px;
          color: #a0a8b6;
        }

        h1 {
          margin: 0;
          font-size: 29px;
          letter-spacing: -0.7px;
        }

        .page-header p {
          margin: 8px 0 0;
          color: var(--muted);
          font-size: 13px;
          line-height: 1.6;
        }

        .button {
          min-height: 39px;
          display: inline-flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          padding: 0 14px;
          border: 1px solid transparent;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
        }

        .button.secondary {
          border-color: #dfe4ec;
          color: #344054;
          background: white;
        }

        .button.secondary:hover {
          background: #f3f5f9;
        }

        .button.danger {
          color: white;
          background: #d92d3f;
        }

        .button.primary {
          color: white;
          background: var(--primary);
        }

        .notice {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
          padding: 12px 14px;
          border: 1px solid #c7d7fe;
          border-radius: 8px;
          color: #2447a7;
          background: #eef4ff;
          font-size: 12px;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 15px;
          margin-bottom: 22px;
        }

        .metric {
          display: flex;
          gap: 12px;
          padding: 18px;
          min-width: 0;
          border: 1px solid var(--border);
          border-radius: 11px;
          background: white;
        }

        .metric-icon {
          display: grid;
          place-items: center;
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          border-radius: 10px;
        }

        .metric-icon.blue {
          color: #315fea;
          background: #edf2ff;
        }

        .metric-icon.green {
          color: #16804a;
          background: #e7f8ef;
        }

        .metric-icon.purple {
          color: #7954bd;
          background: #f2edff;
        }

        .metric-icon.orange {
          color: #b96a09;
          background: #fff3dc;
        }

        .metric-label {
          color: #748094;
          font-size: 11px;
        }

        .metric-value {
          margin-top: 7px;
          font-size: 26px;
          font-weight: 750;
        }

        .metric-detail {
          margin-top: 5px;
          color: #929bab;
          font-size: 10px;
          line-height: 1.5;
        }

        .panel {
          overflow: hidden;
          border: 1px solid var(--border);
          border-radius: 12px;
          background: white;
        }

        .panel-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 21px 22px;
        }

        .panel-heading h2 {
          margin: 0;
          font-size: 15px;
        }

        .panel-heading p {
          margin: 6px 0 0;
          color: var(--muted);
          font-size: 11px;
        }

        .live-label,
        .activity-time,
        .status {
          display: inline-flex;
          align-items: center;
          gap: 7px;
        }

        .live-label {
          color: #16804a;
          font-size: 11px;
          font-weight: 700;
        }

        .live-dot,
        .activity-dot,
        .status-dot {
          width: 7px;
          height: 7px;
          flex-shrink: 0;
          border-radius: 50%;
          background: #22a06b;
        }

        .filters {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 22px 18px;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 9px;
          flex: 1;
          min-width: 160px;
          height: 40px;
          padding: 0 11px;
          border: 1px solid #dfe4ec;
          border-radius: 8px;
          color: #7a8495;
        }

        .search-box:focus-within {
          border-color: #9db4ff;
        }

        .search-box input {
          flex: 1;
          min-width: 0;
          border: 0;
          outline: 0;
          color: #344054;
          font-size: 11px;
          background: transparent;
        }

        .filters select {
          min-width: 130px;
          max-width: 190px;
          height: 40px;
          padding: 0 9px;
          border: 1px solid #dfe4ec;
          border-radius: 8px;
          outline: none;
          color: #475467;
          background: white;
          font-size: 11px;
        }

        .reset-button {
          width: 40px;
          padding: 0;
          flex-shrink: 0;
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
          padding: 0 15px;
          border-top: 1px solid #edf0f5;
          border-bottom: 1px solid #edf0f5;
          color: #697386;
          font-size: 10px;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: 0.35px;
        }

        td {
          padding: 14px 15px;
          border-bottom: 1px solid #edf0f5;
          color: #465165;
          font-size: 11px;
        }

        tbody tr:hover {
          background: #fafbfe;
        }

        th:first-child,
        td:first-child {
          padding-left: 22px;
        }

        th:last-child,
        td:last-child {
          padding-right: 22px;
        }

        .right {
          text-align: right;
        }

        .user-cell {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 210px;
        }

        .avatar {
          display: grid;
          place-items: center;
          width: 37px;
          height: 37px;
          flex-shrink: 0;
          border-radius: 50%;
          color: #3155bd;
          background: #eaf0ff;
          font-size: 11px;
          font-weight: 750;
        }

        .user-info {
          display: grid;
          gap: 4px;
        }

        .user-info strong {
          color: #202b3e;
          font-size: 11px;
        }

        .user-info span {
          color: #687386;
          font-size: 10px;
        }

        .user-info small {
          color: #9aa2b1;
          font-size: 9px;
        }

        .activity-time {
          color: #687386;
          font-size: 10px;
        }

        .activity-dot {
          width: 6px;
          height: 6px;
        }

        .status {
          padding: 5px 8px;
          border-radius: 20px;
          color: #167647;
          background: #e9f8ef;
          font-size: 10px;
          font-weight: 700;
        }

        .status-dot {
          width: 6px;
          height: 6px;
        }

        .actions {
          display: flex;
          justify-content: flex-end;
          gap: 5px;
        }

        .icon-button {
          display: inline-grid;
          place-items: center;
          width: 31px;
          height: 31px;
          border: 1px solid transparent;
          border-radius: 7px;
          color: #737e90;
          background: transparent;
          cursor: pointer;
        }

        .icon-button:hover {
          color: #315fea;
          background: #edf2ff;
        }

        .danger-icon:hover {
          color: #c23645;
          background: #fff0f1;
        }

        .table-footer {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding: 14px 22px;
          color: #8992a2;
          font-size: 10px;
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
          font-size: 13px;
        }

        .empty-state span {
          font-size: 11px;
        }

        .modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: #0f172a80;
          backdrop-filter: blur(3px);
        }

        .modal {
          width: 100%;
          max-width: 500px;
          padding: 24px;
          border-radius: 14px;
          background: white;
          box-shadow: 0 20px 70px #0f172a30;
        }

        .modal-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 20px;
        }

        .modal-heading h2 {
          margin: 0;
          font-size: 19px;
        }

        .modal-heading p {
          margin: 6px 0 0;
          color: #748094;
          font-size: 11px;
        }

        .profile {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 15px;
          border: 1px solid #edf0f5;
          border-radius: 10px;
          background: #fafbfe;
        }

        .avatar.large {
          width: 53px;
          height: 53px;
          font-size: 15px;
        }

        .profile h3 {
          margin: 0 0 5px;
          font-size: 15px;
        }

        .profile p {
          margin: 0 0 8px;
          color: #748094;
          font-size: 11px;
          overflow-wrap: anywhere;
        }

        .details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 17px;
          padding: 22px 0;
        }

        .detail {
          display: grid;
          gap: 6px;
          min-width: 0;
        }

        .detail-label {
          color: #8992a2;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .detail-value {
          color: #344054;
          font-size: 11px;
          overflow-wrap: anywhere;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 9px;
        }

        @media (max-width: 1100px) {
          .active-users-page {
            padding: 22px;
          }

          .metrics-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .filters {
            flex-wrap: wrap;
          }

          .search-box {
            flex-basis: 100%;
          }
        }

        @media (max-width: 620px) {
          .active-users-page {
            padding: 15px;
          }

          .page-header {
            flex-direction: column;
          }

          .metrics-grid {
            grid-template-columns: 1fr;
          }

          .filters {
            padding: 0 14px 15px;
          }

          .filters select {
            flex: 1;
            min-width: 120px;
            max-width: none;
          }

          .panel-heading {
            padding: 17px 14px;
          }

          .table-footer {
            flex-direction: column;
            padding: 13px 14px;
          }

          .details {
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

function Metric({
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
  color: "blue" | "green" | "purple" | "orange";
}) {
  return (
    <div className="metric">
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
    <div className="detail">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value}</span>
    </div>
  );
}