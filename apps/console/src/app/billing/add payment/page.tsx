
"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import {
  X,
  Check,
  CreditCard,
  Smartphone,
  Loader2,
  ShieldCheck,
} from "lucide-react";

const CREDIT_RATE = 1000;
const TAX_RATE = 0.18;
const RAZORPAY_SCRIPT =
  "https://checkout.razorpay.com/v1/checkout.js";

type PaymentMethod = "upi" | "card";
type CheckoutStatus = "loading" | "ready" | "error";

type BillingDetails = {
  fullName: string;
  email: string;
  country: string;
  address1: string;
  address2: string;
  city: string;
  pin: string;
  state: string;
  gst: string;
};

type PaymentResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type UpgradePageProps = {
  onClose?: () => void;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
  };
  theme: {
    color: string;
  };
  config?: Record<string, unknown>;
  modal?: {
    ondismiss?: () => void;
  };
  handler: (response: PaymentResponse) => Promise<void>;
};

type RazorpayCheckout = {
  open: () => void;
  on: (
    event: string,
    callback: (response: unknown) => void
  ) => void;
};

const amounts = [
  { value: 5, label: "$5" },
  { value: 25, label: "$25" },
  { value: 50, label: "$50" },
];

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "11px 12px",
  border: "1px solid #dedfe3",
  borderRadius: 9,
  background: "#fff",
  color: "#171717",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#343434",
  marginBottom: 7,
};

// Read the Razorpay constructor without requiring a global
// TypeScript Window declaration.
function getRazorpay(): any {
  if (typeof window === "undefined") return undefined;

  return (window as any).Razorpay;
}

// Load the Razorpay script once per component instance.
function loadRazorpay(): Promise<any> {
  return new Promise((resolve, reject) => {
    const existing = getRazorpay();

    if (existing) {
      resolve(existing);
      return;
    }

    let script = document.querySelector<HTMLScriptElement>(
      'script[data-modelnow-razorpay="true"]'
    );

    if (script?.dataset.loaded === "true") {
      const constructor = getRazorpay();

      if (constructor) {
        resolve(constructor);
      } else {
        reject(new Error("Razorpay checkout could not initialize."));
      }
      return;
    }

    const handleLoad = () => {
      script!.dataset.loaded = "true";

      const constructor = getRazorpay();

      if (constructor) {
        resolve(constructor);
      } else {
        reject(new Error("Razorpay loaded but checkout is unavailable."));
      }
    };

    const handleError = () => {
      reject(
        new Error(
          "Unable to load Razorpay. Check your internet connection or browser restrictions."
        )
      );
    };

    if (!script) {
      script = document.createElement("script");
      script.src = RAZORPAY_SCRIPT;
      script.async = true;
      script.dataset.modelnowRazorpay = "true";
    }

    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });

    if (!script.isConnected) {
      document.head.appendChild(script);
    }
  });
}

export default function UpgradePage({
  onClose,
}: UpgradePageProps = {}) {
  const [selectedAmount, setSelectedAmount] = useState(25);
  const [customAmount, setCustomAmount] = useState("100");
  const [isCustom, setIsCustom] = useState(false);

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("upi");

  const [checkoutStatus, setCheckoutStatus] =
    useState<CheckoutStatus>("loading");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] =
    useState<"error" | "success">("error");

  const [billing, setBilling] = useState<BillingDetails>({
    fullName: "",
    email: "",
    country: "India",
    address1: "",
    address2: "",
    city: "",
    pin: "",
    state: "",
    gst: "",
  });

  useEffect(() => {
    let mounted = true;

    loadRazorpay()
      .then(() => {
        if (!mounted) return;
        setCheckoutStatus("ready");
        setMessage("");
      })
      .catch((error: unknown) => {
        if (!mounted) return;

        setCheckoutStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to initialize Razorpay."
        );
        setMessageType("error");
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const oldOverflow = document.body.style.overflow;
    const oldOverscroll = document.body.style.overscrollBehavior;

    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";

    return () => {
      document.body.style.overflow = oldOverflow;
      document.body.style.overscrollBehavior = oldOverscroll;
    };
  }, []);

  const amount = isCustom
    ? Number(customAmount)
    : selectedAmount;

  const validAmount =
    Number.isFinite(amount) &&
    amount >= 1 &&
    amount <= 10000;

  const credits = useMemo(
    () => (validAmount ? Math.round(amount * CREDIT_RATE) : 0),
    [amount, validAmount]
  );

  const tax = validAmount ? amount * TAX_RATE : 0;
  const total = validAmount ? amount + tax : 0;

  function showError(text: string) {
    setMessageType("error");
    setMessage(text);
  }

  function showSuccess(text: string) {
    setMessageType("success");
    setMessage(text);
  }

  function updateBilling(
    field: keyof BillingDetails,
    value: string
  ) {
    setBilling((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function validateBilling(): boolean {
    if (!validAmount) {
      showError("Enter an amount between $1 and $10,000.");
      return false;
    }

    if (!billing.fullName.trim()) {
      showError("Please enter your full name.");
      return false;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        billing.email.trim()
      )
    ) {
      showError("Please enter a valid email address.");
      return false;
    }

    if (!billing.address1.trim()) {
      showError("Please enter your billing address.");
      return false;
    }

    if (!billing.city.trim()) {
      showError("Please enter your city.");
      return false;
    }

    if (!/^\d{6}$/.test(billing.pin)) {
      showError("Enter a valid 6-digit PIN code.");
      return false;
    }

    if (!billing.state.trim()) {
      showError("Please enter your state.");
      return false;
    }

    if (
      billing.gst.trim() &&
      !/^[0-9A-Z]{15}$/.test(billing.gst.trim().toUpperCase())
    ) {
      showError("Please enter a valid 15-character GST number.");
      return false;
    }

    return true;
  }

  async function startPayment() {
    if (loading) return;

    setMessage("");

    if (!validateBilling()) return;

    setLoading(true);

    try {
      // Make sure the Razorpay script is available.
      const RazorpayClass = await loadRazorpay();

      setCheckoutStatus("ready");

      // Create the payment order on your backend.
      const orderResponse = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amountUSD: amount,
          credits,
          paymentMethod,
          customer: {
            fullName: billing.fullName.trim(),
            email: billing.email.trim(),
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

      if (
        !orderData.keyId ||
        !orderData.orderId ||
        !orderData.amount ||
        !orderData.currency
      ) {
        throw new Error("Payment order response is incomplete.");
      }

      const options: RazorpayOptions = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "ModelNow",
        description: `${credits.toLocaleString()} ModelNow credits`,
        order_id: orderData.orderId,

        prefill: {
          name: billing.fullName.trim(),
          email: billing.email.trim(),
        },

        theme: {
          color: "#315FEA",
        },

        config: {
          display: {
            blocks: {
              selected_method: {
                name:
                  paymentMethod === "upi"
                    ? "Pay using UPI"
                    : "Pay using Card",
                instruments: [
                  {
                    method: paymentMethod,
                  },
                ],
              },
            },
            sequence: ["block.selected_method"],
            preferences: {
              show_default_blocks: false,
            },
          },
        },

        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },

        handler: async (response: PaymentResponse) => {
          try {
            const verifyResponse = await fetch(
              "/api/razorpay/verify",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  ...response,
                  amountUSD: amount,
                  credits,
                  customerEmail: billing.email.trim(),
                }),
              }
            );

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok) {
              throw new Error(
                verifyData.error || "Payment verification failed."
              );
            }

            showSuccess(
              "Payment signature verified. Credit activation must be confirmed by the billing backend."
            );
          } catch (error) {
            showError(
              error instanceof Error
                ? error.message
                : "Payment verification failed."
            );
          } finally {
            setLoading(false);
          }
        },
      };

      const checkout = new RazorpayClass(
        options
      ) as RazorpayCheckout;

      checkout.on("payment.failed", (response: unknown) => {
        console.error("Razorpay payment failed:", response);
        showError("Payment failed. Please try again.");
        setLoading(false);
      });

      checkout.open();
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : "Something went wrong while starting payment."
      );

      if (!getRazorpay()) {
        setCheckoutStatus("error");
      }

      setLoading(false);
    }
  }

  function closeUpgrade() {
    if (onClose) {
      onClose();
    } else {
      window.location.href = "/dashboard";
    }
  }

  const payDisabled =
    loading ||
    !validAmount ||
    checkoutStatus !== "ready";

  const buttonLabel = loading
    ? "Processing..."
    : checkoutStatus === "loading"
      ? "Loading secure checkout..."
      : checkoutStatus === "error"
        ? "Checkout unavailable"
        : `Pay $${total.toFixed(2)}`;

  return (
    <main
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "grid",
        placeItems: "center",
        background: "rgba(15, 23, 42, 0.48)",
        padding: 16,
        boxSizing: "border-box",
        overflow: "hidden",
        fontFamily: "Arial, sans-serif",
        color: "#171717",
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-title"
        style={{
          width: "100%",
          maxWidth: 500,
          height: "min(820px, calc(100dvh - 48px))",
          background: "#fff",
          border: "1px solid #e7e7eb",
          borderRadius: 16,
          boxShadow: "0 24px 80px rgba(0,0,0,0.20)",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <header
          style={{
            flexShrink: 0,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            padding: "18px 20px",
            borderBottom: "1px solid #ededed",
            background: "#fff",
          }}
        >
          <h1
            id="upgrade-title"
            style={{
              fontSize: 21,
              margin: 0,
              fontWeight: 700,
              lineHeight: 1.3,
            }}
          >
            Start building with ModelNow
          </h1>

          <button
            type="button"
            onClick={closeUpgrade}
            aria-label="Close upgrade"
            style={{
              border: 0,
              background: "#f5f6f8",
              borderRadius: 8,
              cursor: "pointer",
              padding: 7,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={20} />
          </button>
        </header>

        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            overscrollBehavior: "contain",
            padding: 20,
          }}
        >
          {/* Amount selection */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: 8,
              marginBottom: isCustom ? 10 : 20,
            }}
          >
            {amounts.map((item) => {
              const active =
                !isCustom && selectedAmount === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    setSelectedAmount(item.value);
                    setIsCustom(false);
                    setMessage("");
                  }}
                  style={{
                    minHeight: 58,
                    borderRadius: 10,
                    border: active
                      ? "1.5px solid #6b9cff"
                      : "1px solid #dedfe3",
                    background: active ? "#f7faff" : "#fff",
                    cursor: "pointer",
                    color: "#171717",
                    fontSize: 15,
                    fontWeight: 700,
                  }}
                >
                  {item.label}
                  {active && (
                    <Check
                      size={15}
                      color="#315FEA"
                      style={{ marginLeft: 5, verticalAlign: "middle" }}
                    />
                  )}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => {
                setIsCustom(true);
                setMessage("");
              }}
              style={{
                minHeight: 58,
                borderRadius: 10,
                border: isCustom
                  ? "1.5px solid #6b9cff"
                  : "1px solid #dedfe3",
                background: isCustom ? "#f7faff" : "#fff",
                cursor: "pointer",
                color: "#171717",
                fontSize: 15,
                fontWeight: 700,
              }}
            >
              Other
              {isCustom && (
                <Check
                  size={15}
                  color="#315FEA"
                  style={{ marginLeft: 5, verticalAlign: "middle" }}
                />
              )}
            </button>
          </div>

          {isCustom && (
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>
                Enter your amount (USD)
              </label>
              <input
                type="number"
                min="1"
                max="10000"
                step="1"
                value={customAmount}
                onChange={(event) => {
                  setCustomAmount(event.target.value);
                  setMessage("");
                }}
                placeholder="Enter amount"
                style={inputStyle}
              />
              <p style={{ fontSize: 12, color: "#777" }}>
                Minimum $1 · Maximum $10,000
              </p>
            </div>
          )}

          {/* Payment method */}
          <div style={{ marginBottom: 18 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#315FEA",
                marginBottom: 10,
              }}
            >
              Select payment method
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <button
                type="button"
                onClick={() => setPaymentMethod("upi")}
                style={{
                  padding: 13,
                  borderRadius: 11,
                  border:
                    paymentMethod === "upi"
                      ? "1.5px solid #315FEA"
                      : "1px solid #dedfe3",
                  background:
                    paymentMethod === "upi" ? "#f5f8ff" : "#fff",
                  cursor: "pointer",
                  textAlign: "left",
                  color: "#171717",
                }}
              >
                <Smartphone size={21} color="#315FEA" />
                <strong style={{ display: "block", marginTop: 7 }}>
                  UPI
                </strong>
                <span style={{ fontSize: 12, color: "#777" }}>
                  QR code and UPI apps
                </span>
                {paymentMethod === "upi" && (
                  <Check
                    size={17}
                    color="#315FEA"
                    style={{ float: "right" }}
                  />
                )}
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                style={{
                  padding: 13,
                  borderRadius: 11,
                  border:
                    paymentMethod === "card"
                      ? "1.5px solid #315FEA"
                      : "1px solid #dedfe3",
                  background:
                    paymentMethod === "card" ? "#f5f8ff" : "#fff",
                  cursor: "pointer",
                  textAlign: "left",
                  color: "#171717",
                }}
              >
                <CreditCard size={21} color="#315FEA" />
                <strong style={{ display: "block", marginTop: 7 }}>
                  Card
                </strong>
                <span style={{ fontSize: 12, color: "#777" }}>
                  Credit and debit cards
                </span>
                {paymentMethod === "card" && (
                  <Check
                    size={17}
                    color="#315FEA"
                    style={{ float: "right" }}
                  />
                )}
              </button>
            </div>
          </div>

          {/* Billing details */}
          <div
            style={{
              borderTop: "1px solid #ededed",
              paddingTop: 18,
            }}
          >
            <h2 style={{ fontSize: 17, margin: "0 0 14px" }}>
              Billing details
            </h2>

            <div style={{ display: "grid", gap: 12 }}>
              <div>
                <label style={labelStyle}>Full name *</label>
                <input
                  style={inputStyle}
                  value={billing.fullName}
                  onChange={(e) =>
                    updateBilling("fullName", e.target.value)
                  }
                  placeholder="Enter your full name"
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
                />
              </div>

              <div>
                <label style={labelStyle}>Country *</label>
                <select
                  style={inputStyle}
                  value={billing.country}
                  onChange={(e) =>
                    updateBilling("country", e.target.value)
                  }
                >
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
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
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  <label style={labelStyle}>City *</label>
                  <input
                    style={inputStyle}
                    value={billing.city}
                    onChange={(e) =>
                      updateBilling("city", e.target.value)
                    }
                    placeholder="City"
                  />
                </div>

                <div>
                  <label style={labelStyle}>PIN code *</label>
                  <input
                    style={inputStyle}
                    value={billing.pin}
                    maxLength={6}
                    onChange={(e) =>
                      updateBilling(
                        "pin",
                        e.target.value.replace(/\D/g, "")
                      )
                    }
                    placeholder="6-digit PIN"
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>State *</label>
                <input
                  style={inputStyle}
                  value={billing.state}
                  onChange={(e) =>
                    updateBilling("state", e.target.value)
                  }
                  placeholder="State"
                />
              </div>

              <div>
                <label style={labelStyle}>
                  GST number (optional)
                </label>
                <input
                  style={inputStyle}
                  value={billing.gst}
                  maxLength={15}
                  onChange={(e) =>
                    updateBilling(
                      "gst",
                      e.target.value.toUpperCase()
                    )
                  }
                  placeholder="15-character GSTIN"
                />
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div
            style={{
              background: "#f7f8fa",
              border: "1px solid #eceef1",
              borderRadius: 12,
              padding: 15,
              marginTop: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 10,
                fontSize: 14,
              }}
            >
              <span>Usage credits</span>
              <strong>{credits.toLocaleString()} credits</strong>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 10,
                fontSize: 14,
              }}
            >
              <span>Subtotal</span>
              <strong>
                ${validAmount ? amount.toFixed(2) : "0.00"}
              </strong>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 12,
                fontSize: 14,
              }}
            >
              <span>Estimated tax (18%)</span>
              <strong>${tax.toFixed(2)}</strong>
            </div>

            <div
              style={{
                borderTop: "1px solid #dedfe3",
                paddingTop: 12,
                display: "flex",
                justifyContent: "space-between",
                fontSize: 17,
                fontWeight: 700,
              }}
            >
              <span>Total due</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Status message */}
          {message && (
            <div
              role="alert"
              style={{
                marginTop: 14,
                padding: 12,
                borderRadius: 9,
                background:
                  messageType === "success" ? "#ecfdf3" : "#fff3f2",
                color:
                  messageType === "success" ? "#067647" : "#b42318",
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              {message}
            </div>
          )}

          {/* Pay button */}
          <button
            type="button"
            disabled={payDisabled}
            onClick={startPayment}
            style={{
              width: "100%",
              marginTop: 16,
              padding: 14,
              border: 0,
              borderRadius: 10,
              background: payDisabled ? "#9aadd8" : "#315FEA",
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              cursor: payDisabled ? "not-allowed" : "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 9,
            }}
          >
            {(loading || checkoutStatus === "loading") && (
              <Loader2
                size={18}
                style={{
                  animation: "modelnow-spin 1s linear infinite",
                }}
              />
            )}
            {buttonLabel}
          </button>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 6,
              marginTop: 12,
              color: "#777",
              fontSize: 12,
              paddingBottom: 4,
            }}
          >
            <ShieldCheck size={15} />
            Secure payment powered by Razorpay
          </div>
        </div>
      </section>

      <style jsx global>{`
        @keyframes modelnow-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}
