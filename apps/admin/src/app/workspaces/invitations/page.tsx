
"use client";

import { useMemo, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import {
  Mail,
  Plus,
  Search,
  Download,
  Copy,
  RefreshCw,
  X,
  Check,
  Clock3,
  ShieldCheck,
  UserPlus,
  MoreHorizontal,
  Trash2,
  Ban,
  Send,
  CalendarDays,
  Building2,
} from "lucide-react";

type InvitationStatus = "Pending" | "Accepted" | "Expired" | "Revoked";

type Invitation = {
  id: string;
  email: string;
  name: string;
  role: string;
  department: string;
  invitedBy: string;
  status: InvitationStatus;
  createdAt: string;
  expiresAt: string;
  message: string;
};

const initialInvitations: Invitation[] = [
  {
    id: "INV-1001",
    email: "rahul@example.com",
    name: "Rahul Sharma",
    role: "Developer",
    department: "Engineering",
    invitedBy: "Workspace Admin",
    status: "Pending",
    createdAt: "2026-10-30",
    expiresAt: "2026-11-13",
    message: "Welcome to the ModelNow workspace.",
  },
  {
    id: "INV-1002",
    email: "ananya@example.com",
    name: "Ananya Rao",
    role: "AI Researcher",
    department: "AI Research",
    invitedBy: "Workspace Admin",
    status: "Accepted",
    createdAt: "2026-10-25",
    expiresAt: "2026-11-08",
    message: "Join the AI Research team at ModelNow.",
  },
  {
    id: "INV-1003",
    email: "vikram@example.com",
    name: "Vikram Reddy",
    role: "Team Lead",
    department: "Engineering",
    invitedBy: "Organization Admin",
    status: "Pending",
    createdAt: "2026-11-01",
    expiresAt: "2026-11-15",
    message: "Your ModelNow workspace invitation is ready.",
  },
  {
    id: "INV-1004",
    email: "priya@example.com",
    name: "Priya Kumar",
    role: "Product Manager",
    department: "Product",
    invitedBy: "Workspace Admin",
    status: "Expired",
    createdAt: "2026-10-01",
    expiresAt: "2026-10-15",
    message: "Please join the ModelNow workspace.",
  },
  {
    id: "INV-1005",
    email: "sneha@example.com",
    name: "Sneha Patel",
    role: "Security Analyst",
    department: "Security",
    invitedBy: "Organization Admin",
    status: "Revoked",
    createdAt: "2026-10-20",
    expiresAt: "2026-11-03",
    message: "Invitation to the ModelNow workspace.",
  },
  {
    id: "INV-1006",
    email: "arjun@example.com",
    name: "Arjun Kumar",
    role: "Developer",
    department: "Engineering",
    invitedBy: "Workspace Admin",
    status: "Pending",
    createdAt: "2026-11-02",
    expiresAt: "2026-11-16",
    message: "Welcome to the ModelNow engineering workspace.",
  },
];

const C = {
  text: "#172033",
  muted: "#697586",
  border: "#E5EAF1",
  background: "#F7F9FC",
  blue: "#315FEA",
  green: "#15803D",
  red: "#B42318",
  amber: "#B54708",
};

const statusStyles: Record<InvitationStatus, CSSProperties> = {
  Pending: { color: "#B54708", background: "#FFF5DF" },
  Accepted: { color: "#15803D", background: "#EAF8EF" },
  Expired: { color: "#697586", background: "#EEF1F5" },
  Revoked: { color: "#B42318", background: "#FDECEC" },
};

const buttonStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  padding: "10px 12px",
  border: `1px solid ${C.border}`,
  borderRadius: 9,
  background: "#FFFFFF",
  color: C.text,
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const primaryButtonStyle: CSSProperties = {
  ...buttonStyle,
  color: "#FFFFFF",
  background: C.blue,
  borderColor: C.blue,
};

const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  border: `1px solid ${C.border}`,
  borderRadius: 9,
  background: "#FFFFFF",
  color: C.text,
  fontSize: 12,
  outline: "none",
};

const emptyForm = {
  name: "",
  email: "",
  role: "Developer",
  department: "Engineering",
  message: "Welcome to the ModelNow workspace.",
  validityDays: "14",
};

export default function InvitationsPage() {
  const [invitations, setInvitations] =
    useState<Invitation[]>(initialInvitations);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<Invitation | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState(emptyForm);

  const departments = Array.from(
    new Set(invitations.map((invitation) => invitation.department)),
  ).sort();

  const filteredInvitations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return invitations.filter((invitation) => {
      const matchesSearch =
        !query ||
        [
          invitation.id,
          invitation.email,
          invitation.name,
          invitation.role,
          invitation.department,
          invitation.invitedBy,
        ].some((value) => value.toLowerCase().includes(query));

      return (
        matchesSearch &&
        (statusFilter === "All" || invitation.status === statusFilter) &&
        (departmentFilter === "All" ||
          invitation.department === departmentFilter)
      );
    });
  }, [invitations, search, statusFilter, departmentFilter]);

  const pendingCount = invitations.filter(
    (item) => item.status === "Pending",
  ).length;
  const acceptedCount = invitations.filter(
    (item) => item.status === "Accepted",
  ).length;
  const expiredCount = invitations.filter(
    (item) => item.status === "Expired",
  ).length;
  const acceptanceRate =
    invitations.length === 0
      ? 0
      : Math.round((acceptedCount / invitations.length) * 100);

  function notify(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3000);
  }

  function openCreate() {
    setForm(emptyForm);
    setShowForm(true);
  }

  function createInvitation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = form.email.trim().toLowerCase();

    const existingPending = invitations.some(
      (invitation) =>
        invitation.email.toLowerCase() === normalizedEmail &&
        invitation.status === "Pending",
    );

    if (existingPending) {
      notify("A pending invitation already exists for this email.");
      return;
    }

    const now = new Date();
    const validityDays = Math.max(1, Number(form.validityDays) || 14);
    const expires = new Date(now);
    expires.setDate(expires.getDate() + validityDays);

    const invitation: Invitation = {
      id: `INV-${Date.now().toString().slice(-6)}`,
      email: normalizedEmail,
      name: form.name.trim(),
      role: form.role,
      department: form.department,
      invitedBy: "Current Admin",
      status: "Pending",
      createdAt: now.toISOString().slice(0, 10),
      expiresAt: expires.toISOString().slice(0, 10),
      message: form.message.trim(),
    };

    setInvitations((current) => [invitation, ...current]);
    setSearch("");
    setStatusFilter("All");
    setDepartmentFilter("All");
    setShowForm(false);
    setForm(emptyForm);
    notify("Invitation created in the demo.");
  }

  async function copyInvitation(invitation: Invitation) {
    const content = [
      `Invitation for ${invitation.name || invitation.email}`,
      `Email: ${invitation.email}`,
      `Role: ${invitation.role}`,
      `Department: ${invitation.department}`,
      `Invitation ID: ${invitation.id}`,
      `Status: ${invitation.status}`,
      `Expires: ${invitation.expiresAt}`,
      invitation.message,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(content);
      notify("Invitation details copied.");
    } catch {
      notify("Clipboard access failed. Please copy the details manually.");
      setSelected(invitation);
    }
  }

  function resendInvitation(invitation: Invitation) {
    const now = new Date();
    const expires = new Date(now);
    expires.setDate(expires.getDate() + 14);

    const updated: Invitation = {
      ...invitation,
      status: "Pending",
      createdAt: now.toISOString().slice(0, 10),
      expiresAt: expires.toISOString().slice(0, 10),
    };

    setInvitations((current) =>
      current.map((item) => (item.id === invitation.id ? updated : item)),
    );
    setSelected((current) =>
      current?.id === invitation.id ? updated : current,
    );
    setMenuId(null);
    notify("Invitation renewed in the demo.");
  }

  function revokeInvitation(invitation: Invitation) {
    if (
      !window.confirm(
        `Revoke the invitation for ${invitation.email}?`,
      )
    ) {
      return;
    }

    const updated = { ...invitation, status: "Revoked" as const };

    setInvitations((current) =>
      current.map((item) => (item.id === invitation.id ? updated : item)),
    );
    setSelected((current) =>
      current?.id === invitation.id ? updated : current,
    );
    setMenuId(null);
    notify("Invitation revoked in the demo.");
  }

  function deleteInvitation(invitation: Invitation) {
    if (!window.confirm(`Delete invitation ${invitation.id}?`)) return;

    setInvitations((current) =>
      current.filter((item) => item.id !== invitation.id),
    );
    setSelected((current) =>
      current?.id === invitation.id ? null : current,
    );
    setMenuId(null);
    notify("Invitation removed from the demo directory.");
  }

  function exportCsv() {
    const headers = [
      "Invitation ID",
      "Name",
      "Email",
      "Role",
      "Department",
      "Invited By",
      "Status",
      "Created At",
      "Expires At",
      "Message",
    ];

    const rows = filteredInvitations.map((item) => [
      item.id,
      item.name,
      item.email,
      item.role,
      item.department,
      item.invitedBy,
      item.status,
      item.createdAt,
      item.expiresAt,
      item.message,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${value.replace(/"/g, '""')}"`).join(","),
      )
      .join("\r\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "modelnow-invitations.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    notify("Invitations CSV exported.");
  }

  return (
    <main style={pageStyle}>
      {notice && (
        <div role="status" style={toastStyle}>
          <Check size={15} />
          {notice}
          <button
            onClick={() => setNotice("")}
            aria-label="Dismiss notification"
            style={{ ...buttonStyle, padding: 4 }}
          >
            <X size={13} />
          </button>
        </div>
      )}

      <header style={headerStyle}>
        <div>
          <div style={breadcrumbStyle}>
            <span>Admin Console</span>
            <span>/</span>
            <span>Workspace</span>
            <span>/</span>
            <span style={{ color: C.blue }}>Invitations</span>
          </div>
          <h1 style={titleStyle}>Workspace Invitations</h1>
          <p style={subtitleStyle}>
            Invite employees and collaborators, review invitation status,
            and manage workspace access onboarding.
          </p>
        </div>

        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          <button onClick={exportCsv} style={buttonStyle}>
            <Download size={15} />
            Export CSV
          </button>
          <button onClick={openCreate} style={primaryButtonStyle}>
            <Plus size={16} />
            Create invitation
          </button>
        </div>
      </header>

      <section style={metricsGridStyle}>
        {[
          {
            label: "Total invitations",
            value: invitations.length,
            description: "All invitation records",
            icon: Mail,
            color: "#315FEA",
            bg: "#EDF2FF",
          },
          {
            label: "Pending",
            value: pendingCount,
            description: "Awaiting acceptance",
            icon: Clock3,
            color: "#B54708",
            bg: "#FFF5DF",
          },
          {
            label: "Accepted",
            value: acceptedCount,
            description: "Joined the workspace",
            icon: Check,
            color: "#15803D",
            bg: "#EAF8EF",
          },
          {
            label: "Acceptance rate",
            value: `${acceptanceRate}%`,
            description: `${expiredCount} expired invitation(s)`,
            icon: ShieldCheck,
            color: "#6941C6",
            bg: "#F2EDFF",
          },
        ].map((metric) => {
          const Icon = metric.icon;

          return (
            <article key={metric.label} style={metricCardStyle}>
              <div style={metricTopStyle}>
                <span style={metricLabelStyle}>{metric.label}</span>
                <span
                  style={{
                    ...metricIconStyle,
                    color: metric.color,
                    background: metric.bg,
                  }}
                >
                  <Icon size={18} />
                </span>
              </div>
              <div style={metricValueStyle}>{metric.value}</div>
              <p style={metricDescriptionStyle}>{metric.description}</p>
            </article>
          );
        })}
      </section>

      <section style={panelStyle}>
        <div style={panelHeaderStyle}>
          <div>
            <h2 style={panelTitleStyle}>Invitation directory</h2>
            <p style={panelSubtitleStyle}>
              {filteredInvitations.length} of {invitations.length} invitations
            </p>
          </div>

          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("All");
              setDepartmentFilter("All");
            }}
            style={buttonStyle}
          >
            Reset filters
          </button>
        </div>

        <div style={filtersStyle}>
          <div style={{ position: "relative" }}>
            <Search
              size={15}
              style={{
                position: "absolute",
                left: 12,
                top: 12,
                color: C.muted,
              }}
            />
            <input
              aria-label="Search invitations"
              placeholder="Search name, email, role, ID..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              style={{ ...inputStyle, paddingLeft: 36 }}
            />
          </div>

          <select
            aria-label="Filter invitations by department"
            value={departmentFilter}
            onChange={(event) => setDepartmentFilter(event.target.value)}
            style={inputStyle}
          >
            <option value="All">All departments</option>
            {departments.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter invitations by status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            style={inputStyle}
          >
            <option value="All">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="Expired">Expired</option>
            <option value="Revoked">Revoked</option>
          </select>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                {[
                  "INVITEE",
                  "ROLE / DEPARTMENT",
                  "INVITED BY",
                  "STATUS",
                  "INVITED ON",
                  "EXPIRES",
                  "ACTIONS",
                ].map((heading) => (
                  <th key={heading} style={thStyle}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredInvitations.map((invitation) => (
                <tr key={invitation.id}>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span style={avatarStyle}>
                        <Mail size={17} />
                      </span>
                      <div>
                        <div style={{ fontWeight: 700 }}>
                          {invitation.name || "Unnamed invitee"}
                        </div>
                        <div style={secondaryTextStyle}>{invitation.email}</div>
                        <div style={{ ...secondaryTextStyle, fontSize: 9 }}>
                          {invitation.id}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td style={tdStyle}>
                    <div style={{ fontWeight: 600 }}>{invitation.role}</div>
                    <div style={secondaryTextStyle}>
                      <Building2
                        size={11}
                        style={{ display: "inline", marginRight: 4 }}
                      />
                      {invitation.department}
                    </div>
                  </td>

                  <td style={tdStyle}>{invitation.invitedBy}</td>

                  <td style={tdStyle}>
                    <span
                      style={{
                        ...statusStyles[invitation.status],
                        padding: "5px 9px",
                        borderRadius: 20,
                        fontSize: 10,
                        fontWeight: 650,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {invitation.status}
                    </span>
                  </td>

                  <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                    {invitation.createdAt}
                  </td>

                  <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                    {invitation.expiresAt}
                  </td>

                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button
                        title="Copy invitation details"
                        aria-label={`Copy invitation for ${invitation.email}`}
                        onClick={() => void copyInvitation(invitation)}
                        style={{ ...buttonStyle, padding: 7, border: "none" }}
                      >
                        <Copy size={14} />
                      </button>

                      <button
                        title="Resend or renew invitation"
                        aria-label={`Renew invitation for ${invitation.email}`}
                        onClick={() => resendInvitation(invitation)}
                        style={{ ...buttonStyle, padding: 7, border: "none" }}
                      >
                        <RefreshCw size={14} />
                      </button>

                      <div style={{ position: "relative" }}>
                        <button
                          title="More actions"
                          aria-label={`More actions for ${invitation.email}`}
                          onClick={() =>
                            setMenuId((current) =>
                              current === invitation.id ? null : invitation.id,
                            )
                          }
                          style={{ ...buttonStyle, padding: 7, border: "none" }}
                        >
                          <MoreHorizontal size={15} />
                        </button>

                        {menuId === invitation.id && (
                          <div style={menuStyle}>
                            <button
                              onClick={() => {
                                setSelected(invitation);
                                setMenuId(null);
                              }}
                              style={menuItemStyle}
                            >
                              <Mail size={14} />
                              View details
                            </button>

                            {invitation.status !== "Revoked" && (
                              <button
                                onClick={() => revokeInvitation(invitation)}
                                style={menuItemStyle}
                              >
                                <Ban size={14} />
                                Revoke invitation
                              </button>
                            )}

                            <button
                              onClick={() => deleteInvitation(invitation)}
                              style={{ ...menuItemStyle, color: C.red }}
                            >
                              <Trash2 size={14} />
                              Delete record
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredInvitations.length === 0 && (
                <tr>
                  <td colSpan={7} style={emptyStateStyle}>
                    <Mail size={23} />
                    <p>No invitations match your current filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={footerStyle}>
          <span>{filteredInvitations.length} invitation record(s)</span>
          <span>Demo data · No invitation emails are sent</span>
        </div>
      </section>

      <section style={panelStyle}>
        <div style={panelHeaderStyle}>
          <div>
            <h2 style={panelTitleStyle}>Invitation lifecycle</h2>
            <p style={panelSubtitleStyle}>
              Common onboarding steps for workspace administrators
            </p>
          </div>
        </div>

        <div style={lifecycleGridStyle}>
          {[
            {
              number: "01",
              title: "Create invitation",
              description: "Enter the invitee's name, email, role, and department.",
              icon: UserPlus,
            },
            {
              number: "02",
              title: "Send invitation",
              description: "A production email service must deliver the invitation link.",
              icon: Send,
            },
            {
              number: "03",
              title: "Accept invitation",
              description: "The invitee verifies the link and completes account setup.",
              icon: Check,
            },
            {
              number: "04",
              title: "Grant workspace access",
              description: "The backend validates the invitation and applies permissions.",
              icon: ShieldCheck,
            },
          ].map((step) => {
            const Icon = step.icon;

            return (
              <article key={step.number} style={lifecycleCardStyle}>
                <div style={lifecycleTopStyle}>
                  <span style={stepNumberStyle}>{step.number}</span>
                  <Icon size={18} color={C.blue} />
                </div>
                <h3 style={{ margin: "13px 0 7px", fontSize: 12 }}>
                  {step.title}
                </h3>
                <p style={capabilityDescriptionStyle}>{step.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      {showForm && (
        <div
          style={overlayStyle}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowForm(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="invitation-form-title"
            style={modalStyle}
          >
            <div style={modalHeaderStyle}>
              <div>
                <h2 id="invitation-form-title" style={{ margin: 0, fontSize: 19 }}>
                  Create invitation
                </h2>
                <p style={{ margin: "6px 0 0", color: C.muted, fontSize: 12 }}>
                  Prepare an invitation record for a new workspace member.
                </p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                aria-label="Close form"
                style={{ ...buttonStyle, padding: 7 }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={createInvitation} style={formStyle}>
              <label style={labelStyle}>
                Invitee name
                <input
                  required
                  maxLength={100}
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="Full name"
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                Email address
                <input
                  type="email"
                  required
                  maxLength={254}
                  value={form.email}
                  onChange={(event) =>
                    setForm({ ...form, email: event.target.value })
                  }
                  placeholder="employee@company.com"
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                Workspace role
                <select
                  value={form.role}
                  onChange={(event) =>
                    setForm({ ...form, role: event.target.value })
                  }
                  style={inputStyle}
                >
                  <option>Developer</option>
                  <option>AI Researcher</option>
                  <option>Team Lead</option>
                  <option>Product Manager</option>
                  <option>Security Analyst</option>
                  <option>Workspace Admin</option>
                  <option>Read-only Viewer</option>
                </select>
              </label>

              <label style={labelStyle}>
                Department
                <select
                  value={form.department}
                  onChange={(event) =>
                    setForm({ ...form, department: event.target.value })
                  }
                  style={inputStyle}
                >
                  {Array.from(
                    new Set([
                      "Engineering",
                      "AI Research",
                      "Product",
                      "Operations",
                      "Security",
                      ...departments,
                    ]),
                  ).map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
              </label>

              <label style={labelStyle}>
                Invitation validity
                <select
                  value={form.validityDays}
                  onChange={(event) =>
                    setForm({ ...form, validityDays: event.target.value })
                  }
                  style={inputStyle}
                >
                  <option value="1">1 day</option>
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                </select>
              </label>

              <label style={labelStyle}>
                Invitation message
                <textarea
                  rows={3}
                  maxLength={500}
                  value={form.message}
                  onChange={(event) =>
                    setForm({ ...form, message: event.target.value })
                  }
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </label>

              <div style={infoBoxStyle}>
                <ShieldCheck size={16} />
                <span>
                  This creates a demo record only. Email delivery, secure
                  invitation tokens, and account activation require backend integration.
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 9 }}>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={buttonStyle}
                >
                  Cancel
                </button>
                <button type="submit" style={primaryButtonStyle}>
                  <Plus size={15} />
                  Create invitation
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {selected && (
        <div
          style={overlayStyle}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="invitation-details-title"
            style={modalStyle}
          >
            <div style={modalHeaderStyle}>
              <div>
                <h2 id="invitation-details-title" style={{ margin: 0, fontSize: 19 }}>
                  Invitation details
                </h2>
                <p style={{ margin: "6px 0 0", color: C.muted, fontSize: 12 }}>
                  {selected.id}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                aria-label="Close details"
                style={{ ...buttonStyle, padding: 7 }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ ...avatarStyle, width: 46, height: 46 }}>
                  <Mail size={21} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ margin: "0 0 5px", fontSize: 17 }}>
                    {selected.name || "Unnamed invitee"}
                  </h3>
                  <div style={{ fontSize: 12, color: C.muted, overflowWrap: "anywhere" }}>
                    {selected.email}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 20 }}>
                <span
                  style={{
                    ...statusStyles[selected.status],
                    padding: "6px 10px",
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {selected.status}
                </span>
              </div>

              <div style={detailsGridStyle}>
                {[
                  ["Role", selected.role],
                  ["Department", selected.department],
                  ["Invited by", selected.invitedBy],
                  ["Invitation ID", selected.id],
                  ["Created", selected.createdAt],
                  ["Expires", selected.expiresAt],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div style={detailLabelStyle}>{label}</div>
                    <div style={detailValueStyle}>{value}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 20 }}>
                <div style={detailLabelStyle}>Invitation message</div>
                <p style={{ fontSize: 12, lineHeight: 1.7, margin: "7px 0 0" }}>
                  {selected.message || "No message provided."}
                </p>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-end", gap: 9, marginTop: 25 }}>
                <button
                  onClick={() => void copyInvitation(selected)}
                  style={buttonStyle}
                >
                  <Copy size={14} />
                  Copy details
                </button>
                <button
                  onClick={() => resendInvitation(selected)}
                  style={primaryButtonStyle}
                >
                  <RefreshCw size={14} />
                  Renew invitation
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  padding: 28,
  background: C.background,
  color: C.text,
  fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
};

const headerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 18,
  flexWrap: "wrap",
  marginBottom: 25,
};

const breadcrumbStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 9,
  color: C.muted,
  fontSize: 12,
  marginBottom: 12,
};

const titleStyle: CSSProperties = {
  margin: "0 0 9px",
  fontSize: 28,
  letterSpacing: -0.8,
  fontWeight: 750,
};

const subtitleStyle: CSSProperties = {
  margin: 0,
  maxWidth: 700,
  color: C.muted,
  fontSize: 13,
  lineHeight: 1.7,
};

const metricsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(205px, 1fr))",
  gap: 15,
  marginBottom: 24,
};

const metricCardStyle: CSSProperties = {
  padding: 19,
  border: `1px solid ${C.border}`,
  borderRadius: 13,
  background: "#FFFFFF",
};

const metricTopStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
};

const metricLabelStyle: CSSProperties = {
  color: C.muted,
  fontSize: 12,
  fontWeight: 600,
};

const metricIconStyle: CSSProperties = {
  display: "grid",
  placeItems: "center",
  width: 36,
  height: 36,
  borderRadius: 10,
};

const metricValueStyle: CSSProperties = {
  marginTop: 13,
  fontSize: 29,
  fontWeight: 750,
  letterSpacing: -0.7,
};

const metricDescriptionStyle: CSSProperties = {
  margin: "7px 0 0",
  color: C.muted,
  fontSize: 11,
};

const panelStyle: CSSProperties = {
  marginBottom: 22,
  border: `1px solid ${C.border}`,
  borderRadius: 13,
  background: "#FFFFFF",
  overflow: "visible",
};

const panelHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 12,
  padding: "20px 21px",
  borderBottom: `1px solid ${C.border}`,
};

const panelTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 16,
  fontWeight: 700,
};

const panelSubtitleStyle: CSSProperties = {
  margin: "6px 0 0",
  color: C.muted,
  fontSize: 11,
};

const filtersStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: 11,
  padding: "16px 21px",
  borderBottom: `1px solid ${C.border}`,
};

const tableStyle: CSSProperties = {
  width: "100%",
  minWidth: 1000,
  borderCollapse: "collapse",
  textAlign: "left",
  fontSize: 12,
};

const thStyle: CSSProperties = {
  padding: "13px 15px",
  color: C.muted,
  background: "#FAFBFD",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: 0.5,
  whiteSpace: "nowrap",
  borderBottom: `1px solid ${C.border}`,
};

const tdStyle: CSSProperties = {
  padding: 14,
  verticalAlign: "middle",
  borderBottom: `1px solid ${C.border}`,
};

const avatarStyle: CSSProperties = {
  display: "grid",
  placeItems: "center",
  width: 36,
  height: 36,
  borderRadius: 10,
  flexShrink: 0,
  background: "#EDF2FF",
  color: C.blue,
};

const secondaryTextStyle: CSSProperties = {
  marginTop: 4,
  color: C.muted,
  fontSize: 10,
};

const footerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: 10,
  padding: "13px 21px",
  color: C.muted,
  fontSize: 10,
};

const emptyStateStyle: CSSProperties = {
  padding: 45,
  textAlign: "center",
  color: C.muted,
};

const lifecycleGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: 13,
  padding: 20,
};

const lifecycleCardStyle: CSSProperties = {
  padding: 16,
  border: `1px solid ${C.border}`,
  borderRadius: 10,
};

const lifecycleTopStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const stepNumberStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 750,
  color: C.blue,
  background: "#EDF2FF",
  borderRadius: 7,
  padding: "6px 8px",
};

const capabilityDescriptionStyle: CSSProperties = {
  margin: 0,
  color: C.muted,
  fontSize: 11,
  lineHeight: 1.65,
};

const toastStyle: CSSProperties = {
  position: "fixed",
  top: 20,
  right: 24,
  zIndex: 100,
  display: "flex",
  alignItems: "center",
  gap: 9,
  padding: "12px 15px",
  background: "#172033",
  color: "#FFFFFF",
  borderRadius: 10,
  boxShadow: "0 8px 28px #17203326",
  fontSize: 12,
};

const menuStyle: CSSProperties = {
  position: "absolute",
  right: 0,
  top: 35,
  width: 190,
  padding: 5,
  zIndex: 30,
  background: "#FFFFFF",
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  boxShadow: "0 10px 30px #1720331A",
};

const menuItemStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 9,
  width: "100%",
  padding: 10,
  border: "none",
  borderRadius: 7,
  background: "#FFFFFF",
  color: C.text,
  textAlign: "left",
  fontSize: 11,
  cursor: "pointer",
};

const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 90,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 18,
  background: "#10182880",
};

const modalStyle: CSSProperties = {
  width: "100%",
  maxWidth: 530,
  maxHeight: "90vh",
  overflowY: "auto",
  background: "#FFFFFF",
  borderRadius: 15,
  boxShadow: "0 24px 70px #10182840",
};

const modalHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 15,
  padding: 22,
  borderBottom: `1px solid ${C.border}`,
};

const formStyle: CSSProperties = {
  display: "grid",
  gap: 15,
  padding: 22,
};

const labelStyle: CSSProperties = {
  display: "grid",
  gap: 8,
  color: C.text,
  fontSize: 12,
  fontWeight: 600,
};

const detailsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 18,
  marginTop: 22,
};

const detailLabelStyle: CSSProperties = {
  fontSize: 11,
  color: C.muted,
  marginBottom: 6,
};

const detailValueStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 650,
  overflowWrap: "anywhere",
};

const infoBoxStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 9,
  padding: 12,
  background: "#EDF2FF",
  color: "#2949A5",
  borderRadius: 9,
  fontSize: 11,
  lineHeight: 1.6,
};
