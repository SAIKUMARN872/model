import React from "react";

export type PaymentMethod = "upi" | "card";

interface PricingPaymentMethodProps {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}

export default function PricingPaymentMethod({
  value,
  onChange,
}: PricingPaymentMethodProps) {
  const methods: {
    id: PaymentMethod;
    title: string;
    description: string;
  }[] = [
    {
      id: "upi",
      title: "UPI",
      description: "Pay using UPI apps and QR code through Razorpay.",
    },
    {
      id: "card",
      title: "Credit / Debit Card",
      description: "Pay using an eligible Visa, Mastercard or other supported card.",
    },
  ];

  return (
    <div style={{ display: "grid", gap: "12px" }}>
      {methods.map((method) => {
        const selected = value === method.id;

        return (
          <button
            key={method.id}
            type="button"
            onClick={() => onChange(method.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              width: "100%",
              padding: "17px",
              textAlign: "left",
              borderRadius: "12px",
              border: selected
                ? "2px solid #315FEA"
                : "1px solid #e2e8f0",
              background: selected ? "#f5f8ff" : "#fff",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                border: selected
                  ? "6px solid #315FEA"
                  : "2px solid #94a3b8",
                flexShrink: 0,
              }}
            />

            <span>
              <strong style={{ display: "block", color: "#0f172a" }}>
                {method.title}
              </strong>
              <span
                style={{
                  display: "block",
                  marginTop: "4px",
                  color: "#64748b",
                  fontSize: "13px",
                }}
              >
                {method.description}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}