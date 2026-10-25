"use client";

import {
  CheckCircle2,
  Loader2,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { useEffect, useState } from "react";

type VerificationPanelProps = {
  transactionId: string;
  onVerified: () => void;
};

type VerificationStatus =
  | "checking"
  | "verified";

export default function VerificationPanel({
  transactionId,
  onVerified,
}: VerificationPanelProps) {
  const [status, setStatus] =
    useState<VerificationStatus>("checking");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setStatus("verified");
    }, 2200);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (status !== "verified") {
      return;
    }

    const timer = window.setTimeout(() => {
      onVerified();
    }, 1200);

    return () => {
      window.clearTimeout(timer);
    };
  }, [status, onVerified]);

  const verified = status === "verified";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            verified
              ? "bg-emerald-100 text-emerald-600"
              : "bg-blue-100 text-blue-600"
          }`}
        >
          {verified ? (
            <CheckCircle2 size={19} />
          ) : (
            <ShieldCheck size={19} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Payment verification
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                {verified
                  ? "The payment transaction has been verified successfully."
                  : "ModelNow is checking the completed payment transaction."}
              </p>
            </div>

            <span
              className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                verified
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {verified
                ? "Verified"
                : "Checking"}
            </span>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Transaction
            </p>

            <p className="mt-1 break-all text-sm font-semibold text-slate-900">
              {transactionId}
            </p>

            <div className="mt-4 flex items-center gap-2">
              {verified ? (
                <>
                  <CheckCircle2
                    size={16}
                    className="text-emerald-600"
                  />

                  <span className="text-xs font-medium text-emerald-700">
                    Transaction verified successfully
                  </span>
                </>
              ) : (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin text-blue-600"
                  />

                  <span className="text-xs font-medium text-blue-700">
                    Checking transaction status...
                  </span>
                </>
              )}
            </div>
          </div>

          {!verified && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
              <XCircle
                size={15}
                className="mt-0.5 shrink-0 text-amber-600"
              />

              <p className="text-xs leading-5 text-amber-800">
                Verification is still in progress. Please wait
                while the transaction status is checked.
              </p>
            </div>
          )}

          {verified && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-xs font-semibold text-emerald-800">
                Verification complete
              </p>

              <p className="mt-1 text-xs leading-5 text-emerald-700">
                The workflow can now continue to the completed
                result.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}