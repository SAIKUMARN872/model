
"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Layers3,
  ShieldCheck,
  LockKeyhole,
  Users,
  Bot,
  Database,
  CreditCard,
  Settings,
  FileSearch,
  Globe,
  KeyRound,
  ChevronRight,
  Check,
  X,
  Save,
  RotateCcw,
} from "lucide-react";

type ModuleStatus = "Enabled" | "Restricted" | "Disabled";

type ModulePermission = {
  id: string;
  name: string;
  description: string;
  icon: typeof Layers3;
  status: ModuleStatus;
  roles: string[];
  actions: {
    view: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    manage: boolean;
  };
};

const initialModules: ModulePermission[] = [
  {
    id: "MOD-001",
    name: "User Management",
    description: "Users, invitations, and membership settings",
    icon: Users,
    status: "Enabled",
    roles: ["Super Admin", "Admin"],
    actions: { view: true, create: true, update: true, delete: true, manage: true },
  },
  {
    id: "MOD-002",
    name: "AI Models",
    description: "Model catalog, access, and configuration",
    icon: Layers3,
    status: "Enabled",
    roles: ["Super Admin", "AI Engineer"],
    actions: { view: true, create: true, update: true, delete: false, manage: true },
  },
  {
    id: "MOD-003",
    name: "Agents",
    description: "Agent creation, configuration, and execution",
    icon: Bot,
    status: "Enabled",
    roles: ["Super Admin", "AI Engineer"],
    actions: { view: true, create: true, update: true, delete: false, manage: true },
  },
  {
    id: "MOD-004",
    name: "Knowledge Hub",
    description: "Documents, knowledge sources, and retrieval",
    icon: Database,
    status: "Enabled",
    roles: ["Super Admin", "Admin", "Analyst"],
    actions: { view: true, create: true, update: true, delete: false, manage: false },
  },
  {
    id: "MOD-005",
    name: "Billing",
    description: "Plans, invoices, and subscription settings",
    icon: CreditCard,
    status: "Restricted",
    roles: ["Super Admin", "Billing Admin"],
    actions: { view: true, create: false, update: true, delete: false, manage: false },
  },
  {
    id: "MOD-006",
    name: "Platform Settings",
    description: "Global configuration and platform controls",
    icon: Settings,
    status: "Restricted",
    roles: ["Super Admin"],
    actions: { view: true, create: false, update: true, delete: false, manage: true },
  },
  {
    id: "MOD-007",
    name: "Audit Logs",
    description: "Security events and administrative activity",
    icon: FileSearch,
    status: "Enabled",
    roles: ["Super Admin", "Security Analyst"],
    actions: { view: true, create: false, update: false, delete: false, manage: false },
  },
  {
    id: "MOD-008",
    name: "API Keys",
    description: "API credentials, rotation, and revocation",
    icon: KeyRound,
    status: "Restricted",
    roles: ["Super Admin", "Admin"],
    actions: { view: true, create: true, update: false, delete: false, manage: false },
  },
  {
    id: "MOD-009",
    name: "Integrations",
    description: "External services and connected applications",
    icon: Globe,
    status: "Disabled",
    roles: ["Super Admin"],
    actions: { view: true, create: false, update: false, delete: false, manage: false },
  },
];

const actionLabels = [
  { key: "view", label: "View" },
  { key: "create", label: "Create" },
  { key: "update", label: "Update" },
  { key: "delete", label: "Delete" },
  { key: "manage", label: "Manage" },
] as const;

const roles = [
  "Super Admin",
  "Admin",
  "AI Engineer",
  "Analyst",
  "Billing Admin",
  "Security Analyst",
];

const theme = {
  primary: "#315fea",
  text: "#172033",
  muted: "#667085",
  border: "#e4e7ec",
  background: "#f8fafc",
  surface: "#ffffff",
  green: "#15803d",
  amber: "#b54708",
  red: "#b42318",
};

const css: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: "28px",
    background: theme.background,
    color: theme.text,
    fontFamily: "Arial, Helvetica, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "16px",
    marginBottom: "24px",
  },
  eyebrow: {
    fontSize: "12px",
    color: theme.primary,
    textTransform: "uppercase",
    letterSpacing: "1px",
    fontWeight: 700,
    marginBottom: "8px",
  },
  title: { fontSize: "27px", fontWeight: 750, margin: "0 0 8px" },
  subtitle: {
    color: theme.muted,
    fontSize: "14px",
    lineHeight: 1.6,
    margin: 0,
    maxWidth: "700px",
  },
  button: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "10px 14px",
    border: `1px solid ${theme.border}`,
    borderRadius: "8px",
    background: "#fff",
    color: theme.text,
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: 650,
  },
  primaryButton: {
    background: theme.primary,
    color: "#fff",
    borderColor: theme.primary,
  },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: "14px",
    marginBottom: "22px",
  },
  card: {
    background: "#fff",
    border: `1px solid ${theme.border}`,
    borderRadius: "12px",
    padding: "17px",
  },
  statLabel: { color: theme.muted, fontSize: "12px", marginBottom: "12px" },
  statValue: { fontSize: "27px", fontWeight: 750 },
  statNote: { color: theme.muted, fontSize: "11px", marginTop: "8px" },
  panel: {
    background: "#fff",
    border: `1px solid ${theme.border}`,
    borderRadius: "12px",
    overflow: "hidden",
  },
  toolbar: {
    padding: "16px",
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    alignItems: "center",
    borderBottom: `1px solid ${theme.border}`,
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 12px",
    border: `1px solid ${theme.border}`,
    borderRadius: "8px",
    fontSize: "12px",
    outlineColor: theme.primary,
  },
  select: {
    padding: "10px 12px",
    border: `1px solid ${theme.border}`,
    borderRadius: "8px",
    background: "#fff",
    fontSize: "12px",
    color: theme.text,
  },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", minWidth: "1000px", borderCollapse: "collapse" },
  th: {
    padding: "13px 15px",
    textAlign: "left",
    background: "#f9fafb",
    borderBottom: `1px solid ${theme.border}`,
    fontSize: "10px",
    color: theme.muted,
    textTransform: "uppercase",
    letterSpacing: "0.4px",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "14px 15px",
    borderBottom: "1px solid #eef0f3",
    fontSize: "12px",
    verticalAlign: "middle",
  },
  badge: {
    display: "inline-flex",
    padding: "5px 8px",
    borderRadius: "999px",
    fontSize: "10px",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    display: "flex",
    justifyContent: "flex-end",
    background: "rgba(16,24,40,0.45)",
  },
  drawer: {
    width: "min(460px, 100%)",
    height: "100%",
    overflowY: "auto",
    background: "#fff",
    boxSizing: "border-box",
    padding: "24px",
  },
  label: {
    display: "block",
    fontSize: "12px",
    fontWeight: 700,
    marginBottom: "8px",
  },
};

function StatusBadge({ status }: { status: ModuleStatus }) {
  const palette = {
    Enabled: { color: theme.green, background: "#ecfdf3" },
    Restricted: { color: theme.amber, background: "#fffaeb" },
    Disabled: { color: theme.red, background: "#fef3f2" },
  }[status];

  return (
    <span style={{ ...css.badge, ...palette }}>
      {status}
    </span>
  );
}

function StatCard({
  label,
  value,
  note,
  icon,
}: {
  label: string;
  value: number;
  note: string;
  icon: React.ReactNode;
}) {
  return (
    <div style={css.card}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "14px",
        }}
      >
        <div style={css.statLabel}>{label}</div>
        <span style={{ color: theme.primary }}>{icon}</span>
      </div>
      <div style={css.statValue}>{value}</div>
      <div style={css.statNote}>{note}</div>
    </div>
  );
}

export default function ModulePermissionsPage() {
  const [modules, setModules] = useState(initialModules);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [selected, setSelected] = useState<ModulePermission | null>(null);
  const [draft, setDraft] = useState<ModulePermission | null>(null);
  const [notice, setNotice] = useState("");

  const filteredModules = useMemo(() => {
    const query = search.trim().toLowerCase();

    return modules.filter((module) => {
      const matchesSearch =
        !query ||
        [
          module.id,
          module.name,
          module.description,
          module.roles.join(" "),
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "All" || module.status === statusFilter;

      const matchesRole =
        roleFilter === "All" || module.roles.includes(roleFilter);

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [modules, search, statusFilter, roleFilter]);

  const enabledCount = modules.filter((m) => m.status === "Enabled").length;
  const restrictedCount = modules.filter((m) => m.status === "Restricted").length;
  const disabledCount = modules.filter((m) => m.status === "Disabled").length;

  function openEditor(module: ModulePermission) {
    setSelected(module);
    setDraft({
      ...module,
      roles: [...module.roles],
      actions: { ...module.actions },
    });
    setNotice("");
  }

  function toggleDraftRole(role: string) {
    if (!draft) return;

    setDraft({
      ...draft,
      roles: draft.roles.includes(role)
        ? draft.roles.filter((item) => item !== role)
        : [...draft.roles, role],
    });
  }

  function saveModule() {
    if (!draft) return;

    if (draft.roles.length === 0) {
      setNotice("Assign at least one role before saving.");
      return;
    }

    setModules((current) =>
      current.map((module) => (module.id === draft.id ? draft : module))
    );

    setSelected(null);
    setDraft(null);
    setNotice("");
  }

  function resetDemoData() {
    setModules(
      initialModules.map((module) => ({
        ...module,
        roles: [...module.roles],
        actions: { ...module.actions },
      }))
    );
    setNotice("Module permissions restored to the original demo values.");
  }

  return (
    <main style={css.page}>
      <header style={css.header}>
        <div>
          <div style={css.eyebrow}>Access Control / Permissions</div>
          <h1 style={css.title}>Module Permissions</h1>
          <p style={css.subtitle}>
            Control which roles can access ModelNow modules and which
            actions they can perform within each module.
          </p>
        </div>

        <button style={css.button} onClick={resetDemoData}>
          <RotateCcw size={14} />
          Reset demo data
        </button>
      </header>

      <section style={css.stats}>
        <StatCard
          label="Total Modules"
          value={modules.length}
          note="Modules in this registry"
          icon={<Layers3 size={18} />}
        />
        <StatCard
          label="Enabled"
          value={enabledCount}
          note="Available in this demo"
          icon={<ShieldCheck size={18} />}
        />
        <StatCard
          label="Restricted"
          value={restrictedCount}
          note="Access is limited"
          icon={<LockKeyhole size={18} />}
        />
        <StatCard
          label="Disabled"
          value={disabledCount}
          note="Marked unavailable"
          icon={<X size={18} />}
        />
      </section>

      <section style={css.panel}>
        <div style={css.toolbar}>
          <div style={{ position: "relative", flex: "1 1 240px" }}>
            <Search
              size={15}
              style={{
                position: "absolute",
                top: "50%",
                left: "12px",
                transform: "translateY(-50%)",
                color: "#98a2b3",
              }}
            />
            <input
              style={{ ...css.input, paddingLeft: "36px" }}
              placeholder="Search modules, descriptions, or roles..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search modules"
            />
          </div>

          <select
            style={css.select}
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter modules by status"
          >
            <option value="All">All statuses</option>
            <option value="Enabled">Enabled</option>
            <option value="Restricted">Restricted</option>
            <option value="Disabled">Disabled</option>
          </select>

          <select
            style={css.select}
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            aria-label="Filter modules by role"
          >
            <option value="All">All roles</option>
            {roles.map((role) => (
              <option value={role} key={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        <div style={css.tableWrap}>
          <table style={css.table}>
            <thead>
              <tr>
                <th style={css.th}>Module</th>
                <th style={css.th}>Status</th>
                <th style={css.th}>Assigned Roles</th>
                <th style={css.th}>Allowed Actions</th>
                <th style={{ ...css.th, textAlign: "right" }}>Manage</th>
              </tr>
            </thead>
            <tbody>
              {filteredModules.map((module) => {
                const Icon = module.icon;
                const enabledActions = actionLabels.filter(
                  ({ key }) => module.actions[key]
                );

                return (
                  <tr key={module.id}>
                    <td style={css.td}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "11px",
                        }}
                      >
                        <div
                          style={{
                            width: "38px",
                            height: "38px",
                            borderRadius: "9px",
                            background: "#eff4ff",
                            color: theme.primary,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Icon size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, marginBottom: "5px" }}>
                            {module.name}
                          </div>
                          <div
                            style={{
                              fontSize: "10px",
                              color: theme.muted,
                              marginBottom: "4px",
                            }}
                          >
                            {module.id}
                          </div>
                          <div style={{ fontSize: "11px", color: theme.muted }}>
                            {module.description}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={css.td}>
                      <StatusBadge status={module.status} />
                    </td>

                    <td style={css.td}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                        {module.roles.slice(0, 2).map((role) => (
                          <span
                            key={role}
                            style={{
                              border: `1px solid ${theme.border}`,
                              borderRadius: "5px",
                              padding: "5px 7px",
                              fontSize: "10px",
                            }}
                          >
                            {role}
                          </span>
                        ))}
                        {module.roles.length > 2 && (
                          <span style={{ color: theme.muted, fontSize: "10px" }}>
                            +{module.roles.length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    <td style={css.td}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                        {enabledActions.map(({ key, label }) => (
                          <span
                            key={key}
                            style={{
                              background: "#f2f4f7",
                              color: "#475467",
                              borderRadius: "5px",
                              padding: "5px 7px",
                              fontSize: "10px",
                            }}
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td style={{ ...css.td, textAlign: "right" }}>
                      <button
                        style={css.button}
                        onClick={() => openEditor(module)}
                      >
                        Configure
                        <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredModules.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      ...css.td,
                      textAlign: "center",
                      padding: "45px 20px",
                      color: theme.muted,
                    }}
                  >
                    No modules match these filters.
                    <div style={{ marginTop: "12px" }}>
                      <button
                        style={css.button}
                        onClick={() => {
                          setSearch("");
                          setStatusFilter("All");
                          setRoleFilter("All");
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

        <div
          style={{
            padding: "14px 16px",
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "8px",
            color: theme.muted,
            fontSize: "11px",
          }}
        >
          <span>
            Showing {filteredModules.length} of {modules.length} modules
          </span>
          <span>Module access registry · ModelNow</span>
        </div>
      </section>

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "10px",
          padding: "14px",
          marginTop: "16px",
          border: "1px solid #d1e0ff",
          borderRadius: "10px",
          background: "#eff4ff",
          color: "#3538cd",
          fontSize: "12px",
          lineHeight: 1.6,
        }}
      >
        <ShieldCheck size={17} style={{ flexShrink: 0 }} />
        <div>
          <strong>Security note</strong>
          <div>
            These settings update local demo state only. In production, the
            backend must enforce module and action permissions on every
            protected request.
          </div>
        </div>
      </div>

      {selected && draft && (
        <div
          style={css.overlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelected(null);
              setDraft(null);
            }
          }}
        >
          <aside style={css.drawer}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                alignItems: "flex-start",
                borderBottom: `1px solid ${theme.border}`,
                paddingBottom: "18px",
                marginBottom: "20px",
              }}
            >
              <div>
                <div style={css.eyebrow}>Module Configuration</div>
                <h2 style={{ margin: "0 0 7px", fontSize: "21px" }}>
                  {draft.name}
                </h2>
                <div style={{ fontSize: "12px", color: theme.muted }}>
                  {draft.id}
                </div>
              </div>
              <button
                style={css.button}
                onClick={() => {
                  setSelected(null);
                  setDraft(null);
                }}
                aria-label="Close configuration"
              >
                <X size={15} />
              </button>
            </div>

            {notice && (
              <div
                role="alert"
                style={{
                  padding: "10px",
                  borderRadius: "8px",
                  background: "#fef3f2",
                  color: theme.red,
                  fontSize: "12px",
                  marginBottom: "16px",
                }}
              >
                {notice}
              </div>
            )}

            <div style={{ marginBottom: "20px" }}>
              <label style={css.label} htmlFor="module-status">
                Module Status
              </label>
              <select
                id="module-status"
                style={css.input}
                value={draft.status}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    status: event.target.value as ModuleStatus,
                  })
                }
              >
                <option value="Enabled">Enabled</option>
                <option value="Restricted">Restricted</option>
                <option value="Disabled">Disabled</option>
              </select>
            </div>

            <div style={{ marginBottom: "22px" }}>
              <div style={css.label}>Allowed Actions</div>
              <div
                style={{
                  border: `1px solid ${theme.border}`,
                  borderRadius: "9px",
                  padding: "5px 12px",
                }}
              >
                {actionLabels.map(({ key, label }) => (
                  <label
                    key={key}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 0",
                      borderBottom:
                        key === "manage" ? "none" : `1px solid ${theme.border}`,
                      fontSize: "12px",
                    }}
                  >
                    <span>{label}</span>
                    <input
                      type="checkbox"
                      checked={draft.actions[key]}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          actions: {
                            ...draft.actions,
                            [key]: event.target.checked,
                          },
                        })
                      }
                      style={{ accentColor: theme.primary }}
                    />
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "22px" }}>
              <div style={css.label}>Roles with Module Access</div>
              <div
                style={{
                  border: `1px solid ${theme.border}`,
                  borderRadius: "9px",
                  padding: "5px 12px",
                }}
              >
                {roles.map((role) => (
                  <label
                    key={role}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "9px",
                      padding: "10px 0",
                      fontSize: "12px",
                      borderBottom:
                        role === roles[roles.length - 1]
                          ? "none"
                          : `1px solid ${theme.border}`,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={draft.roles.includes(role)}
                      onChange={() => toggleDraftRole(role)}
                      style={{ accentColor: theme.primary }}
                    />
                    {role}
                  </label>
                ))}
              </div>
            </div>

            <div
              style={{
                background: "#fffaeb",
                color: "#93370d",
                border: "1px solid #fedf89",
                borderRadius: "8px",
                padding: "12px",
                fontSize: "11px",
                lineHeight: 1.6,
                marginBottom: "20px",
              }}
            >
              Changes here are only in local page state. Do not rely on
              frontend controls to secure production APIs.
            </div>

            <div style={{ display: "flex", gap: "9px" }}>
              <button
                style={{ ...css.button, flex: 1 }}
                onClick={() => {
                  setSelected(null);
                  setDraft(null);
                  setNotice("");
                }}
              >
                Cancel
              </button>
              <button
                style={{ ...css.button, ...css.primaryButton, flex: 1 }}
                onClick={saveModule}
              >
                <Save size={14} />
                Save Changes
              </button>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
