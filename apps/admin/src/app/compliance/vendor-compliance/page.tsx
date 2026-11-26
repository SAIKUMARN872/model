
"use client";

import { useMemo, useState } from "react";
import {
  Building2,
  ShieldCheck,
  AlertTriangle,
  Clock3,
  Search,
  Plus,
  Download,
  MoreHorizontal,
  Eye,
  X,
  Filter,
  FileText,
  CheckCircle2,
  RefreshCw,
  Trash2,
  CalendarDays,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

type RiskLevel = "Low" | "Medium" | "High" | "Critical";
type VendorStatus = "Approved" | "Under Review" | "Restricted";
type ReviewStatus = "Current" | "Due Soon" | "Overdue";

type Vendor = {
  id: string;
  name: string;
  category: string;
  service: string;
  risk: RiskLevel;
  status: VendorStatus;
  owner: string;
  contact: string;
  lastReview: string;
  nextReview: string;
  contractExpiry: string;
  securityReviewed: boolean;
  privacyReviewed: boolean;
  aiReviewed: boolean;
  documents: number;
  notes: string;
};

const initialVendors: Vendor[] = [
  {
    id: "VEN-001",
    name: "OpenAI",
    category: "AI Provider",
    service: "Large language models and APIs",
    risk: "High",
    status: "Approved",
    owner: "AI Platform Team",
    contact: "Vendor Management",
    lastReview: "2026-10-15",
    nextReview: "2027-01-15",
    contractExpiry: "2027-06-30",
    securityReviewed: true,
    privacyReviewed: true,
    aiReviewed: true,
    documents: 5,
    notes: "External model provider. Review data handling and API security requirements.",
  },
  {
    id: "VEN-002",
    name: "Anthropic",
    category: "AI Provider",
    service: "Language model services",
    risk: "High",
    status: "Under Review",
    owner: "AI Governance",
    contact: "Vendor Management",
    lastReview: "2026-09-10",
    nextReview: "2026-11-10",
    contractExpiry: "2027-03-31",
    securityReviewed: true,
    privacyReviewed: false,
    aiReviewed: false,
    documents: 3,
    notes: "Privacy and responsible AI review needs to be completed.",
  },
  {
    id: "VEN-003",
    name: "Cloud Infrastructure Partner",
    category: "Cloud Infrastructure",
    service: "Compute, networking, and hosting",
    risk: "High",
    status: "Approved",
    owner: "Infrastructure Team",
    contact: "Cloud Operations",
    lastReview: "2026-10-05",
    nextReview: "2027-01-05",
    contractExpiry: "2027-12-31",
    securityReviewed: true,
    privacyReviewed: true,
    aiReviewed: true,
    documents: 7,
    notes: "Infrastructure provider supporting application workloads.",
  },
  {
    id: "VEN-004",
    name: "Analytics Partner",
    category: "Analytics",
    service: "Product analytics and reporting",
    risk: "Medium",
    status: "Approved",
    owner: "Product Team",
    contact: "Analytics Operations",
    lastReview: "2026-10-20",
    nextReview: "2027-04-20",
    contractExpiry: "2027-09-30",
    securityReviewed: true,
    privacyReviewed: true,
    aiReviewed: false,
    documents: 4,
    notes: "Review data collection, retention, and access permissions periodically.",
  },
  {
    id: "VEN-005",
    name: "Legacy Data Processor",
    category: "Data Processing",
    service: "Business data processing",
    risk: "Critical",
    status: "Restricted",
    owner: "Security Team",
    contact: "Vendor Risk Office",
    lastReview: "2026-08-12",
    nextReview: "2026-10-12",
    contractExpiry: "2026-12-31",
    securityReviewed: false,
    privacyReviewed: false,
    aiReviewed: false,
    documents: 1,
    notes: "Outstanding security and privacy evidence. Do not assume approval.",
  },
];

const riskClass: Record<RiskLevel, string> = {
  Low: "risk-low",
  Medium: "risk-medium",
  High: "risk-high",
  Critical: "risk-critical",
};

const statusClass: Record<VendorStatus, string> = {
  Approved: "approved",
  "Under Review": "review",
  Restricted: "restricted",
};

function reviewStatus(date: string): ReviewStatus {
  if (!date || date === "Not scheduled") return "Overdue";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const reviewDate = new Date(`${date}T00:00:00`);
  const days = Math.ceil(
    (reviewDate.getTime() - today.getTime()) / 86400000
  );

  if (days < 0) return "Overdue";
  if (days <= 30) return "Due Soon";
  return "Current";
}

export default function VendorCompliancePage() {
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [reviewFilter, setReviewFilter] = useState("All");
  const [activeTab, setActiveTab] = useState<
    "vendors" | "reviews" | "documents"
  >("vendors");
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<Vendor | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const [form, setForm] = useState({
    name: "",
    category: "AI Provider",
    service: "",
    risk: "Medium" as RiskLevel,
    owner: "",
    contact: "",
    nextReview: "",
    contractExpiry: "",
    notes: "",
  });

  const categories = Array.from(
    new Set(vendors.map((vendor) => vendor.category))
  );

  const filteredVendors = useMemo(() => {
    const query = search.toLowerCase();

    return vendors.filter((vendor) => {
      const searchable = [
        vendor.id,
        vendor.name,
        vendor.category,
        vendor.service,
        vendor.owner,
        vendor.contact,
      ]
        .join(" ")
        .toLowerCase();

      const review = reviewStatus(vendor.nextReview);

      return (
        searchable.includes(query) &&
        (riskFilter === "All" || vendor.risk === riskFilter) &&
        (statusFilter === "All" || vendor.status === statusFilter) &&
        (categoryFilter === "All" || vendor.category === categoryFilter) &&
        (reviewFilter === "All" || review === reviewFilter)
      );
    });
  }, [
    vendors,
    search,
    riskFilter,
    statusFilter,
    categoryFilter,
    reviewFilter,
  ]);

  const approvedCount = vendors.filter(
    (vendor) => vendor.status === "Approved"
  ).length;

  const highRiskCount = vendors.filter(
    (vendor) => vendor.risk === "High" || vendor.risk === "Critical"
  ).length;

  const pendingCount = vendors.filter(
    (vendor) => vendor.status === "Under Review"
  ).length;

  const overdueCount = vendors.filter(
    (vendor) => reviewStatus(vendor.nextReview) === "Overdue"
  ).length;

  const totalDocuments = vendors.reduce(
    (sum, vendor) => sum + vendor.documents,
    0
  );

  const completeReviews = vendors.filter(
    (vendor) =>
      vendor.securityReviewed &&
      vendor.privacyReviewed &&
      vendor.aiReviewed
  ).length;

  function addVendor(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const vendor: Vendor = {
      id: `VEN-${String(Date.now()).slice(-5)}`,
      name: form.name.trim(),
      category: form.category,
      service: form.service.trim(),
      risk: form.risk,
      status: "Under Review",
      owner: form.owner.trim() || "Unassigned",
      contact: form.contact.trim() || "Not provided",
      lastReview: "Not reviewed",
      nextReview: form.nextReview || "Not scheduled",
      contractExpiry: form.contractExpiry || "Not provided",
      securityReviewed: false,
      privacyReviewed: false,
      aiReviewed: false,
      documents: 0,
      notes: form.notes.trim(),
    };

    setVendors((current) => [vendor, ...current]);
    setShowForm(false);
    setForm({
      name: "",
      category: "AI Provider",
      service: "",
      risk: "Medium",
      owner: "",
      contact: "",
      nextReview: "",
      contractExpiry: "",
      notes: "",
    });
    setNotice("Vendor added to the local compliance register.");
  }

  function updateVendor(id: string, updates: Partial<Vendor>) {
    setVendors((current) =>
      current.map((vendor) =>
        vendor.id === id ? { ...vendor, ...updates } : vendor
      )
    );

    setSelected((current) =>
      current?.id === id ? { ...current, ...updates } : current
    );
  }

  function deleteVendor(id: string) {
    setVendors((current) =>
      current.filter((vendor) => vendor.id !== id)
    );
    setSelected(null);
    setMenuId(null);
    setNotice("Vendor removed from the local register.");
  }

  function exportCSV() {
    const headers = [
      "ID",
      "Vendor",
      "Category",
      "Service",
      "Risk",
      "Status",
      "Owner",
      "Contact",
      "Last Review",
      "Next Review",
      "Contract Expiry",
      "Security Reviewed",
      "Privacy Reviewed",
      "AI Reviewed",
      "Documents",
    ];

    const rows = filteredVendors.map((vendor) => [
      vendor.id,
      vendor.name,
      vendor.category,
      vendor.service,
      vendor.risk,
      vendor.status,
      vendor.owner,
      vendor.contact,
      vendor.lastReview,
      vendor.nextReview,
      vendor.contractExpiry,
      vendor.securityReviewed ? "Yes" : "No",
      vendor.privacyReviewed ? "Yes" : "No",
      vendor.aiReviewed ? "Yes" : "No",
      vendor.documents,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(value).replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" })
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "modelnow-vendor-compliance.csv";
    link.click();
    URL.revokeObjectURL(url);
    setNotice("Vendor compliance register exported.");
  }

  function toggleReview(
    vendor: Vendor,
    field: "securityReviewed" | "privacyReviewed" | "aiReviewed"
  ) {
    updateVendor(vendor.id, { [field]: !vendor[field] });
    setNotice("Vendor review checklist updated in the local demo.");
  }

  return (
    <main className="vendor-page">
      <header className="page-header">
        <div>
          <div className="breadcrumb">
            Admin <span>/</span> Compliance <span>/</span> Vendor Compliance
          </div>
          <h1>Vendor Compliance</h1>
          <p>
            Assess third-party providers, track due diligence, manage vendor
            risk, and monitor compliance evidence.
          </p>
        </div>

        <div className="header-actions">
          <button className="secondary-button" onClick={exportCSV}>
            <Download size={16} /> Export CSV
          </button>
          <button
            className="primary-button"
            onClick={() => setShowForm(true)}
          >
            <Plus size={17} /> Add Vendor
          </button>
        </div>
      </header>

      {notice && (
        <div className="notice">
          <CheckCircle2 size={17} />
          <span>{notice}</span>
          <button onClick={() => setNotice("")} aria-label="Dismiss notice">
            <X size={16} />
          </button>
        </div>
      )}

      <section className="stats-grid">
        <StatCard
          icon={<Building2 size={20} />}
          label="Registered Vendors"
          value={vendors.length}
          note="Third-party providers"
          color="blue"
        />
        <StatCard
          icon={<ShieldCheck size={20} />}
          label="Approved Vendors"
          value={approvedCount}
          note="Marked approved"
          color="green"
        />
        <StatCard
          icon={<AlertTriangle size={20} />}
          label="High / Critical Risk"
          value={highRiskCount}
          note="Require appropriate review"
          color="red"
        />
        <StatCard
          icon={<Clock3 size={20} />}
          label="Overdue Reviews"
          value={overdueCount}
          note={`${pendingCount} vendors under review`}
          color="amber"
        />
      </section>

      <section className="overview-grid">
        <div className="overview-card">
          <div className="overview-icon blue">
            <FileText size={21} />
          </div>
          <div className="overview-content">
            <span>Evidence Documents</span>
            <strong>{totalDocuments}</strong>
            <small>Document count recorded in inventory</small>
          </div>
        </div>

        <div className="overview-card">
          <div className="overview-icon green">
            <CheckCircle2 size={21} />
          </div>
          <div className="overview-content">
            <span>Review Checklist Complete</span>
            <strong>
              {completeReviews}/{vendors.length}
            </strong>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: `${
                    vendors.length
                      ? (completeReviews / vendors.length) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="overview-card">
          <div className="overview-icon amber">
            <CalendarDays size={21} />
          </div>
          <div className="overview-content">
            <span>Upcoming Reviews</span>
            <strong>
              {
                vendors.filter(
                  (vendor) =>
                    reviewStatus(vendor.nextReview) === "Due Soon"
                ).length
              }
            </strong>
            <small>Due within the next 30 days</small>
          </div>
        </div>
      </section>

      <nav className="tabs">
        <Tab
          active={activeTab === "vendors"}
          onClick={() => setActiveTab("vendors")}
          label="Vendor Register"
          count={vendors.length}
        />
        <Tab
          active={activeTab === "reviews"}
          onClick={() => setActiveTab("reviews")}
          label="Due Diligence"
        />
        <Tab
          active={activeTab === "documents"}
          onClick={() => setActiveTab("documents")}
          label="Evidence Register"
          count={totalDocuments}
        />
      </nav>

      {activeTab === "vendors" && (
        <section className="content-card">
          <div className="section-heading">
            <div>
              <h2>Third-Party Vendor Register</h2>
              <p>
                Maintain vendor ownership, risk classification, and approval
                status.
              </p>
            </div>
            <span className="record-count">
              {filteredVendors.length} vendors
            </span>
          </div>

          <div className="filters">
            <div className="search-box">
              <Search size={17} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search vendor, service, owner..."
              />
            </div>

            <div className="filter-box">
              <Filter size={15} />
              <select
                value={riskFilter}
                onChange={(event) => setRiskFilter(event.target.value)}
              >
                <option>All</option>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </div>

            <select
              className="status-select"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option>All</option>
              <option>Approved</option>
              <option>Under Review</option>
              <option>Restricted</option>
            </select>

            <select
              className="status-select"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option>All</option>
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>

            <select
              className="status-select"
              value={reviewFilter}
              onChange={(event) => setReviewFilter(event.target.value)}
            >
              <option>All</option>
              <option>Current</option>
              <option>Due Soon</option>
              <option>Overdue</option>
            </select>
          </div>

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Service</th>
                  <th>Risk</th>
                  <th>Next review</th>
                  <th>Review status</th>
                  <th>Owner</th>
                  <th>Approval</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filteredVendors.map((vendor) => {
                  const review = reviewStatus(vendor.nextReview);

                  return (
                    <tr key={vendor.id}>
                      <td>
                        <button
                          className="vendor-name"
                          onClick={() => setSelected(vendor)}
                        >
                          <span className="vendor-icon">
                            <Building2 size={18} />
                          </span>
                          <span>
                            <strong>{vendor.name}</strong>
                            <small>
                              {vendor.id} · {vendor.category}
                            </small>
                          </span>
                        </button>
                      </td>
                      <td className="service-cell">{vendor.service}</td>
                      <td>
                        <span className={`risk-badge ${riskClass[vendor.risk]}`}>
                          {vendor.risk}
                        </span>
                      </td>
                      <td>{vendor.nextReview}</td>
                      <td>
                        <span
                          className={`review-badge ${
                            review === "Current"
                              ? "current"
                              : review === "Due Soon"
                                ? "due-soon"
                                : "overdue"
                          }`}
                        >
                          {review === "Current" ? (
                            <CheckCircle2 size={13} />
                          ) : (
                            <Clock3 size={13} />
                          )}
                          {review}
                        </span>
                      </td>
                      <td>{vendor.owner}</td>
                      <td>
                        <span className={`status-badge ${statusClass[vendor.status]}`}>
                          <span className="status-dot" />
                          {vendor.status}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button
                          className="icon-button"
                          aria-label="Vendor actions"
                          onClick={() =>
                            setMenuId(menuId === vendor.id ? null : vendor.id)
                          }
                        >
                          <MoreHorizontal size={19} />
                        </button>

                        {menuId === vendor.id && (
                          <div className="row-menu">
                            <button
                              onClick={() => {
                                setSelected(vendor);
                                setMenuId(null);
                              }}
                            >
                              <Eye size={15} /> View details
                            </button>
                            {(
                              [
                                "Approved",
                                "Under Review",
                                "Restricted",
                              ] as VendorStatus[]
                            )
                              .filter((status) => status !== vendor.status)
                              .map((status) => (
                                <button
                                  key={status}
                                  onClick={() => {
                                    updateVendor(vendor.id, { status });
                                    setMenuId(null);
                                    setNotice(
                                      `Vendor status changed to ${status}.`
                                    );
                                  }}
                                >
                                  <RefreshCw size={15} /> Mark {status}
                                </button>
                              ))}
                            <button
                              className="delete-action"
                              onClick={() => deleteVendor(vendor.id)}
                            >
                              <Trash2 size={15} /> Remove vendor
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filteredVendors.length === 0 && (
                  <tr>
                    <td colSpan={8} className="empty-state">
                      No vendors match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            <span>
              Showing {filteredVendors.length} of {vendors.length} vendors
            </span>
            <span>Vendor Compliance · ModelNow</span>
          </div>
        </section>
      )}

      {activeTab === "reviews" && (
        <section className="content-card">
          <div className="section-heading">
            <div>
              <h2>Vendor Due Diligence</h2>
              <p>
                Track security, privacy, and AI governance review completion.
              </p>
            </div>
            <span className="record-count">
              {completeReviews} complete
            </span>
          </div>

          <div className="review-list">
            {vendors.map((vendor) => {
              const checks = [
                {
                  label: "Security assessment",
                  field: "securityReviewed" as const,
                },
                {
                  label: "Privacy assessment",
                  field: "privacyReviewed" as const,
                },
                {
                  label: "AI governance review",
                  field: "aiReviewed" as const,
                },
              ];

              const completed = checks.filter(
                (check) => vendor[check.field]
              ).length;

              return (
                <article className="review-card" key={vendor.id}>
                  <div className="review-card-header">
                    <div className="vendor-icon">
                      <Building2 size={19} />
                    </div>
                    <div className="review-card-title">
                      <strong>{vendor.name}</strong>
                      <span>
                        {vendor.id} · {vendor.category}
                      </span>
                    </div>
                    <span className={`risk-badge ${riskClass[vendor.risk]}`}>
                      {vendor.risk} risk
                    </span>
                  </div>

                  <div className="review-progress-header">
                    <span>Review checklist</span>
                    <strong>{completed}/3 completed</strong>
                  </div>

                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${(completed / 3) * 100}%` }}
                    />
                  </div>

                  <div className="checklist">
                    {checks.map((check) => (
                      <label className="check-item" key={check.field}>
                        <input
                          type="checkbox"
                          checked={vendor[check.field]}
                          onChange={() => toggleReview(vendor, check.field)}
                        />
                        <span>{check.label}</span>
                      </label>
                    ))}
                  </div>

                  <div className="review-card-footer">
                    <span>
                      <CalendarDays size={14} />
                      Next review: {vendor.nextReview}
                    </span>
                    <button
                      className="small-action"
                      onClick={() => setSelected(vendor)}
                    >
                      Vendor details <ChevronRight size={14} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {activeTab === "documents" && (
        <section className="content-card">
          <div className="section-heading">
            <div>
              <h2>Vendor Evidence Register</h2>
              <p>
                Review recorded evidence counts and outstanding documentation.
              </p>
            </div>
            <span className="record-count">
              {totalDocuments} recorded documents
            </span>
          </div>

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Risk</th>
                  <th>Evidence count</th>
                  <th>Security</th>
                  <th>Privacy</th>
                  <th>AI governance</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((vendor) => (
                  <tr key={vendor.id}>
                    <td>
                      <div className="document-vendor">
                        <span className="document-icon">
                          <FileText size={17} />
                        </span>
                        <span>
                          <strong>{vendor.name}</strong>
                          <small>{vendor.id}</small>
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`risk-badge ${riskClass[vendor.risk]}`}>
                        {vendor.risk}
                      </span>
                    </td>
                    <td>
                      <strong className="document-count">
                        {vendor.documents}
                      </strong>
                    </td>
                    <td>
                      <CheckCell value={vendor.securityReviewed} />
                    </td>
                    <td>
                      <CheckCell value={vendor.privacyReviewed} />
                    </td>
                    <td>
                      <CheckCell value={vendor.aiReviewed} />
                    </td>
                    <td>
                      <button
                        className="small-action"
                        onClick={() => setSelected(vendor)}
                      >
                        Review <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="evidence-note">
            <FileText size={17} />
            <span>
              Document counts are sample metadata only. This page does not
              upload, store, or validate actual vendor certificates or contracts.
            </span>
          </div>
        </section>
      )}

      <section className="bottom-grid">
        <InfoCard
          icon={<ShieldCheck size={20} />}
          title="Third-party security"
          description="Track vendor security assessments, access controls, and outstanding evidence."
          color="blue-bg"
        />
        <InfoCard
          icon={<LockKeyholeIcon />}
          title="Privacy and data handling"
          description="Review data processing, retention, privacy obligations, and applicable agreements."
          color="amber-bg"
        />
        <InfoCard
          icon={<FileText size={20} />}
          title="Audit readiness"
          description="Maintain vendor review records and organize evidence for internal audits."
          color="green-bg"
        />
      </section>

      {showForm && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowForm(false);
          }}
        >
          <section className="modal">
            <div className="modal-heading">
              <div>
                <h2>Add Vendor</h2>
                <p>Register a third-party service provider.</p>
              </div>
              <button
                className="icon-button"
                onClick={() => setShowForm(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={addVendor}>
              <label>
                Vendor name *
                <input
                  required
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="Enter vendor name"
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
                    <option>AI Provider</option>
                    <option>Cloud Infrastructure</option>
                    <option>Data Processing</option>
                    <option>Analytics</option>
                    <option>Security</option>
                    <option>Software</option>
                    <option>Consulting</option>
                    <option>Other</option>
                  </select>
                </label>

                <label>
                  Risk level
                  <select
                    value={form.risk}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        risk: event.target.value as RiskLevel,
                      })
                    }
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </label>
              </div>

              <label>
                Service provided *
                <input
                  required
                  value={form.service}
                  onChange={(event) =>
                    setForm({ ...form, service: event.target.value })
                  }
                  placeholder="Describe the service"
                />
              </label>

              <div className="form-row">
                <label>
                  Internal owner
                  <input
                    value={form.owner}
                    onChange={(event) =>
                      setForm({ ...form, owner: event.target.value })
                    }
                    placeholder="Responsible team"
                  />
                </label>

                <label>
                  Vendor contact
                  <input
                    value={form.contact}
                    onChange={(event) =>
                      setForm({ ...form, contact: event.target.value })
                    }
                    placeholder="Contact or department"
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  Next review date
                  <input
                    type="date"
                    value={form.nextReview}
                    onChange={(event) =>
                      setForm({ ...form, nextReview: event.target.value })
                    }
                  />
                </label>

                <label>
                  Contract expiry
                  <input
                    type="date"
                    value={form.contractExpiry}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        contractExpiry: event.target.value,
                      })
                    }
                  />
                </label>
              </div>

              <label>
                Notes
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(event) =>
                    setForm({ ...form, notes: event.target.value })
                  }
                  placeholder="Due diligence notes and known risks"
                />
              </label>

              <div className="modal-footer">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  <Plus size={16} /> Add Vendor
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {selected && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <section className="modal detail-modal">
            <div className="modal-heading">
              <div>
                <span className="eyebrow">{selected.id}</span>
                <h2>{selected.name}</h2>
                <p>{selected.category} · {selected.service}</p>
              </div>
              <button
                className="icon-button"
                onClick={() => setSelected(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="detail-status">
              <span className={`risk-badge ${riskClass[selected.risk]}`}>
                {selected.risk} risk
              </span>
              <span className={`status-badge ${statusClass[selected.status]}`}>
                {selected.status}
              </span>
              <span
                className={`review-badge ${
                  reviewStatus(selected.nextReview) === "Current"
                    ? "current"
                    : reviewStatus(selected.nextReview) === "Due Soon"
                      ? "due-soon"
                      : "overdue"
                }`}
              >
                {reviewStatus(selected.nextReview)}
              </span>
            </div>

            <div className="detail-grid">
              <Detail label="Internal owner" value={selected.owner} />
              <Detail label="Vendor contact" value={selected.contact} />
              <Detail label="Last review" value={selected.lastReview} />
              <Detail label="Next review" value={selected.nextReview} />
              <Detail label="Contract expiry" value={selected.contractExpiry} />
              <Detail
                label="Recorded evidence count"
                value={String(selected.documents)}
              />
            </div>

            <div className="check-detail">
              <strong>Due diligence checklist</strong>
              {(
                [
                  ["Security assessment", "securityReviewed"],
                  ["Privacy assessment", "privacyReviewed"],
                  ["AI governance review", "aiReviewed"],
                ] as const
              ).map(([label, field]) => (
                <label className="check-item" key={field}>
                  <input
                    type="checkbox"
                    checked={selected[field]}
                    onChange={() => toggleReview(selected, field)}
                  />
                  <span>{label}</span>
                  <span className={selected[field] ? "check-done" : "check-open"}>
                    {selected[field] ? "Completed" : "Pending"}
                  </span>
                </label>
              ))}
            </div>

            <div className="description-box">
              <strong>Vendor notes</strong>
              <p>{selected.notes || "No notes recorded."}</p>
            </div>

            <div className="modal-footer">
              <button
                className="secondary-button"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
              {selected.status !== "Approved" && (
                <button
                  className="primary-button"
                  onClick={() => {
                    updateVendor(selected.id, { status: "Approved" });
                    setNotice(
                      "Vendor marked approved in the local demo. Confirm required reviews before real approval."
                    );
                  }}
                >
                  <CheckCircle2 size={15} /> Mark Approved
                </button>
              )}
            </div>
          </section>
        </div>
      )}

      <style jsx>{`
        .vendor-page {
          --text: #172033;
          --muted: #687386;
          --line: #e6eaf0;
          min-height: 100vh;
          padding: 30px;
          color: var(--text);
          background: #f7f9fc;
          font-family: Arial, Helvetica, sans-serif;
        }

        .page-header,
        .header-actions,
        .section-heading,
        .filters,
        .table-footer,
        .modal-heading,
        .modal-footer,
        .detail-status {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
        }

        .page-header {
          align-items: flex-start;
          margin-bottom: 24px;
        }

        .breadcrumb {
          margin-bottom: 12px;
          color: var(--muted);
          font-size: 12px;
        }

        .breadcrumb span {
          margin: 0 7px;
          color: #a4adba;
        }

        h1 {
          margin: 0;
          font-size: 28px;
          letter-spacing: -0.7px;
        }

        .page-header p,
        .section-heading p,
        .modal-heading p {
          margin: 8px 0 0;
          color: var(--muted);
          font-size: 13px;
          line-height: 1.6;
        }

        button,
        input,
        select,
        textarea {
          font: inherit;
        }

        button {
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
          font-weight: 600;
          white-space: nowrap;
        }

        .primary-button {
          color: white;
          background: #2459d3;
          border: 1px solid #2459d3;
        }

        .primary-button:hover {
          background: #1948b7;
        }

        .secondary-button {
          color: #354154;
          background: white;
          border: 1px solid #dce2ea;
        }

        .secondary-button:hover {
          background: #f5f7fa;
        }

        .notice {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
          padding: 12px 14px;
          color: #166534;
          background: #f0fdf4;
          border: 1px solid #bce7cc;
          border-radius: 9px;
          font-size: 12px;
        }

        .notice span {
          flex: 1;
        }

        .notice button {
          display: flex;
          color: inherit;
          background: transparent;
          border: 0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 16px;
        }

        .stat-card {
          display: flex;
          align-items: flex-start;
          gap: 13px;
          padding: 19px;
          background: white;
          border: 1px solid var(--line);
          border-radius: 12px;
        }

        .stat-icon,
        .overview-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 42px;
          height: 42px;
          border-radius: 9px;
        }

        .blue {
          color: #2856c7;
          background: #edf3ff;
        }

        .green {
          color: #16814a;
          background: #e9f9ef;
        }

        .amber {
          color: #ad6b0b;
          background: #fff6e5;
        }

        .red {
          color: #c34242;
          background: #fff0f0;
        }

        .stat-label {
          margin: 2px 0 8px;
          color: var(--muted);
          font-size: 12px;
        }

        .stat-value {
          font-size: 26px;
          font-weight: 700;
          letter-spacing: -0.7px;
        }

        .stat-note {
          margin-top: 7px;
          color: #8a94a4;
          font-size: 11px;
        }

        .overview-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 15px;
          margin-bottom: 22px;
        }

        .overview-card {
          display: flex;
          align-items: flex-start;
          gap: 13px;
          padding: 18px;
          background: white;
          border: 1px solid var(--line);
          border-radius: 11px;
        }

        .overview-icon {
          width: 40px;
          height: 40px;
        }

        .overview-content {
          flex: 1;
          min-width: 0;
        }

        .overview-content > span {
          display: block;
          color: #687386;
          font-size: 11px;
        }

        .overview-content > strong {
          display: block;
          margin: 7px 0;
          color: #172033;
          font-size: 23px;
        }

        .overview-content small {
          color: #8791a1;
          font-size: 10px;
        }

        .progress-track {
          height: 6px;
          overflow: hidden;
          background: #e9edf4;
          border-radius: 99px;
        }

        .progress-fill {
          height: 100%;
          background: #3567df;
          border-radius: inherit;
          transition: width 0.2s ease;
        }

        .tabs {
          display: flex;
          gap: 7px;
          margin-bottom: 16px;
          overflow-x: auto;
          padding-bottom: 2px;
        }

        .tabs button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 41px;
          padding: 0 13px;
          color: #667085;
          background: white;
          border: 1px solid var(--line);
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
        }

        .tabs button.active {
          color: #2459d3;
          background: #edf3ff;
          border-color: #bfd0ff;
        }

        .tabs button span {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 21px;
          height: 21px;
          padding: 0 5px;
          color: #687386;
          background: #f0f2f6;
          border-radius: 5px;
          font-size: 10px;
        }

        .content-card {
          min-width: 0;
          background: white;
          border: 1px solid var(--line);
          border-radius: 12px;
        }

        .section-heading {
          padding: 21px 22px;
        }

        .section-heading h2,
        .modal-heading h2 {
          margin: 0;
          font-size: 16px;
        }

        .record-count {
          padding: 6px 9px;
          color: #596579;
          border: 1px solid var(--line);
          border-radius: 7px;
          font-size: 11px;
          white-space: nowrap;
        }

        .filters {
          justify-content: flex-start;
          flex-wrap: wrap;
          padding: 0 22px 19px;
        }

        .search-box,
        .filter-box {
          display: flex;
          align-items: center;
          gap: 9px;
          min-height: 38px;
          padding: 0 11px;
          color: #758196;
          background: white;
          border: 1px solid #dfe5ed;
          border-radius: 8px;
        }

        .search-box {
          flex: 1;
          min-width: 220px;
        }

        .search-box input {
          width: 100%;
          min-width: 0;
          color: var(--text);
          background: transparent;
          border: 0;
          outline: 0;
          font-size: 12px;
        }

        .filter-box select,
        .status-select {
          color: #435066;
          background: white;
          border: 0;
          outline: 0;
          font-size: 12px;
        }

        .status-select {
          min-height: 38px;
          padding: 0 12px;
          border: 1px solid #dfe5ed;
          border-radius: 8px;
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

        th {
          padding: 12px 14px;
          color: #758196;
          background: #f8fafc;
          border-top: 1px solid var(--line);
          border-bottom: 1px solid var(--line);
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.45px;
        }

        th:first-child,
        td:first-child {
          padding-left: 22px;
        }

        td {
          position: relative;
          padding: 14px;
          color: #475467;
          border-bottom: 1px solid #edf0f4;
          font-size: 11px;
        }

        tbody tr:last-child td {
          border-bottom: 0;
        }

        tbody tr:hover {
          background: #fbfcfe;
        }

        .vendor-name {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0;
          color: inherit;
          text-align: left;
          background: transparent;
          border: 0;
        }

        .vendor-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 36px;
          height: 36px;
          color: #3764c9;
          background: #edf3ff;
          border-radius: 9px;
        }

        .vendor-name strong,
        .document-vendor strong {
          display: block;
          color: #263248;
          font-size: 11px;
          font-weight: 600;
        }

        .vendor-name small,
        .document-vendor small {
          display: block;
          margin-top: 5px;
          color: #8b95a5;
          font-size: 10px;
        }

        .service-cell {
          max-width: 200px;
          white-space: normal;
          line-height: 1.5;
        }

        .risk-badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 8px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 600;
        }

        .risk-low {
          color: #16814a;
          background: #e9f9ef;
        }

        .risk-medium {
          color: #8c650d;
          background: #fff6df;
        }

        .risk-high {
          color: #b45309;
          background: #fff0df;
        }

        .risk-critical {
          color: #bf3c3c;
          background: #fff0f0;
        }

        .review-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 8px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 600;
        }

        .current {
          color: #16814a;
          background: #e9f9ef;
        }

        .due-soon {
          color: #a16207;
          background: #fff6df;
        }

        .overdue {
          color: #bf3c3c;
          background: #fff0f0;
        }

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
          background: currentColor;
          border-radius: 50%;
        }

        .approved {
          color: #16814a;
          background: #e9f9ef;
        }

        .review {
          color: #2856c7;
          background: #edf3ff;
        }

        .restricted {
          color: #bf3c3c;
          background: #fff0f0;
        }

        .actions-cell {
          text-align: right;
        }

        .icon-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 33px;
          height: 33px;
          color: #667085;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 7px;
        }

        .icon-button:hover {
          background: #f7f9fc;
          border-color: var(--line);
        }

        .row-menu {
          position: absolute;
          z-index: 10;
          top: 47px;
          right: 12px;
          width: 175px;
          max-height: 280px;
          overflow-y: auto;
          padding: 5px;
          background: white;
          border: 1px solid var(--line);
          border-radius: 9px;
          box-shadow: 0 10px 30px #17203318;
        }

        .row-menu button {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 9px;
          color: #475467;
          text-align: left;
          background: white;
          border: 0;
          border-radius: 6px;
          font-size: 11px;
        }

        .row-menu button:hover {
          background: #f4f6fa;
        }

        .row-menu .delete-action {
          color: #c34242;
          border-top: 1px solid #edf0f4;
        }

        .empty-state {
          padding: 40px 20px;
          color: #8791a1;
          text-align: center;
        }

        .table-footer {
          padding: 14px 22px;
          color: #8791a1;
          border-top: 1px solid var(--line);
          font-size: 10px;
        }

        .review-list {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
          padding: 0 22px 22px;
        }

        .review-card {
          min-width: 0;
          padding: 17px;
          border: 1px solid var(--line);
          border-radius: 10px;
        }

        .review-card-header {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .review-card-title {
          flex: 1;
          min-width: 0;
        }

        .review-card-title strong {
          display: block;
          overflow-wrap: anywhere;
          color: #263248;
          font-size: 12px;
        }

        .review-card-title span {
          display: block;
          margin-top: 5px;
          color: #8791a1;
          font-size: 10px;
        }

        .review-progress-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin: 20px 0 10px;
          color: #687386;
          font-size: 10px;
        }

        .review-progress-header strong {
          color: #344054;
        }

        .checklist {
          display: grid;
          gap: 12px;
          margin-top: 18px;
        }

        .check-item {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #475467;
          font-size: 11px;
        }

        .check-item input {
          width: 15px;
          height: 15px;
          accent-color: #2459d3;
          cursor: pointer;
        }

        .review-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 18px;
          padding-top: 13px;
          border-top: 1px solid #edf0f4;
        }

        .review-card-footer > span {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #8791a1;
          font-size: 10px;
        }

        .document-vendor {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .document-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 35px;
          height: 35px;
          color: #3764c9;
          background: #edf3ff;
          border-radius: 8px;
        }

        .document-count {
          color: #344054;
          font-size: 14px;
        }

        .evidence-note {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin: 18px;
          padding: 13px;
          color: #8b620f;
          background: #fff9e9;
          border: 1px solid #f5e4b4;
          border-radius: 8px;
          font-size: 11px;
          line-height: 1.7;
        }

        .evidence-note svg {
          flex-shrink: 0;
        }

        .bottom-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
          margin-top: 20px;
        }

        .info-card {
          padding: 20px;
        }

        .info-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 39px;
          height: 39px;
          margin-bottom: 15px;
          border-radius: 9px;
        }

        .blue-bg {
          color: #2856c7;
          background: #edf3ff;
        }

        .amber-bg {
          color: #ad6b0b;
          background: #fff6e5;
        }

        .green-bg {
          color: #16814a;
          background: #e9f9ef;
        }

        .info-card h3 {
          margin: 0 0 8px;
          font-size: 13px;
        }

        .info-card p {
          margin: 0;
          color: var(--muted);
          font-size: 11px;
          line-height: 1.7;
        }

        .modal-backdrop {
          position: fixed;
          z-index: 100;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow-y: auto;
          padding: 20px;
          background: #10182875;
        }

        .modal {
          width: 100%;
          max-width: 590px;
          max-height: calc(100vh - 40px);
          overflow-y: auto;
          padding: 24px;
          background: white;
          border-radius: 14px;
          box-shadow: 0 20px 70px #10182830;
        }

        .modal-heading {
          align-items: flex-start;
          margin-bottom: 22px;
        }

        .modal form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .modal label:not(.check-item) {
          display: flex;
          flex-direction: column;
          gap: 7px;
          color: #344054;
          font-size: 11px;
          font-weight: 600;
        }

        .modal label input:not([type="checkbox"]),
        .modal label select,
        .modal label textarea {
          box-sizing: border-box;
          width: 100%;
          padding: 11px 12px;
          color: #263248;
          background: white;
          border: 1px solid #dce2ea;
          border-radius: 8px;
          outline: none;
          font-size: 12px;
        }

        .modal label input:focus,
        .modal label select:focus,
        .modal label textarea:focus {
          border-color: #4778e8;
          box-shadow: 0 0 0 3px #4778e81a;
        }

        .modal label textarea {
          resize: vertical;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 13px;
        }

        .modal-footer {
          justify-content: flex-end;
          margin-top: 8px;
          padding-top: 17px;
          border-top: 1px solid var(--line);
        }

        .detail-status {
          justify-content: flex-start;
          flex-wrap: wrap;
          margin-bottom: 18px;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .detail-item {
          min-width: 0;
          padding: 13px;
          border: 1px solid var(--line);
          border-radius: 8px;
        }

        .detail-item span {
          display: block;
          margin-bottom: 7px;
          color: #8791a1;
          font-size: 10px;
        }

        .detail-item strong {
          display: block;
          overflow-wrap: anywhere;
          color: #344054;
          font-size: 12px;
        }

        .check-detail {
          display: grid;
          gap: 14px;
          margin-top: 18px;
          padding: 15px;
          border: 1px solid var(--line);
          border-radius: 9px;
        }

        .check-detail > strong {
          margin-bottom: 2px;
          font-size: 12px;
        }

        .check-done,
        .check-open {
          margin-left: auto;
          font-size: 10px;
        }

        .check-done {
          color: #16814a;
        }

        .check-open {
          color: #a16207;
        }

        .description-box {
          margin-top: 15px;
          padding: 15px;
          background: #f7f9fc;
          border-radius: 9px;
        }

        .description-box strong {
          font-size: 12px;
        }

        .description-box p {
          margin: 8px 0 0;
          color: #687386;
          font-size: 12px;
          line-height: 1.7;
        }

        .eyebrow {
          display: block;
          margin-bottom: 8px;
          color: #2459d3;
          font-size: 10px;
          font-weight: 700;
        }

        @media (max-width: 1050px) {
          .review-list {
            grid-template-columns: 1fr;
          }

          .bottom-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 750px) {
          .vendor-page {
            padding: 17px;
          }

          .page-header {
            flex-direction: column;
          }

          .header-actions {
            width: 100%;
            flex-wrap: wrap;
          }

          .stats-grid {
            grid-template-columns: 1fr 1fr;
            gap: 9px;
          }

          .stat-card {
            gap: 9px;
            padding: 13px;
          }

          .stat-icon {
            width: 34px;
            height: 34px;
          }

          .stat-value {
            font-size: 22px;
          }

          .overview-grid {
            grid-template-columns: 1fr;
            gap: 9px;
          }

          .section-heading {
            align-items: flex-start;
            padding: 17px;
          }

          .filters {
            padding: 0 17px 17px;
          }

          .search-box {
            flex-basis: 100%;
          }

          .review-list {
            padding: 0 17px 17px;
          }

          .form-row,
          .detail-grid {
            grid-template-columns: 1fr;
          }

          .table-footer {
            align-items: flex-start;
            flex-direction: column;
          }

          .modal {
            padding: 18px;
          }
        }
      `}</style>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  note,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  note: string;
  color: string;
}) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>{icon}</div>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        <div className="stat-note">{note}</div>
      </div>
      <style jsx>{`
        .stat-card {
          display: flex;
          align-items: flex-start;
          gap: 13px;
          padding: 19px;
          background: white;
          border: 1px solid #e6eaf0;
          border-radius: 12px;
        }

        .stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 42px;
          height: 42px;
          border-radius: 9px;
        }

        .blue {
          color: #2856c7;
          background: #edf3ff;
        }

        .green {
          color: #16814a;
          background: #e9f9ef;
        }

        .amber {
          color: #ad6b0b;
          background: #fff6e5;
        }

        .red {
          color: #c34242;
          background: #fff0f0;
        }

        .stat-label {
          margin: 2px 0 8px;
          color: #687386;
          font-size: 12px;
        }

        .stat-value {
          font-size: 26px;
          font-weight: 700;
          letter-spacing: -0.7px;
        }

        .stat-note {
          margin-top: 7px;
          color: #8a94a4;
          font-size: 11px;
        }

        @media (max-width: 750px) {
          .stat-card {
            gap: 9px;
            padding: 13px;
          }

          .stat-icon {
            width: 34px;
            height: 34px;
          }

          .stat-value {
            font-size: 22px;
          }
        }
      `}</style>
    </div>
  );
}

function Tab({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
}) {
  return (
    <button className={`tab-button ${active ? "active" : ""}`} onClick={onClick}>
      {label}
      {count !== undefined && <span>{count}</span>}
      <style jsx>{`
        .tab-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 41px;
          padding: 0 13px;
          color: #667085;
          background: white;
          border: 1px solid #e6eaf0;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
          cursor: pointer;
        }

        .tab-button.active {
          color: #2459d3;
          background: #edf3ff;
          border-color: #bfd0ff;
        }

        .tab-button span {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 21px;
          height: 21px;
          padding: 0 5px;
          color: #687386;
          background: #f0f2f6;
          border-radius: 5px;
          font-size: 10px;
        }
      `}</style>
    </button>
  );
}

function InfoCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="content-card info-card">
      <span className={`info-icon ${color}`}>{icon}</span>
      <h3>{title}</h3>
      <p>{description}</p>
      <style jsx>{`
        .info-card {
          padding: 20px;
          background: white;
          border: 1px solid #e6eaf0;
          border-radius: 12px;
        }

        .info-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 39px;
          height: 39px;
          margin-bottom: 15px;
          border-radius: 9px;
        }

        .blue-bg {
          color: #2856c7;
          background: #edf3ff;
        }

        .amber-bg {
          color: #ad6b0b;
          background: #fff6e5;
        }

        .green-bg {
          color: #16814a;
          background: #e9f9ef;
        }

        h3 {
          margin: 0 0 8px;
          font-size: 13px;
        }

        p {
          margin: 0;
          color: #687386;
          font-size: 11px;
          line-height: 1.7;
        }
      `}</style>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-item">
      <span>{label}</span>
      <strong>{value || "Not set"}</strong>
      <style jsx>{`
        .detail-item {
          min-width: 0;
          padding: 13px;
          border: 1px solid #e6eaf0;
          border-radius: 8px;
        }

        span {
          display: block;
          margin-bottom: 7px;
          color: #8791a1;
          font-size: 10px;
        }

        strong {
          display: block;
          overflow-wrap: anywhere;
          color: #344054;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}

function LockKeyholeIcon() {
  return <ShieldCheck size={20} />;
}

function CheckCell({ value }: { value: boolean }) {
  return (
    <span className={`check-cell ${value ? "check-yes" : "check-no"}`}>
      {value ? <CheckCircle2 size={15} /> : <Clock3 size={15} />}
      {value ? "Complete" : "Pending"}
      <style jsx>{`
        .check-cell {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
        }

        .check-yes {
          color: #16814a;
        }

        .check-no {
          color: #a16207;
        }
      `}</style>
    </span>
  );
}
