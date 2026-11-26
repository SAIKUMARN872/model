
"use client";

import { useMemo, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import {
  Users,
  Plus,
  Search,
  Filter,
  Eye,
  MoreHorizontal,
  X,
  Check,
  ShieldCheck,
  Building2,
  UserRound,
  Pencil,
  Trash2,
  Download,
  UserPlus,
} from "lucide-react";

type TeamStatus = "Active" | "Planning" | "Archived";

type Team = {
  id: string;
  name: string;
  code: string;
  department: string;
  lead: string;
  leadEmail: string;
  members: number;
  description: string;
  status: TeamStatus;
  created: string;
};

const initialTeams: Team[] = [
  {
    id: "TEAM-1001",
    name: "AI Gateway",
    code: "AI-GW",
    department: "Engineering",
    lead: "Vikram Rao",
    leadEmail: "vikram@modelnow.example",
    members: 9,
    description: "Model routing, provider integrations, and gateway reliability.",
    status: "Active",
    created: "2026-05-15",
  },
  {
    id: "TEAM-1002",
    name: "Agent Platform",
    code: "AGENT",
    department: "Engineering",
    lead: "Arjun Kumar",
    leadEmail: "arjun@modelnow.example",
    members: 8,
    description: "Agent execution, tool integrations, and workflow orchestration.",
    status: "Active",
    created: "2026-05-20",
  },
  {
    id: "TEAM-1003",
    name: "Model Evaluation",
    code: "EVAL",
    department: "AI Research",
    lead: "Rahul Verma",
    leadEmail: "rahul@modelnow.example",
    members: 7,
    description: "Model benchmarks, evaluation datasets, and quality measurement.",
    status: "Active",
    created: "2026-06-02",
  },
  {
    id: "TEAM-1004",
    name: "Fine-tuning Research",
    code: "FT-RES",
    department: "AI Research",
    lead: "Ananya Rao",
    leadEmail: "ananya@modelnow.example",
    members: 6,
    description: "Model adaptation, training pipelines, and experimentation.",
    status: "Active",
    created: "2026-06-08",
  },
  {
    id: "TEAM-1005",
    name: "Product Experience",
    code: "UX",
    department: "Product",
    lead: "Priya Reddy",
    leadEmail: "priya@modelnow.example",
    members: 5,
    description: "User experience, product discovery, and interaction design.",
    status: "Active",
    created: "2026-06-18",
  },
  {
    id: "TEAM-1006",
    name: "Security Operations",
    code: "SEC-OPS",
    department: "Security",
    lead: "Sneha Patel",
    leadEmail: "sneha@modelnow.example",
    members: 4,
    description: "Security monitoring, incident response, and access reviews.",
    status: "Active",
    created: "2026-07-01",
  },
  {
    id: "TEAM-1007",
    name: "Customer Enablement",
    code: "CS",
    department: "Operations",
    lead: "Unassigned",
    leadEmail: "",
    members: 0,
    description: "Customer onboarding, enablement, and operational readiness.",
    status: "Planning",
    created: "2026-09-10",
  },
  {
    id: "TEAM-1008",
    name: "Legacy Integrations",
    code: "LEGACY",
    department: "Engineering",
    lead: "Unassigned",
    leadEmail: "",
    members: 3,
    description: "Maintenance of older integration workflows.",
    status: "Archived",
    created: "2026-04-10",
  },
];

const C = {
  text: "#172033",
  muted: "#697586",
  border: "#E5EAF1",
  background: "#F7F9FC",
  blue: "#315FEA",
  green: "#15803D",
  red: "#B42318",
  amber: "#B54708",
};

const statusStyles: Record<TeamStatus, CSSProperties> = {
  Active: { color: "#15803D", background: "#EAF8EF" },
  Planning: { color: "#B54708", background: "#FFF5DF" },
  Archived: { color: "#697586", background: "#EEF1F5" },
};

const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  border: `1px solid ${C.border}`,
  borderRadius: 9,
  background: "#FFFFFF",
  color: C.text,
  fontSize: 12,
  outline: "none",
};

const buttonStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  padding: "10px 12px",
  border: `1px solid ${C.border}`,
  borderRadius: 9,
  background: "#FFFFFF",
  color: C.text,
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const primaryButtonStyle: CSSProperties = {
  ...buttonStyle,
  color: "#FFFFFF",
  background: C.blue,
  borderColor: C.blue,
};

const emptyForm = {
  name: "",
  code: "",
  department: "Engineering",
  lead: "",
  leadEmail: "",
  members: "0",
  description: "",
  status: "Planning" as TeamStatus,
};

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Team | null>(null);
  const [selected, setSelected] = useState<Team | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState(emptyForm);

  const departments = Array.from(
    new Set(teams.map((team) => team.department)),
  ).sort();

  const filteredTeams = useMemo(() => {
    const query = search.trim().toLowerCase();

    return teams.filter((team) => {
      const matchesSearch =
        !query ||
        [
          team.id,
          team.name,
          team.code,
          team.department,
          team.lead,
          team.description,
        ].some((value) => value.toLowerCase().includes(query));

      return (
        matchesSearch &&
        (statusFilter === "All" || team.status === statusFilter) &&
        (departmentFilter === "All" ||
          team.department === departmentFilter)
      );
    });
  }, [teams, search, statusFilter, departmentFilter]);

  const totalMembers = teams.reduce((sum, team) => sum + team.members, 0);
  const activeCount = teams.filter((team) => team.status === "Active").length;
  const unassignedCount = teams.filter(
    (team) => team.lead === "Unassigned" && team.status !== "Archived",
  ).length;

  function notify(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3000);
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(team: Team) {
    setEditing(team);
    setForm({
      name: team.name,
      code: team.code,
      department: team.department,
      lead: team.lead === "Unassigned" ? "" : team.lead,
      leadEmail: team.leadEmail,
      members: String(team.members),
      description: team.description,
      status: team.status,
    });
    setMenuId(null);
    setShowForm(true);
  }

  function saveTeam(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const duplicateCode = teams.some(
      (team) =>
        team.code.toLowerCase() === form.code.trim().toLowerCase() &&
        team.id !== editing?.id,
    );

    if (duplicateCode) {
      notify("That team code is already in use.");
      return;
    }

    const memberCount = Math.max(0, Number(form.members) || 0);

    if (editing) {
      const updated: Team = {
        ...editing,
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        department: form.department,
        lead: form.lead.trim() || "Unassigned",
        leadEmail: form.leadEmail.trim(),
        members: memberCount,
        description: form.description.trim(),
        status: form.status,
      };

      setTeams((current) =>
        current.map((team) => (team.id === editing.id ? updated : team)),
      );
      setSelected((current) =>
        current?.id === editing.id ? updated : current,
      );
      notify("Team updated in the demo.");
    } else {
      const created: Team = {
        id: `TEAM-${Date.now().toString().slice(-6)}`,
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        department: form.department,
        lead: form.lead.trim() || "Unassigned",
        leadEmail: form.leadEmail.trim(),
        members: memberCount,
        description: form.description.trim(),
        status: form.status,
        created: new Date().toISOString().slice(0, 10),
      };

      setTeams((current) => [created, ...current]);
      setSearch("");
      setStatusFilter("All");
      setDepartmentFilter("All");
      notify("Team created in the demo.");
    }

    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
  }

  function toggleArchive(team: Team) {
    const nextStatus: TeamStatus =
      team.status === "Archived" ? "Active" : "Archived";
    const updated = { ...team, status: nextStatus };

    setTeams((current) =>
      current.map((item) => (item.id === team.id ? updated : item)),
    );
    setSelected((current) =>
      current?.id === team.id ? updated : current,
    );
    setMenuId(null);
    notify(`${team.name} marked ${nextStatus.toLowerCase()}.`);
  }

  function deleteTeam(team: Team) {
    if (!window.confirm(`Delete "${team.name}" from this demo directory?`)) {
      return;
    }

    setTeams((current) => current.filter((item) => item.id !== team.id));
    setSelected((current) => (current?.id === team.id ? null : current));
    setMenuId(null);
    notify("Team removed from the demo directory.");
  }

  function exportCsv() {
    const headers = [
      "Team ID",
      "Name",
      "Code",
      "Department",
      "Team Lead",
      "Lead Email",
      "Members",
      "Status",
      "Created",
      "Description",
    ];

    const rows = filteredTeams.map((team) => [
      team.id,
      team.name,
      team.code,
      team.department,
      team.lead,
      team.leadEmail,
      String(team.members),
      team.status,
      team.created,
      team.description,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${value.replace(/"/g, '""')}"`).join(","),
      )
      .join("\r\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "modelnow-teams.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    notify("Teams CSV exported.");
  }

  return (
    <main style={pageStyle}>
      {notice && (
        <div role="status" style={toastStyle}>
          <Check size={15} />
          {notice}
          <button
            onClick={() => setNotice("")}
            aria-label="Dismiss notification"
            style={{ ...buttonStyle, padding: 4 }}
          >
            <X size={13} />
          </button>
        </div>
      )}

      <header style={headerStyle}>
        <div>
          <div style={breadcrumbStyle}>
            <span>Admin Console</span>
            <span>/</span>
            <span>Workspace</span>
            <span>/</span>
            <span style={{ color: C.blue }}>Teams</span>
          </div>
          <h1 style={titleStyle}>Team Management</h1>
          <p style={subtitleStyle}>
            Create teams, assign department ownership, review team membership,
            and manage the operational structure of your workspace.
          </p>
        </div>

        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          <button onClick={exportCsv} style={buttonStyle}>
            <Download size={15} />
            Export CSV
          </button>
          <button onClick={openCreate} style={primaryButtonStyle}>
            <Plus size={16} />
            Create team
          </button>
        </div>
      </header>

      <section style={metricsGridStyle}>
        {[
          {
            label: "Total teams",
            value: teams.length,
            description: "Across all departments",
            icon: Users,
            color: "#315FEA",
            bg: "#EDF2FF",
          },
          {
            label: "Active teams",
            value: activeCount,
            description: "Currently operating",
            icon: Check,
            color: "#15803D",
            bg: "#EAF8EF",
          },
          {
            label: "Team members",
            value: totalMembers,
            description: "Combined demo headcount",
            icon: UserPlus,
            color: "#6941C6",
            bg: "#F2EDFF",
          },
          {
            label: "Leads unassigned",
            value: unassignedCount,
            description: "Teams needing ownership",
            icon: ShieldCheck,
            color: "#B54708",
            bg: "#FFF5DF",
          },
        ].map((metric) => {
          const Icon = metric.icon;

          return (
            <article key={metric.label} style={metricCardStyle}>
              <div style={metricTopStyle}>
                <span style={metricLabelStyle}>{metric.label}</span>
                <span
                  style={{
                    ...metricIconStyle,
                    color: metric.color,
                    background: metric.bg,
                  }}
                >
                  <Icon size={18} />
                </span>
              </div>
              <div style={metricValueStyle}>
                {metric.value.toLocaleString()}
              </div>
              <p style={metricDescriptionStyle}>{metric.description}</p>
            </article>
          );
        })}
      </section>

      <section style={panelStyle}>
        <div style={panelHeaderStyle}>
          <div>
            <h2 style={panelTitleStyle}>Teams directory</h2>
            <p style={panelSubtitleStyle}>
              {filteredTeams.length} of {teams.length} teams
            </p>
          </div>
          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("All");
              setDepartmentFilter("All");
            }}
            style={buttonStyle}
          >
            <Filter size={14} />
            Reset filters
          </button>
        </div>

        <div style={filtersStyle}>
          <div style={{ position: "relative" }}>
            <Search
              size={15}
              style={{
                position: "absolute",
                left: 12,
                top: 12,
                color: C.muted,
              }}
            />
            <input
              aria-label="Search teams"
              placeholder="Search team, code, department, lead..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              style={{ ...inputStyle, paddingLeft: 36 }}
            />
          </div>

          <select
            aria-label="Filter by department"
            value={departmentFilter}
            onChange={(event) => setDepartmentFilter(event.target.value)}
            style={inputStyle}
          >
            <option value="All">All departments</option>
            {departments.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            style={inputStyle}
          >
            <option value="All">All statuses</option>
            <option value="Active">Active</option>
            <option value="Planning">Planning</option>
            <option value="Archived">Archived</option>
          </select>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                {[
                  "TEAM",
                  "DEPARTMENT",
                  "TEAM LEAD",
                  "MEMBERS",
                  "STATUS",
                  "CREATED",
                  "ACTIONS",
                ].map((heading) => (
                  <th key={heading} style={thStyle}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTeams.map((team) => (
                <tr key={team.id}>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span style={avatarStyle}>
                        <Users size={17} />
                      </span>
                      <div>
                        <div style={{ fontWeight: 700 }}>{team.name}</div>
                        <div style={secondaryTextStyle}>
                          {team.code} · {team.id}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td style={tdStyle}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <Building2 size={14} color={C.muted} />
                      {team.department}
                    </span>
                  </td>

                  <td style={tdStyle}>
                    <div style={{ fontWeight: 600 }}>{team.lead}</div>
                    <div style={secondaryTextStyle}>
                      {team.leadEmail || "No email assigned"}
                    </div>
                  </td>

                  <td style={tdStyle}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <Users size={14} color={C.muted} />
                      {team.members}
                    </span>
                  </td>

                  <td style={tdStyle}>
                    <span
                      style={{
                        ...statusStyles[team.status],
                        padding: "5px 9px",
                        borderRadius: 20,
                        fontSize: 10,
                        fontWeight: 650,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {team.status}
                    </span>
                  </td>

                  <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                    {team.created}
                  </td>

                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button
                        title="View team"
                        aria-label={`View ${team.name}`}
                        onClick={() => setSelected(team)}
                        style={{ ...buttonStyle, padding: 7, border: "none" }}
                      >
                        <Eye size={15} />
                      </button>

                      <div style={{ position: "relative" }}>
                        <button
                          title="Team actions"
                          aria-label={`Actions for ${team.name}`}
                          onClick={() =>
                            setMenuId((current) =>
                              current === team.id ? null : team.id,
                            )
                          }
                          style={{ ...buttonStyle, padding: 7, border: "none" }}
                        >
                          <MoreHorizontal size={16} />
                        </button>

                        {menuId === team.id && (
                          <div style={menuStyle}>
                            <button
                              style={menuItemStyle}
                              onClick={() => {
                                setSelected(team);
                                setMenuId(null);
                              }}
                            >
                              <Eye size={14} />
                              View details
                            </button>
                            <button
                              style={menuItemStyle}
                              onClick={() => openEdit(team)}
                            >
                              <Pencil size={14} />
                              Edit team
                            </button>
                            <button
                              style={menuItemStyle}
                              onClick={() => toggleArchive(team)}
                            >
                              <ShieldCheck size={14} />
                              {team.status === "Archived" ? "Reactivate" : "Archive team"}
                            </button>
                            <button
                              style={{ ...menuItemStyle, color: C.red }}
                              onClick={() => deleteTeam(team)}
                            >
                              <Trash2 size={14} />
                              Delete team
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredTeams.length === 0 && (
                <tr>
                  <td colSpan={7} style={emptyStateStyle}>
                    <Search size={22} />
                    <p>No teams match your current search or filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={footerStyle}>
          <span>{filteredTeams.length} team record(s)</span>
          <span>Demo data · Changes are stored in page state only</span>
        </div>
      </section>

      <section style={panelStyle}>
        <div style={panelHeaderStyle}>
          <div>
            <h2 style={panelTitleStyle}>Team organization</h2>
            <p style={panelSubtitleStyle}>
              Key responsibilities for workspace administrators
            </p>
          </div>
        </div>

        <div style={capabilitiesGridStyle}>
          {[
            ["Department alignment", "Keep each team associated with its owning department."],
            ["Leadership ownership", "Identify team leads and flag teams that need an owner."],
            ["Membership overview", "Review team headcount and operational status."],
            ["Lifecycle controls", "Manage active, planning, and archived teams."],
          ].map(([title, description]) => (
            <article key={title} style={capabilityCardStyle}>
              <span style={capabilityIconStyle}>
                <ShieldCheck size={17} />
              </span>
              <div>
                <h3 style={{ margin: "0 0 6px", fontSize: 12 }}>{title}</h3>
                <p style={capabilityDescriptionStyle}>{description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {showForm && (
        <div
          style={overlayStyle}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowForm(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="team-form-title"
            style={modalStyle}
          >
            <div style={modalHeaderStyle}>
              <div>
                <h2 id="team-form-title" style={{ margin: 0, fontSize: 19 }}>
                  {editing ? "Edit team" : "Create team"}
                </h2>
                <p style={{ margin: "6px 0 0", color: C.muted, fontSize: 12 }}>
                  {editing ? "Update team information." : "Add a team to a department."}
                </p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                aria-label="Close form"
                style={{ ...buttonStyle, padding: 7 }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={saveTeam} style={formStyle}>
              <label style={labelStyle}>
                Team name
                <input
                  required
                  maxLength={80}
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="e.g. Customer Support"
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                Team code
                <input
                  required
                  maxLength={12}
                  value={form.code}
                  onChange={(event) =>
                    setForm({ ...form, code: event.target.value.toUpperCase() })
                  }
                  placeholder="e.g. SUPPORT"
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                Department
                <select
                  value={form.department}
                  onChange={(event) => setForm({ ...form, department: event.target.value })}
                  style={inputStyle}
                >
                  {Array.from(new Set(["Engineering", "AI Research", "Product", "Operations", "Security", ...departments])).map(
                    (department) => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label style={labelStyle}>
                Team lead
                <input
                  value={form.lead}
                  onChange={(event) => setForm({ ...form, lead: event.target.value })}
                  placeholder="Name of team lead"
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                Team lead email
                <input
                  type="email"
                  value={form.leadEmail}
                  onChange={(event) => setForm({ ...form, leadEmail: event.target.value })}
                  placeholder="lead@company.com"
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                Initial member count
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={form.members}
                  onChange={(event) => setForm({ ...form, members: event.target.value })}
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                Description
                <textarea
                  rows={3}
                  maxLength={300}
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  placeholder="What does this team do?"
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </label>

              <label style={labelStyle}>
                Status
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm({ ...form, status: event.target.value as TeamStatus })
                  }
                  style={inputStyle}
                >
                  <option value="Active">Active</option>
                  <option value="Planning">Planning</option>
                  <option value="Archived">Archived</option>
                </select>
              </label>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 9 }}>
                <button type="button" onClick={() => setShowForm(false)} style={buttonStyle}>
                  Cancel
                </button>
                <button type="submit" style={primaryButtonStyle}>
                  <Plus size={15} />
                  {editing ? "Save changes" : "Create team"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {selected && (
        <div
          style={overlayStyle}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="team-details-title"
            style={modalStyle}
          >
            <div style={modalHeaderStyle}>
              <div>
                <h2 id="team-details-title" style={{ margin: 0, fontSize: 19 }}>
                  Team details
                </h2>
                <p style={{ color: C.muted, fontSize: 12, margin: "6px 0 0" }}>
                  {selected.id}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                aria-label="Close details"
                style={{ ...buttonStyle, padding: 7 }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <span style={{ ...avatarStyle, width: 48, height: 48 }}>
                  <Users size={23} />
                </span>
                <div>
                  <h3 style={{ margin: "0 0 6px", fontSize: 18 }}>{selected.name}</h3>
                  <span style={{ color: C.muted, fontSize: 12 }}>
                    {selected.code} · {selected.department}
                  </span>
                </div>
              </div>

              <p style={{ color: C.muted, fontSize: 12, lineHeight: 1.7 }}>
                {selected.description || "No description provided."}
              </p>

              <div style={detailsGridStyle}>
                {[
                  ["Team lead", selected.lead],
                  ["Lead email", selected.leadEmail || "Not assigned"],
                  ["Department", selected.department],
                  ["Members", String(selected.members)],
                  ["Status", selected.status],
                  ["Created", selected.created],
                  ["Team code", selected.code],
                  ["Team ID", selected.id],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>
                      {label}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 650, overflowWrap: "anywhere" }}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 9, marginTop: 26 }}>
                <button onClick={() => openEdit(selected)} style={buttonStyle}>
                  <Pencil size={14} />
                  Edit team
                </button>
                <button onClick={() => setSelected(null)} style={buttonStyle}>
                  Close
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  padding: 28,
  background: C.background,
  color: C.text,
  fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
};

const headerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 18,
  flexWrap: "wrap",
  marginBottom: 25,
};

const breadcrumbStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 9,
  color: C.muted,
  fontSize: 12,
  marginBottom: 12,
};

const titleStyle: CSSProperties = {
  margin: "0 0 9px",
  fontSize: 28,
  letterSpacing: -0.8,
  fontWeight: 750,
};

const subtitleStyle: CSSProperties = {
  margin: 0,
  maxWidth: 700,
  color: C.muted,
  fontSize: 13,
  lineHeight: 1.7,
};

const metricsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(205px, 1fr))",
  gap: 15,
  marginBottom: 24,
};

const metricCardStyle: CSSProperties = {
  padding: 19,
  border: `1px solid ${C.border}`,
  borderRadius: 13,
  background: "#FFFFFF",
};

const metricTopStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
};

const metricLabelStyle: CSSProperties = {
  color: C.muted,
  fontSize: 12,
  fontWeight: 600,
};

const metricIconStyle: CSSProperties = {
  display: "grid",
  placeItems: "center",
  width: 36,
  height: 36,
  borderRadius: 10,
};

const metricValueStyle: CSSProperties = {
  marginTop: 13,
  fontSize: 29,
  fontWeight: 750,
  letterSpacing: -0.7,
};

const metricDescriptionStyle: CSSProperties = {
  margin: "7px 0 0",
  color: C.muted,
  fontSize: 11,
};

const panelStyle: CSSProperties = {
  marginBottom: 22,
  border: `1px solid ${C.border}`,
  borderRadius: 13,
  background: "#FFFFFF",
  overflow: "visible",
};

const panelHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 12,
  padding: "20px 21px",
  borderBottom: `1px solid ${C.border}`,
};

const panelTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 16,
  fontWeight: 700,
};

const panelSubtitleStyle: CSSProperties = {
  margin: "6px 0 0",
  color: C.muted,
  fontSize: 11,
};

const filtersStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: 11,
  padding: "16px 21px",
  borderBottom: `1px solid ${C.border}`,
};

const tableStyle: CSSProperties = {
  width: "100%",
  minWidth: 980,
  borderCollapse: "collapse",
  textAlign: "left",
  fontSize: 12,
};

const thStyle: CSSProperties = {
  padding: "13px 15px",
  color: C.muted,
  background: "#FAFBFD",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: 0.5,
  whiteSpace: "nowrap",
  borderBottom: `1px solid ${C.border}`,
};

const tdStyle: CSSProperties = {
  padding: 14,
  verticalAlign: "middle",
  borderBottom: `1px solid ${C.border}`,
};

const avatarStyle: CSSProperties = {
  display: "grid",
  placeItems: "center",
  width: 36,
  height: 36,
  borderRadius: 10,
  flexShrink: 0,
  background: "#EDF2FF",
  color: C.blue,
};

const secondaryTextStyle: CSSProperties = {
  marginTop: 4,
  color: C.muted,
  fontSize: 10,
};

const footerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: 10,
  padding: "13px 21px",
  color: C.muted,
  fontSize: 10,
};

const emptyStateStyle: CSSProperties = {
  padding: 45,
  textAlign: "center",
  color: C.muted,
};

const capabilitiesGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 13,
  padding: 20,
};

const capabilityCardStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 11,
  padding: 15,
  border: `1px solid ${C.border}`,
  borderRadius: 10,
};

const capabilityIconStyle: CSSProperties = {
  display: "grid",
  placeItems: "center",
  width: 35,
  height: 35,
  borderRadius: 9,
  background: "#EDF2FF",
  color: C.blue,
  flexShrink: 0,
};

const capabilityDescriptionStyle: CSSProperties = {
  margin: 0,
  color: C.muted,
  fontSize: 11,
  lineHeight: 1.6,
};

const toastStyle: CSSProperties = {
  position: "fixed",
  top: 20,
  right: 24,
  zIndex: 100,
  display: "flex",
  alignItems: "center",
  gap: 9,
  padding: "12px 15px",
  background: "#172033",
  color: "#FFFFFF",
  borderRadius: 10,
  boxShadow: "0 8px 28px #17203326",
  fontSize: 12,
};

const menuStyle: CSSProperties = {
  position: "absolute",
  right: 0,
  top: 35,
  width: 180,
  padding: 5,
  zIndex: 30,
  background: "#FFFFFF",
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  boxShadow: "0 10px 30px #1720331A",
};

const menuItemStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 9,
  width: "100%",
  padding: 10,
  border: "none",
  borderRadius: 7,
  background: "#FFFFFF",
  color: C.text,
  textAlign: "left",
  fontSize: 11,
  cursor: "pointer",
};

const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 90,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 18,
  background: "#10182880",
};

const modalStyle: CSSProperties = {
  width: "100%",
  maxWidth: 530,
  maxHeight: "90vh",
  overflowY: "auto",
  background: "#FFFFFF",
  borderRadius: 15,
  boxShadow: "0 24px 70px #10182840",
};

const modalHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 15,
  padding: 22,
  borderBottom: `1px solid ${C.border}`,
};

const formStyle: CSSProperties = {
  display: "grid",
  gap: 15,
  padding: 22,
};

const labelStyle: CSSProperties = {
  display: "grid",
  gap: 8,
  color: C.text,
  fontSize: 12,
  fontWeight: 600,
};

const detailsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 18,
};
