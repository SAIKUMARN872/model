// ModelNow Admin Users page
"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Users,
  Clock3,
  CalendarDays,
  Download,
  Eye,
  UserCheck,
  RefreshCw,
  X,
  Mail,
  AlertTriangle,
} from "lucide-react";

type InactiveUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: string;
  lastActive: string;
  inactiveDays: number;
  joined: string;
};

const initialUsers: InactiveUser[] = [
  {
    id: "USR-1010",
    name: "Avery Thompson",
    email: "avery.thompson@example.com",
    role: "Member",
    organization: "Acme Corporation",
    lastActive: "8 days ago",
    inactiveDays: 8,
    joined: "Jan 20, 2026",
  },
  {
    id: "USR-1011",
    name: "Morgan Clark",
    email: "morgan.clark@example.com",
    role: "Workspace Administrator",
    organization: "Vertex Labs",
    lastActive: "15 days ago",
    inactiveDays: 15,
    joined: "Feb 11, 2026",
  },
  {
    id: "USR-1012",
    name: "Cameron Hall",
    email: "cameron.hall@example.com",
    role: "Member",
    organization: "CloudWorks",
    lastActive: "23 days ago",
    inactiveDays: 23,
    joined: "Mar 02, 2026",
  },
  {
    id: "USR-1013",
    name: "Parker Young",
    email: "parker.young@example.com",
    role: "Security Auditor",
    organization: "Nova Research",
    lastActive: "31 days ago",
    inactiveDays: 31,
    joined: "Apr 14, 2026",
  },
  {
    id: "USR-1014",
    name: "Quinn Baker",
    email: "quinn.baker@example.com",
    role: "Member",
    organization: "Northstar Technologies",
    lastActive: "45 days ago",
    inactiveDays: 45,
    joined: "May 06, 2026",
  },
  {
    id: "USR-1015",
    name: "Reese Adams",
    email: "reese.adams@example.com",
    role: "Organization Administrator",
    organization: "Acme Corporation",
    lastActive: "72 days ago",
    inactiveDays: 72,
    joined: "Jun 19, 2026",
  },
  {
    id: "USR-1016",
    name: "Skyler Scott",
    email: "skyler.scott@example.com",
    role: "Member",
    organization: "CloudWorks",
    lastActive: "104 days ago",
    inactiveDays: 104,
    joined: "Jul 08, 2026",
  },
];

export default function InactiveUsersPage() {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [organization, setOrganization] = useState("All organizations");
  const [inactivePeriod, setInactivePeriod] = useState("all");
  const [selectedUser, setSelectedUser] = useState<InactiveUser | null>(null);
  const [reactivatedIds, setReactivatedIds] = useState<string[]>([]);
  const [notice, setNotice] = useState("");

  const organizations = [
    ...new Set(users.map((user) => user.organization)),
  ];

  const inactiveUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !query ||
        user.id.toLowerCase().includes(query) ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.organization.toLowerCase().includes(query);

      const matchesOrganization =
        organization === "All organizations" ||
        user.organization === organization;

      const matchesPeriod =
        inactivePeriod === "all" ||
        (inactivePeriod === "7" && user.inactiveDays >= 7) ||
        (inactivePeriod === "30" && user.inactiveDays >= 30) ||
        (inactivePeriod === "60" && user.inactiveDays >= 60) ||
        (inactivePeriod === "90" && user.inactiveDays >= 90);

      return (
        matchesSearch &&
        matchesOrganization &&
        matchesPeriod &&
        !reactivatedIds.includes(user.id)
      );
    });
  }, [users, search, organization, inactivePeriod, reactivatedIds]);

  const over30Days = users.filter(
    (user) => user.inactiveDays >= 30 && !reactivatedIds.includes(user.id)
  ).length;

  const over60Days = users.filter(
    (user) => user.inactiveDays >= 60 && !reactivatedIds.includes(user.id)
  ).length;

  function reactivateUser(user: InactiveUser) {
    setReactivatedIds((current) =>
      current.includes(user.id) ? current : [...current, user.id]
    );
    setSelectedUser(null);
    setNotice(`${user.name} was marked as reactivated in this demo.`);
  }

  function exportCsv() {
    const headers = [
      "User ID",
      "Name",
      "Email",
      "Role",
      "Organization",
      "Last Active",
      "Inactive Days",
      "Joined",
    ];

    const rows = inactiveUsers.map((user) => [
      user.id,
      user.name,
      user.email,
      user.role,
      user.organization,
      user.lastActive,
      user.inactiveDays,
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
    anchor.download = "modelnow-inactive-users.csv";
    anchor.click();
    URL.revokeObjectURL(url);

    setNotice("Inactive users exported to CSV.");
  }

  return (
    <main className="inactive-page">
      <header className="page-header">
        <div>
          <div className="breadcrumbs">
            Administration <span>/</span> Users <span>/</span> Inactive Users
          </div>
          <h1>Inactive Users</h1>
          <p>
            Identify dormant accounts, review inactivity, and manage
            reactivation.
          </p>
        </div>

        <button className="button secondary" onClick={exportCsv}>
          <Download size={16} />
          Export CSV
        </button>
      </header>

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

      <section className="metrics">
        <Metric
          icon={<Users size={20} />}
          label="Inactive accounts"
          value={users.length - reactivatedIds.length}
          detail="Accounts in this demo"
          tone="blue"
        />
        <Metric
          icon={<Clock3 size={20} />}
          label="Inactive 30+ days"
          value={over30Days}
          detail="May need follow-up"
          tone="orange"
        />
        <Metric
          icon={<AlertTriangle size={20} />}
          label="Inactive 60+ days"
          value={over60Days}
          detail="Review account necessity"
          tone="red"
        />
        <Metric
          icon={<UserCheck size={20} />}
          label="Reactivated"
          value={reactivatedIds.length}
          detail="During this demo session"
          tone="green"
        />
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Inactive account directory</h2>
            <p>
              Showing {inactiveUsers.length}{" "}
              {inactiveUsers.length === 1 ? "account" : "accounts"}
            </p>
          </div>
          <span className="count-badge">
            <Clock3 size={14} />
            Inactivity monitoring
          </span>
        </div>

        <div className="filters">
          <div className="search-box">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, ID..."
              aria-label="Search inactive users"
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
            value={organization}
            onChange={(event) => setOrganization(event.target.value)}
            aria-label="Filter by organization"
          >
            <option>All organizations</option>
            {organizations.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>

          <select
            value={inactivePeriod}
            onChange={(event) => setInactivePeriod(event.target.value)}
            aria-label="Filter by inactivity period"
          >
            <option value="all">Any inactivity</option>
            <option value="7">7+ days inactive</option>
            <option value="30">30+ days inactive</option>
            <option value="60">60+ days inactive</option>
            <option value="90">90+ days inactive</option>
          </select>

          <button
            className="button secondary reset-button"
            onClick={() => {
              setSearch("");
              setOrganization("All organizations");
              setInactivePeriod("all");
            }}
            title="Reset filters"
          >
            <RefreshCw size={15} />
            Reset
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
                <th>Inactive days</th>
                <th>Joined</th>
                <th className="right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inactiveUsers.map((user) => (
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
                  <td>{user.lastActive}</td>
                  <td>
                    <span
                      className={`days-badge ${
                        user.inactiveDays >= 60
                          ? "days-critical"
                          : user.inactiveDays >= 30
                            ? "days-warning"
                            : "days-normal"
                      }`}
                    >
                      {user.inactiveDays} days
                    </span>
                  </td>
                  <td>{user.joined}</td>
                  <td>
                    <div className="actions">
                      <button
                        className="icon-button"
                        title="View details"
                        aria-label={`View ${user.name}`}
                        onClick={() => setSelectedUser(user)}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="icon-button reactivate-icon"
                        title="Reactivate user"
                        aria-label={`Reactivate ${user.name}`}
                        onClick={() => reactivateUser(user)}
                      >
                        <UserCheck size={16} />
                      </button>
                      <button
                        className="icon-button"
                        title="Prepare reminder"
                        aria-label={`Prepare reminder for ${user.name}`}
                        onClick={() =>
                          setNotice(
                            `Reminder prepared for ${user.email}. Email sending is not connected.`
                          )
                        }
                      >
                        <Mail size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {inactiveUsers.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <Users size={30} />
                      <strong>No inactive users found</strong>
                      <span>Try changing your filters or search query.</span>
                      <button
                        className="button secondary"
                        onClick={() => {
                          setSearch("");
                          setOrganization("All organizations");
                          setInactivePeriod("all");
                        }}
                      >
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
            {inactiveUsers.length} accounts match the current filters
          </span>
          <span>ModelNow Admin · Users</span>
        </footer>
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
                <h2>Inactive user details</h2>
                <p>Review this account before taking action.</p>
              </div>
              <button
                className="icon-button"
                aria-label="Close details"
                onClick={() => setSelectedUser(null)}
              >
                <X size={18} />
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
                <span
                  className={`days-badge ${
                    selectedUser.inactiveDays >= 60
                      ? "days-critical"
                      : selectedUser.inactiveDays >= 30
                        ? "days-warning"
                        : "days-normal"
                  }`}
                >
                  Inactive for {selectedUser.inactiveDays} days
                </span>
              </div>
            </div>

            <div className="details-grid">
              <Detail label="User ID" value={selectedUser.id} />
              <Detail label="Role" value={selectedUser.role} />
              <Detail label="Organization" value={selectedUser.organization} />
              <Detail label="Last active" value={selectedUser.lastActive} />
              <Detail label="Date joined" value={selectedUser.joined} />
              <Detail
                label="Inactivity level"
                value={
                  selectedUser.inactiveDays >= 60
                    ? "Critical review"
                    : selectedUser.inactiveDays >= 30
                      ? "Needs attention"
                      : "Monitor"
                }
              />
            </div>

            <div className="modal-note">
              <CalendarDays size={18} />
              <p>
                Inactivity thresholds are illustrative. In production, calculate
                these values from verified sign-in and activity timestamps.
              </p>
            </div>

            <div className="modal-actions">
              <button
                className="button secondary"
                onClick={() => setSelectedUser(null)}
              >
                Close
              </button>
              <button
                className="button primary"
                onClick={() => reactivateUser(selectedUser)}
              >
                <UserCheck size={16} />
                Reactivate user
              </button>
            </div>
          </section>
        </div>
      )}

      <style jsx>{`
        .inactive-page {
          --text: #172033;
          --muted: #748094;
          --border: #e4e8ef;
          --primary: #315fea;
          min-height: 100%;
          padding: 30px;
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

        .metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 15px;
          margin-bottom: 22px;
        }

        .metric {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          min-width: 0;
          padding: 18px;
          border: 1px solid var(--border);
          border-radius: 11px;
          background: white;
        }

        .metric-icon {
          display: grid;
          place-items: center;
          width: 41px;
          height: 41px;
          flex-shrink: 0;
          border-radius: 10px;
        }

        .metric-icon.blue {
          color: #315fea;
          background: #edf2ff;
        }

        .metric-icon.orange {
          color: #b96a09;
          background: #fff3dc;
        }

        .metric-icon.red {
          color: #c23645;
          background: #fff0f1;
        }

        .metric-icon.green {
          color: #16804a;
          background: #e7f8ef;
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

        .count-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 10px;
          border-radius: 7px;
          color: #a96508;
          background: #fff4df;
          font-size: 10px;
          font-weight: 700;
        }

        .filters {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
          padding: 0 22px 18px;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 9px;
          flex: 1;
          min-width: 180px;
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
          background: transparent;
          font-size: 11px;
        }

        .filters select {
          min-width: 145px;
          max-width: 210px;
          height: 40px;
          padding: 0 10px;
          border: 1px solid #dfe4ec;
          border-radius: 8px;
          outline: none;
          color: #475467;
          background: white;
          font-size: 11px;
        }

        .reset-button {
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
          letter-spacing: 0.3px;
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

        .days-badge {
          display: inline-flex;
          align-items: center;
          padding: 5px 8px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 700;
        }

        .days-normal {
          color: #315fea;
          background: #edf2ff;
        }

        .days-warning {
          color: #a96508;
          background: #fff4df;
        }

        .days-critical {
          color: #c23645;
          background: #fff0f1;
        }

        .actions {
          display: flex;
          justify-content: flex-end;
          gap: 4px;
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

        .reactivate-icon:hover {
          color: #16804a;
          background: #e7f8ef;
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
          max-width: 510px;
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
          margin: 0 0 9px;
          color: #748094;
          font-size: 11px;
          overflow-wrap: anywhere;
        }

        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
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

        .modal-note {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px;
          border: 1px solid #dce7ff;
          border-radius: 9px;
          color: #315fea;
          background: #f3f6ff;
        }

        .modal-note p {
          margin: 0;
          color: #66769b;
          font-size: 10px;
          line-height: 1.7;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 9px;
          margin-top: 22px;
        }

        @media (max-width: 1050px) {
          .inactive-page {
            padding: 22px;
          }

          .metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 650px) {
          .inactive-page {
            padding: 15px;
          }

          .page-header {
            flex-direction: column;
          }

          .metrics {
            grid-template-columns: 1fr;
          }

          .panel-heading {
            align-items: flex-start;
            flex-direction: column;
            padding: 17px 14px;
          }

          .filters {
            padding: 0 14px 15px;
          }

          .search-box {
            flex-basis: 100%;
          }

          .filters select {
            flex: 1;
            min-width: 125px;
            max-width: none;
          }

          .table-footer {
            flex-direction: column;
            padding: 13px 14px;
          }

          .details-grid {
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
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  detail: string;
  tone: "blue" | "orange" | "red" | "green";
}) {
  return (
    <div className="metric">
      <div className={`metric-icon ${tone}`}>{icon}</div>
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