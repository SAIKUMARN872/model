
"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  X,
  RotateCcw,
  LoaderCircle,
  CheckCircle2,
} from "lucide-react";

type RefundDialogProps = {
  open: boolean;
  paymentId: string;
  customerName: string;
  currency?: string;
  paymentAmount: number;
  onClose: () => void;
  onConfirm: (refund: {
    paymentId: string;
    amount: number;
    reason: string;
  }) => void | Promise<void>;
};

const refundReasons = [
  "Customer requested refund",
  "Duplicate payment",
  "Incorrect amount charged",
  "Service issue",
  "Other",
];

export default function RefundDialog({
  open,
  paymentId,
  customerName,
  currency = "USD",
  paymentAmount,
  onClose,
  onConfirm,
}: RefundDialogProps) {
  const [amount, setAmount] = useState(String(paymentAmount));
  const [reason, setReason] = useState(refundReasons[0]);
  const [customReason, setCustomReason] = useState("");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      setAmount(String(paymentAmount));
      setReason(refundReasons[0]);
      setCustomReason("");
      setError("");
      setProcessing(false);
      setSuccess(false);
    }
  }, [open, paymentId, paymentAmount]);

  if (!open) return null;

  const parsedAmount = Number(amount);
  const validAmount =
    Number.isFinite(parsedAmount) &&
    parsedAmount > 0 &&
    parsedAmount <= paymentAmount;

  const formatAmount = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

  async function handleConfirm() {
    setError("");

    if (!validAmount) {
      setError(
        `Enter a refund amount greater than zero and no more than ${formatAmount(paymentAmount)}.`,
      );
      return;
    }

    if (reason === "Other" && !customReason.trim()) {
      setError("Please enter a reason for the refund.");
      return;
    }

    setProcessing(true);

    try {
      await onConfirm({
        paymentId,
        amount: Math.round(parsedAmount * 100) / 100,
        reason:
          reason === "Other" ? customReason.trim() : reason,
      });

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "The refund could not be submitted. Please try again.",
      );
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !processing) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="refund-dialog-title"
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                success
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-amber-50 text-amber-600"
              }`}
            >
              {success ? (
                <CheckCircle2 size={22} />
              ) : (
                <RotateCcw size={22} />
              )}
            </div>

            <div>
              <h2
                id="refund-dialog-title"
                className="text-lg font-semibold text-slate-900"
              >
                {success ? "Refund submitted" : "Issue a refund"}
              </h2>
              <p className="mt-1 text-sm leading-5 text-slate-500">
                {success
                  ? "The refund request was accepted by the connected handler."
                  : "Review the payment details before submitting a refund."}
              </p>
            </div>
          </div>

          {!processing && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close refund dialog"
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {success ? (
          <div className="p-5">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
              <p className="text-sm font-medium text-emerald-800">
                Refund request submitted successfully.
              </p>
              <p className="mt-2 text-sm text-emerald-700">
                Payment: {paymentId}
              </p>
              <p className="mt-1 text-sm text-emerald-700">
                Amount: {formatAmount(parsedAmount)}
              </p>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-5 p-5">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-500">
                    Customer
                  </span>
                  <span className="text-right text-sm font-medium text-slate-900">
                    {customerName}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-500">
                    Payment ID
                  </span>
                  <span className="text-right text-sm font-medium text-slate-900">
                    {paymentId}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-500">
                    Original payment
                  </span>
                  <span className="text-right text-sm font-semibold text-slate-900">
                    {formatAmount(paymentAmount)}
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="refund-amount"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Refund amount ({currency})
                </label>

                <input
                  id="refund-amount"
                  type="number"
                  min="0.01"
                  max={paymentAmount}
                  step="0.01"
                  value={amount}
                  onChange={(event) => {
                    setAmount(event.target.value);
                    setError("");
                  }}
                  disabled={processing}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                />

                <p className="mt-1.5 text-xs text-slate-500">
                  Maximum refundable amount: {formatAmount(paymentAmount)}
                </p>
              </div>

              <div>
                <label
                  htmlFor="refund-reason"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Reason for refund
                </label>

                <select
                  id="refund-reason"
                  value={reason}
                  onChange={(event) => {
                    setReason(event.target.value);
                    setError("");
                  }}
                  disabled={processing}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:bg-slate-50"
                >
                  {refundReasons.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>

                {reason === "Other" && (
                  <textarea
                    value={customReason}
                    onChange={(event) => {
                      setCustomReason(event.target.value);
                      setError("");
                    }}
                    placeholder="Describe the reason..."
                    rows={3}
                    disabled={processing}
                    className="mt-3 w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:bg-slate-50"
                  />
                )}
              </div>

              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-lg border border-rose-100 bg-rose-50 p-3 text-sm text-rose-700"
                >
                  <AlertTriangle
                    size={17}
                    className="mt-0.5 shrink-0"
                  />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                <p>
                  Refunds may be irreversible once processed. Verify the
                  transaction and refund amount before continuing.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 bg-slate-50/70 p-5">
              <button
                type="button"
                onClick={onClose}
                disabled={processing}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={processing || !validAmount}
                className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <LoaderCircle size={16} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <RotateCcw size={16} />
                    Confirm refund
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
