"use client";

import React, { useMemo, useState } from "react";

const initialTeams = [
  {
    id: "team-001",
    name: "Engineering",
    description: "Product development and engineering team",
    members: 12,
    status: "active",
    createdAt: "2026-01-15",
  },
  {
    id: "team-002",
    name: "Product",
    description: "Product strategy and management",
    members: 6,
    status: "active",
    createdAt: "2026-02-10",
  },
  {
    id: "team-003",
    name: "Security",
    description: "Security, compliance, and risk management",
    members: 5,
    status: "active",
    createdAt: "2026-03-02",
  },
];

export default function Teams() {
  const [teams, setTeams] = useState(initialTeams);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        team.name.toLowerCase().includes(searchValue) ||
        team.description.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "all" ||
        team.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [teams, search, statusFilter]);

  const createTeam = () => {
    const newTeam = {
      id: `team-${Date.now()}`,
      name: "New Team",
      description: "Newly created team",
      members: 0,
      status: "active",
      createdAt: new Date().toISOString(),
    };

    setTeams((currentTeams) => [
      ...currentTeams,
      newTeam,
    ]);
  };

  const toggleStatus = (teamId) => {
    setTeams((currentTeams) =>
      currentTeams.map((team) =>
        team.id === teamId
          ? {
              ...team,
              status:
                team.status === "active"
                  ? "inactive"
                  : "active",
            }
          : team
      )
    );
  };

  const deleteTeam = (teamId) => {
    setTeams((currentTeams) =>
      currentTeams.filter(
        (team) => team.id !== teamId
      )
    );
  };

  return (
    <main className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Teams
          </h1>

          <p className="page-description">
            Manage teams, members, and team access.
          </p>
        </div>

        <button
          type="button"
          onClick={createTeam}
          className="team-primary-button"
        >
          + Create Team
        </button>
      </div>

      {/* Search and Filter */}
      <section className="team-toolbar">
        <input
          type="search"
          placeholder="Search teams..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          className="team-search"
        />

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
          className="team-filter"
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
      </section>

      {/* Teams Grid */}
      <section className="team-grid">
        {filteredTeams.map((team) => (
          <article
            key={team.id}
            className="card team-card"
          >
            <div className="team-card-header">
              <div>
                <h2>{team.name}</h2>

                <span
                  className={`team-status ${team.status}`}
                >
                  {team.status}
                </span>
              </div>
            </div>

            <p className="team-description">
              {team.description}
            </p>

            <div className="team-meta">
              <span>
                Members:{" "}
                <strong>
                  {team.members}
                </strong>
              </span>

              <span>
                Created:{" "}
                {new Date(
                  team.createdAt
                ).toLocaleDateString()}
              </span>
            </div>

            <div className="team-actions">
              <button
                type="button"
                onClick={() =>
                  toggleStatus(team.id)
                }
              >
                {team.status === "active"
                  ? "Deactivate"
                  : "Activate"}
              </button>

              <button
                type="button"
                onClick={() =>
                  deleteTeam(team.id)
                }
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </section>

      {/* Empty State */}
      {filteredTeams.length === 0 && (
        <div className="card team-empty-state">
          <h3>No teams found</h3>

          <p>
            Try changing your search or filter.
          </p>
        </div>
      )}
    </main>
  );
}
