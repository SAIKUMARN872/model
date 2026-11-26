
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  Ban,
  Bell,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Command,
  CreditCard,
  FileClock,
  Fingerprint,
  Gauge,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Network,
  Receipt,
  Settings,
  ShieldCheck,
  Tags,
  TicketPercent,
  UserPlus,
  UserRound,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

type SidebarProps = {
  collapsed?: boolean;
  onCollapse?: () => void;
  onNavigate?: () => void;
};

type SubmenuType =
  | "dashboard"
  | "billing"
  | "users"
  | "organizations"
  | "workspaces"
  | "roles"
  | "permissions"
  | "governance"
  | "security"
  | "compliance"
  | "audit"
  | "usage";

const BILLING_BASE = "/billing";

/* =========================================================
   DASHBOARD SUBSECTIONS
========================================================= */

const DASHBOARD_SUBSECTIONS: NavItem[] = [
  { label: "Dashboard Overview", href: "/dashboard", icon: LayoutDashboard, description: "Main admin dashboard overview" },
  { label: "Platform Overview", href: "/dashboard/platform-overview", icon: Building2, description: "Platform-wide overview" },
  { label: "AI Infrastructure", href: "/dashboard/ai-infrastructure", icon: Network, description: "AI infrastructure monitoring" },
  { label: "API Analytics", href: "/dashboard/api-analytics", icon: BarChart3, description: "API usage and analytics" },
  { label: "Compliance Overview", href: "/dashboard/compliance-overview", icon: ShieldCheck, description: "Compliance status overview" },
  { label: "Model Performance", href: "/dashboard/model-performance", icon: Gauge, description: "AI model performance metrics" },
  { label: "Organization Analytics", href: "/dashboard/organization-analytics", icon: Building2, description: "Organization analytics" },
  { label: "Provider Performance", href: "/dashboard/provider-performance", icon: Activity, description: "AI provider performance" },
  { label: "Recent Activity", href: "/dashboard/recent-activity", icon: FileClock, description: "Recent platform activity" },
  { label: "Revenue Overview", href: "/dashboard/revenue-overview", icon: CreditCard, description: "Revenue overview and metrics" },
  { label: "Security Overview", href: "/dashboard/security-overview", icon: LockKeyhole, description: "Platform security overview" },
  { label: "System Health", href: "/dashboard/system-health", icon: Activity, description: "System health monitoring" },
  { label: "Usage & Costs", href: "/dashboard/usage-costs", icon: Receipt, description: "Usage and cost analytics" },
  { label: "User Analytics", href: "/dashboard/user-analytics", icon: Users, description: "User activity and analytics" },
];

/* =========================================================
   USERS SUBSECTIONS
========================================================= */

const USERS_SUBSECTIONS: NavItem[] = [
  { label: "Users Overview", href: "/users", icon: LayoutDashboard, description: "User management overview" },
  { label: "All Users", href: "/users/all-users", icon: Users, description: "View all registered users" },
  { label: "Active Users", href: "/users/active-users", icon: UserRound, description: "Manage active users" },
  { label: "Inactive Users", href: "/users/inactive-users", icon: Users, description: "View inactive users" },
  { label: "Pending Verification", href: "/users/pending-verification", icon: ShieldCheck, description: "Review pending verifications" },
  { label: "Suspended Users", href: "/users/suspended-users", icon: Ban, description: "Manage suspended users" },
  { label: "User Details", href: "/users/user-details", icon: UserRound, description: "View user details" },
  { label: "User Invitations", href: "/users/user-invitations", icon: UserPlus, description: "Manage user invitations" },
  { label: "User Activity", href: "/users/user-activity", icon: Activity, description: "Monitor user activity" },
  { label: "User Sessions", href: "/users/user-sessions", icon: Activity, description: "Monitor user sessions" },
  { label: "Account Security", href: "/users/account-security", icon: ShieldCheck, description: "Manage account security" },
  { label: "Login History", href: "/users/login-history", icon: FileClock, description: "Review login history" },
  { label: "User Settings", href: "/users/user-settings", icon: Settings, description: "Configure user settings" },
];

/* =========================================================
   ORGANIZATIONS SUBSECTIONS
========================================================= */

const ORGANIZATIONS_SUBSECTIONS: NavItem[] = [
  { label: "Overview", href: "/organizations/overview", icon: Building2, description: "Organization platform overview" },
  { label: "All Organizations", href: "/organizations/all-organizations", icon: Building2, description: "View all organizations" },
  { label: "Suspended Organizations", href: "/organizations/suspended-organizations", icon: Ban, description: "Manage suspended organizations" },
  { label: "Organization Details", href: "/organizations/organization-details", icon: Building2, description: "View organization details" },
  { label: "Organization Members", href: "/organizations/organization-members", icon: Users, description: "Manage organization members" },
  { label: "Teams & Departments", href: "/organizations/teams-departments", icon: Network, description: "Manage teams and departments" },
  { label: "API Projects", href: "/organizations/api-projects", icon: Workflow, description: "Manage organization API projects" },
  { label: "Invitations", href: "/organizations/invitations", icon: UserPlus, description: "Manage organization invitations" },
  { label: "Organization Roles", href: "/organizations/organization-roles", icon: Fingerprint, description: "Manage organization roles" },
  { label: "Organization Security", href: "/organizations/organization-security", icon: ShieldCheck, description: "Organization security controls" },
  { label: "Organization Billing", href: "/organizations/organization-billing", icon: CreditCard, description: "Manage organization billing" },
  { label: "Organization Usage", href: "/organizations/organization-usage", icon: Gauge, description: "Monitor organization usage" },
  { label: "Organization Activity", href: "/organizations/organization-activity", icon: Activity, description: "Monitor organization activity" },
  { label: "Organization Settings", href: "/organizations/organization-settings", icon: Settings, description: "Configure organization settings" },
];

/* =========================================================
   WORKSPACES SUBSECTIONS
========================================================= */

const WORKSPACES_SUBSECTIONS: NavItem[] = [
  { label: "Workspaces Overview", href: "/workspaces", icon: LayoutDashboard, description: "Workspace management overview" },
  { label: "Overview", href: "/workspaces/overview", icon: Building2, description: "Workspace platform overview" },
  { label: "Employees", href: "/workspaces/employees", icon: Users, description: "Manage workspace employees" },
  { label: "Departments", href: "/workspaces/departments", icon: Building2, description: "Manage departments" },
  { label: "Teams", href: "/workspaces/teams", icon: Network, description: "Manage workspace teams" },
  { label: "Projects", href: "/workspaces/projects", icon: Workflow, description: "Manage workspace projects" },
  { label: "Employee Roles", href: "/workspaces/employee-roles", icon: Fingerprint, description: "Manage employee roles" },
  { label: "Access Permissions", href: "/workspaces/access-permissions", icon: LockKeyhole, description: "Manage workspace access permissions" },
  { label: "Invitations", href: "/workspaces/invitations", icon: UserPlus, description: "Manage workspace invitations" },
  { label: "Employee Access Requests", href: "/workspaces/employee-access-requests", icon: ShieldCheck, description: "Review employee access requests" },
  { label: "Employee Sessions", href: "/workspaces/employee-sessions", icon: Activity, description: "Monitor employee sessions" },
  { label: "Workspace Resources", href: "/workspaces/workspace-resources", icon: Building2, description: "Manage workspace resources" },
  { label: "Company Announcements", href: "/workspaces/company-announcements", icon: Bell, description: "Manage company announcements" },
  { label: "Workspace Activity", href: "/workspaces/workspace-activity", icon: FileClock, description: "Monitor workspace activity" },
  { label: "Workspace Settings", href: "/workspaces/workspace-settings", icon: Settings, description: "Configure workspace settings" },
];

/* =========================================================
   ROLES SUBSECTIONS
========================================================= */

const ROLES_SUBSECTIONS: NavItem[] = [
  { label: "Roles Overview", href: "/roles", icon: LayoutDashboard, description: "Role management overview" },
  { label: "All Roles", href: "/roles/all-roles", icon: Fingerprint, description: "View and manage all roles" },
  { label: "Custom Roles", href: "/roles/custom-roles", icon: Tags, description: "Create and manage custom roles" },
  { label: "Role Assignments", href: "/roles/role-assignments", icon: UserPlus, description: "Manage role assignments" },
  { label: "Role Audit Logs", href: "/roles/role-audit-logs", icon: FileClock, description: "Review role changes and audit history" },
  { label: "Role Hierarchy", href: "/roles/role-hierarchy", icon: Network, description: "Manage role hierarchy" },
  { label: "System Roles", href: "/roles/system-roles", icon: ShieldCheck, description: "Manage system-defined roles" },
];

/* =========================================================
   PERMISSIONS SUBSECTIONS
========================================================= */

const PERMISSIONS_SUBSECTIONS: NavItem[] = [
  { label: "Permissions Overview", href: "/permissions", icon: LayoutDashboard, description: "Permission management overview" },
  { label: "Access Policies", href: "/permissions/access-policies", icon: ShieldCheck, description: "Manage access policies" },
  { label: "Action Permissions", href: "/permissions/action-permissions", icon: Workflow, description: "Manage action-level permissions" },
  { label: "All Permissions", href: "/permissions/all-permissions", icon: LockKeyhole, description: "View and manage all permissions" },
  { label: "Module Permissions", href: "/permissions/module-permissions", icon: Network, description: "Manage module-level permissions" },
  { label: "Permission Assignments", href: "/permissions/permission-assignments", icon: UserPlus, description: "Manage permission assignments" },
  { label: "Permission Audit Logs", href: "/permissions/permission-audit-logs", icon: FileClock, description: "Review permission changes and audit history" },
];

/* =========================================================
   GOVERNANCE SUBSECTIONS
========================================================= */

const GOVERNANCE_SUBSECTIONS: NavItem[] = [
  { label: "Governance Overview", href: "/governance", icon: LayoutDashboard, description: "Governance management overview" },
  { label: "AI Evaluation & Auditing", href: "/governance/ai-evaluation-auditing", icon: Activity, description: "Evaluate and audit AI systems" },
  { label: "AI Governance", href: "/governance/ai-governance", icon: ShieldCheck, description: "Manage AI governance controls" },
  { label: "Change Management", href: "/governance/change-management", icon: Workflow, description: "Manage platform changes" },
  { label: "Compliance Management", href: "/governance/compliance-management", icon: Gauge, description: "Manage governance compliance" },
  { label: "Data Governance", href: "/governance/data-governance", icon: Network, description: "Manage data governance policies" },
  { label: "Enterprise Governance", href: "/governance/enterprise-governance", icon: Building2, description: "Manage enterprise governance" },
  { label: "Governance Audit Logs", href: "/governance/governance-audit-logs", icon: FileClock, description: "Review governance audit history" },
  { label: "Governance Reviews", href: "/governance/governance-reviews", icon: ShieldCheck, description: "Review governance activities" },
  { label: "Model Governance", href: "/governance/model-governance", icon: Gauge, description: "Manage AI model governance" },
  { label: "Policy Management", href: "/governance/policy-management", icon: LockKeyhole, description: "Create and manage governance policies" },
  { label: "Responsible AI", href: "/governance/responsible-ai", icon: Fingerprint, description: "Manage responsible AI practices" },
  { label: "Risk Management", href: "/governance/risk-management", icon: Ban, description: "Identify and manage governance risks" },
  { label: "Vendor Governance", href: "/governance/vendor-governance", icon: Building2, description: "Manage vendor governance" },
];

/* =========================================================
   SECURITY SUBSECTIONS
========================================================= */

const SECURITY_SUBSECTIONS: NavItem[] = [
  { label: "Security Overview", href: "/security", icon: LayoutDashboard, description: "Security management overview" },
  { label: "Access Control", href: "/security/access-control", icon: LockKeyhole, description: "Manage access control policies" },
  { label: "API Security", href: "/security/api-security", icon: ShieldCheck, description: "Manage API security" },
  { label: "Compliance", href: "/security/compliance", icon: Gauge, description: "Review security compliance" },
  { label: "Data Protection", href: "/security/data-protection", icon: Fingerprint, description: "Manage data protection controls" },
  { label: "Encryption & Secrets", href: "/security/encryption-secrets", icon: LockKeyhole, description: "Manage encryption and secrets" },
  { label: "Identity & Authentication", href: "/security/identity-authentication", icon: UserRound, description: "Manage identity and authentication" },
  { label: "Network Security", href: "/security/network-security", icon: Network, description: "Manage network security" },
  { label: "Security Audit", href: "/security/security-audit", icon: FileClock, description: "Review security audit records" },
  { label: "Security Incidents", href: "/security/security-incidents", icon: Bell, description: "Manage security incidents" },
  { label: "Security Policies", href: "/security/security-policies", icon: ShieldCheck, description: "Manage security policies" },
  { label: "Sessions & Devices", href: "/security/sessions-devices", icon: Activity, description: "Monitor sessions and devices" },
  { label: "Threat Detection", href: "/security/threat-detection", icon: Activity, description: "Monitor and detect security threats" },
  { label: "Vulnerability Management", href: "/security/vulnerability-management", icon: Ban, description: "Manage security vulnerabilities" },
];

/* =========================================================
   COMPLIANCE SUBSECTIONS
========================================================= */

const COMPLIANCE_SUBSECTIONS: NavItem[] = [
  { label: "Compliance Overview", href: "/compliance", icon: LayoutDashboard, description: "Compliance management overview" },
  { label: "AI Compliance", href: "/compliance/ai-compliance", icon: ShieldCheck, description: "Manage AI compliance requirements" },
  { label: "Audit Management", href: "/compliance/audit-management", icon: FileClock, description: "Manage compliance audits" },
  { label: "Compliance Frameworks", href: "/compliance/compliance-frameworks", icon: Network, description: "Manage compliance frameworks" },
  { label: "Compliance Monitoring", href: "/compliance/compliance-monitoring", icon: Activity, description: "Monitor compliance status" },
  { label: "Compliance Reports", href: "/compliance/compliance-reports", icon: BarChart3, description: "View compliance reports" },
  { label: "Compliance Requirements", href: "/compliance/compliance-requirements", icon: FileClock, description: "Manage compliance requirements" },
  { label: "Compliance Settings", href: "/compliance/compliance-settings", icon: Settings, description: "Configure compliance settings" },
  { label: "Compliance Tasks", href: "/compliance/compliance-tasks", icon: Workflow, description: "Manage compliance tasks" },
  { label: "Controls Management", href: "/compliance/controls-management", icon: LockKeyhole, description: "Manage compliance controls" },
  { label: "Data Privacy", href: "/compliance/data-privacy", icon: Fingerprint, description: "Manage data privacy controls" },
  { label: "Evidence Management", href: "/compliance/evidence-management", icon: Receipt, description: "Manage compliance evidence" },
  { label: "Overview", href: "/compliance/overview", icon: Gauge, description: "View compliance overview" },
  { label: "Policies", href: "/compliance/policies", icon: ShieldCheck, description: "Manage compliance policies" },
  { label: "Regulatory Management", href: "/compliance/regulatory-management", icon: Building2, description: "Manage regulatory requirements" },
  { label: "Risk Assessments", href: "/compliance/risk-assessments", icon: Ban, description: "Manage compliance risk assessments" },
  { label: "Vendor Compliance", href: "/compliance/vendor-compliance", icon: Users, description: "Manage vendor compliance" },
];

/* =========================================================
   USAGE & ANALYTICS SUBSECTIONS
========================================================= */

const USAGE_SUBSECTIONS: NavItem[] = [
  { label: "Usage Overview", href: "/usage", icon: LayoutDashboard, description: "Usage and analytics overview" },
  { label: "AI Model Usage", href: "/usage/ai-model-usage", icon: Gauge, description: "Monitor AI model usage" },
  { label: "AI Provider Usage", href: "/usage/ai-provider-usage", icon: Network, description: "Monitor AI provider usage" },
  { label: "Analytics Settings", href: "/usage/analytics-settings", icon: Settings, description: "Configure analytics settings" },
  { label: "API Usage", href: "/usage/api-usage", icon: Activity, description: "Monitor API usage" },
  { label: "Cost Analytics", href: "/usage/cost-analytics", icon: CreditCard, description: "Analyze platform costs" },
  { label: "Credit Analytics", href: "/usage/credit-analytics", icon: Receipt, description: "Analyze credit consumption" },
  { label: "GPU Usage", href: "/usage/gpu-usage", icon: Gauge, description: "Monitor GPU usage" },
  { label: "Infrastructure Usage", href: "/usage/infrastructure-usage", icon: Building2, description: "Monitor infrastructure usage" },
  { label: "Organization Usage", href: "/usage/organization-usage", icon: Users, description: "Monitor organization usage" },
  { label: "Overview", href: "/usage/overview", icon: BarChart3, description: "View usage analytics overview" },
  { label: "Platform Usage", href: "/usage/platform-usage", icon: Activity, description: "Monitor platform usage" },
  { label: "Revenue Analytics", href: "/usage/revenue-analytics", icon: CreditCard, description: "Analyze platform revenue" },
  { label: "Token Analytics", href: "/usage/token-analytics", icon: Tags, description: "Analyze token consumption" },
  { label: "Usage Reports", href: "/usage/usage-reports", icon: FileClock, description: "View and export usage reports" },
  { label: "Usage Trends", href: "/usage/usage-trends", icon: BarChart3, description: "Analyze usage trends" },
  { label: "User Usage", href: "/usage/user-usage", icon: UserRound, description: "Monitor individual user usage" },
];

/* =========================================================
   AUDIT LOGS SUBSECTIONS
========================================================= */

const AUDIT_SUBSECTIONS: NavItem[] = [
  { label: "Audit Logs Overview", href: "/audit-logs", icon: LayoutDashboard, description: "Audit logs overview" },
  { label: "Access Logs", href: "/audit-logs/access-logs", icon: LockKeyhole, description: "Review access records" },
  { label: "Admin Activity", href: "/audit-logs/admin-activity", icon: Users, description: "Review administrator activity" },
  { label: "AI Model Events", href: "/audit-logs/ai-model-events", icon: Activity, description: "Review AI model events" },
  { label: "All Events", href: "/audit-logs/all-events", icon: FileClock, description: "View all audit events" },
  { label: "API Activity", href: "/audit-logs/api-activity", icon: Network, description: "Review API activity" },
  { label: "Audit Settings", href: "/audit-logs/audit-settings", icon: Settings, description: "Configure audit settings" },
  { label: "Authentication Logs", href: "/audit-logs/authentication-logs", icon: Fingerprint, description: "Review authentication records" },
  { label: "Billing Events", href: "/audit-logs/billing-events", icon: CreditCard, description: "Review billing events" },
  { label: "Configuration Changes", href: "/audit-logs/configuration-changes", icon: Settings, description: "Review configuration changes" },
  { label: "Data Access Logs", href: "/audit-logs/data-access-logs", icon: Receipt, description: "Review data access records" },
  { label: "Export Reports", href: "/audit-logs/export-reports", icon: BarChart3, description: "Export audit reports" },
  { label: "Governance Events", href: "/audit-logs/governance-events", icon: ShieldCheck, description: "Review governance events" },
  { label: "Organization Events", href: "/audit-logs/organization-events", icon: Building2, description: "Review organization events" },
  { label: "Provider Events", href: "/audit-logs/provider-events", icon: Workflow, description: "Review provider events" },
  { label: "Security Events", href: "/audit-logs/security-events", icon: ShieldCheck, description: "Review security events" },
  { label: "User Activity", href: "/audit-logs/user-activity", icon: UserRound, description: "Review user activity records" },
];

const BILLING_SUBSECTIONS: NavItem[] = [
  {
    label: "Billing Overview",
    href: "/billing",
    icon: LayoutDashboard,
    description: "Billing summary and key metrics",
  },
  {
    label: "Subscriptions",
    href: "/billing/subscriptions",
    icon: Users,
    description: "Manage customer subscriptions",
  },
  {
    label: "Payments",
    href: "/billing/payments",
    icon: CreditCard,
    description: "View and manage payments",
  },
  {
    label: "Plans & Pricing",
    href: "/billing/plans",
    icon: Tags,
    description: "Manage plans and pricing",
  },
  {
    label: "Credits & Usage",
    href: "/billing/credits",
    icon: Gauge,
    description: "Track credits and usage",
  },
  {
    label: "Invoices",
    href: "/billing/invoices",
    icon: FileClock,
    description: "Manage billing invoices",
  },
  {
    label: "Refunds",
    href: "/billing/refunds",
    icon: Receipt,
    description: "Manage refunds",
  },
  {
    label: "Discounts & Coupons",
    href: "/billing/discounts",
    icon: TicketPercent,
    description: "Manage discounts and coupons",
  },
  {
    label: "Enterprise Billing",
    href: "/billing/enterprise",
    icon: Building2,
    description: "Manage enterprise billing",
  },
  {
    label: "Failed Payments",
    href: "/billing/failed-payments",
    icon: Bell,
    description: "Review failed payment attempts",
  },
  {
    label: "Revenue Analytics",
    href: "/billing/analytics",
    icon: BarChart3,
    description: "Analyze billing revenue",
  },
  {
    label: "Billing Settings",
    href: "/billing/settings",
    icon: Settings,
    description: "Configure billing preferences",
  },
];

/* =========================================================
   MAIN NAVIGATION GROUPS
========================================================= */

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, description: "Platform overview and system health" },
      { label: "Usage & analytics", href: "/usage", icon: BarChart3, description: "Requests, consumption and performance" },
    ],
  },
  {
    label: "Organization",
    items: [
      { label: "Users", href: "/users", icon: Users, description: "User accounts and lifecycle" },
      { label: "Organizations", href: "/organizations", icon: Building2, description: "Organization management" },
      { label: "Workspaces", href: "/workspaces", icon: Network, description: "Workspace configuration" },
      { label: "Roles", href: "/roles", icon: Fingerprint, description: "Role definitions" },
      { label: "Permissions", href: "/permissions", icon: LockKeyhole, description: "Access permission policies" },
    ],
  },
  {
    label: "Platform",
    items: [
      { label: "Governance", href: "/governance", icon: Workflow, description: "Platform governance controls" },
      { label: "Security", href: "/security", icon: ShieldCheck, description: "Security configuration" },
      { label: "Compliance", href: "/compliance", icon: Gauge, description: "Compliance management" },
      { label: "Audit logs", href: "/audit-logs", icon: FileClock, description: "Administrative activity records" },
      { label: "Billing", href: BILLING_BASE, icon: CreditCard, description: "Manage subscriptions and billing" },
    ],
  },
];

/* =========================================================
   ROUTE HELPERS
========================================================= */

function normalizePath(path: string) {
  return path.length > 1 && path.endsWith("/")
    ? path.slice(0, -1)
    : path;
}

function isActiveRoute(pathname: string, href: string) {
  const current = normalizePath(pathname);
  const target = normalizePath(href.split("?")[0]);

  return current === target || current.startsWith(`${target}/`);
}

/* =========================================================
   NORMAL SIDEBAR LINK
========================================================= */

function SidebarLink({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  onNavigate?: () => void;
}) {
  const active = isActiveRoute(pathname, item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`admin-nav-link${active ? " is-active" : ""}`}
      title={item.description}
    >
      <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
      <span className="admin-nav-link-label">{item.label}</span>
      {active && <span className="admin-nav-active-indicator" />}
    </Link>
  );
}

/* =========================================================
   SIDEBAR COMPONENT
========================================================= */

export default function Sidebar({
  collapsed = false,
  onCollapse,
  onNavigate,
}: SidebarProps) {
  const pathname = usePathname() || "/dashboard";

 const [billingSection] = useState("");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);

  const dashboardActive = isActiveRoute(pathname, "/dashboard");
  const billingActive = isActiveRoute(pathname, BILLING_BASE);
  const usersActive = isActiveRoute(pathname, "/users");
  const organizationsActive = isActiveRoute(pathname, "/organizations");
  const workspacesActive = isActiveRoute(pathname, "/workspaces");
  const rolesActive = isActiveRoute(pathname, "/roles");
  const permissionsActive = isActiveRoute(pathname, "/permissions");
  const governanceActive = isActiveRoute(pathname, "/governance");
  const securityActive = isActiveRoute(pathname, "/security");
  const complianceActive = isActiveRoute(pathname, "/compliance");
  const auditActive = isActiveRoute(pathname, "/audit-logs");
  const usageActive = isActiveRoute(pathname, "/usage");

  const [dashboardExpanded, setDashboardExpanded] = useState(() => isActiveRoute(pathname, "/dashboard"));
  const [billingExpanded, setBillingExpanded] = useState(false);
  const [usersExpanded, setUsersExpanded] = useState(() => isActiveRoute(pathname, "/users"));
  const [organizationsExpanded, setOrganizationsExpanded] = useState(() => isActiveRoute(pathname, "/organizations"));
  const [workspacesExpanded, setWorkspacesExpanded] = useState(() => isActiveRoute(pathname, "/workspaces"));
  const [rolesExpanded, setRolesExpanded] = useState(() => isActiveRoute(pathname, "/roles"));
  const [permissionsExpanded, setPermissionsExpanded] = useState(() => isActiveRoute(pathname, "/permissions"));
  const [governanceExpanded, setGovernanceExpanded] = useState(() => isActiveRoute(pathname, "/governance"));
  const [securityExpanded, setSecurityExpanded] = useState(() => isActiveRoute(pathname, "/security"));
  const [complianceExpanded, setComplianceExpanded] = useState(() => isActiveRoute(pathname, "/compliance"));
  const [auditExpanded, setAuditExpanded] = useState(() => isActiveRoute(pathname, "/audit-logs"));
  const [usageExpanded, setUsageExpanded] = useState(() => isActiveRoute(pathname, "/usage"));

  /* =========================================================
     SUBMENU ROUTE BEHAVIOR
  ========================================================= */

  useEffect(() => {
    if (dashboardActive) setDashboardExpanded(true);

    if (billingActive) {
      setBillingExpanded(true);
    } else {
      setBillingExpanded(false);
    }

    if (usersActive) setUsersExpanded(true);
    if (organizationsActive) setOrganizationsExpanded(true);
    if (workspacesActive) setWorkspacesExpanded(true);
    if (rolesActive) setRolesExpanded(true);
    if (permissionsActive) setPermissionsExpanded(true);
    if (governanceActive) setGovernanceExpanded(true);
    if (securityActive) setSecurityExpanded(true);
    if (complianceActive) setComplianceExpanded(true);
    if (auditActive) setAuditExpanded(true);
    if (usageActive) setUsageExpanded(true);

    setWorkspaceMenuOpen(false);
    setProfileMenuOpen(false);
  }, [
    pathname,
    dashboardActive,
    billingActive,
    usersActive,
    organizationsActive,
    workspacesActive,
    rolesActive,
    permissionsActive,
    governanceActive,
    securityActive,
    complianceActive,
    auditActive,
    usageActive,
  ]);

  /* =========================================================
     SUBMENU RENDERER
  ========================================================= */

  function renderSubmenu(items: NavItem[], type: SubmenuType) {
    return (
      <div id={`admin-${type}-submenu`} className="admin-billing-submenu">
        {items.map((section) => {
          const Icon = section.icon;

  const active =
  normalizePath(pathname) === normalizePath(section.href);

          return (
            <Link
              key={section.href}
              href={section.href}
              onClick={onNavigate}
              title={section.description}
              aria-current={active ? "page" : undefined}
              className={`admin-billing-submenu-link${active ? " is-active" : ""}`}
            >
              <Icon size={15} strokeWidth={1.8} aria-hidden="true" />
              <span>{section.label}</span>
            </Link>
          );
        })}
      </div>
    );
  }

  /* =========================================================
     SIDEBAR UI
  ========================================================= */

  return (
    <>
      <style jsx global>{`
        .admin-billing-nav {
          width: 100%;
        }

        .admin-billing-nav > button {
          width: 100%;
          border: 0;
          cursor: pointer;
          text-align: left;
          font: inherit;
        }

        .admin-billing-chevron {
          flex-shrink: 0;
          margin-left: auto;
          transition: transform 150ms ease;
        }

        .admin-billing-nav > button[aria-expanded="true"] .admin-billing-chevron {
          transform: rotate(180deg);
        }

        .admin-billing-submenu {
          display: flex;
          flex-direction: column;
          gap: 3px;
          margin: 4px 0 8px 20px;
          padding-left: 12px;
          border-left: 1px solid #e2e8f0;
        }

        .admin-billing-submenu-link {
          display: flex;
          align-items: center;
          gap: 9px;
          min-height: 35px;
          padding: 7px 9px;
          border-radius: 7px;
          color: #64748b;
          text-decoration: none;
          font-size: 12px;
          line-height: 1.4;
          transition: background 150ms ease, color 150ms ease;
        }

        .admin-billing-submenu-link:hover,
        .admin-billing-submenu-link.is-active {
          background: #eff6ff;
          color: #1d4ed8;
        }

        .admin-billing-submenu-link:focus-visible,
        .admin-billing-nav > button:focus-visible {
          outline: 2px solid #2563eb;
          outline-offset: 2px;
        }

        .admin-billing-submenu-link span {
          min-width: 0;
        }

        /* Administration popup wrapper */
        .admin-workspace-switcher-wrap {
          position: relative;
          width: 100%;
        }

        /* Administration popup positioning */
        .admin-workspace-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          bottom: auto;
          left: 0;
          z-index: 300;
          min-width: 180px;
          animation: admin-menu-enter 0.18s ease-out;
        }

        .admin-workspace-switcher[aria-expanded="true"] {
          background: var(--admin-sidebar-hover, #f1f5f9);
        }

        .admin-workspace-menu .admin-profile-menu-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          text-align: left;
          cursor: pointer;
        }

        @keyframes admin-menu-enter {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* BRAND */}
      <div className="admin-brand-row">
        <Link
          href="/dashboard"
          className="admin-brand"
          aria-label="ModelNow Admin home"
          onClick={onNavigate}
        >
          <span className="admin-brand-mark" aria-hidden="true">
            <Command size={22} strokeWidth={2.2} />
          </span>

          {!collapsed && (
            <span className="admin-brand-copy">
              <strong>ModelNow</strong>
              <span>ADMIN CONSOLE</span>
            </span>
          )}
        </Link>

        {onCollapse && (
          <button
            type="button"
            className="admin-icon-button admin-collapse-button"
            onClick={onCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
          </button>
        )}
      </div>

      {/* ADMINISTRATION WORKSPACE POPUP */}
      <div className="admin-workspace-switcher-wrap">
        <button
          type="button"
          className="admin-workspace-switcher"
          title="Administration"
          aria-haspopup="menu"
          aria-expanded={workspaceMenuOpen}
          onClick={() => {
            setWorkspaceMenuOpen((open) => !open);
            setProfileMenuOpen(false);
          }}
        >
          <span className="admin-workspace-avatar">
            <Activity size={17} />
          </span>

          {!collapsed && (
            <>
              <span className="admin-workspace-copy">
                <strong>ModelNow Workspace</strong>
                <span>Administration</span>
              </span>

              <ChevronDown
                size={15}
                className="admin-workspace-chevron"
              />
            </>
          )}
        </button>

        {workspaceMenuOpen && (
          <div
            className="admin-profile-menu admin-workspace-menu"
            role="menu"
          >
            <Link
              href="/settings"
              className="admin-profile-menu-item"
              role="menuitem"
              onClick={() => {
                setWorkspaceMenuOpen(false);
                onNavigate?.();
              }}
            >
              <Settings size={17} />
              <span>Settings</span>
            </Link>

            <button
              type="button"
              className="admin-profile-menu-item admin-profile-logout"
              role="menuitem"
              onClick={() => {
                setWorkspaceMenuOpen(false);
                onNavigate?.();
                window.location.assign("/logout");
              }}
            >
              <LogOut size={17} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>

      {/* MAIN NAVIGATION */}
      <nav className="admin-sidebar-nav" aria-label="Admin navigation">
        {NAV_GROUPS.map((group) => (
          <section className="admin-nav-group" key={group.label}>
            {!collapsed && <h2 className="admin-nav-heading">{group.label}</h2>}

            <div className="admin-nav-items">
              {group.items.map((item) => {
                const Icon = item.icon;

                // DASHBOARD
                if (item.label === "Dashboard") {
                  return (
                    <div className="admin-billing-nav" key={item.href}>
                      <button
                        type="button"
                        className={`admin-nav-link${dashboardActive ? " is-active" : ""}`}
                        onClick={() => {
                          if (collapsed) {
                            onCollapse?.();
                            setDashboardExpanded(true);
                            return;
                          }
                          setDashboardExpanded((value) => !value);
                        }}
                        aria-expanded={dashboardExpanded}
                        aria-controls="admin-dashboard-submenu"
                        title={item.description}
                      >
                        <Icon size={18} strokeWidth={1.8} />
                        {!collapsed && (
                          <>
                            <span className="admin-nav-link-label">Dashboard</span>
                            <ChevronDown size={15} className="admin-billing-chevron" />
                          </>
                        )}
                      </button>
                      {dashboardExpanded && !collapsed && renderSubmenu(DASHBOARD_SUBSECTIONS, "dashboard")}
                    </div>
                  );
                }

                // USAGE & ANALYTICS
                if (item.label === "Usage & analytics") {
                  return (
                    <div className="admin-billing-nav" key={item.href}>
                      <button
                        type="button"
                        className={`admin-nav-link${usageActive ? " is-active" : ""}`}
                        onClick={() => {
                          if (collapsed) {
                            onCollapse?.();
                            setUsageExpanded(true);
                            return;
                          }
                          setUsageExpanded((value) => !value);
                        }}
                        aria-expanded={usageExpanded}
                        aria-controls="admin-usage-submenu"
                        title={item.description}
                      >
                        <Icon size={18} strokeWidth={1.8} />
                        {!collapsed && (
                          <>
                            <span className="admin-nav-link-label">Usage & analytics</span>
                            <ChevronDown size={15} className="admin-billing-chevron" />
                          </>
                        )}
                      </button>
                      {usageExpanded && !collapsed && renderSubmenu(USAGE_SUBSECTIONS, "usage")}
                    </div>
                  );
                }

                // USERS
                if (item.label === "Users") {
                  return (
                    <div className="admin-billing-nav" key={item.href}>
                      <button
                        type="button"
                        className={`admin-nav-link${usersActive ? " is-active" : ""}`}
                        onClick={() => {
                          if (collapsed) {
                            onCollapse?.();
                            setUsersExpanded(true);
                            return;
                          }
                          setUsersExpanded((value) => !value);
                        }}
                        aria-expanded={usersExpanded}
                        aria-controls="admin-users-submenu"
                        title={item.description}
                      >
                        <Icon size={18} strokeWidth={1.8} />
                        {!collapsed && (
                          <>
                            <span className="admin-nav-link-label">Users</span>
                            <ChevronDown size={15} className="admin-billing-chevron" />
                          </>
                        )}
                      </button>
                      {usersExpanded && !collapsed && renderSubmenu(USERS_SUBSECTIONS, "users")}
                    </div>
                  );
                }

                // ORGANIZATIONS
                if (item.label === "Organizations") {
                  return (
                    <div className="admin-billing-nav" key={item.href}>
                      <button
                        type="button"
                        className={`admin-nav-link${organizationsActive ? " is-active" : ""}`}
                        onClick={() => {
                          if (collapsed) {
                            onCollapse?.();
                            setOrganizationsExpanded(true);
                            return;
                          }
                          setOrganizationsExpanded((value) => !value);
                        }}
                        aria-expanded={organizationsExpanded}
                        aria-controls="admin-organizations-submenu"
                        title={item.description}
                      >
                        <Icon size={18} strokeWidth={1.8} />
                        {!collapsed && (
                          <>
                            <span className="admin-nav-link-label">Organizations</span>
                            <ChevronDown size={15} className="admin-billing-chevron" />
                          </>
                        )}
                      </button>
                      {organizationsExpanded && !collapsed && renderSubmenu(ORGANIZATIONS_SUBSECTIONS, "organizations")}
                    </div>
                  );
                }

                // WORKSPACES
                if (item.label === "Workspaces") {
                  return (
                    <div className="admin-billing-nav" key={item.href}>
                      <button
                        type="button"
                        className={`admin-nav-link${workspacesActive ? " is-active" : ""}`}
                        onClick={() => {
                          if (collapsed) {
                            onCollapse?.();
                            setWorkspacesExpanded(true);
                            return;
                          }
                          setWorkspacesExpanded((value) => !value);
                        }}
                        aria-expanded={workspacesExpanded}
                        aria-controls="admin-workspaces-submenu"
                        title={item.description}
                      >
                        <Icon size={18} strokeWidth={1.8} />
                        {!collapsed && (
                          <>
                            <span className="admin-nav-link-label">Workspaces</span>
                            <ChevronDown size={15} className="admin-billing-chevron" />
                          </>
                        )}
                      </button>
                      {workspacesExpanded && !collapsed && renderSubmenu(WORKSPACES_SUBSECTIONS, "workspaces")}
                    </div>
                  );
                }

                // ROLES
                if (item.label === "Roles") {
                  return (
                    <div className="admin-billing-nav" key={item.href}>
                      <button
                        type="button"
                        className={`admin-nav-link${rolesActive ? " is-active" : ""}`}
                        onClick={() => {
                          if (collapsed) {
                            onCollapse?.();
                            setRolesExpanded(true);
                            return;
                          }
                          setRolesExpanded((value) => !value);
                        }}
                        aria-expanded={rolesExpanded}
                        aria-controls="admin-roles-submenu"
                        title={item.description}
                      >
                        <Icon size={18} strokeWidth={1.8} />
                        {!collapsed && (
                          <>
                            <span className="admin-nav-link-label">Roles</span>
                            <ChevronDown size={15} className="admin-billing-chevron" />
                          </>
                        )}
                      </button>
                      {rolesExpanded && !collapsed && renderSubmenu(ROLES_SUBSECTIONS, "roles")}
                    </div>
                  );
                }

                // PERMISSIONS
                if (item.label === "Permissions") {
                  return (
                    <div className="admin-billing-nav" key={item.href}>
                      <button
                        type="button"
                        className={`admin-nav-link${permissionsActive ? " is-active" : ""}`}
                        onClick={() => {
                          if (collapsed) {
                            onCollapse?.();
                            setPermissionsExpanded(true);
                            return;
                          }
                          setPermissionsExpanded((value) => !value);
                        }}
                        aria-expanded={permissionsExpanded}
                        aria-controls="admin-permissions-submenu"
                        title={item.description}
                      >
                        <Icon size={18} strokeWidth={1.8} />
                        {!collapsed && (
                          <>
                            <span className="admin-nav-link-label">Permissions</span>
                            <ChevronDown size={15} className="admin-billing-chevron" />
                          </>
                        )}
                      </button>
                      {permissionsExpanded && !collapsed && renderSubmenu(PERMISSIONS_SUBSECTIONS, "permissions")}
                    </div>
                  );
                }

                // GOVERNANCE
                if (item.label === "Governance") {
                  return (
                    <div className="admin-billing-nav" key={item.href}>
                      <button
                        type="button"
                        className={`admin-nav-link${governanceActive ? " is-active" : ""}`}
                        onClick={() => {
                          if (collapsed) {
                            onCollapse?.();
                            setGovernanceExpanded(true);
                            return;
                          }
                          setGovernanceExpanded((value) => !value);
                        }}
                        aria-expanded={governanceExpanded}
                        aria-controls="admin-governance-submenu"
                        title={item.description}
                      >
                        <Icon size={18} strokeWidth={1.8} />
                        {!collapsed && (
                          <>
                            <span className="admin-nav-link-label">Governance</span>
                            <ChevronDown size={15} className="admin-billing-chevron" />
                          </>
                        )}
                      </button>
                      {governanceExpanded && !collapsed && renderSubmenu(GOVERNANCE_SUBSECTIONS, "governance")}
                    </div>
                  );
                }

                // SECURITY
                if (item.label === "Security") {
                  return (
                    <div className="admin-billing-nav" key={item.href}>
                      <button
                        type="button"
                        className={`admin-nav-link${securityActive ? " is-active" : ""}`}
                        onClick={() => {
                          if (collapsed) {
                            onCollapse?.();
                            setSecurityExpanded(true);
                            return;
                          }
                          setSecurityExpanded((value) => !value);
                        }}
                        aria-expanded={securityExpanded}
                        aria-controls="admin-security-submenu"
                        title={item.description}
                      >
                        <Icon size={18} strokeWidth={1.8} />
                        {!collapsed && (
                          <>
                            <span className="admin-nav-link-label">Security</span>
                            <ChevronDown size={15} className="admin-billing-chevron" />
                          </>
                        )}
                      </button>
                      {securityExpanded && !collapsed && renderSubmenu(SECURITY_SUBSECTIONS, "security")}
                    </div>
                  );
                }

                // COMPLIANCE
                if (item.label === "Compliance") {
                  return (
                    <div className="admin-billing-nav" key={item.href}>
                      <button
                        type="button"
                        className={`admin-nav-link${complianceActive ? " is-active" : ""}`}
                        onClick={() => {
                          if (collapsed) {
                            onCollapse?.();
                            setComplianceExpanded(true);
                            return;
                          }
                          setComplianceExpanded((value) => !value);
                        }}
                        aria-expanded={complianceExpanded}
                        aria-controls="admin-compliance-submenu"
                        title={item.description}
                      >
                        <Icon size={18} strokeWidth={1.8} />
                        {!collapsed && (
                          <>
                            <span className="admin-nav-link-label">Compliance</span>
                            <ChevronDown size={15} className="admin-billing-chevron" />
                          </>
                        )}
                      </button>
                      {complianceExpanded && !collapsed && renderSubmenu(COMPLIANCE_SUBSECTIONS, "compliance")}
                    </div>
                  );
                }

                // AUDIT LOGS
                if (item.label === "Audit logs") {
                  return (
                    <div className="admin-billing-nav" key={item.href}>
                      <button
                        type="button"
                        className={`admin-nav-link${auditActive ? " is-active" : ""}`}
                        onClick={() => {
                          if (collapsed) {
                            onCollapse?.();
                            setAuditExpanded(true);
                            return;
                          }
                          setAuditExpanded((value) => !value);
                        }}
                        aria-expanded={auditExpanded}
                        aria-controls="admin-audit-submenu"
                        title={item.description}
                      >
                        <Icon size={18} strokeWidth={1.8} />
                        {!collapsed && (
                          <>
                            <span className="admin-nav-link-label">Audit logs</span>
                            <ChevronDown size={15} className="admin-billing-chevron" />
                          </>
                        )}
                      </button>
                      {auditExpanded && !collapsed && renderSubmenu(AUDIT_SUBSECTIONS, "audit")}
                    </div>
                  );
                }

                // BILLING
                if (item.label === "Billing") {
                  return (
                    <div className="admin-billing-nav" key={item.href}>
                      <button
                        type="button"
                        className={`admin-nav-link${billingActive ? " is-active" : ""}`}
                        onClick={() => {
                          if (collapsed) {
                            onCollapse?.();
                            setBillingExpanded(true);
                            return;
                          }
                          setBillingExpanded((value) => !value);
                        }}
                        aria-expanded={billingExpanded}
                        aria-controls="admin-billing-submenu"
                        title={item.description}
                      >
                        <Icon size={18} strokeWidth={1.8} />
                        {!collapsed && (
                          <>
                            <span className="admin-nav-link-label">Billing</span>
                            <ChevronDown size={15} className="admin-billing-chevron" />
                          </>
                        )}
                      </button>
                      {billingExpanded && !collapsed && renderSubmenu(BILLING_SUBSECTIONS, "billing")}
                    </div>
                  );
                }

                return (
                  <SidebarLink
                    key={item.href}
                    item={item}
                    pathname={pathname}
                    onNavigate={onNavigate}
                  />
                );
              })}
            </div>
          </section>
        ))}
      </nav>

      {/* SIDEBAR BOTTOM */}
      <div className="admin-sidebar-bottom">
        <div className="admin-sidebar-divider" />

        <div className="admin-profile-wrapper">
          {profileMenuOpen && (
            <div className="admin-profile-menu" role="menu">
              <Link
                href="/settings"
                className="admin-profile-menu-item"
                role="menuitem"
                onClick={() => {
                  setProfileMenuOpen(false);
                  onNavigate?.();
                }}
              >
                <Settings size={17} />
                <span>Settings</span>
              </Link>

              <button
                type="button"
                className="admin-profile-menu-item admin-profile-logout"
                role="menuitem"
                onClick={() => {
                  setProfileMenuOpen(false);
                  onNavigate?.();
                  window.location.assign("/logout");
                }}
              >
                <LogOut size={17} />
                <span>Logout</span>
              </button>
            </div>
          )}

          <button
            type="button"
            className="admin-profile"
            aria-haspopup="menu"
            aria-expanded={profileMenuOpen}
            onClick={() => {
              setProfileMenuOpen((open) => !open);
              setWorkspaceMenuOpen(false);
            }}
          >
            <span className="admin-profile-avatar" aria-hidden="true">
              AD
            </span>

            {!collapsed && (
              <span className="admin-profile-copy">
                <strong>Administrator</strong>
                <span>Admin workspace</span>
              </span>
            )}

            {!collapsed && (
              <ChevronDown
                size={16}
                className={`admin-profile-chevron ${
                  profileMenuOpen ? "open" : ""
                }`}
              />
            )}
          </button>
        </div>
      </div>
    </>
  );
}