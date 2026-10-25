
"use client";

import { useEffect, useState } from "react";

type SecuritySettings = {
  authenticatorApp: boolean;
  textMessage: boolean;
};

const STORAGE_KEY = "modelnow-security";

const DEFAULTS: SecuritySettings = {
  authenticatorApp: false,
  textMessage: false,
};

function SettingRow({
  title,
  description,
  action,
  children,
  onClick,
}: {
  title: string;
  description: string;
  action?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-black/10 py-4 last:border-b-0">
      <div className="min-w-0">
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="mt-1 text-sm leading-5 text-gray-500">
          {description}
        </p>
      </div>

      {children ?? (
        <button
          type="button"
          onClick={onClick}
          className="flex shrink-0 items-center gap-3 text-sm hover:text-gray-500"
        >
          {action}
          <span aria-hidden="true" className="text-xl">›</span>
        </button>
      )}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-10 shrink-0 rounded-full transition ${
        checked ? "bg-blue-600" : "bg-gray-200"
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${
          checked ? "left-5" : "left-1"
        }`}
      />
    </button>
  );
}

export default function SecuritySettingsPage() {
  const [settings, setSettings] =
    useState<SecuritySettings>(DEFAULTS);
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setSettings({ ...DEFAULTS, ...JSON.parse(saved) });
      }
    } catch {
      // Keep defaults if saved preferences are invalid.
    }
  }, []);

  function update(key: keyof SecuritySettings, value: boolean) {
    const next = { ...settings, [key]: value };
    setSettings(next);
    setMessage("");

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setMessage("Demo preference saved.");
    } catch {
      setMessage("Could not save preference.");
    }
  }

  const showNotice = (feature: string) => {
    setMessage(`${feature} requires account-security backend integration.`);
  };

  const cardClass =
    "rounded-[20px] border border-gray-200 bg-white px-5";

  return (
    <section className="space-y-10 pb-10">
      <header>
        <h1 className="text-[30px] font-normal tracking-tight">
          Security and login
        </h1>
      </header>

      <section className="space-y-5">
        <h2 className="text-base font-semibold">How you log in</h2>
        <div className={cardClass}>
          <SettingRow
            title="Passkeys and security keys"
            description="Use a phishing-resistant alternative to passwords"
            action="Add"
            onClick={() => showNotice("Passkeys and security keys")}
          />
          <SettingRow
            title="Password"
            description="Manage the password you use to log in"
            action="Add"
            onClick={() => showNotice("Password management")}
          />
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="text-base font-semibold">
          Multi-factor authentication (MFA)
        </h2>

        <div className={cardClass}>
          <SettingRow
            title="Authenticator app"
            description="Use one-time codes from an authenticator app"
          >
            <Toggle
              label="Authenticator app"
              checked={settings.authenticatorApp}
              onChange={(value) => update("authenticatorApp", value)}
            />
          </SettingRow>

          <SettingRow
            title="Text message"
            description="Get 6-digit verification codes by SMS or WhatsApp based on your country code"
          >
            <Toggle
              label="Text message verification"
              checked={settings.textMessage}
              onChange={(value) => update("textMessage", value)}
            />
          </SettingRow>
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="text-base font-semibold">Sessions</h2>

        <div className={cardClass}>
          <SettingRow
            title="Active sessions"
            description="View devices that have accessed your account. Review active sessions, remove trusted devices, or log out all sessions."
            action="5"
            onClick={() => showNotice("Active sessions")}
          />
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="text-base font-semibold">Login connections</h2>

        <div className={cardClass}>
          <SettingRow
            title="Connected accounts"
            description="Manage external accounts used to sign in to ModelNow."
            action="Manage"
            onClick={() => showNotice("Connected accounts")}
          />
        </div>
      </section>

      {message && (
        <p role="status" className="text-sm text-gray-500">
          {message}
        </p>
      )}
    </section>
  );
}
