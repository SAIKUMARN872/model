"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  ChevronDown,
  FileText,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  SlidersHorizontal,
  Smile,
  Sparkles,
  UserRound,
} from "lucide-react";

const options = [
  {
    title: "Personalized chats & ads",
    icon: Smile,
    content:
      "Review the personalization controls available in ModelNow. The options shown here should reflect the features enabled in your account.",
  },
  {
    title: "Chat privacy",
    icon: MessageCircle,
    content:
      "Learn about conversation history and available chat privacy controls. Connect this section to the chat settings implemented in ModelNow.",
  },
  {
    title: "Data use & access",
    icon: UserRound,
    content:
      "Find information about accessing and managing your account data. Add working data-management actions when they are implemented.",
  },
];

const privacyCards = [
  {
    title: "We don’t sell your data",
    icon: LockKeyhole,
    description:
      "Publish this statement only after ModelNow’s actual data-sharing practices have been verified.",
  },
  {
    title: "We secure your information",
    icon: ShieldCheck,
    description:
      "Learn about the security measures implemented to protect your information.",
  },
  {
    title: "You control your data",
    icon: UserRound,
    description:
      "Find the account and data controls currently available in ModelNow.",
  },
  {
    title: "You control whether your chats are used to improve our models",
    icon: SlidersHorizontal,
    description:
      "Connect this information to a real preference setting when the feature is available.",
  },
];

const articles = [
  {
    title: "How ModelNow learns about the world while protecting privacy",
    category: "Privacy",
    time: "8 min read",
    theme: "blue",
    icon: Sparkles,
  },
  {
    title: "Introducing Advanced Account Security",
    category: "Security",
    time: "8 min read",
    theme: "sunset",
    icon: LockKeyhole,
  },
  {
    title: "Introducing the ModelNow Privacy Filter",
    category: "Privacy",
    time: "8 min read",
    theme: "ocean",
    icon: SlidersHorizontal,
  },
  {
    title: "Introducing Lockdown Mode",
    category: "Security",
    time: "8 min read",
    theme: "green",
    icon: ShieldCheck,
  },
];

const resources = [
  {
    title: "Privacy policy",
    href: "/privacy-policy",
  },
  {
    title: "Terms of service",
    href: "/terms",
  },
  {
    title: "Help center",
    href: "/help",
  },
];

export default function PrivacyCenterPage() {
  const [expandedOption, setExpandedOption] = useState<number | null>(null);

  return (
    <main className="min-h-screen bg-[#fcfcfc] text-[#171717]">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#e5e5e5] bg-white">
        <div className="flex h-[76px] items-center justify-between px-5 sm:px-9">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-[#202123] text-white">
              <Sparkles size={23} />
            </span>

            <span className="text-xl font-semibold tracking-[-0.5px]">
              ModelNow
            </span>
          </Link>

          <Link
            href="/"
            className="rounded-full bg-[#202123] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-black"
          >
            Back to ModelNow
          </Link>
        </div>
      </header>

      {/* Centered title */}
      <section className="px-5 pb-12 pt-12 text-center sm:pt-14">
        <h1 className="text-3xl font-semibold tracking-[-1px] sm:text-[36px]">
          Privacy center
        </h1>

        <p className="mt-4 text-base text-[#666] sm:text-lg">
          Clear answers about privacy. Simple ways to stay in control.
        </p>
      </section>

      <div className="mx-auto max-w-[980px] px-5 pb-16 sm:px-8">
        {/* Explore your options */}
        <section>
          <h2 className="mb-5 text-xl font-semibold tracking-[-0.4px]">
            Explore your options
          </h2>

          <div className="divide-y divide-[#e9e9e9]">
            {options.map((option, index) => {
              const Icon = option.icon;
              const isExpanded = expandedOption === index;

              return (
                <div key={option.title}>
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    onClick={() =>
                      setExpandedOption(isExpanded ? null : index)
                    }
                    className="flex min-h-[70px] w-full items-center gap-4 py-4 text-left"
                  >
                    <Icon
                      size={25}
                      strokeWidth={1.7}
                      className="shrink-0"
                    />

                    <span className="flex-1 text-base font-medium sm:text-lg">
                      {option.title}
                    </span>

                    <ChevronDown
                      size={21}
                      className={`transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isExpanded && (
                    <div className="pb-6 pl-10 pr-8">
                      <p className="text-sm leading-7 text-[#555] sm:text-base">
                        {option.content}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Our approach to privacy */}
        <section className="mt-16">
          <h2 className="mb-5 text-xl font-semibold tracking-[-0.4px]">
            Our approach to privacy
          </h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {privacyCards.map((card) => {
              const Icon = card.icon;

              return (
                <article
                  key={card.title}
                  className="min-h-[220px] rounded-[21px] border border-[#dedede] p-7 transition hover:bg-white"
                >
                  <Icon
                    size={25}
                    strokeWidth={1.7}
                    className="text-[#3982ff]"
                  />

                  <h3 className="mt-4 text-lg font-medium leading-7">
                    {card.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-[#666]">
                    {card.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        {/* Learn and act */}
        <section className="mt-16">
          <h2 className="mb-5 text-xl font-semibold tracking-[-0.4px]">
            Learn and act
          </h2>

          <div className="grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-4">
            {articles.map((article) => {
              const Icon = article.icon;

              const themeClass = {
                blue: "bg-gradient-to-br from-[#35a9f8] via-[#59c5f4] to-[#a8bda5]",
                sunset:
                  "bg-gradient-to-br from-[#e5a04d] via-[#c5e4d9] to-[#168ff0]",
                ocean:
                  "bg-gradient-to-br from-[#9ddbed] via-[#279fc6] to-[#3379c7]",
                green:
                  "bg-gradient-to-br from-[#5db9a8] via-[#94c9b0] to-[#c8b878]",
              }[article.theme];

              return (
                <Link
                  href="/help"
                  key={article.title}
                  className="group min-w-0"
                >
                  <div
                    className={`relative flex aspect-square items-center justify-center overflow-hidden rounded-[21px] ${themeClass}`}
                  >
                    <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:34px_34px]" />

                    <Icon
                      size={39}
                      strokeWidth={1.5}
                      className="relative text-white drop-shadow-sm transition-transform group-hover:scale-110"
                    />
                  </div>

                  <h3 className="mt-3 text-[15px] font-medium leading-6 group-hover:underline">
                    {article.title}
                  </h3>

                  <p className="mt-2 text-sm text-[#777]">
                    {article.category} · {article.time}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Helpful resources */}
        <section className="mt-16">
          <h2 className="mb-5 text-xl font-semibold tracking-[-0.4px]">
            Helpful resources
          </h2>

          <div className="overflow-hidden rounded-[21px] border border-[#e5e5e5]">
            {resources.map((resource, index) => (
              <Link
                href={resource.href}
                key={resource.title}
                className={`flex items-center gap-4 px-6 py-5 transition hover:bg-white sm:px-7 ${
                  index !== resources.length - 1
                    ? "border-b border-[#e9e9e9]"
                    : ""
                }`}
              >
                <span className="flex-1 text-base font-medium">
                  {resource.title}
                </span>

                <ArrowUpRight size={21} className="shrink-0 text-[#777]" />
              </Link>
            ))}
          </div>
        </section>

        <div className="mt-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#666] hover:text-black"
          >
            <ArrowLeft size={16} />
            Back to ModelNow
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#e8e8e8] bg-white">
        <div className="flex flex-col gap-3 px-5 py-7 text-sm text-[#777] sm:flex-row sm:items-center sm:justify-between sm:px-9">
          <span>© {new Date().getFullYear()} ModelNow</span>

          <div className="flex flex-wrap gap-5">
            <Link href="/privacy-policy" className="hover:text-black">
              Privacy Policy
            </Link>

            <Link href="/terms" className="hover:text-black">
              Terms of Service
            </Link>

            <Link href="/help" className="hover:text-black">
              Help Center
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}