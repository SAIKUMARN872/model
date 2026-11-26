
"use client";

import { useState } from "react";
import {
  Building2,
  Users,
  Globe,
  ShieldCheck,
  Save,
  RotateCcw,
  CheckCircle2,
  Search,
  Plus,
  Download,
  X,
  Settings2,
  Mail,
  Trash2,
  Eye,
  CreditCard,
  BriefcaseBusiness,
} from "lucide-react";

type Organization = {
  id: number;
  name: string;
  slug: string;
  owner: string;
  email: string;
  plan: string;
  status: "Active" | "Suspended" | "Pending";
  members: number;
  created: string;
};

const initialOrganizations: Organization[] = [
  { id: 1, name: "Acme Technologies", slug: "acme-technologies", owner: "Alex Morgan", email: "alex@acme.example", plan: "Enterprise", status: "Active", members: 128, created: "Jan 12, 2026" },
  { id: 2, name: "Nova Labs", slug: "nova-labs", owner: "Sarah Johnson", email: "sarah@nova.example", plan: "Pro", status: "Active", members: 42, created: "Feb 08, 2026" },
  { id: 3, name: "Vertex AI Group", slug: "vertex-ai-group", owner: "David Wilson", email: "david@vertex.example", plan: "Business", status: "Pending", members: 15, created: "Mar 21, 2026" },
  { id: 4, name: "Orbit Systems", slug: "orbit-systems", owner: "Emily Davis", email: "emily@orbit.example", plan: "Pro", status: "Suspended", members: 26, created: "Apr 04, 2026" },
  { id: 5, name: "Pioneer Digital", slug: "pioneer-digital", owner: "Michael Chen", email: "michael@pioneer.example", plan: "Business", status: "Active", members: 67, created: "May 17, 2026" },
];

type OrganizationDefaults = {
  defaultPlan: string;
  defaultStatus: string;
  memberLimit: string;
  allowCreation: boolean;
  requireDomainVerification: boolean;
  allowInvitations: boolean;
  enforceMemberLimit: boolean;
  enableOrganizationAuditLogs: boolean;
  requireMfaForAdmins: boolean;
};

const initialDefaults: OrganizationDefaults = {
  defaultPlan: "Business",
  defaultStatus: "Pending",
  memberLimit: "100",
  allowCreation: true,
  requireDomainVerification: false,
  allowInvitations: true,
  enforceMemberLimit: true,
  enableOrganizationAuditLogs: true,
  requireMfaForAdmins: false,
};

export default function OrganizationSettingsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>(
    initialOrganizations,
  );
  const [defaults, setDefaults] =
    useState<OrganizationDefaults>(initialDefaults);
  const [activeTab, setActiveTab] = useState("directory");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [planFilter, setPlanFilter] = useState("All");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization | null>(null);
  const [notice, setNotice] = useState("");
  const [newOrganization, setNewOrganization] = useState({
    name: "",
    owner: "",
    email: "",
    plan: "Business",
  });

  const activeCount = organizations.filter((org) => org.status === "Active").length;
  const pendingCount = organizations.filter((org) => org.status === "Pending").length;
  const totalMembers = organizations.reduce((sum, org) => sum + org.members, 0);

  const filteredOrganizations = organizations.filter((org) => {
    const matchesSearch = `${org.name} ${org.slug} ${org.owner} ${org.email}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || org.status === statusFilter;
    const matchesPlan = planFilter === "All" || org.plan === planFilter;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  function updateDefault<K extends keyof OrganizationDefaults>(
    key: K,
    value: OrganizationDefaults[K],
  ) {
    setDefaults((current) => ({ ...current, [key]: value }));
  }

  function saveSettings() {
    try {
      localStorage.setItem(
        "modelnow-organization-settings",
        JSON.stringify(defaults),
      );
      localStorage.setItem(
        "modelnow-organizations-directory",
        JSON.stringify(organizations),
      );
      setNotice("Organization settings saved in this browser.");
    } catch {
      setNotice("Unable to save organization settings in this browser.");
    }
  }

  function resetSettings() {
    setDefaults(initialDefaults);
    setNotice("Organization settings restored to their initial values. Save to persist them.");
  }

  function createOrganization() {
    if (
      !newOrganization.name.trim() ||
      !newOrganization.owner.trim() ||
      !newOrganization.email.trim()
    ) {
      setNotice("Enter the organization name, owner, and owner email.");
      return;
    }

    if (
      organizations.some(
        (org) =>
          org.name.toLowerCase() === newOrganization.name.trim().toLowerCase(),
      )
    ) {
      setNotice("An organization with this name already exists.");
      return;
    }

    const slug = newOrganization.name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const organization: Organization = {
      id: Math.max(0, ...organizations.map((org) => org.id)) + 1,
      name: newOrganization.name.trim(),
      slug,
      owner: newOrganization.owner.trim(),
      email: newOrganization.email.trim(),
      plan: newOrganization.plan,
      status: "Pending",
      members: 1,
      created: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
    };

    setOrganizations((current) => [organization, ...current]);
    setNewOrganization({
      name: "",
      owner: "",
      email: "",
      plan: "Business",
    });
    setShowCreate(false);
    setNotice("Organization added to the local directory. Save to retain it in this browser.");
  }

  function changeStatus(id: number, status: Organization["status"]) {
    setOrganizations((current) =>
      current.map((org) => (org.id === id ? { ...org, status } : org)),
    );
    setSelectedOrganization((current) =>
      current?.id === id ? { ...current, status } : current,
    );
    setNotice(`Organization status changed to ${status}. Save to retain the change.`);
  }

  function exportOrganizations() {
    const header = [
      "Organization",
      "Slug",
      "Owner",
      "Email",
      "Plan",
      "Status",
      "Members",
      "Created",
    ];

    const rows = organizations.map((org) => [
      org.name,
      org.slug,
      org.owner,
      org.email,
      org.plan,
      org.status,
      org.members,
      org.created,
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
    link.download = "modelnow-organizations.csv";
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
      <div className="os-toggle-row">
        <div className="os-toggle-copy">
          <strong>{title}</strong>
          <p>{description}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={title}
          className={`os-switch ${checked ? "active" : ""}`}
          onClick={() => onChange(!checked)}
        />
      </div>
    );
  }

  return (
    <main className="os-page">
      <style>{`
        * { box-sizing: border-box; }

        .os-page {
          min-height: 100vh;
          padding: 30px;
          background: #f7f8fc;
          color: #182238;
          font-family: Arial, Helvetica, sans-serif;
        }

        .os-container { max-width: 1250px; margin: 0 auto; }

        .os-breadcrumb {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
          margin-bottom: 22px;
          color: #81899b;
          font-size: 13px;
        }

        .os-breadcrumb a { color: #5266d9; text-decoration: none; }

        .os-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 25px;
        }

        .os-heading-main { display: flex; align-items: center; gap: 14px; }

        .os-heading-icon {
          display: grid;
          place-items: center;
          width: 50px;
          height: 50px;
          flex-shrink: 0;
          border-radius: 14px;
          background: #e9edff;
          color: #5265d9;
        }

        .os-heading h1 { margin: 0 0 7px; font-size: 27px; letter-spacing: -.6px; }

        .os-heading p {
          margin: 0;
          color: #7c8598;
          font-size: 13px;
          line-height: 1.6;
        }

        .os-actions { display: flex; flex-wrap: wrap; gap: 10px; }

        .os-button {
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

        .os-button.primary { background: #5265d9; color: white; border-color: #5265d9; }
        .os-button:hover { opacity: .9; }

        .os-notice {
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

        .os-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 15px;
          margin-bottom: 23px;
        }

        .os-stat {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 19px;
          border: 1px solid #e7eaf1;
          border-radius: 13px;
          background: white;
        }

        .os-stat-icon {
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          flex-shrink: 0;
          border-radius: 11px;
          background: #f0f2ff;
          color: #5265d9;
        }

        .os-stat-label { margin-bottom: 6px; color: #7f889a; font-size: 11px; }
        .os-stat-value { color: #202a40; font-size: 23px; font-weight: 700; }

        .os-tabs {
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

        .os-tab {
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

        .os-tab.active { background: #edf0ff; color: #485dd0; }

        .os-card {
          overflow: hidden;
          border: 1px solid #e7eaf1;
          border-radius: 14px;
          background: white;
          box-shadow: 0 2px 7px rgba(24,36,70,.025);
        }

        .os-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 20px 22px;
          border-bottom: 1px solid #edf0f5;
        }

        .os-card-header h2 { margin: 0 0 5px; font-size: 15px; }
        .os-card-header p { margin: 0; color: #858da0; font-size: 12px; line-height: 1.5; }

        .os-toolbar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px;
          padding: 16px 22px;
          border-bottom: 1px solid #edf0f5;
        }

        .os-search { position: relative; flex: 1 1 230px; min-width: 180px; }

        .os-search svg {
          position: absolute;
          top: 12px;
          left: 12px;
          color: #929bad;
        }

        .os-search input {
          width: 100%;
          height: 40px;
          padding: 0 12px 0 37px;
          border: 1px solid #dfe4ed;
          border-radius: 8px;
          outline: none;
          font-size: 12px;
        }

        .os-search input:focus, .os-toolbar select:focus {
          border-color: #6576e7;
          box-shadow: 0 0 0 3px rgba(101,118,231,.1);
        }

        .os-toolbar select {
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

        .os-table-wrap { overflow-x: auto; }

        .os-table { width: 100%; border-collapse: collapse; text-align: left; white-space: nowrap; }

        .os-table th {
          padding: 14px 18px;
          background: #fafbfe;
          color: #7f889a;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .5px;
          text-transform: uppercase;
        }

        .os-table td {
          padding: 15px 18px;
          border-top: 1px solid #edf0f5;
          color: #4b566d;
          font-size: 12px;
        }

        .os-org-cell { display: flex; align-items: center; gap: 11px; }

        .os-avatar {
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

        .os-org-name { margin-bottom: 4px; color: #263149; font-weight: 700; }
        .os-org-slug { color: #8991a2; font-size: 11px; }

        .os-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 9px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 700;
        }

        .os-status::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
        .os-status.active { background: #eaf9f0; color: #218552; }
        .os-status.suspended { background: #fff0f0; color: #c24141; }
        .os-status.pending { background: #fff5e5; color: #a9690b; }

        .os-icon-button {
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

        .os-icon-button:hover { background: #f3f5ff; color: #5265d9; }

        .os-empty { padding: 42px 20px; text-align: center; color: #858da0; font-size: 13px; }

        .os-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 16px 22px;
          border-top: 1px solid #edf0f5;
          color: #858da0;
          font-size: 11px;
        }

        .os-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
          padding: 22px;
        }

        .os-field { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
        .os-field.full { grid-column: 1 / -1; }
        .os-field label { color: #39445a; font-size: 12px; font-weight: 700; }

        .os-field input, .os-field select {
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

        .os-field input:focus, .os-field select:focus {
          border-color: #6576e7;
          box-shadow: 0 0 0 3px rgba(101,118,231,.1);
        }

        .os-toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 17px 22px;
          border-bottom: 1px solid #edf0f5;
        }

        .os-toggle-row:last-child { border-bottom: 0; }
        .os-toggle-copy strong { display: block; margin-bottom: 5px; font-size: 12px; }
        .os-toggle-copy p { margin: 0; color: #858da0; font-size: 11px; line-height: 1.6; }

        .os-switch {
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

        .os-switch.active { background: #5265d9; }

        .os-switch::after {
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

        .os-switch.active::after { transform: translateX(16px); }

        .os-details {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
          padding: 22px;
        }

        .os-detail-item {
          padding: 14px;
          border: 1px solid #edf0f5;
          border-radius: 10px;
          min-width: 0;
        }

        .os-detail-label { margin-bottom: 7px; color: #858da0; font-size: 11px; }
        .os-detail-value { overflow-wrap: anywhere; color: #263149; font-size: 13px; font-weight: 700; }

        .os-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 50;
          display: grid;
          place-items: center;
          padding: 20px;
          background: rgba(20,28,48,.45);
        }

        .os-modal {
          width: 100%;
          max-width: 570px;
          max-height: 90vh;
          overflow-y: auto;
          border: 1px solid #e7eaf1;
          border-radius: 15px;
          background: white;
          box-shadow: 0 20px 70px rgba(20,28,48,.2);
        }

        .os-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 22px;
          border-bottom: 1px solid #edf0f5;
        }

        .os-modal-header h2 { margin: 0; font-size: 17px; }
        .os-modal-body { padding: 22px; }
        .os-modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 22px; }

        .os-detail-heading {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 22px;
          border-bottom: 1px solid #edf0f5;
        }

        .os-detail-heading h3 { margin: 0 0 5px; font-size: 16px; }
        .os-detail-heading p { margin: 0; color: #858da0; font-size: 12px; }

        @media (max-width: 1000px) {
          .os-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }

        @media (max-width: 650px) {
          .os-page { padding: 18px 12px; }
          .os-heading { flex-direction: column; }
          .os-heading h1 { font-size: 23px; }
          .os-actions { width: 100%; }
          .os-button { flex: 1; }
          .os-tabs { width: 100%; overflow-x: auto; }
          .os-card-header { align-items: flex-start; flex-direction: column; }
          .os-form-grid, .os-details { grid-template-columns: 1fr; padding: 17px; }
          .os-field.full { grid-column: auto; }
          .os-footer { align-items: flex-start; flex-direction: column; }
        }
      `}</style>

      <div className="os-container">
        <div className="os-breadcrumb">
          <a href="/dashboard">Admin</a>
          <span>/</span>
          <a href="/settings">Settings</a>
          <span>/</span>
          <span>Organization Settings</span>
        </div>

        <header className="os-heading">
          <div className="os-heading-main">
            <div className="os-heading-icon"><Building2 size={24} /></div>
            <div>
              <h1>Organization Settings</h1>
              <p>
                Manage organization defaults, member policies, registration,
                and organization-level administration.
              </p>
            </div>
          </div>

          <div className="os-actions">
            <button type="button" className="os-button" onClick={exportOrganizations}>
              <Download size={15} />
              Export
            </button>
            <button
              type="button"
              className="os-button primary"
              onClick={() => {
                setNotice("");
                setShowCreate(true);
              }}
            >
              <Plus size={16} />
              Add Organization
            </button>
          </div>
        </header>

        {notice && (
          <div className="os-notice" role="status">
            <CheckCircle2 size={17} />
            {notice}
          </div>
        )}

        <section className="os-stats">
          <div className="os-stat">
            <div className="os-stat-icon"><Building2 size={20} /></div>
            <div>
              <div className="os-stat-label">Total Organizations</div>
              <div className="os-stat-value">{organizations.length}</div>
            </div>
          </div>
          <div className="os-stat">
            <div className="os-stat-icon"><CheckCircle2 size={20} /></div>
            <div>
              <div className="os-stat-label">Active Organizations</div>
              <div className="os-stat-value">{activeCount}</div>
            </div>
          </div>
          <div className="os-stat">
            <div className="os-stat-icon"><Mail size={20} /></div>
            <div>
              <div className="os-stat-label">Pending Approval</div>
              <div className="os-stat-value">{pendingCount}</div>
            </div>
          </div>
          <div className="os-stat">
            <div className="os-stat-icon"><Users size={20} /></div>
            <div>
              <div className="os-stat-label">Total Members</div>
              <div className="os-stat-value">{totalMembers.toLocaleString()}</div>
            </div>
          </div>
        </section>

        <div className="os-tabs">
          <button
            type="button"
            className={`os-tab ${activeTab === "directory" ? "active" : ""}`}
            onClick={() => setActiveTab("directory")}
          >
            Organization Directory
          </button>
          <button
            type="button"
            className={`os-tab ${activeTab === "defaults" ? "active" : ""}`}
            onClick={() => setActiveTab("defaults")}
          >
            Organization Defaults
          </button>
          <button
            type="button"
            className={`os-tab ${activeTab === "policies" ? "active" : ""}`}
            onClick={() => setActiveTab("policies")}
          >
            Policies & Security
          </button>
        </div>

        {activeTab === "directory" && (
          <section className="os-card">
            <div className="os-card-header">
              <div>
                <h2>Organizations</h2>
                <p>Review organization profiles, subscription plans, and statuses.</p>
              </div>
              <button
                type="button"
                className="os-button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("All");
                  setPlanFilter("All");
                }}
              >
                <RotateCcw size={14} />
                Clear Filters
              </button>
            </div>

            <div className="os-toolbar">
              <div className="os-search">
                <Search size={16} />
                <input
                  aria-label="Search organizations"
                  placeholder="Search organization, owner, or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All statuses</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Suspended">Suspended</option>
              </select>
              <select
                aria-label="Filter by plan"
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
              >
                <option value="All">All plans</option>
                <option value="Enterprise">Enterprise</option>
                <option value="Business">Business</option>
                <option value="Pro">Pro</option>
              </select>
            </div>

            <div className="os-table-wrap">
              <table className="os-table">
                <thead>
                  <tr>
                    <th>Organization</th>
                    <th>Owner</th>
                    <th>Plan</th>
                    <th>Members</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrganizations.map((org) => (
                    <tr key={org.id}>
                      <td>
                        <div className="os-org-cell">
                          <div className="os-avatar">
                            {org.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="os-org-name">{org.name}</div>
                            <div className="os-org-slug">{org.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="os-org-name">{org.owner}</div>
                        <div className="os-org-slug">{org.email}</div>
                      </td>
                      <td>{org.plan}</td>
                      <td>{org.members.toLocaleString()}</td>
                      <td>
                        <span className={`os-status ${org.status.toLowerCase()}`}>
                          {org.status}
                        </span>
                      </td>
                      <td>{org.created}</td>
                      <td>
                        <button
                          type="button"
                          className="os-icon-button"
                          aria-label={`View ${org.name}`}
                          title="View organization"
                          onClick={() => setSelectedOrganization(org)}
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredOrganizations.length === 0 && (
                <div className="os-empty">
                  No organizations match your search or filters.
                </div>
              )}
            </div>

            <div className="os-footer">
              <span>Showing {filteredOrganizations.length} of {organizations.length} organizations</span>
              <span>Directory data is currently local demo data.</span>
            </div>
          </section>
        )}

        {activeTab === "defaults" && (
          <section className="os-card">
            <div className="os-card-header">
              <div>
                <h2>Organization Defaults</h2>
                <p>Configure initial settings for newly created organizations.</p>
              </div>
              <Settings2 size={21} color="#5265d9" />
            </div>

            <div className="os-form-grid">
              <div className="os-field">
                <label htmlFor="defaultPlan">Default Subscription Plan</label>
                <select
                  id="defaultPlan"
                  value={defaults.defaultPlan}
                  onChange={(e) => updateDefault("defaultPlan", e.target.value)}
                >
                  <option value="Pro">Pro</option>
                  <option value="Business">Business</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>

              <div className="os-field">
                <label htmlFor="defaultStatus">Default Organization Status</label>
                <select
                  id="defaultStatus"
                  value={defaults.defaultStatus}
                  onChange={(e) => updateDefault("defaultStatus", e.target.value)}
                >
                  <option value="Pending">Pending approval</option>
                  <option value="Active">Active immediately</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>

              <div className="os-field">
                <label htmlFor="memberLimit">Default Member Limit</label>
                <select
                  id="memberLimit"
                  value={defaults.memberLimit}
                  onChange={(e) => updateDefault("memberLimit", e.target.value)}
                >
                  <option value="10">10 members</option>
                  <option value="25">25 members</option>
                  <option value="100">100 members</option>
                  <option value="500">500 members</option>
                  <option value="unlimited">Unlimited</option>
                </select>
              </div>
            </div>

            <PreferenceToggle
              title="Allow Organization Creation"
              description="Allow eligible users to create new organizations."
              checked={defaults.allowCreation}
              onChange={(value) => updateDefault("allowCreation", value)}
            />
            <PreferenceToggle
              title="Allow Member Invitations"
              description="Allow organization owners and authorized administrators to invite members."
              checked={defaults.allowInvitations}
              onChange={(value) => updateDefault("allowInvitations", value)}
            />

            <div className="os-footer">
              <span>These defaults are configuration values until integrated with the backend.</span>
              <button type="button" className="os-button primary" onClick={saveSettings}>
                <Save size={14} />
                Save Defaults
              </button>
            </div>
          </section>
        )}

        {activeTab === "policies" && (
          <section className="os-card">
            <div className="os-card-header">
              <div>
                <h2>Organization Policies & Security</h2>
                <p>Configure organization-level access and governance requirements.</p>
              </div>
              <ShieldCheck size={22} color="#5265d9" />
            </div>

            <PreferenceToggle
              title="Require Domain Verification"
              description="Require verification of an organization's email domain before granting domain-based privileges."
              checked={defaults.requireDomainVerification}
              onChange={(value) => updateDefault("requireDomainVerification", value)}
            />
            <PreferenceToggle
              title="Enforce Member Limits"
              description="Apply the configured organization member limit when inviting or adding members."
              checked={defaults.enforceMemberLimit}
              onChange={(value) => updateDefault("enforceMemberLimit", value)}
            />
            <PreferenceToggle
              title="Organization Audit Logs"
              description="Enable organization-level audit event recording in the platform."
              checked={defaults.enableOrganizationAuditLogs}
              onChange={(value) => updateDefault("enableOrganizationAuditLogs", value)}
            />
            <PreferenceToggle
              title="Require MFA for Organization Admins"
              description="Require multi-factor authentication for organization administrators. Backend enforcement is required."
              checked={defaults.requireMfaForAdmins}
              onChange={(value) => updateDefault("requireMfaForAdmins", value)}
            />

            <div className="os-footer">
              <span>Security controls must be enforced and audited by the server.</span>
              <button type="button" className="os-button primary" onClick={saveSettings}>
                <Save size={14} />
                Save Policies
              </button>
            </div>
          </section>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
          <button type="button" className="os-button" onClick={resetSettings}>
            <RotateCcw size={14} />
            Reset Settings
          </button>
        </div>
      </div>

      {showCreate && (
        <div
          className="os-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowCreate(false);
          }}
        >
          <section className="os-modal" role="dialog" aria-modal="true" aria-labelledby="os-create-title">
            <div className="os-modal-header">
              <h2 id="os-create-title">Add Organization</h2>
              <button
                type="button"
                className="os-icon-button"
                aria-label="Close dialog"
                onClick={() => setShowCreate(false)}
              >
                <X size={17} />
              </button>
            </div>

            <div className="os-modal-body">
              <div className="os-form-grid" style={{ padding: 0 }}>
                <div className="os-field full">
                  <label htmlFor="orgName">Organization Name</label>
                  <input
                    id="orgName"
                    value={newOrganization.name}
                    onChange={(e) => setNewOrganization((current) => ({ ...current, name: e.target.value }))}
                    placeholder="Enter organization name"
                  />
                </div>

                <div className="os-field">
                  <label htmlFor="orgOwner">Owner Name</label>
                  <input
                    id="orgOwner"
                    value={newOrganization.owner}
                    onChange={(e) => setNewOrganization((current) => ({ ...current, owner: e.target.value }))}
                    placeholder="Enter owner name"
                  />
                </div>

                <div className="os-field">
                  <label htmlFor="orgEmail">Owner Email</label>
                  <input
                    id="orgEmail"
                    type="email"
                    value={newOrganization.email}
                    onChange={(e) => setNewOrganization((current) => ({ ...current, email: e.target.value }))}
                    placeholder="owner@example.com"
                  />
                </div>

                <div className="os-field full">
                  <label htmlFor="orgPlan">Subscription Plan</label>
                  <select
                    id="orgPlan"
                    value={newOrganization.plan}
                    onChange={(e) => setNewOrganization((current) => ({ ...current, plan: e.target.value }))}
                  >
                    <option value="Pro">Pro</option>
                    <option value="Business">Business</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>
              </div>

              <div className="os-modal-actions">
                <button type="button" className="os-button" onClick={() => setShowCreate(false)}>
                  Cancel
                </button>
                <button type="button" className="os-button primary" onClick={createOrganization}>
                  <Plus size={14} />
                  Create Organization
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {selectedOrganization && (
        <div
          className="os-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedOrganization(null);
          }}
        >
          <section className="os-modal" role="dialog" aria-modal="true" aria-labelledby="os-details-title">
            <div className="os-modal-header">
              <h2 id="os-details-title">Organization Details</h2>
              <button
                type="button"
                className="os-icon-button"
                aria-label="Close details"
                onClick={() => setSelectedOrganization(null)}
              >
                <X size={17} />
              </button>
            </div>

            <div className="os-detail-heading">
              <div className="os-avatar" style={{ width: 48, height: 48 }}>
                {selectedOrganization.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3>{selectedOrganization.name}</h3>
                <p>{selectedOrganization.slug}</p>
              </div>
            </div>

            <div className="os-details">
              <div className="os-detail-item">
                <div className="os-detail-label">Owner</div>
                <div className="os-detail-value">{selectedOrganization.owner}</div>
              </div>
              <div className="os-detail-item">
                <div className="os-detail-label">Owner Email</div>
                <div className="os-detail-value">{selectedOrganization.email}</div>
              </div>
              <div className="os-detail-item">
                <div className="os-detail-label">Subscription</div>
                <div className="os-detail-value">
                  <CreditCard size={14} style={{ display: "inline", marginRight: 5 }} />
                  {selectedOrganization.plan}
                </div>
              </div>
              <div className="os-detail-item">
                <div className="os-detail-label">Members</div>
                <div className="os-detail-value">
                  <Users size={14} style={{ display: "inline", marginRight: 5 }} />
                  {selectedOrganization.members}
                </div>
              </div>
              <div className="os-detail-item">
                <div className="os-detail-label">Created</div>
                <div className="os-detail-value">{selectedOrganization.created}</div>
              </div>
              <div className="os-detail-item">
                <div className="os-detail-label">Status</div>
                <div className="os-detail-value">
                  <span className={`os-status ${selectedOrganization.status.toLowerCase()}`}>
                    {selectedOrganization.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="os-modal-body" style={{ paddingTop: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <BriefcaseBusiness size={16} color="#5265d9" />
                <strong style={{ fontSize: 12 }}>Organization Actions</strong>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
                {selectedOrganization.status !== "Active" && (
                  <button
                    type="button"
                    className="os-button primary"
                    onClick={() => changeStatus(selectedOrganization.id, "Active")}
                  >
                    <CheckCircle2 size={14} />
                    Activate
                  </button>
                )}
                {selectedOrganization.status !== "Pending" && (
                  <button
                    type="button"
                    className="os-button"
                    onClick={() => changeStatus(selectedOrganization.id, "Pending")}
                  >
                    <Mail size={14} />
                    Mark Pending
                  </button>
                )}
                {selectedOrganization.status !== "Suspended" && (
                  <button
                    type="button"
                    className="os-button"
                    onClick={() => changeStatus(selectedOrganization.id, "Suspended")}
                  >
                    <ShieldCheck size={14} />
                    Suspend
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
