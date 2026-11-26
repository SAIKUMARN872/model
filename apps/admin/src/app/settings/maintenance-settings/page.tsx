"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Bell,
  CalendarClock,
  Check,
  CheckCircle2,
  Clock,
  Download,
  History,
  Info,
  Lock,
  Play,
  Plus,
  RefreshCw,
  Save,
  Server,
  Settings2,
  Shield,
  Trash2,
  Wrench,
  X,
  Zap,
} from "lucide-react";

type MaintenanceWindow = {
  id: string;
  title: string;
  description: string;
  start: string;
  end: string;
  scope: string;
  status: "Scheduled" | "In progress" | "Completed" | "Cancelled";
  impact: "Low" | "Medium" | "High";
  owner: string;
  notifyUsers: boolean;
};

type MaintenanceEvent = {
  id: string;
  action: string;
  detail: string;
  actor: string;
  time: string;
  type: "success" | "warning" | "info";
};

const INITIAL_WINDOWS: MaintenanceWindow[] = [
  {
    id: "MW-1001",
    title: "AI Gateway Infrastructure Upgrade",
    description: "Upgrade gateway infrastructure and apply performance improvements.",
    start: "2026-11-07T01:00",
    end: "2026-11-07T02:30",
    scope: "AI Gateway",
    status: "Scheduled",
    impact: "Medium",
    owner: "Infrastructure",
    notifyUsers: true,
  },
  {
    id: "MW-1002",
    title: "Database Maintenance",
    description: "Routine database optimization and index maintenance.",
    start: "2026-11-10T02:00",
    end: "2026-11-10T03:00",
    scope: "Platform Database",
    status: "Scheduled",
    impact: "Low",
    owner: "Platform Engineering",
    notifyUsers: true,
  },
  {
    id: "MW-1003",
    title: "Model Provider Connectivity Update",
    description: "Update provider connection handling and retry configuration.",
    start: "2026-11-12T00:30",
    end: "2026-11-12T01:30",
    scope: "AI Providers",
    status: "Scheduled",
    impact: "High",
    owner: "AI Infrastructure",
    notifyUsers: true,
  },
  {
    id: "MW-1004",
    title: "Admin Console Deployment",
    description: "Deploy administrative interface improvements.",
    start: "2026-10-28T21:00",
    end: "2026-10-28T21:45",
    scope: "Admin Console",
    status: "Completed",
    impact: "Low",
    owner: "Product Engineering",
    notifyUsers: false,
  },
];

const INITIAL_EVENTS: MaintenanceEvent[] = [
  {
    id: "EV-001",
    action: "Maintenance window created",
    detail: "AI Gateway Infrastructure Upgrade",
    actor: "Infrastructure",
    time: "2026-11-03 10:42",
    type: "info",
  },
  {
    id: "EV-002",
    action: "Maintenance completed",
    detail: "Admin Console Deployment",
    actor: "Product Engineering",
    time: "2026-10-28 21:45",
    type: "success",
  },
  {
    id: "EV-003",
    action: "Maintenance notification policy updated",
    detail: "User notifications enabled for scheduled windows.",
    actor: "Platform Admin",
    time: "2026-10-27 15:20",
    type: "warning",
  },
];

const EMPTY_WINDOW: Omit<MaintenanceWindow, "id" | "status"> = {
  title: "",
  description: "",
  start: "",
  end: "",
  scope: "Entire Platform",
  impact: "Low",
  owner: "",
  notifyUsers: true,
};

type Tab = "Overview" | "Schedule" | "Configuration" | "History";

function StatusBadge({ status }: { status: MaintenanceWindow["status"] }) {
  const className =
    status === "Completed"
      ? "success"
      : status === "In progress"
        ? "progress"
        : status === "Cancelled"
          ? "cancelled"
          : "scheduled";

  return <span className={`ms-status ${className}`}>{status}</span>;
}

function ImpactBadge({ impact }: { impact: MaintenanceWindow["impact"] }) {
  return <span className={`ms-impact ${impact.toLowerCase()}`}>{impact}</span>;
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      className={`ms-toggle ${checked ? "active" : ""}`}
      onClick={onChange}
      aria-label={label}
      aria-pressed={checked}
    >
      <span />
    </button>
  );
}

export default function MaintenanceSettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [windows, setWindows] = useState<MaintenanceWindow[]>(INITIAL_WINDOWS);
  const [events, setEvents] = useState<MaintenanceEvent[]>(INITIAL_EVENTS);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedWindow, setSelectedWindow] = useState<MaintenanceWindow | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [notice, setNotice] = useState("");
  const [saved, setSaved] = useState(false);
  const [draft, setDraft] = useState(EMPTY_WINDOW);

  const [settings, setSettings] = useState({
    maintenanceMode: false,
    showStatusBanner: true,
    notifyUsers: true,
    notifyAdmins: true,
    allowAdminAccess: true,
    blockNewRequests: false,
    drainActiveRequests: true,
    enableReadOnlyMode: false,
    autoResumeServices: true,
    requireApproval: true,
    notificationHours: 24,
    defaultDuration: 60,
    timezone: "Asia/Kolkata",
    bannerMessage:
      "Scheduled maintenance is planned. Some services may be temporarily unavailable.",
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem("modelnow-maintenance-settings-v1");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed.windows)) setWindows(parsed.windows);
        if (Array.isArray(parsed.events)) setEvents(parsed.events);
        if (parsed.settings) {
          setSettings((previous) => ({ ...previous, ...parsed.settings }));
        }
      }
    } catch {
      // Ignore invalid local demo data.
    }
  }, []);

  const filteredWindows = windows.filter((item) => {
    const query = search.toLowerCase().trim();
    const matchesQuery =
      !query ||
      item.title.toLowerCase().includes(query) ||
      item.scope.toLowerCase().includes(query) ||
      item.owner.toLowerCase().includes(query) ||
      item.id.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "All statuses" || item.status === statusFilter;

    return matchesQuery && matchesStatus;
  });

  const scheduledCount = windows.filter(
    (item) => item.status === "Scheduled",
  ).length;
  const completedCount = windows.filter(
    (item) => item.status === "Completed",
  ).length;
  const inProgressCount = windows.filter(
    (item) => item.status === "In progress",
  ).length;
  const highImpactCount = windows.filter(
    (item) => item.impact === "High" && item.status === "Scheduled",
  ).length;

  function addEvent(
    action: string,
    detail: string,
    type: MaintenanceEvent["type"] = "info",
  ) {
    const event: MaintenanceEvent = {
      id: `EV-${Date.now()}`,
      action,
      detail,
      actor: "Platform Admin",
      time: new Date().toLocaleString("en-IN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      type,
    };

    setEvents((previous) => [event, ...previous]);
  }

  function createWindow() {
    if (!draft.title.trim() || !draft.start || !draft.end) {
      setNotice("Enter a maintenance title, start time, and end time.");
      return;
    }

    if (new Date(draft.end).getTime() <= new Date(draft.start).getTime()) {
      setNotice("The end time must be later than the start time.");
      return;
    }

    const item: MaintenanceWindow = {
      ...draft,
      id: `MW-${Date.now().toString().slice(-6)}`,
      title: draft.title.trim(),
      description: draft.description.trim(),
      owner: draft.owner.trim() || "Platform Engineering",
      status: "Scheduled",
    };

    setWindows((previous) => [item, ...previous]);
    setShowCreate(false);
    setDraft(EMPTY_WINDOW);
    setSaved(false);
    setNotice("Maintenance window created in the local demo.");
    addEvent("Maintenance window created", item.title, "success");
  }

  function changeStatus(
    item: MaintenanceWindow,
    status: MaintenanceWindow["status"],
  ) {
    if (item.status === "Completed" || item.status === "Cancelled") {
      setNotice("Completed or cancelled maintenance windows cannot be restarted here.");
      return;
    }

    setWindows((previous) =>
      previous.map((window) =>
        window.id === item.id ? { ...window, status } : window,
      ),
    );

    addEvent(
      `Maintenance ${status.toLowerCase()}`,
      item.title,
      status === "Completed" ? "success" : "warning",
    );

    setSelectedWindow(null);
    setSaved(false);
    setNotice(`${item.title}: status changed to ${status}.`);
  }

  function deleteWindow(item: MaintenanceWindow) {
    if (item.status === "In progress") {
      setNotice("An in-progress maintenance window cannot be deleted.");
      return;
    }

    setWindows((previous) => previous.filter((window) => window.id !== item.id));
    addEvent("Maintenance window removed", item.title, "warning");
    setSelectedWindow(null);
    setSaved(false);
    setNotice("Maintenance window removed from the local demo.");
  }

  function saveSettings() {
    try {
      localStorage.setItem(
        "modelnow-maintenance-settings-v1",
        JSON.stringify({ windows, events, settings }),
      );
      setSaved(true);
      setNotice("Maintenance settings saved in this browser.");
      addEvent("Maintenance settings saved", "Local demo configuration updated.", "success");
    } catch {
      setNotice("Unable to save settings in browser storage.");
    }
  }

  function resetDemo() {
    setWindows(INITIAL_WINDOWS);
    setEvents(INITIAL_EVENTS);
    setSettings({
      maintenanceMode: false,
      showStatusBanner: true,
      notifyUsers: true,
      notifyAdmins: true,
      allowAdminAccess: true,
      blockNewRequests: false,
      drainActiveRequests: true,
      enableReadOnlyMode: false,
      autoResumeServices: true,
      requireApproval: true,
      notificationHours: 24,
      defaultDuration: 60,
      timezone: "Asia/Kolkata",
      bannerMessage:
        "Scheduled maintenance is planned. Some services may be temporarily unavailable.",
    });

    try {
      localStorage.removeItem("modelnow-maintenance-settings-v1");
    } catch {
      // Ignore unavailable browser storage.
    }

    setSaved(false);
    setNotice("Maintenance settings reset to the initial demo values.");
  }

  function exportCsv() {
    const headers = [
      "ID",
      "Title",
      "Description",
      "Start",
      "End",
      "Scope",
      "Status",
      "Impact",
      "Owner",
      "Notify Users",
    ];

    const rows = filteredWindows.map((item) => [
      item.id,
      item.title,
      item.description,
      item.start,
      item.end,
      item.scope,
      item.status,
      item.impact,
      item.owner,
      item.notifyUsers ? "Yes" : "No",
    ]);

    const escapeCell = (value: string) =>
      `"${value.replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map((value) => escapeCell(String(value))).join(","))
      .join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "modelnow-maintenance-windows.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice("Maintenance schedule exported to CSV.");
  }

  function updateSetting<K extends keyof typeof settings>(
    key: K,
    value: (typeof settings)[K],
  ) {
    setSettings((previous) => ({ ...previous, [key]: value }));
    setSaved(false);
  }

  return (
    <main className="maintenance-settings">
      <style>{`
        .maintenance-settings{--ms-blue:#315bea;--ms-text:#1b2639;--ms-muted:#7b879a;--ms-border:#e4e8f0;min-height:100vh;padding:30px;background:#f7f8fc;color:var(--ms-text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
        .maintenance-settings *{box-sizing:border-box}
        .ms-shell{max-width:1450px;margin:auto}
        .ms-breadcrumb{display:flex;gap:8px;align-items:center;font-size:12px;color:var(--ms-muted);margin-bottom:20px}
        .ms-breadcrumb strong{color:#39445a}
        .ms-header{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;flex-wrap:wrap;margin-bottom:24px}
        .ms-heading{display:flex;align-items:flex-start;gap:14px}
        .ms-heading-icon{display:grid;place-items:center;width:48px;height:48px;border-radius:14px;background:#eaf0ff;color:var(--ms-blue);flex-shrink:0}
        .ms-title{font-size:27px;font-weight:770;letter-spacing:-.8px;margin:0 0 7px}
        .ms-subtitle{font-size:13px;line-height:1.65;color:var(--ms-muted);max-width:730px;margin:0}
        .ms-actions{display:flex;gap:9px;flex-wrap:wrap}
        .ms-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:10px 13px;border:1px solid var(--ms-border);border-radius:9px;background:#fff;color:#3f4a60;font-size:12px;font-weight:670;cursor:pointer}
        .ms-btn:hover{background:#f7f9ff;border-color:#bdcafa}
        .ms-btn.primary{background:var(--ms-blue);border-color:var(--ms-blue);color:white}
        .ms-btn.primary:hover{background:#254bd1}
        .ms-alert{display:flex;align-items:flex-start;gap:9px;padding:12px 14px;border:1px solid #cbd9ff;background:#eff4ff;color:#2947a2;border-radius:10px;font-size:12px;line-height:1.55;margin-bottom:18px}
        .ms-alert button{margin-left:auto;border:0;background:transparent;color:inherit;cursor:pointer}
        .ms-alert.danger{background:#fff0f0;border-color:#f4cccc;color:#9b3131}
        .ms-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:20px}
        .ms-stat{padding:17px 18px;background:white;border:1px solid var(--ms-border);border-radius:13px}
        .ms-stat-top{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:12px;color:var(--ms-muted)}
        .ms-stat-icon{width:35px;height:35px;display:grid;place-items:center;background:#f0f3f9;color:#5f6d83;border-radius:10px}
        .ms-stat-value{font-size:28px;font-weight:770;letter-spacing:-.7px;margin-top:13px}
        .ms-stat-note{font-size:11px;color:var(--ms-muted);margin-top:5px}
        .ms-tabs{display:flex;gap:5px;padding:6px;border:1px solid var(--ms-border);border-radius:11px;background:#fff;margin-bottom:18px;overflow-x:auto}
        .ms-tab{white-space:nowrap;border:0;background:transparent;border-radius:8px;padding:10px 14px;font-size:12px;font-weight:670;color:#69758a;cursor:pointer}
        .ms-tab.active{background:#edf2ff;color:var(--ms-blue)}
        .ms-card{background:white;border:1px solid var(--ms-border);border-radius:14px;overflow:hidden;margin-bottom:18px}
        .ms-card-head{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;padding:17px 19px;border-bottom:1px solid var(--ms-border)}
        .ms-card-title{font-size:14px;font-weight:740;margin:0 0 5px}
        .ms-card-subtitle{font-size:11px;line-height:1.55;color:var(--ms-muted);margin:0}
        .ms-section-body{padding:19px}
        .ms-status{display:inline-flex;padding:5px 8px;border-radius:20px;font-size:10px;font-weight:720;white-space:nowrap}
        .ms-status.scheduled{background:#edf2ff;color:#315bea}
        .ms-status.progress{background:#fff1db;color:#a36300}
        .ms-status.success{background:#e8f8ee;color:#17834b}
        .ms-status.cancelled{background:#eff1f5;color:#6b7587}
        .ms-impact{display:inline-flex;padding:5px 8px;border-radius:20px;font-size:10px;font-weight:720}
        .ms-impact.low{background:#e8f8ee;color:#17834b}
        .ms-impact.medium{background:#fff4df;color:#a66a08}
        .ms-impact.high{background:#ffeded;color:#bd3535}
        .ms-table-wrap{width:100%;overflow-x:auto}
        .ms-table{width:100%;border-collapse:collapse;text-align:left;min-width:1000px}
        .ms-table th{font-size:10px;letter-spacing:.45px;text-transform:uppercase;color:#8590a2;font-weight:750;background:#fafbfe;padding:12px 15px;border-bottom:1px solid var(--ms-border);white-space:nowrap}
        .ms-table td{font-size:12px;padding:14px 15px;border-bottom:1px solid #eef0f5;color:#3e4960;vertical-align:middle}
        .ms-table tbody tr:hover{background:#fbfcff}
        .ms-table tr:last-child td{border-bottom:0}
        .ms-window-name{font-size:12px;font-weight:720;color:#263249;margin-bottom:4px}
        .ms-window-id{font-size:10px;color:#8490a3;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
        .ms-muted{font-size:11px;color:var(--ms-muted);line-height:1.55}
        .ms-empty{text-align:center;padding:42px 15px;color:var(--ms-muted);font-size:12px}
        .ms-filters{display:flex;align-items:center;gap:9px;flex-wrap:wrap;padding:14px 17px;border-bottom:1px solid var(--ms-border)}
        .ms-search{display:flex;align-items:center;gap:8px;border:1px solid var(--ms-border);border-radius:8px;padding:0 10px;min-width:220px;max-width:360px;flex:1;background:#fff}
        .ms-search input{border:0;outline:none;padding:10px 0;width:100%;font-size:12px;color:var(--ms-text);background:transparent}
        .ms-select{border:1px solid var(--ms-border);border-radius:8px;padding:10px 11px;font-size:12px;color:#465168;background:#fff;outline:none}
        .ms-layout{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(280px,.8fr);gap:18px}
        .ms-hero{padding:20px;background:linear-gradient(125deg,#233d94,#315bea);border-radius:13px;color:white;margin-bottom:18px}
        .ms-hero-top{display:flex;align-items:center;justify-content:space-between;gap:12px}
        .ms-hero-label{font-size:11px;color:#dce5ff;font-weight:650}
        .ms-hero-title{font-size:22px;font-weight:780;letter-spacing:-.5px;margin:10px 0}
        .ms-hero-copy{font-size:12px;line-height:1.65;color:#e0e8ff;max-width:650px}
        .ms-hero .ms-btn{margin-top:17px}
        .ms-switch{width:39px;height:22px;border:0;border-radius:20px;background:#cbd1dd;padding:3px;cursor:pointer;flex-shrink:0;transition:.15s}
        .ms-switch span{display:block;width:16px;height:16px;border-radius:50%;background:white;box-shadow:0 1px 3px #0002;transition:transform .15s}
        .ms-switch.active{background:var(--ms-blue)}
        .ms-switch.active span{transform:translateX(17px)}
        .ms-config-row{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:16px 19px;border-bottom:1px solid #eef0f5}
        .ms-config-row:last-child{border-bottom:0}
        .ms-config-title{font-size:12px;font-weight:720;margin-bottom:5px}
        .ms-config-description{font-size:11px;line-height:1.55;color:var(--ms-muted);max-width:700px}
        .ms-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:15px;padding:19px}
        .ms-field{display:flex;flex-direction:column;gap:7px;min-width:0}
        .ms-field label{font-size:11px;font-weight:720;color:#48536a}
        .ms-field input,.ms-field select,.ms-field textarea{width:100%;border:1px solid #dfe4ed;border-radius:8px;padding:11px 12px;font-size:12px;outline:none;background:#fff;color:#273248}
        .ms-field textarea{resize:vertical;min-height:80px}
        .ms-field input:focus,.ms-field select:focus,.ms-field textarea:focus{border-color:#8ea5fb;box-shadow:0 0 0 3px #315bea12}
        .ms-field.full{grid-column:1/-1}
        .ms-note{display:flex;align-items:flex-start;gap:9px;padding:12px 14px;border:1px solid #f0dfb9;background:#fff9eb;color:#875b13;border-radius:10px;font-size:11px;line-height:1.6;margin:17px 19px}
        .ms-timeline{padding:3px 19px 15px}
        .ms-event{display:flex;gap:13px;padding:16px 0;border-bottom:1px solid #eef0f5}
        .ms-event:last-child{border-bottom:0}
        .ms-event-icon{width:34px;height:34px;display:grid;place-items:center;border-radius:10px;flex-shrink:0;background:#eff4ff;color:#315bea}
        .ms-event-icon.success{background:#e8f8ee;color:#17834b}
        .ms-event-icon.warning{background:#fff4df;color:#a66a08}
        .ms-event-title{font-size:12px;font-weight:720;margin-bottom:4px}
        .ms-event-time{font-size:10px;color:var(--ms-muted);margin-top:6px}
        .ms-modal-backdrop{position:fixed;inset:0;background:#10182870;z-index:50;display:flex;align-items:center;justify-content:center;padding:18px}
        .ms-modal{width:100%;max-width:580px;max-height:90vh;overflow-y:auto;background:white;border-radius:16px;box-shadow:0 24px 80px #10182830}
        .ms-modal-head{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;padding:20px;border-bottom:1px solid var(--ms-border)}
        .ms-modal-title{font-size:17px;font-weight:760;margin:0 0 6px}
        .ms-modal-subtitle{font-size:11px;color:var(--ms-muted);line-height:1.5;margin:0}
        .ms-modal-body{padding:20px}
        .ms-modal-footer{display:flex;justify-content:flex-end;gap:9px;padding:15px 20px;border-top:1px solid var(--ms-border)}
        .ms-close{width:30px;height:30px;border:0;border-radius:8px;background:#f3f5f9;display:grid;place-items:center;cursor:pointer;color:#657087}
        @media(max-width:1000px){.ms-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.ms-layout{grid-template-columns:1fr}}
        @media(max-width:650px){.maintenance-settings{padding:16px}.ms-title{font-size:23px}.ms-stats{gap:9px}.ms-stat{padding:13px}.ms-stat-value{font-size:24px}.ms-form-grid{grid-template-columns:1fr}.ms-field.full{grid-column:auto}.ms-search{min-width:100%;max-width:none}.ms-filters .ms-select{flex:1}.ms-actions{width:100%}.ms-actions .ms-btn{flex:1}.ms-tabs{margin-right:-2px}.ms-tab{padding:10px}}
      `}</style>

      <div className="ms-shell">
        <div className="ms-breadcrumb">
          <span>Admin</span><span>/</span><span>Settings</span><span>/</span>
          <strong>Maintenance Settings</strong>
        </div>

        <header className="ms-header">
          <div className="ms-heading">
            <div className="ms-heading-icon"><Wrench size={24} /></div>
            <div>
              <h1 className="ms-title">Maintenance Settings</h1>
              <p className="ms-subtitle">
                Schedule platform maintenance, configure service availability,
                manage notifications, and review maintenance activity.
              </p>
            </div>
          </div>
          <div className="ms-actions">
            <button className="ms-btn" onClick={resetDemo}><RefreshCw size={14} /> Reset demo</button>
            <button className="ms-btn" onClick={exportCsv}><Download size={14} /> Export schedule</button>
            <button className="ms-btn primary" onClick={() => setShowCreate(true)}><Plus size={15} /> Schedule maintenance</button>
          </div>
        </header>

        {notice && (
          <div className="ms-alert">
            <Info size={16} />
            <span>{notice}</span>
            <button onClick={() => setNotice("")} aria-label="Dismiss message"><X size={15} /></button>
          </div>
        )}

        {settings.maintenanceMode && (
          <div className="ms-alert danger">
            <AlertTriangle size={17} />
            <span><strong>Maintenance mode is enabled.</strong> This is a local demo indicator; it does not change live platform traffic.</span>
            <button onClick={() => setNotice("")} aria-label="Dismiss message"><X size={15} /></button>
          </div>
        )}

        <section className="ms-stats">
          <div className="ms-stat">
            <div className="ms-stat-top">Scheduled windows <span className="ms-stat-icon"><CalendarClock size={17} /></span></div>
            <div className="ms-stat-value">{scheduledCount}</div>
            <div className="ms-stat-note">Upcoming maintenance events</div>
          </div>
          <div className="ms-stat">
            <div className="ms-stat-top">In progress <span className="ms-stat-icon"><Activity size={17} /></span></div>
            <div className="ms-stat-value">{inProgressCount}</div>
            <div className="ms-stat-note">Active maintenance windows</div>
          </div>
          <div className="ms-stat">
            <div className="ms-stat-top">Completed <span className="ms-stat-icon"><CheckCircle2 size={17} /></span></div>
            <div className="ms-stat-value">{completedCount}</div>
            <div className="ms-stat-note">Recorded completed windows</div>
          </div>
          <div className="ms-stat">
            <div className="ms-stat-top">High-impact scheduled <span className="ms-stat-icon"><AlertTriangle size={17} /></span></div>
            <div className="ms-stat-value">{highImpactCount}</div>
            <div className="ms-stat-note">Require additional coordination</div>
          </div>
        </section>

        <nav className="ms-tabs" aria-label="Maintenance sections">
          {(["Overview", "Schedule", "Configuration", "History"] as Tab[]).map((tab) => (
            <button key={tab} className={`ms-tab ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
        </nav>

        {activeTab === "Overview" && (
          <>
            <div className="ms-layout">
              <div>
                <section className="ms-hero">
                  <div className="ms-hero-top">
                    <span className="ms-hero-label">PLATFORM AVAILABILITY CONTROL</span>
                    <Wrench size={23} />
                  </div>
                  <div className="ms-hero-title">
                    {settings.maintenanceMode ? "Maintenance mode is enabled" : "Platform is in normal mode"}
                  </div>
                  <div className="ms-hero-copy">
                    Configure maintenance mode and user-facing notifications for planned
                    platform work. Changes made here are stored locally for demonstration
                    and are not applied to production services.
                  </div>
                  <button className="ms-btn" onClick={() => updateSetting("maintenanceMode", !settings.maintenanceMode)}>
                    {settings.maintenanceMode ? <CheckCircle2 size={14} /> : <Wrench size={14} />}
                    {settings.maintenanceMode ? "Disable demo maintenance mode" : "Enable demo maintenance mode"}
                  </button>
                </section>

                <section className="ms-card">
                  <div className="ms-card-head">
                    <div>
                      <h2 className="ms-card-title">Upcoming maintenance</h2>
                      <p className="ms-card-subtitle">Review the next scheduled maintenance windows.</p>
                    </div>
                    <button className="ms-btn" onClick={() => setActiveTab("Schedule")}>View schedule</button>
                  </div>
                  <div className="ms-table-wrap">
                    <table className="ms-table">
                      <thead><tr><th>Maintenance</th><th>Start</th><th>Scope</th><th>Impact</th><th>Status</th><th>Details</th></tr></thead>
                      <tbody>
                        {windows.filter((item) => item.status === "Scheduled" || item.status === "In progress").slice(0, 4).map((item) => (
                          <tr key={item.id}>
                            <td><div className="ms-window-name">{item.title}</div><div className="ms-window-id">{item.id}</div></td>
                            <td>{new Date(item.start).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</td>
                            <td>{item.scope}</td>
                            <td><ImpactBadge impact={item.impact} /></td>
                            <td><StatusBadge status={item.status} /></td>
                            <td><button className="ms-btn" onClick={() => setSelectedWindow(item)}>View</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {windows.filter((item) => item.status === "Scheduled" || item.status === "In progress").length === 0 && <div className="ms-empty">No upcoming maintenance windows.</div>}
                  </div>
                </section>
              </div>

              <div>
                <section className="ms-card">
                  <div className="ms-card-head">
                    <div><h2 className="ms-card-title">Availability preferences</h2><p className="ms-card-subtitle">Quick controls for maintenance behavior.</p></div>
                    <Settings2 size={18} color="#778195" />
                  </div>
                  <div className="ms-config-row">
                    <div><div className="ms-config-title">Status banner</div><div className="ms-config-description">Show a maintenance message in the application.</div></div>
                    <Toggle checked={settings.showStatusBanner} onChange={() => updateSetting("showStatusBanner", !settings.showStatusBanner)} label="Show status banner" />
                  </div>
                  <div className="ms-config-row">
                    <div><div className="ms-config-title">Notify users</div><div className="ms-config-description">Enable planned-maintenance notifications.</div></div>
                    <Toggle checked={settings.notifyUsers} onChange={() => updateSetting("notifyUsers", !settings.notifyUsers)} label="Notify users" />
                  </div>
                  <div className="ms-config-row">
                    <div><div className="ms-config-title">Allow admin access</div><div className="ms-config-description">Keep administrative access available in the planned policy.</div></div>
                    <Toggle checked={settings.allowAdminAccess} onChange={() => updateSetting("allowAdminAccess", !settings.allowAdminAccess)} label="Allow admin access" />
                  </div>
                  <div className="ms-config-row">
                    <div><div className="ms-config-title">Drain active requests</div><div className="ms-config-description">Configure graceful completion before maintenance.</div></div>
                    <Toggle checked={settings.drainActiveRequests} onChange={() => updateSetting("drainActiveRequests", !settings.drainActiveRequests)} label="Drain active requests" />
                  </div>
                  <div className="ms-section-body">
                    <button className="ms-btn primary" style={{ width: "100%" }} onClick={saveSettings}><Save size={14} /> {saved ? "Saved" : "Save preferences"}</button>
                  </div>
                </section>

                <section className="ms-card">
                  <div className="ms-card-head">
                    <div><h2 className="ms-card-title">Recent activity</h2><p className="ms-card-subtitle">Latest recorded maintenance events.</p></div>
                    <History size={18} color="#778195" />
                  </div>
                  <div className="ms-timeline">
                    {events.slice(0, 4).map((event) => (
                      <div className="ms-event" key={event.id}>
                        <div className={`ms-event-icon ${event.type}`}>
                          {event.type === "success" ? <CheckCircle2 size={16} /> : event.type === "warning" ? <AlertTriangle size={16} /> : <Info size={16} />}
                        </div>
                        <div>
                          <div className="ms-event-title">{event.action}</div>
                          <div className="ms-muted">{event.detail}</div>
                          <div className="ms-event-time">{event.time} · {event.actor}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="ms-section-body" style={{ paddingTop: 0 }}>
                    <button className="ms-btn" style={{ width: "100%" }} onClick={() => setActiveTab("History")}>View full history</button>
                  </div>
                </section>
              </div>
            </div>
          </>
        )}

        {activeTab === "Schedule" && (
          <section className="ms-card">
            <div className="ms-card-head">
              <div><h2 className="ms-card-title">Maintenance schedule</h2><p className="ms-card-subtitle">Search, review, and manage maintenance windows.</p></div>
              <button className="ms-btn primary" onClick={() => setShowCreate(true)}><Plus size={14} /> New window</button>
            </div>
            <div className="ms-filters">
              <div className="ms-search">
                <Activity size={15} color="#8a94a6" />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, scope, owner, or ID..." />
              </div>
              <select className="ms-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option>All statuses</option>
                <option>Scheduled</option>
                <option>In progress</option>
                <option>Completed</option>
                <option>Cancelled</option>
              </select>
              <button className="ms-btn" onClick={() => { setSearch(""); setStatusFilter("All statuses"); }}>Clear filters</button>
            </div>
            <div className="ms-table-wrap">
              <table className="ms-table">
                <thead><tr><th>Maintenance window</th><th>Start</th><th>End</th><th>Scope</th><th>Impact</th><th>Status</th><th>Owner</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredWindows.map((item) => (
                    <tr key={item.id}>
                      <td><div className="ms-window-name">{item.title}</div><div className="ms-window-id">{item.id}</div></td>
                      <td>{new Date(item.start).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</td>
                      <td>{new Date(item.end).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</td>
                      <td>{item.scope}</td>
                      <td><ImpactBadge impact={item.impact} /></td>
                      <td><StatusBadge status={item.status} /></td>
                      <td>{item.owner}</td>
                      <td><button className="ms-btn" onClick={() => setSelectedWindow(item)}>Manage</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredWindows.length === 0 && <div className="ms-empty">No maintenance windows match your filters.</div>}
            </div>
          </section>
        )}

        {activeTab === "Configuration" && (
          <>
            <section className="ms-card">
              <div className="ms-card-head">
                <div><h2 className="ms-card-title">Maintenance behavior</h2><p className="ms-card-subtitle">Configure how the platform should behave during planned maintenance.</p></div>
                <Settings2 size={19} color="#778195" />
              </div>
              <div className="ms-config-row">
                <div><div className="ms-config-title">Maintenance mode</div><div className="ms-config-description">Represent whether the platform should enter maintenance mode. This demo does not affect live traffic.</div></div>
                <Toggle checked={settings.maintenanceMode} onChange={() => updateSetting("maintenanceMode", !settings.maintenanceMode)} label="Maintenance mode" />
              </div>
              <div className="ms-config-row">
                <div><div className="ms-config-title">Show status banner</div><div className="ms-config-description">Display a maintenance notice in supported application interfaces.</div></div>
                <Toggle checked={settings.showStatusBanner} onChange={() => updateSetting("showStatusBanner", !settings.showStatusBanner)} label="Show status banner" />
              </div>
              <div className="ms-config-row">
                <div><div className="ms-config-title">Block new requests</div><div className="ms-config-description">Configure the intended behavior for new API requests during maintenance.</div></div>
                <Toggle checked={settings.blockNewRequests} onChange={() => updateSetting("blockNewRequests", !settings.blockNewRequests)} label="Block new requests" />
              </div>
              <div className="ms-config-row">
                <div><div className="ms-config-title">Drain active requests</div><div className="ms-config-description">Allow active requests to finish before taking affected services offline.</div></div>
                <Toggle checked={settings.drainActiveRequests} onChange={() => updateSetting("drainActiveRequests", !settings.drainActiveRequests)} label="Drain active requests" />
              </div>
              <div className="ms-config-row">
                <div><div className="ms-config-title">Enable read-only mode</div><div className="ms-config-description">Configure a read-only service policy during maintenance.</div></div>
                <Toggle checked={settings.enableReadOnlyMode} onChange={() => updateSetting("enableReadOnlyMode", !settings.enableReadOnlyMode)} label="Enable read-only mode" />
              </div>
              <div className="ms-config-row">
                <div><div className="ms-config-title">Allow admin access</div><div className="ms-config-description">Preserve access for authorized administrators where supported.</div></div>
                <Toggle checked={settings.allowAdminAccess} onChange={() => updateSetting("allowAdminAccess", !settings.allowAdminAccess)} label="Allow admin access" />
              </div>
              <div className="ms-config-row">
                <div><div className="ms-config-title">Auto-resume services</div><div className="ms-config-description">Configure automatic recovery after a maintenance window ends.</div></div>
                <Toggle checked={settings.autoResumeServices} onChange={() => updateSetting("autoResumeServices", !settings.autoResumeServices)} label="Auto-resume services" />
              </div>
              <div className="ms-config-row">
                <div><div className="ms-config-title">Require approval</div><div className="ms-config-description">Require authorized approval before a planned maintenance operation.</div></div>
                <Toggle checked={settings.requireApproval} onChange={() => updateSetting("requireApproval", !settings.requireApproval)} label="Require approval" />
              </div>
            </section>

            <section className="ms-card">
              <div className="ms-card-head">
                <div><h2 className="ms-card-title">Schedule defaults</h2><p className="ms-card-subtitle">Set the default timing and timezone for new maintenance windows.</p></div>
                <CalendarClock size={19} color="#778195" />
              </div>
              <div className="ms-form-grid">
                <div className="ms-field">
                  <label htmlFor="ms-timezone">Maintenance timezone</label>
                  <select id="ms-timezone" value={settings.timezone} onChange={(event) => updateSetting("timezone", event.target.value)}>
                    <option value="Asia/Kolkata">India Standard Time — Asia/Kolkata</option>
                    <option value="UTC">Coordinated Universal Time — UTC</option>
                    <option value="America/New_York">Eastern Time — America/New_York</option>
                    <option value="Europe/London">United Kingdom — Europe/London</option>
                    <option value="Asia/Singapore">Singapore — Asia/Singapore</option>
                  </select>
                </div>
                <div className="ms-field">
                  <label htmlFor="ms-duration">Default duration</label>
                  <select id="ms-duration" value={settings.defaultDuration} onChange={(event) => updateSetting("defaultDuration", Number(event.target.value))}>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>90 minutes</option>
                    <option value={120}>2 hours</option>
                    <option value={240}>4 hours</option>
                  </select>
                </div>
                <div className="ms-field">
                  <label htmlFor="ms-notification-hours">Notification lead time</label>
                  <select id="ms-notification-hours" value={settings.notificationHours} onChange={(event) => updateSetting("notificationHours", Number(event.target.value))}>
                    <option value={1}>1 hour before</option>
                    <option value={6}>6 hours before</option>
                    <option value={12}>12 hours before</option>
                    <option value={24}>24 hours before</option>
                    <option value={48}>48 hours before</option>
                    <option value={72}>72 hours before</option>
                  </select>
                </div>
                <div className="ms-field">
                  <label htmlFor="ms-banner-message">Status banner message</label>
                  <textarea id="ms-banner-message" value={settings.bannerMessage} onChange={(event) => updateSetting("bannerMessage", event.target.value)} />
                </div>
              </div>
            </section>

            <section className="ms-card">
              <div className="ms-card-head">
                <div><h2 className="ms-card-title">Notification policy</h2><p className="ms-card-subtitle">Control which audiences should receive maintenance notifications.</p></div>
                <Bell size={19} color="#778195" />
              </div>
              <div className="ms-config-row">
                <div><div className="ms-config-title">Notify users</div><div className="ms-config-description">Notify affected users about planned maintenance and service impact.</div></div>
                <Toggle checked={settings.notifyUsers} onChange={() => updateSetting("notifyUsers", !settings.notifyUsers)} label="Notify users" />
              </div>
              <div className="ms-config-row">
                <div><div className="ms-config-title">Notify administrators</div><div className="ms-config-description">Notify administrators about upcoming maintenance and changes.</div></div>
                <Toggle checked={settings.notifyAdmins} onChange={() => updateSetting("notifyAdmins", !settings.notifyAdmins)} label="Notify administrators" />
              </div>
              <div className="ms-section-body" style={{ display: "flex", justifyContent: "flex-end", gap: 9 }}>
                <button className="ms-btn" onClick={resetDemo}><RefreshCw size={14} /> Reset demo</button>
                <button className="ms-btn primary" onClick={saveSettings}><Save size={14} /> {saved ? "Saved" : "Save settings"}</button>
              </div>
            </section>
          </>
        )}

        {activeTab === "History" && (
          <section className="ms-card">
            <div className="ms-card-head">
              <div><h2 className="ms-card-title">Maintenance activity history</h2><p className="ms-card-subtitle">Review events recorded by this page during the current demo session.</p></div>
              <span className="ms-status scheduled">{events.length} events</span>
            </div>
            <div className="ms-timeline">
              {events.map((event) => (
                <div className="ms-event" key={event.id}>
                  <div className={`ms-event-icon ${event.type}`}>
                    {event.type === "success" ? <CheckCircle2 size={16} /> : event.type === "warning" ? <AlertTriangle size={16} /> : <History size={16} />}
                  </div>
                  <div>
                    <div className="ms-event-title">{event.action}</div>
                    <div className="ms-muted">{event.detail}</div>
                    <div className="ms-event-time">{event.time} · {event.actor} · {event.id}</div>
                  </div>
                </div>
              ))}
            </div>
            {events.length === 0 && <div className="ms-empty">No maintenance activity recorded.</div>}
          </section>
        )}

        <footer style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", padding: "5px 2px", color: "#8993a5", fontSize: 11 }}>
          <span>ModelNow Admin · Maintenance Settings</span>
          <span>{saved ? "Local settings saved" : "Demo mode"} · Backend enforcement required</span>
        </footer>
      </div>

      {showCreate && (
        <div className="ms-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setShowCreate(false);
        }}>
          <section className="ms-modal" role="dialog" aria-modal="true" aria-labelledby="ms-create-title">
            <div className="ms-modal-head">
              <div>
                <h2 id="ms-create-title" className="ms-modal-title">Schedule maintenance</h2>
                <p className="ms-modal-subtitle">Create a maintenance window in the local demo schedule.</p>
              </div>
              <button className="ms-close" onClick={() => setShowCreate(false)} aria-label="Close dialog"><X size={16} /></button>
            </div>
            <div className="ms-modal-body">
              <div className="ms-form-grid" style={{ padding: 0 }}>
                <div className="ms-field full">
                  <label htmlFor="ms-title">Maintenance title *</label>
                  <input id="ms-title" value={draft.title} onChange={(event) => setDraft((previous) => ({ ...previous, title: event.target.value }))} placeholder="e.g. API Gateway Maintenance" />
                </div>
                <div className="ms-field full">
                  <label htmlFor="ms-description">Description</label>
                  <textarea id="ms-description" value={draft.description} onChange={(event) => setDraft((previous) => ({ ...previous, description: event.target.value }))} placeholder="Describe the planned work and expected impact." />
                </div>
                <div className="ms-field">
                  <label htmlFor="ms-start">Start date and time *</label>
                  <input id="ms-start" type="datetime-local" value={draft.start} onChange={(event) => setDraft((previous) => ({ ...previous, start: event.target.value }))} />
                </div>
                <div className="ms-field">
                  <label htmlFor="ms-end">End date and time *</label>
                  <input id="ms-end" type="datetime-local" value={draft.end} onChange={(event) => setDraft((previous) => ({ ...previous, end: event.target.value }))} />
                </div>
                <div className="ms-field">
                  <label htmlFor="ms-scope">Affected scope</label>
                  <select id="ms-scope" value={draft.scope} onChange={(event) => setDraft((previous) => ({ ...previous, scope: event.target.value }))}>
                    <option>Entire Platform</option>
                    <option>AI Gateway</option>
                    <option>AI Providers</option>
                    <option>Model Routing</option>
                    <option>Platform Database</option>
                    <option>Knowledge Hub</option>
                    <option>Admin Console</option>
                    <option>Billing Service</option>
                    <option>Authentication Service</option>
                  </select>
                </div>
                <div className="ms-field">
                  <label htmlFor="ms-impact">Expected impact</label>
                  <select id="ms-impact" value={draft.impact} onChange={(event) => setDraft((previous) => ({ ...previous, impact: event.target.value as MaintenanceWindow["impact"] }))}>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
                <div className="ms-field">
                  <label htmlFor="ms-owner">Responsible team</label>
                  <input id="ms-owner" value={draft.owner} onChange={(event) => setDraft((previous) => ({ ...previous, owner: event.target.value }))} placeholder="Platform Engineering" />
                </div>
                <div className="ms-field">
                  <label>User notifications</label>
                  <div className="ms-config-row" style={{ padding: "9px 0", border: 0 }}>
                    <div><div className="ms-config-title">Notify affected users</div><div className="ms-config-description">Mark this window for user notification.</div></div>
                    <Toggle checked={draft.notifyUsers} onChange={() => setDraft((previous) => ({ ...previous, notifyUsers: !previous.notifyUsers }))} label="Notify affected users" />
                  </div>
                </div>
              </div>
            </div>
            <div className="ms-modal-footer">
              <button className="ms-btn" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="ms-btn primary" onClick={createWindow}><Plus size={14} /> Create window</button>
            </div>
          </section>
        </div>
      )}

      {selectedWindow && (
        <div className="ms-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setSelectedWindow(null);
        }}>
          <section className="ms-modal" role="dialog" aria-modal="true" aria-labelledby="ms-detail-title">
            <div className="ms-modal-head">
              <div>
                <h2 id="ms-detail-title" className="ms-modal-title">{selectedWindow.title}</h2>
                <p className="ms-modal-subtitle">{selectedWindow.id} · Maintenance details</p>
              </div>
              <button className="ms-close" onClick={() => setSelectedWindow(null)} aria-label="Close dialog"><X size={16} /></button>
            </div>
            <div className="ms-modal-body">
              <p className="ms-muted" style={{ marginTop: 0, marginBottom: 18 }}>{selectedWindow.description || "No additional description provided."}</p>
              <div className="ms-config-row" style={{ padding: "13px 0" }}>
                <div><div className="ms-config-title">Current status</div></div>
                <StatusBadge status={selectedWindow.status} />
              </div>
              <div className="ms-config-row" style={{ padding: "13px 0" }}>
                <div><div className="ms-config-title">Affected scope</div></div>
                <span className="ms-muted">{selectedWindow.scope}</span>
              </div>
              <div className="ms-config-row" style={{ padding: "13px 0" }}>
                <div><div className="ms-config-title">Expected impact</div></div>
                <ImpactBadge impact={selectedWindow.impact} />
              </div>
              <div className="ms-config-row" style={{ padding: "13px 0" }}>
                <div><div className="ms-config-title">Start</div></div>
                <span className="ms-muted">{new Date(selectedWindow.start).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
              </div>
              <div className="ms-config-row" style={{ padding: "13px 0" }}>
                <div><div className="ms-config-title">End</div></div>
                <span className="ms-muted">{new Date(selectedWindow.end).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
              </div>
              <div className="ms-config-row" style={{ padding: "13px 0" }}>
                <div><div className="ms-config-title">Owner</div></div>
                <span className="ms-muted">{selectedWindow.owner}</span>
              </div>
              {selectedWindow.notifyUsers && (
                <div className="ms-note" style={{ margin: "16px 0 0" }}><Bell size={14} /> User notifications are marked as enabled for this window. A connected notification service is required to send them.</div>
              )}
            </div>
            <div className="ms-modal-footer" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
              <button className="ms-btn" onClick={() => deleteWindow(selectedWindow)} disabled={selectedWindow.status === "In progress"}><Trash2 size={14} /> Remove</button>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button className="ms-btn" onClick={() => setSelectedWindow(null)}>Close</button>
                {selectedWindow.status === "Scheduled" && <button className="ms-btn" onClick={() => changeStatus(selectedWindow, "Cancelled")}>Cancel window</button>}
                {selectedWindow.status === "Scheduled" && <button className="ms-btn primary" onClick={() => changeStatus(selectedWindow, "In progress")}><Play size={14} /> Start</button>}
                {selectedWindow.status === "In progress" && <button className="ms-btn primary" onClick={() => changeStatus(selectedWindow, "Completed")}><Check size={14} /> Mark completed</button>}
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}