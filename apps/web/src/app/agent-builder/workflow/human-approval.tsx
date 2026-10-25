"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Database,
  FileText,
  History,
  Lock,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  UserRound,
  Users,
  XCircle,
  Zap,
} from "lucide-react";

type ApprovalStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Expired"
  | "Cancelled";

type ApprovalPriority = "Low" | "Medium" | "High" | "Critical";

type ApprovalRequest = {
  id: string;
  title: string;
  description: string;
  workflow: string;
  agent: string;
  requester: string;
  approver: string;
  status: ApprovalStatus;
  priority: ApprovalPriority;
  createdAt: string;
  expiresAt: string;
  category: string;
};

const initialRequests: ApprovalRequest[] = [
  {
    id: "APR-1048",
    title: "Production database migration",
    description:
      "Agent requested approval before applying schema changes to the production database.",
    workflow: "Customer Data Migration",
    agent: "Database Migration Agent",
    requester: "Migration Agent",
    approver: "Engineering Admin",
    status: "Pending",
    priority: "Critical",
    createdAt: "4 minutes ago",
    expiresAt: "26 minutes",
    category: "Database",
  },
  {
    id: "APR-1047",
    title: "Send customer notification",
    description:
      "Agent generated a customer-facing notification and requires human approval before delivery.",
    workflow: "Customer Support",
    agent: "Support Agent",
    requester: "Support Agent",
    approver: "Support Lead",
    status: "Pending",
    priority: "High",
    createdAt: "12 minutes ago",
    expiresAt: "48 minutes",
    category: "Communication",
  },
  {
    id: "APR-1046",
    title: "Deploy workflow version",
    description:
      "New workflow version passed automated tests and is waiting for production deployment approval.",
    workflow: "Invoice Automation",
    agent: "Invoice Agent",
    requester: "Deployment Agent",
    approver: "Platform Admin",
    status: "Approved",
    priority: "High",
    createdAt: "24 minutes ago",
    expiresAt: "Completed",
    category: "Deployment",
  },
  {
    id: "APR-1045",
    title: "External API action",
    description:
      "Agent wants to execute a high-impact external API action.",
    workflow: "Partner Operations",
    agent: "Operations Agent",
    requester: "Operations Agent",
    approver: "Operations Lead",
    status: "Rejected",
    priority: "Medium",
    createdAt: "41 minutes ago",
    expiresAt: "Completed",
    category: "API",
  },
  {
    id: "APR-1044",
    title: "Update customer profile",
    description:
      "Agent requested permission to modify customer profile information.",
    workflow: "CRM Automation",
    agent: "CRM Agent",
    requester: "CRM Agent",
    approver: "CRM Admin",
    status: "Pending",
    priority: "Medium",
    createdAt: "55 minutes ago",
    expiresAt: "1 hour",
    category: "Customer Data",
  },
];

const categories = [
  "All",
  "Database",
  "Communication",
  "Deployment",
  "API",
  "Customer Data",
];

function MetricCard({
  icon,
  label,
  value,
  change,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  change?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
          {icon}
        </div>

        {change && (
          <span className="text-xs font-medium text-emerald-600">
            {change}
          </span>
        )}
      </div>

      <div className="text-2xl font-semibold text-slate-900">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{label}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: ApprovalStatus }) {
  const styles: Record<ApprovalStatus, string> = {
    Pending: "border-amber-200 bg-amber-50 text-amber-700",
    Approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Rejected: "border-red-200 bg-red-50 text-red-700",
    Expired: "border-slate-200 bg-slate-100 text-slate-600",
    Cancelled: "border-slate-200 bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-medium ${styles[status]}`}
    >
      {status === "Pending" && <Clock3 size={12} />}
      {status === "Approved" && <CheckCircle2 size={12} />}
      {status === "Rejected" && <XCircle size={12} />}
      {status === "Expired" && <AlertTriangle size={12} />}
      {status === "Cancelled" && <XCircle size={12} />}
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: ApprovalPriority }) {
  const styles: Record<ApprovalPriority, string> = {
    Low: "bg-slate-100 text-slate-600",
    Medium: "bg-blue-50 text-blue-700",
    High: "bg-orange-50 text-orange-700",
    Critical: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`rounded-md px-2 py-1 text-[10px] font-medium ${styles[priority]}`}
    >
      {priority}
    </span>
  );
}

function FilterSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-8 text-xs text-slate-700 outline-none focus:border-slate-400"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>

      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-2.5 top-2.5 text-slate-400"
      />
    </div>
  );
}

function InfoCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
        {icon}
      </div>

      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <div className="mt-1 text-xs leading-5 text-slate-500">
        {description}
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-3 last:border-b-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-xs font-medium text-slate-800">{value}</span>
    </div>
  );
}

export default function HumanApprovalPage() {
  const [requests, setRequests] = useState(initialRequests);
  const [selectedId, setSelectedId] = useState(initialRequests[0].id);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newWorkflow, setNewWorkflow] = useState("");
  const [newApprover, setNewApprover] = useState("Platform Admin");
  const [newPriority, setNewPriority] =
    useState<ApprovalPriority>("Medium");

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();

    return requests.filter((request) => {
      const matchesSearch =
        !query ||
        request.title.toLowerCase().includes(query) ||
        request.workflow.toLowerCase().includes(query) ||
        request.agent.toLowerCase().includes(query) ||
        request.id.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || request.status === statusFilter;

      const matchesPriority =
        priorityFilter === "All" || request.priority === priorityFilter;

      const matchesCategory =
        categoryFilter === "All" || request.category === categoryFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesCategory
      );
    });
  }, [
    requests,
    search,
    statusFilter,
    priorityFilter,
    categoryFilter,
  ]);

  const selectedRequest =
    requests.find((request) => request.id === selectedId) ??
    requests[0];

  const pendingCount = requests.filter(
    (request) => request.status === "Pending",
  ).length;

  const approvedCount = requests.filter(
    (request) => request.status === "Approved",
  ).length;

  const rejectedCount = requests.filter(
    (request) => request.status === "Rejected",
  ).length;

  const criticalCount = requests.filter(
    (request) =>
      request.priority === "Critical" && request.status === "Pending",
  ).length;

  const updateRequest = (
    id: string,
    status: ApprovalStatus,
  ) => {
    setRequests((current) =>
      current.map((request) =>
        request.id === id
          ? {
              ...request,
              status,
              expiresAt:
                status === "Pending" ? request.expiresAt : "Completed",
            }
          : request,
      ),
    );
  };

  const createRequest = () => {
    if (!newTitle.trim()) return;

    const request: ApprovalRequest = {
      id: `APR-${1050 + requests.length}`,
      title: newTitle.trim(),
      description:
        newDescription.trim() ||
        "New human approval request created from the Agent Builder.",
      workflow: newWorkflow.trim() || "New Workflow",
      agent: "Agent Runtime",
      requester: "Agent Runtime",
      approver: newApprover,
      status: "Pending",
      priority: newPriority,
      createdAt: "Just now",
      expiresAt: "1 hour",
      category: "Customer Data",
    };

    setRequests((current) => [request, ...current]);
    setSelectedId(request.id);
    setShowCreate(false);

    setNewTitle("");
    setNewDescription("");
    setNewWorkflow("");
    setNewApprover("Platform Admin");
    setNewPriority("Medium");
  };

  if (!selectedRequest) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/agent-builder/security"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            >
              <ArrowLeft size={17} />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[15px] font-semibold">
                  Human Approvals
                </h1>

                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                  Agent Governance
                </span>
              </div>

              <p className="text-xs text-slate-500">
                Review and control high-impact agent actions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/agent-builder/security/audit-logs"
              className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 sm:flex"
            >
              <History size={15} />
              Audit Logs
            </Link>

            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
            >
              <Plus size={15} />
              Create Approval
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden w-[270px] shrink-0 border-r border-slate-200 bg-white lg:block">
          <div className="sticky top-16 h-[calc(100vh-64px)] overflow-y-auto p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Approval Queue
              </div>

              <span className="rounded-md bg-amber-50 px-2 py-1 text-[10px] font-medium text-amber-700">
                {pendingCount} pending
              </span>
            </div>

            <div className="relative mb-3">
              <Search
                size={14}
                className="absolute left-3 top-3 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search requests..."
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none focus:border-slate-400 focus:bg-white"
              />
            </div>

            <div className="mb-3">
              <FilterSelect
                value={statusFilter}
                options={[
                  "All",
                  "Pending",
                  "Approved",
                  "Rejected",
                  "Expired",
                  "Cancelled",
                ]}
                onChange={setStatusFilter}
              />
            </div>

            <div className="space-y-1.5">
              {filteredRequests.map((request) => (
                <button
                  key={request.id}
                  onClick={() => setSelectedId(request.id)}
                  className={`w-full rounded-xl border p-3 text-left transition ${
                    selectedRequest.id === request.id
                      ? "border-slate-300 bg-slate-50"
                      : "border-transparent hover:border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-slate-800">
                        {request.title}
                      </div>

                      <div className="mt-1 text-[10px] text-slate-400">
                        {request.id} · {request.createdAt}
                      </div>
                    </div>

                    <div
                      className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                        request.status === "Pending"
                          ? "bg-amber-500"
                          : request.status === "Approved"
                            ? "bg-emerald-500"
                            : request.status === "Rejected"
                              ? "bg-red-500"
                              : "bg-slate-300"
                      }`}
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <PriorityBadge priority={request.priority} />

                    <span className="text-[10px] text-slate-400">
                      {request.category}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center gap-2">
                <Lock size={15} className="text-slate-700" />

                <span className="text-xs font-semibold text-slate-800">
                  Approval Guard
                </span>
              </div>

              <p className="mt-2 text-[11px] leading-4 text-slate-500">
                Agents cannot execute protected actions until an authorized
                human approves them.
              </p>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 p-5 lg:p-7">
          <div className="mx-auto max-w-[1450px]">
            <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
              <MetricCard
                icon={<Clock3 size={18} />}
                label="Pending approvals"
                value={String(pendingCount)}
                change="+3 today"
              />

              <MetricCard
                icon={<CheckCircle2 size={18} />}
                label="Approved requests"
                value={String(approvedCount)}
                change="+8.4%"
              />

              <MetricCard
                icon={<XCircle size={18} />}
                label="Rejected requests"
                value={String(rejectedCount)}
              />

              <MetricCard
                icon={<AlertTriangle size={18} />}
                label="Critical pending"
                value={String(criticalCount)}
                change="Needs attention"
              />
            </div>

            <section className="mb-6 rounded-2xl border border-slate-200 bg-white">
              <div className="border-b border-slate-200 p-5">
                <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-semibold text-slate-900">
                        Approval Request
                      </h2>

                      <StatusBadge status={selectedRequest.status} />
                      <PriorityBadge priority={selectedRequest.priority} />
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                      {selectedRequest.id} · {selectedRequest.workflow}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowDetail(true)}
                      className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <FileText size={14} />
                      View Details
                    </button>

                    {selectedRequest.status === "Pending" && (
                      <>
                        <button
                          onClick={() =>
                            updateRequest(
                              selectedRequest.id,
                              "Rejected",
                            )
                          }
                          className="flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50"
                        >
                          <XCircle size={14} />
                          Reject
                        </button>

                        <button
                          onClick={() =>
                            updateRequest(
                              selectedRequest.id,
                              "Approved",
                            )
                          }
                          className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
                        >
                          <CheckCircle2 size={14} />
                          Approve
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-6 p-5 xl:grid-cols-[1.35fr_0.65fr]">
                <div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <AlertTriangle
                        size={16}
                        className="text-amber-600"
                      />

                      <span className="text-xs font-semibold text-slate-800">
                        Action requires human approval
                      </span>
                    </div>

                    <p className="text-sm leading-6 text-slate-600">
                      {selectedRequest.description}
                    </p>
                  </div>

                  <div className="mt-5">
                    <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Requested Action
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white">
                      <DetailRow
                        label="Workflow"
                        value={selectedRequest.workflow}
                      />

                      <DetailRow
                        label="Agent"
                        value={selectedRequest.agent}
                      />

                      <DetailRow
                        label="Requester"
                        value={selectedRequest.requester}
                      />

                      <DetailRow
                        label="Requested by"
                        value={selectedRequest.createdAt}
                      />

                      <DetailRow
                        label="Category"
                        value={selectedRequest.category}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Approval Controls
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white">
                    <DetailRow
                      label="Approver"
                      value={selectedRequest.approver}
                    />

                    <DetailRow
                      label="Priority"
                      value={selectedRequest.priority}
                    />

                    <DetailRow
                      label="Expires"
                      value={selectedRequest.expiresAt}
                    />

                    <DetailRow
                      label="Approval policy"
                      value="Human required"
                    />

                    <DetailRow
                      label="Execution lock"
                      value={
                        selectedRequest.status === "Pending"
                          ? "Locked"
                          : "Released"
                      }
                    />
                  </div>

                  <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck
                        size={16}
                        className="text-blue-700"
                      />

                      <span className="text-xs font-semibold text-blue-900">
                        Governance protection enabled
                      </span>
                    </div>

                    <p className="mt-2 text-[11px] leading-5 text-blue-800">
                      This approval is recorded in the audit trail and the
                      protected action remains blocked until a valid approval
                      decision is recorded.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <InfoCard
                icon={<Users size={17} />}
                title="Role-based approvals"
                description="Route requests to approved users, teams and enterprise roles."
              />

              <InfoCard
                icon={<Zap size={17} />}
                title="Runtime blocking"
                description="Protected agent actions remain locked while approval is pending."
              />

              <InfoCard
                icon={<History size={17} />}
                title="Audit trail"
                description="Every approval, rejection and expiration is recorded."
              />

              <InfoCard
                icon={<Settings2 size={17} />}
                title="Approval policies"
                description="Configure which agent actions require human intervention."
              />
            </section>

            <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
              <section className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">
                      Approval Queue
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Review requests waiting for human decisions.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <FilterSelect
                      value={priorityFilter}
                      options={[
                        "All",
                        "Low",
                        "Medium",
                        "High",
                        "Critical",
                      ]}
                      onChange={setPriorityFilter}
                    />

                    <FilterSelect
                      value={categoryFilter}
                      options={categories}
                      onChange={setCategoryFilter}
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <div className="min-w-[850px]">
                    <div className="grid grid-cols-[90px_1.4fr_1fr_100px_110px_110px] gap-4 border-b border-slate-100 pb-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      <span>ID</span>
                      <span>Request</span>
                      <span>Workflow</span>
                      <span>Priority</span>
                      <span>Status</span>
                      <span>Created</span>
                    </div>

                    {filteredRequests.map((request) => (
                      <button
                        key={request.id}
                        onClick={() => setSelectedId(request.id)}
                        className={`grid w-full grid-cols-[90px_1.4fr_1fr_100px_110px_110px] items-center gap-4 border-b border-slate-100 py-4 text-left last:border-b-0 ${
                          request.id === selectedRequest.id
                            ? "bg-slate-50"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <span className="font-mono text-[10px] text-slate-500">
                          {request.id}
                        </span>

                        <div>
                          <div className="text-xs font-semibold text-slate-800">
                            {request.title}
                          </div>

                          <div className="mt-1 text-[10px] text-slate-400">
                            {request.agent}
                          </div>
                        </div>

                        <span className="text-xs text-slate-600">
                          {request.workflow}
                        </span>

                        <PriorityBadge priority={request.priority} />

                        <StatusBadge status={request.status} />

                        <span className="text-[10px] text-slate-400">
                          {request.createdAt}
                        </span>
                      </button>
                    ))}

                    {filteredRequests.length === 0 && (
                      <div className="py-12 text-center">
                        <Search
                          size={24}
                          className="mx-auto mb-2 text-slate-300"
                        />
                        <p className="text-xs text-slate-500">
                          No approval requests match the current filters.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <div className="space-y-6">
                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="mb-4">
                    <h2 className="text-sm font-semibold text-slate-900">
                      Approval Runtime
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Current governance service health.
                    </p>
                  </div>

                  <DetailRow
                    label="Approval service"
                    value="Healthy"
                  />

                  <DetailRow
                    label="Policy engine"
                    value="Healthy"
                  />

                  <DetailRow
                    label="Audit service"
                    value="Healthy"
                  />

                  <DetailRow
                    label="Pending queue"
                    value={`${pendingCount} requests`}
                  />

                  <DetailRow
                    label="Average decision"
                    value="2m 14s"
                  />
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="mb-4">
                    <h2 className="text-sm font-semibold text-slate-900">
                      Connected Systems
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Approval requests can be triggered by runtime systems.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                      <Bot size={16} className="text-slate-700" />
                      <div className="flex-1">
                        <div className="text-xs font-medium text-slate-800">
                          Agent Runtime
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Execution control
                        </div>
                      </div>
                      <CheckCircle2
                        size={15}
                        className="text-emerald-500"
                      />
                    </div>

                    <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                      <Database size={16} className="text-slate-700" />
                      <div className="flex-1">
                        <div className="text-xs font-medium text-slate-800">
                          Policy Store
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Governance configuration
                        </div>
                      </div>
                      <CheckCircle2
                        size={15}
                        className="text-emerald-500"
                      />
                    </div>

                    <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                      <MessageSquare
                        size={16}
                        className="text-slate-700"
                      />
                      <div className="flex-1">
                        <div className="text-xs font-medium text-slate-800">
                          Notification Service
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Approval notifications
                        </div>
                      </div>
                      <CheckCircle2
                        size={15}
                        className="text-emerald-500"
                      />
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Continue with governance
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Configure permissions, guardrails and audit controls for
                    human approval workflows.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/agent-builder/security/permissions"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Permissions
                  </Link>

                  <Link
                    href="/agent-builder/security/guardrails"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Guardrails
                  </Link>

                  <Link
                    href="/agent-builder/security/audit-logs"
                    className="flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
                  >
                    Audit Logs
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>

      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-slate-900">
                    Approval Details
                  </h2>
                  <StatusBadge status={selectedRequest.status} />
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  {selectedRequest.id}
                </p>
              </div>

              <button
                onClick={() => setShowDetail(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <span className="text-xl leading-none">×</span>
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="rounded-xl bg-slate-50 p-4">
                <h3 className="text-sm font-semibold text-slate-900">
                  {selectedRequest.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {selectedRequest.description}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 px-4">
                <DetailRow
                  label="Workflow"
                  value={selectedRequest.workflow}
                />

                <DetailRow
                  label="Agent"
                  value={selectedRequest.agent}
                />

                <DetailRow
                  label="Requester"
                  value={selectedRequest.requester}
                />

                <DetailRow
                  label="Approver"
                  value={selectedRequest.approver}
                />

                <DetailRow
                  label="Category"
                  value={selectedRequest.category}
                />

                <DetailRow
                  label="Priority"
                  value={selectedRequest.priority}
                />

                <DetailRow
                  label="Created"
                  value={selectedRequest.createdAt}
                />

                <DetailRow
                  label="Expiration"
                  value={selectedRequest.expiresAt}
                />
              </div>

              {selectedRequest.status === "Pending" && (
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      updateRequest(selectedRequest.id, "Rejected");
                      setShowDetail(false);
                    }}
                    className="rounded-lg border border-red-200 px-4 py-2 text-xs font-medium text-red-700 hover:bg-red-50"
                  >
                    Reject Request
                  </button>

                  <button
                    onClick={() => {
                      updateRequest(selectedRequest.id, "Approved");
                      setShowDetail(false);
                    }}
                    className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800"
                  >
                    Approve Request
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Create Approval Request
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Create a human approval checkpoint for an agent action.
                </p>
              </div>

              <button
                onClick={() => setShowCreate(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <span className="text-xl leading-none">×</span>
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                  Request title
                </label>

                <input
                  value={newTitle}
                  onChange={(event) => setNewTitle(event.target.value)}
                  placeholder="Example: Approve production deployment"
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                  Description
                </label>

                <textarea
                  value={newDescription}
                  onChange={(event) =>
                    setNewDescription(event.target.value)
                  }
                  placeholder="Describe the action that requires approval."
                  rows={3}
                  className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                  Workflow
                </label>

                <input
                  value={newWorkflow}
                  onChange={(event) =>
                    setNewWorkflow(event.target.value)
                  }
                  placeholder="Example: Customer Support Workflow"
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Approver
                  </label>

                  <select
                    value={newApprover}
                    onChange={(event) =>
                      setNewApprover(event.target.value)
                    }
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none"
                  >
                    <option>Platform Admin</option>
                    <option>Engineering Admin</option>
                    <option>Support Lead</option>
                    <option>Operations Lead</option>
                    <option>Security Admin</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Priority
                  </label>

                  <select
                    value={newPriority}
                    onChange={(event) =>
                      setNewPriority(
                        event.target.value as ApprovalPriority,
                      )
                    }
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-200 p-5">
              <button
                onClick={() => setShowCreate(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={createRequest}
                disabled={!newTitle.trim()}
                className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Create Approval
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}