"use client";

import { CircleHelp, ShieldCheck, PencilLine, Download, Keyboard, FileText, Info, Bug } from "lucide-react";

type Props = { onSelect: (item: string) => void };

const items = [
  { label: "Help center", icon: CircleHelp },
  { label: "Privacy center", icon: ShieldCheck },
  { label: "Release notes", icon: PencilLine },
  { label: "Download apps", icon: Download },
  { label: "Keyboard shortcuts", icon: Keyboard },
  { label: "Terms of Service", icon: FileText },
  { label: "Privacy Policy", icon: Info },
  { label: "Report a bug", icon: Bug },
];

export default function HelpSubmenu({ onSelect }: Props) {
  return (
    <div className="w-[292px] overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white py-2 shadow-xl" role="menu" aria-label="Help">
      {items.map(({ label, icon: Icon }, index) => (
        <div key={label}>
          {index === 5 && <div className="mx-4 my-2 border-t border-[#e5e7eb]" />}
          <button
            type="button"
            role="menuitem"
            onClick={() => onSelect(label)}
            className="flex min-h-[44px] w-full items-center gap-3 px-5 text-left text-[15px] text-[#202124] hover:bg-[#f3f4f6]"
          >
            <Icon size={20} strokeWidth={1.8} />
            <span>{label}</span>
          </button>
        </div>
      ))}
    </div>
  );
}
