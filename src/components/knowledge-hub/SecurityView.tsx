"use client";

import {
  KeyRound,
  Lock,
  Shield,
} from "lucide-react";

import Section from "./Section";
import ToggleCard from "./ToggleCard";

type SecurityViewProps = {
  expandedSections: Record<string, boolean>;
  onToggleSection: (id: string) => void;
  encryptionEnabled: boolean;
  onEncryptionChange: () => void;
  accessControlEnabled: boolean;
  onAccessControlChange: () => void;
};

export default function SecurityView({
  expandedSections,
  onToggleSection,
  encryptionEnabled,
  onEncryptionChange,
  accessControlEnabled,
  onAccessControlChange,
}: SecurityViewProps) {
  return (
    <div className="space-y-5">
      <Section
        id="security"
        title="Security"
        description="Protect knowledge and control access"
        icon={Shield}
        expanded={expandedSections.security ?? true}
        onToggle={onToggleSection}
      >
        <div className="space-y-4">
          <ToggleCard
            title="Encryption"
            description="Protect knowledge data with encryption at rest and in transit."
            checked={encryptionEnabled}
            onChange={onEncryptionChange}
          />

          <ToggleCard
            title="Access Control"
            description="Restrict knowledge access based on user permissions and roles."
            checked={accessControlEnabled}
            onChange={onAccessControlChange}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#0b101b] p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                <Lock
                  size={18}
                  className="text-violet-400"
                />
              </div>

              <div className="mt-4 text-sm font-medium text-white">
                Data Protection
              </div>

              <div className="mt-1 text-xs leading-5 text-gray-500">
                Keep sensitive enterprise knowledge protected.
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0b101b] p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                <KeyRound
                  size={18}
                  className="text-violet-400"
                />
              </div>

              <div className="mt-4 text-sm font-medium text-white">
                API Security
              </div>

              <div className="mt-1 text-xs leading-5 text-gray-500">
                Secure programmatic access to knowledge services.
              </div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}