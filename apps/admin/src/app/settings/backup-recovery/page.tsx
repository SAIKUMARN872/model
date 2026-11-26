
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Archive,
  Bell,
  CalendarClock,
  Check,
  CheckCircle2,
  Clock,
  Database,
  Download,
  HardDrive,
  History,
  Info,
  LockKeyhole,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Settings2,
  Shield,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";

type BackupStatus = "Completed" | "In progress" | "Failed" | "Scheduled";
type BackupType = "Full" | "Incremental" | "Database" | "Configuration";
type RestoreStatus = "Completed" | "Pending approval" | "Failed";
type ActivityType = "success" | "info" | "warning";
type Tab = "Overview" | "Backups" | "Restore" | "Configuration" | "Activity";

type BackupRecord = {
  id: string;
  name: string;
  type: BackupType;
  createdAt: string;
  size: string;
  status: BackupStatus;
  destination: string;
  retention: number;
  encrypted: boolean;
  creator: string;
};

type RestoreRecord = {
  id: string;
  backupName: string;
  target: string;
  requestedAt: string;
  status: RestoreStatus;
  requestedBy: string;
};

type ActivityRecord = {
  id: string;
  title: string;
  detail: string;
  time: string;
  type: ActivityType;
};

const STORAGE_KEY = "modelnow-backup-recovery-v1";

const INITIAL_BACKUPS: BackupRecord[] = [
  {
    id: "BKP-20261104-001",
    name: "Production Platform Full Backup",
    type: "Full",
    createdAt: "2026-11-04T02:00:00",
    size: "8.42 GB",
    status: "Completed",
    destination: "Primary Object Storage",
    retention: 30,
    encrypted: true,
    creator: "Backup Scheduler",
  },
  {
    id: "BKP-20261103-002",
    name: "Production Database Snapshot",
    type: "Database",
    createdAt: "2026-11-03T23:00:00",
    size: "2.18 GB",
    status: "Completed",
    destination: "Primary Object Storage",
    retention: 30,
    encrypted: true,
    creator: "Backup Scheduler",
  },
  {
    id: "BKP-20261103-001",
    name: "Daily Incremental Backup",
    type: "Incremental",
    createdAt: "2026-11-03T02:00:00",
    size: "1.24 GB",
    status: "Completed",
    destination: "Disaster Recovery Storage",
    retention: 14,
    encrypted: true,
    creator: "Backup Scheduler",
  },
  {
    id: "BKP-20261102-001",
    name: "Platform Configuration Snapshot",
    type: "Configuration",
    createdAt: "2026-11-02T02:00:00",
    size: "146 MB",
    status: "Completed",
    destination: "Primary Object Storage",
    retention: 90,
    encrypted: true,
    creator: "Platform Admin",
  },
  {
    id: "BKP-20261101-001",
    name: "Weekly Full Backup",
    type: "Full",
    createdAt: "2026-11-01T01:00:00",
    size: "8.11 GB",
    status: "Completed",
    destination: "Disaster Recovery Storage",
    retention: 90,
    encrypted: true,
    creator: "Backup Scheduler",
  },
  {
    id: "BKP-20261031-001",
    name: "Database Snapshot",
    type: "Database",
    createdAt: "2026-10-31T23:00:00",
    size: "2.07 GB",
    status: "Failed",
    destination: "Primary Object Storage",
    retention: 30,
    encrypted: true,
    creator: "Backup Scheduler",
  },
];

const INITIAL_RESTORES: RestoreRecord[] = [
  {
    id: "RST-1001",
    backupName: "Production Platform Full Backup",
    target: "Staging Environment",
    requestedAt: "2026-11-03 14:20",
    status: "Completed",
    requestedBy: "Platform Engineering",
  },
  {
    id: "RST-1002",
    backupName: "Production Database Snapshot",
    target: "Recovery Environment",
    requestedAt: "2026-11-04 09:15",
    status: "Pending approval",
    requestedBy: "Database Operations",
  },
];

const INITIAL_SETTINGS = {
  automaticBackups: true,
  dailyBackup: true,
  weeklyFullBackup: true,
  configurationBackup: true,
  encryptBackups: true,
  verifyAfterBackup: true,
  crossRegionReplication: true,
  requireRestoreApproval: true,
  notifyOnSuccess: false,
  notifyOnFailure: true,
  retentionDays: 30,
  weeklyRetentionDays: 90,
  backupTime: "02:00",
  timezone: "Asia/Kolkata",
  destination: "Primary Object Storage",
  encryptionKey: "Managed encryption key",
};

type BackupSettings = typeof INITIAL_SETTINGS;

const INITIAL_ACTIVITY: ActivityRecord[] = [
  {
    id: "ACT-001",
    title: "Scheduled full backup completed",
    detail: "Production Platform Full Backup · 8.42 GB",
    time: "2026-11-04 02:00",
    type: "success",
  },
  {
    id: "ACT-002",
    title: "Database snapshot completed",
    detail: "Production Database Snapshot · 2.18 GB",
    time: "2026-11-03 23:00",
    type: "success",
  },
  {
    id: "ACT-003",
    title: "Restore completed",
    detail: "Production Platform Full Backup → Staging Environment",
    time: "2026-11-03 14:20",
    type: "info",
  },
  {
    id: "ACT-004",
    title: "Backup job failed",
    detail: "Database Snapshot · Review the connected backup service logs.",
    time: "2026-10-31 23:00",
    type: "warning",
  },
];

function BackupStatusBadge({ status }: { status: BackupStatus }) {
  const className =
    status === "Completed"
      ? "br-success"
      : status === "Failed"
        ? "br-failed"
        : status === "In progress"
          ? "br-progress"
          : "br-scheduled";

  return <span className={`br-status ${className}`}>{status}</span>;
}

function RestoreStatusBadge({ status }: { status: RestoreStatus }) {
  const className =
    status === "Completed"
      ? "br-success"
      : status === "Failed"
        ? "br-failed"
        : "br-pending";

  return <span className={`br-status ${className}`}>{status}</span>;
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
      className={`br-toggle ${checked ? "active" : ""}`}
      onClick={onChange}
      aria-label={label}
      aria-pressed={checked}
    >
      <span />
    </button>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatActivityTime() {
  return new Date().toLocaleString("en-IN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default function BackupRecoveryPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [backups, setBackups] = useState<BackupRecord[]>(INITIAL_BACKUPS);
  const [restores, setRestores] = useState<RestoreRecord[]>(INITIAL_RESTORES);
  const [settings, setSettings] = useState<BackupSettings>(INITIAL_SETTINGS);
  const [activity, setActivity] =
    useState<ActivityRecord[]>(INITIAL_ACTIVITY);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All types");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [notice, setNotice] = useState("");
  const [saved, setSaved] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [selectedBackup, setSelectedBackup] =
    useState<BackupRecord | null>(null);

  const [restoreBackupId, setRestoreBackupId] = useState("");
  const [restoreTarget, setRestoreTarget] = useState("Staging Environment");
  const [backupType, setBackupType] = useState<BackupType>("Full");
  const [backupName, setBackupName] = useState("");
  const [backupDestination, setBackupDestination] = useState(
    INITIAL_SETTINGS.destination,
  );
  const [backupRetention, setBackupRetention] = useState(30);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed: unknown = JSON.parse(stored);

        if (parsed && typeof parsed === "object") {
          const data = parsed as Record<string, unknown>;

          if (Array.isArray(data.backups)) {
            setBackups(data.backups as BackupRecord[]);
          }
          if (Array.isArray(data.restores)) {
            setRestores(data.restores as RestoreRecord[]);
          }
          if (Array.isArray(data.activity)) {
            setActivity(data.activity as ActivityRecord[]);
          }
          if (data.settings && typeof data.settings === "object") {
            setSettings((previous) => ({
              ...previous,
              ...(data.settings as Partial<BackupSettings>),
            }));
          }
        }
      }
    } catch {
      // Ignore malformed local demo data.
    } finally {
      setHydrated(true);
    }
  }, []);

  const filteredBackups = useMemo(() => {
    const query = search.trim().toLowerCase();

    return backups.filter((backup) => {
      const matchesSearch =
        !query ||
        backup.name.toLowerCase().includes(query) ||
        backup.id.toLowerCase().includes(query) ||
        backup.destination.toLowerCase().includes(query) ||
        backup.creator.toLowerCase().includes(query);

      const matchesType =
        typeFilter === "All types" || backup.type === typeFilter;

      const matchesStatus =
        statusFilter === "All statuses" || backup.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [backups, search, typeFilter, statusFilter]);

  const completedCount = backups.filter(
    (backup) => backup.status === "Completed",
  ).length;

  const failedCount = backups.filter(
    (backup) => backup.status === "Failed",
  ).length;

  const pendingRestoreCount = restores.filter(
    (restore) => restore.status === "Pending approval",
  ).length;

  const totalStorage = backups
    .filter((backup) => backup.status === "Completed")
    .reduce((total, backup) => {
      const match = backup.size.match(/([\d.]+)\s*(GB|MB)/i);
      if (!match) return total;

      const amount = Number(match[1]);
      return (
        total +
        (match[2].toUpperCase() === "GB" ? amount : amount / 1024)
      );
    }, 0);

  function addActivity(
    title: string,
    detail: string,
    type: ActivityType,
  ) {
    const item: ActivityRecord = {
      id: `ACT-${Date.now()}`,
      title,
      detail,
      time: formatActivityTime(),
      type,
    };

    setActivity((previous) => [item, ...previous]);
  }

  function updateSetting<K extends keyof BackupSettings>(
    key: K,
    value: BackupSettings[K],
  ) {
    setSettings((previous) => ({ ...previous, [key]: value }));
    setSaved(false);
  }

  function saveSettings() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ backups, restores, settings, activity }),
      );
      setSaved(true);
      setNotice("Backup and recovery settings saved in this browser.");
    } catch {
      setNotice("Unable to save settings in browser storage.");
    }
  }

  function createBackup() {
    const name = backupName.trim() || `${backupType} Backup`;

    const item: BackupRecord = {
      id: `BKP-${Date.now()}`,
      name,
      type: backupType,
      createdAt: new Date().toISOString(),
      size: "Pending",
      status: "Scheduled",
      destination: backupDestination,
      retention: backupRetention,
      encrypted: settings.encryptBackups,
      creator: "Platform Admin",
    };

    setBackups((previous) => [item, ...previous]);
    addActivity(
      "Backup job created",
      `${name} · ${backupType} · ${backupDestination}`,
      "info",
    );
    setShowBackupModal(false);
    setBackupName("");
    setSaved(false);
    setNotice(
      "Backup job added to the demo. A connected backup worker is required to create a real backup.",
    );
  }

  function runDemoBackup(backup: BackupRecord) {
    if (backup.status === "Completed") {
      setNotice("This backup is already marked completed in the demo.");
      return;
    }

    setBackups((previous) =>
      previous.map((item) =>
        item.id === backup.id
          ? {
              ...item,
              status: "Completed",
              createdAt: new Date().toISOString(),
              size: item.size === "Pending" ? "512 MB" : item.size,
              encrypted: settings.encryptBackups,
            }
          : item,
      ),
    );

    addActivity(
      "Demo backup marked completed",
      `${backup.name} · Simulated state change`,
      "success",
    );

    setSelectedBackup(null);
    setSaved(false);
    setNotice(
      "Backup status updated for demonstration only. No actual data was backed up.",
    );
  }

  function deleteBackup(backup: BackupRecord) {
    if (backup.status === "In progress") {
      setNotice("An in-progress backup cannot be deleted.");
      return;
    }

    setBackups((previous) =>
      previous.filter((item) => item.id !== backup.id),
    );

    addActivity(
      "Backup record removed",
      `${backup.name} · Demo record only`,
      "warning",
    );

    setSelectedBackup(null);
    setSaved(false);
    setNotice("Backup record removed from the local demo.");
  }

  function createRestoreRequest() {
    const backup = backups.find((item) => item.id === restoreBackupId);

    if (!backup) {
      setNotice("Select a backup before creating a restore request.");
      return;
    }

    if (backup.status !== "Completed") {
      setNotice("Only completed backups can be selected for a restore request.");
      return;
    }

    const item: RestoreRecord = {
      id: `RST-${Date.now()}`,
      backupName: backup.name,
      target: restoreTarget,
      requestedAt: formatActivityTime(),
      status: settings.requireRestoreApproval
        ? "Pending approval"
        : "Completed",
      requestedBy: "Platform Admin",
    };

    setRestores((previous) => [item, ...previous]);

    addActivity(
      settings.requireRestoreApproval
        ? "Restore request submitted"
        : "Demo restore recorded",
      `${backup.name} → ${restoreTarget}`,
      settings.requireRestoreApproval ? "info" : "warning",
    );

    setShowRestoreModal(false);
    setRestoreBackupId("");
    setSaved(false);
    setNotice(
      settings.requireRestoreApproval
        ? "Restore request created and marked pending approval. No data was restored."
        : "Restore recorded in demo mode. No actual data was restored.",
    );
  }

  function updateRestoreStatus(
    restore: RestoreRecord,
    status: RestoreStatus,
  ) {
    setRestores((previous) =>
      previous.map((item) =>
        item.id === restore.id ? { ...item, status } : item,
      ),
    );

    addActivity(
      `Restore marked ${status.toLowerCase()}`,
      `${restore.backupName} → ${restore.target}`,
      status === "Completed" ? "success" : "warning",
    );

    setSaved(false);
    setNotice(
      `Restore status updated to "${status}" in the demo. No data was restored.`,
    );
  }

  function exportBackups() {
    const headers = [
      "ID",
      "Name",
      "Type",
      "Created At",
      "Size",
      "Status",
      "Destination",
      "Retention Days",
      "Encrypted",
      "Creator",
    ];

    const rows = filteredBackups.map((backup) => [
      backup.id,
      backup.name,
      backup.type,
      backup.createdAt,
      backup.size,
      backup.status,
      backup.destination,
      String(backup.retention),
      backup.encrypted ? "Yes" : "No",
      backup.creator,
    ]);

    const escapeCell = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCell).join(","))
      .join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "modelnow-backup-records.csv";
    anchor.click();
    URL.revokeObjectURL(url);

    setNotice("Backup records exported to CSV.");
  }

  function resetDemo() {
    setBackups(INITIAL_BACKUPS);
    setRestores(INITIAL_RESTORES);
    setSettings(INITIAL_SETTINGS);
    setActivity(INITIAL_ACTIVITY);

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore unavailable browser storage.
    }

    setSaved(false);
    setNotice("Backup and recovery demo data has been reset.");
  }

  return (
    <main className="backup-recovery">
      <style>{`
        .backup-recovery{--br-blue:#315bea;--br-text:#1b2639;--br-muted:#7b879a;--br-border:#e4e8f0;min-height:100vh;padding:30px;background:#f7f8fc;color:var(--br-text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
        .backup-recovery *{box-sizing:border-box}
        .br-shell{max-width:1450px;margin:auto}
        .br-breadcrumb{display:flex;gap:8px;align-items:center;font-size:12px;color:var(--br-muted);margin-bottom:20px}
        .br-breadcrumb strong{color:#39445a}
        .br-header{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;flex-wrap:wrap;margin-bottom:24px}
        .br-heading{display:flex;align-items:flex-start;gap:14px}
        .br-heading-icon{display:grid;place-items:center;width:48px;height:48px;border-radius:14px;background:#eaf0ff;color:var(--br-blue);flex-shrink:0}
        .br-title{font-size:27px;font-weight:770;letter-spacing:-.8px;margin:0 0 7px}
        .br-subtitle{font-size:13px;line-height:1.65;color:var(--br-muted);max-width:730px;margin:0}
        .br-actions{display:flex;gap:9px;flex-wrap:wrap}
        .br-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:10px 13px;border:1px solid var(--br-border);border-radius:9px;background:#fff;color:#3f4a60;font-size:12px;font-weight:670;cursor:pointer}
        .br-btn:hover{background:#f7f9ff;border-color:#bdcafa}
        .br-btn:disabled{opacity:.5;cursor:not-allowed}
        .br-btn.primary{background:var(--br-blue);border-color:var(--br-blue);color:white}
        .br-btn.primary:hover{background:#254bd1}
        .br-alert{display:flex;align-items:flex-start;gap:9px;padding:12px 14px;border:1px solid #cbd9ff;background:#eff4ff;color:#2947a2;border-radius:10px;font-size:12px;line-height:1.55;margin-bottom:18px}
        .br-alert button{margin-left:auto;border:0;background:transparent;color:inherit;cursor:pointer}
        .br-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:20px}
        .br-stat{padding:17px 18px;background:white;border:1px solid var(--br-border);border-radius:13px}
        .br-stat-top{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:12px;color:var(--br-muted)}
        .br-stat-icon{width:35px;height:35px;display:grid;place-items:center;background:#f0f3f9;color:#5f6d83;border-radius:10px}
        .br-stat-value{font-size:28px;font-weight:770;letter-spacing:-.7px;margin-top:13px}
        .br-stat-note{font-size:11px;color:var(--br-muted);margin-top:5px}
        .br-tabs{display:flex;gap:5px;padding:6px;border:1px solid var(--br-border);border-radius:11px;background:#fff;margin-bottom:18px;overflow-x:auto}
        .br-tab{white-space:nowrap;border:0;background:transparent;border-radius:8px;padding:10px 14px;font-size:12px;font-weight:670;color:#69758a;cursor:pointer}
        .br-tab.active{background:#edf2ff;color:var(--br-blue)}
        .br-card{background:white;border:1px solid var(--br-border);border-radius:14px;overflow:hidden;margin-bottom:18px}
        .br-card-head{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;padding:17px 19px;border-bottom:1px solid var(--br-border)}
        .br-card-title{font-size:14px;font-weight:740;margin:0 0 5px}
        .br-card-subtitle{font-size:11px;line-height:1.55;color:var(--br-muted);margin:0}
        .br-status{display:inline-flex;padding:5px 8px;border-radius:20px;font-size:10px;font-weight:720;white-space:nowrap}
        .br-success{background:#e8f8ee;color:#17834b}.br-failed{background:#ffeded;color:#bd3535}.br-progress{background:#fff1db;color:#a36300}.br-scheduled{background:#edf2ff;color:#315bea}.br-pending{background:#fff4df;color:#a66a08}
        .br-table-wrap{width:100%;overflow-x:auto}
        .br-table{width:100%;border-collapse:collapse;text-align:left;min-width:1050px}
        .br-table th{font-size:10px;letter-spacing:.45px;text-transform:uppercase;color:#8590a2;font-weight:750;background:#fafbfe;padding:12px 15px;border-bottom:1px solid var(--br-border);white-space:nowrap}
        .br-table td{font-size:12px;padding:14px 15px;border-bottom:1px solid #eef0f5;color:#3e4960;vertical-align:middle}
        .br-table tbody tr:hover{background:#fbfcff}.br-table tr:last-child td{border-bottom:0}
        .br-name{font-size:12px;font-weight:720;color:#263249;margin-bottom:4px}
        .br-id{font-size:10px;color:#8490a3;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
        .br-muted{font-size:11px;color:var(--br-muted);line-height:1.55}
        .br-search{display:flex;align-items:center;gap:8px;border:1px solid var(--br-border);border-radius:8px;padding:0 10px;min-width:220px;max-width:360px;flex:1;background:#fff}
        .br-search input{border:0;outline:none;padding:10px 0;width:100%;font-size:12px;color:var(--br-text);background:transparent}
        .br-select{border:1px solid var(--br-border);border-radius:8px;padding:10px 11px;font-size:12px;color:#465168;background:#fff;outline:none}
        .br-filters{display:flex;align-items:center;gap:9px;flex-wrap:wrap;padding:14px 17px;border-bottom:1px solid var(--br-border)}
        .br-empty{text-align:center;padding:42px 15px;color:var(--br-muted);font-size:12px}
        .br-layout{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(280px,.8fr);gap:18px}
        .br-toggle{width:39px;height:22px;border:0;border-radius:20px;background:#cbd1dd;padding:3px;cursor:pointer;flex-shrink:0;transition:.15s}
        .br-toggle span{display:block;width:16px;height:16px;border-radius:50%;background:white;box-shadow:0 1px 3px #0002;transition:transform .15s}
        .br-toggle.active{background:var(--br-blue)}.br-toggle.active span{transform:translateX(17px)}
        .br-config-row{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:16px 19px;border-bottom:1px solid #eef0f5}
        .br-config-row:last-child{border-bottom:0}
        .br-config-title{font-size:12px;font-weight:720;margin-bottom:5px}
        .br-config-description{font-size:11px;line-height:1.55;color:var(--br-muted);max-width:700px}
        .br-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:15px;padding:19px}
        .br-field{display:flex;flex-direction:column;gap:7px;min-width:0}
        .br-field label{font-size:11px;font-weight:720;color:#48536a}
        .br-field input,.br-field select{width:100%;border:1px solid #dfe4ed;border-radius:8px;padding:11px 12px;font-size:12px;outline:none;background:#fff;color:#273248}
        .br-field input:focus,.br-field select:focus{border-color:#8ea5fb;box-shadow:0 0 0 3px #315bea12}
        .br-field.full{grid-column:1/-1}
        .br-note{display:flex;align-items:flex-start;gap:9px;padding:12px 14px;border:1px solid #f0dfb9;background:#fff9eb;color:#875b13;border-radius:10px;font-size:11px;line-height:1.6;margin:17px 19px}
        .br-timeline{padding:3px 19px 15px}
        .br-event{display:flex;gap:13px;padding:16px 0;border-bottom:1px solid #eef0f5}.br-event:last-child{border-bottom:0}
        .br-event-icon{width:34px;height:34px;display:grid;place-items:center;border-radius:10px;flex-shrink:0;background:#eff4ff;color:#315bea}
        .br-event-icon.success{background:#e8f8ee;color:#17834b}.br-event-icon.warning{background:#fff4df;color:#a66a08}
        .br-event-title{font-size:12px;font-weight:720;margin-bottom:4px}.br-event-time{font-size:10px;color:var(--br-muted);margin-top:6px}
        .br-banner{padding:20px;background:linear-gradient(125deg,#233d94,#315bea);border-radius:13px;color:white;margin-bottom:18px}
        .br-banner-title{font-size:21px;font-weight:780;letter-spacing:-.5px;margin:10px 0}
        .br-banner-copy{font-size:12px;line-height:1.65;color:#e0e8ff}
        .br-modal-backdrop{position:fixed;inset:0;background:#10182870;z-index:50;display:flex;align-items:center;justify-content:center;padding:18px}
        .br-modal{width:100%;max-width:560px;max-height:90vh;overflow-y:auto;background:white;border-radius:16px;box-shadow:0 24px 80px #10182830}
        .br-modal-head{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;padding:20px;border-bottom:1px solid var(--br-border)}
        .br-modal-title{font-size:17px;font-weight:760;margin:0 0 6px}
        .br-modal-subtitle{font-size:11px;color:var(--br-muted);line-height:1.5;margin:0}
        .br-modal-body{padding:20px}
        .br-modal-footer{display:flex;justify-content:flex-end;gap:9px;padding:15px 20px;border-top:1px solid var(--br-border)}
        .br-close{width:30px;height:30px;border:0;border-radius:8px;background:#f3f5f9;display:grid;place-items:center;cursor:pointer;color:#657087}
        @media(max-width:1000px){.br-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.br-layout{grid-template-columns:1fr}}
        @media(max-width:650px){.backup-recovery{padding:16px}.br-title{font-size:23px}.br-stats{gap:9px}.br-stat{padding:13px}.br-stat-value{font-size:24px}.br-form-grid{grid-template-columns:1fr}.br-field.full{grid-column:auto}.br-search{min-width:100%;max-width:none}.br-filters .br-select{flex:1}.br-actions{width:100%}.br-actions .br-btn{flex:1}.br-tab{padding:10px}}
      `}</style>

      <div className="br-shell">
        <div className="br-breadcrumb">
          <span>Admin</span><span>/</span><span>Settings</span><span>/</span>
          <strong>Backup &amp; Recovery</strong>
        </div>

        <header className="br-header">
          <div className="br-heading">
            <div className="br-heading-icon"><Database size={24} /></div>
            <div>
              <h1 className="br-title">Backup &amp; Recovery</h1>
              <p className="br-subtitle">
                Manage backup schedules, retention policies, storage destinations,
                restore requests, and disaster recovery preferences.
              </p>
            </div>
          </div>
          <div className="br-actions">
            <button className="br-btn" onClick={resetDemo}><RefreshCw size={14} /> Reset demo</button>
            <button className="br-btn" onClick={exportBackups}><Download size={14} /> Export records</button>
            <button className="br-btn primary" onClick={() => setShowBackupModal(true)}><Plus size={15} /> Create backup job</button>
          </div>
        </header>

        {notice && (
          <div className="br-alert">
            <Info size={16} />
            <span>{notice}</span>
            <button onClick={() => setNotice("")} aria-label="Dismiss notice"><X size={15} /></button>
          </div>
        )}

        <section className="br-stats">
          <div className="br-stat">
            <div className="br-stat-top">Total backup records <span className="br-stat-icon"><Archive size={17} /></span></div>
            <div className="br-stat-value">{backups.length}</div>
            <div className="br-stat-note">Full, incremental, database, and configuration</div>
          </div>
          <div className="br-stat">
            <div className="br-stat-top">Successful backups <span className="br-stat-icon"><CheckCircle2 size={17} /></span></div>
            <div className="br-stat-value">{completedCount}</div>
            <div className="br-stat-note">Records marked completed</div>
          </div>
          <div className="br-stat">
            <div className="br-stat-top">Failed backups <span className="br-stat-icon"><AlertTriangle size={17} /></span></div>
            <div className="br-stat-value">{failedCount}</div>
            <div className="br-stat-note">Require investigation or retry</div>
          </div>
          <div className="br-stat">
            <div className="br-stat-top">Recorded storage <span className="br-stat-icon"><HardDrive size={17} /></span></div>
            <div className="br-stat-value">{totalStorage.toFixed(1)} GB</div>
            <div className="br-stat-note">Completed demo records only</div>
          </div>
        </section>

        <nav className="br-tabs" aria-label="Backup and recovery sections">
          {(["Overview", "Backups", "Restore", "Configuration", "Activity"] as Tab[]).map((tab) => (
            <button
              key={tab}
              className={`br-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>

        {activeTab === "Overview" && (
          <div className="br-layout">
            <div>
              <section className="br-banner">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#dce5ff" }}>DATA PROTECTION OVERVIEW</span>
                  <ShieldCheck size={23} />
                </div>
                <div className="br-banner-title">Keep recovery readiness visible</div>
                <div className="br-banner-copy">
                  Review backup completion, encryption preferences, restore approvals,
                  and replication settings. Live operations require a connected recovery service.
                </div>
                <button className="br-btn" style={{ marginTop: 16 }} onClick={() => setActiveTab("Configuration")}><Settings2 size={14} /> Review configuration</button>
              </section>

              <section className="br-card">
                <div className="br-card-head">
                  <div><h2 className="br-card-title">Recent backups</h2><p className="br-card-subtitle">Latest backup records and their status.</p></div>
                  <button className="br-btn" onClick={() => setActiveTab("Backups")}>View all</button>
                </div>
                <div className="br-table-wrap">
                  <table className="br-table">
                    <thead><tr><th>Backup</th><th>Type</th><th>Created</th><th>Size</th><th>Status</th><th>Encryption</th><th>Details</th></tr></thead>
                    <tbody>
                      {backups.slice(0, 5).map((backup) => (
                        <tr key={backup.id}>
                          <td><div className="br-name">{backup.name}</div><div className="br-id">{backup.id}</div></td>
                          <td>{backup.type}</td><td>{formatDate(backup.createdAt)}</td><td>{backup.size}</td>
                          <td><BackupStatusBadge status={backup.status} /></td>
                          <td><span className={`br-status ${backup.encrypted ? "br-success" : "br-failed"}`}>{backup.encrypted ? "Encrypted" : "Not encrypted"}</span></td>
                          <td><button className="br-btn" onClick={() => setSelectedBackup(backup)}>View</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            <div>
              <section className="br-card">
                <div className="br-card-head">
                  <div><h2 className="br-card-title">Protection settings</h2><p className="br-card-subtitle">Key backup and recovery controls.</p></div>
                  <LockKeyhole size={18} color="#778195" />
                </div>
                {([
                  { key: "automaticBackups", title: "Automatic backups", description: "Schedule recurring backup jobs." },
                  { key: "encryptBackups", title: "Backup encryption", description: "Mark artifacts for encryption." },
                  { key: "verifyAfterBackup", title: "Verify after backup", description: "Request post-backup integrity checks." },
                  { key: "crossRegionReplication", title: "Cross-region replication", description: "Configure a secondary recovery destination." },
                ] as const).map((item) => (
                  <div className="br-config-row" key={item.key}>
                    <div><div className="br-config-title">{item.title}</div><div className="br-config-description">{item.description}</div></div>
                    <Toggle checked={settings[item.key]} onChange={() => updateSetting(item.key, !settings[item.key])} label={item.title} />
                  </div>
                ))}
                <div style={{ padding: 16 }}>
                  <button className="br-btn primary" style={{ width: "100%" }} onClick={saveSettings}><Save size={14} /> {saved ? "Saved" : "Save protection settings"}</button>
                </div>
              </section>

              <section className="br-card">
                <div className="br-card-head">
                  <div><h2 className="br-card-title">Restore requests</h2><p className="br-card-subtitle">Requests awaiting review or completion.</p></div>
                  <RotateCcw size={18} color="#778195" />
                </div>
                <div style={{ padding: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <div><div className="br-name">Pending approval</div><div className="br-muted">Requests requiring review</div></div>
                    <div style={{ fontSize: 24, fontWeight: 770 }}>{pendingRestoreCount}</div>
                  </div>
                  <button className="br-btn" style={{ width: "100%", marginTop: 16 }} onClick={() => setActiveTab("Restore")}>Manage restore requests</button>
                </div>
              </section>
              <div className="br-note"><AlertTriangle size={15} /> A production recovery plan should include tested restores, access controls, off-site copies, and documented recovery objectives.</div>
            </div>
          </div>
        )}

        {activeTab === "Backups" && (
          <section className="br-card">
            <div className="br-card-head">
              <div><h2 className="br-card-title">Backup records</h2><p className="br-card-subtitle">Search, filter, inspect, and export backup records.</p></div>
              <button className="br-btn primary" onClick={() => setShowBackupModal(true)}><Plus size={14} /> Create backup</button>
            </div>
            <div className="br-filters">
              <div className="br-search"><Search size={15} color="#8a94a6" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search backup name, ID, destination..." /></div>
              <select className="br-select" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                <option>All types</option><option>Full</option><option>Incremental</option><option>Database</option><option>Configuration</option>
              </select>
              <select className="br-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option>All statuses</option><option>Completed</option><option>In progress</option><option>Failed</option><option>Scheduled</option>
              </select>
              <button className="br-btn" onClick={() => { setSearch(""); setTypeFilter("All types"); setStatusFilter("All statuses"); }}>Clear filters</button>
            </div>
            <div className="br-table-wrap">
              <table className="br-table">
                <thead><tr><th>Backup</th><th>Type</th><th>Created</th><th>Size</th><th>Status</th><th>Destination</th><th>Retention</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredBackups.map((backup) => (
                    <tr key={backup.id}>
                      <td><div className="br-name">{backup.name}</div><div className="br-id">{backup.id}</div></td>
                      <td>{backup.type}</td><td>{formatDate(backup.createdAt)}</td><td>{backup.size}</td>
                      <td><BackupStatusBadge status={backup.status} /></td><td>{backup.destination}</td><td>{backup.retention} days</td>
                      <td><button className="br-btn" onClick={() => setSelectedBackup(backup)}>Manage</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredBackups.length === 0 && <div className="br-empty">No backup records match your filters.</div>}
            </div>
          </section>
        )}

        {activeTab === "Restore" && (
          <section className="br-card">
            <div className="br-card-head">
              <div><h2 className="br-card-title">Restore management</h2><p className="br-card-subtitle">Review restore requests and record approval outcomes.</p></div>
              <button className="br-btn primary" onClick={() => setShowRestoreModal(true)}><RotateCcw size={14} /> New restore request</button>
            </div>
            <div className="br-note"><AlertTriangle size={15} /> This page records demo requests only. It does not overwrite databases or restore files.</div>
            <div className="br-table-wrap">
              <table className="br-table">
                <thead><tr><th>Request ID</th><th>Backup</th><th>Target environment</th><th>Requested at</th><th>Requested by</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {restores.map((restore) => (
                    <tr key={restore.id}>
                      <td><div className="br-id">{restore.id}</div></td><td><div className="br-name">{restore.backupName}</div></td>
                      <td>{restore.target}</td><td>{restore.requestedAt}</td><td>{restore.requestedBy}</td>
                      <td><RestoreStatusBadge status={restore.status} /></td>
                      <td>
                        {restore.status === "Pending approval" ? (
                          <div style={{ display: "flex", gap: 6 }}>
                            <button className="br-btn primary" onClick={() => updateRestoreStatus(restore, "Completed")}><Check size={13} /> Approve</button>
                            <button className="br-btn" onClick={() => updateRestoreStatus(restore, "Failed")}>Reject</button>
                          </div>
                        ) : <span className="br-muted">No actions</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {restores.length === 0 && <div className="br-empty">No restore requests have been recorded.</div>}
            </div>
          </section>
        )}

        {activeTab === "Configuration" && (
          <>
            <section className="br-card">
              <div className="br-card-head">
                <div><h2 className="br-card-title">Backup schedule</h2><p className="br-card-subtitle">Configure recurring backup policies and retention periods.</p></div>
                <CalendarClock size={19} color="#778195" />
              </div>
              {([
                { key: "automaticBackups", title: "Automatic backups", description: "Enable recurring scheduled backup jobs." },
                { key: "dailyBackup", title: "Daily incremental backup", description: "Configure daily incremental jobs." },
                { key: "weeklyFullBackup", title: "Weekly full backup", description: "Configure weekly full backup jobs." },
                { key: "configurationBackup", title: "Configuration snapshots", description: "Include configuration in backup planning." },
              ] as const).map((item) => (
                <div className="br-config-row" key={item.key}>
                  <div><div className="br-config-title">{item.title}</div><div className="br-config-description">{item.description}</div></div>
                  <Toggle checked={settings[item.key]} onChange={() => updateSetting(item.key, !settings[item.key])} label={item.title} />
                </div>
              ))}
              <div className="br-form-grid">
                <div className="br-field"><label htmlFor="br-backup-time">Daily backup time</label><input id="br-backup-time" type="time" value={settings.backupTime} onChange={(event) => updateSetting("backupTime", event.target.value)} /></div>
                <div className="br-field"><label htmlFor="br-timezone">Schedule timezone</label><select id="br-timezone" value={settings.timezone} onChange={(event) => updateSetting("timezone", event.target.value)}><option value="Asia/Kolkata">India Standard Time — Asia/Kolkata</option><option value="UTC">Coordinated Universal Time — UTC</option><option value="America/New_York">Eastern Time — America/New_York</option><option value="Europe/London">United Kingdom — Europe/London</option><option value="Asia/Singapore">Singapore — Asia/Singapore</option></select></div>
                <div className="br-field"><label htmlFor="br-retention">Daily backup retention</label><select id="br-retention" value={settings.retentionDays} onChange={(event) => updateSetting("retentionDays", Number(event.target.value))}><option value={7}>7 days</option><option value={14}>14 days</option><option value={30}>30 days</option><option value={60}>60 days</option><option value={90}>90 days</option><option value={180}>180 days</option></select></div>
                <div className="br-field"><label htmlFor="br-weekly-retention">Weekly backup retention</label><select id="br-weekly-retention" value={settings.weeklyRetentionDays} onChange={(event) => updateSetting("weeklyRetentionDays", Number(event.target.value))}><option value={30}>30 days</option><option value={60}>60 days</option><option value={90}>90 days</option><option value={180}>180 days</option><option value={365}>365 days</option></select></div>
              </div>
            </section>

            <section className="br-card">
              <div className="br-card-head">
                <div><h2 className="br-card-title">Storage and encryption</h2><p className="br-card-subtitle">Set intended storage and protection policies.</p></div>
                <LockKeyhole size={19} color="#778195" />
              </div>
              {([
                { key: "encryptBackups", title: "Encrypt backup artifacts", description: "Require encryption in the configured workflow." },
                { key: "verifyAfterBackup", title: "Verify backup integrity", description: "Run verification after a backup operation completes." },
                { key: "crossRegionReplication", title: "Cross-region replication", description: "Maintain a secondary copy when supported by the storage backend." },
              ] as const).map((item) => (
                <div className="br-config-row" key={item.key}>
                  <div><div className="br-config-title">{item.title}</div><div className="br-config-description">{item.description}</div></div>
                  <Toggle checked={settings[item.key]} onChange={() => updateSetting(item.key, !settings[item.key])} label={item.title} />
                </div>
              ))}
              <div className="br-form-grid">
                <div className="br-field"><label htmlFor="br-destination">Default storage destination</label><select id="br-destination" value={settings.destination} onChange={(event) => updateSetting("destination", event.target.value)}><option>Primary Object Storage</option><option>Disaster Recovery Storage</option><option>Encrypted Archive Storage</option><option>Private Cloud Storage</option></select></div>
                <div className="br-field"><label htmlFor="br-encryption-key">Encryption key policy</label><select id="br-encryption-key" value={settings.encryptionKey} onChange={(event) => updateSetting("encryptionKey", event.target.value)}><option>Managed encryption key</option><option>Customer-managed key</option><option>Dedicated key per organization</option></select></div>
              </div>
              <div className="br-note"><Shield size={15} /> These are configuration placeholders. Connect a key-management system and storage provider to enforce them.</div>
            </section>

            <section className="br-card">
              <div className="br-card-head">
                <div><h2 className="br-card-title">Restore and notifications</h2><p className="br-card-subtitle">Configure restore approvals and backup event notifications.</p></div>
                <Bell size={19} color="#778195" />
              </div>
              {([
                { key: "requireRestoreApproval", title: "Require restore approval", description: "Keep requests pending until an authorized approver acts." },
                { key: "notifyOnSuccess", title: "Notify on successful backups", description: "Send a notification when a backup completes." },
                { key: "notifyOnFailure", title: "Notify on backup failures", description: "Alert administrators when backup jobs fail." },
              ] as const).map((item) => (
                <div className="br-config-row" key={item.key}>
                  <div><div className="br-config-title">{item.title}</div><div className="br-config-description">{item.description}</div></div>
                  <Toggle checked={settings[item.key]} onChange={() => updateSetting(item.key, !settings[item.key])} label={item.title} />
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 9, padding: 17 }}>
                <button className="br-btn" onClick={resetDemo}><RefreshCw size={14} /> Reset demo</button>
                <button className="br-btn primary" onClick={saveSettings}><Save size={14} /> {saved ? "Saved" : "Save configuration"}</button>
              </div>
            </section>
          </>
        )}

        {activeTab === "Activity" && (
          <section className="br-card">
            <div className="br-card-head">
              <div><h2 className="br-card-title">Backup and recovery activity</h2><p className="br-card-subtitle">Events recorded by this page in the local demo.</p></div>
              <span className="br-status br-scheduled">{activity.length} events</span>
            </div>
            <div className="br-timeline">
              {activity.map((item) => (
                <div className="br-event" key={item.id}>
                  <div className={`br-event-icon ${item.type}`}>
                    {item.type === "success" ? <CheckCircle2 size={16} /> : item.type === "warning" ? <AlertTriangle size={16} /> : <History size={16} />}
                  </div>
                  <div>
                    <div className="br-event-title">{item.title}</div>
                    <div className="br-muted">{item.detail}</div>
                    <div className="br-event-time">{item.time} · {item.id}</div>
                  </div>
                </div>
              ))}
            </div>
            {activity.length === 0 && <div className="br-empty">No activity recorded.</div>}
          </section>
        )}

        <footer style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", padding: "5px 2px", color: "#8993a5", fontSize: 11 }}>
          <span>ModelNow Admin · Backup &amp; Recovery</span>
          <span>{saved ? "Local settings saved" : "Demo mode"} · Real backup execution requires backend integration</span>
        </footer>
      </div>

      {showBackupModal && (
        <div className="br-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setShowBackupModal(false);
        }}>
          <section className="br-modal" role="dialog" aria-modal="true" aria-labelledby="br-create-title">
            <div className="br-modal-head">
              <div><h2 id="br-create-title" className="br-modal-title">Create backup job</h2><p className="br-modal-subtitle">Create a backup job record for the local demo.</p></div>
              <button className="br-close" onClick={() => setShowBackupModal(false)} aria-label="Close dialog"><X size={16} /></button>
            </div>
            <div className="br-modal-body">
              <div className="br-form-grid" style={{ padding: 0 }}>
                <div className="br-field full"><label htmlFor="br-name">Backup name</label><input id="br-name" value={backupName} onChange={(event) => setBackupName(event.target.value)} placeholder="e.g. Production Full Backup" /></div>
                <div className="br-field"><label htmlFor="br-type">Backup type</label><select id="br-type" value={backupType} onChange={(event) => setBackupType(event.target.value as BackupType)}><option>Full</option><option>Incremental</option><option>Database</option><option>Configuration</option></select></div>
                <div className="br-field"><label htmlFor="br-job-destination">Storage destination</label><select id="br-job-destination" value={backupDestination} onChange={(event) => setBackupDestination(event.target.value)}><option>Primary Object Storage</option><option>Disaster Recovery Storage</option><option>Encrypted Archive Storage</option><option>Private Cloud Storage</option></select></div>
                <div className="br-field full"><label htmlFor="br-job-retention">Retention period</label><select id="br-job-retention" value={backupRetention} onChange={(event) => setBackupRetention(Number(event.target.value))}><option value={7}>7 days</option><option value={14}>14 days</option><option value={30}>30 days</option><option value={60}>60 days</option><option value={90}>90 days</option><option value={180}>180 days</option><option value={365}>365 days</option></select></div>
              </div>
              <div className="br-note"><Info size={15} /> This only adds a record. It does not execute a real backup.</div>
            </div>
            <div className="br-modal-footer">
              <button className="br-btn" onClick={() => setShowBackupModal(false)}>Cancel</button>
              <button className="br-btn primary" onClick={createBackup}><Plus size={14} /> Create job</button>
            </div>
          </section>
        </div>
      )}

      {showRestoreModal && (
        <div className="br-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setShowRestoreModal(false);
        }}>
          <section className="br-modal" role="dialog" aria-modal="true" aria-labelledby="br-restore-title">
            <div className="br-modal-head">
              <div><h2 id="br-restore-title" className="br-modal-title">Create restore request</h2><p className="br-modal-subtitle">Select a completed backup and target environment.</p></div>
              <button className="br-close" onClick={() => setShowRestoreModal(false)} aria-label="Close dialog"><X size={16} /></button>
            </div>
            <div className="br-modal-body">
              <div className="br-form-grid" style={{ padding: 0 }}>
                <div className="br-field full">
                  <label htmlFor="br-restore-backup">Source backup</label>
                  <select id="br-restore-backup" value={restoreBackupId} onChange={(event) => setRestoreBackupId(event.target.value)}>
                    <option value="">Select a completed backup</option>
                    {backups.filter((backup) => backup.status === "Completed").map((backup) => (
                      <option key={backup.id} value={backup.id}>{backup.name} — {backup.createdAt.slice(0, 10)}</option>
                    ))}
                  </select>
                </div>
                <div className="br-field full">
                  <label htmlFor="br-restore-target">Restore target</label>
                  <select id="br-restore-target" value={restoreTarget} onChange={(event) => setRestoreTarget(event.target.value)}>
                    <option>Staging Environment</option><option>Recovery Environment</option><option>Development Environment</option><option>Isolated Test Environment</option>
                  </select>
                </div>
              </div>
              <div className="br-note"><AlertTriangle size={15} /> Confirm ownership, isolation, and approval before restoring in a real environment. This demo restores no data.</div>
            </div>
            <div className="br-modal-footer">
              <button className="br-btn" onClick={() => setShowRestoreModal(false)}>Cancel</button>
              <button className="br-btn primary" onClick={createRestoreRequest}><RotateCcw size={14} /> Submit request</button>
            </div>
          </section>
        </div>
      )}

      {selectedBackup && (
        <div className="br-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setSelectedBackup(null);
        }}>
          <section className="br-modal" role="dialog" aria-modal="true" aria-labelledby="br-detail-title">
            <div className="br-modal-head">
              <div><h2 id="br-detail-title" className="br-modal-title">{selectedBackup.name}</h2><p className="br-modal-subtitle">{selectedBackup.id} · Backup details</p></div>
              <button className="br-close" onClick={() => setSelectedBackup(null)} aria-label="Close dialog"><X size={16} /></button>
            </div>
            <div className="br-modal-body">
              {[
                { label: "Status", value: <BackupStatusBadge status={selectedBackup.status} /> },
                { label: "Backup type", value: selectedBackup.type },
                { label: "Created", value: formatDate(selectedBackup.createdAt) },
                { label: "Size", value: selectedBackup.size },
                { label: "Storage destination", value: selectedBackup.destination },
                { label: "Retention", value: `${selectedBackup.retention} days` },
                { label: "Encryption", value: <span className={`br-status ${selectedBackup.encrypted ? "br-success" : "br-failed"}`}>{selectedBackup.encrypted ? "Enabled" : "Disabled"}</span> },
                { label: "Created by", value: selectedBackup.creator },
              ].map((item) => (
                <div className="br-config-row" style={{ padding: "13px 0" }} key={item.label}>
                  <div className="br-config-title">{item.label}</div>
                  <div className="br-muted">{item.value}</div>
                </div>
              ))}
              <div className="br-note"><Info size={15} /> Metadata shown here is demo data. Real metadata and permissions must come from the backup service.</div>
            </div>
            <div className="br-modal-footer" style={{ justifyContent: "space-between" }}>
              <button className="br-btn" onClick={() => deleteBackup(selectedBackup)} disabled={selectedBackup.status === "In progress"}><Trash2 size={14} /> Delete record</button>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="br-btn" onClick={() => setSelectedBackup(null)}>Close</button>
                {selectedBackup.status !== "Completed" && <button className="br-btn primary" onClick={() => runDemoBackup(selectedBackup)}><Play size={14} /> Simulate completion</button>}
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
