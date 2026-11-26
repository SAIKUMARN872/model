
"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  Search,
  UserPlus,
  Users,
  ShieldCheck,
  Clock3,
  X,
  Eye,
  Ban,
  CheckCircle2,
  RotateCcw,
  Building2,
  Mail,
  Activity,
  UserRound,
  Download,
  ChevronDown,
  UserCheck,
  AlertTriangle,
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

export default function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [organizationFilter, setOrganizationFilter] = useState("All");
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [notice, setNotice] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Member");
  const [organization, setOrganization] = useState(organizations[0]);

  const metrics = useMemo(
    () => [
      {
        title: "Total Users",
        value: users.length,
        description: "Accounts in this directory",
        icon: Users,
        color: "blue",
      },
      {
        title: "Active Users",
        value: users.filter((user) => user.status === "Active").length,
        description: "Accounts marked active",
        icon: UserCheck,
        color: "green",
      },
      {
        title: "Administrators",
        value: users.filter((user) => user.role.includes("Administrator")).length,
        description: "Privileged user accounts",
        icon: ShieldCheck,
        color: "purple",
      },
      {
        title: "Pending Users",
        value: users.filter((user) => user.status === "Pending").length,
        description: "Awaiting activation",
        icon: Clock3,
        color: "amber",
      },
    ],
    [users]
  );

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !query ||
        user.id.toLowerCase().includes(query) ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.organization.toLowerCase().includes(query);

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

  function addUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedName || !normalizedEmail) {
      setNotice("Enter the user's name and email address.");
      return;
    }

    if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
      setNotice("A user with this email already exists.");
      return;
    }

    const newUser: UserRecord = {
      id: `USR-${Date.now().toString().slice(-6)}`,
      name: normalizedName,
      email: normalizedEmail,
      role,
      organization,
      status: "Pending",
      lastActive: "Never",
    };

    setUsers((current) => [newUser, ...current]);
    setSearch("");
    setStatusFilter("All");
    setRoleFilter("All");
    setOrganizationFilter("All");
    setName("");
    setEmail("");
    setRole("Member");
    setOrganization(organizations[0]);
    setShowAddForm(false);
    setNotice("Demo user added successfully.");
  }

  function updateUserStatus(user: UserRecord, nextStatus: UserStatus) {
    setUsers((current) =>
      current.map((item) =>
        item.id === user.id ? { ...item, status: nextStatus } : item
      )
    );

    setSelectedUser((current) =>
      current?.id === user.id ? { ...current, status: nextStatus } : current
    );

    setNotice(
      `${user.name} is now marked ${nextStatus.toLowerCase()} in this demo.`
    );
  }

  function resetFilters() {
    setSearch("");
    setStatusFilter("All");
    setRoleFilter("All");
    setOrganizationFilter("All");
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
    ];

    const rows = filteredUsers.map((user) => [
      user.id,
      user.name,
      user.email,
      user.role,
      user.organization,
      user.status,
      user.lastActive,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
      )
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "modelnow-users.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function closeDialogs() {
    setShowAddForm(false);
    setSelectedUser(null);
  }

  return (
    <main className="mn-users">
      <style jsx>{`
        .mn-users {
          --users-bg: var(--admin-bg, #f7f8fc);
          --users-surface: var(--admin-surface, #ffffff);
          --users-text: var(--admin-text, #172033);
          --users-muted: var(--admin-muted, #778198);
          --users-border: var(--admin-border, #e6e9f0);
          --users-primary: var(--admin-primary, #4f5fe5);
          --users-primary-soft: var(--admin-primary-soft, #eef0ff);
          --users-green: var(--admin-success, #16845b);
          --users-green-soft: var(--admin-success-soft, #e9f8f0);
          --users-amber: var(--admin-warning, #b87920);
          --users-amber-soft: var(--admin-warning-soft, #fff5e7);
          --users-red: var(--admin-danger, #c74755);
          --users-red-soft: var(--admin-danger-soft, #fff0f0);
          color: var(--users-text);
          min-width: 0;
        }

        .users-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 24px;
        }

        .users-breadcrumb {
          color: var(--users-muted);
          font-size: 12px;
          margin-bottom: 9px;
        }

        .users-title {
          margin: 0;
          font-size: clamp(24px, 3vw, 30px);
          line-height: 1.25;
          font-weight: 750;
          letter-spacing: -0.8px;
        }

        .users-description {
          max-width: 720px;
          margin: 8px 0 0;
          color: var(--users-muted);
          font-size: 13px;
          line-height: 1.7;
        }

        .users-actions-top,
        .users-button,
        .users-icon-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .users-actions-top {
          flex-wrap: wrap;
        }

        .users-button {
          min-height: 38px;
          padding: 9px 13px;
          border: 1px solid var(--users-border);
          border-radius: 9px;
          background: var(--users-surface);
          color: var(--users-text);
          font-size: 12px;
          font-weight: 650;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
        }

        .users-button:hover {
          background: var(--users-bg);
          border-color: #c5cbea;
        }

        .users-button:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .users-button-primary {
          color: white;
          background: var(--users-primary);
          border-color: var(--users-primary);
        }

        .users-button-primary:hover {
          color: white;
          background: #3e4fcf;
          border-color: #3e4fcf;
        }

        .users-button-danger {
          color: var(--users-red);
        }

        .users-notice {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          justify-content: space-between;
          padding: 12px 14px;
          margin-bottom: 16px;
          border: 1px solid var(--users-border);
          border-radius: 10px;
          background: var(--users-surface);
          font-size: 12px;
          line-height: 1.65;
        }

        .users-notice-content {
          display: flex;
          align-items: flex-start;
          gap: 9px;
        }

        .users-notice.warning {
          border-color: #f3d58d;
          background: var(--users-amber-soft);
          color: #8c6926;
        }

        .users-notice.success {
          border-color: #b9ebcd;
          background: var(--users-green-soft);
          color: var(--users-green);
        }

        .users-notice-close {
          display: grid;
          place-items: center;
          padding: 2px;
          border: 0;
          background: transparent;
          color: inherit;
          cursor: pointer;
        }

        .users-section-heading {
          margin-bottom: 14px;
        }

        .users-section-heading h2 {
          margin: 0;
          font-size: 16px;
          font-weight: 750;
        }

        .users-section-heading p {
          margin: 6px 0 0;
          color: var(--users-muted);
          font-size: 12px;
          line-height: 1.6;
        }

        .users-metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 25px;
        }

        .users-metric {
          min-width: 0;
          padding: 17px;
          border: 1px solid var(--users-border);
          border-radius: 12px;
          background: var(--users-surface);
        }

        .users-metric-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .users-metric-label {
          color: var(--users-muted);
          font-size: 11px;
          font-weight: 650;
        }

        .users-metric-icon {
          display: grid;
          width: 36px;
          height: 36px;
          flex: 0 0 36px;
          place-items: center;
          border-radius: 10px;
          background: var(--users-primary-soft);
          color: var(--users-primary);
        }

        .users-metric-icon.green {
          background: var(--users-green-soft);
          color: var(--users-green);
        }

        .users-metric-icon.amber {
          background: var(--users-amber-soft);
          color: var(--users-amber);
        }

        .users-metric-icon.purple {
          background: #f3e8ff;
          color: #7e22ce;
        }

        .users-metric-value {
          margin-top: 13px;
          font-size: 28px;
          font-weight: 750;
          letter-spacing: -0.8px;
          line-height: 1.2;
        }

        .users-metric-description {
          margin-top: 8px;
          color: var(--users-muted);
          font-size: 11px;
          line-height: 1.6;
        }

        .users-directory {
          overflow: hidden;
          margin-bottom: 25px;
          border: 1px solid var(--users-border);
          border-radius: 12px;
          background: var(--users-surface);
        }

        .users-directory-header {
          padding: 19px;
          border-bottom: 1px solid var(--users-border);
        }

        .users-directory-header h2,
        .users-panel h2 {
          margin: 0;
          font-size: 15px;
          font-weight: 750;
        }

        .users-directory-header > p {
          margin: 6px 0 0;
          color: var(--users-muted);
          font-size: 12px;
          line-height: 1.6;
        }

        .users-filters {
          display: grid;
          grid-template-columns: minmax(200px, 1fr) 150px 200px 190px auto;
          gap: 9px;
          margin-top: 17px;
        }

        .users-input,
        .users-select {
          width: 100%;
          min-width: 0;
          min-height: 39px;
          box-sizing: border-box;
          padding: 9px 11px;
          border: 1px solid var(--users-border);
          border-radius: 8px;
          background: var(--users-surface);
          color: var(--users-text);
          font: inherit;
          font-size: 12px;
          outline: none;
        }

        .users-input:focus,
        .users-select:focus {
          border-color: var(--users-primary);
          box-shadow: 0 0 0 3px var(--users-primary-soft);
        }

        .users-search {
          position: relative;
          min-width: 0;
        }

        .users-search > svg {
          position: absolute;
          top: 50%;
          left: 11px;
          transform: translateY(-50%);
          color: var(--users-muted);
          pointer-events: none;
        }

        .users-search .users-input {
          padding-left: 35px;
        }

        .users-results-count {
          margin-top: 12px;
          color: var(--users-muted);
          font-size: 11px;
        }

        .users-table-wrap {
          width: 100%;
          overflow-x: auto;
        }

        .users-table {
          width: 100%;
          min-width: 900px;
          border-collapse: collapse;
          text-align: left;
          font-size: 12px;
        }

        .users-table th {
          padding: 13px 14px;
          border-bottom: 1px solid var(--users-border);
          background: var(--users-bg);
          color: var(--users-muted);
          font-size: 10px;
          font-weight: 750;
          white-space: nowrap;
        }

        .users-table td {
          padding: 13px 14px;
          border-bottom: 1px solid var(--users-border);
          vertical-align: middle;
        }

        .users-table tbody tr:last-child td {
          border-bottom: 0;
        }

        .users-table tbody tr:hover {
          background: var(--users-bg);
        }

        .users-person {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 190px;
        }

        .users-avatar {
          display: grid;
          width: 36px;
          height: 36px;
          flex: 0 0 36px;
          place-items: center;
          border-radius: 10px;
          background: var(--users-primary-soft);
          color: var(--users-primary);
          font-size: 11px;
          font-weight: 750;
        }

        .users-person-name {
          color: var(--users-text);
          font-size: 12px;
          font-weight: 700;
        }

        .users-person-email {
          margin-top: 4px;
          color: var(--users-muted);
          font-size: 10px;
        }

        .users-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 9px;
          border: 1px solid var(--users-border);
          border-radius: 999px;
          background: var(--users-bg);
          color: var(--users-muted);
          font-size: 10px;
          font-weight: 700;
          white-space: nowrap;
        }

        .users-status::before {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
          content: "";
        }

        .users-status.active {
          border-color: #b9ebcd;
          background: var(--users-green-soft);
          color: var(--users-green);
        }

        .users-status.pending {
          border-color: #f3d58d;
          background: var(--users-amber-soft);
          color: var(--users-amber);
        }

        .users-status.suspended {
          border-color: #fecaca;
          background: var(--users-red-soft);
          color: var(--users-red);
        }

        .users-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .users-icon-button {
          width: 32px;
          height: 32px;
          padding: 0;
          border: 1px solid var(--users-border);
          border-radius: 8px;
          background: var(--users-surface);
          color: var(--users-muted);
          cursor: pointer;
        }

        .users-icon-button:hover {
          background: var(--users-bg);
          color: var(--users-text);
        }

        .users-icon-button.success {
          color: var(--users-green);
        }

        .users-icon-button.danger {
          color: var(--users-red);
        }

        .users-empty {
          padding: 38px 20px !important;
          color: var(--users-muted);
          text-align: center;
        }

        .users-empty strong {
          display: block;
          margin-top: 8px;
          color: var(--users-text);
        }

        .users-empty p {
          margin: 6px 0 0;
        }

        .users-bottom-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .users-panel {
          min-width: 0;
          padding: 19px;
          border: 1px solid var(--users-border);
          border-radius: 12px;
          background: var(--users-surface);
        }

        .users-panel-description {
          margin: 8px 0 0;
          color: var(--users-muted);
          font-size: 12px;
          line-height: 1.7;
        }

        .users-capability-list {
          display: grid;
          gap: 14px;
          margin: 17px 0 0;
          padding: 0;
          list-style: none;
        }

        .users-capability-list li {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          color: var(--users-muted);
          font-size: 12px;
          line-height: 1.5;
        }

        .users-capability-list svg {
          flex: 0 0 auto;
          margin-top: 1px;
          color: var(--users-primary);
        }

        .users-role-list {
          display: grid;
          gap: 9px;
          margin-top: 16px;
        }

        .users-role-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 12px;
          border: 1px solid var(--users-border);
          border-radius: 9px;
          color: var(--users-text);
          font-size: 12px;
        }

        .users-role-item svg {
          color: var(--users-primary);
          flex: 0 0 auto;
        }

        .users-overlay {
          position: fixed;
          z-index: 1000;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow-y: auto;
          padding: 20px;
          background: rgb(12 17 29 / 55%);
          backdrop-filter: blur(3px);
        }

        .users-dialog {
          width: 100%;
          max-width: 510px;
          max-height: calc(100vh - 40px);
          overflow-y: auto;
          padding: 23px;
          border: 1px solid var(--users-border);
          border-radius: 15px;
          background: var(--users-surface);
          box-shadow: 0 20px 70px rgb(0 0 0 / 18%);
        }

        .users-dialog-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 20px;
        }

        .users-dialog-header h2 {
          margin: 0;
          font-size: 19px;
          font-weight: 750;
        }

        .users-dialog-header p {
          margin: 6px 0 0;
          color: var(--users-muted);
          font-size: 12px;
          line-height: 1.6;
        }

        .users-form {
          display: grid;
          gap: 16px;
        }

        .users-field {
          display: grid;
          gap: 7px;
        }

        .users-field label {
          color: var(--users-text);
          font-size: 12px;
          font-weight: 650;
        }

        .users-dialog-actions {
          display: flex;
          justify-content: flex-end;
          flex-wrap: wrap;
          gap: 9px;
          margin-top: 22px;
        }

        .users-details {
          display: grid;
          gap: 0;
          margin: 0;
        }

        .users-detail-row {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          padding: 13px 0;
          border-bottom: 1px solid var(--users-border);
        }

        .users-detail-row dt {
          color: var(--users-muted);
          font-size: 12px;
        }

        .users-detail-row dd {
          margin: 0;
          color: var(--users-text);
          font-size: 12px;
          font-weight: 600;
          text-align: right;
          overflow-wrap: anywhere;
        }

        .users-demo-footer {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          gap: 10px;
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px solid var(--users-border);
          color: var(--users-muted);
          font-size: 10px;
        }

        @media (max-width: 1250px) {
          .users-filters {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 900px) {
          .users-metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .users-bottom-grid {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        @media (max-width: 600px) {
          .users-header {
            flex-direction: column;
          }

          .users-actions-top {
            width: 100%;
          }

          .users-filters {
            grid-template-columns: minmax(0, 1fr);
          }

          .users-dialog {
            padding: 17px;
          }

          .users-detail-row {
            flex-direction: column;
            gap: 6px;
          }

          .users-detail-row dd {
            text-align: left;
          }
        }

        @media (max-width: 390px) {
          .users-metrics {
            grid-template-columns: minmax(0, 1fr);
          }
        }
      `}</style>

      <header className="users-header">
        <div>
          <div className="users-breadcrumb">Administration / Users</div>
          <h1 className="users-title">User Management</h1>
          <p className="users-description">
            Manage platform users, account status, roles, organizational
            access, and authentication activity across ModelNow.
          </p>
        </div>

        <div className="users-actions-top">
          <button
            type="button"
            className="users-button"
            onClick={exportUsers}
          >
            <Download size={15} />
            Export CSV
          </button>

          <button
            type="button"
            className="users-button users-button-primary"
            onClick={() => {
              setNotice("");
              setShowAddForm(true);
            }}
          >
            <UserPlus size={16} />
            Add User
          </button>
        </div>
      </header>

      {notice && (
        <div
          role="status"
          className={`users-notice ${
            notice.includes("successfully") ? "success" : ""
          }`}
        >
          <div className="users-notice-content">
            {notice.includes("successfully") ? (
              <CheckCircle2 size={17} />
            ) : (
              <AlertTriangle size={17} />
            )}
            <span>{notice}</span>
          </div>
          <button
            type="button"
            className="users-notice-close"
            onClick={() => setNotice("")}
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="users-notice warning">
        <div className="users-notice-content">
          <ShieldCheck size={17} />
          <span>
            <strong>Demo mode:</strong> User records and account actions are
            temporary React state. Connect your backend to manage real accounts.
          </span>
        </div>
      </div>

      <section>
        <div className="users-section-heading">
          <h2>User Overview</h2>
          <p>
            Summary of accounts currently listed in this demonstration
            directory.
          </p>
        </div>

        <div className="users-metrics">
          {metrics.map((metric) => {
            const Icon = metric.icon;

            return (
              <article className="users-metric" key={metric.title}>
                <div className="users-metric-top">
                  <span className="users-metric-label">{metric.title}</span>
                  <span className={`users-metric-icon ${metric.color}`}>
                    <Icon size={18} />
                  </span>
                </div>
                <div className="users-metric-value">
                  {metric.value.toLocaleString()}
                </div>
                <div className="users-metric-description">
                  {metric.description}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="users-directory">
        <div className="users-directory-header">
          <h2>User Directory</h2>
          <p>
            Search accounts, filter by role or status, and inspect account
            details.
          </p>

          <div className="users-filters">
            <div className="users-search">
              <Search size={16} />
              <input
                className="users-input"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, email, ID..."
                aria-label="Search users"
              />
            </div>

            <select
              className="users-select"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by status"
            >
              <option value="All">All statuses</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Suspended">Suspended</option>
            </select>

            <select
              className="users-select"
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              aria-label="Filter by role"
            >
              <option value="All">All roles</option>
              {roles.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              className="users-select"
              value={organizationFilter}
              onChange={(event) => setOrganizationFilter(event.target.value)}
              aria-label="Filter by organization"
            >
              <option value="All">All organizations</option>
              {organizations.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="users-button"
              onClick={resetFilters}
            >
              <RotateCcw size={14} />
              Reset
            </button>
          </div>

          <div className="users-results-count">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </div>

        <div className="users-table-wrap">
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>User ID</th>
                <th>Role</th>
                <th>Organization</th>
                <th>Status</th>
                <th>Last Active</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="users-person">
                      <div className="users-avatar">
                        {user.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <div className="users-person-name">{user.name}</div>
                        <div className="users-person-email">{user.email}</div>
                      </div>
                    </div>
                  </td>

                  <td>{user.id}</td>
                  <td>{user.role}</td>
                  <td>{user.organization}</td>

                  <td>
                    <span className={`users-status ${user.status.toLowerCase()}`}>
                      {user.status}
                    </span>
                  </td>

                  <td>{user.lastActive}</td>

                  <td>
                    <div className="users-actions">
                      <button
                        type="button"
                        className="users-icon-button"
                        title="View user details"
                        aria-label={`View ${user.name}`}
                        onClick={() => setSelectedUser(user)}
                      >
                        <Eye size={15} />
                      </button>

                      {user.status === "Pending" ? (
                        <button
                          type="button"
                          className="users-icon-button success"
                          title="Activate user"
                          aria-label={`Activate ${user.name}`}
                          onClick={() => updateUserStatus(user, "Active")}
                        >
                          <CheckCircle2 size={15} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          className={`users-icon-button ${
                            user.status === "Active" ? "danger" : "success"
                          }`}
                          title={
                            user.status === "Suspended"
                              ? "Reactivate user"
                              : "Suspend user"
                          }
                          aria-label={
                            user.status === "Suspended"
                              ? `Reactivate ${user.name}`
                              : `Suspend ${user.name}`
                          }
                          onClick={() =>
                            updateUserStatus(
                              user,
                              user.status === "Suspended"
                                ? "Active"
                                : "Suspended"
                            )
                          }
                        >
                          {user.status === "Suspended" ? (
                            <CheckCircle2 size={15} />
                          ) : (
                            <Ban size={15} />
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="users-empty">
                    <Search size={24} style={{ margin: "0 auto" }} />
                    <strong>No users found</strong>
                    <p>Try changing your search term or filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="users-bottom-grid">
        <article className="users-panel">
          <h2>User Management Capabilities</h2>
          <p className="users-panel-description">
            Core functions available in the current frontend demonstration.
          </p>

          <ul className="users-capability-list">
            {[
              "User registration and activation",
              "Role and permission assignment",
              "Organization membership management",
              "Account suspension and reactivation",
              "Privileged user management",
              "Identity and access governance",
            ].map((item) => (
              <li key={item}>
                <CheckCircle2 size={16} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="users-panel">
          <h2>Access Management</h2>
          <p className="users-panel-description">
            These roles are demonstration entries. Actual authorization must
            be enforced and verified by the backend.
          </p>

          <div className="users-role-list">
            {roles.map((item) => (
              <div className="users-role-item" key={item}>
                <ShieldCheck size={17} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <footer className="users-demo-footer">
        <span>ModelNow Admin · User Management</span>
        <span>Frontend demonstration · Backend integration pending</span>
      </footer>

      {showAddForm && (
        <div
          className="users-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowAddForm(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-user-title"
            className="users-dialog"
          >
            <div className="users-dialog-header">
              <div>
                <h2 id="add-user-title">Add User</h2>
                <p>Create a temporary entry in the demo directory.</p>
              </div>
              <button
                type="button"
                className="users-icon-button"
                onClick={closeDialogs}
                aria-label="Close add user form"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={addUser} className="users-form">
              <div className="users-field">
                <label htmlFor="user-name">Full name</label>
                <input
                  id="user-name"
                  className="users-input"
                  required
                  minLength={2}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter full name"
                />
              </div>

              <div className="users-field">
                <label htmlFor="user-email">Email address</label>
                <input
                  id="user-email"
                  className="users-input"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@company.com"
                />
              </div>

              <div className="users-field">
                <label htmlFor="user-role">Role</label>
                <select
                  id="user-role"
                  className="users-select"
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                >
                  {roles.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="users-field">
                <label htmlFor="user-organization">Organization</label>
                <select
                  id="user-organization"
                  className="users-select"
                  value={organization}
                  onChange={(event) => setOrganization(event.target.value)}
                >
                  {organizations.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="users-dialog-actions">
                <button
                  type="button"
                  className="users-button"
                  onClick={closeDialogs}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="users-button users-button-primary"
                >
                  <UserPlus size={15} />
                  Add Demo User
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {selectedUser && (
        <div
          className="users-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedUser(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-details-title"
            className="users-dialog"
          >
            <div className="users-dialog-header">
              <div>
                <h2 id="user-details-title">User Details</h2>
                <p>{selectedUser.id}</p>
              </div>
              <button
                type="button"
                className="users-icon-button"
                onClick={() => setSelectedUser(null)}
                aria-label="Close user details"
              >
                <X size={18} />
              </button>
            </div>

            <div className="users-notice">
              <div className="users-notice-content">
                <UserRound size={18} />
                <span>
                  Account information shown here is local demo data.
                </span>
              </div>
            </div>

            <dl className="users-details">
              {[
                ["Name", selectedUser.name],
                ["Email", selectedUser.email],
                ["Role", selectedUser.role],
                ["Organization", selectedUser.organization],
                ["Status", selectedUser.status],
                ["Last active", selectedUser.lastActive],
              ].map(([label, value]) => (
                <div className="users-detail-row" key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>

            <div className="users-dialog-actions">
              {selectedUser.status === "Pending" ? (
                <button
                  type="button"
                  className="users-button users-button-primary"
                  onClick={() => updateUserStatus(selectedUser, "Active")}
                >
                  <CheckCircle2 size={15} />
                  Activate User
                </button>
              ) : (
                <button
                  type="button"
                  className="users-button"
                  onClick={() =>
                    updateUserStatus(
                      selectedUser,
                      selectedUser.status === "Suspended"
                        ? "Active"
                        : "Suspended"
                    )
                  }
                >
                  {selectedUser.status === "Suspended"
                    ? "Reactivate User"
                    : "Suspend User"}
                </button>
              )}

              <button
                type="button"
                className="users-button"
                onClick={() => setSelectedUser(null)}
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
