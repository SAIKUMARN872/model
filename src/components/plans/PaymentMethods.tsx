"use client";

import {
  CreditCard,
  Smartphone,
  QrCode,
  Wallet,
} from "lucide-react";

export type PaymentMethodId =
  | "upi"
  | "qr"
  | "paytm"
  | "card";

type PaymentMethodsProps = {
  selectedMethod: PaymentMethodId;
  onSelect: (method: PaymentMethodId) => void;
};

const methods = [
  {
    id: "upi" as const,
    title: "UPI apps",
    description: "Google Pay, PhonePe and other supported UPI apps",
    icon: Smartphone,
  },
  {
    id: "qr" as const,
    title: "Scan and pay",
    description: "Pay using a UPI QR code when available",
    icon: QrCode,
  },
  {
    id: "paytm" as const,
    title: "Paytm",
    description: "Use Paytm if enabled by the payment gateway",
    icon: Wallet,
  },
  {
    id: "card" as const,
    title: "Debit or credit card",
    description: "Visa, Mastercard and other supported cards",
    icon: CreditCard,
  },
];

export default function PaymentMethods({
  selectedMethod,
  onSelect,
}: PaymentMethodsProps) {
  return (
    <section className="mt-6">
      <h3 className="text-base font-semibold text-[#202123]">
        Choose a payment method
      </h3>

      <p className="mt-1 text-sm text-[#6e6e80]">
        Select how you would like to pay.
      </p>

      <div className="mt-4 space-y-3">
        {methods.map((method) => {
          const Icon = method.icon;
          const selected = selectedMethod === method.id;

          return (
            <button
              key={method.id}
              type="button"
              onClick={() => onSelect(method.id)}
              aria-pressed={selected}
              className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition ${
                selected
                  ? "border-[#8b472f] bg-[#fbf4f1]"
                  : "border-[#e5e5e5] bg-white hover:border-[#b7b7c3]"
              }`}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f3f3f5] text-[#565869]">
                <Icon size={20} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-[#202123]">
                  {method.title}
                </span>

                <span className="mt-1 block text-xs leading-5 text-[#6e6e80]">
                  {method.description}
                </span>
              </span>

              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                  selected
                    ? "border-[#8b472f]"
                    : "border-[#c7c7d1]"
                }`}
              >
                {selected && (
                  <span className="h-2.5 w-2.5 rounded-full bg-[#8b472f]" />
                )}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-4 rounded-lg bg-[#f7f7f8] p-3 text-xs leading-5 text-[#6e6e80]">
        Payment methods shown here are selection options only. Transactions
        will be enabled after the payment gateway is configured.
      </p>
    </section>
  );
}