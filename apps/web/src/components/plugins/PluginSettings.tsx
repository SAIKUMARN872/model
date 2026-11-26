"use client";

import { ShieldCheck } from "lucide-react";

import SettingRow from "./SettingRow";

type PluginSettingsProps = {
  notifications: boolean;
  autoConnect: boolean;
  onNotificationsChange: () => void;
  onAutoConnectChange: () => void;
  onManagePermissions: () => void;
};

export default function PluginSettings({
  notifications,
  autoConnect,
  onNotificationsChange,
  onAutoConnectChange,
  onManagePermissions,
}: PluginSettingsProps) {
  return (
    <div className="max-w-3xl overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white">
      <SettingRow
        title="Plugin Notifications"
        description="Receive notifications when plugins are connected, disconnected, or require attention."
        enabled={notifications}
        onToggle={onNotificationsChange}
      />

      <SettingRow
        title="Automatic Plugin Connections"
        description="Allow ModelNow to automatically connect approved plugins when a workflow requires them."
        enabled={autoConnect}
        onToggle={onAutoConnectChange}
      />

      <button
        type="button"
        onClick={onManagePermissions}
        className="flex w-full items-center gap-4 p-5 text-left transition hover:bg-[#fafafa]"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f3f4f6]">
          <ShieldCheck size={18} />
        </div>

        <div className="flex-1">
          <p className="text-sm font-medium text-[#17181a]">
            Manage Permissions
          </p>

          <p className="mt-1 text-xs leading-5 text-[#80848a]">
            Review the permissions and access levels granted to
            connected plugins.
          </p>
        </div>

        <span className="text-xs font-medium text-[#555a60]">
          Manage
        </span>
      </button>
    </div>
  );
}