"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Database,
  FileText,
  Lock,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  UserRound,
  Users,
  XCircle,
  Zap,
} from "lucide-react";

type ApprovalStatus = "Pending" | "Approved" | "Rejected" | "Expired";

type ApprovalRequest = {
  id: string;
  title: string;
  description: string;
  requester: string;
  requesterRole: string;
  approver: string;
  resource: string;
  action: string;
  risk: "Low" | "Medium" | "High" | "Critical";
  status: ApprovalStatus;
  created: string;
  expires: string;
  environment: "Production" | "Staging" | "Development";
};

const approvalRequests: ApprovalRequest[] = [
  {
    id: "APR-1048",
    title: "Production database access",
    description: "Agent requires temporary read access to the customer analytics database.",
    requester: "Customer Support Agent",
    requesterRole: "AI Agent",
    approver: "Pujitha",
    resource: "Customer Analytics DB",
    action: "Read data",
    risk: "High",
    status: "Pending",
    created: "8 min ago",
    expires: "52 min",
    environment: "Production",
  },
  {
    id: "APR-1047",
    title: "External API execution",
    description: "Allow the research agent to execute an external financial-data API.",
    requester: "Research Agent",
    requesterRole: "AI Agent",
    approver: "Security Team",
    resource: "Financial Data API",
    action: "Execute API",
    risk: "Medium",
    status: "Pending",
    created: "19 min ago",
    expires: "41 min",
    environment: "Production",
  },
  {
    id: "APR-1046",
    title: "Browser automation session",
    description: "Agent requested permission to interact with a customer portal.",
    requester: "Browser Agent",
    requesterRole: "AI Agent",
    approver: "Operations",
    resource: "Customer Portal",
    action: "Browser interaction",
    risk: "High",
    status: "Approved",
    created: "1 hr ago",
    expires: "3 hrs",
    environment: "Production",
  },
  {
    id: "APR-1045",
    title: "Deploy workflow version",
    description: "New workflow version requires human approval before production deployment.",
    requester: "Invoice Workflow",
    requesterRole: "Workflow",
    approver: "Engineering",
    resource: "Invoice Processing Workflow",
    action: "Deploy",
    risk: "Medium",
    status: "Approved",
    created: "2 hrs ago",
    expires: "6 hrs",
    environment: "Production",
  },
  {
    id: "APR-1044",
    title: "Send customer notification",
    description: "Agent wants to send a bulk notification to 2,430 customers.",
    requester: "Notification Agent",
    requesterRole: "AI Agent",
    approver: "Customer Operations",
    resource: "Customer Notification Service",
    action: "Send notification",
    risk: "Critical",
    status: "Rejected",
    created: "3 hrs ago",
    expires: "Expired",
    environment: "Production",
  },
  {
    id: "APR-1043",
    title: "Knowledge base update",
    description: "Agent requested permission to publish updated knowledge documents.",
    requester: "Knowledge Agent",
    requesterRole: "AI Agent",
    approver: "Knowledge Team",
    resource: "Enterprise Knowledge Base",
    action: "Publish documents",
    risk: "Low",
    status: "Expired",
    created: "1 day ago",
    expires: "Expired",
    environment: "Staging",
  },
];

const statusOptions = ["All", "Pending", "Approved", "Rejected", "Expired"];
const riskOptions = ["All", "Low", "Medium", "High", "Critical"];

export default function HumanApprovalsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");
  const [selectedRequest, setSelectedRequest] =
    useState<ApprovalRequest | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const filteredRequests = useMemo(() => {
    const query = search.toLowerCase().trim();

    return approvalRequests.filter((request) => {
      const matchesSearch =
        !query ||
        request.title.toLowerCase().includes(query) ||
        request.requester.toLowerCase().includes(query) ||
        request.resource.toLowerCase().includes(query) ||
        request.action.toLowerCase().includes(query) ||
        request.id.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || request.status === statusFilter;

      const matchesRisk =
        riskFilter === "All" || request.risk === riskFilter;

      return matchesSearch && matchesStatus && matchesRisk;
    });
  }, [search, statusFilter, riskFilter]);

  const pendingCount = approvalRequests.filter(
    (item) => item.status === "Pending"
  ).length;

  const approvedCount = approvalRequests.filter(
    (item) => item.status === "Approved"
  ).length;

  const rejectedCount = approvalRequests.filter(
    (item) => item.status === "Rejected"
  ).length;

  const highRiskPending = approvalRequests.filter(
    (item) =>
      item.status === "Pending" &&
      (item.risk === "High" || item.risk === "Critical")
  ).length;

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#172033]">
      <div className="mx-auto max-w-[1500px] px-6 py-6">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/agent-builder/security"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e1e5eb] bg-white text-[#667085] transition hover:bg-[#f4f5f7]"
            >
              <ArrowLeft size={17} />
            </Link>

            <div>
              <div className="flex items-center gap-2 text-sm text-[#667085]">
                <span>Agent Builder</span>
                <span>/</span>
                <span>Security & Governance</span>
                <span>/</span>
                <span className="text-[#172033]">Human Approvals</span>
              </div>

              <h1 className="mt-1 text-[25px] font-semibold tracking-[-0.5px]">
                Human Approvals
              </h1>

              <p className="mt-1 text-sm text-[#667085]">
                Review and manage human approval requests for agents,
                workflows, tools, and production actions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/agent-builder/security/audit-logs"
              className="flex items-center gap-2 rounded-lg border border-[#dfe3e8] bg-white px-3.5 py-2 text-sm font-medium text-[#344054] hover:bg-[#f8f9fb]"
            >
              <FileText size={16} />
              Audit Logs
            </Link>

            <Link
              href="/agent-builder/security/permissions"
              className="flex items-center gap-2 rounded-lg border border-[#dfe3e8] bg-white px-3.5 py-2 text-sm font-medium text-[#344054] hover:bg-[#f8f9fb]"
            >
              <Lock size={16} />
              Permissions
            </Link>

            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 rounded-lg bg-[#171a21] px-4 py-2 text-sm font-medium text-white hover:bg-[#282c35]"
            >
              <Plus size={16} />
              Create Approval Rule
            </button>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-4 gap-4">
          <MetricCard
            label="Pending approvals"
            value={pendingCount.toString()}
            helper="Requires human action"
            icon={<Clock3 size={18} />}
          />

          <MetricCard
            label="Approved"
            value={approvedCount.toString()}
            helper="Approved requests"
            icon={<CheckCircle2 size={18} />}
          />

          <MetricCard
            label="Rejected"
            value={rejectedCount.toString()}
            helper="Blocked requests"
            icon={<XCircle size={18} />}
          />

          <MetricCard
            label="High-risk pending"
            value={highRiskPending.toString()}
            helper="Requires priority review"
            icon={<AlertTriangle size={18} />}
          />
        </div>

        <section className="mb-5 rounded-xl border border-[#e1e5eb] bg-white">
          <div className="border-b border-[#edf0f3] px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[16px] font-semibold">
                  Approval Queue
                </h2>
                <p className="mt-1 text-xs text-[#667085]">
                  Human-in-the-loop requests generated by ModelNow agents and
                  workflows.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#fff4e5] px-2.5 py-1 text-[11px] font-medium text-[#b54708]">
                  {pendingCount} pending
                </span>

                <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e1e5eb] text-[#667085] hover:bg-[#f8f9fb]">
                  <Settings2 size={15} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 border-b border-[#edf0f3] px-5 py-3">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#98a2b3]"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search approvals, agents, resources..."
                className="h-9 w-full rounded-lg border border-[#dfe3e8] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#98a2b3]"
              />
            </div>

            <FilterSelect
              value={statusFilter}
              options={statusOptions}
              onChange={setStatusFilter}
            />

            <FilterSelect
              value={riskFilter}
              options={riskOptions}
              onChange={setRiskFilter}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse">
              <thead>
                <tr className="bg-[#fafbfc] text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[#667085]">
                  <th className="px-5 py-3">Request</th>
                  <th className="px-4 py-3">Requester</th>
                  <th className="px-4 py-3">Resource</th>
                  <th className="px-4 py-3">Risk</th>
                  <th className="px-4 py-3">Environment</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredRequests.map((request) => (
                  <tr
                    key={request.id}
                    className="border-t border-[#edf0f3] hover:bg-[#fafbfc]"
                  >
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="text-left"
                      >
                        <div className="text-sm font-semibold text-[#172033] hover:underline">
                          {request.title}
                        </div>
                        <div className="mt-1 text-[11px] text-[#98a2b3]">
                          {request.id}
                        </div>
                      </button>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eef2ff] text-[#4f46e5]">
                          <UserRound size={14} />
                        </div>
                        <div>
                          <div className="text-sm font-medium">
                            {request.requester}
                          </div>
                          <div className="text-[11px] text-[#98a2b3]">
                            {request.requesterRole}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-[#344054]">
                        {request.resource}
                      </div>
                      <div className="mt-1 text-[11px] text-[#98a2b3]">
                        {request.action}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <RiskBadge risk={request.risk} />
                    </td>

                    <td className="px-4 py-4">
                      <span className="rounded-md border border-[#e1e5eb] bg-[#fafbfc] px-2 py-1 text-[11px] font-medium text-[#475467]">
                        {request.environment}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <ApprovalStatusBadge status={request.status} />
                    </td>

                    <td className="px-4 py-4 text-xs text-[#667085]">
                      {request.created}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {request.status === "Pending" ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setSelectedRequest(request)}
                            className="rounded-lg border border-[#dfe3e8] px-3 py-1.5 text-xs font-medium text-[#344054] hover:bg-[#f8f9fb]"
                          >
                            Review
                          </button>

                          <button className="rounded-lg bg-[#171a21] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#282c35]">
                            Approve
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="text-xs font-medium text-[#475467] hover:text-[#171a21]"
                        >
                          View
                        </button>
                      )}
                    </td>
                  </tr>
                ))}

                {filteredRequests.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center">
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#f2f4f7] text-[#667085]">
                        <Search size={18} />
                      </div>
                      <p className="mt-3 text-sm font-medium">
                        No approval requests found
                      </p>
                      <p className="mt-1 text-xs text-[#98a2b3]">
                        Try changing your search or filters.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid grid-cols-3 gap-4">
          <InfoCard
            icon={<ShieldCheck size={18} />}
            title="Human-in-the-loop"
            description="Require a human decision before sensitive agent actions are executed."
            items={[
              "Production deployments",
              "Sensitive database access",
              "External API execution",
              "High-risk browser actions",
            ]}
          />

          <InfoCard
            icon={<Users size={18} />}
            title="Approval routing"
            description="Route approval requests to the correct team or individual."
            items={[
              "Team-based approval",
              "Role-based approval",
              "Multi-step approvals",
              "Escalation rules",
            ]}
          />

          <InfoCard
            icon={<Zap size={18} />}
            title="Runtime protection"
            description="Pause agent execution while approval decisions are pending."
            items={[
              "Execution pause",
              "Approval timeout",
              "Automatic expiry",
              "Decision audit trail",
            ]}
          />
        </div>

        <section className="mt-5 rounded-xl border border-[#e1e5eb] bg-white">
          <div className="border-b border-[#edf0f3] px-5 py-4">
            <h2 className="text-[16px] font-semibold">
              Approval Workflow
            </h2>
            <p className="mt-1 text-xs text-[#667085]">
              Standard lifecycle for sensitive agent operations.
            </p>
          </div>

          <div className="grid grid-cols-5 divide-x divide-[#edf0f3]">
            <WorkflowStep
              number="01"
              title="Agent requests"
              description="Agent detects an action requiring human approval."
              icon={<Activity size={17} />}
            />

            <WorkflowStep
              number="02"
              title="Policy check"
              description="Security policies determine the approval requirement."
              icon={<ShieldCheck size={17} />}
            />

            <WorkflowStep
              number="03"
              title="Approval queue"
              description="Request is routed to the appropriate approver."
              icon={<Users size={17} />}
            />

            <WorkflowStep
              number="04"
              title="Human decision"
              description="Approver accepts, rejects, or lets the request expire."
              icon={<CheckCircle2 size={17} />}
            />

            <WorkflowStep
              number="05"
              title="Execution"
              description="Approved action continues and is recorded in the audit trail."
              icon={<Database size={17} />}
            />
          </div>
        </section>
      </div>

      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-5">
          <div className="w-full max-w-[650px] rounded-2xl border border-[#e1e5eb] bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#edf0f3] px-6 py-5">
              <div>
                <div className="text-[11px] font-medium text-[#98a2b3]">
                  {selectedRequest.id}
                </div>
                <h2 className="mt-1 text-lg font-semibold">
                  {selectedRequest.title}
                </h2>
                <p className="mt-1 text-sm text-[#667085]">
                  {selectedRequest.description}
                </p>
              </div>

              <button
                onClick={() => setSelectedRequest(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e1e5eb] text-[#667085] hover:bg-[#f8f9fb]"
              >
                <span className="text-[20px] leading-none">×</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 px-6 py-5">
              <DetailItem label="Requester" value={selectedRequest.requester} />
              <DetailItem label="Approver" value={selectedRequest.approver} />
              <DetailItem label="Resource" value={selectedRequest.resource} />
              <DetailItem label="Action" value={selectedRequest.action} />
              <DetailItem label="Risk" value={selectedRequest.risk} />
              <DetailItem
                label="Environment"
                value={selectedRequest.environment}
              />
              <DetailItem label="Created" value={selectedRequest.created} />
              <DetailItem label="Expires" value={selectedRequest.expires} />
            </div>

            {selectedRequest.status === "Pending" && (
              <div className="border-t border-[#edf0f3] px-6 py-4">
                <div className="mb-3 rounded-lg bg-[#fff8eb] p-3 text-xs text-[#92400e]">
                  Review the requested action and risk level before allowing
                  the agent to continue.
                </div>

                <div className="flex justify-end gap-2">
                  <button className="rounded-lg border border-[#f04438] px-4 py-2 text-sm font-medium text-[#d92d20] hover:bg-[#fff5f4]">
                    Reject
                  </button>

                  <button className="rounded-lg bg-[#171a21] px-4 py-2 text-sm font-medium text-white hover:bg-[#282c35]">
                    Approve Request
                  </button>
                </div>
              </div>
            )}

            {selectedRequest.status !== "Pending" && (
              <div className="flex justify-end border-t border-[#edf0f3] px-6 py-4">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="rounded-lg border border-[#dfe3e8] px-4 py-2 text-sm font-medium text-[#344054]"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-5">
          <div className="w-full max-w-[620px] rounded-2xl border border-[#e1e5eb] bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#edf0f3] px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold">
                  Create Approval Rule
                </h2>
                <p className="mt-1 text-sm text-[#667085]">
                  Define when ModelNow should pause an agent and request human
                  approval.
                </p>
              </div>

              <button
                onClick={() => setShowCreate(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e1e5eb] text-[#667085] hover:bg-[#f8f9fb]"
              >
                <span className="text-[20px] leading-none">×</span>
              </button>
            </div>

            <div className="space-y-4 px-6 py-5">
              <FormField label="Rule name">
                <input
                  placeholder="Example: Production database approval"
                  className="h-10 w-full rounded-lg border border-[#dfe3e8] px-3 text-sm outline-none focus:border-[#98a2b3]"
                />
              </FormField>

              <FormField label="Trigger">
                <div className="relative">
                  <select className="h-10 w-full appearance-none rounded-lg border border-[#dfe3e8] bg-white px-3 pr-9 text-sm outline-none">
                    <option>Production resource access</option>
                    <option>External API execution</option>
                    <option>Browser automation</option>
                    <option>Production deployment</option>
                    <option>Customer communication</option>
                  </select>
                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#667085]"
                  />
                </div>
              </FormField>

              <FormField label="Approver">
                <div className="relative">
                  <select className="h-10 w-full appearance-none rounded-lg border border-[#dfe3e8] bg-white px-3 pr-9 text-sm outline-none">
                    <option>Security Team</option>
                    <option>Engineering</option>
                    <option>Operations</option>
                    <option>Administrator</option>
                    <option>Resource Owner</option>
                  </select>
                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#667085]"
                  />
                </div>
              </FormField>

              <FormField label="Approval timeout">
                <div className="relative">
                  <select className="h-10 w-full appearance-none rounded-lg border border-[#dfe3e8] bg-white px-3 pr-9 text-sm outline-none">
                    <option>30 minutes</option>
                    <option>1 hour</option>
                    <option>4 hours</option>
                    <option>24 hours</option>
                  </select>
                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#667085]"
                  />
                </div>
              </FormField>

              <div className="rounded-lg border border-[#e5e7eb] bg-[#fafbfc] p-3 text-xs text-[#667085]">
                The agent execution will pause until an authorized human
                approves or rejects the requested action.
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-[#edf0f3] px-6 py-4">
              <button
                onClick={() => setShowCreate(false)}
                className="rounded-lg border border-[#dfe3e8] px-4 py-2 text-sm font-medium text-[#344054]"
              >
                Cancel
              </button>

              <button
                onClick={() => setShowCreate(false)}
                className="rounded-lg bg-[#171a21] px-4 py-2 text-sm font-medium text-white hover:bg-[#282c35]"
              >
                Create Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function MetricCard({
  label,
  value,
  helper,
  icon,
}: {
  label: string;
  value: string;
  helper: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#e1e5eb] bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-[#667085]">{label}</div>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f2f4f7] text-[#475467]">
          {icon}
        </div>
      </div>

      <div className="mt-3 text-[25px] font-semibold tracking-[-0.5px]">
        {value}
      </div>

      <div className="mt-1 text-[11px] text-[#98a2b3]">{helper}</div>
    </div>
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
        className="h-9 min-w-[125px] appearance-none rounded-lg border border-[#dfe3e8] bg-white px-3 pr-8 text-xs font-medium text-[#475467] outline-none"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>

      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#667085]"
      />
    </div>
  );
}

function RiskBadge({
  risk,
}: {
  risk: ApprovalRequest["risk"];
}) {
  const styles = {
    Low: "bg-[#ecfdf3] text-[#027a48]",
    Medium: "bg-[#fffaeb] text-[#b54708]",
    High: "bg-[#fff4e5] text-[#c4320a]",
    Critical: "bg-[#fef3f2] text-[#b42318]",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${styles[risk]}`}
    >
      {risk}
    </span>
  );
}

function ApprovalStatusBadge({
  status,
}: {
  status: ApprovalStatus;
}) {
  const styles = {
    Pending: "bg-[#fff4e5] text-[#b54708]",
    Approved: "bg-[#ecfdf3] text-[#027a48]",
    Rejected: "bg-[#fef3f2] text-[#b42318]",
    Expired: "bg-[#f2f4f7] text-[#667085]",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function InfoCard({
  icon,
  title,
  description,
  items,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  items: string[];
}) {
  return (
    <div className="rounded-xl border border-[#e1e5eb] bg-white p-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f2f4f7] text-[#475467]">
        {icon}
      </div>

      <h3 className="mt-4 text-sm font-semibold">{title}</h3>

      <p className="mt-1.5 text-xs leading-5 text-[#667085]">
        {description}
      </p>

      <div className="mt-4 space-y-2">
        {items.map((item) => (
          <div
            key={item}
            className="flex items-center gap-2 text-xs text-[#475467]"
          >
            <CheckCircle2 size={13} className="text-[#12b76a]" />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function WorkflowStep({
  number,
  title,
  description,
  icon,
}: {
  number: string;
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <div className="relative p-5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-[#98a2b3]">
          {number}
        </span>

        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f2f4f7] text-[#475467]">
          {icon}
        </div>
      </div>

      <h3 className="mt-5 text-sm font-semibold">{title}</h3>

      <p className="mt-1.5 text-xs leading-5 text-[#667085]">
        {description}
      </p>
    </div>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-[#edf0f3] bg-[#fafbfc] p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-[#98a2b3]">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium text-[#344054]">{value}</div>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-[#344054]">
        {label}
      </label>
      {children}
    </div>
  );
}