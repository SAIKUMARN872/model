"use client";

import { Icon } from "@iconify/react";

import type { Plugin } from "../../services/plugins/types";

type PluginLogoProps = {
  plugin: Plugin;
};

const pluginLogos: Record<string, string> = {
  GitHub: "logos:github-icon",
  GitLab: "logos:gitlab",
  Gmail: "logos:google-gmail",
  "Google Calendar": "logos:google-calendar",
  "Google Drive": "logos:google-drive",
  Notion: "logos:notion-icon",
  Jira: "logos:jira",
  Linear: "logos:linear-icon",

  Salesforce: "logos:salesforce",
  HubSpot: "logos:hubspot",
  Zoho: "logos:zoho",
  "Microsoft Dynamics": "logos:microsoft-dynamics-365",

  Slack: "logos:slack-icon",
  "Microsoft Teams": "logos:microsoft-teams",

  Figma: "logos:figma",

  PostgreSQL: "logos:postgresql",
  MySQL: "logos:mysql",

  "Web Search": "logos:google",
};

/*
 * Brand-specific logos
 *
 * These use Iconify collections because the
 * Simple Icons versions are monochrome.
 */
const specialLogos: Record<string, string> = {
  Canva: "devicon:canva",
  "Google Sheets": "mdi:google-spreadsheet",
  Excel: "vscode-icons:file-type-excel",
};

export default function PluginLogo({ plugin }: PluginLogoProps) {
  const logo = pluginLogos[plugin.name];
  const specialLogo = specialLogos[plugin.name];

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f3f4f6]">
      {specialLogo ? (
        <Icon
          icon={specialLogo}
          width="28"
          height="28"
          aria-label={`${plugin.name} logo`}
        />
      ) : logo ? (
        <Icon
          icon={logo}
          width="26"
          height="26"
          aria-label={`${plugin.name} logo`}
        />
      ) : (
        <span className="text-sm font-semibold text-[#555a60]">
          {plugin.name.charAt(0)}
        </span>
      )}
    </div>
  );
}