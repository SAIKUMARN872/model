
"use client";

import { useMemo, useState } from "react";
import {
  Scale,
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
  Bell,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

type RegulationStatus =
  | "Compliant"
  | "In Progress"
  | "Needs Review"
  | "Non-Compliant";

type RegulationPriority = "Low" | "Medium" | "High" | "Critical";

type Regulation = {
  id: string;
  name: string;
  authority: string;
  region: string;
  category: string;
  priority: RegulationPriority;
  status: RegulationStatus;
  owner: string;
  effectiveDate: string;
  reviewDate: string;
  lastUpdated: string;
  requirements: number;
  mappedRequirements: number;
  description: string;
  notes: string;
};

const initialRegulations: Regulation[] = [
  {
    id: "REG-001",
    name: "General Data Protection Regulation",
    authority: "European Union",
    region: "European Economic Area",
    category: "Data Privacy",
    priority: "Critical",
    status: "In Progress",
    owner: "Privacy Team",
    effectiveDate: "2018-05-25",
    reviewDate: "2026-12-15",
    lastUpdated: "2026-10-20",
    requirements: 12,
    mappedRequirements: 10,
    description:
      "Establishes requirements for processing personal data and protecting the rights of individuals in scope.",
    notes: "Validate lawful basis, data subject rights, retention, and processor agreements.",
  },
  {
    id: "REG-002",
    name: "EU Artificial Intelligence Act",
    authority: "European Union",
    region: "European Union",
    category: "AI Governance",
    priority: "Critical",
    status: "Needs Review",
    owner: "AI Governance",
    effectiveDate: "2024-08-01",
    reviewDate: "2026-11-20",
    lastUpdated: "2026-10-25",
    requirements: 15,
    mappedRequirements: 9,
    description:
      "Establishes a risk-based regulatory framework for artificial intelligence systems.",
    notes: "Determine system classification and verify obligations against applicable implementation dates.",
  },
  {
    id: "REG-003",
    name: "SOC 2 Trust Services Criteria",
    authority: "AICPA",
    region: "United States / Global",
    category: "Security Assurance",
    priority: "High",
    status: "Compliant",
    owner: "Security Team",
    effectiveDate: "2022-01-01",
    reviewDate: "2027-01-15",
    lastUpdated: "2026-10-18",
    requirements: 10,
    mappedRequirements: 10,
    description:
      "A framework used to assess controls relevant to security, availability, processing integrity, confidentiality, and privacy.",
    notes: "Maintain evidence and coordinate periodic control testing.",
  },
  {
    id: "REG-004",
    name: "ISO/IEC 27001",
    authority: "International Organization for Standardization",
    region: "International",
    category: "Information Security",
    priority: "High",
    status: "In Progress",
    owner: "Information Security",
    effectiveDate: "2022-10-25",
    reviewDate: "2026-12-10",
    lastUpdated: "2026-10-22",
    requirements: 14,
    mappedRequirements: 11,
    description:
      "Specifies requirements for establishing and continually improving an information security management system.",
    notes: "Review control evidence, risk treatment, and management review records.",
  },
  {
    id: "REG-005",
    name: "California Consumer Privacy Act",
    authority: "California Privacy Protection Agency",
    region: "California, United States",
    category: "Data Privacy",
    priority: "High",
    status: "Needs Review",
    owner: "Legal & Privacy",
    effectiveDate: "2020-01-01",
    reviewDate: "2026-11-12",
    lastUpdated: "2026-10-10",
    requirements: 9,
    mappedRequirements: 6,
    description:
      "Provides privacy rights and obligations for covered businesses handling personal information.",
    notes: "Confirm applicability, notice requirements, deletion workflows, and service-provider terms.",
  },
  {
    id: "REG-006",
    name: "NIST AI Risk Management Framework",
    authority: "National Institute of Standards and Technology",
    region: "United States / Global",
    category: "AI Governance",
    priority: "Medium",
    status: "In Progress",
    owner: "Responsible AI Team",
    effectiveDate: "2023-01-26",
    reviewDate: "2027-02-01",
    lastUpdated: "2026-10-24",
    requirements: 8,
    mappedRequirements: 5,
    description:
      "Provides voluntary guidance for identifying, assessing, and managing risks associated with AI systems.",
    notes: "Use the Govern, Map, Measure, and Manage functions to structure internal risk practices.",
  },
];

const statusOptions: RegulationStatus[] = [
  "Compliant",
  "In Progress",
  "Needs Review",
  "Non-Compliant",
];

const priorityOptions: RegulationPriority[] = [
  "Low",
  "Medium",
  "High",
  "Critical",
];

const statusClass: Record<RegulationStatus, string> = {
  Compliant: "compliant",
  "In Progress": "in-progress",
  "Needs Review": "needs-review",
  "Non-Compliant": "non-compliant",
};

const priorityClass: Record<RegulationPriority, string> = {
  Low: "priority-low",
  Medium: "priority-medium",
  High: "priority-high",
  Critical: "priority-critical",
};

function getReviewState(date: string) {
  if (!date) return "Not scheduled";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(`${date}T00:00:00`);
  const days = Math.ceil(
    (dueDate.getTime() - today.getTime()) / 86400000
  );

  if (days < 0) return "Overdue";
  if (days <= 30) return "Due Soon";
  return "Scheduled";
}

export default function RegulatoryManagementPage() {
  const [regulations, setRegulations] =
    useState<Regulation[]>(initialRegulations);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [regionFilter, setRegionFilter] = useState("All");

  const [activeTab, setActiveTab] = useState<
    "register" | "obligations" | "calendar"
  >("register");

  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<Regulation | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const [form, setForm] = useState({
    name: "",
    authority: "",
    region: "",
    category: "Data Privacy",
    priority: "Medium" as RegulationPriority,
    owner: "",
    effectiveDate: "",
    reviewDate: "",
    requirements: "1",
    description: "",
    notes: "",
  });

  const categories = Array.from(
    new Set(regulations.map((item) => item.category))
  );

  const regions = Array.from(
    new Set(regulations.map((item) => item.region))
  );

  const filteredRegulations = useMemo(() => {
    const query = search.toLowerCase();

    return regulations.filter((item) => {
      const searchable = [
        item.id,
        item.name,
        item.authority,
        item.region,
        item.category,
        item.owner,
      ]
        .join(" ")
        .toLowerCase();

      return (
        searchable.includes(query) &&
        (statusFilter === "All" || item.status === statusFilter) &&
        (priorityFilter === "All" || item.priority === priorityFilter) &&
        (categoryFilter === "All" || item.category === categoryFilter) &&
        (regionFilter === "All" || item.region === regionFilter)
      );
    });
  }, [
    regulations,
    search,
    statusFilter,
    priorityFilter,
    categoryFilter,
    regionFilter,
  ]);

  const compliantCount = regulations.filter(
    (item) => item.status === "Compliant"
  ).length;

  const reviewCount = regulations.filter(
    (item) => item.status === "Needs Review"
  ).length;

  const criticalCount = regulations.filter(
    (item) => item.priority === "Critical"
  ).length;

  const overdueCount = regulations.filter(
    (item) => getReviewState(item.reviewDate) === "Overdue"
  ).length;

  const totalRequirements = regulations.reduce(
    (sum, item) => sum + item.requirements,
    0
  );

  const mappedRequirements = regulations.reduce(
    (sum, item) => sum + item.mappedRequirements,
    0
  );

  function addRegulation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const total = Math.max(1, Number(form.requirements) || 1);

    const regulation: Regulation = {
      id: `REG-${String(Date.now()).slice(-5)}`,
      name: form.name.trim(),
      authority: form.authority.trim(),
      region: form.region.trim(),
      category: form.category,
      priority: form.priority,
      status: "Needs Review",
      owner: form.owner.trim() || "Unassigned",
      effectiveDate: form.effectiveDate || "Not specified",
      reviewDate: form.reviewDate,
      lastUpdated: new Date().toISOString().slice(0, 10),
      requirements: total,
      mappedRequirements: 0,
      description: form.description.trim(),
      notes: form.notes.trim(),
    };

    setRegulations((current) => [regulation, ...current]);
    setShowForm(false);
    setForm({
      name: "",
      authority: "",
      region: "",
      category: "Data Privacy",
      priority: "Medium",
      owner: "",
      effectiveDate: "",
      reviewDate: "",
      requirements: "1",
      description: "",
      notes: "",
    });
    setNotice("Regulation added to the local register.");
  }

  function updateRegulation(
    id: string,
    updates: Partial<Regulation>
  ) {
    setRegulations((current) =>
      current.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      )
    );

    setSelected((current) =>
      current?.id === id ? { ...current, ...updates } : current
    );
  }

  function removeRegulation(id: string) {
    setRegulations((current) =>
      current.filter((item) => item.id !== id)
    );
    setSelected(null);
    setMenuId(null);
    setNotice("Regulation removed from the local register.");
  }

  function exportCSV() {
    const headers = [
      "ID",
      "Regulation",
      "Authority",
      "Region",
      "Category",
      "Priority",
      "Status",
      "Owner",
      "Effective Date",
      "Review Date",
      "Last Updated",
      "Requirements",
      "Mapped Requirements",
    ];

    const rows = filteredRegulations.map((item) => [
      item.id,
      item.name,
      item.authority,
      item.region,
      item.category,
      item.priority,
      item.status,
      item.owner,
      item.effectiveDate,
      item.reviewDate,
      item.lastUpdated,
      item.requirements,
      item.mappedRequirements,
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
    link.download = "modelnow-regulatory-register.csv";
    link.click();
    URL.revokeObjectURL(url);

    setNotice("Regulatory register exported.");
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("All");
    setPriorityFilter("All");
    setCategoryFilter("All");
    setRegionFilter("All");
  }

  return (
    <main className="regulatory-page">
      <header className="page-header">
        <div>
          <div className="breadcrumb">
            Admin <span>/</span> Compliance <span>/</span> Regulatory Management
          </div>
          <h1>Regulatory Management</h1>
          <p>
            Track applicable regulations, map obligations, monitor review
            deadlines, and maintain regulatory oversight.
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
            <Plus size={17} /> Add Regulation
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
          icon={<Scale size={20} />}
          label="Tracked Regulations"
          value={regulations.length}
          note="Items in this register"
          color="blue"
        />
        <StatCard
          icon={<ShieldCheck size={20} />}
          label="Marked Compliant"
          value={compliantCount}
          note="Internal tracking status"
          color="green"
        />
        <StatCard
          icon={<AlertTriangle size={20} />}
          label="Critical Priority"
          value={criticalCount}
          note="Requires appropriate oversight"
          color="red"
        />
        <StatCard
          icon={<Clock3 size={20} />}
          label="Overdue Reviews"
          value={overdueCount}
          note={`${reviewCount} items need review`}
          color="amber"
        />
      </section>

      <section className="summary-grid">
        <div className="summary-card">
          <div className="summary-heading">
            <span className="summary-icon blue">
              <FileText size={19} />
            </span>
            <span>Requirement Coverage</span>
          </div>
          <div className="summary-value">
            {mappedRequirements}
            <span> / {totalRequirements} mapped</span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${
                  totalRequirements
                    ? (mappedRequirements / totalRequirements) * 100
                    : 0
                }%`,
              }}
            />
          </div>
          <p>
            {totalRequirements
              ? Math.round((mappedRequirements / totalRequirements) * 100)
              : 0}
            % of tracked requirements have a mapping recorded.
          </p>
        </div>

        <div className="summary-card">
          <div className="summary-heading">
            <span className="summary-icon amber">
              <CalendarDays size={19} />
            </span>
            <span>Review Schedule</span>
          </div>
          <div className="summary-value">
            {
              regulations.filter(
                (item) => getReviewState(item.reviewDate) === "Due Soon"
              ).length
            }
            <span> due within 30 days</span>
          </div>
          <p>
            {overdueCount} overdue review(s) require attention based on the
            configured review dates.
          </p>
        </div>

        <div className="summary-card">
          <div className="summary-heading">
            <span className="summary-icon green">
              <ShieldCheck size={19} />
            </span>
            <span>Governance Ownership</span>
          </div>
          <div className="summary-value">
            {new Set(regulations.map((item) => item.owner)).size}
            <span> assigned owners</span>
          </div>
          <p>
            Every regulation should have an accountable internal owner and
            evidence of applicability decisions.
          </p>
        </div>
      </section>

      <nav className="tabs">
        <Tab
          active={activeTab === "register"}
          onClick={() => setActiveTab("register")}
          label="Regulatory Register"
          count={regulations.length}
        />
        <Tab
          active={activeTab === "obligations"}
          onClick={() => setActiveTab("obligations")}
          label="Obligation Mapping"
        />
        <Tab
          active={activeTab === "calendar"}
          onClick={() => setActiveTab("calendar")}
          label="Review Calendar"
        />
      </nav>

      {activeTab === "register" && (
        <section className="content-card">
          <div className="section-heading">
            <div>
              <h2>Regulatory Register</h2>
              <p>
                Record regulations, responsible teams, priority, and review
                dates.
              </p>
            </div>
            <span className="record-count">
              {filteredRegulations.length} records
            </span>
          </div>

          <div className="filters">
            <div className="search-box">
              <Search size={17} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search regulations, authority, owner..."
              />
            </div>

            <div className="filter-box">
              <Filter size={15} />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option>All</option>
                {statusOptions.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </div>

            <select
              className="filter-select"
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
            >
              <option>All</option>
              {priorityOptions.map((priority) => (
                <option key={priority}>{priority}</option>
              ))}
            </select>

            <select
              className="filter-select"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option>All</option>
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>

            <select
              className="filter-select"
              value={regionFilter}
              onChange={(event) => setRegionFilter(event.target.value)}
            >
              <option>All</option>
              {regions.map((region) => (
                <option key={region}>{region}</option>
              ))}
            </select>

            <button className="clear-button" onClick={clearFilters}>
              Clear
            </button>
          </div>

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Regulation</th>
                  <th>Authority / Region</th>
                  <th>Priority</th>
                  <th>Requirements</th>
                  <th>Review date</th>
                  <th>Review status</th>
                  <th>Compliance status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filteredRegulations.map((item) => {
                  const review = getReviewState(item.reviewDate);

                  return (
                    <tr key={item.id}>
                      <td>
                        <button
                          className="regulation-name"
                          onClick={() => setSelected(item)}
                        >
                          <span className="reg-icon">
                            <Scale size={18} />
                          </span>
                          <span>
                            <strong>{item.name}</strong>
                            <small>
                              {item.id} · {item.category}
                            </small>
                          </span>
                        </button>
                      </td>
                      <td className="authority-cell">
                        <strong>{item.authority}</strong>
                        <small>{item.region}</small>
                      </td>
                      <td>
                        <span
                          className={`priority-badge ${priorityClass[item.priority]}`}
                        >
                          {item.priority}
                        </span>
                      </td>
                      <td>
                        <div className="requirement-cell">
                          <strong>
                            {item.mappedRequirements}/{item.requirements}
                          </strong>
                          <div className="mini-progress">
                            <div
                              style={{
                                width: `${
                                  item.requirements
                                    ? (item.mappedRequirements /
                                        item.requirements) *
                                      100
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td>{item.reviewDate || "Not scheduled"}</td>
                      <td>
                        <span
                          className={`review-badge ${
                            review === "Scheduled"
                              ? "review-scheduled"
                              : review === "Due Soon"
                                ? "review-due"
                                : "review-overdue"
                          }`}
                        >
                          {review}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${statusClass[item.status]}`}>
                          <span className="status-dot" />
                          {item.status}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button
                          className="icon-button"
                          aria-label="Regulation actions"
                          onClick={() =>
                            setMenuId(menuId === item.id ? null : item.id)
                          }
                        >
                          <MoreHorizontal size={19} />
                        </button>

                        {menuId === item.id && (
                          <div className="row-menu">
                            <button
                              onClick={() => {
                                setSelected(item);
                                setMenuId(null);
                              }}
                            >
                              <Eye size={15} /> View details
                            </button>

                            {statusOptions
                              .filter((status) => status !== item.status)
                              .map((status) => (
                                <button
                                  key={status}
                                  onClick={() => {
                                    updateRegulation(item.id, { status });
                                    setMenuId(null);
                                    setNotice(
                                      `Status changed to ${status}.`
                                    );
                                  }}
                                >
                                  <RefreshCw size={15} /> Mark {status}
                                </button>
                              ))}

                            <button
                              className="delete-action"
                              onClick={() => removeRegulation(item.id)}
                            >
                              <Trash2 size={15} /> Remove regulation
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filteredRegulations.length === 0 && (
                  <tr>
                    <td colSpan={8} className="empty-state">
                      No regulations match your current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            <span>
              Showing {filteredRegulations.length} of {regulations.length} records
            </span>
            <span>Regulatory Management · ModelNow</span>
          </div>
        </section>
      )}

      {activeTab === "obligations" && (
        <section className="content-card">
          <div className="section-heading">
            <div>
              <h2>Obligation Mapping</h2>
              <p>
                Review the number of obligations mapped for each regulation.
              </p>
            </div>
            <span className="record-count">
              {mappedRequirements}/{totalRequirements} mapped
            </span>
          </div>

          <div className="obligation-list">
            {regulations.map((item) => {
              const percentage = item.requirements
                ? Math.round(
                    (item.mappedRequirements / item.requirements) * 100
                  )
                : 0;

              return (
                <article className="obligation-row" key={item.id}>
                  <div className="obligation-title">
                    <span className="reg-icon">
                      <FileText size={18} />
                    </span>
                    <div>
                      <strong>{item.name}</strong>
                      <small>
                        {item.id} · {item.owner}
                      </small>
                    </div>
                  </div>

                  <div className="obligation-progress">
                    <div className="obligation-progress-heading">
                      <span>Mapped requirements</span>
                      <strong>
                        {item.mappedRequirements}/{item.requirements}
                      </strong>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <small>{percentage}% mapped</small>
                  </div>

                  <button
                    className="small-action"
                    onClick={() => setSelected(item)}
                  >
                    Details <ChevronRight size={14} />
                  </button>
                </article>
              );
            })}
          </div>

          <div className="mapping-note">
            <AlertTriangle size={17} />
            Requirement counts and mappings are sample tracking values. This
            page does not yet link to individual requirement records.
          </div>
        </section>
      )}

      {activeTab === "calendar" && (
        <section className="content-card">
          <div className="section-heading">
            <div>
              <h2>Regulatory Review Calendar</h2>
              <p>
                Review upcoming and overdue regulation review dates.
              </p>
            </div>
            <span className="record-count">
              {regulations.length} scheduled records
            </span>
          </div>

          <div className="calendar-list">
            {[...regulations]
              .sort((a, b) => {
                if (!a.reviewDate) return 1;
                if (!b.reviewDate) return -1;
                return a.reviewDate.localeCompare(b.reviewDate);
              })
              .map((item) => {
                const review = getReviewState(item.reviewDate);

                return (
                  <article className="calendar-item" key={item.id}>
                    <div className="calendar-date">
                      <CalendarDays size={20} />
                      <strong>{item.reviewDate || "Unscheduled"}</strong>
                    </div>
                    <div className="calendar-description">
                      <strong>{item.name}</strong>
                      <span>
                        {item.owner} · {item.category}
                      </span>
                    </div>
                    <span
                      className={`review-badge ${
                        review === "Scheduled"
                          ? "review-scheduled"
                          : review === "Due Soon"
                            ? "review-due"
                            : "review-overdue"
                      }`}
                    >
                      {review}
                    </span>
                    <button
                      className="icon-button"
                      onClick={() => setSelected(item)}
                      aria-label="View regulation"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </article>
                );
              })}
          </div>
        </section>
      )}

      <section className="bottom-grid">
        <InfoCard
          icon={<ShieldCheck size={20} />}
          title="Applicability assessment"
          description="Record which regulations apply to your organization, services, data, and operating regions."
          color="blue-bg"
        />
        <InfoCard
          icon={<Bell size={20} />}
          title="Regulatory change monitoring"
          description="Establish a process for legal updates, implementation dates, impact analysis, and assigned actions."
          color="amber-bg"
        />
        <InfoCard
          icon={<FileText size={20} />}
          title="Evidence and traceability"
          description="Connect obligations with controls, owners, evidence, and audit findings as integrations become available."
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
                <h2>Add Regulation</h2>
                <p>Register a framework, law, or regulatory obligation.</p>
              </div>
              <button
                className="icon-button"
                onClick={() => setShowForm(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={addRegulation}>
              <label>
                Regulation name *
                <input
                  required
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="Enter regulation name"
                />
              </label>

              <div className="form-row">
                <label>
                  Authority *
                  <input
                    required
                    value={form.authority}
                    onChange={(event) =>
                      setForm({ ...form, authority: event.target.value })
                    }
                    placeholder="Regulatory authority"
                  />
                </label>
                <label>
                  Region *
                  <input
                    required
                    value={form.region}
                    onChange={(event) =>
                      setForm({ ...form, region: event.target.value })
                    }
                    placeholder="Country or region"
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  Category
                  <select
                    value={form.category}
                    onChange={(event) =>
                      setForm({ ...form, category: event.target.value })
                    }
                  >
                    <option>Data Privacy</option>
                    <option>AI Governance</option>
                    <option>Security Assurance</option>
                    <option>Information Security</option>
                    <option>Financial Regulation</option>
                    <option>Consumer Protection</option>
                    <option>Other</option>
                  </select>
                </label>

                <label>
                  Priority
                  <select
                    value={form.priority}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        priority: event.target.value as RegulationPriority,
                      })
                    }
                  >
                    {priorityOptions.map((priority) => (
                      <option key={priority}>{priority}</option>
                    ))}
                  </select>
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
                  placeholder="Purpose and scope of this regulation"
                />
              </label>

              <div className="form-row">
                <label>
                  Responsible owner
                  <input
                    value={form.owner}
                    onChange={(event) =>
                      setForm({ ...form, owner: event.target.value })
                    }
                    placeholder="Team or role"
                  />
                </label>

                <label>
                  Total requirements
                  <input
                    type="number"
                    min="1"
                    required
                    value={form.requirements}
                    onChange={(event) =>
                      setForm({ ...form, requirements: event.target.value })
                    }
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  Effective date
                  <input
                    type="date"
                    value={form.effectiveDate}
                    onChange={(event) =>
                      setForm({ ...form, effectiveDate: event.target.value })
                    }
                  />
                </label>

                <label>
                  Next review date
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
                Internal notes
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(event) =>
                    setForm({ ...form, notes: event.target.value })
                  }
                  placeholder="Applicability, review notes, or follow-up actions"
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
                  <Plus size={16} /> Add Regulation
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
                <p>{selected.authority} · {selected.region}</p>
              </div>
              <button
                className="icon-button"
                onClick={() => setSelected(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="detail-status">
              <span
                className={`priority-badge ${priorityClass[selected.priority]}`}
              >
                {selected.priority} priority
              </span>
              <span className={`status-badge ${statusClass[selected.status]}`}>
                {selected.status}
              </span>
              <span className="record-count">{selected.category}</span>
            </div>

            <p className="detail-description">
              {selected.description || "No description recorded."}
            </p>

            <div className="detail-grid">
              <Detail label="Responsible owner" value={selected.owner} />
              <Detail label="Effective date" value={selected.effectiveDate} />
              <Detail
                label="Next review date"
                value={selected.reviewDate || "Not scheduled"}
              />
              <Detail label="Last updated" value={selected.lastUpdated} />
              <Detail
                label="Mapped requirements"
                value={`${selected.mappedRequirements} of ${selected.requirements}`}
              />
              <Detail label="Review status" value={getReviewState(selected.reviewDate)} />
            </div>

            <div className="mapping-detail">
              <div className="mapping-heading">
                <strong>Requirement mapping progress</strong>
                <span>
                  {selected.requirements
                    ? Math.round(
                        (selected.mappedRequirements /
                          selected.requirements) *
                          100
                      )
                    : 0}
                  %
                </span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: `${
                      selected.requirements
                        ? (selected.mappedRequirements /
                            selected.requirements) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="description-box">
              <strong>Internal notes</strong>
              <p>{selected.notes || "No notes recorded."}</p>
            </div>

            <div className="modal-footer">
              <button
                className="secondary-button"
                onClick={() => setSelected(null)}
              >
                Close
              </button>

              <label className="status-editor">
                Update status
                <select
                  value={selected.status}
                  onChange={(event) =>
                    updateRegulation(selected.id, {
                      status: event.target.value as RegulationStatus,
                    })
                  }
                >
                  {statusOptions.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </label>
            </div>
          </section>
        </div>
      )}

      <style jsx>{`
        .regulatory-page {
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
        .detail-status,
        .summary-heading,
        .mapping-heading {
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
        .summary-icon {
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

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 15px;
          margin-bottom: 22px;
        }

        .summary-card {
          padding: 18px;
          background: white;
          border: 1px solid var(--line);
          border-radius: 11px;
        }

        .summary-heading {
          justify-content: flex-start;
          color: #687386;
          font-size: 11px;
        }

        .summary-icon {
          width: 37px;
          height: 37px;
        }

        .summary-value {
          margin: 15px 0 12px;
          color: #172033;
          font-size: 24px;
          font-weight: 700;
        }

        .summary-value span {
          color: #687386;
          font-size: 11px;
          font-weight: 400;
        }

        .summary-card p {
          margin: 10px 0 0;
          color: #8791a1;
          font-size: 10px;
          line-height: 1.7;
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
        .filter-select {
          color: #435066;
          background: white;
          border: 0;
          outline: 0;
          font-size: 12px;
        }

        .filter-select {
          min-height: 38px;
          padding: 0 12px;
          border: 1px solid #dfe5ed;
          border-radius: 8px;
        }

        .clear-button {
          min-height: 36px;
          padding: 0 10px;
          color: #596579;
          background: #f7f9fc;
          border: 1px solid #dfe5ed;
          border-radius: 7px;
          font-size: 11px;
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

        .regulation-name {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0;
          color: inherit;
          text-align: left;
          background: transparent;
          border: 0;
        }

        .reg-icon {
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

        .regulation-name strong {
          display: block;
          max-width: 240px;
          overflow: hidden;
          color: #263248;
          font-size: 11px;
          font-weight: 600;
          text-overflow: ellipsis;
        }

        .regulation-name small,
        .authority-cell small {
          display: block;
          margin-top: 5px;
          color: #8b95a5;
          font-size: 10px;
        }

        .authority-cell {
          max-width: 230px;
          white-space: normal;
          line-height: 1.5;
        }

        .authority-cell strong {
          color: #344054;
          font-size: 11px;
          font-weight: 500;
        }

        .priority-badge,
        .status-badge,
        .review-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 8px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 600;
        }

        .priority-low {
          color: #16814a;
          background: #e9f9ef;
        }

        .priority-medium {
          color: #8c650d;
          background: #fff6df;
        }

        .priority-high {
          color: #b45309;
          background: #fff0df;
        }

        .priority-critical {
          color: #bf3c3c;
          background: #fff0f0;
        }

        .compliant {
          color: #16814a;
          background: #e9f9ef;
        }

        .in-progress {
          color: #2856c7;
          background: #edf3ff;
        }

        .needs-review {
          color: #a16207;
          background: #fff6df;
        }

        .non-compliant {
          color: #bf3c3c;
          background: #fff0f0;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          background: currentColor;
          border-radius: 50%;
        }

        .review-scheduled {
          color: #16814a;
          background: #e9f9ef;
        }

        .review-due {
          color: #a16207;
          background: #fff6df;
        }

        .review-overdue {
          color: #bf3c3c;
          background: #fff0f0;
        }

        .requirement-cell {
          min-width: 75px;
        }

        .requirement-cell strong {
          display: block;
          margin-bottom: 6px;
          color: #344054;
          font-size: 11px;
        }

        .mini-progress {
          width: 68px;
          height: 4px;
          overflow: hidden;
          background: #e9edf4;
          border-radius: 99px;
        }

        .mini-progress div {
          height: 100%;
          background: #3567df;
          border-radius: inherit;
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
          width: 190px;
          max-height: 300px;
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

        .obligation-list,
        .calendar-list {
          padding: 0 22px 22px;
        }

        .obligation-row {
          display: grid;
          grid-template-columns: minmax(220px, 1.1fr) minmax(200px, 1fr) auto;
          align-items: center;
          gap: 20px;
          padding: 17px 0;
          border-bottom: 1px solid #edf0f4;
        }

        .obligation-row:last-child,
        .calendar-item:last-child {
          border-bottom: 0;
        }

        .obligation-title {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .obligation-title strong {
          display: block;
          color: #263248;
          font-size: 11px;
          line-height: 1.5;
        }

        .obligation-title small {
          display: block;
          margin-top: 5px;
          color: #8791a1;
          font-size: 10px;
        }

        .obligation-progress {
          min-width: 0;
        }

        .obligation-progress-heading {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 8px;
          color: #687386;
          font-size: 10px;
        }

        .obligation-progress-heading strong {
          color: #344054;
        }

        .obligation-progress > small {
          display: block;
          margin-top: 6px;
          color: #8791a1;
          font-size: 10px;
        }

        .small-action {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 7px 9px;
          color: #2856c7;
          background: #edf3ff;
          border: 1px solid #dce7ff;
          border-radius: 7px;
          font-size: 10px;
          font-weight: 600;
          white-space: nowrap;
        }

        .mapping-note {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin: 0 22px 22px;
          padding: 13px;
          color: #8b620f;
          background: #fff9e9;
          border: 1px solid #f5e4b4;
          border-radius: 8px;
          font-size: 11px;
          line-height: 1.7;
        }

        .mapping-note svg {
          flex-shrink: 0;
        }

        .calendar-item {
          display: grid;
          grid-template-columns: 155px minmax(180px, 1fr) auto 35px;
          align-items: center;
          gap: 15px;
          padding: 17px 0;
          border-bottom: 1px solid #edf0f4;
        }

        .calendar-date {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #2856c7;
          font-size: 11px;
        }

        .calendar-date strong {
          color: #344054;
          font-size: 11px;
        }

        .calendar-description strong {
          display: block;
          color: #263248;
          font-size: 11px;
        }

        .calendar-description span {
          display: block;
          margin-top: 5px;
          color: #8791a1;
          font-size: 10px;
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
          max-width: 620px;
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

        .modal label:not(.check-item):not(.status-editor) {
          display: flex;
          flex-direction: column;
          gap: 7px;
          color: #344054;
          font-size: 11px;
          font-weight: 600;
        }

        .modal label input,
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
          flex-wrap: wrap;
          margin-top: 8px;
          padding-top: 17px;
          border-top: 1px solid var(--line);
        }

        .detail-status {
          justify-content: flex-start;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }

        .detail-description {
          color: #687386;
          font-size: 12px;
          line-height: 1.7;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 16px;
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

        .mapping-detail {
          margin-top: 17px;
          padding: 15px;
          border: 1px solid var(--line);
          border-radius: 9px;
        }

        .mapping-heading {
          margin-bottom: 10px;
          font-size: 11px;
        }

        .mapping-heading span {
          color: #2856c7;
          font-weight: 700;
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

        .status-editor {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #687386;
          font-size: 11px;
        }

        .status-editor select {
          padding: 8px;
          color: #344054;
          background: white;
          border: 1px solid #dce2ea;
          border-radius: 7px;
          font-size: 11px;
        }

        @media (max-width: 1100px) {
          .stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .summary-grid {
            grid-template-columns: 1fr;
          }

          .bottom-grid {
            grid-template-columns: 1fr;
          }

          .obligation-row {
            grid-template-columns: 1fr;
            gap: 12px;
          }
        }

        @media (max-width: 750px) {
          .regulatory-page {
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

          .obligation-list,
          .calendar-list {
            padding: 0 17px 17px;
          }

          .calendar-item {
            grid-template-columns: 1fr auto;
          }

          .calendar-date,
          .calendar-description {
            grid-column: 1 / -1;
          }

          .calendar-item > .icon-button {
            grid-column: 2;
            grid-row: 2;
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
