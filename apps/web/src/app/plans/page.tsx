
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Sparkles,
  Crown,
  Building2,
  Factory,
  Zap,
} from "lucide-react";

import PlanCard, {
  type PlanCardData,
} from "../../components/plans/PlanCard";

type BillingCycle = "monthly" | "yearly";
type Plan = PlanCardData;

const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    monthlyPrice: "₹0",
    yearlyPrice: "₹0",
    credits: "500",
    customer: "Consumers / new users",
    description: "Try ModelNow",
    icon: <Sparkles size={20} />,
    features: [
      "Basic AI chat",
      "Limited model access",
      "Basic RAG",
      "Basic multimodal",
      "Limited browser/agent usage",
      "500 credits",
    ],
  },
  {
    id: "plus",
    name: "Plus",
    monthlyPrice: "₹699/mo",
    yearlyPrice: "₹6,999/yr",
    credits: "2,000",
    customer: "Regular users / students",
    description: "Use ModelNow regularly",
    icon: <Zap size={20} />,
    features: [
      "More AI models",
      "Higher usage limits",
      "RAG + documents",
      "Multimodal AI",
      "Basic browser automation",
      "Basic agent workflows",
      "2,000 credits",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: "₹1,499/mo",
    yearlyPrice: "₹14,999/yr",
    credits: "5,000",
    customer: "Developers / professionals",
    description: "Build with ModelNow",
    icon: <Crown size={20} />,
    popular: true,
    features: [
      "Multiple AI models",
      "Advanced optimization",
      "Cost ↓ / latency ↓ / quality ↑",
      "Browser automation",
      "Computer Use",
      "Agents & workflows",
      "Advanced RAG",
      "API access",
      "Limited fine-tuning",
      "5,000 credits",
    ],
  },
  {
    id: "business",
    name: "Business",
    monthlyPrice: "₹4,999/mo",
    yearlyPrice: "₹49,999/yr",
    credits: "25,000",
    customer: "Teams / startups",
    description: "Run AI for a team",
    icon: <Building2 size={20} />,
    features: [
      "Everything in Pro",
      "25,000 credits",
      "Team workspace",
      "Company knowledge/RAG",
      "Advanced agents & workflows",
      "Browser + Computer Use",
      "Admin controls",
      "RBAC",
      "SSO",
      "Audit logs",
      "Usage/spend analytics",
      "API",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthlyPrice: "Custom",
    yearlyPrice: "Custom",
    credits: "Custom",
    customer: "Large organizations",
    description: "AI infrastructure for organizations",
    icon: <Factory size={20} />,
    features: [
      "Everything in Business",
      "Custom credits",
      "Private deployment",
      "Private/company models",
      "Custom fine-tuning",
      "Advanced security & governance",
      "Data residency/compliance options",
      "Dedicated infrastructure",
      "SLA + enterprise support",
    ],
  },
];

function ApplePayMark() {
  return (
    <span
      className="inline-flex items-center justify-center gap-2 text-black"
      aria-label="Apple Pay"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="28"
        height="28"
        fill="currentColor"
        className="block shrink-0"
        aria-hidden="true"
      >
        <path d="M16.7 12.8c0-2.1 1.7-3.1 1.8-3.2-1-1.5-2.6-1.7-3.2-1.7-1.4-.1-2.7.8-3.4.8-.7 0-1.7-.8-2.9-.8-1.5 0-2.9.9-3.7 2.2-1.6 2.7-.4 6.7 1.1 8.9.7 1.1 1.5 2.2 2.6 2.2 1 0 1.4-.7 2.7-.7 1.2 0 1.6.7 2.7.7 1.1 0 1.8-1 2.5-2.1.8-1.2 1.1-2.4 1.1-2.4s-2.3-.9-2.3-3.9ZM14.5 6.5c.6-.8 1-1.8.9-2.8-.9 0-2 .6-2.7 1.4-.6.7-1.1 1.8-1 2.7 1 .1 2.1-.5 2.8-1.3Z" />
      </svg>

      <span className="text-lg font-semibold">Pay</span>
    </span>
  );
}

export default function PlansPage() {
  const router = useRouter();

  const [billing, setBilling] =
    useState<BillingCycle>("monthly");

  const [expandedPlan, setExpandedPlan] =
    useState<string | null>(null);

  function getPrice(plan: Plan) {
    return billing === "monthly"
      ? plan.monthlyPrice
      : plan.yearlyPrice;
  }

  function selectPlan(plan: Plan) {
    const params = new URLSearchParams({
      plan: plan.id,
      billing,
    });

    router.push(`/plans/checkout?${params.toString()}`);
  }

  function toggleFeatures(id: string) {
    setExpandedPlan((current) =>
      current === id ? null : id
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7f8] text-[#202123]">
      <header className="sticky top-0 z-40 border-b border-[#e5e5e5] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/")}
              aria-label="Back to app"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#d9d9e3] hover:bg-[#f0f0f1]"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#202123] text-white">
              <Sparkles size={15} />
            </div>

            <span className="font-semibold">ModelNow</span>

            <span className="hidden text-[#8e8ea0] sm:inline">
              /
            </span>

            <span className="hidden text-sm text-[#565869] sm:inline">
              Pricing
            </span>
          </div>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-lg px-3 py-2 text-sm text-[#565869] hover:bg-[#f0f0f1]"
          >
            Back to app
          </button>
        </div>
      </header>

      <section className="border-b border-[#e5e5e5] bg-white">
        <div className="mx-auto max-w-4xl px-5 py-14 text-center sm:py-16">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#202123] text-white">
            <Sparkles size={21} />
          </div>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            ModelNow Pricing
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[#6e6e80] sm:text-base">
            Choose the ModelNow plan that fits the way you use AI.
            Start free and scale as your needs grow.
          </p>

          <div className="mt-8 inline-flex rounded-xl border border-[#d9d9e3] bg-[#f7f7f8] p-1">
            {(["monthly", "yearly"] as const).map((cycle) => (
              <button
                key={cycle}
                type="button"
                onClick={() => setBilling(cycle)}
                aria-pressed={billing === cycle}
                className={`rounded-lg px-5 py-2.5 text-sm font-medium transition ${
                  billing === cycle
                    ? "bg-[#202123] text-white shadow-sm"
                    : "text-[#6e6e80] hover:text-[#202123]"
                }`}
              >
                {cycle === "monthly" ? "Monthly" : "Yearly"}
              </button>
            ))}
          </div>

          <p className="mt-3 text-xs text-[#8e8ea0]">
            {billing === "monthly"
              ? "Billed monthly"
              : "Billed yearly"}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-5">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              billing={billing}
              expanded={expandedPlan === plan.id}
              onSelect={selectPlan}
              onToggleFeatures={toggleFeatures}
            />
          ))}
        </div>
      </section>

      <section className="border-t border-[#e5e5e5] bg-white">
        <div className="mx-auto max-w-[1200px] px-5 py-14 sm:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight">
              Compare ModelNow plans
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#6e6e80]">
              Explore the features included in each subscription.
            </p>
          </div>

          <div className="mt-10 divide-y divide-[#ececf1] rounded-xl border border-[#d9d9e3] bg-white">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="flex flex-col gap-5 p-6 md:flex-row md:items-start"
              >
                <div className="flex w-full shrink-0 items-center gap-3 md:w-56">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f0f0f1] text-[#565869]">
                    {plan.icon}
                  </div>

                  <div>
                    <h3 className="font-semibold">{plan.name}</h3>

                    <p className="text-xs text-[#8e8ea0]">
                      {plan.description}
                    </p>

                    <p className="mt-1 text-sm font-medium text-[#565869]">
                      {getPrice(plan)}
                    </p>
                  </div>
                </div>

                <div className="grid flex-1 gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
                  {plan.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-start gap-2 text-sm text-[#565869]"
                    >
                      <Check
                        size={16}
                        className="mt-0.5 shrink-0"
                      />

                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => selectPlan(plan)}
                  className="shrink-0 rounded-lg bg-[#202123] px-4 py-2 text-sm font-medium text-white hover:bg-[#343541]"
                >
                  {plan.id === "enterprise"
                    ? "Contact Sales"
                    : "Choose plan"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[#e5e5e5] bg-[#f7f7f8]">
        <div className="mx-auto max-w-[1200px] px-5 py-10 sm:px-8">
          <div className="flex flex-col items-center justify-between gap-5 rounded-2xl border border-[#d9d9e3] bg-white p-6 sm:flex-row">
            <div>
              <h2 className="font-semibold">Payment options</h2>

              <p className="mt-1 text-sm text-[#6e6e80]">
                Available payment methods depend on checkout support.
              </p>
            </div>

            <div
              className="inline-flex min-h-12 items-center justify-center rounded-lg border border-[#d9d9e3] bg-white px-5 py-2"
              aria-label="Apple Pay branding"
            >
              <ApplePayMark />
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[#e5e5e5] bg-[#f7f7f8]">
        <div className="mx-auto max-w-[1200px] px-5 py-12 sm:px-8">
          <div className="flex flex-col gap-6 rounded-2xl border border-[#d9d9e3] bg-white p-7 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f0f0f1] text-[#565869]">
                <Factory size={20} />
              </div>

              <div>
                <h3 className="text-lg font-semibold">
                  Enterprise AI infrastructure
                </h3>

                <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[#6e6e80]">
                  Private deployment, custom models and fine-tuning,
                  security, governance, dedicated infrastructure and
                  enterprise support.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => selectPlan(plans[4])}
              className="shrink-0 rounded-lg bg-[#202123] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#343541]"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#e5e5e5] bg-white">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-3 px-5 py-8 text-center sm:px-8 md:flex-row md:text-left">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#202123] text-white">
              <Sparkles size={13} />
            </div>

            <span className="text-sm font-semibold">ModelNow</span>
          </div>

          <p className="text-xs text-[#8e8ea0]">
            AI infrastructure for modern applications.
          </p>
        </div>
      </footer>
    </main>
  );
}
