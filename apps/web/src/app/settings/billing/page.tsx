
"use client";

import { useState } from "react";

export default function BillingSettingsPage() {
  const [billingEmail, setBillingEmail] = useState("pujithamarikanti@gmail.com");
  const [editingEmail, setEditingEmail] = useState(false);
  const [draftEmail, setDraftEmail] = useState(billingEmail);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  function saveEmail() {
    const value = draftEmail.trim();
    if (!value || !value.includes("@")) return;
    setBillingEmail(value);
    setEditingEmail(false);
  }

  return (
    <main className="mx-auto w-full max-w-5xl space-y-12 pb-12 text-black">
      <h1 className="text-3xl font-normal tracking-tight">Billing</h1>

      <section className="flex min-h-20 flex-wrap items-center justify-between gap-4 rounded-[22px] border border-[#dedede] px-5 py-4">
        <div>
<p className="text-base font-semibold">ModelNow Free</p>
          <p className="mt-1 text-sm text-[#666]">
            Intelligence for everyday tasks
          </p>
        </div>

        <a
          href="/plans"
          className="inline-flex items-center gap-2 rounded-full bg-[#f0f6fc] px-5 py-3 text-base text-[#0866c6] hover:bg-[#e5effa]"
        >
          <span aria-hidden="true">✦</span>
          Compare plans
        </a>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Billing information</h2>

          <button
            type="button"
            onClick={() => {
              setDraftEmail(billingEmail);
              setEditingEmail((value) => !value);
            }}
            className="rounded-full bg-[#f0f0f0] px-5 py-3 text-base hover:bg-[#e6e6e6]"
          >
            {editingEmail ? "Cancel" : "Edit"}
          </button>
        </div>

        <div className="rounded-[22px] border border-[#dedede] px-5 py-4">
          {editingEmail ? (
            <div className="space-y-3">
              <label
                htmlFor="billing-email"
                className="block text-sm font-medium"
              >
                Billing email
              </label>

              <input
                id="billing-email"
                type="email"
                value={draftEmail}
                onChange={(event) => setDraftEmail(event.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
              />

              <button
                type="button"
                onClick={saveEmail}
                className="rounded-full bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
              >
                Save
              </button>
            </div>
          ) : (
            <>
              <p className="text-base font-medium">Billing email</p>
              <p className="mt-1 break-all text-sm text-[#666]">
                {billingEmail}
              </p>
            </>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Payment methods</h2>

          <button
            type="button"
            onClick={() => setShowPaymentDialog(true)}
            className="rounded-full bg-[#f0f0f0] px-5 py-3 text-base hover:bg-[#e6e6e6]"
          >
            Add new
          </button>
        </div>

        <div className="rounded-[22px] border border-[#dedede] px-5 py-4">
          <p className="text-base text-[#666]">
            No payment methods available
          </p>
        </div>
      </section>

      {showPaymentDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShowPaymentDialog(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-dialog-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="payment-dialog-title" className="text-lg font-semibold">
              Add a payment method
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              Payment setup is not connected yet. Connect Razorpay before
              accepting payments or saving payment methods.
            </p>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPaymentDialog(false)}
                className="rounded-full bg-black px-5 py-2.5 text-sm text-white hover:bg-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
