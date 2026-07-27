import React, { useMemo, useState } from "react";

const initialKnowledgeSources = [
  {
    id: 1,
    name: "Company Documentation",
    type: "Documentation",
    description:
      "Internal product and engineering documentation.",
    documents: 124,
    status: "Indexed",
    lastUpdated: "2026-07-20",
    size: "248 MB",
  },
  {
    id: 2,
    name: "Support Knowledge Base",
    type: "Knowledge Base",
    description:
      "Customer support articles, FAQs, and troubleshooting guides.",
    documents: 86,
    status: "Indexed",
    lastUpdated: "2026-07-19",
    size: "142 MB",
  },
  {
    id: 3,
    name: "Product Manuals",
    type: "Documents",
    description:
      "Product manuals and technical reference documents.",
    documents: 53,
    status: "Indexing",
    lastUpdated: "2026-07-18",
    size: "386 MB",
  },
  {
    id: 4,
    name: "Engineering Wiki",
    type: "Wiki",
    description:
      "Engineering architecture, processes, and technical knowledge.",
    documents: 215,
    status: "Indexed",
    lastUpdated: "2026-07-17",
    size: "512 MB",
  },
];

const initialDocuments = [
  {
    id: 1,
    name: "Platform Architecture.pdf",
    source: "Company Documentation",
    type: "PDF",
    status: "Indexed",
    chunks: 142,
    updatedAt: "2026-07-20",
  },
  {
    id: 2,
    name: "API Reference.md",
    source: "Engineering Wiki",
    type: "Markdown",
    status: "Indexed",
    chunks: 86,
    updatedAt: "2026-07-19",
  },
  {
    id: 3,
    name: "Troubleshooting Guide.docx",
    source: "Support Knowledge Base",
    type: "DOCX",
    status: "Indexed",
    chunks: 64,
    updatedAt: "2026-07-18",
  },
  {
    id: 4,
    name: "Security Policies.pdf",
    source: "Company Documentation",
    type: "PDF",
    status: "Processing",
    chunks: 0,
    updatedAt: "2026-07-18",
  },
];

export default function Knowledge() {
  const [sources, setSources] = useState(
    initialKnowledgeSources
  );

  const [documents, setDocuments] =
    useState(initialDocuments);

  const [search, setSearch] = useState("");

  const [sourceFilter, setSourceFilter] =
    useState("All");

  const [showSourceForm, setShowSourceForm] =
    useState(false);

  const [showUploadForm, setShowUploadForm] =
    useState(false);

  const [newSource, setNewSource] = useState({
    name: "",
    type: "Documentation",
    description: "",
  });

  const [newDocument, setNewDocument] =
    useState({
      name: "",
      source: "Company Documentation",
      type: "PDF",
    });

  const filteredDocuments = useMemo(() => {
    const searchValue = search
      .toLowerCase()
      .trim();

    return documents.filter((document) => {
      const matchesSearch =
        document.name
          .toLowerCase()
          .includes(searchValue) ||
        document.source
          .toLowerCase()
          .includes(searchValue);

      const matchesSource =
        sourceFilter === "All" ||
        document.source === sourceFilter;

      return (
        matchesSearch &&
        matchesSource
      );
    });
  }, [
    documents,
    search,
    sourceFilter,
  ]);

  const totalDocuments = sources.reduce(
    (total, source) =>
      total + source.documents,
    0
  );

  const indexedSources = sources.filter(
    (source) =>
      source.status === "Indexed"
  ).length;

  const processingDocuments =
    documents.filter(
      (document) =>
        document.status === "Processing"
    ).length;

  const createSource = (event) => {
    event.preventDefault();

    if (!newSource.name.trim()) {
      return;
    }

    const source = {
      id: Date.now(),
      name: newSource.name,
      type: newSource.type,
      description:
        newSource.description ||
        "No description provided.",
      documents: 0,
      status: "Indexed",
      lastUpdated: new Date()
        .toISOString()
        .split("T")[0],
      size: "0 MB",
    };

    setSources((current) => [
      source,
      ...current,
    ]);

    setNewSource({
      name: "",
      type: "Documentation",
      description: "",
    });

    setShowSourceForm(false);
  };

  const uploadDocument = (event) => {
    event.preventDefault();

    if (!newDocument.name.trim()) {
      return;
    }

    const document = {
      id: Date.now(),
      name: newDocument.name,
      source: newDocument.source,
      type: newDocument.type,
      status: "Processing",
      chunks: 0,
      updatedAt: new Date()
        .toISOString()
        .split("T")[0],
    };

    setDocuments((current) => [
      document,
      ...current,
    ]);

    setSources((current) =>
      current.map((source) =>
        source.name ===
        newDocument.source
          ? {
              ...source,
              documents:
                source.documents + 1,
              status: "Indexing",
            }
          : source
      )
    );

    setNewDocument({
      name: "",
      source:
        sources[0]?.name ||
        "Company Documentation",
      type: "PDF",
    });

    setShowUploadForm(false);
  };

  const reindexDocument = (id) => {
    setDocuments((current) =>
      current.map((document) =>
        document.id === id
          ? {
              ...document,
              status: "Processing",
            }
          : document
      )
    );

    setTimeout(() => {
      setDocuments((current) =>
        current.map((document) =>
          document.id === id
            ? {
                ...document,
                status: "Indexed",
                chunks:
                  document.chunks ||
                  Math.floor(
                    Math.random() * 100
                  ) + 20,
                updatedAt: new Date()
                  .toISOString()
                  .split("T")[0],
              }
            : document
        )
      );
    }, 1000);
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>
            Knowledge
          </h1>

          <p style={styles.subtitle}>
            Manage knowledge sources, documents,
            indexing, and AI-ready content.
          </p>
        </div>

        <div style={styles.headerActions}>
          <button
            type="button"
            onClick={() =>
              setShowSourceForm(
                !showSourceForm
              )
            }
            style={styles.secondaryButton}
          >
            + Add Source
          </button>

          <button
            type="button"
            onClick={() =>
              setShowUploadForm(
                !showUploadForm
              )
            }
            style={styles.primaryButton}
          >
            Upload Document
          </button>
        </div>
      </header>

      {/* Statistics */}
      <section style={styles.statsGrid}>
        <StatCard
          title="Knowledge Sources"
          value={sources.length}
          description="Configured sources"
        />

        <StatCard
          title="Total Documents"
          value={totalDocuments}
          description="Documents across all sources"
        />

        <StatCard
          title="Indexed Sources"
          value={indexedSources}
          description="Ready for AI retrieval"
        />

        <StatCard
          title="Processing"
          value={processingDocuments}
          description="Documents being indexed"
        />
      </section>

      {/* Add Source Form */}
      {showSourceForm && (
        <section style={styles.formCard}>
          <h2 style={styles.sectionTitle}>
            Add Knowledge Source
          </h2>

          <form onSubmit={createSource}>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Source Name
                </label>

                <input
                  value={newSource.name}
                  onChange={(event) =>
                    setNewSource({
                      ...newSource,
                      name:
                        event.target.value,
                    })
                  }
                  placeholder="Example: HR Documentation"
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Source Type
                </label>

                <select
                  value={newSource.type}
                  onChange={(event) =>
                    setNewSource({
                      ...newSource,
                      type:
                        event.target.value,
                    })
                  }
                  style={styles.input}
                >
                  <option>
                    Documentation
                  </option>

                  <option>
                    Knowledge Base
                  </option>

                  <option>
                    Documents
                  </option>

                  <option>
                    Wiki
                  </option>

                  <option>
                    Database
                  </option>
                </select>
              </div>

              <div
                style={{
                  ...styles.formGroup,
                  gridColumn: "1 / -1",
                }}
              >
                <label style={styles.label}>
                  Description
                </label>

                <textarea
                  value={
                    newSource.description
                  }
                  onChange={(event) =>
                    setNewSource({
                      ...newSource,
                      description:
                        event.target.value,
                    })
                  }
                  placeholder="Describe this knowledge source..."
                  rows="3"
                  style={styles.textarea}
                />
              </div>
            </div>

            <div style={styles.formActions}>
              <button
                type="button"
                onClick={() =>
                  setShowSourceForm(false)
                }
                style={
                  styles.secondaryButton
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                style={styles.primaryButton}
              >
                Create Source
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Upload Document Form */}
      {showUploadForm && (
        <section style={styles.formCard}>
          <h2 style={styles.sectionTitle}>
            Upload Knowledge Document
          </h2>

          <form
            onSubmit={uploadDocument}
          >
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Document Name
                </label>

                <input
                  value={
                    newDocument.name
                  }
                  onChange={(event) =>
                    setNewDocument({
                      ...newDocument,
                      name:
                        event.target.value,
                    })
                  }
                  placeholder="Example: Security Guide.pdf"
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Knowledge Source
                </label>

                <select
                  value={
                    newDocument.source
                  }
                  onChange={(event) =>
                    setNewDocument({
                      ...newDocument,
                      source:
                        event.target.value,
                    })
                  }
                  style={styles.input}
                >
                  {sources.map(
                    (source) => (
                      <option
                        key={source.id}
                        value={source.name}
                      >
                        {source.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Document Type
                </label>

                <select
                  value={
                    newDocument.type
                  }
                  onChange={(event) =>
                    setNewDocument({
                      ...newDocument,
                      type:
                        event.target.value,
                    })
                  }
                  style={styles.input}
                >
                  <option>
                    PDF
                  </option>

                  <option>
                    DOCX
                  </option>

                  <option>
                    Markdown
                  </option>

                  <option>
                    TXT
                  </option>

                  <option>
                    HTML
                  </option>
                </select>
              </div>
            </div>

            <div style={styles.formActions}>
              <button
                type="button"
                onClick={() =>
                  setShowUploadForm(false)
                }
                style={
                  styles.secondaryButton
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                style={styles.primaryButton}
              >
                Upload & Index
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Knowledge Sources */}
      <section style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <h2 style={styles.sectionTitle}>
              Knowledge Sources
            </h2>

            <p style={styles.sectionSubtitle}>
              Manage connected knowledge repositories.
            </p>
          </div>
        </div>

        <div style={styles.sourceGrid}>
          {sources.map((source) => (
            <div
              key={source.id}
              style={styles.sourceCard}
            >
              <div
                style={
                  styles.sourceCardHeader
                }
              >
                <div
                  style={
                    styles.sourceIcon
                  }
                >
                  KB
                </div>

                <StatusBadge
                  status={source.status}
                />
              </div>

              <h3 style={styles.sourceName}>
                {source.name}
              </h3>

              <span
                style={
                  styles.sourceType
                }
              >
                {source.type}
              </span>

              <p
                style={
                  styles.sourceDescription
                }
              >
                {source.description}
              </p>

              <div
                style={
                  styles.sourceStats
                }
              >
                <span>
                  Documents
                </span>

                <strong>
                  {source.documents}
                </strong>
              </div>

              <div
                style={
                  styles.sourceStats
                }
              >
                <span>
                  Storage
                </span>

                <strong>
                  {source.size}
                </strong>
              </div>

              <div
                style={
                  styles.sourceFooter
                }
              >
                <span>
                  Updated{" "}
                  {source.lastUpdated}
                </span>

                <button
                  type="button"
                  style={
                    styles.viewButton
                  }
                >
                  Manage
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Documents */}
      <section style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <h2 style={styles.sectionTitle}>
              Knowledge Documents
            </h2>

            <p style={styles.sectionSubtitle}>
              Search and manage indexed documents.
            </p>
          </div>

          <div style={styles.filters}>
            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search documents..."
              style={styles.searchInput}
            />

            <select
              value={sourceFilter}
              onChange={(event) =>
                setSourceFilter(
                  event.target.value
                )
              }
              style={styles.select}
            >
              <option value="All">
                All Sources
              </option>

              {sources.map((source) => (
                <option
                  key={source.id}
                  value={source.name}
                >
                  {source.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>
                  Document
                </th>

                <th style={styles.th}>
                  Source
                </th>

                <th style={styles.th}>
                  Type
                </th>

                <th style={styles.th}>
                  Chunks
                </th>

                <th style={styles.th}>
                  Status
                </th>

                <th style={styles.th}>
                  Updated
                </th>

                <th style={styles.th}>
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredDocuments.length >
              0 ? (
                filteredDocuments.map(
                  (document) => (
                    <tr key={document.id}>
                      <td style={styles.td}>
                        <strong>
                          {document.name}
                        </strong>
                      </td>

                      <td style={styles.td}>
                        {document.source}
                      </td>

                      <td style={styles.td}>
                        <span
                          style={
                            styles.typeBadge
                          }
                        >
                          {document.type}
                        </span>
                      </td>

                      <td style={styles.td}>
                        {document.chunks}
                      </td>

                      <td style={styles.td}>
                        <StatusBadge
                          status={
                            document.status
                          }
                        />
                      </td>

                      <td style={styles.td}>
                        {
                          document.updatedAt
                        }
                      </td>

                      <td style={styles.td}>
                        <button
                          type="button"
                          onClick={() =>
                            reindexDocument(
                              document.id
                            )
                          }
                          style={
                            styles.actionButton
                          }
                        >
                          Re-index
                        </button>
                      </td>
                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    style={
                      styles.emptyState
                    }
                  >
                    No documents found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
}) {
  return (
    <div style={styles.statCard}>
      <span style={styles.statTitle}>
        {title}
      </span>

      <strong style={styles.statValue}>
        {value}
      </strong>

      <span style={styles.statDescription}>
        {description}
      </span>
    </div>
  );
}

function StatusBadge({ status }) {
  let badgeStyle =
    styles.processingBadge;

  if (status === "Indexed") {
    badgeStyle = styles.indexedBadge;
  }

  if (status === "Indexing") {
    badgeStyle = styles.indexingBadge;
  }

  return (
    <span
      style={{
        ...styles.statusBadge,
        ...badgeStyle,
      }}
    >
      {status}
    </span>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "32px",
    backgroundColor: "#f8fafc",
    color: "#0f172a",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "28px",
  },

  title: {
    margin: 0,
    fontSize: "30px",
    fontWeight: 700,
  },

  subtitle: {
    marginTop: "8px",
    color: "#64748b",
    fontSize: "15px",
  },

  headerActions: {
    display: "flex",
    gap: "10px",
  },

  primaryButton: {
    padding: "11px 18px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontWeight: 600,
    cursor: "pointer",
  },

  secondaryButton: {
    padding: "10px 16px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    color: "#334155",
    fontWeight: 600,
    cursor: "pointer",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "20px",
    marginBottom: "24px",
  },

  statCard: {
    padding: "22px",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
  },

  statTitle: {
    color: "#64748b",
    fontSize: "14px",
    fontWeight: 600,
  },

  statValue: {
    display: "block",
    marginTop: "10px",
    fontSize: "28px",
  },

  statDescription: {
    display: "block",
    marginTop: "6px",
    color: "#94a3b8",
    fontSize: "13px",
  },

  formCard: {
    padding: "24px",
    marginBottom: "24px",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "18px",
    marginTop: "20px",
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  label: {
    color: "#334155",
    fontSize: "13px",
    fontWeight: 600,
  },

  input: {
    padding: "11px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "14px",
  },

  textarea: {
    padding: "11px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "14px",
    resize: "vertical",
  },

  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "20px",
  },

  card: {
    marginBottom: "24px",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    overflow: "hidden",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px",
    padding: "24px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "19px",
  },

  sectionSubtitle: {
    marginTop: "6px",
    color: "#64748b",
    fontSize: "14px",
  },

  sourceGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
    padding: "0 24px 24px",
  },

  sourceCard: {
    padding: "20px",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
  },

  sourceCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sourceIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "42px",
    height: "42px",
    borderRadius: "9px",
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    fontWeight: 700,
  },

  sourceName: {
    margin: "18px 0 5px",
    fontSize: "17px",
  },

  sourceType: {
    color: "#2563eb",
    fontSize: "12px",
    fontWeight: 600,
  },

  sourceDescription: {
    minHeight: "55px",
    color: "#64748b",
    fontSize: "13px",
    lineHeight: 1.5,
  },

  sourceStats: {
    display: "flex",
    justifyContent: "space-between",
    padding: "9px 0",
    borderTop:
      "1px solid #f1f5f9",
    color: "#64748b",
    fontSize: "13px",
  },

  sourceFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "12px",
    color: "#94a3b8",
    fontSize: "11px",
  },

  viewButton: {
    padding: "6px 10px",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    backgroundColor: "#ffffff",
    cursor: "pointer",
  },

  filters: {
    display: "flex",
    gap: "10px",
  },

  searchInput: {
    width: "230px",
    padding: "10px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
  },

  select: {
    padding: "10px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "900px",
  },

  th: {
    padding: "13px 16px",
    textAlign: "left",
    backgroundColor: "#f8fafc",
    color: "#64748b",
    fontSize: "12px",
    textTransform: "uppercase",
    borderTop:
      "1px solid #e2e8f0",
    borderBottom:
      "1px solid #e2e8f0",
  },

  td: {
    padding: "16px",
    borderBottom:
      "1px solid #f1f5f9",
    fontSize: "14px",
  },

  typeBadge: {
    padding: "5px 9px",
    borderRadius: "6px",
    backgroundColor: "#f1f5f9",
    color: "#475569",
    fontSize: "12px",
    fontWeight: 600,
  },

  statusBadge: {
    padding: "5px 9px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: 600,
  },

  indexedBadge: {
    backgroundColor: "#dcfce7",
    color: "#15803d",
  },

  indexingBadge: {
    backgroundColor: "#fef3c7",
    color: "#a16207",
  },

  processingBadge: {
    backgroundColor: "#dbeafe",
    color: "#1d4ed8",
  },

  actionButton: {
    padding: "7px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    backgroundColor: "#ffffff",
    color: "#334155",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
  },

  emptyState: {
    padding: "50px",
    textAlign: "center",
    color: "#64748b",
  },
};