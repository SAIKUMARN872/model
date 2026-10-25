"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Settings2,
  Palette,
  Bell,
  UserRound,
  ShieldCheck,
  CircleUserRound,
  Database,
  Brain,
  Gauge,
  CreditCard,
  SlidersHorizontal,
  Plug,
  Code2,
  ChevronLeft,
  Archive,
  AudioLines,
  Keyboard,
  Monitor,
} from "lucide-react";

const settingsItems = [
  { label: "General", href: "/settings/general", icon: Settings2 },
  { label: "Appearance", href: "/settings/appearance", icon: Palette },
  { label: "Notifications", href: "/settings/notifications", icon: Bell },
  { label: "Profile", href: "/settings/profile", icon: UserRound },
  { label: "Security", href: "/settings/security", icon: ShieldCheck },
  { label: "Account", href: "/settings/account", icon: CircleUserRound },
  { label: "Storage", href: "/settings/storage", icon: Database },
  {
    label: "Personalization",
    href: "/settings/personalization",
    icon: Brain,
  },
  { label: "Usage", href: "/settings/usage", icon: Gauge },
  { label: "Billing", href: "/settings/billing", icon: CreditCard },
  {
    label: "Data controls",
    href: "/settings/data-controls",
    icon: SlidersHorizontal,
  },
  {
    label: "Parental controls",
    href: "/settings/parental-controls",
    icon: ShieldCheck,
  },
  {
    label: "Integrations",
    href: "/settings/integrations",
    icon: Plug,
  },
  {
    label: "Code review",
    href: "/settings/code-review",
    icon: Code2,
  },
  {
    label: "Archived Chats",
    href: "/settings/archived-chats",
    icon: Archive,
  },
  {
    label: "Voice",
    href: "/settings/voice",
    icon: AudioLines,
  },
  {
    label: "Keyboard Shortcuts",
    href: "/settings/keyboard-shortcuts",
    icon: Keyboard,
  },
  {
    label: "Cloud Computer",
    href: "/settings/cloud-computer",
    icon: Monitor,
  },
];

export default function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 border-b border-black/10 bg-white p-4 md:min-h-screen md:w-64 md:border-b-0 md:border-r md:p-5">
      <Link
        href="/chat"
        className="mb-6 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
      >
        <ChevronLeft size={17} />
        Back to ModelNow
      </Link>

      <h1 className="mb-1 px-3 text-lg font-semibold text-gray-900">
        Settings
      </h1>

      <p className="mb-5 px-3 text-xs text-gray-500">
        Manage your preferences
      </p>

      <nav
        aria-label="Settings navigation"
        className="grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-1"
      >
        {settingsItems.map(({ label, href, icon: Icon }) => {
          const active =
            pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                active
                  ? "bg-gray-100 font-medium text-gray-950"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-950"
              }`}
            >
              <Icon size={17} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}