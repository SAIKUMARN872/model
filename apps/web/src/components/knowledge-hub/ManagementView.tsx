"use client";

import {
  Settings,
  Users,
  RefreshCw,
} from "lucide-react";

import Section from "./Section";
import ToggleCard from "./ToggleCard";
import MiniStat from "./MiniStat";

type ManagementViewProps = {
  expandedSections: Record<string, boolean>;
  onToggleSection: (id: string) => void;
  autoSync: boolean;
  onAutoSyncChange: () => void;
  notifications: boolean;
  onNotificationsChange: () => void;
  onSync: () => void;
  documentCount: number;
  collectionCount: number;
};

export default function ManagementView({
  expandedSections,
  onToggleSection,
  autoSync,
  onAutoSyncChange,
  notifications,
  onNotificationsChange,
  onSync,
  documentCount,
  collectionCount,
}: ManagementViewProps) {
  return (
    <div className="space-y-5">
      <Section
        id="management"
        title="Management"
        description="Manage synchronization and knowledge operations"
        icon={Settings}
        expanded={expandedSections.management ?? true}
        onToggle={onToggleSection}
      >
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <ToggleCard
              title="Automatic Sync"
              description="Automatically synchronize connected knowledge sources."
              checked={autoSync}
              onChange={onAutoSyncChange}
            />

            <ToggleCard
              title="Notifications"
              description="Receive notifications about knowledge processing and sync events."
              checked={notifications}
              onChange={onNotificationsChange}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <MiniStat
              label="Documents"
              value={documentCount}
            />

            <MiniStat
              label="Collections"
              value={collectionCount}
            />

            <MiniStat
              label="Status"
              value="Healthy"
            />
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0b101b] p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                  <Users
                    size={18}
                    className="text-violet-400"
                  />
                </div>

                <div>
                  <div className="text-sm font-medium text-white">
                    Knowledge Operations
                  </div>

                  <div className="mt-1 text-xs text-gray-500">
                    Keep your knowledge base synchronized.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onSync}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-gray-300 transition hover:bg-white/5"
              >
                <RefreshCw size={15} />
                Sync now
              </button>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}