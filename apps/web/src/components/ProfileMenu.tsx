
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Settings,
  Bell,
  ShieldCheck,
  HelpCircle,
  Shield,
  Sparkles,
  Download,
  Keyboard,
  FileText,
  LockKeyhole,
  Bug,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

type ProfileMenuProps = {
  open: boolean;
  onAction: (action: string) => void;
};

const helpItems = [
  {
    label: "Help center",
    icon: HelpCircle,
    href: "/help",
  },
  {
    label: "Privacy center",
    icon: Shield,
    href: "/privacy-center",
  },
  {
    label: "Release notes",
    icon: Sparkles,
    href: "/release-notes",
  },
  {
    label: "Download apps",
    icon: Download,
    href: "/download-apps",
  },
  {
    label: "Keyboard shortcuts",
    icon: Keyboard,
    href: "/settings/keyboard-shortcuts",
  },
  {
    label: "Terms of Service",
    icon: FileText,
    href: "/terms",
  },
  {
    label: "Privacy Policy",
    icon: LockKeyhole,
    href: "/privacy-policy",
  },
  {
    label: "Report a bug",
    icon: Bug,
    href: "/report-bug",
  },
];

export default function ProfileMenu({
  open,
  onAction,
}: ProfileMenuProps) {
  const [helpOpen, setHelpOpen] = useState(false);
  const router = useRouter();

  if (!open) return null;

  return (
    <>
      <div className="absolute bottom-16 left-3 z-50 w-[min(390px,calc(100vw-24px))] rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
        <div className="px-3 py-2">
          <p className="text-xs font-semibold">Account</p>
          <p className="text-[11px] text-slate-400">
            ModelNow workspace
          </p>
        </div>

        <ProfileMenuItem
          icon={User}
          label="Account"
          onClick={() => onAction("account")}
        />

        <ProfileMenuItem
          icon={Settings}
          label="Settings"
          onClick={() => onAction("settings")}
        />

        <ProfileMenuItem
          icon={Bell}
          label="Notifications"
          onClick={() => onAction("notifications")}
        />

        <ProfileMenuItem
          icon={ShieldCheck}
          label="Security"
          onClick={() => onAction("security")}
        />

        <div className="my-1 border-t border-slate-100" />

        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={helpOpen}
          onClick={() => setHelpOpen((previous) => !previous)}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
            helpOpen
              ? "bg-slate-100 text-slate-900"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <HelpCircle size={16} />
          <span className="flex-1">Help</span>
          <ChevronRight
            size={16}
            className={`transition-transform ${
              helpOpen ? "rotate-90" : ""
            }`}
          />
        </button>

        <ProfileMenuItem
          icon={LogoutIcon}
          label="Log out"
          onClick={() => onAction("logout")}
        />
      </div>

      {helpOpen && (
        <div
          role="menu"
          aria-label="Help menu"
          className="absolute bottom-16 left-[min(408px,calc(100vw-12px))] z-[60] w-[min(300px,calc(100vw-24px))] rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"
        >
          {helpItems.map(({ label, icon: Icon, href }, index) => (
            <div key={href}>
              {index === 5 && (
                <div className="my-2 border-t border-slate-100" />
              )}

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setHelpOpen(false);
                  router.push(href);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
              >
                <Icon size={18} />
                <span>{label}</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function ProfileMenuItem({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
    >
      <Icon size={16} />
      <span className="flex-1">{label}</span>
    </button>
  );
}

function LogoutIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
    </svg>
  );
}
