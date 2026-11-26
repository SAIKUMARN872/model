
"use client";

import { useMemo, useState, type CSSProperties } from "react";
import {
  AlertTriangle,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Download,
  Eye,
  FileText,
  Filter,
  Mail,
  MessageSquare,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserRound,
  X,
  RotateCcw,
} from "lucide-react";

type SuspensionStatus = "Suspended" | "Under review" | "Eligible for review";
type SuspensionReason =
  | "Payment overdue"
  | "Policy violation"
  | "Suspicious activity"
  | "Terms violation"
  | "Administrator action";

type Organization = {
  id: string;
  name: string;
  slug: string;
  email: string;
  plan: string;
  members: number;
  reason: SuspensionReason;
  status: SuspensionStatus;
  suspendedAt: string;
  suspendedBy: string;
  lastActivity: string;
  notes: string;
};

const initialOrganizations: Organization[] = [
  {
    id: "ORG-1042",
    name: "NovaTech Solutions",
    slug: "novatech-solutions",
    email: "admin@novatech.example",
    plan: "Enterprise",
    members: 84,
    reason: "Payment overdue",
    status: "Suspended",
    suspendedAt: "2026-10-29",
    suspendedBy: "Billing system",
    lastActivity: "6 days ago",
    notes: "Subscription payment requires verification before service restoration.",
  },
  {
    id: "ORG-1037",
    name: "BrightPath AI",
    slug: "brightpath-ai",
    email: "ops@brightpath.example",
    plan: "Business",
    members: 32,
    reason: "Policy violation",
    status: "Under review",
    suspendedAt: "2026-10-27",
    suspendedBy: "Trust & Safety",
    lastActivity: "8 days ago",
    notes: "Reported activity requires review by the authorized compliance team.",
  },
  {
    id: "ORG-1028",
    name: "CloudMatrix Labs",
    slug: "cloudmatrix-labs",
    email: "admin@cloudmatrix.example",
    plan: "Enterprise",
    members: 126,
    reason: "Suspicious activity",
    status: "Suspended",
    suspendedAt: "2026-10-22",
    suspendedBy: "Security team",
    lastActivity: "13 days ago",
    notes: "Unusual API usage requires security investigation.",
  },
  {
    id: "ORG-1019",
    name: "NextWave Digital",
    slug: "nextwave-digital",
    email: "team@nextwave.example",
    plan: "Starter",
    members: 12,
    reason: "Terms violation",
    status: "Eligible for review",
    suspendedAt: "2026-10-18",
    suspendedBy: "Admin",
    lastActivity: "17 days ago",
    notes: "Review the recorded incident and determine the appropriate next step.",
  },
  {
    id: "ORG-1008",
    name: "Vertex Data Systems",
    slug: "vertex-data",
    email: "support@vertex.example",
    plan: "Business",
    members: 48,
    reason: "Administrator action",
    status: "Suspended",
    suspendedAt: "2026-10-12",
    suspendedBy: "Platform admin",
    lastActivity: "23 days ago",
    notes: "Organization access was restricted pending an administrative review.",
  },
  {
    id: "ORG-0994",
    name: "Apex Intelligence",
    slug: "apex-intelligence",
    email: "it@apex.example",
    plan: "Enterprise",
    members: 67,
    reason: "Payment overdue",
    status: "Under review",
    suspendedAt: "2026-10-08",
    suspendedBy: "Billing system",
    lastActivity: "27 days ago",
    notes: "Billing team must confirm the outstanding balance and payment status.",
  },
];

const reasons: SuspensionReason[] = [
  "Payment overdue",
  "Policy violation",
  "Suspicious activity",
  "Terms violation",
  "Administrator action",
];

const statusOptions: SuspensionStatus[] = [
  "Suspended",
  "Under review",
  "Eligible for review",
];

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #dfe5ef",
  borderRadius: 8,
  background: "#fff",
  color: "#34415a",
  fontSize: 12,
  outline: "none",
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusClass(status: SuspensionStatus) {
  if (status === "Suspended") return "suspended";
  if (status === "Under review") return "review";
  return "eligible";
}

export default function SuspendedOrganizationsPage() {
  const [organizations, setOrganizations] =
    useState<Organization[]>(initialOrganizations);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [reasonFilter, setReasonFilter] = useState("All reasons");
  const [planFilter, setPlanFilter] = useState("All plans");
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<Organization | null>(null);
  const [reviewTarget, setReviewTarget] = useState<Organization | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState<"success" | "warning">("success");
  const [actionLoading, setActionLoading] = useState(false);

  const filteredOrganizations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return organizations.filter((org) => {
      const matchesSearch =
        !query ||
        [
          org.id,
          org.name,
          org.slug,
          org.email,
          org.reason,
          org.suspendedBy,
        ].some((value) => value.toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "All statuses" || org.status === statusFilter;

      const matchesReason =
        reasonFilter === "All reasons" || org.reason === reasonFilter;

      const matchesPlan =
        planFilter === "All plans" || org.plan === planFilter;

      return matchesSearch && matchesStatus && matchesReason && matchesPlan;
    });
  }, [organizations, search, statusFilter, reasonFilter, planFilter]);

  const suspendedCount = organizations.filter(
    (org) => org.status === "Suspended",
  ).length;

  const reviewCount = organizations.filter(
    (org) => org.status === "Under review",
  ).length;

  const eligibleCount = organizations.filter(
    (org) => org.status === "Eligible for review",
  ).length;

  const affectedMembers = organizations.reduce(
    (total, org) => total + org.members,
    0,
  );

  function notify(
    message: string,
    type: "success" | "warning" = "success",
  ) {
    setNotice(message);
    setNoticeType(type);
  }

  function updateStatus(
    id: string,
    status: SuspensionStatus,
    notes?: string,
  ) {
    setOrganizations((current) =>
      current.map((org) =>
        org.id === id
          ? { ...org, status, notes: notes?.trim() || org.notes }
          : org,
      ),
    );

    setSelected((current) =>
      current?.id === id
        ? {
            ...current,
            status,
            notes: notes?.trim() || current.notes,
          }
        : current,
    );
  }

  function submitReview() {
    if (!reviewTarget) return;

    setActionLoading(true);

    const target = reviewTarget;

    // Local preview only. No production suspension state is changed.
    setOrganizations((current) =>
      current.map((org) =>
        org.id === target.id
          ? {
              ...org,
              status: "Under review",
              notes: reviewNotes.trim() || org.notes,
            }
          : org,
      ),
    );

    setActionLoading(false);
    setReviewTarget(null);
    setReviewNotes("");
    notify(
      `${target.name} moved to Under review in this page's local preview.`,
    );
  }

  function exportCsv() {
    const headers = [
      "Organization ID",
      "Organization",
      "Slug",
      "Contact Email",
      "Plan",
      "Members",
      "Suspension Reason",
      "Status",
      "Suspended At",
      "Suspended By",
      "Last Activity",
      "Notes",
    ];

    const rows = filteredOrganizations.map((org) => [
      org.id,
      org.name,
      org.slug,
      org.email,
      org.plan,
      org.members,
      org.reason,
      org.status,
      org.suspendedAt,
      org.suspendedBy,
      org.lastActivity,
      org.notes,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "modelnow-suspended-organizations.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    notify("Filtered organization records exported to CSV.");
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("All statuses");
    setReasonFilter("All reasons");
    setPlanFilter("All plans");
  }

  return (
    <main className="suspended-org-page">
      <style>{`
        .suspended-org-page {
          min-height: 100vh;
          padding: 28px;
          background: #f7f8fc;
          color: #182238;
          font-family: Arial, Helvetica, sans-serif;
        }
        .suspended-org-container { max-width: 1450px; margin: 0 auto; }
        .suspended-org-breadcrumb { margin-bottom: 14px; color: #8993a6; font-size: 12px; }
        .suspended-org-breadcrumb span { color: #315fe8; }
        .suspended-org-header {
          display: flex; justify-content: space-between; align-items: flex-start;
          gap: 18px; flex-wrap: wrap; margin-bottom: 22px;
        }
        .suspended-org-title { margin: 0 0 8px; font-size: 27px; font-weight: 750; letter-spacing: -.7px; }
        .suspended-org-subtitle { margin: 0; color: #818ca0; font-size: 12px; line-height: 1.7; }
        .suspended-org-actions { display: flex; gap: 9px; flex-wrap: wrap; }
        .suspended-org-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 7px;
          padding: 10px 12px; border: 1px solid #dfe5ef; border-radius: 8px;
          background: #fff; color: #46536a; font-size: 11px; font-weight: 650; cursor: pointer;
        }
        .suspended-org-btn:hover { background: #f2f5fc; }
        .suspended-org-btn:disabled { opacity: .55; cursor: not-allowed; }
        .suspended-org-btn.primary { background: #315fe8; border-color: #315fe8; color: #fff; }
        .suspended-org-btn.danger { background: #fff; border-color: #efcccc; color: #b33c42; }
        .suspended-org-notice {
          display: flex; justify-content: space-between; align-items: flex-start;
          gap: 12px; padding: 12px 14px; margin-bottom: 17px; border-radius: 9px;
          font-size: 11px; line-height: 1.7;
        }
        .suspended-org-notice.success { background: #effaf3; border: 1px solid #bce8ce; color: #176c40; }
        .suspended-org-notice.warning { background: #fff8e9; border: 1px solid #f1d9a6; color: #875b0a; }
        .suspended-org-notice button { border: 0; background: transparent; color: inherit; cursor: pointer; }
        .suspended-org-warning {
          display: flex; align-items: flex-start; gap: 10px; padding: 14px 16px;
          margin-bottom: 19px; border: 1px solid #f0dfbd; border-radius: 10px;
          background: #fff9ed; color: #89621f; font-size: 11px; line-height: 1.7;
        }
        .suspended-org-warning strong { color: #744c0c; }
        .suspended-org-kpis {
          display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px; margin-bottom: 19px;
        }
        .suspended-org-kpi { min-width: 0; padding: 17px; border: 1px solid #e7ebf3; border-radius: 12px; background: #fff; }
        .suspended-org-kpi-top { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 16px; }
        .suspended-org-kpi-label { color: #7e8a9f; font-size: 11px; }
        .suspended-org-kpi-icon { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 9px; background: #fceeee; color: #c34449; }
        .suspended-org-kpi-value { margin-bottom: 7px; font-size: 25px; font-weight: 750; letter-spacing: -.5px; }
        .suspended-org-kpi-note { color: #8b95a7; font-size: 10px; line-height: 1.6; }
        .suspended-org-card { min-width: 0; border: 1px solid #e7ebf3; border-radius: 12px; background: #fff; overflow: hidden; }
        .suspended-org-card-header {
          display: flex; justify-content: space-between; align-items: flex-start;
          gap: 12px; padding: 19px 20px; border-bottom: 1px solid #edf0f5;
        }
        .suspended-org-card-title { margin: 0 0 6px; font-size: 13px; font-weight: 750; }
        .suspended-org-card-description { margin: 0; color: #8993a6; font-size: 10px; line-height: 1.6; }
        .suspended-org-toolbar {
          display: flex; justify-content: space-between; align-items: center;
          gap: 12px; flex-wrap: wrap; padding: 16px 20px; border-bottom: 1px solid #edf0f5;
        }
        .suspended-org-search {
          display: flex; align-items: center; gap: 8px; width: 270px; max-width: 100%;
          padding: 10px 11px; border: 1px solid #dfe5ef; border-radius: 8px; color: #8993a6;
        }
        .suspended-org-search input { width: 100%; min-width: 0; border: 0; outline: none; background: transparent; color: #34415a; font-size: 11px; }
        .suspended-org-filter-row { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
        .suspended-org-select { max-width: 100%; padding: 9px 10px; border: 1px solid #dfe5ef; border-radius: 8px; background: #fff; color: #536078; font-size: 10px; }
        .suspended-org-table-wrap { overflow-x: auto; }
        .suspended-org-table { width: 100%; border-collapse: collapse; white-space: nowrap; }
        .suspended-org-table th { padding: 13px 15px; background: #fafbfe; color: #8993a6; font-size: 9px; font-weight: 750; text-align: left; text-transform: uppercase; letter-spacing: .4px; }
        .suspended-org-table td { padding: 14px 15px; border-top: 1px solid #edf0f5; color: #536078; font-size: 10px; }
        .suspended-org-table tbody tr:hover { background: #fafbff; }
        .suspended-org-id { color: #315fe8; font-weight: 750; }
        .suspended-org-name { color: #34415a; font-size: 11px; font-weight: 750; }
        .suspended-org-subname { margin-top: 5px; color: #929bad; font-size: 9px; }
        .suspended-org-status { display: inline-flex; align-items: center; gap: 5px; padding: 5px 8px; border-radius: 20px; font-size: 9px; font-weight: 750; }
        .suspended-org-status.suspended { background: #fff0f0; color: #b53e42; }
        .suspended-org-status.review { background: #fff5e3; color: #956016; }
        .suspended-org-status.eligible { background: #edf3ff; color: #3159b9; }
        .suspended-org-reason { display: inline-flex; align-items: center; gap: 6px; }
        .suspended-org-row-actions { display: flex; align-items: center; gap: 6px; }
        .suspended-org-icon-btn {
          display: grid; place-items: center; width: 29px; height: 29px;
          border: 1px solid #e2e7f0; border-radius: 7px; background: #fff; color: #66728a; cursor: pointer;
        }
        .suspended-org-icon-btn:hover { background: #edf2ff; color: #315fe8; }
        .suspended-org-icon-btn.review-btn { color: #315fe8; }
        .suspended-org-empty { padding: 38px 16px !important; text-align: center; color: #8993a6 !important; }
        .suspended-org-table-footer {
          display: flex; justify-content: space-between; align-items: center;
          gap: 12px; flex-wrap: wrap; padding: 14px 20px; border-top: 1px solid #edf0f5;
          color: #8993a6; font-size: 10px;
        }
        .suspended-org-modal-backdrop { position: fixed; inset: 0; z-index: 100; display: grid; place-items: center; padding: 18px; background: #0f172a7a; }
        .suspended-org-modal { width: 100%; max-width: 570px; max-height: 90vh; overflow-y: auto; border-radius: 13px; background: #fff; }
        .suspended-org-modal-header { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 18px 21px; border-bottom: 1px solid #edf0f5; }
        .suspended-org-modal-header h2 { margin: 0; font-size: 15px; }
        .suspended-org-modal-close { display: grid; place-items: center; width: 30px; height: 30px; border: 0; border-radius: 7px; background: #f3f5fa; cursor: pointer; }
        .suspended-org-modal-body { padding: 21px; }
        .suspended-org-detail-top { display: flex; align-items: center; gap: 12px; margin-bottom: 19px; }
        .suspended-org-detail-icon { display: grid; place-items: center; width: 45px; height: 45px; flex-shrink: 0; border-radius: 11px; background: #edf2ff; color: #315fe8; }
        .suspended-org-detail-name { margin: 0 0 5px; font-size: 15px; font-weight: 750; }
        .suspended-org-detail-meta { color: #8993a6; font-size: 10px; line-height: 1.6; overflow-wrap: anywhere; }
        .suspended-org-detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 11px; }
        .suspended-org-detail-item { padding: 12px; border: 1px solid #edf0f5; border-radius: 8px; min-width: 0; }
        .suspended-org-detail-label { margin-bottom: 7px; color: #8993a6; font-size: 10px; }
        .suspended-org-detail-value { color: #34415a; font-size: 11px; font-weight: 700; overflow-wrap: anywhere; }
        .suspended-org-note-box { margin-top: 14px; padding: 13px; border: 1px solid #edf0f5; border-radius: 9px; background: #fafbfe; color: #66728a; font-size: 11px; line-height: 1.7; }
        .suspended-org-modal-footer { display: flex; justify-content: flex-end; gap: 8px; flex-wrap: wrap; padding: 14px 21px; border-top: 1px solid #edf0f5; background: #fbfcfe; }
        .suspended-org-label { display: block; margin-bottom: 7px; color: #4c5870; font-size: 11px; font-weight: 650; }
        .suspended-org-textarea { width: 100%; min-height: 85px; padding: 11px 12px; border: 1px solid #dfe5ef; border-radius: 8px; font: inherit; color: #34415a; font-size: 12px; resize: vertical; outline: none; }
        @media(max-width: 1050px) { .suspended-org-kpis { grid-template-columns: repeat(2,minmax(0,1fr)); } }
        @media(max-width: 650px) {
          .suspended-org-page { padding: 15px; }
          .suspended-org-title { font-size: 23px; }
          .suspended-org-kpis { gap: 9px; }
          .suspended-org-kpi { padding: 13px; }
          .suspended-org-kpi-value { font-size: 21px; }
          .suspended-org-toolbar { padding: 14px; }
          .suspended-org-search { width: 100%; }
          .suspended-org-card-header { padding: 16px; }
          .suspended-org-table-footer { padding: 13px; }
          .suspended-org-detail-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="suspended-org-container">
        <div className="suspended-org-breadcrumb">
          Organizations / <span>Suspended Organizations</span>
        </div>

        <header className="suspended-org-header">
          <div>
            <h1 className="suspended-org-title">Suspended Organizations</h1>
            <p className="suspended-org-subtitle">
              Review restricted organizations, investigate suspension reasons, and manage review workflows.
            </p>
          </div>
          <div className="suspended-org-actions">
            <button className="suspended-org-btn" onClick={() => {
              clearFilters();
              notify("Filters cleared. Displaying all sample organization records.");
            }}>
              <RefreshCw size={14} /> Reset filters
            </button>
            <button className="suspended-org-btn primary" onClick={exportCsv}>
              <Download size={14} /> Export CSV
            </button>
          </div>
        </header>

        {notice && (
          <div className={`suspended-org-notice ${noticeType}`} role="status">
            <span>{noticeType === "success" ? <CheckCircle2 size={15} style={{ display: "inline", verticalAlign: "middle", marginRight: 7 }} /> : <AlertTriangle size={15} style={{ display: "inline", verticalAlign: "middle", marginRight: 7 }} />}{notice}</span>
            <button onClick={() => setNotice("")} aria-label="Dismiss notification"><X size={15} /></button>
          </div>
        )}

        <div className="suspended-org-warning">
          <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <strong>Administrative review required.</strong> Suspension can affect an entire organization and its members. Verify evidence, billing status, authorization, and applicable policies before taking action. All records below are illustrative preview data.
          </div>
        </div>

        <section className="suspended-org-kpis">
          <div className="suspended-org-kpi">
            <div className="suspended-org-kpi-top"><span className="suspended-org-kpi-label">Currently suspended</span><div className="suspended-org-kpi-icon"><ShieldAlert size={17} /></div></div>
            <div className="suspended-org-kpi-value">{formatNumber(suspendedCount)}</div>
            <div className="suspended-org-kpi-note">Organizations with suspended status</div>
          </div>
          <div className="suspended-org-kpi">
            <div className="suspended-org-kpi-top"><span className="suspended-org-kpi-label">Under review</span><div className="suspended-org-kpi-icon" style={{ background: "#fff5e3", color: "#a16b18" }}><Clock3 size={17} /></div></div>
            <div className="suspended-org-kpi-value">{formatNumber(reviewCount)}</div>
            <div className="suspended-org-kpi-note">Awaiting authorized review</div>
          </div>
          <div className="suspended-org-kpi">
            <div className="suspended-org-kpi-top"><span className="suspended-org-kpi-label">Eligible for review</span><div className="suspended-org-kpi-icon" style={{ background: "#edf3ff", color: "#3159b9" }}><RotateCcw size={17} /></div></div>
            <div className="suspended-org-kpi-value">{formatNumber(eligibleCount)}</div>
            <div className="suspended-org-kpi-note">Ready for an administrator decision</div>
          </div>
          <div className="suspended-org-kpi">
            <div className="suspended-org-kpi-top"><span className="suspended-org-kpi-label">Affected members</span><div className="suspended-org-kpi-icon" style={{ background: "#edf2ff", color: "#315fe8" }}><UserRound size={17} /></div></div>
            <div className="suspended-org-kpi-value">{formatNumber(affectedMembers)}</div>
            <div className="suspended-org-kpi-note">Members across listed organizations</div>
          </div>
        </section>

        <section className="suspended-org-card">
          <div className="suspended-org-card-header">
            <div>
              <h2 className="suspended-org-card-title">Organization suspension records</h2>
              <p className="suspended-org-card-description">
                Search records, filter by reason or status, and open an organization for review.
              </p>
            </div>
            <span style={{ color: "#8993a6", fontSize: 10 }}>
              {filteredOrganizations.length} records
            </span>
          </div>

          <div className="suspended-org-toolbar">
            <div className="suspended-org-search">
              <Search size={14} />
              <input
                aria-label="Search suspended organizations"
                placeholder="Search name, ID, email..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className="suspended-org-filter-row">
              <button className="suspended-org-btn" onClick={() => setShowFilters((value) => !value)}>
                <Filter size={13} /> Filters <ChevronDown size={12} style={{ transform: showFilters ? "rotate(180deg)" : undefined }} />
              </button>
              <select className="suspended-org-select" aria-label="Filter by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option>All statuses</option>
                {statusOptions.map((status) => <option key={status}>{status}</option>)}
              </select>
              {showFilters && (
                <>
                  <select className="suspended-org-select" aria-label="Filter by suspension reason" value={reasonFilter} onChange={(event) => setReasonFilter(event.target.value)}>
                    <option>All reasons</option>
                    {reasons.map((reason) => <option key={reason}>{reason}</option>)}
                  </select>
                  <select className="suspended-org-select" aria-label="Filter by plan" value={planFilter} onChange={(event) => setPlanFilter(event.target.value)}>
                    {["All plans", "Starter", "Business", "Enterprise"].map((plan) => <option key={plan}>{plan}</option>)}
                  </select>
                  <button className="suspended-org-btn" onClick={clearFilters}>Clear</button>
                </>
              )}
            </div>
          </div>

          <div className="suspended-org-table-wrap">
            <table className="suspended-org-table">
              <thead>
                <tr>
                  <th>Organization</th>
                  <th>Plan</th>
                  <th>Members</th>
                  <th>Reason</th>
                  <th>Suspended date</th>
                  <th>Status</th>
                  <th>Suspended by</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrganizations.map((org) => (
                  <tr key={org.id}>
                    <td>
                      <div className="suspended-org-name">{org.name}</div>
                      <div className="suspended-org-subname">{org.id} · {org.slug}</div>
                    </td>
                    <td>{org.plan}</td>
                    <td>{formatNumber(org.members)}</td>
                    <td><span className="suspended-org-reason"><AlertTriangle size={12} color="#b87527" />{org.reason}</span></td>
                    <td>{formatDate(org.suspendedAt)}</td>
                    <td><span className={`suspended-org-status ${statusClass(org.status)}`}>{org.status}</span></td>
                    <td>{org.suspendedBy}</td>
                    <td>
                      <div className="suspended-org-row-actions">
                        <button className="suspended-org-icon-btn" title="View organization" aria-label={`View ${org.name}`} onClick={() => setSelected(org)}><Eye size={14} /></button>
                        <button className="suspended-org-icon-btn review-btn" title="Send for review" aria-label={`Review ${org.name}`} onClick={() => { setReviewTarget(org); setReviewNotes(org.notes); }}><MessageSquare size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredOrganizations.length === 0 && (
                  <tr><td colSpan={8} className="suspended-org-empty">No organizations match your search or filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="suspended-org-table-footer">
            <span>Showing {filteredOrganizations.length} of {organizations.length} sample organizations</span>
            <span>All timestamps and records are illustrative</span>
          </div>
        </section>

        {selected && (
          <div className="suspended-org-modal-backdrop" onClick={() => setSelected(null)}>
            <section className="suspended-org-modal" role="dialog" aria-modal="true" aria-labelledby="suspended-detail-title" onClick={(event) => event.stopPropagation()}>
              <div className="suspended-org-modal-header">
                <h2 id="suspended-detail-title">Organization details</h2>
                <button className="suspended-org-modal-close" onClick={() => setSelected(null)} aria-label="Close details"><X size={15} /></button>
              </div>
              <div className="suspended-org-modal-body">
                <div className="suspended-org-detail-top">
                  <div className="suspended-org-detail-icon"><Building2 size={23} /></div>
                  <div style={{ minWidth: 0 }}>
                    <h3 className="suspended-org-detail-name">{selected.name}</h3>
                    <div className="suspended-org-detail-meta">{selected.id} · {selected.slug}</div>
                    <span className={`suspended-org-status ${statusClass(selected.status)}`} style={{ marginTop: 7 }}>{selected.status}</span>
                  </div>
                </div>

                <div className="suspended-org-detail-grid">
                  <div className="suspended-org-detail-item"><div className="suspended-org-detail-label">Plan</div><div className="suspended-org-detail-value">{selected.plan}</div></div>
                  <div className="suspended-org-detail-item"><div className="suspended-org-detail-label">Members affected</div><div className="suspended-org-detail-value">{formatNumber(selected.members)}</div></div>
                  <div className="suspended-org-detail-item"><div className="suspended-org-detail-label">Suspension reason</div><div className="suspended-org-detail-value">{selected.reason}</div></div>
                  <div className="suspended-org-detail-item"><div className="suspended-org-detail-label">Suspended date</div><div className="suspended-org-detail-value">{formatDate(selected.suspendedAt)}</div></div>
                  <div className="suspended-org-detail-item"><div className="suspended-org-detail-label">Suspended by</div><div className="suspended-org-detail-value">{selected.suspendedBy}</div></div>
                  <div className="suspended-org-detail-item"><div className="suspended-org-detail-label">Last activity</div><div className="suspended-org-detail-value">{selected.lastActivity}</div></div>
                </div>

                <div className="suspended-org-note-box">
                  <strong style={{ color: "#46536a" }}>Review notes</strong>
                  <div style={{ marginTop: 5 }}>{selected.notes}</div>
                </div>

                <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 7, color: "#7f8ba0", fontSize: 11, overflowWrap: "anywhere" }}>
                  <Mail size={14} /> {selected.email}
                </div>

                <div className="suspended-org-warning" style={{ marginTop: 15, marginBottom: 0 }}>
                  <ShieldCheck size={16} style={{ flexShrink: 0 }} />
                  Status changes in this page affect only local preview data. Production reactivation requires an authenticated backend operation and a complete audit trail.
                </div>
              </div>
              <div className="suspended-org-modal-footer">
                <button className="suspended-org-btn" onClick={() => setSelected(null)}>Close</button>
                <button className="suspended-org-btn primary" onClick={() => { setReviewTarget(selected); setReviewNotes(selected.notes); setSelected(null); }}>
                  <MessageSquare size={13} /> Start review
                </button>
                <button className="suspended-org-btn" disabled={selected.status === "Eligible for review"} onClick={() => {
                  updateStatus(selected.id, "Eligible for review");
                  notify(`${selected.name} marked eligible for review in the local preview.`);
                }}>
                  <RotateCcw size={13} /> Mark eligible
                </button>
              </div>
            </section>
          </div>
        )}

        {reviewTarget && (
          <div className="suspended-org-modal-backdrop" onClick={() => setReviewTarget(null)}>
            <section className="suspended-org-modal" role="dialog" aria-modal="true" aria-labelledby="suspended-review-title" onClick={(event) => event.stopPropagation()}>
              <div className="suspended-org-modal-header">
                <h2 id="suspended-review-title">Review suspension</h2>
                <button className="suspended-org-modal-close" onClick={() => setReviewTarget(null)} aria-label="Close review"><X size={15} /></button>
              </div>
              <div className="suspended-org-modal-body">
                <div className="suspended-org-detail-top">
                  <div className="suspended-org-detail-icon"><Building2 size={22} /></div>
                  <div>
                    <h3 className="suspended-org-detail-name">{reviewTarget.name}</h3>
                    <div className="suspended-org-detail-meta">{reviewTarget.id} · {reviewTarget.reason}</div>
                  </div>
                </div>
                <label className="suspended-org-label" htmlFor="suspended-review-notes">Review notes</label>
                <textarea
                  id="suspended-review-notes"
                  className="suspended-org-textarea"
                  value={reviewNotes}
                  onChange={(event) => setReviewNotes(event.target.value)}
                  placeholder="Add the reason for review and the next steps..."
                />
                <div className="suspended-org-warning" style={{ marginTop: 14, marginBottom: 0 }}>
                  <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                  This action moves the record to Under review in the local preview. It does not restore or suspend real organization access.
                </div>
              </div>
              <div className="suspended-org-modal-footer">
                <button className="suspended-org-btn" onClick={() => setReviewTarget(null)}>Cancel</button>
                <button className="suspended-org-btn primary" onClick={submitReview} disabled={actionLoading}>
                  <MessageSquare size={13} /> {actionLoading ? "Updating..." : "Submit for review"}
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
