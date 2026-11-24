
"use client";

import { useEffect, useState } from "react";
import {
  loadGeneralSettings,
  saveGeneralSettings,
  type Theme,
} from "../../../lib/settings-storage";

type AppearanceSettings = {
  mode: "System" | "Light" | "Dark";
  accent: string;
  background: string;
  foreground: string;
  fontSize: number;
  codeFontSize: number;
  reduceMotion: "System" | "On" | "Off";
};

const STORAGE_KEY = "modelnow-appearance";

const DEFAULTS: AppearanceSettings = {
  mode: "System",
  accent: "#3668F5",
  background: "#FCFCFC",
  foreground: "#0D0D0D",
  fontSize: 14,
  codeFontSize: 12,
  reduceMotion: "System",
};

const accents = [
  { name: "Blue", value: "#3668F5" },
  { name: "Purple", value: "#8B5CF6" },
  { name: "Green", value: "#16A34A" },
  { name: "Orange", value: "#EA580C" },
  { name: "Pink", value: "#DB2777" },
];

function Preview({
  mode,
  selected,
  onClick,
}: {
  mode: AppearanceSettings["mode"];
  selected: boolean;
  onClick: () => void;
}) {
  const dark = mode === "Dark";
  const system = mode === "System";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${mode} appearance`}
      aria-pressed={selected}
      className={`flex h-[76px] w-[100px] items-center justify-center rounded-xl border-2 p-2 transition ${
        selected ? "border-blue-500" : "border-gray-200"
      }`}
    >
      <div className="flex h-full w-full overflow-hidden rounded-md border border-gray-300">
        {system && (
          <div className="w-1/2 bg-gray-100 p-1">
            <div className="h-full rounded bg-white p-1">
              <div className="mb-1 h-1 w-5 rounded bg-gray-300" />
              <div className="mb-1 h-1 w-7 rounded bg-gray-200" />
              <div className="h-1 w-4 rounded bg-blue-500" />
            </div>
          </div>
        )}
        <div
          className={`flex-1 p-1.5 ${
            dark ? "bg-[#171717]" : "bg-white"
          }`}
        >
          <div
            className={`mb-2 h-1 w-7 rounded ${
              dark ? "bg-blue-400" : "bg-blue-500"
            }`}
          />
          <div
            className={`mb-1 h-1 w-full rounded ${
              dark ? "bg-gray-600" : "bg-gray-200"
            }`}
          />
          <div
            className={`mb-1 h-1 w-4/5 rounded ${
              dark ? "bg-gray-600" : "bg-gray-200"
            }`}
          />
          <div
            className={`ml-auto h-1 w-3/5 rounded ${
              dark ? "bg-blue-400" : "bg-blue-500"
            }`}
          />
        </div>
      </div>
    </button>
  );
}

function ColorControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-black/10 py-3 last:border-b-0">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-2 rounded-full border border-gray-200 px-3 py-2">
        <input
          type="color"
          aria-label={`${label} color`}
          value={value}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          className="h-5 w-5 cursor-pointer rounded-full border-0 bg-transparent p-0"
        />
        <input
          aria-label={`${label} hex value`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={() => {
            if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
              onChange(DEFAULTS[label.toLowerCase() as "background" | "foreground"]);
            }
          }}
          className="w-[76px] bg-transparent text-xs outline-none"
          maxLength={7}
        />
      </div>
    </div>
  );
}

export default function AppearanceSettingsPage() {
  const [settings, setSettings] =
    useState<AppearanceSettings>(DEFAULTS);
  const [advancedOpen, setAdvancedOpen] = useState(true);
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        setSettings({ ...DEFAULTS, ...JSON.parse(stored) });
      } else {
        const general = loadGeneralSettings();
        setSettings((current) => ({
          ...current,
          mode: general.theme,
        }));
      }
    } catch {
      setSettings(DEFAULTS);
    }
  }, []);

  function update<K extends keyof AppearanceSettings>(
    key: K,
    value: AppearanceSettings[K]
  ) {
    setSettings((current) => ({ ...current, [key]: value }));
    setSavedMessage("");
  }

  function saveChanges() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

      const theme: Theme = settings.mode;
      const general = loadGeneralSettings();

      saveGeneralSettings({
        ...general,
        theme,
      });

      setSavedMessage("Appearance preferences saved.");
    } catch {
      setSavedMessage("Could not save changes. Please try again.");
    }
  }

  return (
    <section className="space-y-10 pb-10">
      <header>
        <h1 className="text-[30px] font-normal tracking-tight">
          Appearance
        </h1>
      </header>

      <section className="space-y-5">
        <h2 className="text-base font-semibold">Visual style</h2>

        <div className="flex items-center justify-between gap-5 rounded-[20px] border border-gray-200 bg-white px-5 py-3">
          <span className="text-sm font-medium">Mode</span>

          <div className="flex gap-3">
            {(["System", "Light", "Dark"] as const).map((mode) => (
              <Preview
                key={mode}
                mode={mode}
                selected={settings.mode === mode}
                onClick={() => update("mode", mode)}
              />
            ))}
          </div>
        </div>

        <div className="rounded-[20px] border border-gray-200 bg-white px-5">
          <div className="flex items-center justify-between gap-4 border-b border-black/10 py-4">
            <span className="text-sm font-medium">Theme</span>
            <select
              value={settings.mode}
              onChange={(event) =>
                update("mode", event.target.value as AppearanceSettings["mode"])
              }
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm outline-none"
            >
              <option value="System">System</option>
              <option value="Light">Light</option>
              <option value="Dark">Dark</option>
            </select>
          </div>

          <div className="flex items-center justify-between gap-4 border-b border-black/10 py-4">
            <span className="text-sm font-medium">Accent</span>

            <select
              value={settings.accent}
              onChange={(event) => update("accent", event.target.value)}
              className="rounded-full border border-gray-200 bg-white px-3 py-2 text-sm outline-none"
            >
              {accents.map((accent) => (
                <option key={accent.value} value={accent.value}>
                  {accent.name}
                </option>
              ))}
            </select>
          </div>

          <ColorControl
            label="Background"
            value={settings.background}
            onChange={(value) => update("background", value)}
          />

          <ColorControl
            label="Foreground"
            value={settings.foreground}
            onChange={(value) => update("foreground", value)}
          />
        </div>
      </section>

      <section className="space-y-5">
        <button
          type="button"
          onClick={() => setAdvancedOpen((open) => !open)}
          aria-expanded={advancedOpen}
          className="flex items-center gap-2 text-base font-medium text-gray-500"
        >
          Advanced
          <span className="text-lg">{advancedOpen ? "⌄" : "›"}</span>
        </button>

        {advancedOpen && (
          <>
            <div className="rounded-[20px] border border-gray-200 bg-white px-5">
              <div className="flex items-center justify-between gap-4 border-b border-black/10 py-5">
                <div>
                  <p className="text-sm font-medium">UI font size</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Adjust the base size used for ChatGPT-style content
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={10}
                    max={24}
                    value={settings.fontSize}
                    onChange={(event) =>
                      update("fontSize", Number(event.target.value))
                    }
                    className="w-20 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                  <span className="text-sm text-gray-500">px</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 py-5">
                <div>
                  <p className="text-sm font-medium">Code font size</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Adjust the base size used for code and diffs
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={10}
                    max={24}
                    value={settings.codeFontSize}
                    onChange={(event) =>
                      update("codeFontSize", Number(event.target.value))
                    }
                    className="w-20 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                  <span className="text-sm text-gray-500">px</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-[20px] border border-gray-200 bg-white px-5 py-5">
              <div>
                <p className="text-sm font-medium">Reduce motion</p>
                <p className="mt-1 text-sm text-gray-500">
                  Reduce animations or match your system preference.
                </p>
              </div>

              <div className="flex shrink-0 rounded-full bg-gray-100 p-1">
                {(["System", "On", "Off"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => update("reduceMotion", option)}
                    aria-pressed={settings.reduceMotion === option}
                    className={`rounded-full px-3 py-1.5 text-sm ${
                      settings.reduceMotion === option
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={saveChanges}
          className="rounded-full bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          Save changes
        </button>

        {savedMessage && (
          <p role="status" className="text-sm text-gray-600">
            {savedMessage}
          </p>
        )}
      </div>
    </section>
  );
}
