"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Database,
  FileText,
  KeyRound,
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

type PolicyStatus = "Active" | "Restricted" | "Disabled";

type ToolPolicy = {
  id: string;
  name: string;
  description: string;
  tool: string;
  category: string;
  scope: string;
  role: string;
  approval: "Automatic" | "Human Approval" | "Not Required";
  status: PolicyStatus;
  executions: number;
  lastUpdated: string;
};

const initialPolicies: ToolPolicy[] = [
  {
    id: "POL-1001",
    name: "Browser Production Access",
    description:
      "Allows browser agents to access approved production websites.",
    tool: "Browser Automation",
    category: "Browser",
    scope: "Production",
    role: "Browser Agent",
    approval: "Human Approval",
    status: "Active",
    executions: 1248,
    lastUpdated: "8 min ago",
  },
  {
    id: "POL-1002",
    name: "External API Execution",
    description:
      "Allows agents to call approved external REST APIs.",
    tool: "REST API",
    category: "API",
    scope: "Production",
    role: "Research Agent",
    approval: "Automatic",
    status: "Active",
    executions: 3842,
    lastUpdated: "21 min ago",
  },
  {
    id: "POL-1003",
    name: "Database Read Access",
    description:
      "Allows agents to read approved enterprise database resources.",
    tool: "Database",
    category: "Data",
    scope: "Production",
    role: "Data Analyst",
    approval: "Not Required",
    status: "Active",
    executions: 9214,
    lastUpdated: "35 min ago",
  },
  {
    id: "POL-1004",
    name: "Database Write Access",
    description:
      "Restricts write operations to explicitly approved production tables.",
    tool: "Database",
    category: "Data",
    scope: "Production",
    role: "Database Operator",
    approval: "Human Approval",
    status: "Restricted",
    executions: 412,
    lastUpdated: "1 hr ago",
  },
  {
    id: "POL-1005",
    name: "Code Execution",
    description:
      "Controls sandboxed code execution for agent workflows.",
    tool: "Code Execution",
    category: "Runtime",
    scope: "Development",
    role: "Engineering",
    approval: "Automatic",
    status: "Active",
    executions: 2741,
    lastUpdated: "2 hrs ago",
  },
  {
    id: "POL-1006",
    name: "Computer Use",
    description:
      "Controls desktop and computer-use actions performed by agents.",
    tool: "Computer Use",
    category: "Computer",
    scope: "Production",
    role: "Computer Agent",
    approval: "Human Approval",
    status: "Restricted",
    executions: 763,
    lastUpdated: "3 hrs ago",
  },
  {
    id: "POL-1007",
    name: "MCP Tool Access",
    description:
      "Allows agents to invoke approved MCP tools.",
    tool: "MCP",
    category: "Integration",
    scope: "Staging",
    role: "Agent Runtime",
    approval: "Automatic",
    status: "Active",
    executions: 1846,
    lastUpdated: "5 hrs ago",
  },
  {
    id: "POL-1008",
    name: "Notification Sending",
    description:
      "Controls outbound customer and internal notifications.",
    tool: "Notification Service",
    category: "Communication",
    scope: "Production",
    role: "Notification Agent",
    approval: "Human Approval",
    status: "Disabled",
    executions: 184,
    lastUpdated: "1 day ago",
  },
];

const statusOptions = ["All", "Active", "Restricted", "Disabled"];

const categoryOptions = [
  "All",
  "Browser",
  "API",
  "Data",
  "Runtime",
  "Computer",
  "Integration",
  "Communication",
];

export default function ToolPoliciesPage() {
  const [policies, setPolicies] =
    useState<ToolPolicy[]>(initialPolicies);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [selectedPolicy, setSelectedPolicy] =
    useState<ToolPolicy | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showCreate, setShowCreate] = useState(false);

  const filteredPolicies = useMemo(() => {
    const query = search.toLowerCase().trim();

    return policies.filter((policy) => {
      const matchesSearch =
        !query ||
        policy.name.toLowerCase().includes(query) ||
        policy.description.toLowerCase().includes(query) ||
        policy.tool.toLowerCase().includes(query) ||
        policy.category.toLowerCase().includes(query) ||
        policy.role.toLowerCase().includes(query) ||
        policy.id.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || policy.status === statusFilter;

      const matchesCategory =
        categoryFilter === "All" ||
        policy.category === categoryFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory
      );
    });
  }, [policies, search, statusFilter, categoryFilter]);

  const activeCount = policies.filter(
    (policy) => policy.status === "Active"
  ).length;

  const restrictedCount = policies.filter(
    (policy) => policy.status === "Restricted"
  ).length;

  const disabledCount = policies.filter(
    (policy) => policy.status === "Disabled"
  ).length;

  const totalExecutions = policies.reduce(
    (total, policy) => total + policy.executions,
    0
  );

  const approvalPolicies = policies.filter(
    (policy) => policy.approval === "Human Approval"
  ).length;

  const allVisibleSelected =
    filteredPolicies.length > 0 &&
    filteredPolicies.every((policy) =>
      selectedIds.includes(policy.id)
    );

  function toggleSelection(id: string) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function toggleAll() {
    const visibleIds = filteredPolicies.map(
      (policy) => policy.id
    );

    if (allVisibleSelected) {
      setSelectedIds((current) =>
        current.filter((id) => !visibleIds.includes(id))
      );
    } else {
      setSelectedIds((current) =>
        Array.from(new Set([...current, ...visibleIds]))
      );
    }
  }

  function updateStatus(
    id: string,
    status: PolicyStatus
  ) {
    setPolicies((current) =>
      current.map((policy) =>
        policy.id === id
          ? {
              ...policy,
              status,
              lastUpdated: "Just now",
            }
          : policy
      )
    );

    setSelectedPolicy((current) =>
      current?.id === id
        ? {
            ...current,
            status,
            lastUpdated: "Just now",
          }
        : current
    );

    setSelectedIds((current) =>
      current.filter((item) => item !== id)
    );
  }

  function bulkUpdate(status: PolicyStatus) {
    if (selectedIds.length === 0) return;

    setPolicies((current) =>
      current.map((policy) =>
        selectedIds.includes(policy.id)
          ? {
              ...policy,
              status,
              lastUpdated: "Just now",
            }
          : policy
      )
    );

    setSelectedIds([]);
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#172033]">
      <div className="mx-auto max-w-[1550px] px-6 py-6">
        <header className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/agent-builder/security"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e1e5eb] bg-white text-[#667085] hover:bg-[#f4f5f7]"
            >
              <ArrowLeft size={17} />
            </Link>

            <div>
              <div className="flex items-center gap-2 text-sm text-[#667085]">
                <span>Agent Builder</span>
                <span>/</span>
                <span>Security & Governance</span>
                <span>/</span>
                <span className="text-[#172033]">
                  Tool Policies
                </span>
              </div>

              <h1 className="mt-1 text-[25px] font-semibold tracking-[-0.5px]">
                Tool Policies
              </h1>

              <p className="mt-1 text-sm text-[#667085]">
                Control which tools agents can use, where they can
                execute them, and when human approval is required.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/agent-builder/security/permissions"
              className="flex items-center gap-2 rounded-lg border border-[#dfe3e8] bg-white px-3.5 py-2 text-sm font-medium text-[#344054] hover:bg-[#f8f9fb]"
            >
              <KeyRound size={16} />
              Permissions
            </Link>

            <Link
              href="/agent-builder/security/human-approvals"
              className="flex items-center gap-2 rounded-lg border border-[#dfe3e8] bg-white px-3.5 py-2 text-sm font-medium text-[#344054] hover:bg-[#f8f9fb]"
            >
              <Users size={16} />
              Human Approvals
            </Link>

            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 rounded-lg bg-[#171a21] px-4 py-2 text-sm font-medium text-white hover:bg-[#282c35]"
            >
              <Plus size={16} />
              Create Policy
            </button>
          </div>
        </header>

        <section className="mb-5 grid grid-cols-5 gap-4">
          <MetricCard
            label="Active policies"
            value={activeCount.toString()}
            helper="Currently enforced"
            icon={<CheckCircle2 size={18} />}
          />

          <MetricCard
            label="Restricted"
            value={restrictedCount.toString()}
            helper="Limited tool access"
            icon={<Lock size={18} />}
          />

          <MetricCard
            label="Disabled"
            value={disabledCount.toString()}
            helper="Execution blocked"
            icon={<XCircle size={18} />}
          />

          <MetricCard
            label="Tool executions"
            value={totalExecutions.toLocaleString()}
            helper="Tracked executions"
            icon={<Activity size={18} />}
          />

          <MetricCard
            label="Human approval"
            value={approvalPolicies.toString()}
            helper="Policies requiring approval"
            icon={<ShieldCheck size={18} />}
          />
        </section>

        <section className="mb-5 rounded-xl border border-[#e1e5eb] bg-white">
          <div className="border-b border-[#edf0f3] px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[16px] font-semibold">
                  Tool Access Policies
                </h2>

                <p className="mt-1 text-xs text-[#667085]">
                  Configure tool-level controls for agents,
                  workflows, and enterprise users.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#ecfdf3] px-2.5 py-1 text-[11px] font-medium text-[#027a48]">
                  {activeCount} active
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
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search policies, tools, roles..."
                className="h-9 w-full rounded-lg border border-[#dfe3e8] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#98a2b3]"
              />
            </div>

            <FilterSelect
              value={statusFilter}
              options={statusOptions}
              onChange={setStatusFilter}
            />

            <FilterSelect
              value={categoryFilter}
              options={categoryOptions}
              onChange={setCategoryFilter}
            />
          </div>

          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between border-b border-[#e5e7eb] bg-[#fafbfc] px-5 py-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle2
                  size={16}
                  className="text-[#12b76a]"
                />
                {selectedIds.length} policy
                {selectedIds.length !== 1 ? "ies" : ""} selected
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => bulkUpdate("Restricted")}
                  className="rounded-lg border border-[#dfe3e8] bg-white px-3 py-1.5 text-xs font-medium text-[#344054]"
                >
                  Restrict
                </button>

                <button
                  onClick={() => bulkUpdate("Disabled")}
                  className="rounded-lg border border-[#f04438] bg-white px-3 py-1.5 text-xs font-medium text-[#d92d20]"
                >
                  Disable
                </button>

                <button
                  onClick={() => bulkUpdate("Active")}
                  className="rounded-lg bg-[#171a21] px-3 py-1.5 text-xs font-medium text-white"
                >
                  Activate
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1350px] border-collapse">
              <thead>
                <tr className="bg-[#fafbfc] text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[#667085]">
                  <th className="w-[45px] px-5 py-3">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleAll}
                      className="h-4 w-4 rounded border-[#d0d5dd]"
                    />
                  </th>

                  <th className="px-2 py-3">Policy</th>
                  <th className="px-4 py-3">Tool</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Scope</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Approval</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Executions</th>
                  <th className="px-5 py-3 text-right">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredPolicies.map((policy) => (
                  <tr
                    key={policy.id}
                    className="border-t border-[#edf0f3] hover:bg-[#fafbfc]"
                  >
                    <td className="px-5 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(policy.id)}
                        onChange={() =>
                          toggleSelection(policy.id)
                        }
                        className="h-4 w-4 rounded border-[#d0d5dd]"
                      />
                    </td>

                    <td className="px-2 py-4">
                      <button
                        onClick={() => setSelectedPolicy(policy)}
                        className="text-left"
                      >
                        <div className="text-sm font-semibold text-[#172033] hover:underline">
                          {policy.name}
                        </div>

                        <div className="mt-1 text-[11px] text-[#98a2b3]">
                          {policy.id}
                        </div>
                      </button>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f2f4f7] text-[#475467]">
                          <ToolIcon tool={policy.tool} />
                        </div>

                        <span className="text-sm font-medium text-[#344054]">
                          {policy.tool}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span className="rounded-md border border-[#e1e5eb] bg-[#fafbfc] px-2 py-1 text-[11px] font-medium text-[#475467]">
                        {policy.category}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span className="text-sm text-[#475467]">
                        {policy.scope}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="text-sm font-medium">
                        {policy.role}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <ApprovalBadge
                        approval={policy.approval}
                      />
                    </td>

                    <td className="px-4 py-4">
                      <PolicyStatusBadge
                        status={policy.status}
                      />
                    </td>

                    <td className="px-4 py-4">
                      <span className="text-sm font-semibold">
                        {policy.executions.toLocaleString()}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            setSelectedPolicy(policy)
                          }
                          className="rounded-lg border border-[#dfe3e8] px-3 py-1.5 text-xs font-medium text-[#344054] hover:bg-[#f8f9fb]"
                        >
                          View
                        </button>

                        {policy.status === "Active" ? (
                          <button
                            onClick={() =>
                              updateStatus(
                                policy.id,
                                "Restricted"
                              )
                            }
                            className="rounded-lg border border-[#dfe3e8] px-3 py-1.5 text-xs font-medium text-[#344054]"
                          >
                            Restrict
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              updateStatus(
                                policy.id,
                                "Active"
                              )
                            }
                            className="rounded-lg bg-[#171a21] px-3 py-1.5 text-xs font-medium text-white"
                          >
                            Activate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredPolicies.length === 0 && (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-5 py-12 text-center"
                    >
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#f2f4f7] text-[#667085]">
                        <Search size={18} />
                      </div>

                      <p className="mt-3 text-sm font-medium">
                        No tool policies found
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

        <section className="grid grid-cols-3 gap-4">
          <InfoCard
            icon={<ShieldCheck size={18} />}
            title="Least privilege"
            description="Give each agent only the tools and permissions required for its task."
            items={[
              "Role-based tool access",
              "Environment boundaries",
              "Resource-level restrictions",
              "Default deny controls",
            ]}
          />

          <InfoCard
            icon={<KeyRound size={18} />}
            title="Approval controls"
            description="Add human approval before high-risk tools perform sensitive actions."
            items={[
              "Production writes",
              "Customer communication",
              "Financial operations",
              "External side effects",
            ]}
          />

          <InfoCard
            icon={<Activity size={18} />}
            title="Runtime monitoring"
            description="Track tool executions and policy decisions across agent workloads."
            items={[
              "Execution traces",
              "Blocked tool calls",
              "Policy violations",
              "Cost and latency",
            ]}
          />
        </section>

        <section className="mt-5 rounded-xl border border-[#e1e5eb] bg-white">
          <div className="border-b border-[#edf0f3] px-5 py-4">
            <h2 className="text-[16px] font-semibold">
              Tool Policy Evaluation Flow
            </h2>

            <p className="mt-1 text-xs text-[#667085]">
              Every tool invocation can be evaluated before execution.
            </p>
          </div>

          <div className="grid grid-cols-5 divide-x divide-[#edf0f3]">
            <ArchitectureStep
              number="01"
              title="Agent"
              description="Identify the agent or workflow requesting the tool."
              icon={<UserRound size={17} />}
            />

            <ArchitectureStep
              number="02"
              title="Tool"
              description="Identify the requested tool and operation."
              icon={<Zap size={17} />}
            />

            <ArchitectureStep
              number="03"
              title="Policy"
              description="Evaluate role, environment, resource, and tool rules."
              icon={<ShieldCheck size={17} />}
            />

            <ArchitectureStep
              number="04"
              title="Approval"
              description="Request human approval when the policy requires it."
              icon={<Users size={17} />}
            />

            <ArchitectureStep
              number="05"
              title="Decision"
              description="Allow, restrict, or block the tool execution."
              icon={<CheckCircle2 size={17} />}
            />
          </div>
        </section>
      </div>

      {selectedPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-5">
          <div className="w-full max-w-[700px] rounded-2xl border border-[#e1e5eb] bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#edf0f3] px-6 py-5">
              <div>
                <div className="text-[11px] font-medium text-[#98a2b3]">
                  {selectedPolicy.id}
                </div>

                <h2 className="mt-1 text-lg font-semibold">
                  {selectedPolicy.name}
                </h2>

                <p className="mt-1 text-sm text-[#667085]">
                  {selectedPolicy.description}
                </p>
              </div>

              <button
                onClick={() => setSelectedPolicy(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e1e5eb] text-[#667085] hover:bg-[#f8f9fb]"
              >
                <span className="text-[20px] leading-none">
                  ×
                </span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 px-6 py-5">
              <DetailItem
                label="Tool"
                value={selectedPolicy.tool}
              />

              <DetailItem
                label="Category"
                value={selectedPolicy.category}
              />

              <DetailItem
                label="Scope"
                value={selectedPolicy.scope}
              />

              <DetailItem
                label="Role"
                value={selectedPolicy.role}
              />

              <DetailItem
                label="Approval"
                value={selectedPolicy.approval}
              />

              <DetailItem
                label="Status"
                value={selectedPolicy.status}
              />

              <DetailItem
                label="Executions"
                value={selectedPolicy.executions.toLocaleString()}
              />

              <DetailItem
                label="Last Updated"
                value={selectedPolicy.lastUpdated}
              />
            </div>

            <div className="border-t border-[#edf0f3] px-6 py-4">
              <div className="mb-3 rounded-lg bg-[#f8f9fb] p-3 text-xs leading-5 text-[#667085]">
                Tool policies are evaluated before an agent can
                execute a tool. Sensitive operations can require
                human approval before the action is released.
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setSelectedPolicy(null)}
                  className="rounded-lg border border-[#dfe3e8] px-4 py-2 text-sm font-medium text-[#344054]"
                >
                  Close
                </button>

                {selectedPolicy.status !== "Disabled" && (
                  <button
                    onClick={() =>
                      updateStatus(
                        selectedPolicy.id,
                        "Disabled"
                      )
                    }
                    className="rounded-lg border border-[#f04438] px-4 py-2 text-sm font-medium text-[#d92d20]"
                  >
                    Disable Policy
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-5">
          <div className="w-full max-w-[640px] rounded-2xl border border-[#e1e5eb] bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#edf0f3] px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold">
                  Create Tool Policy
                </h2>

                <p className="mt-1 text-sm text-[#667085]">
                  Define how an agent can use a specific tool.
                </p>
              </div>

              <button
                onClick={() => setShowCreate(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e1e5eb] text-[#667085] hover:bg-[#f8f9fb]"
              >
                <span className="text-[20px] leading-none">
                  ×
                </span>
              </button>
            </div>

            <div className="space-y-4 px-6 py-5">
              <FormField label="Policy name">
                <input
                  placeholder="Example: Production Browser Access"
                  className="h-10 w-full rounded-lg border border-[#dfe3e8] px-3 text-sm outline-none focus:border-[#98a2b3]"
                />
              </FormField>

              <FormField label="Tool">
                <SelectField
                  options={[
                    "Browser Automation",
                    "REST API",
                    "Database",
                    "Computer Use",
                    "Code Execution",
                    "MCP",
                    "Notification Service",
                    "Knowledge Base",
                  ]}
                />
              </FormField>

              <FormField label="Category">
                <SelectField
                  options={[
                    "Browser",
                    "API",
                    "Data",
                    "Runtime",
                    "Computer",
                    "Integration",
                    "Communication",
                  ]}
                />
              </FormField>

              <FormField label="Environment">
                <SelectField
                  options={[
                    "Production",
                    "Staging",
                    "Development",
                  ]}
                />
              </FormField>

              <FormField label="Role">
                <SelectField
                  options={[
                    "Administrator",
                    "Engineering",
                    "Data Analyst",
                    "Research Agent",
                    "Browser Agent",
                    "Operations",
                    "Agent Runtime",
                    "Custom Role",
                  ]}
                />
              </FormField>

              <FormField label="Approval requirement">
                <SelectField
                  options={[
                    "Automatic",
                    "Human Approval",
                    "Not Required",
                  ]}
                />
              </FormField>

              <div className="rounded-lg border border-[#e5e7eb] bg-[#fafbfc] p-3 text-xs leading-5 text-[#667085]">
                For production tools with external side effects,
                consider requiring human approval and restricting
                the policy to specific resources.
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
                Create Policy
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
        <div className="text-xs font-medium text-[#667085]">
          {label}
        </div>

        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f2f4f7] text-[#475467]">
          {icon}
        </div>
      </div>

      <div className="mt-3 text-[25px] font-semibold tracking-[-0.5px]">
        {value}
      </div>

      <div className="mt-1 text-[11px] text-[#98a2b3]">
        {helper}
      </div>
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
        className="h-9 min-w-[140px] appearance-none rounded-lg border border-[#dfe3e8] bg-white px-3 pr-8 text-xs font-medium text-[#475467] outline-none"
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

function SelectField({
  options,
}: {
  options: string[];
}) {
  return (
    <div className="relative">
      <select className="h-10 w-full appearance-none rounded-lg border border-[#dfe3e8] bg-white px-3 pr-9 text-sm outline-none focus:border-[#98a2b3]">
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>

      <ChevronDown
        size={15}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#667085]"
      />
    </div>
  );
}

function ToolIcon({ tool }: { tool: string }) {
  if (tool === "Database") {
    return <Database size={16} />;
  }

  if (tool === "REST API") {
    return <Zap size={16} />;
  }

  if (tool === "Browser Automation") {
    return <Activity size={16} />;
  }

  if (tool === "Computer Use") {
    return <UserRound size={16} />;
  }

  if (tool === "Code Execution") {
    return <FileText size={16} />;
  }

  if (tool === "MCP") {
    return <KeyRound size={16} />;
  }

  if (tool === "Notification Service") {
    return <Users size={16} />;
  }

  return <ShieldCheck size={16} />;
}

function ApprovalBadge({
  approval,
}: {
  approval: ToolPolicy["approval"];
}) {
  const styles: Record<ToolPolicy["approval"], string> = {
    Automatic: "bg-[#eff8ff] text-[#175cd3]",
    "Human Approval": "bg-[#fff4e5] text-[#b54708]",
    "Not Required": "bg-[#f2f4f7] text-[#475467]",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${styles[approval]}`}
    >
      {approval}
    </span>
  );
}

function PolicyStatusBadge({
  status,
}: {
  status: PolicyStatus;
}) {
  const styles: Record<PolicyStatus, string> = {
    Active: "bg-[#ecfdf3] text-[#027a48]",
    Restricted: "bg-[#fff4e5] text-[#b54708]",
    Disabled: "bg-[#fef3f2] text-[#b42318]",
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
            <CheckCircle2
              size={13}
              className="text-[#12b76a]"
            />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function ArchitectureStep({
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
    <div className="p-5">
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

      <div className="mt-1 text-sm font-medium text-[#344054]">
        {value}
      </div>
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