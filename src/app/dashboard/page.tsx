"use client";

import { useRouter } from "next/navigation";
import { useState, type ElementType } from "react";
import {
  Activity,
  BarChart3,
  ChevronRight,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

type DashboardSection =
  | "overview"
  | "observability"
  | "analytics"
  | "usage"
  | "evaluation"
  | "security-governance";

type NavItem = {
  label: string;
  icon: ElementType;
  section: DashboardSection;
  route: string;
};

const navItems: NavItem[] = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    section: "overview",
    route: "/dashboard",
  },
  {
    label: "Observability",
    icon: Activity,
    section: "observability",
    route: "/observability",
  },
  {
    label: "Analytics",
    icon: BarChart3,
    section: "analytics",
    route: "/analytics",
  },
  {
    label: "Usage",
    icon: Users,
    section: "usage",
    route: "/usage",
  },
  {
    label: "Evaluation",
    icon: Target,
    section: "evaluation",
    route: "/evaluation",
  },
  {
    label: "Security & Governance",
    icon: ShieldCheck,
    section: "security-governance",
    route: "/security-governance",
  },
];

const metrics = [
  {
    label: "Total requests",
    value: "2.48M",
    change: "+12.8%",
    description: "Requests processed this month",
  },
  {
    label: "Success rate",
    value: "99.42%",
    change: "+0.6%",
    description: "Successful AI requests",
  },
  {
    label: "Average latency",
    value: "428 ms",
    change: "-8.2%",
    description: "Average end-to-end response",
  },
  {
    label: "Estimated cost",
    value: "$4,286",
    change: "-6.4%",
    description: "Current billing period",
  },
];

const traffic = [
  { time: "08:00", requests: 1200 },
  { time: "10:00", requests: 1850 },
  { time: "12:00", requests: 2400 },
  { time: "14:00", requests: 2100 },
  { time: "16:00", requests: 2900 },
  { time: "18:00", requests: 2600 },
  { time: "20:00", requests: 1900 },
];

const modelRows = [
  {
    name: "GPT model",
    provider: "OpenAI",
    requests: "842K",
    latency: "420 ms",
    status: "Healthy",
  },
  {
    name: "Claude model",
    provider: "Anthropic",
    requests: "624K",
    latency: "390 ms",
    status: "Healthy",
  },
  {
    name: "Gemini model",
    provider: "Google",
    requests: "518K",
    latency: "340 ms",
    status: "Healthy",
  },
  {
    name: "Llama model",
    provider: "Open source",
    requests: "296K",
    latency: "280 ms",
    status: "Healthy",
  },
];

export default function DashboardPage() {
  const router = useRouter();

  const [activeSection, setActiveSection] =
    useState<DashboardSection>("overview");

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [timeRange, setTimeRange] = useState("Last 24 hours");

  function navigate(item: NavItem) {
    setMobileMenuOpen(false);
    setActiveSection(item.section);

    if (item.section !== "overview") {
      router.push(item.route);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white">
            <Sparkles size={18} />
          </div>

          <div>
            <h1 className="text-sm font-bold">ModelNow</h1>
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
              AI platform
            </p>
          </div>
        </div>

        <div className="border-b border-slate-100 p-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
            <p className="text-xs font-semibold">ModelNow Workspace</p>
            <p className="mt-1 text-[10px] text-slate-400">Production</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Monitoring
          </p>

          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const selected = activeSection === item.section;

              return (
                <button
                  key={item.section}
                  type="button"
                  onClick={() => navigate(item)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                    selected
                      ? "bg-slate-950 font-semibold text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  <Icon size={17} />
                  <span className="flex-1">{item.label}</span>
                  <ChevronRight size={14} />
                </button>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-slate-100 px-5 py-4">
          <p className="text-xs font-medium text-slate-500">
            ModelNow Workspace
          </p>
          <p className="mt-1 text-[10px] text-slate-400">
            AI infrastructure console
          </p>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-[270px]">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-lg border border-slate-200 p-2 lg:hidden"
              aria-label="Open navigation"
            >
              <span className="text-sm">☰</span>
            </button>

            <div>
              <p className="text-sm font-semibold">ModelNow Dashboard</p>
              <p className="text-xs text-slate-500">
                AI platform overview and operational metrics
              </p>
            </div>
          </div>

          <select
            aria-label="Select time range"
            value={timeRange}
            onChange={(event) => setTimeRange(event.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium outline-none focus:border-slate-400"
          >
            <option>Last 24 hours</option>
            <option>Last 7 days</option>
            <option>Last 30 days</option>
          </select>
        </header>
                <section className="space-y-6 p-4 sm:p-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-medium text-slate-500">
                Workspace / Overview
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight">
                Overview
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Monitor your AI platform performance at a glance.
              </p>
            </div>

            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              All systems operational
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <article
                key={metric.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-slate-500">
                    {metric.label}
                  </p>
                  <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                    {metric.change}
                  </span>
                </div>

                <p className="mt-4 text-3xl font-bold tracking-tight">
                  {metric.value}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  {metric.description}
                </p>
              </article>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">Request traffic</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Requests processed over the selected period
                  </p>
                </div>

                <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                  {timeRange}
                </span>
              </div>

              <div className="mt-6 flex h-56 items-end gap-3 border-b border-slate-100 pb-2 sm:gap-5">
                {traffic.map((point) => (
                  <div
                    key={point.time}
                    className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                  >
                    <div className="flex h-full w-full items-end">
                      <div
                        title={`${point.requests.toLocaleString()} requests`}
                        className="w-full rounded-t-md bg-slate-800 transition-colors hover:bg-blue-600"
                        style={{
                          height: `${(point.requests / 3000) * 100}%`,
                        }}
                      />
                    </div>

                    <span className="text-[10px] text-slate-500">
                      {point.time}
                    </span>
                  </div>
                ))}
              </div>

              <p className="mt-3 text-xs text-slate-500">
                Sample dashboard data. Connect your backend metrics to display
                live traffic.
              </p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold">Platform health</h3>
              <p className="mt-1 text-xs text-slate-500">
                Service status overview
              </p>

              <div className="mt-5 space-y-4">
                {[
                  "AI Gateway",
                  "Agent Service",
                  "Knowledge Service",
                  "Browser Service",
                  "Multimodal Service",
                ].map((service) => (
                  <div
                    key={service}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className="text-sm text-slate-700">
                      {service}
                    </span>

                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Healthy
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-xl bg-slate-50 p-3">
                <p className="text-xs font-medium text-slate-600">
                  Health monitoring
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  These are sample statuses, not verified live health checks.
                </p>
              </div>
            </article>
          </div>

          <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5">
              <h3 className="font-semibold">Model performance</h3>
              <p className="mt-1 text-xs text-slate-500">
                Request volume and latency by model
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">Model</th>
                    <th className="px-5 py-3 font-medium">Provider</th>
                    <th className="px-5 py-3 font-medium">Requests</th>
                    <th className="px-5 py-3 font-medium">Latency</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {modelRows.map((model) => (
                    <tr key={model.name}>
                      <td className="px-5 py-4 font-medium">
                        {model.name}
                      </td>
                      <td className="px-5 py-4 text-slate-500">
                        {model.provider}
                      </td>
                      <td className="px-5 py-4">{model.requests}</td>
                      <td className="px-5 py-4">{model.latency}</td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                          {model.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}