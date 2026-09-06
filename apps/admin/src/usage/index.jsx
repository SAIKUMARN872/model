"use client";

import React, { useMemo, useState } from "react";

const usageData = [
  {
    id: "usage-001",
    organization: "Acme Corporation",
    users: 124,
    apiRequests: 125430,
    storage: 68,
    aiTokens: 2450000,
    status: "healthy",
  },
  {
    id: "usage-002",
    organization: "Global Technologies",
    users: 86,
    apiRequests: 98420,
    storage: 45,
    aiTokens: 1870000,
    status: "healthy",
  },
  {
    id: "usage-003",
    organization: "Startup Labs",
    users: 32,
    apiRequests: 45210,
    storage: 82,
    aiTokens: 920000,
    status: "warning",
  },
];

const formatNumber = (number) => {
  return new Intl.NumberFormat("en-US").format(number);
};

const formatTokens = (tokens) => {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(1)}M`;
  }

  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K`;
  }

  return formatNumber(tokens);
};

export default function Usage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredUsage = useMemo(() => {
    return usageData.filter((item) => {
      const matchesSearch = item.organization
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const totalUsers = usageData.reduce(
    (total, item) => total + item.users,
    0
  );

  const totalApiRequests = usageData.reduce(
    (total, item) => total + item.apiRequests,
    0
  );

  const totalTokens = usageData.reduce(
    (total, item) => total + item.aiTokens,
    0
  );

  const averageStorage =
    usageData.reduce(
      (total, item) => total + item.storage,
      0
    ) / usageData.length;

  return (
    <main className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Usage
          </h1>

          <p className="page-description">
            Monitor platform usage, API activity,
            storage, and AI consumption.
          </p>
        </div>
      </div>

      {/* Usage Summary */}
      <section className="usage-summary-grid">
        <div className="card usage-stat-card">
          <span className="usage-stat-label">
            Total Users
          </span>

          <strong className="usage-stat-value">
            {formatNumber(totalUsers)}
          </strong>
        </div>

        <div className="card usage-stat-card">
          <span className="usage-stat-label">
            API Requests
          </span>

          <strong className="usage-stat-value">
            {formatNumber(totalApiRequests)}
          </strong>
        </div>

        <div className="card usage-stat-card">
          <span className="usage-stat-label">
            AI Tokens
          </span>

          <strong className="usage-stat-value">
            {formatTokens(totalTokens)}
          </strong>
        </div>

        <div className="card usage-stat-card">
          <span className="usage-stat-label">
            Average Storage
          </span>

          <strong className="usage-stat-value">
            {averageStorage.toFixed(1)}%
          </strong>
        </div>
      </section>

      {/* Filters */}
      <section className="usage-toolbar">
        <input
          type="search"
          placeholder="Search organizations..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          className="usage-search"
        />

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
          className="usage-filter"
        >
          <option value="all">
            All Statuses
          </option>

          <option value="healthy">
            Healthy
          </option>

          <option value="warning">
            Warning
          </option>
        </select>
      </section>

      {/* Usage Table */}
      <section className="card usage-table-card">
        <div className="usage-table-wrapper">
          <table className="usage-table">
            <thead>
              <tr>
                <th>Organization</th>
                <th>Users</th>
                <th>API Requests</th>
                <th>Storage</th>
                <th>AI Tokens</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsage.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>
                      {item.organization}
                    </strong>
                  </td>

                  <td>
                    {formatNumber(item.users)}
                  </td>

                  <td>
                    {formatNumber(
                      item.apiRequests
                    )}
                  </td>

                  <td>
                    <div className="usage-progress-container">
                      <div className="usage-progress">
                        <div
                          className="usage-progress-bar"
                          style={{
                            width: `${item.storage}%`,
                          }}
                        />
                      </div>

                      <span>
                        {item.storage}%
                      </span>
                    </div>
                  </td>

                  <td>
                    {formatTokens(
                      item.aiTokens
                    )}
                  </td>

                  <td>
                    <span
                      className={`usage-status ${item.status}`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredUsage.length === 0 && (
          <div className="usage-empty-state">
            <h3>
              No usage data found
            </h3>

            <p>
              Try changing your search or filter.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}