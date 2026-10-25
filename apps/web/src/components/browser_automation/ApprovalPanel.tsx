"use client";

import React, { useState } from "react";

type ApprovalPanelProps = {
  onApprove: () => void;
  onCancel?: () => void;
  onReject?: () => void;

  loading?: boolean;
  disabled?: boolean;

  title?: string;
  description?: string;

  amount?: number | string;
  movie?: string;
  theatre?: string;
  seats?: string | string[];
  tickets?: number | string;
  showTime?: string;
  date?: string;
};

export default function ApprovalPanel({
  onApprove,
  onCancel,
  onReject,
  loading = false,
  disabled = false,
  title = "Approval Required",
  description = "Review the booking details below before approving the action.",

  amount = 499,
  movie = "Kantara",
  theatre = "PVR Cinemas",
  seats = ["A10", "A11"],
  tickets = 2,
  showTime = "7:30 PM",
  date = "28 Sep 2026",
}: ApprovalPanelProps) {
  const [approved, setApproved] = useState(false);

  const seatText = Array.isArray(seats) ? seats.join(", ") : seats;

  const formattedAmount =
    typeof amount === "number"
      ? `₹${amount.toLocaleString("en-IN")}`
      : amount;

  const handleApprove = () => {
    if (disabled || loading || approved) {
      return;
    }

    setApproved(true);
    onApprove();
  };

  const handleCancel = () => {
    if (loading) {
      return;
    }

    if (onCancel) {
      onCancel();
      return;
    }

    if (onReject) {
      onReject();
    }
  };

  return (
    <div className="w-full rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="mb-2 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            Approval Required
          </div>

          <h2 className="text-xl font-semibold text-foreground">
            {title}
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>

        {/* Booking Summary */}
        <div className="overflow-hidden rounded-2xl border border-border">
          <div className="border-b border-border bg-muted/40 px-4 py-3">
            <h3 className="text-sm font-semibold text-foreground">
              Booking Summary
            </h3>
          </div>

          <div className="divide-y divide-border">
            <SummaryRow label="Movie" value={movie} />

            <SummaryRow label="Theatre" value={theatre} />

            <SummaryRow label="Date" value={date} />

            <SummaryRow label="Show Time" value={showTime} />

            <SummaryRow label="Seats" value={seatText} />

            <SummaryRow label="Tickets" value={String(tickets)} />

            <div className="flex items-center justify-between gap-4 bg-muted/20 px-4 py-4">
              <span className="text-sm font-medium text-muted-foreground">
                Total Amount
              </span>

              <span className="text-lg font-bold text-foreground">
                {formattedAmount}
              </span>
            </div>
          </div>
        </div>

        {/* Approval Information */}
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <p className="text-sm font-medium text-foreground">
            Please review these details before continuing.
          </p>

          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            After approval, payment options such as Google Pay, PhonePe,
            Paytm, and Card will become available.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          {(onCancel || onReject) && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="w-full rounded-lg border border-border px-5 py-3 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              Cancel
            </button>
          )}

          <button
            type="button"
            onClick={handleApprove}
            disabled={disabled || loading || approved}
            className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {loading
              ? "Approving..."
              : approved
                ? "Approved"
                : "Approve & Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3">
      <span className="text-sm text-muted-foreground">
        {label}
      </span>

      <span className="text-right text-sm font-medium text-foreground">
        {value}
      </span>
    </div>
  );
}