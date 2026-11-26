
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  ArrowUpRight,
  Check,
  CheckCircle2,
  CircleAlert,
  Cloud,
  Database,
  Download,
  File,
  FileText,
  HardDrive,
  Image as ImageIcon,
  Layers3,
  LockKeyhole,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Trash2,
  Upload,
  X,
  Power,
} from "lucide-react";

type StorageStatus = "Active" | "Inactive" | "Warning";
type FileType = "Document" | "Image" | "Dataset" | "Archive";
type FileStatus = "Available" | "Processing" | "Archived";
type Tab =
  | "Overview"
  | "Storage Providers"
  | "Files & Assets"
  | "Capacity & Quotas"
  | "Retention Policies"
  | "Security";

type StorageProvider = {
  id: string;
  name: string;
  type: string;
  region: string;
  status: StorageStatus;
  capacityGb: number;
  usedGb: number;
  files: number;
  updatedAt: string;
  color: string;
  icon: string;
};

type StoredFile = {
  id: string;
  name: string;
  type: FileType;
  sizeMb: number;
  provider: string;
  uploadedAt: string;
  owner: string;
  status: FileStatus;
};

const STORAGE_KEY = "modelnow-admin-storage-settings-v2";

const INITIAL_PROVIDERS: StorageProvider[] = [
  {
    id: "primary",
    name: "ModelNow Primary Storage",
    type: "Object Storage",
    region: "ap-south-1",
    status: "Active",
    capacityGb: 1000,
    usedGb: 624,
    files: 18420,
    updatedAt: "Today, 10:24",
    color: "#315bea",
    icon: "MN",
  },
  {
    id: "knowledge",
    name: "Knowledge Hub Storage",
    type: "Document Storage",
    region: "ap-south-1",
    status: "Active",
    capacityGb: 500,
    usedGb: 318,
    files: 7280,
    updatedAt: "Today, 09:52",
    color: "#7c55d9",
    icon: "KH",
  },
  {
    id: "datasets",
    name: "Fine-tuning Datasets",
    type: "Dataset Storage",
    region: "ap-south-1",
    status: "Warning",
    capacityGb: 200,
    usedGb: 184,
    files: 1240,
    updatedAt: "Today, 08:30",
    color: "#d58b28",
    icon: "DS",
  },
  {
    id: "backups",
    name: "Backup Archive",
    type: "Archive Storage",
    region: "ap-south-1",
    status: "Active",
    capacityGb: 2000,
    usedGb: 410,
    files: 950,
    updatedAt: "Yesterday, 23:00",
    color: "#159b78",
    icon: "BA",
  },
];

const INITIAL_FILES: StoredFile[] = [
  {
    id: "F-1001",
    name: "enterprise-policy.pdf",
    type: "Document",
    sizeMb: 24.8,
    provider: "Knowledge Hub Storage",
    uploadedAt: "Nov 04, 2026",
    owner: "Admin",
    status: "Available",
  },
  {
    id: "F-1002",
    name: "customer-support-dataset.jsonl",
    type: "Dataset",
    sizeMb: 186.4,
    provider: "Fine-tuning Datasets",
    uploadedAt: "Nov 04, 2026",
    owner: "AI Platform",
    status: "Processing",
  },
  {
    id: "F-1003",
    name: "modelnow-brand-assets.png",
    type: "Image",
    sizeMb: 8.2,
    provider: "ModelNow Primary Storage",
    uploadedAt: "Nov 03, 2026",
    owner: "Marketing",
    status: "Available",
  },
  {
    id: "F-1004",
    name: "production-backup-2026-11.zip",
    type: "Archive",
    sizeMb: 942.6,
    provider: "Backup Archive",
    uploadedAt: "Nov 03, 2026",
    owner: "System",
    status: "Archived",
  },
  {
    id: "F-1005",
    name: "model-evaluation-results.csv",
    type: "Dataset",
    sizeMb: 56.7,
    provider: "Fine-tuning Datasets",
    uploadedAt: "Nov 02, 2026",
    owner: "AI Platform",
    status: "Available",
  },
  {
    id: "F-1006",
    name: "security-guidelines.pdf",
    type: "Document",
    sizeMb: 12.1,
    provider: "Knowledge Hub Storage",
    uploadedAt: "Nov 01, 2026",
    owner: "Security Team",
    status: "Available",
  },
];

const INITIAL_QUOTAS = {
  globalQuota: "3700",
  warningThreshold: "80",
  criticalThreshold: "95",
  maxFileSize: "100",
};

const INITIAL_RETENTION = {
  enabled: true,
  days: "365",
  archiveAfter: "90",
  deleteExpired: false,
  keepBackups: true,
};

const INITIAL_SECURITY = {
  encryptionAtRest: true,
  encryptionInTransit: true,
  accessLogging: true,
  malwareScanning: true,
  signedUrls: true,
  signedUrlExpiry: "15",
};

const TABS: Tab[] = [
  "Overview",
  "Storage Providers",
  "Files & Assets",
  "Capacity & Quotas",
  "Retention Policies",
  "Security",
];

function formatSize(gb: number) {
  if (gb >= 1000) return `${(gb / 1000).toFixed(2)} TB`;
  return `${gb.toLocaleString(undefined, { maximumFractionDigits: 1 })} GB`;
}

function formatFileSize(mb: number) {
  if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
  return `${mb.toFixed(1)} MB`;
}

function StatusPill({ status }: { status: string }) {
  const color =
    status === "Active" || status === "Available"
      ? "green"
      : status === "Warning" || status === "Processing"
        ? "amber"
        : status === "Archived" || status === "Inactive"
          ? "gray"
          : "red";

  return <span className={`st-pill ${color}`}>{status}</span>;
}

function FileTypeIcon({ type }: { type: FileType }) {
  if (type === "Image") return <ImageIcon size={17} />;
  if (type === "Dataset") return <Layers3 size={17} />;
  if (type === "Archive") return <Archive size={17} />;
  return <FileText size={17} />;
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
      className={`st-toggle ${checked ? "on" : ""}`}
      onClick={onChange}
      aria-label={label}
      aria-pressed={checked}
    >
      <span />
    </button>
  );
}

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows
    .map((row) =>
      row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");

  const blob = new Blob(["\uFEFF", csv], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function StorageSettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [providers, setProviders] =
    useState<StorageProvider[]>(INITIAL_PROVIDERS);
  const [files, setFiles] = useState<StoredFile[]>(INITIAL_FILES);
  const [search, setSearch] = useState("");
  const [fileTypeFilter, setFileTypeFilter] = useState("All types");
  const [fileStatusFilter, setFileStatusFilter] = useState("All statuses");
  const [providerFilter, setProviderFilter] = useState("All providers");
  const [notice, setNotice] = useState("");
  const [loaded, setLoaded] = useState(false);

  const [providerForm, setProviderForm] = useState({
    name: "",
    type: "Object Storage",
    region: "ap-south-1",
    capacityGb: "500",
  });

  const [fileForm, setFileForm] = useState({
    name: "",
    type: "Document" as FileType,
    sizeMb: "1",
    provider: INITIAL_PROVIDERS[0].name,
    owner: "Admin",
  });

  const [quotas, setQuotas] = useState(INITIAL_QUOTAS);
  const [retention, setRetention] = useState(INITIAL_RETENTION);
  const [security, setSecurity] = useState(INITIAL_SECURITY);

  const [showProviderModal, setShowProviderModal] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [selectedProvider, setSelectedProvider] =
    useState<StorageProvider | null>(null);
  const [selectedFile, setSelectedFile] = useState<StoredFile | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const data = JSON.parse(saved);

        if (Array.isArray(data.providers)) setProviders(data.providers);
        if (Array.isArray(data.files)) setFiles(data.files);
        if (data.quotas) setQuotas(data.quotas);
        if (data.retention) setRetention(data.retention);
        if (data.security) setSecurity(data.security);
      }
    } catch {
      // Ignore invalid local demo data.
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ providers, files, quotas, retention, security }),
      );
    } catch {
      // Storage may be unavailable in the browser.
    }
  }, [loaded, providers, files, quotas, retention, security]);

  const totalCapacity = providers.reduce(
    (sum, provider) => sum + provider.capacityGb,
    0,
  );
  const totalUsed = providers.reduce(
    (sum, provider) => sum + provider.usedGb,
    0,
  );
  const totalFiles = providers.reduce(
    (sum, provider) => sum + provider.files,
    0,
  );
  const overallUsage = totalCapacity
    ? Math.round((totalUsed / totalCapacity) * 100)
    : 0;
  const activeProviders = providers.filter(
    (provider) => provider.status === "Active",
  ).length;
  const warningProviders = providers.filter(
    (provider) => provider.status === "Warning",
  ).length;

  const filteredFiles = useMemo(() => {
    const query = search.trim().toLowerCase();

    return files.filter((file) => {
      const matchesSearch =
        !query ||
        file.name.toLowerCase().includes(query) ||
        file.id.toLowerCase().includes(query) ||
        file.owner.toLowerCase().includes(query) ||
        file.provider.toLowerCase().includes(query);

      return (
        matchesSearch &&
        (fileTypeFilter === "All types" || file.type === fileTypeFilter) &&
        (fileStatusFilter === "All statuses" ||
          file.status === fileStatusFilter) &&
        (providerFilter === "All providers" ||
          file.provider === providerFilter)
      );
    });
  }, [files, search, fileTypeFilter, fileStatusFilter, providerFilter]);

  const usageColor =
    overallUsage >= Number(quotas.criticalThreshold)
      ? "#dc4c54"
      : overallUsage >= Number(quotas.warningThreshold)
        ? "#d58b28"
        : "#315bea";

  function notify(message: string) {
    setNotice(message);
  }

  function addProvider() {
    const name = providerForm.name.trim();
    const capacity = Number(providerForm.capacityGb);

    if (!name) {
      notify("Enter a storage provider name.");
      return;
    }

    if (!Number.isFinite(capacity) || capacity <= 0) {
      notify("Enter a valid storage capacity.");
      return;
    }

    if (providers.some((provider) => provider.name.toLowerCase() === name.toLowerCase())) {
      notify("A provider with that name already exists.");
      return;
    }

    const provider: StorageProvider = {
      id: `storage-${Date.now()}`,
      name,
      type: providerForm.type,
      region: providerForm.region.trim() || "Not specified",
      status: "Inactive",
      capacityGb: capacity,
      usedGb: 0,
      files: 0,
      updatedAt: "Just now",
      color: "#64748b",
      icon: "ST",
    };

    setProviders((current) => [...current, provider]);
    setFileForm((current) => ({
      ...current,
      provider: current.provider || provider.name,
    }));
    setProviderForm({
      name: "",
      type: "Object Storage",
      region: "ap-south-1",
      capacityGb: "500",
    });
    setShowProviderModal(false);
    notify("Storage provider added to the local demo.");
  }

  function toggleProvider(provider: StorageProvider) {
    const nextStatus: StorageStatus =
      provider.status === "Active" ? "Inactive" : "Active";

    setProviders((current) =>
      current.map((item) =>
        item.id === provider.id
          ? { ...item, status: nextStatus, updatedAt: "Just now" }
          : item,
      ),
    );

    setSelectedProvider(null);
    notify(
      `${provider.name} marked ${nextStatus.toLowerCase()}. This only updates the local demo.`,
    );
  }

  function addFile() {
    const name = fileForm.name.trim();
    const size = Number(fileForm.sizeMb);

    if (!name) {
      notify("Enter a file name.");
      return;
    }

    if (!Number.isFinite(size) || size <= 0) {
      notify("Enter a valid file size.");
      return;
    }

    const provider = providers.find(
      (item) => item.name === fileForm.provider,
    );

    if (!provider) {
      notify("Select a valid storage provider.");
      return;
    }

    if (provider.status !== "Active") {
      notify("Choose an active storage provider.");
      return;
    }

    if (size > Number(quotas.maxFileSize)) {
      notify(`The configured maximum file size is ${quotas.maxFileSize} MB.`);
      return;
    }

    if (provider.usedGb + size / 1024 > provider.capacityGb) {
      notify("This file would exceed the selected provider's capacity.");
      return;
    }

    const file: StoredFile = {
      id: `F-${Date.now().toString().slice(-6)}`,
      name,
      type: fileForm.type,
      sizeMb: size,
      provider: provider.name,
      uploadedAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
      owner: fileForm.owner.trim() || "Admin",
      status: "Available",
    };

    setFiles((current) => [file, ...current]);
    setProviders((current) =>
      current.map((item) =>
        item.id === provider.id
          ? {
              ...item,
              files: item.files + 1,
              usedGb: item.usedGb + size / 1024,
              updatedAt: "Just now",
            }
          : item,
      ),
    );

    setFileForm({
      name: "",
      type: "Document",
      sizeMb: "1",
      provider: provider.name,
      owner: "Admin",
    });
    setShowFileModal(false);
    notify("Demo file record added. No real file was uploaded.");
  }

  function deleteFile(file: StoredFile) {
    setFiles((current) => current.filter((item) => item.id !== file.id));
    setProviders((current) =>
      current.map((provider) =>
        provider.name === file.provider
          ? {
              ...provider,
              files: Math.max(0, provider.files - 1),
              usedGb: Math.max(0, provider.usedGb - file.sizeMb / 1024),
              updatedAt: "Just now",
            }
          : provider,
      ),
    );

    setSelectedFile(null);
    notify(`${file.name} removed from the demo inventory.`);
  }

  function exportFiles() {
    downloadCsv("modelnow-storage-files.csv", [
      ["ID", "Name", "Type", "Size MB", "Provider", "Uploaded", "Owner", "Status"],
      ...filteredFiles.map((file) => [
        file.id,
        file.name,
        file.type,
        String(file.sizeMb),
        file.provider,
        file.uploadedAt,
        file.owner,
        file.status,
      ]),
    ]);
  }

  function exportProviders() {
    downloadCsv("modelnow-storage-providers.csv", [
      ["Name", "Type", "Region", "Status", "Capacity GB", "Used GB", "Files"],
      ...providers.map((provider) => [
        provider.name,
        provider.type,
        provider.region,
        provider.status,
        String(provider.capacityGb),
        String(provider.usedGb),
        String(provider.files),
      ]),
    ]);
  }

  function resetDemo() {
    setProviders(INITIAL_PROVIDERS);
    setFiles(INITIAL_FILES);
    setQuotas(INITIAL_QUOTAS);
    setRetention(INITIAL_RETENTION);
    setSecurity(INITIAL_SECURITY);
    setSearch("");
    setFileTypeFilter("All types");
    setFileStatusFilter("All statuses");
    setProviderFilter("All providers");
    setSelectedProvider(null);
    setSelectedFile(null);
    notify("Storage demo data and settings have been reset.");
  }

  function saveQuotas() {
    const globalQuota = Number(quotas.globalQuota);
    const maxFileSize = Number(quotas.maxFileSize);
    const warning = Number(quotas.warningThreshold);
    const critical = Number(quotas.criticalThreshold);

    if (
      !Number.isFinite(globalQuota) ||
      globalQuota <= 0 ||
      !Number.isFinite(maxFileSize) ||
      maxFileSize <= 0 ||
      warning < 1 ||
      warning > 100 ||
      critical < 1 ||
      critical > 100 ||
      warning >= critical
    ) {
      notify("Enter valid quotas. Warning must be lower than critical.");
      return;
    }

    setShowQuotaModal(false);
    notify("Quota preferences saved locally. Backend enforcement is not enabled.");
  }

  function field(
    label: string,
    value: string,
    onChange: (value: string) => void,
    options?: {
      type?: string;
      min?: string;
      max?: string;
      step?: string;
      placeholder?: string;
    },
  ) {
    return (
      <label className="st-field">
        <span>{label}</span>
        <input
          type={options?.type ?? "text"}
          min={options?.min}
          max={options?.max}
          step={options?.step}
          placeholder={options?.placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
    );
  }

  return (
    <main className="storage-page">
      <style>{`
        .storage-page{--st-bg:#f7f8fc;--st-card:#fff;--st-text:#182235;--st-muted:#778195;--st-border:#e5e9f1;--st-blue:#315bea;min-height:100vh;padding:28px;background:var(--st-bg);color:var(--st-text);font-family:Inter,ui-sans-serif,system-ui,sans-serif}
        .storage-page *{box-sizing:border-box}
        .st-shell{max-width:1500px;margin:0 auto}
        .st-breadcrumb{display:flex;gap:8px;align-items:center;color:var(--st-muted);font-size:12px;margin-bottom:20px}
        .st-breadcrumb strong{color:#354056}
        .st-header{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap;margin-bottom:23px}
        .st-heading{display:flex;gap:13px;align-items:flex-start}
        .st-heading-icon{width:46px;height:46px;border-radius:13px;background:#eaf0ff;color:var(--st-blue);display:grid;place-items:center}
        .st-title{font-size:27px;letter-spacing:-.7px;font-weight:760;margin:0 0 7px}
        .st-subtitle{font-size:13px;line-height:1.6;color:var(--st-muted);margin:0;max-width:700px}
        .st-actions{display:flex;gap:9px;align-items:center;flex-wrap:wrap}
        .st-btn{border:1px solid var(--st-border);background:#fff;color:#39445a;border-radius:9px;padding:10px 13px;font-size:12px;font-weight:650;display:inline-flex;align-items:center;justify-content:center;gap:7px;cursor:pointer}
        .st-btn:hover{background:#f8faff;border-color:#bdcafa}
        .st-btn.primary{background:var(--st-blue);color:white;border-color:var(--st-blue)}
        .st-btn.danger{color:#c33443;border-color:#f0cbd0}
        .st-notice{display:flex;align-items:flex-start;gap:9px;padding:12px 14px;border:1px solid #cbd9ff;background:#f0f4ff;color:#2847a3;border-radius:10px;font-size:12px;margin-bottom:17px}
        .st-notice button{margin-left:auto;border:0;background:transparent;cursor:pointer;color:inherit}
        .st-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:19px}
        .st-stat,.st-card{background:white;border:1px solid var(--st-border);border-radius:13px;min-width:0}
        .st-stat{padding:17px}
        .st-stat-top{display:flex;align-items:center;justify-content:space-between;gap:8px;color:var(--st-muted);font-size:12px}
        .st-stat-icon{width:34px;height:34px;border-radius:10px;background:#f0f3f9;color:#59677f;display:grid;place-items:center}
        .st-stat-value{font-size:26px;letter-spacing:-.5px;font-weight:760;margin-top:12px}
        .st-stat-note{font-size:11px;color:var(--st-muted);margin-top:5px}
        .st-tabs{display:flex;gap:5px;padding:6px;border:1px solid var(--st-border);border-radius:11px;background:#fff;margin-bottom:18px;overflow-x:auto}
        .st-tab{white-space:nowrap;border:0;background:transparent;border-radius:8px;padding:10px 13px;font-size:12px;font-weight:650;color:#68748a;cursor:pointer}
        .st-tab.active{background:#edf2ff;color:var(--st-blue)}
        .st-card{overflow:hidden;margin-bottom:17px}
        .st-card-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:17px 19px;border-bottom:1px solid var(--st-border)}
        .st-card-title{font-size:14px;font-weight:730;margin:0 0 5px}
        .st-card-subtitle{font-size:11px;color:var(--st-muted);margin:0;line-height:1.5}
        .st-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
        .st-provider-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;padding:17px}
        .st-provider{border:1px solid var(--st-border);border-radius:12px;padding:16px;min-width:0}
        .st-provider-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
        .st-provider-brand{display:flex;align-items:center;gap:11px;min-width:0}
        .st-provider-logo{width:42px;height:42px;flex-shrink:0;display:grid;place-items:center;border-radius:12px;color:white;font-size:12px;font-weight:800}
        .st-provider-name{font-size:13px;font-weight:720;overflow-wrap:anywhere}
        .st-provider-type{font-size:11px;color:var(--st-muted);margin-top:4px}
        .st-provider-description{font-size:12px;color:var(--st-muted);line-height:1.6;margin:14px 0}
        .st-provider-meta{display:flex;justify-content:space-between;gap:10px;color:var(--st-muted);font-size:11px;margin-bottom:8px}
        .st-progress{height:7px;border-radius:20px;background:#edf0f5;overflow:hidden}
        .st-progress-fill{height:100%;border-radius:20px;transition:width .2s}
        .st-provider-footer{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:14px;padding-top:12px;border-top:1px solid #eef0f5}
        .st-pill{display:inline-flex;align-items:center;padding:5px 8px;border-radius:20px;font-size:10px;font-weight:700;white-space:nowrap}
        .st-pill.green{background:#e9f8ef;color:#17834c}.st-pill.amber{background:#fff4df;color:#a96b08}.st-pill.gray{background:#eff1f5;color:#68748a}.st-pill.red{background:#fff0f0;color:#bf3944}
        .st-table-wrap{width:100%;overflow-x:auto}
        .st-table{width:100%;border-collapse:collapse;text-align:left;min-width:780px}
        .st-table th{font-size:10px;letter-spacing:.45px;text-transform:uppercase;color:#8490a3;background:#fafbfe;padding:12px 15px;border-bottom:1px solid var(--st-border);white-space:nowrap}
        .st-table td{font-size:12px;padding:13px 15px;border-bottom:1px solid #eef0f5;color:#39445a;vertical-align:middle}
        .st-table tr:last-child td{border-bottom:0}.st-table tbody tr:hover{background:#fbfcff}
        .st-file-cell{display:flex;align-items:center;gap:10px;min-width:180px}
        .st-file-icon{width:35px;height:35px;display:grid;place-items:center;border-radius:10px;background:#eff3ff;color:#4665d8;flex-shrink:0}
        .st-file-name{font-weight:700;color:#263249;font-size:12px;overflow-wrap:anywhere}
        .st-file-id{font-size:10px;color:var(--st-muted);margin-top:4px}
        .st-filters{display:flex;align-items:center;gap:9px;flex-wrap:wrap;padding:15px 17px;border-bottom:1px solid var(--st-border)}
        .st-search{display:flex;align-items:center;gap:8px;border:1px solid var(--st-border);border-radius:8px;padding:0 10px;min-width:220px;flex:1;max-width:370px}
        .st-search input{width:100%;min-width:0;border:0;outline:none;padding:10px 0;font-size:12px;background:transparent;color:var(--st-text)}
        .st-select{border:1px solid var(--st-border);border-radius:8px;padding:10px 11px;font-size:12px;color:#465168;background:#fff;outline:none;max-width:100%}
        .st-empty{text-align:center;padding:38px 16px;color:var(--st-muted);font-size:12px}
        .st-capacity{padding:20px}
        .st-capacity-row{display:flex;justify-content:space-between;gap:12px;font-size:12px;margin-bottom:10px}
        .st-capacity-label{font-weight:700}.st-capacity-value{color:var(--st-muted)}
        .st-metric-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:20px}
        .st-mini-metric{border:1px solid var(--st-border);border-radius:10px;padding:14px;min-width:0}
        .st-mini-label{font-size:11px;color:var(--st-muted)}.st-mini-value{font-size:19px;font-weight:760;margin-top:8px;overflow-wrap:anywhere}
        .st-setting-row{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:16px 19px;border-bottom:1px solid #eef0f5}
        .st-setting-row:last-child{border-bottom:0}
        .st-setting-title{font-size:12px;font-weight:700;margin-bottom:5px}
        .st-setting-description{font-size:11px;line-height:1.5;color:var(--st-muted);max-width:620px}
        .st-toggle{width:39px;height:22px;border:0;border-radius:20px;background:#cbd1dd;padding:3px;cursor:pointer;flex-shrink:0}
        .st-toggle span{display:block;width:16px;height:16px;border-radius:50%;background:white;box-shadow:0 1px 3px #0002;transition:transform .15s}
        .st-toggle.on{background:var(--st-blue)}.st-toggle.on span{transform:translateX(17px)}
        .st-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;padding:19px}
        .st-field{display:flex;flex-direction:column;gap:7px;min-width:0}
        .st-field>span{font-size:11px;font-weight:700;color:#48536a}
        .st-field input,.st-field select{width:100%;border:1px solid #dfe4ed;border-radius:8px;padding:11px 12px;font-size:12px;outline:none;background:#fff;color:#273248}
        .st-field input:focus,.st-field select:focus{border-color:#8ea5fb;box-shadow:0 0 0 3px #315bea12}
        .st-field-help{font-size:10px;line-height:1.5;color:var(--st-muted)}
        .st-modal-backdrop{position:fixed;inset:0;background:#10182870;z-index:50;display:flex;align-items:center;justify-content:center;padding:18px}
        .st-modal{width:100%;max-width:570px;max-height:90vh;overflow-y:auto;background:white;border-radius:16px;box-shadow:0 24px 80px #10182830}
        .st-modal-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;padding:20px;border-bottom:1px solid var(--st-border)}
        .st-modal-title{font-size:17px;font-weight:760;margin:0 0 6px}
        .st-modal-subtitle{font-size:11px;line-height:1.5;color:var(--st-muted);margin:0}
        .st-modal-body{padding:20px}
        .st-modal-footer{display:flex;justify-content:flex-end;gap:9px;padding:15px 20px;border-top:1px solid var(--st-border)}
        .st-modal-close{width:30px;height:30px;border:0;border-radius:8px;background:#f3f5f9;display:grid;place-items:center;cursor:pointer;color:#657087}
        .st-alert{display:flex;align-items:flex-start;gap:9px;padding:12px;border-radius:9px;background:#fff7e8;color:#8b5c13;font-size:11px;line-height:1.55;margin:14px 17px}
        .st-inline-field{display:flex;align-items:center;gap:8px}.st-inline-field input{width:80px;border:1px solid var(--st-border);border-radius:7px;padding:8px;font-size:12px}
        @media(max-width:1000px){.st-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.st-provider-grid{grid-template-columns:1fr}}
        @media(max-width:700px){.storage-page{padding:16px}.st-title{font-size:23px}.st-grid,.st-form-grid{grid-template-columns:1fr}.st-metric-grid{grid-template-columns:1fr}.st-actions{width:100%}.st-actions .st-btn{flex:1}.st-search{max-width:none;min-width:100%}.st-select{flex:1}.st-stat-value{font-size:23px}}
      `}</style>

      <div className="st-shell">
        <div className="st-breadcrumb">
          <span>Admin</span><span>/</span><span>Settings</span><span>/</span>
          <strong>Storage Settings</strong>
        </div>

        <header className="st-header">
          <div className="st-heading">
            <div className="st-heading-icon"><Database size={23} /></div>
            <div>
              <h1 className="st-title">Storage Settings</h1>
              <p className="st-subtitle">
                Manage storage providers, file inventory, capacity, retention
                policies, and data protection for ModelNow.
              </p>
            </div>
          </div>
          <div className="st-actions">
            <button className="st-btn" onClick={resetDemo}>
              <RefreshCw size={14} /> Reset demo
            </button>
            <button className="st-btn" onClick={exportProviders}>
              <Download size={14} /> Export providers
            </button>
            <button className="st-btn primary" onClick={() => setShowProviderModal(true)}>
              <Plus size={15} /> Add storage
            </button>
          </div>
        </header>

        {notice && (
          <div className="st-notice" role="status">
            <CircleAlert size={17} />
            <span>{notice}</span>
            <button aria-label="Dismiss notice" onClick={() => setNotice("")}>
              <X size={15} />
            </button>
          </div>
        )}

        <section className="st-stats">
          <div className="st-stat">
            <div className="st-stat-top">Total capacity <span className="st-stat-icon"><HardDrive size={17} /></span></div>
            <div className="st-stat-value">{formatSize(totalCapacity)}</div>
            <div className="st-stat-note">Across {providers.length} storage locations</div>
          </div>
          <div className="st-stat">
            <div className="st-stat-top">Storage used <span className="st-stat-icon"><Database size={17} /></span></div>
            <div className="st-stat-value">{formatSize(totalUsed)}</div>
            <div className="st-stat-note">{overallUsage}% of configured capacity</div>
          </div>
          <div className="st-stat">
            <div className="st-stat-top">Stored files <span className="st-stat-icon"><File size={17} /></span></div>
            <div className="st-stat-value">{totalFiles.toLocaleString()}</div>
            <div className="st-stat-note">From provider inventory records</div>
          </div>
          <div className="st-stat">
            <div className="st-stat-top">Active providers <span className="st-stat-icon"><Cloud size={17} /></span></div>
            <div className="st-stat-value">{activeProviders}</div>
            <div className="st-stat-note">
              {warningProviders ? `${warningProviders} provider(s) need attention` : "No provider warnings"}
            </div>
          </div>
        </section>

        <nav className="st-tabs" aria-label="Storage settings sections">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`st-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>

        {activeTab === "Overview" && (
          <>
            <div className="st-grid">
              <section className="st-card">
                <div className="st-card-head">
                  <div>
                    <h2 className="st-card-title">Capacity overview</h2>
                    <p className="st-card-subtitle">Aggregate utilization across providers</p>
                  </div>
                  <HardDrive size={19} />
                </div>
                <div className="st-capacity">
                  <div className="st-capacity-row">
                    <span className="st-capacity-label">Total utilization</span>
                    <strong>{overallUsage}%</strong>
                  </div>
                  <div className="st-progress" style={{ height: 10 }}>
                    <div className="st-progress-fill" style={{ width: `${Math.min(overallUsage, 100)}%`, background: usageColor }} />
                  </div>
                  <div className="st-capacity-row" style={{ marginTop: 9 }}>
                    <span className="st-capacity-value">{formatSize(totalUsed)} used</span>
                    <span className="st-capacity-value">{formatSize(Math.max(0, totalCapacity - totalUsed))} available</span>
                  </div>
                  <div className="st-metric-grid">
                    <div className="st-mini-metric"><div className="st-mini-label">Providers</div><div className="st-mini-value">{providers.length}</div></div>
                    <div className="st-mini-metric"><div className="st-mini-label">Active</div><div className="st-mini-value">{activeProviders}</div></div>
                    <div className="st-mini-metric"><div className="st-mini-label">Warnings</div><div className="st-mini-value">{warningProviders}</div></div>
                  </div>
                </div>
              </section>

              <section className="st-card">
                <div className="st-card-head">
                  <div>
                    <h2 className="st-card-title">Storage health</h2>
                    <p className="st-card-subtitle">Utilization by storage location</p>
                  </div>
                  <ShieldCheck size={19} />
                </div>
                {providers.map((provider) => {
                  const percent = provider.capacityGb ? Math.round(provider.usedGb / provider.capacityGb * 100) : 0;
                  return (
                    <div className="st-setting-row" key={provider.id}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="st-setting-title">{provider.name}</div>
                        <div className="st-setting-description">{formatSize(provider.usedGb)} of {formatSize(provider.capacityGb)} · {percent}% used</div>
                        <div className="st-progress" style={{ marginTop: 9 }}>
                          <div className="st-progress-fill" style={{ width: `${Math.min(percent, 100)}%`, background: percent >= 90 ? "#d74d55" : percent >= 80 ? "#d58b28" : provider.color }} />
                        </div>
                      </div>
                      <StatusPill status={provider.status} />
                    </div>
                  );
                })}
              </section>
            </div>

            <section className="st-card">
              <div className="st-card-head">
                <div>
                  <h2 className="st-card-title">Storage providers</h2>
                  <p className="st-card-subtitle">Configured storage locations</p>
                </div>
                <button className="st-btn" onClick={() => setActiveTab("Storage Providers")}>View all <ArrowUpRight size={14} /></button>
              </div>
              <div className="st-provider-grid">
                {providers.slice(0, 4).map((provider) => {
                  const percent = provider.capacityGb ? Math.round(provider.usedGb / provider.capacityGb * 100) : 0;
                  return (
                    <div className="st-provider" key={provider.id}>
                      <div className="st-provider-top">
                        <div className="st-provider-brand">
                          <div className="st-provider-logo" style={{ background: provider.color }}>{provider.icon}</div>
                          <div>
                            <div className="st-provider-name">{provider.name}</div>
                            <div className="st-provider-type">{provider.type}</div>
                          </div>
                        </div>
                        <StatusPill status={provider.status} />
                      </div>
                      <p className="st-provider-description">Region: {provider.region}</p>
                      <div className="st-provider-meta"><span>{formatSize(provider.usedGb)} used</span><span>{percent}%</span></div>
                      <div className="st-progress"><div className="st-progress-fill" style={{ width: `${Math.min(percent, 100)}%`, background: provider.color }} /></div>
                      <div className="st-provider-footer">
                        <span style={{ fontSize: 11, color: "#778195" }}>{provider.files.toLocaleString()} files</span>
                        <button className="st-btn" onClick={() => { setSelectedProvider(provider); setActiveTab("Storage Providers"); }}>Manage <Settings2 size={13} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="st-card">
              <div className="st-card-head">
                <div>
                  <h2 className="st-card-title">Recent file activity</h2>
                  <p className="st-card-subtitle">Latest inventory records</p>
                </div>
                <button className="st-btn" onClick={() => setActiveTab("Files & Assets")}>View files <ArrowUpRight size={14} /></button>
              </div>
              <div className="st-table-wrap">
                <table className="st-table">
                  <thead><tr><th>File</th><th>Provider</th><th>Size</th><th>Uploaded</th><th>Status</th></tr></thead>
                  <tbody>
                    {files.slice(0, 5).map((file) => (
                      <tr key={file.id}>
                        <td><div className="st-file-cell"><span className="st-file-icon"><FileTypeIcon type={file.type} /></span><div><div className="st-file-name">{file.name}</div><div className="st-file-id">{file.id}</div></div></div></td>
                        <td>{file.provider}</td><td>{formatFileSize(file.sizeMb)}</td><td>{file.uploadedAt}</td><td><StatusPill status={file.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {activeTab === "Storage Providers" && (
          <section className="st-card">
            <div className="st-card-head">
              <div><h2 className="st-card-title">Storage providers</h2><p className="st-card-subtitle">Manage provider records and capacity</p></div>
              <button className="st-btn primary" onClick={() => setShowProviderModal(true)}><Plus size={14} /> Add provider</button>
            </div>
            <div className="st-provider-grid">
              {providers.map((provider) => {
                const percent = provider.capacityGb ? Math.round(provider.usedGb / provider.capacityGb * 100) : 0;
                return (
                  <div className="st-provider" key={provider.id}>
                    <div className="st-provider-top">
                      <div className="st-provider-brand">
                        <div className="st-provider-logo" style={{ background: provider.color }}>{provider.icon}</div>
                        <div><div className="st-provider-name">{provider.name}</div><div className="st-provider-type">{provider.type}</div></div>
                      </div>
                      <StatusPill status={provider.status} />
                    </div>
                    <p className="st-provider-description">Region: {provider.region}<br />Last updated: {provider.updatedAt}</p>
                    <div className="st-provider-meta"><span>{formatSize(provider.usedGb)} used</span><span>{formatSize(provider.capacityGb)} total</span></div>
                    <div className="st-progress"><div className="st-progress-fill" style={{ width: `${Math.min(percent, 100)}%`, background: percent >= 90 ? "#d74d55" : provider.color }} /></div>
                    <div className="st-provider-footer">
                      <span style={{ fontSize: 11, color: "#778195" }}>{provider.files.toLocaleString()} files</span>
                      <button className="st-btn" onClick={() => setSelectedProvider(provider)}><Settings2 size={13} /> Manage</button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="st-alert"><CircleAlert size={16} /> Provider records are demo data. Real cloud storage needs server-side credentials, authorization, and provider APIs.</div>
          </section>
        )}

        {activeTab === "Files & Assets" && (
          <section className="st-card">
            <div className="st-card-head">
              <div><h2 className="st-card-title">Files & assets</h2><p className="st-card-subtitle">Search and manage inventory records</p></div>
              <div className="st-actions">
                <button className="st-btn" onClick={exportFiles}><Download size={14} /> Export CSV</button>
                <button className="st-btn primary" onClick={() => setShowFileModal(true)}><Plus size={14} /> Add file record</button>
              </div>
            </div>
            <div className="st-filters">
              <div className="st-search">
                <Search size={15} color="#8a94a6" />
                <input placeholder="Search files, IDs, owners..." value={search} onChange={(event) => setSearch(event.target.value)} />
                {search && <button aria-label="Clear search" onClick={() => setSearch("")} style={{ border: 0, background: "transparent", cursor: "pointer" }}><X size={14} /></button>}
              </div>
              <select className="st-select" value={fileTypeFilter} onChange={(event) => setFileTypeFilter(event.target.value)}>
                <option>All types</option><option>Document</option><option>Image</option><option>Dataset</option><option>Archive</option>
              </select>
              <select className="st-select" value={fileStatusFilter} onChange={(event) => setFileStatusFilter(event.target.value)}>
                <option>All statuses</option><option>Available</option><option>Processing</option><option>Archived</option>
              </select>
              <select className="st-select" value={providerFilter} onChange={(event) => setProviderFilter(event.target.value)}>
                <option>All providers</option>
                {providers.map((provider) => <option key={provider.id} value={provider.name}>{provider.name}</option>)}
              </select>
            </div>
            <div className="st-table-wrap">
              <table className="st-table">
                <thead><tr><th>File</th><th>Type</th><th>Provider</th><th>Size</th><th>Owner</th><th>Uploaded</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredFiles.map((file) => (
                    <tr key={file.id}>
                      <td><div className="st-file-cell"><span className="st-file-icon"><FileTypeIcon type={file.type} /></span><div><div className="st-file-name">{file.name}</div><div className="st-file-id">{file.id}</div></div></div></td>
                      <td>{file.type}</td><td>{file.provider}</td><td>{formatFileSize(file.sizeMb)}</td><td>{file.owner}</td><td>{file.uploadedAt}</td><td><StatusPill status={file.status} /></td>
                      <td><button className="st-btn" aria-label={`View ${file.name}`} onClick={() => setSelectedFile(file)}><MoreHorizontal size={15} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredFiles.length === 0 && <div className="st-empty"><Search size={22} /><p>No files match your search or filters.</p></div>}
            </div>
            <div style={{ padding: "12px 17px", borderTop: "1px solid #e5e9f1", color: "#778195", fontSize: 11 }}>Showing {filteredFiles.length} of {files.length} file records</div>
          </section>
        )}

        {activeTab === "Capacity & Quotas" && (
          <>
            <section className="st-card">
              <div className="st-card-head">
                <div><h2 className="st-card-title">Global storage capacity</h2><p className="st-card-subtitle">Platform-wide quota and alert thresholds</p></div>
                <button className="st-btn primary" onClick={() => setShowQuotaModal(true)}><Settings2 size={14} /> Edit quotas</button>
              </div>
              <div className="st-capacity">
                <div className="st-capacity-row"><span className="st-capacity-label">Configured capacity</span><strong>{formatSize(totalCapacity)}</strong></div>
                <div className="st-progress" style={{ height: 10 }}><div className="st-progress-fill" style={{ width: `${Math.min(overallUsage, 100)}%`, background: usageColor }} /></div>
                <div className="st-capacity-row" style={{ marginTop: 9 }}><span className="st-capacity-value">{formatSize(totalUsed)} used</span><span className="st-capacity-value">{formatSize(Math.max(0, totalCapacity - totalUsed))} remaining</span></div>
                <div className="st-metric-grid">
                  <div className="st-mini-metric"><div className="st-mini-label">Warning threshold</div><div className="st-mini-value">{quotas.warningThreshold}%</div></div>
                  <div className="st-mini-metric"><div className="st-mini-label">Critical threshold</div><div className="st-mini-value">{quotas.criticalThreshold}%</div></div>
                  <div className="st-mini-metric"><div className="st-mini-label">Maximum file size</div><div className="st-mini-value">{quotas.maxFileSize} MB</div></div>
                </div>
                <div className="st-alert" style={{ marginLeft: 0, marginRight: 0 }}><CircleAlert size={16} /> Global quota setting: {quotas.globalQuota} GB. This demo displays the configured quota; it does not reserve or enforce physical storage capacity.</div>
              </div>
            </section>
            <section className="st-card">
              <div className="st-card-head"><div><h2 className="st-card-title">Capacity by provider</h2><p className="st-card-subtitle">Usage distribution for individual storage locations</p></div></div>
              {providers.map((provider) => {
                const percent = provider.capacityGb ? Math.round(provider.usedGb / provider.capacityGb * 100) : 0;
                return <div className="st-setting-row" key={provider.id}><div style={{ flex: 1, minWidth: 0 }}><div className="st-capacity-row"><span className="st-capacity-label">{provider.name}</span><span className="st-capacity-value">{formatSize(provider.usedGb)} / {formatSize(provider.capacityGb)}</span></div><div className="st-progress"><div className="st-progress-fill" style={{ width: `${Math.min(percent, 100)}%`, background: percent >= 90 ? "#d74d55" : percent >= 80 ? "#d58b28" : provider.color }} /></div></div><strong style={{ fontSize: 12 }}>{percent}%</strong></div>;
              })}
            </section>
          </>
        )}

        {activeTab === "Retention Policies" && (
          <section className="st-card">
            <div className="st-card-head">
              <div><h2 className="st-card-title">Retention policies</h2><p className="st-card-subtitle">Define how long files and backups are retained</p></div>
              <button className="st-btn primary" onClick={() => notify("Retention preferences saved locally. Backend enforcement is required.")}><Check size={14} /> Save policy</button>
            </div>
            <div className="st-setting-row">
              <div><div className="st-setting-title">Enable retention policies</div><div className="st-setting-description">Use configured retention periods for eligible storage objects.</div></div>
              <Toggle checked={retention.enabled} label="Toggle retention policies" onChange={() => setRetention((current) => ({ ...current, enabled: !current.enabled }))} />
            </div>
            <div className="st-form-grid">
              {field("Default retention period (days)", retention.days, (value) => setRetention((current) => ({ ...current, days: value })), { type: "number", min: "1" })}
              {field("Archive after (days)", retention.archiveAfter, (value) => setRetention((current) => ({ ...current, archiveAfter: value })), { type: "number", min: "1" })}
            </div>
            <div className="st-setting-row">
              <div><div className="st-setting-title">Delete expired objects automatically</div><div className="st-setting-description">Allow a backend retention worker to delete objects after the retention period.</div></div>
              <Toggle checked={retention.deleteExpired} label="Toggle automatic deletion" onChange={() => setRetention((current) => ({ ...current, deleteExpired: !current.deleteExpired }))} />
            </div>
            <div className="st-setting-row">
              <div><div className="st-setting-title">Protect backup archives</div><div className="st-setting-description">Exclude backup archives from normal retention cleanup.</div></div>
              <Toggle checked={retention.keepBackups} label="Toggle backup protection" onChange={() => setRetention((current) => ({ ...current, keepBackups: !current.keepBackups }))} />
            </div>
            <div className="st-alert"><CircleAlert size={16} /> These are local preferences only. Automatic deletion and archival must be implemented and validated server-side before production use.</div>
          </section>
        )}

        {activeTab === "Security" && (
          <>
            <section className="st-card">
              <div className="st-card-head"><div><h2 className="st-card-title">Storage security</h2><p className="st-card-subtitle">Security preferences for stored data</p></div><LockKeyhole size={19} /></div>
              {([
                ["encryptionAtRest", "Encryption at rest", "Encrypt stored objects using provider-managed or customer-managed keys."],
                ["encryptionInTransit", "Encryption in transit", "Require secure transport for client and service connections."],
                ["accessLogging", "Access logging", "Record storage access events for audit and investigation."],
                ["malwareScanning", "Malware scanning", "Scan uploaded files using a trusted server-side scanning service."],
                ["signedUrls", "Signed download URLs", "Use temporary signed links instead of public object access."],
              ] as const).map(([key, title, description]) => (
                <div className="st-setting-row" key={key}>
                  <div><div className="st-setting-title">{title}</div><div className="st-setting-description">{description}</div></div>
                  <Toggle checked={security[key]} label={`Toggle ${title}`} onChange={() => setSecurity((current) => ({ ...current, [key]: !current[key] }))} />
                </div>
              ))}
              <div className="st-setting-row">
                <div><div className="st-setting-title">Signed URL expiry</div><div className="st-setting-description">Minutes until a signed download URL expires.</div></div>
                <div className="st-inline-field">
                  <input aria-label="Signed URL expiry minutes" type="number" min="1" max="1440" value={security.signedUrlExpiry} onChange={(event) => setSecurity((current) => ({ ...current, signedUrlExpiry: event.target.value }))} />
                  <span style={{ fontSize: 11, color: "#778195" }}>min</span>
                </div>
              </div>
              <div style={{ padding: 17 }}><button className="st-btn primary" onClick={() => notify("Security preferences saved locally. Enforce these controls in the storage backend before production use.")}><Check size={14} /> Save security settings</button></div>
            </section>
            <section className="st-card">
              <div className="st-card-head"><div><h2 className="st-card-title">Security recommendations</h2><p className="st-card-subtitle">Review before connecting production storage</p></div><ShieldCheck size={19} /></div>
              {[
                "Keep provider credentials in a server-side secret manager.",
                "Apply least-privilege permissions to storage service accounts.",
                "Validate file types and sizes on the server before accepting uploads.",
                "Use private buckets and time-limited signed URLs for downloads.",
                "Audit access, retention, and deletion operations.",
              ].map((item) => <div className="st-setting-row" key={item}><CheckCircle2 size={17} color="#159b78" /><div style={{ flex: 1, fontSize: 12, lineHeight: 1.5 }}>{item}</div></div>)}
            </section>
          </>
        )}

        {showProviderModal && (
          <div className="st-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowProviderModal(false); }}>
            <section className="st-modal" role="dialog" aria-modal="true" aria-labelledby="provider-modal-title">
              <div className="st-modal-head"><div><h2 className="st-modal-title" id="provider-modal-title">Add storage provider</h2><p className="st-modal-subtitle">Create a provider record in this demo.</p></div><button className="st-modal-close" onClick={() => setShowProviderModal(false)} aria-label="Close"><X size={16} /></button></div>
              <div className="st-modal-body">
                {field("Provider name", providerForm.name, (value) => setProviderForm((current) => ({ ...current, name: value })), { placeholder: "Customer Upload Storage" })}
                <div className="st-form-grid" style={{ padding: "14px 0 0" }}>
                  <label className="st-field"><span>Storage type</span><select value={providerForm.type} onChange={(event) => setProviderForm((current) => ({ ...current, type: event.target.value }))}><option>Object Storage</option><option>Document Storage</option><option>Dataset Storage</option><option>Archive Storage</option><option>Block Storage</option></select></label>
                  {field("Region", providerForm.region, (value) => setProviderForm((current) => ({ ...current, region: value })), { placeholder: "ap-south-1" })}
                  {field("Capacity (GB)", providerForm.capacityGb, (value) => setProviderForm((current) => ({ ...current, capacityGb: value })), { type: "number", min: "1" })}
                </div>
                <div className="st-alert"><CircleAlert size={16} /> This creates a local record only. Provider connectivity is not configured.</div>
              </div>
              <div className="st-modal-footer"><button className="st-btn" onClick={() => setShowProviderModal(false)}>Cancel</button><button className="st-btn primary" onClick={addProvider}><Plus size={14} /> Add provider</button></div>
            </section>
          </div>
        )}

        {showFileModal && (
          <div className="st-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowFileModal(false); }}>
            <section className="st-modal" role="dialog" aria-modal="true" aria-labelledby="file-modal-title">
              <div className="st-modal-head"><div><h2 className="st-modal-title" id="file-modal-title">Add file record</h2><p className="st-modal-subtitle">Add inventory metadata without uploading a real file.</p></div><button className="st-modal-close" onClick={() => setShowFileModal(false)} aria-label="Close"><X size={16} /></button></div>
              <div className="st-modal-body">
                {field("File name", fileForm.name, (value) => setFileForm((current) => ({ ...current, name: value })), { placeholder: "example-document.pdf" })}
                <div className="st-form-grid" style={{ padding: "14px 0 0" }}>
                  <label className="st-field"><span>File type</span><select value={fileForm.type} onChange={(event) => setFileForm((current) => ({ ...current, type: event.target.value as FileType }))}><option>Document</option><option>Image</option><option>Dataset</option><option>Archive</option></select></label>
                  {field("Size (MB)", fileForm.sizeMb, (value) => setFileForm((current) => ({ ...current, sizeMb: value })), { type: "number", min: "0.1", step: "0.1" })}
                  <label className="st-field"><span>Storage provider</span><select value={fileForm.provider} onChange={(event) => setFileForm((current) => ({ ...current, provider: event.target.value }))}>{providers.map((provider) => <option key={provider.id} value={provider.name}>{provider.name}</option>)}</select></label>
                  {field("Owner", fileForm.owner, (value) => setFileForm((current) => ({ ...current, owner: value })))}
                </div>
                <div className="st-alert"><Upload size={16} /> Actual file uploads require a secure upload endpoint and server-side validation.</div>
              </div>
              <div className="st-modal-footer"><button className="st-btn" onClick={() => setShowFileModal(false)}>Cancel</button><button className="st-btn primary" onClick={addFile}><Plus size={14} /> Add record</button></div>
            </section>
          </div>
        )}

        {showQuotaModal && (
          <div className="st-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowQuotaModal(false); }}>
            <section className="st-modal" role="dialog" aria-modal="true" aria-labelledby="quota-modal-title">
              <div className="st-modal-head"><div><h2 className="st-modal-title" id="quota-modal-title">Configure capacity & quotas</h2><p className="st-modal-subtitle">Set platform quota and alert thresholds.</p></div><button className="st-modal-close" onClick={() => setShowQuotaModal(false)} aria-label="Close"><X size={16} /></button></div>
              <div className="st-modal-body">
                <div className="st-form-grid" style={{ padding: 0 }}>
                  {field("Global quota (GB)", quotas.globalQuota, (value) => setQuotas((current) => ({ ...current, globalQuota: value })), { type: "number", min: "1" })}
                  {field("Warning threshold (%)", quotas.warningThreshold, (value) => setQuotas((current) => ({ ...current, warningThreshold: value })), { type: "number", min: "1", max: "100" })}
                  {field("Critical threshold (%)", quotas.criticalThreshold, (value) => setQuotas((current) => ({ ...current, criticalThreshold: value })), { type: "number", min: "1", max: "100" })}
                  {field("Maximum file size (MB)", quotas.maxFileSize, (value) => setQuotas((current) => ({ ...current, maxFileSize: value })), { type: "number", min: "1" })}
                </div>
              </div>
              <div className="st-modal-footer"><button className="st-btn" onClick={() => setShowQuotaModal(false)}>Cancel</button><button className="st-btn primary" onClick={saveQuotas}><Check size={14} /> Save quotas</button></div>
            </section>
          </div>
        )}

        {selectedProvider && (
          <div className="st-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedProvider(null); }}>
            <section className="st-modal" role="dialog" aria-modal="true" aria-labelledby="provider-detail-title">
              <div className="st-modal-head"><div><h2 className="st-modal-title" id="provider-detail-title">{selectedProvider.name}</h2><p className="st-modal-subtitle">Provider details and status controls</p></div><button className="st-modal-close" onClick={() => setSelectedProvider(null)} aria-label="Close"><X size={16} /></button></div>
              <div className="st-modal-body">
                <div className="st-provider-brand" style={{ marginBottom: 18 }}>
                  <div className="st-provider-logo" style={{ background: selectedProvider.color }}>{selectedProvider.icon}</div>
                  <div style={{ flex: 1 }}><div className="st-provider-name">{selectedProvider.type}</div><div className="st-provider-type">{selectedProvider.region}</div></div>
                  <StatusPill status={selectedProvider.status} />
                </div>
                <div className="st-metric-grid" style={{ marginTop: 0 }}>
                  <div className="st-mini-metric"><div className="st-mini-label">Capacity</div><div className="st-mini-value">{formatSize(selectedProvider.capacityGb)}</div></div>
                  <div className="st-mini-metric"><div className="st-mini-label">Used</div><div className="st-mini-value">{formatSize(selectedProvider.usedGb)}</div></div>
                  <div className="st-mini-metric"><div className="st-mini-label">Files</div><div className="st-mini-value">{selectedProvider.files.toLocaleString()}</div></div>
                </div>
                <div className="st-alert"><CircleAlert size={16} /> This changes only the local demo record, not a real storage service.</div>
              </div>
              <div className="st-modal-footer"><button className="st-btn" onClick={() => setSelectedProvider(null)}>Close</button><button className={`st-btn ${selectedProvider.status === "Active" ? "danger" : "primary"}`} onClick={() => toggleProvider(selectedProvider)}><Power size={14} /> Mark {selectedProvider.status === "Active" ? "inactive" : "active"}</button></div>
            </section>
          </div>
        )}

        {selectedFile && (
          <div className="st-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedFile(null); }}>
            <section className="st-modal" role="dialog" aria-modal="true" aria-labelledby="file-detail-title">
              <div className="st-modal-head"><div><h2 className="st-modal-title" id="file-detail-title">File details</h2><p className="st-modal-subtitle">{selectedFile.id}</p></div><button className="st-modal-close" onClick={() => setSelectedFile(null)} aria-label="Close"><X size={16} /></button></div>
              <div className="st-modal-body">
                <div className="st-file-cell" style={{ marginBottom: 17 }}><span className="st-file-icon"><FileTypeIcon type={selectedFile.type} /></span><div><div className="st-file-name">{selectedFile.name}</div><div className="st-file-id">{selectedFile.type} · {formatFileSize(selectedFile.sizeMb)}</div></div></div>
                {([["Provider", selectedFile.provider], ["Owner", selectedFile.owner], ["Uploaded", selectedFile.uploadedAt], ["Status", selectedFile.status]] as const).map(([label, value]) => <div className="st-setting-row" key={label} style={{ padding: "12px 0" }}><span style={{ color: "#778195", fontSize: 12 }}>{label}</span><strong style={{ fontSize: 12, textAlign: "right" }}>{value}</strong></div>)}
                <div className="st-alert"><CircleAlert size={16} /> This is a demo inventory record. Real file operations require backend authorization.</div>
              </div>
              <div className="st-modal-footer"><button className="st-btn" onClick={() => setSelectedFile(null)}>Close</button><button className="st-btn danger" onClick={() => deleteFile(selectedFile)}><Trash2 size={14} /> Remove record</button></div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
