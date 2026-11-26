"use client";

import { Check, Plug } from "lucide-react";
import { useState } from "react";

type ConnectPluginProps = {
  onConnect: (pluginId: string) => void;
};

export default function ConnectPlugin({
  onConnect,
}: ConnectPluginProps) {
  const [pluginId, setPluginId] = useState("");
  const [connected, setConnected] = useState(false);

  const handleConnect = () => {
    const value = pluginId.trim();

    if (!value) {
      return;
    }

    onConnect(value);
    setConnected(true);
  };

  return (
    <div className="max-w-2xl">
      <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f3f4f6]">
            <Plug size={19} />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-[#17181a]">
              Connect a plugin
            </h2>

            <p className="mt-1 text-xs leading-5 text-[#85898f]">
              Connect an external plugin using its integration ID
              or connection identifier.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <label
            htmlFor="plugin-id"
            className="mb-2 block text-xs font-medium text-[#555a60]"
          >
            Integration ID
          </label>

          <input
            id="plugin-id"
            type="text"
            value={pluginId}
            onChange={(event) => {
              setPluginId(event.target.value);
              setConnected(false);
            }}
            placeholder="Enter plugin or integration ID"
            className="h-11 w-full rounded-xl border border-[#e1e3e6] bg-white px-4 text-sm text-[#17181a] outline-none transition placeholder:text-[#9a9da2] focus:border-[#b9bcc1]"
          />

          <button
            type="button"
            onClick={handleConnect}
            disabled={!pluginId.trim()}
            className="mt-4 rounded-xl bg-[#17181a] px-4 py-2.5 text-xs font-medium text-white transition hover:bg-[#2b2d30] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Connect Plugin
          </button>

          {connected && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#f3f7f3] px-4 py-3">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e8f3ea]">
                <Check
                  size={12}
                  className="text-[#3d6645]"
                />
              </div>

              <p className="text-xs font-medium text-[#3d6645]">
                Connection request created.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-[#e5e7eb] bg-[#fafafa] p-5">
        <p className="text-xs font-medium text-[#555a60]">
          Authentication & permissions
        </p>

        <p className="mt-1 text-xs leading-5 text-[#85898f]">
          Plugin authentication, OAuth authorization, API credentials,
          and permission validation will be handled by the ModelNow
          backend when the integration is connected.
        </p>
      </div>
    </div>
  );
}