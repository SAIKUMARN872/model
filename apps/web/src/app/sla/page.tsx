"use client";

import {
  Activity,
  BarChart3,
  CheckCircle2,
  Clock3,
  FileText,
  Gauge,
  Settings,
  ShieldCheck,
} from "lucide-react";

const slaStats = [
  {
    label: "Overall Uptime",
    value: "99.95%",
    icon: Activity,
  },
  {
    label: "Average Latency",
    value: "182 ms",
    icon: Gauge,
  },
  {
    label: "Active Agreements",
    value: "12",
    icon: FileText,
  },
  {
    label: "Compliance",
    value: "98.7%",
    icon: ShieldCheck,
  },
];

const slaSections = [
  {
    title: "Overview",
    description:
      "View current SLA performance, availability, and service commitments.",
    href: "/sla/overview",
    icon: BarChart3,
  },
  {
    title: "Availability",
    description:
      "Monitor service availability and uptime against SLA targets.",
    href: "/sla/availability",
    icon: Activity,
  },
  {
    title: "Latency",
    description:
      "Review response-time performance and latency measurements.",
    href: "/sla/latency",
    icon: Gauge,
  },
  {
    title: "Maintenance",
    description:
      "Review planned maintenance windows and service impact.",
    href: "/sla/maintenance",
    icon: Clock3,
  },
  {
    title: "Reports",
    description:
      "View SLA reports and historical service performance.",
    href: "/sla/reports",
    icon: BarChart3,
  },
  {
    title: "Settings",
    description:
      "Configure SLA monitoring and agreement preferences.",
    href: "/sla/settings",
    icon: Settings,
  },
];

export default function SLAPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                <ShieldCheck size={14} />
                Service Level Management
              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                SLA Management
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Monitor service-level performance, availability,
                latency, agreements, and compliance from one place.
              </p>
            </div>

            <a
              href="/sla/settings"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Settings size={16} />
              SLA Settings
            </a>
          </div>
        </section>

        {/* Stats */}
        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {slaStats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <Icon size={18} />
                  </div>

                  <CheckCircle2
                    size={16}
                    className="text-emerald-500"
                  />
                </div>

                <p className="mt-4 text-xs font-medium text-slate-500">
                  {stat.label}
                </p>

                <p className="mt-1 text-2xl font-bold tracking-tight">
                  {stat.value}
                </p>
              </div>
            );
          })}
        </section>

        {/* Management sections */}
        <section className="mt-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">
              SLA Management
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Open a section to review or manage its SLA information.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {slaSections.map((section) => {
              const Icon = section.icon;

              return (
                <a
                  key={section.href}
                  href={section.href}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition group-hover:bg-blue-50 group-hover:text-blue-600">
                      <Icon size={19} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-slate-900">
                        {section.title}
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {section.description}
                      </p>

                      <span className="mt-3 inline-block text-xs font-semibold text-blue-600">
                        Open section →
                      </span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}