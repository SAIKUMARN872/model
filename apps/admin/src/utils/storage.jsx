"use client";

import React, { useMemo, useState } from "react";

const initialStorageData = [
  {
    id: "storage-001",
    organization: "Acme Corporation",
    used: 68,
    limit: 100,
    files: 12450,
    status: "healthy",
  },
  {
    id: "storage-002",
    organization: "Global Technologies",
    used: 45,
    limit: 100,
    files: 8230,
    status: "healthy",
  },
  {
    id: "storage-003",
    organization: "Startup Labs",
    used: 82,
    limit: 100,
    files: 19680,
    status: "warning",
  },
  {
    id: "storage-004",
    organization: "Enterprise Systems",
    used: 95,
    limit: 100,
    files: 28750,
    status: "critical",
  },
];

const formatNumber = (value) => {
  return new Intl.NumberFormat("en-US").format(value);
};

const getUsagePercentage = (used, limit) => {
  if (!limit) {
    return 0;
  }

  return Math.round((used / limit) * 100);
};

export default function Storage() {
  const [storageData, setStorageData] =
    useState(initialStorageData);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");

  const filteredStorage = useMemo(() => {
    return storageData.filter((item) => {
      const matchesSearch =
        item.organization
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        item.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    storageData,
    search,
    statusFilter,
  ]);

  const totalUsed = storageData.reduce(
    (total, item) => total + item.used,
    0
  );

  const totalLimit = storageData.reduce(
    (total, item) => total + item.limit,
    0
  );

  const totalFiles = storageData.reduce(
    (total, item) => total + item.files,
    0
  );

  const overallUsage = getUsagePercentage(
    totalUsed,
    totalLimit
  );

  const refreshStorage = () => {
    setStorageData((currentData) =>
      currentData.map((item) => ({
        ...item,
        used: Math.min(
          item.limit,
          item.used +
            Math.floor(
              Math.random() * 3
            )
        ),
      }))
    );
  };

  return (
    <main className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Storage
          </h1>

          <p className="page-description">
            Monitor storage consumption,
            capacity, and file usage across
            organizations.
          </p>
        </div>

        <button
          type="button"
          className="storage-refresh-button"
          onClick={refreshStorage}
        >
          Refresh Usage
        </button>
      </div>

      {/* Storage Summary */}
      <section className="storage-summary-grid">
        <div className="card storage-stat-card">
          <span className="storage-stat-label">
            Total Capacity
          </span>

          <strong className="storage-stat-value">
            {formatNumber(totalLimit)} GB
          </strong>
        </div>

        <div className="card storage-stat-card">
          <span className="storage-stat-label">
            Used Storage
          </span>

          <strong className="storage-stat-value">
            {formatNumber(totalUsed)} GB
          </strong>
        </div>

        <div className="card storage-stat-card">
          <span className="storage-stat-label">
            Overall Usage
          </span>

          <strong className="storage-stat-value">
            {overallUsage}%
          </strong>
        </div>

        <div className="card storage-stat-card">
          <span className="storage-stat-label">
            Total Files
          </span>

          <strong className="storage-stat-value">
            {formatNumber(totalFiles)}
          </strong>
        </div>
      </section>

      {/* Filters */}
      <section className="storage-toolbar">
        <input
          type="search"
          placeholder="Search organizations..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          className="storage-search"
        />

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value
            )
          }
          className="storage-filter"
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

          <option value="critical">
            Critical
          </option>
        </select>
      </section>

      {/* Storage Table */}
      <section className="card storage-table-card">
        <div className="storage-table-wrapper">
          <table className="storage-table">
            <thead>
              <tr>
                <th>
                  Organization
                </th>

                <th>
                  Used
                </th>

                <th>
                  Capacity
                </th>

                <th>
                  Usage
                </th>

                <th>
                  Files
                </th>

                <th>
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredStorage.map(
                (item) => {
                  const percentage =
                    getUsagePercentage(
                      item.used,
                      item.limit
                    );

                  return (
                    <tr key={item.id}>
                      <td>
                        <strong>
                          {item.organization}
                        </strong>
                      </td>

                      <td>
                        {item.used} GB
                      </td>

                      <td>
                        {item.limit} GB
                      </td>

                      <td>
                        <div className="storage-progress-wrapper">
                          <div className="storage-progress">
                            <div
                              className={`storage-progress-bar ${item.status}`}
                              style={{
                                width: `${percentage}%`,
                              }}
                            />
                          </div>

                          <span>
                            {percentage}%
                          </span>
                        </div>
                      </td>

                      <td>
                        {formatNumber(
                          item.files
                        )}
                      </td>

                      <td>
                        <span
                          className={`storage-status ${item.status}`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredStorage.length === 0 && (
          <div className="storage-empty-state">
            <h3>
              No storage data found
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