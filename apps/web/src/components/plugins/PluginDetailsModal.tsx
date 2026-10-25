"use client";

import {
  Check,
  KeyRound,
  Plug,
  ShieldCheck,
  User,
  X,
} from "lucide-react";

import type { Plugin } from "../../services/plugins/types";

type PluginDetailsModalProps = {
  plugin: Plugin | null;
  onClose: () => void;
  onToggle: () => void;
};

export default function PluginDetailsModal({
  plugin,
  onClose,
  onToggle,
}: PluginDetailsModalProps) {
  if (!plugin) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#eeeeef] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f3f4f6]">
              <Plug size={20} />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-[#17181a]">
                {plugin.name}
              </h2>

              <p className="mt-1 text-xs text-[#85898f]">
                {plugin.category}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#85898f] transition hover:bg-[#f3f4f6]"
            aria-label="Close plugin details"
          >
            <X size={17} />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto p-5">
          {/* Description */}
          <div>
            <p className="text-sm leading-6 text-[#73777d]">
              {plugin.description}
            </p>
          </div>

          {/* Plugin Information */}
          <div className="mt-6">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[#85898f]">
              Plugin Information
            </h3>

            <div className="mt-3 overflow-hidden rounded-xl border border-[#eeeeef]">
              {/* Provider */}
              <div className="flex items-center gap-3 border-b border-[#eeeeef] p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f3f4f6]">
                  <User size={16} />
                </div>

                <div className="flex-1">
                  <p className="text-xs text-[#85898f]">
                    Provider
                  </p>

                  <p className="mt-1 text-sm font-medium text-[#17181a]">
                    {plugin.provider}
                  </p>
                </div>
              </div>

              {/* Authentication */}
              <div className="flex items-center gap-3 border-b border-[#eeeeef] p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f3f4f6]">
                  <KeyRound size={16} />
                </div>

                <div className="flex-1">
                  <p className="text-xs text-[#85898f]">
                    Authentication
                  </p>

                  <p className="mt-1 text-sm font-medium text-[#17181a]">
                    {plugin.authenticationType}
                  </p>
                </div>
              </div>

              {/* Category */}
              <div className="flex items-center gap-3 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f3f4f6]">
                  <Plug size={16} />
                </div>

                <div className="flex-1">
                  <p className="text-xs text-[#85898f]">
                    Category
                  </p>

                  <p className="mt-1 text-sm font-medium text-[#17181a]">
                    {plugin.category}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="mt-6">
            <div className="flex items-center gap-2">
              <ShieldCheck
                size={16}
                className="text-[#555a60]"
              />

              <h3 className="text-xs font-semibold uppercase tracking-wide text-[#85898f]">
                Permissions
              </h3>
            </div>

            <div className="mt-3 space-y-2">
              {plugin.permissions.map((permission) => (
                <div
                  key={permission}
                  className="flex items-center gap-3 rounded-xl bg-[#fafafa] px-4 py-3"
                >
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e8f3ea]">
                    <Check
                      size={12}
                      className="text-[#3d6645]"
                    />
                  </div>

                  <span className="text-xs text-[#555a60]">
                    {permission}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Connection Status */}
          <div className="mt-6 rounded-xl border border-[#eeeeef] bg-[#fafafa] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-[#555a60]">
                  Connection Status
                </p>

                <p className="mt-1 text-xs text-[#85898f]">
                  {plugin.installed
                    ? "This plugin is currently connected to ModelNow."
                    : "This plugin is not currently connected."}
                </p>
              </div>

              <div
                className={`rounded-full px-3 py-1.5 text-[10px] font-medium ${
                  plugin.installed
                    ? "bg-[#e8f3ea] text-[#3d6645]"
                    : "bg-[#f1f1f2] text-[#73777d]"
                }`}
              >
                {plugin.installed
                  ? "Connected"
                  : "Not connected"}
              </div>
            </div>
          </div>

          {/* Backend Note */}
          <div className="mt-4 rounded-xl bg-[#f7f7f8] p-4">
            <p className="text-xs font-medium text-[#555a60]">
              Authentication & permissions
            </p>

            <p className="mt-1 text-xs leading-5 text-[#85898f]">
              OAuth authorization, API credentials, permission
              validation, and external service access will be
              handled by the ModelNow backend when this
              integration is connected.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#eeeeef] p-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#e1e3e6] px-4 py-2.5 text-xs font-medium text-[#555a60] transition hover:bg-[#f5f5f5]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onToggle}
            className={`rounded-xl px-5 py-2.5 text-xs font-medium transition ${
              plugin.installed
                ? "border border-[#e1e3e6] text-[#555a60] hover:bg-[#f5f5f5]"
                : "bg-[#17181a] text-white hover:bg-[#2b2d30]"
            }`}
          >
            {plugin.installed
              ? "Disconnect"
              : "Connect"}
          </button>
        </div>
      </div>
    </div>
  );
}