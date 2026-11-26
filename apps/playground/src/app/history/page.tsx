
import { useMemo, useState } from "react";
import {
  Search,
  History,
  Trash2,
  Download,
  Eye,
  X,
  Clock3,
  CheckCircle2,
  XCircle,
  Filter,
  FileText,
  Bot,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import {
  clearPlaygroundHistory,
  deletePlaygroundHistory,
  getPlaygroundHistory,
  type PlaygroundHistoryEntry,
} from "../../services/playgroundHistory";

import "./history.css";

type FilterValue = "all" | "success" | "failed";

export default function HistoryPage() {
  const [history, setHistory] = useState<PlaygroundHistoryEntry[]>(
    () => getPlaygroundHistory()
  );

  const [search, setSearch] = useState("");
  const [featureFilter, setFeatureFilter] = useState("all");
  const [statusFilter, setStatusFilter] =
    useState<FilterValue>("all");

  const [selectedEntry, setSelectedEntry] =
    useState<PlaygroundHistoryEntry | null>(null);

  const features = useMemo(
    () =>
      [...new Set(history.map((item) => item.feature))].sort(),
    [history]
  );

  const filteredHistory = useMemo(() => {
    const query = search.trim().toLowerCase();

    return history.filter((item) => {
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.feature.toLowerCase().includes(query) ||
        (item.model || "").toLowerCase().includes(query) ||
        (item.prompt || "").toLowerCase().includes(query);

      const matchesFeature =
        featureFilter === "all" ||
        item.feature === featureFilter;

      const matchesStatus =
        statusFilter === "all" ||
        item.status === statusFilter;

      return (
        matchesSearch &&
        matchesFeature &&
        matchesStatus
      );
    });
  }, [history, search, featureFilter, statusFilter]);

  const successCount = history.filter(
    (item) => item.status === "success"
  ).length;

  const failedCount = history.filter(
    (item) => item.status === "failed"
  ).length;

  function refreshHistory() {
    setHistory(getPlaygroundHistory());
  }

  function handleDelete(id: string) {
    deletePlaygroundHistory(id);
    setHistory(getPlaygroundHistory());

    if (selectedEntry?.id === id) {
      setSelectedEntry(null);
    }
  }

  function handleClear() {
    if (!history.length) return;

    const confirmed = window.confirm(
      "Are you sure you want to clear all Playground history?"
    );

    if (!confirmed) return;

    clearPlaygroundHistory();
    setHistory([]);
    setSelectedEntry(null);
  }

  function handleExport() {
    const data = JSON.stringify(
      filteredHistory,
      null,
      2
    );

    const blob = new Blob(
      [data],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "modelnow-playground-history.json";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  function formatDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Unknown date";
    }

    return date.toLocaleString();
  }

  function resetFilters() {
    setSearch("");
    setFeatureFilter("all");
    setStatusFilter("all");
  }

  return (
    <div className="ph-page">

      {/* History Statistics */}

      <div className="ph-stats">

        <div className="ph-stat-card">
          <div className="ph-stat-icon">
            <History size={18} />
          </div>

          <div>
            <span>Total runs</span>
            <strong>{history.length}</strong>
          </div>
        </div>

        <div className="ph-stat-card">
          <div className="ph-stat-icon ph-success-icon">
            <CheckCircle2 size={18} />
          </div>

          <div>
            <span>Successful</span>
            <strong>{successCount}</strong>
          </div>
        </div>

        <div className="ph-stat-card">
          <div className="ph-stat-icon ph-failed-icon">
            <XCircle size={18} />
          </div>

          <div>
            <span>Failed</span>
            <strong>{failedCount}</strong>
          </div>
        </div>

        <div className="ph-stat-card">
          <div className="ph-stat-icon">
            <Filter size={18} />
          </div>

          <div>
            <span>Features used</span>
            <strong>{features.length}</strong>
          </div>
        </div>

      </div>

      {/* Toolbar */}

      <div className="ph-toolbar">

        <div className="ph-search">
          <Search size={17} />

          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search tests, models, prompts..."
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <select
          value={featureFilter}
          onChange={(event) =>
            setFeatureFilter(event.target.value)
          }
          aria-label="Filter by feature"
        >
          <option value="all">All features</option>

          {features.map((feature) => (
            <option value={feature} key={feature}>
              {feature}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value as FilterValue
            )
          }
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          <option value="success">Successful</option>
          <option value="failed">Failed</option>
        </select>

        <button
          type="button"
          className="ph-button ph-secondary"
          onClick={refreshHistory}
          title="Refresh history"
        >
          <RefreshCw size={15} />
          Refresh
        </button>

        <button
          type="button"
          className="ph-button ph-secondary"
          onClick={handleExport}
          disabled={!filteredHistory.length}
        >
          <Download size={15} />
          Export
        </button>

        <button
          type="button"
          className="ph-button ph-danger"
          onClick={handleClear}
          disabled={!history.length}
        >
          <Trash2 size={15} />
          Clear
        </button>

      </div>

      {/* Main Content */}

      <div className="ph-content">

        <div className="ph-list-panel">

          <div className="ph-list-heading">
            <div>
              <h2>Test activity</h2>
              <span>
                {filteredHistory.length} results
              </span>
            </div>
          </div>

          {/* Empty State */}

          {filteredHistory.length === 0 ? (

            <div className="ph-empty">

              <div className="ph-empty-icon">
                {history.length === 0 ? (
                  <History size={27} />
                ) : (
                  <Search size={27} />
                )}
              </div>

              <h3>
                {history.length === 0
                  ? "No history yet"
                  : "No matching results"}
              </h3>

              <p>
                {history.length === 0
                  ? "Your Playground test runs will appear here when a feature saves its results."
                  : "Try changing your search or filters."}
              </p>

              {history.length > 0 && (
                <button
                  type="button"
                  className="ph-button ph-secondary"
                  onClick={resetFilters}
                >
                  Reset filters
                </button>
              )}

            </div>

          ) : (

            /* History Entries */

            <div className="ph-entries">

              {filteredHistory.map((item) => (

                <div
                  className={`ph-entry ${
                    selectedEntry?.id === item.id
                      ? "ph-entry-selected"
                      : ""
                  }`}
                  key={item.id}
                >

                  <div className="ph-entry-icon">
                    <Bot size={19} />
                  </div>

                  <div className="ph-entry-main">

                    <div className="ph-entry-title-row">

                      <h3>{item.title}</h3>

                      <span
                        className={`ph-status ${
                          item.status === "success"
                            ? "ph-status-success"
                            : "ph-status-failed"
                        }`}
                      >
                        {item.status === "success" ? (
                          <CheckCircle2 size={13} />
                        ) : (
                          <XCircle size={13} />
                        )}

                        {item.status}
                      </span>

                    </div>

                    <div className="ph-entry-meta">

                      <span>
                        <FileText size={13} />
                        {item.feature}
                      </span>

                      {item.model && (
                        <span>
                          <Bot size={13} />
                          {item.model}
                        </span>
                      )}

                      <span>
                        <Clock3 size={13} />
                        {formatDate(item.createdAt)}
                      </span>

                      {typeof item.duration === "number" && (
                        <span>
                          {item.duration.toFixed(0)} ms
                        </span>
                      )}

                    </div>

                    {item.prompt && (
                      <p className="ph-prompt-preview">
                        {item.prompt}
                      </p>
                    )}

                  </div>

                  <div className="ph-entry-actions">

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedEntry(item)
                      }
                      title="View details"
                      aria-label="View details"
                    >
                      <Eye size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(item.id)
                      }
                      title="Delete"
                      aria-label="Delete history item"
                    >
                      <Trash2 size={16} />
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

        {/* Execution Details */}

        {selectedEntry && (

          <aside className="ph-detail-panel">

            <div className="ph-detail-header">

              <div>
                <span>RUN DETAILS</span>
                <h2>Execution details</h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEntry(null)}
                aria-label="Close details"
              >
                <X size={18} />
              </button>

            </div>

            <div className="ph-detail-body">

              <div className="ph-detail-field">
                <label>Test name</label>
                <p>{selectedEntry.title}</p>
              </div>

              <div className="ph-detail-field">
                <label>Feature</label>
                <p>{selectedEntry.feature}</p>
              </div>

              <div className="ph-detail-field">
                <label>Status</label>

                <p
                  className={
                    selectedEntry.status === "success"
                      ? "ph-detail-success"
                      : "ph-detail-failed"
                  }
                >
                  {selectedEntry.status === "success" ? (
                    <CheckCircle2 size={14} />
                  ) : (
                    <AlertCircle size={14} />
                  )}

                  {selectedEntry.status}
                </p>
              </div>

              <div className="ph-detail-field">
                <label>Model</label>
                <p>
                  {selectedEntry.model || "Not specified"}
                </p>
              </div>

              <div className="ph-detail-field">
                <label>Execution time</label>
                <p>
                  {typeof selectedEntry.duration === "number"
                    ? `${selectedEntry.duration.toFixed(2)} ms`
                    : "Not recorded"}
                </p>
              </div>

              <div className="ph-detail-field">
                <label>Created at</label>
                <p>
                  {formatDate(selectedEntry.createdAt)}
                </p>
              </div>

              <div className="ph-detail-field">
                <label>Prompt / Input</label>
                <pre>
                  {selectedEntry.prompt ||
                    "No prompt recorded."}
                </pre>
              </div>

              <div className="ph-detail-field">
                <label>Response / Output</label>
                <pre>
                  {selectedEntry.response ||
                    "No response recorded."}
                </pre>
              </div>

            </div>

          </aside>

        )}

      </div>

    </div>
  );
}
