"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CircleHelp,
  ShieldCheck,
  Sparkles,
  Download,
  Keyboard,
  FileText,
  LockKeyhole,
  Bug,
  ChevronRight,
} from "lucide-react";

const helpItems = [
  {
    title: "Help Center",
    description: "Find answers and learn how to use ModelNow.",
    icon: CircleHelp,
    href: "/help",
  },
  {
    title: "Privacy Center",
    description: "Learn how ModelNow handles your data.",
    icon: ShieldCheck,
    href: "/privacy-center",
  },
  {
    title: "Release Notes",
    description: "Explore product updates and new features.",
    icon: Sparkles,
    href: "/release-notes",
  },
  {
    title: "Download Apps",
    description: "Explore ModelNow app downloads.",
    icon: Download,
    href: "/download-apps",
  },
  {
    title: "Keyboard Shortcuts",
    description: "View shortcuts for faster navigation.",
    icon: Keyboard,
    href: "/settings/keyboard-shortcuts",
  },
  {
    title: "Terms of Service",
    description: "Read the terms for using ModelNow.",
    icon: FileText,
    href: "/terms",
  },
  {
    title: "Privacy Policy",
    description: "Read the ModelNow privacy policy.",
    icon: LockKeyhole,
    href: "/privacy-policy",
  },
  {
    title: "Report a Bug",
    description: "Report technical problems or unexpected behavior.",
    icon: Bug,
    href: "/report-bug",
  },
];

export default function HelpSupportPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#17181a]">
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center px-5">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="mr-4 flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="text-lg font-semibold">Help & Support</h1>
            <p className="text-xs text-gray-500">
              Help, resources, and information about ModelNow
            </p>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-5 py-10">
        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
            <CircleHelp size={25} />
          </div>

          <h2 className="text-2xl font-semibold tracking-tight">
            How can we help?
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
            Find support resources, learn about product updates, review
            policies, and manage your ModelNow experience.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {helpItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.title}
                type="button"
                onClick={() => router.push(item.href)}
                className="group flex w-full items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 text-left transition hover:border-gray-400 hover:shadow-sm"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                  <Icon size={20} />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm leading-5 text-gray-500">
                    {item.description}
                  </p>
                </div>

                <ChevronRight
                  size={19}
                  className="shrink-0 text-gray-400 transition-transform group-hover:translate-x-1"
                />
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}