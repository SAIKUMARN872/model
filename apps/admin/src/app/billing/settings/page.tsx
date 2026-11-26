"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Settings,
  CreditCard,
  FileText,
  Bell,
  ShieldCheck,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

type BillingSettings = {
  companyName: string;
  billingEmail: string;
  currency: string;
  billingCycle: string;
  taxEnabled: boolean;
  taxNumber: string;
  invoicePrefix: string;
  paymentTerms: string;
  autoRetry: boolean;
  sendReceipts: boolean;
  paymentFailureAlerts: boolean;
  invoiceAlerts: boolean;
  renewalAlerts: boolean;
};

const initialSettings: BillingSettings = {
  companyName: "ModelNow",
  billingEmail: "billing@modelnow.ai",
  currency: "INR",
  billingCycle: "Monthly",
  taxEnabled: false,
  taxNumber: "",
  invoicePrefix: "MN-INV",
  paymentTerms: "Due immediately",
  autoRetry: true,
  sendReceipts: true,
  paymentFailureAlerts: true,
  invoiceAlerts: true,
  renewalAlerts: true,
};

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default function BillingSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] =
    useState<BillingSettings>(initialSettings);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function updateSetting<K extends keyof BillingSettings>(
    key: K,
    value: BillingSettings[K],
  ) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
    setSaved(false);
    setError("");
  }

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!settings.companyName.trim()) {
      setError("Please enter the company name.");
      return;
    }

    if (!settings.billingEmail.trim()) {
      setError("Please enter the billing email.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.billingEmail)) {
      setError("Please enter a valid billing email address.");
      return;
    }

    if (!settings.invoicePrefix.trim()) {
      setError("Please enter an invoice prefix.");
      return;
    }

    setSaved(true);
    setError("");
  }

  function resetSettings() {
    setSettings(initialSettings);
    setSaved(false);
    setError("");
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <button
              onClick={() => router.push("/billing")}
              aria-label="Back to billing"
              className="mt-1 rounded-xl border border-slate-200 bg-white p-2.5 transition hover:bg-slate-100"
            >
              <ArrowLeft size={19} />
            </button>

            <div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span>Billing</span>
                <span>/</span>
                <span className="text-blue-600">Settings</span>
              </div>

              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                Billing Settings
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Configure billing preferences and invoice behavior.
              </p>
            </div>
          </div>

          <button
            onClick={resetSettings}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold transition hover:bg-slate-100"
          >
            <RotateCcw size={16} />
            Reset changes
          </button>
        </header>

        {saved && (
          <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
            <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold">
                Settings validated successfully
              </p>
              <p className="mt-1 text-sm">
                These settings are currently held in page state only. Connect
                your backend to save them permanently.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <SettingsSection
            icon={<Settings size={20} />}
            title="General billing information"
            description="Set your organization's billing identity and default preferences."
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="Company name">
                <input
                  className={inputClass}
                  value={settings.companyName}
                  onChange={(event) =>
                    updateSetting("companyName", event.target.value)
                  }
                  placeholder="Enter company name"
                  required
                />
              </Field>

              <Field label="Billing email">
                <input
                  className={inputClass}
                  type="email"
                  value={settings.billingEmail}
                  onChange={(event) =>
                    updateSetting("billingEmail", event.target.value)
                  }
                  placeholder="billing@example.com"
                  required
                />
              </Field>

              <Field label="Default currency">
                <select
                  className={inputClass}
                  value={settings.currency}
                  onChange={(event) =>
                    updateSetting("currency", event.target.value)
                  }
                >
                  <option value="INR">INR — Indian Rupee</option>
                  <option value="USD">USD — US Dollar</option>
                  <option value="EUR">EUR — Euro</option>
                  <option value="GBP">GBP — British Pound</option>
                </select>
              </Field>

              <Field label="Default billing cycle">
                <select
                  className={inputClass}
                  value={settings.billingCycle}
                  onChange={(event) =>
                    updateSetting("billingCycle", event.target.value)
                  }
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </Field>
            </div>
          </SettingsSection>

          <SettingsSection
            icon={<FileText size={20} />}
            title="Invoice preferences"
            description="Customize invoice numbering, tax information, and payment terms."
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="Invoice prefix">
                <input
                  className={inputClass}
                  value={settings.invoicePrefix}
                  onChange={(event) =>
                    updateSetting("invoicePrefix", event.target.value)
                  }
                  placeholder="MN-INV"
                  required
                />
              </Field>

              <Field label="Payment terms">
                <select
                  className={inputClass}
                  value={settings.paymentTerms}
                  onChange={(event) =>
                    updateSetting("paymentTerms", event.target.value)
                  }
                >
                  <option value="Due immediately">Due immediately</option>
                  <option value="Net 7">Net 7 days</option>
                  <option value="Net 15">Net 15 days</option>
                  <option value="Net 30">Net 30 days</option>
                </select>
              </Field>
            </div>

            <div className="mt-6 rounded-xl border border-slate-200 p-4">
              <Toggle
                title="Enable tax information"
                description="Include applicable tax information on invoices."
                checked={settings.taxEnabled}
                onChange={(value) => updateSetting("taxEnabled", value)}
              />

              {settings.taxEnabled && (
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <Field label="Tax registration number">
                    <input
                      className={inputClass}
                      value={settings.taxNumber}
                      onChange={(event) =>
                        updateSetting("taxNumber", event.target.value)
                      }
                      placeholder="Enter tax registration number"
                    />
                  </Field>
                  <p className="mt-2 text-xs text-slate-500">
                    Verify tax details and applicable rules with your finance
                    team before using them on production invoices.
                  </p>
                </div>
              )}
            </div>
          </SettingsSection>

          <SettingsSection
            icon={<CreditCard size={20} />}
            title="Payment behavior"
            description="Configure how your billing workflow should handle payment events."
          >
            <Toggle
              title="Automatic payment retry"
              description="Allow the billing workflow to attempt retries after payment failures."
              checked={settings.autoRetry}
              onChange={(value) => updateSetting("autoRetry", value)}
            />

            <div className="my-4 border-t border-slate-100" />

            <Toggle
              title="Send payment receipts"
              description="Enable receipt notifications after successful payments."
              checked={settings.sendReceipts}
              onChange={(value) => updateSetting("sendReceipts", value)}
            />
          </SettingsSection>

          <SettingsSection
            icon={<Bell size={20} />}
            title="Billing notifications"
            description="Choose which billing events should trigger notifications."
          >
            <div className="space-y-5">
              <Toggle
                title="Payment failure alerts"
                description="Notify the billing team when a payment fails."
                checked={settings.paymentFailureAlerts}
                onChange={(value) =>
                  updateSetting("paymentFailureAlerts", value)
                }
              />

              <div className="border-t border-slate-100" />

              <Toggle
                title="Invoice notifications"
                description="Notify relevant users when invoices are generated or become due."
                checked={settings.invoiceAlerts}
                onChange={(value) => updateSetting("invoiceAlerts", value)}
              />

              <div className="border-t border-slate-100" />

              <Toggle
                title="Subscription renewal alerts"
                description="Notify users before subscription renewals."
                checked={settings.renewalAlerts}
                onChange={(value) => updateSetting("renewalAlerts", value)}
              />
            </div>
          </SettingsSection>

          <SettingsSection
            icon={<ShieldCheck size={20} />}
            title="Security and production readiness"
            description="Important considerations before enabling real billing operations."
          >
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-sm font-semibold text-blue-900">
                Backend integration required
              </p>
              <p className="mt-2 text-sm leading-6 text-blue-800">
                Production settings should be stored securely on the server
                with authentication and role-based access control. Payment
                retries, receipts, and notifications also require backend
                services. Never store payment secret keys or sensitive
                credentials in this page.
              </p>
            </div>
          </SettingsSection>

          <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
            <button
              type="button"
              onClick={resetSettings}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold transition hover:bg-slate-100"
            >
              Reset
            </button>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Save size={17} />
              Validate settings
            </button>
          </div>
        </form>

        <p className="text-center text-xs leading-5 text-slate-500">
          ModelNow Billing · Frontend prototype · Settings are not saved to a
          database.
        </p>
      </div>
    </main>
  );
}

function SettingsSection({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6 flex items-start gap-3">
        <div className="rounded-xl bg-blue-50 p-3 text-blue-600">{icon}</div>
        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="mt-1 text-sm leading-5 text-slate-500">
            {description}
          </p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      {children}
    </label>
  );
}

function Toggle({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-800">{title}</p>
        <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={() => onChange(!checked)}
        className={`relative mt-1 h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-blue-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}