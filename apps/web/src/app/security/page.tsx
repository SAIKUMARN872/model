"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Apple,
  ChevronRight,
  Clock3,
  Copy,
  Download,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  Monitor,
  Phone,
  Plus,
  RefreshCw,
  Shield,
  ShieldAlert,
  Smartphone,
  Trash2,
  UserCheck,
  Users,
  X,
} from "lucide-react";

type SecuritySection = {
  title: string;
  items: {
    title: string;
    description: string;
    icon: React.ElementType;
    action?: "toggle" | "button" | "danger";
  }[];
};

const sections: SecuritySection[] = [
  {
    title: "Login & Authentication",
    items: [
      {
        title: "Change Password",
        description: "Update your account password.",
        icon: Lock,
        action: "button",
      },
      {
        title: "Two-Factor Authentication (2FA)",
        description: "Add an extra layer of protection to your account.",
        icon: Shield,
        action: "toggle",
      },
      {
        title: "Passkeys",
        description: "Use a passkey for faster and more secure sign-in.",
        icon: KeyRound,
        action: "button",
      },
      {
        title: "Google Login",
        description: "Manage your Google authentication connection.",
        icon: UserCheck,
        action: "button",
      },
      {
        title: "Login Verification",
        description: "Require verification when a new login is detected.",
        icon: ShieldAlert,
        action: "toggle",
      },
    ],
  },
  {
    title: "Active Sessions",
    items: [
      {
        title: "Current Device",
        description: "This device is currently signed in.",
        icon: Monitor,
        action: "button",
      },
      {
        title: "Other Devices",
        description: "Review devices currently connected to your account.",
        icon: Smartphone,
        action: "button",
      },
      {
        title: "Login Location",
        description: "Review locations associated with recent logins.",
        icon: MapPin,
        action: "button",
      },
      {
        title: "Last Active",
        description: "View when your account was last active.",
        icon: Clock3,
        action: "button",
      },
      {
        title: "Sign Out Other Devices",
        description: "Sign out of all devices except this one.",
        icon: RefreshCw,
        action: "button",
      },
    ],
  },
  {
    title: "API Security",
    items: [
      {
        title: "API Keys",
        description: "Manage API credentials for your account.",
        icon: KeyRound,
        action: "button",
      },
      {
        title: "Create API Key",
        description: "Generate a new API key.",
        icon: Plus,
        action: "button",
      },
      {
        title: "Revoke API Key",
        description: "Disable an API key that you no longer use.",
        icon: X,
        action: "danger",
      },
      {
        title: "API Usage",
        description: "Monitor API requests and usage.",
        icon: Clock3,
        action: "button",
      },
    ],
  },
  {
    title: "Privacy Controls",
    items: [
      {
        title: "Chat Data Privacy",
        description: "Control how your chat data is handled.",
        icon: Lock,
        action: "button",
      },
      {
        title: "Memory Controls",
        description: "Manage what ModelNow remembers about you.",
        icon: Shield,
        action: "toggle",
      },
      {
        title: "Shared Chat Management",
        description: "Manage chats that you have shared.",
        icon: Users,
        action: "button",
      },
      {
        title: "Connected Apps",
        description: "Review applications connected to ModelNow.",
        icon: Apple,
        action: "button",
      },
      {
        title: "Data Export",
        description: "Download a copy of your account data.",
        icon: Download,
        action: "button",
      },
    ],
  },
  {
    title: "Security Activity",
    items: [
      {
        title: "Login History",
        description: "Review recent login activity.",
        icon: Clock3,
        action: "button",
      },
      {
        title: "Password Changes",
        description: "Review recent password changes.",
        icon: Lock,
        action: "button",
      },
      {
        title: "Security Alerts",
        description: "Review important security notifications.",
        icon: ShieldAlert,
        action: "button",
      },
      {
        title: "Suspicious Activity",
        description: "Review potentially unusual account activity.",
        icon: AlertTriangle,
        action: "button",
      },
    ],
  },
  {
    title: "Account Protection",
    items: [
      {
        title: "Recovery Email",
        description: "Manage your recovery email address.",
        icon: Mail,
        action: "button",
      },
      {
        title: "Recovery Phone",
        description: "Manage your recovery phone number.",
        icon: Phone,
        action: "button",
      },
      {
        title: "Delete Account",
        description: "Permanently delete your ModelNow account.",
        icon: Trash2,
        action: "danger",
      },
    ],
  },
];

export default function SecurityPage() {
  const [twoFactor, setTwoFactor] = useState(false);
  const [loginVerification, setLoginVerification] = useState(true);
  const [memory, setMemory] = useState(true);

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);

  const [apiKey, setApiKey] = useState("mn_live_xxxxxxxxxxxxxxxxx");

  const handleItemClick = (title: string) => {
    if (title === "Two-Factor Authentication (2FA)") {
      setTwoFactor((value) => !value);
      return;
    }

    if (title === "Login Verification") {
      setLoginVerification((value) => !value);
      return;
    }

    if (title === "Memory Controls") {
      setMemory((value) => !value);
      return;
    }

    setActiveModal(title);
  };

  const generateApiKey = () => {
    const randomKey =
      "mn_live_" +
      Math.random().toString(36).substring(2, 18) +
      Math.random().toString(36).substring(2, 18);

    setApiKey(randomKey);
    setActiveModal("API Keys");
  };

  const copyApiKey = async () => {
    await navigator.clipboard.writeText(apiKey);
  };

  const handleExport = () => {
    const securityData = {
      product: "ModelNow",
      exportedAt: new Date().toISOString(),
      security: {
        twoFactorEnabled: twoFactor,
        loginVerificationEnabled: loginVerification,
        memoryEnabled: memory,
      },
      message:
        "This frontend export is a placeholder until backend account data export is connected.",
    };

    const blob = new Blob([JSON.stringify(securityData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "modelnow-security-data.json";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#17181a]">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#e5e7eb] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center px-6">
          <div>
            <h1 className="text-lg font-semibold">Security & Privacy</h1>
            <p className="text-xs text-[#73777d]">
              Manage your account security and privacy controls
            </p>
          </div>
        </div>
      </header>

      {/* Main */}
      <section className="mx-auto max-w-5xl px-6 py-8">
        {/* Security overview */}
        <div className="mb-7 rounded-2xl border border-[#e5e7eb] bg-white p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f1f3f5]">
              <Shield size={23} />
            </div>

            <div className="flex-1">
              <h2 className="text-base font-semibold">
                Your security matters
              </h2>

              <p className="mt-1 text-sm leading-6 text-[#73777d]">
                Manage authentication, active sessions, API security, privacy,
                and account protection settings from one place.
              </p>
            </div>

            <div className="hidden rounded-full bg-[#f1f5f1] px-3 py-1 text-xs font-medium text-[#3d6645] sm:block">
              Protected
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-7">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="mb-3 px-1 text-sm font-semibold text-[#3d4146]">
                {section.title}
              </h2>

              <div className="overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white">
                {section.items.map((item, index) => {
                  const Icon = item.icon;

                  const isToggle =
                    item.title === "Two-Factor Authentication (2FA)" ||
                    item.title === "Login Verification" ||
                    item.title === "Memory Controls";

                  const toggleValue =
                    item.title === "Two-Factor Authentication (2FA)"
                      ? twoFactor
                      : item.title === "Login Verification"
                        ? loginVerification
                        : memory;

                  return (
                    <div
                      key={item.title}
                      className={`flex items-center gap-4 px-5 py-4 transition ${
                        index !== section.items.length - 1
                          ? "border-b border-[#eeeeef]"
                          : ""
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          item.action === "danger"
                            ? "bg-[#fff1f1]"
                            : "bg-[#f3f4f6]"
                        }`}
                      >
                        <Icon
                          size={18}
                          className={
                            item.action === "danger"
                              ? "text-[#c43d3d]"
                              : "text-[#454a50]"
                          }
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm font-medium ${
                            item.action === "danger"
                              ? "text-[#c43d3d]"
                              : "text-[#25272a]"
                          }`}
                        >
                          {item.title}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-[#80848a]">
                          {item.description}
                        </p>
                      </div>

                      {isToggle ? (
                        <button
                          type="button"
                          onClick={() => handleItemClick(item.title)}
                          className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                            toggleValue ? "bg-[#17181a]" : "bg-[#d6d8dc]"
                          }`}
                          aria-label={`Toggle ${item.title}`}
                        >
                          <span
                            className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                              toggleValue ? "left-6" : "left-1"
                            }`}
                          />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            if (item.title === "Create API Key") {
                              generateApiKey();
                            } else if (item.title === "Data Export") {
                              handleExport();
                            } else {
                              handleItemClick(item.title);
                            }
                          }}
                          className={`flex h-9 shrink-0 items-center gap-1 rounded-lg px-3 text-xs font-medium transition ${
                            item.action === "danger"
                              ? "text-[#c43d3d] hover:bg-[#fff2f2]"
                              : "text-[#555a60] hover:bg-[#f5f5f5]"
                          }`}
                        >
                          {item.action === "danger" ? "Manage" : "Manage"}
                          <ChevronRight size={14} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </section>

      {/* Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5">
          <div className="w-full max-w-md rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">{activeModal}</h2>

              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#777b81] hover:bg-[#f3f4f6]"
              >
                <X size={18} />
              </button>
            </div>

            {activeModal === "API Keys" ? (
              <div className="mt-5">
                <p className="text-sm leading-6 text-[#73777d]">
                  Manage the API key used to connect ModelNow with external
                  applications and services.
                </p>

                <div className="mt-5 rounded-xl border border-[#e5e7eb] bg-[#fafafa] p-4">
                  <div className="flex items-center gap-3">
                    <KeyRound size={18} />

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-[#6d7176]">
                        API Key
                      </p>

                      <p className="mt-1 truncate font-mono text-xs">
                        {showApiKey
                          ? apiKey
                          : "mn_live_••••••••••••••••••••"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowApiKey((value) => !value)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#eeeeef]"
                    >
                      {showApiKey ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={copyApiKey}
                      className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#eeeeef]"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>

                <div className="mt-5 flex gap-3">
                  <button
                    type="button"
                    onClick={generateApiKey}
                    className="flex-1 rounded-xl bg-[#17181a] px-4 py-3 text-sm font-medium text-white hover:bg-[#2b2d30]"
                  >
                    Create New Key
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="flex-1 rounded-xl border border-[#e1e3e6] px-4 py-3 text-sm font-medium hover:bg-[#f5f5f5]"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : activeModal === "Delete Account" ? (
              <div className="mt-5">
                <div className="rounded-xl border border-[#f2cccc] bg-[#fff5f5] p-4">
                  <div className="flex gap-3">
                    <Trash2
                      size={19}
                      className="mt-0.5 shrink-0 text-[#c43d3d]"
                    />

                    <div>
                      <p className="text-sm font-medium text-[#a83232]">
                        Permanently delete your account
                      </p>

                      <p className="mt-1 text-xs leading-5 text-[#8a5555]">
                        This action is irreversible. Connect this action to
                        your backend account-deletion API before enabling it
                        for production.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="flex-1 rounded-xl border border-[#e1e3e6] px-4 py-3 text-sm font-medium hover:bg-[#f5f5f5]"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="flex-1 rounded-xl bg-[#c43d3d] px-4 py-3 text-sm font-medium text-white hover:bg-[#a83232]"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-5">
                <p className="text-sm leading-6 text-[#73777d]">
                  The{" "}
                  <span className="font-medium text-[#25272a]">
                    {activeModal}
                  </span>{" "}
                  settings are ready for integration with the ModelNow
                  authentication and security backend.
                </p>

                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="mt-6 w-full rounded-xl bg-[#17181a] px-4 py-3 text-sm font-medium text-white hover:bg-[#2b2d30]"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}