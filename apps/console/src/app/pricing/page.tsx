"use client";

import {
  useState,
  type ChangeEvent,
  type FormEvent,
  type CSSProperties,
} from "react";
import Script from "next/script";
import {
  Smartphone,
  CreditCard,
  Circle,
  CheckCircle2,
  X,
} from "lucide-react";

const CREDIT_RATE = 1000;
const MIN_AMOUNT = 1;
const MAX_AMOUNT = 10000;
const TAX_RATE = 0.18;

type PricingPackage = {
  name: string;
  price: number;
  credits: number;
  description: string;
  popular?: boolean;
};

const packages: PricingPackage[] = [
  {
    name: "Starter",
    price: 5,
    credits: 5000,
    description: "A simple package to get started.",
  },
  {
    name: "Pro",
    price: 25,
    credits: 25000,
    description: "For users with higher usage.",
    popular: true,
  },
  {
    name: "Business",
    price: 50,
    credits: 50000,
    description: "More capacity for business workloads.",
  },
];

const states = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan",
  "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi",
];

type PaymentMethod = "upi" | "card";

type BillingDetails = {
  fullName: string;
  email: string;
  country: string;
  address1: string;
  address2: string;
  city: string;
  pin: string;
  state: string;
  sameShipping: boolean;
  shippingAddress: string;
  shippingCity: string;
  shippingPin: string;
  shippingState: string;
  gst: string;
};

type RazorpayOrder = {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
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
  prefill?: {
    name?: string;
    email?: string;
  };
  theme?: {
    color: string;
  };
  config?: {
    display?: {
      blocks?: Record<
        string,
        {
          name: string;
          instruments: { method: string }[];
        }
      >;
      sequence?: string[];
      preferences?: {
        show_default_blocks?: boolean;
      };
    };
  };
  handler: (response: RazorpayPaymentResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
};

const initialBilling: BillingDetails = {
  fullName: "",
  email: "",
  country: "India",
  address1: "",
  address2: "",
  city: "",
  pin: "",
  state: "",
  sameShipping: true,
  shippingAddress: "",
  shippingCity: "",
  shippingPin: "",
  shippingState: "",
  gst: "",
};

export default function PricingPage() {
  const [customAmount, setCustomAmount] = useState("10");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [selectedPlan, setSelectedPlan] =
    useState<PricingPackage | null>(null);

  const [selectedAmount, setSelectedAmount] = useState(0);
  const [billing, setBilling] = useState<BillingDetails>(initialBilling);

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("upi");

  const [submitting, setSubmitting] = useState(false);
  const [razorpayReady, setRazorpayReady] = useState(false);

  const credits = Math.round(selectedAmount * CREDIT_RATE);
  const estimatedTax = selectedAmount * TAX_RATE;
  const total = selectedAmount + estimatedTax;

  function openCheckout(plan: PricingPackage) {
    setSelectedPlan(plan);
    setSelectedAmount(plan.price);
    setBilling({ ...initialBilling });
    setPaymentMethod("upi");
    setError("");
    setNotice("");
  }

  function openCustomCheckout() {
    const amount = Number(customAmount);

    if (
      !Number.isFinite(amount) ||
      amount < MIN_AMOUNT ||
      amount > MAX_AMOUNT
    ) {
      setError("Enter an amount between $1 and $10,000.");
      return;
    }

    const roundedAmount = Math.round(amount * 100) / 100;

    setSelectedPlan(null);
    setSelectedAmount(roundedAmount);
    setBilling({ ...initialBilling });
    setPaymentMethod("upi");
    setError("");
    setNotice("");
  }

  function updateBilling<K extends keyof BillingDetails>(
    field: K,
    value: BillingDetails[K]
  ) {
    setBilling((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError("");
    setNotice("");
  }

  function closeCheckout() {
    if (submitting) return;

    setSelectedAmount(0);
    setSelectedPlan(null);
    setError("");
    setNotice("");
  }

  function validateBilling(): boolean {
    if (!billing.fullName.trim()) {
      setError("Please enter your full name.");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billing.email.trim())) {
      setError("Please enter a valid email address.");
      return false;
    }

    if (
      !billing.address1.trim() ||
      !billing.city.trim() ||
      !/^\d{6}$/.test(billing.pin) ||
      !billing.state
    ) {
      setError("Please complete all required billing address fields.");
      return false;
    }

    if (
      !billing.sameShipping &&
      (!billing.shippingAddress.trim() ||
        !billing.shippingCity.trim() ||
        !/^\d{6}$/.test(billing.shippingPin) ||
        !billing.shippingState)
    ) {
      setError("Please complete all required shipping address fields.");
      return false;
    }

    if (
      billing.gst &&
      !/^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z0-9]Z[A-Z0-9]$/.test(
        billing.gst.trim().toUpperCase()
      )
    ) {
      setError("Please enter a valid 15-character Indian GST number.");
      return false;
    }

    return true;
  }

  async function startPayment(method: PaymentMethod) {
    setError("");
    setNotice("");

    if (!razorpayReady || !window.Razorpay) {
      setError(
        "Razorpay checkout has not loaded. Please refresh and try again."
      );
      return;
    }

    setSubmitting(true);

    try {
      const orderResponse = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amountUSD: selectedAmount,
          credits,
          paymentMethod: method,
          customer: {
            fullName: billing.fullName,
            email: billing.email,
          },
          billing,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(
          orderData.error || "Unable to create payment order."
        );
      }

      const order = orderData as RazorpayOrder;

      if (!order.orderId || !order.keyId || !order.amount) {
        throw new Error("The payment server returned an invalid order.");
      }

      const options: RazorpayOptions = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "ModelNow",
        description: `${credits.toLocaleString("en-US")} ModelNow credits`,
        order_id: order.orderId,

        prefill: {
          name: billing.fullName.trim(),
          email: billing.email.trim(),
        },

        theme: {
          color: "#93c5fd",
        },

        config: {
          display: {
            blocks: {
              selected_method: {
                name: method === "upi" ? "Pay using UPI" : "Pay using Card",
                instruments: [{ method }],
              },
            },
            sequence: ["block.selected_method"],
            preferences: {
              show_default_blocks: false,
            },
          },
        },

        handler: async (response) => {
          try {
            setSubmitting(true);

            const verifyResponse = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                ...response,
                amountUSD: selectedAmount,
                credits,
                customerEmail: billing.email,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok || !verifyData.verified) {
              throw new Error(
                verifyData.error || "Payment verification failed."
              );
            }

            setNotice(
              "Payment signature verified. Credit activation must be confirmed by the billing backend."
            );

            setSelectedAmount(0);
            setSelectedPlan(null);
          } catch (verificationError) {
            setError(
              verificationError instanceof Error
                ? verificationError.message
                : "Payment verification failed."
            );
          } finally {
            setSubmitting(false);
          }
        },

        modal: {
          ondismiss: () => {
            setSubmitting(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", (response: unknown) => {
        const paymentError = response as {
          error?: { description?: string };
        };

        setError(
          paymentError.error?.description ||
            "Payment failed. Please try again."
        );

        setSubmitting(false);
      });

      setSubmitting(false);
      razorpay.open();
    } catch (paymentError) {
      setSubmitting(false);

      setError(
        paymentError instanceof Error
          ? paymentError.message
          : "Unable to start payment."
      );
    }
  }

  function handlePurchase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!validateBilling()) return;

    void startPayment(paymentMethod);
  }

  const inputStyle: CSSProperties = {
    width: "100%",
    height: "40px",
    padding: "0 11px",
    border: "1px solid #dbeafe",
    borderRadius: "8px",
    background: "#fff",
    color: "#171717",
    fontSize: "13px",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: CSSProperties = {
    display: "block",
    marginBottom: "6px",
    fontSize: "13px",
    fontWeight: 600,
    color: "#334155",
  };

  const sectionStyle: CSSProperties = {
    borderTop: "1px solid #e8eef7",
    marginTop: "19px",
    paddingTop: "17px",
  };

  const fieldGridStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "12px",
  };

  const paymentOptionStyle = (
    method: PaymentMethod
  ): CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: "12px",
    width: "100%",
    padding: "13px",
    border:
      paymentMethod === method
        ? "1.5px solid #bfdbfe"
        : "1px solid #dbeafe",
    borderRadius: "10px",
    background: paymentMethod === method ? "#f0f7ff" : "#fff",
    textAlign: "left",
    cursor: "pointer",
    boxSizing: "border-box",
  });

  const planCardStyle = (popular = false): CSSProperties => ({
    position: "relative",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    padding: "19px 17px",
    border: popular ? "1.5px solid #bfdbfe" : "1px solid #dbeafe",
    borderRadius: "14px",
    background: popular ? "#f8fbff" : "#ffffff",
    boxShadow: "0 4px 14px rgba(15,23,42,0.04)",
    boxSizing: "border-box",
  });

  const buyButtonStyle: CSSProperties = {
    width: "100%",
    minHeight: "39px",
    padding: "9px 12px",
    border: "1px solid #bfdbfe",
    borderRadius: "8px",
    background: "#eaf3ff",
    color: "#111827",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
    marginTop: "auto",
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setRazorpayReady(true)}
        onError={() => {
          setRazorpayReady(false);
          setError(
            "Unable to load Razorpay checkout. Please refresh the page."
          );
        }}
      />

      <main
        style={{
          width: "100%",
          maxWidth: "1150px",
          margin: "0 auto",
          padding: "35px 22px 60px",
          color: "#0f172a",
          boxSizing: "border-box",
        }}
      >
        <header style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: 800,
              margin: "0 0 10px",
              color: "#111827",
            }}
          >
            ModelNow Credits
          </h1>

          <p style={{ color: "#64748b", margin: "0 0 9px", fontSize: "14px" }}>
            Choose a credit package or enter your own amount.
          </p>

          <p style={{ color: "#64748b", fontSize: "12px", margin: 0 }}>
            1 USD = 1,000 credits
          </p>
        </header>

        <section aria-label="Choose Buy Plans">
          <h2
            style={{
              textAlign: "center",
              fontSize: "22px",
              fontWeight: 750,
              color: "#111827",
              margin: "0 0 22px",
            }}
          >
            Choose Buy Plans
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
              gap: "14px",
              alignItems: "stretch",
            }}
          >
            {packages.map((plan) => (
              <div key={plan.price} style={planCardStyle(plan.popular)}>
                {plan.popular && (
                  <span
                    style={{
                      alignSelf: "flex-start",
                      background: "#eaf3ff",
                      color: "#334155",
                      border: "1px solid #dbeafe",
                      borderRadius: "20px",
                      padding: "4px 10px",
                      fontSize: "10px",
                      fontWeight: 700,
                      marginBottom: "10px",
                    }}
                  >
                    POPULAR
                  </span>
                )}

                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#1e293b",
                    margin: "0 0 9px",
                  }}
                >
                  {plan.name}
                </h3>

                <div
                  style={{
                    fontSize: "30px",
                    fontWeight: 750,
                    color: "#111827",
                    letterSpacing: "-1px",
                  }}
                >
                  ${plan.price}
                </div>

                <p
                  style={{
                    color: "#111827",
                    fontSize: "12px",
                    fontWeight: 600,
                    margin: "7px 0 12px",
                  }}
                >
                  {plan.credits.toLocaleString("en-US")} credits
                </p>

                <p
                  style={{
                    color: "#64748b",
                    fontSize: "12px",
                    lineHeight: 1.6,
                    minHeight: "38px",
                    margin: "0 0 15px",
                    flex: 1,
                  }}
                >
                  {plan.description}
                </p>

                <button
                  type="button"
                  onClick={() => openCheckout(plan)}
                  style={buyButtonStyle}
                >
                  Buy Credits
                </button>
              </div>
            ))}

            <div style={planCardStyle()}>
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#1e293b",
                  margin: "0 0 9px",
                }}
              >
                Custom
              </h3>

              <div
                style={{
                  fontSize: "23px",
                  fontWeight: 750,
                  color: "#111827",
                  marginBottom: "10px",
                }}
              >
                Your amount
              </div>

              <p
                style={{
                  color: "#64748b",
                  fontSize: "12px",
                  lineHeight: 1.6,
                  margin: "0 0 12px",
                }}
              >
                Choose the amount of credits you need.
              </p>

              <label htmlFor="custom-amount" style={labelStyle}>
                Amount (USD)
              </label>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid #dbeafe",
                  borderRadius: "8px",
                  background: "#fff",
                  paddingLeft: "10px",
                  marginBottom: "10px",
                }}
              >
                <span style={{ color: "#111827" }}>$</span>

                <input
                  id="custom-amount"
                  type="number"
                  min={MIN_AMOUNT}
                  max={MAX_AMOUNT}
                  step="0.01"
                  value={customAmount}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    setCustomAmount(event.target.value);
                    setError("");
                  }}
                  style={{
                    width: "100%",
                    minWidth: 0,
                    padding: "10px 8px",
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    fontSize: "13px",
                    color: "#111827",
                  }}
                />
              </div>

              <p
                style={{
                  fontSize: "11px",
                  color: "#111827",
                  fontWeight: 600,
                  margin: "0 0 12px",
                }}
              >
                {Math.round(
                  Math.max(0, Number(customAmount) || 0) * CREDIT_RATE
                ).toLocaleString("en-US")} credits
              </p>

              <button
                type="button"
                onClick={openCustomCheckout}
                style={buyButtonStyle}
              >
                Buy Credits
              </button>
            </div>
          </div>

          {error && !selectedAmount && (
            <p role="alert" style={{ color: "#dc2626", fontSize: "13px" }}>
              {error}
            </p>
          )}
        </section>

        {notice && (
          <p
            role="status"
            style={{
              maxWidth: "550px",
              margin: "20px auto",
              padding: "12px",
              borderRadius: "8px",
              background: "#f0fdf4",
              color: "#166534",
              fontSize: "13px",
            }}
          >
            {notice}
          </p>
        )}

        <p
          style={{
            textAlign: "center",
            color: "#64748b",
            fontSize: "12px",
            marginTop: "25px",
          }}
        >
          Payments are processed securely. Credits are added only after
          successful server-side payment verification.
        </p>
      </main>

      {selectedAmount > 0 && (
        <div
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeCheckout();
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(15,23,42,0.48)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px",
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkout-title"
            style={{
              width: "100%",
              maxWidth: "520px",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#fff",
              borderRadius: "14px",
              padding: "20px",
              color: "#171717",
              boxShadow: "0 20px 70px rgba(0,0,0,0.2)",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <div>
                <h2
                  id="checkout-title"
                  style={{ fontSize: "20px", fontWeight: 750, margin: 0 }}
                >
                  Complete your purchase
                </h2>

                <p
                  style={{
                    fontSize: "12px",
                    color: "#888",
                    margin: "4px 0 0",
                  }}
                >
                  Select payment method and enter your billing details.
                </p>
              </div>

              <button
                type="button"
                onClick={closeCheckout}
                disabled={submitting}
                aria-label="Close checkout"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "none",
                  background: "#f3f4f6",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  cursor: submitting ? "not-allowed" : "pointer",
                  flexShrink: 0,
                }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePurchase}>
              <div style={{ marginBottom: "20px" }}>
                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    margin: "0 0 10px",
                  }}
                >
                  Select payment method
                </h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                  }}
                >
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => {
                      setPaymentMethod("upi");
                      setError("");
                    }}
                    aria-pressed={paymentMethod === "upi"}
                    style={paymentOptionStyle("upi")}
                  >
                    <Smartphone size={24} strokeWidth={1.8} />

                    <span style={{ flex: 1 }}>
                      <strong
                        style={{
                          display: "block",
                          fontSize: "13px",
                          color: "#171717",
                        }}
                      >
                        UPI
                      </strong>

                      <span
                        style={{
                          display: "block",
                          fontSize: "11px",
                          color: "#777",
                          marginTop: "3px",
                        }}
                      >
                        UPI app / QR
                      </span>
                    </span>

                    <span style={{ color: "#2563eb", display: "flex" }}>
                      {paymentMethod === "upi" ? (
                        <CheckCircle2 size={20} />
                      ) : (
                        <Circle size={20} />
                      )}
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => {
                      setPaymentMethod("card");
                      setError("");
                    }}
                    aria-pressed={paymentMethod === "card"}
                    style={paymentOptionStyle("card")}
                  >
                    <CreditCard size={24} strokeWidth={1.8} />

                    <span style={{ flex: 1 }}>
                      <strong
                        style={{
                          display: "block",
                          fontSize: "13px",
                          color: "#171717",
                        }}
                      >
                        Card
                      </strong>

                      <span
                        style={{
                          display: "block",
                          fontSize: "11px",
                          color: "#777",
                          marginTop: "3px",
                        }}
                      >
                        Credit / Debit
                      </span>
                    </span>

                    <span style={{ color: "#2563eb", display: "flex" }}>
                      {paymentMethod === "card" ? (
                        <CheckCircle2 size={20} />
                      ) : (
                        <Circle size={20} />
                      )}
                    </span>
                  </button>
                </div>
              </div>

              <div
                style={{
                  borderTop: "1px solid #e8e8e8",
                  paddingTop: "17px",
                }}
              >
                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    marginBottom: "13px",
                  }}
                >
                  Billing address
                </h3>

                <div style={{ display: "grid", gap: "12px" }}>
                  <div>
                    <label style={labelStyle}>Full name *</label>
                    <input
                      style={inputStyle}
                      value={billing.fullName}
                      onChange={(e) =>
                        updateBilling("fullName", e.target.value)
                      }
                      placeholder="Enter your full name"
                      autoComplete="name"
                      required
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Email address *</label>
                    <input
                      type="email"
                      style={inputStyle}
                      value={billing.email}
                      onChange={(e) =>
                        updateBilling("email", e.target.value)
                      }
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Country or region *</label>
                    <select
                      style={inputStyle}
                      value={billing.country}
                      onChange={(e) =>
                        updateBilling("country", e.target.value)
                      }
                    >
                      <option>India</option>
                      <option>United States</option>
                      <option>United Kingdom</option>
                      <option>Canada</option>
                      <option>Australia</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Address line 1 *</label>
                    <input
                      style={inputStyle}
                      value={billing.address1}
                      onChange={(e) =>
                        updateBilling("address1", e.target.value)
                      }
                      placeholder="Street address"
                      autoComplete="address-line1"
                      required
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Address line 2</label>
                    <input
                      style={inputStyle}
                      value={billing.address2}
                      onChange={(e) =>
                        updateBilling("address2", e.target.value)
                      }
                      placeholder="Apartment, suite, etc. (optional)"
                      autoComplete="address-line2"
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>City *</label>
                    <input
                      style={inputStyle}
                      value={billing.city}
                      onChange={(e) =>
                        updateBilling("city", e.target.value)
                      }
                      placeholder="City"
                      autoComplete="address-level2"
                      required
                    />
                  </div>

                  <div style={fieldGridStyle}>
                    <div>
                      <label style={labelStyle}>PIN *</label>
                      <input
                        style={inputStyle}
                        inputMode="numeric"
                        maxLength={6}
                        value={billing.pin}
                        onChange={(e) =>
                          updateBilling(
                            "pin",
                            e.target.value.replace(/\D/g, "")
                          )
                        }
                        placeholder="6-digit PIN"
                        autoComplete="postal-code"
                        required
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>State *</label>
                      <select
                        style={inputStyle}
                        value={billing.state}
                        onChange={(e) =>
                          updateBilling("state", e.target.value)
                        }
                        required
                      >
                        <option value="">Select state</option>
                        {states.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div style={sectionStyle}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "9px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={billing.sameShipping}
                    onChange={(e) =>
                      updateBilling("sameShipping", e.target.checked)
                    }
                    style={{
                      width: "17px",
                      height: "17px",
                      margin: "1px 0 0",
                      flexShrink: 0,
                    }}
                  />

                  <span>
                    My shipping address is the same as my billing address

                    <span
                      style={{
                        display: "block",
                        color: "#888",
                        fontWeight: 400,
                        marginTop: "4px",
                      }}
                    >
                      This information is used for tax purposes.
                    </span>
                  </span>
                </label>
              </div>

              {!billing.sameShipping && (
                <div
                  style={{
                    ...sectionStyle,
                    display: "grid",
                    gap: "12px",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      margin: 0,
                    }}
                  >
                    Shipping address
                  </h3>

                  <div>
                    <label style={labelStyle}>Address line 1 *</label>
                    <input
                      style={inputStyle}
                      placeholder="Address line 1"
                      value={billing.shippingAddress}
                      onChange={(e) =>
                        updateBilling("shippingAddress", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>City *</label>
                    <input
                      style={inputStyle}
                      placeholder="City"
                      value={billing.shippingCity}
                      onChange={(e) =>
                        updateBilling("shippingCity", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div style={fieldGridStyle}>
                    <div>
                      <label style={labelStyle}>PIN *</label>
                      <input
                        style={inputStyle}
                        placeholder="PIN"
                        inputMode="numeric"
                        value={billing.shippingPin}
                        maxLength={6}
                        onChange={(e) =>
                          updateBilling(
                            "shippingPin",
                            e.target.value.replace(/\D/g, "")
                          )
                        }
                        required
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>State *</label>
                      <select
                        style={inputStyle}
                        value={billing.shippingState}
                        onChange={(e) =>
                          updateBilling("shippingState", e.target.value)
                        }
                        required
                      >
                        <option value="">Select state</option>
                        {states.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div style={sectionStyle}>
                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    marginBottom: "7px",
                  }}
                >
                  Business tax ID
                </h3>

                <p
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    marginBottom: "10px",
                  }}
                >
                  If you are a business tax registrant, enter your business
                  tax ID.
                </p>

                <label style={labelStyle}>Indian GST number</label>
                <input
                  style={inputStyle}
                  placeholder="12ABCDE3456FGZH"
                  maxLength={15}
                  value={billing.gst}
                  onChange={(e) =>
                    updateBilling("gst", e.target.value.toUpperCase())
                  }
                />
              </div>

              {/* UPDATED PAYMENT SUMMARY */}
              <div
                style={{
                  border: "1px solid #dbeafe",
                  borderRadius: "9px",
                  padding: "14px",
                  marginTop: "19px",
                  background: "#f8fbff",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                    fontSize: "13px",
                  }}
                >
                  <span style={{ color: "#64748b" }}>
                    Usage Credits
                  </span>

                  <span style={{ color: "#111827", fontWeight: 700 }}>
                    {credits.toLocaleString("en-US")} credits
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "10px",
                    fontSize: "13px",
                  }}
                >
                  <span style={{ color: "#64748b" }}>
                    Subtotal
                  </span>

                  <span style={{ color: "#111827" }}>
                    ${selectedAmount.toFixed(2)}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "12px",
                    fontSize: "13px",
                  }}
                >
                  <span style={{ color: "#64748b" }}>
                    Estimated Tax (18%)
                  </span>

                  <span style={{ color: "#111827" }}>
                    ${estimatedTax.toFixed(2)}
                  </span>
                </div>

                <div
                  style={{
                    borderTop: "1px solid #dbeafe",
                    paddingTop: "12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontWeight: 700,
                  }}
                >
                  <span style={{ fontSize: "14px" }}>
                    Total Due
                  </span>

                  <span style={{ fontSize: "22px", color: "#111827" }}>
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>
              {/* END UPDATED PAYMENT SUMMARY */}

              <p
                style={{
                  fontSize: "12px",
                  color: "#666",
                  marginTop: "13px",
                }}
              >
                {credits.toLocaleString("en-US")} credits will be purchased.
                Selected plan: {selectedPlan?.name || "Custom amount"}.
              </p>

              {error && (
                <p
                  role="alert"
                  style={{
                    color: "#b91c1c",
                    background: "#fef2f2",
                    borderRadius: "8px",
                    padding: "10px",
                    fontSize: "12px",
                    marginTop: "12px",
                  }}
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: "100%",
                  minHeight: "46px",
                  marginTop: "16px",
                  background: "#eaf3ff",
                  color: "#111827",
                  border: "1px solid #bfdbfe",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: submitting ? "not-allowed" : "pointer",
                  opacity: submitting ? 0.65 : 1,
                }}
              >
                {submitting
                  ? "Connecting securely..."
                  : `Pay with ${
                      paymentMethod === "upi" ? "UPI" : "Card"
                    } - $${total.toFixed(2)}`}
              </button>

              <p
                style={{
                  color: "#888",
                  fontSize: "11px",
                  lineHeight: 1.5,
                  marginTop: "13px",
                  textAlign: "center",
                }}
              >
                Secure payment powered by Razorpay. Your payment is verified
                by the server.
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}