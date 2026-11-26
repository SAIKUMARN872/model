// ModelNow Admin Users page
"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  Search,
  ShieldBan,
  Users,
  Clock3,
  Building2,
  Eye,
  RotateCcw,
  Download,
  X,
  CheckCircle2,
  AlertTriangle,
  Filter,
  Mail,
  CalendarDays,
  UserRound,
} from "lucide-react";

type SuspendedUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: string;
  suspendedAt: string;
  suspendedBy: string;
  reason: string;
  lastActive: string;
  status: "Suspended";
};

const initialUsers: SuspendedUser[] = [
  {
    id: "USR-1020",
    name: "Daniel Wilson",
    email: "daniel.wilson@example.com",
    role: "Member",
    organization: "Acme Corporation",
    suspendedAt: "2026-11-02",
    suspendedBy: "Admin",
    reason: "Repeated policy violations",
    lastActive: "2026-11-01",
    status: "Suspended",
  },
  {
    id: "USR-1021",
    name: "Sophia Martinez",
    email: "sophia.martinez@example.com",
    role: "Developer",
    organization: "Nova Systems",
    suspendedAt: "2026-10-30",
    suspendedBy: "Security Team",
    reason: "Suspicious login activity",
    lastActive: "2026-10-30",
    status: "Suspended",
  },
  {
    id: "USR-1022",
    name: "James Anderson",
    email: "james.anderson@example.com",
    role: "Member",
    organization: "Bright Labs",
    suspendedAt: "2026-10-27",
    suspendedBy: "Admin",
    reason: "Terms of service violation",
    lastActive: "2026-10-26",
    status: "Suspended",
  },
  {
    id: "USR-1023",
    name: "Olivia Thomas",
    email: "olivia.thomas@example.com",
    role: "Analyst",
    organization: "Acme Corporation",
    suspendedAt: "2026-10-24",
    suspendedBy: "Security Team",
    reason: "Unusual API usage",
    lastActive: "2026-10-23",
    status: "Suspended",
  },
  {
    id: "USR-1024",
    name: "William Taylor",
    email: "william.taylor@example.com",
    role: "Administrator",
    organization: "Vertex AI",
    suspendedAt: "2026-10-20",
    suspendedBy: "Super Admin",
    reason: "Account security review",
    lastActive: "2026-10-19",
    status: "Suspended",
  },
  {
    id: "USR-1025",
    name: "Isabella Moore",
    email: "isabella.moore@example.com",
    role: "Member",
    organization: "Nova Systems",
    suspendedAt: "2026-10-16",
    suspendedBy: "Admin",
    reason: "Repeated failed verification",
    lastActive: "2026-10-15",
    status: "Suspended",
  },
];

const dateValue = (date: string) => new Date(`${date}T00:00:00`).getTime();

const daysSince = (date: string) =>
  Math.max(
    0,
    Math.floor((Date.now() - dateValue(date)) / (1000 * 60 * 60 * 24))
  );

function MetricCard({
  label,
  value,
  detail,
  icon,
  tone,
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: ReactNode;
  tone: string;
}) {
  return (
    <div className="metric-card">
      <div className={`metric-icon ${tone}`}>{icon}</div>
      <div className="metric-content">
        <p>{label}</p>
        <h3>{value}</h3>
        <span>{detail}</span>
      </div>
    </div>
  );
}

export default function SuspendedUsersPage() {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [organization, setOrganization] = useState("All organizations");
  const [reasonFilter, setReasonFilter] = useState("All reasons");
  const [selectedUser, setSelectedUser] = useState<SuspendedUser | null>(null);
  const [confirmUser, setConfirmUser] = useState<SuspendedUser | null>(null);
  const [notice, setNotice] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const organizations = useMemo(
    () => Array.from(new Set(users.map((user) => user.organization))),
    [users]
  );

  const reasons = useMemo(
    () => Array.from(new Set(users.map((user) => user.reason))),
    [users]
  );

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.id.toLowerCase().includes(query) ||
        user.reason.toLowerCase().includes(query);

      const matchesOrganization =
        organization === "All organizations" ||
        user.organization === organization;

      const matchesReason =
        reasonFilter === "All reasons" || user.reason === reasonFilter;

      return matchesSearch && matchesOrganization && matchesReason;
    });
  }, [users, search, organization, reasonFilter]);

  const longSuspensions = users.filter(
    (user) => daysSince(user.suspendedAt) >= 7
  ).length;

  const recentSuspensions = users.filter(
    (user) => daysSince(user.suspendedAt) <= 7
  ).length;

  const exportCsv = () => {
    const headers = [
      "User ID",
      "Name",
      "Email",
      "Role",
      "Organization",
      "Suspended At",
      "Suspended By",
      "Reason",
      "Last Active",
    ];

    const rows = filteredUsers.map((user) => [
      user.id,
      user.name,
      user.email,
      user.role,
      user.organization,
      user.suspendedAt,
      user.suspendedBy,
      user.reason,
      user.lastActive,
    ]);

    const escapeCsv = (value: string) =>
      `"${value.replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "modelnow-suspended-users.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const reinstateUser = (user: SuspendedUser) => {
    setUsers((current) => current.filter((item) => item.id !== user.id));
    setConfirmUser(null);
    setSelectedUser(null);
    setNotice(`${user.name} has been reinstated in this demo.`);
    window.setTimeout(() => setNotice(""), 3500);
  };

  const resetFilters = () => {
    setSearch("");
    setOrganization("All organizations");
    setReasonFilter("All reasons");
  };

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <div className="breadcrumbs">
            <span>Admin</span>
            <span>/</span>
            <span>Users</span>
            <span>/</span>
            <strong>Suspended Users</strong>
          </div>
          <h1>Suspended Users</h1>
          <p className="subtitle">
            Review restricted accounts, understand suspension reasons, and
            reinstate users when appropriate.
          </p>
        </div>

        <button className="button secondary" onClick={exportCsv}>
          <Download size={16} />
          Export CSV
        </button>
      </header>

      {notice && (
        <div className="notice">
          <CheckCircle2 size={18} />
          <span>{notice}</span>
          <button onClick={() => setNotice("")} aria-label="Dismiss notice">
            <X size={16} />
          </button>
        </div>
      )}

      <section className="metrics-grid">
        <MetricCard
          label="Suspended Accounts"
          value={users.length}
          detail="Currently restricted"
          icon={<ShieldBan size={20} />}
          tone="red"
        />
        <MetricCard
          label="Suspended Recently"
          value={recentSuspensions}
          detail="Within the last 7 days"
          icon={<Clock3 size={20} />}
          tone="orange"
        />
        <MetricCard
          label="Suspended 7+ Days"
          value={longSuspensions}
          detail="May need further review"
          icon={<AlertTriangle size={20} />}
          tone="purple"
        />
        <MetricCard
          label="Organizations"
          value={new Set(users.map((user) => user.organization)).size}
          detail="With restricted accounts"
          icon={<Building2 size={20} />}
          tone="blue"
        />
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Restricted accounts</h2>
            <p>Search and review suspended user accounts.</p>
          </div>
          <span className="count-badge">{filteredUsers.length} users</span>
        </div>

        <div className="toolbar">
          <div className="search-box">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, user ID, or reason..."
              aria-label="Search suspended users"
            />
            {search && (
              <button
                className="icon-button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <button
            className={`button secondary ${showFilters ? "active-filter" : ""}`}
            onClick={() => setShowFilters((current) => !current)}
          >
            <Filter size={16} />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="filter-row">
            <label>
              Organization
              <select
                value={organization}
                onChange={(event) => setOrganization(event.target.value)}
              >
                <option>All organizations</option>
                {organizations.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>

            <label>
              Suspension reason
              <select
                value={reasonFilter}
                onChange={(event) => setReasonFilter(event.target.value)}
              >
                <option>All reasons</option>
                {reasons.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>

            <button className="reset-button" onClick={resetFilters}>
              Reset filters
            </button>
          </div>
        )}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Organization</th>
                <th>Suspension reason</th>
                <th>Suspended on</th>
                <th>Suspended by</th>
                <th>Status</th>
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
                          .slice(0, 2)}
                      </div>
                      <div className="user-info">
                        <strong>{user.name}</strong>
                        <span>{user.email}</span>
                        <small>{user.id}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="organization-cell">
                      <Building2 size={15} />
                      <span>{user.organization}</span>
                    </div>
                    <span className="role-label">{user.role}</span>
                  </td>
                  <td>
                    <span className="reason-text">{user.reason}</span>
                  </td>
                  <td>
                    <div className="date-cell">
                      <CalendarDays size={15} />
                      <span>
                        {new Date(`${user.suspendedAt}T00:00:00`).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" }
                        )}
                      </span>
                    </div>
                    <span className="muted-small">
                      {daysSince(user.suspendedAt)} days ago
                    </span>
                  </td>
                  <td>{user.suspendedBy}</td>
                  <td>
                    <span className="status-pill">
                      <span />
                      Suspended
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="icon-button"
                        title="View details"
                        aria-label={`View ${user.name}`}
                        onClick={() => setSelectedUser(user)}
                      >
                        <Eye size={17} />
                      </button>
                      <button
                        className="icon-button reinstate-icon"
                        title="Reinstate user"
                        aria-label={`Reinstate ${user.name}`}
                        onClick={() => setConfirmUser(user)}
                      >
                        <RotateCcw size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <Users size={30} />
                      <strong>No suspended users found</strong>
                      <p>Try changing your search or filters.</p>
                      <button className="button secondary" onClick={resetFilters}>
                        Clear filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="table-footer">
          <span>
            Showing {filteredUsers.length} of {users.length} suspended accounts
          </span>
          <span className="footer-note">
            <ShieldBan size={14} />
            Demo data
          </span>
        </footer>
      </section>

      {selectedUser && (
        <div className="modal-backdrop" onClick={() => setSelectedUser(null)}>
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="details-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="modal-header">
              <div>
                <span className="eyebrow">USER ACCOUNT</span>
                <h2 id="details-title">Suspension details</h2>
              </div>
              <button
                className="icon-button"
                onClick={() => setSelectedUser(null)}
                aria-label="Close details"
              >
                <X size={19} />
              </button>
            </header>

            <div className="modal-user">
              <div className="avatar large">
                {selectedUser.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div>
                <h3>{selectedUser.name}</h3>
                <p>{selectedUser.email}</p>
                <span className="status-pill">
                  <span />
                  Suspended
                </span>
              </div>
            </div>

            <div className="detail-grid">
              <div>
                <span>User ID</span>
                <strong>{selectedUser.id}</strong>
              </div>
              <div>
                <span>Role</span>
                <strong>{selectedUser.role}</strong>
              </div>
              <div>
                <span>Organization</span>
                <strong>{selectedUser.organization}</strong>
              </div>
              <div>
                <span>Suspended on</span>
                <strong>{selectedUser.suspendedAt}</strong>
              </div>
              <div>
                <span>Suspended by</span>
                <strong>{selectedUser.suspendedBy}</strong>
              </div>
              <div>
                <span>Last active</span>
                <strong>{selectedUser.lastActive}</strong>
              </div>
            </div>

            <div className="reason-card">
              <div className="reason-card-title">
                <AlertTriangle size={17} />
                Suspension reason
              </div>
              <p>{selectedUser.reason}</p>
              <span>
                Verify the account and review relevant security or audit records
                before reinstating access.
              </span>
            </div>

            <footer className="modal-footer">
              <button
                className="button secondary"
                onClick={() => setSelectedUser(null)}
              >
                Close
              </button>
              <button
                className="button primary"
                onClick={() => setConfirmUser(selectedUser)}
              >
                <RotateCcw size={16} />
                Reinstate user
              </button>
            </footer>
          </section>
        </div>
      )}

      {confirmUser && (
        <div className="modal-backdrop" onClick={() => setConfirmUser(null)}>
          <section
            className="modal confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="confirm-icon">
              <RotateCcw size={23} />
            </div>
            <h2 id="confirm-title">Reinstate this user?</h2>
            <p>
              You are about to reinstate <strong>{confirmUser.name}</strong>.
              This demo will remove the account from the suspended list.
            </p>
            <div className="confirm-user">
              <UserRound size={18} />
              <div>
                <strong>{confirmUser.name}</strong>
                <span>{confirmUser.email}</span>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="button secondary"
                onClick={() => setConfirmUser(null)}
              >
                Cancel
              </button>
              <button
                className="button primary"
                onClick={() => reinstateUser(confirmUser)}
              >
                <CheckCircle2 size={16} />
                Confirm reinstatement
              </button>
            </div>
          </section>
        </div>
      )}

      <style jsx>{`
        .page {
          min-height: 100vh;
          padding: 30px;
          background: #f8fafc;
          color: #172033;
          font-family: Arial, Helvetica, sans-serif;
        }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 26px;
        }
        .breadcrumbs {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
          align-items: center;
          margin-bottom: 12px;
          color: #8a94a6;
          font-size: 12px;
        }
        .breadcrumbs strong {
          color: #475569;
          font-weight: 600;
        }
        h1 {
          margin: 0;
          font-size: 27px;
          letter-spacing: -0.7px;
          font-weight: 750;
        }
        .subtitle {
          margin: 9px 0 0;
          color: #748096;
          font-size: 14px;
          line-height: 1.6;
        }
        .button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 39px;
          padding: 0 14px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.18s ease;
          white-space: nowrap;
        }
        .secondary {
          background: white;
          border: 1px solid #dfe5ed;
          color: #344054;
        }
        .secondary:hover {
          background: #f8fafc;
          border-color: #bfc9d8;
        }
        .primary {
          background: #315fea;
          color: white;
          border: 1px solid #315fea;
        }
        .primary:hover {
          background: #244dcc;
        }
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 22px;
        }
        .metric-card {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 20px;
          background: white;
          border: 1px solid #e7ebf1;
          border-radius: 12px;
          min-width: 0;
        }
        .metric-icon {
          display: grid;
          place-items: center;
          width: 43px;
          height: 43px;
          flex-shrink: 0;
          border-radius: 11px;
        }
        .red {
          background: #fff0f0;
          color: #d14343;
        }
        .orange {
          background: #fff4e8;
          color: #c77720;
        }
        .purple {
          background: #f1edff;
          color: #7555d9;
        }
        .blue {
          background: #eaf2ff;
          color: #3268d8;
        }
        .metric-content {
          min-width: 0;
        }
        .metric-content p {
          margin: 1px 0 9px;
          color: #667085;
          font-size: 12px;
          font-weight: 600;
        }
        .metric-content h3 {
          margin: 0 0 7px;
          font-size: 27px;
          line-height: 1;
          letter-spacing: -0.7px;
        }
        .metric-content span {
          color: #8993a4;
          font-size: 11px;
        }
        .panel {
          background: white;
          border: 1px solid #e5eaf1;
          border-radius: 12px;
          overflow: hidden;
        }
        .panel-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 22px 22px 17px;
        }
        .panel-heading h2 {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
        }
        .panel-heading p {
          margin: 6px 0 0;
          color: #8590a2;
          font-size: 12px;
        }
        .count-badge {
          padding: 6px 10px;
          border-radius: 7px;
          color: #526177;
          background: #f2f5f9;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
        }
        .toolbar {
          display: flex;
          gap: 10px;
          padding: 0 22px 18px;
        }
        .search-box {
          display: flex;
          align-items: center;
          gap: 9px;
          flex: 1;
          min-width: 120px;
          padding: 0 12px;
          height: 40px;
          border: 1px solid #e0e6ee;
          border-radius: 8px;
          color: #98a2b3;
        }
        .search-box:focus-within {
          border-color: #8aa9fa;
          box-shadow: 0 0 0 3px #315fea12;
        }
        .search-box input {
          width: 100%;
          border: none;
          outline: none;
          background: transparent;
          color: #344054;
          font-size: 12px;
        }
        .search-box input::placeholder {
          color: #9aa4b2;
        }
        .active-filter {
          background: #eff4ff;
          border-color: #b9ccff;
          color: #315fea;
        }
        .filter-row {
          display: flex;
          align-items: flex-end;
          gap: 14px;
          flex-wrap: wrap;
          padding: 16px 22px;
          border-top: 1px solid #edf0f5;
          border-bottom: 1px solid #edf0f5;
          background: #fbfcfe;
        }
        .filter-row label {
          display: flex;
          flex-direction: column;
          gap: 7px;
          min-width: 190px;
          color: #687589;
          font-size: 11px;
          font-weight: 600;
        }
        .filter-row select {
          height: 37px;
          padding: 0 10px;
          border: 1px solid #dfe5ed;
          border-radius: 7px;
          background: white;
          color: #344054;
          font-size: 12px;
          outline: none;
        }
        .reset-button {
          height: 37px;
          border: 0;
          background: transparent;
          color: #315fea;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }
        .table-wrap {
          width: 100%;
          overflow-x: auto;
        }
        table {
          width: 100%;
          min-width: 1050px;
          border-collapse: collapse;
          text-align: left;
        }
        thead {
          background: #f8fafc;
        }
        th {
          padding: 13px 15px;
          color: #778397;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.45px;
          border-top: 1px solid #edf0f4;
          border-bottom: 1px solid #edf0f4;
          white-space: nowrap;
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
          padding: 15px;
          border-bottom: 1px solid #eef1f5;
          color: #475467;
          font-size: 12px;
          vertical-align: middle;
        }
        tbody tr:last-child td {
          border-bottom: none;
        }
        tbody tr:hover {
          background: #fbfcff;
        }
        .user-cell {
          display: flex;
          align-items: center;
          gap: 11px;
          min-width: 215px;
        }
        .avatar {
          display: grid;
          place-items: center;
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          border-radius: 50%;
          background: #eaf0ff;
          color: #3157b7;
          font-size: 11px;
          font-weight: 700;
        }
        .avatar.large {
          width: 52px;
          height: 52px;
          font-size: 15px;
        }
        .user-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }
        .user-info strong {
          color: #263248;
          font-size: 12px;
          font-weight: 700;
        }
        .user-info span {
          color: #7e899a;
          font-size: 11px;
        }
        .user-info small {
          color: #a0a8b6;
          font-size: 10px;
        }
        .organization-cell {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #46536a;
          white-space: nowrap;
        }
        .organization-cell :global(svg) {
          color: #8b96a8;
        }
        .role-label {
          display: inline-block;
          margin-top: 6px;
          color: #8a94a5;
          font-size: 10px;
        }
        .reason-text {
          display: inline-block;
          max-width: 175px;
          color: #4e596c;
          line-height: 1.5;
        }
        .date-cell {
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }
        .date-cell :global(svg) {
          color: #9aa4b2;
        }
        .muted-small {
          display: block;
          margin: 6px 0 0 21px;
          color: #9aa4b2;
          font-size: 10px;
        }
        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 8px;
          border: 1px solid #ffd6d6;
          border-radius: 6px;
          background: #fff2f2;
          color: #c63838;
          font-size: 10px;
          font-weight: 700;
          white-space: nowrap;
        }
        .status-pill > span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #dc4545;
        }
        .action-buttons {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .icon-button {
          display: inline-grid;
          place-items: center;
          width: 32px;
          height: 32px;
          border: 1px solid transparent;
          border-radius: 7px;
          background: transparent;
          color: #758196;
          cursor: pointer;
          transition: 0.15s ease;
        }
        .icon-button:hover {
          background: #f1f5fb;
          border-color: #e2e8f0;
          color: #315fea;
        }
        .reinstate-icon:hover {
          background: #ecfdf3;
          border-color: #bbf7d0;
          color: #16834b;
        }
        .actions-heading {
          text-align: right;
        }
        .table-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 15px 22px;
          border-top: 1px solid #edf0f4;
          color: #8993a4;
          font-size: 11px;
        }
        .footer-note {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 48px 20px;
          color: #97a2b3;
          text-align: center;
        }
        .empty-state strong {
          margin-top: 12px;
          color: #344054;
          font-size: 14px;
        }
        .empty-state p {
          margin: 7px 0 16px;
          font-size: 12px;
        }
        .notice {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
          padding: 12px 14px;
          border: 1px solid #bbf7d0;
          border-radius: 9px;
          background: #f0fdf4;
          color: #167344;
          font-size: 13px;
        }
        .notice span {
          flex: 1;
        }
        .notice button {
          display: grid;
          place-items: center;
          padding: 3px;
          border: none;
          background: transparent;
          color: inherit;
          cursor: pointer;
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
          max-width: 570px;
          max-height: calc(100vh - 40px);
          overflow-y: auto;
          padding: 24px;
          border: 1px solid #e8edf4;
          border-radius: 15px;
          background: white;
          box-shadow: 0 25px 80px #0f172a30;
        }
        .modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 22px;
        }
        .eyebrow {
          color: #8995a7;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
        }
        .modal-header h2 {
          margin: 7px 0 0;
          font-size: 20px;
          letter-spacing: -0.4px;
        }
        .modal-user {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 17px;
          border: 1px solid #e9edf3;
          border-radius: 11px;
          background: #fbfcfe;
        }
        .modal-user h3 {
          margin: 0 0 5px;
          color: #263248;
          font-size: 15px;
        }
        .modal-user p {
          margin: 0 0 9px;
          color: #8590a2;
          font-size: 12px;
        }
        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0 18px;
          margin: 18px 0;
        }
        .detail-grid > div {
          display: flex;
          flex-direction: column;
          gap: 7px;
          padding: 13px 0;
          border-bottom: 1px solid #edf0f4;
        }
        .detail-grid span {
          color: #8993a4;
          font-size: 11px;
        }
        .detail-grid strong {
          overflow-wrap: anywhere;
          color: #344054;
          font-size: 12px;
          font-weight: 600;
        }
        .reason-card {
          padding: 15px;
          border: 1px solid #f6d7d7;
          border-radius: 10px;
          background: #fffafa;
        }
        .reason-card-title {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #b83232;
          font-size: 12px;
          font-weight: 700;
        }
        .reason-card p {
          margin: 10px 0 7px;
          color: #344054;
          font-size: 13px;
          font-weight: 600;
        }
        .reason-card > span {
          color: #8791a1;
          font-size: 11px;
          line-height: 1.6;
        }
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 9px;
          margin-top: 22px;
        }
        .confirm-modal {
          max-width: 430px;
          text-align: center;
        }
        .confirm-icon {
          display: grid;
          place-items: center;
          width: 54px;
          height: 54px;
          margin: 0 auto 16px;
          border-radius: 50%;
          background: #eaf8ef;
          color: #16834b;
        }
        .confirm-modal h2 {
          margin: 0;
          font-size: 20px;
        }
        .confirm-modal > p {
          margin: 10px 0 18px;
          color: #778397;
          font-size: 13px;
          line-height: 1.65;
        }
        .confirm-modal > p strong {
          color: #344054;
        }
        .confirm-user {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 13px;
          border: 1px solid #e8edf3;
          border-radius: 9px;
          background: #fbfcfe;
          text-align: left;
        }
        .confirm-user > svg {
          color: #7c8ba1;
        }
        .confirm-user div {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }
        .confirm-user strong {
          color: #344054;
          font-size: 12px;
        }
        .confirm-user span {
          overflow-wrap: anywhere;
          color: #8993a4;
          font-size: 11px;
        }
        @media (max-width: 1050px) {
          .metrics-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .page {
            padding: 22px;
          }
        }
        @media (max-width: 600px) {
          .page {
            padding: 16px;
          }
          .page-header {
            flex-direction: column;
          }
          .metrics-grid {
            grid-template-columns: 1fr;
          }
          .panel-heading {
            align-items: flex-start;
          }
          .toolbar {
            flex-wrap: wrap;
          }
          .search-box {
            flex-basis: 100%;
          }
          .filter-row label {
            width: 100%;
          }
          .filter-row select {
            width: 100%;
          }
          .detail-grid {
            grid-template-columns: 1fr;
          }
          .modal {
            padding: 18px;
          }
          .modal-footer {
            flex-wrap: wrap;
          }
          .modal-footer .button {
            flex: 1;
          }
        }
      `}</style>
    </main>
  );
}