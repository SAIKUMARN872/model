
"use client";

import { useState } from "react";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Download,
  Save,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  Mail,
  UserCheck,
  UserX,
  Settings2,
  X,
} from "lucide-react";

type UserRecord = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  department: string;
  lastActive: string;
};

const initialUsers: UserRecord[] = [
  { id: 1, name: "Admin User", email: "admin@modelnow.ai", role: "Super Admin", status: "Active", department: "Administration", lastActive: "Just now" },
  { id: 2, name: "Alex Morgan", email: "alex@modelnow.ai", role: "Admin", status: "Active", department: "Operations", lastActive: "10 minutes ago" },
  { id: 3, name: "Sarah Johnson", email: "sarah@modelnow.ai", role: "Support", status: "Active", department: "Customer Support", lastActive: "1 hour ago" },
  { id: 4, name: "David Wilson", email: "david@modelnow.ai", role: "Analyst", status: "Inactive", department: "Analytics", lastActive: "5 days ago" },
  { id: 5, name: "Emily Davis", email: "emily@modelnow.ai", role: "Developer", status: "Active", department: "Engineering", lastActive: "Yesterday" },
];

type UserDefaults = {
  defaultRole: string;
  defaultStatus: string;
  allowSelfRegistration: boolean;
  requireEmailVerification: boolean;
  allowProfileUpdates: boolean;
  enableUserNotifications: boolean;
  requireStrongPasswords: boolean;
};

const initialDefaults: UserDefaults = {
  defaultRole: "User",
  defaultStatus: "Pending",
  allowSelfRegistration: true,
  requireEmailVerification: true,
  allowProfileUpdates: true,
  enableUserNotifications: true,
  requireStrongPasswords: true,
};

export default function UserSettingsPage() {
  const [users, setUsers] = useState<UserRecord[]>(initialUsers);
  const [defaults, setDefaults] = useState<UserDefaults>(initialDefaults);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("directory");
  const [showCreate, setShowCreate] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState("");
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "User",
    department: "General",
  });

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      `${user.name} ${user.email} ${user.department}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || user.status === statusFilter;

    const matchesRole = roleFilter === "All" || user.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  const activeCount = users.filter((user) => user.status === "Active").length;
  const inactiveCount = users.filter((user) => user.status === "Inactive").length;
  const pendingCount = users.filter((user) => user.status === "Pending").length;

  function updateDefault<K extends keyof UserDefaults>(
    key: K,
    value: UserDefaults[K],
  ) {
    setDefaults((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  function saveSettings() {
    try {
      localStorage.setItem("modelnow-user-settings", JSON.stringify(defaults));
      localStorage.setItem("modelnow-user-directory", JSON.stringify(users));
      setSaved(true);
      setNotice("User settings saved in this browser.");
    } catch {
      setNotice("Unable to save settings in this browser.");
    }
  }

  function resetSettings() {
    setDefaults(initialDefaults);
    setSaved(false);
    setNotice("");
  }

  function createUser() {
    if (!newUser.name.trim() || !newUser.email.trim()) {
      setNotice("Enter both the user's name and email address.");
      return;
    }

    if (users.some((user) => user.email.toLowerCase() === newUser.email.trim().toLowerCase())) {
      setNotice("A user with this email address already exists.");
      return;
    }

    const user: UserRecord = {
      id: Math.max(0, ...users.map((item) => item.id)) + 1,
      name: newUser.name.trim(),
      email: newUser.email.trim(),
      role: newUser.role,
      status: "Pending",
      department: newUser.department.trim() || "General",
      lastActive: "Never",
    };

    setUsers((current) => [user, ...current]);
    setNewUser({ name: "", email: "", role: "User", department: "General" });
    setShowCreate(false);
    setNotice("User added to the local directory. Save settings to retain it in this browser.");
    setSaved(false);
  }

  function toggleUserStatus(id: number) {
    setUsers((current) =>
      current.map((user) =>
        user.id === id
          ? {
              ...user,
              status: user.status === "Active" ? "Inactive" : "Active",
            }
          : user,
      ),
    );
    setSaved(false);
    setNotice("User status changed locally. Save settings to retain the change.");
  }

  function exportUsers() {
    const header = ["Name", "Email", "Role", "Status", "Department", "Last Active"];
    const rows = users.map((user) => [
      user.name,
      user.email,
      user.role,
      user.status,
      user.department,
      user.lastActive,
    ]);
    const csv = [header, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "modelnow-users.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function PreferenceToggle({
    title,
    description,
    checked,
    onChange,
  }: {
    title: string;
    description: string;
    checked: boolean;
    onChange: (value: boolean) => void;
  }) {
    return (
      <div className="us-toggle-row">
        <div className="us-toggle-copy">
          <strong>{title}</strong>
          <p>{description}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={title}
          className={`us-switch ${checked ? "active" : ""}`}
          onClick={() => onChange(!checked)}
        />
      </div>
    );
  }

  return (
    <main className="us-page">
      <style>{`
        * { box-sizing: border-box; }

        .us-page {
          min-height: 100vh;
          padding: 30px;
          background: #f7f8fc;
          color: #182238;
          font-family: Arial, Helvetica, sans-serif;
        }

        .us-container { max-width: 1250px; margin: 0 auto; }

        .us-breadcrumb {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
          margin-bottom: 22px;
          color: #81899b;
          font-size: 13px;
        }

        .us-breadcrumb a { color: #5266d9; text-decoration: none; }

        .us-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 25px;
        }

        .us-heading-main { display: flex; align-items: center; gap: 14px; }

        .us-heading-icon {
          display: grid;
          place-items: center;
          width: 50px;
          height: 50px;
          flex-shrink: 0;
          border-radius: 14px;
          background: #e9edff;
          color: #5265d9;
        }

        .us-heading h1 { margin: 0 0 7px; font-size: 27px; letter-spacing: -.6px; }

        .us-heading p {
          margin: 0;
          color: #7c8598;
          font-size: 13px;
          line-height: 1.6;
        }

        .us-actions { display: flex; flex-wrap: wrap; gap: 10px; }

        .us-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 40px;
          padding: 0 14px;
          border: 1px solid #dfe4ed;
          border-radius: 9px;
          background: white;
          color: #3d4860;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        .us-button.primary { background: #5265d9; color: white; border-color: #5265d9; }
        .us-button:hover { opacity: .9; }

        .us-notice {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 18px;
          padding: 13px 15px;
          border: 1px solid #dce4ff;
          border-radius: 10px;
          background: #f0f3ff;
          color: #4055b5;
          font-size: 13px;
        }

        .us-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 15px;
          margin-bottom: 23px;
        }

        .us-stat {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 19px;
          border: 1px solid #e7eaf1;
          border-radius: 13px;
          background: white;
        }

        .us-stat-icon {
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          flex-shrink: 0;
          border-radius: 11px;
          background: #f0f2ff;
          color: #5265d9;
        }

        .us-stat-label { margin-bottom: 6px; color: #7f889a; font-size: 11px; }
        .us-stat-value { color: #202a40; font-size: 23px; font-weight: 700; }

        .us-tabs {
          display: flex;
          gap: 7px;
          padding: 6px;
          margin-bottom: 18px;
          border: 1px solid #e7eaf1;
          border-radius: 11px;
          background: white;
          width: fit-content;
          max-width: 100%;
        }

        .us-tab {
          padding: 10px 15px;
          border: 0;
          border-radius: 7px;
          background: transparent;
          color: #6f7890;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        .us-tab.active { background: #edf0ff; color: #485dd0; }

        .us-card {
          overflow: hidden;
          border: 1px solid #e7eaf1;
          border-radius: 14px;
          background: white;
          box-shadow: 0 2px 7px rgba(24,36,70,.025);
        }

        .us-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 20px 22px;
          border-bottom: 1px solid #edf0f5;
        }

        .us-card-header h2 { margin: 0 0 5px; font-size: 15px; }
        .us-card-header p { margin: 0; color: #858da0; font-size: 12px; line-height: 1.5; }

        .us-toolbar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px;
          padding: 16px 22px;
          border-bottom: 1px solid #edf0f5;
        }

        .us-search {
          position: relative;
          flex: 1 1 220px;
          min-width: 180px;
        }

        .us-search svg {
          position: absolute;
          top: 12px;
          left: 12px;
          color: #929bad;
        }

        .us-search input {
          width: 100%;
          height: 40px;
          padding: 0 12px 0 37px;
          border: 1px solid #dfe4ed;
          border-radius: 8px;
          outline: none;
          font-size: 12px;
        }

        .us-search input:focus, .us-toolbar select:focus {
          border-color: #6576e7;
          box-shadow: 0 0 0 3px rgba(101,118,231,.1);
        }

        .us-toolbar select {
          height: 40px;
          max-width: 100%;
          padding: 0 10px;
          border: 1px solid #dfe4ed;
          border-radius: 8px;
          background: white;
          color: #48536b;
          font-size: 12px;
          outline: none;
        }

        .us-table-wrap { overflow-x: auto; }

        .us-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          white-space: nowrap;
        }

        .us-table th {
          padding: 14px 18px;
          background: #fafbfe;
          color: #7f889a;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .5px;
          text-transform: uppercase;
        }

        .us-table td {
          padding: 15px 18px;
          border-top: 1px solid #edf0f5;
          color: #4b566d;
          font-size: 12px;
        }

        .us-user-cell { display: flex; align-items: center; gap: 11px; }

        .us-avatar {
          display: grid;
          place-items: center;
          width: 36px;
          height: 36px;
          flex-shrink: 0;
          border-radius: 10px;
          background: #edf0ff;
          color: #5265d9;
          font-size: 12px;
          font-weight: 700;
        }

        .us-user-name { margin-bottom: 4px; color: #263149; font-weight: 700; }
        .us-user-email { color: #8991a2; font-size: 11px; }

        .us-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 9px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 700;
        }

        .us-status::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
        .us-status.active { background: #eaf9f0; color: #218552; }
        .us-status.inactive { background: #f0f1f5; color: #727b8e; }
        .us-status.pending { background: #fff5e5; color: #a9690b; }

        .us-row-actions { display: flex; gap: 7px; }

        .us-icon-button {
          display: grid;
          place-items: center;
          width: 31px;
          height: 31px;
          border: 1px solid #e4e8f0;
          border-radius: 7px;
          background: white;
          color: #66718a;
          cursor: pointer;
        }

        .us-icon-button:hover { background: #f3f5ff; color: #5265d9; }

        .us-empty { padding: 42px 20px; text-align: center; color: #858da0; font-size: 13px; }

        .us-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
          padding: 22px;
        }

        .us-field { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
        .us-field.full { grid-column: 1 / -1; }
        .us-field label { color: #39445a; font-size: 12px; font-weight: 700; }

        .us-field input, .us-field select {
          width: 100%;
          height: 42px;
          padding: 0 12px;
          border: 1px solid #dfe4ed;
          border-radius: 8px;
          outline: none;
          background: white;
          color: #202a40;
          font-size: 13px;
        }

        .us-field input:focus, .us-field select:focus {
          border-color: #6576e7;
          box-shadow: 0 0 0 3px rgba(101,118,231,.1);
        }

        .us-toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 17px 22px;
          border-bottom: 1px solid #edf0f5;
        }

        .us-toggle-row:last-child { border-bottom: 0; }
        .us-toggle-copy strong { display: block; margin-bottom: 5px; font-size: 12px; }
        .us-toggle-copy p { margin: 0; color: #858da0; font-size: 11px; line-height: 1.6; }

        .us-switch {
          position: relative;
          flex: 0 0 auto;
          width: 38px;
          height: 22px;
          padding: 0;
          border: 0;
          border-radius: 20px;
          background: #cbd1dd;
          cursor: pointer;
        }

        .us-switch.active { background: #5265d9; }

        .us-switch::after {
          content: "";
          position: absolute;
          top: 3px;
          left: 3px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          transition: transform .15s ease;
        }

        .us-switch.active::after { transform: translateX(16px); }

        .us-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 16px 22px;
          border-top: 1px solid #edf0f5;
          color: #858da0;
          font-size: 11px;
        }

        .us-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 50;
          display: grid;
          place-items: center;
          padding: 20px;
          background: rgba(20,28,48,.45);
        }

        .us-modal {
          width: 100%;
          max-width: 540px;
          overflow: hidden;
          border: 1px solid #e7eaf1;
          border-radius: 15px;
          background: white;
          box-shadow: 0 20px 70px rgba(20,28,48,.2);
        }

        .us-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 22px;
          border-bottom: 1px solid #edf0f5;
        }

        .us-modal-header h2 { margin: 0; font-size: 17px; }
        .us-modal-body { padding: 22px; }
        .us-modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 22px; }

        @media (max-width: 1000px) {
          .us-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }

        @media (max-width: 650px) {
          .us-page { padding: 18px 12px; }
          .us-heading { flex-direction: column; }
          .us-heading h1 { font-size: 23px; }
          .us-actions { width: 100%; }
          .us-button { flex: 1; }
          .us-tabs { width: 100%; overflow-x: auto; }
          .us-tab { white-space: nowrap; }
          .us-card-header { align-items: flex-start; flex-direction: column; }
          .us-form-grid { grid-template-columns: 1fr; padding: 17px; }
          .us-field.full { grid-column: auto; }
          .us-footer { align-items: flex-start; flex-direction: column; }
        }
      `}</style>

      <div className="us-container">
        <div className="us-breadcrumb">
          <a href="/dashboard">Admin</a>
          <span>/</span>
          <a href="/settings">Settings</a>
          <span>/</span>
          <span>User Settings</span>
        </div>

        <header className="us-heading">
          <div className="us-heading-main">
            <div className="us-heading-icon"><Users size={24} /></div>
            <div>
              <h1>User Settings</h1>
              <p>
                Manage user defaults, account policies, registration,
                and the administrative user directory.
              </p>
            </div>
          </div>

          <div className="us-actions">
            <button type="button" className="us-button" onClick={exportUsers}>
              <Download size={15} />
              Export Users
            </button>
            <button
              type="button"
              className="us-button primary"
              onClick={() => {
                setNotice("");
                setShowCreate(true);
              }}
            >
              <UserPlus size={15} />
              Add User
            </button>
          </div>
        </header>

        {notice && (
          <div className="us-notice" role="status">
            <CheckCircle2 size={17} />
            {notice}
          </div>
        )}

        <section className="us-stats">
          <div className="us-stat">
            <div className="us-stat-icon"><Users size={20} /></div>
            <div>
              <div className="us-stat-label">Total Users</div>
              <div className="us-stat-value">{users.length}</div>
            </div>
          </div>
          <div className="us-stat">
            <div className="us-stat-icon"><UserCheck size={20} /></div>
            <div>
              <div className="us-stat-label">Active Users</div>
              <div className="us-stat-value">{activeCount}</div>
            </div>
          </div>
          <div className="us-stat">
            <div className="us-stat-icon"><UserX size={20} /></div>
            <div>
              <div className="us-stat-label">Inactive Users</div>
              <div className="us-stat-value">{inactiveCount}</div>
            </div>
          </div>
          <div className="us-stat">
            <div className="us-stat-icon"><Mail size={20} /></div>
            <div>
              <div className="us-stat-label">Pending Users</div>
              <div className="us-stat-value">{pendingCount}</div>
            </div>
          </div>
        </section>

        <div className="us-tabs">
          <button
            type="button"
            className={`us-tab ${activeTab === "directory" ? "active" : ""}`}
            onClick={() => setActiveTab("directory")}
          >
            User Directory
          </button>
          <button
            type="button"
            className={`us-tab ${activeTab === "defaults" ? "active" : ""}`}
            onClick={() => setActiveTab("defaults")}
          >
            User Defaults
          </button>
          <button
            type="button"
            className={`us-tab ${activeTab === "policies" ? "active" : ""}`}
            onClick={() => setActiveTab("policies")}
          >
            Account Policies
          </button>
        </div>

        {activeTab === "directory" && (
          <section className="us-card">
            <div className="us-card-header">
              <div>
                <h2>Platform Users</h2>
                <p>Search, filter, export, and manage the local user directory.</p>
              </div>
              <button
                type="button"
                className="us-button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("All");
                  setRoleFilter("All");
                }}
              >
                <RotateCcw size={14} />
                Clear Filters
              </button>
            </div>

            <div className="us-toolbar">
              <div className="us-search">
                <Search size={16} />
                <input
                  aria-label="Search users"
                  placeholder="Search by name, email, or department..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Filter size={15} color="#858da0" />
              <select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
              </select>
              <select
                aria-label="Filter by role"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="All">All roles</option>
                <option value="Super Admin">Super Admin</option>
                <option value="Admin">Admin</option>
                <option value="Support">Support</option>
                <option value="Analyst">Analyst</option>
                <option value="Developer">Developer</option>
                <option value="User">User</option>
              </select>
            </div>

            <div className="us-table-wrap">
              <table className="us-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Last Active</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="us-user-cell">
                          <div className="us-avatar">
                            {user.name
                              .split(" ")
                              .map((part) => part[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div>
                            <div className="us-user-name">{user.name}</div>
                            <div className="us-user-email">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{user.role}</td>
                      <td>{user.department}</td>
                      <td>
                        <span className={`us-status ${user.status.toLowerCase()}`}>
                          {user.status}
                        </span>
                      </td>
                      <td>{user.lastActive}</td>
                      <td>
                        <div className="us-row-actions">
                          <button
                            type="button"
                            className="us-icon-button"
                            aria-label={`Toggle status for ${user.name}`}
                            title={user.status === "Active" ? "Deactivate user" : "Activate user"}
                            onClick={() => toggleUserStatus(user.id)}
                          >
                            {user.status === "Active" ? (
                              <UserX size={15} />
                            ) : (
                              <UserCheck size={15} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="us-empty">No users match your search or filters.</div>
              )}
            </div>

            <div className="us-footer">
              <span>Showing {filteredUsers.length} of {users.length} users</span>
              <span>Directory data is currently local demo data.</span>
            </div>
          </section>
        )}

        {activeTab === "defaults" && (
          <section className="us-card">
            <div className="us-card-header">
              <div>
                <h2>New User Defaults</h2>
                <p>Configure the default role and account status for new users.</p>
              </div>
              <Settings2 size={21} color="#5265d9" />
            </div>

            <div className="us-form-grid">
              <div className="us-field">
                <label htmlFor="defaultRole">Default User Role</label>
                <select
                  id="defaultRole"
                  value={defaults.defaultRole}
                  onChange={(e) => updateDefault("defaultRole", e.target.value)}
                >
                  <option value="User">User</option>
                  <option value="Analyst">Analyst</option>
                  <option value="Support">Support</option>
                  <option value="Developer">Developer</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div className="us-field">
                <label htmlFor="defaultStatus">Default Account Status</label>
                <select
                  id="defaultStatus"
                  value={defaults.defaultStatus}
                  onChange={(e) => updateDefault("defaultStatus", e.target.value)}
                >
                  <option value="Pending">Pending approval</option>
                  <option value="Active">Active immediately</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <PreferenceToggle
              title="Allow Self-Registration"
              description="Permit users to create accounts through the public registration page."
              checked={defaults.allowSelfRegistration}
              onChange={(value) => updateDefault("allowSelfRegistration", value)}
            />
            <PreferenceToggle
              title="Require Email Verification"
              description="Require email verification before an account is considered verified."
              checked={defaults.requireEmailVerification}
              onChange={(value) => updateDefault("requireEmailVerification", value)}
            />

            <div className="us-footer">
              <span>Changes apply to configuration values on this page.</span>
              <button type="button" className="us-button primary" onClick={saveSettings}>
                <Save size={14} />
                Save Defaults
              </button>
            </div>
          </section>
        )}

        {activeTab === "policies" && (
          <section className="us-card">
            <div className="us-card-header">
              <div>
                <h2>Account Policies</h2>
                <p>Configure intended account, profile, and security requirements.</p>
              </div>
              <ShieldCheck size={22} color="#5265d9" />
            </div>

            <PreferenceToggle
              title="Allow Profile Updates"
              description="Allow users to update their own profile details."
              checked={defaults.allowProfileUpdates}
              onChange={(value) => updateDefault("allowProfileUpdates", value)}
            />
            <PreferenceToggle
              title="User Notifications"
              description="Enable the user notification preference for account-related messages."
              checked={defaults.enableUserNotifications}
              onChange={(value) => updateDefault("enableUserNotifications", value)}
            />
            <PreferenceToggle
              title="Require Strong Passwords"
              description="Set the policy expectation that accounts use strong passwords. Enforcement requires backend validation."
              checked={defaults.requireStrongPasswords}
              onChange={(value) => updateDefault("requireStrongPasswords", value)}
            />

            <div className="us-footer">
              <span>Security policies must also be enforced by the backend.</span>
              <button type="button" className="us-button primary" onClick={saveSettings}>
                <Save size={14} />
                Save Policies
              </button>
            </div>
          </section>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
          <button
            type="button"
            className="us-button"
            onClick={() => {
              resetSettings();
              setNotice("User settings defaults restored. Save to persist them in this browser.");
            }}
          >
            <RotateCcw size={14} />
            Reset User Settings
          </button>
        </div>
      </div>

      {showCreate && (
        <div
          className="us-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowCreate(false);
          }}
        >
          <section
            className="us-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="us-create-title"
          >
            <div className="us-modal-header">
              <h2 id="us-create-title">Add User</h2>
              <button
                type="button"
                className="us-icon-button"
                aria-label="Close dialog"
                onClick={() => setShowCreate(false)}
              >
                <X size={17} />
              </button>
            </div>

            <div className="us-modal-body">
              <div className="us-form-grid" style={{ padding: 0 }}>
                <div className="us-field full">
                  <label htmlFor="newName">Full Name</label>
                  <input
                    id="newName"
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser((current) => ({ ...current, name: e.target.value }))
                    }
                    placeholder="Enter full name"
                  />
                </div>

                <div className="us-field full">
                  <label htmlFor="newEmail">Email Address</label>
                  <input
                    id="newEmail"
                    type="email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser((current) => ({ ...current, email: e.target.value }))
                    }
                    placeholder="name@example.com"
                  />
                </div>

                <div className="us-field">
                  <label htmlFor="newRole">Role</label>
                  <select
                    id="newRole"
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser((current) => ({ ...current, role: e.target.value }))
                    }
                  >
                    <option value="User">User</option>
                    <option value="Analyst">Analyst</option>
                    <option value="Support">Support</option>
                    <option value="Developer">Developer</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div className="us-field">
                  <label htmlFor="newDepartment">Department</label>
                  <input
                    id="newDepartment"
                    value={newUser.department}
                    onChange={(e) =>
                      setNewUser((current) => ({
                        ...current,
                        department: e.target.value,
                      }))
                    }
                    placeholder="General"
                  />
                </div>
              </div>

              <div className="us-modal-actions">
                <button
                  type="button"
                  className="us-button"
                  onClick={() => setShowCreate(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="us-button primary"
                  onClick={createUser}
                >
                  <UserPlus size={14} />
                  Add User
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
