
"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  FileText,
  FileCheck2,
  Clock3,
  AlertTriangle,
  Download,
  MoreHorizontal,
  Eye,
  Trash2,
  X,
  Upload,
  CheckCircle2,
  ShieldCheck,
  Filter,
  CalendarDays,
  Building2,
} from "lucide-react";

type EvidenceStatus =
  | "Verified"
  | "Pending Review"
  | "Rejected"
  | "Expired";

type Evidence = {
  id: string;
  title: string;
  type: string;
  framework: string;
  owner: string;
  status: EvidenceStatus;
  collected: string;
  expires: string;
  description: string;
};

const initialEvidence: Evidence[] = [
  {
    id: "EVD-1001",
    title: "Access Control Policy",
    type: "Policy Document",
    framework: "SOC 2",
    owner: "Security Team",
    status: "Verified",
    collected: "2026-10-20",
    expires: "2027-10-20",
    description:
      "Documents access approval, account provisioning, and periodic access reviews.",
  },
  {
    id: "EVD-1002",
    title: "Employee Security Training",
    type: "Training Record",
    framework: "ISO 27001",
    owner: "HR Team",
    status: "Pending Review",
    collected: "2026-10-28",
    expires: "2027-10-28",
    description:
      "Evidence of employee security awareness and annual training completion.",
  },
  {
    id: "EVD-1003",
    title: "Data Processing Agreement",
    type: "Contract",
    framework: "GDPR",
    owner: "Legal Team",
    status: "Verified",
    collected: "2026-10-15",
    expires: "2027-04-15",
    description:
      "Records processor obligations and personal data handling requirements.",
  },
  {
    id: "EVD-1004",
    title: "Backup Restoration Test",
    type: "Test Report",
    framework: "SOC 2",
    owner: "Platform Team",
    status: "Rejected",
    collected: "2026-10-18",
    expires: "2027-01-18",
    description:
      "Backup restoration test results require additional supporting documentation.",
  },
  {
    id: "EVD-1005",
    title: "Vendor Security Assessment",
    type: "Assessment",
    framework: "ISO 27001",
    owner: "Compliance Team",
    status: "Expired",
    collected: "2025-10-10",
    expires: "2026-10-10",
    description:
      "Annual security review of a critical third-party service provider.",
  },
  {
    id: "EVD-1006",
    title: "Encryption Configuration",
    type: "Configuration Record",
    framework: "SOC 2",
    owner: "Engineering Team",
    status: "Verified",
    collected: "2026-11-01",
    expires: "2027-05-01",
    description:
      "Documents encryption settings for stored and transmitted data.",
  },
];

const statusColors: Record<EvidenceStatus, string> = {
  Verified: "green",
  "Pending Review": "amber",
  Rejected: "red",
  Expired: "gray",
};

export default function EvidenceManagementPage() {
  const [evidence, setEvidence] =
    useState<Evidence[]>(initialEvidence);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [frameworkFilter, setFrameworkFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<Evidence | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const [form, setForm] = useState({
    title: "",
    type: "Policy Document",
    framework: "SOC 2",
    owner: "",
    expires: "",
    description: "",
  });

  const filtered = useMemo(() => {
    return evidence.filter((item) => {
      const matchesSearch = [
        item.id,
        item.title,
        item.owner,
        item.framework,
        item.type,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      return (
        matchesSearch &&
        (statusFilter === "All" ||
          item.status === statusFilter) &&
        (frameworkFilter === "All" ||
          item.framework === frameworkFilter)
      );
    });
  }, [evidence, search, statusFilter, frameworkFilter]);

  const verified = evidence.filter(
    (item) => item.status === "Verified"
  ).length;
  const pending = evidence.filter(
    (item) => item.status === "Pending Review"
  ).length;
  const expired = evidence.filter(
    (item) => item.status === "Expired"
  ).length;

  function updateStatus(id: string, status: EvidenceStatus) {
    setEvidence((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status } : item
      )
    );
    setMenuId(null);
    setNotice(`Evidence status updated to ${status}.`);
  }

  function addEvidence(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const newEvidence: Evidence = {
      id: `EVD-${Date.now().toString().slice(-6)}`,
      title: form.title.trim(),
      type: form.type,
      framework: form.framework,
      owner: form.owner.trim(),
      status: "Pending Review",
      collected: new Date().toISOString().slice(0, 10),
      expires: form.expires,
      description: form.description.trim(),
    };

    setEvidence((current) => [newEvidence, ...current]);
    setShowForm(false);
    setForm({
      title: "",
      type: "Policy Document",
      framework: "SOC 2",
      owner: "",
      expires: "",
      description: "",
    });
    setNotice("Evidence record added successfully.");
  }

  function exportCSV() {
    const headers = [
      "ID",
      "Title",
      "Type",
      "Framework",
      "Owner",
      "Status",
      "Collected",
      "Expires",
    ];

    const rows = filtered.map((item) => [
      item.id,
      item.title,
      item.type,
      item.framework,
      item.owner,
      item.status,
      item.collected,
      item.expires,
    ]);

    const escapeCSV = (value: string) =>
      `"${value.replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" })
    );

    const link = document.createElement("a");
    link.href = url;
    link.download = "modelnow-evidence.csv";
    link.click();
    URL.revokeObjectURL(url);
    setNotice("Evidence CSV exported.");
  }

  function deleteEvidence(id: string) {
    setEvidence((current) =>
      current.filter((item) => item.id !== id)
    );
    setMenuId(null);
    setSelected(null);
    setNotice("Evidence record deleted.");
  }

  return (
    <main className="evidence-page">
      <header className="page-header">
        <div>
          <div className="breadcrumb">
            Admin <span>/</span> Compliance <span>/</span> Evidence
          </div>
          <h1>Evidence Management</h1>
          <p>
            Collect, review, verify, and maintain compliance evidence
            across your organization.
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
            <Plus size={17} /> Add Evidence
          </button>
        </div>
      </header>

      {notice && (
        <div className="notice">
          <CheckCircle2 size={17} />
          <span>{notice}</span>
          <button
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
          >
            <X size={16} />
          </button>
        </div>
      )}

      <section className="stats-grid">
        <StatCard
          icon={<FileText size={20} />}
          label="Total Evidence"
          value={evidence.length}
          note="All evidence records"
          color="blue"
        />
        <StatCard
          icon={<ShieldCheck size={20} />}
          label="Verified"
          value={verified}
          note="Approved evidence"
          color="green"
        />
        <StatCard
          icon={<Clock3 size={20} />}
          label="Pending Review"
          value={pending}
          note="Awaiting validation"
          color="amber"
        />
        <StatCard
          icon={<AlertTriangle size={20} />}
          label="Expired"
          value={expired}
          note="Requires renewal"
          color="red"
        />
      </section>

      <section className="content-card">
        <div className="section-heading">
          <div>
            <h2>Evidence Register</h2>
            <p>Manage evidence records and their review status.</p>
          </div>
          <span className="record-count">
            {filtered.length} records
          </span>
        </div>

        <div className="filters">
          <div className="search-box">
            <Search size={17} />
            <input
              placeholder="Search evidence, owner, framework..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="filter-box">
            <Filter size={15} />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option>All</option>
              <option>Verified</option>
              <option>Pending Review</option>
              <option>Rejected</option>
              <option>Expired</option>
            </select>
          </div>

          <select
            className="framework-select"
            value={frameworkFilter}
            onChange={(event) =>
              setFrameworkFilter(event.target.value)
            }
          >
            <option>All</option>
            <option>SOC 2</option>
            <option>ISO 27001</option>
            <option>GDPR</option>
            <option>HIPAA</option>
            <option>PCI DSS</option>
          </select>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Evidence</th>
                <th>Framework</th>
                <th>Owner</th>
                <th>Collected</th>
                <th>Expires</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>
                    <button
                      className="evidence-name"
                      onClick={() => setSelected(item)}
                    >
                      <span className="file-icon">
                        <FileCheck2 size={18} />
                      </span>
                      <span>
                        <strong>{item.title}</strong>
                        <small>
                          {item.id} · {item.type}
                        </small>
                      </span>
                    </button>
                  </td>
                  <td>
                    <span className="framework-tag">
                      {item.framework}
                    </span>
                  </td>
                  <td>
                    <span className="owner">
                      <Building2 size={14} /> {item.owner}
                    </span>
                  </td>
                  <td>
                    <span className="date-cell">
                      <CalendarDays size={14} />
                      {item.collected}
                    </span>
                  </td>
                  <td>
                    <span
                      className={
                        item.status === "Expired"
                          ? "date-cell expired-date"
                          : "date-cell"
                      }
                    >
                      {item.expires || "—"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${statusColors[item.status]}`}
                    >
                      <span className="status-dot" />
                      {item.status}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button
                      className="icon-button"
                      aria-label="Evidence actions"
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
                        {(
                          [
                            "Verified",
                            "Pending Review",
                            "Rejected",
                            "Expired",
                          ] as EvidenceStatus[]
                        )
                          .filter((status) => status !== item.status)
                          .map((status) => (
                            <button
                              key={status}
                              onClick={() =>
                                updateStatus(item.id, status)
                              }
                            >
                              <CheckCircle2 size={15} />
                              Mark {status}
                            </button>
                          ))}
                        <button
                          className="delete-action"
                          onClick={() => deleteEvidence(item.id)}
                        >
                          <Trash2 size={15} /> Delete evidence
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty-state">
                    <FileText size={28} />
                    <strong>No evidence found</strong>
                    <span>Try changing your search or filters.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>
            Showing {filtered.length} of {evidence.length} evidence records
          </span>
          <span>Evidence register · ModelNow</span>
        </div>
      </section>

      <section className="bottom-grid">
        <div className="content-card info-card">
          <div className="info-icon blue-info">
            <Upload size={20} />
          </div>
          <h3>Evidence collection</h3>
          <p>
            Keep policies, test reports, training records, and
            assessments organized by framework and owner.
          </p>
        </div>
        <div className="content-card info-card">
          <div className="info-icon green-info">
            <ShieldCheck size={20} />
          </div>
          <h3>Review and verification</h3>
          <p>
            Track review decisions and follow up on rejected or
            incomplete evidence before an audit.
          </p>
        </div>
        <div className="content-card info-card">
          <div className="info-icon amber-info">
            <CalendarDays size={20} />
          </div>
          <h3>Expiry management</h3>
          <p>
            Monitor evidence expiry dates and plan renewals to
            keep compliance records current.
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
                <h2>Add Evidence</h2>
                <p>Create a compliance evidence record.</p>
              </div>
              <button
                className="icon-button"
                onClick={() => setShowForm(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={addEvidence}>
              <label>
                Evidence title *
                <input
                  required
                  maxLength={120}
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                  placeholder="e.g. Annual access review"
                />
              </label>

              <div className="form-row">
                <label>
                  Evidence type
                  <select
                    value={form.type}
                    onChange={(event) =>
                      setForm({ ...form, type: event.target.value })
                    }
                  >
                    <option>Policy Document</option>
                    <option>Training Record</option>
                    <option>Contract</option>
                    <option>Test Report</option>
                    <option>Assessment</option>
                    <option>Configuration Record</option>
                    <option>Other</option>
                  </select>
                </label>
                <label>
                  Framework
                  <select
                    value={form.framework}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        framework: event.target.value,
                      })
                    }
                  >
                    <option>SOC 2</option>
                    <option>ISO 27001</option>
                    <option>GDPR</option>
                    <option>HIPAA</option>
                    <option>PCI DSS</option>
                  </select>
                </label>
              </div>

              <label>
                Evidence owner *
                <input
                  required
                  value={form.owner}
                  onChange={(event) =>
                    setForm({ ...form, owner: event.target.value })
                  }
                  placeholder="e.g. Security Team"
                />
              </label>

              <label>
                Expiry date
                <input
                  type="date"
                  value={form.expires}
                  onChange={(event) =>
                    setForm({ ...form, expires: event.target.value })
                  }
                />
              </label>

              <label>
                Description
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      description: event.target.value,
                    })
                  }
                  placeholder="Describe the evidence and what it supports..."
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
                <button className="primary-button" type="submit">
                  <Plus size={16} /> Create Evidence
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
                <h2>{selected.title}</h2>
                <p>Evidence record details</p>
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
                className={`status-badge ${statusColors[selected.status]}`}
              >
                <span className="status-dot" />
                {selected.status}
              </span>
              <span className="framework-tag">
                {selected.framework}
              </span>
            </div>

            <div className="detail-grid">
              <Detail label="Evidence ID" value={selected.id} />
              <Detail label="Type" value={selected.type} />
              <Detail label="Owner" value={selected.owner} />
              <Detail label="Collected" value={selected.collected} />
              <Detail label="Expiry date" value={selected.expires || "Not set"} />
            </div>

            <div className="description-box">
              <strong>Description</strong>
              <p>{selected.description || "No description provided."}</p>
            </div>

            <div className="modal-footer">
              <button
                className="secondary-button"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
              {selected.status !== "Verified" && (
                <button
                  className="primary-button"
                  onClick={() =>
                    updateStatus(selected.id, "Verified")
                  }
                >
                  <CheckCircle2 size={16} /> Mark Verified
                </button>
              )}
            </div>
          </section>
        </div>
      )}

      <style jsx>{`
        .evidence-page {
          --text: #172033;
          --muted: #687386;
          --line: #e6eaf0;
          --surface: #ffffff;
          --page: #f7f9fc;
          min-height: 100vh;
          padding: 30px;
          background: var(--page);
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
          margin-bottom: 25px;
        }

        .breadcrumb {
          color: var(--muted);
          font-size: 12px;
          margin-bottom: 12px;
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
          background: #2459d3;
          color: white;
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
          border: 1px solid #bce7cc;
          border-radius: 9px;
          background: #f0fdf4;
          color: #166534;
          font-size: 12px;
        }

        .notice span {
          flex: 1;
        }

        .notice button {
          display: flex;
          border: 0;
          background: transparent;
          color: inherit;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 22px;
        }

        .stat-card {
          display: flex;
          gap: 13px;
          align-items: flex-start;
          padding: 19px;
          background: white;
          border: 1px solid var(--line);
          border-radius: 12px;
          min-width: 0;
        }

        .stat-icon,
        .info-icon,
        .file-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 9px;
        }

        .stat-icon {
          width: 42px;
          height: 42px;
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

        .gray {
          color: #697386;
          background: #eef1f5;
        }

        .stat-label {
          color: var(--muted);
          font-size: 12px;
          margin: 2px 0 8px;
        }

        .stat-value {
          font-size: 26px;
          font-weight: 700;
          letter-spacing: -0.7px;
        }

        .stat-note {
          margin-top: 7px;
          font-size: 11px;
          color: #8a94a4;
        }

        .content-card {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 12px;
          min-width: 0;
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
          border: 1px solid var(--line);
          border-radius: 7px;
          color: #596579;
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
          border: 1px solid #dfe5ed;
          border-radius: 8px;
          color: #758196;
          background: white;
        }

        .search-box {
          flex: 1;
          min-width: 220px;
        }

        .search-box input {
          width: 100%;
          min-width: 0;
          border: 0;
          outline: 0;
          color: var(--text);
          font-size: 12px;
          background: transparent;
        }

        .filter-box select,
        .framework-select {
          border: 0;
          outline: 0;
          color: #435066;
          background: white;
          font-size: 12px;
        }

        .framework-select {
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
          padding: 12px 16px;
          color: #758196;
          background: #f8fafc;
          border-top: 1px solid var(--line);
          border-bottom: 1px solid var(--line);
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        th:first-child,
        td:first-child {
          padding-left: 22px;
        }

        td {
          position: relative;
          padding: 15px 16px;
          border-bottom: 1px solid #edf0f4;
          font-size: 12px;
          color: #475467;
        }

        tbody tr:last-child td {
          border-bottom: 0;
        }

        tbody tr:hover {
          background: #fbfcfe;
        }

        .evidence-name {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 0;
          text-align: left;
          border: 0;
          background: transparent;
          color: inherit;
        }

        .file-icon {
          width: 37px;
          height: 37px;
          color: #3764c9;
          background: #edf3ff;
        }

        .evidence-name strong {
          display: block;
          color: #263248;
          font-size: 12px;
          font-weight: 600;
        }

        .evidence-name small {
          display: block;
          margin-top: 5px;
          color: #8b95a5;
          font-size: 10px;
        }

        .framework-tag {
          display: inline-flex;
          padding: 5px 8px;
          color: #495a78;
          background: #f0f3f8;
          border-radius: 5px;
          font-size: 10px;
          font-weight: 600;
        }

        .owner,
        .date-cell {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: #687386;
          font-size: 11px;
        }

        .expired-date {
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
          border-radius: 50%;
          background: currentColor;
        }

        .status-badge.green {
          color: #16814a;
          background: #e9f9ef;
        }

        .status-badge.amber {
          color: #a86a0b;
          background: #fff5df;
        }

        .status-badge.red {
          color: #bf3c3c;
          background: #fff0f0;
        }

        .status-badge.gray {
          color: #687386;
          background: #eef1f5;
        }

        .actions-cell {
          position: relative;
          text-align: right;
        }

        .icon-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 33px;
          height: 33px;
          border: 1px solid transparent;
          border-radius: 7px;
          color: #667085;
          background: transparent;
        }

        .icon-button:hover {
          border-color: var(--line);
          background: #f7f9fc;
        }

        .row-menu {
          position: absolute;
          z-index: 10;
          top: 48px;
          right: 14px;
          width: 190px;
          padding: 5px;
          background: white;
          border: 1px solid var(--line);
          border-radius: 9px;
          box-shadow: 0 10px 30px #17203318;
        }

        .row-menu button {
          display: flex;
          align-items: center;
          gap: 9px;
          width: 100%;
          padding: 9px;
          border: 0;
          border-radius: 6px;
          background: white;
          color: #475467;
          text-align: left;
          font-size: 11px;
        }

        .row-menu button:hover {
          background: #f4f6fa;
        }

        .row-menu .delete-action {
          color: #c34242;
          border-top: 1px solid #edf0f4;
          border-radius: 0 0 6px 6px;
        }

        .empty-state {
          padding: 48px 20px;
          text-align: center;
          color: #8a94a4;
        }

        .empty-state svg,
        .empty-state strong,
        .empty-state span {
          display: block;
          margin: 0 auto 10px;
        }

        .empty-state strong {
          color: #344054;
        }

        .empty-state span {
          font-size: 11px;
        }

        .table-footer {
          padding: 14px 22px;
          border-top: 1px solid var(--line);
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
          width: 39px;
          height: 39px;
          margin-bottom: 15px;
        }

        .blue-info {
          color: #2856c7;
          background: #edf3ff;
        }

        .green-info {
          color: #16814a;
          background: #e9f9ef;
        }

        .amber-info {
          color: #ad6b0b;
          background: #fff6e5;
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
          width: 100%;
          box-sizing: border-box;
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

        .eyebrow {
          display: block;
          margin-bottom: 8px;
          color: #6b7a94;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .detail-status {
          justify-content: flex-start;
          margin-bottom: 20px;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .detail-item {
          padding: 13px;
          border: 1px solid var(--line);
          border-radius: 8px;
          min-width: 0;
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
          border-radius: 9px;
          background: #f7f9fc;
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
          .stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .bottom-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 650px) {
          .evidence-page {
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
            padding: 13px;
            gap: 9px;
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

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-item">
      <span>{label}</span>
      <strong>{value || "Not set"}</strong>
    </div>
  );
}
