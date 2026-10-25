
"use client";

import { useRouter } from "next/navigation";
import type { ElementType } from "react";

import {
  ArrowRight,
  Database,
  Globe,
  Monitor,
  Target,
  Video,
  Workflow,
} from "lucide-react";

type Capability = {
  name: string;
  description: string;
  icon: ElementType;
  href: string;
};

const platformCapabilities: Capability[] = [
  {
    name: "Browser Automation",
    description: "Automate tasks across websites and browsers",
    icon: Globe,
    href: "/browser-automation",
  },
  {
    name: "Fine-tuning",
    description: "Customize AI models for special domains",
    icon: Target,
    href: "/fine-tuning",
  },
  {
    name: "Agent Workflows",
    description: "AI workflows for business operations",
    icon: Workflow,
    href: "/agents-workflows",
  },
  {
    name: "Computer Use",
    description: "Control computers, applications and browsers with AI",
    icon: Monitor,
    href: "/computer-use",
  },
  {
    name: "Knowledge Hub",
    description: "Private company knowledge, documents and enterprise data",
    icon: Database,
    href: "/knowledge-hub",
  },
  {
    name: "Multimodal AI",
    description: "Work with voice, camera, images, documents and videos",
    icon: Video,
    href: "/multimodal-ai",
  },
];

export default function PlatformCards() {
  const router = useRouter();

  return (
    <section aria-label="ModelNow AI features">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {platformCapabilities.map((capability) => {
          const Icon = capability.icon;

          return (
            <button
              key={capability.name}
              type="button"
              onClick={() => router.push(capability.href)}
              aria-label={`Open ${capability.name}`}
              className="group rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-slate-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-700 transition group-hover:bg-slate-900 group-hover:text-white">
                  <Icon size={21} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-slate-900">
                      {capability.name}
                    </h3>

                    <ArrowRight
                      size={16}
                      className="shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-700"
                    />
                  </div>

                  <p className="mt-2 text-sm leading-5 text-slate-500">
                    {capability.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
