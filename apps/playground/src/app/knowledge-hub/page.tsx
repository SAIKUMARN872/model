
import { useMemo, useRef, useState } from "react";
import {
  Search,
  Upload,
  Link2,
  FileText,
  Globe,
  Trash2,
  RefreshCw,
  Database,
  CheckCircle2,
  Clock3,
  X,
} from "lucide-react";

import "./knowledge-hub.css";

type Source = {
  id: number;
  name: string;
  type: string;
  size: string;
  status: "Ready" | "Processing";
  added: string;
};

export default function KnowledgeHubPage() {
  const fileRef = useRef<HTMLInputElement>(null);

  const [sources, setSources] = useState<Source[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [url, setUrl] = useState("");
  const [showUrl, setShowUrl] = useState(false);

  // Add uploaded documents

  const addFiles = (files: FileList | null) => {
    if (!files) return;

    const accepted = Array.from(files);

    const newSources: Source[] = accepted.map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
      type:
        file.name.split(".").pop()?.toUpperCase() || "FILE",
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      status: "Processing",
      added: new Date().toLocaleDateString(),
    }));

    setSources((old) => [...newSources, ...old]);

    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  // Add website URL

  const addUrl = () => {
    const trimmedUrl = url.trim();

    if (!trimmedUrl) return;

    try {
      const parsedUrl = new URL(trimmedUrl);

      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        return;
      }

      setSources((old) => [
        {
          id: Date.now(),
          name: trimmedUrl,
          type: "URL",
          size: "Web source",
          status: "Processing",
          added: new Date().toLocaleDateString(),
        },
        ...old,
      ]);

      setUrl("");
      setShowUrl(false);
    } catch {
      window.alert("Please enter a valid website URL.");
    }
  };

  // Filter knowledge sources

  const visibleSources = useMemo(() => {
    return sources.filter((source) => {
      const matchesSearch = source.name
        .toLowerCase()
        .includes(search.trim().toLowerCase());

      const matchesFilter =
        filter === "All" || source.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [sources, search, filter]);

  const readyCount = sources.filter(
    (item) => item.status === "Ready"
  ).length;

  const processingCount = sources.filter(
    (item) => item.status === "Processing"
  ).length;

  // Delete source

  const deleteSource = (id: number) => {
    setSources((old) =>
      old.filter((item) => item.id !== id)
    );
  };

  // Refresh source list
  // Backend processing is not connected yet.

  const refreshSources = () => {
    setSources((old) =>
      old.map((item) => ({
        ...item,
      }))
    );
  };

  return (
    <div className="wt-page">

      {/* Knowledge Statistics */}

      <div className="wt-stats">

        <div className="wt-stat">
          <span>Total sources</span>
          <strong>{sources.length}</strong>
          <FileText />
        </div>

        <div className="wt-stat">
          <span>Ready sources</span>
          <strong>{readyCount}</strong>
          <CheckCircle2 />
        </div>

        <div className="wt-stat">
          <span>Processing</span>
          <strong>{processingCount}</strong>
          <Clock3 />
        </div>

      </div>

      {/* Add Knowledge Sources */}

      <section className="wt-panel">

        <div className="wt-panel-heading">
          <div>
            <h2>Add knowledge sources</h2>
            <p>
              Upload files or add a website URL to your workspace.
            </p>
          </div>
        </div>

        <div className="wt-upload-grid">

          {/* Document Upload */}

          <div className="wt-upload-card">

            <div className="wt-upload-icon">
              <Upload />
            </div>

            <h3>Upload documents</h3>

            <p>
              PDF, DOCX, TXT, CSV, JSON and Markdown files
            </p>

            <button
              type="button"
              className="wt-primary"
              onClick={() => fileRef.current?.click()}
            >
              <Upload size={16} />
              Choose files
            </button>

            <input
              ref={fileRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt,.csv,.json,.md"
              hidden
              onChange={(event) =>
                addFiles(event.target.files)
              }
            />

          </div>

          {/* Website Import */}

          <div className="wt-upload-card">

            <div className="wt-upload-icon">
              <Globe />
            </div>

            <h3>Import from website</h3>

            <p>
              Add a website URL as a knowledge source.
            </p>

            <button
              type="button"
              className="wt-secondary"
              onClick={() => setShowUrl(true)}
            >
              <Link2 size={16} />
              Add URL
            </button>

          </div>

        </div>

        {/* URL Input */}

        {showUrl && (
          <div className="wt-inline-form">

            <input
              type="url"
              value={url}
              onChange={(event) =>
                setUrl(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  addUrl();
                }
              }}
              placeholder="https://example.com/documentation"
            />

            <button
              type="button"
              className="wt-primary"
              onClick={addUrl}
            >
              Add source
            </button>

            <button
              type="button"
              className="wt-icon-button"
              onClick={() => {
                setShowUrl(false);
                setUrl("");
              }}
              aria-label="Close URL form"
            >
              <X size={17} />
            </button>

          </div>
        )}

        <p className="wt-note">
          Files and URLs are currently registered in this
          browser only. Backend ingestion is not connected yet.
        </p>

      </section>

      {/* Knowledge Sources List */}

      <section className="wt-panel">

        <div className="wt-panel-heading wt-space-between">

          <div>
            <h2>Knowledge sources</h2>
            <p>
              Manage the sources added to this workspace.
            </p>
          </div>

          <button
            type="button"
            className="wt-secondary"
            onClick={refreshSources}
          >
            <RefreshCw size={15} />
            Refresh
          </button>

        </div>

        {/* Search and Filters */}

        <div className="wt-toolbar">

          <div className="wt-search">
            <Search size={17} />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search sources..."
            />
          </div>

          <select
            value={filter}
            onChange={(event) =>
              setFilter(event.target.value)
            }
            aria-label="Filter knowledge sources"
          >
            <option value="All">All</option>
            <option value="Ready">Ready</option>
            <option value="Processing">Processing</option>
          </select>

        </div>

        {/* Empty State */}

        {visibleSources.length === 0 ? (

          <div className="wt-empty">

            <div className="wt-empty-icon">
              <Database size={25} />
            </div>

            <h3>
              {sources.length
                ? "No matching sources"
                : "No knowledge sources yet"}
            </h3>

            <p>
              {sources.length
                ? "Try another search or filter."
                : "Upload your first document or add a website URL to get started."}
            </p>

          </div>

        ) : (

          /* Sources Table */

          <div className="wt-table-wrap">

            <table className="wt-table">

              <thead>
                <tr>
                  <th>Source</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Added</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>

                {visibleSources.map((source) => (

                  <tr key={source.id}>

                    <td>
                      <div className="wt-source-name">
                        {source.type === "URL" ? (
                          <Globe size={17} />
                        ) : (
                          <FileText size={17} />
                        )}

                        {source.name}
                      </div>
                    </td>

                    <td>{source.type}</td>

                    <td>{source.size}</td>

                    <td>{source.added}</td>

                    <td>
                      <span
                        className={`wt-status ${
                          source.status === "Ready"
                            ? "wt-status-ready"
                            : "wt-status-pending"
                        }`}
                      >
                        {source.status === "Ready" ? (
                          <CheckCircle2 size={13} />
                        ) : (
                          <Clock3 size={13} />
                        )}

                        {source.status}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="wt-icon-button wt-danger"
                        title="Delete source"
                        aria-label="Delete source"
                        onClick={() =>
                          deleteSource(source.id)
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </div>
  );
}
