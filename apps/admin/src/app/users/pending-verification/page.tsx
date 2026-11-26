// ModelNow Admin Users page
"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  Search,
  ShieldCheck,
  Users,
  Clock3,
  Building2,
  Eye,
  CheckCircle2,
  X,
  Download,
  Filter,
  Mail,
  CalendarDays,
  UserRound,
  XCircle,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

type PendingUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: string;
  invitedAt: string;
  submittedAt: string;
  verificationType: string;
  status: "Pending" | "Under Review";
};

const initialUsers: PendingUser[] = [
  {
    id: "USR-1030",
    name: "Ava Johnson",
    email: "ava.johnson@example.com",
    role: "Member",
    organization: "Acme Corporation",
    invitedAt: "2026-10-28",
    submittedAt: "2026-11-02",
    verificationType: "Email verification",
    status: "Pending",
  },
  {
    id: "USR-1031",
    name: "Noah Williams",
    email: "noah.williams@example.com",
    role: "Developer",
    organization: "Nova Systems",
    invitedAt: "2026-10-27",
    submittedAt: "2026-11-01",
    verificationType: "Identity verification",
    status: "Under Review",
  },
  {
    id: "USR-1032",
    name: "Mia Brown",
    email: "mia.brown@example.com",
    role: "Analyst",
    organization: "Bright Labs",
    invitedAt: "2026-10-25",
    submittedAt: "2026-10-31",
    verificationType: "Organization verification",
    status: "Pending",
  },
  {
    id: "USR-1033",
    name: "Ethan Davis",
    email: "ethan.davis@example.com",
    role: "Member",
    organization: "Vertex AI",
    invitedAt: "2026-10-24",
    submittedAt: "2026-10-30",
    verificationType: "Email verification",
    status: "Under Review",
  },
  {
    id: "USR-1034",
    name: "Charlotte Miller",
    email: "charlotte.miller@example.com",
    role: "Developer",
    organization: "Acme Corporation",
    invitedAt: "2026-10-22",
    submittedAt: "2026-10-29",
    verificationType: "Identity verification",
    status: "Pending",
  },
  {
    id: "USR-1035",
    name: "Lucas Wilson",
    email: "lucas.wilson@example.com",
    role: "Member",
    organization: "Nova Systems",
    invitedAt: "2026-10-20",
    submittedAt: "2026-10-27",
    verificationType: "Organization verification",
    status: "Pending",
  },
];

const getDaysWaiting = (date: string) =>
  Math.max(
    0,
    Math.floor(
      (Date.now() - new Date(`${date}T00:00:00`).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

function MetricCard({
  label,
  value,
  detail,
  icon,
  tone,
}: {
  label: string;
  value: number;
  detail: string;
  icon: ReactNode;
  tone: string;
}) {
  return (
    <div className="metric-card">
      <div className={`metric-icon ${tone}`}>{icon}</div>
      <div>
        <p>{label}</p>
        <h3>{value}</h3>
        <span>{detail}</span>
      </div>
    </div>
  );
}

export default function PendingVerificationPage() {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [organization, setOrganization] = useState("All organizations");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [typeFilter, setTypeFilter] = useState("All verification types");
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [notice, setNotice] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const organizations = useMemo(
    () => Array.from(new Set(users.map((user) => user.organization))),
    [users]
  );

  const verificationTypes = useMemo(
    () => Array.from(new Set(users.map((user) => user.verificationType))),
    [users]
  );

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.id.toLowerCase().includes(query);

      const matchesOrganization =
        organization === "All organizations" ||
        user.organization === organization;

      const matchesStatus =
        statusFilter === "All statuses" || user.status === statusFilter;

      const matchesType =
        typeFilter === "All verification types" ||
        user.verificationType === typeFilter;

      return (
        matchesSearch && matchesOrganization && matchesStatus && matchesType
      );
    });
  }, [users, search, organization, statusFilter, typeFilter]);

  const pendingCount = users.filter((user) => user.status === "Pending").length;
  const reviewCount = users.filter(
    (user) => user.status === "Under Review"
  ).length;
  const overdueCount = users.filter(
    (user) => getDaysWaiting(user.submittedAt) >= 5
  ).length;

  const updateStatus = (
    user: PendingUser,
    status: PendingUser["status"]
  ) => {
    setUsers((current) =>
      current.map((item) =>
        item.id === user.id ? { ...item, status } : item
      )
    );
    setSelectedUser(null);
    setNotice(`${user.name}'s status was updated to ${status} in this demo.`);
    window.setTimeout(() => setNotice(""), 3500);
  };

  const approveUser = (user: PendingUser) => {
    setUsers((current) => current.filter((item) => item.id !== user.id));
    setSelectedUser(null);
    setNotice(`${user.name} has been verified in this demo.`);
    window.setTimeout(() => setNotice(""), 3500);
  };

  const rejectUser = (user: PendingUser) => {
    setUsers((current) => current.filter((item) => item.id !== user.id));
    setSelectedUser(null);
    setNotice(`${user.name}'s verification request was rejected in this demo.`);
    window.setTimeout(() => setNotice(""), 3500);
  };

  const resetFilters = () => {
    setSearch("");
    setOrganization("All organizations");
    setStatusFilter("All statuses");
    setTypeFilter("All verification types");
  };

  const exportCsv = () => {
    const headers = [
      "User ID",
      "Name",
      "Email",
      "Role",
      "Organization",
      "Invited At",
      "Submitted At",
      "Verification Type",
      "Status",
    ];

    const rows = filteredUsers.map((user) => [
      user.id,
      user.name,
      user.email,
      user.role,
      user.organization,
      user.invitedAt,
      user.submittedAt,
      user.verificationType,
      user.status,
    ]);

    const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "modelnow-pending-verification.csv";
    link.click();
    URL.revokeObjectURL(url);
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
            <strong>Pending Verification</strong>
          </div>
          <h1>Pending Verification</h1>
          <p className="subtitle">
            Review user verification requests, validate account information,
            and manage approval decisions.
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
          <button onClick={() => setNotice("")} aria-label="Dismiss notification">
            <X size={16} />
          </button>
        </div>
      )}

      <section className="metrics-grid">
        <MetricCard
          label="Awaiting Verification"
          value={users.length}
          detail="All open requests"
          icon={<Users size={20} />}
          tone="blue"
        />
        <MetricCard
          label="Pending Review"
          value={pendingCount}
          detail="Waiting for verification"
          icon={<Clock3 size={20} />}
          tone="orange"
        />
        <MetricCard
          label="Under Review"
          value={reviewCount}
          detail="Currently being reviewed"
          icon={<ShieldCheck size={20} />}
          tone="purple"
        />
        <MetricCard
          label="Needs Attention"
          value={overdueCount}
          detail="Waiting 5 days or longer"
          icon={<AlertTriangle size={20} />}
          tone="red"
        />
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Verification queue</h2>
            <p>Review submitted requests and update their status.</p>
          </div>
          <span className="count-badge">{filteredUsers.length} requests</span>
        </div>

        <div className="toolbar">
          <div className="search-box">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, or user ID..."
              aria-label="Search verification requests"
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
              Status
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option>All statuses</option>
                <option>Pending</option>
                <option>Under Review</option>
              </select>
            </label>

            <label>
              Verification type
              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
              >
                <option>All verification types</option>
                {verificationTypes.map((item) => (
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
                <th>Verification</th>
                <th>Submitted</th>
                <th>Waiting</th>
                <th>Status</th>
                <th className="actions-heading">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const waiting = getDaysWaiting(user.submittedAt);

                return (
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
                      <span className="verification-type">
                        {user.verificationType}
                      </span>
                    </td>
                    <td>
                      <div className="date-cell">
                        <CalendarDays size={15} />
                        <span>{user.submittedAt}</span>
                      </div>
                    </td>
                    <td>
                      <span className={waiting >= 5 ? "waiting overdue" : "waiting"}>
                        {waiting} {waiting === 1 ? "day" : "days"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={
                          user.status === "Pending"
                            ? "status-pill pending"
                            : "status-pill review"
                        }
                      >
                        <span />
                        {user.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="icon-button"
                          title="Review request"
                          aria-label={`Review ${user.name}`}
                          onClick={() => setSelectedUser(user)}
                        >
                          <Eye size={17} />
                        </button>
                        <button
                          className="icon-button approve-icon"
                          title="Approve verification"
                          aria-label={`Approve ${user.name}`}
                          onClick={() => approveUser(user)}
                        >
                          <CheckCircle2 size={17} />
                        </button>
                        <button
                          className="icon-button reject-icon"
                          title="Reject verification"
                          aria-label={`Reject ${user.name}`}
                          onClick={() => rejectUser(user)}
                        >
                          <XCircle size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <ShieldCheck size={30} />
                      <strong>No verification requests found</strong>
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
            Showing {filteredUsers.length} of {users.length} verification requests
          </span>
          <span className="footer-note">
            <RefreshCw size={14} />
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
            aria-labelledby="review-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="modal-header">
              <div>
                <span className="eyebrow">VERIFICATION REVIEW</span>
                <h2 id="review-title">Review user request</h2>
              </div>
              <button
                className="icon-button"
                onClick={() => setSelectedUser(null)}
                aria-label="Close review"
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
                <span
                  className={
                    selectedUser.status === "Pending"
                      ? "status-pill pending"
                      : "status-pill review"
                  }
                >
                  <span />
                  {selectedUser.status}
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
                <span>Verification type</span>
                <strong>{selectedUser.verificationType}</strong>
              </div>
              <div>
                <span>Invitation date</span>
                <strong>{selectedUser.invitedAt}</strong>
              </div>
              <div>
                <span>Submission date</span>
                <strong>{selectedUser.submittedAt}</strong>
              </div>
            </div>

            <div className="review-note">
              <AlertTriangle size={17} />
              <p>
                Confirm that the submitted details satisfy your organization’s
                verification policy before approving this account. This demo
                does not connect to a real identity provider.
              </p>
            </div>

            <footer className="modal-footer">
              <button
                className="button secondary"
                onClick={() => updateStatus(selectedUser, "Under Review")}
              >
                <Clock3 size={16} />
                Mark under review
              </button>
              <button
                className="button danger"
                onClick={() => rejectUser(selectedUser)}
              >
                <XCircle size={16} />
                Reject
              </button>
              <button
                className="button primary"
                onClick={() => approveUser(selectedUser)}
              >
                <CheckCircle2 size={16} />
                Verify user
              </button>
            </footer>
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
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: 0.18s ease;
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
        .danger {
          background: #fff2f2;
          color: #c63838;
          border: 1px solid #ffd4d4;
        }
        .danger:hover {
          background: #ffe7e7;
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
          min-width: 0;
          padding: 20px;
          border: 1px solid #e7ebf1;
          border-radius: 12px;
          background: white;
        }
        .metric-icon {
          display: grid;
          place-items: center;
          width: 43px;
          height: 43px;
          flex-shrink: 0;
          border-radius: 11px;
        }
        .metric-card p {
          margin: 1px 0 9px;
          color: #667085;
          font-size: 12px;
          font-weight: 600;
        }
        .metric-card h3 {
          margin: 0 0 7px;
          font-size: 27px;
          line-height: 1;
          letter-spacing: -0.7px;
        }
        .metric-card span {
          color: #8993a4;
          font-size: 11px;
        }
        .blue {
          background: #eaf2ff;
          color: #3268d8;
        }
        .orange {
          background: #fff4e8;
          color: #c77720;
        }
        .purple {
          background: #f1edff;
          color: #7555d9;
        }
        .red {
          background: #fff0f0;
          color: #d14343;
        }
        .panel {
          overflow: hidden;
          border: 1px solid #e5eaf1;
          border-radius: 12px;
          background: white;
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
          background: #f2f5f9;
          color: #526177;
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
          height: 40px;
          padding: 0 12px;
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
          min-width: 175px;
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
          border-top: 1px solid #edf0f4;
          border-bottom: 1px solid #edf0f4;
          color: #778397;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.45px;
          text-transform: uppercase;
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
        .verification-type {
          display: inline-block;
          max-width: 160px;
          color: #536177;
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
        .waiting {
          color: #596579;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
        }
        .overdue {
          color: #c43d3d;
        }
        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 8px;
          border: 1px solid;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 700;
          white-space: nowrap;
        }
        .status-pill > span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }
        .pending {
          border-color: #fed7aa;
          background: #fff7ed;
          color: #c46a16;
        }
        .pending > span {
          background: #ea8a2f;
        }
        .review {
          border-color: #c7d7fe;
          background: #eff4ff;
          color: #315fea;
        }
        .review > span {
          background: #4774ed;
        }
        .action-buttons {
          display: flex;
          align-items: center;
          gap: 4px;
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
          border-color: #e2e8f0;
          background: #f1f5fb;
          color: #315fea;
        }
        .approve-icon:hover {
          border-color: #bbf7d0;
          background: #ecfdf3;
          color: #16834b;
        }
        .reject-icon:hover {
          border-color: #ffd4d4;
          background: #fff2f2;
          color: #c63838;
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
          background: #0f172a7a;
          backdrop-filter: blur(3px);
        }
        .modal {
          width: 100%;
          max-width: 590px;
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
        .review-note {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 13px;
          border: 1px solid #f5dfb5;
          border-radius: 9px;
          background: #fffbeb;
          color: #a16207;
        }
        .review-note :global(svg) {
          flex-shrink: 0;
          margin-top: 1px;
        }
        .review-note p {
          margin: 0;
          color: #8b6b32;
          font-size: 11px;
          line-height: 1.65;
        }
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          flex-wrap: wrap;
          gap: 9px;
          margin-top: 22px;
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
          .modal-footer .button {
            flex: 1;
          }
        }
      `}</style>
    </main>
  );
}