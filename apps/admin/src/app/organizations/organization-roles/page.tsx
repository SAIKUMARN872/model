
"use client";

import { useMemo, useState, type CSSProperties } from "react";
import {
  ShieldCheck,
  Search,
  Plus,
  X,
  Pencil,
  Trash2,
  Users,
  LockKeyhole,
  Check,
  ChevronRight,
  RefreshCw,
  Eye,
  Copy,
  Settings2,
} from "lucide-react";

type Permission = {
  id: string;
  label: string;
  description: string;
  category: string;
};

type OrganizationRole = {
  id: string;
  name: string;
  description: string;
  access: "System" | "Custom";
  members: number;
  permissions: string[];
  updatedAt: string;
};

const permissions: Permission[] = [
  { id: "org.view", label: "View organization", description: "View organization profile and settings.", category: "Organization" },
  { id: "org.manage", label: "Manage organization", description: "Edit organization details and configuration.", category: "Organization" },
  { id: "members.view", label: "View members", description: "View members and their access.", category: "Members" },
  { id: "members.manage", label: "Manage members", description: "Invite, edit, suspend, and remove members.", category: "Members" },
  { id: "roles.view", label: "View roles", description: "View role definitions and permissions.", category: "Access control" },
  { id: "roles.manage", label: "Manage roles", description: "Create roles and change permissions.", category: "Access control" },
  { id: "projects.view", label: "View projects", description: "Access organization projects.", category: "Projects & API" },
  { id: "projects.manage", label: "Manage projects", description: "Create and configure projects.", category: "Projects & API" },
  { id: "api.view", label: "View API keys", description: "View API key metadata and usage.", category: "Projects & API" },
  { id: "api.manage", label: "Manage API keys", description: "Create, rotate, and revoke API keys.", category: "Projects & API" },
  { id: "billing.view", label: "View billing", description: "View plans, invoices, and usage costs.", category: "Billing" },
  { id: "billing.manage", label: "Manage billing", description: "Change subscriptions and billing details.", category: "Billing" },
  { id: "audit.view", label: "View audit logs", description: "Review organization activity and audit events.", category: "Security" },
  { id: "security.manage", label: "Manage security", description: "Configure security policies and access controls.", category: "Security" },
];

const allPermissionIds = permissions.map((permission) => permission.id);

const initialRoles: OrganizationRole[] = [
  {
    id: "ROLE-001",
    name: "Owner",
    description: "Full control over the organization, members, billing, and security.",
    access: "System",
    members: 1,
    permissions: allPermissionIds,
    updatedAt: "Nov 01, 2026",
  },
  {
    id: "ROLE-002",
    name: "Admin",
    description: "Manage members, projects, API access, and organization settings.",
    access: "System",
    members: 4,
    permissions: [
      "org.view", "org.manage", "members.view", "members.manage",
      "roles.view", "projects.view", "projects.manage", "api.view",
      "api.manage", "billing.view", "audit.view",
    ],
    updatedAt: "Oct 30, 2026",
  },
  {
    id: "ROLE-003",
    name: "Developer",
    description: "Build projects and manage development API resources.",
    access: "System",
    members: 18,
    permissions: [
      "org.view", "members.view", "projects.view", "projects.manage",
      "api.view", "api.manage",
    ],
    updatedAt: "Oct 28, 2026",
  },
  {
    id: "ROLE-004",
    name: "Member",
    description: "Standard workspace access for everyday collaboration.",
    access: "System",
    members: 42,
    permissions: [
      "org.view", "members.view", "projects.view",
    ],
    updatedAt: "Oct 25, 2026",
  },
  {
    id: "ROLE-005",
    name: "Viewer",
    description: "Read-only access to permitted organization resources.",
    access: "System",
    members: 12,
    permissions: [
      "org.view", "members.view", "projects.view",
    ],
    updatedAt: "Oct 22, 2026",
  },
];

const emptyRole = {
  name: "",
  description: "",
  permissions: [] as string[],
};

const cardStyle: CSSProperties = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 20,
};

export default function OrganizationRolesPage() {
  const [roles, setRoles] = useState<OrganizationRole[]>(initialRoles);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selectedRole, setSelectedRole] = useState<OrganizationRole | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyRole);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const customCount = roles.filter((role) => role.access === "Custom").length;
  const totalAssignments = roles.reduce((sum, role) => sum + role.members, 0);
  const categories = [...new Set(permissions.map((permission) => permission.category))];

  const filteredRoles = useMemo(() => {
    const query = search.trim().toLowerCase();

    return roles.filter((role) => {
      const matchesSearch =
        !query ||
        role.name.toLowerCase().includes(query) ||
        role.description.toLowerCase().includes(query) ||
        role.id.toLowerCase().includes(query);

      const matchesType =
        typeFilter === "All" || role.access === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [roles, search, typeFilter]);

  function notify(message: string) {
    setNotice(message);
  }

  function openCreate() {
    setEditingId(null);
    setForm(emptyRole);
    setError("");
    setModalOpen(true);
  }

  function openEdit(role: OrganizationRole) {
    if (role.access === "System") {
      notify("System roles cannot be edited in this preview.");
      return;
    }

    setEditingId(role.id);
    setForm({
      name: role.name,
      description: role.description,
      permissions: [...role.permissions],
    });
    setError("");
    setModalOpen(true);
  }

  function saveRole(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const name = form.name.trim();

    if (!name) {
      setError("Enter a role name.");
      return;
    }

    if (!form.permissions.length) {
      setError("Select at least one permission.");
      return;
    }

    const duplicate = roles.some(
      (role) =>
        role.name.toLowerCase() === name.toLowerCase() &&
        role.id !== editingId,
    );

    if (duplicate) {
      setError("A role with this name already exists.");
      return;
    }

    const now = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }).format(new Date());

    if (editingId) {
      setRoles((current) =>
        current.map((role) =>
          role.id === editingId
            ? {
                ...role,
                name,
                description: form.description.trim(),
                permissions: [...form.permissions],
                updatedAt: now,
              }
            : role,
        ),
      );
      notify("Custom role updated.");
    } else {
      const newRole: OrganizationRole = {
        id: `ROLE-${Date.now().toString().slice(-6)}`,
        name,
        description: form.description.trim(),
        access: "Custom",
        members: 0,
        permissions: [...form.permissions],
        updatedAt: now,
      };

      setRoles((current) => [newRole, ...current]);
      notify("Custom role created.");
    }

    setModalOpen(false);
  }

  function deleteRole(role: OrganizationRole) {
    if (role.access === "System") {
      notify("System roles cannot be deleted.");
      return;
    }

    if (role.members > 0) {
      notify("Reassign members before deleting this role.");
      return;
    }

    if (!window.confirm(`Delete the custom role "${role.name}"?`)) return;

    setRoles((current) => current.filter((item) => item.id !== role.id));
    setSelectedRole(null);
    notify("Custom role deleted.");
  }

  function duplicateRole(role: OrganizationRole) {
    const duplicate: OrganizationRole = {
      ...role,
      id: `ROLE-${Date.now().toString().slice(-6)}`,
      name: `${role.name} Copy`,
      access: "Custom",
      members: 0,
      permissions: [...role.permissions],
      updatedAt: new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }).format(new Date()),
    };

    setRoles((current) => [duplicate, ...current]);
    notify(`Created "${duplicate.name}". You can now edit it.`);
  }

  function togglePermission(permissionId: string) {
    setForm((current) => ({
      ...current,
      permissions: current.permissions.includes(permissionId)
        ? current.permissions.filter((id) => id !== permissionId)
        : [...current.permissions, permissionId],
    }));
  }

  function toggleCategory(category: string, checked: boolean) {
    const ids = permissions
      .filter((permission) => permission.category === category)
      .map((permission) => permission.id);

    setForm((current) => ({
      ...current,
      permissions: checked
        ? [...new Set([...current.permissions, ...ids])]
        : current.permissions.filter((id) => !ids.includes(id)),
    }));
  }

  function resetFilters() {
    setSearch("");
    setTypeFilter("All");
  }

  return (
    <main className="or-page">
      <style>{`
        * { box-sizing: border-box; }

        .or-page {
          min-height: 100vh;
          padding: 30px;
          background: #f7f8fc;
          color: #172033;
          font-family: Arial, Helvetica, sans-serif;
        }

        .or-shell { max-width: 1450px; margin: 0 auto; }

        .or-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 25px;
        }

        .or-eyebrow {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #64748b;
          font-size: 12px;
          margin-bottom: 10px;
        }

        .or-page h1 {
          font-size: 28px;
          letter-spacing: -.7px;
          margin: 0 0 8px;
          font-weight: 750;
        }

        .or-subtitle {
          margin: 0;
          color: #64748b;
          font-size: 14px;
          line-height: 1.6;
        }

        .or-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 13px;
          border: 1px solid #dbe1eb;
          border-radius: 9px;
          background: white;
          color: #344054;
          font-size: 13px;
          font-weight: 650;
          cursor: pointer;
          white-space: nowrap;
        }

        .or-btn:hover { background: #f8fafc; }
        .or-primary { background: #315fea; border-color: #315fea; color: white; }
        .or-primary:hover { background: #244ed1; }

        .or-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 15px;
          margin-bottom: 24px;
        }

        .or-stat-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          color: #64748b;
          font-size: 12px;
        }

        .or-stat-icon {
          width: 36px;
          height: 36px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          background: #eff4ff;
          color: #315fea;
        }

        .or-stat-value { margin-top: 15px; font-size: 27px; font-weight: 750; }
        .or-stat-foot { margin-top: 6px; color: #94a3b8; font-size: 12px; }

        .or-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.6fr) minmax(280px, .8fr);
          gap: 18px;
          align-items: start;
        }

        .or-panel {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          overflow: hidden;
        }

        .or-panel-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 20px;
          border-bottom: 1px solid #edf0f5;
        }

        .or-panel-head h2 { margin: 0 0 5px; font-size: 16px; }
        .or-panel-head p { margin: 0; color: #94a3b8; font-size: 12px; }

        .or-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          padding: 16px 20px;
          border-bottom: 1px solid #edf0f5;
        }

        .or-search { position: relative; flex: 1; min-width: 190px; }
        .or-search svg {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .or-search input {
          width: 100%;
          padding: 10px 12px 10px 37px;
          border: 1px solid #dfe4ec;
          border-radius: 9px;
          outline: none;
          font-size: 13px;
        }

        .or-select {
          min-width: 125px;
          padding: 10px 12px;
          border: 1px solid #dfe4ec;
          border-radius: 9px;
          background: white;
          color: #344054;
          font-size: 13px;
        }

        .or-table-wrap { overflow-x: auto; }
        .or-table { width: 100%; min-width: 600px; border-collapse: collapse; text-align: left; }

        .or-table th {
          padding: 13px 17px;
          background: #fafbfc;
          border-bottom: 1px solid #edf0f5;
          color: #64748b;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: .3px;
        }

        .or-table td {
          padding: 15px 17px;
          border-bottom: 1px solid #f0f2f6;
          font-size: 12px;
          vertical-align: middle;
        }

        .or-table tbody tr:last-child td { border-bottom: 0; }
        .or-table tbody tr:hover { background: #fafcff; }

        .or-role-cell { display: flex; align-items: center; gap: 11px; min-width: 180px; }
        .or-role-avatar {
          width: 39px;
          height: 39px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          border-radius: 11px;
          background: #eff4ff;
          color: #315fea;
        }

        .or-role-name { font-weight: 700; margin-bottom: 5px; }
        .or-muted { color: #94a3b8; font-size: 11px; }
        .or-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          border-radius: 20px;
          padding: 5px 9px;
          background: #eff4ff;
          color: #315fea;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
        }

        .or-badge-system { background: #f1f5f9; color: #475569; }
        .or-actions { display: flex; align-items: center; gap: 4px; }

        .or-icon-btn {
          width: 31px;
          height: 31px;
          display: inline-grid;
          place-items: center;
          border: 1px solid transparent;
          border-radius: 8px;
          background: transparent;
          color: #64748b;
          cursor: pointer;
        }

        .or-icon-btn:hover { color: #315fea; background: #f1f5f9; border-color: #e2e8f0; }

        .or-empty { padding: 45px 20px; text-align: center; color: #64748b; }

        .or-foot {
          padding: 14px 20px;
          border-top: 1px solid #edf0f5;
          display: flex;
          justify-content: space-between;
          gap: 12px;
          color: #94a3b8;
          font-size: 12px;
        }

        .or-permission-list { padding: 8px 20px 20px; }
        .or-permission-row {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          padding: 13px 0;
          border-bottom: 1px solid #f0f2f6;
        }

        .or-permission-row:last-child { border-bottom: 0; }
        .or-permission-check { color: #15803d; margin-top: 1px; }
        .or-permission-name { font-size: 12px; font-weight: 700; margin-bottom: 5px; }
        .or-permission-desc { color: #94a3b8; font-size: 11px; line-height: 1.5; }

        .or-notice {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
          padding: 12px 14px;
          border: 1px solid #bbf7d0;
          border-radius: 9px;
          background: #f0fdf4;
          color: #166534;
          font-size: 13px;
          overflow-wrap: anywhere;
        }

        .or-note {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          margin-top: 20px;
          padding: 13px 14px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          background: #f8fafc;
          color: #64748b;
          font-size: 12px;
          line-height: 1.6;
        }

        .or-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: grid;
          place-items: center;
          padding: 20px;
          background: #10182888;
          overflow-y: auto;
        }

        .or-modal {
          width: 100%;
          max-width: 720px;
          max-height: calc(100vh - 40px);
          overflow-y: auto;
          background: white;
          border-radius: 16px;
          box-shadow: 0 24px 70px #10182833;
        }

        .or-modal-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          padding: 22px;
          border-bottom: 1px solid #edf0f5;
        }

        .or-modal-head h2 { margin: 0 0 6px; font-size: 19px; }
        .or-modal-head p { margin: 0; color: #64748b; font-size: 12px; }
        .or-modal-body { padding: 22px; }

        .or-field { display: flex; flex-direction: column; gap: 7px; margin-bottom: 16px; }
        .or-field label { color: #475569; font-size: 12px; font-weight: 700; }
        .or-field input, .or-field textarea {
          width: 100%;
          padding: 11px 12px;
          border: 1px solid #dfe4ec;
          border-radius: 9px;
          outline: none;
          font: inherit;
          font-size: 13px;
        }

        .or-field input:focus, .or-field textarea:focus {
          border-color: #315fea;
          box-shadow: 0 0 0 3px #315fea16;
        }

        .or-permission-category { margin-top: 20px; }
        .or-category-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          padding: 12px;
          background: #f8fafc;
          border: 1px solid #edf0f5;
          border-radius: 9px;
          margin-bottom: 9px;
        }

        .or-category-title { font-size: 13px; font-weight: 700; }
        .or-check-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 11px 8px;
          cursor: pointer;
        }

        .or-check-row input { margin-top: 3px; accent-color: #315fea; }
        .or-check-title { font-size: 12px; font-weight: 650; margin-bottom: 4px; }
        .or-check-desc { font-size: 11px; color: #94a3b8; line-height: 1.5; }

        .or-error {
          margin-bottom: 15px;
          padding: 10px 12px;
          border: 1px solid #fecdca;
          border-radius: 8px;
          background: #fef3f2;
          color: #b42318;
          font-size: 12px;
        }

        .or-modal-foot {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 16px 22px;
          border-top: 1px solid #edf0f5;
        }

        .or-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .or-detail {
          padding: 13px;
          border: 1px solid #edf0f5;
          border-radius: 10px;
          min-width: 0;
        }

        .or-detail-label { color: #94a3b8; font-size: 11px; margin-bottom: 7px; }
        .or-detail-value { color: #172033; font-size: 13px; font-weight: 650; overflow-wrap: anywhere; }

        @media (max-width: 1100px) {
          .or-layout { grid-template-columns: 1fr; }
        }

        @media (max-width: 900px) {
          .or-page { padding: 22px; }
          .or-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }

        @media (max-width: 600px) {
          .or-page { padding: 15px; }
          .or-top { flex-direction: column; }
          .or-top > .or-btn { width: 100%; }
          .or-page h1 { font-size: 24px; }
          .or-stats { gap: 10px; }
          .or-stats > div { padding: 14px !important; }
          .or-stat-value { font-size: 23px; }
          .or-panel-head { align-items: flex-start; flex-direction: column; }
          .or-filters { padding: 14px; }
          .or-search { min-width: 100%; }
          .or-select { flex: 1; min-width: 0; }
          .or-detail-grid { grid-template-columns: 1fr; }
          .or-foot { flex-direction: column; }
        }
      `}</style>

      <div className="or-shell">
        <div className="or-top">
          <div>
            <div className="or-eyebrow">
              <ShieldCheck size={15} />
              Organizations / Roles & Permissions
            </div>
            <h1>Roles & Permissions</h1>
            <p className="or-subtitle">
              Define access levels and control what members can do in your organization.
            </p>
          </div>

          <button className="or-btn or-primary" onClick={openCreate}>
            <Plus size={16} />
            Create custom role
          </button>
        </div>

        {notice && (
          <div className="or-notice">
            <span>{notice}</span>
            <button
              className="or-icon-btn"
              onClick={() => setNotice("")}
              aria-label="Dismiss notification"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="or-stats">
          <div style={cardStyle}>
            <div className="or-stat-label">
              Total roles <span className="or-stat-icon"><ShieldCheck size={18} /></span>
            </div>
            <div className="or-stat-value">{roles.length}</div>
            <div className="or-stat-foot">Available access profiles</div>
          </div>

          <div style={cardStyle}>
            <div className="or-stat-label">
              System roles <span className="or-stat-icon"><LockKeyhole size={18} /></span>
            </div>
            <div className="or-stat-value">{roles.filter((role) => role.access === "System").length}</div>
            <div className="or-stat-foot">Built-in role definitions</div>
          </div>

          <div style={cardStyle}>
            <div className="or-stat-label">
              Custom roles <span className="or-stat-icon"><Settings2 size={18} /></span>
            </div>
            <div className="or-stat-value">{customCount}</div>
            <div className="or-stat-foot">Organization-defined roles</div>
          </div>

          <div style={cardStyle}>
            <div className="or-stat-label">
              Role assignments <span className="or-stat-icon"><Users size={18} /></span>
            </div>
            <div className="or-stat-value">{totalAssignments}</div>
            <div className="or-stat-foot">Sample assignments across roles</div>
          </div>
        </div>

        <div className="or-layout">
          <section className="or-panel">
            <div className="or-panel-head">
              <div>
                <h2>Organization roles</h2>
                <p>Inspect role access and manage custom role definitions.</p>
              </div>
              <button className="or-btn" onClick={resetFilters}>
                <RefreshCw size={14} />
                Reset
              </button>
            </div>

            <div className="or-filters">
              <div className="or-search">
                <Search size={16} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search roles..."
                  aria-label="Search roles"
                />
              </div>

              <select
                className="or-select"
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                aria-label="Filter role type"
              >
                <option value="All">All role types</option>
                <option value="System">System</option>
                <option value="Custom">Custom</option>
              </select>
            </div>

            <div className="or-table-wrap">
              <table className="or-table">
                <thead>
                  <tr>
                    <th>Role</th>
                    <th>Type</th>
                    <th>Members</th>
                    <th>Permissions</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoles.map((role) => (
                    <tr key={role.id}>
                      <td>
                        <div className="or-role-cell">
                          <div className="or-role-avatar"><ShieldCheck size={19} /></div>
                          <div>
                            <div className="or-role-name">{role.name}</div>
                            <div className="or-muted">{role.id}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`or-badge ${role.access === "System" ? "or-badge-system" : ""}`}>
                          {role.access}
                        </span>
                      </td>
                      <td>{role.members}</td>
                      <td>{role.permissions.length} of {permissions.length}</td>
                      <td>
                        <div className="or-actions">
                          <button
                            className="or-icon-btn"
                            onClick={() => setSelectedRole(role)}
                            title="View role"
                            aria-label={`View ${role.name}`}
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            className="or-icon-btn"
                            onClick={() => openEdit(role)}
                            title="Edit role"
                            aria-label={`Edit ${role.name}`}
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            className="or-icon-btn"
                            onClick={() => duplicateRole(role)}
                            title="Duplicate role"
                            aria-label={`Duplicate ${role.name}`}
                          >
                            <Copy size={15} />
                          </button>
                          <button
                            className="or-icon-btn"
                            onClick={() => deleteRole(role)}
                            title="Delete custom role"
                            aria-label={`Delete ${role.name}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredRoles.length === 0 && (
                    <tr>
                      <td colSpan={5}>
                        <div className="or-empty">No roles match your search.</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="or-foot">
              <span>Showing {filteredRoles.length} of {roles.length} roles</span>
              <span>Preview data</span>
            </div>
          </section>

          <section className="or-panel">
            <div className="or-panel-head">
              <div>
                <h2>Permission catalog</h2>
                <p>Available permission categories.</p>
              </div>
              <LockKeyhole size={18} color="#64748b" />
            </div>

            <div className="or-permission-list">
              {categories.map((category) => {
                const count = permissions.filter(
                  (permission) => permission.category === category,
                ).length;

                return (
                  <div className="or-permission-row" key={category}>
                    <div className="or-permission-check"><Check size={15} /></div>
                    <div style={{ flex: 1 }}>
                      <div className="or-permission-name">{category}</div>
                      <div className="or-permission-desc">
                        {count} permission{count === 1 ? "" : "s"} available
                      </div>
                    </div>
                    <ChevronRight size={15} color="#94a3b8" />
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="or-note">
          <LockKeyhole size={16} />
          <span>
            <strong>Preview mode:</strong> Role changes are held in page state
            only. Production authorization must be enforced by your backend on
            every protected API request; hiding UI controls alone is not security.
          </span>
        </div>
      </div>

      {modalOpen && (
        <div
          className="or-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setModalOpen(false);
          }}
        >
          <form className="or-modal" onSubmit={saveRole}>
            <div className="or-modal-head">
              <div>
                <h2>{editingId ? "Edit custom role" : "Create custom role"}</h2>
                <p>Set the role details and choose its permissions.</p>
              </div>
              <button
                type="button"
                className="or-icon-btn"
                onClick={() => setModalOpen(false)}
                aria-label="Close role editor"
              >
                <X size={18} />
              </button>
            </div>

            <div className="or-modal-body">
              {error && <div className="or-error">{error}</div>}

              <div className="or-field">
                <label htmlFor="role-name">Role name *</label>
                <input
                  id="role-name"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="e.g. Billing Manager"
                  required
                />
              </div>

              <div className="or-field">
                <label htmlFor="role-description">Description</label>
                <textarea
                  id="role-description"
                  rows={3}
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  placeholder="Describe what this role is allowed to do..."
                />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <strong style={{ fontSize: 14 }}>Permissions</strong>
                <span className="or-muted">{form.permissions.length} selected</span>
              </div>

              {categories.map((category) => {
                const group = permissions.filter(
                  (permission) => permission.category === category,
                );
                const allSelected = group.every((permission) =>
                  form.permissions.includes(permission.id),
                );

                return (
                  <div className="or-permission-category" key={category}>
                    <div className="or-category-head">
                      <span className="or-category-title">{category}</span>
                      <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#315fea", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={(event) => toggleCategory(category, event.target.checked)}
                        />
                        Select all
                      </label>
                    </div>

                    {group.map((permission) => (
                      <label className="or-check-row" key={permission.id}>
                        <input
                          type="checkbox"
                          checked={form.permissions.includes(permission.id)}
                          onChange={() => togglePermission(permission.id)}
                        />
                        <span>
                          <div className="or-check-title">{permission.label}</div>
                          <div className="or-check-desc">{permission.description}</div>
                        </span>
                      </label>
                    ))}
                  </div>
                );
              })}
            </div>

            <div className="or-modal-foot">
              <button
                type="button"
                className="or-btn"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="or-btn or-primary">
                {editingId ? "Save changes" : "Create role"}
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedRole && (
        <div
          className="or-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedRole(null);
          }}
        >
          <section className="or-modal">
            <div className="or-modal-head">
              <div>
                <h2>{selectedRole.name}</h2>
                <p>{selectedRole.id} · Role details</p>
              </div>
              <button
                className="or-icon-btn"
                onClick={() => setSelectedRole(null)}
                aria-label="Close role details"
              >
                <X size={18} />
              </button>
            </div>

            <div className="or-modal-body">
              <p style={{ color: "#64748b", fontSize: 13, lineHeight: 1.6, marginTop: 0 }}>
                {selectedRole.description || "No description provided."}
              </p>

              <div className="or-detail-grid">
                <div className="or-detail">
                  <div className="or-detail-label">Role type</div>
                  <div className="or-detail-value">{selectedRole.access}</div>
                </div>
                <div className="or-detail">
                  <div className="or-detail-label">Assigned members</div>
                  <div className="or-detail-value">{selectedRole.members}</div>
                </div>
                <div className="or-detail">
                  <div className="or-detail-label">Permission count</div>
                  <div className="or-detail-value">{selectedRole.permissions.length}</div>
                </div>
                <div className="or-detail">
                  <div className="or-detail-label">Last updated</div>
                  <div className="or-detail-value">{selectedRole.updatedAt}</div>
                </div>
              </div>

              <h3 style={{ fontSize: 14, margin: "24px 0 12px" }}>Granted permissions</h3>
              {permissions
                .filter((permission) => selectedRole.permissions.includes(permission.id))
                .map((permission) => (
                  <div className="or-permission-row" key={permission.id}>
                    <Check size={15} color="#15803d" />
                    <div>
                      <div className="or-permission-name">{permission.label}</div>
                      <div className="or-permission-desc">{permission.description}</div>
                    </div>
                  </div>
                ))}
            </div>

            <div className="or-modal-foot">
              <button className="or-btn" onClick={() => setSelectedRole(null)}>
                Close
              </button>
              {selectedRole.access === "Custom" && (
                <button
                  className="or-btn or-primary"
                  onClick={() => {
                    const role = selectedRole;
                    setSelectedRole(null);
                    openEdit(role);
                  }}
                >
                  <Pencil size={14} />
                  Edit role
                </button>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
