"use client";

import {
  Check,
  Loader2,
  ShieldCheck,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import type { Plugin } from "../../services/plugins/types";
import PluginLogo from "./PluginLogo";

type PluginConnectModalProps = {
  plugin: Plugin | null;
  onClose: () => void;
  onConnected: (plugin: Plugin) => void;
};

export default function PluginConnectModal({
  plugin,
  onClose,
  onConnected,
}: PluginConnectModalProps) {
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    setConnecting(false);
    setConnected(false);
  }, [plugin]);

  if (!plugin) {
    return null;
  }

  const authenticationLabel =
    plugin.authenticationType === "OAuth"
      ? `Continue with ${plugin.provider}`
      : plugin.authenticationType === "API Key"
        ? "Connect with API Key"
        : "Connect Database";

  const handleConnect = () => {
    setConnecting(true);

    // Frontend-only simulation.
    // Backend OAuth/API connection will replace this later.
    window.setTimeout(() => {
      setConnecting(false);
      setConnected(true);

      const connectedPlugin: Plugin = {
        ...plugin,
        installed: true,
      };

      onConnected(connectedPlugin);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#eeeeef] px-5 py-4">
          <div className="flex items-center gap-3">
            <PluginLogo plugin={plugin} />

            <div>
              <h2 className="text-sm font-semibold text-[#17181a]">
                Connect {plugin.name}
              </h2>

              <p className="mt-0.5 text-xs text-[#85898f]">
                Connect your {plugin.name} account to ModelNow.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={connecting}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#85898f] transition hover:bg-[#f3f4f6] disabled:opacity-40"
            aria-label="Close connection dialog"
          >
            <X size={17} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {connected ? (
            <div className="py-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e8f3ea]">
                <Check
                  size={26}
                  className="text-[#3d6645]"
                />
              </div>

              <h3 className="mt-4 text-base font-semibold text-[#17181a]">
                {plugin.name} connected
              </h3>

              <p className="mt-2 text-xs leading-5 text-[#85898f]">
                {plugin.name} is now connected to ModelNow.
                You can manage it from Installed Plugins.
              </p>

              <button
                type="button"
                onClick={onClose}
                className="mt-6 w-full rounded-xl bg-[#17181a] px-4 py-3 text-xs font-medium text-white transition hover:bg-[#2b2d30]"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <div className="rounded-xl border border-[#eeeeef] bg-[#fafafa] p-4">
                <p className="text-xs font-medium text-[#555a60]">
                  What happens when you connect?
                </p>

                <div className="mt-3 space-y-3">
                  {plugin.permissions.slice(0, 4).map(
                    (permission) => (
                      <div
                        key={permission}
                        className="flex items-center gap-2"
                      >
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e8f3ea]">
                          <Check
                            size={11}
                            className="text-[#3d6645]"
                          />
                        </div>

                        <span className="text-xs text-[#555a60]">
                          {permission}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="mt-4 flex gap-3 rounded-xl bg-[#f7f7f8] p-4">
                <ShieldCheck
                  size={17}
                  className="mt-0.5 shrink-0 text-[#555a60]"
                />

                <p className="text-[11px] leading-5 text-[#73777d]">
                  ModelNow will request only the permissions
                  required by this integration. Authentication
                  and permission validation will be handled by
                  the ModelNow backend.
                </p>
              </div>

              <button
                type="button"
                onClick={handleConnect}
                disabled={connecting}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#17181a] px-4 py-3 text-xs font-medium text-white transition hover:bg-[#2b2d30] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {connecting ? (
                  <>
                    <Loader2
                      size={15}
                      className="animate-spin"
                    />
                    Connecting...
                  </>
                ) : (
                  authenticationLabel
                )}
              </button>

              <p className="mt-3 text-center text-[10px] leading-4 text-[#9a9da2]">
                You can disconnect this integration at any
                time from Installed Plugins.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}