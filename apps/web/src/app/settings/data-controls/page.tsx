
"use client";

import { useState } from "react";

type DialogType =
  | "shared-links"
  | "app-sharing"
  | "archived-chats"
  | "ads"
  | "cookies"
  | "marketing"
  | "archive-all"
  | "delete-all"
  | "export"
  | null;

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
      className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${
        checked ? "bg-[#3984ff]" : "bg-[#c8c8c8]"
      }`}
    >
      <span
        className={`absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-all ${
          checked ? "left-[19px]" : "left-[3px]"
        }`}
      />
    </button>
  );
}

function ControlRow({
  title,
  description,
  action,
  onClick,
  danger = false,
}: {
  title: string;
  description?: string;
  action: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <div className="flex min-h-[76px] items-center justify-between gap-4 border-b border-[#dedede] py-3 last:border-b-0">
      <div className="min-w-0">
        <p className="text-base font-medium">{title}</p>
        {description && (
          <p className="mt-1 text-sm text-[#666]">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onClick}
        className={`shrink-0 rounded-full px-4 py-3 text-base transition ${
          danger
            ? "bg-[#fbe7e7] text-[#e53935] hover:bg-[#f7dada]"
            : "bg-[#f0f0f0] text-black hover:bg-[#e6e6e6]"
        }`}
      >
        {action}
      </button>
    </div>
  );
}

export default function DataControlsPage() {
  const [improveModels, setImproveModels] = useState(true);
  const [workNetwork, setWorkNetwork] = useState(true);
  const [dialog, setDialog] = useState<DialogType>(null);
  const [notice, setNotice] = useState("");

  const messages: Record<Exclude<DialogType, null>, {
    title: string;
    description: string;
    confirm?: string;
  }> = {
    "shared-links": {
      title: "Shared links",
      description: "Manage links you have shared from ModelNow.",
    },
    "app-sharing": {
      title: "Information shared with apps",
      description: "Review information shared with connected apps.",
    },
    "archived-chats": {
      title: "Archived chats",
      description: "View and manage your archived conversations.",
    },
    ads: {
      title: "Ads controls",
      description: "Manage your advertising preferences.",
    },
    cookies: {
      title: "Cookie preferences",
      description: "Manage optional cookie preferences for ModelNow.",
    },
    marketing: {
      title: "Marketing privacy",
      description: "Manage marketing communications and privacy preferences.",
    },
    "archive-all": {
      title: "Archive all chats?",
      description:
        "This demo does not connect to chat storage, so no chats will be archived.",
      confirm: "Archive all",
    },
    "delete-all": {
      title: "Delete all chats?",
      description:
        "This demo does not delete data. Connect the chat backend before enabling permanent deletion.",
      confirm: "Delete all",
    },
    export: {
      title: "Export data",
      description:
        "Data export is not connected yet. Connect the backend to prepare a downloadable export.",
      confirm: "OK",
    },
  };

  function openDialog(type: Exclude<DialogType, null>) {
    setDialog(type);
  }

  function confirmDialog() {
    if (!dialog) return;

    const descriptions: Record<Exclude<DialogType, null>, string> = {
      "shared-links": "Shared links management is a UI demo.",
      "app-sharing": "App-sharing management is a UI demo.",
      "archived-chats": "Archived chats management is a UI demo.",
      ads: "Ads preferences are not connected to a backend.",
      cookies: "Cookie preferences are not persisted yet.",
      marketing: "Marketing privacy settings are not persisted yet.",
      "archive-all": "Demo only: no chats were archived.",
      "delete-all": "Demo only: no chats were deleted.",
      export: "Demo only: no export file was created.",
    };

    setNotice(descriptions[dialog]);
    setDialog(null);
  }

  return (
    <main className="mx-auto w-full max-w-5xl pb-8 text-black">
      <h1 className="mb-9 text-3xl font-normal tracking-tight">
        Data controls
      </h1>

      {notice && (
        <div
          role="status"
          className="mb-4 flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600"
        >
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice("")}
            className="shrink-0 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <section className="rounded-[22px] border border-[#dedede] px-5">
        <ControlRow
          title="Shared links"
          action="Manage"
          onClick={() => openDialog("shared-links")}
        />

        <div className="flex min-h-[76px] items-center justify-between gap-4 border-b border-[#dedede] py-3">
          <div>
            <p className="text-base font-medium">
              Improve the model for everyone
            </p>
            <p className="mt-1 text-sm text-[#666]">
              Control whether your chats are used for model training
            </p>
          </div>
          <Toggle
            label="Improve the model for everyone"
            checked={improveModels}
            onChange={setImproveModels}
          />
        </div>

        <div className="flex min-h-[54px] items-center justify-between gap-4 border-b border-[#dedede] py-3">
          <p className="text-base font-medium">Work network access</p>
          <Toggle
            label="Work network access"
            checked={workNetwork}
            onChange={setWorkNetwork}
          />
        </div>

        <ControlRow
          title="Information shared with apps"
          action="Manage"
          onClick={() => openDialog("app-sharing")}
        />

        <ControlRow
          title="Archived chats"
          action="Manage"
          onClick={() => openDialog("archived-chats")}
        />

        <ControlRow
          title="Archive all chats"
          action="Archive all"
          onClick={() => openDialog("archive-all")}
        />

        <ControlRow
          title="Delete all chats"
          action="Delete all"
          danger
          onClick={() => openDialog("delete-all")}
        />

        <ControlRow
          title="Export data"
          action="Export"
          onClick={() => openDialog("export")}
        />

        <ControlRow
          title="Ads controls"
          action="Manage"
          onClick={() => openDialog("ads")}
        />

        <ControlRow
          title="Cookie preferences"
          action="Manage"
          onClick={() => openDialog("cookies")}
        />

        <ControlRow
          title="Marketing privacy"
          action="Manage"
          onClick={() => openDialog("marketing")}
        />
      </section>

      {dialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setDialog(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="data-dialog-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="data-dialog-title" className="text-lg font-semibold">
              {messages[dialog].title}
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              {messages[dialog].description}
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDialog(null)}
                className="rounded-full border border-gray-300 px-4 py-2.5 text-sm hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDialog}
                className={`rounded-full px-4 py-2.5 text-sm text-white ${
                  dialog === "delete-all"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-black hover:bg-gray-800"
                }`}
              >
                {messages[dialog].confirm ?? "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
