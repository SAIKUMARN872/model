"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Check,
  Plus,
  Pencil,
  Trash2,
  X,
  CreditCard,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";

type BillingInterval = "Monthly" | "Yearly";

type Plan = {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  popular?: boolean;
  active: boolean;
};

const initialPlans: Plan[] = [
  {
    id: "plan-free",
    name: "Free",
    description: "Explore ModelNow AI capabilities.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      "Basic AI chat access",
      "Limited monthly usage",
      "Standard response speed",
      "Community support",
    ],
    active: true,
  },
  {
    id: "plan-plus",
    name: "Plus",
    description: "For individuals who need more AI productivity.",
    monthlyPrice: 999,
    yearlyPrice: 9990,
    features: [
      "Higher AI usage limits",
      "Access to multiple AI models",
      "File uploads and knowledge tools",
      "Priority response processing",
    ],
    popular: true,
    active: true,
  },
  {
    id: "plan-pro",
    name: "Pro",
    description: "For advanced users and demanding workflows.",
    monthlyPrice: 2499,
    yearlyPrice: 24990,
    features: [
      "Higher usage allowances",
      "Advanced model routing",
      "Agent and automation tools",
      "Advanced knowledge workflows",
    ],
    active: true,
  },
  {
    id: "plan-enterprise",
    name: "Enterprise",
    description: "Flexible AI infrastructure for organizations.",
    monthlyPrice: 9999,
    yearlyPrice: 99990,
    features: [
      "Configurable usage allowances",
      "Team and workspace controls",
      "Enterprise integration options",
      "Priority support options",
    ],
    active: true,
  },
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

export default function PlansPage() {
  const router = useRouter();

  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [interval, setInterval] = useState<BillingInterval>("Monthly");
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [deletePlan, setDeletePlan] = useState<Plan | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [monthlyPrice, setMonthlyPrice] = useState("0");
  const [yearlyPrice, setYearlyPrice] = useState("0");
  const [featuresText, setFeaturesText] = useState("");
  const [formError, setFormError] = useState("");

  function resetForm() {
    setName("");
    setDescription("");
    setMonthlyPrice("0");
    setYearlyPrice("0");
    setFeaturesText("");
    setEditingPlan(null);
    setFormError("");
    setShowForm(false);
  }

  function openCreateForm() {
    resetForm();
    setShowForm(true);
  }

  function openEditForm(plan: Plan) {
    setEditingPlan(plan);
    setName(plan.name);
    setDescription(plan.description);
    setMonthlyPrice(String(plan.monthlyPrice));
    setYearlyPrice(String(plan.yearlyPrice));
    setFeaturesText(plan.features.join("\n"));
    setFormError("");
    setShowForm(true);
  }

  function savePlan(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const parsedMonthly = Number(monthlyPrice);
    const parsedYearly = Number(yearlyPrice);

    if (!name.trim() || !description.trim()) {
      setFormError("Enter a plan name and description.");
      return;
    }

    if (
      monthlyPrice.trim() === "" ||
      yearlyPrice.trim() === "" ||
      !Number.isFinite(parsedMonthly) ||
      !Number.isFinite(parsedYearly) ||
      parsedMonthly < 0 ||
      parsedYearly < 0
    ) {
      setFormError("Enter valid, non-negative prices.");
      return;
    }

    const features = featuresText
      .split("\n")
      .map((feature) => feature.trim())
      .filter(Boolean);

    if (features.length === 0) {
      setFormError("Add at least one plan feature.");
      return;
    }

    if (editingPlan) {
      setPlans((current) =>
        current.map((plan) =>
          plan.id === editingPlan.id
            ? {
                ...plan,
                name: name.trim(),
                description: description.trim(),
                monthlyPrice: parsedMonthly,
                yearlyPrice: parsedYearly,
                features,
              }
            : plan
        )
      );
    } else {
      const newPlan: Plan = {
        id: `plan-${Date.now()}`,
        name: name.trim(),
        description: description.trim(),
        monthlyPrice: parsedMonthly,
        yearlyPrice: parsedYearly,
        features,
        active: true,
      };

      setPlans((current) => [...current, newPlan]);
    }

    resetForm();
  }

  function togglePlan(planId: string) {
    setPlans((current) =>
      current.map((plan) =>
        plan.id === planId ? { ...plan, active: !plan.active } : plan
      )
    );
  }

  function confirmDelete() {
    if (!deletePlan) return;

    setPlans((current) =>
      current.filter((plan) => plan.id !== deletePlan.id)
    );

    setDeletePlan(null);
  }

  const activeCount = plans.filter((plan) => plan.active).length;

  return (
    <main className="min-h-screen space-y-7 bg-slate-50 p-4 text-slate-900 sm:p-6 lg:p-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <button
            type="button"
            onClick={() => router.push("/billing")}
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
          >
            <ArrowLeft size={16} />
            Back to Billing
          </button>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Plans & Pricing
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Configure ModelNow subscription plans, pricing, features, and plan
            availability.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Create plan
        </button>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total plans</p>
          <p className="mt-2 text-3xl font-bold">{plans.length}</p>
          <p className="mt-2 text-xs text-slate-500">
            Configured pricing plans
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Active plans</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">
            {activeCount}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Available in this demo
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Billing interval</p>
          <p className="mt-2 text-3xl font-bold">{interval}</p>
          <p className="mt-2 text-xs text-slate-500">
            Choose monthly or yearly pricing
          </p>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold">Subscription pricing</h2>
            <p className="mt-1 text-sm text-slate-500">
              Compare your configured plans and their features.
            </p>
          </div>

          <div className="inline-flex w-fit rounded-xl bg-slate-100 p-1">
            {(["Monthly", "Yearly"] as BillingInterval[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setInterval(item)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  interval === item
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {item}
                {item === "Yearly" && (
                  <span className="ml-2 text-xs text-emerald-600">
                    Annual
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => {
            const price =
              interval === "Monthly" ? plan.monthlyPrice : plan.yearlyPrice;

            return (
              <article
                key={plan.id}
                className={`relative flex flex-col rounded-2xl border bg-white p-5 ${
                  plan.popular
                    ? "border-blue-400 shadow-md shadow-blue-100"
                    : "border-slate-200 shadow-sm"
                } ${!plan.active ? "opacity-60" : ""}`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-4 rounded-full bg-blue-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                    Popular
                  </span>
                )}

                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-bold">{plan.name}</h3>
                    <p className="mt-2 min-h-12 text-xs leading-5 text-slate-500">
                      {plan.description}
                    </p>
                  </div>

                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    {plan.name === "Pro" ? (
                      <Sparkles size={18} />
                    ) : (
                      <CreditCard size={18} />
                    )}
                  </span>
                </div>

                <div className="mt-5 border-b border-slate-100 pb-5">
                  <p className="text-3xl font-bold">
                    {formatCurrency(price)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {price === 0
                      ? "Free plan"
                      : interval === "Monthly"
                        ? "per month"
                        : "per year"}
                  </p>
                </div>

                <div className="flex-1 py-5">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Included features
                  </p>

                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li
                        key={`${plan.id}-${index}`}
                        className="flex items-start gap-2 text-sm text-slate-600"
                      >
                        <Check
                          size={16}
                          className="mt-0.5 shrink-0 text-emerald-600"
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3 border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        plan.active
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {plan.active ? "Active" : "Inactive"}
                    </span>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={plan.active}
                      aria-label={`Toggle ${plan.name} plan`}
                      onClick={() => togglePlan(plan.id)}
                      className={`relative h-6 w-11 rounded-full transition ${
                        plan.active ? "bg-emerald-500" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
                          plan.active ? "left-6" : "left-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => openEditForm(plan)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <Pencil size={14} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeletePlan(plan)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-100 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4">
          <form
            onSubmit={savePlan}
            className="my-6 w-full max-w-xl space-y-5 rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">
                  {editingPlan ? "Edit plan" : "Create plan"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Configure plan details and pricing.
                </p>
              </div>

              <button
                type="button"
                onClick={resetForm}
                aria-label="Close form"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Plan name
              </label>
              <input
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Team"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Description
              </label>
              <textarea
                required
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={2}
                placeholder="Describe who this plan is for"
                className="w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Monthly price (INR)
                </label>
                <input
                  required
                  type="number"
                  min="0"
                  step="1"
                  value={monthlyPrice}
                  onChange={(event) => setMonthlyPrice(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Yearly price (INR)
                </label>
                <input
                  required
                  type="number"
                  min="0"
                  step="1"
                  value={yearlyPrice}
                  onChange={(event) => setYearlyPrice(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Features (one per line)
              </label>
              <textarea
                required
                value={featuresText}
                onChange={(event) => setFeaturesText(event.target.value)}
                rows={5}
                placeholder={"AI chat access\nFile uploads\nPriority support"}
                className="w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {formError && (
              <p role="alert" className="text-sm font-medium text-red-600">
                {formError}
              </p>
            )}

            <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-100 pt-4 sm:flex-row">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                {editingPlan ? "Save changes" : "Create plan"}
              </button>
            </div>
          </form>
        </div>
      )}

      {deletePlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-plan-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Trash2 size={20} />
            </div>

            <h2 id="delete-plan-title" className="mt-4 text-lg font-bold">
              Delete {deletePlan.name} plan?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              This removes the plan from this demo page. It does not cancel
              existing subscriptions or change a live billing system.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletePlan(null)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                Delete plan
              </button>
            </div>
          </section>
        </div>
      )}

      <footer className="rounded-xl border border-slate-200 bg-white p-4 text-xs leading-5 text-slate-500">
        These plans use illustrative pricing and browser-only state. Changes
        reset on refresh until a backend or persistent database is connected.
        Connect the billing API before exposing real customer pricing or
        subscription changes.
      </footer>
    </main>
  );
}