
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import {
  ArrowLeft,
  Check,
  Sparkles,
  Crown,
  Building2,
  Factory,
  Zap,
  CreditCard,
  Smartphone,
  ShieldCheck,
  Loader2,
} from "lucide-react";

import type { FormEvent } from "react";
import type { PaymentMethodId } from "../../../components/plans/PaymentMethods";

type BillingCycle = "monthly" | "yearly";

type BillingDetails = {
  fullName: string;
  email: string;
  country: string;
  address: string;
  address2: string;
  city: string;
  state: string;
  postalCode: string;
};

type PlanInfo = {
  id: string;
  name: string;
  monthlyPrice: string;
  yearlyPrice: string;
  credits: string;
  features: string[];
  icon: typeof Sparkles;
};

type RazorpayResponse = {
  orderId?: string;
  amount?: number;
  currency?: string;
  keyId?: string;
  error?: string;
};

type RazorpayPaymentResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  theme?: { color: string };
  prefill?: { name?: string; email?: string };
  config?: {
    display: {
      blocks: {
        upi: {
          name: string;
          instruments: { method: "upi" }[];
        };
        cards: {
          name: string;
          instruments: { method: "card" }[];
        };
      };
      sequence: string[];
      preferences: {
        show_default_blocks: boolean;
      };
    };
  };
  handler: (response: RazorpayPaymentResponse) => void;
  modal?: { ondismiss?: () => void };
};

type RazorpayInstance = {
  open: () => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const planData: PlanInfo[] = [
  {
    id: "free",
    name: "Free",
    monthlyPrice: "₹0",
    yearlyPrice: "₹0",
    credits: "500",
    features: [
      "Basic AI chat",
      "Limited model access",
      "Basic RAG",
      "Basic multimodal",
      "Limited browser/agent usage",
      "500 credits",
    ],
    icon: Sparkles,
  },
  {
    id: "plus",
    name: "Plus",
    monthlyPrice: "₹699/mo",
    yearlyPrice: "₹6,999/yr",
    credits: "2,000",
    features: [
      "More AI models",
      "Higher usage limits",
      "RAG + documents",
      "Multimodal AI",
      "Basic browser automation",
      "Basic agent workflows",
      "2,000 credits",
    ],
    icon: Zap,
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: "₹1,499/mo",
    yearlyPrice: "₹14,999/yr",
    credits: "5,000",
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
    icon: Crown,
  },
  {
    id: "business",
    name: "Business",
    monthlyPrice: "₹4,999/mo",
    yearlyPrice: "₹49,999/yr",
    credits: "25,000",
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
    icon: Building2,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthlyPrice: "Custom",
    yearlyPrice: "Custom",
    credits: "Custom",
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
    icon: Factory,
  },
];

const billingFieldConfig = [
  {
    key: "fullName" as const,
    label: "Full name",
    placeholder: "Enter your full name",
    autoComplete: "name",
  },
  {
    key: "email" as const,
    label: "Email address",
    placeholder: "you@example.com",
    type: "email",
    autoComplete: "email",
  },
];

const stateOptions = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
];

function AppleLogo() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="19"
      height="19"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M16.7 12.8c0-2 1.6-3 1.7-3.1-1-1.5-2.6-1.7-3.2-1.7-1.4-.1-2.7.8-3.4.8-.7 0-1.8-.8-3-.8-1.5 0-2.9.9-3.7 2.2-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.3 2.9 2.2 1.2 0 1.6-.7 3-.7 1.4 0 1.8.7 3 .7 1.2 0 2-.9 2.8-2.1.9-1.3 1.2-2.6 1.2-2.7-.1 0-2.5-1-2.5-4.1ZM14.5 6.5c.6-.8 1-1.8.9-2.8-.9 0-2 .6-2.7 1.4-.6.7-1.1 1.8-1 2.7 1 .1 2.1-.5 2.8-1.3Z" />
    </svg>
  );
}

export default function PlanCheckoutPage() {
  const router = useRouter();

  const [planId, setPlanId] = useState("plus");
  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const [ready, setReady] = useState(false);
  const [method, setMethod] = useState<PaymentMethodId>("upi");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [billingDetails, setBillingDetails] = useState<BillingDetails>({
    fullName: "",
    email: "",
    country: "India",
    address: "",
    address2: "",
    city: "",
    state: "",
    postalCode: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedPlan = params.get("plan") || "plus";

    setPlanId(
      planData.some((item) => item.id === requestedPlan)
        ? requestedPlan
        : "plus"
    );

    setBilling(
      params.get("billing") === "yearly" ? "yearly" : "monthly"
    );

    setReady(true);
  }, []);

  const plan = planData.find((item) => item.id === planId) ?? planData[1];
  const Icon = plan.icon;
  const price =
    billing === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;

  const isFree = plan.id === "free";
  const isEnterprise = plan.id === "enterprise";
  const isCustomPlan = isFree || isEnterprise;

  function updateField(key: keyof BillingDetails, value: string) {
    setBillingDetails((previous) => ({
      ...previous,
      [key]: value,
    }));
    setError("");
    setNotice("");
  }

  function selectMethod(selectedMethod: PaymentMethodId) {
    setMethod(selectedMethod);
    setError("");
    setNotice("");
  }

  function handleApplePay() {
    setError("");
    setNotice(
      "Apple Pay requires merchant verification and a compatible payment provider integration. It is not enabled yet."
    );
  }

  function validateForm() {
    const requiredFields: {
      key: keyof BillingDetails;
      label: string;
    }[] = [
      { key: "fullName", label: "Full name" },
      { key: "email", label: "Email address" },
      { key: "address", label: "Address line 1" },
      { key: "city", label: "City" },
      { key: "postalCode", label: "PIN code" },
      { key: "state", label: "State" },
    ];

    for (const field of requiredFields) {
      if (!billingDetails[field.key].trim()) {
        return `Please enter ${field.label.toLowerCase()}.`;
      }
    }

    if (!billingDetails.country.trim()) {
      return "Please select your country.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billingDetails.email.trim())) {
      return "Please enter a valid email address.";
    }

    if (
      billingDetails.country === "India" &&
      !/^\d{6}$/.test(billingDetails.postalCode.trim())
    ) {
      return "Enter a valid 6-digit PIN code.";
    }

    return "";
  }

  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (isFree) {
      setError("Free-plan activation must be connected to your account API.");
      return;
    }

    if (isEnterprise) {
      setError("Enterprise subscriptions require the ModelNow sales team.");
      return;
    }

    const validation = validateForm();

    if (validation) {
      setError(validation);
      return;
    }

    if (!window.Razorpay) {
      setError("The secure checkout is loading. Please try again.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          planId: plan.id,
          billing,
          paymentMethod: method,
          billingDetails: {
            ...billingDetails,
            fullName: billingDetails.fullName.trim(),
            email: billingDetails.email.trim(),
            country: billingDetails.country.trim(),
            address: billingDetails.address.trim(),
            address2: billingDetails.address2.trim(),
            city: billingDetails.city.trim(),
            state: billingDetails.state.trim(),
            postalCode: billingDetails.postalCode.trim(),
          },
        }),
      });

      const raw = await response.text();
      let data: RazorpayResponse;

      try {
        data = JSON.parse(raw) as RazorpayResponse;
      } catch {
        throw new Error(
          response.status === 404
            ? "The /api/razorpay/order endpoint was not found."
            : "The payment server returned an invalid response."
        );
      }

      if (!response.ok) {
        throw new Error(data.error || "Unable to create the payment order.");
      }

      if (
        !data.orderId ||
        !data.keyId ||
        typeof data.amount !== "number" ||
        data.amount <= 0
      ) {
        throw new Error("The server returned incomplete order details.");
      }

      const selectedBlock =
        method === "upi" ? "block.upi" : "block.cards";

      const razorpay = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency || "INR",
        name: "ModelNow",
        description: `${plan.name} plan - ${billing}`,
        order_id: data.orderId,
        theme: { color: "#111111" },
        prefill: {
          name: billingDetails.fullName.trim(),
          email: billingDetails.email.trim(),
        },
        config: {
          display: {
            blocks: {
              upi: {
                name: "UPI",
                instruments: [{ method: "upi" }],
              },
              cards: {
                name: "Card",
                instruments: [{ method: "card" }],
              },
            },
            sequence: [selectedBlock],
            preferences: {
              show_default_blocks: false,
            },
          },
        },
        handler: (payment) => {
          setNotice(
            `Payment submitted (${payment.razorpay_payment_id}). Waiting for secure server-side verification.`
          );
          setLoading(false);
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      });

      razorpay.open();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to start checkout."
      );
      setLoading(false);
    }
  }

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fcfcfc]">
        <Loader2 size={23} className="animate-spin text-neutral-500" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fcfcfc] text-[#111111]">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />

      <header className="border-t border-[#f0d8d2]">
        <div className="mx-auto flex max-w-[1050px] items-center gap-3 px-5 py-3 sm:px-7">
          <button
            type="button"
            onClick={() => router.push("/plans")}
            aria-label="Back to plans"
            className="rounded-full p-1.5 transition hover:bg-neutral-100"
          >
            <ArrowLeft size={21} strokeWidth={1.8} />
          </button>

          <h1 className="text-[23px] font-semibold tracking-[-0.5px] sm:text-[26px]">
            Configure your plan
          </h1>
        </div>
      </header>

      <form
        onSubmit={subscribe}
        className="mx-auto grid max-w-[1050px] grid-cols-1 items-start gap-7 px-5 pb-10 pt-6 sm:px-7 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12"
      >
        <section className="min-w-0">
          <h2 className="mb-3 text-[17px] font-semibold">Pay with</h2>

          <button
            type="button"
            onClick={handleApplePay}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-black px-4 text-[15px] font-semibold text-white transition hover:bg-neutral-800 active:scale-[0.99]"
          >
            <AppleLogo />
            <span>Pay</span>
          </button>

          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#e5e5e5]" />
            <span className="text-[11px] text-[#858585]">OR</span>
            <div className="h-px flex-1 bg-[#e5e5e5]" />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => selectMethod("card")}
              aria-pressed={method === "card"}
              className={`flex min-h-[76px] flex-col items-start justify-center gap-1.5 rounded-[15px] border px-4 py-3 text-left transition ${
                method === "card"
                  ? "border-[#777777] bg-white"
                  : "border-transparent bg-[#f0f0f0] hover:bg-[#eaeaea]"
              }`}
            >
              <CreditCard size={20} className="text-[#303b50]" />
              <span className="text-[14px] font-medium">Card</span>
            </button>

            <button
              type="button"
              onClick={() => selectMethod("upi")}
              aria-pressed={method === "upi"}
              className={`flex min-h-[76px] flex-col items-start justify-center gap-1.5 rounded-[15px] border px-4 py-3 text-left transition ${
                method === "upi"
                  ? "border-[#777777] bg-white"
                  : "border-transparent bg-[#f0f0f0] hover:bg-[#eaeaea]"
              }`}
            >
              <span className="flex h-5 items-center rounded border border-neutral-500 px-1 text-[11px] font-semibold italic">
                UPI <span className="ml-0.5 text-green-600">›</span>
              </span>
              <span className="text-[14px] font-medium">UPI</span>
            </button>
          </div>

          <div className="mt-3 flex items-start gap-2.5 text-[13px] leading-5 text-[#647087]">
            {method === "upi" ? (
              <Smartphone size={22} className="mt-0.5 shrink-0" />
            ) : (
              <ShieldCheck size={21} className="mt-0.5 shrink-0" />
            )}
            <p>
              {method === "upi"
                ? "Your UPI checkout will open through the payment provider. QR availability depends on the provider configuration."
                : "Your secure card checkout will open through the payment provider."}
            </p>
          </div>

          <p className="mt-4 text-[13px] leading-5 text-[#647087]">
            Review your plan and billing details before continuing. Payments
            are processed by the configured payment provider.
          </p>

          <h2 className="mb-3 mt-7 text-[17px] font-semibold">
            Billing address
          </h2>

          <div className="space-y-2.5">
            {billingFieldConfig.map((field) => (
              <FloatingInput
                key={field.key}
                label={field.label}
                placeholder={field.placeholder}
                type={field.type}
                autoComplete={field.autoComplete}
                value={billingDetails[field.key]}
                onChange={(value) => updateField(field.key, value)}
              />
            ))}

            <FloatingSelect
              label="Country or region"
              value={billingDetails.country}
              onChange={(value) => {
                setBillingDetails((previous) => ({
                  ...previous,
                  country: value,
                  state: value === "India" ? previous.state : "",
                }));
                setError("");
                setNotice("");
              }}
              options={[
                { label: "India", value: "India" },
                { label: "United States", value: "United States" },
                { label: "United Kingdom", value: "United Kingdom" },
                { label: "Canada", value: "Canada" },
                { label: "Australia", value: "Australia" },
                { label: "Other", value: "Other" },
              ]}
            />

            <FloatingInput
              label="Address line 1"
              placeholder="Street and house number"
              autoComplete="address-line1"
              value={billingDetails.address}
              onChange={(value) => updateField("address", value)}
            />

            <FloatingInput
              label="Address line 2 (optional)"
              placeholder="Apartment, suite, unit, etc."
              autoComplete="address-line2"
              required={false}
              value={billingDetails.address2}
              onChange={(value) => updateField("address2", value)}
            />

            <FloatingInput
              label="City"
              placeholder="Enter your city"
              autoComplete="address-level2"
              value={billingDetails.city}
              onChange={(value) => updateField("city", value)}
            />

            <div className="grid grid-cols-2 gap-2.5">
              <FloatingInput
                label="PIN"
                placeholder="6-digit PIN"
                autoComplete="postal-code"
                value={billingDetails.postalCode}
                onChange={(value) => updateField("postalCode", value)}
              />

              <FloatingSelect
                label="State"
                value={billingDetails.state}
                onChange={(value) => updateField("state", value)}
                options={[
                  { label: "Select state", value: "" },
                  ...stateOptions.map((state) => ({
                    label: state,
                    value: state,
                  })),
                ]}
              />
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2.5 text-[12px] leading-5 text-red-700"
            >
              {error}
            </p>
          )}

          {notice && (
            <p
              role="status"
              className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-2.5 text-[12px] leading-5 text-blue-800"
            >
              {notice}
            </p>
          )}
        </section>

        <aside className="min-w-0 lg:sticky lg:top-5">
          <div className="rounded-[24px] border border-[#e1e1e1] bg-white px-5 py-6 sm:px-7">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f2f2f2]">
                <Icon size={19} />
              </div>
              <h2 className="text-[23px] font-semibold tracking-[-0.4px]">
                {plan.name} plan
              </h2>
            </div>

            <p className="mb-3 mt-5 text-[14px] font-medium">
              Top features
            </p>

            <ul className="space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <Check
                    size={17}
                    strokeWidth={2}
                    className="mt-0.5 shrink-0 text-[#2870ed]"
                  />
                  <span className="text-[13px] leading-5">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="my-5 h-px bg-[#e5e5e5]" />

            <div className="space-y-3 text-[13px]">
              <div className="flex justify-between gap-3 text-[#647087]">
                <span>Subscription</span>
                <span>{billing === "monthly" ? "Monthly" : "Yearly"}</span>
              </div>

              <div className="flex justify-between gap-3 text-[#647087]">
                <span>Plan price</span>
                <span>{price}</span>
              </div>

              <div className="flex justify-between gap-3 text-[#647087]">
                <span>Included credits</span>
                <span>{plan.credits}</span>
              </div>

              <div className="flex justify-between gap-3 pt-1 text-[16px] font-semibold text-[#111111]">
                <span>Due today</span>
                <span>{price}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || isCustomPlan}
              className="mt-5 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-[#090909] px-4 text-[14px] font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Processing...
                </>
              ) : isEnterprise ? (
                "Contact Sales"
              ) : isFree ? (
                "Get started"
              ) : (
                `Continue with ${method === "upi" ? "UPI" : "Card"}`
              )}
            </button>

            {isCustomPlan && (
              <p className="mt-2.5 text-[12px] leading-5 text-[#647087]">
                {isFree
                  ? "Free-plan activation must be connected to your account flow."
                  : "Contact the ModelNow team to configure an Enterprise plan."}
              </p>
            )}

            <p className="mt-4 text-[11px] leading-[1.6] text-[#647087]">
              Payment processing is handled by the payment provider.
              Subscription activation requires server-side payment
              verification. Taxes and renewal terms must be confirmed by
              the backend.
            </p>
          </div>
        </aside>
      </form>
    </main>
  );
}

type FloatingInputProps = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  required?: boolean;
};

function FloatingInput({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  autoComplete,
  required = true,
}: FloatingInputProps) {
  return (
    <label className="flex min-h-[68px] flex-col justify-center rounded-[14px] border border-[#d9dee7] bg-white px-3.5 py-2.5 transition focus-within:border-[#9aa8c0]">
      <span className="text-[12px] font-medium text-[#8490a4]">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        className="mt-0.5 w-full bg-transparent text-[14px] text-[#171717] outline-none placeholder:text-neutral-300"
      />
    </label>
  );
}

type FloatingSelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
};

function FloatingSelect({
  label,
  value,
  onChange,
  options,
}: FloatingSelectProps) {
  return (
    <label className="relative flex min-h-[68px] flex-col justify-center rounded-[14px] border border-[#e0e0e0] bg-white px-3.5 py-2.5 transition focus-within:border-[#9aa8c0]">
      <span className="text-[12px] font-medium text-[#8490a4]">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-0.5 w-full appearance-none bg-transparent pr-7 text-[14px] text-[#171717] outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3.5 top-1/2 mt-1 -translate-y-1/2 text-[12px] text-[#596579]">
        ▾
      </span>
    </label>
  );
}
