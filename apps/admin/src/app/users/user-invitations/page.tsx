// ModelNow Admin Users page
"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  Search,
  UserPlus,
  Users,
  Clock3,
  CheckCircle2,
  XCircle,
  Mail,
  Building2,
  CalendarDays,
  Download,
  Filter,
  RefreshCw,
  X,
  Send,
  Copy,
  Trash2,
  Eye,
  ShieldCheck,
} from "lucide-react";

type InvitationStatus = "Pending" | "Accepted" | "Expired" | "Revoked";

type Invitation = {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: string;
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  status: InvitationStatus;
};

const initialInvitations: Invitation[] = [
  {
    id: "INV-2001",
    name: "Emma Johnson",
    email: "emma.johnson@example.com",
    role: "Member",
    organization: "Acme Corporation",
    invitedBy: "Admin",
    invitedAt: "2026-11-02",
    expiresAt: "2026-11-09",
    status: "Pending",
  },
  {
    id: "INV-2002",
    name: "Liam Smith",
    email: "liam.smith@example.com",
    role: "Developer",
    organization: "Nova Systems",
    invitedBy: "Sarah Chen",
    invitedAt: "2026-11-01",
    expiresAt: "2026-11-08",
    status: "Pending",
  },
  {
    id: "INV-2003",
    name: "Olivia Brown",
    email: "olivia.brown@example.com",
    role: "Analyst",
    organization: "Bright Labs",
    invitedBy: "Admin",
    invitedAt: "2026-10-25",
    expiresAt: "2026-11-01",
    status: "Expired",
  },
  {
    id: "INV-2004",
    name: "Noah Davis",
    email: "noah.davis@example.com",
    role: "Member",
    organization: "Vertex AI",
    invitedBy: "James Wilson",
    invitedAt: "2026-10-30",
    expiresAt: "2026-11-06",
    status: "Accepted",
  },
  {
    id: "INV-2005",
    name: "Ava Martinez",
    email: "ava.martinez@example.com",
    role: "Developer",
    organization: "Acme Corporation",
    invitedBy: "Admin",
    invitedAt: "2026-10-29",
    expiresAt: "2026-11-05",
    status: "Pending",
  },
  {
    id: "INV-2006",
    name: "Ethan Wilson",
    email: "ethan.wilson@example.com",
    role: "Member",
    organization: "Nova Systems",
    invitedBy: "Sarah Chen",
    invitedAt: "2026-10-20",
    expiresAt: "2026-10-27",
    status: "Revoked",
  },
  {
    id: "INV-2007",
    name: "Sophia Taylor",
    email: "sophia.taylor@example.com",
    role: "Analyst",
    organization: "Bright Labs",
    invitedBy: "Admin",
    invitedAt: "2026-10-31",
    expiresAt: "2026-11-07",
    status: "Pending",
  },
];

function MetricCard({
  label,
  value,
  detail,
  icon,
  tone,
}: {
  label: string;
  value: number;
  detail: string;
  icon: ReactNode;
  tone: string;
}) {
  return (
    <div className="metric-card">
      <div className={`metric-icon ${tone}`}>{icon}</div>
      <div className="metric-content">
        <p>{label}</p>
        <h3>{value}</h3>
        <span>{detail}</span>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: InvitationStatus }) {
  const className = status.toLowerCase();

  return (
    <span className={`status-badge ${className}`}>
      <span className="status-dot" />
      {status}
    </span>
  );
}

export default function UserInvitationsPage() {
  const [invitations, setInvitations] = useState(initialInvitations);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [organizationFilter, setOrganizationFilter] =
    useState("All organizations");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedInvitation, setSelectedInvitation] =
    useState<Invitation | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    invitation: Invitation;
    action: "revoke" | "delete" | "resend";
  } | null>(null);
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "Member",
    organization: "Acme Corporation",
  });
  const [formError, setFormError] = useState("");

  const organizations = useMemo(
    () => Array.from(new Set(invitations.map((item) => item.organization))),
    [invitations]
  );

  const filteredInvitations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return invitations.filter((item) => {
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query) ||
        item.invitedBy.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All statuses" || item.status === statusFilter;

      const matchesOrganization =
        organizationFilter === "All organizations" ||
        item.organization === organizationFilter;

      return matchesSearch && matchesStatus && matchesOrganization;
    });
  }, [invitations, search, statusFilter, organizationFilter]);

  const pendingCount = invitations.filter(
    (item) => item.status === "Pending"
  ).length;
  const acceptedCount = invitations.filter(
    (item) => item.status === "Accepted"
  ).length;
  const expiredCount = invitations.filter(
    (item) => item.status === "Expired"
  ).length;

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3500);
  };

  const createInvitation = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    const email = form.email.trim().toLowerCase();

    if (!form.name.trim() || !email) {
      setFormError("Enter the recipient's name and email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError("Enter a valid email address.");
      return;
    }

    if (
      invitations.some(
        (item) =>
          item.email.toLowerCase() === email && item.status === "Pending"
      )
    ) {
      setFormError("A pending invitation already exists for this email.");
      return;
    }

    const now = new Date();
    const expires = new Date(now);
    expires.setDate(expires.getDate() + 7);

    const formatDate = (date: Date) =>
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
        date.getDate()
      ).padStart(2, "0")}`;

    const invitation: Invitation = {
      id: `INV-${Math.floor(2000 + Math.random() * 8000)}`,
      name: form.name.trim(),
      email,
      role: form.role,
      organization: form.organization,
      invitedBy: "Admin",
      invitedAt: formatDate(now),
      expiresAt: formatDate(expires),
      status: "Pending",
    };

    setInvitations((current) => [invitation, ...current]);
    setShowCreateModal(false);
    setForm({
      name: "",
      email: "",
      role: "Member",
      organization: organizations[0] || "Acme Corporation",
    });
    showNotice(
      `Invitation created for ${invitation.email}. Email delivery is not connected in this demo.`
    );
  };

  const handleAction = () => {
    if (!confirmAction) return;

    const { invitation, action } = confirmAction;

    if (action === "delete") {
      setInvitations((current) =>
        current.filter((item) => item.id !== invitation.id)
      );
      showNotice(`Invitation ${invitation.id} deleted from this demo.`);
    } else if (action === "revoke") {
      setInvitations((current) =>
        current.map((item) =>
          item.id === invitation.id ? { ...item, status: "Revoked" } : item
        )
      );
      showNotice(`Invitation for ${invitation.email} revoked in this demo.`);
    } else {
      setInvitations((current) =>
        current.map((item) =>
          item.id === invitation.id
            ? {
                ...item,
                status: "Pending",
                invitedAt: new Date().toISOString().slice(0, 10),
              }
            : item
        )
      );
      showNotice(
        `Invitation marked for resending to ${invitation.email}. Email delivery is not connected.`
      );
    }

    setConfirmAction(null);
    setSelectedInvitation(null);
  };

  const copyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      showNotice("Email address copied.");
    } catch {
      showNotice(`Email address: ${email}`);
    }
  };

  const exportCsv = () => {
    const headers = [
      "Invitation ID",
      "Name",
      "Email",
      "Role",
      "Organization",
      "Invited By",
      "Invited At",
      "Expires At",
      "Status",
    ];

    const rows = filteredInvitations.map((item) => [
      item.id,
      item.name,
      item.email,
      item.role,
      item.organization,
      item.invitedBy,
      item.invitedAt,
      item.expiresAt,
      item.status,
    ]);

    const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "modelnow-user-invitations.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All statuses");
    setOrganizationFilter("All organizations");
  };

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <div className="breadcrumbs">
            <span>Admin</span>
            <span>/</span>
            <span>Users</span>
            <span>/</span>
            <strong>User Invitations</strong>
          </div>
          <h1>User Invitations</h1>
          <p className="subtitle">
            Invite people to ModelNow, manage access requests, and track
            invitation status.
          </p>
        </div>

        <div className="header-actions">
          <button className="button secondary" onClick={exportCsv}>
            <Download size={16} />
            Export CSV
          </button>
          <button
            className="button primary"
            onClick={() => setShowCreateModal(true)}
          >
            <UserPlus size={16} />
            Invite user
          </button>
        </div>
      </header>

      {notice && (
        <div className="notice">
          <CheckCircle2 size={18} />
          <span>{notice}</span>
          <button onClick={() => setNotice("")} aria-label="Dismiss notification">
            <X size={16} />
          </button>
        </div>
      )}

      <section className="metrics-grid">
        <MetricCard
          label="Total Invitations"
          value={invitations.length}
          detail="All invitation records"
          icon={<Mail size={20} />}
          tone="blue"
        />
        <MetricCard
          label="Pending Invitations"
          value={pendingCount}
          detail="Awaiting response"
          icon={<Clock3 size={20} />}
          tone="orange"
        />
        <MetricCard
          label="Accepted Invitations"
          value={acceptedCount}
          detail="Successfully accepted"
          icon={<CheckCircle2 size={20} />}
          tone="green"
        />
        <MetricCard
          label="Expired Invitations"
          value={expiredCount}
          detail="Require a new invitation"
          icon={<XCircle size={20} />}
          tone="red"
        />
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Invitation management</h2>
            <p>Review invitations and manage outstanding requests.</p>
          </div>
          <span className="count-badge">
            {filteredInvitations.length} invitations
          </span>
        </div>

        <div className="toolbar">
          <div className="search-box">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, invitation ID..."
              aria-label="Search invitations"
            />
            {search && (
              <button
                className="icon-button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <button
            className={`button secondary ${showFilters ? "active-filter" : ""}`}
            onClick={() => setShowFilters((current) => !current)}
          >
            <Filter size={16} />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="filter-row">
            <label>
              Invitation status
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option>All statuses</option>
                <option>Pending</option>
                <option>Accepted</option>
                <option>Expired</option>
                <option>Revoked</option>
              </select>
            </label>

            <label>
              Organization
              <select
                value={organizationFilter}
                onChange={(event) =>
                  setOrganizationFilter(event.target.value)
                }
              >
                <option>All organizations</option>
                {organizations.map((organization) => (
                  <option key={organization}>{organization}</option>
                ))}
              </select>
            </label>

            <button className="reset-button" onClick={resetFilters}>
              Reset filters
            </button>
          </div>
        )}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Invitee</th>
                <th>Organization</th>
                <th>Role</th>
                <th>Invited by</th>
                <th>Invitation date</th>
                <th>Expires</th>
                <th>Status</th>
                <th className="actions-heading">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvitations.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="user-cell">
                      <div className="avatar">
                        {item.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div className="user-info">
                        <strong>{item.name}</strong>
                        <span>{item.email}</span>
                        <small>{item.id}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="organization-cell">
                      <Building2 size={15} />
                      {item.organization}
                    </div>
                  </td>
                  <td>
                    <span className="role-badge">{item.role}</span>
                  </td>
                  <td>{item.invitedBy}</td>
                  <td>
                    <div className="date-cell">
                      <CalendarDays size={14} />
                      {item.invitedAt}
                    </div>
                  </td>
                  <td>
                    <span
                      className={
                        item.status === "Expired"
                          ? "expiry-date expired-text"
                          : "expiry-date"
                      }
                    >
                      {item.expiresAt}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={item.status} />
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="icon-button"
                        title="View invitation"
                        aria-label={`View ${item.id}`}
                        onClick={() => setSelectedInvitation(item)}
                      >
                        <Eye size={16} />
                      </button>
                      {item.status === "Pending" || item.status === "Expired" ? (
                        <button
                          className="icon-button resend-icon"
                          title="Resend invitation"
                          aria-label={`Resend ${item.id}`}
                          onClick={() =>
                            setConfirmAction({
                              invitation: item,
                              action: "resend",
                            })
                          }
                        >
                          <RefreshCw size={16} />
                        </button>
                      ) : null}
                      {item.status === "Pending" && (
                        <button
                          className="icon-button revoke-icon"
                          title="Revoke invitation"
                          aria-label={`Revoke ${item.id}`}
                          onClick={() =>
                            setConfirmAction({
                              invitation: item,
                              action: "revoke",
                            })
                          }
                        >
                          <XCircle size={16} />
                        </button>
                      )}
                      <button
                        className="icon-button delete-icon"
                        title="Delete invitation"
                        aria-label={`Delete ${item.id}`}
                        onClick={() =>
                          setConfirmAction({
                            invitation: item,
                            action: "delete",
                          })
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredInvitations.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <Mail size={30} />
                      <strong>No invitations found</strong>
                      <p>Try changing your search or filters.</p>
                      <button className="button secondary" onClick={resetFilters}>
                        Clear filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="table-footer">
          <span>
            Showing {filteredInvitations.length} of {invitations.length} invitations
          </span>
          <span className="footer-note">
            <ShieldCheck size={14} />
            Demo data
          </span>
        </footer>
      </section>

      {showCreateModal && (
        <div
          className="modal-backdrop"
          onClick={() => {
            setShowCreateModal(false);
            setFormError("");
          }}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="modal-header">
              <div>
                <span className="eyebrow">ACCESS MANAGEMENT</span>
                <h2 id="create-title">Invite a user</h2>
                <p>Create an invitation for a new ModelNow user.</p>
              </div>
              <button
                className="icon-button"
                onClick={() => {
                  setShowCreateModal(false);
                  setFormError("");
                }}
                aria-label="Close invite form"
              >
                <X size={19} />
              </button>
            </header>

            <form onSubmit={createInvitation}>
              <div className="form-grid">
                <label>
                  Full name
                  <input
                    value={form.name}
                    onChange={(event) =>
                      setForm({ ...form, name: event.target.value })
                    }
                    placeholder="Enter full name"
                    required
                  />
                </label>

                <label>
                  Email address
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      setForm({ ...form, email: event.target.value })
                    }
                    placeholder="name@company.com"
                    required
                  />
                </label>

                <label>
                  Organization
                  <select
                    value={form.organization}
                    onChange={(event) =>
                      setForm({ ...form, organization: event.target.value })
                    }
                  >
                    {organizations.map((organization) => (
                      <option key={organization}>{organization}</option>
                    ))}
                    {organizations.length === 0 && (
                      <option>Acme Corporation</option>
                    )}
                  </select>
                </label>

                <label>
                  Assigned role
                  <select
                    value={form.role}
                    onChange={(event) =>
                      setForm({ ...form, role: event.target.value })
                    }
                  >
                    <option>Member</option>
                    <option>Developer</option>
                    <option>Analyst</option>
                    <option>Administrator</option>
                    <option>Viewer</option>
                  </select>
                </label>
              </div>

              <div className="invitation-info">
                <Clock3 size={17} />
                <span>
                  Invitations are configured to expire after 7 days in this
                  demo. No email will be sent without a backend integration.
                </span>
              </div>

              {formError && <p className="form-error">{formError}</p>}

              <footer className="modal-footer">
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormError("");
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="button primary">
                  <Send size={16} />
                  Create invitation
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}

      {selectedInvitation && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedInvitation(null)}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="details-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="modal-header">
              <div>
                <span className="eyebrow">INVITATION DETAILS</span>
                <h2 id="details-title">{selectedInvitation.id}</h2>
                <p>Invitation record and access information.</p>
              </div>
              <button
                className="icon-button"
                onClick={() => setSelectedInvitation(null)}
                aria-label="Close details"
              >
                <X size={19} />
              </button>
            </header>

            <div className="modal-user">
              <div className="avatar large">
                {selectedInvitation.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div className="modal-user-content">
                <h3>{selectedInvitation.name}</h3>
                <p>{selectedInvitation.email}</p>
                <StatusBadge status={selectedInvitation.status} />
              </div>
              <button
                className="icon-button"
                title="Copy email"
                aria-label="Copy invitee email"
                onClick={() => copyEmail(selectedInvitation.email)}
              >
                <Copy size={16} />
              </button>
            </div>

            <div className="detail-grid">
              <div>
                <span>Organization</span>
                <strong>{selectedInvitation.organization}</strong>
              </div>
              <div>
                <span>Assigned role</span>
                <strong>{selectedInvitation.role}</strong>
              </div>
              <div>
                <span>Invited by</span>
                <strong>{selectedInvitation.invitedBy}</strong>
              </div>
              <div>
                <span>Invitation date</span>
                <strong>{selectedInvitation.invitedAt}</strong>
              </div>
              <div>
                <span>Expiration date</span>
                <strong>{selectedInvitation.expiresAt}</strong>
              </div>
              <div>
                <span>Invitation ID</span>
                <strong>{selectedInvitation.id}</strong>
              </div>
            </div>

            <div className="invitation-info">
              <Mail size={17} />
              <span>
                Invitation email delivery and acceptance tracking require
                backend integration.
              </span>
            </div>

            <footer className="modal-footer">
              <button
                className="button secondary"
                onClick={() => setSelectedInvitation(null)}
              >
                Close
              </button>
              {(selectedInvitation.status === "Pending" ||
                selectedInvitation.status === "Expired") && (
                <button
                  className="button primary"
                  onClick={() => {
                    setConfirmAction({
                      invitation: selectedInvitation,
                      action: "resend",
                    });
                    setSelectedInvitation(null);
                  }}
                >
                  <RefreshCw size={16} />
                  Resend invitation
                </button>
              )}
            </footer>
          </section>
        </div>
      )}

      {confirmAction && (
        <div
          className="modal-backdrop"
          onClick={() => setConfirmAction(null)}
        >
          <section
            className="modal confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className={`confirm-icon ${
                confirmAction.action === "delete" ||
                confirmAction.action === "revoke"
                  ? "confirm-danger"
                  : ""
              }`}
            >
              {confirmAction.action === "resend" ? (
                <RefreshCw size={23} />
              ) : confirmAction.action === "revoke" ? (
                <XCircle size={23} />
              ) : (
                <Trash2 size={23} />
              )}
            </div>

            <h2 id="confirm-title">
              {confirmAction.action === "resend"
                ? "Resend this invitation?"
                : confirmAction.action === "revoke"
                  ? "Revoke this invitation?"
                  : "Delete this invitation?"}
            </h2>

            <p>
              {confirmAction.action === "resend"
                ? `The invitation for ${confirmAction.invitation.email} will be marked as pending again. No email will actually be sent.`
                : confirmAction.action === "revoke"
                  ? `The invitation for ${confirmAction.invitation.email} will be marked as revoked in this demo.`
                  : `The invitation record for ${confirmAction.invitation.email} will be permanently removed from this demo list.`}
            </p>

            <div className="confirm-user">
              <Mail size={18} />
              <div>
                <strong>{confirmAction.invitation.name}</strong>
                <span>{confirmAction.invitation.email}</span>
              </div>
            </div>

            <footer className="modal-footer">
              <button
                className="button secondary"
                onClick={() => setConfirmAction(null)}
              >
                Cancel
              </button>
              <button
                className={`button ${
                  confirmAction.action === "resend" ? "primary" : "danger"
                }`}
                onClick={handleAction}
              >
                {confirmAction.action === "resend" ? (
                  <RefreshCw size={16} />
                ) : confirmAction.action === "revoke" ? (
                  <XCircle size={16} />
                ) : (
                  <Trash2 size={16} />
                )}
                {confirmAction.action === "resend"
                  ? "Confirm resend"
                  : confirmAction.action === "revoke"
                    ? "Confirm revoke"
                    : "Delete invitation"}
              </button>
            </footer>
          </section>
        </div>
      )}

      <style jsx>{`
        .page {
          min-height: 100vh;
          padding: 30px;
          background: #f8fafc;
          color: #172033;
          font-family: Arial, Helvetica, sans-serif;
        }
        .page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 26px;
        }
        .breadcrumbs {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
          align-items: center;
          margin-bottom: 12px;
          color: #8a94a6;
          font-size: 12px;
        }
        .breadcrumbs strong {
          color: #475569;
        }
        h1 {
          margin: 0;
          font-size: 27px;
          letter-spacing: -0.7px;
          font-weight: 750;
        }
        .subtitle {
          margin: 9px 0 0;
          color: #748096;
          font-size: 14px;
          line-height: 1.6;
        }
        .header-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
        }
        .button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 39px;
          padding: 0 14px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: 0.18s ease;
        }
        .secondary {
          border: 1px solid #dfe5ed;
          background: white;
          color: #344054;
        }
        .secondary:hover {
          border-color: #bfc9d8;
          background: #f8fafc;
        }
        .primary {
          border: 1px solid #315fea;
          background: #315fea;
          color: white;
        }
        .primary:hover {
          background: #244dcc;
        }
        .danger {
          border: 1px solid #ffd4d4;
          background: #fff2f2;
          color: #c63838;
        }
        .danger:hover {
          background: #ffe7e7;
        }
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 22px;
        }
        .metric-card {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          min-width: 0;
          padding: 20px;
          border: 1px solid #e7ebf1;
          border-radius: 12px;
          background: white;
        }
        .metric-icon {
          display: grid;
          place-items: center;
          width: 43px;
          height: 43px;
          flex-shrink: 0;
          border-radius: 11px;
        }
        .metric-content p {
          margin: 1px 0 9px;
          color: #667085;
          font-size: 12px;
          font-weight: 600;
        }
        .metric-content h3 {
          margin: 0 0 7px;
          font-size: 27px;
          line-height: 1;
          letter-spacing: -0.7px;
        }
        .metric-content span {
          color: #8993a4;
          font-size: 11px;
        }
        .blue {
          background: #eaf2ff;
          color: #3268d8;
        }
        .orange {
          background: #fff4e8;
          color: #c77720;
        }
        .green {
          background: #e9f9ef;
          color: #16834b;
        }
        .red {
          background: #fff0f0;
          color: #d14343;
        }
        .panel {
          overflow: hidden;
          border: 1px solid #e5eaf1;
          border-radius: 12px;
          background: white;
        }
        .panel-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 22px 22px 17px;
        }
        .panel-heading h2 {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
        }
        .panel-heading p {
          margin: 6px 0 0;
          color: #8590a2;
          font-size: 12px;
        }
        .count-badge {
          padding: 6px 10px;
          border-radius: 7px;
          background: #f2f5f9;
          color: #526177;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
        }
        .toolbar {
          display: flex;
          gap: 10px;
          padding: 0 22px 18px;
        }
        .search-box {
          display: flex;
          align-items: center;
          gap: 9px;
          flex: 1;
          min-width: 120px;
          height: 40px;
          padding: 0 12px;
          border: 1px solid #e0e6ee;
          border-radius: 8px;
          color: #98a2b3;
        }
        .search-box:focus-within {
          border-color: #8aa9fa;
          box-shadow: 0 0 0 3px #315fea12;
        }
        .search-box input {
          width: 100%;
          border: none;
          outline: none;
          background: transparent;
          color: #344054;
          font-size: 12px;
        }
        .search-box input::placeholder {
          color: #9aa4b2;
        }
        .active-filter {
          border-color: #b9ccff;
          background: #eff4ff;
          color: #315fea;
        }
        .filter-row {
          display: flex;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: 14px;
          padding: 16px 22px;
          border-top: 1px solid #edf0f5;
          border-bottom: 1px solid #edf0f5;
          background: #fbfcfe;
        }
        .filter-row label {
          display: flex;
          flex-direction: column;
          gap: 7px;
          min-width: 190px;
          color: #687589;
          font-size: 11px;
          font-weight: 600;
        }
        .filter-row select,
        .form-grid select,
        .form-grid input {
          width: 100%;
          height: 39px;
          padding: 0 10px;
          border: 1px solid #dfe5ed;
          border-radius: 7px;
          outline: none;
          background: white;
          color: #344054;
          font-size: 12px;
        }
        .filter-row select:focus,
        .form-grid select:focus,
        .form-grid input:focus {
          border-color: #8aa9fa;
          box-shadow: 0 0 0 3px #315fea12;
        }
        .reset-button {
          height: 37px;
          border: 0;
          background: transparent;
          color: #315fea;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }
        .table-wrap {
          width: 100%;
          overflow-x: auto;
        }
        table {
          width: 100%;
          min-width: 1180px;
          border-collapse: collapse;
          text-align: left;
        }
        thead {
          background: #f8fafc;
        }
        th {
          padding: 13px 14px;
          border-top: 1px solid #edf0f4;
          border-bottom: 1px solid #edf0f4;
          color: #778397;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.45px;
          text-transform: uppercase;
          white-space: nowrap;
        }
        th:first-child,
        td:first-child {
          padding-left: 22px;
        }
        th:last-child,
        td:last-child {
          padding-right: 22px;
        }
        td {
          padding: 15px 14px;
          border-bottom: 1px solid #eef1f5;
          color: #475467;
          font-size: 12px;
          vertical-align: middle;
        }
        tbody tr:last-child td {
          border-bottom: none;
        }
        tbody tr:hover {
          background: #fbfcff;
        }
        .user-cell {
          display: flex;
          align-items: center;
          gap: 11px;
          min-width: 210px;
        }
        .avatar {
          display: grid;
          place-items: center;
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          border-radius: 50%;
          background: #eaf0ff;
          color: #3157b7;
          font-size: 11px;
          font-weight: 700;
        }
        .avatar.large {
          width: 52px;
          height: 52px;
          font-size: 15px;
        }
        .user-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }
        .user-info strong {
          color: #263248;
          font-size: 12px;
          font-weight: 700;
        }
        .user-info span {
          color: #7e899a;
          font-size: 11px;
        }
        .user-info small {
          color: #a0a8b6;
          font-size: 10px;
        }
        .organization-cell {
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          color: #46536a;
        }
        .organization-cell :global(svg) {
          flex-shrink: 0;
          color: #8b96a8;
        }
        .role-badge {
          display: inline-block;
          padding: 5px 8px;
          border: 1px solid #e1e7f0;
          border-radius: 6px;
          background: #f8fafc;
          color: #5d697d;
          font-size: 10px;
          font-weight: 600;
        }
        .date-cell {
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }
        .date-cell :global(svg) {
          color: #9aa4b2;
        }
        .expiry-date {
          color: #586579;
          font-size: 11px;
          white-space: nowrap;
        }
        .expired-text {
          color: #c63838;
          font-weight: 600;
        }
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 8px;
          border: 1px solid;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 700;
          white-space: nowrap;
        }
        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }
        .status-badge.pending {
          border-color: #fed7aa;
          background: #fff7ed;
          color: #c46a16;
        }
        .status-badge.pending .status-dot {
          background: #ea8a2f;
        }
        .status-badge.accepted {
          border-color: #bbf7d0;
          background: #ecfdf3;
          color: #16834b;
        }
        .status-badge.accepted .status-dot {
          background: #16a34a;
        }
        .status-badge.expired {
          border-color: #ffd6d6;
          background: #fff2f2;
          color: #c63838;
        }
        .status-badge.expired .status-dot {
          background: #dc4545;
        }
        .status-badge.revoked {
          border-color: #e1e5eb;
          background: #f4f5f7;
          color: #687385;
        }
        .status-badge.revoked .status-dot {
          background: #8c96a5;
        }
        .action-buttons {
          display: flex;
          align-items: center;
          gap: 3px;
        }
        .icon-button {
          display: inline-grid;
          place-items: center;
          width: 31px;
          height: 31px;
          border: 1px solid transparent;
          border-radius: 7px;
          background: transparent;
          color: #758196;
          cursor: pointer;
          transition: 0.15s ease;
        }
        .icon-button:hover {
          border-color: #e2e8f0;
          background: #f1f5fb;
          color: #315fea;
        }
        .resend-icon:hover {
          border-color: #c7d7fe;
          background: #eff4ff;
          color: #315fea;
        }
        .revoke-icon:hover,
        .delete-icon:hover {
          border-color: #ffd4d4;
          background: #fff2f2;
          color: #c63838;
        }
        .actions-heading {
          text-align: right;
        }
        .table-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 15px 22px;
          border-top: 1px solid #edf0f4;
          color: #8993a4;
          font-size: 11px;
        }
        .footer-note {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 48px 20px;
          color: #97a2b3;
          text-align: center;
        }
        .empty-state strong {
          margin-top: 12px;
          color: #344054;
          font-size: 14px;
        }
        .empty-state p {
          margin: 7px 0 16px;
          font-size: 12px;
        }
        .notice {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
          padding: 12px 14px;
          border: 1px solid #bbf7d0;
          border-radius: 9px;
          background: #f0fdf4;
          color: #167344;
          font-size: 13px;
        }
        .notice span {
          flex: 1;
        }
        .notice button {
          display: grid;
          place-items: center;
          padding: 3px;
          border: none;
          background: transparent;
          color: inherit;
          cursor: pointer;
        }
        .modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: #0f172a7a;
          backdrop-filter: blur(3px);
        }
        .modal {
          width: 100%;
          max-width: 570px;
          max-height: calc(100vh - 40px);
          overflow-y: auto;
          padding: 24px;
          border: 1px solid #e8edf4;
          border-radius: 15px;
          background: white;
          box-shadow: 0 25px 80px #0f172a30;
        }
        .modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 22px;
        }
        .eyebrow {
          color: #8995a7;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
        }
        .modal-header h2 {
          margin: 7px 0 0;
          font-size: 20px;
          letter-spacing: -0.4px;
        }
        .modal-header p {
          margin: 7px 0 0;
          color: #8590a2;
          font-size: 12px;
        }
        .modal-user {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 17px;
          border: 1px solid #e9edf3;
          border-radius: 11px;
          background: #fbfcfe;
        }
        .modal-user-content {
          flex: 1;
          min-width: 0;
        }
        .modal-user h3 {
          margin: 0 0 5px;
          color: #263248;
          font-size: 15px;
        }
        .modal-user p {
          margin: 0 0 9px;
          color: #8590a2;
          font-size: 12px;
          overflow-wrap: anywhere;
        }
        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0 18px;
          margin: 18px 0;
        }
        .detail-grid > div {
          display: flex;
          flex-direction: column;
          gap: 7px;
          padding: 13px 0;
          border-bottom: 1px solid #edf0f4;
        }
        .detail-grid span {
          color: #8993a4;
          font-size: 11px;
        }
        .detail-grid strong {
          overflow-wrap: anywhere;
          color: #344054;
          font-size: 12px;
          font-weight: 600;
        }
        .invitation-info {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 13px;
          border: 1px solid #d9e6ff;
          border-radius: 9px;
          background: #f5f8ff;
          color: #315fea;
        }
        .invitation-info :global(svg) {
          flex-shrink: 0;
          margin-top: 1px;
        }
        .invitation-info span {
          color: #60749a;
          font-size: 11px;
          line-height: 1.65;
        }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 17px;
        }
        .form-grid label {
          display: flex;
          flex-direction: column;
          gap: 8px;
          color: #475467;
          font-size: 12px;
          font-weight: 600;
        }
        .form-error {
          margin: 12px 0 0;
          color: #c63838;
          font-size: 12px;
        }
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          flex-wrap: wrap;
          gap: 9px;
          margin-top: 22px;
        }
        .confirm-modal {
          max-width: 430px;
          text-align: center;
        }
        .confirm-icon {
          display: grid;
          place-items: center;
          width: 54px;
          height: 54px;
          margin: 0 auto 16px;
          border-radius: 50%;
          background: #eaf8ef;
          color: #16834b;
        }
        .confirm-icon.confirm-danger {
          background: #fff0f0;
          color: #c63838;
        }
        .confirm-modal h2 {
          margin: 0;
          font-size: 20px;
        }
        .confirm-modal > p {
          margin: 10px 0 18px;
          color: #778397;
          font-size: 13px;
          line-height: 1.65;
        }
        .confirm-user {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 13px;
          border: 1px solid #e8edf3;
          border-radius: 9px;
          background: #fbfcfe;
          text-align: left;
        }
        .confirm-user > :global(svg) {
          flex-shrink: 0;
          color: #7c8ba1;
        }
        .confirm-user div {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }
        .confirm-user strong {
          color: #344054;
          font-size: 12px;
        }
        .confirm-user span {
          overflow-wrap: anywhere;
          color: #8993a4;
          font-size: 11px;
        }
        @media (max-width: 1100px) {
          .metrics-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .page {
            padding: 22px;
          }
        }
        @media (max-width: 650px) {
          .page {
            padding: 16px;
          }
          .page-header {
            flex-direction: column;
          }
          .header-actions {
            width: 100%;
          }
          .metrics-grid {
            grid-template-columns: 1fr;
          }
          .panel-heading {
            align-items: flex-start;
          }
          .toolbar {
            flex-wrap: wrap;
          }
          .search-box {
            flex-basis: 100%;
          }
          .filter-row label {
            width: 100%;
          }
          .filter-row select {
            width: 100%;
          }
          .form-grid,
          .detail-grid {
            grid-template-columns: 1fr;
          }
          .modal {
            padding: 18px;
          }
          .modal-footer .button {
            flex: 1;
          }
        }
      `}</style>
    </main>
  );
}