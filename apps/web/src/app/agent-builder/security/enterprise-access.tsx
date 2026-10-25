"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Database,
  KeyRound,
  Lock,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";

type AccessStatus = "Active" | "Pending" | "Suspended";

type AccessUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  team: string;
  accessLevel: string;
  status: AccessStatus;
  lastActive: string;
};

type AccessRole = {
  name: string;
  users: number;
  permissions: number;
  description: string;
  risk: "High" | "Medium" | "Low";
};

const initialUsers: AccessUser[] = [
  {
    id: "USR-1001",
    name: "Pujitha",
    email: "pujitha@company.com",
    role: "Administrator",
    team: "Platform",
    accessLevel: "Full access",
    status: "Active",
    lastActive: "2 minutes ago",
  },
  {
    id: "USR-1002",
    name: "Rahul",
    email: "rahul@company.com",
    role: "Developer",
    team: "Engineering",
    accessLevel: "Production",
    status: "Active",
    lastActive: "12 minutes ago",
  },
  {
    id: "USR-1003",
    name: "Priya",
    email: "priya@company.com",
    role: "Security Reviewer",
    team: "Security",
    accessLevel: "Security only",
    status: "Active",
    lastActive: "28 minutes ago",
  },
  {
    id: "USR-1004",
    name: "Anil",
    email: "anil@company.com",
    role: "Developer",
    team: "Engineering",
    accessLevel: "Development",
    status: "Active",
    lastActive: "1 hour ago",
  },
  {
    id: "USR-1005",
    name: "Sneha",
    email: "sneha@company.com",
    role: "Analyst",
    team: "Analytics",
    accessLevel: "Read only",
    status: "Pending",
    lastActive: "Never",
  },
  {
    id: "USR-1006",
    name: "Vikram",
    email: "vikram@company.com",
    role: "Developer",
    team: "AI Platform",
    accessLevel: "Development",
    status: "Suspended",
    lastActive: "3 days ago",
  },
];

const roles: AccessRole[] = [
  {
    name: "Administrator",
    users: 2,
    permissions: 48,
    description: "Full platform and enterprise administration.",
    risk: "High",
  },
  {
    name: "Developer",
    users: 18,
    permissions: 31,
    description: "Build and manage applications, agents, and workflows.",
    risk: "Medium",
  },
  {
    name: "Security Reviewer",
    users: 4,
    permissions: 22,
    description: "Security, governance, audit, and policy visibility.",
    risk: "Medium",
  },
  {
    name: "Analyst",
    users: 11,
    permissions: 14,
    description: "Analytics, observability, and read-only platform access.",
    risk: "Low",
  },
];

const accessPolicies = [
  {
    title: "Single Sign-On",
    description: "Require enterprise identity provider authentication.",
    enabled: true,
  },
  {
    title: "Multi-factor authentication",
    description: "Require an additional authentication factor.",
    enabled: true,
  },
  {
    title: "IP restrictions",
    description: "Limit administrative access to trusted networks.",
    enabled: true,
  },
  {
    title: "Session timeout",
    description: "Automatically expire inactive enterprise sessions.",
    enabled: true,
  },
];

export default function EnterpriseAccessPage() {
  const [users, setUsers] = useState<AccessUser[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [roleFilter, setRoleFilter] = useState("All roles");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Developer");
  const [message, setMessage] = useState("");

  const filteredUsers = useMemo(() => {
    const query = search.toLowerCase().trim();

    return users.filter((user) => {
      const matchesSearch =
        !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.team.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All statuses" ||
        user.status === statusFilter;

      const matchesRole =
        roleFilter === "All roles" ||
        user.role === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, search, statusFilter, roleFilter]);

  const activeUsers = users.filter(
    (user) => user.status === "Active"
  ).length;

  const pendingUsers = users.filter(
    (user) => user.status === "Pending"
  ).length;

  const suspendedUsers = users.filter(
    (user) => user.status === "Suspended"
  ).length;

  const handleInvite = () => {
    if (!inviteEmail.trim()) {
      setMessage("Enter an email address.");
      return;
    }

    const newUser: AccessUser = {
      id: `USR-${1000 + users.length + 1}`,
      name: inviteEmail.split("@")[0],
      email: inviteEmail.trim(),
      role: inviteRole,
      team: "New member",
      accessLevel:
        inviteRole === "Administrator"
          ? "Full access"
          : inviteRole === "Analyst"
            ? "Read only"
            : inviteRole === "Security Reviewer"
              ? "Security only"
              : "Development",
      status: "Pending",
      lastActive: "Never",
    };

    setUsers((current) => [newUser, ...current]);
    setInviteEmail("");
    setShowInvite(false);
    setMessage("Invitation created successfully.");

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#111827]">
      <header className="border-b border-[#e5e7eb] bg-white">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-8 py-5">
          <div className="flex items-center gap-4">
            <Link
              href="/agent-builder/security"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e5e7eb] bg-white text-[#64748b] hover:bg-[#f8fafc]"
            >
              <ArrowLeft size={17} />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck
                  size={20}
                  className="text-[#2563eb]"
                />

                <h1 className="text-[21px] font-semibold tracking-[-0.02em]">
                  Enterprise Access
                </h1>
              </div>

              <p className="mt-1 text-[13px] text-[#64748b]">
                Manage enterprise users, roles, permissions, identity
                policies, and administrative access.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/agent-builder/security/audit-logs"
              className="flex h-9 items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-3 text-[11px] font-medium text-[#475569] hover:bg-[#f8fafc]"
            >
              <Activity size={14} />
              Audit logs
            </Link>

            <button
              onClick={() => setShowInvite(true)}
              className="flex h-9 items-center gap-2 rounded-lg bg-[#2563eb] px-3 text-[11px] font-medium text-white hover:bg-[#1d4ed8]"
            >
              <Plus size={14} />
              Invite user
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-8 py-7">
        {message && (
          <div className="mb-5 flex items-center gap-2 rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 text-[11px] font-medium text-[#15803d]">
            <CheckCircle2 size={15} />
            {message}
          </div>
        )}

        <div className="grid grid-cols-4 gap-4">
          <MetricCard
            title="Total users"
            value={users.length.toString()}
            subtitle="Enterprise members"
            icon={<Users size={18} />}
          />

          <MetricCard
            title="Active users"
            value={activeUsers.toString()}
            subtitle="Currently enabled"
            icon={<CheckCircle2 size={18} />}
            tone="success"
          />

          <MetricCard
            title="Pending invitations"
            value={pendingUsers.toString()}
            subtitle="Awaiting activation"
            icon={<Clock3 size={18} />}
            tone="warning"
          />

          <MetricCard
            title="Suspended"
            value={suspendedUsers.toString()}
            subtitle="Access disabled"
            icon={<XCircle size={18} />}
            tone="danger"
          />
        </div>

        <div className="mt-5 grid grid-cols-[minmax(0,1fr)_370px] gap-5">
          <section className="rounded-xl border border-[#e5e7eb] bg-white">
            <div className="border-b border-[#e5e7eb] px-5 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-[15px] font-semibold">
                    Enterprise users
                  </h2>

                  <p className="mt-1 text-[11px] text-[#94a3b8]">
                    Manage user identities and access levels.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]"
                    />

                    <input
                      value={search}
                      onChange={(event) =>
                        setSearch(event.target.value)
                      }
                      placeholder="Search users..."
                      className="h-9 w-[190px] rounded-lg border border-[#e5e7eb] bg-[#fafafa] pl-8 pr-3 text-[10px] outline-none focus:border-[#93c5fd]"
                    />
                  </div>

                  <FilterSelect
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={[
                      "All statuses",
                      "Active",
                      "Pending",
                      "Suspended",
                    ]}
                  />

                  <FilterSelect
                    value={roleFilter}
                    onChange={setRoleFilter}
                    options={[
                      "All roles",
                      "Administrator",
                      "Developer",
                      "Security Reviewer",
                      "Analyst",
                    ]}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-[minmax(0,1.2fr)_170px_125px_125px_105px_95px] gap-3 bg-[#fafafa] px-5 py-3 text-[9px] font-semibold uppercase tracking-wide text-[#94a3b8]">
              <span>User</span>
              <span>Role</span>
              <span>Team</span>
              <span>Access</span>
              <span>Status</span>
              <span>Activity</span>
            </div>

            <div className="divide-y divide-[#f1f5f9]">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="grid grid-cols-[minmax(0,1.2fr)_170px_125px_125px_105px_95px] items-center gap-3 px-5 py-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eff6ff] text-[#2563eb]">
                      <UserRound size={15} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-semibold text-[#334155]">
                        {user.name}
                      </p>

                      <p className="mt-1 truncate text-[9px] text-[#94a3b8]">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-medium text-[#475569]">
                    {user.role}
                  </span>

                  <span className="text-[10px] text-[#64748b]">
                    {user.team}
                  </span>

                  <span className="text-[10px] text-[#64748b]">
                    {user.accessLevel}
                  </span>

                  <AccessStatus status={user.status} />

                  <span className="text-[9px] text-[#94a3b8]">
                    {user.lastActive}
                  </span>
                </div>
              ))}

              {filteredUsers.length === 0 && (
                <div className="px-5 py-12 text-center">
                  <Users
                    size={28}
                    className="mx-auto text-[#cbd5e1]"
                  />

                  <p className="mt-3 text-[12px] font-medium text-[#64748b]">
                    No users found
                  </p>

                  <p className="mt-1 text-[10px] text-[#94a3b8]">
                    Try changing the search or filters.
                  </p>
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-5">
            <section className="rounded-xl border border-[#e5e7eb] bg-white">
              <div className="border-b border-[#e5e7eb] px-5 py-4">
                <h2 className="text-[14px] font-semibold">
                  Identity controls
                </h2>

                <p className="mt-1 text-[10px] text-[#94a3b8]">
                  Enterprise authentication requirements.
                </p>
              </div>

              <div className="space-y-1 px-5 py-3">
                <ControlRow
                  icon={<KeyRound size={15} />}
                  title="SSO"
                  description="Enterprise identity provider"
                  enabled
                />

                <ControlRow
                  icon={<ShieldCheck size={15} />}
                  title="MFA"
                  description="Required for privileged users"
                  enabled
                />

                <ControlRow
                  icon={
                    <span className="text-[11px] font-bold">
                      IP
                    </span>
                  }
                  title="IP allowlist"
                  description="Trusted network access"
                  enabled
                />

                <ControlRow
                  icon={<Clock3 size={15} />}
                  title="Session timeout"
                  description="30 minute inactivity timeout"
                  enabled
                />
              </div>
            </section>

            <section className="rounded-xl border border-[#e5e7eb] bg-white">
              <div className="border-b border-[#e5e7eb] px-5 py-4">
                <h2 className="text-[14px] font-semibold">
                  Access management
                </h2>
              </div>

              <div className="space-y-3 p-5">
                <AccessSummary
                  icon={<Users size={16} />}
                  title="Users & groups"
                  value={`${users.length} users`}
                />

                <AccessSummary
                  icon={<ShieldCheck size={16} />}
                  title="Roles"
                  value={`${roles.length} roles`}
                />

                <AccessSummary
                  icon={<Lock size={16} />}
                  title="Policies"
                  value={`${accessPolicies.length} policies`}
                />

                <AccessSummary
                  icon={<Database size={16} />}
                  title="Protected resources"
                  value="24 resources"
                />
              </div>
            </section>
          </aside>
        </div>

        <section className="mt-5 rounded-xl border border-[#e5e7eb] bg-white">
          <div className="border-b border-[#e5e7eb] px-5 py-4">
            <h2 className="text-[15px] font-semibold">
              Enterprise roles
            </h2>

            <p className="mt-1 text-[11px] text-[#94a3b8]">
              Role-based access control for enterprise resources.
            </p>
          </div>

          <div className="grid grid-cols-4 divide-x divide-[#e5e7eb]">
            {roles.map((role) => (
              <RoleCard key={role.name} role={role} />
            ))}
          </div>
        </section>

        <section className="mt-5 rounded-xl border border-[#e5e7eb] bg-white">
          <div className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-4">
            <div>
              <h2 className="text-[15px] font-semibold">
                Enterprise access policies
              </h2>

              <p className="mt-1 text-[11px] text-[#94a3b8]">
                Security policies applied to enterprise accounts.
              </p>
            </div>

            <Link
              href="/agent-builder/security/governance"
              className="flex items-center gap-1.5 text-[10px] font-medium text-[#2563eb]"
            >
              Open governance
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-4 divide-x divide-[#e5e7eb]">
            {accessPolicies.map((policy) => (
              <PolicyCard
                key={policy.title}
                title={policy.title}
                description={policy.description}
                enabled={policy.enabled}
              />
            ))}
          </div>
        </section>

        <div className="mt-5 grid grid-cols-3 gap-4">
          <InfoCard
            icon={<KeyRound size={17} />}
            title="Centralized identity"
            description="Connect enterprise users with centralized authentication and identity providers."
          />

          <InfoCard
            icon={<ShieldCheck size={17} />}
            title="Least privilege"
            description="Assign only the permissions required for each user, role, and workload."
          />

          <InfoCard
            icon={<Activity size={17} />}
            title="Access visibility"
            description="Monitor changes to users, roles, permissions, and enterprise security policies."
          />
        </div>
      </div>

      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-5">
          <div className="w-full max-w-[500px] rounded-xl border border-[#e5e7eb] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-4">
              <div>
                <p className="text-[10px] font-medium text-[#94a3b8]">
                  Enterprise access
                </p>

                <h2 className="mt-1 text-[16px] font-semibold">
                  Invite user
                </h2>
              </div>

              <button
                onClick={() => setShowInvite(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#64748b] hover:bg-[#f8fafc]"
              >
                <span className="text-[19px] leading-none">
                  ×
                </span>
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <label className="mb-1.5 block text-[10px] font-medium text-[#475569]">
                  Email address
                </label>

                <input
                  value={inviteEmail}
                  onChange={(event) =>
                    setInviteEmail(event.target.value)
                  }
                  placeholder="user@company.com"
                  className="h-10 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-[11px] outline-none focus:border-[#93c5fd]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-medium text-[#475569]">
                  Role
                </label>

                <div className="relative">
                  <select
                    value={inviteRole}
                    onChange={(event) =>
                      setInviteRole(event.target.value)
                    }
                    className="h-10 w-full appearance-none rounded-lg border border-[#e5e7eb] bg-white px-3 pr-8 text-[11px] outline-none"
                  >
                    <option>Administrator</option>
                    <option>Developer</option>
                    <option>Security Reviewer</option>
                    <option>Analyst</option>
                  </select>

                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8]"
                  />
                </div>
              </div>

              <div className="rounded-lg border border-[#dbeafe] bg-[#eff6ff] p-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck
                    size={15}
                    className="text-[#2563eb]"
                  />

                  <p className="text-[10px] font-semibold text-[#1e40af]">
                    Access will start as pending
                  </p>
                </div>

                <p className="mt-1 text-[9px] leading-4 text-[#3b82f6]">
                  The user can be activated after completing the configured
                  enterprise authentication process.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-[#e5e7eb] px-5 py-4">
              <button
                onClick={() => setShowInvite(false)}
                className="h-9 rounded-lg border border-[#e5e7eb] px-4 text-[11px] font-medium text-[#475569]"
              >
                Cancel
              </button>

              <button
                onClick={handleInvite}
                className="h-9 rounded-lg bg-[#2563eb] px-4 text-[11px] font-medium text-white hover:bg-[#1d4ed8]"
              >
                Create invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  tone = "default",
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: ReactNode;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  const styles = {
    default: "bg-[#eff6ff] text-[#2563eb]",
    success: "bg-[#f0fdf4] text-[#16a34a]",
    warning: "bg-[#fffbeb] text-[#d97706]",
    danger: "bg-[#fef2f2] text-[#dc2626]",
  };

  return (
    <div className="rounded-xl border border-[#e5e7eb] bg-white p-4">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-lg ${styles[tone]}`}
      >
        {icon}
      </div>

      <p className="mt-4 text-[11px] text-[#64748b]">
        {title}
      </p>

      <p className="mt-1 text-[24px] font-semibold tracking-[-0.03em]">
        {value}
      </p>

      <p className="mt-1 text-[10px] text-[#94a3b8]">
        {subtitle}
      </p>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 appearance-none rounded-lg border border-[#e5e7eb] bg-white pl-3 pr-8 text-[10px] font-medium text-[#475569] outline-none"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>

      <ChevronDown
        size={13}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8]"
      />
    </div>
  );
}

function AccessStatus({
  status,
}: {
  status: AccessStatus;
}) {
  const styles = {
    Active: "bg-[#f0fdf4] text-[#15803d]",
    Pending: "bg-[#fffbeb] text-[#b45309]",
    Suspended: "bg-[#fef2f2] text-[#b91c1c]",
  };

  return (
    <span
      className={`inline-flex w-fit rounded-full px-2 py-1 text-[9px] font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function ControlRow({
  icon,
  title,
  description,
  enabled,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  enabled: boolean;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-[#f1f5f9] py-3 last:border-0">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f8fafc] text-[#64748b]">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold text-[#475569]">
          {title}
        </p>

        <p className="mt-0.5 text-[9px] text-[#94a3b8]">
          {description}
        </p>
      </div>

      <span
        className={`h-2 w-2 rounded-full ${
          enabled ? "bg-[#16a34a]" : "bg-[#cbd5e1]"
        }`}
      />
    </div>
  );
}

function AccessSummary({
  icon,
  title,
  value,
}: {
  icon: ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[#eef2f7] p-3">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#eff6ff] text-[#2563eb]">
        {icon}
      </div>

      <div>
        <p className="text-[10px] font-semibold text-[#475569]">
          {title}
        </p>

        <p className="mt-0.5 text-[9px] text-[#94a3b8]">
          {value}
        </p>
      </div>
    </div>
  );
}

function RoleCard({
  role,
}: {
  role: AccessRole;
}) {
  const riskStyle =
    role.risk === "High"
      ? "bg-[#fef2f2] text-[#b91c1c]"
      : role.risk === "Medium"
        ? "bg-[#fffbeb] text-[#b45309]"
        : "bg-[#f0fdf4] text-[#15803d]";

  return (
    <div className="p-5">
      <div className="flex items-center justify-between">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f8fafc] text-[#64748b]">
          <Users size={16} />
        </div>

        <span
          className={`rounded-full px-2 py-1 text-[8px] font-semibold ${riskStyle}`}
        >
          {role.risk} risk
        </span>
      </div>

      <h3 className="mt-4 text-[12px] font-semibold text-[#334155]">
        {role.name}
      </h3>

      <p className="mt-1 text-[10px] leading-4 text-[#94a3b8]">
        {role.description}
      </p>

      <div className="mt-4 flex items-center gap-4">
        <div>
          <p className="text-[15px] font-semibold text-[#334155]">
            {role.users}
          </p>

          <p className="text-[9px] text-[#94a3b8]">
            Users
          </p>
        </div>

        <div>
          <p className="text-[15px] font-semibold text-[#334155]">
            {role.permissions}
          </p>

          <p className="text-[9px] text-[#94a3b8]">
            Permissions
          </p>
        </div>
      </div>
    </div>
  );
}

function PolicyCard({
  title,
  description,
  enabled,
}: {
  title: string;
  description: string;
  enabled: boolean;
}) {
  return (
    <div className="p-5">
      <div className="flex items-center justify-between">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eff6ff] text-[#2563eb]">
          <Settings2 size={16} />
        </div>

        <span
          className={`rounded-full px-2 py-1 text-[8px] font-semibold ${
            enabled
              ? "bg-[#f0fdf4] text-[#15803d]"
              : "bg-[#f8fafc] text-[#64748b]"
          }`}
        >
          {enabled ? "Enabled" : "Disabled"}
        </span>
      </div>

      <h3 className="mt-4 text-[12px] font-semibold text-[#334155]">
        {title}
      </h3>

      <p className="mt-1 text-[10px] leading-5 text-[#94a3b8]">
        {description}
      </p>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-[#e5e7eb] bg-white p-5">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f8fafc] text-[#64748b]">
        {icon}
      </div>

      <h3 className="mt-3 text-[12px] font-semibold text-[#334155]">
        {title}
      </h3>

      <p className="mt-1 text-[10px] leading-5 text-[#94a3b8]">
        {description}
      </p>
    </div>
  );
}