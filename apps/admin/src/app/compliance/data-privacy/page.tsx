
"use client";

import { useMemo, useState } from "react";
import {
  ShieldCheck,
  Search,
  Plus,
  Download,
  Eye,
  MoreHorizontal,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  LockKeyhole,
  Users,
  FileText,
  CalendarDays,
  X,
  Trash2,
  Filter,
  Database,
  RefreshCw,
  Check,
} from "lucide-react";

type PrivacyStatus =
  | "Received"
  | "In Progress"
  | "Completed"
  | "Overdue";

type PrivacyRequest = {
  id: string;
  subject: string;
  email: string;
  type: string;
  status: PrivacyStatus;
  received: string;
  due: string;
  owner: string;
  region: string;
  description: string;
};

const initialRequests: PrivacyRequest[] = [
  {
    id: "DSR-1001",
    subject: "Ananya Sharma",
    email: "ananya@example.com",
    type: "Access Request",
    status: "In Progress",
    received: "2026-11-01",
    due: "2026-11-15",
    owner: "Privacy Team",
    region: "EU",
    description:
      "The data subject requests a copy of personal information held by the organization.",
  },
  {
    id: "DSR-1002",
    subject: "Rahul Verma",
    email: "rahul@example.com",
    type: "Deletion Request",
    status: "Received",
    received: "2026-11-03",
    due: "2026-11-17",
    owner: "Data Operations",
    region: "India",
    description:
      "Review the request to delete personal data, including applicable retention exceptions.",
  },
  {
    id: "DSR-1003",
    subject: "Priya Reddy",
    email: "priya@example.com",
    type: "Correction Request",
    status: "Completed",
    received: "2026-10-25",
    due: "2026-11-08",
    owner: "Privacy Team",
    region: "India",
    description:
      "The data subject requested correction of inaccurate account information.",
  },
  {
    id: "DSR-1004",
    subject: "Daniel Martin",
    email: "daniel@example.com",
    type: "Data Portability",
    status: "Overdue",
    received: "2026-10-10",
    due: "2026-10-24",
    owner: "Data Operations",
    region: "EU",
    description:
      "Prepare an export of eligible personal information in a commonly usable format.",
  },
  {
    id: "DSR-1005",
    subject: "Sara Wilson",
    email: "sara@example.com",
    type: "Consent Withdrawal",
    status: "In Progress",
    received: "2026-11-02",
    due: "2026-11-16",
    owner: "Privacy Team",
    region: "US",
    description:
      "Review and process a request to withdraw previously provided consent.",
  },
];

const initialSystems = [
  {
    name: "Customer Platform",
    category: "Customer Data",
    region: "India",
    retention: "365 days",
    status: "Reviewed",
    owner: "Data Operations",
  },
  {
    name: "Analytics Workspace",
    category: "Usage Data",
    region: "EU",
    retention: "180 days",
    status: "Review Due",
    owner: "Analytics Team",
  },
  {
    name: "Identity Service",
    category: "Account Data",
    region: "Global",
    retention: "730 days",
    status: "Reviewed",
    owner: "Security Team",
  },
  {
    name: "Support Records",
    category: "Support Data",
    region: "US",
    retention: "365 days",
    status: "Review Due",
    owner: "Support Team",
  },
];

const statusClass: Record<PrivacyStatus, string> = {
  Received: "received",
  "In Progress": "progress",
  Completed: "completed",
  Overdue: "overdue",
};

export default function DataPrivacyPage() {
  const [requests, setRequests] =
    useState<PrivacyRequest[]>(initialRequests);
  const [systems, setSystems] = useState(initialSystems);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [activeTab, setActiveTab] = useState<
    "requests" | "retention" | "consent"
  >("requests");
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] =
    useState<PrivacyRequest | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const [form, setForm] = useState({
    subject: "",
    email: "",
    type: "Access Request",
    region: "India",
    owner: "Privacy Team",
    description: "",
  });

  const [consents, setConsents] = useState([
    {
      name: "Essential Cookies",
      purpose: "Required service functionality",
      category: "Essential",
      status: "Active",
      users: 1250,
    },
    {
      name: "Analytics",
      purpose: "Product usage measurement",
      category: "Analytics",
      status: "Active",
      users: 864,
    },
    {
      name: "Marketing Communications",
      purpose: "Promotional communications",
      category: "Marketing",
      status: "Review Due",
      users: 532,
    },
    {
      name: "Personalization",
      purpose: "Personalized product experiences",
      category: "Preferences",
      status: "Active",
      users: 721,
    },
  ]);

  const filteredRequests = useMemo(() => {
    const query = search.toLowerCase();

    return requests.filter((request) => {
      const text = [
        request.id,
        request.subject,
        request.email,
        request.type,
        request.owner,
        request.region,
      ]
        .join(" ")
        .toLowerCase();

      return (
        text.includes(query) &&
        (statusFilter === "All" ||
          request.status === statusFilter) &&
        (typeFilter === "All" || request.type === typeFilter)
      );
    });
  }, [requests, search, statusFilter, typeFilter]);

  const completed = requests.filter(
    (request) => request.status === "Completed"
  ).length;

  const overdue = requests.filter(
    (request) => request.status === "Overdue"
  ).length;

  const inProgress = requests.filter(
    (request) => request.status === "In Progress"
  ).length;

  const pending = requests.filter(
    (request) =>
      request.status === "Received" ||
      request.status === "In Progress" ||
      request.status === "Overdue"
  ).length;

  function updateRequest(
    id: string,
    updates: Partial<PrivacyRequest>
  ) {
    setRequests((current) =>
      current.map((request) =>
        request.id === id ? { ...request, ...updates } : request
      )
    );

    setSelected((current) =>
      current?.id === id ? { ...current, ...updates } : current
    );
  }

  function addRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const newRequest: PrivacyRequest = {
      id: `DSR-${Date.now().toString().slice(-6)}`,
      subject: form.subject.trim(),
      email: form.email.trim(),
      type: form.type,
      status: "Received",
      received: new Date().toISOString().slice(0, 10),
      due: new Date(Date.now() + 14 * 86400000)
        .toISOString()
        .slice(0, 10),
      owner: form.owner,
      region: form.region,
      description: form.description.trim(),
    };

    setRequests((current) => [newRequest, ...current]);
    setShowForm(false);
    setForm({
      subject: "",
      email: "",
      type: "Access Request",
      region: "India",
      owner: "Privacy Team",
      description: "",
    });
    setNotice("Privacy request added to the local request register.");
  }

  function changeStatus(id: string, status: PrivacyStatus) {
    updateRequest(id, { status });
    setMenuId(null);
    setNotice(`Request status changed to ${status}.`);
  }

  function deleteRequest(id: string) {
    setRequests((current) =>
      current.filter((request) => request.id !== id)
    );
    setSelected(null);
    setMenuId(null);
    setNotice("Privacy request removed from the local register.");
  }

  function exportCSV() {
    const headers = [
      "Request ID",
      "Subject",
      "Email",
      "Request Type",
      "Status",
      "Received",
      "Due Date",
      "Owner",
      "Region",
    ];

    const rows = filteredRequests.map((request) => [
      request.id,
      request.subject,
      request.email,
      request.type,
      request.status,
      request.received,
      request.due,
      request.owner,
      request.region,
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
    link.download = "modelnow-data-privacy-requests.csv";
    link.click();
    URL.revokeObjectURL(url);
    setNotice("Privacy request register exported.");
  }

  function toggleConsent(index: number) {
    setConsents((current) =>
      current.map((consent, i) =>
        i === index
          ? {
              ...consent,
              status:
                consent.status === "Active" ? "Paused" : "Active",
            }
          : consent
      )
    );
    setNotice("Consent status updated in the local demo.");
  }

  function toggleRetention(index: number) {
    setSystems((current) =>
      current.map((system, i) =>
        i === index
          ? {
              ...system,
              status:
                system.status === "Reviewed"
                  ? "Review Due"
                  : "Reviewed",
            }
          : system
      )
    );
    setNotice("Retention review status updated.");
  }

  return (
    <main className="privacy-page">
      <header className="page-header">
        <div>
          <div className="breadcrumb">
            Admin <span>/</span> Compliance <span>/</span> Data Privacy
          </div>
          <h1>Data Privacy</h1>
          <p>
            Manage privacy requests, consent records, and data retention
            reviews in one workspace.
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
            <Plus size={17} /> New Request
          </button>
        </div>
      </header>

      {notice && (
        <div className="notice">
          <CheckCircle2 size={17} />
          <span>{notice}</span>
          <button
            onClick={() => setNotice("")}
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <section className="stats-grid">
        <StatCard
          icon={<FileText size={20} />}
          label="Total Requests"
          value={requests.length}
          note="All registered requests"
          color="blue"
        />
        <StatCard
          icon={<Clock3 size={20} />}
          label="Pending Requests"
          value={pending}
          note={`${inProgress} in progress`}
          color="amber"
        />
        <StatCard
          icon={<CheckCircle2 size={20} />}
          label="Completed"
          value={completed}
          note="Marked completed"
          color="green"
        />
        <StatCard
          icon={<AlertTriangle size={20} />}
          label="Overdue"
          value={overdue}
          note="Needs immediate review"
          color="red"
        />
      </section>

      <section className="privacy-banner">
        <div className="banner-icon">
          <ShieldCheck size={25} />
        </div>
        <div className="banner-copy">
          <strong>Privacy operations workspace</strong>
          <p>
            Track data subject requests, document consent records, and
            review retention practices across your systems.
          </p>
        </div>
        <div className="banner-badge">
          <LockKeyhole size={15} /> Privacy controls
        </div>
      </section>

      <nav className="tabs">
        <button
          className={activeTab === "requests" ? "active" : ""}
          onClick={() => setActiveTab("requests")}
        >
          <Users size={16} /> Data Subject Requests
          <span>{requests.length}</span>
        </button>
        <button
          className={activeTab === "retention" ? "active" : ""}
          onClick={() => setActiveTab("retention")}
        >
          <Database size={16} /> Retention Reviews
          <span>{systems.length}</span>
        </button>
        <button
          className={activeTab === "consent" ? "active" : ""}
          onClick={() => setActiveTab("consent")}
        >
          <CheckCircle2 size={16} /> Consent Management
          <span>{consents.length}</span>
        </button>
      </nav>

      {activeTab === "requests" && (
        <section className="content-card">
          <div className="section-heading">
            <div>
              <h2>Data Subject Requests</h2>
              <p>
                Track access, deletion, correction, and portability requests.
              </p>
            </div>
            <span className="record-count">
              {filteredRequests.length} records
            </span>
          </div>

          <div className="filters">
            <div className="search-box">
              <Search size={17} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search ID, subject, email, owner..."
              />
            </div>

            <div className="filter-box">
              <Filter size={15} />
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
              >
                <option>All</option>
                <option>Received</option>
                <option>In Progress</option>
                <option>Completed</option>
                <option>Overdue</option>
              </select>
            </div>

            <select
              className="type-select"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
            >
              <option>All</option>
              <option>Access Request</option>
              <option>Deletion Request</option>
              <option>Correction Request</option>
              <option>Data Portability</option>
              <option>Consent Withdrawal</option>
            </select>
          </div>

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Request</th>
                  <th>Type</th>
                  <th>Region</th>
                  <th>Received</th>
                  <th>Due date</th>
                  <th>Owner</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request.id}>
                    <td>
                      <button
                        className="request-name"
                        onClick={() => setSelected(request)}
                      >
                        <span className="request-icon">
                          <FileText size={17} />
                        </span>
                        <span>
                          <strong>{request.subject}</strong>
                          <small>
                            {request.id} · {request.email}
                          </small>
                        </span>
                      </button>
                    </td>
                    <td>{request.type}</td>
                    <td>
                      <span className="region-tag">
                        {request.region}
                      </span>
                    </td>
                    <td>{request.received}</td>
                    <td>
                      <span
                        className={
                          request.status === "Overdue"
                            ? "due-date overdue-text"
                            : "due-date"
                        }
                      >
                        <CalendarDays size={13} />
                        {request.due}
                      </span>
                    </td>
                    <td>{request.owner}</td>
                    <td>
                      <span
                        className={`status-badge ${statusClass[request.status]}`}
                      >
                        <span className="status-dot" />
                        {request.status}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button
                        className="icon-button"
                        aria-label="Request actions"
                        onClick={() =>
                          setMenuId(
                            menuId === request.id ? null : request.id
                          )
                        }
                      >
                        <MoreHorizontal size={19} />
                      </button>

                      {menuId === request.id && (
                        <div className="row-menu">
                          <button
                            onClick={() => {
                              setSelected(request);
                              setMenuId(null);
                            }}
                          >
                            <Eye size={15} /> View details
                          </button>

                          {(
                            [
                              "Received",
                              "In Progress",
                              "Completed",
                              "Overdue",
                            ] as PrivacyStatus[]
                          )
                            .filter(
                              (status) => status !== request.status
                            )
                            .map((status) => (
                              <button
                                key={status}
                                onClick={() =>
                                  changeStatus(request.id, status)
                                }
                              >
                                <Check size={15} /> Mark {status}
                              </button>
                            ))}

                          <button
                            className="delete-action"
                            onClick={() => deleteRequest(request.id)}
                          >
                            <Trash2 size={15} /> Delete request
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}

                {filteredRequests.length === 0 && (
                  <tr>
                    <td colSpan={8} className="empty-state">
                      No requests match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            <span>
              Showing {filteredRequests.length} of {requests.length} requests
            </span>
            <span>Data Privacy · ModelNow</span>
          </div>
        </section>
      )}

      {activeTab === "retention" && (
        <section className="content-card">
          <div className="section-heading">
            <div>
              <h2>Data Retention Reviews</h2>
              <p>
                Review the configured retention periods for sample systems.
              </p>
            </div>
            <span className="record-count">
              {systems.filter((system) => system.status === "Review Due").length}{" "}
              need review
            </span>
          </div>

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>System</th>
                  <th>Data category</th>
                  <th>Region</th>
                  <th>Retention period</th>
                  <th>Owner</th>
                  <th>Review status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {systems.map((system, index) => (
                  <tr key={system.name}>
                    <td>
                      <strong className="system-name">
                        <Database size={16} />
                        {system.name}
                      </strong>
                    </td>
                    <td>{system.category}</td>
                    <td>{system.region}</td>
                    <td>{system.retention}</td>
                    <td>{system.owner}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          system.status === "Reviewed"
                            ? "completed"
                            : "warning-status"
                        }`}
                      >
                        {system.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="small-action"
                        onClick={() => toggleRetention(index)}
                      >
                        <RefreshCw size={14} />
                        Toggle status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="retention-note">
            <AlertTriangle size={17} />
            <span>
              Retention periods are sample configuration values. Verify
              actual requirements with your privacy and legal teams.
            </span>
          </div>
        </section>
      )}

      {activeTab === "consent" && (
        <section className="content-card">
          <div className="section-heading">
            <div>
              <h2>Consent Management</h2>
              <p>
                Review consent categories and their sample recorded status.
              </p>
            </div>
            <span className="record-count">
              {consents.length} categories
            </span>
          </div>

          <div className="consent-grid">
            {consents.map((consent, index) => (
              <article className="consent-card" key={consent.name}>
                <div className="consent-top">
                  <span className="consent-icon">
                    <ShieldCheck size={20} />
                  </span>
                  <span
                    className={`status-badge ${
                      consent.status === "Active"
                        ? "completed"
                        : consent.status === "Paused"
                          ? "paused"
                          : "warning-status"
                    }`}
                  >
                    {consent.status}
                  </span>
                </div>

                <h3>{consent.name}</h3>
                <p>{consent.purpose}</p>

                <div className="consent-meta">
                  <span>Category</span>
                  <strong>{consent.category}</strong>
                </div>

                <div className="consent-meta">
                  <span>Sample records</span>
                  <strong>{consent.users.toLocaleString()}</strong>
                </div>

                <button
                  className="consent-action"
                  onClick={() => toggleConsent(index)}
                >
                  <RefreshCw size={14} />
                  {consent.status === "Active"
                    ? "Pause category"
                    : "Activate category"}
                </button>
              </article>
            ))}
          </div>

          <div className="retention-note">
            <LockKeyhole size={17} />
            <span>
              Consent controls here update demonstration state only. They
              do not change actual cookie settings or user permissions.
            </span>
          </div>
        </section>
      )}

      <section className="bottom-grid">
        <div className="content-card info-card">
          <span className="info-icon blue-bg">
            <Users size={20} />
          </span>
          <h3>Data subject rights</h3>
          <p>
            Keep requests organized by type, region, owner, and status.
          </p>
        </div>
        <div className="content-card info-card">
          <span className="info-icon amber-bg">
            <Database size={20} />
          </span>
          <h3>Retention governance</h3>
          <p>
            Maintain visibility into retention schedules and review needs.
          </p>
        </div>
        <div className="content-card info-card">
          <span className="info-icon green-bg">
            <ShieldCheck size={20} />
          </span>
          <h3>Consent records</h3>
          <p>
            Organize sample consent categories for future backend integration.
          </p>
        </div>
      </section>

      {showForm && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowForm(false);
            }
          }}
        >
          <section className="modal">
            <div className="modal-heading">
              <div>
                <h2>New Privacy Request</h2>
                <p>Register a data subject request.</p>
              </div>
              <button
                className="icon-button"
                onClick={() => setShowForm(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={addRequest}>
              <label>
                Subject name *
                <input
                  required
                  value={form.subject}
                  onChange={(event) =>
                    setForm({ ...form, subject: event.target.value })
                  }
                  placeholder="Enter subject name"
                />
              </label>

              <label>
                Email address *
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm({ ...form, email: event.target.value })
                  }
                  placeholder="person@example.com"
                />
              </label>

              <div className="form-row">
                <label>
                  Request type
                  <select
                    value={form.type}
                    onChange={(event) =>
                      setForm({ ...form, type: event.target.value })
                    }
                  >
                    <option>Access Request</option>
                    <option>Deletion Request</option>
                    <option>Correction Request</option>
                    <option>Data Portability</option>
                    <option>Consent Withdrawal</option>
                  </select>
                </label>

                <label>
                  Region
                  <select
                    value={form.region}
                    onChange={(event) =>
                      setForm({ ...form, region: event.target.value })
                    }
                  >
                    <option>India</option>
                    <option>EU</option>
                    <option>US</option>
                    <option>Global</option>
                  </select>
                </label>
              </div>

              <label>
                Responsible owner
                <select
                  value={form.owner}
                  onChange={(event) =>
                    setForm({ ...form, owner: event.target.value })
                  }
                >
                  <option>Privacy Team</option>
                  <option>Data Operations</option>
                  <option>Security Team</option>
                  <option>Legal Team</option>
                </select>
              </label>

              <label>
                Request notes
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      description: event.target.value,
                    })
                  }
                  placeholder="Add relevant request details..."
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
                  <Plus size={16} /> Create Request
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
            if (event.target === event.currentTarget) {
              setSelected(null);
            }
          }}
        >
          <section className="modal detail-modal">
            <div className="modal-heading">
              <div>
                <span className="eyebrow">{selected.id}</span>
                <h2>{selected.subject}</h2>
                <p>{selected.email}</p>
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
                className={`status-badge ${statusClass[selected.status]}`}
              >
                {selected.status}
              </span>
              <span className="region-tag">{selected.region}</span>
              <span className="region-tag">{selected.type}</span>
            </div>

            <div className="detail-grid">
              <Detail label="Received" value={selected.received} />
              <Detail label="Due date" value={selected.due} />
              <Detail label="Responsible owner" value={selected.owner} />
              <Detail label="Request ID" value={selected.id} />
            </div>

            <div className="description-box">
              <strong>Request details</strong>
              <p>
                {selected.description || "No additional notes provided."}
              </p>
            </div>

            <div className="modal-footer">
              <button
                className="secondary-button"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
              {selected.status !== "Completed" && (
                <button
                  className="primary-button"
                  onClick={() =>
                    changeStatus(selected.id, "Completed")
                  }
                >
                  <CheckCircle2 size={15} /> Mark Completed
                </button>
              )}
            </div>
          </section>
        </div>
      )}

      <style jsx>{`
        .privacy-page {
          --text: #172033;
          --muted: #687386;
          --line: #e6eaf0;
          min-height: 100vh;
          padding: 30px;
          background: #f7f9fc;
          color: var(--text);
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

        .page-header > div:first-child > p,
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
          margin-bottom: 20px;
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

        .privacy-banner {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 22px;
          padding: 20px;
          background: linear-gradient(110deg, #eef4ff, #f7f9ff);
          border: 1px solid #dbe6ff;
          border-radius: 12px;
        }

        .banner-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 47px;
          height: 47px;
          color: #2856c7;
          background: white;
          border: 1px solid #dce6ff;
          border-radius: 12px;
        }

        .banner-copy {
          flex: 1;
        }

        .banner-copy strong {
          font-size: 14px;
        }

        .banner-copy p {
          margin: 6px 0 0;
          color: #64748b;
          font-size: 11px;
          line-height: 1.7;
        }

        .banner-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 10px;
          color: #2856c7;
          background: white;
          border: 1px solid #dce6ff;
          border-radius: 7px;
          font-size: 10px;
          font-weight: 600;
          white-space: nowrap;
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
          padding: 0 14px;
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

        .tabs button.active span {
          color: #2459d3;
          background: white;
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
        .type-select {
          color: #435066;
          background: white;
          border: 0;
          outline: 0;
          font-size: 12px;
        }

        .type-select {
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

        .request-name {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0;
          color: inherit;
          text-align: left;
          background: transparent;
          border: 0;
        }

        .request-icon {
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

        .request-name strong {
          display: block;
          color: #263248;
          font-size: 11px;
          font-weight: 600;
        }

        .request-name small {
          display: block;
          margin-top: 5px;
          color: #8b95a5;
          font-size: 10px;
        }

        .region-tag {
          display: inline-flex;
          padding: 5px 8px;
          color: #495a78;
          background: #f0f3f8;
          border-radius: 5px;
          font-size: 10px;
          font-weight: 600;
        }

        .due-date {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #687386;
          font-size: 10px;
        }

        .overdue-text {
          color: #c34242;
          font-weight: 600;
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

        .received {
          color: #475467;
          background: #eef1f5;
        }

        .progress {
          color: #2856c7;
          background: #edf3ff;
        }

        .completed {
          color: #16814a;
          background: #e9f9ef;
        }

        .overdue {
          color: #bf3c3c;
          background: #fff0f0;
        }

        .warning-status {
          color: #a86a0b;
          background: #fff5df;
        }

        .paused {
          color: #687386;
          background: #eef1f5;
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

        .system-name {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          color: #344054;
          font-size: 11px;
        }

        .system-name svg {
          color: #3764c9;
        }

        .small-action {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 9px;
          color: #475467;
          background: white;
          border: 1px solid var(--line);
          border-radius: 6px;
          font-size: 10px;
          white-space: nowrap;
        }

        .small-action:hover {
          background: #f7f9fc;
        }

        .retention-note {
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

        .retention-note svg {
          flex-shrink: 0;
          margin-top: 1px;
        }

        .consent-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 15px;
          padding: 0 22px 22px;
        }

        .consent-card {
          padding: 18px;
          border: 1px solid var(--line);
          border-radius: 10px;
        }

        .consent-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .consent-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 39px;
          height: 39px;
          color: #2856c7;
          background: #edf3ff;
          border-radius: 9px;
        }

        .consent-card h3 {
          margin: 15px 0 7px;
          color: #263248;
          font-size: 14px;
        }

        .consent-card > p {
          min-height: 32px;
          margin: 0 0 15px;
          color: #8791a1;
          font-size: 11px;
          line-height: 1.6;
        }

        .consent-meta {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          padding: 10px 0;
          border-top: 1px solid #edf0f4;
          font-size: 11px;
        }

        .consent-meta span {
          color: #8791a1;
        }

        .consent-meta strong {
          color: #344054;
          text-align: right;
        }

        .consent-action {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          width: 100%;
          min-height: 36px;
          margin-top: 9px;
          color: #354154;
          background: white;
          border: 1px solid #dce2ea;
          border-radius: 7px;
          font-size: 11px;
          font-weight: 600;
        }

        .consent-action:hover {
          background: #f5f7fa;
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
          max-width: 570px;
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

        .modal label {
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

        @media (max-width: 1050px) {
          .bottom-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 750px) {
          .privacy-page {
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

          .privacy-banner {
            align-items: flex-start;
            flex-wrap: wrap;
            padding: 15px;
          }

          .banner-badge {
            margin-left: 62px;
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

          .consent-grid {
            grid-template-columns: 1fr;
            padding: 0 17px 17px;
          }

          .table-footer {
            align-items: flex-start;
            flex-direction: column;
          }

          .form-row,
          .detail-grid {
            grid-template-columns: 1fr;
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
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="detail-item">
      <span>{label}</span>
      <strong>{value || "Not set"}</strong>
    </div>
  );
}
