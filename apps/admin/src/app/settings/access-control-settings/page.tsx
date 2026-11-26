
"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Users,
  KeyRound,
  LockKeyhole,
  Search,
  Plus,
  Save,
  RotateCcw,
  CheckCircle2,
  X,
  Eye,
  Pencil,
  Trash2,
  UserCheck,
  Building2,
  Settings2,
  AlertTriangle,
} from "lucide-react";

type Permission = {
  id: string;
  name: string;
  description: string;
  category: string;
};

type AccessRole = {
  id: number;
  name: string;
  description: string;
  members: number;
  scope: "Platform" | "Organization" | "Workspace";
  permissions: string[];
  system: boolean;
};

const permissions: Permission[] = [
  { id: "dashboard.view", name: "View Dashboard", description: "Access platform metrics and dashboards.", category: "Platform" },
  { id: "users.view", name: "View Users", description: "View user profiles and account information.", category: "Users" },
  { id: "users.manage", name: "Manage Users", description: "Create, update, suspend, and manage user accounts.", category: "Users" },
  { id: "organizations.view", name: "View Organizations", description: "View organization details and membership.", category: "Organizations" },
  { id: "organizations.manage", name: "Manage Organizations", description: "Create and manage organizations and their settings.", category: "Organizations" },
  { id: "workspaces.view", name: "View Workspaces", description: "View workspace details and resources.", category: "Workspaces" },
  { id: "workspaces.manage", name: "Manage Workspaces", description: "Create, update, archive, and manage workspaces.", category: "Workspaces" },
  { id: "models.view", name: "View AI Models", description: "View configured models and model availability.", category: "AI Infrastructure" },
  { id: "models.manage", name: "Manage AI Models", description: "Configure model providers and model routing.", category: "AI Infrastructure" },
  { id: "billing.view", name: "View Billing", description: "View plans, invoices, and billing information.", category: "Billing" },
  { id: "billing.manage", name: "Manage Billing", description: "Change plans and manage billing configuration.", category: "Billing" },
  { id: "settings.view", name: "View Settings", description: "View platform and organization settings.", category: "Settings" },
  { id: "settings.manage", name: "Manage Settings", description: "Modify platform configuration and policies.", category: "Settings" },
  { id: "audit.view", name: "View Audit Logs", description: "Review security events and administrative activity.", category: "Security" },
  { id: "access.manage", name: "Manage Access", description: "Manage roles, permissions, and access policies.", category: "Security" },
];

const initialRoles: AccessRole[] = [
  {
    id: 1,
    name: "Super Admin",
    description: "Full administrative access to the entire platform.",
    members: 3,
    scope: "Platform",
    permissions: permissions.map((p) => p.id),
    system: true,
  },
  {
    id: 2,
    name: "Platform Admin",
    description: "Manage users, organizations, workspaces, and platform operations.",
    members: 8,
    scope: "Platform",
    permissions: [
      "dashboard.view", "users.view", "users.manage",
      "organizations.view", "organizations.manage",
      "workspaces.view", "workspaces.manage",
      "models.view", "models.manage", "billing.view",
      "settings.view", "settings.manage", "audit.view",
    ],
    system: true,
  },
  {
    id: 3,
    name: "Organization Admin",
    description: "Administer organization members, workspaces, and organization settings.",
    members: 21,
    scope: "Organization",
    permissions: [
      "dashboard.view", "users.view", "users.manage",
      "organizations.view", "workspaces.view", "workspaces.manage",
      "billing.view", "settings.view", "settings.manage",
    ],
    system: true,
  },
  {
    id: 4,
    name: "Workspace Manager",
    description: "Manage assigned workspaces, members, and workspace resources.",
    members: 36,
    scope: "Workspace",
    permissions: [
      "dashboard.view", "users.view", "workspaces.view",
      "workspaces.manage", "models.view", "settings.view",
    ],
    system: true,
  },
  {
    id: 5,
    name: "Member",
    description: "Standard access to assigned workspaces and enabled features.",
    members: 184,
    scope: "Workspace",
    permissions: [
      "dashboard.view", "users.view", "workspaces.view", "models.view",
    ],
    system: true,
  },
  {
    id: 6,
    name: "Billing Manager",
    description: "View invoices and manage permitted billing operations.",
    members: 12,
    scope: "Organization",
    permissions: ["dashboard.view", "organizations.view", "billing.view", "billing.manage"],
    system: true,
  },
];

type AccessPolicy = {
  enforceLeastPrivilege: boolean;
  requireRoleForAllUsers: boolean;
  allowCustomRoles: boolean;
  allowMultipleRoles: boolean;
  requireApprovalForElevation: boolean;
  restrictAdminActions: boolean;
  logPermissionChanges: boolean;
  denyByDefault: boolean;
};

const defaultPolicy: AccessPolicy = {
  enforceLeastPrivilege: true,
  requireRoleForAllUsers: true,
  allowCustomRoles: true,
  allowMultipleRoles: true,
  requireApprovalForElevation: true,
  restrictAdminActions: true,
  logPermissionChanges: true,
  denyByDefault: true,
};

export default function AccessControlSettingsPage() {
  const [roles, setRoles] = useState<AccessRole[]>(initialRoles);
  const [policy, setPolicy] = useState<AccessPolicy>(defaultPolicy);
  const [activeTab, setActiveTab] = useState("roles");
  const [search, setSearch] = useState("");
  const [scopeFilter, setScopeFilter] = useState("All");
  const [permissionSearch, setPermissionSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState<AccessRole | null>(null);
  const [editingRole, setEditingRole] = useState<AccessRole | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [notice, setNotice] = useState("");

  const [roleForm, setRoleForm] = useState({
    name: "",
    description: "",
    scope: "Workspace" as AccessRole["scope"],
    permissions: ["dashboard.view", "workspaces.view"],
  });

  const totalMembers = roles.reduce((sum, role) => sum + role.members, 0);
  const customRoles = roles.filter((role) => !role.system).length;

  const filteredRoles = roles.filter((role) => {
    const matchesSearch = `${role.name} ${role.description}`.toLowerCase().includes(search.toLowerCase());
    const matchesScope = scopeFilter === "All" || role.scope === scopeFilter;
    return matchesSearch && matchesScope;
  });

  const filteredPermissions = permissions.filter((permission) =>
    `${permission.name} ${permission.description} ${permission.category}`
      .toLowerCase()
      .includes(permissionSearch.toLowerCase()),
  );

  function updatePolicy<K extends keyof AccessPolicy>(key: K, value: AccessPolicy[K]) {
    setPolicy((current) => ({ ...current, [key]: value }));
  }

  function saveSettings() {
    try {
      localStorage.setItem("modelnow-access-control-roles", JSON.stringify(roles));
      localStorage.setItem("modelnow-access-control-policy", JSON.stringify(policy));
      setNotice("Access control settings saved in this browser.");
    } catch {
      setNotice("Unable to save settings in this browser.");
    }
  }

  function resetSettings() {
    setRoles(initialRoles);
    setPolicy(defaultPolicy);
    setNotice("Access control settings reset. Save to persist the changes.");
  }

  function openCreate() {
    setRoleForm({
      name: "",
      description: "",
      scope: "Workspace",
      permissions: ["dashboard.view", "workspaces.view"],
    });
    setEditingRole(null);
    setShowCreate(true);
  }

  function openEdit(role: AccessRole) {
    if (role.system) {
      setNotice("Built-in system roles cannot be edited in this demo.");
      return;
    }

    setRoleForm({
      name: role.name,
      description: role.description,
      scope: role.scope,
      permissions: [...role.permissions],
    });
    setEditingRole(role);
    setShowCreate(true);
  }

  function togglePermission(permissionId: string) {
    setRoleForm((current) => ({
      ...current,
      permissions: current.permissions.includes(permissionId)
        ? current.permissions.filter((id) => id !== permissionId)
        : [...current.permissions, permissionId],
    }));
  }

  function saveRole() {
    if (!roleForm.name.trim()) {
      setNotice("Enter a role name before saving.");
      return;
    }

    const duplicate = roles.some(
      (role) =>
        role.name.toLowerCase() === roleForm.name.trim().toLowerCase() &&
        role.id !== editingRole?.id,
    );

    if (duplicate) {
      setNotice("A role with this name already exists.");
      return;
    }

    if (editingRole) {
      setRoles((current) =>
        current.map((role) =>
          role.id === editingRole.id
            ? {
                ...role,
                name: roleForm.name.trim(),
                description: roleForm.description.trim(),
                scope: roleForm.scope,
                permissions: roleForm.permissions,
              }
            : role,
        ),
      );
      setNotice("Custom role updated. Save settings to retain the change.");
    } else {
      const newRole: AccessRole = {
        id: Math.max(0, ...roles.map((role) => role.id)) + 1,
        name: roleForm.name.trim(),
        description: roleForm.description.trim(),
        members: 0,
        scope: roleForm.scope,
        permissions: roleForm.permissions,
        system: false,
      };
      setRoles((current) => [...current, newRole]);
      setNotice("Custom role created. Save settings to retain it.");
    }

    setShowCreate(false);
  }

  function deleteRole(role: AccessRole) {
    if (role.system) {
      setNotice("Built-in system roles cannot be deleted.");
      return;
    }

    if (role.members > 0) {
      setNotice("This role has assigned members. Reassign them before deleting the role.");
      return;
    }

    setRoles((current) => current.filter((item) => item.id !== role.id));
    setSelectedRole(null);
    setNotice("Custom role deleted. Save settings to retain the change.");
  }

  function Toggle({
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
      <div className="ac-toggle-row">
        <div className="ac-toggle-copy">
          <strong>{title}</strong>
          <p>{description}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={title}
          className={`ac-switch ${checked ? "active" : ""}`}
          onClick={() => onChange(!checked)}
        />
      </div>
    );
  }

  return (
    <main className="ac-page">
      <style>{`
        .ac-page {
          min-height: 100vh;
          padding: 30px;
          background: #f7f8fc;
          color: #202a40;
          font-family: Arial, Helvetica, sans-serif;
        }

        .ac-container { max-width: 1240px; margin: 0 auto; }

        .ac-breadcrumb {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
          margin-bottom: 22px;
          color: #858da0;
          font-size: 13px;
        }

        .ac-breadcrumb a { color: #5265d9; text-decoration: none; }

        .ac-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 24px;
        }

        .ac-heading-main { display: flex; align-items: center; gap: 14px; }

        .ac-heading-icon {
          display: grid;
          place-items: center;
          width: 50px;
          height: 50px;
          flex-shrink: 0;
          border-radius: 14px;
          background: #e9edff;
          color: #5265d9;
        }

        .ac-heading h1 { margin: 0 0 7px; font-size: 27px; letter-spacing: -.6px; }
        .ac-heading p { max-width: 660px; margin: 0; color: #7e8799; font-size: 13px; line-height: 1.6; }
        .ac-actions { display: flex; flex-wrap: wrap; gap: 9px; }

        .ac-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 39px;
          padding: 0 13px;
          border: 1px solid #dfe4ed;
          border-radius: 9px;
          background: white;
          color: #414c64;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        .ac-button.primary { background: #5265d9; border-color: #5265d9; color: white; }
        .ac-button.danger { border-color: #f1caca; color: #c24141; }
        .ac-button:hover { opacity: .9; }

        .ac-notice {
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

        .ac-banner {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 20px;
          padding: 16px;
          border: 1px solid #f3dfb1;
          border-radius: 11px;
          background: #fff9e9;
          color: #94651a;
          font-size: 12px;
          line-height: 1.6;
        }

        .ac-banner strong { display: block; margin-bottom: 4px; font-size: 13px; }

        .ac-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 22px;
        }

        .ac-stat {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 18px;
          border: 1px solid #e7eaf1;
          border-radius: 12px;
          background: white;
        }

        .ac-stat-icon {
          display: grid;
          place-items: center;
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          border-radius: 10px;
          background: #f0f2ff;
          color: #5265d9;
        }

        .ac-stat-label { margin-bottom: 6px; color: #818a9c; font-size: 11px; }
        .ac-stat-value { color: #202a40; font-size: 22px; font-weight: 700; }

        .ac-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          padding: 6px;
          margin-bottom: 18px;
          border: 1px solid #e7eaf1;
          border-radius: 11px;
          background: white;
        }

        .ac-tab {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 11px 15px;
          border: 0;
          border-radius: 7px;
          background: transparent;
          color: #6f7890;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        .ac-tab.active { background: #edf0ff; color: #485dd0; }

        .ac-card {
          overflow: hidden;
          margin-bottom: 18px;
          border: 1px solid #e7eaf1;
          border-radius: 13px;
          background: white;
          box-shadow: 0 2px 7px rgba(24,36,70,.025);
        }

        .ac-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 20px 22px;
          border-bottom: 1px solid #edf0f5;
        }

        .ac-card-header h2 { margin: 0 0 6px; font-size: 15px; }
        .ac-card-header p { margin: 0; color: #858da0; font-size: 12px; line-height: 1.6; }

        .ac-toolbar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px;
          padding: 16px 22px;
          border-bottom: 1px solid #edf0f5;
        }

        .ac-search { position: relative; flex: 1 1 230px; min-width: 180px; }
        .ac-search svg { position: absolute; top: 12px; left: 12px; color: #929bad; }

        .ac-search input {
          width: 100%;
          height: 40px;
          padding: 0 12px 0 37px;
          border: 1px solid #dfe4ed;
          border-radius: 8px;
          outline: none;
          font-size: 12px;
        }

        .ac-toolbar select {
          height: 40px;
          padding: 0 10px;
          border: 1px solid #dfe4ed;
          border-radius: 8px;
          background: white;
          color: #48536b;
          font-size: 12px;
        }

        .ac-table-wrap { overflow-x: auto; }
        .ac-table { width: 100%; border-collapse: collapse; text-align: left; white-space: nowrap; }

        .ac-table th {
          padding: 14px 18px;
          background: #fafbfe;
          color: #7f889a;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .5px;
          text-transform: uppercase;
        }

        .ac-table td {
          padding: 15px 18px;
          border-top: 1px solid #edf0f5;
          color: #4b566d;
          font-size: 12px;
        }

        .ac-role-cell { display: flex; align-items: center; gap: 11px; }

        .ac-role-avatar {
          display: grid;
          place-items: center;
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          border-radius: 10px;
          background: #edf0ff;
          color: #5265d9;
          font-size: 12px;
          font-weight: 700;
        }

        .ac-role-name { margin-bottom: 4px; color: #263149; font-weight: 700; }
        .ac-muted { color: #8991a2; font-size: 11px; }

        .ac-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 9px;
          border-radius: 20px;
          background: #f0f2ff;
          color: #5265d9;
          font-size: 10px;
          font-weight: 700;
        }

        .ac-badge.green { background: #eaf9f0; color: #218552; }
        .ac-badge.gray { background: #f0f1f5; color: #697386; }

        .ac-icon-button {
          display: grid;
          place-items: center;
          width: 32px;
          height: 32px;
          border: 1px solid #e4e8f0;
          border-radius: 7px;
          background: white;
          color: #66718a;
          cursor: pointer;
        }

        .ac-icon-button:hover { background: #f3f5ff; color: #5265d9; }

        .ac-table-actions { display: flex; gap: 6px; }
        .ac-empty { padding: 40px 20px; text-align: center; color: #858da0; font-size: 13px; }

        .ac-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 16px 22px;
          border-top: 1px solid #edf0f5;
          color: #858da0;
          font-size: 11px;
        }

        .ac-permission-groups { padding: 8px 22px 22px; }

        .ac-permission-group {
          margin-top: 15px;
          overflow: hidden;
          border: 1px solid #edf0f5;
          border-radius: 10px;
        }

        .ac-permission-group-title {
          padding: 12px 14px;
          background: #fafbfe;
          border-bottom: 1px solid #edf0f5;
          color: #3c4860;
          font-size: 12px;
          font-weight: 700;
        }

        .ac-permission-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px;
          border-bottom: 1px solid #edf0f5;
        }

        .ac-permission-item:last-child { border-bottom: 0; }
        .ac-permission-item input { width: 16px; height: 16px; margin-top: 2px; accent-color: #5265d9; }
        .ac-permission-item strong { display: block; margin-bottom: 5px; font-size: 12px; }
        .ac-permission-item p { margin: 0; color: #858da0; font-size: 11px; line-height: 1.6; }

        .ac-toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 17px 22px;
          border-bottom: 1px solid #edf0f5;
        }

        .ac-toggle-row:last-child { border-bottom: 0; }
        .ac-toggle-copy strong { display: block; margin-bottom: 5px; font-size: 12px; }
        .ac-toggle-copy p { margin: 0; color: #858da0; font-size: 11px; line-height: 1.6; }

        .ac-switch {
          position: relative;
          width: 38px;
          height: 22px;
          flex: 0 0 auto;
          padding: 0;
          border: 0;
          border-radius: 20px;
          background: #cbd1dd;
          cursor: pointer;
        }

        .ac-switch.active { background: #5265d9; }
        .ac-switch::after {
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

        .ac-switch.active::after { transform: translateX(16px); }

        .ac-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 50;
          display: grid;
          place-items: center;
          padding: 20px;
          background: rgba(20,28,48,.45);
        }

        .ac-modal {
          width: 100%;
          max-width: 720px;
          max-height: 90vh;
          overflow-y: auto;
          border: 1px solid #e7eaf1;
          border-radius: 15px;
          background: white;
          box-shadow: 0 20px 70px rgba(20,28,48,.2);
        }

        .ac-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 20px 22px;
          border-bottom: 1px solid #edf0f5;
        }

        .ac-modal-header h2 { margin: 0; font-size: 17px; }
        .ac-modal-body { padding: 22px; }

        .ac-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 17px;
        }

        .ac-field { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
        .ac-field.full { grid-column: 1 / -1; }
        .ac-field label { color: #39445a; font-size: 12px; font-weight: 700; }

        .ac-field input, .ac-field select, .ac-field textarea {
          width: 100%;
          padding: 11px 12px;
          border: 1px solid #dfe4ed;
          border-radius: 8px;
          outline: none;
          background: white;
          color: #202a40;
          font: inherit;
          font-size: 12px;
        }

        .ac-field input, .ac-field select { height: 42px; }
        .ac-field textarea { min-height: 76px; resize: vertical; }

        .ac-form-section-title {
          margin: 24px 0 8px;
          color: #263149;
          font-size: 13px;
          font-weight: 700;
        }

        .ac-modal-actions {
          display: flex;
          justify-content: flex-end;
          flex-wrap: wrap;
          gap: 9px;
          margin-top: 22px;
        }

        .ac-detail-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          padding: 20px 22px;
        }

        .ac-detail-box {
          padding: 13px;
          border: 1px solid #edf0f5;
          border-radius: 9px;
        }

        .ac-detail-label { margin-bottom: 6px; color: #858da0; font-size: 11px; }
        .ac-detail-value { color: #263149; font-size: 13px; font-weight: 700; }
        .ac-detail-permissions { padding: 0 22px 22px; }
        .ac-detail-permissions h3 { font-size: 13px; }
        .ac-permission-chip {
          display: inline-flex;
          margin: 3px;
          padding: 6px 8px;
          border: 1px solid #e4e8f0;
          border-radius: 6px;
          color: #526078;
          font-size: 10px;
        }

        @media (max-width: 950px) {
          .ac-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }

        @media (max-width: 650px) {
          .ac-page { padding: 18px 12px; }
          .ac-heading { flex-direction: column; }
          .ac-heading h1 { font-size: 23px; }
          .ac-actions { width: 100%; }
          .ac-button { flex: 1; }
          .ac-tabs { overflow-x: auto; flex-wrap: nowrap; }
          .ac-tab { white-space: nowrap; }
          .ac-form-grid, .ac-detail-grid { grid-template-columns: 1fr; }
          .ac-field.full { grid-column: auto; }
          .ac-card-header { align-items: flex-start; }
          .ac-footer { align-items: flex-start; flex-direction: column; }
        }
      `}</style>

      <div className="ac-container">
        <div className="ac-breadcrumb">
          <a href="/dashboard">Admin</a>
          <span>/</span>
          <a href="/settings">Settings</a>
          <span>/</span>
          <span>Access Control Settings</span>
        </div>

        <header className="ac-heading">
          <div className="ac-heading-main">
            <div className="ac-heading-icon"><ShieldCheck size={24} /></div>
            <div>
              <h1>Access Control Settings</h1>
              <p>
                Manage platform roles, permissions, administrative access, and
                authorization policies.
              </p>
            </div>
          </div>
          <div className="ac-actions">
            <button type="button" className="ac-button" onClick={resetSettings}>
              <RotateCcw size={14} />
              Reset
            </button>
            <button type="button" className="ac-button primary" onClick={saveSettings}>
              <Save size={14} />
              Save Settings
            </button>
          </div>
        </header>

        {notice && (
          <div className="ac-notice" role="status">
            <CheckCircle2 size={17} />
            {notice}
          </div>
        )}

        <div className="ac-banner">
          <AlertTriangle size={19} />
          <div>
            <strong>Authorization and permission enforcement</strong>
            These screens manage demo configuration in the browser. Enforce role
            assignments and permissions in server-side API routes and backend
            authorization middleware before using them for production access control.
          </div>
        </div>

        <section className="ac-stats">
          <div className="ac-stat">
            <div className="ac-stat-icon"><KeyRound size={19} /></div>
            <div>
              <div className="ac-stat-label">Total Roles</div>
              <div className="ac-stat-value">{roles.length}</div>
            </div>
          </div>
          <div className="ac-stat">
            <div className="ac-stat-icon"><Users size={19} /></div>
            <div>
              <div className="ac-stat-label">Assigned Members</div>
              <div className="ac-stat-value">{totalMembers}</div>
            </div>
          </div>
          <div className="ac-stat">
            <div className="ac-stat-icon"><Settings2 size={19} /></div>
            <div>
              <div className="ac-stat-label">Available Permissions</div>
              <div className="ac-stat-value">{permissions.length}</div>
            </div>
          </div>
          <div className="ac-stat">
            <div className="ac-stat-icon"><UserCheck size={19} /></div>
            <div>
              <div className="ac-stat-label">Custom Roles</div>
              <div className="ac-stat-value">{customRoles}</div>
            </div>
          </div>
        </section>

        <div className="ac-tabs">
          <button
            type="button"
            className={`ac-tab ${activeTab === "roles" ? "active" : ""}`}
            onClick={() => setActiveTab("roles")}
          >
            <Users size={15} />
            Roles & Access
          </button>
          <button
            type="button"
            className={`ac-tab ${activeTab === "permissions" ? "active" : ""}`}
            onClick={() => setActiveTab("permissions")}
          >
            <KeyRound size={15} />
            Permissions
          </button>
          <button
            type="button"
            className={`ac-tab ${activeTab === "policies" ? "active" : ""}`}
            onClick={() => setActiveTab("policies")}
          >
            <LockKeyhole size={15} />
            Access Policies
          </button>
        </div>

        {activeTab === "roles" && (
          <section className="ac-card">
            <div className="ac-card-header">
              <div>
                <h2>Roles & Access</h2>
                <p>Define role scopes and the permissions assigned to each role.</p>
              </div>
              <button type="button" className="ac-button primary" onClick={openCreate}>
                <Plus size={15} />
                Create Role
              </button>
            </div>

            <div className="ac-toolbar">
              <div className="ac-search">
                <Search size={16} />
                <input
                  aria-label="Search roles"
                  placeholder="Search roles..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              <select
                aria-label="Filter roles by scope"
                value={scopeFilter}
                onChange={(event) => setScopeFilter(event.target.value)}
              >
                <option value="All">All scopes</option>
                <option value="Platform">Platform</option>
                <option value="Organization">Organization</option>
                <option value="Workspace">Workspace</option>
              </select>
              <button
                type="button"
                className="ac-button"
                onClick={() => {
                  setSearch("");
                  setScopeFilter("All");
                }}
              >
                <RotateCcw size={14} />
                Clear
              </button>
            </div>

            <div className="ac-table-wrap">
              <table className="ac-table">
                <thead>
                  <tr>
                    <th>Role</th>
                    <th>Scope</th>
                    <th>Members</th>
                    <th>Permissions</th>
                    <th>Type</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoles.map((role) => (
                    <tr key={role.id}>
                      <td>
                        <div className="ac-role-cell">
                          <div className="ac-role-avatar">
                            {role.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="ac-role-name">{role.name}</div>
                            <div className="ac-muted">{role.description}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="ac-badge">{role.scope}</span>
                      </td>
                      <td>{role.members}</td>
                      <td>{role.permissions.length} permissions</td>
                      <td>
                        <span className={`ac-badge ${role.system ? "gray" : "green"}`}>
                          {role.system ? "System" : "Custom"}
                        </span>
                      </td>
                      <td>
                        <div className="ac-table-actions">
                          <button
                            type="button"
                            className="ac-icon-button"
                            title="View role"
                            aria-label={`View ${role.name}`}
                            onClick={() => setSelectedRole(role)}
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            type="button"
                            className="ac-icon-button"
                            title="Edit role"
                            aria-label={`Edit ${role.name}`}
                            onClick={() => openEdit(role)}
                          >
                            <Pencil size={14} />
                          </button>
                          {!role.system && (
                            <button
                              type="button"
                              className="ac-icon-button"
                              title="Delete role"
                              aria-label={`Delete ${role.name}`}
                              onClick={() => deleteRole(role)}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredRoles.length === 0 && (
                <div className="ac-empty">No roles match your search or filters.</div>
              )}
            </div>

            <div className="ac-footer">
              <span>Showing {filteredRoles.length} of {roles.length} roles</span>
              <span>System roles are protected from editing and deletion.</span>
            </div>
          </section>
        )}

        {activeTab === "permissions" && (
          <section className="ac-card">
            <div className="ac-card-header">
              <div>
                <h2>Permission Catalog</h2>
                <p>Review the permissions available for role assignment.</p>
              </div>
              <span className="ac-badge">{permissions.length} permissions</span>
            </div>

            <div className="ac-toolbar">
              <div className="ac-search">
                <Search size={16} />
                <input
                  aria-label="Search permissions"
                  placeholder="Search permission or category..."
                  value={permissionSearch}
                  onChange={(event) => setPermissionSearch(event.target.value)}
                />
              </div>
            </div>

            <div className="ac-permission-groups">
              {Array.from(new Set(filteredPermissions.map((p) => p.category))).map((category) => (
                <div className="ac-permission-group" key={category}>
                  <div className="ac-permission-group-title">{category}</div>
                  {filteredPermissions
                    .filter((permission) => permission.category === category)
                    .map((permission) => (
                      <div className="ac-permission-item" key={permission.id}>
                        <KeyRound size={16} color="#5265d9" />
                        <div>
                          <strong>{permission.name}</strong>
                          <p>{permission.description}</p>
                          <p style={{ marginTop: 5, color: "#5265d9" }}>{permission.id}</p>
                        </div>
                      </div>
                    ))}
                </div>
              ))}
              {filteredPermissions.length === 0 && (
                <div className="ac-empty">No permissions match your search.</div>
              )}
            </div>
          </section>
        )}

        {activeTab === "policies" && (
          <section className="ac-card">
            <div className="ac-card-header">
              <div>
                <h2>Access Policies</h2>
                <p>Configure default authorization behavior and administrative safeguards.</p>
              </div>
              <ShieldCheck size={22} color="#5265d9" />
            </div>

            <Toggle
              title="Enforce Least Privilege"
              description="Grant only the permissions required for a user's assigned responsibilities."
              checked={policy.enforceLeastPrivilege}
              onChange={(value) => updatePolicy("enforceLeastPrivilege", value)}
            />
            <Toggle
              title="Require a Role for Every User"
              description="Require every active user to have an explicit role assignment."
              checked={policy.requireRoleForAllUsers}
              onChange={(value) => updatePolicy("requireRoleForAllUsers", value)}
            />
            <Toggle
              title="Allow Custom Roles"
              description="Allow administrators to create organization-specific or workspace-specific roles."
              checked={policy.allowCustomRoles}
              onChange={(value) => updatePolicy("allowCustomRoles", value)}
            />
            <Toggle
              title="Allow Multiple Roles"
              description="Allow users to hold more than one role when permitted by the authorization model."
              checked={policy.allowMultipleRoles}
              onChange={(value) => updatePolicy("allowMultipleRoles", value)}
            />
            <Toggle
              title="Require Approval for Privilege Elevation"
              description="Require approval before granting elevated administrative permissions."
              checked={policy.requireApprovalForElevation}
              onChange={(value) => updatePolicy("requireApprovalForElevation", value)}
            />
            <Toggle
              title="Restrict Administrative Actions"
              description="Apply additional safeguards to sensitive platform administration operations."
              checked={policy.restrictAdminActions}
              onChange={(value) => updatePolicy("restrictAdminActions", value)}
            />
            <Toggle
              title="Log Permission Changes"
              description="Record role and permission changes in the security audit trail."
              checked={policy.logPermissionChanges}
              onChange={(value) => updatePolicy("logPermissionChanges", value)}
            />
            <Toggle
              title="Deny Access by Default"
              description="Requests without a valid explicit permission should be denied."
              checked={policy.denyByDefault}
              onChange={(value) => updatePolicy("denyByDefault", value)}
            />

            <div className="ac-footer">
              <span>Policies must be implemented and enforced by the backend.</span>
              <button type="button" className="ac-button primary" onClick={saveSettings}>
                <Save size={14} />
                Save Policies
              </button>
            </div>
          </section>
        )}

        <div className="ac-footer" style={{ padding: "12px 0 30px", borderTop: 0 }}>
          <span>ModelNow Admin · Access Control</span>
          <button type="button" className="ac-button" onClick={saveSettings}>
            <Save size={14} />
            Save All Changes
          </button>
        </div>
      </div>

      {showCreate && (
        <div
          className="ac-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowCreate(false);
          }}
        >
          <section className="ac-modal" role="dialog" aria-modal="true" aria-labelledby="ac-role-form-title">
            <div className="ac-modal-header">
              <h2 id="ac-role-form-title">{editingRole ? "Edit Custom Role" : "Create Custom Role"}</h2>
              <button
                type="button"
                className="ac-icon-button"
                aria-label="Close dialog"
                onClick={() => setShowCreate(false)}
              >
                <X size={17} />
              </button>
            </div>

            <div className="ac-modal-body">
              <div className="ac-form-grid">
                <div className="ac-field full">
                  <label htmlFor="acRoleName">Role Name</label>
                  <input
                    id="acRoleName"
                    value={roleForm.name}
                    onChange={(event) => setRoleForm((current) => ({ ...current, name: event.target.value }))}
                    placeholder="e.g. AI Operations Manager"
                  />
                </div>
                <div className="ac-field full">
                  <label htmlFor="acRoleDescription">Description</label>
                  <textarea
                    id="acRoleDescription"
                    value={roleForm.description}
                    onChange={(event) => setRoleForm((current) => ({ ...current, description: event.target.value }))}
                    placeholder="Describe this role's responsibilities..."
                  />
                </div>
                <div className="ac-field full">
                  <label htmlFor="acRoleScope">Role Scope</label>
                  <select
                    id="acRoleScope"
                    value={roleForm.scope}
                    onChange={(event) => setRoleForm((current) => ({
                      ...current,
                      scope: event.target.value as AccessRole["scope"],
                    }))}
                  >
                    <option value="Platform">Platform</option>
                    <option value="Organization">Organization</option>
                    <option value="Workspace">Workspace</option>
                  </select>
                </div>
              </div>

              <h3 className="ac-form-section-title">
                Permissions ({roleForm.permissions.length} selected)
              </h3>
              <div className="ac-permission-group">
                {permissions.map((permission) => (
                  <label className="ac-permission-item" key={permission.id}>
                    <input
                      type="checkbox"
                      checked={roleForm.permissions.includes(permission.id)}
                      onChange={() => togglePermission(permission.id)}
                    />
                    <div>
                      <strong>{permission.name}</strong>
                      <p>{permission.description}</p>
                      <p style={{ marginTop: 5, color: "#5265d9" }}>{permission.category}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="ac-modal-actions">
                <button type="button" className="ac-button" onClick={() => setShowCreate(false)}>
                  Cancel
                </button>
                <button type="button" className="ac-button primary" onClick={saveRole}>
                  <Save size={14} />
                  {editingRole ? "Update Role" : "Create Role"}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {selectedRole && (
        <div
          className="ac-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedRole(null);
          }}
        >
          <section className="ac-modal" role="dialog" aria-modal="true" aria-labelledby="ac-role-details-title">
            <div className="ac-modal-header">
              <h2 id="ac-role-details-title">Role Details</h2>
              <button
                type="button"
                className="ac-icon-button"
                aria-label="Close role details"
                onClick={() => setSelectedRole(null)}
              >
                <X size={17} />
              </button>
            </div>

            <div className="ac-detail-grid">
              <div className="ac-detail-box">
                <div className="ac-detail-label">Role Name</div>
                <div className="ac-detail-value">{selectedRole.name}</div>
              </div>
              <div className="ac-detail-box">
                <div className="ac-detail-label">Scope</div>
                <div className="ac-detail-value">{selectedRole.scope}</div>
              </div>
              <div className="ac-detail-box">
                <div className="ac-detail-label">Assigned Members</div>
                <div className="ac-detail-value">{selectedRole.members}</div>
              </div>
              <div className="ac-detail-box">
                <div className="ac-detail-label">Role Type</div>
                <div className="ac-detail-value">{selectedRole.system ? "System Role" : "Custom Role"}</div>
              </div>
            </div>

            <div className="ac-detail-permissions">
              <h3>Description</h3>
              <p style={{ color: "#69748a", fontSize: 12, lineHeight: 1.7 }}>
                {selectedRole.description || "No description provided."}
              </p>
              <h3>Assigned Permissions ({selectedRole.permissions.length})</h3>
              <div>
                {selectedRole.permissions.map((permissionId) => (
                  <span className="ac-permission-chip" key={permissionId}>
                    {permissionId}
                  </span>
                ))}
              </div>
            </div>

            <div className="ac-footer">
              <span>Role details shown from the current demo data.</span>
              <button
                type="button"
                className="ac-button"
                onClick={() => {
                  setSelectedRole(null);
                  openEdit(selectedRole);
                }}
              >
                <Pencil size={14} />
                Edit Role
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
