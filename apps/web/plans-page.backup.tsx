"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Crown,
  Building2,
  Factory,
  Zap,
  X,
} from "lucide-react";

type BillingCycle = "monthly" | "yearly";

type Plan = {
  id: string;
  name: string;
  monthlyPrice: string;
  yearlyPrice: string;
  credits: string;
  customer: string;
  description: string;
  icon: ReactNode;
  features: string[];
  popular?: boolean;
};

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

export default function PlansPage() {
  const router = useRouter();

  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);

  const getPrice = (plan: Plan) => {
    return billing === "monthly"
      ? plan.monthlyPrice
      : plan.yearlyPrice;
  };

  const getBillingLabel = () => {
    return billing === "monthly"
      ? "Billed monthly"
      : "Billed yearly";
  };

  const selectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
  };

  const closeModal = () => {
    setSelectedPlan(null);
  };

  const toggleFeatures = (id: string) => {
    setExpandedPlan((current) =>
      current === id ? null : id
    );
  };

  return (
    <main className="min-h-screen bg-[#f7f7f8] text-[#202123]">

      {/* =========================================================
          HEADER
      ========================================================= */}

      <header className="sticky top-0 z-40 border-b border-[#e5e5e5] bg-[#f7f7f8]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">

          <div className="flex items-center gap-3">

            <button
              onClick={() => router.push("/")}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#d9d9e3] bg-white text-[#565869] transition hover:bg-[#ececf1]"
              aria-label="Back"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="flex items-center gap-2">

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#202123] text-white">
                <Sparkles size={15} />
              </div>

              <span className="text-base font-semibold tracking-tight">
                ModelNow
              </span>

            </div>

            <span className="hidden text-[#8e8ea0] sm:inline">
              /
            </span>

            <span className="hidden text-sm font-medium text-[#565869] sm:inline">
              Pricing
            </span>

          </div>

          <button
            onClick={() => router.push("/")}
            className="rounded-lg px-3 py-2 text-sm font-medium text-[#565869] transition hover:bg-[#ececf1] hover:text-[#202123]"
          >
            Back to app
          </button>

        </div>
      </header>


      {/* =========================================================
          HERO
      ========================================================= */}

      <section className="border-b border-[#e5e5e5] bg-white">

        <div className="mx-auto max-w-4xl px-5 py-14 text-center sm:py-16">

          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#202123] text-white">
            <Sparkles size={21} />
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-[#202123] sm:text-4xl">
            ModelNow Pricing
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[#6e6e80] sm:text-base">
            Choose the ModelNow plan that fits the way you use AI.
            Start free and scale as your needs grow.
          </p>


          {/* =====================================================
              BILLING SELECTOR
          ===================================================== */}

          <div className="mt-8 inline-flex rounded-xl border border-[#d9d9e3] bg-[#f7f7f8] p-1">

            <button
              onClick={() => setBilling("monthly")}
              className={`rounded-lg px-5 py-2.5 text-sm font-medium transition ${
                billing === "monthly"
                  ? "bg-[#202123] text-white shadow-sm"
                  : "text-[#6e6e80] hover:text-[#202123]"
              }`}
            >
              Monthly
            </button>

            <button
              onClick={() => setBilling("yearly")}
              className={`rounded-lg px-5 py-2.5 text-sm font-medium transition ${
                billing === "yearly"
                  ? "bg-[#202123] text-white shadow-sm"
                  : "text-[#6e6e80] hover:text-[#202123]"
              }`}
            >
              Yearly
            </button>

          </div>

          {/* Billing information */}

          <p className="mt-3 text-xs text-[#8e8ea0]">
            {getBillingLabel()}
          </p>

        </div>

      </section>


      {/* =========================================================
          PRICING CARDS
      ========================================================= */}

      <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">

        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-5">

          {plans.map((plan) => {

            const isPro = plan.id === "pro";
            const isExpanded = expandedPlan === plan.id;

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-xl border bg-white transition ${
                  isPro
                    ? "border-[#202123] shadow-[0_4px_18px_rgba(0,0,0,0.08)]"
                    : "border-[#d9d9e3] shadow-sm hover:border-[#bfc0c8]"
                }`}
              >

                {/* Popular */}

                {plan.popular && (
                  <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-[#202123] px-3 py-1 text-[11px] font-semibold text-white">
                    Most popular
                  </div>
                )}


                <div className="flex flex-1 flex-col p-6">

                  {/* Icon */}

                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      isPro
                        ? "bg-[#202123] text-white"
                        : "bg-[#f0f0f1] text-[#565869]"
                    }`}
                  >
                    {plan.icon}
                  </div>


                  {/* Name */}

                  <h2 className="mt-5 text-xl font-semibold text-[#202123]">
                    {plan.name}
                  </h2>


                  {/* Description */}

                  <p className="mt-2 min-h-[42px] text-sm leading-5 text-[#6e6e80]">
                    {plan.description}
                  </p>


                  {/* =================================================
                      PRICE
                  ================================================= */}

                  <div className="mt-6">

                    <span className="text-3xl font-semibold tracking-tight text-[#202123]">
                      {getPrice(plan)}
                    </span>

                  </div>


                  {/* Billing label */}

                  {plan.id !== "enterprise" && (
                    <p className="mt-1 text-xs text-[#8e8ea0]">
                      {billing === "monthly"
                        ? "per month"
                        : "per year"}
                    </p>
                  )}


                  {/* Credits */}

                  <div className="mt-3 text-sm text-[#565869]">

                    <span className="font-medium">
                      {plan.credits}
                    </span>{" "}

                    credits / month

                  </div>


                  {/* Customer */}

                  <div className="mt-5 border-t border-[#ececf1] pt-5">

                    <p className="text-xs font-medium uppercase tracking-wide text-[#8e8ea0]">
                      Main customer
                    </p>

                    <p className="mt-1.5 text-sm text-[#565869]">
                      {plan.customer}
                    </p>

                  </div>


                  {/* Button */}

                  <button
                    onClick={() => selectPlan(plan)}
                    className={`mt-6 w-full rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                      isPro
                        ? "bg-[#202123] text-white hover:bg-[#343541]"
                        : "border border-[#d9d9e3] bg-white text-[#202123] hover:bg-[#f7f7f8]"
                    }`}
                  >
                    {plan.id === "enterprise"
                      ? "Contact Sales"
                      : plan.id === "free"
                        ? "Get started"
                        : "Choose plan"}
                  </button>


                  {/* Features */}

                  <div className="mt-6 border-t border-[#ececf1] pt-5">

                    <button
                      onClick={() => toggleFeatures(plan.id)}
                      className="flex w-full items-center justify-between text-left"
                    >

                      <span className="text-sm font-semibold text-[#202123]">
                        What you get
                      </span>

                      {isExpanded ? (
                        <ChevronUp
                          size={17}
                          className="text-[#8e8ea0]"
                        />
                      ) : (
                        <ChevronDown
                          size={17}
                          className="text-[#8e8ea0]"
                        />
                      )}

                    </button>


                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        isExpanded
                          ? "mt-4 max-h-[600px] opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >

                      <ul className="space-y-3">

                        {plan.features.map((feature) => (

                          <li
                            key={feature}
                            className="flex items-start gap-2.5 text-sm leading-5 text-[#565869]"
                          >

                            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#ececf1] text-[#202123]">

                              <Check
                                size={10}
                                strokeWidth={3}
                              />

                            </span>

                            <span>
                              {feature}
                            </span>

                          </li>

                        ))}

                      </ul>

                    </div>

                  </div>


                  {/* Always show first features */}

                  {!isExpanded && (

                    <div className="mt-4 space-y-3">

                      {plan.features
                        .slice(0, 3)
                        .map((feature) => (

                          <div
                            key={feature}
                            className="flex items-start gap-2.5 text-sm leading-5 text-[#565869]"
                          >

                            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#ececf1] text-[#202123]">

                              <Check
                                size={10}
                                strokeWidth={3}
                              />

                            </span>

                            <span>
                              {feature}
                            </span>

                          </div>

                        ))}


                      {plan.features.length > 3 && (

                        <p className="pt-1 text-xs text-[#8e8ea0]">
                          + {plan.features.length - 3} more features
                        </p>

                      )}

                    </div>

                  )}

                </div>

              </div>
            );
          })}

        </div>

      </section>


      {/* =========================================================
          WHAT EACH PLAN UNLOCKS
      ========================================================= */}

      <section className="border-t border-[#e5e5e5] bg-white">

        <div className="mx-auto max-w-[1200px] px-5 py-14 sm:px-8">

          <div className="text-center">

            <h2 className="text-2xl font-semibold tracking-tight text-[#202123]">
              What each plan should unlock
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#6e6e80]">
              More access, higher limits, and advanced AI infrastructure as
              your ModelNow usage grows.
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

                    <h3 className="font-semibold text-[#202123]">
                      {plan.name}
                    </h3>

                    <p className="text-xs text-[#8e8ea0]">
                      {plan.description}
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
                        className="mt-0.5 shrink-0 text-[#202123]"
                      />

                      <span>
                        {feature}
                      </span>

                    </div>

                  ))}

                </div>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* =========================================================
          ENTERPRISE
      ========================================================= */}

      <section className="border-t border-[#e5e5e5] bg-[#f7f7f8]">

        <div className="mx-auto max-w-[1200px] px-5 py-12 sm:px-8">

          <div className="flex flex-col gap-6 rounded-2xl border border-[#d9d9e3] bg-white p-7 md:flex-row md:items-center md:justify-between">

            <div className="flex items-start gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f0f0f1] text-[#565869]">
                <Factory size={20} />
              </div>

              <div>

                <h3 className="text-lg font-semibold text-[#202123]">
                  Enterprise AI infrastructure
                </h3>

                <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[#6e6e80]">
                  Private deployment, company models, custom fine-tuning,
                  advanced security, governance, dedicated infrastructure,
                  SLA and enterprise support.
                </p>

              </div>

            </div>


            <button
              onClick={() =>
                setSelectedPlan(
                  plans.find(
                    (plan) => plan.id === "enterprise"
                  ) || null
                )
              }
              className="shrink-0 rounded-lg bg-[#202123] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#343541]"
            >
              Contact Sales
            </button>

          </div>

        </div>

      </section>


      {/* =========================================================
          FOOTER
      ========================================================= */}

      <footer className="border-t border-[#e5e5e5] bg-white">

        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-3 px-5 py-8 text-center sm:px-8 md:flex-row md:text-left">

          <div className="flex items-center gap-2">

            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#202123] text-white">
              <Sparkles size={13} />
            </div>

            <span className="text-sm font-semibold text-[#202123]">
              ModelNow
            </span>

          </div>

          <p className="text-xs text-[#8e8ea0]">
            AI infrastructure for modern applications.
          </p>

        </div>

      </footer>


      {/* =========================================================
          PLAN MODAL
      ========================================================= */}

      {selectedPlan && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={closeModal}
        >

          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#d9d9e3] bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >

            {/* Modal header */}

            <div className="flex items-start justify-between border-b border-[#ececf1] p-6">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f0f0f1] text-[#565869]">
                  {selectedPlan.icon}
                </div>

                <div>

                  <h3 className="text-lg font-semibold text-[#202123]">
                    {selectedPlan.name}
                  </h3>

                  <p className="text-sm text-[#6e6e80]">
                    {selectedPlan.description}
                  </p>

                </div>

              </div>


              <button
                onClick={closeModal}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8e8ea0] transition hover:bg-[#f0f0f1] hover:text-[#202123]"
                aria-label="Close"
              >
                <X size={17} />
              </button>

            </div>


            {/* Modal content */}

            <div className="max-h-[65vh] overflow-y-auto p-6">

              <div className="rounded-xl bg-[#f7f7f8] p-5">

                <div className="flex items-end justify-between">

                  <div>

                    <p className="text-xs font-medium uppercase tracking-wide text-[#8e8ea0]">
                      Price
                    </p>

                    <p className="mt-1 text-3xl font-semibold text-[#202123]">
                      {getPrice(selectedPlan)}
                    </p>

                    <p className="mt-1 text-xs text-[#8e8ea0]">
                      {selectedPlan.id === "enterprise"
                        ? "Custom pricing"
                        : billing === "monthly"
                          ? "Billed monthly"
                          : "Billed yearly"}
                    </p>

                  </div>


                  <div className="text-right">

                    <p className="text-xs font-medium uppercase tracking-wide text-[#8e8ea0]">
                      Credits
                    </p>

                    <p className="mt-1 text-lg font-semibold text-[#202123]">
                      {selectedPlan.credits}
                    </p>

                  </div>

                </div>

              </div>


              {/* Included features */}

              <div className="mt-6">

                <h4 className="text-sm font-semibold text-[#202123]">
                  Included with {selectedPlan.name}
                </h4>

                <ul className="mt-4 space-y-3">

                  {selectedPlan.features.map((feature) => (

                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-sm leading-5 text-[#565869]"
                    >

                      <Check
                        size={16}
                        className="mt-0.5 shrink-0 text-[#202123]"
                      />

                      <span>
                        {feature}
                      </span>

                    </li>

                  ))}

                </ul>

              </div>

            </div>


            {/* Modal footer */}

            <div className="flex gap-3 border-t border-[#ececf1] bg-[#f7f7f8] p-5">

              <button
                onClick={closeModal}
                className="flex-1 rounded-lg border border-[#d9d9e3] bg-white px-4 py-2.5 text-sm font-medium text-[#565869] transition hover:bg-[#f7f7f8]"
              >
                Cancel
              </button>


              <button
                onClick={() => {

                  if (selectedPlan.id === "enterprise") {

                    alert(
                      "Enterprise sales flow can be connected here."
                    );

                  } else {

                    alert(
                      `${selectedPlan.name} plan selected for ${
                        billing === "monthly"
                          ? "monthly"
                          : "yearly"
                      } billing. Payment flow can be connected here.`
                    );

                  }

                }}
                className="flex-1 rounded-lg bg-[#202123] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#343541]"
              >
                {selectedPlan.id === "enterprise"
                  ? "Contact Sales"
                  : "Continue"}
              </button>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}