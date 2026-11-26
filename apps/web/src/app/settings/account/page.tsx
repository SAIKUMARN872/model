
"use client";

import { useEffect, useState } from "react";

type AccountData = {
  status: string;
  name: string;
  username: string;
  email: string;
  age: string;
};

const STORAGE_KEY = "modelnow-account-settings";

const DEFAULT_ACCOUNT: AccountData = {
  status: "free",
  name: "pujitha",
  username: "@pujithamarikanti",
  email: "pujithamarikanti@gmail.com",
  age: "18 or older",
};

export default function AccountSettingsPage() {
  const [account, setAccount] = useState<AccountData>(DEFAULT_ACCOUNT);
  const [nameInput, setNameInput] = useState(DEFAULT_ACCOUNT.name);
  const [emailInput, setEmailInput] = useState(DEFAULT_ACCOUNT.email);
  const [editingEmail, setEditingEmail] = useState(false);
  const [message, setMessage] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);
        const next = { ...DEFAULT_ACCOUNT, ...parsed };
        setAccount(next);
        setNameInput(next.name);
        setEmailInput(next.email);
      }
    } catch {
      // Keep the default account display.
    }
  }, []);

  function saveChanges(next: AccountData) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setAccount(next);
      setMessage("Account preferences saved.");
    } catch {
      setMessage("Could not save changes.");
    }
  }

  function saveName() {
    const name = nameInput.trim();

    if (!name) {
      setMessage("Name cannot be empty.");
      return;
    }

    saveChanges({ ...account, name });
  }

  function saveEmail() {
    const email = emailInput.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage("Enter a valid email address.");
      return;
    }

    saveChanges({ ...account, email });
    setEditingEmail(false);
  }

  return (
    <section className="space-y-16 pb-12">
      <header>
        <h1 className="text-[30px] font-normal tracking-tight">
          Account
        </h1>
      </header>

      <section className="space-y-5">
        <h2 className="text-base font-semibold">Account</h2>

        <div className="rounded-[22px] border border-gray-200 px-5">
          <div className="flex min-h-[55px] items-center justify-between gap-4 border-b border-black/10">
            <span className="text-sm font-medium">Status</span>
            <span className="text-sm text-gray-500">
              {account.status}
            </span>
          </div>

          <div className="flex min-h-[75px] items-center justify-between gap-4 border-b border-black/10">
            <span className="text-sm font-medium">Name</span>

            <div className="flex items-center gap-3">
              <input
                value={nameInput}
                onChange={(event) => {
                  setNameInput(event.target.value);
                  setMessage("");
                }}
                aria-label="Account name"
                className="w-36 rounded-lg border border-gray-300 px-3 py-2 text-sm sm:w-56"
              />
              <button
                type="button"
                onClick={saveName}
                disabled={nameInput.trim() === account.name}
                className="rounded-full bg-gray-100 px-4 py-3 text-sm text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>

          <div className="flex min-h-[60px] items-center justify-between gap-4 border-b border-black/10">
            <span className="text-sm font-medium">Username</span>
            <span className="break-all text-sm sm:text-base">
              {account.username}
            </span>
          </div>

          <div className="flex min-h-[77px] items-center justify-between gap-4 border-b border-black/10">
            <div className="min-w-0">
              <p className="text-sm font-medium">Email</p>
              {editingEmail ? (
                <input
                  type="email"
                  value={emailInput}
                  onChange={(event) => {
                    setEmailInput(event.target.value);
                    setMessage("");
                  }}
                  aria-label="Account email"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1 text-sm"
                />
              ) : (
                <p className="mt-1 break-all text-sm text-gray-500">
                  {account.email}
                </p>
              )}
            </div>

            {editingEmail ? (
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={saveEmail}
                  className="rounded-full bg-gray-100 px-3 py-2 text-sm hover:bg-gray-200"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmailInput(account.email);
                    setEditingEmail(false);
                  }}
                  className="rounded-full bg-gray-100 px-3 py-2 text-sm hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setEmailInput(account.email);
                  setEditingEmail(true);
                  setMessage("");
                }}
                className="shrink-0 rounded-full bg-gray-100 px-4 py-3 text-sm hover:bg-gray-200"
              >
                Change
              </button>
            )}
          </div>

          <div className="flex min-h-[60px] items-center justify-between gap-4">
            <span className="text-sm font-medium">Age</span>
            <span className="text-sm sm:text-base">{account.age}</span>
          </div>
        </div>
      </section>

      <section className="space-y-5">
<h2 className="text-base font-semibold">ModelNow Builder profile</h2>

        <div className="rounded-[22px] border border-gray-200 px-5 py-5">
          <p className="text-sm font-medium">{account.name}</p>
          <p className="mt-1 text-sm text-gray-500">
            {account.username.replace(/^@/, "")}
          </p>
        </div>
      </section>

      <section className="rounded-[22px] border border-gray-200 px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-medium">Delete account</span>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="rounded-full bg-[#FCE7E7] px-4 py-3 text-sm text-red-600 hover:bg-red-100"
          >
            Delete
          </button>
        </div>
      </section>

      {message && (
        <p role="status" className="text-sm text-gray-500">
          {message}
        </p>
      )}

      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="delete-account-title" className="text-lg font-semibold">
              Delete account?
            </h2>
            <p className="mt-3 text-sm leading-6 text-gray-500">
              Account deletion is not connected to the backend yet. No account
              or data will be deleted by this demo.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-full border border-gray-300 px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setMessage("Account deletion requires backend integration.");
                }}
                className="rounded-full bg-red-600 px-4 py-2 text-sm text-white"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
