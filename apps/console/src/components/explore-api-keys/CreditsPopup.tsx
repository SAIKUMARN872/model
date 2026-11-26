
"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Coins,
  CreditCard,
  ShieldCheck,
  Smartphone,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface CreditsPopupProps {
  featureName?: string;
  pricePerTask?: number;
  unitLabel?: string;
}

interface Billing {
  fullName: string;
  email: string;
  country: string;
  address1: string;
  address2: string;
  state: string;
  pin: string;
}

type PaymentMethod = "upi" | "card";

interface FeatureConfig {
  name: string;
  price: number;
  unitLabel: string;
  keywords: string[];
}

interface RazorpayOrder {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  totalINR?: string;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  method?: Record<string, boolean>;
  prefill?: {
    name?: string;
    email?: string;
  };
  theme?: {
    color: string;
  };
  config?: any;
  handler: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

const MAX_TASK_QUANTITY = 10000;
const GST_RATE = 0.18;

const FEATURE_CATALOG: FeatureConfig[] = [
  {
    name: "Knowledge Hub API",
    price: 0.01,
    unitLabel: "Per search",
    keywords: ["knowledge hub", "knowledge-hub", "knowledge_hub"],
  },
  {
    name: "Agents & Workflows API",
    price: 0.05,
    unitLabel: "Per workflow execution",
    keywords: [
      "agents & workflows",
      "agents and workflows",
      "workflows",
      "agents-workflows",
    ],
  },
  {
    name: "Fine-Tuning API",
    price: 10,
    unitLabel: "Per training job, plus compute",
    keywords: ["fine-tuning", "fine tuning", "finetuning", "fine_tuning"],
  },
  {
    name: "Computer Use API",
    price: 0.1,
    unitLabel: "Per computer-use task",
    keywords: ["computer use", "computer-use", "computer_use"],
  },
  {
    name: "Multimodal AI API",
    price: 0.05,
    unitLabel: "Per operation",
    keywords: ["multimodal ai", "multimodal-ai", "multimodal_ai", "multimodal"],
  },
  {
    name: "Browser Automation API",
    price: 0.05,
    unitLabel: "Per browser task",
    keywords: ["browser automation", "browser-automation", "browser_automation"],
  },
];

const countryCodes = `
AD AE AF AG AL AM AR AT AU AZ BA BB BD BE BG BO BR BS BT BW BY
CA CH CL CN CO CR CY CZ DE DK DO DZ EC EE ES ET FI FJ FR GB GE GH
GR HK HR HU ID IE IL IN IQ IR IS JM JO JP KE KG KH KR KW KZ LA LB
LK LT LU LV MA MC MD ME MK MM MN MO MT MU MV MX MY MZ NG NL NO NP
NZ OM PA PE PH PK PL PT QA RO RS SA SE SG SI SK TH TN TR TW TZ UA
UG US UY UZ VE VN ZA ZM ZW
`.trim().split(/\s+/);

function getCountryList() {
  try {
    const names = new Intl.DisplayNames(["en"], { type: "region" });

    return countryCodes
      .map((code) => ({
        code,
        name: names.of(code) || code,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return countryCodes.map((code) => ({
      code,
      name: code,
    }));
  }
}

function detectFeature(
  explicitName?: string,
  explicitPrice?: number,
  explicitUnitLabel?: string
) {
  if (explicitName?.trim()) {
    const normalized = explicitName.trim().toLowerCase();

    const matched = FEATURE_CATALOG.find(
      (feature) =>
        feature.name.toLowerCase() === normalized ||
        feature.keywords.some((keyword) => normalized.includes(keyword))
    );

    return {
      name: matched?.name || explicitName.trim(),
      price:
        Number.isFinite(explicitPrice) && (explicitPrice || 0) > 0
          ? explicitPrice!
          : matched?.price ?? 0.05,
      unitLabel:
        explicitUnitLabel ||
        matched?.unitLabel ||
        `Per ${explicitName.toLowerCase()} task`,
    };
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const pageText =
      `${window.location.pathname} ${window.location.hash} ${window.location.search}`.toLowerCase();

    for (const feature of FEATURE_CATALOG) {
      if (feature.keywords.some((keyword) => pageText.includes(keyword))) {
        return {
          name: feature.name,
          price: explicitPrice ?? feature.price,
          unitLabel: explicitUnitLabel || feature.unitLabel,
        };
      }
    }

    const headings = Array.from(
      document.querySelectorAll(
        'h1, h2, h3, [aria-selected="true"], [data-state="active"], .active'
      )
    )
      .map((element) => element.textContent?.trim().toLowerCase() || "")
      .filter(Boolean);

    for (const heading of headings) {
      for (const feature of FEATURE_CATALOG) {
        if (feature.keywords.some((keyword) => heading.includes(keyword))) {
          return {
            name: feature.name,
            price: explicitPrice ?? feature.price,
            unitLabel: explicitUnitLabel || feature.unitLabel,
          };
        }
      }
    }
  }

  return {
    name: "Browser Automation API",
    price: explicitPrice ?? 0.05,
    unitLabel: explicitUnitLabel || "Per browser task",
  };
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve(!!window.Razorpay);
        return;
      }

      existing.addEventListener(
        "load",
        () => resolve(!!window.Razorpay),
        { once: true }
      );

      existing.addEventListener("error", () => resolve(false), {
        once: true,
      });

      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => {
      script.dataset.loaded = "true";
      resolve(!!window.Razorpay);
    };

    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
}

export default function CreditsPopup({
  featureName,
  pricePerTask,
  unitLabel,
}: CreditsPopupProps) {
  const countries = useMemo(() => getCountryList(), []);

  const [open, setOpen] = useState(false);

  const [activeFeature, setActiveFeature] = useState(() =>
    detectFeature(featureName, pricePerTask, unitLabel)
  );

  const [quantityInput, setQuantityInput] = useState("20");

  const [billing, setBilling] = useState<Billing>({
    fullName: "",
    email: "",
    country: "IN",
    address1: "",
    address2: "",
    state: "",
    pin: "",
  });

  const [gstNumber, setGstNumber] = useState("");

  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>("upi");

  const [notice, setNotice] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);
  const [orderDetails, setOrderDetails] = useState<RazorpayOrder | null>(null);

  useEffect(() => {
    setActiveFeature(detectFeature(featureName, pricePerTask, unitLabel));
  }, [featureName, pricePerTask, unitLabel]);

  useEffect(() => {
    let mounted = true;

    loadRazorpayScript().then((ready) => {
      if (mounted) setScriptReady(ready);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const resolvedFeatureName = activeFeature.name;
  const unitPrice = activeFeature.price;
  const resolvedUnitLabel = activeFeature.unitLabel;
  const isFineTuning = unitPrice >= 10;

  const quantity = Number(quantityInput);

  const validQuantity =
    Number.isSafeInteger(quantity) &&
    quantity >= 1 &&
    quantity <= MAX_TASK_QUANTITY;

  const quantityLabel = isFineTuning ? "training jobs" : "tasks";
  const unitCostLabel = isFineTuning ? "Cost per job" : "Cost per task";

  const subtotal = useMemo(
    () =>
      validQuantity ? Number((quantity * unitPrice).toFixed(2)) : 0,
    [quantity, unitPrice, validQuantity]
  );

  const estimatedTax = useMemo(
    () => Number((subtotal * GST_RATE).toFixed(2)),
    [subtotal]
  );

  const totalDue = useMemo(
    () => Number((subtotal + estimatedTax).toFixed(2)),
    [subtotal, estimatedTax]
  );

  const total = subtotal;

  const quickButtons = isFineTuning ? [1, 2, 5, 10] : [10, 20, 50, 100];

  const formatMoney = (amount: number) => `$${amount.toFixed(2)}`;

  const updateBilling = (field: keyof Billing, value: string) => {
    setBilling((previous) => ({
      ...previous,
      [field]: value,
    }));
    setNotice("");
  };

  const resetPopup = () => {
    setOpen(false);
    setNotice("");
    setPaymentError("");
    setPaymentSuccess(false);
    setLoading(false);
    setOrderDetails(null);
    setSelectedPaymentMethod("upi");
  };

  const openPopup = () => {
    const detected = detectFeature(featureName, pricePerTask, unitLabel);

    setActiveFeature(detected);
    setQuantityInput(detected.price >= 10 ? "1" : "20");
    setSelectedPaymentMethod("upi");
    setOpen(true);
    setNotice("");
    setPaymentError("");
    setPaymentSuccess(false);
    setOrderDetails(null);
  };

  const startRazorpayPayment = async (method: PaymentMethod) => {
    if (loading) return;

    setSelectedPaymentMethod(method);
    setPaymentError("");
    setNotice("");
    setPaymentSuccess(false);
    setLoading(true);

    try {
      if (!validQuantity || total <= 0) {
        throw new Error("Please enter a valid purchase quantity.");
      }

      let ready = scriptReady && !!window.Razorpay;

      if (!ready) {
        ready = await loadRazorpayScript();
        setScriptReady(ready);
      }

      if (!ready || !window.Razorpay) {
        throw new Error(
          "Razorpay Checkout could not be loaded. Please check your internet connection and try again."
        );
      }

      const orderResponse = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          amountUSD: subtotal,
          credits: quantity,
          paymentMethod: method,
          customer: {
            fullName: billing.fullName.trim(),
            email: billing.email.trim(),
          },
          billing: {
            ...billing,
            gstNumber,
          },
          featureName: resolvedFeatureName,
          quantity,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(
          orderData?.error || "Unable to create a Razorpay order."
        );
      }

      if (
        !orderData.orderId ||
        !orderData.keyId ||
        !orderData.amount ||
        !orderData.currency
      ) {
        throw new Error("The payment server returned incomplete order details.");
      }

      const order: RazorpayOrder = {
        orderId: orderData.orderId,
        amount: orderData.amount,
        currency: orderData.currency,
        keyId: orderData.keyId,
        totalINR: orderData.totalINR,
      };

      setOrderDetails(order);

      const options: RazorpayOptions = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "ModelNow",
        description: `${resolvedFeatureName} - ${quantity} units`,
        order_id: order.orderId,

        prefill: {
          name: billing.fullName.trim(),
          email: billing.email.trim(),
        },

        theme: {
          color: "#315FEA",
        },

        method: {
          upi: method === "upi",
          card: method === "card",
          netbanking: false,
          wallet: false,
          emi: false,
          paylater: false,
        },

        config: {
          display: {
            blocks: {
              selected_method: {
                name: method === "upi" ? "UPI" : "Cards",
                instruments:
                  method === "upi"
                    ? [{ method: "upi" }]
                    : [{ method: "card" }],
              },
            },
            sequence: ["block.selected_method"],
            preferences: {
              show_default_blocks: false,
            },
          },
        },

        handler: async (response: RazorpayResponse) => {
          try {
            const verifyResponse = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                amountUSD: subtotal,
                credits: quantity,
                customerEmail: billing.email.trim(),
                featureName: resolvedFeatureName,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (
              !verifyResponse.ok ||
              !verifyData.success ||
              !verifyData.verified
            ) {
              throw new Error(
                verifyData?.error || "Payment verification failed."
              );
            }

            setPaymentSuccess(true);
            setPaymentError("");
          } catch (error) {
            setPaymentSuccess(false);
            setPaymentError(
              error instanceof Error
                ? error.message
                : "Unable to verify payment."
            );
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", (response: any) => {
        setLoading(false);
        setPaymentSuccess(false);
        setPaymentError(
          response?.error?.description ||
            response?.error?.reason ||
            "Payment failed. Please try again."
        );
      });

      razorpay.open();
    } catch (error) {
      setLoading(false);
      setPaymentError(
        error instanceof Error
          ? error.message
          : "Unable to start payment."
      );
    }
  };

  const continueToPayment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validQuantity) {
      setNotice(
        `Enter a quantity between 1 and ${MAX_TASK_QUANTITY.toLocaleString("en-US")}.`
      );
      return;
    }

    if (
      !billing.fullName.trim() ||
      !billing.email.trim() ||
      !billing.country ||
      !billing.address1.trim() ||
      !billing.state.trim() ||
      !billing.pin.trim()
    ) {
      setNotice("Please complete all required billing details.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billing.email.trim())) {
      setNotice("Please enter a valid email address.");
      return;
    }

    setNotice("");
    startRazorpayPayment(selectedPaymentMethod);
  };

  return (
    <>
      <button
        type="button"
        className="mn-buy-credits"
        onClick={openPopup}
      >
        <Coins size={16} />
        Buy Credits
      </button>

      {open && (
        <div
          className="mn-credit-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !loading) {
              resetPopup();
            }
          }}
        >
          <section
            className="mn-credit-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mn-credit-title"
          >
            {paymentSuccess ? (
              <div className="mn-payment-result">
                <CheckCircle2 size={45} color="#16a34a" />
                <h3>Payment verification successful</h3>
                <p>
                  Razorpay returned a valid payment signature.
                  Your billing backend must confirm credit activation.
                </p>

                {orderDetails && (
                  <p className="mn-order-reference">
                    Order ID: {orderDetails.orderId}
                  </p>
                )}

                <button
                  type="button"
                  className="mn-pay-button"
                  onClick={resetPopup}
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <header className="mn-credit-header">
                  <div>
                    <span className="mn-credit-eyebrow">
                      MODELNOW · TASK CREDITS
                    </span>
                    <h2 id="mn-credit-title">Buy Credits</h2>
                    <p>{resolvedFeatureName}</p>
                  </div>

                  <button
                    type="button"
                    className="mn-credit-close"
                    onClick={resetPopup}
                    aria-label="Close popup"
                    disabled={loading}
                  >
                    <X size={19} />
                  </button>
                </header>

                <div className="mn-feature-price">
                  <div>
                    <span className="mn-small-label">
                      {isFineTuning
                        ? "PRICE PER TRAINING JOB"
                        : "PRICE PER TASK"}
                    </span>
                    <strong>
                      ${unitPrice.toFixed(2)}
                      {isFineTuning ? "+" : ""}
                    </strong>
                    <p>{resolvedUnitLabel}</p>
                  </div>

                  <div className="mn-price-icon">
                    <Coins size={22} />
                  </div>
                </div>

                <div className="mn-quantity-section">
                  <label htmlFor="mn-quantity">
                    {isFineTuning
                      ? "Select job quantity"
                      : "Select task quantity"}
                  </label>

                  <input
                    id="mn-quantity"
                    type="number"
                    min="1"
                    max={MAX_TASK_QUANTITY}
                    step="1"
                    value={quantityInput}
                    onChange={(event) => {
                      setQuantityInput(event.target.value);
                      setNotice("");
                    }}
                    placeholder="Enter quantity"
                    disabled={loading}
                  />

                  <div className="mn-quantity-buttons">
                    {quickButtons.map((value) => (
                      <button
                        type="button"
                        key={value}
                        className={quantity === value ? "selected" : ""}
                        onClick={() => {
                          setQuantityInput(String(value));
                          setNotice("");
                        }}
                        disabled={loading}
                      >
                        ×{value}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mn-task-summary">
                  <div>
                    <span>
                      {isFineTuning ? "Training jobs" : "Tasks"}
                    </span>
                    <strong>
                      {validQuantity
                        ? quantity.toLocaleString("en-US")
                        : "—"}
                    </strong>
                  </div>

                  <div>
                    <span>{unitCostLabel}</span>
                    <strong>{formatMoney(unitPrice)}</strong>
                  </div>

                  <div>
                    <span>Total cost</span>
                    <strong>
                      {validQuantity ? formatMoney(subtotal) : "—"}
                    </strong>
                  </div>

                  <p>
                    {validQuantity
                      ? `${quantity.toLocaleString("en-US")} ${quantityLabel} × ${formatMoney(unitPrice)} = ${formatMoney(subtotal)}`
                      : "Enter a valid quantity."}
                  </p>
                </div>

                <form onSubmit={continueToPayment}>
                  <h3 className="mn-section-title">
                    Select Payment Method
                  </h3>

                  <div className="mn-payment-method-grid">
                    <button
                      type="button"
                      className={
                        selectedPaymentMethod === "upi"
                          ? "mn-method-card selected"
                          : "mn-method-card"
                      }
                      onClick={() => {
                        setSelectedPaymentMethod("upi");
                        setPaymentError("");
                        setNotice("");
                      }}
                      aria-pressed={selectedPaymentMethod === "upi"}
                      disabled={loading}
                    >
                      <span className="mn-method-icon upi">
                        <Smartphone size={21} />
                      </span>
                      <span className="mn-method-title">UPI</span>
                      <span className="mn-method-description">
                        UPI App / QR
                      </span>
                      <span className="mn-method-radio">
                        {selectedPaymentMethod === "upi" ? "✓" : ""}
                      </span>
                    </button>

                    <button
                      type="button"
                      className={
                        selectedPaymentMethod === "card"
                          ? "mn-method-card selected"
                          : "mn-method-card"
                      }
                      onClick={() => {
                        setSelectedPaymentMethod("card");
                        setPaymentError("");
                        setNotice("");
                      }}
                      aria-pressed={selectedPaymentMethod === "card"}
                      disabled={loading}
                    >
                      <span className="mn-method-icon card">
                        <CreditCard size={21} />
                      </span>
                      <span className="mn-method-title">Card</span>
                      <span className="mn-method-description">
                        Credit / Debit
                      </span>
                      <span className="mn-method-radio">
                        {selectedPaymentMethod === "card" ? "✓" : ""}
                      </span>
                    </button>
                  </div>

                  <h3 className="mn-section-title">Billing Details</h3>

                  <div className="mn-fields">
                    <label>
                      Full name
                      <input
                        type="text"
                        required
                        autoComplete="name"
                        maxLength={100}
                        value={billing.fullName}
                        onChange={(event) =>
                          updateBilling("fullName", event.target.value)
                        }
                        placeholder="Enter your full name"
                        disabled={loading}
                      />
                    </label>

                    <label>
                      Email address
                      <input
                        type="email"
                        required
                        autoComplete="email"
                        maxLength={150}
                        value={billing.email}
                        onChange={(event) =>
                          updateBilling("email", event.target.value)
                        }
                        placeholder="Enter your email address"
                        disabled={loading}
                      />
                    </label>

                    <label>
                      Country
                      <select
                        required
                        autoComplete="country"
                        value={billing.country}
                        onChange={(event) =>
                          updateBilling("country", event.target.value)
                        }
                        disabled={loading}
                      >
                        {countries.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      Address Line 1
                      <input
                        type="text"
                        required
                        autoComplete="address-line1"
                        maxLength={150}
                        value={billing.address1}
                        onChange={(event) =>
                          updateBilling("address1", event.target.value)
                        }
                        placeholder="House number, building, area"
                        disabled={loading}
                      />
                    </label>

                    <label>
                      Address Line 2
                      <span className="mn-optional">Optional</span>
                      <input
                        type="text"
                        autoComplete="address-line2"
                        maxLength={150}
                        value={billing.address2}
                        onChange={(event) =>
                          updateBilling("address2", event.target.value)
                        }
                        placeholder="Street, apartment, landmark"
                        disabled={loading}
                      />
                    </label>

                    <div className="mn-field-row">
                      <label>
                        State / Region
                        <input
                          type="text"
                          required
                          autoComplete="address-level1"
                          maxLength={100}
                          value={billing.state}
                          onChange={(event) =>
                            updateBilling("state", event.target.value)
                          }
                          placeholder="State"
                          disabled={loading}
                        />
                      </label>

                      <label>
                        PIN / ZIP
                        <input
                          type="text"
                          required
                          autoComplete="postal-code"
                          maxLength={20}
                          value={billing.pin}
                          onChange={(event) =>
                            updateBilling("pin", event.target.value)
                          }
                          placeholder="Postal code"
                          disabled={loading}
                        />
                      </label>
                    </div>

                    <label>
                      GST number (optional)
                      <input
                        type="text"
                        maxLength={15}
                        value={gstNumber}
                        onChange={(event) =>
                          setGstNumber(event.target.value.toUpperCase())
                        }
                        placeholder="15-character GSTIN"
                        disabled={loading}
                      />
                    </label>

                    <div className="mn-order-summary">
                      <div className="mn-summary-row">
                        <span>
                          {isFineTuning ? "Training jobs" : "Usage tasks"}
                        </span>
                        <strong>
                          {validQuantity
                            ? `${quantity.toLocaleString("en-US")} ${quantityLabel}`
                            : "—"}
                        </strong>
                      </div>

                      <div className="mn-summary-row">
                        <span>Subtotal</span>
                        <strong>
                          {validQuantity ? formatMoney(subtotal) : "—"}
                        </strong>
                      </div>

                      <div className="mn-summary-row">
                        <span>Estimated tax (18%)</span>
                        <strong>
                          {validQuantity ? formatMoney(estimatedTax) : "—"}
                        </strong>
                      </div>

                      <div className="mn-summary-divider" />

                      <div className="mn-summary-row mn-summary-total">
                        <span>Total due</span>
                        <strong>
                          {validQuantity ? formatMoney(totalDue) : "—"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {notice && (
                    <p className="mn-credit-error" role="alert">
                      {notice}
                    </p>
                  )}

                  {paymentError && (
                    <div className="mn-credit-error" role="alert">
                      <AlertCircle size={15} />
                      {paymentError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="mn-pay-button"
                    disabled={!validQuantity || loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mn-spin" size={17} />
                        Connecting to Razorpay...
                      </>
                    ) : (
                      `Pay ${formatMoney(totalDue)}`
                    )}
                  </button>

                  <div className="mn-secure-note">
                    <ShieldCheck size={16} />
                    Secure payment powered by Razorpay
                  </div>
                </form>

                <footer className="mn-credit-footer">
                  <ShieldCheck size={14} />
                  ModelNow secure checkout
                </footer>
              </>
            )}
          </section>
        </div>
      )}

      <style jsx>{`
        .mn-buy-credits {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 9px 13px;
          border: 1px solid #dbeafe;
          border-radius: 8px;
          background: #eff6ff;
          color: #2563eb;
          font-size: 13px;
          font-weight: 650;
          cursor: pointer;
        }

        .mn-buy-credits:hover {
          background: #dbeafe;
        }

        .mn-credit-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px;
          background: rgba(15, 23, 42, 0.55);
          backdrop-filter: blur(4px);
        }

        .mn-credit-modal {
          width: 100%;
          max-width: 460px;
          max-height: 91vh;
          overflow-y: auto;
          box-sizing: border-box;
          padding: 18px;
          border: 1px solid #e5eaf1;
          border-radius: 13px;
          background: #fff;
          color: #172033;
          box-shadow: 0 20px 60px rgba(15, 23, 42, 0.2);
          overscroll-behavior: contain;
        }

        .mn-credit-header {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 15px;
        }

        .mn-credit-eyebrow {
          color: #64748b;
          font-size: 10px;
          font-weight: 750;
          letter-spacing: 0.7px;
        }

        .mn-credit-header h2 {
          margin: 5px 0;
          color: #172033;
          font-size: 20px;
        }

        .mn-credit-header p {
          margin: 0;
          color: #64748b;
          font-size: 12px;
        }

        .mn-credit-close {
          flex-shrink: 0;
          width: 32px;
          height: 32px;
          display: grid;
          place-items: center;
          border: 1px solid #e5eaf1;
          border-radius: 8px;
          background: #fff;
          color: #64748b;
          cursor: pointer;
        }

        .mn-credit-close:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .mn-feature-price {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 13px;
          border: 1px solid #e5eaf1;
          border-radius: 10px;
          background: #fafcff;
        }

        .mn-small-label {
          display: block;
          color: #64748b;
          font-size: 10px;
          font-weight: 750;
        }

        .mn-feature-price strong {
          display: block;
          margin-top: 4px;
          color: #172033;
          font-size: 27px;
          font-weight: 800;
        }

        .mn-feature-price p {
          margin: 3px 0 0;
          color: #64748b;
          font-size: 11px;
        }

        .mn-price-icon {
          display: grid;
          place-items: center;
          width: 38px;
          height: 38px;
          border-radius: 9px;
          background: #eff6ff;
          color: #2563eb;
        }

        .mn-quantity-section {
          margin-top: 16px;
        }

        .mn-quantity-section label {
          display: block;
          margin-bottom: 8px;
          color: #172033;
          font-size: 14px;
          font-weight: 750;
        }

        .mn-quantity-section input {
          box-sizing: border-box;
          width: 100%;
          height: 42px;
          padding: 9px 12px;
          border: 1px solid #d8e0eb;
          border-radius: 8px;
          background: #fff;
          color: #172033;
          font-size: 14px;
          outline: none;
        }

        .mn-quantity-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 9px;
        }

        .mn-quantity-buttons button {
          padding: 7px 13px;
          border: 1px solid #dce5f0;
          border-radius: 30px;
          background: #fff;
          color: #475569;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }

        .mn-quantity-buttons button.selected,
        .mn-quantity-buttons button:hover {
          border-color: #bfdbfe;
          background: #eff6ff;
          color: #2563eb;
        }

        .mn-quantity-buttons button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .mn-task-summary {
          margin-top: 15px;
          padding: 12px;
          border: 1px solid #e5eaf1;
          border-radius: 9px;
          background: #fafcff;
        }

        .mn-task-summary div {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 10px;
        }

        .mn-task-summary span {
          color: #64748b;
          font-size: 12px;
        }

        .mn-task-summary strong {
          color: #172033;
          font-size: 14px;
        }

        .mn-task-summary p {
          margin: 12px 0 0;
          padding-top: 10px;
          border-top: 1px solid #e5eaf1;
          color: #172033;
          font-size: 15px;
          font-weight: 800;
        }

        .mn-section-title {
          margin: 16px 0 9px;
          color: #172033;
          font-size: 14px;
          font-weight: 750;
        }

        .mn-payment-method-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .mn-method-card {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 5px;
          min-height: 84px;
          padding: 10px;
          border: 1px solid #e2e8f0;
          border-radius: 9px;
          background: #fff;
          color: #172033;
          text-align: left;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
        }

        .mn-method-card:hover:not(:disabled) {
          border-color: #93b4ff;
        }

        .mn-method-card.selected {
          border: 1.5px solid #315fea;
          background: #f5f8ff;
        }

        .mn-method-card:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .mn-method-icon {
          display: grid;
          place-items: center;
          width: 29px;
          height: 29px;
          border-radius: 7px;
        }

        .mn-method-icon.upi {
          background: #eaf1ff;
          color: #315fea;
        }

        .mn-method-icon.card {
          background: #eef2f7;
          color: #334155;
        }

        .mn-method-title {
          color: #172033;
          font-size: 13px;
          font-weight: 800;
        }

        .mn-method-description {
          color: #64748b;
          font-size: 11px;
        }

        .mn-method-radio {
          position: absolute;
          top: 10px;
          right: 10px;
          display: grid;
          place-items: center;
          width: 17px;
          height: 17px;
          border: 1px solid #cbd5e1;
          border-radius: 50%;
          color: #fff;
          font-size: 10px;
          font-weight: 800;
        }

        .mn-method-card.selected .mn-method-radio {
          border-color: #315fea;
          background: #315fea;
        }

        .mn-fields {
          display: grid;
          gap: 10px;
        }

        .mn-fields label {
          display: grid;
          gap: 5px;
          color: #475569;
          font-size: 11px;
          font-weight: 650;
        }

        .mn-fields input,
        .mn-fields select {
          box-sizing: border-box;
          width: 100%;
          min-height: 39px;
          padding: 9px 10px;
          border: 1px solid #e2e8f0;
          border-radius: 7px;
          background: #fff;
          color: #172033;
          font-size: 12px;
          outline: none;
        }

        .mn-fields input:focus,
        .mn-fields select:focus {
          border-color: #94a3b8;
        }

        .mn-fields input::placeholder {
          color: #94a3b8;
        }

        .mn-fields select {
          color-scheme: light;
        }

        .mn-optional {
          color: #94a3b8;
          font-size: 10px;
          font-weight: 400;
        }

        .mn-field-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 9px;
        }

        .mn-order-summary {
          display: grid;
          gap: 15px;
          margin-top: 12px;
          padding: 20px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background: #f7f8fa;
          color: #171717;
        }

        .mn-summary-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          font-size: 15px;
        }

        .mn-summary-row span {
          color: #262626;
          font-weight: 400;
        }

        .mn-summary-row strong {
          color: #171717;
          font-size: 15px;
          font-weight: 700;
          text-align: right;
        }

        .mn-summary-divider {
          width: 100%;
          height: 1px;
          background: #dedfe3;
        }

        .mn-summary-total {
          margin-top: 0;
        }

        .mn-summary-total span,
        .mn-summary-total strong {
          font-size: 19px;
          font-weight: 800;
        }

        .mn-secure-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 13px;
          color: #777;
          font-size: 12px;
        }

        .mn-pay-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          width: 100%;
          min-height: 43px;
          margin-top: 13px;
          padding: 10px 14px;
          border: 1px solid #315fea;
          border-radius: 8px;
          background: #315fea;
          color: #fff;
          font-size: 16px;
          font-weight: 750;
          cursor: pointer;
        }

        .mn-pay-button:hover:not(:disabled) {
          background: #244ed0;
        }

        .mn-pay-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .mn-credit-error {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin: 10px 0;
          padding: 9px 10px;
          border: 1px solid #fed7aa;
          border-radius: 7px;
          background: #fff7ed;
          color: #9a3412;
          font-size: 11px;
          line-height: 1.5;
        }

        .mn-credit-footer {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 6px;
          margin-top: 14px;
          padding-top: 11px;
          border-top: 1px solid #edf1f5;
          color: #94a3b8;
          font-size: 10px;
        }

        .mn-payment-result {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          text-align: center;
        }

        .mn-payment-result h3 {
          margin: 12px 0 6px;
          color: #172033;
          font-size: 16px;
        }

        .mn-payment-result p {
          max-width: 340px;
          color: #64748b;
          font-size: 11px;
          line-height: 1.6;
        }

        .mn-order-reference {
          overflow-wrap: anywhere;
          font-size: 10px !important;
        }

        .mn-spin {
          animation: mn-spin 1s linear infinite;
        }

        @keyframes mn-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 560px) {
          .mn-credit-overlay {
            padding: 8px;
          }

          .mn-credit-modal {
            max-height: 94vh;
            padding: 14px;
          }
        }

        @media (max-width: 380px) {
          .mn-field-row {
            grid-template-columns: 1fr;
          }

          .mn-order-summary {
            padding: 15px;
          }

          .mn-summary-row {
            font-size: 13px;
          }

          .mn-summary-total span,
          .mn-summary-total strong {
            font-size: 17px;
          }
        }
      `}</style>
    </>
  );
}
