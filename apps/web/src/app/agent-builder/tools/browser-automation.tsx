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
  Code,
  Database,
  Globe2,
  MousePointer2,
  Play,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Terminal,
  UserRound,
  XCircle,
  Zap,
} from "lucide-react";

type ToolStatus = "Connected" | "Needs setup" | "Disabled";

type BrowserTool = {
  id: string;
  name: string;
  description: string;
  category: string;
  status: ToolStatus;
  icon: ReactNode;
  usage: string;
  actions: string[];
};

const tools: BrowserTool[] = [
  {
    id: "browser-session",
    name: "Browser Session",
    description:
      "Launch and manage isolated browser sessions for AI agents and automated tasks.",
    category: "Browser",
    status: "Connected",
    icon: <Globe2 size={19} />,
    usage: "2,481 sessions",
    actions: ["Create session", "Close session", "Get session state"],
  },
  {
    id: "navigate",
    name: "Navigate",
    description:
      "Open URLs and move an agent through websites using controlled browser navigation.",
    category: "Navigation",
    status: "Connected",
    icon: <ArrowRight size={19} />,
    usage: "8,942 runs",
    actions: ["Open URL", "Back", "Forward", "Reload"],
  },
  {
    id: "click",
    name: "Click Element",
    description:
      "Find and click buttons, links, menus, cards, and other interactive page elements.",
    category: "Interaction",
    status: "Connected",
    icon: <MousePointer2 size={19} />,
    usage: "15,284 actions",
    actions: ["Click selector", "Click text", "Double click"],
  },
  {
    id: "extract",
    name: "Extract Data",
    description:
      "Extract structured information from websites and return normalized JSON data.",
    category: "Data",
    status: "Connected",
    icon: <Database size={19} />,
    usage: "5,821 runs",
    actions: ["Extract text", "Extract table", "Extract links"],
  },
  {
    id: "code-execution",
    name: "Browser Code",
    description:
      "Run controlled JavaScript inside a browser page for advanced automation workflows.",
    category: "Developer",
    status: "Needs setup",
    icon: <Code size={19} />,
    usage: "1,109 runs",
    actions: ["Run JavaScript", "Evaluate expression"],
  },
  {
    id: "terminal",
    name: "Automation Terminal",
    description:
      "Execute approved automation commands for browser workflows and environment tasks.",
    category: "Developer",
    status: "Disabled",
    icon: <Terminal size={19} />,
    usage: "0 runs",
    actions: ["Run command", "Read output"],
  },
];

const categories = ["All", "Browser", "Navigation", "Interaction", "Data", "Developer"];

export default function BrowserAutomationToolsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [selectedTool, setSelectedTool] = useState<BrowserTool | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchesSearch =
        tool.name.toLowerCase().includes(search.toLowerCase()) ||
        tool.description.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "All" || tool.category === category;

      const matchesStatus =
        status === "All" || tool.status === status;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [search, category, status]);

  const connected = tools.filter((tool) => tool.status === "Connected").length;
  const needsSetup = tools.filter((tool) => tool.status === "Needs setup").length;

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#17181c]">
      <div className="mx-auto max-w-[1500px] px-6 py-7">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <Link
              href="/browser-automation"
              className="mb-3 inline-flex items-center gap-2 text-sm text-[#69707d] hover:text-[#17181c]"
            >
              <ArrowLeft size={16} />
              Browser Automation
            </Link>

            <h1 className="text-[28px] font-semibold tracking-[-0.03em]">
              Browser Automation Tools
            </h1>

            <p className="mt-1 text-sm text-[#69707d]">
              Manage browser actions, data extraction, sessions, and automation
              capabilities.
            </p>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#17181c] px-4 py-2.5 text-sm font-medium text-white hover:bg-black"
          >
            <Plus size={17} />
            Create Tool
          </button>
        </div>

        <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <MetricCard
            icon={<Settings2 size={18} />}
            label="Total Tools"
            value={String(tools.length)}
          />

          <MetricCard
            icon={<CheckCircle2 size={18} />}
            label="Connected"
            value={String(connected)}
          />

          <MetricCard
            icon={<AlertTriangle size={18} />}
            label="Needs Setup"
            value={String(needsSetup)}
          />

          <MetricCard
            icon={<Activity size={18} />}
            label="Actions Today"
            value="4,892"
          />
        </section>

        <section className="mb-5 rounded-2xl border border-[#e5e7eb] bg-white p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a909b]"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search browser tools..."
                className="h-10 w-full rounded-xl border border-[#e2e5e9] bg-[#fafbfc] pl-10 pr-4 text-sm outline-none focus:border-[#a9afb8]"
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
              options={["All", "Connected", "Needs setup", "Disabled"]}
            />
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {filteredTools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              onOpen={() => setSelectedTool(tool)}
            />
          ))}
        </div>

        {filteredTools.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#d9dde3] bg-white py-16 text-center">
            <Search className="mx-auto mb-3 text-[#9aa1ad]" size={24} />
            <p className="text-sm font-medium">No tools found</p>
            <p className="mt-1 text-xs text-[#7b818c]">
              Try changing the search or filters.
            </p>
          </div>
        )}

        <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <InfoCard
            icon={<ShieldCheck size={18} />}
            title="Secure execution"
            description="Browser actions run inside controlled sessions with permission policies."
          />

          <InfoCard
            icon={<Zap size={18} />}
            title="Agent ready"
            description="Tools can be attached to Agent Builder workflows and autonomous agents."
          />

          <InfoCard
            icon={<RefreshCw size={18} />}
            title="Observable"
            description="Every automation action can be tracked through traces and runtime metrics."
          />
        </section>
      </div>

      {selectedTool && (
        <ToolDetailsModal
          tool={selectedTool}
          onClose={() => setSelectedTool(null)}
        />
      )}

      {showCreate && <CreateToolModal onClose={() => setShowCreate(false)} />}
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
        onChange={(e) => onChange(e.target.value)}
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

function ToolCard({
  tool,
  onOpen,
}: {
  tool: BrowserTool;
  onOpen: () => void;
}) {
  const statusStyles =
    tool.status === "Connected"
      ? "bg-[#ecfdf3] text-[#15803d]"
      : tool.status === "Needs setup"
        ? "bg-[#fff7ed] text-[#c2410c]"
        : "bg-[#f3f4f6] text-[#6b7280]";

  return (
    <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5 transition hover:border-[#cdd2d8] hover:shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f1f3f5] text-[#363b44]">
            {tool.icon}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[16px] font-semibold">{tool.name}</h2>

              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusStyles}`}
              >
                {tool.status}
              </span>
            </div>

            <p className="mt-1 text-sm leading-6 text-[#6f7682]">
              {tool.description}
            </p>
          </div>
        </div>

        <button
          onClick={onOpen}
          className="rounded-lg border border-[#e1e4e8] px-3 py-1.5 text-xs font-medium hover:bg-[#f7f8fa]"
        >
          Configure
        </button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-[#f8f9fa] p-3">
          <p className="text-[11px] text-[#8a909b]">Category</p>
          <p className="mt-1 text-sm font-medium">{tool.category}</p>
        </div>

        <div className="rounded-xl bg-[#f8f9fa] p-3">
          <p className="text-[11px] text-[#8a909b]">Usage</p>
          <p className="mt-1 text-sm font-medium">{tool.usage}</p>
        </div>
      </div>

      <div className="mt-4 border-t border-[#edf0f2] pt-4">
        <p className="mb-2 text-xs font-medium text-[#656c77]">
          Available actions
        </p>

        <div className="flex flex-wrap gap-2">
          {tool.actions.map((action) => (
            <span
              key={action}
              className="rounded-lg border border-[#e5e7eb] bg-white px-2.5 py-1 text-xs text-[#59606b]"
            >
              {action}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ToolDetailsModal({
  tool,
  onClose,
}: {
  tool: BrowserTool;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-5">
      <div className="w-full max-w-[620px] rounded-2xl border border-[#e5e7eb] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#edf0f2] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f1f3f5]">
              {tool.icon}
            </div>

            <div>
              <h2 className="text-lg font-semibold">{tool.name}</h2>
              <p className="text-xs text-[#7a818c]">{tool.category}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#717781] hover:bg-[#f1f3f5]"
          >
            <span className="text-[20px] leading-none">×</span>
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div>
            <label className="text-xs font-medium text-[#616873]">
              Tool description
            </label>

            <textarea
              defaultValue={tool.description}
              className="mt-2 min-h-[90px] w-full rounded-xl border border-[#e1e4e8] p-3 text-sm outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <ConfigRow label="Status" value={tool.status} />
            <ConfigRow label="Category" value={tool.category} />
            <ConfigRow label="Usage" value={tool.usage} />
            <ConfigRow label="Runtime" value="Browser sandbox" />
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-[#616873]">
              Permissions
            </p>

            <div className="space-y-2">
              {[
                "Allow page navigation",
                "Allow DOM interaction",
                "Allow data extraction",
                "Record execution trace",
              ].map((permission) => (
                <label
                  key={permission}
                  className="flex items-center gap-3 rounded-xl border border-[#edf0f2] p-3 text-sm"
                >
                  <input type="checkbox" defaultChecked />
                  {permission}
                </label>
              ))}
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

          <button className="rounded-xl bg-[#17181c] px-4 py-2 text-sm font-medium text-white">
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfigRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-[#f8f9fa] p-3">
      <p className="text-[11px] text-[#858c96]">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

function CreateToolModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [toolType, setToolType] = useState("Browser action");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-5">
      <div className="w-full max-w-[560px] rounded-2xl border border-[#e5e7eb] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#edf0f2] px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold">Create Browser Tool</h2>
            <p className="mt-1 text-xs text-[#7b818c]">
              Add a reusable browser automation capability.
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
            label="Tool name"
            value={name}
            onChange={setName}
            placeholder="Example: Search Product"
          />

          <div>
            <label className="text-xs font-medium text-[#616873]">
              Tool type
            </label>

            <select
              value={toolType}
              onChange={(e) => setToolType(e.target.value)}
              className="mt-2 h-10 w-full rounded-xl border border-[#e1e4e8] bg-white px-3 text-sm outline-none"
            >
              <option>Browser action</option>
              <option>Data extraction</option>
              <option>Navigation</option>
              <option>JavaScript execution</option>
              <option>Custom automation</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-[#616873]">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this tool should do..."
              className="mt-2 min-h-[100px] w-full rounded-xl border border-[#e1e4e8] p-3 text-sm outline-none"
            />
          </div>

          <div className="rounded-xl bg-[#f7f8fa] p-4">
            <div className="flex gap-3">
              <ShieldCheck size={18} className="mt-0.5 text-[#4f5661]" />

              <div>
                <p className="text-sm font-medium">Security policy</p>
                <p className="mt-1 text-xs leading-5 text-[#777e89]">
                  New browser tools will run through the platform permission
                  and trace system.
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
            Create Tool
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
      <label className="text-xs font-medium text-[#616873]">{label}</label>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
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

      <p className="mt-1 text-xs leading-5 text-[#747b86]">{description}</p>
    </div>
  );
} 