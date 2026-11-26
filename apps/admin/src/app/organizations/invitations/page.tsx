
"use client";

import { useMemo, useState, type CSSProperties } from "react";
import {
  Mail,
  Users,
  Clock3,
  CheckCircle2,
  XCircle,
  Search,
  Plus,
  X,
  RefreshCw,
  Copy,
  Send,
  Ban,
  Filter,
  MoreHorizontal,
  ShieldCheck,
  CalendarDays,
} from "lucide-react";

type InvitationStatus = "Pending" | "Accepted" | "Expired" | "Cancelled";
type InvitationRole = "Admin" | "Developer" | "Member" | "Viewer";

type Invitation = {
  id: string;
  email: string;
  role: InvitationRole;
  team: string;
  invitedBy: string;
  sentAt: string;
  expiresAt: string;
  status: InvitationStatus;
  token: string;
};

const initialInvitations: Invitation[] = [
  {
    id: "INV-1001",
    email: "olivia.martin@example.com",
    role: "Admin",
    team: "Platform Engineering",
    invitedBy: "Pujitha Marikanti",
    sentAt: "Nov 01, 2026",
    expiresAt: "Nov 08, 2026",
    status: "Pending",
    token: "demo-invite-1001",
  },
  {
    id: "INV-1002",
    email: "ethan.williams@example.com",
    role: "Developer",
    team: "AI Research",
    invitedBy: "Pujitha Marikanti",
    sentAt: "Oct 30, 2026",
    expiresAt: "Nov 06, 2026",
    status: "Pending",
    token: "demo-invite-1002",
  },
  {
    id: "INV-1003",
    email: "sophia.chen@example.com",
    role: "Member",
    team: "Customer Success",
    invitedBy: "Workspace Admin",
    sentAt: "Oct 25, 2026",
    expiresAt: "Nov 01, 2026",
    status: "Accepted",
    token: "demo-invite-1003",
  },
  {
    id: "INV-1004",
    email: "noah.johnson@example.com",
    role: "Viewer",
    team: "Security & Compliance",
    invitedBy: "Workspace Admin",
    sentAt: "Oct 20, 2026",
    expiresAt: "Oct 27, 2026",
    status: "Expired",
    token: "demo-invite-1004",
  },
  {
    id: "INV-1005",
    email: "ava.patel@example.com",
    role: "Developer",
    team: "Platform Engineering",
    invitedBy: "Pujitha Marikanti",
    sentAt: "Oct 18, 2026",
    expiresAt: "Oct 25, 2026",
    status: "Cancelled",
    token: "demo-invite-1005",
  },
];

const roles: InvitationRole[] = ["Admin", "Developer", "Member", "Viewer"];

const teams = [
  "Platform Engineering",
  "AI Research",
  "Customer Success",
  "Security & Compliance",
  "Growth Marketing",
  "Unassigned",
];

const emptyInvitation = {
  email: "",
  role: "Member" as InvitationRole,
  team: "Unassigned",
};

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);

export default function InvitationsPage() {
  const [invitations, setInvitations] =
    useState<Invitation[]>(initialInvitations);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyInvitation);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedInvitation, setSelectedInvitation] =
    useState<Invitation | null>(null);

  const pendingCount = invitations.filter(
    (item) => item.status === "Pending",
  ).length;

  const acceptedCount = invitations.filter(
    (item) => item.status === "Accepted",
  ).length;

  const expiredCount = invitations.filter(
    (item) => item.status === "Expired",
  ).length;

  const filteredInvitations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return invitations.filter((item) => {
      const matchesSearch =
        !query ||
        item.email.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query) ||
        item.team.toLowerCase().includes(query) ||
        item.invitedBy.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      const matchesRole = roleFilter === "All" || item.role === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [invitations, search, statusFilter, roleFilter]);

  function notify(message: string) {
    setNotice(message);
  }

  function sendInvitation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const email = form.email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    const existing = invitations.find(
      (item) =>
        item.email.toLowerCase() === email &&
        item.status === "Pending",
    );

    if (existing) {
      setError("A pending invitation already exists for this email.");
      return;
    }

    const now = new Date();
    const expires = new Date(now);
    expires.setDate(expires.getDate() + 7);

    const invitation: Invitation = {
      id: `INV-${Date.now().toString().slice(-6)}`,
      email,
      role: form.role,
      team: form.team,
      invitedBy: "Workspace Admin",
      sentAt: formatDate(now),
      expiresAt: formatDate(expires),
      status: "Pending",
      token: `demo-${Date.now().toString(36)}`,
    };

    setInvitations((current) => [invitation, ...current]);
    setModalOpen(false);
    setForm(emptyInvitation);
    notify(`Invitation prepared for ${email}.`);
  }

  async function copyInvitation(invitation: Invitation) {
    const link = `${window.location.origin}/invite/${invitation.token}`;

    try {
      await navigator.clipboard.writeText(link);
      notify("Demo invitation link copied.");
    } catch {
      notify(`Copy this demo link manually: ${link}`);
    }
  }

  function resendInvitation(invitation: Invitation) {
    const now = new Date();
    const expires = new Date(now);
    expires.setDate(expires.getDate() + 7);

    setInvitations((current) =>
      current.map((item) =>
        item.id === invitation.id
          ? {
              ...item,
              status: "Pending",
              sentAt: formatDate(now),
              expiresAt: formatDate(expires),
            }
          : item,
      ),
    );

    notify(`Invitation prepared for resending to ${invitation.email}.`);
  }

  function cancelInvitation(invitation: Invitation) {
    if (invitation.status !== "Pending") {
      notify("Only pending invitations can be cancelled.");
      return;
    }

    setInvitations((current) =>
      current.map((item) =>
        item.id === invitation.id
          ? { ...item, status: "Cancelled" }
          : item,
      ),
    );

    setSelectedInvitation(null);
    notify(`Invitation for ${invitation.email} cancelled.`);
  }

  function resetFilters() {
    setSearch("");
    setStatusFilter("All");
    setRoleFilter("All");
  }

  function statusClass(status: InvitationStatus) {
    switch (status) {
      case "Pending":
        return "iv-pending";
      case "Accepted":
        return "iv-accepted";
      case "Expired":
        return "iv-expired";
      default:
        return "iv-cancelled";
    }
  }

  function statusIcon(status: InvitationStatus) {
    switch (status) {
      case "Pending":
        return <Clock3 size={12} />;
      case "Accepted":
        return <CheckCircle2 size={12} />;
      case "Expired":
        return <XCircle size={12} />;
      default:
        return <Ban size={12} />;
    }
  }

  const cardStyle: CSSProperties = {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 20,
  };

  return (
    <main className="iv-page">
      <style>{`
        * { box-sizing: border-box; }

        .iv-page {
          min-height: 100vh;
          padding: 30px;
          background: #f7f8fc;
          color: #172033;
          font-family: Arial, Helvetica, sans-serif;
        }

        .iv-shell { max-width: 1450px; margin: 0 auto; }

        .iv-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 18px;
          margin-bottom: 25px;
        }

        .iv-eyebrow {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #64748b;
          font-size: 12px;
          margin-bottom: 10px;
        }

        .iv-page h1 {
          font-size: 28px;
          letter-spacing: -.7px;
          margin: 0 0 8px;
          font-weight: 750;
        }

        .iv-subtitle {
          color: #64748b;
          font-size: 14px;
          line-height: 1.6;
          margin: 0;
        }

        .iv-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 13px;
          border: 1px solid #dbe1eb;
          background: white;
          color: #344054;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 650;
          cursor: pointer;
          white-space: nowrap;
        }

        .iv-btn:hover { background: #f8fafc; }
        .iv-primary { background: #315fea; color: white; border-color: #315fea; }
        .iv-primary:hover { background: #244ed1; }

        .iv-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 15px;
          margin-bottom: 24px;
        }

        .iv-stat-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          color: #64748b;
          font-size: 12px;
        }

        .iv-stat-icon {
          width: 36px;
          height: 36px;
          display: grid;
          place-items: center;
          background: #eff4ff;
          color: #315fea;
          border-radius: 10px;
        }

        .iv-stat-value {
          font-size: 27px;
          font-weight: 750;
          margin-top: 15px;
        }

        .iv-stat-foot { color: #94a3b8; font-size: 12px; margin-top: 6px; }

        .iv-panel {
          border: 1px solid #e5e7eb;
          background: white;
          border-radius: 14px;
          overflow: hidden;
        }

        .iv-panel-head {
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          border-bottom: 1px solid #edf0f5;
        }

        .iv-panel-head h2 { margin: 0 0 5px; font-size: 16px; }
        .iv-panel-head p { margin: 0; color: #94a3b8; font-size: 12px; }

        .iv-filters {
          padding: 16px 20px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          border-bottom: 1px solid #edf0f5;
        }

        .iv-search { flex: 1; min-width: 220px; position: relative; }
        .iv-search svg {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .iv-search input {
          width: 100%;
          padding: 10px 12px 10px 37px;
          border: 1px solid #dfe4ec;
          border-radius: 9px;
          font-size: 13px;
          outline: none;
        }

        .iv-search input:focus, .iv-select:focus, .iv-field input:focus,
        .iv-field select:focus {
          border-color: #315fea;
          box-shadow: 0 0 0 3px #315fea16;
        }

        .iv-select {
          min-width: 135px;
          border: 1px solid #dfe4ec;
          border-radius: 9px;
          padding: 10px 12px;
          background: white;
          color: #344054;
          font-size: 13px;
          outline: none;
        }

        .iv-clear {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: 0;
          color: #315fea;
          cursor: pointer;
          font-size: 12px;
          font-weight: 650;
        }

        .iv-table-wrap { overflow-x: auto; }
        .iv-table { width: 100%; border-collapse: collapse; text-align: left; min-width: 950px; }

        .iv-table th {
          padding: 13px 17px;
          background: #fafbfc;
          border-bottom: 1px solid #edf0f5;
          color: #64748b;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: .3px;
        }

        .iv-table td {
          padding: 16px 17px;
          border-bottom: 1px solid #f0f2f6;
          font-size: 12px;
          vertical-align: middle;
        }

        .iv-table tbody tr:last-child td { border-bottom: 0; }
        .iv-table tbody tr:hover { background: #fafcff; }

        .iv-email-cell { display: flex; align-items: center; gap: 11px; min-width: 230px; }
        .iv-avatar {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: grid;
          place-items: center;
          color: #315fea;
          background: #eff4ff;
          flex-shrink: 0;
        }

        .iv-email { font-weight: 700; margin-bottom: 5px; overflow-wrap: anywhere; }
        .iv-muted { color: #94a3b8; font-size: 11px; }

        .iv-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          border-radius: 20px;
          padding: 5px 9px;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
        }

        .iv-pending { background: #fffaeb; color: #b54708; }
        .iv-accepted { background: #ecfdf3; color: #15803d; }
        .iv-expired { background: #fef3f2; color: #b42318; }
        .iv-cancelled { background: #f1f5f9; color: #64748b; }

        .iv-actions { display: flex; align-items: center; gap: 5px; }

        .iv-icon-btn {
          width: 32px;
          height: 32px;
          display: inline-grid;
          place-items: center;
          border: 1px solid transparent;
          border-radius: 8px;
          background: transparent;
          color: #64748b;
          cursor: pointer;
        }

        .iv-icon-btn:hover {
          color: #315fea;
          background: #f1f5f9;
          border-color: #e2e8f0;
        }

        .iv-empty { padding: 45px 20px; text-align: center; color: #64748b; }
        .iv-empty svg { margin-bottom: 10px; color: #94a3b8; }

        .iv-foot {
          padding: 14px 20px;
          border-top: 1px solid #edf0f5;
          display: flex;
          justify-content: space-between;
          gap: 12px;
          color: #94a3b8;
          font-size: 12px;
        }

        .iv-notice {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 12px 14px;
          margin-bottom: 18px;
          border: 1px solid #bbf7d0;
          border-radius: 9px;
          background: #f0fdf4;
          color: #166534;
          font-size: 13px;
          overflow-wrap: anywhere;
        }

        .iv-note {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          padding: 13px 14px;
          margin-top: 20px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          background: #f8fafc;
          color: #64748b;
          font-size: 12px;
          line-height: 1.6;
        }

        .iv-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: grid;
          place-items: center;
          padding: 20px;
          background: #10182888;
          overflow-y: auto;
        }

        .iv-modal {
          width: 100%;
          max-width: 540px;
          max-height: calc(100vh - 40px);
          overflow-y: auto;
          border-radius: 16px;
          background: white;
          box-shadow: 0 24px 70px #10182833;
        }

        .iv-modal-head {
          padding: 22px;
          border-bottom: 1px solid #edf0f5;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .iv-modal-head h2 { font-size: 19px; margin: 0 0 6px; }
        .iv-modal-head p { font-size: 12px; color: #64748b; margin: 0; }
        .iv-modal-body { padding: 22px; }

        .iv-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .iv-field { display: flex; flex-direction: column; gap: 7px; }
        .iv-full { grid-column: 1 / -1; }
        .iv-field label { color: #475569; font-size: 12px; font-weight: 700; }

        .iv-field input, .iv-field select {
          width: 100%;
          padding: 11px 12px;
          border: 1px solid #dfe4ec;
          border-radius: 9px;
          outline: none;
          font-size: 13px;
          background: white;
        }

        .iv-error {
          padding: 10px 12px;
          margin-bottom: 15px;
          border: 1px solid #fecdca;
          border-radius: 8px;
          background: #fef3f2;
          color: #b42318;
          font-size: 12px;
        }

        .iv-modal-foot {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 16px 22px;
          border-top: 1px solid #edf0f5;
        }

        .iv-detail-list { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .iv-detail-item { border: 1px solid #edf0f5; border-radius: 10px; padding: 13px; min-width: 0; }
        .iv-detail-label { color: #94a3b8; font-size: 11px; margin-bottom: 7px; }
        .iv-detail-value { color: #172033; font-size: 13px; font-weight: 650; overflow-wrap: anywhere; }

        @media (max-width: 1000px) {
          .iv-page { padding: 22px; }
          .iv-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }

        @media (max-width: 600px) {
          .iv-page { padding: 15px; }
          .iv-top { flex-direction: column; }
          .iv-top > .iv-btn { width: 100%; }
          .iv-page h1 { font-size: 24px; }
          .iv-stats { grid-template-columns: 1fr 1fr; gap: 10px; }
          .iv-stats > div { padding: 14px !important; }
          .iv-stat-value { font-size: 23px; }
          .iv-panel-head { align-items: flex-start; flex-direction: column; }
          .iv-filters { padding: 14px; }
          .iv-search { min-width: 100%; }
          .iv-select { flex: 1; min-width: 0; }
          .iv-fields, .iv-detail-list { grid-template-columns: 1fr; }
          .iv-full { grid-column: auto; }
          .iv-foot { flex-direction: column; }
        }
      `}</style>

      <div className="iv-shell">
        <div className="iv-top">
          <div>
            <div className="iv-eyebrow">
              <Mail size={15} />
              Organizations / Invitations
            </div>
            <h1>Invitations</h1>
            <p className="iv-subtitle">
              Invite people to your workspace, assign access roles, and track
              invitation progress.
            </p>
          </div>

          <button
            className="iv-btn iv-primary"
            onClick={() => {
              setError("");
              setForm(emptyInvitation);
              setModalOpen(true);
            }}
          >
            <Plus size={16} />
            Invite member
          </button>
        </div>

        {notice && (
          <div className="iv-notice">
            <span>{notice}</span>
            <button
              className="iv-icon-btn"
              onClick={() => setNotice("")}
              aria-label="Dismiss notification"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="iv-stats">
          <div style={cardStyle}>
            <div className="iv-stat-label">
              Total invitations
              <span className="iv-stat-icon"><Mail size={18} /></span>
            </div>
            <div className="iv-stat-value">{invitations.length}</div>
            <div className="iv-stat-foot">All invitation records</div>
          </div>

          <div style={cardStyle}>
            <div className="iv-stat-label">
              Pending
              <span className="iv-stat-icon"><Clock3 size={18} /></span>
            </div>
            <div className="iv-stat-value">{pendingCount}</div>
            <div className="iv-stat-foot">Awaiting a response</div>
          </div>

          <div style={cardStyle}>
            <div className="iv-stat-label">
              Accepted
              <span className="iv-stat-icon"><CheckCircle2 size={18} /></span>
            </div>
            <div className="iv-stat-value">{acceptedCount}</div>
            <div className="iv-stat-foot">Invitation accepted</div>
          </div>

          <div style={cardStyle}>
            <div className="iv-stat-label">
              Expired
              <span className="iv-stat-icon"><XCircle size={18} /></span>
            </div>
            <div className="iv-stat-value">{expiredCount}</div>
            <div className="iv-stat-foot">Require a new invitation</div>
          </div>
        </div>

        <section className="iv-panel">
          <div className="iv-panel-head">
            <div>
              <h2>Invitation directory</h2>
              <p>Review invitations and manage access onboarding.</p>
            </div>
            <button className="iv-btn" onClick={resetFilters}>
              <RefreshCw size={14} />
              Reset filters
            </button>
          </div>

          <div className="iv-filters">
            <div className="iv-search">
              <Search size={16} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search email, invitation ID, team..."
                aria-label="Search invitations"
              />
            </div>

            <select
              className="iv-select"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by invitation status"
            >
              <option value="All">All statuses</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Expired">Expired</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <select
              className="iv-select"
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              aria-label="Filter by role"
            >
              <option value="All">All roles</option>
              {roles.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>

            <button className="iv-clear" onClick={resetFilters}>
              <Filter size={14} />
              Clear
            </button>
          </div>

          <div className="iv-table-wrap">
            <table className="iv-table">
              <thead>
                <tr>
                  <th>Invitee</th>
                  <th>Assigned role</th>
                  <th>Team</th>
                  <th>Invited by</th>
                  <th>Sent date</th>
                  <th>Expires</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvitations.map((invitation) => (
                  <tr key={invitation.id}>
                    <td>
                      <div className="iv-email-cell">
                        <div className="iv-avatar"><Mail size={17} /></div>
                        <div>
                          <div className="iv-email">{invitation.email}</div>
                          <div className="iv-muted">{invitation.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>{invitation.role}</td>
                    <td>{invitation.team}</td>
                    <td>{invitation.invitedBy}</td>
                    <td>{invitation.sentAt}</td>
                    <td>{invitation.expiresAt}</td>
                    <td>
                      <span className={`iv-badge ${statusClass(invitation.status)}`}>
                        {statusIcon(invitation.status)}
                        {invitation.status}
                      </span>
                    </td>
                    <td>
                      <div className="iv-actions">
                        <button
                          className="iv-icon-btn"
                          onClick={() => setSelectedInvitation(invitation)}
                          title="View invitation"
                          aria-label={`View invitation for ${invitation.email}`}
                        >
                          <MoreHorizontal size={17} />
                        </button>
                        {invitation.status === "Pending" && (
                          <>
                            <button
                              className="iv-icon-btn"
                              onClick={() => resendInvitation(invitation)}
                              title="Resend invitation"
                              aria-label={`Resend invitation to ${invitation.email}`}
                            >
                              <Send size={15} />
                            </button>
                            <button
                              className="iv-icon-btn"
                              onClick={() => copyInvitation(invitation)}
                              title="Copy invitation link"
                              aria-label={`Copy invitation link for ${invitation.email}`}
                            >
                              <Copy size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredInvitations.length === 0 && (
                  <tr>
                    <td colSpan={8}>
                      <div className="iv-empty">
                        <Search size={26} />
                        <div style={{ fontWeight: 700, marginBottom: 6 }}>
                          No invitations found
                        </div>
                        <div>Try changing your search or filters.</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="iv-foot">
            <span>
              Showing {filteredInvitations.length} of {invitations.length} invitations
            </span>
            <span>Preview data · Not connected to email delivery</span>
          </div>
        </section>

        <div className="iv-note">
          <ShieldCheck size={16} />
          <span>
            <strong>Preview mode:</strong> Creating or resending an invitation
            updates this page only. Real invitations require backend endpoints,
            secure token generation, expiration enforcement, and an email
            delivery provider.
          </span>
        </div>
      </div>

      {modalOpen && (
        <div
          className="iv-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setModalOpen(false);
          }}
        >
          <form className="iv-modal" onSubmit={sendInvitation}>
            <div className="iv-modal-head">
              <div>
                <h2>Invite a member</h2>
                <p>Choose the email, role, and team for this invitation.</p>
              </div>
              <button
                type="button"
                className="iv-icon-btn"
                onClick={() => setModalOpen(false)}
                aria-label="Close invitation form"
              >
                <X size={18} />
              </button>
            </div>

            <div className="iv-modal-body">
              {error && <div className="iv-error">{error}</div>}

              <div className="iv-fields">
                <div className="iv-field iv-full">
                  <label htmlFor="invite-email">Email address *</label>
                  <input
                    id="invite-email"
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      setForm({ ...form, email: event.target.value })
                    }
                    placeholder="person@company.com"
                    required
                  />
                </div>

                <div className="iv-field">
                  <label htmlFor="invite-role">Access role *</label>
                  <select
                    id="invite-role"
                    value={form.role}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        role: event.target.value as InvitationRole,
                      })
                    }
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                <div className="iv-field">
                  <label htmlFor="invite-team">Team</label>
                  <select
                    id="invite-team"
                    value={form.team}
                    onChange={(event) =>
                      setForm({ ...form, team: event.target.value })
                    }
                  >
                    {teams.map((team) => (
                      <option key={team} value={team}>{team}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="iv-note">
                <CalendarDays size={15} />
                The demo invitation is configured to expire seven days after
                creation. No email will be sent in this preview.
              </div>
            </div>

            <div className="iv-modal-foot">
              <button
                type="button"
                className="iv-btn"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="iv-btn iv-primary">
                <Send size={14} />
                Prepare invitation
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedInvitation && (
        <div
          className="iv-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedInvitation(null);
            }
          }}
        >
          <section className="iv-modal">
            <div className="iv-modal-head">
              <div>
                <h2>Invitation details</h2>
                <p>{selectedInvitation.id}</p>
              </div>
              <button
                className="iv-icon-btn"
                onClick={() => setSelectedInvitation(null)}
                aria-label="Close invitation details"
              >
                <X size={18} />
              </button>
            </div>

            <div className="iv-modal-body">
              <div className="iv-detail-list">
                <div className="iv-detail-item">
                  <div className="iv-detail-label">Email</div>
                  <div className="iv-detail-value">{selectedInvitation.email}</div>
                </div>
                <div className="iv-detail-item">
                  <div className="iv-detail-label">Status</div>
                  <div className="iv-detail-value">{selectedInvitation.status}</div>
                </div>
                <div className="iv-detail-item">
                  <div className="iv-detail-label">Role</div>
                  <div className="iv-detail-value">{selectedInvitation.role}</div>
                </div>
                <div className="iv-detail-item">
                  <div className="iv-detail-label">Team</div>
                  <div className="iv-detail-value">{selectedInvitation.team}</div>
                </div>
                <div className="iv-detail-item">
                  <div className="iv-detail-label">Invited by</div>
                  <div className="iv-detail-value">{selectedInvitation.invitedBy}</div>
                </div>
                <div className="iv-detail-item">
                  <div className="iv-detail-label">Expiration date</div>
                  <div className="iv-detail-value">{selectedInvitation.expiresAt}</div>
                </div>
              </div>
            </div>

            <div className="iv-modal-foot">
              <button
                className="iv-btn"
                onClick={() => setSelectedInvitation(null)}
              >
                Close
              </button>
              {selectedInvitation.status === "Pending" && (
                <>
                  <button
                    className="iv-btn"
                    onClick={() => copyInvitation(selectedInvitation)}
                  >
                    <Copy size={14} />
                    Copy link
                  </button>
                  <button
                    className="iv-btn"
                    onClick={() => cancelInvitation(selectedInvitation)}
                  >
                    <Ban size={14} />
                    Cancel invitation
                  </button>
                </>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
