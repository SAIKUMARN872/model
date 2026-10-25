"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  Activity,
  Archive,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CloudUpload,
  Database,
  Download,
  Eye,
  File,
  FileCode2,
  FileSpreadsheet,
  FileText,
  Filter,
  Folder,
  Grid3X3,
  HardDrive,
  Layers3,
  List,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Trash2,
  Upload,
  X,
  Zap,
} from "lucide-react";

type DocumentItem = {
  id: number;
  name: string;
  type: "PDF" | "DOCX" | "TXT" | "CSV" | "JSON";
  size: string;
  chunks: number;
  tokens: number;
  status: "Indexed" | "Processing" | "Failed";
  updated: string;
  folder: string;
};

type FolderItem = {
  id: number;
  name: string;
  documents: number;
  color: string;
};

const initialDocuments: DocumentItem[] = [
  {
    id: 1,
    name: "Enterprise AI Architecture.pdf",
    type: "PDF",
    size: "4.8 MB",
    chunks: 186,
    tokens: 24800,
    status: "Indexed",
    updated: "2 hours ago",
    folder: "Engineering",
  },
  {
    id: 2,
    name: "Product Requirements.docx",
    type: "DOCX",
    size: "1.9 MB",
    chunks: 94,
    tokens: 12400,
    status: "Indexed",
    updated: "5 hours ago",
    folder: "Product",
  },
  {
    id: 3,
    name: "Customer Knowledge Base.pdf",
    type: "PDF",
    size: "8.2 MB",
    chunks: 342,
    tokens: 41600,
    status: "Indexed",
    updated: "Yesterday",
    folder: "Knowledge",
  },
  {
    id: 4,
    name: "API Documentation.md",
    type: "TXT",
    size: "620 KB",
    chunks: 76,
    tokens: 8900,
    status: "Indexed",
    updated: "Yesterday",
    folder: "Engineering",
  },
  {
    id: 5,
    name: "Model Evaluation Dataset.csv",
    type: "CSV",
    size: "12.4 MB",
    chunks: 528,
    tokens: 62400,
    status: "Processing",
    updated: "Today",
    folder: "Evaluation",
  },
  {
    id: 6,
    name: "Agent Configuration.json",
    type: "JSON",
    size: "340 KB",
    chunks: 42,
    tokens: 5100,
    status: "Indexed",
    updated: "Today",
    folder: "Agents",
  },
];

const initialFolders: FolderItem[] = [
  {
    id: 1,
    name: "Engineering",
    documents: 18,
    color: "bg-blue-500",
  },
  {
    id: 2,
    name: "Knowledge",
    documents: 32,
    color: "bg-purple-500",
  },
  {
    id: 3,
    name: "Product",
    documents: 12,
    color: "bg-green-500",
  },
  {
    id: 4,
    name: "Evaluation",
    documents: 9,
    color: "bg-orange-500",
  },
  {
    id: 5,
    name: "Agents",
    documents: 7,
    color: "bg-gray-700",
  },
];

export default function DocumentsPage() {
  const [documents, setDocuments] =
    useState<DocumentItem[]>(initialDocuments);

  const [folders] =
    useState<FolderItem[]>(initialFolders);

  const [searchQuery, setSearchQuery] = useState("");

  const [selectedFolder, setSelectedFolder] =
    useState("All Documents");

  const [selectedType, setSelectedType] =
    useState("All");

  const [selectedStatus, setSelectedStatus] =
    useState("All");

  const [viewMode, setViewMode] =
    useState<"list" | "grid">("list");

  const [sortBy, setSortBy] =
    useState<"updated" | "name" | "tokens">("updated");

  const [showUpload, setShowUpload] =
    useState(false);

  const [showFilters, setShowFilters] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  const filteredDocuments = useMemo(() => {
    const query = searchQuery
      .toLowerCase()
      .trim();

    let result = documents.filter((document) => {
      const matchesSearch =
        !query ||
        document.name
          .toLowerCase()
          .includes(query);

      const matchesFolder =
        selectedFolder === "All Documents" ||
        document.folder === selectedFolder;

      const matchesType =
        selectedType === "All" ||
        document.type === selectedType;

      const matchesStatus =
        selectedStatus === "All" ||
        document.status === selectedStatus;

      return (
        matchesSearch &&
        matchesFolder &&
        matchesType &&
        matchesStatus
      );
    });

    result = [...result].sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }

      if (sortBy === "tokens") {
        return b.tokens - a.tokens;
      }

      return b.id - a.id;
    });

    return result;
  }, [
    documents,
    searchQuery,
    selectedFolder,
    selectedType,
    selectedStatus,
    sortBy,
  ]);

  const totalDocuments = documents.length;

  const indexedDocuments = documents.filter(
    (document) => document.status === "Indexed"
  ).length;

  const processingDocuments = documents.filter(
    (document) => document.status === "Processing"
  ).length;

  const totalTokens = documents.reduce(
    (total, document) =>
      total + document.tokens,
    0
  );

  const deleteDocument = (id: number) => {
    setDocuments((current) =>
      current.filter(
        (document) => document.id !== id
      )
    );

    setSaved(false);
  };

  const refreshDocuments = () => {
    setSaved(false);

    setDocuments((current) =>
      current.map((document) =>
        document.status === "Processing"
          ? {
              ...document,
              status: "Indexed",
              updated: "Just now",
            }
          : document
      )
    );
  };

  const addDocument = (
    name: string,
    type: DocumentItem["type"]
  ) => {
    const nextId =
      documents.length > 0
        ? Math.max(
            ...documents.map(
              (document) => document.id
            )
          ) + 1
        : 1;

    const newDocument: DocumentItem = {
      id: nextId,
      name,
      type,
      size: "1.2 MB",
      chunks: 38,
      tokens: 5200,
      status: "Processing",
      updated: "Just now",
      folder: "Knowledge",
    };

    setDocuments((current) => [
      newDocument,
      ...current,
    ]);

    setShowUpload(false);
    setUploading(true);

    window.setTimeout(() => {
      setDocuments((current) =>
        current.map((document) =>
          document.id === nextId
            ? {
                ...document,
                status: "Indexed",
                updated: "Just now",
              }
            : document
        )
      );

      setUploading(false);
    }, 1800);
  };

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#111827]">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-8 py-5">
          <div className="flex items-center gap-4">
            <Link
              href="/agent-builder/knowledge"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            >
              <ChevronRight
                size={18}
                className="rotate-180"
              />
            </Link>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold">
                  Documents
                </h1>

                <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
                  Knowledge
                </span>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                Manage documents used by your AI knowledge and
                retrieval system.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {saved && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-green-600">
                <CheckCircle2 size={15} />
                Saved
              </span>
            )}

            <button
              onClick={refreshDocuments}
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium hover:bg-gray-50"
            >
              <RefreshCw size={15} />
              Refresh
            </button>

            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
            >
              <Upload size={15} />
              Upload Document
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-8 py-8">
        {/* Metrics */}
        <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={<FileText size={18} />}
            label="Total Documents"
            value={totalDocuments.toString()}
            description="Knowledge sources"
          />

          <MetricCard
            icon={<CheckCircle2 size={18} />}
            label="Indexed"
            value={indexedDocuments.toString()}
            description="Ready for retrieval"
          />

          <MetricCard
            icon={<Activity size={18} />}
            label="Processing"
            value={processingDocuments.toString()}
            description="Currently indexing"
          />

          <MetricCard
            icon={<Database size={18} />}
            label="Total Tokens"
            value={`${Math.round(
              totalTokens / 1000
            )}K`}
            description="Indexed knowledge"
          />
        </section>

        <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
          {/* Left Sidebar */}
          <aside className="space-y-5">
            {/* Folders */}
            <section className="rounded-2xl border border-gray-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Folders
                </h2>

                <button className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                  <Plus size={14} />
                </button>
              </div>

              <div className="space-y-1">
                <FolderButton
                  name="All Documents"
                  count={totalDocuments}
                  selected={
                    selectedFolder ===
                    "All Documents"
                  }
                  onClick={() =>
                    setSelectedFolder(
                      "All Documents"
                    )
                  }
                  icon={<Layers3 size={15} />}
                />

                {folders.map((folder) => (
                  <FolderButton
                    key={folder.id}
                    name={folder.name}
                    count={folder.documents}
                    selected={
                      selectedFolder ===
                      folder.name
                    }
                    onClick={() =>
                      setSelectedFolder(
                        folder.name
                      )
                    }
                    icon={
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${folder.color}`}
                      />
                    }
                  />
                ))}
              </div>
            </section>

            {/* Knowledge Sources */}
            <section className="rounded-2xl border border-gray-200 bg-white p-4">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Knowledge Sources
              </h2>

              <div className="space-y-2">
                <SourceItem
                  icon={<FileText size={15} />}
                  label="Documents"
                  value={totalDocuments.toString()}
                  active
                />

                <SourceItem
                  icon={<Folder size={15} />}
                  label="Websites"
                  value="14"
                />

                <SourceItem
                  icon={<Database size={15} />}
                  label="Databases"
                  value="3"
                />
              </div>
            </section>

            {/* Storage */}
            <section className="rounded-2xl border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-2">
                <HardDrive size={16} />
                <h2 className="text-xs font-semibold">
                  Storage
                </h2>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-[10px]">
                  <span className="text-gray-500">
                    Knowledge storage
                  </span>

                  <span className="font-medium">
                    34%
                  </span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-black"
                    style={{
                      width: "34%",
                    }}
                  />
                </div>

                <p className="mt-2 text-[10px] text-gray-400">
                  3.4 GB of 10 GB used
                </p>
              </div>
            </section>
          </aside>

          {/* Main Content */}
          <section className="min-w-0">
            {/* Toolbar */}
            <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-1 items-center gap-3">
                  <div className="flex flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
                    <Search
                      size={15}
                      className="text-gray-400"
                    />

                    <input
                      value={searchQuery}
                      onChange={(event) =>
                        setSearchQuery(
                          event.target.value
                        )
                      }
                      placeholder="Search documents..."
                      className="w-full bg-transparent text-xs outline-none placeholder:text-gray-400"
                    />
                  </div>

                  <button
                    onClick={() =>
                      setShowFilters(
                        !showFilters
                      )
                    }
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-medium ${
                      showFilters
                        ? "border-black bg-black text-white"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <Filter size={14} />
                    Filters
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={sortBy}
                    onChange={(event) =>
                      setSortBy(
                        event.target.value as
                          | "updated"
                          | "name"
                          | "tokens"
                      )
                    }
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-xs font-medium outline-none"
                  >
                    <option value="updated">
                      Recently Updated
                    </option>

                    <option value="name">
                      Name
                    </option>

                    <option value="tokens">
                      Token Usage
                    </option>
                  </select>

                  <div className="flex rounded-lg border border-gray-200 p-1">
                    <button
                      onClick={() =>
                        setViewMode("list")
                      }
                      className={`rounded-md p-1.5 ${
                        viewMode === "list"
                          ? "bg-gray-100"
                          : "text-gray-400"
                      }`}
                    >
                      <List size={15} />
                    </button>

                    <button
                      onClick={() =>
                        setViewMode("grid")
                      }
                      className={`rounded-md p-1.5 ${
                        viewMode === "grid"
                          ? "bg-gray-100"
                          : "text-gray-400"
                      }`}
                    >
                      <Grid3X3 size={15} />
                    </button>
                  </div>
                </div>
              </div>

              {showFilters && (
                <div className="mt-4 grid gap-3 border-t border-gray-100 pt-4 md:grid-cols-2">
                  <FilterSelect
                    label="Document Type"
                    value={selectedType}
                    onChange={setSelectedType}
                    options={[
                      "All",
                      "PDF",
                      "DOCX",
                      "TXT",
                      "CSV",
                      "JSON",
                    ]}
                  />

                  <FilterSelect
                    label="Status"
                    value={selectedStatus}
                    onChange={setSelectedStatus}
                    options={[
                      "All",
                      "Indexed",
                      "Processing",
                      "Failed",
                    ]}
                  />
                </div>
              )}
            </div>

            {/* Active Filters */}
            {(selectedType !== "All" ||
              selectedStatus !== "All" ||
              selectedFolder !== "All Documents") && (
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="text-xs text-gray-500">
                  Active filters:
                </span>

                {selectedFolder !==
                  "All Documents" && (
                  <FilterBadge
                    label={selectedFolder}
                    onRemove={() =>
                      setSelectedFolder(
                        "All Documents"
                      )
                    }
                  />
                )}

                {selectedType !== "All" && (
                  <FilterBadge
                    label={selectedType}
                    onRemove={() =>
                      setSelectedType("All")
                    }
                  />
                )}

                {selectedStatus !== "All" && (
                  <FilterBadge
                    label={selectedStatus}
                    onRemove={() =>
                      setSelectedStatus("All")
                    }
                  />
                )}
              </div>
            )}

            {/* Documents */}
            {viewMode === "list" ? (
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                <div className="grid grid-cols-[1fr_100px_100px_110px_120px_45px] border-b border-gray-200 bg-gray-50 px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                  <span>Document</span>
                  <span>Size</span>
                  <span>Chunks</span>
                  <span>Status</span>
                  <span>Updated</span>
                  <span />
                </div>

                {filteredDocuments.map(
                  (document) => (
                    <DocumentRow
                      key={document.id}
                      document={document}
                      onDelete={
                        deleteDocument
                      }
                    />
                  )
                )}

                {filteredDocuments.length ===
                  0 && (
                  <EmptyState
                    onUpload={() =>
                      setShowUpload(true)
                    }
                  />
                )}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredDocuments.map(
                  (document) => (
                    <DocumentCard
                      key={document.id}
                      document={document}
                      onDelete={
                        deleteDocument
                      }
                    />
                  )
                )}

                {filteredDocuments.length ===
                  0 && (
                  <div className="col-span-full">
                    <EmptyState
                      onUpload={() =>
                        setShowUpload(true)
                      }
                    />
                  </div>
                )}
              </div>
            )}

            {/* Bottom Info */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-5 py-4">
              <div className="flex items-center gap-2">
                <ShieldCheck
                  size={16}
                  className="text-green-600"
                />

                <span className="text-xs text-gray-500">
                  Documents are protected with enterprise
                  knowledge controls.
                </span>
              </div>

              <Link
                href="/agent-builder/knowledge"
                className="flex items-center gap-1 text-xs font-medium text-gray-700 hover:text-black"
              >
                Knowledge Settings
                <ChevronRight size={14} />
              </Link>
            </div>
          </section>
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <UploadModal
          uploading={uploading}
          onClose={() => {
            if (!uploading) {
              setShowUpload(false);
            }
          }}
          onUpload={addDocument}
        />
      )}
    </main>
  );
}

function MetricCard({
  icon,
  label,
  value,
  description,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-center gap-2 text-gray-500">
        {icon}

        <span className="text-xs">
          {label}
        </span>
      </div>

      <p className="mt-3 text-xl font-semibold">
        {value}
      </p>

      <p className="mt-1 text-[10px] text-gray-400">
        {description}
      </p>
    </div>
  );
}

function FolderButton({
  name,
  count,
  selected,
  onClick,
  icon,
}: {
  name: string;
  count: number;
  selected: boolean;
  onClick: () => void;
  icon: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left ${
        selected
          ? "bg-gray-100 text-black"
          : "text-gray-600 hover:bg-gray-50"
      }`}
    >
      <span className="flex items-center gap-2.5">
        {icon}

        <span className="text-xs font-medium">
          {name}
        </span>
      </span>

      <span className="text-[10px] text-gray-400">
        {count}
      </span>
    </button>
  );
}

function SourceItem({
  icon,
  label,
  value,
  active,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-lg px-3 py-2.5 ${
        active
          ? "bg-gray-50"
          : ""
      }`}
    >
      <span className="flex items-center gap-2 text-xs text-gray-600">
        {icon}
        {label}
      </span>

      <span className="text-[10px] text-gray-400">
        {value}
      </span>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 px-3 py-2.5">
      <span className="text-xs text-gray-500">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="bg-transparent text-xs font-medium outline-none"
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function FilterBadge({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <button
      onClick={onRemove}
      className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5 text-[10px] font-medium text-gray-700"
    >
      {label}
      <X size={11} />
    </button>
  );
}

function DocumentRow({
  document,
  onDelete,
}: {
  document: DocumentItem;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="grid grid-cols-[1fr_100px_100px_110px_120px_45px] items-center border-b border-gray-100 px-5 py-4 last:border-b-0 hover:bg-gray-50">
      <div className="flex min-w-0 items-center gap-3">
        <DocumentIcon type={document.type} />

        <div className="min-w-0">
          <p className="truncate text-xs font-semibold">
            {document.name}
          </p>

          <p className="mt-1 text-[10px] text-gray-400">
            {document.folder}
          </p>
        </div>
      </div>

      <span className="text-xs text-gray-600">
        {document.size}
      </span>

      <span className="text-xs text-gray-600">
        {document.chunks}
      </span>

      <StatusBadge status={document.status} />

      <span className="text-[10px] text-gray-400">
        {document.updated}
      </span>

      <div className="relative">
        <button className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
          <MoreHorizontal size={15} />
        </button>

        <button
          onClick={() =>
            onDelete(document.id)
          }
          className="ml-1 rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

function DocumentCard({
  document,
  onDelete,
}: {
  document: DocumentItem;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 hover:border-gray-300">
      <div className="flex items-start justify-between gap-3">
        <DocumentIcon type={document.type} />

        <button
          onClick={() =>
            onDelete(document.id)
          }
          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <h3 className="mt-4 truncate text-sm font-semibold">
        {document.name}
      </h3>

      <p className="mt-1 text-xs text-gray-400">
        {document.folder}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <MiniMetric
          label="Size"
          value={document.size}
        />

        <MiniMetric
          label="Chunks"
          value={document.chunks.toString()}
        />

        <MiniMetric
          label="Tokens"
          value={document.tokens.toLocaleString()}
        />

        <MiniMetric
          label="Status"
          value={document.status}
        />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-[10px] text-gray-400">
          {document.updated}
        </span>

        <button className="flex items-center gap-1 text-[10px] font-medium text-gray-600 hover:text-black">
          <Eye size={12} />
          View
        </button>
      </div>
    </div>
  );
}

function DocumentIcon({
  type,
}: {
  type: DocumentItem["type"];
}) {
  if (type === "PDF") {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
        <FileText size={18} />
      </div>
    );
  }

  if (type === "DOCX") {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        <File size={18} />
      </div>
    );
  }

  if (type === "CSV") {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600">
        <FileSpreadsheet size={18} />
      </div>
    );
  }

  if (type === "JSON") {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
        <FileCode2 size={18} />
      </div>
    );
  }

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
      <FileText size={18} />
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: DocumentItem["status"];
}) {
  if (status === "Indexed") {
    return (
      <span className="flex w-fit items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-[9px] font-medium text-green-700">
        <CheckCircle2 size={11} />
        Indexed
      </span>
    );
  }

  if (status === "Processing") {
    return (
      <span className="flex w-fit items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-1 text-[9px] font-medium text-yellow-700">
        <RefreshCw
          size={11}
          className="animate-spin"
        />
        Processing
      </span>
    );
  }

  return (
    <span className="rounded-full bg-red-50 px-2.5 py-1 text-[9px] font-medium text-red-600">
      Failed
    </span>
  );
}

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-gray-50 p-3">
      <p className="text-[9px] text-gray-400">
        {label}
      </p>

      <p className="mt-1 truncate text-xs font-semibold">
        {value}
      </p>
    </div>
  );
}

function EmptyState({
  onUpload,
}: {
  onUpload: () => void;
}) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
        <FileText
          size={24}
          className="text-gray-500"
        />
      </div>

      <h3 className="mt-4 text-sm font-semibold">
        No documents found
      </h3>

      <p className="mt-1 max-w-sm text-xs leading-5 text-gray-500">
        Upload documents or change your search and filter settings.
      </p>

      <button
        onClick={onUpload}
        className="mt-5 flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-xs font-medium text-white"
      >
        <Upload size={14} />
        Upload Document
      </button>
    </div>
  );
}

function UploadModal({
  uploading,
  onClose,
  onUpload,
}: {
  uploading: boolean;
  onClose: () => void;
  onUpload: (
    name: string,
    type: DocumentItem["type"]
  ) => void;
}) {
  const [selectedType, setSelectedType] =
    useState<DocumentItem["type"]>("PDF");

  const [fileName, setFileName] =
    useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              Upload Document
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Add a document to your knowledge base.
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={uploading}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
            {uploading ? (
              <RefreshCw
                size={22}
                className="animate-spin"
              />
            ) : (
              <CloudUpload size={22} />
            )}
          </div>

          <h3 className="mt-4 text-sm font-semibold">
            {uploading
              ? "Indexing document..."
              : "Select a document"}
          </h3>

          <p className="mt-1 text-xs text-gray-500">
            PDF, DOCX, TXT, CSV or JSON
          </p>

          {!uploading && (
            <input
              value={fileName}
              onChange={(event) =>
                setFileName(event.target.value)
              }
              placeholder="Document name"
              className="mt-5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-xs outline-none focus:border-gray-400"
            />
          )}
        </div>

        {!uploading && (
          <>
            <div className="mt-5">
              <p className="mb-2 text-xs font-medium text-gray-600">
                Document type
              </p>

              <div className="grid grid-cols-5 gap-2">
                {[
                  "PDF",
                  "DOCX",
                  "TXT",
                  "CSV",
                  "JSON",
                ].map((type) => (
                  <button
                    key={type}
                    onClick={() =>
                      setSelectedType(
                        type as DocumentItem["type"]
                      )
                    }
                    className={`rounded-lg border px-2 py-2 text-[10px] font-medium ${
                      selectedType === type
                        ? "border-black bg-black text-white"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="rounded-lg border border-gray-200 px-4 py-2.5 text-xs font-medium hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={() =>
                  onUpload(
                    fileName.trim() ||
                      `New Knowledge Document.${selectedType.toLowerCase()}`,
                    selectedType
                  )
                }
                className="flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-xs font-medium text-white"
              >
                <Upload size={14} />
                Upload & Index
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}