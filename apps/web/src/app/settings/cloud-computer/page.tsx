"use client";

import { useState } from "react";
import {
  Monitor,
  Power,
  RotateCcw,
  Maximize2,
  MousePointer2,
  Keyboard,
  ShieldCheck,
  Settings2,
  ArrowUpRight,
  CircleHelp,
} from "lucide-react";

export default function CloudComputerPage() {
  const [enabled, setEnabled] = useState(false);
  const [confirmActions, setConfirmActions] = useState(true);
  const [fileTransfer, setFileTransfer] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <main className="min-h-screen bg-white text-[#2d2d2d]">
      <div className="mx-auto w-full max-w-5xl space-y-8 px-5 py-8 sm:px-8">
        {/* Header */}
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e5e5e5]">
                <Monitor size={21} />
              </div>

              <h1 className="text-2xl font-semibold tracking-tight">
                Cloud computer
              </h1>
            </div>

            <p className="max-w-2xl text-sm leading-6 text-[#737373]">
              Use a remote computer to perform tasks with ModelNow. Configure
              access, permissions, and session preferences.
            </p>
          </div>

          <button
            onClick={() => setShowSettings((current) => !current)}
            className="flex items-center gap-2 rounded-full border border-[#dedede] px-4 py-2 text-sm hover:bg-[#f7f7f7]"
          >
            <Settings2 size={16} />
            Settings
          </button>
        </header>

        {/* Session status */}
        <section className="rounded-2xl border border-[#e5e5e5] p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  enabled ? "bg-amber-500" : "bg-gray-400"
                }`}
              />

              <div>
                <h2 className="font-medium">Remote session</h2>
                <p className="mt-1 text-sm text-[#737373]">
                  {enabled
                    ? "Requested — waiting for a connected computer service"
                    : "No active session"}
                </p>
              </div>
            </div>

            <button
              onClick={() => setEnabled((current) => !current)}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium ${
                enabled
                  ? "border border-[#dedede] bg-white hover:bg-[#f7f7f7]"
                  : "bg-[#2d2d2d] text-white hover:bg-black"
              }`}
            >
              <Power size={16} />
              {enabled ? "Disable access" : "Enable access"}
            </button>
          </div>
        </section>

        {/* Computer preview */}
        <section className="overflow-hidden rounded-2xl border border-[#e5e5e5]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eaeaea] px-5 py-4">
            <div>
              <h2 className="text-sm font-medium">Computer preview</h2>
              <p className="mt-1 text-xs text-[#737373]">
                Remote desktop workspace
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled
                title="Requires a connected computer"
                className="rounded-lg border border-[#e5e5e5] p-2 text-gray-400 disabled:cursor-not-allowed"
              >
                <RotateCcw size={16} />
              </button>

              <button
                disabled
                title="Requires a connected computer"
                className="rounded-lg border border-[#e5e5e5] p-2 text-gray-400 disabled:cursor-not-allowed"
              >
                <Maximize2 size={16} />
              </button>
            </div>
          </div>

          <div className="flex min-h-[280px] flex-col items-center justify-center bg-[#fafafa] px-6 py-12 text-center sm:min-h-[360px]">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#e5e5e5] bg-white">
              <Monitor size={30} className="text-[#737373]" />
            </div>

            <h3 className="text-base font-medium">
              {enabled
                ? "Waiting for your computer"
                : "Your computer workspace is ready to configure"}
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-[#737373]">
              {enabled
                ? "Connect a supported remote computer service to view its live desktop here."
                : "Enable access and connect a remote computer provider to start a session."}
            </p>

            <span className="mt-5 rounded-full border border-[#e5e5e5] bg-white px-3 py-1.5 text-xs text-[#737373]">
              Preview unavailable · No computer connected
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-[#eaeaea] px-5 py-4">
            <button
              disabled
              className="flex items-center gap-2 rounded-full border border-[#e5e5e5] px-4 py-2 text-sm text-gray-400 disabled:cursor-not-allowed"
            >
              <MousePointer2 size={15} />
              Mouse
            </button>

            <button
              disabled
              className="flex items-center gap-2 rounded-full border border-[#e5e5e5] px-4 py-2 text-sm text-gray-400 disabled:cursor-not-allowed"
            >
              <Keyboard size={15} />
              Keyboard
            </button>

            <span className="ml-auto text-xs text-[#737373]">
              Waiting for connection
            </span>
          </div>
        </section>

        {/* Permissions */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Permissions</h2>
            <p className="mt-1 text-sm text-[#737373]">
              Choose what a connected computer session may do.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#e5e5e5]">
            <SettingRow
              title="Confirm actions before execution"
              description="Ask for confirmation before performing sensitive actions."
              checked={confirmActions}
              onChange={setConfirmActions}
            />

            <SettingRow
              title="Allow file transfers"
              description="Permit uploads to a connected remote computer."
              checked={fileTransfer}
              onChange={setFileTransfer}
            />
          </div>
        </section>

        {/* Expandable settings */}
        {showSettings && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Session settings</h2>

            <div className="rounded-2xl border border-[#e5e5e5] p-5">
              <p className="text-sm font-medium">Session isolation</p>
              <p className="mt-1 text-sm leading-6 text-[#737373]">
                Remote sessions should run in isolated environments with
                authentication, access controls, and activity logging.
              </p>
            </div>
          </section>
        )}

        {/* Security */}
        <section className="flex items-start gap-3 rounded-2xl border border-[#e5e5e5] p-5">
          <ShieldCheck size={21} className="mt-0.5 shrink-0 text-[#737373]" />

          <div>
            <h2 className="text-sm font-medium">Security and privacy</h2>
            <p className="mt-1 text-sm leading-6 text-[#737373]">
              These controls currently manage the page UI only. Live desktop
              streaming, mouse and keyboard execution, file transfers, and
              session creation require a secure backend and a connected remote
              computer provider.
            </p>

            <a
              href="/settings/security"
              className="mt-3 inline-flex items-center gap-1 text-sm underline underline-offset-4 hover:text-black"
            >
              Review security settings
              <ArrowUpRight size={14} />
            </a>
          </div>
        </section>

        <div className="flex items-center gap-2 text-xs text-[#737373]">
          <CircleHelp size={15} />
          Cloud computer availability depends on your connected provider.
        </div>
      </div>
    </main>
  );
}

function SettingRow({
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
    <label className="flex cursor-pointer items-center justify-between gap-5 border-b border-[#eeeeee] p-5 last:border-b-0 hover:bg-[#fafafa]">
      <span>
        <span className="block text-sm font-medium">{title}</span>
        <span className="mt-1 block text-sm leading-5 text-[#737373]">
          {description}
        </span>
      </span>

      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 shrink-0 accent-black"
      />
    </label>
  );
}