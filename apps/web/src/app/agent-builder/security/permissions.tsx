"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Database,
  FileText,
  KeyRound,
  Lock,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  UserRound,
  Users,
  XCircle,
  Zap,
} from "lucide-react";

type PermissionStatus = "Active" | "Restricted" | "Revoked";

type Permission = {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  scope: string;
  role: string;
  assignedTo: string;
  status: PermissionStatus;
  users: number;
  lastUpdated: string;
};

const initialPermissions: Permission[] = [
  {
    id: "PER-1001",
    name: "Production Database Read",
    description:
      "Allows approved agents to read production customer data without modification access.",
    resource: "Customer Analytics DB",
    action: "Read",
    scope: "Production",
    role: "Data Analyst",
    assignedTo: "Analytics Agents",
    status: "Active",
    users: 8,
    lastUpdated: "12 min ago",
  },
  {
    id: "PER-1002",
    name: "Production Database Write",
    description:
      "Allows controlled write operations against approved production database tables.",
    resource: "Customer Analytics DB",
    action: "Write",
    scope: "Production",
    role: "Database Operator",
    assignedTo: "Operations Team",
    status: "Restricted",
    users: 3,
    lastUpdated: "32 min ago",
  },
  {
    id: "PER-1003",
    name: "External API Execution",
    description:
      "Allows agents to execute approved external REST APIs.",
    resource: "Financial Data API",
    action: "Execute",
    scope: "Production",
    role: "Research Agent",
    assignedTo: "Research Agents",
    status: "Active",
    users: 12,
    lastUpdated: "1 hr ago",
  },
  {
    id: "PER-1004",
    name: "Browser Automation",
    description:
      "Allows browser agents to interact with approved websites.",
    resource: "Customer Portal",
    action: "Interact",
    scope: "Production",
    role: "Browser Agent",
    assignedTo: "Browser Agents",
    status: "Active",
    users: 5,
    lastUpdated: "2 hrs ago",
  },
  {
    id: "PER-1005",
    name: "Workflow Deployment",
    description:
      "Allows engineering users to deploy approved workflow versions.",
    resource: "Agent Workflows",
    action: "Deploy",
    scope: "Production",
    role: "Engineering",
    assignedTo: "Engineering Team",
    status: "Restricted",
    users: 6,
    lastUpdated: "4 hrs ago",
  },
  {
    id: "PER-1006",
    name: "Customer Communication",
    description:
      "Allows approved agents to send customer-facing messages.",
    resource: "Notification Service",
    action: "Send",
    scope: "Production",
    role: "Customer Operations",
    assignedTo: "Notification Agents",
    status: "Revoked",
    users: 0,
    lastUpdated: "1 day ago",
  },
  {
    id: "PER-1007",
    name: "Knowledge Base Publish",
    description:
      "Allows knowledge agents to publish verified enterprise documents.",
    resource: "Enterprise Knowledge Base",
    action: "Publish",
    scope: "Staging",
    role: "Knowledge Manager",
    assignedTo: "Knowledge Agents",
    status: "Active",
    users: 4,
    lastUpdated: "1 day ago",
  },
  {
    id: "PER-1008",
    name: "Model Evaluation",
    description:
      "Allows evaluation agents to execute benchmark datasets.",
    resource: "Evaluation Platform",
    action: "Execute",
    scope: "Development",
    role: "Evaluator",
    assignedTo: "Evaluation Agents",
    status: "Active",
    users: 7,
    lastUpdated: "2 days ago",
  },
];

const statusOptions = ["All", "Active", "Restricted", "Revoked"];
const actionOptions = [
  "All",
  "Read",
  "Write",
  "Execute",
  "Interact",
  "Deploy",
  "Send",
  "Publish",
];

export default function PermissionsPage() {
  const [permissions, setPermissions] =
    useState<Permission[]>(initialPermissions);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [actionFilter, setActionFilter] = useState("All");
  const [selectedPermission, setSelectedPermission] =
    useState<Permission | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showCreate, setShowCreate] = useState(false);

  const filteredPermissions = useMemo(() => {
    const query = search.toLowerCase().trim();

    return permissions.filter((permission) => {
      const matchesSearch =
        !query ||
        permission.name.toLowerCase().includes(query) ||
        permission.description.toLowerCase().includes(query) ||
        permission.resource.toLowerCase().includes(query) ||
        permission.role.toLowerCase().includes(query) ||
        permission.assignedTo.toLowerCase().includes(query) ||
        permission.id.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || permission.status === statusFilter;

      const matchesAction =
        actionFilter === "All" || permission.action === actionFilter;

      return matchesSearch && matchesStatus && matchesAction;
    });
  }, [permissions, search, statusFilter, actionFilter]);

  const activeCount = permissions.filter(
    (permission) => permission.status === "Active"
  ).length;

  const restrictedCount = permissions.filter(
    (permission) => permission.status === "Restricted"
  ).length;

  const revokedCount = permissions.filter(
    (permission) => permission.status === "Revoked"
  ).length;

  const assignedUsers = permissions.reduce(
    (total, permission) => total + permission.users,
    0
  );

  function toggleSelection(id: string) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function toggleAll() {
    const visibleIds = filteredPermissions.map(
      (permission) => permission.id
    );

    const allSelected =
      visibleIds.length > 0 &&
      visibleIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds((current) =>
        current.filter((id) => !visibleIds.includes(id))
      );
    } else {
      setSelectedIds((current) =>
        Array.from(new Set([...current, ...visibleIds]))
      );
    }
  }

  function updateStatus(
    id: string,
    status: PermissionStatus
  ) {
    setPermissions((current) =>
      current.map((permission) =>
        permission.id === id
          ? {
              ...permission,
              status,
              lastUpdated: "Just now",
            }
          : permission
      )
    );

    setSelectedIds((current) => current.filter((item) => item !== id));

    setSelectedPermission((current) =>
      current?.id === id
        ? {
            ...current,
            status,
            lastUpdated: "Just now",
          }
        : current
    );
  }

  function bulkUpdate(status: PermissionStatus) {
    if (selectedIds.length === 0) return;

    setPermissions((current) =>
      current.map((permission) =>
        selectedIds.includes(permission.id)
          ? {
              ...permission,
              status,
              lastUpdated: "Just now",
            }
          : permission
      )
    );

    setSelectedIds([]);
  }

  const allVisibleSelected =
    filteredPermissions.length > 0 &&
    filteredPermissions.every((permission) =>
      selectedIds.includes(permission.id)
    );

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#172033]">
      <div className="mx-auto max-w-[1550px] px-6 py-6">
        <header className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/agent-builder/security"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e1e5eb] bg-white text-[#667085] hover:bg-[#f4f5f7]"
            >
              <ArrowLeft size={17} />
            </Link>

            <div>
              <div className="flex items-center gap-2 text-sm text-[#667085]">
                <span>Agent Builder</span>
                <span>/</span>
                <span>Security & Governance</span>
                <span>/</span>
                <span className="text-[#172033]">Permissions</span>
              </div>

              <h1 className="mt-1 text-[25px] font-semibold tracking-[-0.5px]">
                Permissions
              </h1>

              <p className="mt-1 text-sm text-[#667085]">
                Manage roles, resource permissions, tool access, and execution
                boundaries across ModelNow.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/agent-builder/security/human-approvals"
              className="flex items-center gap-2 rounded-lg border border-[#dfe3e8] bg-white px-3.5 py-2 text-sm font-medium text-[#344054] hover:bg-[#f8f9fb]"
            >
              <Users size={16} />
              Human Approvals
            </Link>

            <Link
              href="/agent-builder/security/audit-logs"
              className="flex items-center gap-2 rounded-lg border border-[#dfe3e8] bg-white px-3.5 py-2 text-sm font-medium text-[#344054] hover:bg-[#f8f9fb]"
            >
              <FileText size={16} />
              Audit Logs
            </Link>

            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 rounded-lg bg-[#171a21] px-4 py-2 text-sm font-medium text-white hover:bg-[#282c35]"
            >
              <Plus size={16} />
              Create Permission
            </button>
          </div>
        </header>

        <section className="mb-5 grid grid-cols-4 gap-4">
          <MetricCard
            label="Active permissions"
            value={activeCount.toString()}
            helper="Currently allowed"
            icon={<CheckCircle2 size={18} />}
          />

          <MetricCard
            label="Restricted"
            value={restrictedCount.toString()}
            helper="Limited access"
            icon={<Lock size={18} />}
          />

          <MetricCard
            label="Revoked"
            value={revokedCount.toString()}
            helper="Access disabled"
            icon={<XCircle size={18} />}
          />

          <MetricCard
            label="Assigned users"
            value={assignedUsers.toString()}
            helper="Across permission rules"
            icon={<Users size={18} />}
          />
        </section>

        <section className="mb-5 rounded-xl border border-[#e1e5eb] bg-white">
          <div className="border-b border-[#edf0f3] px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[16px] font-semibold">
                  Permission Policies
                </h2>

                <p className="mt-1 text-xs text-[#667085]">
                  Define what agents, users, and workflows can access and
                  execute.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#ecfdf3] px-2.5 py-1 text-[11px] font-medium text-[#027a48]">
                  {activeCount} active
                </span>

                <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e1e5eb] text-[#667085] hover:bg-[#f8f9fb]">
                  <Settings2 size={15} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 border-b border-[#edf0f3] px-5 py-3">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#98a2b3]"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search permissions, resources, roles..."
                className="h-9 w-full rounded-lg border border-[#dfe3e8] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#98a2b3]"
              />
            </div>

            <FilterSelect
              value={statusFilter}
              options={statusOptions}
              onChange={setStatusFilter}
            />

            <FilterSelect
              value={actionFilter}
              options={actionOptions}
              onChange={setActionFilter}
            />
          </div>

          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between border-b border-[#e5e7eb] bg-[#fafbfc] px-5 py-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle2 size={16} className="text-[#12b76a]" />
                {selectedIds.length} permission
                {selectedIds.length !== 1 ? "s" : ""} selected
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => bulkUpdate("Restricted")}
                  className="rounded-lg border border-[#dfe3e8] bg-white px-3 py-1.5 text-xs font-medium text-[#344054]"
                >
                  Restrict
                </button>

                <button
                  onClick={() => bulkUpdate("Revoked")}
                  className="rounded-lg border border-[#f04438] bg-white px-3 py-1.5 text-xs font-medium text-[#d92d20]"
                >
                  Revoke
                </button>

                <button
                  onClick={() => bulkUpdate("Active")}
                  className="rounded-lg bg-[#171a21] px-3 py-1.5 text-xs font-medium text-white"
                >
                  Activate
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1250px] border-collapse">
              <thead>
                <tr className="bg-[#fafbfc] text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[#667085]">
                  <th className="w-[45px] px-5 py-3">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleAll}
                      className="h-4 w-4 rounded border-[#d0d5dd]"
                    />
                  </th>

                  <th className="px-2 py-3">Permission</th>
                  <th className="px-4 py-3">Resource</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Scope</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Assigned To</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Users</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredPermissions.map((permission) => (
                  <tr
                    key={permission.id}
                    className="border-t border-[#edf0f3] hover:bg-[#fafbfc]"
                  >
                    <td className="px-5 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(permission.id)}
                        onChange={() => toggleSelection(permission.id)}
                        className="h-4 w-4 rounded border-[#d0d5dd]"
                      />
                    </td>

                    <td className="px-2 py-4">
                      <button
                        onClick={() =>
                          setSelectedPermission(permission)
                        }
                        className="text-left"
                      >
                        <div className="text-sm font-semibold text-[#172033] hover:underline">
                          {permission.name}
                        </div>

                        <div className="mt-1 text-[11px] text-[#98a2b3]">
                          {permission.id}
                        </div>
                      </button>
                    </td>

                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-[#344054]">
                        {permission.resource}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <ActionBadge action={permission.action} />
                    </td>

                    <td className="px-4 py-4">
                      <span className="rounded-md border border-[#e1e5eb] bg-[#fafbfc] px-2 py-1 text-[11px] font-medium text-[#475467]">
                        {permission.scope}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="text-sm font-medium">
                        {permission.role}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="text-sm text-[#475467]">
                        {permission.assignedTo}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <PermissionStatusBadge
                        status={permission.status}
                      />
                    </td>

                    <td className="px-4 py-4">
                      <span className="text-sm font-semibold">
                        {permission.users}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            setSelectedPermission(permission)
                          }
                          className="rounded-lg border border-[#dfe3e8] px-3 py-1.5 text-xs font-medium text-[#344054] hover:bg-[#f8f9fb]"
                        >
                          View
                        </button>

                        {permission.status === "Active" ? (
                          <button
                            onClick={() =>
                              updateStatus(
                                permission.id,
                                "Restricted"
                              )
                            }
                            className="rounded-lg border border-[#dfe3e8] px-3 py-1.5 text-xs font-medium text-[#344054]"
                          >
                            Restrict
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              updateStatus(
                                permission.id,
                                "Active"
                              )
                            }
                            className="rounded-lg bg-[#171a21] px-3 py-1.5 text-xs font-medium text-white"
                          >
                            Activate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredPermissions.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-5 py-12 text-center">
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#f2f4f7] text-[#667085]">
                        <Search size={18} />
                      </div>

                      <p className="mt-3 text-sm font-medium">
                        No permissions found
                      </p>

                      <p className="mt-1 text-xs text-[#98a2b3]">
                        Try changing your search or filters.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-4">
          <InfoCard
            icon={<ShieldCheck size={18} />}
            title="Role-based access"
            description="Control access through predefined roles and least-privilege policies."
            items={[
              "Admin permissions",
              "Agent permissions",
              "Team permissions",
              "Resource owner permissions",
            ]}
          />

          <InfoCard
            icon={<KeyRound size={18} />}
            title="Tool permissions"
            description="Restrict which tools agents can execute and what resources they can access."
            items={[
              "API execution",
              "Database operations",
              "Browser actions",
              "Code execution",
            ]}
          />

          <InfoCard
            icon={<Lock size={18} />}
            title="Production protection"
            description="Apply stronger permission controls to sensitive production workloads."
            items={[
              "Production-only restrictions",
              "Human approval requirements",
              "Environment boundaries",
              "Audit logging",
            ]}
          />
        </section>

        <section className="mt-5 rounded-xl border border-[#e1e5eb] bg-white">
          <div className="border-b border-[#edf0f3] px-5 py-4">
            <h2 className="text-[16px] font-semibold">
              Permission Architecture
            </h2>

            <p className="mt-1 text-xs text-[#667085]">
              ModelNow evaluates identity, role, resource, action, and
              environment before allowing an operation.
            </p>
          </div>

          <div className="grid grid-cols-5 divide-x divide-[#edf0f3]">
            <ArchitectureStep
              number="01"
              title="Identity"
              description="Identify the user, agent, workflow, or service."
              icon={<UserRound size={17} />}
            />

            <ArchitectureStep
              number="02"
              title="Role"
              description="Resolve the permissions assigned to the identity."
              icon={<Users size={17} />}
            />

            <ArchitectureStep
              number="03"
              title="Resource"
              description="Identify the database, API, tool, model, or workflow."
              icon={<Database size={17} />}
            />

            <ArchitectureStep
              number="04"
              title="Policy"
              description="Evaluate scope, environment, and security rules."
              icon={<ShieldCheck size={17} />}
            />

            <ArchitectureStep
              number="05"
              title="Decision"
              description="Allow, restrict, revoke, or request human approval."
              icon={<Activity size={17} />}
            />
          </div>
        </section>
      </div>

      {selectedPermission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-5">
          <div className="w-full max-w-[680px] rounded-2xl border border-[#e1e5eb] bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#edf0f3] px-6 py-5">
              <div>
                <div className="text-[11px] font-medium text-[#98a2b3]">
                  {selectedPermission.id}
                </div>

                <h2 className="mt-1 text-lg font-semibold">
                  {selectedPermission.name}
                </h2>

                <p className="mt-1 text-sm text-[#667085]">
                  {selectedPermission.description}
                </p>
              </div>

              <button
                onClick={() => setSelectedPermission(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e1e5eb] text-[#667085] hover:bg-[#f8f9fb]"
              >
                <span className="text-[20px] leading-none">×</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 px-6 py-5">
              <DetailItem
                label="Resource"
                value={selectedPermission.resource}
              />

              <DetailItem
                label="Action"
                value={selectedPermission.action}
              />

              <DetailItem
                label="Scope"
                value={selectedPermission.scope}
              />

              <DetailItem
                label="Role"
                value={selectedPermission.role}
              />

              <DetailItem
                label="Assigned To"
                value={selectedPermission.assignedTo}
              />

              <DetailItem
                label="Users"
                value={selectedPermission.users.toString()}
              />

              <DetailItem
                label="Status"
                value={selectedPermission.status}
              />

              <DetailItem
                label="Last Updated"
                value={selectedPermission.lastUpdated}
              />
            </div>

            <div className="border-t border-[#edf0f3] px-6 py-4">
              <div className="mb-3 rounded-lg bg-[#f8f9fb] p-3 text-xs leading-5 text-[#667085]">
                This permission controls whether the assigned identity can
                perform the configured action against the selected resource
                within the specified environment.
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setSelectedPermission(null)}
                  className="rounded-lg border border-[#dfe3e8] px-4 py-2 text-sm font-medium text-[#344054]"
                >
                  Close
                </button>

                {selectedPermission.status !== "Revoked" && (
                  <button
                    onClick={() =>
                      updateStatus(
                        selectedPermission.id,
                        "Revoked"
                      )
                    }
                    className="rounded-lg border border-[#f04438] px-4 py-2 text-sm font-medium text-[#d92d20]"
                  >
                    Revoke Permission
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-5">
          <div className="w-full max-w-[620px] rounded-2xl border border-[#e1e5eb] bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#edf0f3] px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold">
                  Create Permission
                </h2>

                <p className="mt-1 text-sm text-[#667085]">
                  Create a least-privilege permission for an agent, user, or
                  workflow.
                </p>
              </div>

              <button
                onClick={() => setShowCreate(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e1e5eb] text-[#667085] hover:bg-[#f8f9fb]"
              >
                <span className="text-[20px] leading-none">×</span>
              </button>
            </div>

            <div className="space-y-4 px-6 py-5">
              <FormField label="Permission name">
                <input
                  placeholder="Example: Production API Read"
                  className="h-10 w-full rounded-lg border border-[#dfe3e8] px-3 text-sm outline-none focus:border-[#98a2b3]"
                />
              </FormField>

              <FormField label="Resource">
                <SelectField
                  options={[
                    "Database",
                    "REST API",
                    "Browser",
                    "Computer",
                    "Workflow",
                    "Knowledge Base",
                    "Model",
                  ]}
                />
              </FormField>

              <FormField label="Action">
                <SelectField
                  options={[
                    "Read",
                    "Write",
                    "Execute",
                    "Interact",
                    "Deploy",
                    "Publish",
                    "Send",
                  ]}
                />
              </FormField>

              <FormField label="Scope">
                <SelectField
                  options={[
                    "Production",
                    "Staging",
                    "Development",
                    "Specific resource",
                  ]}
                />
              </FormField>

              <FormField label="Role">
                <SelectField
                  options={[
                    "Administrator",
                    "Engineering",
                    "Data Analyst",
                    "Research Agent",
                    "Browser Agent",
                    "Operations",
                    "Custom Role",
                  ]}
                />
              </FormField>

              <div className="rounded-lg border border-[#e5e7eb] bg-[#fafbfc] p-3 text-xs leading-5 text-[#667085]">
                Use the minimum access required for the selected role. Highly
                sensitive production permissions can also require human
                approval.
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-[#edf0f3] px-6 py-4">
              <button
                onClick={() => setShowCreate(false)}
                className="rounded-lg border border-[#dfe3e8] px-4 py-2 text-sm font-medium text-[#344054]"
              >
                Cancel
              </button>

              <button
                onClick={() => setShowCreate(false)}
                className="rounded-lg bg-[#171a21] px-4 py-2 text-sm font-medium text-white hover:bg-[#282c35]"
              >
                Create Permission
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function MetricCard({
  label,
  value,
  helper,
  icon,
}: {
  label: string;
  value: string;
  helper: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#e1e5eb] bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-[#667085]">{label}</div>

        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f2f4f7] text-[#475467]">
          {icon}
        </div>
      </div>

      <div className="mt-3 text-[25px] font-semibold tracking-[-0.5px]">
        {value}
      </div>

      <div className="mt-1 text-[11px] text-[#98a2b3]">{helper}</div>
    </div>
  );
}

function FilterSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 min-w-[125px] appearance-none rounded-lg border border-[#dfe3e8] bg-white px-3 pr-8 text-xs font-medium text-[#475467] outline-none"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>

      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#667085]"
      />
    </div>
  );
}

function SelectField({
  options,
}: {
  options: string[];
}) {
  return (
    <div className="relative">
      <select className="h-10 w-full appearance-none rounded-lg border border-[#dfe3e8] bg-white px-3 pr-9 text-sm outline-none focus:border-[#98a2b3]">
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>

      <ChevronDown
        size={15}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#667085]"
      />
    </div>
  );
}

function ActionBadge({
  action,
}: {
  action: string;
}) {
  const styles: Record<string, string> = {
    Read: "bg-[#eff8ff] text-[#175cd3]",
    Write: "bg-[#fff4e5] text-[#b54708]",
    Execute: "bg-[#f4f3ff] text-[#5925dc]",
    Interact: "bg-[#ecfdf3] text-[#027a48]",
    Deploy: "bg-[#fdf2fa] text-[#c11574]",
    Send: "bg-[#fef3f2] text-[#b42318]",
    Publish: "bg-[#f2f4f7] text-[#475467]",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
        styles[action] ?? "bg-[#f2f4f7] text-[#475467]"
      }`}
    >
      {action}
    </span>
  );
}

function PermissionStatusBadge({
  status,
}: {
  status: PermissionStatus;
}) {
  const styles: Record<PermissionStatus, string> = {
    Active: "bg-[#ecfdf3] text-[#027a48]",
    Restricted: "bg-[#fff4e5] text-[#b54708]",
    Revoked: "bg-[#fef3f2] text-[#b42318]",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function InfoCard({
  icon,
  title,
  description,
  items,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  items: string[];
}) {
  return (
    <div className="rounded-xl border border-[#e1e5eb] bg-white p-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f2f4f7] text-[#475467]">
        {icon}
      </div>

      <h3 className="mt-4 text-sm font-semibold">{title}</h3>

      <p className="mt-1.5 text-xs leading-5 text-[#667085]">
        {description}
      </p>

      <div className="mt-4 space-y-2">
        {items.map((item) => (
          <div
            key={item}
            className="flex items-center gap-2 text-xs text-[#475467]"
          >
            <CheckCircle2 size={13} className="text-[#12b76a]" />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function ArchitectureStep({
  number,
  title,
  description,
  icon,
}: {
  number: string;
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <div className="p-5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-[#98a2b3]">
          {number}
        </span>

        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f2f4f7] text-[#475467]">
          {icon}
        </div>
      </div>

      <h3 className="mt-5 text-sm font-semibold">{title}</h3>

      <p className="mt-1.5 text-xs leading-5 text-[#667085]">
        {description}
      </p>
    </div>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-[#edf0f3] bg-[#fafbfc] p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-[#98a2b3]">
        {label}
      </div>

      <div className="mt-1 text-sm font-medium text-[#344054]">
        {value}
      </div>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-[#344054]">
        {label}
      </label>

      {children}
    </div>
  );
}