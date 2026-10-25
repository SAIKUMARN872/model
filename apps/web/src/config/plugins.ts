import type { Plugin } from "../services/plugins/types";

export const initialPlugins: Plugin[] = [
  // Productivity
  {
    id: "gmail",
    name: "Gmail",
    description:
      "Read, search, and manage emails through Gmail.",
    category: "Productivity",
    provider: "Google",
    icon: "gmail",
    authenticationType: "OAuth",
    permissions: [
      "Read emails",
      "Send emails",
      "Search emails",
    ],
    installed: false,
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    description:
      "Create, manage, and organize calendar events.",
    category: "Productivity",
    provider: "Google",
    icon: "google-calendar",
    authenticationType: "OAuth",
    permissions: [
      "View calendars",
      "Create events",
      "Update events",
    ],
    installed: false,
  },
  {
    id: "notion",
    name: "Notion",
    description:
      "Connect Notion pages, databases, and workspace information.",
    category: "Productivity",
    provider: "Notion",
    icon: "notion",
    authenticationType: "OAuth",
    permissions: [
      "Read pages",
      "Search workspace",
      "Access databases",
    ],
    installed: false,
  },
  {
    id: "google-drive",
    name: "Google Drive",
    description:
      "Access and work with files stored in Google Drive.",
    category: "Productivity",
    provider: "Google",
    icon: "google-drive",
    authenticationType: "OAuth",
    permissions: [
      "Read files",
      "Search files",
      "Manage files",
    ],
    installed: false,
  },

  // Development
  {
    id: "github",
    name: "GitHub",
    description:
      "Connect repositories and manage development workflows.",
    category: "Development",
    provider: "GitHub",
    icon: "github",
    authenticationType: "OAuth",
    permissions: [
      "Read repositories",
      "Manage issues",
      "Access pull requests",
    ],
    installed: false,
  },
  {
    id: "gitlab",
    name: "GitLab",
    description:
      "Manage repositories, issues, and development workflows.",
    category: "Development",
    provider: "GitLab",
    icon: "gitlab",
    authenticationType: "OAuth",
    permissions: [
      "Read repositories",
      "Manage issues",
      "Access merge requests",
    ],
    installed: false,
  },
  {
    id: "jira",
    name: "Jira",
    description:
      "Connect projects, issues, and development workflows.",
    category: "Development",
    provider: "Atlassian",
    icon: "jira",
    authenticationType: "OAuth",
    permissions: [
      "Read projects",
      "Manage issues",
      "Update project data",
    ],
    installed: false,
  },
  {
    id: "linear",
    name: "Linear",
    description:
      "Manage product issues, projects, and engineering workflows.",
    category: "Development",
    provider: "Linear",
    icon: "linear",
    authenticationType: "OAuth",
    permissions: [
      "Read issues",
      "Create issues",
      "Update projects",
    ],
    installed: false,
  },

  // Business
  {
    id: "salesforce",
    name: "Salesforce",
    description:
      "Connect customer, sales, and CRM data from Salesforce.",
    category: "Business",
    provider: "Salesforce",
    icon: "salesforce",
    authenticationType: "OAuth",
    permissions: [
      "Read CRM data",
      "Manage contacts",
      "Access sales data",
    ],
    installed: false,
  },
  {
    id: "hubspot",
    name: "HubSpot",
    description:
      "Connect CRM, marketing, sales, and customer information.",
    category: "Business",
    provider: "HubSpot",
    icon: "hubspot",
    authenticationType: "OAuth",
    permissions: [
      "Read CRM data",
      "Manage contacts",
      "Access sales data",
    ],
    installed: false,
  },
  {
    id: "zoho",
    name: "Zoho",
    description:
      "Connect Zoho business applications and customer data.",
    category: "Business",
    provider: "Zoho",
    icon: "zoho",
    authenticationType: "OAuth",
    permissions: [
      "Read business data",
      "Access CRM data",
      "Manage records",
    ],
    installed: false,
  },
  {
    id: "microsoft-dynamics",
    name: "Microsoft Dynamics",
    description:
      "Connect Microsoft Dynamics business and CRM workflows.",
    category: "Business",
    provider: "Microsoft",
    icon: "microsoft-dynamics",
    authenticationType: "OAuth",
    permissions: [
      "Read CRM data",
      "Access business records",
      "Manage workflows",
    ],
    installed: false,
  },

  // Communication
  {
    id: "slack",
    name: "Slack",
    description:
      "Connect your workspace and access team conversations.",
    category: "Communication",
    provider: "Slack",
    icon: "slack",
    authenticationType: "OAuth",
    permissions: [
      "Read messages",
      "Send messages",
      "Access channels",
    ],
    installed: false,
  },
  {
    id: "microsoft-teams",
    name: "Microsoft Teams",
    description:
      "Connect team conversations, meetings, and collaboration workflows.",
    category: "Communication",
    provider: "Microsoft",
    icon: "microsoft-teams",
    authenticationType: "OAuth",
    permissions: [
      "Read messages",
      "Access teams",
      "Access meetings",
    ],
    installed: false,
  },

  // Design
  {
    id: "figma",
    name: "Figma",
    description:
      "Connect design files, projects, and collaborative workflows.",
    category: "Design",
    provider: "Figma",
    icon: "figma",
    authenticationType: "OAuth",
    permissions: [
      "Read design files",
      "Access projects",
      "Read comments",
    ],
    installed: false,
  },
  {
    id: "canva",
    name: "Canva",
    description:
      "Connect Canva designs and creative content workflows.",
    category: "Design",
    provider: "Canva",
    icon: "canva",
    authenticationType: "OAuth",
    permissions: [
      "Read designs",
      "Access projects",
      "Manage designs",
    ],
    installed: false,
  },

  // Data
  {
    id: "google-sheets",
    name: "Google Sheets",
    description:
      "Read, update, and work with spreadsheet data.",
    category: "Data",
    provider: "Google",
    icon: "google-sheets",
    authenticationType: "OAuth",
    permissions: [
      "Read spreadsheets",
      "Write spreadsheet data",
      "Search spreadsheets",
    ],
    installed: false,
  },
  {
    id: "excel",
    name: "Excel",
    description:
      "Work with Excel spreadsheets and structured data.",
    category: "Data",
    provider: "Microsoft",
    icon: "excel",
    authenticationType: "OAuth",
    permissions: [
      "Read workbooks",
      "Write spreadsheet data",
      "Manage worksheets",
    ],
    installed: false,
  },
  {
    id: "postgresql",
    name: "PostgreSQL",
    description:
      "Connect PostgreSQL databases and query structured data.",
    category: "Data",
    provider: "PostgreSQL",
    icon: "postgresql",
    authenticationType: "Database",
    permissions: [
      "Read database",
      "Execute queries",
      "Access tables",
    ],
    installed: false,
  },
  {
    id: "mysql",
    name: "MySQL",
    description:
      "Connect MySQL databases and work with structured data.",
    category: "Data",
    provider: "MySQL",
    icon: "mysql",
    authenticationType: "Database",
    permissions: [
      "Read database",
      "Execute queries",
      "Access tables",
    ],
    installed: false,
  },

  // Research
  {
    id: "web-search",
    name: "Web Search",
    description:
      "Search the web and retrieve current information.",
    category: "Research",
    provider: "ModelNow",
    icon: "web-search",
    authenticationType: "API Key",
    permissions: [
      "Search the web",
      "Retrieve web content",
    ],
    installed: true,
  },
];