
"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown, ArrowUpRight } from "lucide-react";

const navigation = [
  {
    label: "Research",
    items: [
      { label: "Research overview", href: "/research" },
      { label: "Latest advancements", href: "/research/advancements" },
      { label: "Model capabilities", href: "/research/models" },
      { label: "Safety and evaluation", href: "/research/safety" },
    ],
  },
  {
    label: "Products",
    items: [
      { label: "ModelNow AI", href: "/chat" },
      { label: "Multimodal AI", href: "/multimodal-ai" },
      { label: "Knowledge Hub", href: "/knowledge-hub" },
      { label: "Computer Use", href: "/computer-use" },
      { label: "Browser Automation", href: "/browser-automation" },
    ],
  },
  {
    label: "Business",
    items: [
      { label: "Enterprise AI", href: "/business" },
      { label: "AI agents", href: "/agents" },
      { label: "Solutions", href: "/solutions" },
      { label: "Contact sales", href: "/contact-sales" },
    ],
  },
  {
    label: "Developers",
    items: [
      { label: "API platform", href: "/developers" },
      { label: "Documentation", href: "/docs" },
      { label: "Model library", href: "/models" },
      { label: "Developer community", href: "/community" },
    ],
  },
  {
    label: "Company",
    items: [
      { label: "About ModelNow", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "News", href: "/news" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    label: "Foundation",
    items: [
      { label: "Our mission", href: "/foundation" },
      { label: "AI for everyone", href: "/foundation/impact" },
      { label: "Responsible AI", href: "/foundation/responsible-ai" },
    ],
  },
];

export default function ModelNowNavbar() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/10 bg-white text-black">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex min-h-[72px] max-w-[1600px] items-center justify-between gap-6 px-5 sm:px-8 lg:px-12"
      >
        <Link
          href="/"
          className="shrink-0 text-[25px] font-semibold tracking-tight"
          onClick={() => setActiveMenu(null)}
        >
          ModelNow
        </Link>

        <div className="hidden items-center gap-1 xl:flex">
          {navigation.map((menu) => (
            <div key={menu.label} className="relative">
              <button
                type="button"
                aria-expanded={activeMenu === menu.label}
                onClick={() =>
                  setActiveMenu(
                    activeMenu === menu.label ? null : menu.label
                  )
                }
                className="flex items-center gap-1 rounded-full px-3 py-2.5 text-[14px] font-medium transition hover:bg-black/5"
              >
                {menu.label}
                <ChevronDown
                  size={14}
                  className={`transition-transform ${
                    activeMenu === menu.label ? "rotate-180" : ""
                  }`}
                />
              </button>

              {activeMenu === menu.label && (
                <div className="absolute left-0 top-full mt-3 w-64 rounded-2xl border border-black/10 bg-white p-2 shadow-xl">
                  {menu.items.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setActiveMenu(null)}
                      className="flex items-center justify-between rounded-xl px-3 py-3 text-sm transition hover:bg-neutral-100"
                    >
                      {item.label}
                      <ArrowUpRight size={15} className="text-neutral-400" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="hidden shrink-0 items-center gap-3 xl:flex">
          <Link
            href="/login"
            className="rounded-full px-4 py-2.5 text-sm font-medium transition hover:bg-black/5"
          >
            Log in
          </Link>
          <Link
            href="/chat"
            className="rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            Try ModelNow
          </Link>
        </div>

        <button
          type="button"
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={mobileOpen}
          onClick={() => {
            setMobileOpen(!mobileOpen);
            setActiveMenu(null);
          }}
          className="rounded-full p-2 hover:bg-black/5 xl:hidden"
        >
          {mobileOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="max-h-[80vh] overflow-y-auto border-t border-black/10 bg-white px-5 py-4 xl:hidden">
          {navigation.map((menu) => (
            <section key={menu.label} className="border-b border-black/10 py-2">
              <button
                type="button"
                aria-expanded={activeMenu === menu.label}
                onClick={() =>
                  setActiveMenu(
                    activeMenu === menu.label ? null : menu.label
                  )
                }
                className="flex w-full items-center justify-between py-3 text-left font-medium"
              >
                {menu.label}
                <ChevronDown
                  size={17}
                  className={`transition-transform ${
                    activeMenu === menu.label ? "rotate-180" : ""
                  }`}
                />
              </button>

              {activeMenu === menu.label && (
                <div className="pb-2 pl-3">
                  {menu.items.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => {
                        setMobileOpen(false);
                        setActiveMenu(null);
                      }}
                      className="block rounded-lg px-3 py-3 text-sm text-neutral-600 hover:bg-neutral-100 hover:text-black"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </section>
          ))}

          <div className="flex flex-col gap-2 pt-4">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="rounded-full border border-black/15 px-4 py-3 text-center text-sm font-medium"
            >
              Log in
            </Link>
            <Link
              href="/chat"
              onClick={() => setMobileOpen(false)}
              className="rounded-full bg-black px-4 py-3 text-center text-sm font-medium text-white"
            >
              Try ModelNow
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
