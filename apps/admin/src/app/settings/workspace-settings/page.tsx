
"use client";

import { useState } from "react";
import {
  Layers3,
  Users,
  Search,
  Plus,
  Download,
  Save,
  RotateCcw,
  X,
  Eye,
  CheckCircle2,
  ShieldCheck,
  Globe,
  HardDrive,
  Settings2,
  FolderOpen,
  Trash2,
} from "lucide-react";

type Workspace = {
  id: number;
  name: string;
  slug: string;
  organization: string;
  owner: string;
  members: number;
  visibility: "Private" | "Organization" | "Public";
  status: "Active" | "Archived" | "Suspended";
  storage: number;
  created: string;
};

const initialWorkspaces: Workspace[] = [
  { id: 1, name: "AI Development", slug: "ai-development", organization: "Acme Technologies", owner: "Alex Morgan", members: 18, visibility: "Organization", status: "Active", storage: 12.4, created: "Jan 18, 2026" },
  { id: 2, name: "Product Research", slug: "product-research", organization: "Nova Labs", owner: "Sarah Johnson", members: 12, visibility: "Private", status: "Active", storage: 5.8, created: "Feb 11, 2026" },
  { id: 3, name: "Customer Support AI", slug: "customer-support-ai", organization: "Acme Technologies", owner: "David Wilson", members: 24, visibility: "Organization", status: "Active", storage: 21.6, created: "Mar 03, 2026" },
  { id: 4, name: "Legacy Experiments", slug: "legacy-experiments", organization: "Orbit Systems", owner: "Emily Davis", members: 7, visibility: "Private", status: "Archived", storage: 3.2, created: "Mar 25, 2026" },
  { id: 5, name: "Marketing AI", slug: "marketing-ai", organization: "Pioneer Digital", owner: "Michael Chen", members: 15, visibility: "Public", status: "Active", storage: 8.1, created: "Apr 14, 2026" },
];

type WorkspaceConfig = {
  defaultVisibility: Workspace["visibility"];
  defaultMemberLimit: string;
  defaultStorageLimit: string;
  allowWorkspaceCreation: boolean;
  allowExternalInvitations: boolean;
  requireOwner: boolean;
  enableWorkspaceAuditLogs: boolean;
  allowPublicWorkspaces: boolean;
  archiveInactiveWorkspaces: boolean;
};

const initialConfig: WorkspaceConfig = {
  defaultVisibility: "Private",
  defaultMemberLimit: "50",
  defaultStorageLimit: "25",
  allowWorkspaceCreation: true,
  allowExternalInvitations: false,
  requireOwner: true,
  enableWorkspaceAuditLogs: true,
  allowPublicWorkspaces: false,
  archiveInactiveWorkspaces: false,
};

export default function WorkspaceSettingsPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(initialWorkspaces);
  const [config, setConfig] = useState<WorkspaceConfig>(initialConfig);
  const [tab, setTab] = useState("directory");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [visibilityFilter, setVisibilityFilter] = useState("All");
  const [selected, setSelected] = useState<Workspace | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [notice, setNotice] = useState("");
  const [newWorkspace, setNewWorkspace] = useState({
    name: "",
    organization: "",
    owner: "",
    visibility: "Private" as Workspace["visibility"],
  });

  const activeCount = workspaces.filter((w) => w.status === "Active").length;
  const archivedCount = workspaces.filter((w) => w.status === "Archived").length;
  const totalMembers = workspaces.reduce((sum, w) => sum + w.members, 0);
  const totalStorage = workspaces.reduce((sum, w) => sum + w.storage, 0);

  const filtered = workspaces.filter((workspace) => {
    const searchable = [
      workspace.name,
      workspace.slug,
      workspace.organization,
      workspace.owner,
    ].join(" ").toLowerCase();

    return (
      searchable.includes(search.toLowerCase()) &&
      (statusFilter === "All" || workspace.status === statusFilter) &&
      (visibilityFilter === "All" || workspace.visibility === visibilityFilter)
    );
  });

  function updateConfig<K extends keyof WorkspaceConfig>(
    key: K,
    value: WorkspaceConfig[K],
  ) {
    setConfig((current) => ({ ...current, [key]: value }));
  }

  function saveSettings() {
    try {
      localStorage.setItem("modelnow-workspace-settings", JSON.stringify(config));
      localStorage.setItem("modelnow-workspaces", JSON.stringify(workspaces));
      setNotice("Workspace settings saved in this browser.");
    } catch {
      setNotice("Unable to save settings in this browser.");
    }
  }

  function resetSettings() {
    setConfig(initialConfig);
    setNotice("Workspace settings restored to their initial values. Save to persist them.");
  }

  function createWorkspace() {
    if (!newWorkspace.name.trim() || !newWorkspace.organization.trim() || !newWorkspace.owner.trim()) {
      setNotice("Enter the workspace name, organization, and owner.");
      return;
    }

    const duplicate = workspaces.some(
      (workspace) =>
        workspace.name.toLowerCase() === newWorkspace.name.trim().toLowerCase() &&
        workspace.organization.toLowerCase() === newWorkspace.organization.trim().toLowerCase(),
    );

    if (duplicate) {
      setNotice("A workspace with this name already exists in that organization.");
      return;
    }

    const slug = newWorkspace.name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const workspace: Workspace = {
      id: Math.max(0, ...workspaces.map((w) => w.id)) + 1,
      name: newWorkspace.name.trim(),
      slug,
      organization: newWorkspace.organization.trim(),
      owner: newWorkspace.owner.trim(),
      members: 1,
      visibility: newWorkspace.visibility,
      status: "Active",
      storage: 0,
      created: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
    };

    setWorkspaces((current) => [workspace, ...current]);
    setNewWorkspace({
      name: "",
      organization: "",
      owner: "",
      visibility: "Private",
    });
    setShowCreate(false);
    setNotice("Workspace added to the local directory. Save to retain it in this browser.");
  }

  function updateStatus(id: number, status: Workspace["status"]) {
    setWorkspaces((current) =>
      current.map((workspace) =>
        workspace.id === id ? { ...workspace, status } : workspace,
      ),
    );
    setSelected((current) =>
      current?.id === id ? { ...current, status } : current,
    );
    setNotice(`Workspace status changed to ${status}. Save to retain the change.`);
  }

  function exportCSV() {
    const header = [
      "Workspace",
      "Slug",
      "Organization",
      "Owner",
      "Members",
      "Visibility",
      "Status",
      "Storage GB",
      "Created",
    ];

    const rows = workspaces.map((w) => [
      w.name,
      w.slug,
      w.organization,
      w.owner,
      w.members,
      w.visibility,
      w.status,
      w.storage,
      w.created,
    ]);

    const csv = [header, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "modelnow-workspaces.csv";
    link.click();
    URL.revokeObjectURL(url);
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
      <div className="ws-toggle-row">
        <div className="ws-toggle-copy">
          <strong>{title}</strong>
          <p>{description}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={title}
          className={`ws-switch ${checked ? "active" : ""}`}
          onClick={() => onChange(!checked)}
        />
      </div>
    );
  }

  return (
    <main className="ws-page">
      <style>{`
        * { box-sizing: border-box; }

        .ws-page {
          min-height: 100vh;
          padding: 30px;
          background: #f7f8fc;
          color: #182238;
          font-family: Arial, Helvetica, sans-serif;
        }

        .ws-container { max-width: 1250px; margin: 0 auto; }

        .ws-breadcrumb {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
          margin-bottom: 22px;
          color: #81899b;
          font-size: 13px;
        }

        .ws-breadcrumb a { color: #5266d9; text-decoration: none; }

        .ws-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 25px;
        }

        .ws-heading-main { display: flex; align-items: center; gap: 14px; }

        .ws-heading-icon {
          display: grid;
          place-items: center;
          width: 50px;
          height: 50px;
          flex-shrink: 0;
          border-radius: 14px;
          background: #e9edff;
          color: #5265d9;
        }

        .ws-heading h1 { margin: 0 0 7px; font-size: 27px; letter-spacing: -.6px; }
        .ws-heading p { margin: 0; color: #7c8598; font-size: 13px; line-height: 1.6; }
        .ws-actions { display: flex; flex-wrap: wrap; gap: 10px; }

        .ws-button {
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

        .ws-button.primary { background: #5265d9; color: white; border-color: #5265d9; }
        .ws-button:hover { opacity: .9; }

        .ws-notice {
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

        .ws-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 15px;
          margin-bottom: 23px;
        }

        .ws-stat {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 19px;
          border: 1px solid #e7eaf1;
          border-radius: 13px;
          background: white;
        }

        .ws-stat-icon {
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          flex-shrink: 0;
          border-radius: 11px;
          background: #f0f2ff;
          color: #5265d9;
        }

        .ws-stat-label { margin-bottom: 6px; color: #7f889a; font-size: 11px; }
        .ws-stat-value { color: #202a40; font-size: 23px; font-weight: 700; }

        .ws-tabs {
          display: flex;
          gap: 7px;
          max-width: 100%;
          overflow-x: auto;
          padding: 6px;
          margin-bottom: 18px;
          border: 1px solid #e7eaf1;
          border-radius: 11px;
          background: white;
          width: fit-content;
        }

        .ws-tab {
          padding: 10px 15px;
          border: 0;
          border-radius: 7px;
          background: transparent;
          color: #6f7890;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
        }

        .ws-tab.active { background: #edf0ff; color: #485dd0; }

        .ws-card {
          overflow: hidden;
          border: 1px solid #e7eaf1;
          border-radius: 14px;
          background: white;
          box-shadow: 0 2px 7px rgba(24,36,70,.025);
        }

        .ws-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 20px 22px;
          border-bottom: 1px solid #edf0f5;
        }

        .ws-card-header h2 { margin: 0 0 5px; font-size: 15px; }
        .ws-card-header p { margin: 0; color: #858da0; font-size: 12px; line-height: 1.5; }

        .ws-toolbar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px;
          padding: 16px 22px;
          border-bottom: 1px solid #edf0f5;
        }

        .ws-search { position: relative; flex: 1 1 230px; min-width: 180px; }
        .ws-search svg { position: absolute; top: 12px; left: 12px; color: #929bad; }

        .ws-search input {
          width: 100%;
          height: 40px;
          padding: 0 12px 0 37px;
          border: 1px solid #dfe4ed;
          border-radius: 8px;
          outline: none;
          font-size: 12px;
        }

        .ws-search input:focus, .ws-toolbar select:focus {
          border-color: #6576e7;
          box-shadow: 0 0 0 3px rgba(101,118,231,.1);
        }

        .ws-toolbar select {
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

        .ws-table-wrap { overflow-x: auto; }
        .ws-table { width: 100%; border-collapse: collapse; text-align: left; white-space: nowrap; }

        .ws-table th {
          padding: 14px 18px;
          background: #fafbfe;
          color: #7f889a;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .5px;
          text-transform: uppercase;
        }

        .ws-table td {
          padding: 15px 18px;
          border-top: 1px solid #edf0f5;
          color: #4b566d;
          font-size: 12px;
        }

        .ws-workspace-cell { display: flex; align-items: center; gap: 11px; }

        .ws-avatar {
          display: grid;
          place-items: center;
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          border-radius: 10px;
          background: #edf0ff;
          color: #5265d9;
          font-size: 13px;
          font-weight: 700;
        }

        .ws-name { margin-bottom: 4px; color: #263149; font-weight: 700; }
        .ws-muted { color: #8991a2; font-size: 11px; }

        .ws-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 9px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 700;
        }

        .ws-status::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
        .ws-status.active { background: #eaf9f0; color: #218552; }
        .ws-status.archived { background: #f0f1f5; color: #697386; }
        .ws-status.suspended { background: #fff0f0; color: #c24141; }

        .ws-visibility {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #58647c;
          font-size: 11px;
        }

        .ws-icon-button {
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

        .ws-icon-button:hover { background: #f3f5ff; color: #5265d9; }
        .ws-empty { padding: 42px 20px; text-align: center; color: #858da0; font-size: 13px; }

        .ws-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 16px 22px;
          border-top: 1px solid #edf0f5;
          color: #858da0;
          font-size: 11px;
        }

        .ws-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
          padding: 22px;
        }

        .ws-field { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
        .ws-field.full { grid-column: 1 / -1; }
        .ws-field label { color: #39445a; font-size: 12px; font-weight: 700; }

        .ws-field input, .ws-field select {
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

        .ws-field input:focus, .ws-field select:focus {
          border-color: #6576e7;
          box-shadow: 0 0 0 3px rgba(101,118,231,.1);
        }

        .ws-toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 17px 22px;
          border-bottom: 1px solid #edf0f5;
        }

        .ws-toggle-row:last-child { border-bottom: 0; }
        .ws-toggle-copy strong { display: block; margin-bottom: 5px; font-size: 12px; }
        .ws-toggle-copy p { margin: 0; color: #858da0; font-size: 11px; line-height: 1.6; }

        .ws-switch {
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

        .ws-switch.active { background: #5265d9; }
        .ws-switch::after {
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

        .ws-switch.active::after { transform: translateX(16px); }

        .ws-details {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
          padding: 22px;
        }

        .ws-detail-item {
          padding: 14px;
          border: 1px solid #edf0f5;
          border-radius: 10px;
          min-width: 0;
        }

        .ws-detail-label { margin-bottom: 7px; color: #858da0; font-size: 11px; }
        .ws-detail-value { overflow-wrap: anywhere; color: #263149; font-size: 13px; font-weight: 700; }

        .ws-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 50;
          display: grid;
          place-items: center;
          padding: 20px;
          background: rgba(20,28,48,.45);
        }

        .ws-modal {
          width: 100%;
          max-width: 570px;
          max-height: 90vh;
          overflow-y: auto;
          border: 1px solid #e7eaf1;
          border-radius: 15px;
          background: white;
          box-shadow: 0 20px 70px rgba(20,28,48,.2);
        }

        .ws-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 22px;
          border-bottom: 1px solid #edf0f5;
        }

        .ws-modal-header h2 { margin: 0; font-size: 17px; }
        .ws-modal-body { padding: 22px; }
        .ws-modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 22px; }

        .ws-detail-heading {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 22px;
          border-bottom: 1px solid #edf0f5;
        }

        .ws-detail-heading h3 { margin: 0 0 5px; font-size: 16px; }
        .ws-detail-heading p { margin: 0; color: #858da0; font-size: 12px; }

        @media (max-width: 1000px) {
          .ws-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }

        @media (max-width: 650px) {
          .ws-page { padding: 18px 12px; }
          .ws-heading { flex-direction: column; }
          .ws-heading h1 { font-size: 23px; }
          .ws-actions { width: 100%; }
          .ws-button { flex: 1; }
          .ws-card-header { align-items: flex-start; flex-direction: column; }
          .ws-form-grid, .ws-details { grid-template-columns: 1fr; padding: 17px; }
          .ws-field.full { grid-column: auto; }
          .ws-footer { align-items: flex-start; flex-direction: column; }
        }
      `}</style>

      <div className="ws-container">
        <div className="ws-breadcrumb">
          <a href="/dashboard">Admin</a>
          <span>/</span>
          <a href="/settings">Settings</a>
          <span>/</span>
          <span>Workspace Settings</span>
        </div>

        <header className="ws-heading">
          <div className="ws-heading-main">
            <div className="ws-heading-icon"><Layers3 size={24} /></div>
            <div>
              <h1>Workspace Settings</h1>
              <p>
                Manage workspaces, visibility, membership, storage, and workspace
                governance.
              </p>
            </div>
          </div>

          <div className="ws-actions">
            <button type="button" className="ws-button" onClick={exportCSV}>
              <Download size={15} />
              Export CSV
            </button>
            <button
              type="button"
              className="ws-button primary"
              onClick={() => {
                setNotice("");
                setShowCreate(true);
              }}
            >
              <Plus size={16} />
              Create Workspace
            </button>
          </div>
        </header>

        {notice && (
          <div className="ws-notice" role="status">
            <CheckCircle2 size={17} />
            {notice}
          </div>
        )}

        <section className="ws-stats">
          <div className="ws-stat">
            <div className="ws-stat-icon"><Layers3 size={20} /></div>
            <div>
              <div className="ws-stat-label">Total Workspaces</div>
              <div className="ws-stat-value">{workspaces.length}</div>
            </div>
          </div>
          <div className="ws-stat">
            <div className="ws-stat-icon"><CheckCircle2 size={20} /></div>
            <div>
              <div className="ws-stat-label">Active Workspaces</div>
              <div className="ws-stat-value">{activeCount}</div>
            </div>
          </div>
          <div className="ws-stat">
            <div className="ws-stat-icon"><Users size={20} /></div>
            <div>
              <div className="ws-stat-label">Total Members</div>
              <div className="ws-stat-value">{totalMembers.toLocaleString()}</div>
            </div>
          </div>
          <div className="ws-stat">
            <div className="ws-stat-icon"><HardDrive size={20} /></div>
            <div>
              <div className="ws-stat-label">Tracked Storage</div>
              <div className="ws-stat-value">{totalStorage.toFixed(1)} GB</div>
            </div>
          </div>
        </section>

        <div className="ws-tabs">
          <button
            type="button"
            className={`ws-tab ${tab === "directory" ? "active" : ""}`}
            onClick={() => setTab("directory")}
          >
            Workspace Directory
          </button>
          <button
            type="button"
            className={`ws-tab ${tab === "defaults" ? "active" : ""}`}
            onClick={() => setTab("defaults")}
          >
            Workspace Defaults
          </button>
          <button
            type="button"
            className={`ws-tab ${tab === "policies" ? "active" : ""}`}
            onClick={() => setTab("policies")}
          >
            Access & Policies
          </button>
        </div>

        {tab === "directory" && (
          <section className="ws-card">
            <div className="ws-card-header">
              <div>
                <h2>Workspace Directory</h2>
                <p>View workspace ownership, organization, visibility, and status.</p>
              </div>
              <button
                type="button"
                className="ws-button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("All");
                  setVisibilityFilter("All");
                }}
              >
                <RotateCcw size={14} />
                Clear Filters
              </button>
            </div>

            <div className="ws-toolbar">
              <div className="ws-search">
                <Search size={16} />
                <input
                  aria-label="Search workspaces"
                  placeholder="Search workspace, organization, or owner..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                aria-label="Filter by workspace status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All statuses</option>
                <option value="Active">Active</option>
                <option value="Archived">Archived</option>
                <option value="Suspended">Suspended</option>
              </select>
              <select
                aria-label="Filter by workspace visibility"
                value={visibilityFilter}
                onChange={(e) => setVisibilityFilter(e.target.value)}
              >
                <option value="All">All visibility</option>
                <option value="Private">Private</option>
                <option value="Organization">Organization</option>
                <option value="Public">Public</option>
              </select>
            </div>

            <div className="ws-table-wrap">
              <table className="ws-table">
                <thead>
                  <tr>
                    <th>Workspace</th>
                    <th>Organization</th>
                    <th>Owner</th>
                    <th>Members</th>
                    <th>Visibility</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((workspace) => (
                    <tr key={workspace.id}>
                      <td>
                        <div className="ws-workspace-cell">
                          <div className="ws-avatar">
                            {workspace.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="ws-name">{workspace.name}</div>
                            <div className="ws-muted">{workspace.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td>{workspace.organization}</td>
                      <td>{workspace.owner}</td>
                      <td>{workspace.members}</td>
                      <td>
                        <span className="ws-visibility">
                          {workspace.visibility === "Public" ? (
                            <Globe size={13} />
                          ) : workspace.visibility === "Organization" ? (
                            <Users size={13} />
                          ) : (
                            <ShieldCheck size={13} />
                          )}
                          {workspace.visibility}
                        </span>
                      </td>
                      <td>
                        <span className={`ws-status ${workspace.status.toLowerCase()}`}>
                          {workspace.status}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="ws-icon-button"
                          title="View workspace"
                          aria-label={`View ${workspace.name}`}
                          onClick={() => setSelected(workspace)}
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="ws-empty">
                  No workspaces match your search or filters.
                </div>
              )}
            </div>

            <div className="ws-footer">
              <span>Showing {filtered.length} of {workspaces.length} workspaces</span>
              <span>{archivedCount} archived workspace(s)</span>
            </div>
          </section>
        )}

        {tab === "defaults" && (
          <section className="ws-card">
            <div className="ws-card-header">
              <div>
                <h2>Workspace Defaults</h2>
                <p>Set default values for new workspaces.</p>
              </div>
              <Settings2 size={21} color="#5265d9" />
            </div>

            <div className="ws-form-grid">
              <div className="ws-field">
                <label htmlFor="wsVisibility">Default Visibility</label>
                <select
                  id="wsVisibility"
                  value={config.defaultVisibility}
                  onChange={(e) =>
                    updateConfig("defaultVisibility", e.target.value as Workspace["visibility"])
                  }
                >
                  <option value="Private">Private</option>
                  <option value="Organization">Organization</option>
                  <option value="Public">Public</option>
                </select>
              </div>

              <div className="ws-field">
                <label htmlFor="wsMembers">Default Member Limit</label>
                <select
                  id="wsMembers"
                  value={config.defaultMemberLimit}
                  onChange={(e) => updateConfig("defaultMemberLimit", e.target.value)}
                >
                  <option value="10">10 members</option>
                  <option value="25">25 members</option>
                  <option value="50">50 members</option>
                  <option value="100">100 members</option>
                  <option value="500">500 members</option>
                  <option value="unlimited">Unlimited</option>
                </select>
              </div>

              <div className="ws-field">
                <label htmlFor="wsStorage">Default Storage Limit (GB)</label>
                <select
                  id="wsStorage"
                  value={config.defaultStorageLimit}
                  onChange={(e) => updateConfig("defaultStorageLimit", e.target.value)}
                >
                  <option value="5">5 GB</option>
                  <option value="10">10 GB</option>
                  <option value="25">25 GB</option>
                  <option value="50">50 GB</option>
                  <option value="100">100 GB</option>
                  <option value="unlimited">Unlimited</option>
                </select>
              </div>
            </div>

            <Toggle
              title="Allow Workspace Creation"
              description="Allow authorized users to create new workspaces."
              checked={config.allowWorkspaceCreation}
              onChange={(value) => updateConfig("allowWorkspaceCreation", value)}
            />
            <Toggle
              title="Require Workspace Owner"
              description="Require every workspace to have an assigned owner."
              checked={config.requireOwner}
              onChange={(value) => updateConfig("requireOwner", value)}
            />

            <div className="ws-footer">
              <span>Default values apply only when connected to workspace creation logic.</span>
              <button type="button" className="ws-button primary" onClick={saveSettings}>
                <Save size={14} />
                Save Defaults
              </button>
            </div>
          </section>
        )}

        {tab === "policies" && (
          <section className="ws-card">
            <div className="ws-card-header">
              <div>
                <h2>Workspace Access & Policies</h2>
                <p>Configure visibility, invitations, audit logging, and lifecycle policies.</p>
              </div>
              <ShieldCheck size={22} color="#5265d9" />
            </div>

            <Toggle
              title="Allow External Invitations"
              description="Allow members to invite people outside their organization."
              checked={config.allowExternalInvitations}
              onChange={(value) => updateConfig("allowExternalInvitations", value)}
            />
            <Toggle
              title="Allow Public Workspaces"
              description="Allow workspaces to be visible outside their organization. Server-side authorization is required."
              checked={config.allowPublicWorkspaces}
              onChange={(value) => updateConfig("allowPublicWorkspaces", value)}
            />
            <Toggle
              title="Enable Workspace Audit Logs"
              description="Record workspace-related actions for governance and auditing."
              checked={config.enableWorkspaceAuditLogs}
              onChange={(value) => updateConfig("enableWorkspaceAuditLogs", value)}
            />
            <Toggle
              title="Archive Inactive Workspaces"
              description="Enable the policy for archiving inactive workspaces. An actual scheduled backend job is required."
              checked={config.archiveInactiveWorkspaces}
              onChange={(value) => updateConfig("archiveInactiveWorkspaces", value)}
            />
            <Toggle
              title="Enforce Member Limits"
              description="Apply workspace member limits during invitation and membership changes."
              checked={config.defaultMemberLimit !== "unlimited"}
              onChange={(value) =>
                updateConfig("defaultMemberLimit", value ? "50" : "unlimited")
              }
            />

            <div className="ws-footer">
              <span>Access and lifecycle policies require backend enforcement.</span>
              <button type="button" className="ws-button primary" onClick={saveSettings}>
                <Save size={14} />
                Save Policies
              </button>
            </div>
          </section>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
          <button type="button" className="ws-button" onClick={resetSettings}>
            <RotateCcw size={14} />
            Reset Settings
          </button>
        </div>
      </div>

      {showCreate && (
        <div
          className="ws-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowCreate(false);
          }}
        >
          <section className="ws-modal" role="dialog" aria-modal="true" aria-labelledby="ws-create-title">
            <div className="ws-modal-header">
              <h2 id="ws-create-title">Create Workspace</h2>
              <button
                type="button"
                className="ws-icon-button"
                aria-label="Close dialog"
                onClick={() => setShowCreate(false)}
              >
                <X size={17} />
              </button>
            </div>

            <div className="ws-modal-body">
              <div className="ws-form-grid" style={{ padding: 0 }}>
                <div className="ws-field full">
                  <label htmlFor="wsName">Workspace Name</label>
                  <input
                    id="wsName"
                    value={newWorkspace.name}
                    onChange={(e) => setNewWorkspace((current) => ({ ...current, name: e.target.value }))}
                    placeholder="Enter workspace name"
                  />
                </div>

                <div className="ws-field">
                  <label htmlFor="wsOrganization">Organization</label>
                  <input
                    id="wsOrganization"
                    value={newWorkspace.organization}
                    onChange={(e) => setNewWorkspace((current) => ({ ...current, organization: e.target.value }))}
                    placeholder="Enter organization name"
                  />
                </div>

                <div className="ws-field">
                  <label htmlFor="wsOwner">Workspace Owner</label>
                  <input
                    id="wsOwner"
                    value={newWorkspace.owner}
                    onChange={(e) => setNewWorkspace((current) => ({ ...current, owner: e.target.value }))}
                    placeholder="Enter owner name"
                  />
                </div>

                <div className="ws-field full">
                  <label htmlFor="wsNewVisibility">Visibility</label>
                  <select
                    id="wsNewVisibility"
                    value={newWorkspace.visibility}
                    onChange={(e) => setNewWorkspace((current) => ({
                      ...current,
                      visibility: e.target.value as Workspace["visibility"],
                    }))}
                  >
                    <option value="Private">Private</option>
                    <option value="Organization">Organization</option>
                    <option value="Public">Public</option>
                  </select>
                </div>
              </div>

              <div className="ws-modal-actions">
                <button type="button" className="ws-button" onClick={() => setShowCreate(false)}>
                  Cancel
                </button>
                <button type="button" className="ws-button primary" onClick={createWorkspace}>
                  <Plus size={14} />
                  Create Workspace
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {selected && (
        <div
          className="ws-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <section className="ws-modal" role="dialog" aria-modal="true" aria-labelledby="ws-details-title">
            <div className="ws-modal-header">
              <h2 id="ws-details-title">Workspace Details</h2>
              <button
                type="button"
                className="ws-icon-button"
                aria-label="Close details"
                onClick={() => setSelected(null)}
              >
                <X size={17} />
              </button>
            </div>

            <div className="ws-detail-heading">
              <div className="ws-avatar" style={{ width: 48, height: 48 }}>
                {selected.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3>{selected.name}</h3>
                <p>{selected.slug}</p>
              </div>
            </div>

            <div className="ws-details">
              <div className="ws-detail-item">
                <div className="ws-detail-label">Organization</div>
                <div className="ws-detail-value">{selected.organization}</div>
              </div>
              <div className="ws-detail-item">
                <div className="ws-detail-label">Owner</div>
                <div className="ws-detail-value">{selected.owner}</div>
              </div>
              <div className="ws-detail-item">
                <div className="ws-detail-label">Members</div>
                <div className="ws-detail-value">{selected.members}</div>
              </div>
              <div className="ws-detail-item">
                <div className="ws-detail-label">Visibility</div>
                <div className="ws-detail-value">{selected.visibility}</div>
              </div>
              <div className="ws-detail-item">
                <div className="ws-detail-label">Storage Used</div>
                <div className="ws-detail-value">{selected.storage.toFixed(1)} GB</div>
              </div>
              <div className="ws-detail-item">
                <div className="ws-detail-label">Created</div>
                <div className="ws-detail-value">{selected.created}</div>
              </div>
            </div>

            <div className="ws-modal-body" style={{ paddingTop: 0 }}>
              <strong style={{ display: "block", marginBottom: 12, fontSize: 12 }}>
                Workspace Actions
              </strong>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
                {selected.status !== "Active" && (
                  <button
                    type="button"
                    className="ws-button primary"
                    onClick={() => updateStatus(selected.id, "Active")}
                  >
                    <CheckCircle2 size={14} />
                    Activate
                  </button>
                )}
                {selected.status !== "Archived" && (
                  <button
                    type="button"
                    className="ws-button"
                    onClick={() => updateStatus(selected.id, "Archived")}
                  >
                    <FolderOpen size={14} />
                    Archive
                  </button>
                )}
                {selected.status !== "Suspended" && (
                  <button
                    type="button"
                    className="ws-button"
                    onClick={() => updateStatus(selected.id, "Suspended")}
                  >
                    <ShieldCheck size={14} />
                    Suspend
                  </button>
                )}
                {selected.status !== "Active" && (
                  <button
                    type="button"
                    className="ws-button"
                    onClick={() => updateStatus(selected.id, "Active")}
                  >
                    <RotateCcw size={14} />
                    Restore Active
                  </button>
                )}
              </div>
              <p style={{ color: "#858da0", fontSize: 11, lineHeight: 1.6, marginTop: 14 }}>
                Status changes are local demo changes. Save workspace settings to retain them in this browser.
              </p>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
