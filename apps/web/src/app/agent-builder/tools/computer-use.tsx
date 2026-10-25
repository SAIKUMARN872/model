"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Copy,
  Database,
  Monitor,
  MousePointer2,
  Play,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Terminal,
  UserRound,
  Users,
  XCircle,
  Zap,
} from "lucide-react";

type SessionStatus = "Completed" | "Running" | "Failed" | "Queued";

type ComputerSession = {
  id: string;
  name: string;
  application: string;
  status: SessionStatus;
  duration: string;
  startedAt: string;
  triggeredBy: string;
  actions: number;
  result: string;
};

const sessions: ComputerSession[] = [
  {
    id: "cu-001",
    name: "CRM customer update",
    application: "CRM Desktop",
    status: "Completed",
    duration: "42.8s",
    startedAt: "3 min ago",
    triggeredBy: "Customer Support Agent",
    actions: 18,
    result: "Customer record updated successfully.",
  },
  {
    id: "cu-002",
    name: "Invoice processing",
    application: "Finance Desktop",
    status: "Completed",
    duration: "1m 18s",
    startedAt: "11 min ago",
    triggeredBy: "Finance Agent",
    actions: 34,
    result: "Invoice processed and saved.",
  },
  {
    id: "cu-003",
    name: "Spreadsheet analysis",
    application: "Excel",
    status: "Running",
    duration: "36.4s",
    startedAt: "Running now",
    triggeredBy: "Analytics Agent",
    actions: 27,
    result: "Analyzing spreadsheet data...",
  },
  {
    id: "cu-004",
    name: "Desktop report export",
    application: "Reporting App",
    status: "Failed",
    duration: "19.2s",
    startedAt: "24 min ago",
    triggeredBy: "Reporting Agent",
    actions: 11,
    result: "Failed: export dialog could not be completed.",
  },
  {
    id: "cu-005",
    name: "Data entry workflow",
    application: "Operations App",
    status: "Queued",
    duration: "-",
    startedAt: "Waiting",
    triggeredBy: "Operations Agent",
    actions: 0,
    result: "Waiting for execution slot.",
  },
];

const capabilities = [
  {
    title: "Mouse Control",
    description: "Move, click, double-click, drag, and interact with desktop elements.",
    icon: <MousePointer2 size={19} />,
  },
  {
    title: "Keyboard Control",
    description: "Type text, use keyboard shortcuts, and interact with desktop forms.",
    icon: <Terminal size={19} />,
  },
  {
    title: "Screen Understanding",
    description: "Analyze screenshots and identify buttons, fields, dialogs, and UI elements.",
    icon: <Monitor size={19} />,
  },
  {
    title: "Application Control",
    description: "Open, switch, and interact with approved desktop applications.",
    icon: <Database size={19} />,
  },
];

export default function ComputerUsePage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [selectedSession, setSelectedSession] =
    useState<ComputerSession | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "Sessions" | "Capabilities" | "Security"
  >("Sessions");

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const matchesSearch =
        session.name.toLowerCase().includes(search.toLowerCase()) ||
        session.application.toLowerCase().includes(search.toLowerCase()) ||
        session.triggeredBy.toLowerCase().includes(search.toLowerCase()) ||
        session.result.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        status === "All" || session.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [search, status]);

  const completed = sessions.filter(
    (session) => session.status === "Completed"
  ).length;

  const failed = sessions.filter(
    (session) => session.status === "Failed"
  ).length;

  const running = sessions.filter(
    (session) => session.status === "Running"
  ).length;

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#17181c]">
      <div className="mx-auto max-w-[1500px] px-6 py-7">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <Link
              href="/computer-use"
              className="mb-3 inline-flex items-center gap-2 text-sm text-[#69707d] hover:text-[#17181c]"
            >
              <ArrowLeft size={16} />
              Computer Use
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#17181c] text-white">
                <Monitor size={21} />
              </div>

              <div>
                <h1 className="text-[28px] font-semibold tracking-[-0.03em]">
                  Computer Use
                </h1>

                <p className="mt-1 text-sm text-[#69707d]">
                  Let AI agents interact with desktop applications through
                  controlled computer sessions.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#17181c] px-4 py-2.5 text-sm font-medium text-white hover:bg-black"
          >
            <Plus size={17} />
            New Session
          </button>
        </div>

        <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <MetricCard
            icon={<Monitor size={18} />}
            label="Total Sessions"
            value="3,842"
          />

          <MetricCard
            icon={<CheckCircle2 size={18} />}
            label="Completed"
            value="3,624"
          />

          <MetricCard
            icon={<Activity size={18} />}
            label="Running"
            value="12"
          />

          <MetricCard
            icon={<Clock3 size={18} />}
            label="Avg Session"
            value="48.6s"
          />
        </section>

        <section className="mb-6 flex gap-1 rounded-xl border border-[#e5e7eb] bg-white p-1">
          {(["Sessions", "Capabilities", "Security"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeTab === tab
                  ? "bg-[#17181c] text-white"
                  : "text-[#68707b] hover:bg-[#f4f5f6]"
              }`}
            >
              {tab}
            </button>
          ))}
        </section>

        {activeTab === "Sessions" && (
          <>
            <section className="mb-5 rounded-2xl border border-[#e5e7eb] bg-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a909b]"
                  />

                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search computer-use sessions..."
                    className="h-10 w-full rounded-xl border border-[#e2e5e9] bg-[#fafbfc] pl-10 pr-4 text-sm outline-none focus:border-[#a9afb8]"
                  />
                </div>

                <FilterSelect
                  value={status}
                  onChange={setStatus}
                  options={[
                    "All",
                    "Completed",
                    "Running",
                    "Failed",
                    "Queued",
                  ]}
                />
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white">
              <div className="flex items-center justify-between border-b border-[#edf0f2] px-5 py-4">
                <div>
                  <h2 className="text-sm font-semibold">
                    Recent computer sessions
                  </h2>

                  <p className="mt-1 text-xs text-[#7c838e]">
                    Desktop automation activity across connected agents.
                  </p>
                </div>

                <button className="inline-flex items-center gap-2 rounded-lg border border-[#e0e3e7] px-3 py-2 text-xs font-medium">
                  <RefreshCw size={14} />
                  Refresh
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px]">
                  <thead>
                    <tr className="border-b border-[#edf0f2] text-left">
                      <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wide text-[#858c96]">
                        Session
                      </th>

                      <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wide text-[#858c96]">
                        Application
                      </th>

                      <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wide text-[#858c96]">
                        Status
                      </th>

                      <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wide text-[#858c96]">
                        Actions
                      </th>

                      <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wide text-[#858c96]">
                        Duration
                      </th>

                      <th className="px-5 py-3 text-[11px] font-medium uppercase tracking-wide text-[#858c96]">
                        Triggered by
                      </th>

                      <th className="px-5 py-3" />
                    </tr>
                  </thead>

                  <tbody>
                    {filteredSessions.map((session) => (
                      <tr
                        key={session.id}
                        className="border-b border-[#f0f1f3] last:border-b-0 hover:bg-[#fafbfc]"
                      >
                        <td className="px-5 py-4">
                          <button
                            onClick={() => setSelectedSession(session)}
                            className="text-left"
                          >
                            <p className="text-sm font-medium hover:underline">
                              {session.name}
                            </p>

                            <p className="mt-1 text-xs text-[#858c96]">
                              {session.id}
                            </p>
                          </button>
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-lg bg-[#f1f3f5] px-2.5 py-1 text-xs font-medium">
                            {session.application}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge status={session.status} />
                        </td>

                        <td className="px-5 py-4 text-sm text-[#5e6570]">
                          {session.actions}
                        </td>

                        <td className="px-5 py-4 text-sm text-[#5e6570]">
                          {session.duration}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm text-[#5e6570]">
                            <UserRound size={15} />
                            {session.triggeredBy}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <button
                            onClick={() => setSelectedSession(session)}
                            className="rounded-lg border border-[#e0e3e7] px-3 py-1.5 text-xs font-medium hover:bg-[#f4f5f6]"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <InfoCard
                icon={<ShieldCheck size={18} />}
                title="Controlled access"
                description="Agents can only interact with approved applications and actions."
              />

              <InfoCard
                icon={<Activity size={18} />}
                title="Full observability"
                description="Track screenshots, actions, duration, failures, and execution traces."
              />

              <InfoCard
                icon={<Zap size={18} />}
                title="Agent ready"
                description="Computer Use can be connected directly to Agent Builder workflows."
              />
            </section>
          </>
        )}

        {activeTab === "Capabilities" && (
          <CapabilitiesPanel />
        )}

        {activeTab === "Security" && (
          <SecurityPanel />
        )}
      </div>

      {selectedSession && (
        <SessionModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}

      {showCreate && (
        <CreateSessionModal
          onClose={() => setShowCreate(false)}
        />
      )}
    </main>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f1f3f5] text-[#4f5661]">
          {icon}
        </div>

        <Activity size={15} className="text-[#b0b5bd]" />
      </div>

      <p className="text-xs text-[#777e89]">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div className="relative min-w-[170px]">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full appearance-none rounded-xl border border-[#e2e5e9] bg-[#fafbfc] px-3 pr-9 text-sm outline-none"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>

      <ChevronDown
        size={15}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7b818c]"
      />
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: SessionStatus;
}) {
  const config = {
    Completed: {
      icon: <CheckCircle2 size={13} />,
      className: "bg-[#ecfdf3] text-[#15803d]",
    },
    Running: {
      icon: <RefreshCw size={13} />,
      className: "bg-[#eff6ff] text-[#2563eb]",
    },
    Failed: {
      icon: <XCircle size={13} />,
      className: "bg-[#fef2f2] text-[#dc2626]",
    },
    Queued: {
      icon: <Clock3 size={13} />,
      className: "bg-[#f3f4f6] text-[#6b7280]",
    },
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${config[status].className}`}
    >
      {config[status].icon}
      {status}
    </span>
  );
}

function CapabilitiesPanel() {
  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-[#e5e7eb] bg-white p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f1f3f5]">
            <Monitor size={21} />
          </div>

          <div>
            <h2 className="text-base font-semibold">
              Computer interaction capabilities
            </h2>

            <p className="mt-1 max-w-3xl text-sm leading-6 text-[#707782]">
              Give AI agents controlled access to desktop interfaces,
              applications, keyboard, mouse, and visual screen understanding.
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {capabilities.map((capability) => (
          <div
            key={capability.title}
            className="rounded-2xl border border-[#e5e7eb] bg-white p-5"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f1f3f5] text-[#4f5661]">
                {capability.icon}
              </div>

              <div>
                <h3 className="text-sm font-semibold">
                  {capability.title}
                </h3>

                <p className="mt-1 text-xs leading-5 text-[#747b86]">
                  {capability.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-[#e5e7eb] bg-white p-6">
        <h2 className="text-sm font-semibold">Supported interaction flow</h2>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-5">
          {[
            "Observe screen",
            "Understand target",
            "Plan action",
            "Perform action",
            "Verify result",
          ].map((step, index) => (
            <div
              key={step}
              className="rounded-xl bg-[#f8f9fa] p-4"
            >
              <p className="text-[11px] text-[#858c96]">
                Step {index + 1}
              </p>

              <p className="mt-1 text-sm font-medium">{step}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SecurityPanel() {
  const policies = [
    {
      title: "Application allowlist",
      description:
        "Agents can only access applications approved for the workspace.",
    },
    {
      title: "Action permissions",
      description:
        "Mouse and keyboard actions can be restricted by policy.",
    },
    {
      title: "Sensitive data protection",
      description:
        "Screenshots and extracted information can be protected by data policies.",
    },
    {
      title: "Human approval",
      description:
        "High-impact computer actions can require human confirmation.",
    },
  ];

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-[#e5e7eb] bg-white p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ecfdf3] text-[#15803d]">
            <ShieldCheck size={22} />
          </div>

          <div>
            <h2 className="text-base font-semibold">
              Computer Use security
            </h2>

            <p className="mt-1 max-w-3xl text-sm leading-6 text-[#707782]">
              Computer sessions should operate with explicit application,
              action, data, and human-approval policies.
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {policies.map((policy) => (
          <div
            key={policy.title}
            className="rounded-2xl border border-[#e5e7eb] bg-white p-5"
          >
            <div className="flex gap-3">
              <CheckCircle2
                size={18}
                className="mt-0.5 text-[#15803d]"
              />

              <div>
                <h3 className="text-sm font-semibold">
                  {policy.title}
                </h3>

                <p className="mt-1 text-xs leading-5 text-[#777e89]">
                  {policy.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </section>

      <div className="rounded-2xl border border-[#fed7aa] bg-[#fff7ed] p-5">
        <div className="flex gap-3">
          <AlertTriangle
            size={19}
            className="mt-0.5 text-[#c2410c]"
          />

          <div>
            <p className="text-sm font-semibold text-[#9a3412]">
              High-impact actions
            </p>

            <p className="mt-1 text-xs leading-5 text-[#9a3412]">
              Actions such as sending messages, submitting transactions, or
              changing important records should use explicit approval policies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SessionModal({
  session,
  onClose,
}: {
  session: ComputerSession;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-5">
      <div className="w-full max-w-[760px] rounded-2xl border border-[#e5e7eb] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#edf0f2] px-6 py-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">{session.name}</h2>
              <StatusBadge status={session.status} />
            </div>

            <p className="mt-1 text-xs text-[#7b818c]">
              {session.id} · {session.application}
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#717781] hover:bg-[#f1f3f5]"
          >
            <span className="text-[20px] leading-none">×</span>
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <SmallMetric
              label="Application"
              value={session.application}
            />

            <SmallMetric
              label="Actions"
              value={String(session.actions)}
            />

            <SmallMetric
              label="Duration"
              value={session.duration}
            />

            <SmallMetric
              label="Triggered by"
              value={session.triggeredBy}
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-[#616873]">
              Session result
            </p>

            <div className="rounded-xl bg-[#15171a] p-4 text-xs leading-6 text-[#d8dce2]">
              {session.result}
            </div>
          </div>

          <div className="rounded-xl border border-[#e5e7eb] p-4">
            <div className="flex items-center gap-3">
              <Activity size={17} />

              <div>
                <p className="text-sm font-medium">
                  Computer-use trace
                </p>

                <p className="mt-1 text-xs text-[#7b818c]">
                  Inspect screenshots, mouse actions, keyboard actions,
                  decisions, and verification steps.
                </p>
              </div>

              <Link
                href="/agent-builder/observability/execution-traces"
                className="ml-auto text-xs font-medium underline"
              >
                View trace
              </Link>
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-[#edf0f2] px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl bg-[#17181c] px-4 py-2 text-sm font-medium text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function SmallMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-[#f8f9fa] p-3">
      <p className="text-[11px] text-[#858c96]">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold">{value}</p>
    </div>
  );
}

function CreateSessionModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [application, setApplication] = useState("");
  const [approval, setApproval] = useState("Required for sensitive actions");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-5">
      <div className="w-full max-w-[620px] rounded-2xl border border-[#e5e7eb] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#edf0f2] px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold">
              New Computer Session
            </h2>

            <p className="mt-1 text-xs text-[#7b818c]">
              Configure a controlled desktop automation session.
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#717781] hover:bg-[#f1f3f5]"
          >
            <span className="text-[20px] leading-none">×</span>
          </button>
        </div>

        <div className="space-y-4 p-6">
          <Field
            label="Session name"
            value={name}
            onChange={setName}
            placeholder="Example: Process customer invoice"
          />

          <Field
            label="Application"
            value={application}
            onChange={setApplication}
            placeholder="Example: Finance Desktop"
          />

          <div>
            <label className="text-xs font-medium text-[#616873]">
              Approval policy
            </label>

            <select
              value={approval}
              onChange={(event) => setApproval(event.target.value)}
              className="mt-2 h-10 w-full rounded-xl border border-[#e1e4e8] bg-white px-3 text-sm outline-none"
            >
              <option>Required for sensitive actions</option>
              <option>Required for every action</option>
              <option>Automatic execution</option>
            </select>
          </div>

          <div className="rounded-xl bg-[#f7f8fa] p-4">
            <div className="flex gap-3">
              <ShieldCheck
                size={18}
                className="mt-0.5 text-[#4f5661]"
              />

              <div>
                <p className="text-sm font-medium">
                  Secure computer session
                </p>

                <p className="mt-1 text-xs leading-5 text-[#777e89]">
                  The session will use application permissions, action
                  policies, audit logging, and human approval controls.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-[#edf0f2] px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-[#dfe3e7] px-4 py-2 text-sm"
          >
            Cancel
          </button>

          <button
            onClick={onClose}
            className="rounded-xl bg-[#17181c] px-4 py-2 text-sm font-medium text-white"
          >
            Create Session
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-[#616873]">
        {label}
      </label>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 h-10 w-full rounded-xl border border-[#e1e4e8] px-3 text-sm outline-none focus:border-[#9ca3af]"
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
    <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#f1f3f5] text-[#4d545e]">
        {icon}
      </div>

      <h3 className="text-sm font-semibold">{title}</h3>

      <p className="mt-1 text-xs leading-5 text-[#747b86]">
        {description}
      </p>
    </div>
  );
}