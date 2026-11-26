
"use client";

import { useMemo, useState, type CSSProperties, type FormEvent } from "react";
import {
  Megaphone,
  Plus,
  Search,
  CalendarDays,
  Clock3,
  Users,
  Eye,
  Pencil,
  Trash2,
  MoreHorizontal,
  X,
  Check,
  Pin,
  PinOff,
  Send,
  Archive,
  Bell,
  AlertTriangle,
  ChevronDown,
  CircleCheck,
  FileText,
  BarChart3,
  Building2,
  CircleAlert,
} from "lucide-react";

type AnnouncementStatus = "Draft" | "Scheduled" | "Published" | "Archived";
type AnnouncementPriority = "Low" | "Normal" | "High" | "Urgent";
type Audience = "Everyone" | "Engineering" | "Research" | "Operations" | "Product" | "Managers";

type Announcement = {
  id: number;
  title: string;
  content: string;
  category: string;
  priority: AnnouncementPriority;
  status: AnnouncementStatus;
  audience: Audience;
  author: string;
  publishDate: string;
  expiryDate: string;
  pinned: boolean;
  acknowledgements: number;
  views: number;
};

const initialAnnouncements: Announcement[] = [
  {
    id: 1,
    title: "ModelNow Platform Release Update",
    content:
      "The latest platform improvements include updates to model routing, workspace management, and monitoring. Teams should review the release notes and validate their workflows.",
    category: "Product Update",
    priority: "High",
    status: "Published",
    audience: "Everyone",
    author: "Sai Kumar",
    publishDate: "2026-11-02",
    expiryDate: "2026-12-02",
    pinned: true,
    acknowledgements: 38,
    views: 142,
  },
  {
    id: 2,
    title: "Security Review and Access Policy",
    content:
      "Workspace owners should review team access, remove outdated permissions, and report any unexpected access. Please follow the internal security review process.",
    category: "Security",
    priority: "Urgent",
    status: "Published",
    audience: "Managers",
    author: "Rahul Verma",
    publishDate: "2026-11-01",
    expiryDate: "2026-11-15",
    pinned: true,
    acknowledgements: 16,
    views: 51,
  },
  {
    id: 3,
    title: "Engineering Sprint Planning",
    content:
      "Engineering teams are requested to update sprint priorities, identify blockers, and confirm owners before the next planning session.",
    category: "Team Update",
    priority: "Normal",
    status: "Published",
    audience: "Engineering",
    author: "Pujitha",
    publishDate: "2026-10-30",
    expiryDate: "2026-11-12",
    pinned: false,
    acknowledgements: 12,
    views: 46,
  },
  {
    id: 4,
    title: "Research Evaluation Guidelines",
    content:
      "Please use the approved evaluation dataset and record quality, latency, and cost measurements when reviewing model candidates.",
    category: "Policy",
    priority: "High",
    status: "Scheduled",
    audience: "Research",
    author: "Ananya Rao",
    publishDate: "2026-11-08",
    expiryDate: "2026-12-08",
    pinned: false,
    acknowledgements: 0,
    views: 0,
  },
  {
    id: 5,
    title: "November Team Knowledge Sharing",
    content:
      "Teams can share useful technical learnings, product improvements, and project outcomes. Please submit suggested topics to your team lead.",
    category: "Event",
    priority: "Normal",
    status: "Draft",
    audience: "Everyone",
    author: "Meera Shah",
    publishDate: "2026-11-12",
    expiryDate: "2026-11-30",
    pinned: false,
    acknowledgements: 0,
    views: 0,
  },
  {
    id: 6,
    title: "Operations Maintenance Notice",
    content:
      "A planned maintenance window is being coordinated. The operations team will share the confirmed timing and any service impact before work begins.",
    category: "Maintenance",
    priority: "High",
    status: "Draft",
    audience: "Operations",
    author: "Kiran Das",
    publishDate: "2026-11-10",
    expiryDate: "2026-11-20",
    pinned: false,
    acknowledgements: 0,
    views: 0,
  },
  {
    id: 7,
    title: "Previous Workspace Migration Notice",
    content:
      "This announcement is retained for reference. The previous workspace migration communication has been archived.",
    category: "Archive",
    priority: "Low",
    status: "Archived",
    audience: "Everyone",
    author: "Arjun Patel",
    publishDate: "2026-08-10",
    expiryDate: "2026-09-10",
    pinned: false,
    acknowledgements: 42,
    views: 119,
  },
];

const emptyAnnouncement: Omit<Announcement, "id"> = {
  title: "",
  content: "",
  category: "General",
  priority: "Normal",
  status: "Draft",
  audience: "Everyone",
  author: "",
  publishDate: "2026-11-04",
  expiryDate: "2026-12-04",
  pinned: false,
  acknowledgements: 0,
  views: 0,
};

const statusColors: Record<AnnouncementStatus, string> = {
  Draft: "#64748b",
  Scheduled: "#7c5ce7",
  Published: "#16845b",
  Archived: "#98a2b3",
};

const priorityColors: Record<AnnouncementPriority, string> = {
  Low: "#64748b",
  Normal: "#2563eb",
  High: "#c17b16",
  Urgent: "#dc4545",
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

function formatDate(value: string) {
  if (!value) return "Not set";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function CompanyAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(
    initialAnnouncements,
  );
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [audienceFilter, setAudienceFilter] = useState("All");
  const [showArchived, setShowArchived] = useState(false);
  const [selectedTab, setSelectedTab] = useState("All");
  const [modal, setModal] = useState<"create" | "edit" | "details" | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] =
    useState<Omit<Announcement, "id">>(emptyAnnouncement);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [menuId, setMenuId] = useState<number | null>(null);

  const selectedAnnouncement =
    announcements.find((item) => item.id === selectedId) ?? null;

  const filteredAnnouncements = useMemo(() => {
    const query = search.toLowerCase().trim();

    return announcements.filter((item) => {
      const matchesSearch =
        !query ||
        [
          item.title,
          item.content,
          item.category,
          item.author,
          item.audience,
        ].some((value) => value.toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;
      const matchesPriority =
        priorityFilter === "All" || item.priority === priorityFilter;
      const matchesAudience =
        audienceFilter === "All" || item.audience === audienceFilter;
      const matchesArchived = showArchived || item.status !== "Archived";
      const matchesTab =
        selectedTab === "All" ||
        (selectedTab === "Pinned" && item.pinned) ||
        (selectedTab === "Published" && item.status === "Published") ||
        (selectedTab === "Drafts" && item.status === "Draft") ||
        (selectedTab === "Scheduled" && item.status === "Scheduled");

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesAudience &&
        matchesArchived &&
        matchesTab
      );
    });
  }, [
    announcements,
    search,
    statusFilter,
    priorityFilter,
    audienceFilter,
    showArchived,
    selectedTab,
  ]);

  const publishedCount = announcements.filter(
    (item) => item.status === "Published",
  ).length;
  const draftCount = announcements.filter(
    (item) => item.status === "Draft",
  ).length;
  const scheduledCount = announcements.filter(
    (item) => item.status === "Scheduled",
  ).length;
  const totalViews = announcements.reduce((sum, item) => sum + item.views, 0);
  const totalAcknowledgements = announcements.reduce(
    (sum, item) => sum + item.acknowledgements,
    0,
  );

  function openCreate() {
    setSelectedId(null);
    setForm({
      ...emptyAnnouncement,
      author: "",
      publishDate: new Date().toISOString().slice(0, 10),
      expiryDate: new Date(Date.now() + 30 * 86400000)
        .toISOString()
        .slice(0, 10),
    });
    setFormError("");
    setModal("create");
  }

  function openEdit(item: Announcement) {
    const { id: _id, ...data } = item;
    setSelectedId(item.id);
    setForm(data);
    setFormError("");
    setMenuId(null);
    setModal("edit");
  }

  function openDetails(item: Announcement) {
    setSelectedId(item.id);
    setMenuId(null);
    setModal("details");
  }

  function updateForm<K extends keyof Omit<Announcement, "id">>(
    key: K,
    value: Omit<Announcement, "id">[K],
  ) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  function saveAnnouncement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.title.trim() || !form.content.trim() || !form.author.trim()) {
      setFormError("Title, announcement content, and author are required.");
      return;
    }

    if (form.expiryDate && form.expiryDate < form.publishDate) {
      setFormError("Expiry date cannot be earlier than the publish date.");
      return;
    }

    const cleanForm = {
      ...form,
      title: form.title.trim(),
      content: form.content.trim(),
      author: form.author.trim(),
    };

    if (modal === "edit" && selectedId !== null) {
      setAnnouncements((previous) =>
        previous.map((item) =>
          item.id === selectedId ? { ...cleanForm, id: selectedId } : item,
        ),
      );
      setNotice("Announcement updated.");
    } else {
      const id = Math.max(0, ...announcements.map((item) => item.id)) + 1;
      setAnnouncements((previous) => [{ ...cleanForm, id }, ...previous]);
      setNotice("Announcement created.");
    }

    setModal(null);
    setFormError("");
  }

  function changeStatus(item: Announcement, status: AnnouncementStatus) {
    setAnnouncements((previous) =>
      previous.map((announcement) =>
        announcement.id === item.id ? { ...announcement, status } : announcement,
      ),
    );
    setMenuId(null);
    setNotice(`Announcement moved to ${status.toLowerCase()}.`);
  }

  function togglePinned(item: Announcement) {
    setAnnouncements((previous) =>
      previous.map((announcement) =>
        announcement.id === item.id
          ? { ...announcement, pinned: !announcement.pinned }
          : announcement,
      ),
    );
    setMenuId(null);
    setNotice(item.pinned ? "Announcement unpinned." : "Announcement pinned.");
  }

  function deleteAnnouncement(item: Announcement) {
    if (!window.confirm(`Delete "${item.title}"?`)) return;

    setAnnouncements((previous) =>
      previous.filter((announcement) => announcement.id !== item.id),
    );
    setModal(null);
    setMenuId(null);
    setNotice("Announcement deleted.");
  }

  function exportCsv() {
    const headers = [
      "Title",
      "Category",
      "Priority",
      "Status",
      "Audience",
      "Author",
      "Publish Date",
      "Expiry Date",
      "Pinned",
      "Views",
      "Acknowledgements",
      "Content",
    ];

    const rows = filteredAnnouncements.map((item) => [
      item.title,
      item.category,
      item.priority,
      item.status,
      item.audience,
      item.author,
      item.publishDate,
      item.expiryDate,
      item.pinned ? "Yes" : "No",
      item.views,
      item.acknowledgements,
      item.content,
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
    anchor.download = "modelnow-announcements.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice("Announcements exported as CSV.");
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
            Admin / Workspace / Company Announcements
          </div>
          <h1
            style={{
              fontSize: 27,
              letterSpacing: "-0.8px",
              margin: "0 0 8px",
              fontWeight: 750,
            }}
          >
            Company Announcements
          </h1>
          <p style={{ ...muted, margin: 0, fontSize: 13 }}>
            Publish company updates, policies, notices, and team communications.
          </p>
        </div>

        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          <button style={buttonStyle} onClick={exportCsv}>
            <FileText size={15} /> Export CSV
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
            <Plus size={16} /> Create announcement
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
            label: "Total announcements",
            value: announcements.length,
            detail: "All announcement records",
            icon: Megaphone,
            color: "#315fe9",
          },
          {
            label: "Published",
            value: publishedCount,
            detail: "Currently published records",
            icon: CircleCheck,
            color: "#16845b",
          },
          {
            label: "Scheduled",
            value: scheduledCount,
            detail: "Awaiting publication",
            icon: CalendarDays,
            color: "#7c5ce7",
          },
          {
            label: "Drafts",
            value: draftCount,
            detail: "Not yet published",
            icon: FileText,
            color: "#c17b16",
          },
          {
            label: "Recorded views",
            value: totalViews.toLocaleString("en-IN"),
            detail: "Sample engagement data",
            icon: Eye,
            color: "#0f8b9a",
          },
          {
            label: "Acknowledgements",
            value: totalAcknowledgements.toLocaleString("en-IN"),
            detail: "Sample acknowledgement count",
            icon: Users,
            color: "#64748b",
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
              <div style={{ fontSize: 27, fontWeight: 750, marginBottom: 7 }}>
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
            padding: "19px 20px 0",
            borderBottom: "1px solid #edf0f4",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 15,
            }}
          >
            <div>
              <h2 style={{ fontSize: 16, margin: "0 0 5px" }}>
                Announcement directory
              </h2>
              <p style={{ ...muted, margin: 0 }}>
                {filteredAnnouncements.length} announcements found
              </p>
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

          <div
            style={{
              display: "flex",
              gap: 18,
              flexWrap: "wrap",
              overflowX: "auto",
            }}
          >
            {["All", "Pinned", "Published", "Drafts", "Scheduled"].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                style={{
                  border: 0,
                  borderBottom:
                    selectedTab === tab
                      ? "2px solid #315fe9"
                      : "2px solid transparent",
                  background: "transparent",
                  padding: "10px 1px 12px",
                  fontSize: 12,
                  fontWeight: selectedTab === tab ? 700 : 500,
                  color: selectedTab === tab ? "#315fe9" : "#778195",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {tab}
              </button>
            ))}
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
              placeholder="Search announcements..."
              style={{ ...inputStyle, paddingLeft: 35 }}
            />
          </div>

          <div style={{ position: "relative" }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ ...inputStyle, appearance: "none" }}
            >
              {["All", "Draft", "Scheduled", "Published", "Archived"].map(
                (value) => (
                  <option key={value}>{value}</option>
                ),
              )}
            </select>
            <ChevronDown
              size={14}
              style={{
                position: "absolute",
                right: 10,
                top: 12,
                pointerEvents: "none",
              }}
            />
          </div>

          <div style={{ position: "relative" }}>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{ ...inputStyle, appearance: "none" }}
            >
              {["All", "Low", "Normal", "High", "Urgent"].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
            <ChevronDown
              size={14}
              style={{
                position: "absolute",
                right: 10,
                top: 12,
                pointerEvents: "none",
              }}
            />
          </div>

          <div style={{ position: "relative" }}>
            <select
              value={audienceFilter}
              onChange={(e) => setAudienceFilter(e.target.value)}
              style={{ ...inputStyle, appearance: "none" }}
            >
              {[
                "All",
                "Everyone",
                "Engineering",
                "Research",
                "Operations",
                "Product",
                "Managers",
              ].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
            <ChevronDown
              size={14}
              style={{
                position: "absolute",
                right: 10,
                top: 12,
                pointerEvents: "none",
              }}
            />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 14,
            padding: 20,
          }}
        >
          {filteredAnnouncements.map((item) => (
            <article
              key={item.id}
              style={{
                border: "1px solid #e7ebf1",
                borderRadius: 13,
                padding: 17,
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
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      width: 37,
                      height: 37,
                      borderRadius: 10,
                      display: "grid",
                      placeItems: "center",
                      color: "#315fe9",
                      background: "#edf2ff",
                      flexShrink: 0,
                    }}
                  >
                    <Megaphone size={18} />
                  </span>
                  <div>
                    <div style={{ fontSize: 10, color: "#778195" }}>
                      {item.category}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: statusColors[item.status],
                        marginTop: 4,
                      }}
                    >
                      {item.status}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                  {item.pinned && <Pin size={14} color="#315fe9" />}
                  <button
                    aria-label={`Actions for ${item.title}`}
                    onClick={() =>
                      setMenuId(menuId === item.id ? null : item.id)
                    }
                    style={{ ...buttonStyle, padding: 6 }}
                  >
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>

              <button
                onClick={() => openDetails(item)}
                style={{
                  border: 0,
                  background: "transparent",
                  color: "#172033",
                  padding: 0,
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 750,
                  marginTop: 17,
                  lineHeight: 1.5,
                }}
              >
                {item.title}
              </button>

              <p
                style={{
                  fontSize: 12,
                  lineHeight: 1.7,
                  color: "#667085",
                  margin: "9px 0 14px",
                  minHeight: 60,
                }}
              >
                {item.content.length > 150
                  ? `${item.content.slice(0, 150)}…`
                  : item.content}
              </p>

              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                <span
                  style={{
                    color: priorityColors[item.priority],
                    background: `${priorityColors[item.priority]}12`,
                    padding: "5px 8px",
                    borderRadius: 20,
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  {item.priority} priority
                </span>
                <span
                  style={{
                    color: "#475467",
                    background: "#f2f4f7",
                    padding: "5px 8px",
                    borderRadius: 20,
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                >
                  <Users
                    size={11}
                    style={{ verticalAlign: "middle", marginRight: 4 }}
                  />
                  {item.audience}
                </span>
              </div>

              <div
                style={{
                  borderTop: "1px solid #edf0f4",
                  marginTop: 15,
                  paddingTop: 13,
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 8,
                  flexWrap: "wrap",
                  fontSize: 10,
                  color: "#778195",
                }}
              >
                <span>
                  <CalendarDays
                    size={12}
                    style={{ verticalAlign: "middle", marginRight: 4 }}
                  />
                  {formatDate(item.publishDate)}
                </span>
                <span>
                  <Eye
                    size={12}
                    style={{ verticalAlign: "middle", marginRight: 4 }}
                  />
                  {item.views} views
                </span>
              </div>

              {menuId === item.id && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 7,
                    paddingTop: 13,
                    marginTop: 12,
                    borderTop: "1px solid #edf0f4",
                  }}
                >
                  <button
                    style={buttonStyle}
                    onClick={() => openDetails(item)}
                  >
                    <Eye size={13} /> View
                  </button>
                  <button
                    style={buttonStyle}
                    onClick={() => openEdit(item)}
                  >
                    <Pencil size={13} /> Edit
                  </button>
                  <button
                    style={buttonStyle}
                    onClick={() => togglePinned(item)}
                  >
                    {item.pinned ? <PinOff size={13} /> : <Pin size={13} />}
                    {item.pinned ? "Unpin" : "Pin"}
                  </button>
                  {item.status !== "Published" && (
                    <button
                      style={buttonStyle}
                      onClick={() => changeStatus(item, "Published")}
                    >
                      <Send size={13} /> Publish
                    </button>
                  )}
                  {item.status !== "Archived" && (
                    <button
                      style={buttonStyle}
                      onClick={() => changeStatus(item, "Archived")}
                    >
                      <Archive size={13} /> Archive
                    </button>
                  )}
                  {item.status === "Archived" && (
                    <button
                      style={buttonStyle}
                      onClick={() => changeStatus(item, "Draft")}
                    >
                      <FileText size={13} /> Restore to draft
                    </button>
                  )}
                  <button
                    style={{ ...buttonStyle, color: "#d92d20" }}
                    onClick={() => deleteAnnouncement(item)}
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  marginTop: 13,
                  fontSize: 10,
                  color: "#98a2b3",
                }}
              >
                <span>By {item.author}</span>
                <span>Expires {formatDate(item.expiryDate)}</span>
              </div>
            </article>
          ))}
        </div>

        {filteredAnnouncements.length === 0 && (
          <div style={{ padding: "45px 20px", textAlign: "center" }}>
            <Megaphone size={30} color="#98a2b3" />
            <h3 style={{ fontSize: 15, margin: "12px 0 6px" }}>
              No announcements found
            </h3>
            <p style={{ ...muted, margin: "0 0 15px" }}>
              Try another filter or create a new announcement.
            </p>
            <button style={buttonStyle} onClick={openCreate}>
              <Plus size={14} /> Create announcement
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
            Showing {filteredAnnouncements.length} of {announcements.length} announcements
          </span>
          <span>Company communications management</span>
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
              maxWidth: modal === "details" ? 650 : 700,
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
                    ? "Create announcement"
                    : modal === "edit"
                      ? "Edit announcement"
                      : selectedAnnouncement?.title}
                </h2>
                <p style={{ ...muted, margin: 0 }}>
                  {modal === "details"
                    ? "Announcement content and publication information."
                    : "Write an update and configure its audience and publication status."}
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

            {modal === "details" && selectedAnnouncement ? (
              <div style={{ padding: 23 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span
                    style={{
                      color: statusColors[selectedAnnouncement.status],
                      background: `${statusColors[selectedAnnouncement.status]}12`,
                      borderRadius: 20,
                      padding: "6px 9px",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {selectedAnnouncement.status}
                  </span>
                  <span
                    style={{
                      color: priorityColors[selectedAnnouncement.priority],
                      background: `${priorityColors[selectedAnnouncement.priority]}12`,
                      borderRadius: 20,
                      padding: "6px 9px",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {selectedAnnouncement.priority} priority
                  </span>
                  {selectedAnnouncement.pinned && (
                    <span
                      style={{
                        color: "#315fe9",
                        background: "#edf2ff",
                        borderRadius: 20,
                        padding: "6px 9px",
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      <Pin size={11} style={{ verticalAlign: "middle", marginRight: 4 }} />
                      Pinned
                    </span>
                  )}
                </div>

                <div
                  style={{
                    whiteSpace: "pre-wrap",
                    overflowWrap: "anywhere",
                    fontSize: 13,
                    lineHeight: 1.8,
                    color: "#344054",
                    margin: "20px 0",
                  }}
                >
                  {selectedAnnouncement.content}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))",
                    gap: 12,
                  }}
                >
                  {[
                    ["Category", selectedAnnouncement.category],
                    ["Audience", selectedAnnouncement.audience],
                    ["Author", selectedAnnouncement.author],
                    ["Publish date", formatDate(selectedAnnouncement.publishDate)],
                    ["Expiry date", formatDate(selectedAnnouncement.expiryDate)],
                    ["Recorded views", String(selectedAnnouncement.views)],
                    ["Acknowledgements", String(selectedAnnouncement.acknowledgements)],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #edf0f4",
                        borderRadius: 10,
                        padding: 13,
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
                    onClick={() => openEdit(selectedAnnouncement)}
                  >
                    <Pencil size={14} /> Edit announcement
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={saveAnnouncement} style={{ padding: 23 }}>
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
                    <span style={labelStyle}>Announcement title *</span>
                    <input
                      required
                      value={form.title}
                      onChange={(e) => updateForm("title", e.target.value)}
                      placeholder="Enter announcement title"
                      style={inputStyle}
                    />
                  </label>

                  <label style={{ gridColumn: "1 / -1" }}>
                    <span style={labelStyle}>Announcement content *</span>
                    <textarea
                      required
                      rows={5}
                      value={form.content}
                      onChange={(e) => updateForm("content", e.target.value)}
                      placeholder="Write the company announcement..."
                      style={{ ...inputStyle, resize: "vertical" }}
                    />
                  </label>

                  <label>
                    <span style={labelStyle}>Category</span>
                    <select
                      value={form.category}
                      onChange={(e) => updateForm("category", e.target.value)}
                      style={inputStyle}
                    >
                      {[
                        "General",
                        "Product Update",
                        "Policy",
                        "Security",
                        "Maintenance",
                        "Team Update",
                        "Event",
                        "HR",
                      ].map((value) => (
                        <option key={value}>{value}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span style={labelStyle}>Audience</span>
                    <select
                      value={form.audience}
                      onChange={(e) =>
                        updateForm("audience", e.target.value as Audience)
                      }
                      style={inputStyle}
                    >
                      {[
                        "Everyone",
                        "Engineering",
                        "Research",
                        "Operations",
                        "Product",
                        "Managers",
                      ].map((value) => (
                        <option key={value}>{value}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span style={labelStyle}>Priority</span>
                    <select
                      value={form.priority}
                      onChange={(e) =>
                        updateForm(
                          "priority",
                          e.target.value as AnnouncementPriority,
                        )
                      }
                      style={inputStyle}
                    >
                      {["Low", "Normal", "High", "Urgent"].map((value) => (
                        <option key={value}>{value}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span style={labelStyle}>Publication status</span>
                    <select
                      value={form.status}
                      onChange={(e) =>
                        updateForm(
                          "status",
                          e.target.value as AnnouncementStatus,
                        )
                      }
                      style={inputStyle}
                    >
                      {["Draft", "Scheduled", "Published", "Archived"].map(
                        (value) => (
                          <option key={value}>{value}</option>
                        ),
                      )}
                    </select>
                  </label>

                  <label>
                    <span style={labelStyle}>Author *</span>
                    <input
                      required
                      value={form.author}
                      onChange={(e) => updateForm("author", e.target.value)}
                      placeholder="Author name"
                      style={inputStyle}
                    />
                  </label>

                  <label>
                    <span style={labelStyle}>Publish date</span>
                    <input
                      type="date"
                      required
                      value={form.publishDate}
                      onChange={(e) => updateForm("publishDate", e.target.value)}
                      style={inputStyle}
                    />
                  </label>

                  <label>
                    <span style={labelStyle}>Expiry date</span>
                    <input
                      type="date"
                      value={form.expiryDate}
                      onChange={(e) => updateForm("expiryDate", e.target.value)}
                      style={inputStyle}
                    />
                  </label>

                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      fontSize: 12,
                      color: "#475467",
                      gridColumn: "1 / -1",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={form.pinned}
                      onChange={(e) => updateForm("pinned", e.target.checked)}
                    />
                    Pin this announcement at the top of the directory
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
                    {modal === "edit" ? "Save changes" : "Create announcement"}
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
        <Building2 size={13} />
        ModelNow Company Communications
        <span style={{ marginLeft: "auto" }}>Announcement administration</span>
      </footer>
    </main>
  );
}
