"use client";

import { Check, MoreHorizontal } from "lucide-react";

import type { Plugin } from "../../services/plugins/types";
import PluginLogo from "./PluginLogo";

type PluginCardProps = {
  plugin: Plugin;
  onToggle: () => void;
  onOpen: () => void;
};

export default function PluginCard({
  plugin,
  onToggle,
  onOpen,
}: PluginCardProps) {
  return (
    <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5 transition hover:border-[#d0d3d7] hover:shadow-sm">
      <div className="flex items-start gap-4">
        <PluginLogo plugin={plugin} />

        <div className="min-w-0 flex-1">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-[#17181a]">
                {plugin.name}
              </h3>

              <p className="mt-1 text-[11px] text-[#8a8e93]">
                {plugin.category}
              </p>
            </div>

            <button
              type="button"
              onClick={onOpen}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#85898f] transition hover:bg-[#f3f4f6]"
              aria-label={`Open ${plugin.name} details`}
            >
              <MoreHorizontal size={17} />
            </button>
          </div>

          {/* Description */}
          <p className="mt-3 text-xs leading-5 text-[#73777d]">
            {plugin.description}
          </p>

          {/* Footer */}
          <div className="mt-5 flex items-center justify-between">
            {/* Status */}
            <div className="flex items-center gap-2">
              {plugin.installed ? (
                <>
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e8f3ea]">
                    <Check
                      size={12}
                      className="text-[#3d6645]"
                    />
                  </div>

                  <span className="text-xs font-medium text-[#3d6645]">
                    Connected
                  </span>
                </>
              ) : (
                <span className="text-xs text-[#85898f]">
                  Not connected
                </span>
              )}
            </div>

            {/* Connect / Disconnect */}
            <button
              type="button"
              onClick={onToggle}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
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
    </div>
  );
}