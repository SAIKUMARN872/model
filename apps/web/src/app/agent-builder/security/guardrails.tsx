"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
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

type GuardrailStatus = "Active" | "Monitoring" | "Disabled";

type Guardrail = {
  id: string;
  name: string;
  description: string;
  category: string;
  scope: string;
  status: GuardrailStatus;
  blocks: number;
  warnings: number;
  lastTriggered: string;
};

const initialGuardrails: Guardrail[] = [
  {
    id: "GR-001",
    name: "PII Protection",
    description:
      "Detect and prevent sensitive personal information from being exposed.",
    category: "Data Protection",
    scope: "All applications",
    status: "Active",
    blocks: 128,
    warnings: 64,
    lastTriggered: "4 minutes ago",
  },
  {
    id: "GR-002",
    name: "Prompt Injection Defense",
    description:
      "Detect malicious instructions attempting to manipulate agent behavior.",
    category: "AI Security",
    scope: "Agents & workflows",
    status: "Active",
    blocks: 76,
    warnings: 31,
    lastTriggered: "11 minutes ago",
  },
  {
    id: "GR-003",
    name: "Toxic Content Filter",
    description:
      "Identify harmful, abusive, or unsafe generated content.",
    category: "Content Safety",
    scope: "All models",
    status: "Active",
    blocks: 52,
    warnings: 27,
    lastTriggered: "18 minutes ago",
  },
  {
    id: "GR-004",
    name: "Secret Detection",
    description:
      "Prevent API keys, tokens, credentials, and secrets from being exposed.",
    category: "Data Protection",
    scope: "Code & tools",
    status: "Active",
    blocks: 39,
    warnings: 18,
    lastTriggered: "32 minutes ago",
  },
  {
    id: "GR-005",
    name: "Tool Permission Guard",
    description:
      "Require approved permissions before agents can execute sensitive tools.",
    category: "Access Control",
    scope: "Agent tools",
    status: "Monitoring",
    blocks: 14,
    warnings: 21,
    lastTriggered: "1 hour ago",
  },
  {
    id: "GR-006",
    name: "Output Validation",
    description:
      "Validate structured AI output against configured schemas and policies.",
    category: "Quality",
    scope: "Production APIs",
    status: "Active",
    blocks: 22,
    warnings: 13,
    lastTriggered: "2 hours ago",
  },
];

const categories = [
  "All categories",
  "Data Protection",
  "AI Security",
  "Content Safety",
  "Access Control",
  "Quality",
];

const policyTemplates = [
  {
    title: "PII protection",
    description: "Protect names, emails, phone numbers, and other personal data.",
    icon: <UserRound size={17} />,
  },
  {
    title: "Prompt injection",
    description: "Protect agents from malicious or conflicting instructions.",
    icon: <ShieldCheck size={17} />,
  },
  {
    title: "Secret detection",
    description: "Detect credentials, API keys, and sensitive tokens.",
    icon: <Lock size={17} />,
  },
  {
    title: "Tool permissions",
    description: "Control which tools agents can execute.",
    icon: <Settings2 size={17} />,
  },
];

export default function GuardrailsPage() {
  const [guardrails, setGuardrails] =
    useState<Guardrail[]>(initialGuardrails);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All categories");
  const [status, setStatus] = useState("All statuses");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedGuardrail, setSelectedGuardrail] =
    useState<Guardrail | null>(null);

  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] =
    useState("Data Protection");

  const filteredGuardrails = useMemo(() => {
    const query = search.toLowerCase().trim();

    return guardrails.filter((item) => {
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query);

      const matchesCategory =
        category === "All categories" ||
        item.category === category;

      const matchesStatus =
        status === "All statuses" ||
        item.status === status;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [guardrails, search, category, status]);

  const activeCount = guardrails.filter(
    (item) => item.status === "Active"
  ).length;

  const totalBlocks = guardrails.reduce(
    (sum, item) => sum + item.blocks,
    0
  );

  const totalWarnings = guardrails.reduce(
    (sum, item) => sum + item.warnings,
    0
  );

  const totalRules = guardrails.length;

  const createGuardrail = () => {
    if (!newName.trim()) {
      return;
    }

    const item: Guardrail = {
      id: `GR-${String(guardrails.length + 1).padStart(3, "0")}`,
      name: newName.trim(),
      description:
        "Custom enterprise guardrail created from the security policy builder.",
      category: newCategory,
      scope: "Selected applications",
      status: "Active",
      blocks: 0,
      warnings: 0,
      lastTriggered: "Never",
    };

    setGuardrails((current) => [item, ...current]);
    setNewName("");
    setShowCreate(false);
  };

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#111827]">
      <header className="border-b border-[#e5e7eb] bg-white">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-8 py-5">
          <div className="flex items-center gap-4">
            <Link
              href="/agent-builder/security"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#64748b] hover:bg-[#f8fafc]"
            >
              <ArrowLeft size={17} />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck
                  size={20}
                  className="text-[#2563eb]"
                />

                <h1 className="text-[21px] font-semibold tracking-[-0.02em]">
                  Guardrails
                </h1>
              </div>

              <p className="mt-1 text-[13px] text-[#64748b]">
                Configure AI safety policies, runtime controls, and
                enterprise protection rules.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/agent-builder/security/audit-logs"
              className="flex h-9 items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-3 text-[11px] font-medium text-[#475569]"
            >
              <Activity size={14} />
              Audit logs
            </Link>

            <button
              onClick={() => setShowCreate(true)}
              className="flex h-9 items-center gap-2 rounded-lg bg-[#2563eb] px-3 text-[11px] font-medium text-white hover:bg-[#1d4ed8]"
            >
              <Plus size={14} />
              Create guardrail
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-8 py-7">
        <div className="grid grid-cols-4 gap-4">
          <MetricCard
            title="Active guardrails"
            value={activeCount.toString()}
            subtitle={`of ${totalRules} configured rules`}
            icon={<ShieldCheck size={18} />}
            tone="success"
          />

          <MetricCard
            title="Blocked requests"
            value={totalBlocks.toString()}
            subtitle="Policy violations prevented"
            icon={<XCircle size={18} />}
            tone="danger"
          />

          <MetricCard
            title="Warnings"
            value={totalWarnings.toString()}
            subtitle="Requests requiring attention"
            icon={<AlertTriangle size={18} />}
            tone="warning"
          />

          <MetricCard
            title="Protected workloads"
            value="24"
            subtitle="Applications and agents"
            icon={<Zap size={18} />}
          />
        </div>

        <div className="mt-5 grid grid-cols-[minmax(0,1fr)_350px] gap-5">
          <section className="rounded-xl border border-[#e5e7eb] bg-white">
            <div className="border-b border-[#e5e7eb] px-5 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-[15px] font-semibold">
                    Guardrail policies
                  </h2>

                  <p className="mt-1 text-[11px] text-[#94a3b8]">
                    Runtime policies applied across your AI workloads.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]"
                    />

                    <input
                      value={search}
                      onChange={(event) =>
                        setSearch(event.target.value)
                      }
                      placeholder="Search guardrails..."
                      className="h-9 w-[190px] rounded-lg border border-[#e5e7eb] bg-[#fafafa] pl-8 pr-3 text-[10px] outline-none focus:border-[#93c5fd]"
                    />
                  </div>

                  <FilterSelect
                    value={category}
                    onChange={setCategory}
                    options={categories}
                  />

                  <FilterSelect
                    value={status}
                    onChange={setStatus}
                    options={[
                      "All statuses",
                      "Active",
                      "Monitoring",
                      "Disabled",
                    ]}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-[minmax(0,1.4fr)_135px_125px_95px_95px_105px] gap-3 bg-[#fafafa] px-5 py-3 text-[9px] font-semibold uppercase tracking-wide text-[#94a3b8]">
              <span>Guardrail</span>
              <span>Category</span>
              <span>Scope</span>
              <span>Status</span>
              <span>Blocks</span>
              <span>Last triggered</span>
            </div>

            <div className="divide-y divide-[#f1f5f9]">
              {filteredGuardrails.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedGuardrail(item)}
                  className="grid w-full grid-cols-[minmax(0,1.4fr)_135px_125px_95px_95px_105px] items-center gap-3 px-5 py-4 text-left transition hover:bg-[#fafcff]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#eff6ff] text-[#2563eb]">
                      <ShieldCheck size={15} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-semibold text-[#334155]">
                        {item.name}
                      </p>

                      <p className="mt-1 truncate text-[9px] text-[#94a3b8]">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <span className="text-[9px] text-[#64748b]">
                    {item.category}
                  </span>

                  <span className="text-[9px] text-[#64748b]">
                    {item.scope}
                  </span>

                  <GuardrailStatus status={item.status} />

                  <span className="text-[10px] font-semibold text-[#475569]">
                    {item.blocks}
                  </span>

                  <span className="text-[9px] text-[#94a3b8]">
                    {item.lastTriggered}
                  </span>
                </button>
              ))}

              {filteredGuardrails.length === 0 && (
                <div className="px-5 py-12 text-center">
                  <ShieldCheck
                    size={28}
                    className="mx-auto text-[#cbd5e1]"
                  />

                  <p className="mt-3 text-[12px] font-medium text-[#64748b]">
                    No guardrails found
                  </p>

                  <p className="mt-1 text-[10px] text-[#94a3b8]">
                    Try changing the search or filters.
                  </p>
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-5">
            <section className="rounded-xl border border-[#e5e7eb] bg-white">
              <div className="border-b border-[#e5e7eb] px-5 py-4">
                <h2 className="text-[14px] font-semibold">
                  Protection layers
                </h2>

                <p className="mt-1 text-[10px] text-[#94a3b8]">
                  Recommended enterprise safety controls.
                </p>
              </div>

              <div className="space-y-1 px-5 py-3">
                <ProtectionRow
                  icon={<Lock size={15} />}
                  title="Input protection"
                  description="Validate incoming prompts"
                  enabled
                />

                <ProtectionRow
                  icon={<ShieldCheck size={15} />}
                  title="Model protection"
                  description="Control model behavior"
                  enabled
                />

                <ProtectionRow
                  icon={<Database size={15} />}
                  title="Data protection"
                  description="Protect sensitive information"
                  enabled
                />

                <ProtectionRow
                  icon={<FileText size={15} />}
                  title="Output validation"
                  description="Validate generated responses"
                  enabled
                />

                <ProtectionRow
                  icon={<Settings2 size={15} />}
                  title="Tool protection"
                  description="Control agent actions"
                  enabled
                />
              </div>
            </section>

            <section className="rounded-xl border border-[#e5e7eb] bg-white">
              <div className="border-b border-[#e5e7eb] px-5 py-4">
                <h2 className="text-[14px] font-semibold">
                  Runtime health
                </h2>
              </div>

              <div className="space-y-4 p-5">
                <HealthRow
                  label="Policy engine"
                  value="Operational"
                  good
                />

                <HealthRow
                  label="Rule evaluation"
                  value="99.99%"
                  good
                />

                <HealthRow
                  label="Average evaluation"
                  value="18 ms"
                  good
                />

                <HealthRow
                  label="Policy sync"
                  value="Healthy"
                  good
                />
              </div>
            </section>
          </aside>
        </div>

        <section className="mt-5 rounded-xl border border-[#e5e7eb] bg-white">
          <div className="border-b border-[#e5e7eb] px-5 py-4">
            <h2 className="text-[15px] font-semibold">
              Guardrail templates
            </h2>

            <p className="mt-1 text-[11px] text-[#94a3b8]">
              Start with common enterprise AI safety policies.
            </p>
          </div>

          <div className="grid grid-cols-4 divide-x divide-[#e5e7eb]">
            {policyTemplates.map((template) => (
              <TemplateCard
                key={template.title}
                icon={template.icon}
                title={template.title}
                description={template.description}
                onUse={() => {
                  setNewName(template.title);
                  setNewCategory(
                    template.title === "Tool permissions"
                      ? "Access Control"
                      : template.title === "Prompt injection"
                        ? "AI Security"
                        : template.title === "Secret detection"
                          ? "Data Protection"
                          : "Data Protection"
                  );
                  setShowCreate(true);
                }}
              />
            ))}
          </div>
        </section>

        <div className="mt-5 grid grid-cols-3 gap-4">
          <InfoCard
            icon={<ShieldCheck size={17} />}
            title="Defense in depth"
            description="Combine input, model, tool, data, and output protections to create layered AI security."
          />

          <InfoCard
            icon={<Activity size={17} />}
            title="Runtime enforcement"
            description="Evaluate policies during execution and block unsafe operations before they reach production."
          />

          <InfoCard
            icon={<FileText size={17} />}
            title="Audit visibility"
            description="Track guardrail decisions, violations, warnings, and policy changes through audit logs."
          />
        </div>
      </div>

      {selectedGuardrail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-5">
          <div className="w-full max-w-[600px] rounded-xl border border-[#e5e7eb] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-4">
              <div>
                <p className="text-[9px] font-medium uppercase tracking-wide text-[#94a3b8]">
                  {selectedGuardrail.id}
                </p>

                <h2 className="mt-1 text-[16px] font-semibold">
                  {selectedGuardrail.name}
                </h2>
              </div>

              <button
                onClick={() => setSelectedGuardrail(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#64748b]"
              >
                <span className="text-[19px] leading-none">
                  ×
                </span>
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="rounded-lg border border-[#e5e7eb] bg-[#fafafa] p-4">
                <p className="text-[10px] leading-5 text-[#64748b]">
                  {selectedGuardrail.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <DetailCard
                  label="Category"
                  value={selectedGuardrail.category}
                />

                <DetailCard
                  label="Scope"
                  value={selectedGuardrail.scope}
                />

                <DetailCard
                  label="Blocked requests"
                  value={selectedGuardrail.blocks.toString()}
                />

                <DetailCard
                  label="Warnings"
                  value={selectedGuardrail.warnings.toString()}
                />
              </div>

              <div className="rounded-lg border border-[#dbeafe] bg-[#eff6ff] p-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck
                    size={15}
                    className="text-[#2563eb]"
                  />

                  <p className="text-[10px] font-semibold text-[#1e40af]">
                    Runtime enforcement enabled
                  </p>
                </div>

                <p className="mt-1 text-[9px] leading-4 text-[#3b82f6]">
                  This guardrail is evaluated during AI execution and can
                  block requests that violate its configured policy.
                </p>
              </div>
            </div>

            <div className="flex justify-end border-t border-[#e5e7eb] px-5 py-4">
              <button
                onClick={() => setSelectedGuardrail(null)}
                className="h-9 rounded-lg bg-[#2563eb] px-4 text-[11px] font-medium text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-5">
          <div className="w-full max-w-[500px] rounded-xl border border-[#e5e7eb] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-4">
              <div>
                <p className="text-[9px] font-medium uppercase tracking-wide text-[#94a3b8]">
                  Security policy
                </p>

                <h2 className="mt-1 text-[16px] font-semibold">
                  Create guardrail
                </h2>
              </div>

              <button
                onClick={() => setShowCreate(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#64748b]"
              >
                <span className="text-[19px] leading-none">
                  ×
                </span>
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <label className="mb-1.5 block text-[10px] font-medium text-[#475569]">
                  Guardrail name
                </label>

                <input
                  value={newName}
                  onChange={(event) =>
                    setNewName(event.target.value)
                  }
                  placeholder="Example: Customer Data Protection"
                  className="h-10 w-full rounded-lg border border-[#e5e7eb] px-3 text-[11px] outline-none focus:border-[#93c5fd]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-medium text-[#475569]">
                  Category
                </label>

                <div className="relative">
                  <select
                    value={newCategory}
                    onChange={(event) =>
                      setNewCategory(event.target.value)
                    }
                    className="h-10 w-full appearance-none rounded-lg border border-[#e5e7eb] bg-white px-3 pr-8 text-[11px] outline-none"
                  >
                    {categories
                      .filter(
                        (item) => item !== "All categories"
                      )
                      .map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                  </select>

                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8]"
                  />
                </div>
              </div>

              <div className="rounded-lg border border-[#e5e7eb] bg-[#fafafa] p-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck
                    size={15}
                    className="text-[#2563eb]"
                  />

                  <p className="text-[10px] font-semibold text-[#334155]">
                    Default enforcement
                  </p>
                </div>

                <p className="mt-1 text-[9px] leading-4 text-[#94a3b8]">
                  New guardrails start in active mode and can be configured
                  further after creation.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-[#e5e7eb] px-5 py-4">
              <button
                onClick={() => setShowCreate(false)}
                className="h-9 rounded-lg border border-[#e5e7eb] px-4 text-[11px] font-medium text-[#475569]"
              >
                Cancel
              </button>

              <button
                onClick={createGuardrail}
                className="h-9 rounded-lg bg-[#2563eb] px-4 text-[11px] font-medium text-white hover:bg-[#1d4ed8]"
              >
                Create guardrail
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  tone = "default",
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: ReactNode;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  const styles = {
    default: "bg-[#eff6ff] text-[#2563eb]",
    success: "bg-[#f0fdf4] text-[#16a34a]",
    warning: "bg-[#fffbeb] text-[#d97706]",
    danger: "bg-[#fef2f2] text-[#dc2626]",
  };

  return (
    <div className="rounded-xl border border-[#e5e7eb] bg-white p-4">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-lg ${styles[tone]}`}
      >
        {icon}
      </div>

      <p className="mt-4 text-[11px] text-[#64748b]">
        {title}
      </p>

      <p className="mt-1 text-[24px] font-semibold tracking-[-0.03em]">
        {value}
      </p>

      <p className="mt-1 text-[10px] text-[#94a3b8]">
        {subtitle}
      </p>
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
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 appearance-none rounded-lg border border-[#e5e7eb] bg-white pl-3 pr-8 text-[10px] font-medium text-[#475569] outline-none"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>

      <ChevronDown
        size={13}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8]"
      />
    </div>
  );
}

function GuardrailStatus({
  status,
}: {
  status: GuardrailStatus;
}) {
  const styles = {
    Active: "bg-[#f0fdf4] text-[#15803d]",
    Monitoring: "bg-[#fffbeb] text-[#b45309]",
    Disabled: "bg-[#fef2f2] text-[#b91c1c]",
  };

  return (
    <span
      className={`inline-flex w-fit rounded-full px-2 py-1 text-[8px] font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function ProtectionRow({
  icon,
  title,
  description,
  enabled,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  enabled: boolean;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-[#f1f5f9] py-3 last:border-0">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f8fafc] text-[#64748b]">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold text-[#475569]">
          {title}
        </p>

        <p className="mt-0.5 text-[9px] text-[#94a3b8]">
          {description}
        </p>
      </div>

      <span
        className={`h-2 w-2 rounded-full ${
          enabled ? "bg-[#16a34a]" : "bg-[#cbd5e1]"
        }`}
      />
    </div>
  );
}

function HealthRow({
  label,
  value,
  good,
}: {
  label: string;
  value: string;
  good: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] text-[#64748b]">
        {label}
      </span>

      <span className="flex items-center gap-1.5 text-[9px] font-semibold text-[#15803d]">
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            good ? "bg-[#16a34a]" : "bg-[#dc2626]"
          }`}
        />

        {value}
      </span>
    </div>
  );
}

function TemplateCard({
  icon,
  title,
  description,
  onUse,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  onUse: () => void;
}) {
  return (
    <div className="p-5">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eff6ff] text-[#2563eb]">
        {icon}
      </div>

      <h3 className="mt-4 text-[12px] font-semibold text-[#334155]">
        {title}
      </h3>

      <p className="mt-1 min-h-[38px] text-[10px] leading-5 text-[#94a3b8]">
        {description}
      </p>

      <button
        onClick={onUse}
        className="mt-4 flex items-center gap-1.5 text-[10px] font-semibold text-[#2563eb]"
      >
        Use template
        <ArrowRight size={13} />
      </button>
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
    <div className="rounded-xl border border-[#e5e7eb] bg-white p-5">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f8fafc] text-[#64748b]">
        {icon}
      </div>

      <h3 className="mt-3 text-[12px] font-semibold text-[#334155]">
        {title}
      </h3>

      <p className="mt-1 text-[10px] leading-5 text-[#94a3b8]">
        {description}
      </p>
    </div>
  );
}

function DetailCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-[#e5e7eb] bg-[#fafafa] p-3">
      <p className="text-[9px] text-[#94a3b8]">{label}</p>

      <p className="mt-1 text-[11px] font-semibold text-[#475569]">
        {value}
      </p>
    </div>
  );
}