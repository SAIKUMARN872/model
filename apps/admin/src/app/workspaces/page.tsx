
"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  Building2,
  Check,
  ChevronDown,
  CirclePause,
  Eye,
  LayoutGrid,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

type WorkspacePlan = "Enterprise" | "Business" | "Starter";
type WorkspaceStatus = "Active" | "Suspended" | "Pending";

type Workspace = {
  id: string;
  name: string;
  organization: string;
  owner: string;
  members: number;
  plan: WorkspacePlan;
  status: WorkspaceStatus;
  lastActivity: string;
};

const initialWorkspaces: Workspace[] = [
  {
    id: "WS-1001",
    name: "AI Research Hub",
    organization: "Acme Corporation",
    owner: "admin@acme.example",
    members: 842,
    plan: "Enterprise",
    status: "Active",
    lastActivity: "2 minutes ago",
  },
  {
    id: "WS-1002",
    name: "Product Engineering",
    organization: "Northstar Technologies",
    owner: "admin@northstar.example",
    members: 624,
    plan: "Enterprise",
    status: "Active",
    lastActivity: "12 minutes ago",
  },
  {
    id: "WS-1003",
    name: "Model Development",
    organization: "Vertex Labs",
    owner: "owner@vertex.example",
    members: 186,
    plan: "Business",
    status: "Active",
    lastActivity: "28 minutes ago",
  },
  {
    id: "WS-1004",
    name: "Data Operations",
    organization: "CloudWorks",
    owner: "admin@cloudworks.example",
    members: 94,
    plan: "Business",
    status: "Active",
    lastActivity: "1 hour ago",
  },
  {
    id: "WS-1005",
    name: "Research Sandbox",
    organization: "Nova Research",
    owner: "owner@novaresearch.example",
    members: 28,
    plan: "Starter",
    status: "Pending",
    lastActivity: "3 hours ago",
  },
  {
    id: "WS-1006",
    name: "Legacy Workspace",
    organization: "Acme Corporation",
    owner: "admin@acme.example",
    members: 16,
    plan: "Business",
    status: "Suspended",
    lastActivity: "5 days ago",
  },
];

const colors = {
  text: "#172033",
  muted: "#697586",
  border: "#E5EAF1",
  background: "#F7F9FC",
  blue: "#315FEA",
  green: "#15803D",
  red: "#B42318",
  amber: "#B54708",
};

const statusStyle: Record<WorkspaceStatus, { color: string; background: string }> = {
  Active: { color: "#15803D", background: "#EAF8EF" },
  Suspended: { color: "#B42318", background: "#FEF0EF" },
  Pending: { color: "#B54708", background: "#FFF5DF" },
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  border: `1px solid ${colors.border}`,
  borderRadius: 9,
  padding: "10px 12px",
  fontSize: 13,
  color: colors.text,
  background: "#FFFFFF",
  outline: "none",
};

const buttonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  padding: "10px 13px",
  borderRadius: 9,
  border: `1px solid ${colors.border}`,
  background: "#FFFFFF",
  color: colors.text,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(initialWorkspaces);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [planFilter, setPlanFilter] = useState("All");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [menuWorkspaceId, setMenuWorkspaceId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const [form, setForm] = useState({
    name: "",
    organization: "",
    owner: "",
    plan: "Business" as WorkspacePlan,
  });

  const filteredWorkspaces = useMemo(() => {
    const query = search.trim().toLowerCase();

    return workspaces.filter((workspace) => {
      const matchesSearch =
        !query ||
        [
          workspace.id,
          workspace.name,
          workspace.organization,
          workspace.owner,
        ].some((value) => value.toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "All" || workspace.status === statusFilter;

      const matchesPlan = planFilter === "All" || workspace.plan === planFilter;

      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [workspaces, search, statusFilter, planFilter]);

  const metrics = [
    {
      title: "Total Workspaces",
      value: workspaces.length.toLocaleString(),
      description: "Workspaces in this directory",
      icon: LayoutGrid,
      color: "#315FEA",
      background: "#EDF2FF",
    },
    {
      title: "Active Workspaces",
      value: workspaces.filter((item) => item.status === "Active").length.toLocaleString(),
      description: "Currently active",
      icon: Activity,
      color: "#15803D",
      background: "#EAF8EF",
    },
    {
      title: "Total Members",
      value: workspaces.reduce((sum, item) => sum + item.members, 0).toLocaleString(),
      description: "Across listed workspaces",
      icon: Users,
      color: "#6941C6",
      background: "#F2EDFF",
    },
    {
      title: "Pending Workspaces",
      value: workspaces.filter((item) => item.status === "Pending").length.toLocaleString(),
      description: "Awaiting activation",
      icon: ShieldCheck,
      color: "#B54708",
      background: "#FFF5DF",
    },
  ];

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3000);
  }

  function createWorkspace(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const newWorkspace: Workspace = {
      id: `WS-${Date.now().toString().slice(-6)}`,
      name: form.name.trim(),
      organization: form.organization.trim(),
      owner: form.owner.trim(),
      members: 1,
      plan: form.plan,
      status: "Pending",
      lastActivity: "Just created",
    };

    setWorkspaces((current) => [newWorkspace, ...current]);
    setForm({
      name: "",
      organization: "",
      owner: "",
      plan: "Business",
    });
    setShowCreate(false);
    setStatusFilter("All");
    setPlanFilter("All");
    setSearch("");
    showNotice("Workspace created in this demo. It is pending activation.");
  }

  function changeStatus(workspace: Workspace) {
    const nextStatus: WorkspaceStatus =
      workspace.status === "Active" ? "Suspended" : "Active";

    setWorkspaces((current) =>
      current.map((item) =>
        item.id === workspace.id ? { ...item, status: nextStatus } : item,
      ),
    );

    setMenuWorkspaceId(null);
    setSelectedWorkspace((current) =>
      current?.id === workspace.id ? { ...current, status: nextStatus } : current,
    );

    showNotice(`${workspace.name} marked ${nextStatus.toLowerCase()}.`);
  }

  function activatePending(workspace: Workspace) {
    setWorkspaces((current) =>
      current.map((item) =>
        item.id === workspace.id ? { ...item, status: "Active" } : item,
      ),
    );
    setMenuWorkspaceId(null);
    showNotice(`${workspace.name} activated.`);
  }

  return (
    <main
      style={{
        minHeight: "100%",
        padding: "28px",
        background: colors.background,
        color: colors.text,
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
      }}
    >
      {notice && (
        <div
          role="status"
          style={{
            position: "fixed",
            top: 20,
            right: 24,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            gap: 9,
            padding: "13px 17px",
            background: "#172033",
            color: "#FFFFFF",
            borderRadius: 10,
            boxShadow: "0 8px 28px #17203326",
            fontSize: 13,
          }}
        >
          <Check size={17} />
          {notice}
          <button
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
            style={{ ...buttonStyle, padding: 3, marginLeft: 5 }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 20,
          flexWrap: "wrap",
          marginBottom: 27,
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              color: colors.muted,
              fontSize: 12,
              marginBottom: 12,
            }}
          >
            <span>Admin Console</span>
            <span>/</span>
            <span style={{ color: colors.blue }}>Workspaces</span>
          </div>

          <h1 style={{ fontSize: 27, letterSpacing: -0.7, margin: "0 0 9px", fontWeight: 750 }}>
            Workspace Management
          </h1>

          <p style={{ color: colors.muted, fontSize: 14, lineHeight: 1.7, margin: 0, maxWidth: 720 }}>
            Manage workspace provisioning, organization membership, plans, and access
            across the ModelNow platform.
          </p>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          style={{
            ...buttonStyle,
            color: "#FFFFFF",
            background: colors.blue,
            borderColor: colors.blue,
            padding: "11px 15px",
          }}
        >
          <Plus size={17} />
          Create workspace
        </button>
      </header>

      <section
        aria-label="Workspace overview"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(205px, 1fr))",
          gap: 16,
          marginBottom: 27,
        }}
      >
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <article
              key={metric.title}
              style={{
                background: "#FFFFFF",
                border: `1px solid ${colors.border}`,
                borderRadius: 13,
                padding: 19,
                minWidth: 0,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: colors.muted }}>
                  {metric.title}
                </span>
                <span
                  style={{
                    display: "grid",
                    placeItems: "center",
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: metric.background,
                    color: metric.color,
                    flexShrink: 0,
                  }}
                >
                  <Icon size={18} />
                </span>
              </div>

              <div style={{ fontSize: 29, fontWeight: 750, letterSpacing: -0.7, marginTop: 13 }}>
                {metric.value}
              </div>

              <p style={{ fontSize: 12, color: colors.muted, margin: "7px 0 0" }}>
                {metric.description}
              </p>
            </article>
          );
        })}
      </section>

      <section
        style={{
          background: "#FFFFFF",
          border: `1px solid ${colors.border}`,
          borderRadius: 13,
          overflow: "visible",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            padding: "21px 22px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
              Workspace Directory
            </h2>
            <p style={{ margin: "6px 0 0", color: colors.muted, fontSize: 12 }}>
              {filteredWorkspaces.length} of {workspaces.length} workspaces
            </p>
          </div>

          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("All");
              setPlanFilter("All");
            }}
            style={buttonStyle}
          >
            Reset filters
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
            gap: 12,
            padding: "17px 22px",
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <div style={{ position: "relative" }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: 12,
                top: 12,
                color: colors.muted,
              }}
            />
            <input
              aria-label="Search workspaces"
              placeholder="Search name, ID, owner..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              style={{ ...inputStyle, paddingLeft: 36 }}
            />
          </div>

          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            style={inputStyle}
          >
            <option value="All">All statuses</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Suspended">Suspended</option>
          </select>

          <select
            aria-label="Filter by plan"
            value={planFilter}
            onChange={(event) => setPlanFilter(event.target.value)}
            style={inputStyle}
          >
            <option value="All">All plans</option>
            <option value="Enterprise">Enterprise</option>
            <option value="Business">Business</option>
            <option value="Starter">Starter</option>
          </select>
        </div>

        <div style={{ overflowX: "auto", width: "100%" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
              fontSize: 12,
              minWidth: 1080,
            }}
          >
            <thead>
              <tr style={{ background: "#FAFBFD", color: colors.muted }}>
                {[
                  "WORKSPACE",
                  "ORGANIZATION",
                  "OWNER",
                  "MEMBERS",
                  "PLAN",
                  "STATUS",
                  "LAST ACTIVITY",
                  "ACTIONS",
                ].map((heading) => (
                  <th
                    key={heading}
                    style={{
                      padding: "13px 15px",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: 0.6,
                      whiteSpace: "nowrap",
                      borderBottom: `1px solid ${colors.border}`,
                    }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredWorkspaces.map((workspace) => (
                <tr key={workspace.id}>
                  <td style={{ padding: "15px", borderBottom: `1px solid ${colors.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                      <span
                        style={{
                          width: 36,
                          height: 36,
                          display: "grid",
                          placeItems: "center",
                          background: "#EDF2FF",
                          color: colors.blue,
                          borderRadius: 9,
                          flexShrink: 0,
                        }}
                      >
                        <LayoutGrid size={17} />
                      </span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 12 }}>{workspace.name}</div>
                        <div style={{ color: colors.muted, fontSize: 10, marginTop: 5 }}>
                          {workspace.id}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: 15, borderBottom: `1px solid ${colors.border}`, whiteSpace: "nowrap" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                      <Building2 size={14} color={colors.muted} />
                      {workspace.organization}
                    </span>
                  </td>

                  <td style={{ padding: 15, borderBottom: `1px solid ${colors.border}`, whiteSpace: "nowrap" }}>
                    {workspace.owner}
                  </td>

                  <td style={{ padding: 15, borderBottom: `1px solid ${colors.border}` }}>
                    {workspace.members.toLocaleString()}
                  </td>

                  <td style={{ padding: 15, borderBottom: `1px solid ${colors.border}` }}>
                    <span
                      style={{
                        padding: "5px 8px",
                        border: `1px solid ${colors.border}`,
                        borderRadius: 6,
                        fontSize: 11,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {workspace.plan}
                    </span>
                  </td>

                  <td style={{ padding: 15, borderBottom: `1px solid ${colors.border}` }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        borderRadius: 20,
                        padding: "5px 9px",
                        fontSize: 11,
                        fontWeight: 650,
                        whiteSpace: "nowrap",
                        ...statusStyle[workspace.status],
                      }}
                    >
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }} />
                      {workspace.status}
                    </span>
                  </td>

                  <td style={{ padding: 15, borderBottom: `1px solid ${colors.border}`, color: colors.muted, whiteSpace: "nowrap" }}>
                    {workspace.lastActivity}
                  </td>

                  <td style={{ padding: 15, borderBottom: `1px solid ${colors.border}` }}>
                    <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                      <button
                        title="View workspace details"
                        aria-label={`View ${workspace.name}`}
                        onClick={() => setSelectedWorkspace(workspace)}
                        style={{ ...buttonStyle, padding: 7, border: "none" }}
                      >
                        <Eye size={16} />
                      </button>

                      <div style={{ position: "relative" }}>
                        <button
                          title="Workspace actions"
                          aria-label={`Actions for ${workspace.name}`}
                          onClick={() =>
                            setMenuWorkspaceId((current) =>
                              current === workspace.id ? null : workspace.id,
                            )
                          }
                          style={{ ...buttonStyle, padding: 7, border: "none" }}
                        >
                          <MoreHorizontal size={17} />
                        </button>

                        {menuWorkspaceId === workspace.id && (
                          <div
                            style={{
                              position: "absolute",
                              right: 0,
                              top: 36,
                              width: 180,
                              background: "#FFFFFF",
                              border: `1px solid ${colors.border}`,
                              borderRadius: 10,
                              boxShadow: "0 10px 30px #1720331A",
                              zIndex: 20,
                              padding: 5,
                            }}
                          >
                            <button
                              onClick={() => {
                                setSelectedWorkspace(workspace);
                                setMenuWorkspaceId(null);
                              }}
                              style={{ ...menuItemStyle, width: "100%" }}
                            >
                              <Eye size={14} />
                              View details
                            </button>

                            {workspace.status === "Pending" ? (
                              <button
                                onClick={() => activatePending(workspace)}
                                style={{ ...menuItemStyle, width: "100%", color: colors.green }}
                              >
                                <Check size={14} />
                                Activate workspace
                              </button>
                            ) : (
                              <button
                                onClick={() => changeStatus(workspace)}
                                style={{
                                  ...menuItemStyle,
                                  width: "100%",
                                  color:
                                    workspace.status === "Active" ? colors.red : colors.green,
                                }}
                              >
                                <CirclePause size={14} />
                                {workspace.status === "Active" ? "Suspend workspace" : "Reactivate workspace"}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredWorkspaces.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: 45, textAlign: "center" }}>
                    <Search size={23} color={colors.muted} />
                    <p style={{ color: colors.muted, marginBottom: 0 }}>
                      No workspaces match your search or filters.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            padding: "14px 22px",
            color: colors.muted,
            fontSize: 11,
          }}
        >
          <span>Showing {filteredWorkspaces.length} workspace(s)</span>
          <span>Demo data · Changes are stored in page state only</span>
        </div>
      </section>

      <section
        style={{
          background: "#FFFFFF",
          border: `1px solid ${colors.border}`,
          borderRadius: 13,
          padding: 22,
        }}
      >
        <h2 style={{ fontSize: 17, margin: "0 0 7px" }}>Administration capabilities</h2>
        <p style={{ fontSize: 12, color: colors.muted, margin: "0 0 18px" }}>
          Workspace controls available for platform administrators.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 13,
          }}
        >
          {[
            ["Workspace provisioning", "Create and prepare workspaces for organizations."],
            ["Membership overview", "Review member counts across workspaces."],
            ["Organization ownership", "Identify the organization and listed owner."],
            ["Lifecycle controls", "Activate, suspend, and reactivate workspaces."],
            ["Plan visibility", "Review the assigned workspace plan."],
            ["Activity visibility", "Inspect the last recorded activity label."],
          ].map(([title, description]) => (
            <article
              key={title}
              style={{
                border: `1px solid ${colors.border}`,
                borderRadius: 10,
                padding: 15,
                display: "flex",
                gap: 11,
              }}
            >
              <span style={{ color: colors.blue, paddingTop: 2 }}>
                <ShieldCheck size={17} />
              </span>
              <div>
                <h3 style={{ margin: "0 0 6px", fontSize: 12 }}>{title}</h3>
                <p style={{ margin: 0, color: colors.muted, fontSize: 11, lineHeight: 1.6 }}>
                  {description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {showCreate && (
        <div style={overlayStyle} onMouseDown={(event) => {
          if (event.target === event.currentTarget) setShowCreate(false);
        }}>
          <section role="dialog" aria-modal="true" aria-labelledby="create-title" style={modalStyle}>
            <div style={modalHeaderStyle}>
              <div>
                <h2 id="create-title" style={{ margin: 0, fontSize: 19 }}>Create workspace</h2>
                <p style={{ margin: "6px 0 0", fontSize: 12, color: colors.muted }}>
                  Add a workspace to the local demo directory.
                </p>
              </div>
              <button aria-label="Close dialog" onClick={() => setShowCreate(false)} style={{ ...buttonStyle, padding: 7 }}>
                <X size={17} />
              </button>
            </div>

            <form onSubmit={createWorkspace} style={{ padding: 22, display: "grid", gap: 15 }}>
              <label style={labelStyle}>
                Workspace name
                <input
                  required
                  maxLength={80}
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="e.g. AI Innovation Lab"
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                Organization
                <input
                  required
                  maxLength={100}
                  value={form.organization}
                  onChange={(event) => setForm({ ...form, organization: event.target.value })}
                  placeholder="Organization name"
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                Owner email
                <input
                  required
                  type="email"
                  value={form.owner}
                  onChange={(event) => setForm({ ...form, owner: event.target.value })}
                  placeholder="owner@company.com"
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                Plan
                <select
                  value={form.plan}
                  onChange={(event) => setForm({ ...form, plan: event.target.value as WorkspacePlan })}
                  style={inputStyle}
                >
                  <option value="Enterprise">Enterprise</option>
                  <option value="Business">Business</option>
                  <option value="Starter">Starter</option>
                </select>
              </label>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 9, marginTop: 5 }}>
                <button type="button" onClick={() => setShowCreate(false)} style={buttonStyle}>
                  Cancel
                </button>
                <button type="submit" style={{ ...buttonStyle, background: colors.blue, color: "#FFFFFF", borderColor: colors.blue }}>
                  <Plus size={15} />
                  Create workspace
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {selectedWorkspace && (
        <div style={overlayStyle} onMouseDown={(event) => {
          if (event.target === event.currentTarget) setSelectedWorkspace(null);
        }}>
          <section role="dialog" aria-modal="true" aria-labelledby="details-title" style={modalStyle}>
            <div style={modalHeaderStyle}>
              <div>
                <h2 id="details-title" style={{ margin: 0, fontSize: 19 }}>Workspace details</h2>
                <p style={{ margin: "6px 0 0", fontSize: 12, color: colors.muted }}>
                  {selectedWorkspace.id}
                </p>
              </div>
              <button aria-label="Close details" onClick={() => setSelectedWorkspace(null)} style={{ ...buttonStyle, padding: 7 }}>
                <X size={17} />
              </button>
            </div>

            <div style={{ padding: 22 }}>
              <div style={{ display: "flex", gap: 13, alignItems: "center", marginBottom: 23 }}>
                <span style={{ display: "grid", placeItems: "center", width: 48, height: 48, background: "#EDF2FF", color: colors.blue, borderRadius: 12 }}>
                  <LayoutGrid size={23} />
                </span>
                <div>
                  <h3 style={{ margin: "0 0 6px", fontSize: 17 }}>{selectedWorkspace.name}</h3>
                  <span style={{ ...statusStyle[selectedWorkspace.status], padding: "4px 9px", borderRadius: 20, fontSize: 11, fontWeight: 650 }}>
                    {selectedWorkspace.status}
                  </span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 17 }}>
                {[
                  ["Organization", selectedWorkspace.organization],
                  ["Owner", selectedWorkspace.owner],
                  ["Members", selectedWorkspace.members.toLocaleString()],
                  ["Plan", selectedWorkspace.plan],
                  ["Last activity", selectedWorkspace.lastActivity],
                  ["Workspace ID", selectedWorkspace.id],
                ].map(([label, value]) => (
                  <div key={label} style={{ minWidth: 0 }}>
                    <div style={{ color: colors.muted, fontSize: 11, marginBottom: 6 }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, overflowWrap: "anywhere" }}>{value}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 9, marginTop: 26 }}>
                {selectedWorkspace.status === "Pending" ? (
                  <button onClick={() => {
                    activatePending(selectedWorkspace);
                    setSelectedWorkspace({ ...selectedWorkspace, status: "Active" });
                  }} style={{ ...buttonStyle, background: colors.blue, color: "#FFFFFF", borderColor: colors.blue }}>
                    <Check size={15} />
                    Activate
                  </button>
                ) : (
                  <button onClick={() => changeStatus(selectedWorkspace)} style={buttonStyle}>
                    <CirclePause size={15} />
                    {selectedWorkspace.status === "Active" ? "Suspend workspace" : "Reactivate workspace"}
                  </button>
                )}
                <button onClick={() => setSelectedWorkspace(null)} style={buttonStyle}>Close</button>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

const menuItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 9,
  border: "none",
  background: "#FFFFFF",
  borderRadius: 7,
  padding: "10px",
  cursor: "pointer",
  textAlign: "left",
  fontSize: 12,
};

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 90,
  background: "#10182880",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 18,
};

const modalStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 510,
  maxHeight: "90vh",
  overflowY: "auto",
  background: "#FFFFFF",
  borderRadius: 15,
  boxShadow: "0 24px 70px #10182840",
};

const modalHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 15,
  padding: 22,
  borderBottom: `1px solid ${colors.border}`,
};

const labelStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
  color: colors.text,
  fontSize: 12,
  fontWeight: 600,
};
