
"use client";

import { useMemo, useState, type CSSProperties, type FormEvent } from "react";
import {
  ArrowDownToLine,
  BarChart3,
  Check,
  ChevronDown,
  CircleAlert,
  Cloud,
  Database,
  File,
  FileArchive,
  FileText,
  Folder,
  HardDrive,
  Image,
  Link,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Upload,
  Users,
  X,
  Eye,
  Pencil,
  Archive,
} from "lucide-react";

type ResourceType =
  | "Document"
  | "Dataset"
  | "Image"
  | "Archive"
  | "Link"
  | "Other";

type ResourceStatus = "Active" | "Archived" | "Restricted";

type Resource = {
  id: number;
  name: string;
  description: string;
  type: ResourceType;
  department: string;
  owner: string;
  size: number;
  status: ResourceStatus;
  visibility: "Workspace" | "Team only" | "Restricted";
  createdAt: string;
  updatedAt: string;
  downloads: number;
  tags: string;
};

const initialResources: Resource[] = [
  {
    id: 1,
    name: "ModelNow Architecture.pdf",
    description: "Architecture overview, services, model routing, and infrastructure design.",
    type: "Document",
    department: "Engineering",
    owner: "Sai Kumar",
    size: 8.4,
    status: "Active",
    visibility: "Workspace",
    createdAt: "2026-08-12",
    updatedAt: "2026-10-30",
    downloads: 126,
    tags: "architecture, infrastructure, technical",
  },
  {
    id: 2,
    name: "Model Evaluation Dataset.csv",
    description: "Evaluation prompts and expected outputs for model quality testing.",
    type: "Dataset",
    department: "Research",
    owner: "Ananya Rao",
    size: 24.6,
    status: "Active",
    visibility: "Team only",
    createdAt: "2026-09-01",
    updatedAt: "2026-11-01",
    downloads: 83,
    tags: "dataset, evaluation, models",
  },
  {
    id: 3,
    name: "Brand Guidelines.pdf",
    description: "Approved brand colors, typography, logos, and product presentation guidelines.",
    type: "Document",
    department: "Product",
    owner: "Meera Shah",
    size: 3.2,
    status: "Active",
    visibility: "Workspace",
    createdAt: "2026-07-18",
    updatedAt: "2026-10-15",
    downloads: 51,
    tags: "brand, design, guidelines",
  },
  {
    id: 4,
    name: "Product Screenshots.zip",
    description: "Current product interface screenshots for documentation and review.",
    type: "Archive",
    department: "Product",
    owner: "Pujitha",
    size: 42.8,
    status: "Active",
    visibility: "Team only",
    createdAt: "2026-09-20",
    updatedAt: "2026-10-27",
    downloads: 32,
    tags: "screenshots, UI, product",
  },
  {
    id: 5,
    name: "API Reference",
    description: "Internal API documentation and integration reference.",
    type: "Link",
    department: "Engineering",
    owner: "Rahul Verma",
    size: 0,
    status: "Active",
    visibility: "Workspace",
    createdAt: "2026-08-25",
    updatedAt: "2026-11-02",
    downloads: 204,
    tags: "API, documentation, integration",
  },
  {
    id: 6,
    name: "Security Review Notes.docx",
    description: "Internal security review findings and remediation notes.",
    type: "Document",
    department: "Operations",
    owner: "Kiran Das",
    size: 1.8,
    status: "Restricted",
    visibility: "Restricted",
    createdAt: "2026-09-12",
    updatedAt: "2026-10-22",
    downloads: 17,
    tags: "security, governance, compliance",
  },
  {
    id: 7,
    name: "Legacy Training Data.jsonl",
    description: "Historical training examples retained for reference.",
    type: "Dataset",
    department: "Research",
    owner: "Arjun Patel",
    size: 115.3,
    status: "Archived",
    visibility: "Team only",
    createdAt: "2026-05-10",
    updatedAt: "2026-07-12",
    downloads: 9,
    tags: "training, legacy, dataset",
  },
  {
    id: 8,
    name: "Service Dependency Diagram.png",
    description: "Diagram showing relationships between platform services.",
    type: "Image",
    department: "Engineering",
    owner: "Sai Kumar",
    size: 2.5,
    status: "Active",
    visibility: "Workspace",
    createdAt: "2026-10-05",
    updatedAt: "2026-10-29",
    downloads: 46,
    tags: "diagram, services, architecture",
  },
];

const emptyResource: Omit<Resource, "id"> = {
  name: "",
  description: "",
  type: "Document",
  department: "Engineering",
  owner: "",
  size: 0,
  status: "Active",
  visibility: "Workspace",
  createdAt: "2026-11-04",
  updatedAt: "2026-11-04",
  downloads: 0,
  tags: "",
};

const typeColors: Record<ResourceType, string> = {
  Document: "#315fe9",
  Dataset: "#7c5ce7",
  Image: "#c17b16",
  Archive: "#0f8b9a",
  Link: "#16845b",
  Other: "#64748b",
};

const statusColors: Record<ResourceStatus, string> = {
  Active: "#16845b",
  Archived: "#64748b",
  Restricted: "#c17b16",
};

const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #dce2ea",
  borderRadius: 9,
  padding: "10px 12px",
  fontSize: 13,
  outline: "none",
  background: "#fff",
  color: "#172033",
};

const buttonStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  border: "1px solid #dce2ea",
  borderRadius: 9,
  background: "#fff",
  color: "#344054",
  padding: "9px 12px",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
};

function formatSize(size: number) {
  if (size === 0) return "External link";
  if (size >= 1024) return `${(size / 1024).toFixed(2)} GB`;
  return `${size.toFixed(1)} MB`;
}

function formatDate(value: string) {
  if (!value) return "—";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function ResourceIcon({ type, size = 18 }: { type: ResourceType; size?: number }) {
  const common = { size, color: typeColors[type] };

  switch (type) {
    case "Document":
      return <FileText {...common} />;
    case "Dataset":
      return <Database {...common} />;
    case "Image":
      return <Image {...common} />;
    case "Archive":
      return <FileArchive {...common} />;
    case "Link":
      return <Link {...common} />;
    default:
      return <File {...common} />;
  }
}

export default function WorkspaceResourcesPage() {
  const [resources, setResources] = useState<Resource[]>(initialResources);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [showArchived, setShowArchived] = useState(false);
  const [view, setView] = useState<"table" | "grid">("table");
  const [modal, setModal] = useState<"create" | "edit" | "details" | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState<Omit<Resource, "id">>(emptyResource);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [menuId, setMenuId] = useState<number | null>(null);

  const selectedResource =
    resources.find((resource) => resource.id === selectedId) ?? null;

  const filteredResources = useMemo(() => {
    const query = search.toLowerCase().trim();

    return resources.filter((resource) => {
      const matchesSearch =
        !query ||
        [
          resource.name,
          resource.description,
          resource.owner,
          resource.department,
          resource.tags,
        ].some((value) => value.toLowerCase().includes(query));

      const matchesType = typeFilter === "All" || resource.type === typeFilter;
      const matchesStatus =
        statusFilter === "All" || resource.status === statusFilter;
      const matchesDepartment =
        departmentFilter === "All" ||
        resource.department === departmentFilter;
      const matchesArchived = showArchived || resource.status !== "Archived";

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus &&
        matchesDepartment &&
        matchesArchived
      );
    });
  }, [
    resources,
    search,
    typeFilter,
    statusFilter,
    departmentFilter,
    showArchived,
  ]);

  const activeResources = resources.filter((r) => r.status === "Active").length;
  const restrictedResources = resources.filter(
    (r) => r.status === "Restricted",
  ).length;
  const totalSize = resources
    .filter((r) => r.status !== "Archived")
    .reduce((sum, r) => sum + r.size, 0);
  const totalDownloads = resources.reduce((sum, r) => sum + r.downloads, 0);

  function openCreate() {
    setSelectedId(null);
    setForm({
      ...emptyResource,
      name: "",
      owner: "",
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
    });
    setFormError("");
    setModal("create");
  }

  function openEdit(resource: Resource) {
    const { id: _id, ...data } = resource;
    setSelectedId(resource.id);
    setForm(data);
    setFormError("");
    setMenuId(null);
    setModal("edit");
  }

  function openDetails(resource: Resource) {
    setSelectedId(resource.id);
    setMenuId(null);
    setModal("details");
  }

  function updateForm<K extends keyof Omit<Resource, "id">>(
    key: K,
    value: Omit<Resource, "id">[K],
  ) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  function saveResource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim() || !form.owner.trim()) {
      setFormError("Resource name and owner are required.");
      return;
    }

    if (form.size < 0 || !Number.isFinite(form.size)) {
      setFormError("Resource size must be zero or greater.");
      return;
    }

    const duplicate = resources.some(
      (resource) =>
        resource.name.trim().toLowerCase() === form.name.trim().toLowerCase() &&
        resource.id !== selectedId,
    );

    if (duplicate) {
      setFormError("A resource with this name already exists.");
      return;
    }

    const updatedForm = {
      ...form,
      name: form.name.trim(),
      owner: form.owner.trim(),
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    if (modal === "edit" && selectedId !== null) {
      setResources((previous) =>
        previous.map((resource) =>
          resource.id === selectedId
            ? { ...updatedForm, id: selectedId }
            : resource,
        ),
      );
      setNotice("Resource updated successfully.");
    } else {
      const id = Math.max(0, ...resources.map((r) => r.id)) + 1;
      setResources((previous) => [{ ...updatedForm, id }, ...previous]);
      setNotice("Resource added successfully.");
    }

    setModal(null);
    setFormError("");
  }

  function changeStatus(resource: Resource, status: ResourceStatus) {
    setResources((previous) =>
      previous.map((item) =>
        item.id === resource.id
          ? {
              ...item,
              status,
              updatedAt: new Date().toISOString().slice(0, 10),
            }
          : item,
      ),
    );
    setMenuId(null);
    setNotice(`${resource.name} is now ${status.toLowerCase()}.`);
  }

  function deleteResource(resource: Resource) {
    const confirmed = window.confirm(
      `Delete "${resource.name}" from this demo resource directory?`,
    );
    if (!confirmed) return;

    setResources((previous) =>
      previous.filter((item) => item.id !== resource.id),
    );
    setMenuId(null);
    setModal(null);
    setNotice("Resource removed from the directory.");
  }

  function exportCsv() {
    const headers = [
      "Name",
      "Description",
      "Type",
      "Department",
      "Owner",
      "Size MB",
      "Status",
      "Visibility",
      "Created",
      "Updated",
      "Downloads",
      "Tags",
    ];

    const rows = filteredResources.map((r) => [
      r.name,
      r.description,
      r.type,
      r.department,
      r.owner,
      r.size,
      r.status,
      r.visibility,
      r.createdAt,
      r.updatedAt,
      r.downloads,
      r.tags,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "modelnow-workspace-resources.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice("Resource directory exported as CSV.");
  }

  const page: CSSProperties = {
    minHeight: "100vh",
    background: "#f6f8fb",
    color: "#172033",
    padding: 28,
    fontFamily: "Arial, Helvetica, sans-serif",
  };

  const card: CSSProperties = {
    background: "#fff",
    border: "1px solid #e7ebf1",
    borderRadius: 14,
    padding: 18,
  };

  const muted: CSSProperties = { color: "#778195", fontSize: 12 };

  const labelStyle: CSSProperties = {
    display: "block",
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 7,
    color: "#475467",
  };

  return (
    <main style={page}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 18,
          flexWrap: "wrap",
          marginBottom: 24,
        }}
      >
        <div>
          <div style={{ ...muted, marginBottom: 8 }}>
            Admin / Workspace / Workspace Resources
          </div>
          <h1
            style={{
              fontSize: 27,
              letterSpacing: "-0.8px",
              margin: "0 0 8px",
              fontWeight: 750,
            }}
          >
            Workspace Resources
          </h1>
          <p style={{ ...muted, margin: 0, fontSize: 13 }}>
            Organize shared documents, datasets, links, and team assets.
          </p>
        </div>

        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          <button style={buttonStyle} onClick={exportCsv}>
            <ArrowDownToLine size={15} /> Export CSV
          </button>
          <button
            style={{
              ...buttonStyle,
              background: "#315fe9",
              borderColor: "#315fe9",
              color: "#fff",
              padding: "10px 15px",
            }}
            onClick={openCreate}
          >
            <Plus size={16} /> Add resource
          </button>
        </div>
      </div>

      {notice && (
        <div
          role="status"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            background: "#ecfdf3",
            border: "1px solid #abefc6",
            color: "#067647",
            borderRadius: 10,
            padding: "11px 14px",
            marginBottom: 18,
            fontSize: 13,
          }}
        >
          <span>
            <Check size={15} style={{ verticalAlign: "middle", marginRight: 7 }} />
            {notice}
          </span>
          <button
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
            style={{ ...buttonStyle, padding: 4, border: "none" }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))",
          gap: 14,
          marginBottom: 22,
        }}
      >
        {[
          {
            label: "Total resources",
            value: resources.length,
            detail: "Registered in workspace",
            icon: Folder,
            color: "#315fe9",
          },
          {
            label: "Active resources",
            value: activeResources,
            detail: "Available for use",
            icon: Check,
            color: "#16845b",
          },
          {
            label: "Storage used",
            value: formatSize(totalSize),
            detail: "Excludes archived resources",
            icon: HardDrive,
            color: "#7c5ce7",
          },
          {
            label: "Restricted",
            value: restrictedResources,
            detail: "Requires controlled access",
            icon: ShieldCheck,
            color: "#c17b16",
          },
          {
            label: "Resource usage",
            value: totalDownloads.toLocaleString("en-IN"),
            detail: "Recorded demo downloads",
            icon: BarChart3,
            color: "#0f8b9a",
          },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} style={card}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 18,
                }}
              >
                <span style={{ ...muted, fontWeight: 600 }}>{metric.label}</span>
                <span
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    display: "grid",
                    placeItems: "center",
                    background: `${metric.color}12`,
                    color: metric.color,
                  }}
                >
                  <Icon size={17} />
                </span>
              </div>
              <div
                style={{
                  fontSize: typeof metric.value === "string" ? 22 : 27,
                  fontWeight: 750,
                  letterSpacing: "-0.6px",
                  marginBottom: 7,
                }}
              >
                {metric.value}
              </div>
              <div style={muted}>{metric.detail}</div>
            </div>
          );
        })}
      </section>

      <section style={{ ...card, padding: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: "19px 20px",
            borderBottom: "1px solid #edf0f4",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <h2 style={{ fontSize: 16, margin: "0 0 5px" }}>
              Resource directory
            </h2>
            <p style={{ ...muted, margin: 0 }}>
              {filteredResources.length} resources found
            </p>
          </div>

          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => setView("table")}
              style={{
                ...buttonStyle,
                background: view === "table" ? "#edf2ff" : "#fff",
                borderColor: view === "table" ? "#c7d5ff" : "#dce2ea",
                color: view === "table" ? "#315fe9" : "#344054",
              }}
            >
              <FileText size={14} /> Table
            </button>
            <button
              onClick={() => setView("grid")}
              style={{
                ...buttonStyle,
                background: view === "grid" ? "#edf2ff" : "#fff",
                borderColor: view === "grid" ? "#c7d5ff" : "#dce2ea",
                color: view === "grid" ? "#315fe9" : "#344054",
              }}
            >
              <Folder size={14} /> Grid
            </button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))",
            gap: 10,
            padding: "16px 20px",
            borderBottom: "1px solid #edf0f4",
          }}
        >
          <div style={{ position: "relative" }}>
            <Search
              size={16}
              color="#98a2b3"
              style={{ position: "absolute", left: 11, top: 11 }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search resources..."
              style={{ ...inputStyle, paddingLeft: 35 }}
            />
          </div>

          <div style={{ position: "relative" }}>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{ ...inputStyle, appearance: "none" }}
            >
              {["All", "Document", "Dataset", "Image", "Archive", "Link", "Other"].map(
                (value) => (
                  <option key={value}>{value}</option>
                ),
              )}
            </select>
            <ChevronDown
              size={14}
              style={{ position: "absolute", right: 10, top: 12, pointerEvents: "none" }}
            />
          </div>

          <div style={{ position: "relative" }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ ...inputStyle, appearance: "none" }}
            >
              {["All", "Active", "Restricted", "Archived"].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
            <ChevronDown
              size={14}
              style={{ position: "absolute", right: 10, top: 12, pointerEvents: "none" }}
            />
          </div>

          <div style={{ position: "relative" }}>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              style={{ ...inputStyle, appearance: "none" }}
            >
              {["All", "Engineering", "Research", "Operations", "Product", "Finance", "Sales", "HR"].map(
                (value) => (
                  <option key={value}>{value}</option>
                ),
              )}
            </select>
            <ChevronDown
              size={14}
              style={{ position: "absolute", right: 10, top: 12, pointerEvents: "none" }}
            />
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              fontSize: 12,
              color: "#475467",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
            />
            Include archived
          </label>
        </div>

        {view === "table" ? (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                minWidth: 1000,
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead>
                <tr style={{ background: "#fafbfc" }}>
                  {[
                    "RESOURCE",
                    "TYPE",
                    "DEPARTMENT",
                    "OWNER",
                    "SIZE",
                    "VISIBILITY",
                    "STATUS",
                    "",
                  ].map((heading) => (
                    <th
                      key={heading}
                      style={{
                        padding: "13px 15px",
                        color: "#8490a2",
                        fontSize: 10,
                        letterSpacing: "0.7px",
                        fontWeight: 700,
                        borderBottom: "1px solid #edf0f4",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredResources.map((resource) => (
                  <tr
                    key={resource.id}
                    style={{ borderBottom: "1px solid #f0f2f5" }}
                  >
                    <td style={{ padding: 15, maxWidth: 280 }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <span
                          style={{
                            width: 38,
                            height: 38,
                            display: "grid",
                            placeItems: "center",
                            borderRadius: 10,
                            background: `${typeColors[resource.type]}12`,
                            flexShrink: 0,
                          }}
                        >
                          <ResourceIcon type={resource.type} size={18} />
                        </span>
                        <div>
                          <button
                            onClick={() => openDetails(resource)}
                            style={{
                              padding: 0,
                              border: 0,
                              background: "transparent",
                              color: "#172033",
                              cursor: "pointer",
                              fontWeight: 700,
                              fontSize: 12,
                              textAlign: "left",
                            }}
                          >
                            {resource.name}
                          </button>
                          <div
                            style={{
                              ...muted,
                              marginTop: 5,
                              maxWidth: 230,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {resource.description || "No description"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: 15 }}>
                      <span
                        style={{
                          color: typeColors[resource.type],
                          background: `${typeColors[resource.type]}12`,
                          borderRadius: 20,
                          padding: "6px 9px",
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {resource.type}
                      </span>
                    </td>
                    <td style={{ padding: 15, fontSize: 12 }}>
                      {resource.department}
                    </td>
                    <td style={{ padding: 15, fontSize: 12, fontWeight: 600 }}>
                      {resource.owner}
                    </td>
                    <td style={{ padding: 15, fontSize: 12 }}>
                      {formatSize(resource.size)}
                    </td>
                    <td style={{ padding: 15, fontSize: 11 }}>
                      {resource.visibility}
                    </td>
                    <td style={{ padding: 15 }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          color: statusColors[resource.status],
                          background: `${statusColors[resource.status]}12`,
                          borderRadius: 20,
                          padding: "6px 9px",
                          fontSize: 11,
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: statusColors[resource.status],
                          }}
                        />
                        {resource.status}
                      </span>
                    </td>
                    <td style={{ padding: 15, position: "relative" }}>
                      <button
                        aria-label={`Actions for ${resource.name}`}
                        onClick={() =>
                          setMenuId(menuId === resource.id ? null : resource.id)
                        }
                        style={{ ...buttonStyle, padding: 7 }}
                      >
                        <MoreHorizontal size={16} />
                      </button>

                      {menuId === resource.id && (
                        <div
                          style={{
                            position: "absolute",
                            zIndex: 10,
                            right: 12,
                            top: 48,
                            width: 175,
                            padding: 5,
                            background: "#fff",
                            border: "1px solid #e2e7ef",
                            borderRadius: 10,
                            boxShadow: "0 10px 30px #10182818",
                          }}
                        >
                          {[
                            {
                              label: "View details",
                              icon: Eye,
                              action: () => openDetails(resource),
                            },
                            {
                              label: "Edit resource",
                              icon: Pencil,
                              action: () => openEdit(resource),
                            },
                            ...(resource.status === "Archived"
                              ? [
                                  {
                                    label: "Restore resource",
                                    icon: Check,
                                    action: () => changeStatus(resource, "Active"),
                                  },
                                ]
                              : [
                                  {
                                    label: "Archive resource",
                                    icon: Archive,
                                    action: () => changeStatus(resource, "Archived"),
                                  },
                                ]),
                            {
                              label: "Delete resource",
                              icon: Trash2,
                              action: () => deleteResource(resource),
                            },
                          ].map((item) => {
                            const Icon = item.icon;
                            return (
                              <button
                                key={item.label}
                                onClick={item.action}
                                style={{
                                  width: "100%",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 9,
                                  border: 0,
                                  background: "#fff",
                                  padding: "10px 9px",
                                  borderRadius: 7,
                                  textAlign: "left",
                                  cursor: "pointer",
                                  fontSize: 12,
                                  color: item.label.startsWith("Delete")
                                    ? "#d92d20"
                                    : "#344054",
                                }}
                              >
                                <Icon size={14} /> {item.label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: 14,
              padding: 20,
            }}
          >
            {filteredResources.map((resource) => (
              <article
                key={resource.id}
                style={{
                  border: "1px solid #e7ebf1",
                  borderRadius: 12,
                  padding: 16,
                  background: "#fff",
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 10,
                  }}
                >
                  <span
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 11,
                      display: "grid",
                      placeItems: "center",
                      background: `${typeColors[resource.type]}12`,
                    }}
                  >
                    <ResourceIcon type={resource.type} size={20} />
                  </span>
                  <span
                    style={{
                      color: statusColors[resource.status],
                      background: `${statusColors[resource.status]}12`,
                      padding: "5px 8px",
                      borderRadius: 20,
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    {resource.status}
                  </span>
                </div>
                <h3
                  style={{
                    fontSize: 14,
                    margin: "15px 0 7px",
                    overflowWrap: "anywhere",
                  }}
                >
                  {resource.name}
                </h3>
                <p
                  style={{
                    fontSize: 12,
                    color: "#778195",
                    lineHeight: 1.6,
                    minHeight: 38,
                    margin: "0 0 14px",
                  }}
                >
                  {resource.description || "No description provided."}
                </p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderTop: "1px solid #edf0f4",
                    paddingTop: 12,
                    fontSize: 11,
                    color: "#667085",
                  }}
                >
                  <span>{resource.department}</span>
                  <span>{formatSize(resource.size)}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginTop: 14,
                  }}
                >
                  <button
                    style={{ ...buttonStyle, flex: 1 }}
                    onClick={() => openDetails(resource)}
                  >
                    <Eye size={14} /> Details
                  </button>
                  <button
                    style={{ ...buttonStyle, flex: 1 }}
                    onClick={() => openEdit(resource)}
                  >
                    <Pencil size={14} /> Edit
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {filteredResources.length === 0 && (
          <div style={{ padding: "55px 20px", textAlign: "center" }}>
            <Folder size={30} color="#98a2b3" />
            <h3 style={{ fontSize: 15, margin: "12px 0 6px" }}>
              No resources found
            </h3>
            <p style={{ ...muted, margin: "0 0 15px" }}>
              Try different filters or add a resource to this workspace.
            </p>
            <button style={buttonStyle} onClick={openCreate}>
              <Plus size={14} /> Add resource
            </button>
          </div>
        )}

        <div
          style={{
            padding: "13px 20px",
            borderTop: "1px solid #edf0f4",
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
            flexWrap: "wrap",
            color: "#778195",
            fontSize: 11,
          }}
        >
          <span>
            Showing {filteredResources.length} of {resources.length} resources
          </span>
          <span>Workspace resource directory</span>
        </div>
      </section>

      {modal && (
        <div
          onClick={() => setModal(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "#10182880",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: modal === "details" ? 620 : 680,
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 24px 70px #10182830",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                padding: "21px 23px",
                borderBottom: "1px solid #edf0f4",
              }}
            >
              <div>
                <h2 style={{ fontSize: 18, margin: "0 0 6px" }}>
                  {modal === "create"
                    ? "Add workspace resource"
                    : modal === "edit"
                      ? "Edit resource"
                      : selectedResource?.name}
                </h2>
                <p style={{ ...muted, margin: 0 }}>
                  {modal === "details"
                    ? "Resource information and access configuration."
                    : "Manage resource metadata and visibility."}
                </p>
              </div>
              <button
                aria-label="Close modal"
                onClick={() => setModal(null)}
                style={{ ...buttonStyle, padding: 6 }}
              >
                <X size={16} />
              </button>
            </div>

            {modal === "details" && selectedResource ? (
              <div style={{ padding: 23 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 12,
                      display: "grid",
                      placeItems: "center",
                      background: `${typeColors[selectedResource.type]}12`,
                    }}
                  >
                    <ResourceIcon type={selectedResource.type} size={24} />
                  </span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>
                      {selectedResource.name}
                    </div>
                    <div style={{ ...muted, marginTop: 5 }}>
                      {selectedResource.type} · {formatSize(selectedResource.size)}
                    </div>
                  </div>
                </div>

                <p
                  style={{
                    fontSize: 13,
                    lineHeight: 1.7,
                    color: "#475467",
                    margin: "18px 0",
                  }}
                >
                  {selectedResource.description || "No description provided."}
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                    gap: 12,
                  }}
                >
                  {[
                    ["Department", selectedResource.department],
                    ["Owner", selectedResource.owner],
                    ["Visibility", selectedResource.visibility],
                    ["Status", selectedResource.status],
                    ["Created", formatDate(selectedResource.createdAt)],
                    ["Last updated", formatDate(selectedResource.updatedAt)],
                    ["Downloads", String(selectedResource.downloads)],
                    ["Tags", selectedResource.tags || "None"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #edf0f4",
                        borderRadius: 10,
                        padding: 13,
                        overflowWrap: "anywhere",
                      }}
                    >
                      <div style={{ ...muted, marginBottom: 8 }}>{label}</div>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{value}</div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 9,
                    marginTop: 22,
                  }}
                >
                  <button style={buttonStyle} onClick={() => setModal(null)}>
                    Close
                  </button>
                  <button
                    style={{
                      ...buttonStyle,
                      background: "#315fe9",
                      borderColor: "#315fe9",
                      color: "#fff",
                    }}
                    onClick={() => openEdit(selectedResource)}
                  >
                    <Pencil size={14} /> Edit resource
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={saveResource} style={{ padding: 23 }}>
                {formError && (
                  <div
                    style={{
                      color: "#b42318",
                      background: "#fef3f2",
                      border: "1px solid #fecdca",
                      borderRadius: 9,
                      padding: 11,
                      fontSize: 12,
                      marginBottom: 15,
                    }}
                  >
                    <CircleAlert
                      size={14}
                      style={{ verticalAlign: "middle", marginRight: 6 }}
                    />
                    {formError}
                  </div>
                )}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                    gap: 15,
                  }}
                >
                  <label style={{ gridColumn: "1 / -1" }}>
                    <span style={labelStyle}>Resource name *</span>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => updateForm("name", e.target.value)}
                      placeholder="Enter a resource name"
                      style={inputStyle}
                    />
                  </label>

                  <label style={{ gridColumn: "1 / -1" }}>
                    <span style={labelStyle}>Description</span>
                    <textarea
                      value={form.description}
                      onChange={(e) => updateForm("description", e.target.value)}
                      rows={3}
                      placeholder="Describe the resource..."
                      style={{ ...inputStyle, resize: "vertical" }}
                    />
                  </label>

                  <label>
                    <span style={labelStyle}>Resource type</span>
                    <select
                      value={form.type}
                      onChange={(e) =>
                        updateForm("type", e.target.value as ResourceType)
                      }
                      style={inputStyle}
                    >
                      {["Document", "Dataset", "Image", "Archive", "Link", "Other"].map(
                        (value) => (
                          <option key={value}>{value}</option>
                        ),
                      )}
                    </select>
                  </label>

                  <label>
                    <span style={labelStyle}>Department</span>
                    <select
                      value={form.department}
                      onChange={(e) => updateForm("department", e.target.value)}
                      style={inputStyle}
                    >
                      {["Engineering", "Research", "Operations", "Product", "Finance", "Sales", "HR"].map(
                        (value) => (
                          <option key={value}>{value}</option>
                        ),
                      )}
                    </select>
                  </label>

                  <label>
                    <span style={labelStyle}>Owner *</span>
                    <input
                      required
                      value={form.owner}
                      onChange={(e) => updateForm("owner", e.target.value)}
                      placeholder="Resource owner"
                      style={inputStyle}
                    />
                  </label>

                  <label>
                    <span style={labelStyle}>Size (MB)</span>
                    <input
                      type="number"
                      min={0}
                      step="0.1"
                      value={form.size}
                      onChange={(e) =>
                        updateForm("size", Math.max(0, Number(e.target.value)))
                      }
                      style={inputStyle}
                    />
                  </label>

                  <label>
                    <span style={labelStyle}>Status</span>
                    <select
                      value={form.status}
                      onChange={(e) =>
                        updateForm("status", e.target.value as ResourceStatus)
                      }
                      style={inputStyle}
                    >
                      {["Active", "Restricted", "Archived"].map((value) => (
                        <option key={value}>{value}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span style={labelStyle}>Visibility</span>
                    <select
                      value={form.visibility}
                      onChange={(e) =>
                        updateForm(
                          "visibility",
                          e.target.value as Resource["visibility"],
                        )
                      }
                      style={inputStyle}
                    >
                      {["Workspace", "Team only", "Restricted"].map((value) => (
                        <option key={value}>{value}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span style={labelStyle}>Created date</span>
                    <input
                      type="date"
                      value={form.createdAt}
                      onChange={(e) => updateForm("createdAt", e.target.value)}
                      style={inputStyle}
                    />
                  </label>

                  <label>
                    <span style={labelStyle}>Tags</span>
                    <input
                      value={form.tags}
                      onChange={(e) => updateForm("tags", e.target.value)}
                      placeholder="e.g. engineering, docs"
                      style={inputStyle}
                    />
                  </label>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 9,
                    marginTop: 23,
                    paddingTop: 17,
                    borderTop: "1px solid #edf0f4",
                  }}
                >
                  <button
                    type="button"
                    style={buttonStyle}
                    onClick={() => setModal(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      ...buttonStyle,
                      background: "#315fe9",
                      borderColor: "#315fe9",
                      color: "#fff",
                      padding: "10px 16px",
                    }}
                  >
                    <Check size={15} />
                    {modal === "edit" ? "Save changes" : "Add resource"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <footer
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          marginTop: 18,
          color: "#98a2b3",
          fontSize: 11,
        }}
      >
        <Cloud size={13} />
        ModelNow Workspace Resources
        <span style={{ marginLeft: "auto" }}>Resource administration</span>
      </footer>
    </main>
  );
}
