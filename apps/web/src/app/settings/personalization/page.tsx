
"use client";

import { useEffect, useState } from "react";

type PersonalizationSettings = {
  memoryEnabled: boolean;
  baseStyle: string;
  warmth: string;
  enthusiasm: string;
  headersAndLists: string;
  emojiUsage: string;
};

const STORAGE_KEY = "modelnow-personalization";

const DEFAULTS: PersonalizationSettings = {
  memoryEnabled: true,
  baseStyle: "Default",
  warmth: "Default",
  enthusiasm: "Default",
  headersAndLists: "Default",
  emojiUsage: "Default",
};

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
      aria-label={label}
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${
        checked ? "bg-[#3984ff]" : "bg-gray-300"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
          checked ? "left-[18px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[22px] border border-gray-200 px-5">
      {children}
    </div>
  );
}

function Row({
  title,
  description,
  action,
  children,
  last = false,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 py-4 ${
        last ? "" : "border-b border-gray-200"
      }`}
    >
      <div className="min-w-0">
        <p className="text-base font-medium">{title}</p>
        {description && (
          <p className="mt-1 text-sm leading-5 text-gray-500">
            {description}
          </p>
        )}
      </div>
      {children ?? action}
    </div>
  );
}

function PreferenceSelect({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="max-w-40 shrink-0 cursor-pointer rounded-full border border-gray-300 bg-[#f7f7f7] px-4 py-3 text-sm outline-none focus:border-gray-500"
    >
      <option>Default</option>
      <option>More</option>
      <option>Less</option>
    </select>
  );
}

export default function PersonalizationSettingsPage() {
  const [settings, setSettings] =
    useState<PersonalizationSettings>(DEFAULTS);
  const [message, setMessage] = useState("");
  const [memorySummaryOpen, setMemorySummaryOpen] = useState(false);
  const [referenceType, setReferenceType] = useState<
    "Reference photo" | "Full-body reference photo" | null
  >(null);
  const [photoName, setPhotoName] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setSettings({ ...DEFAULTS, ...JSON.parse(saved) });
      }
    } catch {
      // Use defaults if stored preferences are invalid.
    }
  }, []);

  function update<K extends keyof PersonalizationSettings>(
    key: K,
    value: PersonalizationSettings[K]
  ) {
    setSettings((current) => {
      const next = { ...current, [key]: value };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        setMessage("Preferences saved.");
      } catch {
        setMessage("Could not save preferences.");
      }

      return next;
    });
  }

  return (
    <section className="space-y-16 pb-12">
      <header>
        <h1 className="text-[30px] font-normal tracking-tight">
          Personalization
        </h1>
      </header>

      <section className="space-y-3">
        <div>
<h2 className="text-base font-semibold">ModelNow Memory</h2>
          <p className="mt-1 text-base text-gray-500">
            Configure how ModelNow manages memory.{" "}
            <a href="/help-support" className="text-blue-600 hover:underline">
              Learn more
            </a>
          </p>
        </div>

        <Card>
          <Row
            title="Enable memory"
            description="Let ModelNow personalize your experience based on your chats, files, and connected apps."
          >
            <Toggle
              label="Enable memory"
              checked={settings.memoryEnabled}
              onChange={(value) => update("memoryEnabled", value)}
            />
          </Row>

          <Row
            title="Memory summary"
            description="View an overview of what ModelNow has learned about you. Use custom instructions for information you’d like it to always keep in mind."
            last
            action={
              <button
                type="button"
                onClick={() => setMemorySummaryOpen((open) => !open)}
                className="shrink-0 rounded-full bg-[#f3f3f3] px-4 py-3 text-sm hover:bg-gray-200"
              >
                Manage
              </button>
            }
          />

          {memorySummaryOpen && (
            <div className="border-t border-gray-200 py-4">
              <p className="text-sm text-gray-600">
                Memory summary is not connected to the ModelNow memory
                backend yet.
              </p>
            </div>
          )}

          <div className="border-t border-gray-200 py-4 text-sm text-gray-500">
            ModelNow may use memory to personalize responses.{" "}
            <a href="/help-support" className="text-blue-600 hover:underline">
              Learn more
            </a>
          </div>
        </Card>
      </section>

      <section className="space-y-5">
        <h2 className="text-base font-semibold">Reference photos</h2>

        <Card>
          <Row
            title="Reference photo"
            description="This is the photo ModelNow refers to when you create an image of yourself."
            action={
              <button
                type="button"
                onClick={() => setReferenceType("Reference photo")}
                className="flex shrink-0 items-center gap-3 text-base"
              >
                Add <span className="text-2xl text-gray-600">›</span>
              </button>
            }
          />

          <Row
            title="Full-body reference photo"
            description="Used to show how clothing and accessories look on you."
            last
            action={
              <button
                type="button"
                onClick={() => setReferenceType("Full-body reference photo")}
                className="flex shrink-0 items-center gap-3 text-base"
              >
                Add <span className="text-2xl text-gray-600">›</span>
              </button>
            }
          />
        </Card>
      </section>

      <section>
        <Card>
          <Row title="Base style and tone">
            <PreferenceSelect
              label="Base style and tone"
              value={settings.baseStyle}
              onChange={(value) => update("baseStyle", value)}
            />
          </Row>

          <Row title="Warmth">
            <PreferenceSelect
              label="Warmth"
              value={settings.warmth}
              onChange={(value) => update("warmth", value)}
            />
          </Row>

          <Row title="Enthusiasm">
            <PreferenceSelect
              label="Enthusiasm"
              value={settings.enthusiasm}
              onChange={(value) => update("enthusiasm", value)}
            />
          </Row>

          <Row title="Headers and lists">
            <PreferenceSelect
              label="Headers and lists"
              value={settings.headersAndLists}
              onChange={(value) => update("headersAndLists", value)}
            />
          </Row>

          <Row title="Emoji usage" last>
            <PreferenceSelect
              label="Emoji usage"
              value={settings.emojiUsage}
              onChange={(value) => update("emojiUsage", value)}
            />
          </Row>
        </Card>
      </section>

      {message && (
        <p role="status" className="text-sm text-gray-500">
          {message}
        </p>
      )}

      {referenceType && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          onClick={() => setReferenceType(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reference-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="reference-title" className="text-lg font-semibold">
              {referenceType}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Choose a reference image. Image storage and AI image generation
              integration will be connected separately.
            </p>

            <input
              type="file"
              accept="image/*"
              onChange={(event) =>
                setPhotoName(event.target.files?.[0]?.name ?? "")
              }
              className="mt-5 block w-full text-sm"
            />

            {photoName && (
              <p className="mt-2 break-all text-sm text-gray-600">
                Selected: {photoName}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setReferenceType(null);
                  setPhotoName("");
                }}
                className="rounded-full border border-gray-300 px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setMessage(
                    photoName
                      ? "Image selected. Upload and storage integration is not connected yet."
                      : "Choose an image first."
                  );
                  setReferenceType(null);
                  setPhotoName("");
                }}
                className="rounded-full bg-gray-900 px-4 py-2 text-sm text-white"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
