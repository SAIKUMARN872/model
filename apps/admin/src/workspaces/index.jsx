"use client";

import React, { useMemo, useState } from "react";

const initialWorkspaces = [
  {
    id: "workspace-001",
    name: "Engineering",
    organization: "Acme Corporation",
    owner: "John Smith",
    members: 24,
    status: "active",
    createdAt: "2026-01-15",
  },
  {
    id: "workspace-002",
    name: "Product Development",
    organization: "Global Technologies",
    owner: "Sarah Johnson",
    members: 18,
    status: "active",
    createdAt: "2026-02-10",
  },
  {
    id: "workspace-003",
    name: "Security Operations",
    organization: "Startup Labs",
    owner: "Michael Brown",
    members: 9,
    status: "archived",
    createdAt: "2026-03-05",
  },
  {
    id: "workspace-004",
    name: "Compliance",
    organization: "Enterprise Systems",
    owner: "Emily Davis",
    members: 12,
    status: "active",
    createdAt: "2026-04-20",
  },
];

const formatDate = (date) => {
  if (!date) {
    return "—";
  }

  return new Date(date).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );
};

export default function Workspaces() {
  const [workspaces, setWorkspaces] =
    useState(initialWorkspaces);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");

  const filteredWorkspaces = useMemo(() => {
    return workspaces.filter((workspace) => {
      const searchValue =
        search.toLowerCase();

      const matchesSearch =
        workspace.name
          .toLowerCase()
          .includes(searchValue) ||
        workspace.organization
          .toLowerCase()
          .includes(searchValue) ||
        workspace.owner
          .toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        statusFilter === "all" ||
        workspace.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    workspaces,
    search,
    statusFilter,
  ]);

  const createWorkspace = () => {
    const newWorkspace = {
      id: `workspace-${Date.now()}`,
      name: "New Workspace",
      organization: "Unassigned",
      owner: "Unassigned",
      members: 0,
      status: "active",
      createdAt: new Date()
        .toISOString()
        .split("T")[0],
    };

    setWorkspaces((current) => [
      ...current,
      newWorkspace,
    ]);
  };

  const toggleWorkspaceStatus = (
    workspaceId
  ) => {
    setWorkspaces((current) =>
      current.map((workspace) =>
        workspace.id === workspaceId
          ? {
              ...workspace,
              status:
                workspace.status ===
                "active"
                  ? "archived"
                  : "active",
            }
          : workspace
      )
    );
  };

  const deleteWorkspace = (
    workspaceId
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this workspace?"
      );

    if (!confirmed) {
      return;
    }

    setWorkspaces((current) =>
      current.filter(
        (workspace) =>
          workspace.id !== workspaceId
      )
    );
  };

  const totalMembers = workspaces.reduce(
    (total, workspace) =>
      total + workspace.members,
    0
  );

  const activeWorkspaces =
    workspaces.filter(
      (workspace) =>
        workspace.status === "active"
    ).length;

  const archivedWorkspaces =
    workspaces.filter(
      (workspace) =>
        workspace.status === "archived"
    ).length;

  return (
    <main className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Workspaces
          </h1>

          <p className="page-description">
            Create and manage workspaces,
            members, owners, and workspace
            access.
          </p>
        </div>

        <button
          type="button"
          className="workspace-primary-button"
          onClick={createWorkspace}
        >
          + Create Workspace
        </button>
      </div>

      {/* Workspace Statistics */}
      <section className="workspace-summary-grid">
        <div className="card workspace-stat-card">
          <span>
            Total Workspaces
          </span>

          <strong>
            {workspaces.length}
          </strong>
        </div>

        <div className="card workspace-stat-card">
          <span>
            Active Workspaces
          </span>

          <strong>
            {activeWorkspaces}
          </strong>
        </div>

        <div className="card workspace-stat-card">
          <span>
            Archived
          </span>

          <strong>
            {archivedWorkspaces}
          </strong>
        </div>

        <div className="card workspace-stat-card">
          <span>
            Total Members
          </span>

          <strong>
            {totalMembers}
          </strong>
        </div>
      </section>

      {/* Filters */}
      <section className="workspace-toolbar">
        <input
          type="search"
          placeholder="Search workspaces..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          className="workspace-search"
        />

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value
            )
          }
          className="workspace-filter"
        >
          <option value="all">
            All Statuses
          </option>

          <option value="active">
            Active
          </option>

          <option value="archived">
            Archived
          </option>
        </select>
      </section>

      {/* Workspace Table */}
      <section className="card workspace-table-card">
        <div className="workspace-table-wrapper">
          <table className="workspace-table">
            <thead>
              <tr>
                <th>
                  Workspace
                </th>

                <th>
                  Organization
                </th>

                <th>
                  Owner
                </th>

                <th>
                  Members
                </th>

                <th>
                  Status
                </th>

                <th>
                  Created
                </th>

                <th>
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredWorkspaces.map(
                (workspace) => (
                  <tr
                    key={workspace.id}
                  >
                    <td>
                      <div className="workspace-name">
                        <div className="workspace-icon">
                          {workspace.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <strong>
                          {workspace.name}
                        </strong>
                      </div>
                    </td>

                    <td>
                      {
                        workspace.organization
                      }
                    </td>

                    <td>
                      {workspace.owner}
                    </td>

                    <td>
                      {workspace.members}
                    </td>

                    <td>
                      <span
                        className={`workspace-status ${workspace.status}`}
                      >
                        {
                          workspace.status
                        }
                      </span>
                    </td>

                    <td>
                      {formatDate(
                        workspace.createdAt
                      )}
                    </td>

                    <td>
                      <div className="workspace-actions">
                        <button
                          type="button"
                          onClick={() =>
                            toggleWorkspaceStatus(
                              workspace.id
                            )
                          }
                        >
                          {workspace.status ===
                          "active"
                            ? "Archive"
                            : "Restore"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteWorkspace(
                              workspace.id
                            )
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredWorkspaces.length ===
          0 && (
          <div className="workspace-empty-state">
            <h3>
              No workspaces found
            </h3>

            <p>
              Try changing your search or
              status filter.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}