"use client";

import {
  CheckCircle2,
  CreditCard,
  IndianRupee,
  Smartphone,
  WalletCards,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useMemo, useState } from "react";

type PaymentMethod =
  | "google-pay"
  | "phonepe"
  | "paytm"
  | "card";

type PaymentPanelProps = {
  onPaymentComplete: (
    transactionId: string,
  ) => void;
};

const AMOUNT = 499;

const paymentOptions: {
  id: PaymentMethod;
  label: string;
  shortLabel: string;
}[] = [
  {
    id: "google-pay",
    label: "Google Pay",
    shortLabel: "GPay",
  },
  {
    id: "phonepe",
    label: "PhonePe",
    shortLabel: "PhonePe",
  },
  {
    id: "paytm",
    label: "Paytm",
    shortLabel: "Paytm",
  },
  {
    id: "card",
    label: "Card",
    shortLabel: "Card",
  },
];

export default function PaymentPanel({
  onPaymentComplete,
}: PaymentPanelProps) {
  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethod>(
      "google-pay",
    );

  const [isCompleting, setIsCompleting] =
    useState(false);

  const [cardNumber, setCardNumber] =
    useState("");

  const [expiry, setExpiry] =
    useState("");

  const [cvv, setCvv] =
    useState("");

  const transactionReference =
    useMemo(
      () =>
        `MN-${Date.now()
          .toString()
          .slice(-8)}`,
      [],
    );

  /*
   * Demo UPI QR payload.
   *
   * A real UPI ID/payment processor is not connected here.
   * The QR is only for demonstrating the scan flow.
   */
  const upiQrValue =
    `upi://pay?pa=modelnow@upi&pn=ModelNow&am=${AMOUNT}&cu=INR&tn=ModelNow%20Demo%20Payment`;

  const isUpiMethod =
    selectedMethod !== "card";

  const handleCompletePayment =
    () => {
      setIsCompleting(true);

      window.setTimeout(() => {
        onPaymentComplete(
          transactionReference,
        );

        setIsCompleting(false);
      }, 1000);
    };

  const handleCardPayment = () => {
    if (
      cardNumber.replace(/\s/g, "")
        .length < 12 ||
      !expiry ||
      cvv.length < 3
    ) {
      return;
    }

    handleCompletePayment();
  };

  return (
    <section className="rounded-2xl border border-blue-200 bg-blue-50 p-4 shadow-sm sm:p-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
          <WalletCards size={19} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-blue-950">
                Payment
              </h3>

              <p className="mt-1 text-xs leading-5 text-blue-700">
                Choose a payment method to continue.
              </p>
            </div>

            <div className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
              <IndianRupee size={13} />
              {AMOUNT.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Payment method selector */}
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {paymentOptions.map(
          (option) => {
            const selected =
              selectedMethod ===
              option.id;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() =>
                  setSelectedMethod(
                    option.id,
                  )
                }
                className={`rounded-xl border p-3 text-left transition ${
                  selected
                    ? "border-blue-400 bg-white shadow-sm"
                    : "border-slate-200 bg-white hover:border-blue-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                      selected
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {option.shortLabel ===
                    "Card" ? (
                      <CreditCard size={15} />
                    ) : (
                      <Smartphone size={15} />
                    )}
                  </div>

                  <span className="text-xs font-semibold text-slate-800">
                    {option.label}
                  </span>
                </div>

                {selected && (
                  <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-blue-600">
                    <CheckCircle2 size={12} />
                    Selected
                  </div>
                )}
              </button>
            );
          },
        )}
      </div>

      {/* UPI payment */}
      {isUpiMethod && (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-900">
              Scan QR with your phone
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Open {paymentOptions.find(
                (item) =>
                  item.id ===
                  selectedMethod,
              )?.label} on your phone and scan this QR code.
            </p>
          </div>

          <div className="mx-auto mt-5 flex w-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <QRCodeSVG
              value={upiQrValue}
              size={210}
              level="M"
              includeMargin
            />
          </div>

          <div className="mx-auto mt-4 max-w-md rounded-xl bg-slate-50 p-3 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Demo payment amount
            </p>

            <p className="mt-1 text-lg font-bold text-slate-900">
              ₹{AMOUNT.toFixed(2)}
            </p>
          </div>

          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs leading-5 text-amber-800">
              This QR code is part of the ModelNow frontend demo.
              No real payment is processed.
            </p>
          </div>

          <button
            type="button"
            onClick={
              handleCompletePayment
            }
            disabled={isCompleting}
            className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCompleting
              ? "Confirming Payment..."
              : "I Have Completed the Payment"}
          </button>
        </div>
      )}

      {/* Card payment */}
      {selectedMethod ===
        "card" && (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Card Payment
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Enter demo card details to continue.
            </p>
          </div>

          <div className="mt-4 space-y-3">
            <input
              value={cardNumber}
              onChange={(event) =>
                setCardNumber(
                  event.target.value,
                )
              }
              placeholder="Card number"
              inputMode="numeric"
              maxLength={19}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                value={expiry}
                onChange={(event) =>
                  setExpiry(
                    event.target.value,
                  )
                }
                placeholder="MM/YY"
                maxLength={5}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              />

              <input
                value={cvv}
                onChange={(event) =>
                  setCvv(
                    event.target.value,
                  )
                }
                placeholder="CVV"
                inputMode="numeric"
                maxLength={4}
                type="password"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-slate-50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Amount
              </span>

              <span className="text-sm font-bold text-slate-900">
                ₹{AMOUNT.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={
              handleCardPayment
            }
            disabled={
              isCompleting ||
              cardNumber.replace(
                /\s/g,
                "",
              ).length < 12 ||
              !expiry ||
              cvv.length < 3
            }
            className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isCompleting
              ? "Processing..."
              : "Complete Demo Card Payment"}
          </button>
        </div>
      )}
    </section>
  );
}