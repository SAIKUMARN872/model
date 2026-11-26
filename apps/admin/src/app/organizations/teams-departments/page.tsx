
"use client";

import { useMemo, useState, type CSSProperties } from "react";
import {
  Building2,
  Users,
  Search,
  Plus,
  X,
  Pencil,
  Trash2,
  CheckCircle2,
  Clock3,
  ChevronDown,
  MoreHorizontal,
  RefreshCw,
  Filter,
  Layers3,
} from "lucide-react";

type TeamStatus = "Active" | "Inactive";

type Team = {
  id: string;
  name: string;
  department: string;
  lead: string;
  email: string;
  members: number;
  status: TeamStatus;
  createdAt: string;
};

const initialTeams: Team[] = [
  {
    id: "TEAM-1001",
    name: "Platform Engineering",
    department: "Engineering",
    lead: "Ethan Williams",
    email: "ethan@acme.com",
    members: 24,
    status: "Active",
    createdAt: "Oct 12, 2026",
  },
  {
    id: "TEAM-1002",
    name: "AI Research",
    department: "Research & AI",
    lead: "Sophia Chen",
    email: "sophia@acme.com",
    members: 18,
    status: "Active",
    createdAt: "Oct 15, 2026",
  },
  {
    id: "TEAM-1003",
    name: "Customer Success",
    department: "Operations",
    lead: "Noah Johnson",
    email: "noah@acme.com",
    members: 12,
    status: "Active",
    createdAt: "Oct 18, 2026",
  },
  {
    id: "TEAM-1004",
    name: "Security & Compliance",
    department: "Security",
    lead: "Ava Patel",
    email: "ava@acme.com",
    members: 8,
    status: "Active",
    createdAt: "Oct 20, 2026",
  },
  {
    id: "TEAM-1005",
    name: "Growth Marketing",
    department: "Marketing",
    lead: "Liam Garcia",
    email: "liam@acme.com",
    members: 6,
    status: "Inactive",
    createdAt: "Oct 22, 2026",
  },
];

const departments = [
  "Engineering",
  "Research & AI",
  "Operations",
  "Security",
  "Marketing",
  "Finance",
  "Human Resources",
];

const emptyTeam: Team = {
  id: "",
  name: "",
  department: "Engineering",
  lead: "",
  email: "",
  members: 0,
  status: "Active",
  createdAt: "",
};

export default function TeamsDepartmentsPage() {
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Team>(emptyTeam);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const activeCount = teams.filter((team) => team.status === "Active").length;
  const totalMembers = teams.reduce((sum, team) => sum + team.members, 0);
  const departmentCount = new Set(teams.map((team) => team.department)).size;

  const filteredTeams = useMemo(() => {
    const query = search.trim().toLowerCase();

    return teams.filter((team) => {
      const matchesSearch =
        !query ||
        team.name.toLowerCase().includes(query) ||
        team.id.toLowerCase().includes(query) ||
        team.lead.toLowerCase().includes(query) ||
        team.email.toLowerCase().includes(query);

      const matchesDepartment =
        departmentFilter === "All" ||
        team.department === departmentFilter;

      const matchesStatus =
        statusFilter === "All" || team.status === statusFilter;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [teams, search, departmentFilter, statusFilter]);

  function showNotice(message: string) {
    setNotice(message);
  }

  function openCreateModal() {
    setEditingId(null);
    setForm({
      ...emptyTeam,
      id: `TEAM-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
    });
    setError("");
    setModalOpen(true);
  }

  function openEditModal(team: Team) {
    setEditingId(team.id);
    setForm({ ...team });
    setError("");
    setModalOpen(true);
  }

  function saveTeam(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const name = form.name.trim();
    const lead = form.lead.trim();
    const email = form.email.trim().toLowerCase();

    if (!name || !lead || !email) {
      setError("Please complete the team name, team lead, and email.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid team lead email address.");
      return;
    }

    const duplicate = teams.some(
      (team) =>
        team.name.toLowerCase() === name.toLowerCase() &&
        team.id !== editingId,
    );

    if (duplicate) {
      setError("A team with this name already exists.");
      return;
    }

    const updatedTeam: Team = {
      ...form,
      name,
      lead,
      email,
      members: Math.max(0, Number(form.members) || 0),
    };

    if (editingId) {
      setTeams((current) =>
        current.map((team) =>
          team.id === editingId ? updatedTeam : team,
        ),
      );
      showNotice("Team updated successfully.");
    } else {
      setTeams((current) => [updatedTeam, ...current]);
      showNotice("Team created successfully.");
    }

    setModalOpen(false);
    setEditingId(null);
  }

  function toggleStatus(team: Team) {
    const nextStatus: TeamStatus =
      team.status === "Active" ? "Inactive" : "Active";

    setTeams((current) =>
      current.map((item) =>
        item.id === team.id ? { ...item, status: nextStatus } : item,
      ),
    );

    showNotice(`${team.name} marked ${nextStatus.toLowerCase()}.`);
  }

  function deleteTeam(team: Team) {
    const confirmed = window.confirm(
      `Delete "${team.name}"? This removes it from this local preview.`,
    );

    if (!confirmed) return;

    setTeams((current) => current.filter((item) => item.id !== team.id));
    setSelectedTeam(null);
    showNotice("Team removed from the preview.");
  }

  function resetFilters() {
    setSearch("");
    setDepartmentFilter("All");
    setStatusFilter("All");
  }

  const cardStyle: CSSProperties = {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 20,
  };

  return (
    <main className="td-page">
      <style>{`
        * { box-sizing: border-box; }

        .td-page {
          min-height: 100vh;
          background: #f7f8fc;
          color: #172033;
          padding: 30px;
          font-family: Arial, Helvetica, sans-serif;
        }

        .td-shell { max-width: 1450px; margin: 0 auto; }

        .td-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 18px;
          margin-bottom: 25px;
        }

        .td-eyebrow {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #64748b;
          font-size: 12px;
          margin-bottom: 10px;
        }

        .td-page h1 {
          font-size: 28px;
          letter-spacing: -0.8px;
          margin: 0 0 8px;
          font-weight: 750;
        }

        .td-subtitle {
          margin: 0;
          color: #64748b;
          font-size: 14px;
          line-height: 1.6;
        }

        .td-btn {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          border: 1px solid #dbe1eb;
          background: white;
          color: #344054;
          border-radius: 9px;
          padding: 10px 13px;
          font-size: 13px;
          font-weight: 650;
          cursor: pointer;
          white-space: nowrap;
        }

        .td-btn:hover { background: #f8fafc; }
        .td-btn-primary {
          color: white;
          background: #315fea;
          border-color: #315fea;
        }
        .td-btn-primary:hover { background: #244ed1; }

        .td-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 15px;
          margin-bottom: 24px;
        }

        .td-stat-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #64748b;
          font-size: 12px;
          gap: 10px;
        }

        .td-stat-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: grid;
          place-items: center;
          background: #eff4ff;
          color: #315fea;
        }

        .td-stat-value {
          font-size: 27px;
          font-weight: 750;
          margin-top: 15px;
          letter-spacing: -0.5px;
        }

        .td-stat-foot {
          color: #94a3b8;
          font-size: 12px;
          margin-top: 6px;
        }

        .td-panel {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          overflow: hidden;
        }

        .td-panel-head {
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          border-bottom: 1px solid #edf0f5;
        }

        .td-panel-head h2 { margin: 0 0 5px; font-size: 16px; }
        .td-panel-head p { margin: 0; color: #94a3b8; font-size: 12px; }

        .td-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          padding: 16px 20px;
          border-bottom: 1px solid #edf0f5;
        }

        .td-search {
          position: relative;
          flex: 1;
          min-width: 220px;
        }

        .td-search svg {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .td-search input {
          width: 100%;
          padding: 10px 12px 10px 37px;
          border: 1px solid #dfe4ec;
          border-radius: 9px;
          outline: none;
          font-size: 13px;
        }

        .td-search input:focus, .td-select:focus, .td-field input:focus,
        .td-field select:focus {
          border-color: #315fea;
          box-shadow: 0 0 0 3px #315fea16;
        }

        .td-select {
          border: 1px solid #dfe4ec;
          border-radius: 9px;
          padding: 10px 12px;
          background: white;
          color: #344054;
          font-size: 13px;
          min-width: 145px;
          outline: none;
        }

        .td-reset {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: 0;
          background: transparent;
          color: #315fea;
          cursor: pointer;
          font-size: 12px;
          font-weight: 650;
        }

        .td-table-wrap { width: 100%; overflow-x: auto; }

        .td-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          min-width: 850px;
        }

        .td-table th {
          background: #fafbfc;
          color: #64748b;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.3px;
          text-transform: uppercase;
          padding: 13px 18px;
          border-bottom: 1px solid #edf0f5;
        }

        .td-table td {
          padding: 16px 18px;
          border-bottom: 1px solid #f0f2f6;
          font-size: 13px;
          vertical-align: middle;
        }

        .td-table tr:last-child td { border-bottom: 0; }
        .td-table tbody tr:hover { background: #fafcff; }

        .td-team-cell {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 210px;
        }

        .td-team-avatar {
          width: 39px;
          height: 39px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 11px;
          background: #eff4ff;
          color: #315fea;
        }

        .td-team-name { font-weight: 700; margin-bottom: 5px; }
        .td-muted { color: #94a3b8; font-size: 11px; }
        .td-lead { font-weight: 650; margin-bottom: 5px; }

        .td-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          border-radius: 20px;
          padding: 5px 9px;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
        }

        .td-active { background: #ecfdf3; color: #15803d; }
        .td-inactive { background: #f1f5f9; color: #64748b; }

        .td-actions { display: flex; align-items: center; gap: 5px; }

        .td-icon-btn {
          display: inline-grid;
          place-items: center;
          width: 32px;
          height: 32px;
          border: 1px solid transparent;
          border-radius: 8px;
          background: transparent;
          color: #64748b;
          cursor: pointer;
        }

        .td-icon-btn:hover {
          background: #f1f5f9;
          border-color: #e2e8f0;
          color: #315fea;
        }

        .td-empty { text-align: center; padding: 48px 20px; color: #64748b; }
        .td-empty svg { margin-bottom: 12px; color: #94a3b8; }

        .td-foot {
          padding: 14px 20px;
          border-top: 1px solid #edf0f5;
          color: #94a3b8;
          font-size: 12px;
          display: flex;
          justify-content: space-between;
          gap: 12px;
        }

        .td-notice {
          margin-bottom: 18px;
          padding: 12px 14px;
          border-radius: 9px;
          border: 1px solid #bbf7d0;
          background: #f0fdf4;
          color: #166534;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
        }

        .td-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: #10182888;
          display: grid;
          place-items: center;
          padding: 20px;
          overflow-y: auto;
        }

        .td-modal {
          width: 100%;
          max-width: 560px;
          max-height: calc(100vh - 40px);
          overflow-y: auto;
          background: white;
          border-radius: 16px;
          box-shadow: 0 24px 70px #10182833;
        }

        .td-modal-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 22px;
          border-bottom: 1px solid #edf0f5;
        }

        .td-modal-head h2 { font-size: 19px; margin: 0 0 6px; }
        .td-modal-head p { color: #64748b; font-size: 12px; margin: 0; }

        .td-modal-body { padding: 22px; }
        .td-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

        .td-field { display: flex; flex-direction: column; gap: 7px; }
        .td-field-full { grid-column: 1 / -1; }
        .td-field label { color: #475569; font-size: 12px; font-weight: 700; }

        .td-field input, .td-field select {
          width: 100%;
          padding: 11px 12px;
          border: 1px solid #dfe4ec;
          border-radius: 9px;
          outline: none;
          background: white;
          font-size: 13px;
        }

        .td-error {
          color: #b42318;
          background: #fef3f2;
          border: 1px solid #fecdca;
          border-radius: 8px;
          padding: 10px 12px;
          margin-bottom: 15px;
          font-size: 12px;
        }

        .td-modal-foot {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 16px 22px;
          border-top: 1px solid #edf0f5;
        }

        .td-detail-list {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .td-detail-item {
          border: 1px solid #edf0f5;
          border-radius: 10px;
          padding: 13px;
          min-width: 0;
        }

        .td-detail-label {
          color: #94a3b8;
          font-size: 11px;
          margin-bottom: 7px;
        }

        .td-detail-value {
          color: #172033;
          font-size: 13px;
          font-weight: 650;
          overflow-wrap: anywhere;
        }

        .td-preview-note {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          color: #64748b;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 12px 14px;
          border-radius: 10px;
          font-size: 12px;
          line-height: 1.6;
          margin-top: 20px;
        }

        @media (max-width: 1000px) {
          .td-page { padding: 22px; }
          .td-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }

        @media (max-width: 600px) {
          .td-page { padding: 15px; }
          .td-top { flex-direction: column; }
          .td-top > .td-btn { width: 100%; }
          .td-page h1 { font-size: 24px; }
          .td-stats { grid-template-columns: 1fr 1fr; gap: 10px; }
          .td-stats > div { padding: 14px !important; }
          .td-stat-value { font-size: 23px; }
          .td-panel-head { align-items: flex-start; flex-direction: column; }
          .td-filters { padding: 14px; }
          .td-search { min-width: 100%; }
          .td-select { flex: 1; min-width: 0; }
          .td-form-grid, .td-detail-list { grid-template-columns: 1fr; }
          .td-field-full { grid-column: auto; }
          .td-foot { flex-direction: column; }
        }
      `}</style>

      <div className="td-shell">
        <div className="td-top">
          <div>
            <div className="td-eyebrow">
              <Building2 size={15} />
              Organizations / Teams & Departments
            </div>
            <h1>Teams & Departments</h1>
            <p className="td-subtitle">
              Organize your organization into teams, assign team leads, and
              manage departmental membership.
            </p>
          </div>

          <button className="td-btn td-btn-primary" onClick={openCreateModal}>
            <Plus size={16} />
            Create team
          </button>
        </div>

        {notice && (
          <div className="td-notice">
            <span>{notice}</span>
            <button
              className="td-icon-btn"
              onClick={() => setNotice("")}
              aria-label="Dismiss notification"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="td-stats">
          <div style={cardStyle}>
            <div className="td-stat-label">
              Total teams
              <span className="td-stat-icon"><Layers3 size={18} /></span>
            </div>
            <div className="td-stat-value">{teams.length}</div>
            <div className="td-stat-foot">Across all departments</div>
          </div>

          <div style={cardStyle}>
            <div className="td-stat-label">
              Active teams
              <span className="td-stat-icon"><CheckCircle2 size={18} /></span>
            </div>
            <div className="td-stat-value">{activeCount}</div>
            <div className="td-stat-foot">Currently enabled</div>
          </div>

          <div style={cardStyle}>
            <div className="td-stat-label">
              Team members
              <span className="td-stat-icon"><Users size={18} /></span>
            </div>
            <div className="td-stat-value">{totalMembers}</div>
            <div className="td-stat-foot">Combined team membership</div>
          </div>

          <div style={cardStyle}>
            <div className="td-stat-label">
              Departments
              <span className="td-stat-icon"><Building2 size={18} /></span>
            </div>
            <div className="td-stat-value">{departmentCount}</div>
            <div className="td-stat-foot">Departments represented</div>
          </div>
        </div>

        <section className="td-panel">
          <div className="td-panel-head">
            <div>
              <h2>All teams</h2>
              <p>Manage teams, department assignments, and team leads.</p>
            </div>
            <button className="td-btn" onClick={resetFilters}>
              <RefreshCw size={14} />
              Reset filters
            </button>
          </div>

          <div className="td-filters">
            <div className="td-search">
              <Search size={16} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search teams, IDs, leads, or emails..."
                aria-label="Search teams"
              />
            </div>

            <select
              className="td-select"
              value={departmentFilter}
              onChange={(event) => setDepartmentFilter(event.target.value)}
              aria-label="Filter by department"
            >
              <option value="All">All departments</option>
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>

            <select
              className="td-select"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by status"
            >
              <option value="All">All statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <button className="td-reset" onClick={resetFilters}>
              <Filter size={14} />
              Clear
            </button>
          </div>

          <div className="td-table-wrap">
            <table className="td-table">
              <thead>
                <tr>
                  <th>Team</th>
                  <th>Department</th>
                  <th>Team lead</th>
                  <th>Members</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeams.map((team) => (
                  <tr key={team.id}>
                    <td>
                      <div className="td-team-cell">
                        <div className="td-team-avatar">
                          <Building2 size={19} />
                        </div>
                        <div>
                          <div className="td-team-name">{team.name}</div>
                          <div className="td-muted">{team.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>{team.department}</td>
                    <td>
                      <div className="td-lead">{team.lead}</div>
                      <div className="td-muted">{team.email}</div>
                    </td>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <Users size={14} color="#94a3b8" />
                        {team.members}
                      </span>
                    </td>
                    <td>
                      <span className={`td-badge ${team.status === "Active" ? "td-active" : "td-inactive"}`}>
                        {team.status === "Active" ? (
                          <CheckCircle2 size={12} />
                        ) : (
                          <Clock3 size={12} />
                        )}
                        {team.status}
                      </span>
                    </td>
                    <td>{team.createdAt}</td>
                    <td>
                      <div className="td-actions">
                        <button
                          className="td-icon-btn"
                          onClick={() => setSelectedTeam(team)}
                          title="View team details"
                          aria-label={`View ${team.name}`}
                        >
                          <MoreHorizontal size={17} />
                        </button>
                        <button
                          className="td-icon-btn"
                          onClick={() => openEditModal(team)}
                          title="Edit team"
                          aria-label={`Edit ${team.name}`}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          className="td-icon-btn"
                          onClick={() => toggleStatus(team)}
                          title={team.status === "Active" ? "Deactivate team" : "Activate team"}
                          aria-label={`Toggle status for ${team.name}`}
                        >
                          {team.status === "Active" ? (
                            <Clock3 size={15} />
                          ) : (
                            <CheckCircle2 size={15} />
                          )}
                        </button>
                        <button
                          className="td-icon-btn"
                          onClick={() => deleteTeam(team)}
                          title="Delete team"
                          aria-label={`Delete ${team.name}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredTeams.length === 0 && (
                  <tr>
                    <td colSpan={7}>
                      <div className="td-empty">
                        <Search size={26} />
                        <div style={{ fontWeight: 700, marginBottom: 6 }}>
                          No teams found
                        </div>
                        <div style={{ fontSize: 12 }}>
                          Try changing your search or filter settings.
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="td-foot">
            <span>
              Showing {filteredTeams.length} of {teams.length} teams
            </span>
            <span>Preview data · Changes are local to this page</span>
          </div>
        </section>

        <div className="td-preview-note">
          <Clock3 size={16} />
          <span>
            <strong>Preview mode:</strong> Team changes are currently stored in
            page state only. Connect this page to your organization API and
            database to persist changes across sessions.
          </span>
        </div>
      </div>

      {modalOpen && (
        <div
          className="td-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setModalOpen(false);
          }}
        >
          <form className="td-modal" onSubmit={saveTeam}>
            <div className="td-modal-head">
              <div>
                <h2>{editingId ? "Edit team" : "Create a team"}</h2>
                <p>
                  Configure the team name, department, and team lead.
                </p>
              </div>
              <button
                type="button"
                className="td-icon-btn"
                onClick={() => setModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="td-modal-body">
              {error && <div className="td-error">{error}</div>}

              <div className="td-form-grid">
                <div className="td-field td-field-full">
                  <label htmlFor="team-name">Team name *</label>
                  <input
                    id="team-name"
                    value={form.name}
                    onChange={(event) =>
                      setForm({ ...form, name: event.target.value })
                    }
                    placeholder="e.g. Platform Engineering"
                    required
                  />
                </div>

                <div className="td-field td-field-full">
                  <label htmlFor="team-department">Department *</label>
                  <select
                    id="team-department"
                    value={form.department}
                    onChange={(event) =>
                      setForm({ ...form, department: event.target.value })
                    }
                  >
                    {departments.map((department) => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="td-field">
                  <label htmlFor="team-lead">Team lead *</label>
                  <input
                    id="team-lead"
                    value={form.lead}
                    onChange={(event) =>
                      setForm({ ...form, lead: event.target.value })
                    }
                    placeholder="Full name"
                    required
                  />
                </div>

                <div className="td-field">
                  <label htmlFor="team-email">Lead email *</label>
                  <input
                    id="team-email"
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      setForm({ ...form, email: event.target.value })
                    }
                    placeholder="lead@company.com"
                    required
                  />
                </div>

                <div className="td-field">
                  <label htmlFor="team-members">Member count</label>
                  <input
                    id="team-members"
                    type="number"
                    min="0"
                    value={form.members}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        members: Number(event.target.value),
                      })
                    }
                  />
                </div>

                <div className="td-field">
                  <label htmlFor="team-status">Status</label>
                  <select
                    id="team-status"
                    value={form.status}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        status: event.target.value as TeamStatus,
                      })
                    }
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="td-modal-foot">
              <button
                type="button"
                className="td-btn"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="td-btn td-btn-primary">
                {editingId ? "Save changes" : "Create team"}
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedTeam && (
        <div
          className="td-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedTeam(null);
          }}
        >
          <section className="td-modal">
            <div className="td-modal-head">
              <div>
                <h2>{selectedTeam.name}</h2>
                <p>{selectedTeam.id} · Team details</p>
              </div>
              <button
                className="td-icon-btn"
                onClick={() => setSelectedTeam(null)}
                aria-label="Close details"
              >
                <X size={18} />
              </button>
            </div>

            <div className="td-modal-body">
              <div className="td-detail-list">
                <div className="td-detail-item">
                  <div className="td-detail-label">Department</div>
                  <div className="td-detail-value">{selectedTeam.department}</div>
                </div>
                <div className="td-detail-item">
                  <div className="td-detail-label">Status</div>
                  <div className="td-detail-value">{selectedTeam.status}</div>
                </div>
                <div className="td-detail-item">
                  <div className="td-detail-label">Team lead</div>
                  <div className="td-detail-value">{selectedTeam.lead}</div>
                </div>
                <div className="td-detail-item">
                  <div className="td-detail-label">Lead email</div>
                  <div className="td-detail-value">{selectedTeam.email}</div>
                </div>
                <div className="td-detail-item">
                  <div className="td-detail-label">Members</div>
                  <div className="td-detail-value">{selectedTeam.members}</div>
                </div>
                <div className="td-detail-item">
                  <div className="td-detail-label">Created</div>
                  <div className="td-detail-value">{selectedTeam.createdAt}</div>
                </div>
              </div>
            </div>

            <div className="td-modal-foot">
              <button
                className="td-btn"
                onClick={() => setSelectedTeam(null)}
              >
                Close
              </button>
              <button
                className="td-btn td-btn-primary"
                onClick={() => {
                  const team = selectedTeam;
                  setSelectedTeam(null);
                  openEditModal(team);
                }}
              >
                <Pencil size={14} />
                Edit team
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
