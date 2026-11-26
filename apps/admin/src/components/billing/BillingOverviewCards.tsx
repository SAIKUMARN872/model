
import {
  DollarSign,
  TrendingUp,
  Users,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  type LucideIcon,
} from "lucide-react";

type BillingMetric = {
  title: string;
  value: string;
  change: string;
  description: string;
  trend: "up" | "down" | "neutral";
  icon: LucideIcon;
  iconColor: string;
  iconBackground: string;
};

const metrics: BillingMetric[] = [
  {
    title: "Total Revenue",
    value: "$48,294",
    change: "+12.8%",
    description: "Compared with previous period",
    trend: "up",
    icon: DollarSign,
    iconColor: "text-emerald-600",
    iconBackground: "bg-emerald-50",
  },
  {
    title: "Monthly Recurring Revenue",
    value: "$32,840",
    change: "+8.2%",
    description: "Compared with previous month",
    trend: "up",
    icon: TrendingUp,
    iconColor: "text-blue-600",
    iconBackground: "bg-blue-50",
  },
  {
    title: "Active Subscriptions",
    value: "1,284",
    change: "+6.4%",
    description: "Compared with previous period",
    trend: "up",
    icon: Users,
    iconColor: "text-violet-600",
    iconBackground: "bg-violet-50",
  },
  {
    title: "Failed Payments",
    value: "23",
    change: "-3.1%",
    description: "Compared with previous period",
    trend: "down",
    icon: AlertTriangle,
    iconColor: "text-rose-600",
    iconBackground: "bg-rose-50",
  },
];

type BillingOverviewCardsProps = {
  items?: BillingMetric[];
};

export default function BillingOverviewCards({
  items = metrics,
}: BillingOverviewCardsProps) {
  return (
    <section
      aria-label="Billing overview metrics"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {items.map((metric) => {
        const Icon = metric.icon;
        const isPositive = metric.trend === "up";

        return (
          <article
            key={metric.title}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {metric.title}
                </p>
                <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                  {metric.value}
                </p>
              </div>

              <div className={`rounded-xl p-3 ${metric.iconBackground}`}>
                <Icon className={metric.iconColor} size={21} />
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${
                  metric.trend === "neutral"
                    ? "bg-slate-100 text-slate-600"
                    : isPositive
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-700"
                }`}
              >
                {metric.trend === "neutral" ? null : isPositive ? (
                  <ArrowUpRight size={14} />
                ) : (
                  <ArrowDownRight size={14} />
                )}
                {metric.change}
              </span>

              <span className="text-xs text-slate-500">
                {metric.description}
              </span>
            </div>
          </article>
        );
      })}
    </section>
  );
}
