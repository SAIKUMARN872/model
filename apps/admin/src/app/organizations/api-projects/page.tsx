
"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Check,
  CircleAlert,
  Clock3,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Filter,
  KeyRound,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  X,
  Zap,
} from "lucide-react";

type ProjectStatus = "Active" | "Paused" | "Revoked";
type Environment = "Production" | "Development" | "Staging";

type ApiProject = {
  id: string;
  name: string;
  organization: string;
  environment: Environment;
  status: ProjectStatus;
  requests: number;
  createdAt: string;
  lastUsed: string;
  keyPrefix: string;
};

const initialProjects: ApiProject[] = [
  {
    id: "prj_001",
    name: "Customer Support AI",
    organization: "Acme Corporation",
    environment: "Production",
    status: "Active",
    requests: 184520,
    createdAt: "Oct 12, 2026",
    lastUsed: "2 minutes ago",
    keyPrefix: "mn_prod_a8f2",
  },
  {
    id: "prj_002",
    name: "Internal Copilot",
    organization: "Northstar AI",
    environment: "Development",
    status: "Active",
    requests: 42860,
    createdAt: "Oct 18, 2026",
    lastUsed: "18 minutes ago",
    keyPrefix: "mn_dev_c4e9",
  },
  {
    id: "prj_003",
    name: "Document Intelligence",
    organization: "Vertex Labs",
    environment: "Production",
    status: "Active",
    requests: 96320,
    createdAt: "Oct 21, 2026",
    lastUsed: "1 hour ago",
    keyPrefix: "mn_prod_b7d1",
  },
  {
    id: "prj_004",
    name: "Sales Assistant",
    organization: "BrightPath",
    environment: "Staging",
    status: "Paused",
    requests: 12840,
    createdAt: "Oct 25, 2026",
    lastUsed: "3 days ago",
    keyPrefix: "mn_stg_f2a6",
  },
  {
    id: "prj_005",
    name: "Analytics Engine",
    organization: "CloudPeak Systems",
    environment: "Production",
    status: "Active",
    requests: 75800,
    createdAt: "Oct 29, 2026",
    lastUsed: "5 minutes ago",
    keyPrefix: "mn_prod_d5c3",
  },
];

const numberFormat = new Intl.NumberFormat("en-US");
const compactFormat = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export default function OrganizationApiProjectsPage() {
  const [projects, setProjects] = useState<ApiProject[]>(initialProjects);
  const [search, setSearch] = useState("");
  const [environmentFilter, setEnvironmentFilter] = useState("All environments");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ApiProject | null>(null);
  const [newName, setNewName] = useState("");
  const [newOrganization, setNewOrganization] = useState("");
  const [newEnvironment, setNewEnvironment] =
    useState<Environment>("Development");
  const [notice, setNotice] = useState("");
  const [visibleKeys, setVisibleKeys] = useState<string[]>([]);
  const [menuProjectId, setMenuProjectId] = useState<string | null>(null);
  const [deleteProject, setDeleteProject] = useState<ApiProject | null>(null);

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesSearch =
        !query ||
        project.name.toLowerCase().includes(query) ||
        project.organization.toLowerCase().includes(query) ||
        project.id.toLowerCase().includes(query);

      const matchesEnvironment =
        environmentFilter === "All environments" ||
        project.environment === environmentFilter;

      const matchesStatus =
        statusFilter === "All statuses" || project.status === statusFilter;

      return matchesSearch && matchesEnvironment && matchesStatus;
    });
  }, [projects, search, environmentFilter, statusFilter]);

  const activeCount = projects.filter((p) => p.status === "Active").length;
  const pausedCount = projects.filter((p) => p.status === "Paused").length;
  const totalRequests = projects.reduce((sum, p) => sum + p.requests, 0);

  function createProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!newName.trim() || !newOrganization.trim()) {
      setNotice("Enter both a project name and an organization.");
      return;
    }

    const project: ApiProject = {
      id: `prj_${Date.now().toString().slice(-6)}`,
      name: newName.trim(),
      organization: newOrganization.trim(),
      environment: newEnvironment,
      status: "Active",
      requests: 0,
      createdAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
      lastUsed: "Never",
      keyPrefix: `mn_${newEnvironment.toLowerCase()}_••••`,
    };

    setProjects((current) => [project, ...current]);
    setShowCreateModal(false);
    setNewName("");
    setNewOrganization("");
    setNewEnvironment("Development");
    setNotice(
      "Demo project created in this page. No real API key or backend project was provisioned.",
    );
  }

  function toggleProjectStatus(project: ApiProject) {
    const nextStatus: ProjectStatus =
      project.status === "Active" ? "Paused" : "Active";

    setProjects((current) =>
      current.map((item) =>
        item.id === project.id ? { ...item, status: nextStatus } : item,
      ),
    );

    setMenuProjectId(null);
    setNotice(`${project.name} is now ${nextStatus.toLowerCase()} in this demo.`);
  }

  function removeProject() {
    if (!deleteProject) return;

    setProjects((current) =>
      current.filter((project) => project.id !== deleteProject.id),
    );
    setNotice(`${deleteProject.name} was removed from the demo list.`);
    setDeleteProject(null);
    setMenuProjectId(null);
  }

  async function copyProjectId(project: ApiProject) {
    try {
      await navigator.clipboard.writeText(project.id);
      setNotice(`Copied project ID: ${project.id}`);
    } catch {
      setNotice(`Project ID: ${project.id}`);
    }
    setMenuProjectId(null);
  }

  function toggleKeyVisibility(projectId: string) {
    setVisibleKeys((current) =>
      current.includes(projectId)
        ? current.filter((id) => id !== projectId)
        : [...current, projectId],
    );
  }

  function exportProjects() {
    const headers = [
      "Project ID",
      "Project name",
      "Organization",
      "Environment",
      "Status",
      "Requests",
      "Created",
      "Last used",
    ];

    const rows = filteredProjects.map((project) => [
      project.id,
      project.name,
      project.organization,
      project.environment,
      project.status,
      project.requests,
      project.createdAt,
      project.lastUsed,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "modelnow-organization-api-projects.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice("Project report exported.");
  }

  return (
    <main className="api-projects-page">
      <style>{`
        * { box-sizing: border-box; }
        .api-projects-page {
          min-height: 100vh;
          padding: 30px;
          background: #f7f8fc;
          color: #182238;
          font-family: Arial, Helvetica, sans-serif;
        }
        .api-projects-container { max-width: 1450px; margin: 0 auto; }
        .api-breadcrumb { color: #7f899c; font-size: 12px; margin-bottom: 15px; }
        .api-breadcrumb span { color: #315fe8; }
        .api-header {
          display: flex; justify-content: space-between; align-items: flex-start;
          gap: 18px; flex-wrap: wrap; margin-bottom: 25px;
        }
        .api-title { margin: 0 0 8px; font-size: 27px; letter-spacing: -.7px; font-weight: 750; }
        .api-subtitle { margin: 0; color: #7c879c; font-size: 13px; line-height: 1.6; }
        .api-actions { display: flex; gap: 9px; flex-wrap: wrap; }
        .api-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          padding: 10px 13px; border: 1px solid #dfe4ed; border-radius: 9px;
          background: #fff; color: #39465e; font-size: 12px; font-weight: 650;
          cursor: pointer;
        }
        .api-btn:hover { background: #f0f4ff; }
        .api-btn-primary { background: #315fe8; border-color: #315fe8; color: white; }
        .api-btn-primary:hover { background: #254fcf; }
        .api-notice {
          padding: 11px 14px; margin-bottom: 18px; border-radius: 9px;
          border: 1px solid #c9d9ff; background: #eff4ff; color: #244dbb;
          display: flex; align-items: flex-start; justify-content: space-between;
          gap: 10px; font-size: 12px; line-height: 1.5;
        }
        .api-notice-close { border: 0; background: transparent; cursor: pointer; color: inherit; }
        .api-stats {
          display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 15px; margin-bottom: 22px;
        }
        .api-stat {
          background: #fff; border: 1px solid #e8ebf2; border-radius: 13px; padding: 19px;
        }
        .api-stat-top { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 17px; }
        .api-stat-label { font-size: 12px; color: #778298; }
        .api-stat-icon {
          width: 35px; height: 35px; border-radius: 10px; display: grid;
          place-items: center; background: #edf2ff; color: #315fe8;
        }
        .api-stat-value { font-size: 25px; font-weight: 750; letter-spacing: -.5px; margin-bottom: 7px; }
        .api-stat-note { font-size: 11px; color: #8b95a7; }
        .api-content {
          background: #fff; border: 1px solid #e8ebf2; border-radius: 13px; overflow: visible;
        }
        .api-content-header {
          display: flex; justify-content: space-between; align-items: flex-start;
          flex-wrap: wrap; gap: 16px; padding: 21px; border-bottom: 1px solid #edf0f5;
        }
        .api-section-title { margin: 0 0 6px; font-size: 15px; font-weight: 750; }
        .api-section-subtitle { margin: 0; color: #8993a5; font-size: 11px; line-height: 1.5; }
        .api-filters { display: flex; gap: 8px; flex-wrap: wrap; }
        .api-search-wrap { position: relative; }
        .api-search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #929bad; }
        .api-search {
          width: 220px; padding: 10px 10px 10px 31px; border: 1px solid #e0e5ee;
          border-radius: 8px; outline: none; font-size: 11px; color: #263248;
        }
        .api-search:focus, .api-select:focus, .api-input:focus { border-color: #7898ff; }
        .api-select {
          padding: 10px 11px; border: 1px solid #e0e5ee; border-radius: 8px;
          background: #fff; color: #44516a; font-size: 11px; outline: none;
        }
        .api-table-scroll { overflow-x: auto; }
        .api-table { width: 100%; border-collapse: collapse; white-space: nowrap; }
        .api-table th {
          padding: 13px 17px; background: #fafbfe; color: #8992a4;
          text-align: left; font-size: 10px; font-weight: 700;
        }
        .api-table td { padding: 16px 17px; border-top: 1px solid #eff1f6; font-size: 11px; color: #4c5870; }
        .api-project-name { color: #202b40; font-size: 12px; font-weight: 700; }
        .api-project-id { margin-top: 5px; font-size: 10px; color: #9099aa; }
        .api-org { color: #56627a; }
        .api-env {
          display: inline-flex; align-items: center; gap: 6px; padding: 5px 8px;
          border-radius: 6px; background: #f0f3fa; color: #5a6680; font-size: 10px; font-weight: 650;
        }
        .api-env-dot { width: 6px; height: 6px; border-radius: 50%; background: #315fe8; }
        .api-env.Production .api-env-dot { background: #168453; }
        .api-env.Staging .api-env-dot { background: #d88b12; }
        .api-status {
          display: inline-flex; align-items: center; gap: 6px; padding: 5px 8px;
          border-radius: 20px; font-size: 10px; font-weight: 650;
        }
        .api-status.Active { background: #eaf8ef; color: #167747; }
        .api-status.Paused { background: #fff5df; color: #9a6400; }
        .api-status.Revoked { background: #fff0ee; color: #bd3f34; }
        .api-status-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
        .api-key { display: inline-flex; align-items: center; gap: 7px; color: #58657c; font-family: monospace; font-size: 11px; }
        .api-icon-btn {
          width: 30px; height: 30px; display: inline-grid; place-items: center;
          border: 1px solid #e3e7ef; border-radius: 7px; background: #fff;
          color: #65718a; cursor: pointer;
        }
        .api-icon-btn:hover { background: #f1f4fb; color: #315fe8; }
        .api-row-menu { position: relative; }
        .api-menu {
          position: absolute; right: 0; top: 35px; z-index: 10; width: 175px;
          padding: 5px; border: 1px solid #e5e9f1; border-radius: 9px;
          background: #fff; box-shadow: 0 12px 35px #1822381a;
        }
        .api-menu button {
          display: flex; width: 100%; align-items: center; gap: 9px;
          border: 0; border-radius: 6px; background: transparent; padding: 10px;
          text-align: left; color: #455169; font-size: 11px; cursor: pointer;
        }
        .api-menu button:hover { background: #f2f5fc; }
        .api-menu button.danger { color: #c53d3d; }
        .api-empty { padding: 38px 20px; text-align: center; color: #8790a3; font-size: 12px; }
        .api-footer {
          display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap;
          padding: 14px 20px; border-top: 1px solid #edf0f5; color: #8790a3; font-size: 11px;
        }
        .api-modal-backdrop {
          position: fixed; inset: 0; z-index: 100; display: grid; place-items: center;
          padding: 18px; background: rgba(15, 23, 42, .48);
        }
        .api-modal {
          width: 100%; max-width: 490px; max-height: 90vh; overflow-y: auto;
          border-radius: 15px; background: #fff; box-shadow: 0 25px 80px #0002;
        }
        .api-modal-header {
          display: flex; justify-content: space-between; align-items: flex-start;
          gap: 12px; padding: 22px; border-bottom: 1px solid #edf0f5;
        }
        .api-modal-title { margin: 0 0 6px; font-size: 18px; font-weight: 750; }
        .api-modal-subtitle { margin: 0; font-size: 12px; line-height: 1.5; color: #8490a4; }
        .api-modal-body { padding: 22px; }
        .api-form-field { display: flex; flex-direction: column; gap: 7px; margin-bottom: 17px; }
        .api-form-field label { font-size: 12px; color: #46526a; font-weight: 650; }
        .api-input {
          width: 100%; padding: 11px 12px; border: 1px solid #dfe4ed;
          border-radius: 8px; outline: none; background: #fff; color: #202b40; font-size: 12px;
        }
        .api-help { font-size: 10px; line-height: 1.5; color: #8993a5; }
        .api-modal-footer {
          display: flex; justify-content: flex-end; gap: 9px; padding: 16px 22px;
          border-top: 1px solid #edf0f5; background: #fbfcfe; border-radius: 0 0 15px 15px;
        }
        .api-warning {
          display: flex; align-items: flex-start; gap: 10px; padding: 12px;
          border: 1px solid #f2d4a0; background: #fff8e9; color: #80520a;
          border-radius: 9px; font-size: 11px; line-height: 1.6; margin-top: 13px;
        }
        @media (max-width: 1050px) { .api-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 600px) {
          .api-projects-page { padding: 17px; }
          .api-title { font-size: 23px; }
          .api-stats { grid-template-columns: 1fr; }
          .api-content-header { padding: 16px; }
          .api-search-wrap { flex: 1; min-width: 160px; }
          .api-search { width: 100%; }
          .api-filters { width: 100%; }
          .api-filters select { flex: 1; min-width: 0; }
        }
      `}</style>

      <div className="api-projects-container">
        <div className="api-breadcrumb">
          Organizations / <span>API Projects</span>
        </div>

        <header className="api-header">
          <div>
            <h1 className="api-title">Organization API Projects</h1>
            <p className="api-subtitle">
              Manage API projects, environments, access status, and request
              activity across your organizations.
            </p>
          </div>
          <div className="api-actions">
            <button
              className="api-btn"
              onClick={() => {
                setSearch("");
                setEnvironmentFilter("All environments");
                setStatusFilter("All statuses");
                setNotice("Project list refreshed using the current demo data.");
              }}
            >
              <RefreshCw size={14} /> Refresh
            </button>
            <button className="api-btn api-btn-primary" onClick={() => setShowCreateModal(true)}>
              <Plus size={15} /> Create project
            </button>
          </div>
        </header>

        {notice && (
          <div className="api-notice" role="status">
            <span>{notice}</span>
            <button
              className="api-notice-close"
              aria-label="Dismiss notification"
              onClick={() => setNotice("")}
            >
              <X size={15} />
            </button>
          </div>
        )}

        <section className="api-stats">
          <div className="api-stat">
            <div className="api-stat-top">
              <span className="api-stat-label">Total projects</span>
              <span className="api-stat-icon"><KeyRound size={18} /></span>
            </div>
            <div className="api-stat-value">{numberFormat.format(projects.length)}</div>
            <div className="api-stat-note">Projects across organizations</div>
          </div>

          <div className="api-stat">
            <div className="api-stat-top">
              <span className="api-stat-label">Active projects</span>
              <span className="api-stat-icon"><ShieldCheck size={18} /></span>
            </div>
            <div className="api-stat-value">{numberFormat.format(activeCount)}</div>
            <div className="api-stat-note">Currently marked active in this view</div>
          </div>

          <div className="api-stat">
            <div className="api-stat-top">
              <span className="api-stat-label">Total API requests</span>
              <span className="api-stat-icon"><Activity size={18} /></span>
            </div>
            <div className="api-stat-value">{compactFormat.format(totalRequests)}</div>
            <div className="api-stat-note">Illustrative request volume</div>
          </div>

          <div className="api-stat">
            <div className="api-stat-top">
              <span className="api-stat-label">Paused projects</span>
              <span className="api-stat-icon"><CircleAlert size={18} /></span>
            </div>
            <div className="api-stat-value">{numberFormat.format(pausedCount)}</div>
            <div className="api-stat-note">Not marked active</div>
          </div>
        </section>

        <section className="api-content">
          <div className="api-content-header">
            <div>
              <h2 className="api-section-title">All API projects</h2>
              <p className="api-section-subtitle">
                Each project can represent an application, service, or integration.
              </p>
            </div>

            <div className="api-filters">
              <div className="api-search-wrap">
                <Search size={14} className="api-search-icon" />
                <input
                  className="api-search"
                  placeholder="Search project or organization..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <select
                className="api-select"
                value={environmentFilter}
                onChange={(event) => setEnvironmentFilter(event.target.value)}
                aria-label="Filter by environment"
              >
                <option>All environments</option>
                <option>Production</option>
                <option>Development</option>
                <option>Staging</option>
              </select>

              <select
                className="api-select"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label="Filter by status"
              >
                <option>All statuses</option>
                <option>Active</option>
                <option>Paused</option>
                <option>Revoked</option>
              </select>
            </div>
          </div>

          <div className="api-table-scroll">
            <table className="api-table">
              <thead>
                <tr>
                  <th>PROJECT</th>
                  <th>ORGANIZATION</th>
                  <th>ENVIRONMENT</th>
                  <th>API KEY PREFIX</th>
                  <th>REQUESTS</th>
                  <th>STATUS</th>
                  <th>LAST USED</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project) => (
                  <tr key={project.id}>
                    <td>
                      <div className="api-project-name">{project.name}</div>
                      <div className="api-project-id">{project.id}</div>
                    </td>
                    <td><span className="api-org">{project.organization}</span></td>
                    <td>
                      <span className={`api-env ${project.environment}`}>
                        <span className="api-env-dot" />
                        {project.environment}
                      </span>
                    </td>
                    <td>
                      <span className="api-key">
                        {visibleKeys.includes(project.id)
                          ? project.keyPrefix
                          : `${project.keyPrefix.slice(0, 7)}••••••`}
                        <button
                          className="api-icon-btn"
                          onClick={() => toggleKeyVisibility(project.id)}
                          title={visibleKeys.includes(project.id) ? "Hide key prefix" : "Show key prefix"}
                          aria-label="Toggle key prefix visibility"
                        >
                          {visibleKeys.includes(project.id) ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                      </span>
                    </td>
                    <td>{numberFormat.format(project.requests)}</td>
                    <td>
                      <span className={`api-status ${project.status}`}>
                        <span className="api-status-dot" />
                        {project.status}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <Clock3 size={12} />
                        {project.lastUsed}
                      </span>
                    </td>
                    <td>
                      <div className="api-row-menu">
                        <button
                          className="api-icon-btn"
                          onClick={() =>
                            setMenuProjectId(
                              menuProjectId === project.id ? null : project.id,
                            )
                          }
                          aria-label={`Actions for ${project.name}`}
                        >
                          <MoreHorizontal size={16} />
                        </button>

                        {menuProjectId === project.id && (
                          <div className="api-menu">
                            <button onClick={() => {
                              setSelectedProject(project);
                              setMenuProjectId(null);
                            }}>
                              <ExternalLink size={13} /> View details
                            </button>
                            <button onClick={() => copyProjectId(project)}>
                              <Copy size={13} /> Copy project ID
                            </button>
                            <button onClick={() => toggleProjectStatus(project)}>
                              <Activity size={13} />
                              {project.status === "Active" ? "Pause project" : "Activate project"}
                            </button>
                            <button className="danger" onClick={() => {
                              setDeleteProject(project);
                              setMenuProjectId(null);
                            }}>
                              <Trash2 size={13} /> Delete project
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredProjects.length === 0 && (
                  <tr>
                    <td colSpan={8}>
                      <div className="api-empty">
                        No API projects match your search or filters.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="api-footer">
            <span>
              Showing {filteredProjects.length} of {projects.length} projects
            </span>
            <span>Demo records · no real credentials are displayed</span>
          </div>
        </section>

        {showCreateModal && (
          <div className="api-modal-backdrop" onClick={() => setShowCreateModal(false)}>
            <section
              className="api-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="create-project-title"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="api-modal-header">
                <div>
                  <h2 className="api-modal-title" id="create-project-title">Create API project</h2>
                  <p className="api-modal-subtitle">
                    Register an application under an organization.
                  </p>
                </div>
                <button
                  className="api-icon-btn"
                  onClick={() => setShowCreateModal(false)}
                  aria-label="Close dialog"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={createProject}>
                <div className="api-modal-body">
                  <div className="api-form-field">
                    <label htmlFor="project-name">Project name</label>
                    <input
                      id="project-name"
                      className="api-input"
                      value={newName}
                      onChange={(event) => setNewName(event.target.value)}
                      placeholder="e.g. Customer Support Assistant"
                      required
                      maxLength={80}
                    />
                  </div>

                  <div className="api-form-field">
                    <label htmlFor="project-organization">Organization name</label>
                    <input
                      id="project-organization"
                      className="api-input"
                      value={newOrganization}
                      onChange={(event) => setNewOrganization(event.target.value)}
                      placeholder="Enter organization name"
                      required
                      maxLength={100}
                    />
                  </div>

                  <div className="api-form-field">
                    <label htmlFor="project-environment">Environment</label>
                    <select
                      id="project-environment"
                      className="api-input"
                      value={newEnvironment}
                      onChange={(event) =>
                        setNewEnvironment(event.target.value as Environment)
                      }
                    >
                      <option>Development</option>
                      <option>Staging</option>
                      <option>Production</option>
                    </select>
                    <span className="api-help">
                      Production credentials should be created and managed by a
                      secured backend, not this demo form.
                    </span>
                  </div>

                  <div className="api-warning">
                    <CircleAlert size={16} />
                    <span>
                      This is a frontend preview. Creating a project only updates
                      the page state; it does not create a database record or issue
                      a usable API key.
                    </span>
                  </div>
                </div>

                <div className="api-modal-footer">
                  <button
                    type="button"
                    className="api-btn"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="api-btn api-btn-primary">
                    <Plus size={14} /> Create project
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}

        {selectedProject && (
          <div className="api-modal-backdrop" onClick={() => setSelectedProject(null)}>
            <section
              className="api-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="project-details-title"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="api-modal-header">
                <div>
                  <h2 className="api-modal-title" id="project-details-title">
                    {selectedProject.name}
                  </h2>
                  <p className="api-modal-subtitle">
                    Project configuration and activity summary
                  </p>
                </div>
                <button
                  className="api-icon-btn"
                  onClick={() => setSelectedProject(null)}
                  aria-label="Close project details"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="api-modal-body">
                {[
                  ["Project ID", selectedProject.id],
                  ["Organization", selectedProject.organization],
                  ["Environment", selectedProject.environment],
                  ["Status", selectedProject.status],
                  ["Requests", numberFormat.format(selectedProject.requests)],
                  ["Created", selectedProject.createdAt],
                  ["Last used", selectedProject.lastUsed],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 16,
                      padding: "12px 0",
                      borderBottom: "1px solid #edf0f5",
                      fontSize: 12,
                    }}
                  >
                    <span style={{ color: "#8790a3" }}>{label}</span>
                    <strong style={{ textAlign: "right", overflowWrap: "anywhere" }}>
                      {value}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="api-modal-footer">
                <button className="api-btn" onClick={() => setSelectedProject(null)}>
                  Close
                </button>
                <button
                  className="api-btn api-btn-primary"
                  onClick={() => {
                    copyProjectId(selectedProject);
                    setSelectedProject(null);
                  }}
                >
                  <Copy size={14} /> Copy project ID
                </button>
              </div>
            </section>
          </div>
        )}

        {deleteProject && (
          <div className="api-modal-backdrop" onClick={() => setDeleteProject(null)}>
            <section
              className="api-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-project-title"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="api-modal-header">
                <div>
                  <h2 className="api-modal-title" id="delete-project-title">Delete project?</h2>
                  <p className="api-modal-subtitle">
                    You are removing {deleteProject.name} from this demo list.
                  </p>
                </div>
                <button
                  className="api-icon-btn"
                  onClick={() => setDeleteProject(null)}
                  aria-label="Close delete confirmation"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="api-modal-body">
                This action removes the row from the current page state. It does
                not revoke credentials or delete a real backend project.
              </div>

              <div className="api-modal-footer">
                <button className="api-btn" onClick={() => setDeleteProject(null)}>
                  Cancel
                </button>
                <button
                  className="api-btn"
                  style={{ background: "#c83d3d", color: "#fff", borderColor: "#c83d3d" }}
                  onClick={removeProject}
                >
                  <Trash2 size={14} /> Delete project
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
