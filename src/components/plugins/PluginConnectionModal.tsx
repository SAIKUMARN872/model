"use client";

import { Check, Loader2, ShieldCheck, X } from "lucide-react";
import { useEffect, useState } from "react";

import type { Plugin } from "../../services/plugins/types";
import PluginLogo from "./PluginLogo";

type PluginConnectionModalProps = {
  plugin: Plugin | null;
  onClose: () => void;
  onConnected: (plugin: Plugin) => void;
};

type ConnectionState =
  | "idle"
  | "connecting"
  | "connected";

export default function PluginConnectionModal({
  plugin,
  onClose,
  onConnected,
}: PluginConnectionModalProps) {
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("idle");

  useEffect(() => {
    if (!plugin) {
      setConnectionState("idle");
    }
  }, [plugin]);

  if (!plugin) {
    return null;
  }

  const handleConnect = () => {
    setConnectionState("connecting");

    window.setTimeout(() => {
      setConnectionState("connected");

      onConnected({
        ...plugin,
        installed: true,
      });
    }, 1500);
  };

  const handleDone = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#eeeeef] px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-[#17181a]">
              {connectionState === "connected"
                ? `${plugin.name} connected`
                : `Connect ${plugin.name}`}
            </h2>

            <p className="mt-1 text-xs text-[#85898f]">
              Connect this service to ModelNow.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={
              connectionState === "connecting"
            }
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#85898f] transition hover:bg-[#f3f4f6] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Close connection dialog"
          >
            <X size={17} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Plugin */}
          <div className="flex items-center gap-4 rounded-xl border border-[#eeeeef] bg-[#fafafa] p-4">
            <PluginLogo plugin={plugin} />

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#17181a]">
                {plugin.name}
              </p>

              <p className="mt-1 text-xs text-[#85898f]">
                {plugin.provider}
              </p>
            </div>

            {connectionState === "connected" && (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e8f3ea]">
                <Check
                  size={15}
                  className="text-[#3d6645]"
                />
              </div>
            )}
          </div>

          {/* Idle */}
          {connectionState === "idle" && (
            <>
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-[#17181a]">
                  Connect your account
                </h3>

                <p className="mt-2 text-xs leading-5 text-[#73777d]">
                  ModelNow will ask you to authorize
                  access to your {plugin.name} account.
                  You can review the requested
                  permissions before approving access.
                </p>
              </div>

              {/* Permissions */}
              <div className="mt-5 rounded-xl border border-[#eeeeef] bg-white p-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck
                    size={16}
                    className="text-[#555a60]"
                  />

                  <p className="text-xs font-semibold text-[#555a60]">
                    Requested permissions
                  </p>
                </div>

                <div className="mt-3 space-y-2">
                  {plugin.permissions
                    .slice(0, 3)
                    .map((permission) => (
                      <div
                        key={permission}
                        className="flex items-center gap-2"
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-[#8a8e93]" />

                        <span className="text-xs text-[#73777d]">
                          {permission}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </>
          )}

          {/* Connecting */}
          {connectionState === "connecting" && (
            <div className="py-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f3f4f6]">
                <Loader2
                  size={22}
                  className="animate-spin text-[#555a60]"
                />
              </div>

              <h3 className="mt-5 text-sm font-semibold text-[#17181a]">
                Connecting {plugin.name}
              </h3>

              <p className="mt-2 text-xs text-[#85898f]">
                Securely establishing your connection...
              </p>
            </div>
          )}

          {/* Connected */}
          {connectionState === "connected" && (
            <div className="py-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e8f3ea]">
                <Check
                  size={26}
                  className="text-[#3d6645]"
                />
              </div>

              <h3 className="mt-5 text-base font-semibold text-[#17181a]">
                {plugin.name} connected
              </h3>

              <p className="mt-2 text-xs leading-5 text-[#85898f]">
                Your {plugin.name} account is now
                connected to ModelNow.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-[#eeeeef] px-5 py-4">
          {connectionState !== "connected" && (
            <button
              type="button"
              onClick={onClose}
              disabled={
                connectionState === "connecting"
              }
              className="rounded-xl border border-[#e1e3e6] px-4 py-2.5 text-xs font-medium text-[#555a60] transition hover:bg-[#f5f5f5] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Cancel
            </button>
          )}

          {connectionState === "idle" && (
            <button
              type="button"
              onClick={handleConnect}
              className="rounded-xl bg-[#17181a] px-5 py-2.5 text-xs font-medium text-white transition hover:bg-[#2b2d30]"
            >
              Continue with{" "}
              {plugin.authenticationType === "OAuth"
                ? plugin.provider
                : "connection"}
            </button>
          )}

          {connectionState === "connected" && (
            <button
              type="button"
              onClick={handleDone}
              className="rounded-xl bg-[#17181a] px-5 py-2.5 text-xs font-medium text-white transition hover:bg-[#2b2d30]"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}