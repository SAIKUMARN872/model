"use client";

import {
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { ReactNode } from "react";

export type PlanCardData = {
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

type PlanCardProps = {
  plan: PlanCardData;
  billing: "monthly" | "yearly";
  expanded: boolean;
  onSelect: (plan: PlanCardData) => void;
  onToggleFeatures: (id: string) => void;
};

export default function PlanCard({
  plan,
  billing,
  expanded,
  onSelect,
  onToggleFeatures,
}: PlanCardProps) {
  const isPro = plan.id === "pro";

  const price =
    billing === "monthly"
      ? plan.monthlyPrice
      : plan.yearlyPrice;

  return (
    <div
      className={`relative flex flex-col rounded-xl border bg-white transition ${
        isPro
          ? "border-[#202123] shadow-[0_4px_18px_rgba(0,0,0,0.08)]"
          : "border-[#d9d9e3] shadow-sm hover:border-[#bfc0c8]"
      }`}
    >
      {plan.popular && (
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-[#202123] px-3 py-1 text-[11px] font-semibold text-white">
          Most popular
        </div>
      )}

      <div className="flex flex-1 flex-col p-6">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
            isPro
              ? "bg-[#202123] text-white"
              : "bg-[#f0f0f1] text-[#565869]"
          }`}
        >
          {plan.icon}
        </div>

        <h2 className="mt-5 text-xl font-semibold text-[#202123]">
          {plan.name}
        </h2>

        <p className="mt-2 min-h-[42px] text-sm leading-5 text-[#6e6e80]">
          {plan.description}
        </p>

        <div className="mt-6">
          <span className="text-3xl font-semibold tracking-tight text-[#202123]">
            {price}
          </span>
        </div>

        {plan.id !== "enterprise" && (
          <p className="mt-1 text-xs text-[#8e8ea0]">
            {billing === "monthly" ? "per month" : "per year"}
          </p>
        )}

        <div className="mt-3 text-sm text-[#565869]">
          <span className="font-medium">{plan.credits}</span>{" "}
          credits / month
        </div>

        <div className="mt-5 border-t border-[#ececf1] pt-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[#8e8ea0]">
            Main customer
          </p>

          <p className="mt-1.5 text-sm text-[#565869]">
            {plan.customer}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onSelect(plan)}
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

        <div className="mt-6 border-t border-[#ececf1] pt-5">
          <button
            type="button"
            onClick={() => onToggleFeatures(plan.id)}
            aria-expanded={expanded}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="text-sm font-semibold text-[#202123]">
              What you get
            </span>

            {expanded ? (
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

          {expanded ? (
            <ul className="mt-4 space-y-3">
              {plan.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2.5 text-sm leading-5 text-[#565869]"
                >
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#ececf1] text-[#202123]">
                    <Check size={10} strokeWidth={3} />
                  </span>

                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4 space-y-3">
              {plan.features.slice(0, 3).map((feature) => (
                <div
                  key={feature}
                  className="flex items-start gap-2.5 text-sm leading-5 text-[#565869]"
                >
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#ececf1] text-[#202123]">
                    <Check size={10} strokeWidth={3} />
                  </span>

                  <span>{feature}</span>
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
    </div>
  );
}