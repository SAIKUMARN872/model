"use client";

import React, { useMemo, useState } from "react";

const initialUsers = [
  {
    id: "user-001",
    name: "John Smith",
    email: "john.smith@example.com",
    role: "admin",
    status: "active",
    team: "Engineering",
    lastActive: "2026-07-20",
  },
  {
    id: "user-002",
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    role: "manager",
    status: "active",
    team: "Product",
    lastActive: "2026-07-21",
  },
  {
    id: "user-003",
    name: "Michael Brown",
    email: "michael.brown@example.com",
    role: "viewer",
    status: "inactive",
    team: "Security",
    lastActive: "2026-07-10",
  },
  {
    id: "user-004",
    name: "Emily Davis",
    email: "emily.davis@example.com",
    role: "auditor",
    status: "active",
    team: "Compliance",
    lastActive: "2026-07-22",
  },
];

export default function Users() {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        user.name
          .toLowerCase()
          .includes(searchValue) ||
        user.email
          .toLowerCase()
          .includes(searchValue) ||
        user.team
          .toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        statusFilter === "all" ||
        user.status === statusFilter;

      const matchesRole =
        roleFilter === "all" ||
        user.role === roleFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesRole
      );
    });
  }, [
    users,
    search,
    statusFilter,
    roleFilter,
  ]);

  const toggleUserStatus = (userId) => {
    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.id === userId
          ? {
              ...user,
              status:
                user.status === "active"
                  ? "inactive"
                  : "active",
            }
          : user
      )
    );
  };

  const deleteUser = (userId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmed) {
      return;
    }

    setUsers((currentUsers) =>
      currentUsers.filter(
        (user) => user.id !== userId
      )
    );
  };

  const createUser = () => {
    const newUser = {
      id: `user-${Date.now()}`,
      name: "New User",
      email: "new.user@example.com",
      role: "viewer",
      status: "active",
      team: "Unassigned",
      lastActive: new Date()
        .toISOString()
        .split("T")[0],
    };

    setUsers((currentUsers) => [
      ...currentUsers,
      newUser,
    ]);
  };

  return (
    <main className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Users
          </h1>

          <p className="page-description">
            Manage users, roles, teams, and
            account access.
          </p>
        </div>

        <button
          type="button"
          className="team-primary-button"
          onClick={createUser}
        >
          + Create User
        </button>
      </div>

      {/* User Statistics */}
      <section className="users-summary-grid">
        <div className="card users-stat-card">
          <span>
            Total Users
          </span>

          <strong>
            {users.length}
          </strong>
        </div>

        <div className="card users-stat-card">
          <span>
            Active Users
          </span>

          <strong>
            {
              users.filter(
                (user) =>
                  user.status === "active"
              ).length
            }
          </strong>
        </div>

        <div className="card users-stat-card">
          <span>
            Inactive Users
          </span>

          <strong>
            {
              users.filter(
                (user) =>
                  user.status === "inactive"
              ).length
            }
          </strong>
        </div>

        <div className="card users-stat-card">
          <span>
            Administrators
          </span>

          <strong>
            {
              users.filter(
                (user) =>
                  user.role === "admin"
              ).length
            }
          </strong>
        </div>
      </section>

      {/* Filters */}
      <section className="users-toolbar">
        <input
          type="search"
          placeholder="Search users..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          className="users-search"
        />

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value
            )
          }
          className="users-filter"
        >
          <option value="all">
            All Statuses
          </option>

          <option value="active">
            Active
          </option>

          <option value="inactive">
            Inactive
          </option>
        </select>

        <select
          value={roleFilter}
          onChange={(event) =>
            setRoleFilter(
              event.target.value
            )
          }
          className="users-filter"
        >
          <option value="all">
            All Roles
          </option>

          <option value="admin">
            Admin
          </option>

          <option value="manager">
            Manager
          </option>

          <option value="auditor">
            Auditor
          </option>

          <option value="viewer">
            Viewer
          </option>
        </select>
      </section>

      {/* Users Table */}
      <section className="card users-table-card">
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Team</th>
                <th>Status</th>
                <th>Last Active</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">
                        {user.name
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <strong>
                          {user.name}
                        </strong>

                        <span>
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="user-role">
                      {user.role}
                    </span>
                  </td>

                  <td>
                    {user.team}
                  </td>

                  <td>
                    <span
                      className={`user-status ${user.status}`}
                    >
                      {user.status}
                    </span>
                  </td>

                  <td>
                    {new Date(
                      user.lastActive
                    ).toLocaleDateString()}
                  </td>

                  <td>
                    <div className="user-actions">
                      <button
                        type="button"
                        onClick={() =>
                          toggleUserStatus(
                            user.id
                          )
                        }
                      >
                        {user.status ===
                        "active"
                          ? "Deactivate"
                          : "Activate"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteUser(user.id)
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="users-empty-state">
            <h3>
              No users found
            </h3>

            <p>
              Try changing your search or
              filters.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}