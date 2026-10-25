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
  MapPin,
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
  description: string;
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
    description: "Try ModelNow",
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
    description: "Use ModelNow regularly",
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
    description: "Build with ModelNow",
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
    description: "Run AI for a team",
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
    description: "AI infrastructure for organizations",
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

const billingFieldConfig: {
  key: keyof BillingDetails;
  label: string;
  placeholder: string;
  type?: string;
  autoComplete?: string;
}[] = [
  {
    key: "fullName",
    label: "Full name",
    placeholder: "Enter your full name",
    autoComplete: "name",
  },
  {
    key: "email",
    label: "Email address",
    placeholder: "you@example.com",
    type: "email",
    autoComplete: "email",
  },
  {
    key: "address",
    label: "Address line 1",
    placeholder: "Street and house number",
    autoComplete: "address-line1",
  },
  {
    key: "city",
    label: "City",
    placeholder: "Enter your city",
    autoComplete: "address-level2",
  },
  {
    key: "postalCode",
    label: "PIN",
    placeholder: "Enter PIN code",
    autoComplete: "postal-code",
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
    const requestedBilling = params.get("billing");

    setPlanId(
      planData.some((item) => item.id === requestedPlan)
        ? requestedPlan
        : "plus"
    );

    setBilling(requestedBilling === "yearly" ? "yearly" : "monthly");
    setReady(true);
  }, []);

  const plan = planData.find((item) => item.id === planId) ?? planData[1];
  const Icon = plan.icon;
  const price = billing === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;

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

  function validateForm() {
    for (const field of billingFieldConfig) {
      if (!billingDetails[field.key].trim()) {
        return `Please enter ${field.label.toLowerCase()}.`;
      }
    }

    if (!billingDetails.country.trim() || !billingDetails.state.trim()) {
      return "Please select your country and state.";
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

      const razorpay = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency || "INR",
        name: "ModelNow",
        description: `${plan.name} plan - ${billing}`,
        order_id: data.orderId,
        theme: { color: "#090909" },
        prefill: {
          name: billingDetails.fullName.trim(),
          email: billingDetails.email.trim(),
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
        <Loader2 size={28} className="animate-spin text-neutral-500" />
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
        <div className="mx-auto flex max-w-[1120px] items-center gap-5 px-5 py-4 sm:px-8">
          <button
            type="button"
            onClick={() => router.push("/plans")}
            aria-label="Back to plans"
            className="rounded-full p-1 hover:bg-neutral-100"
          >
            <ArrowLeft size={26} strokeWidth={1.8} />
          </button>

          <h1 className="text-[27px] font-semibold tracking-[-0.7px] sm:text-[32px]">
            Configure your plan
          </h1>
        </div>
      </header>

      <form
        onSubmit={subscribe}
        className="mx-auto grid max-w-[1120px] grid-cols-1 items-start gap-10 px-5 pb-12 pt-7 sm:px-8 lg:grid-cols-[1.12fr_1fr] lg:gap-[88px] lg:pt-10"
      >
        <section className="min-w-0">
          <h2 className="mb-5 text-[20px] font-semibold">Pay with</h2>

          {/* Apple Pay visual. Actual Apple Pay processing requires provider support. */}
          <button
            type="button"
            onClick={() => {
              setError(
                "Apple Pay is not connected yet. Use Card or UPI through the configured secure checkout."
              );
              setNotice("");
            }}
            aria-label="Apple Pay"
            className="flex h-[54px] w-full items-center justify-center gap-2 rounded-[20px] bg-black text-white transition hover:bg-neutral-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 28"
              className="h-[23px] w-[20px] shrink-0 fill-current"
              aria-hidden="true"
            >
              <path d="M19.7 14.9c0-3 2.5-4.4 2.6-4.5-1.4-2-3.5-2.3-4.3-2.3-1.8-.2-3.5 1.1-4.4 1.1-.9 0-2.3-1.1-3.8-1.1-2 0-3.8 1.2-4.8 3-2.1 3.6-.5 8.9 1.5 11.8 1 1.4 2.1 3 3.6 2.9 1.5-.1 2-1 3.8-1s2.3 1 3.8 1c1.6 0 2.5-1.4 3.5-2.8 1.1-1.6 1.5-3.1 1.5-3.2-.1 0-3-1.2-3-4.9zM16.8 6.2c.8-1 1.4-2.4 1.3-3.8-1.2.1-2.7.8-3.6 1.8-.8.9-1.5 2.3-1.3 3.6 1.4.1 2.8-.6 3.6-1.6z" />
            </svg>

            <span className="text-[21px] font-medium tracking-tight">Pay</span>
          </button>

          <div className="my-5 flex items-center gap-5">
            <div className="h-px flex-1 bg-[#dedede]" />
            <span className="text-[14px] text-[#777777]">OR</span>
            <div className="h-px flex-1 bg-[#dedede]" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setMethod("card");
                setError("");
                setNotice("");
              }}
              className={`flex min-h-[96px] flex-col items-start justify-center gap-1 rounded-[21px] border-2 px-5 text-left transition ${
                method === "card"
                  ? "border-[#888888] bg-white"
                  : "border-transparent bg-[#f2f2f2] hover:bg-[#ebebeb]"
              }`}
            >
              <CreditCard size={24} className="text-[#303b50]" />
              <span className="text-[18px] font-medium">Card</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMethod("upi");
                setError("");
                setNotice("");
              }}
              className={`flex min-h-[96px] flex-col items-start justify-center gap-1 rounded-[21px] border-2 px-5 text-left transition ${
                method === "upi"
                  ? "border-[#888888] bg-white"
                  : "border-transparent bg-[#f2f2f2] hover:bg-[#ebebeb]"
              }`}
            >
              <span className="flex h-6 items-center rounded border border-neutral-500 px-1 text-[13px] font-semibold italic">
                UPI <span className="ml-0.5 text-green-600">›</span>
              </span>
              <span className="text-[18px] font-medium">UPI</span>
            </button>
          </div>

          <div className="mt-4 flex items-start gap-4 text-[15px] leading-6 text-[#647087]">
            {method === "upi" ? (
              <MapPin size={35} className="mt-1 shrink-0" />
            ) : (
              <ShieldCheck size={30} className="mt-1 shrink-0" />
            )}
            <p>
              {method === "upi"
                ? "Continue to the secure payment checkout. A UPI QR code will be available if supported by your payment configuration."
                : "You will continue to the secure payment checkout to enter your card details."}
            </p>
          </div>

          <p className="mt-6 text-[15px] leading-[1.75] text-[#647087]">
            Review your plan and billing details before continuing. Payment
            processing and recurring payment authorization are handled by the
            configured payment provider.
          </p>

          <h2 className="mb-5 mt-12 text-[20px] font-semibold">
            Billing address
          </h2>

          <div className="space-y-[14px]">
            {billingFieldConfig.slice(0, 2).map((field) => (
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

            <div className="grid grid-cols-2 gap-3">
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
              className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-700"
            >
              {error}
            </p>
          )}

          {notice && (
            <p
              role="status"
              className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm leading-6 text-blue-800"
            >
              {notice}
            </p>
          )}
        </section>

        <aside className="min-w-0 lg:sticky lg:top-6">
          <div className="rounded-[34px] border border-[#e1e1e1] bg-white px-6 py-8 sm:px-10 sm:py-10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f2f2f2]">
                <Icon size={21} />
              </div>
              <h2 className="text-[30px] font-semibold tracking-[-0.5px]">
                {plan.name} plan
              </h2>
            </div>

            <p className="mb-5 mt-6 text-[16px]">Top features</p>

            <ul className="space-y-5">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-4">
                  <Check
                    size={21}
                    strokeWidth={2}
                    className="mt-0.5 shrink-0 text-[#2870ed]"
                  />
                  <span className="text-[15px] leading-6">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="my-9 h-px bg-[#e1e1e1]" />

            <div className="space-y-4 text-[15px]">
              <div className="flex justify-between gap-4 text-[#647087]">
                <span>Subscription</span>
                <span>{billing === "monthly" ? "Monthly" : "Yearly"}</span>
              </div>

              <div className="flex justify-between gap-4 text-[#647087]">
                <span>Plan price</span>
                <span>{price}</span>
              </div>

              <div className="flex justify-between gap-4 text-[#647087]">
                <span>Included credits</span>
                <span>{plan.credits}</span>
              </div>

              <div className="flex justify-between gap-4 pt-1 text-[18px] font-semibold">
                <span>Due today</span>
                <span>{price}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || isCustomPlan}
              className="mt-7 flex min-h-[68px] w-full items-center justify-center gap-2 rounded-full bg-[#090909] px-5 text-[17px] font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Processing...
                </>
              ) : isEnterprise ? (
                "Contact Sales"
              ) : isFree ? (
                "Get started"
              ) : (
                "Subscribe"
              )}
            </button>

            {isCustomPlan && (
              <p className="mt-3 text-sm leading-6 text-[#647087]">
                {isFree
                  ? "Free-plan activation must be connected to your account flow."
                  : "Contact the ModelNow team to configure an Enterprise plan."}
              </p>
            )}

            <p className="mt-6 text-[12px] leading-[1.65] text-[#647087]">
              The payment provider will show the final payment options.
              Subscription activation requires server-side payment verification.
              Applicable taxes and renewal terms must be confirmed by the backend.
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
    <label className="flex min-h-[89px] flex-col justify-center rounded-[21px] border border-[#d9dee7] bg-white px-5 py-3 transition focus-within:border-[#9aa8c0]">
      <span className="text-[15px] font-medium text-[#8490a4]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        className="mt-1 w-full bg-transparent text-[17px] text-[#171717] outline-none placeholder:text-neutral-300"
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
    <label className="relative flex min-h-[89px] flex-col justify-center rounded-[21px] border border-[#e0e0e0] bg-white px-5 py-3 transition focus-within:border-[#9aa8c0]">
      <span className="text-[15px] font-medium text-[#8490a4]">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full appearance-none bg-transparent pr-8 text-[17px] text-[#171717] outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-5 top-1/2 mt-2 -translate-y-1/2 text-[#596579]">
        ▾
      </span>
    </label>
  );
}