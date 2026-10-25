"use client";

import {
  useEffect,
  useState,
  type ElementType,
  type ReactNode,
} from "react";

import {
  Settings,
  Sun,
  Moon,
  Monitor,
  MessageSquare,
  Sparkles,
  Database,
  Accessibility,
  Code2,
  ChevronDown,
  Download,
  Trash2,
  RotateCcw,
  Plug,
  KeyRound,
  ShieldCheck,
  Check,
  ArrowLeft,
} from "lucide-react";

type Theme = "Light" | "Dark" | "System";

type SettingsData = {
  general: {
    theme: Theme;
    language: string;
    timezone: string;
    dateFormat: string;
  };
  chat: {
    enterToSend: boolean;
    showTimestamps: boolean;
    autoChatTitles: boolean;
    defaultModel: string;
    conversationHistory: boolean;
    responseStreaming: boolean;
  };
  ai: {
    autoModelRouting: boolean;
    costOptimization: boolean;
    qualityPriority: boolean;
    latencyPriority: boolean;
    defaultProvider: string;
  };
  dataControls: {
    chatHistory: boolean;
    memory: boolean;
    trainingPreferences: string;
  };
  accessibility: {
    fontSize: string;
    reduceMotion: boolean;
    highContrast: boolean;
    screenReader: boolean;
  };
  advanced: {
    developerMode: boolean;
    apiAccess: boolean;
  };
};

const STORAGE_KEY = "modelnow-settings";
const CONVERSATIONS_KEY = "modelnow-conversations";

const DEFAULT_SETTINGS: SettingsData = {
  general: {
    theme: "System",
    language: "English",
    timezone: "Asia/Kolkata",
    dateFormat: "DD/MM/YYYY",
  },
  chat: {
    enterToSend: true,
    showTimestamps: false,
    autoChatTitles: true,
    defaultModel: "Auto",
    conversationHistory: true,
    responseStreaming: true,
  },
  ai: {
    autoModelRouting: true,
    costOptimization: true,
    qualityPriority: false,
    latencyPriority: false,
    defaultProvider: "ModelNow",
  },
  dataControls: {
    chatHistory: true,
    memory: true,
    trainingPreferences: "Improve AI",
  },
  accessibility: {
    fontSize: "Medium",
    reduceMotion: false,
    highContrast: false,
    screenReader: false,
  },
  advanced: {
    developerMode: false,
    apiAccess: false,
  },
};

function loadSettings(): SettingsData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) return DEFAULT_SETTINGS;

    const parsed: unknown = JSON.parse(raw);

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return DEFAULT_SETTINGS;
    }

    const stored = parsed as Partial<SettingsData>;

    const theme = stored.general?.theme;

    return {
      general: {
        ...DEFAULT_SETTINGS.general,
        ...stored.general,
        theme:
          theme === "Light" || theme === "Dark" || theme === "System"
            ? theme
            : DEFAULT_SETTINGS.general.theme,
      },
      chat: {
        ...DEFAULT_SETTINGS.chat,
        ...stored.chat,
      },
      ai: {
        ...DEFAULT_SETTINGS.ai,
        ...stored.ai,
      },
      dataControls: {
        ...DEFAULT_SETTINGS.dataControls,
        ...stored.dataControls,
      },
      accessibility: {
        ...DEFAULT_SETTINGS.accessibility,
        ...stored.accessibility,
      },
      advanced: {
        ...DEFAULT_SETTINGS.advanced,
        ...stored.advanced,
      },
    };
  } catch (error) {
    console.error("Failed to load ModelNow settings:", error);
    return DEFAULT_SETTINGS;
  }
}

export default function SettingsPage() {
  const [settings, setSettings] =
    useState<SettingsData>(DEFAULT_SETTINGS);

  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    setSettings(loadSettings());
    setSettingsLoaded(true);
  }, []);

  const { general, chat, ai, dataControls, accessibility, advanced } =
    settings;

  function updateSection<K extends keyof SettingsData>(
    section: K,
    key: keyof SettingsData[K],
    value: SettingsData[K][keyof SettingsData[K]]
  ) {
    setSettings((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [key]: value,
      },
    }));

    setSaved(false);
    setStatusMessage("");
  }

  function saveSettings() {
    if (!settingsLoaded) return;

    try {
      const serialized = JSON.stringify(settings);

      localStorage.setItem(STORAGE_KEY, serialized);

      const storedValue = localStorage.getItem(STORAGE_KEY);

      if (storedValue !== serialized) {
        throw new Error("Settings verification failed.");
      }

      setSaved(true);
      setStatusMessage("Settings saved on this device.");

      window.setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Failed to save ModelNow settings:", error);
      setSaved(false);
      setStatusMessage(
        "Could not save settings. Check your browser storage and try again."
      );
    }
  }

  function exportData() {
    try {
      const data = {
        exportedAt: new Date().toISOString(),
        settings,
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "modelnow-settings.json";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => URL.revokeObjectURL(url), 1000);

      setStatusMessage("Settings export downloaded.");
    } catch (error) {
      console.error("Failed to export settings:", error);
      setStatusMessage("Could not export settings. Please try again.");
    }
  }

  function clearConversations() {
    const confirmed = window.confirm(
      "Are you sure you want to clear locally saved conversations? This cannot be undone."
    );

    if (!confirmed) return;

    try {
      localStorage.removeItem(CONVERSATIONS_KEY);
      setStatusMessage("Locally saved conversations have been cleared.");
    } catch (error) {
      console.error("Failed to clear conversations:", error);
      setStatusMessage("Could not clear conversations. Please try again.");
    }
  }

  function resetPreferences() {
    const confirmed = window.confirm(
      "Reset all ModelNow preferences to their default values?"
    );

    if (!confirmed) return;

    try {
      localStorage.removeItem(STORAGE_KEY);
      setSettings(DEFAULT_SETTINGS);
      setSaved(false);
      setStatusMessage("Preferences reset to their default values.");
    } catch (error) {
      console.error("Failed to reset preferences:", error);
      setStatusMessage("Could not reset preferences. Please try again.");
    }
  }

  function goBack() {
    window.history.back();
  }

  return (
    <main className="min-h-screen bg-[#fafafa] text-[#171717]">
      <div className="mx-auto max-w-[760px] px-5 py-8 md:py-10">
        <div className="mb-8 flex items-center gap-3">
          <button
            type="button"
            onClick={goBack}
            aria-label="Go back"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="text-[18px] font-semibold tracking-[-0.02em]">
              Settings
            </h1>
            <p className="mt-1 text-xs text-gray-500">
              Manage your ModelNow preferences
            </p>
          </div>
        </div>

        {!settingsLoaded ? (
          <div
            className="rounded-xl border border-black/[0.08] bg-white p-6 text-sm text-gray-500"
            role="status"
          >
            Loading settings...
          </div>
        ) : (
          <div className="space-y-8">
            <SettingsSection
              icon={Settings}
              title="General"
              description="Basic preferences for your ModelNow experience."
            >
              <SettingRow
                title="Theme"
                description="Choose how ModelNow should appear."
              >
                <div className="grid grid-cols-3 gap-2">
                  <ThemeButton
                    icon={Sun}
                    label="Light"
                    active={general.theme === "Light"}
                    onClick={() =>
                      updateSection("general", "theme", "Light")
                    }
                  />
                  <ThemeButton
                    icon={Moon}
                    label="Dark"
                    active={general.theme === "Dark"}
                    onClick={() =>
                      updateSection("general", "theme", "Dark")
                    }
                  />
                  <ThemeButton
                    icon={Monitor}
                    label="System"
                    active={general.theme === "System"}
                    onClick={() =>
                      updateSection("general", "theme", "System")
                    }
                  />
                </div>
              </SettingRow>

              <SettingRow
                title="Language"
                description="Default language used by ModelNow."
              >
                <Select
                  value={general.language}
                  onChange={(value) =>
                    updateSection("general", "language", value)
                  }
                  options={[
                    "English",
                    "Telugu",
                    "Hindi",
                    "Spanish",
                    "French",
                    "German",
                  ]}
                />
              </SettingRow>

              <SettingRow
                title="Timezone"
                description="Used for schedules and timestamps."
              >
                <Select
                  value={general.timezone}
                  onChange={(value) =>
                    updateSection("general", "timezone", value)
                  }
                  options={[
                    "Asia/Kolkata",
                    "UTC",
                    "America/New_York",
                    "America/Los_Angeles",
                    "Europe/London",
                    "Asia/Dubai",
                  ]}
                />
              </SettingRow>

              <SettingRow
                title="Date Format"
                description="Choose how dates are displayed."
              >
                <Select
                  value={general.dateFormat}
                  onChange={(value) =>
                    updateSection("general", "dateFormat", value)
                  }
                  options={["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]}
                />
              </SettingRow>
            </SettingsSection>

            <SettingsSection
              icon={MessageSquare}
              title="Chat Settings"
              description="Control how conversations work."
            >
              <ToggleRow
                title="Enter to Send"
                description="Press Enter to send a message."
                value={chat.enterToSend}
                onChange={(value) =>
                  updateSection("chat", "enterToSend", value)
                }
              />
              <ToggleRow
                title="Show Timestamps"
                description="Show timestamps beside messages."
                value={chat.showTimestamps}
                onChange={(value) =>
                  updateSection("chat", "showTimestamps", value)
                }
              />
              <ToggleRow
                title="Auto-Generate Chat Titles"
                description="Automatically create titles for new conversations."
                value={chat.autoChatTitles}
                onChange={(value) =>
                  updateSection("chat", "autoChatTitles", value)
                }
              />

              <SettingRow
                title="Default Model"
                description="Model used when no model is manually selected."
              >
                <Select
                  value={chat.defaultModel}
                  onChange={(value) =>
                    updateSection("chat", "defaultModel", value)
                  }
                  options={[
                    "Auto",
                    "ModelNow Smart",
                    "ModelNow Fast",
                    "ModelNow Reasoning",
                    "GPT",
                    "Claude",
                    "Gemini",
                  ]}
                />
              </SettingRow>

              <ToggleRow
                title="Conversation History"
                description="Keep previous conversations available in your history."
                value={chat.conversationHistory}
                onChange={(value) =>
                  updateSection("chat", "conversationHistory", value)
                }
              />
              <ToggleRow
                title="Response Streaming"
                description="Show AI responses while they are being generated."
                value={chat.responseStreaming}
                onChange={(value) =>
                  updateSection("chat", "responseStreaming", value)
                }
              />
            </SettingsSection>

            <SettingsSection
              icon={Sparkles}
              title="AI Settings"
              description="Configure AI routing and response priorities."
            >
              <ToggleRow
                title="Auto Model Routing"
                description="Automatically select the appropriate model for each request."
                value={ai.autoModelRouting}
                onChange={(value) =>
                  updateSection("ai", "autoModelRouting", value)
                }
              />
              <ToggleRow
                title="Cost Optimization"
                description="Prefer cost-efficient models when possible."
                value={ai.costOptimization}
                onChange={(value) =>
                  updateSection("ai", "costOptimization", value)
                }
              />
              <ToggleRow
                title="Quality Priority"
                description="Prioritize response quality over cost."
                value={ai.qualityPriority}
                onChange={(value) =>
                  updateSection("ai", "qualityPriority", value)
                }
              />
              <ToggleRow
                title="Latency Priority"
                description="Prefer faster models and lower response latency."
                value={ai.latencyPriority}
                onChange={(value) =>
                  updateSection("ai", "latencyPriority", value)
                }
              />

              <SettingRow
                title="Default AI Provider"
                description="Choose the default provider for AI requests."
              >
                <Select
                  value={ai.defaultProvider}
                  onChange={(value) =>
                    updateSection("ai", "defaultProvider", value)
                  }
                  options={[
                    "ModelNow",
                    "OpenAI",
                    "Anthropic",
                    "Google",
                    "Azure",
                  ]}
                />
              </SettingRow>
            </SettingsSection>

            <SettingsSection
              icon={Database}
              title="Data Controls"
              description="Manage your conversations, memory and data preferences."
            >
              <ToggleRow
                title="Chat History"
                description="Save conversations to your ModelNow history."
                value={dataControls.chatHistory}
                onChange={(value) =>
                  updateSection("dataControls", "chatHistory", value)
                }
              />
              <ToggleRow
                title="Memory"
                description="Allow ModelNow to remember useful preferences."
                value={dataControls.memory}
                onChange={(value) =>
                  updateSection("dataControls", "memory", value)
                }
              />

              <SettingRow
                title="Data Export"
                description="Download your current ModelNow settings."
              >
                <ActionButton onClick={exportData}>
                  <Download size={15} />
                  Export Data
                </ActionButton>
              </SettingRow>

              <SettingRow
                title="Clear Conversations"
                description="Remove conversations saved under this app's local storage key."
              >
                <button
                  type="button"
                  onClick={clearConversations}
                  className="flex items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50"
                >
                  <Trash2 size={15} />
                  Clear
                </button>
              </SettingRow>

              <SettingRow
                title="Training Data Preferences"
                description="Choose your local preference for AI data use."
              >
                <Select
                  value={dataControls.trainingPreferences}
                  onChange={(value) =>
                    updateSection(
                      "dataControls",
                      "trainingPreferences",
                      value
                    )
                  }
                  options={[
                    "Improve AI",
                    "Do Not Use My Data",
                    "Ask Me Each Time",
                  ]}
                />
              </SettingRow>
            </SettingsSection>

            <SettingsSection
              icon={Accessibility}
              title="Accessibility"
              description="Make ModelNow easier to use."
            >
              <SettingRow
                title="Font Size"
                description="Choose the interface text size."
              >
                <Select
                  value={accessibility.fontSize}
                  onChange={(value) =>
                    updateSection("accessibility", "fontSize", value)
                  }
                  options={["Small", "Medium", "Large", "Extra Large"]}
                />
              </SettingRow>

              <ToggleRow
                title="Reduce Motion"
                description="Reduce animations throughout the application."
                value={accessibility.reduceMotion}
                onChange={(value) =>
                  updateSection("accessibility", "reduceMotion", value)
                }
              />
              <ToggleRow
                title="High Contrast"
                description="Increase visual contrast for interface elements."
                value={accessibility.highContrast}
                onChange={(value) =>
                  updateSection("accessibility", "highContrast", value)
                }
              />
              <ToggleRow
                title="Screen Reader Support"
                description="Enable accessibility optimizations for screen readers."
                value={accessibility.screenReader}
                onChange={(value) =>
                  updateSection("accessibility", "screenReader", value)
                }
              />
            </SettingsSection>

            <SettingsSection
              icon={Code2}
              title="Advanced"
              description="Developer and advanced platform controls."
            >
              <ToggleRow
                title="Developer Mode"
                description="Save your preference for developer and debugging options."
                value={advanced.developerMode}
                onChange={(value) =>
                  updateSection("advanced", "developerMode", value)
                }
              />
              <ToggleRow
                title="API Access"
                description="Save your preference for API access."
                value={advanced.apiAccess}
                onChange={(value) =>
                  updateSection("advanced", "apiAccess", value)
                }
              />

              <SettingRow
                title="Connected Integrations"
                description="Manage external services connected to ModelNow."
              >
                <ActionButton
                  onClick={() =>
                    alert(
                      "Integration management will be connected to the backend later."
                    )
                  }
                >
                  <Plug size={15} />
                  Manage
                </ActionButton>
              </SettingRow>

              <SettingRow
                title="API Settings"
                description="Developer credentials and API configuration."
              >
                <ActionButton
                  onClick={() =>
                    alert(
                      "API credentials will be connected to the backend later."
                    )
                  }
                >
                  <KeyRound size={15} />
                  API Settings
                </ActionButton>
              </SettingRow>

              <SettingRow
                title="Reset Preferences"
                description="Restore all settings to their default values."
              >
                <button
                  type="button"
                  onClick={resetPreferences}
                  className="flex items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50"
                >
                  <RotateCcw size={15} />
                  Reset
                </button>
              </SettingRow>
            </SettingsSection>

            <div className="rounded-xl border border-black/[0.08] bg-white p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium">Save your changes</p>
                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Preferences are stored locally on this device for now.
                    Backend synchronization can be added later.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={saveSettings}
                  disabled={!settingsLoaded}
                  className="flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-xs font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saved ? <Check size={15} /> : <Settings size={15} />}
                  {saved ? "Saved" : "Save Changes"}
                </button>
              </div>

              {statusMessage && (
                <p className="mt-3 text-xs text-gray-600" role="status">
                  {statusMessage}
                </p>
              )}
            </div>

            <div className="flex gap-3 rounded-xl border border-black/[0.07] bg-white p-5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                <ShieldCheck size={17} />
              </div>
              <div>
                <p className="text-sm font-medium">
                  Your settings are stored locally
                </p>
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Authentication, database persistence, API credentials and
                  organization-level policies require backend integration.
                </p>
              </div>
            </div>

            <div className="pb-8 text-center">
              <p className="text-[11px] text-gray-400">ModelNow Settings</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: ElementType;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section
      id={title.toLowerCase().replace(/\s+/g, "-")}
      className="scroll-mt-8"
    >
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
          <Icon size={17} />
        </div>
        <div>
          <h2 className="text-base font-semibold tracking-[-0.01em]">
            {title}
          </h2>
          <p className="mt-1 text-xs leading-5 text-gray-500">
            {description}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-black/[0.08] bg-white">
        <div className="divide-y divide-black/[0.07]">{children}</div>
      </div>
    </section>
  );
}

function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="min-w-0">
        <h3 className="text-sm font-medium text-gray-800">{title}</h3>
        <p className="mt-1 max-w-xl text-xs leading-5 text-gray-500">
          {description}
        </p>
      </div>

      <div className="w-full sm:w-auto sm:min-w-[210px]">{children}</div>
    </div>
  );
}

function ToggleRow({
  title,
  description,
  value,
  onChange,
}: {
  title: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-5 px-5 py-5 sm:px-6">
      <div className="min-w-0">
        <h3 className="text-sm font-medium text-gray-800">{title}</h3>
        <p className="mt-1 max-w-xl text-xs leading-5 text-gray-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-label={title}
        onClick={() => onChange(!value)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          value ? "bg-black" : "bg-gray-200"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
            value ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full appearance-none rounded-lg border border-black/[0.1] bg-white px-3 py-2.5 pr-9 text-sm text-gray-700 outline-none transition focus:border-black/30 focus:ring-2 focus:ring-black/[0.04]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <ChevronDown
        size={15}
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
      />
    </div>
  );
}

function ThemeButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 rounded-lg border px-3 py-3 text-xs font-medium transition ${
        active
          ? "border-black bg-black text-white"
          : "border-black/[0.1] bg-white text-gray-600 hover:bg-gray-50"
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}

function ActionButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 rounded-lg border border-black/[0.1] bg-white px-3 py-2.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 sm:w-auto"
    >
      {children}
    </button>
  );
}