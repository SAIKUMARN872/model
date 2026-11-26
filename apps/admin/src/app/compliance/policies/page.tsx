
"use client";

import { useMemo, useState } from "react";
import {
  ShieldCheck,
  FileText,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  Download,
  MoreHorizontal,
  X,
  Check,
  Trash2,
  CalendarDays,
  UserRound,
  ChevronRight,
  LockKeyhole,
} from "lucide-react";

type PolicyStatus = "Active" | "Draft" | "Under review" | "Expired";

type Policy = {
  id: string;
  name: string;
  category: string;
  owner: string;
  version: string;
  status: PolicyStatus;
  lastUpdated: string;
  reviewDate: string;
  description: string;
};

const initialPolicies: Policy[] = [
  {
    id: "POL-001",
    name: "Information Security Policy",
    category: "Security",
    owner: "Security Team",
    version: "2.4",
    status: "Active",
    lastUpdated: "2026-10-24",
    reviewDate: "2027-01-24",
    description: "Defines organizational security principles and responsibilities.",
  },
  {
    id: "POL-002",
    name: "Data Privacy and Protection Policy",
    category: "Privacy",
    owner: "Compliance Team",
    version: "1.8",
    status: "Active",
    lastUpdated: "2026-10-20",
    reviewDate: "2027-01-20",
    description: "Establishes requirements for handling and protecting personal data.",
  },
  {
    id: "POL-003",
    name: "Access Control Policy",
    category: "Access Management",
    owner: "IT Operations",
    version: "3.1",
    status: "Under review",
    lastUpdated: "2026-10-18",
    reviewDate: "2026-11-15",
    description: "Controls user access, permissions, and privileged accounts.",
  },
  {
    id: "POL-004",
    name: "Incident Response Policy",
    category: "Security",
    owner: "Security Team",
    version: "1.5",
    status: "Active",
    lastUpdated: "2026-10-15",
    reviewDate: "2027-01-15",
    description: "Defines the process for identifying and responding to security incidents.",
  },
  {
    id: "POL-005",
    name: "Acceptable Use Policy",
    category: "Employee",
    owner: "People Operations",
    version: "1.0",
    status: "Draft",
    lastUpdated: "2026-10-12",
    reviewDate: "2026-11-30",
    description: "Sets expectations for the responsible use of organizational resources.",
  },
  {
    id: "POL-006",
    name: "Vendor Risk Management Policy",
    category: "Third-Party Risk",
    owner: "Risk Team",
    version: "2.0",
    status: "Active",
    lastUpdated: "2026-10-08",
    reviewDate: "2027-01-08",
    description: "Establishes security and compliance checks for external vendors.",
  },
  {
    id: "POL-007",
    name: "Business Continuity Policy",
    category: "Operations",
    owner: "Platform Team",
    version: "1.2",
    status: "Expired",
    lastUpdated: "2025-09-15",
    reviewDate: "2026-09-15",
    description: "Documents continuity and recovery responsibilities during disruptions.",
  },
  {
    id: "POL-008",
    name: "AI Usage and Governance Policy",
    category: "AI Governance",
    owner: "AI Governance Team",
    version: "1.1",
    status: "Under review",
    lastUpdated: "2026-10-26",
    reviewDate: "2026-11-20",
    description: "Defines responsible AI usage, oversight, and risk management expectations.",
  },
];

const policyStatuses: PolicyStatus[] = [
  "Active",
  "Draft",
  "Under review",
  "Expired",
];

const policyCategories = [
  "Security",
  "Privacy",
  "Access Management",
  "Employee",
  "Third-Party Risk",
  "Operations",
  "AI Governance",
  "Data Management",
];

const initialForm = {
  name: "",
  category: "Security",
  owner: "",
  version: "1.0",
  status: "Draft" as PolicyStatus,
  reviewDate: "",
  description: "",
};

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>(initialPolicies);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewPolicy, setViewPolicy] = useState<Policy | null>(null);
  const [form, setForm] = useState(initialForm);
  const [notice, setNotice] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredPolicies = useMemo(() => {
    const term = search.toLowerCase().trim();

    return policies.filter((policy) => {
      const matchesSearch =
        !term ||
        policy.name.toLowerCase().includes(term) ||
        policy.id.toLowerCase().includes(term) ||
        policy.owner.toLowerCase().includes(term) ||
        policy.category.toLowerCase().includes(term);

      return (
        matchesSearch &&
        (statusFilter === "All statuses" || policy.status === statusFilter) &&
        (categoryFilter === "All categories" ||
          policy.category === categoryFilter)
      );
    });
  }, [policies, search, statusFilter, categoryFilter]);

  const activeCount = policies.filter((p) => p.status === "Active").length;
  const draftCount = policies.filter((p) => p.status === "Draft").length;
  const reviewCount = policies.filter((p) => p.status === "Under review").length;
  const expiredCount = policies.filter((p) => p.status === "Expired").length;

  const upcomingReviews = policies.filter((policy) => {
    if (policy.status === "Expired") return true;
    if (policy.status === "Draft") return false;

    return (
      new Date(`${policy.reviewDate}T12:00:00`).getTime() -
        new Date("2026-11-04T12:00:00").getTime() <=
      30 * 24 * 60 * 60 * 1000
    );
  }).length;

  function notify(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3000);
  }

  function addPolicy() {
    if (!form.name.trim() || !form.owner.trim()) {
      notify("Please enter a policy name and owner.");
      return;
    }

    const nextNumber =
      Math.max(
        0,
        ...policies.map((p) => Number(p.id.split("-")[1]) || 0)
      ) + 1;

    const policy: Policy = {
      id: `POL-${String(nextNumber).padStart(3, "0")}`,
      name: form.name.trim(),
      category: form.category,
      owner: form.owner.trim(),
      version: form.version.trim() || "1.0",
      status: form.status,
      lastUpdated: new Date().toISOString().slice(0, 10),
      reviewDate: form.reviewDate || "2027-01-31",
      description: form.description.trim() || "No description provided.",
    };

    setPolicies((current) => [policy, ...current]);
    setForm(initialForm);
    setShowModal(false);
    notify("Policy created successfully.");
  }

  function updateStatus(id: string, status: PolicyStatus) {
    setPolicies((current) =>
      current.map((policy) =>
        policy.id === id
          ? {
              ...policy,
              status,
              lastUpdated: new Date().toISOString().slice(0, 10),
            }
          : policy
      )
    );
    setSelectedId(null);
    notify("Policy status updated.");
  }

  function deletePolicy(id: string) {
    setPolicies((current) => current.filter((policy) => policy.id !== id));
    setSelectedIds((current) => current.filter((item) => item !== id));
    setSelectedId(null);
    setViewPolicy(null);
    notify("Policy deleted.");
  }

  function toggleSelected(id: string) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function toggleAll() {
    const visibleIds = filteredPolicies.map((policy) => policy.id);
    const allSelected =
      visibleIds.length > 0 &&
      visibleIds.every((id) => selectedIds.includes(id));

    setSelectedIds((current) =>
      allSelected
        ? current.filter((id) => !visibleIds.includes(id))
        : Array.from(new Set([...current, ...visibleIds]))
    );
  }

  function exportCSV() {
    const data = selectedIds.length
      ? filteredPolicies.filter((policy) => selectedIds.includes(policy.id))
      : filteredPolicies;

    const headers = [
      "Policy ID",
      "Policy Name",
      "Category",
      "Owner",
      "Version",
      "Status",
      "Last Updated",
      "Review Date",
      "Description",
    ];

    const rows = data.map((p) => [
      p.id,
      p.name,
      p.category,
      p.owner,
      p.version,
      p.status,
      p.lastUpdated,
      p.reviewDate,
      p.description,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" })
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "modelnow-policies.csv";
    link.click();
    URL.revokeObjectURL(url);
    notify("Policy CSV exported.");
  }

  function formatDate(value: string) {
    if (!value) return "Not scheduled";

    return new Date(`${value}T12:00:00`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <main className="policies-page">
      <header className="page-header">
        <div>
          <div className="breadcrumb">
            Admin <span>/</span> Compliance <span>/</span>{" "}
            <strong>Policies</strong>
          </div>
          <div className="heading-row">
            <div className="heading-icon">
              <ShieldCheck size={25} />
            </div>
            <div>
              <h1>Policies</h1>
              <p>
                Create, maintain, and review organizational compliance
                policies.
              </p>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <button className="secondary-button" onClick={exportCSV}>
            <Download size={16} />
            Export CSV
          </button>
          <button
            className="primary-button"
            onClick={() => {
              setForm(initialForm);
              setShowModal(true);
            }}
          >
            <Plus size={17} />
            Create policy
          </button>
        </div>
      </header>

      {notice && (
        <div className="notice">
          <CheckCircle2 size={17} />
          {notice}
          <button onClick={() => setNotice("")} aria-label="Dismiss">
            <X size={15} />
          </button>
        </div>
      )}

      <section className="metric-grid">
        <article className="metric-card">
          <div className="metric-top">
            <span>Total policies</span>
            <div className="metric-icon blue">
              <FileText size={19} />
            </div>
          </div>
          <div className="metric-value">{policies.length}</div>
          <div className="metric-note">Policies in your inventory</div>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span>Active policies</span>
            <div className="metric-icon green">
              <CheckCircle2 size={19} />
            </div>
          </div>
          <div className="metric-value">{activeCount}</div>
          <div className="metric-note">Currently active</div>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span>Pending review</span>
            <div className="metric-icon amber">
              <Clock3 size={19} />
            </div>
          </div>
          <div className="metric-value">{reviewCount + draftCount}</div>
          <div className="metric-note">
            {reviewCount} under review · {draftCount} drafts
          </div>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span>Expired / due</span>
            <div className="metric-icon red">
              <AlertTriangle size={19} />
            </div>
          </div>
          <div className="metric-value">{expiredCount + upcomingReviews}</div>
          <div className="metric-note">
            Includes expired policies and upcoming reviews
          </div>
        </article>
      </section>

      <section className="notice-banner">
        <div className="banner-icon">
          <CalendarDays size={20} />
        </div>
        <div className="banner-copy">
          <strong>Keep policy reviews on schedule</strong>
          <p>
            Review policy owners and due dates to help maintain current,
            approved documentation.
          </p>
        </div>
        <button
          className="text-button"
          onClick={() => setStatusFilter("Expired")}
        >
          View expired <ChevronRight size={15} />
        </button>
      </section>

      <section className="table-card">
        <div className="table-heading">
          <div>
            <h2>Policy inventory</h2>
            <p>Track policy status, ownership, versions, and review dates.</p>
          </div>
          <span className="count-pill">{filteredPolicies.length} policies</span>
        </div>

        <div className="filter-bar">
          <div className="search-box">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search policies, owners, categories..."
            />
            {search && (
              <button onClick={() => setSearch("")} aria-label="Clear search">
                <X size={15} />
              </button>
            )}
          </div>

          <label className="filter-select">
            <Filter size={15} />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option>All statuses</option>
              {policyStatuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>

          <label className="filter-select">
            <LockKeyhole size={15} />
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option>All categories</option>
              {policyCategories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>
        </div>

        {selectedIds.length > 0 && (
          <div className="bulk-bar">
            <span>{selectedIds.length} selected</span>
            <button onClick={exportCSV}>
              <Download size={15} /> Export selected
            </button>
            <button onClick={() => setSelectedIds([])}>Clear selection</button>
          </div>
        )}

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th className="check-cell">
                  <input
                    type="checkbox"
                    aria-label="Select all visible policies"
                    checked={
                      filteredPolicies.length > 0 &&
                      filteredPolicies.every((p) => selectedIds.includes(p.id))
                    }
                    onChange={toggleAll}
                  />
                </th>
                <th>POLICY</th>
                <th>CATEGORY</th>
                <th>OWNER</th>
                <th>VERSION</th>
                <th>STATUS</th>
                <th>LAST UPDATED</th>
                <th>REVIEW DATE</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredPolicies.map((policy) => (
                <tr key={policy.id}>
                  <td className="check-cell">
                    <input
                      type="checkbox"
                      aria-label={`Select ${policy.id}`}
                      checked={selectedIds.includes(policy.id)}
                      onChange={() => toggleSelected(policy.id)}
                    />
                  </td>
                  <td>
                    <button
                      className="policy-name-button"
                      onClick={() => setViewPolicy(policy)}
                    >
                      <span className="document-icon">
                        <FileText size={17} />
                      </span>
                      <span className="policy-name-wrap">
                        <strong>{policy.name}</strong>
                        <small>{policy.id}</small>
                      </span>
                    </button>
                  </td>
                  <td>
                    <span className="category-tag">{policy.category}</span>
                  </td>
                  <td>
                    <div className="owner-cell">
                      <span className="owner-avatar">
                        <UserRound size={14} />
                      </span>
                      {policy.owner}
                    </div>
                  </td>
                  <td>
                    <span className="version-tag">v{policy.version}</span>
                  </td>
                  <td>
                    <StatusBadge status={policy.status} />
                  </td>
                  <td>
                    <span className="date-cell">
                      <CalendarDays size={14} />
                      {formatDate(policy.lastUpdated)}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`review-date ${
                        policy.status === "Expired" ? "overdue" : ""
                      }`}
                    >
                      {formatDate(policy.reviewDate)}
                    </span>
                  </td>
                  <td className="action-cell">
                    <div className="action-wrap">
                      <button
                        className="icon-button"
                        aria-label={`Actions for ${policy.id}`}
                        onClick={() =>
                          setSelectedId(
                            selectedId === policy.id ? null : policy.id
                          )
                        }
                      >
                        <MoreHorizontal size={19} />
                      </button>

                      {selectedId === policy.id && (
                        <div className="action-menu">
                          <button
                            onClick={() => {
                              setViewPolicy(policy);
                              setSelectedId(null);
                            }}
                          >
                            <FileText size={14} /> View details
                          </button>
                          <div className="menu-heading">Change status</div>
                          {policyStatuses.map((status) => (
                            <button
                              key={status}
                              onClick={() => updateStatus(policy.id, status)}
                            >
                              {policy.status === status ? (
                                <Check size={14} />
                              ) : (
                                <span className="menu-spacer" />
                              )}
                              {status}
                            </button>
                          ))}
                          <div className="menu-divider" />
                          <button
                            className="delete-action"
                            onClick={() => deletePolicy(policy.id)}
                          >
                            <Trash2 size={14} /> Delete policy
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredPolicies.length === 0 && (
                <tr>
                  <td colSpan={9}>
                    <div className="empty-state">
                      <FileText size={29} />
                      <strong>No policies found</strong>
                      <p>Change the filters or create a new policy.</p>
                      <button
                        className="primary-button"
                        onClick={() => setShowModal(true)}
                      >
                        <Plus size={15} /> Create policy
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>
            Showing {filteredPolicies.length} of {policies.length} policies
          </span>
          <span className="demo-label">
            <Clock3 size={14} /> Frontend demo data
          </span>
        </div>
      </section>

      <section className="bottom-grid">
        <article className="info-card">
          <div className="info-icon blue">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h3>Policy governance</h3>
            <p>
              Keep policies assigned to owners and aligned with your
              organization&apos;s compliance requirements.
            </p>
            <button
              className="text-button"
              onClick={() => notify("Policy approval workflow can be integrated next.")}
            >
              Approval workflow <ChevronRight size={14} />
            </button>
          </div>
        </article>

        <article className="info-card">
          <div className="info-icon green">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <h3>Version management</h3>
            <p>
              Track policy revisions and establish a review cadence for
              controlled documents.
            </p>
            <button
              className="text-button"
              onClick={() => notify("Version history is a future backend integration.")}
            >
              View version guidance <ChevronRight size={14} />
            </button>
          </div>
        </article>
      </section>

      {showModal && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowModal(false);
          }}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-policy-title"
          >
            <div className="modal-header">
              <div>
                <div className="modal-icon">
                  <FileText size={21} />
                </div>
                <h2 id="create-policy-title">Create policy</h2>
                <p>Add a policy to the compliance inventory.</p>
              </div>
              <button
                className="icon-button"
                onClick={() => setShowModal(false)}
                aria-label="Close modal"
              >
                <X size={19} />
              </button>
            </div>

            <div className="form-content">
              <label>
                Policy name <span>*</span>
                <input
                  autoFocus
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="e.g. Data Retention Policy"
                />
              </label>

              <div className="form-row">
                <label>
                  Category
                  <select
                    value={form.category}
                    onChange={(event) =>
                      setForm({ ...form, category: event.target.value })
                    }
                  >
                    {policyCategories.map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Version
                  <input
                    value={form.version}
                    onChange={(event) =>
                      setForm({ ...form, version: event.target.value })
                    }
                    placeholder="1.0"
                  />
                </label>
              </div>

              <label>
                Policy owner <span>*</span>
                <input
                  value={form.owner}
                  onChange={(event) =>
                    setForm({ ...form, owner: event.target.value })
                  }
                  placeholder="Responsible team or person"
                />
              </label>

              <div className="form-row">
                <label>
                  Initial status
                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        status: event.target.value as PolicyStatus,
                      })
                    }
                  >
                    {policyStatuses.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Review date
                  <input
                    type="date"
                    value={form.reviewDate}
                    onChange={(event) =>
                      setForm({ ...form, reviewDate: event.target.value })
                    }
                  />
                </label>
              </div>

              <label>
                Description
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  placeholder="Describe the purpose and scope of this policy."
                />
              </label>
            </div>

            <div className="modal-footer">
              <button
                className="secondary-button"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button className="primary-button" onClick={addPolicy}>
                <Plus size={16} /> Create policy
              </button>
            </div>
          </div>
        </div>
      )}

      {viewPolicy && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setViewPolicy(null);
          }}
        >
          <div className="modal details-modal" role="dialog" aria-modal="true">
            <div className="modal-header">
              <div>
                <div className="modal-icon">
                  <FileText size={21} />
                </div>
                <h2>{viewPolicy.name}</h2>
                <p>
                  {viewPolicy.id} · Version {viewPolicy.version}
                </p>
              </div>
              <button
                className="icon-button"
                onClick={() => setViewPolicy(null)}
                aria-label="Close details"
              >
                <X size={19} />
              </button>
            </div>

            <div className="details-content">
              <div className="detail-row">
                <span>Status</span>
                <StatusBadge status={viewPolicy.status} />
              </div>
              <div className="detail-row">
                <span>Category</span>
                <strong>{viewPolicy.category}</strong>
              </div>
              <div className="detail-row">
                <span>Owner</span>
                <strong>{viewPolicy.owner}</strong>
              </div>
              <div className="detail-row">
                <span>Last updated</span>
                <strong>{formatDate(viewPolicy.lastUpdated)}</strong>
              </div>
              <div className="detail-row">
                <span>Next review</span>
                <strong>{formatDate(viewPolicy.reviewDate)}</strong>
              </div>
              <div className="description-block">
                <span>Description</span>
                <p>{viewPolicy.description}</p>
              </div>
              <p className="demo-note">
                This is a frontend policy record. Approval, file attachments,
                and version history require backend integration.
              </p>
            </div>

            <div className="modal-footer">
              <button
                className="secondary-button"
                onClick={() => setViewPolicy(null)}
              >
                Close
              </button>
              <button
                className="primary-button"
                onClick={() => {
                  setViewPolicy(null);
                  setSelectedId(viewPolicy.id);
                }}
              >
                <MoreHorizontal size={16} /> Policy actions
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .policies-page {
          min-height: 100vh;
          padding: 30px;
          background: #f7f8fc;
          color: #172033;
          font-family: Arial, Helvetica, sans-serif;
        }

        .page-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 26px;
        }

        .breadcrumb {
          margin-bottom: 18px;
          color: #8790a3;
          font-size: 12px;
        }

        .breadcrumb span {
          margin: 0 8px;
          color: #c1c7d2;
        }

        .breadcrumb strong {
          color: #49546a;
          font-weight: 600;
        }

        .heading-row {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .heading-icon {
          display: grid;
          place-items: center;
          width: 48px;
          height: 48px;
          flex-shrink: 0;
          border: 1px solid #dbe5ff;
          border-radius: 13px;
          background: #edf2ff;
          color: #315fe8;
        }

        h1 {
          margin: 0;
          font-size: 27px;
          letter-spacing: -0.7px;
          font-weight: 750;
        }

        .heading-row p {
          margin: 7px 0 0;
          color: #7b8498;
          font-size: 13px;
        }

        .header-actions {
          display: flex;
          gap: 10px;
          flex-shrink: 0;
        }

        button {
          font: inherit;
          cursor: pointer;
        }

        .primary-button,
        .secondary-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 39px;
          padding: 0 14px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 650;
          transition: background 0.15s ease;
        }

        .primary-button {
          border: 1px solid #315fe8;
          background: #315fe8;
          color: white;
        }

        .primary-button:hover {
          background: #244bc4;
        }

        .secondary-button {
          border: 1px solid #dfe3eb;
          background: white;
          color: #39445a;
        }

        .secondary-button:hover {
          background: #f3f5f9;
        }

        .notice {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 18px;
          padding: 12px 15px;
          border: 1px solid #b9e8ce;
          border-radius: 9px;
          background: #effbf4;
          color: #197344;
          font-size: 13px;
        }

        .notice button {
          display: grid;
          place-items: center;
          margin-left: auto;
          border: 0;
          background: transparent;
          color: inherit;
        }

        .metric-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 19px;
        }

        .metric-card {
          min-width: 0;
          padding: 19px;
          border: 1px solid #e7eaf1;
          border-radius: 12px;
          background: white;
          box-shadow: 0 2px 5px #18234405;
        }

        .metric-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          color: #737e92;
          font-size: 12px;
        }

        .metric-icon,
        .info-icon {
          display: grid;
          place-items: center;
          width: 37px;
          height: 37px;
          flex-shrink: 0;
          border-radius: 10px;
        }

        .blue {
          background: #edf2ff;
          color: #315fe8;
        }

        .green {
          background: #e9f9ef;
          color: #16834b;
        }

        .amber {
          background: #fff4df;
          color: #ad740d;
        }

        .red {
          background: #fff0ed;
          color: #d34b39;
        }

        .metric-value {
          margin-top: 15px;
          font-size: 29px;
          font-weight: 750;
          letter-spacing: -0.8px;
        }

        .metric-note {
          margin-top: 7px;
          color: #929bad;
          font-size: 11px;
          line-height: 1.5;
        }

        .notice-banner {
          display: flex;
          align-items: center;
          gap: 13px;
          margin-bottom: 21px;
          padding: 15px 17px;
          border: 1px solid #dbe5ff;
          border-radius: 11px;
          background: #f0f4ff;
        }

        .banner-icon {
          display: grid;
          place-items: center;
          width: 39px;
          height: 39px;
          flex-shrink: 0;
          border-radius: 10px;
          background: #dfe8ff;
          color: #315fe8;
        }

        .banner-copy {
          min-width: 0;
        }

        .banner-copy strong {
          color: #294581;
          font-size: 13px;
        }

        .banner-copy p {
          margin: 5px 0 0;
          color: #7182a9;
          font-size: 12px;
          line-height: 1.5;
        }

        .text-button {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 0;
          border: 0;
          background: transparent;
          color: #315fe8;
          font-size: 12px;
          font-weight: 650;
          white-space: nowrap;
        }

        .notice-banner > .text-button {
          margin-left: auto;
        }

        .table-card {
          overflow: visible;
          border: 1px solid #e7eaf1;
          border-radius: 12px;
          background: white;
          box-shadow: 0 2px 5px #18234405;
        }

        .table-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 21px 21px 17px;
        }

        .table-heading h2 {
          margin: 0;
          font-size: 16px;
          font-weight: 720;
        }

        .table-heading p {
          margin: 6px 0 0;
          color: #8a93a5;
          font-size: 12px;
        }

        .count-pill {
          padding: 6px 10px;
          border: 1px solid #e7eaf1;
          border-radius: 7px;
          color: #657086;
          font-size: 11px;
          white-space: nowrap;
        }

        .filter-bar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px;
          padding: 0 21px 17px;
        }

        .search-box,
        .filter-select {
          display: flex;
          align-items: center;
          gap: 8px;
          height: 37px;
          padding: 0 11px;
          border: 1px solid #e2e6ee;
          border-radius: 8px;
          background: white;
          color: #8791a4;
        }

        .search-box {
          flex: 1 1 250px;
          min-width: 180px;
        }

        .search-box input {
          width: 100%;
          min-width: 0;
          border: 0;
          outline: 0;
          background: transparent;
          color: #263147;
          font-size: 12px;
        }

        .search-box input::placeholder {
          color: #a2aaba;
        }

        .search-box button {
          display: grid;
          place-items: center;
          border: 0;
          background: transparent;
          color: #8791a4;
        }

        .filter-select {
          flex: 0 0 auto;
        }

        .filter-select select {
          max-width: 155px;
          border: 0;
          outline: 0;
          background: transparent;
          color: #59647a;
          font-size: 12px;
          cursor: pointer;
        }

        .bulk-bar {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 10px 21px;
          border-top: 1px solid #e7eaf1;
          background: #f4f7ff;
          color: #344b89;
          font-size: 12px;
        }

        .bulk-bar button {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          border: 0;
          background: transparent;
          color: #315fe8;
          font-size: 12px;
          font-weight: 600;
        }

        .table-scroll {
          width: 100%;
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          white-space: nowrap;
        }

        thead {
          background: #f8f9fc;
        }

        th {
          padding: 12px 13px;
          border-top: 1px solid #eef0f5;
          border-bottom: 1px solid #e9ecf2;
          color: #8b94a7;
          font-size: 9px;
          font-weight: 750;
          letter-spacing: 0.65px;
        }

        td {
          position: relative;
          padding: 14px 13px;
          border-bottom: 1px solid #eff1f5;
          color: #4c576c;
          font-size: 11px;
          vertical-align: middle;
        }

        tbody tr:last-child td {
          border-bottom: 0;
        }

        tbody tr:hover {
          background: #fbfcff;
        }

        .check-cell {
          width: 37px;
          padding-left: 20px;
          padding-right: 0;
        }

        input[type="checkbox"] {
          width: 14px;
          height: 14px;
          margin: 0;
          accent-color: #315fe8;
          cursor: pointer;
        }

        .policy-name-button {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 0;
          border: 0;
          background: transparent;
          text-align: left;
        }

        .document-icon {
          display: grid;
          place-items: center;
          width: 34px;
          height: 37px;
          flex-shrink: 0;
          border: 1px solid #e1e8ff;
          border-radius: 7px;
          background: #f0f4ff;
          color: #315fe8;
        }

        .policy-name-wrap {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .policy-name-wrap strong {
          max-width: 225px;
          overflow: hidden;
          color: #253047;
          font-size: 11px;
          font-weight: 650;
          text-overflow: ellipsis;
        }

        .policy-name-wrap small {
          color: #9aa2b2;
          font-size: 10px;
        }

        .category-tag,
        .version-tag {
          display: inline-block;
          padding: 5px 7px;
          border: 1px solid #e7eaf1;
          border-radius: 5px;
          background: #fafbfe;
          color: #667188;
          font-size: 10px;
        }

        .version-tag {
          color: #4f5f8a;
          background: #f4f6ff;
        }

        .owner-cell {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #59647a;
        }

        .owner-avatar {
          display: grid;
          place-items: center;
          width: 25px;
          height: 25px;
          border-radius: 7px;
          background: #edf2ff;
          color: #315fe8;
        }

        .date-cell {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #7b8598;
          font-size: 10px;
        }

        .review-date {
          color: #7b8598;
          font-size: 10px;
        }

        .review-date.overdue {
          color: #d04435;
          font-weight: 650;
        }

        .action-cell {
          width: 43px;
          padding-right: 16px;
        }

        .action-wrap {
          position: relative;
          display: flex;
          justify-content: flex-end;
        }

        .icon-button {
          display: grid;
          place-items: center;
          width: 32px;
          height: 32px;
          border: 1px solid transparent;
          border-radius: 7px;
          background: transparent;
          color: #788297;
        }

        .icon-button:hover {
          border-color: #e4e8f0;
          background: #f7f8fc;
        }

        .action-menu {
          position: absolute;
          z-index: 20;
          top: 35px;
          right: 0;
          width: 190px;
          padding: 6px;
          border: 1px solid #e4e8f0;
          border-radius: 9px;
          background: white;
          box-shadow: 0 10px 30px #1924401a;
        }

        .action-menu button {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 8px 9px;
          border: 0;
          border-radius: 5px;
          background: transparent;
          color: #4d5870;
          text-align: left;
          font-size: 11px;
        }

        .action-menu button:hover {
          background: #f3f5fa;
        }

        .menu-heading {
          padding: 8px 9px;
          color: #929bad;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .menu-spacer {
          width: 14px;
          flex-shrink: 0;
        }

        .menu-divider {
          height: 1px;
          margin: 5px 0;
          background: #eceef3;
        }

        .action-menu .delete-action {
          color: #d43f3f;
        }

        .table-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 14px 21px;
          border-top: 1px solid #edf0f5;
          color: #939bad;
          font-size: 10px;
        }

        .demo-label {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .empty-state {
          display: flex;
          align-items: center;
          flex-direction: column;
          gap: 10px;
          padding: 40px 15px;
          color: #8893a7;
          text-align: center;
          white-space: normal;
        }

        .empty-state strong {
          color: #37435a;
          font-size: 14px;
        }

        .empty-state p {
          margin: 0 0 6px;
          font-size: 12px;
        }

        .bottom-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
          margin-top: 20px;
        }

        .info-card {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 20px;
          border: 1px solid #e7eaf1;
          border-radius: 12px;
          background: white;
        }

        .info-icon {
          width: 40px;
          height: 40px;
        }

        .info-card h3 {
          margin: 2px 0 8px;
          color: #28334a;
          font-size: 13px;
        }

        .info-card p {
          max-width: 380px;
          margin: 0 0 9px;
          color: #858fa2;
          font-size: 11px;
          line-height: 1.7;
        }

        .modal-overlay {
          position: fixed;
          z-index: 100;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: #11182770;
          backdrop-filter: blur(3px);
        }

        .modal {
          width: 100%;
          max-width: 540px;
          max-height: calc(100vh - 40px);
          overflow-y: auto;
          border: 1px solid #e5e8ef;
          border-radius: 15px;
          background: white;
          box-shadow: 0 24px 70px #10182e30;
        }

        .details-modal {
          max-width: 570px;
        }

        .modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 15px;
          padding: 24px 24px 19px;
          border-bottom: 1px solid #edf0f5;
        }

        .modal-icon {
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          margin-bottom: 13px;
          border-radius: 11px;
          background: #edf2ff;
          color: #315fe8;
        }

        .modal-header h2 {
          margin: 0;
          color: #202b41;
          font-size: 19px;
        }

        .modal-header p {
          margin: 7px 0 0;
          color: #8b94a6;
          font-size: 12px;
          line-height: 1.6;
        }

        .form-content {
          display: flex;
          flex-direction: column;
          gap: 17px;
          padding: 22px 24px;
        }

        .form-content label {
          display: flex;
          flex-direction: column;
          gap: 8px;
          color: #455067;
          font-size: 12px;
          font-weight: 650;
        }

        .form-content label span {
          display: inline;
          color: #d94444;
        }

        .form-content input,
        .form-content select,
        .form-content textarea {
          width: 100%;
          padding: 0 11px;
          border: 1px solid #dfe4ed;
          border-radius: 7px;
          outline: none;
          background: white;
          color: #354158;
          font: inherit;
          font-size: 12px;
        }

        .form-content input,
        .form-content select {
          height: 40px;
        }

        .form-content textarea {
          padding-top: 10px;
          resize: vertical;
        }

        .form-content input:focus,
        .form-content select:focus,
        .form-content textarea:focus {
          border-color: #7190f5;
          box-shadow: 0 0 0 3px #315fe817;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 13px;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 16px 24px;
          border-top: 1px solid #edf0f5;
          background: #fbfcfe;
        }

        .details-content {
          display: flex;
          flex-direction: column;
          gap: 0;
          padding: 12px 24px 20px;
        }

        .detail-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 13px 0;
          border-bottom: 1px solid #edf0f5;
          font-size: 12px;
        }

        .detail-row > span {
          color: #8b94a6;
        }

        .detail-row strong {
          color: #3d4960;
          font-weight: 600;
          text-align: right;
        }

        .description-block {
          padding-top: 17px;
          color: #8b94a6;
          font-size: 12px;
        }

        .description-block p {
          margin: 8px 0 0;
          color: #4c576c;
          font-size: 12px;
          line-height: 1.7;
        }

        .demo-note {
          margin: 18px 0 0;
          padding: 11px 12px;
          border: 1px solid #e5eaff;
          border-radius: 7px;
          background: #f5f7ff;
          color: #6878a1;
          font-size: 11px;
          line-height: 1.6;
        }

        @media (max-width: 1100px) {
          .policies-page {
            padding: 22px;
          }

          .metric-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .page-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .header-actions {
            align-self: flex-end;
          }
        }

        @media (max-width: 650px) {
          .policies-page {
            padding: 15px;
          }

          h1 {
            font-size: 22px;
          }

          .heading-row {
            align-items: flex-start;
          }

          .heading-icon {
            width: 42px;
            height: 42px;
          }

          .metric-grid {
            gap: 10px;
          }

          .metric-card {
            padding: 14px;
          }

          .metric-value {
            font-size: 25px;
          }

          .metric-top {
            font-size: 11px;
          }

          .metric-icon {
            width: 31px;
            height: 31px;
          }

          .notice-banner {
            align-items: flex-start;
            flex-wrap: wrap;
          }

          .notice-banner > .text-button {
            margin-left: 52px;
          }

          .filter-bar {
            padding: 0 14px 14px;
          }

          .search-box {
            flex-basis: 100%;
          }

          .filter-select {
            flex: 1 1 auto;
          }

          .filter-select select {
            width: 100%;
            max-width: 100%;
          }

          .table-heading {
            padding: 17px 14px;
          }

          .table-footer {
            padding: 13px 14px;
          }

          .bottom-grid {
            grid-template-columns: 1fr;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .modal-header,
          .form-content,
          .modal-footer {
            padding-left: 17px;
            padding-right: 17px;
          }

          .details-content {
            padding-right: 17px;
            padding-left: 17px;
          }
        }
      `}</style>
    </main>
  );
}

function StatusBadge({ status }: { status: PolicyStatus }) {
  const className =
    status === "Active"
      ? "active"
      : status === "Draft"
        ? "draft"
        : status === "Under review"
          ? "review"
          : "expired";

  return (
    <>
      <span className={`status-badge ${className}`}>
        <span className="status-dot" />
        {status}
      </span>
      <style jsx>{`
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 8px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 600;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        .active {
          background: #eaf8ef;
          color: #16834b;
        }

        .draft {
          background: #f0f2f6;
          color: #778196;
        }

        .review {
          background: #fff5df;
          color: #a46a08;
        }

        .expired {
          background: #fff0ed;
          color: #d04435;
        }
      `}</style>
    </>
  );
}
