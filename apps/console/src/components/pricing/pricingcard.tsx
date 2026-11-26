
import React from "react";

export interface PricingPackage {
  name: string;
  price: number;
  credits: number;
  description?: string;
  popular?: boolean;
}

interface PricingCardProps {
  plan: PricingPackage;
  onSelect: (plan: PricingPackage) => void;
}

export default function PricingCard({
  plan,
  onSelect,
}: PricingCardProps) {
  return (
    <div
      style={{
        position: "relative",
        padding: "20px 17px",
        borderRadius: "14px",
        border: plan.popular
          ? "1.5px solid #93c5fd"
          : "1px solid #dbeafe",
        background: plan.popular ? "#f0f7ff" : "#ffffff",
        boxShadow: "0 4px 14px rgba(59,130,246,0.06)",
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
      }}
    >
      {plan.popular && (
        <div
          style={{
            alignSelf: "flex-start",
            background: "#e0efff",
            color: "#2563a8",
            borderRadius: "20px",
            padding: "4px 10px",
            fontSize: "10px",
            fontWeight: 700,
            marginBottom: "12px",
          }}
        >
          POPULAR
        </div>
      )}

      <h3
        style={{
          fontSize: "16px",
          fontWeight: 700,
          color: "#1e293b",
          margin: "0 0 10px",
        }}
      >
        {plan.name}
      </h3>

      <div
        style={{
          fontSize: "30px",
          fontWeight: 750,
          color: "#1d4ed8",
          letterSpacing: "-1px",
        }}
      >
        ${plan.price}
      </div>

      <p
        style={{
          color: "#475569",
          fontSize: "12px",
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
        {plan.description || "Add credits to your ModelNow account."}
      </p>

      <button
        type="button"
        onClick={() => onSelect(plan)}
        style={{
          width: "100%",
          minHeight: "39px",
          padding: "9px 12px",
          border: "1px solid #bfdbfe",
          borderRadius: "8px",
          background: "#eaf3ff",
          color: "#1d4ed8",
          fontSize: "13px",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Buy Credits
      </button>
    </div>
  );
}
