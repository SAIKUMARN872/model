
"use client";

import Link from "next/link";

const footerGroups = [
  {
    title: "Research",
    links: [
      { label: "Overview", href: "/research" },
      { label: "Latest advancements", href: "/research/advancements" },
      { label: "Safety", href: "/safety" },
    ],
  },
  {
    title: "Products",
    links: [
      { label: "ModelNow AI", href: "/" },
      { label: "Knowledge Hub", href: "/knowledge-hub" },
      { label: "Multimodal AI", href: "/multimodal-ai" },
      { label: "Computer Use", href: "/computer-use" },
      { label: "Release Notes", href: "/release-notes" },
    ],
  },
  {
    title: "Business",
    links: [
      { label: "Overview", href: "/business" },
      { label: "Solutions", href: "/solutions" },
      { label: "Plugins", href: "/plugins" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "API Overview", href: "/developers/api" },
      { label: "Documentation", href: "/developers/docs" },
      { label: "Developer Resources", href: "/developers/resources" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About ModelNow", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "News", href: "/news" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/help-support" },
      { label: "System Status", href: "/status" },
      { label: "Report a Bug", href: "/report-bug" },
    ],
  },
  {
    title: "Terms & Policies",
    links: [
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Other Policies", href: "/policies" },
    ],
  },
];

export default function ModelNowFooter() {
  return (
    <footer className="w-full border-t border-gray-200 bg-white px-6 py-12 text-gray-700">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight text-gray-950"
        >
          ModelNow
        </Link>

        <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
          AI tools and infrastructure for work, research, and productivity.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <h2 className="text-sm font-semibold text-gray-950">
                {group.title}
              </h2>

              <ul className="mt-4 space-y-3">
                {group.links.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm text-gray-500 transition hover:text-gray-950"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-gray-200 pt-6 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ModelNow. All rights reserved.</p>
          <p>Built for responsible AI experiences.</p>
        </div>
      </div>
    </footer>
  );
}
