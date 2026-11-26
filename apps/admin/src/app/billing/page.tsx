
"use client";

import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CreditCard,
  FileText,
  RefreshCw,
  Settings,
  Users,
  Database,
  BarChart3,
  TicketPercent,
  Building2,
  AlertTriangle,
  Gauge,
  ShieldCheck,
} from "lucide-react";

import BillingHeader from "../../components/billing/BillingHeader";
import BillingOverviewCards from "../../components/billing/BillingOverviewCards";
import RevenueChart from "../../components/billing/RevenueChart";

const billingSections = [
  {
    title: "Analytics",
    description: "Analyze revenue trends, growth, and billing performance.",
    href: "/billing/analytics",
    icon: BarChart3,
    category: "Reports",
  },
  {
    title: "Credits & Usage",
    description: "Monitor credit balances, allocation, and usage limits.",
    href: "/billing/credits",
    icon: Gauge,
    category: "Usage",
  },
  {
    title: "Discounts & Coupons",
    description: "Manage promotional codes, discounts, and eligibility.",
    href: "/billing/discounts",
    icon: TicketPercent,
    category: "Products",
  },
  {
    title: "Enterprise Billing",
    description: "Manage enterprise accounts, contracts, and pricing.",
    href: "/billing/enterprise",
    icon: Building2,
    category: "Customers",
  },
  {
    title: "Failed Payments",
    description: "Review failed transactions and retry information.",
    href: "/billing/failed-payments",
    icon: AlertTriangle,
    category: "Transactions",
  },
  {
    title: "Invoices",
    description: "Review invoices, payment history, and outstanding balances.",
    href: "/billing/invoices",
    icon: FileText,
    category: "Transactions",
  },
  {
    title: "Payments",
    description: "Review transactions, payment methods, and statuses.",
    href: "/billing/payments",
    icon: CreditCard,
    category: "Transactions",
  },
  {
    title: "Plans & Pricing",
    description: "Manage subscription plans, prices, and billing intervals.",
    href: "/billing/plans",
    icon: FileText,
    category: "Products",
  },
  {
    title: "Refunds",
    description: "Review refund requests and their processing status.",
    href: "/billing/refunds",
    icon: RefreshCw,
    category: "Transactions",
  },
  {
    title: "Billing Settings",
    description: "Configure billing preferences and invoice settings.",
    href: "/billing/settings",
    icon: Settings,
    category: "Configuration",
  },
  {
    title: "Subscriptions",
    description: "Manage customer subscriptions, trials, and renewals.",
    href: "/billing/subscriptions",
    icon: Users,
    category: "Customers",
  },
];

const categoryStyles: Record<string, string> = {
  Customers: "bg-violet-50 text-violet-700 ring-violet-200",
  Transactions: "bg-blue-50 text-blue-700 ring-blue-200",
  Products: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Usage: "bg-amber-50 text-amber-700 ring-amber-200",
  Reports: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  Configuration: "bg-slate-100 text-slate-600 ring-slate-200",
};

export default function BillingOverviewPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen w-full space-y-8 bg-slate-50 p-4 text-slate-900 sm:p-6 lg:p-8">
      {/* Billing Header */}
      <BillingHeader
        title="Billing Overview"
        description="Manage subscriptions, payments, revenue, and billing operations across ModelNow."
      />

      {/* Financial Overview */}
      <section className="space-y-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              Financial Overview
            </h2>
            <ShieldCheck size={17} className="text-emerald-600" />
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Review revenue, payment performance, and subscription activity.
          </p>
        </div>

        <BillingOverviewCards />
      </section>

      {/* Revenue Analytics */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              Revenue Analytics
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Track revenue trends and monthly billing performance.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/billing/analytics")}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            View analytics
            <ArrowRight size={16} />
          </button>
        </div>

        <RevenueChart />
      </section>

      {/* Billing Management */}
      <section className="space-y-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              Billing Management
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Access and manage all ModelNow billing operations.
            </p>
          </div>

          <span className="w-fit rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
            {billingSections.length} management sections
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {billingSections.map((section) => {
            const Icon = section.icon;

            return (
              <button
                key={section.href}
                type="button"
                onClick={() => router.push(section.href)}
                className="group flex min-h-[164px] w-full items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition duration-200 group-hover:bg-blue-600 group-hover:text-white">
                  <Icon size={22} strokeWidth={1.8} />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-2">
                    <span className="font-semibold leading-5 text-slate-900">
                      {section.title}
                    </span>

                    <ArrowRight
                      size={17}
                      className="mt-0.5 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600"
                    />
                  </span>

                  <span
                    className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset ${
                      categoryStyles[section.category]
                    }`}
                  >
                    {section.category}
                  </span>

                  <span className="mt-3 block text-sm leading-6 text-slate-500">
                    {section.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Billing Data Information */}
      <footer className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 sm:p-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
          <Database size={19} />
        </span>

        <div>
          <p className="text-sm font-semibold text-slate-800">
            Billing data information
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            This overview currently displays illustrative frontend data.
            Connect the billing backend and payment provider to display
            verified live transactions and financial information.
          </p>
        </div>
      </footer>
    </main>
  );
}
