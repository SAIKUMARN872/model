"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  CalendarCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Clock,
  Download,
  Edit3,
  Eye,
  FileCheck2,
  FileText,
  Filter,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Target,
  Trash2,
  Users,
  X,
} from "lucide-react";

type ReviewStatus =
  | "Scheduled"
  | "In Progress"
  | "Completed"
  | "Overdue";

type Priority = "Low" | "Medium" | "High" | "Critical";

type Review = {
  id: string;
  title: string;
  domain: string;
  owner: string;
  reviewer: string;
  startDate: string;
  dueDate: string;
  status: ReviewStatus;
  priority: Priority;
  scope: string;
  notes: string;
  checklist: { label: string; done: boolean }[];
  evidence: string[];
};

const initialReviews: Review[] = [
  {
    id: "REV-2026-001",
    title: "Production AI Model Review",
    domain: "Model Governance",
    owner: "AI Platform Team",
    reviewer: "Governance Committee",
    startDate: "2026-11-02",
    dueDate: "2026-11-08",
    status: "In Progress",
    priority: "Critical",
    scope:
      "Review production model versions, approval records, deployment safeguards and performance monitoring.",
    notes: "Confirm approval evidence for all production model releases.",
    checklist: [
      { label: "Verify model inventory", done: true },
      { label: "Review model approval records", done: true },
      { label: "Validate monitoring controls", done: false },
      { label: "Document findings and actions", done: false },
    ],
    evidence: ["Model inventory", "Deployment approval records"],
  },
  {
    id: "REV-2026-002",
    title: "Responsible AI Assessment",
    domain: "Responsible AI",
    owner: "Responsible AI Team",
    reviewer: "Risk Committee",
    startDate: "2026-11-05",
    dueDate: "2026-11-12",
    status: "Scheduled",
    priority: "High",
    scope:
      "Assess fairness, explainability, transparency and human oversight controls.",
    notes: "Include representative evaluation datasets and documented limitations.",
    checklist: [
      { label: "Collect evaluation datasets", done: false },
      { label: "Review fairness assessment", done: false },
      { label: "Verify human oversight", done: false },
      { label: "Approve assessment report", done: false },
    ],
    evidence: ["Fairness report", "Evaluation results"],
  },
  {
    id: "REV-2026-003",
    title: "Data Access and Retention Review",
    domain: "Data Governance",
    owner: "Data Engineering",
    reviewer: "Security Team",
    startDate: "2026-10-20",
    dueDate: "2026-10-29",
    status: "Overdue",
    priority: "High",
    scope:
      "Review data access permissions, retention periods and sensitive data handling.",
    notes: "Resolve outstanding access-review evidence gaps.",
    checklist: [
      { label: "Review data access roles", done: true },
      { label: "Validate retention settings", done: false },
      { label: "Check sensitive data controls", done: false },
      { label: "Record remediation actions", done: false },
    ],
    evidence: ["Access review export", "Retention policy"],
  },
  {
    id: "REV-2026-004",
    title: "AI Policy Compliance Review",
    domain: "Policy Management",
    owner: "Compliance Office",
    reviewer: "Internal Audit",
    startDate: "2026-10-10",
    dueDate: "2026-10-18",
    status: "Completed",
    priority: "Medium",
    scope:
      "Check whether AI policies are approved, communicated and reviewed on schedule.",
    notes: "Annual review completed for the current policy set.",
    checklist: [
      { label: "Review active policies", done: true },
      { label: "Verify policy ownership", done: true },
      { label: "Check approval history", done: true },
      { label: "Publish review findings", done: true },
    ],
    evidence: ["Policy register", "Approval history"],
  },
  {
    id: "REV-2026-005",
    title: "Third-Party AI Vendor Assessment",
    domain: "Vendor Governance",
    owner: "Vendor Risk Team",
    reviewer: "Procurement and Legal",
    startDate: "2026-11-09",
    dueDate: "2026-11-17",
    status: "Scheduled",
    priority: "Medium",
    scope:
      "Assess vendor security documentation, AI usage terms and third-party risk controls.",
    notes: "Request any missing documentation from the vendor owner.",
    checklist: [
      { label: "Collect vendor documentation", done: false },
      { label: "Review security assessment", done: false },
      { label: "Evaluate contractual controls", done: false },
      { label: "Record vendor decision", done: false },
    ],
    evidence: ["Vendor questionnaire", "Security assessment"],
  },
  {
    id: "REV-2026-006",
    title: "AI Risk Register Validation",
    domain: "Risk Management",
    owner: "Enterprise Risk Team",
    reviewer: "Risk Committee",
    startDate: "2026-10-25",
    dueDate: "2026-11-06",
    status: "In Progress",
    priority: "High",
    scope:
      "Validate risk ownership, impact ratings, mitigation actions and residual risk.",
    notes: "Escalate unresolved critical risks for committee review.",
    checklist: [
      { label: "Validate risk owners", done: true },
      { label: "Check risk scoring", done: false },
      { label: "Review mitigation plans", done: false },
      { label: "Confirm residual risk", done: false },
    ],
    evidence: ["Enterprise risk register"],
  },
];

const statusOptions: ReviewStatus[] = [
  "Scheduled",
  "In Progress",
  "Completed",
  "Overdue",
];

const priorityOptions: Priority[] = [
  "Low",
  "Medium",
  "High",
  "Critical",
];

const domains = [
  "AI Governance",
  "Model Governance",
  "Data Governance",
  "Policy Management",
  "Risk Management",
  "Compliance Management",
  "Responsible AI",
  "AI Evaluation & Auditing",
  "Change Management",
  "Vendor Governance",
  "Enterprise Governance",
];

const today = "2026-11-04";

function dateLabel(value: string) {
  if (!value) return "Not set";

  const date = new Date(`${value}T12:00:00`);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function statusClass(status: ReviewStatus) {
  return status.toLowerCase().replaceAll(" ", "-");
}

function priorityClass(priority: Priority) {
  return priority.toLowerCase();
}

export default function GovernanceReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [domainFilter, setDomainFilter] = useState("All domains");
  const [priorityFilter, setPriorityFilter] = useState("All priorities");
  const [activeTab, setActiveTab] = useState("All reviews");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState("");

  const [form, setForm] = useState({
    title: "",
    domain: "AI Governance",
    owner: "",
    reviewer: "",
    startDate: today,
    dueDate: "",
    status: "Scheduled" as ReviewStatus,
    priority: "Medium" as Priority,
    scope: "",
    notes: "",
  });

  const metrics = useMemo(() => {
    const scheduled = reviews.filter(
      (r) => r.status === "Scheduled"
    ).length;

    const inProgress = reviews.filter(
      (r) => r.status === "In Progress"
    ).length;

    const overdue = reviews.filter(
      (r) => r.status === "Overdue"
    ).length;

    const completed = reviews.filter(
      (r) => r.status === "Completed"
    ).length;

    const checklistItems = reviews.flatMap((r) => r.checklist);
    const completedItems = checklistItems.filter((item) => item.done).length;

    return {
      total: reviews.length,
      scheduled,
      inProgress,
      overdue,
      completed,
      completionRate: reviews.length
        ? Math.round((completed / reviews.length) * 100)
        : 0,
      checklistRate: checklistItems.length
        ? Math.round((completedItems / checklistItems.length) * 100)
        : 0,
    };
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reviews.filter((review) => {
      const matchesSearch =
        !query ||
        [
          review.title,
          review.id,
          review.domain,
          review.owner,
          review.reviewer,
        ].some((value) => value.toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "All statuses" ||
        review.status === statusFilter;

      const matchesDomain =
        domainFilter === "All domains" ||
        review.domain === domainFilter;

      const matchesPriority =
        priorityFilter === "All priorities" ||
        review.priority === priorityFilter;

      const matchesTab =
        activeTab === "All reviews" ||
        (activeTab === "My attention" &&
          (review.status === "Overdue" ||
            review.priority === "Critical")) ||
        (activeTab === "Upcoming" &&
          review.status === "Scheduled") ||
        (activeTab === "Completed" &&
          review.status === "Completed");

      return (
        matchesSearch &&
        matchesStatus &&
        matchesDomain &&
        matchesPriority &&
        matchesTab
      );
    });
  }, [
    reviews,
    search,
    statusFilter,
    domainFilter,
    priorityFilter,
    activeTab,
  ]);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  }

  function resetForm() {
    setForm({
      title: "",
      domain: "AI Governance",
      owner: "",
      reviewer: "",
      startDate: today,
      dueDate: "",
      status: "Scheduled",
      priority: "Medium",
      scope: "",
      notes: "",
    });
  }

  function openCreate() {
    resetForm();
    setShowCreate(true);
  }

  function openEdit(review: Review) {
    setForm({
      title: review.title,
      domain: review.domain,
      owner: review.owner,
      reviewer: review.reviewer,
      startDate: review.startDate,
      dueDate: review.dueDate,
      status: review.status,
      priority: review.priority,
      scope: review.scope,
      notes: review.notes,
    });

    setSelectedReview(review);
    setEditing(true);
    setShowCreate(true);
  }

  function saveReview() {
    if (
      !form.title.trim() ||
      !form.owner.trim() ||
      !form.reviewer.trim() ||
      !form.dueDate
    ) {
      notify("Complete the title, owner, reviewer and due date.");
      return;
    }

    if (form.dueDate < form.startDate) {
      notify("The due date must be on or after the start date.");
      return;
    }

    if (editing && selectedReview) {
      setReviews((current) =>
        current.map((review) =>
          review.id === selectedReview.id
            ? {
                ...review,
                ...form,
              }
            : review
        )
      );

      setSelectedReview((current) =>
        current ? { ...current, ...form } : null
      );

      notify("Review updated successfully.");
    } else {
      const newReview: Review = {
        id: `REV-${new Date().getFullYear()}-${String(
          Date.now()
        ).slice(-5)}`,
        ...form,
        checklist: [
          { label: "Collect review evidence", done: false },
          { label: "Validate applicable controls", done: false },
          { label: "Document findings", done: false },
          { label: "Record follow-up actions", done: false },
        ],
        evidence: [],
      };

      setReviews((current) => [newReview, ...current]);
      notify("New governance review created.");
    }

    setShowCreate(false);
    setEditing(false);
    setSelectedReview(null);
    resetForm();
  }

  function updateStatus(reviewId: string, status: ReviewStatus) {
    setReviews((current) =>
      current.map((review) =>
        review.id === reviewId ? { ...review, status } : review
      )
    );

    setSelectedReview((current) =>
      current && current.id === reviewId
        ? { ...current, status }
        : current
    );

    notify(`Review status changed to ${status}.`);
  }

  function toggleChecklist(reviewId: string, index: number) {
    setReviews((current) =>
      current.map((review) =>
        review.id === reviewId
          ? {
              ...review,
              checklist: review.checklist.map((item, i) =>
                i === index ? { ...item, done: !item.done } : item
              ),
            }
          : review
      )
    );

    setSelectedReview((current) =>
      current && current.id === reviewId
        ? {
            ...current,
            checklist: current.checklist.map((item, i) =>
              i === index ? { ...item, done: !item.done } : item
            ),
          }
        : current
    );
  }

  function deleteReview(reviewId: string) {
    setReviews((current) =>
      current.filter((review) => review.id !== reviewId)
    );
    setSelectedReview(null);
    notify("Review deleted from this demo workspace.");
  }

  function exportCSV() {
    const headers = [
      "Review ID",
      "Title",
      "Domain",
      "Owner",
      "Reviewer",
      "Start Date",
      "Due Date",
      "Status",
      "Priority",
      "Scope",
    ];

    const rows = filteredReviews.map((review) => [
      review.id,
      review.title,
      review.domain,
      review.owner,
      review.reviewer,
      review.startDate,
      review.dueDate,
      review.status,
      review.priority,
      review.scope,
    ]);

    const escapeCSV = (value: string) =>
      `"${String(value).replaceAll('"', '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "modelnow-governance-reviews.csv";
    anchor.click();

    URL.revokeObjectURL(url);
    notify("Review register exported as CSV.");
  }

  const upcomingReviews = [...reviews]
    .filter(
      (review) =>
        review.status === "Scheduled" ||
        review.status === "In Progress"
    )
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 4);

  return (
    <main className="gr-page">
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        .gr-page {
          min-height: 100vh;
          padding: 30px;
          background: #f7f8fc;
          color: #172033;
          font-family: Arial, Helvetica, sans-serif;
        }

        .gr-container {
          max-width: 1500px;
          margin: 0 auto;
        }

        .gr-topline {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          margin-bottom: 25px;
        }

        .gr-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #788399;
          font-size: 12px;
        }

        .gr-breadcrumb strong {
          color: #344054;
          font-weight: 600;
        }

        .gr-top-actions,
        .gr-button-row {
          display: flex;
          align-items: center;
          gap: 9px;
          flex-wrap: wrap;
        }

        .gr-button {
          min-height: 39px;
          padding: 0 13px;
          border: 1px solid #e1e5ed;
          border-radius: 9px;
          background: white;
          color: #344054;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.15s ease;
        }

        .gr-button:hover {
          background: #f7f9ff;
          border-color: #cbd5ee;
        }

        .gr-button.primary {
          color: white;
          background: #315bea;
          border-color: #315bea;
        }

        .gr-button.primary:hover {
          background: #244bd0;
        }

        .gr-button.danger {
          color: #c03939;
          border-color: #f2d1d1;
        }

        .gr-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
          margin-bottom: 25px;
        }

        .gr-eyebrow {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #315bea;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          margin-bottom: 11px;
        }

        .gr-heading h1 {
          font-size: clamp(25px, 3vw, 34px);
          letter-spacing: -1.1px;
          line-height: 1.2;
          margin: 0;
          font-weight: 750;
        }

        .gr-heading p {
          color: #778196;
          margin: 10px 0 0;
          font-size: 13px;
          line-height: 1.7;
          max-width: 650px;
        }

        .gr-demo-note {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          border: 1px solid #dce5ff;
          background: #f0f4ff;
          color: #42547e;
          padding: 12px 14px;
          border-radius: 10px;
          font-size: 11px;
          line-height: 1.6;
          margin-bottom: 22px;
        }

        .gr-metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 15px;
          margin-bottom: 22px;
        }

        .gr-metric {
          padding: 19px;
          border: 1px solid #e8ebf2;
          border-radius: 13px;
          background: white;
          min-width: 0;
        }

        .gr-metric-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        .gr-metric-label {
          font-size: 11px;
          color: #778196;
          font-weight: 600;
        }

        .gr-metric-value {
          font-size: 29px;
          font-weight: 750;
          margin-top: 13px;
          letter-spacing: -1px;
        }

        .gr-metric-foot {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 10px;
          color: #7b8496;
          margin-top: 9px;
        }

        .gr-iconbox {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          flex-shrink: 0;
        }

        .gr-iconbox.blue {
          color: #315bea;
          background: #edf2ff;
        }

        .gr-iconbox.green {
          color: #16835d;
          background: #e8f8f0;
        }

        .gr-iconbox.orange {
          color: #c57a18;
          background: #fff5e6;
        }

        .gr-iconbox.red {
          color: #cf4141;
          background: #fff0f0;
        }

        .gr-main-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.8fr) minmax(280px, 0.9fr);
          gap: 18px;
          align-items: start;
        }

        .gr-card {
          min-width: 0;
          background: white;
          border: 1px solid #e8ebf2;
          border-radius: 13px;
          overflow: hidden;
        }

        .gr-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          padding: 19px 20px;
          border-bottom: 1px solid #edf0f5;
        }

        .gr-card-title {
          margin: 0;
          font-size: 14px;
          font-weight: 750;
        }

        .gr-card-subtitle {
          font-size: 11px;
          color: #858da0;
          margin-top: 6px;
          line-height: 1.5;
        }

        .gr-card-body {
          padding: 19px 20px;
        }

        .gr-tabs {
          display: flex;
          gap: 19px;
          border-bottom: 1px solid #edf0f5;
          padding: 0 20px;
          overflow-x: auto;
        }

        .gr-tab {
          padding: 15px 0 13px;
          border: none;
          border-bottom: 2px solid transparent;
          color: #778196;
          background: transparent;
          white-space: nowrap;
          font-size: 11px;
          cursor: pointer;
        }

        .gr-tab.active {
          color: #315bea;
          font-weight: 700;
          border-bottom-color: #315bea;
        }

        .gr-filter-row {
          display: grid;
          grid-template-columns: minmax(170px, 1.5fr) repeat(3, minmax(120px, 1fr));
          gap: 9px;
          padding: 15px 20px;
          border-bottom: 1px solid #edf0f5;
        }

        .gr-search {
          position: relative;
          min-width: 0;
        }

        .gr-search svg {
          position: absolute;
          left: 11px;
          top: 50%;
          transform: translateY(-50%);
          color: #98a1b2;
        }

        .gr-input,
        .gr-select,
        .gr-textarea {
          width: 100%;
          min-width: 0;
          border: 1px solid #e0e5ee;
          border-radius: 8px;
          background: white;
          padding: 10px 11px;
          color: #263247;
          font-family: inherit;
          font-size: 11px;
          outline: none;
        }

        .gr-search .gr-input {
          padding-left: 34px;
        }

        .gr-input:focus,
        .gr-select:focus,
        .gr-textarea:focus {
          border-color: #7795ff;
          box-shadow: 0 0 0 3px #edf1ff;
        }

        .gr-table-wrap {
          overflow-x: auto;
        }

        .gr-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          white-space: nowrap;
        }

        .gr-table th {
          padding: 12px 15px;
          font-size: 10px;
          color: #7b8496;
          font-weight: 650;
          background: #fbfcfe;
          border-bottom: 1px solid #edf0f5;
        }

        .gr-table td {
          padding: 15px;
          border-bottom: 1px solid #f0f2f6;
          font-size: 11px;
          color: #5c667b;
          vertical-align: middle;
        }

        .gr-table tr:last-child td {
          border-bottom: none;
        }

        .gr-table tbody tr:hover {
          background: #fafbff;
        }

        .gr-review-title {
          display: block;
          color: #273247;
          font-weight: 700;
          font-size: 11px;
          margin-bottom: 5px;
          white-space: normal;
          min-width: 150px;
          max-width: 235px;
          line-height: 1.45;
        }

        .gr-review-id {
          color: #9aa2b1;
          font-size: 10px;
        }

        .gr-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 8px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 650;
          white-space: nowrap;
        }

        .gr-pill.scheduled {
          color: #5368a3;
          background: #eef2ff;
        }

        .gr-pill.in-progress {
          color: #a76b12;
          background: #fff5df;
        }

        .gr-pill.completed {
          color: #187c56;
          background: #e7f8ef;
        }

        .gr-pill.overdue {
          color: #bd3636;
          background: #fff0f0;
        }

        .gr-pill.low {
          color: #697586;
          background: #f0f2f5;
        }

        .gr-pill.medium {
          color: #6470a5;
          background: #eef0ff;
        }

        .gr-pill.high {
          color: #b66b14;
          background: #fff1df;
        }

        .gr-pill.critical {
          color: #bd3636;
          background: #ffe8e8;
        }

        .gr-row-action {
          border: 1px solid #e4e8f0;
          border-radius: 7px;
          background: white;
          color: #68758b;
          padding: 7px;
          display: inline-flex;
          cursor: pointer;
        }

        .gr-row-action:hover {
          color: #315bea;
          border-color: #c9d5ff;
        }

        .gr-empty {
          text-align: center;
          padding: 35px 15px;
          color: #8790a2;
          font-size: 12px;
        }

        .gr-progress-track {
          width: 100%;
          height: 6px;
          background: #edf0f6;
          border-radius: 20px;
          overflow: hidden;
        }

        .gr-progress-fill {
          height: 100%;
          border-radius: 20px;
          background: #315bea;
          transition: width 0.2s ease;
        }

        .gr-upcoming-item {
          display: flex;
          gap: 12px;
          padding: 14px 0;
          border-bottom: 1px solid #f0f2f6;
        }

        .gr-upcoming-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .gr-date-box {
          flex-shrink: 0;
          width: 43px;
          height: 48px;
          border: 1px solid #e5eaff;
          border-radius: 9px;
          background: #f5f7ff;
          text-align: center;
          padding-top: 6px;
        }

        .gr-date-month {
          font-size: 9px;
          color: #6c7cbb;
          text-transform: uppercase;
          font-weight: 700;
        }

        .gr-date-day {
          font-size: 18px;
          color: #315bea;
          font-weight: 750;
          margin-top: 2px;
        }

        .gr-upcoming-title {
          color: #354057;
          font-size: 11px;
          line-height: 1.5;
          font-weight: 700;
        }

        .gr-upcoming-meta {
          color: #8992a3;
          font-size: 10px;
          margin-top: 5px;
          line-height: 1.5;
        }

        .gr-section-divider {
          height: 1px;
          background: #edf0f5;
          margin: 18px 0;
        }

        .gr-domain-row {
          margin-bottom: 17px;
        }

        .gr-domain-row:last-child {
          margin-bottom: 0;
        }

        .gr-domain-label {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          font-size: 11px;
          color: #566177;
          margin-bottom: 8px;
        }

        .gr-domain-label strong {
          color: #344054;
        }

        .gr-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(16, 24, 40, 0.48);
          backdrop-filter: blur(3px);
        }

        .gr-modal {
          width: 100%;
          max-width: 680px;
          max-height: 90vh;
          overflow-y: auto;
          background: white;
          border-radius: 15px;
          box-shadow: 0 25px 80px rgba(16, 24, 40, 0.25);
        }

        .gr-modal.small {
          max-width: 540px;
        }

        .gr-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 15px;
          padding: 21px 23px;
          border-bottom: 1px solid #edf0f5;
        }

        .gr-modal-header h2 {
          font-size: 18px;
          margin: 0;
          color: #1e293b;
        }

        .gr-modal-header p {
          color: #7d8799;
          font-size: 11px;
          line-height: 1.5;
          margin: 7px 0 0;
        }

        .gr-close {
          display: grid;
          place-items: center;
          width: 32px;
          height: 32px;
          flex-shrink: 0;
          border: 1px solid #e5e8ef;
          background: white;
          color: #667085;
          border-radius: 8px;
          cursor: pointer;
        }

        .gr-form {
          padding: 22px 23px;
        }

        .gr-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 17px;
        }

        .gr-field {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .gr-field.full {
          grid-column: 1 / -1;
        }

        .gr-field label {
          font-size: 11px;
          font-weight: 650;
          color: #4b5568;
        }

        .gr-field label span {
          color: #d14444;
        }

        .gr-textarea {
          resize: vertical;
          min-height: 76px;
          line-height: 1.6;
        }

        .gr-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 9px;
          padding: 16px 23px;
          border-top: 1px solid #edf0f5;
        }

        .gr-detail-body {
          padding: 22px 23px;
        }

        .gr-detail-meta {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
          margin: 18px 0;
        }

        .gr-detail-meta-item {
          border: 1px solid #edf0f5;
          border-radius: 9px;
          padding: 12px;
          min-width: 0;
        }

        .gr-detail-meta-item span {
          display: block;
          color: #8992a3;
          font-size: 10px;
          margin-bottom: 7px;
        }

        .gr-detail-meta-item strong {
          display: block;
          font-size: 12px;
          color: #344054;
          line-height: 1.5;
          overflow-wrap: anywhere;
        }

        .gr-detail-heading {
          font-size: 12px;
          font-weight: 750;
          color: #344054;
          margin: 20px 0 12px;
        }

        .gr-check-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 10px 0;
          border-bottom: 1px solid #f0f2f6;
          color: #596579;
          font-size: 11px;
          line-height: 1.5;
        }

        .gr-check-item:last-child {
          border-bottom: none;
        }

        .gr-check-item input {
          accent-color: #315bea;
          margin-top: 2px;
          width: 14px;
          height: 14px;
          cursor: pointer;
        }

        .gr-evidence-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          color: #536078;
          padding: 9px 0;
        }

        .gr-toast {
          position: fixed;
          right: 24px;
          bottom: 24px;
          z-index: 1200;
          display: flex;
          align-items: center;
          gap: 9px;
          max-width: calc(100vw - 40px);
          padding: 13px 16px;
          border-radius: 10px;
          color: white;
          background: #202d45;
          font-size: 12px;
          box-shadow: 0 8px 30px rgba(16, 24, 40, 0.2);
        }

        .gr-muted {
          color: #858da0;
        }

        @media (max-width: 1100px) {
          .gr-main-grid {
            grid-template-columns: 1fr;
          }

          .gr-metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 720px) {
          .gr-page {
            padding: 17px 12px;
          }

          .gr-topline,
          .gr-heading {
            align-items: flex-start;
            flex-direction: column;
          }

          .gr-heading {
            gap: 16px;
          }

          .gr-top-actions {
            width: 100%;
          }

          .gr-filter-row {
            grid-template-columns: 1fr 1fr;
            padding: 13px;
          }

          .gr-search {
            grid-column: 1 / -1;
          }

          .gr-card-header,
          .gr-card-body {
            padding: 15px;
          }

          .gr-metrics {
            gap: 10px;
          }

          .gr-metric {
            padding: 14px;
          }

          .gr-metric-value {
            font-size: 25px;
          }

          .gr-form-grid {
            grid-template-columns: 1fr;
          }

          .gr-field.full {
            grid-column: auto;
          }

          .gr-modal-overlay {
            padding: 10px;
          }

          .gr-modal-header,
          .gr-form,
          .gr-detail-body {
            padding: 17px;
          }

          .gr-modal-footer {
            padding: 14px 17px;
          }

          .gr-detail-meta {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 380px) {
          .gr-metrics {
            grid-template-columns: 1fr;
          }

          .gr-detail-meta {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="gr-container">
        <div className="gr-topline">
          <div className="gr-breadcrumb">
            <ShieldCheck size={14} />
            <span>ModelNow</span>
            <ArrowRight size={12} />
            <span>Governance</span>
            <ArrowRight size={12} />
            <strong>Reviews</strong>
          </div>

          <div className="gr-top-actions">
            <button className="gr-button" onClick={exportCSV}>
              <Download size={14} />
              Export CSV
            </button>
            <button className="gr-button" onClick={() => notify("Review metrics refreshed.")}>
              <RefreshCw size={14} />
              Refresh
            </button>
            <button className="gr-button primary" onClick={openCreate}>
              <Plus size={15} />
              New review
            </button>
          </div>
        </div>

        <section className="gr-heading">
          <div>
            <div className="gr-eyebrow">
              <ClipboardCheck size={14} />
              Governance Center
            </div>
            <h1>Governance Reviews</h1>
            <p>
              Plan governance reviews, track control assessments, collect
              evidence and manage findings across your AI lifecycle.
            </p>
          </div>

          <div className="gr-button-row">
            <button
              className="gr-button"
              onClick={() => {
                setActiveTab("All reviews");
                setStatusFilter("All statuses");
                setDomainFilter("All domains");
                setPriorityFilter("All priorities");
                setSearch("");
              }}
            >
              <SlidersHorizontal size={14} />
              Reset filters
            </button>
          </div>
        </section>

        <div className="gr-demo-note">
          <Activity size={16} />
          <div>
            <strong>Workspace preview:</strong> The reviews and metrics on this
            page use local sample data. Changes are held in this browser
            session and are not yet connected to your backend or audit system.
          </div>
        </div>

        <section className="gr-metrics">
          <div className="gr-metric">
            <div className="gr-metric-top">
              <div>
                <div className="gr-metric-label">Total reviews</div>
                <div className="gr-metric-value">{metrics.total}</div>
              </div>
              <div className="gr-iconbox blue">
                <ClipboardCheck size={19} />
              </div>
            </div>
            <div className="gr-metric-foot">
              <Activity size={12} />
              Across governance domains
            </div>
          </div>

          <div className="gr-metric">
            <div className="gr-metric-top">
              <div>
                <div className="gr-metric-label">In progress</div>
                <div className="gr-metric-value">{metrics.inProgress}</div>
              </div>
              <div className="gr-iconbox orange">
                <Clock size={19} />
              </div>
            </div>
            <div className="gr-metric-foot">
              <ArrowUpRight size={12} />
              Active assessments
            </div>
          </div>

          <div className="gr-metric">
            <div className="gr-metric-top">
              <div>
                <div className="gr-metric-label">Overdue reviews</div>
                <div className="gr-metric-value">{metrics.overdue}</div>
              </div>
              <div className="gr-iconbox red">
                <AlertCircle size={19} />
              </div>
            </div>
            <div className="gr-metric-foot">
              <AlertCircle size={12} />
              Require follow-up
            </div>
          </div>

          <div className="gr-metric">
            <div className="gr-metric-top">
              <div>
                <div className="gr-metric-label">Completion rate</div>
                <div className="gr-metric-value">{metrics.completionRate}%</div>
              </div>
              <div className="gr-iconbox green">
                <CheckCircle2 size={19} />
              </div>
            </div>
            <div className="gr-metric-foot">
              <ArrowDownRight size={12} />
              {metrics.completed} completed reviews
            </div>
          </div>
        </section>

        <section className="gr-main-grid">
          <div className="gr-card">
            <div className="gr-card-header">
              <div>
                <h2 className="gr-card-title">Review register</h2>
                <div className="gr-card-subtitle">
                  Search, filter and manage governance review activities.
                </div>
              </div>
              <div className="gr-iconbox blue">
                <FileCheck2 size={18} />
              </div>
            </div>

            <div className="gr-tabs">
              {["All reviews", "My attention", "Upcoming", "Completed"].map(
                (tab) => (
                  <button
                    key={tab}
                    className={`gr-tab ${activeTab === tab ? "active" : ""}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                    {tab === "All reviews" && (
                      <span> ({reviews.length})</span>
                    )}
                    {tab === "My attention" && (
                      <span>
                        {" "}
                        (
                        {
                          reviews.filter(
                            (r) =>
                              r.status === "Overdue" ||
                              r.priority === "Critical"
                          ).length
                        }
                        )
                      </span>
                    )}
                  </button>
                )
              )}
            </div>

            <div className="gr-filter-row">
              <div className="gr-search">
                <Search size={14} />
                <input
                  className="gr-input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search reviews..."
                />
              </div>

              <select
                className="gr-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option>All statuses</option>
                {statusOptions.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>

              <select
                className="gr-select"
                value={domainFilter}
                onChange={(e) => setDomainFilter(e.target.value)}
              >
                <option>All domains</option>
                {domains.map((domain) => (
                  <option key={domain}>{domain}</option>
                ))}
              </select>

              <select
                className="gr-select"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option>All priorities</option>
                {priorityOptions.map((priority) => (
                  <option key={priority}>{priority}</option>
                ))}
              </select>
            </div>

            <div className="gr-table-wrap">
              <table className="gr-table">
                <thead>
                  <tr>
                    <th>REVIEW</th>
                    <th>STATUS</th>
                    <th>PRIORITY</th>
                    <th>OWNER</th>
                    <th>DUE DATE</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReviews.map((review) => (
                    <tr key={review.id}>
                      <td>
                        <span className="gr-review-title">
                          {review.title}
                        </span>
                        <span className="gr-review-id">
                          {review.id} · {review.domain}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`gr-pill ${statusClass(review.status)}`}
                        >
                          {review.status}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`gr-pill ${priorityClass(review.priority)}`}
                        >
                          {review.priority}
                        </span>
                      </td>
                      <td>{review.owner}</td>
                      <td>
                        <span
                          style={{
                            color:
                              review.status === "Overdue"
                                ? "#bd3636"
                                : "#5c667b",
                          }}
                        >
                          {dateLabel(review.dueDate)}
                        </span>
                      </td>
                      <td>
                        <button
                          className="gr-row-action"
                          title="View review"
                          onClick={() => setSelectedReview(review)}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className="gr-row-action"
                          title="Edit review"
                          style={{ marginLeft: 5 }}
                          onClick={() => openEdit(review)}
                        >
                          <Edit3 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredReviews.length === 0 && (
                    <tr>
                      <td colSpan={6}>
                        <div className="gr-empty">
                          <Search size={23} style={{ marginBottom: 8 }} />
                          <div>No reviews match your filters.</div>
                          <button
                            className="gr-button"
                            style={{ marginTop: 12 }}
                            onClick={() => {
                              setSearch("");
                              setStatusFilter("All statuses");
                              setDomainFilter("All domains");
                              setPriorityFilter("All priorities");
                              setActiveTab("All reviews");
                            }}
                          >
                            Clear filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "13px 20px",
                borderTop: "1px solid #edf0f5",
                color: "#8a93a4",
                fontSize: 10,
                gap: 10,
              }}
            >
              <span>
                Showing {filteredReviews.length} of {reviews.length} reviews
              </span>
              <span>Local preview</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div className="gr-card">
              <div className="gr-card-header">
                <div>
                  <h2 className="gr-card-title">Upcoming reviews</h2>
                  <div className="gr-card-subtitle">
                    Nearest active review deadlines.
                  </div>
                </div>
                <Calendar size={18} color="#315bea" />
              </div>

              <div className="gr-card-body">
                {upcomingReviews.length === 0 ? (
                  <div className="gr-empty">No upcoming reviews.</div>
                ) : (
                  upcomingReviews.map((review) => {
                    const due = new Date(`${review.dueDate}T12:00:00`);

                    return (
                      <button
                        key={review.id}
                        onClick={() => setSelectedReview(review)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          textAlign: "left",
                          gap: 12,
                          width: "100%",
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          padding: 0,
                        }}
                      >
                        <div className="gr-upcoming-item" style={{ flex: 1 }}>
                          <div className="gr-date-box">
                            <div className="gr-date-month">
                              {due.toLocaleDateString("en-US", {
                                month: "short",
                              })}
                            </div>
                            <div className="gr-date-day">
                              {due.getDate()}
                            </div>
                          </div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div className="gr-upcoming-title">
                              {review.title}
                            </div>
                            <div className="gr-upcoming-meta">
                              {review.domain}
                            </div>
                            <div style={{ marginTop: 7 }}>
                              <span
                                className={`gr-pill ${statusClass(review.status)}`}
                              >
                                {review.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}

                <button
                  className="gr-button"
                  style={{ width: "100%", marginTop: 15 }}
                  onClick={() => {
                    setActiveTab("Upcoming");
                    setStatusFilter("All statuses");
                    setDomainFilter("All domains");
                    setPriorityFilter("All priorities");
                  }}
                >
                  View upcoming reviews
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            <div className="gr-card">
              <div className="gr-card-header">
                <div>
                  <h2 className="gr-card-title">Review checklist progress</h2>
                  <div className="gr-card-subtitle">
                    Completion across all review checklist items.
                  </div>
                </div>
                <Target size={18} color="#315bea" />
              </div>

              <div className="gr-card-body">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    gap: 12,
                    marginBottom: 10,
                  }}
                >
                  <span
                    style={{
                      fontSize: 28,
                      fontWeight: 750,
                      letterSpacing: "-1px",
                    }}
                  >
                    {metrics.checklistRate}%
                  </span>
                  <span style={{ fontSize: 10, color: "#858da0" }}>
                    Checklist completion
                  </span>
                </div>

                <div className="gr-progress-track">
                  <div
                    className="gr-progress-fill"
                    style={{ width: `${metrics.checklistRate}%` }}
                  />
                </div>

                <div className="gr-section-divider" />

                {[
                  {
                    label: "Scheduled",
                    value: metrics.scheduled,
                    color: "#6f83c9",
                  },
                  {
                    label: "In progress",
                    value: metrics.inProgress,
                    color: "#d89b3d",
                  },
                  {
                    label: "Completed",
                    value: metrics.completed,
                    color: "#2e9d72",
                  },
                  {
                    label: "Overdue",
                    value: metrics.overdue,
                    color: "#d65353",
                  },
                ].map((item) => (
                  <div className="gr-domain-row" key={item.label}>
                    <div className="gr-domain-label">
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                    <div className="gr-progress-track">
                      <div
                        className="gr-progress-fill"
                        style={{
                          width: `${
                            metrics.total
                              ? (item.value / metrics.total) * 100
                              : 0
                          }%`,
                          background: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="gr-card">
              <div className="gr-card-body">
                <div
                  style={{
                    display: "flex",
                    gap: 11,
                    alignItems: "flex-start",
                  }}
                >
                  <div className="gr-iconbox blue">
                    <Users size={18} />
                  </div>
                  <div>
                    <h2 className="gr-card-title">
                      Review accountability
                    </h2>
                    <p
                      style={{
                        color: "#7c8698",
                        fontSize: 11,
                        lineHeight: 1.7,
                        margin: "8px 0 13px",
                      }}
                    >
                      Every review should have a named owner, an independent
                      reviewer, clear evidence and a documented outcome.
                    </p>
                    <button
                      className="gr-button"
                      onClick={() =>
                        notify(
                          "Accountability guidance is available in this preview."
                        )
                      }
                    >
                      <FileText size={14} />
                      Review guidance
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {showCreate && (
        <div
          className="gr-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowCreate(false);
              setEditing(false);
            }
          }}
        >
          <div className="gr-modal">
            <div className="gr-modal-header">
              <div>
                <h2>{editing ? "Edit governance review" : "Create governance review"}</h2>
                <p>
                  Define the review scope, accountability and expected
                  completion date.
                </p>
              </div>
              <button
                className="gr-close"
                onClick={() => {
                  setShowCreate(false);
                  setEditing(false);
                }}
              >
                <X size={17} />
              </button>
            </div>

            <div className="gr-form">
              <div className="gr-form-grid">
                <div className="gr-field full">
                  <label>
                    Review title <span>*</span>
                  </label>
                  <input
                    className="gr-input"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    placeholder="e.g. Quarterly model risk review"
                  />
                </div>

                <div className="gr-field">
                  <label>Governance domain</label>
                  <select
                    className="gr-select"
                    value={form.domain}
                    onChange={(e) =>
                      setForm({ ...form, domain: e.target.value })
                    }
                  >
                    {domains.map((domain) => (
                      <option key={domain}>{domain}</option>
                    ))}
                  </select>
                </div>

                <div className="gr-field">
                  <label>Priority</label>
                  <select
                    className="gr-select"
                    value={form.priority}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        priority: e.target.value as Priority,
                      })
                    }
                  >
                    {priorityOptions.map((priority) => (
                      <option key={priority}>{priority}</option>
                    ))}
                  </select>
                </div>

                <div className="gr-field">
                  <label>
                    Review owner <span>*</span>
                  </label>
                  <input
                    className="gr-input"
                    value={form.owner}
                    onChange={(e) =>
                      setForm({ ...form, owner: e.target.value })
                    }
                    placeholder="Team or responsible person"
                  />
                </div>

                <div className="gr-field">
                  <label>
                    Reviewer / approver <span>*</span>
                  </label>
                  <input
                    className="gr-input"
                    value={form.reviewer}
                    onChange={(e) =>
                      setForm({ ...form, reviewer: e.target.value })
                    }
                    placeholder="Reviewer or committee"
                  />
                </div>

                <div className="gr-field">
                  <label>Start date</label>
                  <input
                    type="date"
                    className="gr-input"
                    value={form.startDate}
                    onChange={(e) =>
                      setForm({ ...form, startDate: e.target.value })
                    }
                  />
                </div>

                <div className="gr-field">
                  <label>
                    Due date <span>*</span>
                  </label>
                  <input
                    type="date"
                    className="gr-input"
                    value={form.dueDate}
                    min={form.startDate}
                    onChange={(e) =>
                      setForm({ ...form, dueDate: e.target.value })
                    }
                  />
                </div>

                {editing && (
                  <div className="gr-field full">
                    <label>Status</label>
                    <select
                      className="gr-select"
                      value={form.status}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          status: e.target.value as ReviewStatus,
                        })
                      }
                    >
                      {statusOptions.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="gr-field full">
                  <label>Review scope</label>
                  <textarea
                    className="gr-textarea"
                    value={form.scope}
                    onChange={(e) =>
                      setForm({ ...form, scope: e.target.value })
                    }
                    placeholder="Describe the controls, models, policies or risks being reviewed."
                  />
                </div>

                <div className="gr-field full">
                  <label>Notes and expectations</label>
                  <textarea
                    className="gr-textarea"
                    value={form.notes}
                    onChange={(e) =>
                      setForm({ ...form, notes: e.target.value })
                    }
                    placeholder="Add review instructions, evidence expectations or dependencies."
                  />
                </div>
              </div>
            </div>

            <div className="gr-modal-footer">
              <button
                className="gr-button"
                onClick={() => {
                  setShowCreate(false);
                  setEditing(false);
                }}
              >
                Cancel
              </button>
              <button className="gr-button primary" onClick={saveReview}>
                <Check size={15} />
                {editing ? "Save changes" : "Create review"}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedReview && !showCreate && (
        <div
          className="gr-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedReview(null);
            }
          }}
        >
          <div className="gr-modal small">
            <div className="gr-modal-header">
              <div>
                <div className="gr-review-id" style={{ marginBottom: 7 }}>
                  {selectedReview.id}
                </div>
                <h2>{selectedReview.title}</h2>
                <p>{selectedReview.domain}</p>
              </div>
              <button
                className="gr-close"
                onClick={() => setSelectedReview(null)}
              >
                <X size={17} />
              </button>
            </div>

            <div className="gr-detail-body">
              <div className="gr-button-row">
                <span
                  className={`gr-pill ${statusClass(selectedReview.status)}`}
                >
                  {selectedReview.status}
                </span>
                <span
                  className={`gr-pill ${priorityClass(selectedReview.priority)}`}
                >
                  {selectedReview.priority} priority
                </span>
              </div>

              <div className="gr-detail-meta">
                <div className="gr-detail-meta-item">
                  <span>Review owner</span>
                  <strong>{selectedReview.owner}</strong>
                </div>
                <div className="gr-detail-meta-item">
                  <span>Reviewer / approver</span>
                  <strong>{selectedReview.reviewer}</strong>
                </div>
                <div className="gr-detail-meta-item">
                  <span>Start date</span>
                  <strong>{dateLabel(selectedReview.startDate)}</strong>
                </div>
                <div className="gr-detail-meta-item">
                  <span>Due date</span>
                  <strong>{dateLabel(selectedReview.dueDate)}</strong>
                </div>
              </div>

              <h3 className="gr-detail-heading">Review scope</h3>
              <p
                style={{
                  color: "#657086",
                  fontSize: 11,
                  lineHeight: 1.75,
                  margin: 0,
                }}
              >
                {selectedReview.scope || "No scope details provided."}
              </p>

              {selectedReview.notes && (
                <>
                  <h3 className="gr-detail-heading">Notes</h3>
                  <p
                    style={{
                      color: "#657086",
                      fontSize: 11,
                      lineHeight: 1.75,
                      margin: 0,
                    }}
                  >
                    {selectedReview.notes}
                  </p>
                </>
              )}

              <h3 className="gr-detail-heading">Review checklist</h3>

              {selectedReview.checklist.map((item, index) => (
                <label className="gr-check-item" key={`${item.label}-${index}`}>
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() =>
                      toggleChecklist(selectedReview.id, index)
                    }
                  />
                  <span
                    style={{
                      textDecoration: item.done ? "line-through" : "none",
                      color: item.done ? "#929aab" : "#596579",
                    }}
                  >
                    {item.label}
                  </span>
                  {item.done && (
                    <CheckCircle2
                      size={14}
                      color="#16835d"
                      style={{ marginLeft: "auto", flexShrink: 0 }}
                    />
                  )}
                </label>
              ))}

              <h3 className="gr-detail-heading">Evidence references</h3>
              {selectedReview.evidence.length === 0 ? (
                <p
                  style={{
                    color: "#929aab",
                    fontSize: 11,
                    lineHeight: 1.6,
                  }}
                >
                  No evidence references have been added.
                </p>
              ) : (
                selectedReview.evidence.map((evidence) => (
                  <div className="gr-evidence-item" key={evidence}>
                    <FileText size={15} color="#315bea" />
                    {evidence}
                  </div>
                ))
              )}

              <h3 className="gr-detail-heading">Update review status</h3>
              <select
                className="gr-select"
                value={selectedReview.status}
                onChange={(e) =>
                  updateStatus(
                    selectedReview.id,
                    e.target.value as ReviewStatus
                  )
                }
              >
                {statusOptions.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="gr-modal-footer" style={{ justifyContent: "space-between" }}>
              <button
                className="gr-button danger"
                onClick={() => deleteReview(selectedReview.id)}
              >
                <Trash2 size={14} />
                Delete
              </button>

              <div className="gr-button-row">
                <button
                  className="gr-button"
                  onClick={() => setSelectedReview(null)}
                >
                  Close
                </button>
                <button
                  className="gr-button primary"
                  onClick={() => openEdit(selectedReview)}
                >
                  <Edit3 size={14} />
                  Edit review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="gr-toast">
          <CheckCircle2 size={16} />
          {toast}
        </div>
      )}
    </main>
  );
}