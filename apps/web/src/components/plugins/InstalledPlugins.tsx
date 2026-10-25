"use client";

import { ChevronRight, Plug, Trash2 } from "lucide-react";

import type { Plugin } from "../../services/plugins/types";

type InstalledPluginsProps = {
  plugins: Plugin[];
  onUninstall: (name: string) => void;
  onOpen: (plugin: Plugin) => void;
};

export default function InstalledPlugins({
  plugins,
  onUninstall,
  onOpen,
}: InstalledPluginsProps) {
  if (plugins.length === 0) {
    return (
      <div className="rounded-2xl border border-[#e5e7eb] bg-white p-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#f3f4f6]">
          <Plug size={20} />
        </div>

        <h3 className="mt-4 text-sm font-semibold text-[#17181a]">
          No plugins installed
        </h3>

        <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-[#85898f]">
          Connect a plugin from the Browse Plugins section to start
          using external tools with ModelNow.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white">
      {plugins.map((plugin, index) => (
        <div
          key={plugin.name}
          className={`flex items-center gap-4 p-5 ${
            index !== plugins.length - 1
              ? "border-b border-[#eeeeef]"
              : ""
          }`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f3f4f6]">
            <Plug size={18} />
          </div>

          <button
            type="button"
            onClick={() => onOpen(plugin)}
            className="min-w-0 flex-1 text-left"
          >
            <div className="flex items-center gap-2">
              <h3 className="truncate text-sm font-medium text-[#17181a]">
                {plugin.name}
              </h3>

              <span className="rounded-full bg-[#f3f4f6] px-2 py-1 text-[10px] text-[#73777d]">
                {plugin.category}
              </span>
            </div>

            <p className="mt-1 truncate text-xs text-[#85898f]">
              {plugin.description}
            </p>
          </button>

          <button
            type="button"
            onClick={() => onUninstall(plugin.name)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#85898f] transition hover:bg-[#f5f5f5] hover:text-[#555a60]"
            aria-label={`Uninstall ${plugin.name}`}
          >
            <Trash2 size={16} />
          </button>

          <button
            type="button"
            onClick={() => onOpen(plugin)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#85898f] hover:bg-[#f5f5f5]"
            aria-label={`Open ${plugin.name}`}
          >
            <ChevronRight size={17} />
          </button>
        </div>
      ))}
    </div>
  );
}