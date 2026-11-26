
"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Download,
  Fingerprint,
  KeyRound,
  LockKeyhole,
  MoreHorizontal,
  Search,
  ShieldCheck,
  UserCheck,
  UserRound,
  X,
  Plus,
  Pencil,
  Eye,
  ShieldAlert,
  Users,
  RefreshCw,
} from "lucide-react";

type IdentityStatus = "Active" | "Suspended" | "Pending";
type AuthMethod = "Password + MFA" | "Password" | "SSO" | "Passkey";

type Identity = {
  id: string;
  name: string;
  email: string;
  role: string;
  provider: string;
  method: AuthMethod;
  status: IdentityStatus;
  lastSignIn: string;
  mfa: boolean;
};

type AuthEvent = {
  id: string;
  event: string;
  identity: string;
  time: string;
  result: string;
};

const initialIdentities: Identity[] = [
  {
    id: "ID-1001",
    name: "Alex Morgan",
    email: "alex.morgan@example.com",
    role: "Super Admin",
    provider: "ModelNow Identity",
    method: "Password + MFA",
    status: "Active",
    lastSignIn: "2 minutes ago",
    mfa: true,
  },
  {
    id: "ID-1002",
    name: "Jordan Lee",
    email: "jordan.lee@example.com",
    role: "Organization Admin",
    provider: "Microsoft Entra ID",
    method: "SSO",
    status: "Active",
    lastSignIn: "18 minutes ago",
    mfa: true,
  },
  {
    id: "ID-1003",
    name: "Taylor Smith",
    email: "taylor.smith@example.com",
    role: "Developer",
    provider: "ModelNow Identity",
    method: "Password",
    status: "Active",
    lastSignIn: "1 hour ago",
    mfa: false,
  },
  {
    id: "ID-1004",
    name: "Morgan Davis",
    email: "morgan.davis@example.com",
    role: "Analyst",
    provider: "Google Workspace",
    method: "SSO",
    status: "Active",
    lastSignIn: "3 hours ago",
    mfa: true,
  },
  {
    id: "ID-1005",
    name: "Casey Wilson",
    email: "casey.wilson@example.com",
    role: "Viewer",
    provider: "ModelNow Identity",
    method: "Password + MFA",
    status: "Active",
    lastSignIn: "Yesterday",
    mfa: true,
  },
  {
    id: "ID-1006",
    name: "Riley Johnson",
    email: "riley.johnson@example.com",
    role: "Developer",
    provider: "ModelNow Identity",
    method: "Password",
    status: "Suspended",
    lastSignIn: "Oct 30, 2026",
    mfa: false,
  },
  {
    id: "ID-1007",
    name: "Avery Brown",
    email: "avery.brown@example.com",
    role: "Workspace Admin",
    provider: "ModelNow Identity",
    method: "Passkey",
    status: "Active",
    lastSignIn: "Oct 29, 2026",
    mfa: true,
  },
  {
    id: "ID-1008",
    name: "Jamie Taylor",
    email: "jamie.taylor@example.com",
    role: "Billing Manager",
    provider: "Microsoft Entra ID",
    method: "SSO",
    status: "Pending",
    lastSignIn: "Never",
    mfa: false,
  },
];

const initialEvents: AuthEvent[] = [
  {
    id: "AUTH-501",
    event: "Successful sign-in",
    identity: "alex.morgan@example.com",
    time: "2 minutes ago",
    result: "Success",
  },
  {
    id: "AUTH-500",
    event: "MFA challenge completed",
    identity: "jordan.lee@example.com",
    time: "18 minutes ago",
    result: "Success",
  },
  {
    id: "AUTH-499",
    event: "Password authentication",
    identity: "taylor.smith@example.com",
    time: "1 hour ago",
    result: "MFA not enabled",
  },
  {
    id: "AUTH-498",
    event: "Invitation created",
    identity: "jamie.taylor@example.com",
    time: "3 hours ago",
    result: "Pending",
  },
];

const emptyIdentity: Identity = {
  id: "",
  name: "",
  email: "",
  role: "Developer",
  provider: "ModelNow Identity",
  method: "Password + MFA",
  status: "Pending",
  lastSignIn: "Never",
  mfa: true,
};

const initialSettings = {
  requireMfaAdmins: true,
  allowPasswordLogin: true,
  allowSso: true,
  allowPasskeys: true,
};

export default function IdentityAuthenticationPage() {
  const [identities, setIdentities] =
    useState<Identity[]>(initialIdentities);
  const [events, setEvents] = useState<AuthEvent[]>(initialEvents);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [methodFilter, setMethodFilter] = useState("All methods");
  const [selectedIdentity, setSelectedIdentity] =
    useState<Identity | null>(null);
  const [draft, setDraft] = useState<Identity>(emptyIdentity);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [menuId, setMenuId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(initialSettings);

  const filteredIdentities = useMemo(() => {
    const query = search.trim().toLowerCase();

    return identities.filter((identity) => {
      const matchesSearch =
        !query ||
        identity.name.toLowerCase().includes(query) ||
        identity.email.toLowerCase().includes(query) ||
        identity.role.toLowerCase().includes(query) ||
        identity.id.toLowerCase().includes(query) ||
        identity.provider.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All statuses" ||
        identity.status === statusFilter;

      const matchesMethod =
        methodFilter === "All methods" ||
        identity.method === methodFilter;

      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [identities, search, statusFilter, methodFilter]);

  const activeCount = identities.filter(
    (item) => item.status === "Active"
  ).length;

  const suspendedCount = identities.filter(
    (item) => item.status === "Suspended"
  ).length;

  const mfaCount = identities.filter(
    (item) => item.status === "Active" && item.mfa
  ).length;

  const mfaRate =
    activeCount === 0
      ? 0
      : Math.round((mfaCount / activeCount) * 100);

  const passwordOnlyCount = identities.filter(
    (item) =>
      item.status === "Active" &&
      item.method === "Password" &&
      !item.mfa
  ).length;

  function logEvent(
    identity: Identity,
    event: string,
    result: string
  ) {
    setEvents((current) => [
      {
        id: `AUTH-${Date.now().toString().slice(-6)}`,
        event,
        identity: identity.email,
        time: "Just now",
        result,
      },
      ...current,
    ]);
  }

  function openCreate() {
    setEditingId(null);
    setDraft({ ...emptyIdentity });
    setError("");
    setFormOpen(true);
    setMenuId(null);
  }

  function openEdit(identity: Identity) {
    setEditingId(identity.id);
    setDraft({ ...identity });
    setError("");
    setFormOpen(true);
    setMenuId(null);
  }

  function saveIdentity() {
    if (!draft.name.trim()) {
      setError("Enter the person's name.");
      return;
    }

    const email = draft.email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }

    const duplicate = identities.some(
      (identity) =>
        identity.email.toLowerCase() === email &&
        identity.id !== editingId
    );

    if (duplicate) {
      setError("An identity with this email already exists.");
      return;
    }

    const savedIdentity: Identity = {
      ...draft,
      name: draft.name.trim(),
      email,
      id: editingId ?? `ID-${Date.now().toString().slice(-6)}`,
      lastSignIn: editingId ? draft.lastSignIn : "Never",
    };

    if (editingId) {
      setIdentities((current) =>
        current.map((item) =>
          item.id === editingId ? savedIdentity : item
        )
      );

      setSelectedIdentity((current) =>
        current?.id === editingId ? savedIdentity : current
      );

      logEvent(savedIdentity, "Identity details updated", "Success");
      setNotice("Identity updated in the local demo.");
    } else {
      setIdentities((current) => [savedIdentity, ...current]);
      logEvent(savedIdentity, "Identity created", "Pending");
      setNotice("Identity added to the local demo.");
    }

    setFormOpen(false);
    setError("");
  }

  function toggleStatus(identity: Identity) {
    const nextStatus: IdentityStatus =
      identity.status === "Active" ? "Suspended" : "Active";

    const updated = { ...identity, status: nextStatus };

    setIdentities((current) =>
      current.map((item) =>
        item.id === identity.id ? updated : item
      )
    );

    setSelectedIdentity((current) =>
      current?.id === identity.id ? updated : current
    );

    setMenuId(null);
    setNotice(
      `${identity.email} is now ${nextStatus.toLowerCase()} in the demo.`
    );

    logEvent(
      updated,
      `Identity ${nextStatus.toLowerCase()}`,
      "Success"
    );
  }

  function toggleMfa(identity: Identity) {
    const updated = { ...identity, mfa: !identity.mfa };

    setIdentities((current) =>
      current.map((item) =>
        item.id === identity.id ? updated : item
      )
    );

    setSelectedIdentity(updated);

    setNotice(
      `MFA ${updated.mfa ? "enabled" : "disabled"} in the local demo.`
    );

    logEvent(
      updated,
      updated.mfa ? "MFA enabled" : "MFA disabled",
      "Success"
    );
  }

  function exportCsv() {
    const rows = [
      [
        "Identity ID",
        "Name",
        "Email",
        "Role",
        "Provider",
        "Authentication Method",
        "Status",
        "MFA Enabled",
        "Last Sign In",
      ],
      ...filteredIdentities.map((identity) => [
        identity.id,
        identity.name,
        identity.email,
        identity.role,
        identity.provider,
        identity.method,
        identity.status,
        identity.mfa ? "Yes" : "No",
        identity.lastSignIn,
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(value).replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "modelnow-identities.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    setNotice("Filtered identity list exported to CSV.");
  }

  function resetFilters() {
    setSearch("");
    setStatusFilter("All statuses");
    setMethodFilter("All methods");
  }

  const metrics = [
    {
      title: "Total identities",
      value: identities.length,
      description: "Registered identity records",
      icon: Users,
      tone: "blue",
    },
    {
      title: "Active identities",
      value: activeCount,
      description: `${suspendedCount} suspended identity records`,
      icon: UserCheck,
      tone: "green",
    },
    {
      title: "MFA adoption",
      value: `${mfaRate}%`,
      description: `${mfaCount} active identities with MFA`,
      icon: ShieldCheck,
      tone: "purple",
    },
    {
      title: "Password-only users",
      value: passwordOnlyCount,
      description: "Active sample identities without MFA",
      icon: KeyRound,
      tone: "orange",
    },
  ];

  return (
    <main className="identity-page">
      <style jsx>{`
        .identity-page {
          min-height: 100vh;
          background: #f6f8fc;
          color: #172033;
          padding: 32px;
          font-family: Arial, Helvetica, sans-serif;
        }

        .identity-container {
          max-width: 1500px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 26px;
        }

        .eyebrow {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 9px;
          margin-bottom: 12px;
          color: #315fea;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.4px;
        }

        .eyebrow-separator {
          color: #c5ccda;
        }

        h1 {
          margin: 0;
          font-size: clamp(25px, 3vw, 34px);
          font-weight: 750;
          letter-spacing: -1px;
        }

        .page-description {
          max-width: 700px;
          margin: 10px 0 0;
          color: #6b7280;
          font-size: 14px;
          line-height: 1.7;
        }

        .header-actions {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 9px;
        }

        .button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 40px;
          padding: 10px 14px;
          border: 1px solid #dce2ed;
          border-radius: 10px;
          background: #fff;
          color: #344054;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: background .18s, border-color .18s,
            transform .18s, box-shadow .18s;
        }

        .button:hover {
          background: #f7f9fd;
          border-color: #b9c7df;
        }

        .button:active {
          transform: translateY(1px);
        }

        .button-primary {
          border-color: #315fea;
          background: #315fea;
          color: #fff;
          box-shadow: 0 4px 10px rgba(49, 95, 234, .13);
        }

        .button-primary:hover {
          border-color: #244bc5;
          background: #244bc5;
          color: #fff;
        }

        .demo-banner {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 15px 17px;
          margin-bottom: 20px;
          border: 1px solid #d7e5ff;
          border-radius: 13px;
          background: #eef5ff;
          color: #244783;
        }

        .demo-banner strong {
          display: block;
          margin-bottom: 5px;
          font-size: 13px;
        }

        .demo-banner p {
          margin: 0;
          font-size: 12px;
          line-height: 1.7;
        }

        .notice {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 15px;
          margin-bottom: 20px;
          border: 1px solid #bce8ce;
          border-radius: 11px;
          background: #effcf4;
          color: #166534;
          font-size: 13px;
        }

        .notice button {
          display: grid;
          place-items: center;
          border: 0;
          border-radius: 6px;
          background: transparent;
          color: inherit;
          padding: 5px;
          cursor: pointer;
        }

        .metric-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 22px;
        }

        .metric-card,
        .panel {
          border: 1px solid #e2e7f0;
          border-radius: 16px;
          background: #fff;
          box-shadow: 0 3px 12px rgba(22, 34, 60, .025);
        }

        .metric-card {
          padding: 20px;
        }

        .metric-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .metric-title {
          color: #667085;
          font-size: 12px;
          font-weight: 650;
        }

        .metric-value {
          margin-top: 12px;
          font-size: 31px;
          font-weight: 800;
          letter-spacing: -1px;
        }

        .metric-description {
          margin-top: 9px;
          color: #8992a3;
          font-size: 11px;
          line-height: 1.5;
        }

        .metric-icon {
          display: grid;
          width: 43px;
          height: 43px;
          flex-shrink: 0;
          place-items: center;
          border-radius: 12px;
        }

        .tone-blue {
          background: #edf3ff;
          color: #315fea;
        }

        .tone-green {
          background: #eafaf0;
          color: #168044;
        }

        .tone-purple {
          background: #f3edff;
          color: #7c3aed;
        }

        .tone-orange {
          background: #fff3e8;
          color: #c65b16;
        }

        .panel {
          padding: 22px;
          margin-bottom: 22px;
        }

        .panel-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }

        .panel-heading h2 {
          margin: 0;
          font-size: 16px;
          font-weight: 750;
          letter-spacing: -.2px;
        }

        .panel-heading p {
          margin: 7px 0 0;
          color: #7b8495;
          font-size: 12px;
          line-height: 1.6;
        }

        .count-pill {
          flex-shrink: 0;
          padding: 8px 11px;
          border-radius: 9px;
          background: #f1f4f9;
          color: #596579;
          font-size: 11px;
          font-weight: 700;
        }

        .filter-grid {
          display: grid;
          grid-template-columns: minmax(220px, 1.5fr) repeat(2, minmax(160px, 1fr));
          gap: 12px;
          margin-top: 22px;
        }

        .search-wrap,
        .select-wrap {
          position: relative;
        }

        .search-wrap > svg {
          position: absolute;
          top: 13px;
          left: 13px;
          color: #98a2b3;
          pointer-events: none;
        }

        .select-wrap > svg {
          position: absolute;
          top: 13px;
          right: 12px;
          color: #98a2b3;
          pointer-events: none;
        }

        .field {
          width: 100%;
          min-height: 43px;
          box-sizing: border-box;
          padding: 11px 13px;
          border: 1px solid #dce2ec;
          border-radius: 9px;
          outline: none;
          background: #fff;
          color: #344054;
          font-family: inherit;
          font-size: 12px;
          transition: border-color .18s, box-shadow .18s;
        }

        .field:focus {
          border-color: #7395ff;
          box-shadow: 0 0 0 3px rgba(49, 95, 234, .10);
        }

        .search-field {
          padding-left: 39px;
        }

        .select-field {
          appearance: none;
          padding-right: 35px;
          cursor: pointer;
        }

        .table-scroll {
          width: 100%;
          overflow-x: auto;
          margin-top: 20px;
        }

        .identity-table {
          width: 100%;
          min-width: 980px;
          border-collapse: separate;
          border-spacing: 0;
          text-align: left;
        }

        .identity-table th {
          padding: 13px 12px;
          border-top: 1px solid #e9edf4;
          border-bottom: 1px solid #e9edf4;
          background: #f8faff;
          color: #798397;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1px;
          white-space: nowrap;
        }

        .identity-table td {
          padding: 14px 12px;
          border-bottom: 1px solid #edf0f5;
          color: #596579;
          font-size: 11px;
          vertical-align: middle;
        }

        .identity-table tbody tr {
          transition: background .15s;
        }

        .identity-table tbody tr:hover {
          background: #fafbff;
        }

        .identity-cell {
          display: flex;
          align-items: center;
          gap: 11px;
          min-width: 210px;
          padding: 0;
          border: 0;
          background: transparent;
          text-align: left;
          cursor: pointer;
        }

        .avatar {
          display: grid;
          width: 39px;
          height: 39px;
          flex-shrink: 0;
          place-items: center;
          border: 1px solid #dce7ff;
          border-radius: 12px;
          background: #edf3ff;
          color: #315fea;
          font-size: 12px;
          font-weight: 800;
        }

        .identity-name {
          color: #253047;
          font-size: 12px;
          font-weight: 750;
        }

        .identity-email {
          max-width: 220px;
          margin-top: 4px;
          overflow-wrap: anywhere;
          color: #7d8798;
          font-size: 10px;
        }

        .identity-id {
          margin-top: 4px;
          color: #a1a9b7;
          font-size: 9px;
        }

        .method-pill {
          display: inline-block;
          padding: 6px 8px;
          border: 1px solid #e5e9f0;
          border-radius: 7px;
          background: #f7f8fb;
          color: #596579;
          font-size: 10px;
          white-space: nowrap;
        }

        .mfa-status {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          white-space: nowrap;
          font-size: 10px;
          font-weight: 700;
        }

        .mfa-on {
          color: #168044;
        }

        .mfa-off {
          color: #b7791f;
        }

        .status {
          display: inline-flex;
          padding: 6px 9px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 750;
          white-space: nowrap;
        }

        .status-active {
          background: #eafaf0;
          color: #168044;
        }

        .status-suspended {
          background: #fff0f0;
          color: #c53434;
        }

        .status-pending {
          background: #fff6e5;
          color: #a66b0b;
        }

        .row-menu-wrap {
          position: relative;
        }

        .icon-button {
          display: inline-grid;
          width: 33px;
          height: 33px;
          place-items: center;
          border: 1px solid #e0e5ee;
          border-radius: 8px;
          background: #fff;
          color: #647084;
          cursor: pointer;
        }

        .icon-button:hover {
          background: #f3f6fc;
          color: #315fea;
        }

        .row-menu {
          position: absolute;
          top: 38px;
          right: 0;
          z-index: 10;
          width: 174px;
          padding: 5px;
          border: 1px solid #e0e5ee;
          border-radius: 10px;
          background: #fff;
          box-shadow: 0 12px 30px rgba(24, 39, 75, .13);
        }

        .row-menu button {
          display: flex;
          width: 100%;
          padding: 10px;
          border: 0;
          border-radius: 7px;
          background: transparent;
          color: #475467;
          text-align: left;
          font-size: 11px;
          cursor: pointer;
        }

        .row-menu button:hover {
          background: #f3f6fc;
          color: #315fea;
        }

        .empty-state {
          padding: 42px 16px !important;
          color: #8992a3 !important;
          text-align: center;
        }

        .table-footnote {
          margin: 16px 0 0;
          color: #929bac;
          font-size: 10px;
        }

        .lower-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }

        .lower-grid .panel {
          margin-bottom: 0;
        }

        .setting-list {
          margin-top: 22px;
        }

        .setting-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 15px;
          padding: 16px 0;
          border-bottom: 1px solid #edf0f5;
        }

        .setting-row:first-child {
          padding-top: 0;
        }

        .setting-row:last-child {
          padding-bottom: 0;
          border-bottom: 0;
        }

        .setting-title {
          color: #344054;
          font-size: 12px;
          font-weight: 750;
        }

        .setting-description {
          margin-top: 5px;
          color: #8992a3;
          font-size: 11px;
          line-height: 1.6;
        }

        .switch {
          position: relative;
          display: inline-flex;
          width: 42px;
          height: 24px;
          flex-shrink: 0;
          align-items: center;
          padding: 3px;
          border: 0;
          border-radius: 20px;
          cursor: pointer;
          transition: background .18s;
        }

        .switch-on {
          background: #315fea;
        }

        .switch-off {
          background: #d5dbe5;
        }

        .switch-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, .15);
          transition: transform .18s;
        }

        .switch-on .switch-thumb {
          transform: translateX(18px);
        }

        .switch-off .switch-thumb {
          transform: translateX(0);
        }

        .warning-note {
          margin-top: 20px;
          padding: 12px 13px;
          border: 1px solid #f5e2b8;
          border-radius: 10px;
          background: #fff9eb;
          color: #97651b;
          font-size: 11px;
          line-height: 1.7;
        }

        .event-list {
          margin-top: 21px;
        }

        .event-row {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          padding: 14px 0;
          border-bottom: 1px solid #edf0f5;
        }

        .event-row:first-child {
          padding-top: 0;
        }

        .event-row:last-child {
          padding-bottom: 0;
          border-bottom: 0;
        }

        .event-icon {
          display: grid;
          width: 34px;
          height: 34px;
          flex-shrink: 0;
          place-items: center;
          border-radius: 10px;
          background: #f0f4fc;
          color: #315fea;
        }

        .event-content {
          min-width: 0;
          flex: 1;
        }

        .event-title {
          color: #344054;
          font-size: 12px;
          font-weight: 750;
        }

        .event-email {
          margin-top: 5px;
          overflow-wrap: anywhere;
          color: #7b8495;
          font-size: 10px;
        }

        .event-meta {
          margin-top: 6px;
          color: #9aa3b1;
          font-size: 9px;
        }

        .event-result {
          flex-shrink: 0;
          padding: 5px 7px;
          border-radius: 6px;
          background: #f1f4f8;
          color: #667085;
          font-size: 9px;
        }

        .page-footer {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 19px 2px;
          border-top: 1px solid #e1e6ef;
          color: #9099a8;
          font-size: 10px;
        }

        .footer-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .overlay {
          position: fixed;
          inset: 0;
          z-index: 50;
          display: flex;
          justify-content: flex-end;
          background: rgba(15, 23, 42, .45);
          backdrop-filter: blur(2px);
        }

        .drawer {
          width: 100%;
          max-width: 440px;
          height: 100%;
          overflow-y: auto;
          padding: 28px;
          background: #fff;
          box-shadow: -12px 0 45px rgba(15, 23, 42, .14);
          animation: slide-in .2s ease-out;
        }

        .drawer-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 15px;
        }

        .drawer-eyebrow {
          color: #315fea;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.3px;
        }

        .drawer-title {
          margin: 10px 0 0;
          color: #172033;
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -.5px;
        }

        .drawer-subtitle {
          margin-top: 7px;
          overflow-wrap: anywhere;
          color: #7b8495;
          font-size: 12px;
          line-height: 1.6;
        }

        .detail-list {
          margin-top: 26px;
        }

        .detail-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          padding: 15px 0;
          border-bottom: 1px solid #edf0f5;
        }

        .detail-label {
          color: #7b8495;
          font-size: 12px;
        }

        .detail-value {
          max-width: 62%;
          overflow-wrap: anywhere;
          color: #344054;
          text-align: right;
          font-size: 12px;
          font-weight: 750;
        }

        .info-note {
          margin-top: 23px;
          padding: 14px;
          border: 1px solid #d7e5ff;
          border-radius: 11px;
          background: #eef5ff;
          color: #244783;
          font-size: 11px;
          line-height: 1.7;
        }

        .drawer-actions {
          display: grid;
          gap: 10px;
          margin-top: 22px;
        }

        .full-button {
          width: 100%;
          min-height: 44px;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 60;
          display: grid;
          place-items: center;
          padding: 18px;
          background: rgba(15, 23, 42, .52);
          backdrop-filter: blur(3px);
        }

        .modal {
          width: 100%;
          max-width: 650px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 26px;
          border: 1px solid #e7ebf3;
          border-radius: 18px;
          background: #fff;
          box-shadow: 0 25px 80px rgba(15, 23, 42, .2);
          animation: modal-in .18s ease-out;
        }

        .modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 21px;
          font-weight: 800;
        }

        .modal-header p {
          margin: 7px 0 0;
          color: #7b8495;
          font-size: 12px;
          line-height: 1.6;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 17px;
          margin-top: 23px;
        }

        .form-label {
          display: grid;
          align-content: start;
          gap: 8px;
          color: #475467;
          font-size: 11px;
          font-weight: 750;
        }

        .checkbox-card {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          padding: 14px;
          margin-top: 20px;
          border: 1px solid #e1e6ef;
          border-radius: 11px;
          cursor: pointer;
        }

        .checkbox-card input {
          width: 16px;
          height: 16px;
          margin-top: 2px;
          accent-color: #315fea;
        }

        .checkbox-title {
          color: #344054;
          font-size: 12px;
          font-weight: 750;
        }

        .checkbox-description {
          margin-top: 5px;
          color: #8992a3;
          font-size: 10px;
          line-height: 1.6;
        }

        .form-error {
          margin-top: 15px;
          color: #c53434;
          font-size: 12px;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          flex-wrap: wrap;
          gap: 9px;
          padding-top: 20px;
          margin-top: 22px;
          border-top: 1px solid #edf0f5;
        }

        .settings-intro {
          margin-top: 14px;
          color: #7b8495;
          font-size: 12px;
          line-height: 1.7;
        }

        @keyframes slide-in {
          from { transform: translateX(20px); opacity: .7; }
          to { transform: translateX(0); opacity: 1; }
        }

        @keyframes modal-in {
          from { transform: translateY(8px); opacity: .6; }
          to { transform: translateY(0); opacity: 1; }
        }

        @media (max-width: 1100px) {
          .identity-page {
            padding: 24px;
          }

          .metric-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .page-header {
            flex-direction: column;
          }

          .lower-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 650px) {
          .identity-page {
            padding: 16px;
          }

          .page-header {
            gap: 18px;
          }

          .header-actions {
            width: 100%;
          }

          .header-actions .button {
            flex: 1;
          }

          .metric-grid {
            grid-template-columns: 1fr;
            gap: 11px;
          }

          .metric-card {
            padding: 17px;
          }

          .panel {
            padding: 16px;
            border-radius: 13px;
          }

          .filter-grid {
            grid-template-columns: 1fr;
          }

          .panel-heading {
            flex-direction: column;
          }

          .count-pill {
            align-self: flex-start;
          }

          .drawer {
            padding: 22px;
          }

          .modal {
            padding: 19px;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .modal-footer .button {
            flex: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: .01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>

      <div className="identity-container">
        <header className="page-header">
          <div>
            <div className="eyebrow">
              <Fingerprint size={16} />
              <span>MODELNOW ADMIN</span>
              <span className="eyebrow-separator">/</span>
              <span>SECURITY</span>
              <span className="eyebrow-separator">/</span>
              <span>IDENTITY</span>
            </div>

            <h1>Identity &amp; Authentication</h1>

            <p className="page-description">
              Manage identity records, authentication methods, MFA adoption,
              and sign-in activity from one security workspace.
            </p>
          </div>

          <div className="header-actions">
            <button className="button" onClick={exportCsv}>
              <Download size={15} />
              Export CSV
            </button>

            <button
              className="button"
              onClick={() => setShowSettings(true)}
            >
              <LockKeyhole size={15} />
              Auth settings
            </button>

            <button
              className="button button-primary"
              onClick={openCreate}
            >
              <Plus size={16} />
              Add identity
            </button>
          </div>
        </header>

        <div className="demo-banner">
          <Activity size={19} />
          <div>
            <strong>Frontend demonstration</strong>
            <p>
              Identity records, events, and authentication settings are sample
              data. Changes remain in page state and are not persisted to a
              server. This prototype does not authenticate real users or
              enforce security policies.
            </p>
          </div>
        </div>

        {notice && (
          <div className="notice" role="status">
            <span>{notice}</span>
            <button
              onClick={() => setNotice("")}
              aria-label="Dismiss notification"
            >
              <X size={15} />
            </button>
          </div>
        )}

        <section className="metric-grid" aria-label="Identity metrics">
          {metrics.map((metric) => {
            const Icon = metric.icon;

            return (
              <article className="metric-card" key={metric.title}>
                <div className="metric-top">
                  <div>
                    <div className="metric-title">{metric.title}</div>
                    <div className="metric-value">{metric.value}</div>
                  </div>

                  <div className={`metric-icon tone-${metric.tone}`}>
                    <Icon size={21} />
                  </div>
                </div>

                <div className="metric-description">
                  {metric.description}
                </div>
              </article>
            );
          })}
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Identity directory</h2>
              <p>
                Search records, review authentication configuration, and
                manage identity status.
              </p>
            </div>

            <span className="count-pill">
              {filteredIdentities.length} of {identities.length} identities
            </span>
          </div>

          <div className="filter-grid">
            <div className="search-wrap">
              <Search size={16} />
              <input
                className="field search-field"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, email, role, provider..."
                aria-label="Search identities"
              />
            </div>

            <div className="select-wrap">
              <select
                className="field select-field"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label="Filter by status"
              >
                <option>All statuses</option>
                <option>Active</option>
                <option>Suspended</option>
                <option>Pending</option>
              </select>
              <ChevronDown size={15} />
            </div>

            <div className="select-wrap">
              <select
                className="field select-field"
                value={methodFilter}
                onChange={(event) => setMethodFilter(event.target.value)}
                aria-label="Filter by authentication method"
              >
                <option>All methods</option>
                <option>Password + MFA</option>
                <option>Password</option>
                <option>SSO</option>
                <option>Passkey</option>
              </select>
              <ChevronDown size={15} />
            </div>
          </div>

          <div className="table-scroll">
            <table className="identity-table">
              <thead>
                <tr>
                  {[
                    "IDENTITY",
                    "ROLE",
                    "PROVIDER",
                    "AUTH METHOD",
                    "MFA",
                    "STATUS",
                    "LAST SIGN-IN",
                    "",
                  ].map((heading, index) => (
                    <th key={`${heading}-${index}`}>{heading}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredIdentities.map((identity) => (
                  <tr key={identity.id}>
                    <td>
                      <button
                        className="identity-cell"
                        onClick={() => setSelectedIdentity(identity)}
                      >
                        <span className="avatar">
                          {identity.name
                            .split(" ")
                            .map((part) => part[0])
                            .join("")
                            .slice(0, 2)}
                        </span>

                        <span>
                          <span className="identity-name">
                            {identity.name}
                          </span>
                          <span className="identity-email">
                            {identity.email}
                          </span>
                          <span className="identity-id">
                            {identity.id}
                          </span>
                        </span>
                      </button>
                    </td>

                    <td>{identity.role}</td>
                    <td>{identity.provider}</td>

                    <td>
                      <span className="method-pill">{identity.method}</span>
                    </td>

                    <td>
                      {identity.mfa ? (
                        <span className="mfa-status mfa-on">
                          <CheckCircle2 size={14} />
                          Enabled
                        </span>
                      ) : (
                        <span className="mfa-status mfa-off">
                          <Clock3 size={14} />
                          Disabled
                        </span>
                      )}
                    </td>

                    <td>
                      <StatusBadge status={identity.status} />
                    </td>

                    <td>{identity.lastSignIn}</td>

                    <td>
                      <div className="row-menu-wrap">
                        <button
                          className="icon-button"
                          aria-label={`Actions for ${identity.email}`}
                          aria-expanded={menuId === identity.id}
                          onClick={() =>
                            setMenuId(
                              menuId === identity.id ? null : identity.id
                            )
                          }
                        >
                          <MoreHorizontal size={16} />
                        </button>

                        {menuId === identity.id && (
                          <div className="row-menu">
                            <button
                              onClick={() => {
                                setSelectedIdentity(identity);
                                setMenuId(null);
                              }}
                            >
                              <Eye size={13} style={{ marginRight: 8 }} />
                              View identity
                            </button>

                            <button onClick={() => openEdit(identity)}>
                              <Pencil size={13} style={{ marginRight: 8 }} />
                              Edit identity
                            </button>

                            <button onClick={() => toggleStatus(identity)}>
                              <ShieldAlert
                                size={13}
                                style={{ marginRight: 8 }}
                              />
                              {identity.status === "Active"
                                ? "Suspend identity"
                                : "Activate identity"}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredIdentities.length === 0 && (
                  <tr>
                    <td colSpan={8} className="empty-state">
                      No identities match the current filters.
                      <div style={{ marginTop: 12 }}>
                        <button
                          className="button"
                          onClick={resetFilters}
                        >
                          <RefreshCw size={13} />
                          Reset filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <p className="table-footnote">
            Sample identity records · Changes are temporary and local to this page.
          </p>
        </section>

        <section className="lower-grid">
          <article className="panel">
            <div className="panel-heading">
              <div>
                <h2>Authentication controls</h2>
                <p>Demo configuration for sign-in methods.</p>
              </div>
              <LockKeyhole size={20} color="#315fea" />
            </div>

            <div className="setting-list">
              <SettingRow
                title="Require MFA for administrators"
                description="Illustrative policy for privileged roles."
                checked={settings.requireMfaAdmins}
                onChange={(checked) =>
                  setSettings((current) => ({
                    ...current,
                    requireMfaAdmins: checked,
                  }))
                }
              />

              <SettingRow
                title="Allow password authentication"
                description="Permit password-based sign-in."
                checked={settings.allowPasswordLogin}
                onChange={(checked) =>
                  setSettings((current) => ({
                    ...current,
                    allowPasswordLogin: checked,
                  }))
                }
              />

              <SettingRow
                title="Allow single sign-on (SSO)"
                description="Enable configured identity providers."
                checked={settings.allowSso}
                onChange={(checked) =>
                  setSettings((current) => ({
                    ...current,
                    allowSso: checked,
                  }))
                }
              />

              <SettingRow
                title="Allow passkeys"
                description="Allow supported passkey authentication."
                checked={settings.allowPasskeys}
                onChange={(checked) =>
                  setSettings((current) => ({
                    ...current,
                    allowPasskeys: checked,
                  }))
                }
              />
            </div>

            <div className="warning-note">
              These switches only update this page&apos;s local state.
              Backend integration is required before real authentication
              policies can be enforced.
            </div>
          </article>

          <article className="panel">
            <div className="panel-heading">
              <div>
                <h2>Recent authentication events</h2>
                <p>Illustrative event stream for interface testing.</p>
              </div>
              <Activity size={20} color="#315fea" />
            </div>

            <div className="event-list">
              {events.slice(0, 6).map((event) => (
                <div className="event-row" key={event.id}>
                  <div className="event-icon">
                    <Activity size={16} />
                  </div>

                  <div className="event-content">
                    <div className="event-title">{event.event}</div>
                    <div className="event-email">{event.identity}</div>
                    <div className="event-meta">
                      {event.id} · {event.time}
                    </div>
                  </div>

                  <span className="event-result">{event.result}</span>
                </div>
              ))}
            </div>
          </article>
        </section>

        <footer className="page-footer">
          <span>ModelNow Identity &amp; Authentication · Frontend prototype</span>
          <span className="footer-status">
            <Check size={14} />
            Demo interface loaded
          </span>
        </footer>
      </div>

      {selectedIdentity && (
        <div
          className="overlay"
          onClick={() => setSelectedIdentity(null)}
        >
          <aside
            className="drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Identity details"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="drawer-header">
              <div>
                <div className="drawer-eyebrow">IDENTITY DETAILS</div>
                <h2 className="drawer-title">
                  {selectedIdentity.name}
                </h2>
                <p className="drawer-subtitle">
                  {selectedIdentity.email}
                </p>
              </div>

              <button
                className="icon-button"
                onClick={() => setSelectedIdentity(null)}
                aria-label="Close identity details"
              >
                <X size={17} />
              </button>
            </div>

            <div className="detail-list">
              <DetailRow label="Identity ID" value={selectedIdentity.id} />
              <DetailRow label="Role" value={selectedIdentity.role} />
              <DetailRow label="Provider" value={selectedIdentity.provider} />
              <DetailRow label="Method" value={selectedIdentity.method} />
              <DetailRow label="Status" value={selectedIdentity.status} />
              <DetailRow
                label="Last sign-in"
                value={selectedIdentity.lastSignIn}
              />
              <DetailRow
                label="MFA"
                value={selectedIdentity.mfa ? "Enabled" : "Disabled"}
              />
            </div>

            <div className="info-note">
              Authentication state is simulated. This panel does not verify
              credentials or modify a real account.
            </div>

            <div className="drawer-actions">
              <button
                className="button full-button"
                onClick={() => toggleMfa(selectedIdentity)}
              >
                <ShieldCheck size={15} />
                {selectedIdentity.mfa
                  ? "Disable demo MFA"
                  : "Enable demo MFA"}
              </button>

              <button
                className="button button-primary full-button"
                onClick={() => {
                  const identity = selectedIdentity;
                  setSelectedIdentity(null);
                  openEdit(identity);
                }}
              >
                <Pencil size={15} />
                Edit identity
              </button>

              <button
                className="button full-button"
                onClick={() => toggleStatus(selectedIdentity)}
              >
                <ShieldAlert size={15} />
                {selectedIdentity.status === "Active"
                  ? "Suspend identity"
                  : "Activate identity"}
              </button>
            </div>
          </aside>
        </div>
      )}

      {formOpen && (
        <div
          className="modal-overlay"
          onClick={() => setFormOpen(false)}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label={editingId ? "Edit identity" : "Add identity"}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>{editingId ? "Edit identity" : "Add identity"}</h2>
                <p>
                  Configure the identity record for this frontend demo.
                </p>
              </div>

              <button
                className="icon-button"
                onClick={() => setFormOpen(false)}
                aria-label="Close identity form"
              >
                <X size={16} />
              </button>
            </div>

            <div className="form-grid">
              <label className="form-label">
                Full name *
                <input
                  className="field"
                  value={draft.name}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Full name"
                />
              </label>

              <label className="form-label">
                Email address *
                <input
                  className="field"
                  type="email"
                  value={draft.email}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  placeholder="name@company.com"
                />
              </label>

              <label className="form-label">
                Role
                <select
                  className="field"
                  value={draft.role}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      role: event.target.value,
                    }))
                  }
                >
                  <option>Super Admin</option>
                  <option>Organization Admin</option>
                  <option>Workspace Admin</option>
                  <option>Developer</option>
                  <option>Analyst</option>
                  <option>Billing Manager</option>
                  <option>Viewer</option>
                  <option>Support Agent</option>
                </select>
              </label>

              <label className="form-label">
                Identity provider
                <select
                  className="field"
                  value={draft.provider}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      provider: event.target.value,
                    }))
                  }
                >
                  <option>ModelNow Identity</option>
                  <option>Microsoft Entra ID</option>
                  <option>Google Workspace</option>
                  <option>External SAML Provider</option>
                </select>
              </label>

              <label className="form-label">
                Authentication method
                <select
                  className="field"
                  value={draft.method}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      method: event.target.value as AuthMethod,
                    }))
                  }
                >
                  <option>Password + MFA</option>
                  <option>Password</option>
                  <option>SSO</option>
                  <option>Passkey</option>
                </select>
              </label>

              <label className="form-label">
                Status
                <select
                  className="field"
                  value={draft.status}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      status: event.target.value as IdentityStatus,
                    }))
                  }
                >
                  <option>Pending</option>
                  <option>Active</option>
                  <option>Suspended</option>
                </select>
              </label>
            </div>

            <label className="checkbox-card">
              <input
                type="checkbox"
                checked={draft.mfa}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    mfa: event.target.checked,
                  }))
                }
              />

              <span>
                <span className="checkbox-title">MFA enabled</span>
                <span className="checkbox-description">
                  Demo field only; this does not enroll a real authenticator.
                </span>
              </span>
            </label>

            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}

            <div className="modal-footer">
              <button
                className="button"
                onClick={() => setFormOpen(false)}
              >
                Cancel
              </button>

              <button
                className="button button-primary"
                onClick={saveIdentity}
              >
                {editingId ? "Save changes" : "Add identity"}
              </button>
            </div>
          </section>
        </div>
      )}

      {showSettings && (
        <div
          className="overlay"
          onClick={() => setShowSettings(false)}
        >
          <aside
            className="drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Authentication settings"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="drawer-header">
              <div>
                <div className="drawer-eyebrow">CONFIGURATION</div>
                <h2 className="drawer-title">
                  Authentication settings
                </h2>
              </div>

              <button
                className="icon-button"
                onClick={() => setShowSettings(false)}
                aria-label="Close authentication settings"
              >
                <X size={17} />
              </button>
            </div>

            <p className="settings-intro">
              Configure illustrative authentication preferences for the
              current frontend session.
            </p>

            <div className="setting-list">
              <SettingRow
                title="Require MFA for administrators"
                description="Demo preference for privileged identities."
                checked={settings.requireMfaAdmins}
                onChange={(checked) =>
                  setSettings((current) => ({
                    ...current,
                    requireMfaAdmins: checked,
                  }))
                }
              />

              <SettingRow
                title="Allow password authentication"
                description="Demo preference for password-based sign-in."
                checked={settings.allowPasswordLogin}
                onChange={(checked) =>
                  setSettings((current) => ({
                    ...current,
                    allowPasswordLogin: checked,
                  }))
                }
              />

              <SettingRow
                title="Allow SSO"
                description="Demo preference for external identity providers."
                checked={settings.allowSso}
                onChange={(checked) =>
                  setSettings((current) => ({
                    ...current,
                    allowSso: checked,
                  }))
                }
              />

              <SettingRow
                title="Allow passkeys"
                description="Demo preference for passkey sign-in."
                checked={settings.allowPasskeys}
                onChange={(checked) =>
                  setSettings((current) => ({
                    ...current,
                    allowPasskeys: checked,
                  }))
                }
              />
            </div>

            <div className="warning-note">
              Saving these options does not configure your identity provider.
              Connect the backend before applying real security policies.
            </div>

            <div className="drawer-actions">
              <button
                className="button button-primary full-button"
                onClick={() => {
                  setShowSettings(false);
                  setNotice(
                    "Authentication preferences updated in local state."
                  );
                }}
              >
                <Check size={15} />
                Save demo preferences
              </button>

              <button
                className="button full-button"
                onClick={() => setShowSettings(false)}
              >
                Cancel
              </button>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}

function StatusBadge({ status }: { status: IdentityStatus }) {
  const className =
    status === "Active"
      ? "status-active"
      : status === "Suspended"
        ? "status-suspended"
        : "status-pending";

  return <span className={`status ${className}`}>{status}</span>;
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value}</span>
    </div>
  );
}

function SettingRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="setting-row">
      <div>
        <div className="setting-title">{title}</div>
        <div className="setting-description">{description}</div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={() => onChange(!checked)}
        className={`switch ${checked ? "switch-on" : "switch-off"}`}
      >
        <span className="switch-thumb" />
      </button>
    </div>
  );
}
