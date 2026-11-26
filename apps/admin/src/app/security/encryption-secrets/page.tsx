
"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
  Copy,
} from "lucide-react";

type SecretStatus = "Healthy" | "Rotation due" | "Expired" | "Disabled";
type Environment = "Development" | "Staging" | "Production";
type SecretType =
  | "API credential"
  | "Encryption key"
  | "Signing secret"
  | "Webhook secret";

type SecretRecord = {
  id: string;
  name: string;
  type: SecretType;
  environment: Environment;
  owner: string;
  status: SecretStatus;
  lastRotated: string;
  rotationDays: number;
  version: number;
  fingerprint: string;
};

const initialSecrets: SecretRecord[] = [
  {
    id: "SEC-1001",
    name: "AI Gateway Provider Credential",
    type: "API credential",
    environment: "Production",
    owner: "AI Platform",
    status: "Healthy",
    lastRotated: "Oct 20, 2026",
    rotationDays: 90,
    version: 4,
    fingerprint: "fp_a84d21",
  },
  {
    id: "SEC-1002",
    name: "Session Signing Secret",
    type: "Signing secret",
    environment: "Production",
    owner: "Identity Service",
    status: "Rotation due",
    lastRotated: "Aug 1, 2026",
    rotationDays: 90,
    version: 2,
    fingerprint: "fp_b39f70",
  },
  {
    id: "SEC-1003",
    name: "Knowledge Hub Encryption Key",
    type: "Encryption key",
    environment: "Production",
    owner: "Knowledge Service",
    status: "Healthy",
    lastRotated: "Oct 12, 2026",
    rotationDays: 180,
    version: 3,
    fingerprint: "fp_c51a62",
  },
  {
    id: "SEC-1004",
    name: "Webhook Verification Secret",
    type: "Webhook secret",
    environment: "Staging",
    owner: "Integrations",
    status: "Rotation due",
    lastRotated: "Jul 15, 2026",
    rotationDays: 90,
    version: 1,
    fingerprint: "fp_d70b14",
  },
  {
    id: "SEC-1005",
    name: "Development Provider Credential",
    type: "API credential",
    environment: "Development",
    owner: "Developer Tools",
    status: "Disabled",
    lastRotated: "Sep 10, 2026",
    rotationDays: 90,
    version: 1,
    fingerprint: "fp_e26c83",
  },
  {
    id: "SEC-1006",
    name: "Legacy Signing Secret",
    type: "Signing secret",
    environment: "Staging",
    owner: "Platform Security",
    status: "Expired",
    lastRotated: "Jun 1, 2026",
    rotationDays: 90,
    version: 1,
    fingerprint: "fp_f92e31",
  },
];

const inputClass = "secret-input";

const emptySecret: SecretRecord = {
  id: "",
  name: "",
  type: "API credential",
  environment: "Development",
  owner: "",
  status: "Healthy",
  lastRotated: "Not rotated",
  rotationDays: 90,
  version: 1,
  fingerprint: "Not assigned",
};

export default function EncryptionSecretsPage() {
  const [secrets, setSecrets] = useState<SecretRecord[]>(initialSecrets);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [environmentFilter, setEnvironmentFilter] =
    useState("All environments");
  const [typeFilter, setTypeFilter] = useState("All types");
  const [selected, setSelected] = useState<SecretRecord | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState<SecretRecord>(emptySecret);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showFingerprints, setShowFingerprints] = useState(false);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] =
    useState<SecretRecord | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const filteredSecrets = useMemo(() => {
    const query = search.trim().toLowerCase();

    return secrets.filter((secret) => {
      const matchesSearch =
        !query ||
        secret.id.toLowerCase().includes(query) ||
        secret.name.toLowerCase().includes(query) ||
        secret.owner.toLowerCase().includes(query) ||
        secret.fingerprint.toLowerCase().includes(query);

      return (
        matchesSearch &&
        (statusFilter === "All statuses" ||
          secret.status === statusFilter) &&
        (environmentFilter === "All environments" ||
          secret.environment === environmentFilter) &&
        (typeFilter === "All types" || secret.type === typeFilter)
      );
    });
  }, [secrets, search, statusFilter, environmentFilter, typeFilter]);

  const healthyCount = secrets.filter(
    (secret) => secret.status === "Healthy"
  ).length;

  const rotationCount = secrets.filter(
    (secret) => secret.status === "Rotation due"
  ).length;

  const expiredCount = secrets.filter(
    (secret) => secret.status === "Expired"
  ).length;

  const productionCount = secrets.filter(
    (secret) => secret.environment === "Production"
  ).length;

  function openCreate() {
    setEditingId(null);
    setDraft({ ...emptySecret });
    setError("");
    setFormOpen(true);
  }

  function openEdit(secret: SecretRecord) {
    setEditingId(secret.id);
    setDraft({ ...secret });
    setError("");
    setSelected(null);
    setMenuId(null);
    setFormOpen(true);
  }

  function saveSecret() {
    if (!draft.name.trim()) {
      setError("Enter a secret name.");
      return;
    }

    if (!draft.owner.trim()) {
      setError("Enter the responsible team or owner.");
      return;
    }

    if (
      !Number.isFinite(draft.rotationDays) ||
      draft.rotationDays < 1 ||
      draft.rotationDays > 3650
    ) {
      setError("Rotation interval must be between 1 and 3650 days.");
      return;
    }

    const duplicate = secrets.some(
      (secret) =>
        secret.name.trim().toLowerCase() ===
          draft.name.trim().toLowerCase() &&
        secret.id !== editingId
    );

    if (duplicate) {
      setError("A record with this name already exists.");
      return;
    }

    const saved: SecretRecord = {
      ...draft,
      id: editingId ?? `SEC-${Date.now().toString().slice(-6)}`,
      name: draft.name.trim(),
      owner: draft.owner.trim(),
      fingerprint: draft.fingerprint.trim() || "Not assigned",
    };

    if (editingId) {
      setSecrets((current) =>
        current.map((secret) =>
          secret.id === editingId ? saved : secret
        )
      );
      setNotice("Secret metadata updated in local demo state.");
    } else {
      setSecrets((current) => [saved, ...current]);
      setNotice("Secret metadata added in local demo state.");
    }

    setFormOpen(false);
    setError("");
  }

  function simulateRotation(secret: SecretRecord) {
    const today = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    setSecrets((current) =>
      current.map((item) =>
        item.id === secret.id
          ? {
              ...item,
              lastRotated: today,
              version: item.version + 1,
              status: "Healthy",
            }
          : item
      )
    );

    setSelected((current) =>
      current?.id === secret.id
        ? {
            ...current,
            lastRotated: today,
            version: current.version + 1,
            status: "Healthy",
          }
        : current
    );

    setNotice(
      `${secret.name}: rotation recorded in the demo only. No real secret was rotated.`
    );
  }

  function toggleStatus(secret: SecretRecord) {
    const nextStatus: SecretStatus =
      secret.status === "Disabled" ? "Healthy" : "Disabled";

    setSecrets((current) =>
      current.map((item) =>
        item.id === secret.id
          ? { ...item, status: nextStatus }
          : item
      )
    );

    setSelected((current) =>
      current?.id === secret.id
        ? { ...current, status: nextStatus }
        : current
    );

    setConfirmTarget(null);
    setMenuId(null);
    setNotice(
      `${secret.name} marked ${nextStatus.toLowerCase()} in local demo state.`
    );
  }

  async function copyFingerprint(secret: SecretRecord) {
    try {
      await navigator.clipboard.writeText(secret.fingerprint);
      setNotice("Fingerprint copied.");
    } catch {
      setNotice("Clipboard access is unavailable in this browser.");
    }
  }

  function exportCsv() {
    const rows = [
      [
        "ID",
        "Name",
        "Type",
        "Environment",
        "Owner",
        "Status",
        "Last Rotated",
        "Rotation Interval Days",
        "Version",
        "Fingerprint",
      ],
      ...filteredSecrets.map((secret) => [
        secret.id,
        secret.name,
        secret.type,
        secret.environment,
        secret.owner,
        secret.status,
        secret.lastRotated,
        String(secret.rotationDays),
        String(secret.version),
        secret.fingerprint,
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) => `"${value.replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" })
    );

    const link = document.createElement("a");
    link.href = url;
    link.download = "modelnow-encryption-secrets.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    setNotice("Secret metadata exported to CSV.");
  }

  const metrics = [
    {
      title: "Tracked records",
      value: secrets.length,
      detail: "Secret metadata records",
      icon: KeyRound,
      color: "#315fea",
      bg: "#eff4ff",
    },
    {
      title: "Healthy",
      value: healthyCount,
      detail: "Marked healthy in this demo",
      icon: CheckCircle2,
      color: "#15803d",
      bg: "#ecfdf3",
    },
    {
      title: "Rotation due",
      value: rotationCount,
      detail: "Requires rotation review",
      icon: RefreshCw,
      color: "#c2410c",
      bg: "#fff7ed",
    },
    {
      title: "Expired",
      value: expiredCount,
      detail: `${productionCount} records in production`,
      icon: AlertTriangle,
      color: "#b91c1c",
      bg: "#fef2f2",
    },
  ];

  return (
    <main className="secret-page">
      <style jsx global>{`
        .secret-page {
          min-height: 100vh;
          background: #f5f7fb;
          color: #172033;
          padding: 30px;
          font-family: Arial, Helvetica, sans-serif;
        }

        .secret-page * {
          box-sizing: border-box;
        }

        .secret-shell {
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
        }

        .secret-page button,
        .secret-page input,
        .secret-page select {
          font: inherit;
        }

        .secret-page button {
          cursor: pointer;
          transition:
            background 0.18s ease,
            border-color 0.18s ease,
            transform 0.18s ease,
            box-shadow 0.18s ease;
        }

        .secret-page button:focus-visible,
        .secret-page input:focus-visible,
        .secret-page select:focus-visible {
          outline: 3px solid rgba(49, 95, 234, 0.25);
          outline-offset: 2px;
        }

        .secret-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 22px;
          margin-bottom: 26px;
        }

        .secret-eyebrow {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 12px;
          color: #315fea;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.1px;
        }

        .secret-title {
          margin: 0;
          font-size: clamp(26px, 3vw, 34px);
          font-weight: 800;
          letter-spacing: -1.1px;
          color: #151d30;
        }

        .secret-subtitle {
          max-width: 720px;
          margin-top: 10px;
          color: #68748a;
          font-size: 14px;
          line-height: 1.8;
        }

        .secret-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .secret-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 40px;
          padding: 10px 15px;
          border: 1px solid #e0e5ee;
          border-radius: 10px;
          background: #fff;
          color: #344054;
          font-size: 13px !important;
          font-weight: 700;
        }

        .secret-button:hover {
          background: #f8faff;
          border-color: #cbd5e8;
        }

        .secret-button-primary {
          border-color: #315fea;
          background: #315fea;
          color: white;
          box-shadow: 0 4px 10px rgba(49, 95, 234, 0.12);
        }

        .secret-button-primary:hover {
          border-color: #244ac7;
          background: #244ac7;
        }

        .secret-card {
          min-width: 0;
          border: 1px solid #e6eaf1;
          border-radius: 16px;
          background: #fff;
          box-shadow: 0 3px 12px rgba(16, 24, 40, 0.025);
        }

        .secret-safety {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 23px;
          padding: 17px;
          border: 1px solid #f2d89a;
          border-radius: 13px;
          background: #fff9e9;
          color: #854d0e;
        }

        .secret-safety-title {
          font-size: 13px;
          font-weight: 800;
        }

        .secret-safety-text {
          margin-top: 5px;
          color: #875b22;
          font-size: 12px;
          line-height: 1.75;
        }

        .secret-notice {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 20px;
          padding: 12px 15px;
          border: 1px solid #b7e5c7;
          border-radius: 11px;
          background: #f0fdf4;
          color: #166534;
          font-size: 13px;
        }

        .secret-notice button {
          display: grid;
          place-items: center;
          padding: 5px;
          border: 0;
          border-radius: 6px;
          background: transparent;
          color: inherit;
        }

        .secret-metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }

        .secret-metric {
          padding: 21px;
          transition:
            transform 0.18s ease,
            box-shadow 0.18s ease;
        }

        .secret-metric:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(16, 24, 40, 0.06);
        }

        .secret-metric-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
        }

        .secret-metric-label {
          color: #667085;
          font-size: 13px;
          font-weight: 600;
        }

        .secret-metric-value {
          margin-top: 13px;
          color: #182230;
          font-size: 32px;
          font-weight: 800;
          letter-spacing: -1px;
        }

        .secret-metric-detail {
          margin-top: 9px;
          color: #8a94a6;
          font-size: 11px;
          line-height: 1.6;
        }

        .secret-metric-icon {
          display: grid;
          width: 43px;
          height: 43px;
          flex-shrink: 0;
          place-items: center;
          border-radius: 12px;
        }

        .secret-overview {
          display: grid;
          grid-template-columns: minmax(0, 2fr) minmax(280px, 1fr);
          gap: 16px;
          margin-bottom: 20px;
        }

        .secret-panel {
          padding: 23px;
        }

        .secret-panel-heading {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .secret-panel-icon {
          display: grid;
          width: 44px;
          height: 44px;
          flex-shrink: 0;
          place-items: center;
          border-radius: 12px;
          background: #eff4ff;
          color: #315fea;
        }

        .secret-panel-title {
          margin: 0;
          color: #202b3d;
          font-size: 15px;
          font-weight: 800;
        }

        .secret-panel-subtitle {
          margin-top: 5px;
          color: #8490a4;
          font-size: 12px;
          line-height: 1.6;
        }

        .secret-posture-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 11px;
          margin-top: 20px;
        }

        .secret-posture-item {
          padding: 15px;
          border: 1px solid #e9edf3;
          border-radius: 11px;
          background: #fafbfe;
        }

        .secret-posture-heading {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #283448;
          font-size: 12px;
          font-weight: 750;
        }

        .secret-posture-detail {
          margin-top: 9px;
          color: #778397;
          font-size: 11px;
          line-height: 1.7;
        }

        .secret-progress-list {
          display: grid;
          gap: 21px;
          margin-top: 24px;
        }

        .secret-progress-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 9px;
          color: #596579;
          font-size: 12px;
        }

        .secret-progress-track {
          height: 7px;
          overflow: hidden;
          border-radius: 99px;
          background: #eef1f6;
        }

        .secret-progress-bar {
          height: 100%;
          border-radius: inherit;
          transition: width 0.25s ease;
        }

        .secret-small-note {
          margin-top: 22px;
          color: #98a2b3;
          font-size: 11px;
          line-height: 1.7;
        }

        .secret-inventory {
          overflow: visible;
        }

        .secret-inventory-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 14px;
          padding: 22px 23px 0;
        }

        .secret-inventory-title {
          margin: 0;
          font-size: 15px;
          font-weight: 800;
          color: #202b3d;
        }

        .secret-inventory-description {
          margin-top: 6px;
          color: #8490a4;
          font-size: 12px;
          line-height: 1.6;
        }

        .secret-filter-grid {
          display: grid;
          grid-template-columns: minmax(220px, 2fr) repeat(2, minmax(155px, 1fr));
          gap: 11px;
          padding: 20px 23px;
        }

        .secret-search-wrap {
          position: relative;
          min-width: 0;
        }

        .secret-search-icon {
          position: absolute;
          top: 50%;
          left: 12px;
          color: #98a2b3;
          transform: translateY(-50%);
          pointer-events: none;
        }

        .secret-input {
          width: 100%;
          min-height: 41px;
          padding: 10px 12px;
          border: 1px solid #dfe5ee;
          border-radius: 9px;
          background: #fff;
          color: #344054;
          font-size: 12px !important;
          outline: none;
          transition:
            border-color 0.18s ease,
            box-shadow 0.18s ease;
        }

        .secret-input:focus {
          border-color: #7192fa;
          box-shadow: 0 0 0 3px rgba(49, 95, 234, 0.1);
        }

        .secret-search-input {
          padding-left: 37px;
        }

        .secret-table-wrap {
          width: 100%;
          overflow-x: auto;
          border-top: 1px solid #edf0f5;
        }

        .secret-table {
          width: 100%;
          min-width: 1000px;
          border-collapse: collapse;
          text-align: left;
        }

        .secret-table thead {
          background: #f8f9fc;
        }

        .secret-table th {
          padding: 13px 16px;
          border-bottom: 1px solid #e8ecf2;
          color: #8993a5;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.7px;
          white-space: nowrap;
        }

        .secret-table td {
          padding: 16px;
          border-bottom: 1px solid #eff1f5;
          color: #586477;
          font-size: 12px;
          vertical-align: middle;
        }

        .secret-table tbody tr {
          transition: background 0.15s ease;
        }

        .secret-table tbody tr:hover {
          background: #fafbff;
        }

        .secret-record-name {
          display: block;
          max-width: 310px;
          border: 0;
          padding: 0;
          background: transparent;
          color: #273247;
          text-align: left;
          font-size: 12px !important;
          font-weight: 750;
          line-height: 1.6;
        }

        .secret-record-name:hover {
          color: #315fea;
        }

        .secret-record-id {
          margin-top: 5px;
          color: #9aa3b2;
          font-family: monospace;
          font-size: 10px;
        }

        .secret-fingerprint {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-top: 8px;
          color: #667085;
          font-family: monospace;
          font-size: 10px;
        }

        .secret-fingerprint button {
          display: grid;
          place-items: center;
          padding: 3px;
          border: 0;
          border-radius: 5px;
          background: #f0f3f9;
          color: #667085;
        }

        .secret-badge {
          display: inline-flex;
          align-items: center;
          padding: 5px 9px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 750;
          white-space: nowrap;
        }

        .secret-menu-wrap {
          position: relative;
        }

        .secret-menu-button {
          display: grid;
          width: 32px;
          height: 32px;
          place-items: center;
          border: 1px solid #e4e8ef;
          border-radius: 8px;
          background: #fff;
          color: #667085;
        }

        .secret-menu-button:hover {
          background: #f4f6fb;
        }

        .secret-dropdown {
          position: absolute;
          top: 38px;
          right: 0;
          z-index: 20;
          width: 185px;
          padding: 5px;
          border: 1px solid #e4e8ef;
          border-radius: 11px;
          background: #fff;
          box-shadow: 0 12px 32px rgba(16, 24, 40, 0.14);
        }

        .secret-dropdown button {
          display: block;
          width: 100%;
          padding: 10px;
          border: 0;
          border-radius: 7px;
          background: transparent;
          color: #475467;
          text-align: left;
          font-size: 11px !important;
        }

        .secret-dropdown button:hover {
          background: #f4f6fb;
          color: #315fea;
        }

        .secret-empty {
          padding: 42px 15px !important;
          color: #8a94a6 !important;
          text-align: center;
        }

        .secret-inventory-footer {
          padding: 15px 23px;
          color: #98a2b3;
          font-size: 11px;
          line-height: 1.7;
        }

        .secret-page-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 22px;
          padding: 18px 0;
          border-top: 1px solid #e5e9f0;
          color: #98a2b3;
          font-size: 11px;
        }

        .secret-overlay {
          position: fixed;
          inset: 0;
          z-index: 50;
          display: flex;
          justify-content: flex-end;
          background: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(2px);
        }

        .secret-drawer {
          width: 100%;
          max-width: 450px;
          height: 100%;
          overflow-y: auto;
          padding: 26px;
          background: #fff;
          box-shadow: -15px 0 45px rgba(15, 23, 42, 0.12);
          animation: secret-slide-in 0.2s ease-out;
        }

        .secret-drawer-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .secret-drawer-eyebrow {
          color: #315fea;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .secret-drawer-title {
          margin-top: 10px;
          color: #172033;
          font-size: 20px;
          font-weight: 800;
          line-height: 1.45;
        }

        .secret-close-button {
          display: grid;
          width: 35px;
          height: 35px;
          flex-shrink: 0;
          place-items: center;
          border: 1px solid #e4e8ef;
          border-radius: 9px;
          background: #fff;
          color: #667085;
        }

        .secret-close-button:hover {
          background: #f4f6fb;
        }

        .secret-detail-warning {
          margin-top: 22px;
          padding: 14px;
          border: 1px solid #f3dfb0;
          border-radius: 11px;
          background: #fff9e9;
          color: #875b22;
          font-size: 11px;
          line-height: 1.8;
        }

        .secret-detail-list {
          margin-top: 24px;
        }

        .secret-detail-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 15px;
          padding: 13px 0;
          border-bottom: 1px solid #edf0f5;
        }

        .secret-detail-label {
          color: #8490a4;
          font-size: 12px;
        }

        .secret-detail-value {
          max-width: 65%;
          overflow-wrap: anywhere;
          color: #273247;
          text-align: right;
          font-size: 12px;
          font-weight: 700;
        }

        .secret-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 60;
          display: grid;
          place-items: center;
          overflow-y: auto;
          padding: 20px;
          background: rgba(15, 23, 42, 0.5);
          backdrop-filter: blur(3px);
        }

        .secret-modal {
          width: 100%;
          max-width: 640px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 25px;
          border: 1px solid #e7ebf2;
          border-radius: 17px;
          background: #fff;
          box-shadow: 0 25px 80px rgba(15, 23, 42, 0.22);
          animation: secret-modal-in 0.18s ease-out;
        }

        .secret-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 15px;
        }

        .secret-modal-title {
          margin: 0;
          color: #172033;
          font-size: 20px;
          font-weight: 800;
        }

        .secret-modal-subtitle {
          margin-top: 7px;
          color: #8490a4;
          font-size: 12px;
          line-height: 1.7;
        }

        .secret-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 17px;
          margin-top: 23px;
        }

        .secret-form-field {
          display: block;
          min-width: 0;
          color: #475467;
          font-size: 11px;
          font-weight: 750;
        }

        .secret-form-field.full {
          grid-column: 1 / -1;
        }

        .secret-form-field .secret-input {
          display: block;
          margin-top: 8px;
        }

        .secret-error {
          margin-top: 16px;
          color: #b42318;
          font-size: 12px;
          line-height: 1.6;
        }

        .secret-modal-footer {
          display: flex;
          justify-content: flex-end;
          flex-wrap: wrap;
          gap: 9px;
          margin-top: 24px;
          padding-top: 18px;
          border-top: 1px solid #edf0f5;
        }

        .secret-confirm-modal {
          width: 100%;
          max-width: 420px;
          padding: 25px;
          border-radius: 17px;
          background: #fff;
          box-shadow: 0 25px 80px rgba(15, 23, 42, 0.22);
        }

        .secret-confirm-icon {
          display: grid;
          width: 44px;
          height: 44px;
          place-items: center;
          border-radius: 12px;
          background: #fff3db;
          color: #b45309;
        }

        .secret-confirm-title {
          margin-top: 17px;
          color: #172033;
          font-size: 18px;
          font-weight: 800;
        }

        .secret-confirm-description {
          margin-top: 9px;
          color: #667085;
          font-size: 12px;
          line-height: 1.8;
        }

        .secret-confirm-actions {
          display: flex;
          justify-content: flex-end;
          flex-wrap: wrap;
          gap: 9px;
          margin-top: 23px;
        }

        @keyframes secret-slide-in {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes secret-modal-in {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.99);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (max-width: 1100px) {
          .secret-metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .secret-overview {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 720px) {
          .secret-page {
            padding: 16px;
          }

          .secret-header {
            gap: 17px;
          }

          .secret-actions {
            width: 100%;
          }

          .secret-actions .secret-button {
            flex: 1;
          }

          .secret-metrics {
            gap: 10px;
          }

          .secret-metric {
            padding: 15px;
          }

          .secret-metric-value {
            font-size: 27px;
          }

          .secret-metric-icon {
            width: 36px;
            height: 36px;
          }

          .secret-panel {
            padding: 17px;
          }

          .secret-posture-grid {
            grid-template-columns: 1fr;
          }

          .secret-inventory-header {
            padding: 18px 16px 0;
          }

          .secret-filter-grid {
            grid-template-columns: 1fr;
            padding: 17px 16px;
          }

          .secret-filter-grid > * {
            grid-column: auto !important;
          }

          .secret-drawer {
            max-width: 100%;
            padding: 20px;
          }

          .secret-modal {
            padding: 18px;
          }

          .secret-form-grid {
            grid-template-columns: 1fr;
          }

          .secret-form-field.full {
            grid-column: auto;
          }

          .secret-modal-footer {
            flex-direction: column-reverse;
          }

          .secret-modal-footer .secret-button {
            width: 100%;
          }
        }

        @media (max-width: 390px) {
          .secret-metrics {
            grid-template-columns: 1fr;
          }

          .secret-actions {
            flex-direction: column;
          }

          .secret-actions .secret-button {
            width: 100%;
          }

          .secret-page-footer {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .secret-page *,
          .secret-page *::before,
          .secret-page *::after {
            scroll-behavior: auto !important;
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <div className="secret-shell">
        <header className="secret-header">
          <div>
            <p className="secret-eyebrow">
              <ShieldCheck size={16} />
              MODELNOW ADMIN <span>/</span> SECURITY <span>/</span> ENCRYPTION
              &amp; SECRETS
            </p>

            <h1 className="secret-title">Encryption &amp; Secrets</h1>

            <p className="secret-subtitle">
              Review encryption-related metadata, secret ownership, rotation
              intervals, and credential lifecycle status across environments.
            </p>
          </div>

          <div className="secret-actions">
            <button className="secret-button" onClick={exportCsv}>
              <Download size={16} />
              Export CSV
            </button>

            <button
              className="secret-button secret-button-primary"
              onClick={openCreate}
            >
              <Plus size={17} />
              Add record
            </button>
          </div>
        </header>

        <div className="secret-safety">
          <AlertTriangle size={19} className="shrink-0" />
          <div>
            <p className="secret-safety-title">Secret safety notice</p>
            <p className="secret-safety-text">
              This page stores metadata only. It never creates, retrieves,
              rotates, or disables real credentials. Production secrets should
              be stored in a dedicated secret manager or key management service,
              not in frontend state or browser storage.
            </p>
          </div>
        </div>

        {notice && (
          <div role="status" className="secret-notice">
            <span>{notice}</span>
            <button
              onClick={() => setNotice("")}
              aria-label="Dismiss notification"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <section className="secret-metrics">
          {metrics.map((metric) => {
            const Icon = metric.icon;

            return (
              <article key={metric.title} className="secret-card secret-metric">
                <div className="secret-metric-top">
                  <div>
                    <p className="secret-metric-label">{metric.title}</p>
                    <p className="secret-metric-value">{metric.value}</p>
                  </div>

                  <div
                    className="secret-metric-icon"
                    style={{
                      background: metric.bg,
                      color: metric.color,
                    }}
                  >
                    <Icon size={21} />
                  </div>
                </div>
                <p className="secret-metric-detail">{metric.detail}</p>
              </article>
            );
          })}
        </section>

        <section className="secret-overview">
          <article className="secret-card secret-panel">
            <div className="secret-panel-heading">
              <div className="secret-panel-icon">
                <LockKeyhole size={22} />
              </div>
              <div>
                <h2 className="secret-panel-title">Encryption posture</h2>
                <p className="secret-panel-subtitle">
                  Areas to verify in your backend and cloud infrastructure.
                </p>
              </div>
            </div>

            <div className="secret-posture-grid">
              <PostureItem
                title="Encryption in transit"
                detail="Verify TLS for external and internal service connections."
              />
              <PostureItem
                title="Encryption at rest"
                detail="Verify database, file, backup, and object-storage encryption."
              />
              <PostureItem
                title="Key management"
                detail="Use managed keys, controlled permissions, and documented ownership."
              />
              <PostureItem
                title="Credential rotation"
                detail="Automate rotation where supported and validate dependent services."
              />
            </div>
          </article>

          <article className="secret-card secret-panel">
            <div className="secret-panel-heading">
              <div
                className="secret-panel-icon"
                style={{ background: "#f4f0ff", color: "#6941c6" }}
              >
                <RefreshCw size={21} />
              </div>
              <div>
                <h2 className="secret-panel-title">Rotation overview</h2>
                <p className="secret-panel-subtitle">
                  Based on sample status labels
                </p>
              </div>
            </div>

            <div className="secret-progress-list">
              <ProgressRow
                label="Healthy"
                count={healthyCount}
                total={secrets.length}
                color="#16a34a"
              />
              <ProgressRow
                label="Rotation due"
                count={rotationCount}
                total={secrets.length}
                color="#f59e0b"
              />
              <ProgressRow
                label="Expired"
                count={expiredCount}
                total={secrets.length}
                color="#dc2626"
              />
            </div>

            <p className="secret-small-note">
              Statuses are illustrative and are not calculated from a live
              secret manager.
            </p>
          </article>
        </section>

        <section className="secret-card secret-inventory">
          <div className="secret-inventory-header">
            <div>
              <h2 className="secret-inventory-title">Secret inventory</h2>
              <p className="secret-inventory-description">
                Metadata for credentials and encryption-related records.
              </p>
            </div>

            <button
              onClick={() => setShowFingerprints((current) => !current)}
              className="secret-button"
            >
              {showFingerprints ? <EyeOff size={15} /> : <Eye size={15} />}
              {showFingerprints
                ? "Hide fingerprints"
                : "Show fingerprints"}
            </button>
          </div>

          <div className="secret-filter-grid">
            <div className="secret-search-wrap">
              <Search className="secret-search-icon" size={16} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, owner, ID..."
                aria-label="Search secret inventory"
                className={`${inputClass} secret-search-input`}
              />
            </div>

            <select
              value={environmentFilter}
              onChange={(event) => setEnvironmentFilter(event.target.value)}
              className={inputClass}
              aria-label="Filter by environment"
            >
              <option>All environments</option>
              <option>Development</option>
              <option>Staging</option>
              <option>Production</option>
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className={inputClass}
              aria-label="Filter by secret status"
            >
              <option>All statuses</option>
              <option>Healthy</option>
              <option>Rotation due</option>
              <option>Expired</option>
              <option>Disabled</option>
            </select>

            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className={inputClass}
              aria-label="Filter by secret type"
            >
              <option>All types</option>
              <option>API credential</option>
              <option>Encryption key</option>
              <option>Signing secret</option>
              <option>Webhook secret</option>
            </select>
          </div>

          <div className="secret-table-wrap">
            <table className="secret-table">
              <thead>
                <tr>
                  {[
                    "SECRET RECORD",
                    "TYPE",
                    "ENVIRONMENT",
                    "OWNER",
                    "STATUS",
                    "LAST ROTATED",
                    "VERSION",
                    "",
                  ].map((heading, index) => (
                    <th key={`${heading}-${index}`}>{heading}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredSecrets.map((secret) => (
                  <tr key={secret.id}>
                    <td>
                      <button
                        onClick={() => setSelected(secret)}
                        className="secret-record-name"
                      >
                        {secret.name}
                      </button>

                      <p className="secret-record-id">{secret.id}</p>

                      {showFingerprints && (
                        <div className="secret-fingerprint">
                          <span>{secret.fingerprint}</span>
                          <button
                            onClick={() => copyFingerprint(secret)}
                            title="Copy fingerprint"
                            aria-label={`Copy fingerprint for ${secret.name}`}
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                      )}
                    </td>

                    <td>{secret.type}</td>
                    <td>
                      <EnvironmentBadge value={secret.environment} />
                    </td>
                    <td>{secret.owner}</td>
                    <td>
                      <SecretStatusBadge status={secret.status} />
                    </td>
                    <td>{secret.lastRotated}</td>
                    <td style={{ color: "#273247", fontWeight: 750 }}>
                      v{secret.version}
                    </td>

                    <td>
                      <div className="secret-menu-wrap">
                        <button
                          onClick={() =>
                            setMenuId(
                              menuId === secret.id ? null : secret.id
                            )
                          }
                          aria-label={`Actions for ${secret.name}`}
                          className="secret-menu-button"
                        >
                          <MoreHorizontal size={17} />
                        </button>

                        {menuId === secret.id && (
                          <div className="secret-dropdown">
                            <button
                              onClick={() => {
                                setSelected(secret);
                                setMenuId(null);
                              }}
                            >
                              View details
                            </button>
                            <button onClick={() => openEdit(secret)}>
                              Edit metadata
                            </button>
                            <button
                              onClick={() => {
                                setSelected(secret);
                                setMenuId(null);
                              }}
                            >
                              Rotation history
                            </button>
                            <button
                              onClick={() => {
                                setConfirmTarget(secret);
                                setMenuId(null);
                              }}
                            >
                              {secret.status === "Disabled"
                                ? "Enable record"
                                : "Disable record"}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredSecrets.length === 0 && (
                  <tr>
                    <td colSpan={8} className="secret-empty">
                      No records match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="secret-inventory-footer">
            Sample metadata only · No credential values are displayed · Showing{" "}
            {filteredSecrets.length} of {secrets.length} records
          </div>
        </section>

        <footer className="secret-page-footer">
          <span>ModelNow Encryption &amp; Secrets · Frontend prototype</span>
          <span>{secrets.length} tracked records</span>
        </footer>
      </div>

      {selected && (
        <div
          className="secret-overlay"
          onClick={() => setSelected(null)}
        >
          <aside
            className="secret-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Secret metadata details"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="secret-drawer-heading">
              <div>
                <p className="secret-drawer-eyebrow">SECRET METADATA</p>
                <h2 className="secret-drawer-title">{selected.name}</h2>
                <p className="secret-record-id">{selected.id}</p>
              </div>

              <button
                onClick={() => setSelected(null)}
                aria-label="Close details"
                className="secret-close-button"
              >
                <X size={17} />
              </button>
            </div>

            <div className="secret-detail-warning">
              The actual secret value is intentionally not available here.
              Never expose production credentials in a browser-based admin
              inventory.
            </div>

            <div className="secret-detail-list">
              <DetailRow label="Type" value={selected.type} />
              <DetailRow label="Environment" value={selected.environment} />
              <DetailRow label="Owner" value={selected.owner} />
              <DetailRow label="Status" value={selected.status} />
              <DetailRow label="Last rotated" value={selected.lastRotated} />
              <DetailRow
                label="Rotation interval"
                value={`${selected.rotationDays} days`}
              />
              <DetailRow label="Version" value={`v${selected.version}`} />
              <DetailRow
                label="Fingerprint"
                value={selected.fingerprint}
              />
            </div>

            <button
              onClick={() => simulateRotation(selected)}
              className="secret-button secret-button-primary"
              style={{ width: "100%", marginTop: 24 }}
            >
              <RefreshCw size={16} />
              Record demo rotation
            </button>

            <button
              onClick={() => openEdit(selected)}
              className="secret-button"
              style={{ width: "100%", marginTop: 10 }}
            >
              Edit metadata
            </button>
          </aside>
        </div>
      )}

      {formOpen && (
        <div
          className="secret-modal-overlay"
          onClick={() => setFormOpen(false)}
        >
          <section
            className="secret-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="secret-form-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="secret-modal-header">
              <div>
                <h2 id="secret-form-title" className="secret-modal-title">
                  {editingId ? "Edit secret metadata" : "Add secret metadata"}
                </h2>
                <p className="secret-modal-subtitle">
                  Do not enter an actual secret value into this form.
                </p>
              </div>

              <button
                onClick={() => setFormOpen(false)}
                aria-label="Close form"
                className="secret-close-button"
              >
                <X size={16} />
              </button>
            </div>

            <div className="secret-form-grid">
              <label className="secret-form-field full">
                Record name *
                <input
                  value={draft.name}
                  onChange={(event) =>
                    setDraft({ ...draft, name: event.target.value })
                  }
                  placeholder="e.g. Model provider credential"
                  className={inputClass}
                />
              </label>

              <label className="secret-form-field">
                Secret type
                <select
                  value={draft.type}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      type: event.target.value as SecretType,
                    })
                  }
                  className={inputClass}
                >
                  <option>API credential</option>
                  <option>Encryption key</option>
                  <option>Signing secret</option>
                  <option>Webhook secret</option>
                </select>
              </label>

              <label className="secret-form-field">
                Environment
                <select
                  value={draft.environment}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      environment: event.target.value as Environment,
                    })
                  }
                  className={inputClass}
                >
                  <option>Development</option>
                  <option>Staging</option>
                  <option>Production</option>
                </select>
              </label>

              <label className="secret-form-field">
                Responsible owner *
                <input
                  value={draft.owner}
                  onChange={(event) =>
                    setDraft({ ...draft, owner: event.target.value })
                  }
                  placeholder="e.g. AI Platform"
                  className={inputClass}
                />
              </label>

              <label className="secret-form-field">
                Rotation interval (days)
                <input
                  type="number"
                  min={1}
                  max={3650}
                  value={draft.rotationDays}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      rotationDays: Number(event.target.value),
                    })
                  }
                  className={inputClass}
                />
              </label>

              <label className="secret-form-field">
                Status
                <select
                  value={draft.status}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      status: event.target.value as SecretStatus,
                    })
                  }
                  className={inputClass}
                >
                  <option>Healthy</option>
                  <option>Rotation due</option>
                  <option>Expired</option>
                  <option>Disabled</option>
                </select>
              </label>

              <label className="secret-form-field">
                Fingerprint label
                <input
                  value={draft.fingerprint}
                  onChange={(event) =>
                    setDraft({ ...draft, fingerprint: event.target.value })
                  }
                  placeholder="Non-secret identifier only"
                  className={inputClass}
                />
              </label>
            </div>

            {error && (
              <p role="alert" className="secret-error">
                {error}
              </p>
            )}

            <div className="secret-modal-footer">
              <button
                onClick={() => setFormOpen(false)}
                className="secret-button"
              >
                Cancel
              </button>
              <button
                onClick={saveSecret}
                className="secret-button secret-button-primary"
              >
                {editingId ? "Save changes" : "Add record"}
              </button>
            </div>
          </section>
        </div>
      )}

      {confirmTarget && (
        <div
          className="secret-modal-overlay"
          onClick={() => setConfirmTarget(null)}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="secret-confirm-title"
            className="secret-confirm-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="secret-confirm-icon">
              <AlertTriangle size={21} />
            </div>

            <h2
              id="secret-confirm-title"
              className="secret-confirm-title"
            >
              {confirmTarget.status === "Disabled"
                ? "Enable this record?"
                : "Disable this record?"}
            </h2>

            <p className="secret-confirm-description">
              Change the displayed status for &quot;{confirmTarget.name}&quot;
              in the frontend demo. This does not modify a real credential.
            </p>

            <div className="secret-confirm-actions">
              <button
                onClick={() => setConfirmTarget(null)}
                className="secret-button"
              >
                Cancel
              </button>
              <button
                onClick={() => toggleStatus(confirmTarget)}
                className="secret-button secret-button-primary"
              >
                {confirmTarget.status === "Disabled"
                  ? "Enable record"
                  : "Disable record"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function SecretStatusBadge({ status }: { status: SecretStatus }) {
  const styles: Record<SecretStatus, { background: string; color: string }> = {
    Healthy: { background: "#ecfdf3", color: "#15803d" },
    "Rotation due": { background: "#fff7ed", color: "#c2410c" },
    Expired: { background: "#fef2f2", color: "#b91c1c" },
    Disabled: { background: "#f2f4f7", color: "#667085" },
  };

  return (
    <span
      className="secret-badge"
      style={styles[status]}
    >
      {status}
    </span>
  );
}

function EnvironmentBadge({ value }: { value: Environment }) {
  const styles: Record<Environment, { background: string; color: string }> = {
    Development: { background: "#f2f4f7", color: "#475467" },
    Staging: { background: "#f4f0ff", color: "#6941c6" },
    Production: { background: "#eff4ff", color: "#315fea" },
  };

  return (
    <span className="secret-badge" style={styles[value]}>
      {value}
    </span>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="secret-detail-row">
      <span className="secret-detail-label">{label}</span>
      <span className="secret-detail-value">{value}</span>
    </div>
  );
}

function PostureItem({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <div className="secret-posture-item">
      <div className="secret-posture-heading">
        <CheckCircle2 size={16} color="#16a34a" />
        <h3 style={{ margin: 0 }}>{title}</h3>
      </div>
      <p className="secret-posture-detail">{detail}</p>
    </div>
  );
}

function ProgressRow({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div>
      <div className="secret-progress-top">
        <span>{label}</span>
        <strong style={{ color: "#273247" }}>
          {count} / {total}
        </strong>
      </div>
      <div
        className="secret-progress-track"
        role="progressbar"
        aria-label={`${label} records`}
        aria-valuenow={count}
        aria-valuemin={0}
        aria-valuemax={total}
      >
        <div
          className="secret-progress-bar"
          style={{ width: `${percentage}%`, background: color }}
        />
      </div>
    </div>
  );
}
