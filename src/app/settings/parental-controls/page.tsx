"use client";

import { useState } from "react";

export default function ParentalControlsPage() {
  const [showAddFamily, setShowAddFamily] = useState(false);

  return (
    <div className="min-h-screen bg-white text-[#202123]">
      <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">
            Parental controls
          </h1>
        </header>

        <section className="border-b border-gray-200 pb-7">
          <p className="max-w-3xl text-[15px] leading-7 text-gray-700">
            Parents and teens can link accounts, giving parents tools to assist,
            set limits, and add safeguards that work for their family.
          </p>

          <a
            href="https://help.openai.com/"
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-gray-800 underline underline-offset-4 hover:text-black"
          >
            Learn more
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M7 17 17 7M8 7h9v9"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </section>

        <section className="flex flex-col gap-4 py-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Family members</h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Manage linked parent and teen accounts.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddFamily(true)}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-gray-300 px-4 py-2.5 text-sm font-medium transition hover:bg-gray-100"
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            Add family members
          </button>
        </section>
      </div>

      {showAddFamily && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowAddFamily(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="family-dialog-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="family-dialog-title"
                  className="text-lg font-semibold"
                >
                  Add family members
                </h2>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Parents and teens can link their accounts to set up parental
                  controls.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddFamily(false)}
                aria-label="Close dialog"
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="m6 6 12 12M18 6 6 18"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm font-medium">Account linking</p>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                Account invitations and real parental-control settings need
                to be connected to the ModelNow backend.
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAddFamily(false)}
                className="rounded-full bg-[#202123] px-5 py-2.5 text-sm font-medium text-white hover:bg-black"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}