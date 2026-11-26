"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

type RazorpayPaymentResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

let razorpayLoadPromise: Promise<boolean> | null = null;

function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") {
    return Promise.resolve(false);
  }

  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  if (razorpayLoadPromise) {
    return razorpayLoadPromise;
  }

  razorpayLoadPromise = new Promise<boolean>((resolve) => {
    let completed = false;

    const finish = (success: boolean) => {
      if (completed) return;

      completed = true;
      window.clearTimeout(timeout);

      if (!success) {
        razorpayLoadPromise = null;
      }

      resolve(success);
    };

    const timeout = window.setTimeout(() => {
      finish(!!window.Razorpay);
    }, 15000);

    let script = document.querySelector<HTMLScriptElement>(
      `script[src="${RAZORPAY_SCRIPT}"]`
    );

    if (script?.dataset.loaded === "true" && window.Razorpay) {
      finish(true);
      return;
    }

    if (!script) {
      script = document.createElement("script");
      script.src = RAZORPAY_SCRIPT;
      script.async = true;
      script.dataset.loaded = "false";
    }

    const onLoad = () => {
      script!.dataset.loaded = "true";
      finish(!!window.Razorpay);
    };

    const onError = () => {
      finish(false);
    };

    script.addEventListener("load", onLoad, { once: true });
    script.addEventListener("error", onError, { once: true });

    if (!script.isConnected) {
      document.body.appendChild(script);
    }
  });

  return razorpayLoadPromise;
}

const amounts = [
  { value: 5, label: "$5" },
  { value: 25, label: "$25" },
  { value: 50, label: "$50" },
];

type UpgradePageProps = {
  onClose?: () => void;
};

export default function UpgradePage({
  onClose,
}: UpgradePageProps = {}) {
  const [selectedAmount, setSelectedAmount] = useState(25);
  const [customAmount, setCustomAmount] = useState("100");
  const [isCustom, setIsCustom] = useState(false);
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("upi");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const paymentInProgress = useRef(false);

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

  // Prevent background page scrolling.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousOverscroll =
      document.body.style.overscrollBehavior;

    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.overscrollBehavior =
        previousOverscroll;
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
    () =>
      validAmount
        ? Math.round(amount * CREDIT_RATE)
        : 0,
    [amount, validAmount]
  );

  const tax = validAmount ? amount * TAX_RATE : 0;
  const total = amount + tax;

  function chooseAmount(value: number) {
    setSelectedAmount(value);
    setIsCustom(false);
    setMessage("");
  }

  function chooseCustom() {
    setIsCustom(true);
    setMessage("");
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

  function validateBilling() {
    if (!validAmount) {
      setMessage("Enter an amount between $1 and $10,000.");
      return false;
    }

    if (!billing.fullName.trim()) {
      setMessage("Please enter your full name.");
      return false;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billing.email)
    ) {
      setMessage("Please enter a valid email address.");
      return false;
    }

    if (!billing.address1.trim()) {
      setMessage("Please enter your billing address.");
      return false;
    }

    if (!billing.city.trim()) {
      setMessage("Please enter your city.");
      return false;
    }

    if (!/^\d{6}$/.test(billing.pin)) {
      setMessage("Enter a valid 6-digit PIN code.");
      return false;
    }

    if (!billing.state.trim()) {
      setMessage("Please enter your state.");
      return false;
    }

    if (
      billing.gst.trim() &&
      !/^[0-9A-Z]{15}$/.test(
        billing.gst.trim().toUpperCase()
      )
    ) {
      setMessage(
        "Please enter a valid 15-character GST number."
      );
      return false;
    }

    return true;
  }

  function finishPayment() {
    paymentInProgress.current = false;
    setLoading(false);
  }

  async function startPayment() {
    if (paymentInProgress.current) return;

    setMessage("");

    if (!validateBilling()) return;

    paymentInProgress.current = true;
    setLoading(true);

    try {
      // Wait for Razorpay instead of immediately showing
      // the checkout-loading error.
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded || !window.Razorpay) {
        throw new Error(
          "Unable to load Razorpay checkout. Please check your internet connection and try again."
        );
      }

      // Create Razorpay order.
      const orderResponse = await fetch(
        "/api/razorpay/order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amountUSD: amount,
            credits,
            paymentMethod,
            customer: {
              fullName: billing.fullName,
              email: billing.email,
            },
            billing,
          }),
        }
      );

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(
          orderData.error ||
            "Unable to create payment order."
        );
      }

      if (
        !orderData.orderId ||
        !orderData.keyId ||
        !orderData.amount ||
        !orderData.currency
      ) {
        throw new Error(
          "Invalid payment order response from the server."
        );
      }

      const Razorpay = window.Razorpay;

      if (!Razorpay) {
        throw new Error(
          "Razorpay checkout is unavailable. Please try again."
        );
      }

      const razorpay = new Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "ModelNow",
        description: `${credits.toLocaleString()} ModelNow credits`,
        order_id: orderData.orderId,

        prefill: {
          name: billing.fullName,
          email: billing.email,
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

        handler: async (response: RazorpayPaymentResponse) => {
          try {
            setMessage("Verifying your payment...");

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
                  customerEmail: billing.email,
                }),
              }
            );

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok) {
              throw new Error(
                verifyData.error ||
                  "Payment verification failed."
              );
            }

            if (
              verifyData.success !== true ||
              verifyData.verified !== true
            ) {
              throw new Error(
                verifyData.error ||
                  "Payment could not be verified."
              );
            }

            setMessage(
              "Payment signature verified successfully. Credit activation must be confirmed by the billing backend."
            );
          } catch (error) {
            setMessage(
              error instanceof Error
                ? error.message
                : "Payment verification failed."
            );
          } finally {
            finishPayment();
          }
        },

        modal: {
          ondismiss: () => {
            setMessage(
              "Payment window closed. You can try again."
            );
            finishPayment();
          },
        },
      });

      razorpay.on(
        "payment.failed",
        (response: unknown) => {
          console.error(
            "Razorpay payment failed:",
            response
          );

          setMessage(
            "Payment failed or was cancelled. Please try again."
          );

          finishPayment();
        }
      );

      // Keep loading active until checkout is closed,
      // payment fails, or verification finishes.
      razorpay.open();
    } catch (error) {
      console.error("Upgrade payment error:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while starting payment."
      );

      finishPayment();
    }
  }

  const inputStyle: React.CSSProperties = {
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

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "#343434",
    marginBottom: 7,
  };

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
        {/* Popup header */}
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
            onClick={() =>
              onClose
                ? onClose()
                : (window.location.href = "/dashboard")
            }
            aria-label="Close upgrade"
            style={{
              border: 0,
              background: "#f5f6f8",
              borderRadius: 8,
              cursor: "pointer",
              padding: 7,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={20} />
          </button>
        </header>

        {/* Scrollable popup content */}
        <div
          className="upgrade-popup-scroll"
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            overscrollBehavior: "contain",
            padding: 20,
            scrollbarWidth: "thin",
            scrollbarColor: "#c7cbd3 transparent",
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
                !isCustom &&
                selectedAmount === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => chooseAmount(item.value)}
                  style={{
                    minHeight: 58,
                    textAlign: "center",
                    padding: "10px 5px",
                    borderRadius: 10,
                    border: active
                      ? "1.5px solid #6b9cff"
                      : "1px solid #dedfe3",
                    background: active ? "#f7faff" : "#fff",
                    cursor: "pointer",
                    color: "#171717",
                    fontSize: 15,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 5,
                  }}
                >
                  {item.label}
                  {active && <Check size={15} color="#315FEA" />}
                </button>
              );
            })}

            <button
              type="button"
              onClick={chooseCustom}
              style={{
                minHeight: 58,
                textAlign: "center",
                padding: "10px 5px",
                borderRadius: 10,
                border: isCustom
                  ? "1.5px solid #6b9cff"
                  : "1px solid #dedfe3",
                background: isCustom ? "#f7faff" : "#fff",
                cursor: "pointer",
                color: "#171717",
                fontSize: 15,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
              }}
            >
              Other
              {isCustom && <Check size={15} color="#315FEA" />}
            </button>
          </div>

          {/* Custom amount */}
          {isCustom && (
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>
                Enter your amount (USD)
              </label>

              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: 13,
                    top: 11,
                    fontSize: 15,
                    color: "#666",
                  }}
                >
                  $
                </span>

                <input
                  type="number"
                  min="1"
                  max="10000"
                  step="1"
                  value={customAmount}
                  onChange={(event) =>
                    setCustomAmount(event.target.value)
                  }
                  placeholder="Enter amount"
                  style={{
                    ...inputStyle,
                    paddingLeft: 29,
                  }}
                />
              </div>

              <p
                style={{
                  fontSize: 12,
                  color: "#777",
                  margin: "6px 0 0",
                }}
              >
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

          {/* Error and status message */}
          {message && (
            <div
              role="alert"
              style={{
                marginTop: 14,
                padding: 12,
                borderRadius: 9,
                background: "#fff3f2",
                color: "#b42318",
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              {message}
            </div>
          )}

          {/* Payment button */}
          <button
            type="button"
            disabled={loading || !validAmount}
            onClick={startPayment}
            style={{
              width: "100%",
              marginTop: 16,
              padding: 14,
              border: 0,
              borderRadius: 10,
              background:
                loading || !validAmount ? "#9aadd8" : "#315FEA",
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              cursor:
                loading || !validAmount
                  ? "not-allowed"
                  : "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 9,
            }}
          >
            {loading ? (
              <>
                <Loader2
                  size={18}
                  style={{ animation: "spin 1s linear infinite" }}
                />
                Processing...
              </>
            ) : (
              `Pay $${total.toFixed(2)}`
            )}
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
    </main>
  );
}