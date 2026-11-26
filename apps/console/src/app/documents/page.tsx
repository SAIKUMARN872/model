
"use client";

import Link from "next/link";
import React, { useMemo, useRef, useState } from "react";
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  CloudUpload,
  Database,
  Download,
  Eye,
  File,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  Filter,
  FolderOpen,
  HardDrive,
  Info,
  Loader2,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  Upload,
  X,
} from "lucide-react";

type DocumentStatus = "Ready" | "Processing" | "Failed";
type DocumentType = "PDF" | "DOCX" | "TXT" | "CSV" | "Image";

type DocumentRecord = {
  id: string;
  name: string;
  type: DocumentType;
  size: number;
  owner: string;
  category: string;
  updatedAt: string;
  status: DocumentStatus;
};

const initialDocuments: DocumentRecord[] = [];

const MAX_FILE_SIZE = 25 * 1024 * 1024;

const allowedExtensions: Record<string, DocumentType> = {
  pdf: "PDF",
  docx: "DOCX",
  txt: "TXT",
  csv: "CSV",
  png: "Image",
  jpg: "Image",
  jpeg: "Image",
  webp: "Image",
};

function getFileType(name: string): DocumentType | null {
  const extension = name.split(".").pop()?.toLowerCase();
  return extension ? allowedExtensions[extension] ?? null : null;
}

function formatSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";

  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getFileIcon(type: DocumentType) {
  switch (type) {
    case "PDF":
      return FileText;
    case "DOCX":
      return File;
    case "CSV":
      return FileSpreadsheet;
    case "Image":
      return FileImage;
    default:
      return FileText;
  }
}

function StatusBadge({ status }: { status: DocumentStatus }) {
  const styles = {
    Ready: "doc-status-ready",
    Processing: "doc-status-processing",
    Failed: "doc-status-failed",
  };

  return (
    <span className={`doc-status ${styles[status]}`}>
      {status === "Ready" && <CheckCircle2 size={12} />}
      {status === "Processing" && <Clock3 size={12} />}
      {status === "Failed" && <X size={12} />}
      {status}
    </span>
  );
}

function EmptyState({
  title,
  description,
  icon: Icon = FolderOpen,
}: {
  title: string;
  description: string;
  icon?: React.ElementType;
}) {
  return (
    <div className="doc-empty">
      <div className="doc-empty-icon">
        <Icon size={24} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

export default function DocumentsPage() {
  const [documents, setDocuments] =
    useState<DocumentRecord[]>(initialDocuments);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All types");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [selectedDocument, setSelectedDocument] =
    useState<DocumentRecord | null>(null);

  const [notice, setNotice] = useState("");
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredDocuments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return documents.filter((document) => {
      const matchesSearch =
        !query ||
        [
          document.name,
          document.owner,
          document.category,
          document.type,
          document.id,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesType =
        typeFilter === "All types" || document.type === typeFilter;

      const matchesStatus =
        statusFilter === "All statuses" ||
        document.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [documents, search, typeFilter, statusFilter]);

  const totalStorage = documents.reduce(
    (total, document) => total + document.size,
    0
  );

  const readyCount = documents.filter(
    (document) => document.status === "Ready"
  ).length;

  const processingCount = documents.filter(
    (document) => document.status === "Processing"
  ).length;

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("All types");
    setStatusFilter("All statuses");
  };

  const handleFileSelection = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files ?? []);

    if (!files.length) return;

    const validFiles: DocumentRecord[] = [];
    const errors: string[] = [];

    for (const file of files) {
      const type = getFileType(file.name);

      if (!type) {
        errors.push(`${file.name}: unsupported file type`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: file exceeds the 25 MB limit`);
        continue;
      }

      if (file.size === 0) {
        errors.push(`${file.name}: empty files are not accepted`);
        continue;
      }

      validFiles.push({
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: file.name,
        type,
        size: file.size,
        owner: "Current user",
        category: "Uncategorized",
        updatedAt: new Date().toISOString(),
        status: "Processing",
      });
    }

    if (validFiles.length) {
      setDocuments((current) => [...validFiles, ...current]);
      setUploading(true);

      // Local selection only. No file bytes are sent or stored.
      setNotice(
        `${validFiles.length} file(s) selected locally. Connect the document ingestion API to upload and process them.`
      );

      setUploading(false);
    }

    if (errors.length) {
      setNotice(errors.join("; "));
    }

    event.target.value = "";
  };

  const refreshDocuments = async () => {
    setRefreshing(true);
    setNotice("");

    try {
      // Replace with the authenticated document-list API.
      await new Promise((resolve) => window.setTimeout(resolve, 400));

      setNotice(
        "Document service is not connected. No server records were refreshed."
      );
    } finally {
      setRefreshing(false);
    }
  };

  const exportDocuments = () => {
    if (!filteredDocuments.length) {
      setNotice("There are no document records available to export.");
      return;
    }

    const headers = [
      "Document ID",
      "Name",
      "Type",
      "Size",
      "Owner",
      "Category",
      "Updated",
      "Status",
    ];

    const rows = filteredDocuments.map((document) => [
      document.id,
      document.name,
      document.type,
      document.size,
      document.owner,
      document.category,
      document.updatedAt,
      document.status,
    ]);

    const escapeCsv = (value: string | number) =>
      `"${String(value).replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\r\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "modelnow-documents.csv";
    anchor.click();

    URL.revokeObjectURL(url);
    setNotice("Document inventory exported successfully.");
  };

  const removeLocalDocument = (id: string) => {
    setDocuments((current) =>
      current.filter((document) => document.id !== id)
    );

    setSelectedDocument(null);
    setNotice(
      "The locally selected document record was removed. No server file was deleted."
    );
  };

  return (
    <main className="doc-page">
      <style>{`
        .doc-page {
          --doc-primary: #315fea;
          --doc-text: #111827;
          --doc-muted: #64748b;
          --doc-border: #e5e7eb;
          min-height: 100%;
          padding: 28px;
          background: #f8fafc;
          color: var(--doc-text);
        }

        .doc-container {
          max-width: 1500px;
          margin: 0 auto;
        }

        .doc-back {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 22px;
          color: #64748b;
          font-size: 12px;
          font-weight: 650;
          text-decoration: none;
        }

        .doc-back:hover {
          color: var(--doc-primary);
        }

        .doc-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 23px;
        }

        .doc-heading {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }

        .doc-heading-icon {
          display: grid;
          width: 46px;
          height: 46px;
          flex-shrink: 0;
          place-items: center;
          border: 1px solid #dbe5ff;
          border-radius: 11px;
          background: #eff4ff;
          color: var(--doc-primary);
        }

        .doc-eyebrow {
          margin: 0 0 6px;
          color: #64748b;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .doc-header h1 {
          margin: 0;
          font-size: 26px;
          font-weight: 750;
          letter-spacing: -.7px;
        }

        .doc-description {
          margin: 7px 0 0;
          color: var(--doc-muted);
          font-size: 13px;
          line-height: 1.6;
        }

        .doc-header-actions {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .doc-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 37px;
          padding: 0 12px;
          border: 1px solid #dce2eb;
          border-radius: 8px;
          background: #fff;
          color: #334155;
          font-size: 11px;
          font-weight: 700;
          text-decoration: none;
          cursor: pointer;
        }

        .doc-button:hover {
          border-color: #b9c8e8;
          background: #f8faff;
        }

        .doc-button-primary {
          border-color: var(--doc-primary);
          background: var(--doc-primary);
          color: #fff;
        }

        .doc-button-primary:hover {
          border-color: #244dcc;
          background: #244dcc;
          color: #fff;
        }

        .doc-button:disabled {
          opacity: .55;
          cursor: not-allowed;
        }

        .doc-button:focus-visible,
        .doc-back:focus-visible,
        .doc-table button:focus-visible {
          outline: 2px solid var(--doc-primary);
          outline-offset: 3px;
        }

        .doc-notice {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 13px 15px;
          margin-bottom: 18px;
          border: 1px solid #bfdbfe;
          border-radius: 9px;
          background: #eff6ff;
          color: #1e40af;
          font-size: 11px;
          line-height: 1.6;
        }

        .doc-notice svg {
          flex-shrink: 0;
        }

        .doc-notice button {
          margin-left: auto;
          border: 0;
          background: transparent;
          color: inherit;
          cursor: pointer;
        }

        .doc-metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 13px;
          margin-bottom: 19px;
        }

        .doc-metric {
          padding: 17px;
          border: 1px solid var(--doc-border);
          border-radius: 10px;
          background: #fff;
        }

        .doc-metric-top {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 14px;
        }

        .doc-metric-icon {
          display: grid;
          width: 34px;
          height: 34px;
          place-items: center;
          border-radius: 9px;
          background: #eff4ff;
          color: var(--doc-primary);
        }

        .doc-metric-label {
          color: #64748b;
          font-size: 11px;
          font-weight: 650;
        }

        .doc-metric strong {
          display: block;
          font-size: 25px;
          font-weight: 800;
          letter-spacing: -.6px;
        }

        .doc-metric p {
          margin: 6px 0 0;
          color: #94a3b8;
          font-size: 10px;
        }

        .doc-panel {
          overflow: hidden;
          border: 1px solid var(--doc-border);
          border-radius: 11px;
          background: #fff;
        }

        .doc-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 17px 19px;
          border-bottom: 1px solid var(--doc-border);
        }

        .doc-panel-header h2 {
          margin: 0;
          font-size: 14px;
          font-weight: 750;
        }

        .doc-panel-header p {
          margin: 5px 0 0;
          color: #94a3b8;
          font-size: 10px;
        }

        .doc-toolbar {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 9px;
          padding: 14px 17px;
          border-bottom: 1px solid var(--doc-border);
        }

        .doc-search {
          position: relative;
          flex: 1;
          min-width: 190px;
        }

        .doc-search svg {
          position: absolute;
          top: 50%;
          left: 11px;
          color: #94a3b8;
          transform: translateY(-50%);
          pointer-events: none;
        }

        .doc-search input {
          box-sizing: border-box;
          width: 100%;
          height: 37px;
          padding: 0 12px 0 34px;
          border: 1px solid #dce2eb;
          border-radius: 7px;
          outline: none;
          background: #fff;
          color: #334155;
          font-size: 11px;
        }

        .doc-search input:focus,
        .doc-select:focus {
          border-color: var(--doc-primary);
          box-shadow: 0 0 0 3px rgba(49,95,234,.08);
        }

        .doc-select {
          height: 37px;
          padding: 0 10px;
          border: 1px solid #dce2eb;
          border-radius: 7px;
          outline: none;
          background: #fff;
          color: #475569;
          font-size: 10px;
        }

        .doc-table-wrap {
          overflow-x: auto;
        }

        .doc-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          white-space: nowrap;
        }

        .doc-table th {
          padding: 12px 15px;
          border-bottom: 1px solid var(--doc-border);
          background: #fafbfc;
          color: #64748b;
          font-size: 10px;
          font-weight: 750;
        }

        .doc-table td {
          padding: 13px 15px;
          border-bottom: 1px solid #edf0f4;
          color: #475569;
          font-size: 10px;
        }

        .doc-table tbody tr:hover {
          background: #fafcff;
        }

        .doc-table tbody tr:last-child td {
          border-bottom: 0;
        }

        .doc-name-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .doc-file-icon {
          display: grid;
          width: 33px;
          height: 33px;
          flex-shrink: 0;
          place-items: center;
          border-radius: 8px;
          background: #eff4ff;
          color: var(--doc-primary);
        }

        .doc-file-name {
          max-width: 260px;
          overflow: hidden;
          color: #1e293b;
          font-size: 11px;
          font-weight: 700;
          text-overflow: ellipsis;
        }

        .doc-file-type {
          margin-top: 4px;
          color: #94a3b8;
          font-size: 9px;
        }

        .doc-status {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 8px;
          border: 1px solid;
          border-radius: 20px;
          font-size: 9px;
          font-weight: 750;
        }

        .doc-status-ready {
          border-color: #bbf7d0;
          background: #f0fdf4;
          color: #15803d;
        }

        .doc-status-processing {
          border-color: #bfdbfe;
          background: #eff6ff;
          color: #1d4ed8;
        }

        .doc-status-failed {
          border-color: #fecaca;
          background: #fef2f2;
          color: #b91c1c;
        }

        .doc-row-actions {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .doc-icon-button {
          display: grid;
          width: 29px;
          height: 29px;
          place-items: center;
          border: 1px solid transparent;
          border-radius: 6px;
          background: transparent;
          color: #64748b;
          cursor: pointer;
        }

        .doc-icon-button:hover {
          border-color: #e2e8f0;
          background: #f8fafc;
          color: var(--doc-primary);
        }

        .doc-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 48px 20px;
          text-align: center;
        }

        .doc-empty-icon {
          display: grid;
          width: 48px;
          height: 48px;
          margin-bottom: 13px;
          place-items: center;
          border-radius: 12px;
          background: #f1f5f9;
          color: #64748b;
        }

        .doc-empty h3 {
          margin: 0 0 6px;
          font-size: 13px;
          font-weight: 750;
        }

        .doc-empty p {
          max-width: 420px;
          margin: 0;
          color: #94a3b8;
          font-size: 11px;
          line-height: 1.7;
        }

        .doc-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 13px 17px;
          border-top: 1px solid var(--doc-border);
          color: #94a3b8;
          font-size: 10px;
        }

        .doc-info {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          padding: 13px;
          margin-top: 15px;
          border: 1px solid #dbeafe;
          border-radius: 8px;
          background: #f5f9ff;
          color: #475569;
          font-size: 10px;
          line-height: 1.6;
        }

        .doc-info svg {
          flex-shrink: 0;
          color: var(--doc-primary);
        }

        .doc-modal-backdrop {
          position: fixed;
          z-index: 100;
          inset: 0;
          display: grid;
          place-items: center;
          padding: 18px;
          background: rgba(15,23,42,.42);
        }

        .doc-modal {
          width: 100%;
          max-width: 470px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          border-radius: 13px;
          background: #fff;
          box-shadow: 0 20px 60px rgba(15,23,42,.18);
        }

        .doc-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 17px 19px;
          border-bottom: 1px solid var(--doc-border);
        }

        .doc-modal-header h2 {
          margin: 0;
          font-size: 15px;
        }

        .doc-modal-body {
          padding: 20px;
        }

        .doc-detail-row {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          padding: 12px 0;
          border-bottom: 1px solid #edf0f4;
          font-size: 11px;
        }

        .doc-detail-row span {
          color: #64748b;
        }

        .doc-detail-row strong {
          max-width: 65%;
          overflow-wrap: anywhere;
          color: #1e293b;
          text-align: right;
        }

        .doc-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 9px;
          padding: 14px 19px;
          border-top: 1px solid var(--doc-border);
        }

        @media(max-width: 1050px) {
          .doc-metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media(max-width: 650px) {
          .doc-page {
            padding: 17px 13px;
          }

          .doc-header {
            flex-direction: column;
          }

          .doc-header-actions {
            width: 100%;
          }

          .doc-header-actions > * {
            flex: 1;
          }

          .doc-metrics {
            gap: 9px;
          }

          .doc-metric {
            padding: 12px;
          }

          .doc-metric strong {
            font-size: 21px;
          }

          .doc-toolbar {
            align-items: stretch;
          }

          .doc-search {
            flex-basis: 100%;
          }

          .doc-select {
            flex: 1;
          }

          .doc-panel-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .doc-footer {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>

      <div className="doc-container">
        <Link href="/" className="doc-back">
          <ArrowLeft size={15} />
          Dashboard
        </Link>

        <header className="doc-header">
          <div className="doc-heading">
            <div className="doc-heading-icon">
              <FileText size={22} />
            </div>

            <div>
              <p className="doc-eyebrow">MODELNOW PLATFORM / KNOWLEDGE</p>
              <h1>Documents</h1>
              <p className="doc-description">
                Manage your organization's documents and connected knowledge
                sources in one place.
              </p>
            </div>
          </div>

          <div className="doc-header-actions">
            <button
              type="button"
              className="doc-button"
              onClick={refreshDocuments}
              disabled={refreshing}
            >
              {refreshing ? (
                <Loader2 size={14} />
              ) : (
                <RefreshCw size={14} />
              )}
              {refreshing ? "Checking..." : "Refresh"}
            </button>

            <button
              type="button"
              className="doc-button doc-button-primary"
              onClick={() => fileInputRef.current?.click()}
            >
              <Plus size={15} />
              Add documents
            </button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              hidden
              accept=".pdf,.docx,.txt,.csv,.png,.jpg,.jpeg,.webp"
              onChange={handleFileSelection}
            />
          </div>
        </header>

        {notice && (
          <div className="doc-notice" role="status">
            <Info size={16} />
            <span>{notice}</span>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => setNotice("")}
            >
              <X size={15} />
            </button>
          </div>
        )}

        <section className="doc-metrics" aria-label="Document metrics">
          <article className="doc-metric">
            <div className="doc-metric-top">
              <div className="doc-metric-icon">
                <FolderOpen size={18} />
              </div>
              <span className="doc-metric-label">Total documents</span>
            </div>
            <strong>{documents.length}</strong>
            <p>Records currently available in this workspace</p>
          </article>

          <article className="doc-metric">
            <div className="doc-metric-top">
              <div className="doc-metric-icon">
                <CheckCircle2 size={18} />
              </div>
              <span className="doc-metric-label">Ready documents</span>
            </div>
            <strong>{readyCount}</strong>
            <p>Documents marked ready in available records</p>
          </article>

          <article className="doc-metric">
            <div className="doc-metric-top">
              <div className="doc-metric-icon">
                <Clock3 size={18} />
              </div>
              <span className="doc-metric-label">Processing</span>
            </div>
            <strong>{processingCount}</strong>
            <p>Documents awaiting backend processing</p>
          </article>

          <article className="doc-metric">
            <div className="doc-metric-top">
              <div className="doc-metric-icon">
                <HardDrive size={18} />
              </div>
              <span className="doc-metric-label">Selected file size</span>
            </div>
            <strong>{formatSize(totalStorage)}</strong>
            <p>Size of locally selected document records</p>
          </article>
        </section>

        <section className="doc-panel">
          <div className="doc-panel-header">
            <div>
              <h2>Document library</h2>
              <p>
                Search, inspect, and manage document records for your
                organization.
              </p>
            </div>

            <button
              type="button"
              className="doc-button"
              onClick={exportDocuments}
            >
              <Download size={14} />
              Export inventory
            </button>
          </div>

          <div className="doc-toolbar">
            <div className="doc-search">
              <Search size={15} />
              <input
                type="search"
                placeholder="Search by document name, owner, or category..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search documents"
              />
            </div>

            <select
              className="doc-select"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              aria-label="Filter by document type"
            >
              <option>All types</option>
              <option>PDF</option>
              <option>DOCX</option>
              <option>TXT</option>
              <option>CSV</option>
              <option>Image</option>
            </select>

            <select
              className="doc-select"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by processing status"
            >
              <option>All statuses</option>
              <option>Ready</option>
              <option>Processing</option>
              <option>Failed</option>
            </select>

            <button
              type="button"
              className="doc-button"
              onClick={clearFilters}
              disabled={
                !search &&
                typeFilter === "All types" &&
                statusFilter === "All statuses"
              }
            >
              <Filter size={13} />
              Clear
            </button>
          </div>

          {filteredDocuments.length > 0 ? (
            <div className="doc-table-wrap">
              <table className="doc-table">
                <thead>
                  <tr>
                    <th>Document</th>
                    <th>Category</th>
                    <th>Owner</th>
                    <th>Size</th>
                    <th>Last updated</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredDocuments.map((document) => {
                    const Icon = getFileIcon(document.type);

                    return (
                      <tr key={document.id}>
                        <td>
                          <div className="doc-name-cell">
                            <div className="doc-file-icon">
                              <Icon size={17} />
                            </div>

                            <div>
                              <div className="doc-file-name">
                                {document.name}
                              </div>
                              <div className="doc-file-type">
                                {document.type} · {document.id}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td>{document.category}</td>
                        <td>{document.owner}</td>
                        <td>{formatSize(document.size)}</td>
                        <td>{formatDate(document.updatedAt)}</td>

                        <td>
                          <StatusBadge status={document.status} />
                        </td>

                        <td>
                          <div className="doc-row-actions">
                            <button
                              type="button"
                              className="doc-icon-button"
                              aria-label={`View ${document.name}`}
                              title="View details"
                              onClick={() => setSelectedDocument(document)}
                            >
                              <Eye size={15} />
                            </button>

                            {document.id.startsWith("local-") && (
                              <button
                                type="button"
                                className="doc-icon-button"
                                aria-label={`Remove local record for ${document.name}`}
                                title="Remove local record"
                                onClick={() =>
                                  removeLocalDocument(document.id)
                                }
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : documents.length === 0 ? (
            <EmptyState
              title="Your document library is empty"
              description="Add documents to begin building your organization's knowledge library. Connect the document ingestion service to upload, store, and process files."
              icon={CloudUpload}
            />
          ) : (
            <EmptyState
              title="No documents found"
              description="No records match your current search and filters. Try changing your search criteria."
              icon={Search}
            />
          )}

          <div className="doc-footer">
            <span>
              Showing {filteredDocuments.length} of {documents.length} records
            </span>
            <span>Document inventory</span>
          </div>
        </section>

        <div className="doc-info">
          <ShieldCheck size={16} />
          <span>
            <strong>Document security:</strong> Production document uploads
            should use authenticated, organization-scoped APIs, file-type and
            malware validation, access controls, encryption, audit logging,
            and controlled document processing.
          </span>
        </div>
      </div>

      {selectedDocument && (
        <div
          className="doc-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedDocument(null);
            }
          }}
        >
          <section
            className="doc-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="doc-modal-title"
          >
            <div className="doc-modal-header">
              <h2 id="doc-modal-title">Document details</h2>

              <button
                type="button"
                className="doc-icon-button"
                aria-label="Close details"
                onClick={() => setSelectedDocument(null)}
              >
                <X size={17} />
              </button>
            </div>

            <div className="doc-modal-body">
              <div className="doc-detail-row">
                <span>Document name</span>
                <strong>{selectedDocument.name}</strong>
              </div>

              <div className="doc-detail-row">
                <span>Document ID</span>
                <strong>{selectedDocument.id}</strong>
              </div>

              <div className="doc-detail-row">
                <span>File type</span>
                <strong>{selectedDocument.type}</strong>
              </div>

              <div className="doc-detail-row">
                <span>File size</span>
                <strong>{formatSize(selectedDocument.size)}</strong>
              </div>

              <div className="doc-detail-row">
                <span>Owner</span>
                <strong>{selectedDocument.owner}</strong>
              </div>

              <div className="doc-detail-row">
                <span>Category</span>
                <strong>{selectedDocument.category}</strong>
              </div>

              <div className="doc-detail-row">
                <span>Last updated</span>
                <strong>{formatDate(selectedDocument.updatedAt)}</strong>
              </div>

              <div className="doc-detail-row">
                <span>Processing status</span>
                <StatusBadge status={selectedDocument.status} />
              </div>
            </div>

            <div className="doc-modal-actions">
              <button
                type="button"
                className="doc-button"
                onClick={() => setSelectedDocument(null)}
              >
                Close
              </button>

              {selectedDocument.id.startsWith("local-") && (
                <button
                  type="button"
                  className="doc-button"
                  onClick={() =>
                    removeLocalDocument(selectedDocument.id)
                  }
                >
                  <Trash2 size={14} />
                  Remove local record
                </button>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
