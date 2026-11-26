
"use client";

import { useMemo, useState } from "react";
import {
  ShieldCheck,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Search,
  RefreshCw,
  LogOut,
  Trash2,
  MoreHorizontal,
  MapPin,
  Clock3,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  X,
  Eye,
  Activity,
  Globe,
  Fingerprint,
  LockKeyhole,
  CircleHelp,
  Download,
  Wifi,
} from "lucide-react";

type SessionStatus = "Current session" | "Active" | "Idle";
type DeviceType = "Desktop" | "Laptop" | "Mobile" | "Tablet";

type Session = {
  id: string;
  device: string;
  type: DeviceType;
  browser: string;
  os: string;
  location: string;
  ip: string;
  lastActive: string;
  started: string;
  status: SessionStatus;
  current: boolean;
  trusted: boolean;
};

type TrustedDevice = {
  id: string;
  name: string;
  type: DeviceType;
  browser: string;
  os: string;
  location: string;
  lastSeen: string;
  trustedSince: string;
  trusted: boolean;
};

const initialSessions: Session[] = [
  {
    id: "SES-001",
    device: "Windows Desktop",
    type: "Desktop",
    browser: "Chrome 156",
    os: "Windows 11",
    location: "Hyderabad, India",
    ip: "192.168.1.24",
    lastActive: "Just now",
    started: "Today, 09:12 AM",
    status: "Current session",
    current: true,
    trusted: true,
  },
  {
    id: "SES-002",
    device: "MacBook Pro",
    type: "Laptop",
    browser: "Safari",
    os: "macOS",
    location: "Bengaluru, India",
    ip: "192.168.1.81",
    lastActive: "12 minutes ago",
    started: "Today, 08:35 AM",
    status: "Active",
    current: false,
    trusted: true,
  },
  {
    id: "SES-003",
    device: "Android Phone",
    type: "Mobile",
    browser: "Chrome Mobile",
    os: "Android",
    location: "Hyderabad, India",
    ip: "192.168.1.63",
    lastActive: "35 minutes ago",
    started: "Today, 07:48 AM",
    status: "Active",
    current: false,
    trusted: true,
  },
  {
    id: "SES-004",
    device: "Windows Laptop",
    type: "Laptop",
    browser: "Edge",
    os: "Windows 11",
    location: "Chennai, India",
    ip: "192.168.1.92",
    lastActive: "2 hours ago",
    started: "Yesterday, 06:10 PM",
    status: "Idle",
    current: false,
    trusted: false,
  },
];

const initialDevices: TrustedDevice[] = [
  {
    id: "DEV-001",
    name: "Windows Desktop",
    type: "Desktop",
    browser: "Chrome 156",
    os: "Windows 11",
    location: "Hyderabad, India",
    lastSeen: "Just now",
    trustedSince: "Oct 12, 2026",
    trusted: true,
  },
  {
    id: "DEV-002",
    name: "MacBook Pro",
    type: "Laptop",
    browser: "Safari",
    os: "macOS",
    location: "Bengaluru, India",
    lastSeen: "12 minutes ago",
    trustedSince: "Oct 18, 2026",
    trusted: true,
  },
  {
    id: "DEV-003",
    name: "Android Phone",
    type: "Mobile",
    browser: "Chrome Mobile",
    os: "Android",
    location: "Hyderabad, India",
    lastSeen: "35 minutes ago",
    trustedSince: "Oct 25, 2026",
    trusted: true,
  },
];

const deviceIcon = (type: DeviceType, size = 20) => {
  if (type === "Mobile") return <Smartphone size={size} />;
  if (type === "Tablet") return <Tablet size={size} />;
  if (type === "Laptop") return <Laptop size={size} />;
  return <Monitor size={size} />;
};

export default function SessionsDevicesPage() {
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [devices, setDevices] = useState<TrustedDevice[]>(initialDevices);
  const [activeTab, setActiveTab] = useState<"sessions" | "devices">("sessions");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All sessions");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<TrustedDevice | null>(null);
  const [confirmAction, setConfirmAction] = useState<
    | { type: "session"; id: string }
    | { type: "all" }
    | { type: "device"; id: string }
    | null
  >(null);
  const [notice, setNotice] = useState("");
  const [showHelp, setShowHelp] = useState(false);

  const currentSession = sessions.find((session) => session.current);
  const activeCount = sessions.filter((session) => session.status !== "Idle").length;
  const trustedCount = devices.filter((device) => device.trusted).length;
  const idleCount = sessions.filter((session) => session.status === "Idle").length;

  const filteredSessions = useMemo(() => {
    const term = search.trim().toLowerCase();

    return sessions.filter((session) => {
      const matchesSearch =
        !term ||
        session.device.toLowerCase().includes(term) ||
        session.browser.toLowerCase().includes(term) ||
        session.os.toLowerCase().includes(term) ||
        session.location.toLowerCase().includes(term) ||
        session.id.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "All sessions" ||
        (statusFilter === "Current session" && session.current) ||
        (statusFilter === "Active" && session.status === "Active") ||
        (statusFilter === "Idle" && session.status === "Idle");

      return matchesSearch && matchesStatus;
    });
  }, [sessions, search, statusFilter]);

  const filteredDevices = useMemo(() => {
    const term = search.trim().toLowerCase();

    return devices.filter(
      (device) =>
        !term ||
        device.name.toLowerCase().includes(term) ||
        device.browser.toLowerCase().includes(term) ||
        device.os.toLowerCase().includes(term) ||
        device.location.toLowerCase().includes(term) ||
        device.id.toLowerCase().includes(term)
    );
  }, [devices, search]);

  function notify(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3000);
  }

  function terminateSession(sessionId: string) {
    const session = sessions.find((item) => item.id === sessionId);

    if (!session) return;

    if (session.current) {
      notify("The current session cannot be terminated from this demo.");
      setConfirmAction(null);
      return;
    }

    setSessions((current) =>
      current.filter((item) => item.id !== sessionId)
    );

    setSelectedSession(null);
    setConfirmAction(null);
    notify("Session removed from the demo list.");
  }

  function terminateAllSessions() {
    const removedCount = sessions.filter((session) => !session.current).length;

    setSessions((current) => current.filter((session) => session.current));
    setSelectedSession(null);
    setConfirmAction(null);

    notify(
      removedCount
        ? `${removedCount} other session(s) removed from the demo list.`
        : "No other sessions to terminate."
    );
  }

  function removeTrustedDevice(deviceId: string) {
    const device = devices.find((item) => item.id === deviceId);

    if (!device) return;

    setDevices((current) => current.filter((item) => item.id !== deviceId));

    setSessions((current) =>
      current.map((session) =>
        session.device === device.name
          ? { ...session, trusted: false }
          : session
      )
    );

    setSelectedDevice(null);
    setConfirmAction(null);
    notify("Device removed from the demo trusted-device list.");
  }

  function toggleTrust(deviceId: string) {
    const device = devices.find((item) => item.id === deviceId);
    if (!device) return;

    const nextTrusted = !device.trusted;

    setDevices((current) =>
      current.map((item) =>
        item.id === deviceId ? { ...item, trusted: nextTrusted } : item
      )
    );

    setSessions((current) =>
      current.map((session) =>
        session.device === device.name
          ? { ...session, trusted: nextTrusted }
          : session
      )
    );

    setSelectedDevice((current) =>
      current?.id === deviceId
        ? { ...current, trusted: nextTrusted }
        : current
    );

    notify(nextTrusted ? "Device marked as trusted." : "Device trust removed.");
  }

  function exportSessions() {
    const rows = [
      [
        "Session ID",
        "Device",
        "Browser",
        "Operating System",
        "Location",
        "IP Address",
        "Last Active",
        "Status",
        "Trusted",
      ],
      ...filteredSessions.map((session) => [
        session.id,
        session.device,
        session.browser,
        session.os,
        session.location,
        session.ip,
        session.lastActive,
        session.status,
        session.trusted ? "Yes" : "No",
      ]),
    ];

    const csv = rows
      .map((row) =>
        row.map((value) => `"${value.replaceAll('"', '""')}"`).join(",")
      )
      .join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" })
    );

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "modelnow-sessions.csv";
    anchor.click();
    URL.revokeObjectURL(url);

    notify("Session list exported.");
  }

  return (
    <main className="sd-page">
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #f6f8fc;
          color: #172033;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system,
            BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        button,
        input,
        select {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        .sd-page {
          min-height: 100vh;
          padding: 30px;
          background: #f6f8fc;
        }

        .sd-container {
          max-width: 1500px;
          margin: 0 auto;
        }

        .sd-breadcrumb {
          display: flex;
          gap: 8px;
          align-items: center;
          margin-bottom: 23px;
          font-size: 12px;
          color: #8994a6;
        }

        .sd-breadcrumb strong {
          color: #4d5a71;
          font-weight: 650;
        }

        .sd-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 25px;
        }

        .sd-title-wrap {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .sd-title-icon {
          display: grid;
          place-items: center;
          flex-shrink: 0;
          width: 49px;
          height: 49px;
          color: #315fea;
          background: #e9efff;
          border: 1px solid #dbe5ff;
          border-radius: 15px;
        }

        .sd-header h1 {
          margin: 0;
          font-size: 27px;
          letter-spacing: -0.8px;
          font-weight: 760;
        }

        .sd-subtitle {
          max-width: 670px;
          margin: 8px 0 0;
          color: #7e899d;
          font-size: 13px;
          line-height: 1.6;
        }

        .sd-header-actions {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 9px;
        }

        .sd-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 39px;
          padding: 0 13px;
          color: #43516a;
          background: #fff;
          border: 1px solid #dfe5ef;
          border-radius: 9px;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
          transition: 0.15s ease;
        }

        .sd-btn:hover {
          background: #f8faff;
          border-color: #b9c9f5;
        }

        .sd-btn-primary {
          color: #fff;
          background: #315fea;
          border-color: #315fea;
        }

        .sd-btn-primary:hover {
          color: #fff;
          background: #254ecf;
          border-color: #254ecf;
        }

        .sd-btn-danger {
          color: #c23e4d;
          background: #fff;
          border-color: #f0cdd1;
        }

        .sd-btn-danger:hover {
          background: #fff4f5;
          border-color: #e9aeb6;
        }

        .sd-metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 15px;
          margin-bottom: 22px;
        }

        .sd-metric {
          padding: 18px;
          background: #fff;
          border: 1px solid #e6ebf3;
          border-radius: 14px;
          box-shadow: 0 2px 6px #22314b04;
        }

        .sd-metric-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .sd-metric-icon {
          display: grid;
          place-items: center;
          width: 35px;
          height: 35px;
          border-radius: 10px;
        }

        .sd-blue {
          color: #315fea;
          background: #edf2ff;
        }

        .sd-green {
          color: #14835b;
          background: #e7f8ef;
        }

        .sd-purple {
          color: #7855cf;
          background: #f0eaff;
        }

        .sd-amber {
          color: #b77912;
          background: #fff4dc;
        }

        .sd-metric-caption {
          color: #8994a6;
          font-size: 10px;
          text-align: right;
        }

        .sd-metric-value {
          margin-top: 17px;
          color: #202c43;
          font-size: 29px;
          letter-spacing: -0.7px;
          font-weight: 760;
        }

        .sd-metric-label {
          margin-top: 4px;
          color: #7f8ba0;
          font-size: 11px;
        }

        .sd-notice {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 15px 17px;
          margin-bottom: 22px;
          color: #805b19;
          background: #fffbf2;
          border: 1px solid #f2dfb9;
          border-radius: 12px;
        }

        .sd-notice svg {
          flex-shrink: 0;
          margin-top: 1px;
        }

        .sd-notice strong {
          display: block;
          margin-bottom: 4px;
          font-size: 12px;
        }

        .sd-notice p {
          margin: 0;
          color: #937743;
          font-size: 11px;
          line-height: 1.55;
        }

        .sd-card {
          overflow: hidden;
          background: #fff;
          border: 1px solid #e5eaf2;
          border-radius: 15px;
          box-shadow: 0 2px 7px #1e2b4404;
        }

        .sd-card-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 15px;
          padding: 20px 22px 17px;
          border-bottom: 1px solid #edf0f6;
        }

        .sd-card-heading h2 {
          margin: 0;
          color: #202c43;
          font-size: 15px;
          letter-spacing: -0.2px;
        }

        .sd-card-heading p {
          margin: 6px 0 0;
          color: #8994a6;
          font-size: 11px;
          line-height: 1.5;
        }

        .sd-count {
          padding: 5px 9px;
          color: #68758c;
          background: #f4f6fa;
          border: 1px solid #e8ecf3;
          border-radius: 7px;
          font-size: 10px;
          font-weight: 700;
          white-space: nowrap;
        }

        .sd-tabs {
          display: flex;
          gap: 23px;
          padding: 0 22px;
          border-bottom: 1px solid #edf0f6;
        }

        .sd-tab {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 16px 1px 14px;
          color: #8390a5;
          background: transparent;
          border: 0;
          font-size: 11px;
          font-weight: 700;
        }

        .sd-tab.active {
          color: #315fea;
        }

        .sd-tab.active::after {
          position: absolute;
          right: 0;
          bottom: -1px;
          left: 0;
          height: 2px;
          content: "";
          background: #315fea;
          border-radius: 2px 2px 0 0;
        }

        .sd-tab-count {
          padding: 3px 6px;
          color: #6e7b91;
          background: #f0f3f8;
          border-radius: 5px;
          font-size: 9px;
        }

        .sd-tab.active .sd-tab-count {
          color: #315fea;
          background: #eaf0ff;
        }

        .sd-toolbar {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          padding: 15px 22px;
          border-bottom: 1px solid #edf0f6;
        }

        .sd-search {
          position: relative;
          flex: 1;
          min-width: 210px;
          max-width: 430px;
        }

        .sd-search svg {
          position: absolute;
          top: 50%;
          left: 12px;
          color: #929eb1;
          transform: translateY(-50%);
        }

        .sd-search input {
          width: 100%;
          height: 38px;
          padding: 0 12px 0 37px;
          color: #34415a;
          background: #fff;
          border: 1px solid #dfe5ef;
          border-radius: 9px;
          outline: none;
          font-size: 11px;
        }

        .sd-search input:focus,
        .sd-select:focus {
          border-color: #8ba4f7;
          box-shadow: 0 0 0 3px #315fea12;
        }

        .sd-select {
          height: 38px;
          min-width: 140px;
          padding: 0 27px 0 10px;
          color: #4b5870;
          background: white;
          border: 1px solid #dfe5ef;
          border-radius: 9px;
          outline: none;
          font-size: 11px;
        }

        .sd-table-wrap {
          width: 100%;
          overflow-x: auto;
        }

        .sd-table {
          width: 100%;
          min-width: 900px;
          border-collapse: collapse;
        }

        .sd-table th {
          padding: 13px 17px;
          color: #8b96a9;
          background: #fafbfe;
          border-bottom: 1px solid #edf0f6;
          text-align: left;
          text-transform: uppercase;
          letter-spacing: 0.45px;
          font-size: 9px;
          font-weight: 750;
          white-space: nowrap;
        }

        .sd-table td {
          padding: 15px 17px;
          color: #4b5870;
          border-bottom: 1px solid #f0f2f7;
          vertical-align: middle;
          font-size: 11px;
        }

        .sd-table tbody tr:last-child td {
          border-bottom: 0;
        }

        .sd-table tbody tr:hover {
          background: #fafbff;
        }

        .sd-device-cell {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          min-width: 210px;
        }

        .sd-device-icon {
          display: grid;
          place-items: center;
          flex-shrink: 0;
          width: 37px;
          height: 37px;
          color: #4266d9;
          background: #edf2ff;
          border-radius: 10px;
        }

        .sd-device-name {
          display: flex;
          align-items: center;
          gap: 7px;
          margin: 1px 0 5px;
          color: #29364e;
          font-size: 11px;
          font-weight: 750;
        }

        .sd-device-sub {
          color: #8994a6;
          font-size: 10px;
          line-height: 1.5;
        }

        .sd-code {
          color: #8490a4;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 10px;
        }

        .sd-location {
          display: flex;
          align-items: flex-start;
          gap: 5px;
          min-width: 125px;
          color: #67748b;
          font-size: 10px;
          line-height: 1.5;
        }

        .sd-location svg {
          flex-shrink: 0;
          margin-top: 1px;
          color: #97a2b4;
        }

        .sd-time {
          min-width: 110px;
          color: #7f8ba0;
          font-size: 10px;
          line-height: 1.5;
        }

        .sd-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 8px;
          border-radius: 6px;
          font-size: 9px;
          font-weight: 700;
          white-space: nowrap;
        }

        .sd-badge-current,
        .sd-badge-trusted {
          color: #16845c;
          background: #e8f8f0;
        }

        .sd-badge-active {
          color: #315fea;
          background: #edf2ff;
        }

        .sd-badge-idle {
          color: #9a6b16;
          background: #fff4dc;
        }

        .sd-badge-untrusted {
          color: #a75a36;
          background: #fff0e8;
        }

        .sd-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        .sd-actions {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .sd-icon-btn {
          display: inline-grid;
          place-items: center;
          width: 30px;
          height: 30px;
          color: #8591a5;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 8px;
        }

        .sd-icon-btn:hover {
          color: #315fea;
          background: #edf2ff;
          border-color: #dfe7ff;
        }

        .sd-icon-btn.danger:hover {
          color: #c23e4d;
          background: #fff0f1;
          border-color: #f4d6da;
        }

        .sd-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 14px 22px;
          color: #8994a6;
          border-top: 1px solid #edf0f6;
          font-size: 10px;
        }

        .sd-empty {
          padding: 50px 20px;
          color: #8792a5;
          text-align: center;
        }

        .sd-empty svg {
          margin-bottom: 10px;
          color: #9eabc0;
        }

        .sd-empty h3 {
          margin: 0 0 7px;
          color: #34415a;
          font-size: 13px;
        }

        .sd-empty p {
          margin: 0;
          font-size: 11px;
        }

        .sd-bottom-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(280px, 0.9fr);
          gap: 18px;
          margin-top: 20px;
        }

        .sd-activity {
          padding: 4px 22px 10px;
        }

        .sd-activity-item {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          padding: 15px 0;
          border-bottom: 1px solid #f0f2f7;
        }

        .sd-activity-item:last-child {
          border-bottom: 0;
        }

        .sd-activity-icon {
          display: grid;
          place-items: center;
          flex-shrink: 0;
          width: 32px;
          height: 32px;
          color: #496add;
          background: #edf2ff;
          border-radius: 9px;
        }

        .sd-activity-copy {
          flex: 1;
        }

        .sd-activity-copy strong {
          display: block;
          margin-bottom: 4px;
          color: #34415a;
          font-size: 11px;
        }

        .sd-activity-copy p {
          margin: 0;
          color: #8792a5;
          font-size: 10px;
          line-height: 1.5;
        }

        .sd-activity-time {
          color: #9aa4b4;
          font-size: 9px;
          white-space: nowrap;
        }

        .sd-security-content {
          padding: 20px 22px;
        }

        .sd-security-row {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          padding: 13px 0;
          border-bottom: 1px solid #f0f2f7;
        }

        .sd-security-row:last-child {
          border-bottom: 0;
        }

        .sd-security-row svg {
          flex-shrink: 0;
          color: #16845c;
        }

        .sd-security-row strong {
          display: block;
          margin-bottom: 4px;
          color: #34415a;
          font-size: 11px;
        }

        .sd-security-row p {
          margin: 0;
          color: #8792a5;
          font-size: 10px;
          line-height: 1.5;
        }

        .sd-small-note {
          margin-top: 16px;
          padding: 12px;
          color: #6e7da0;
          background: #f5f8ff;
          border: 1px solid #e7edff;
          border-radius: 10px;
          font-size: 10px;
          line-height: 1.55;
        }

        .sd-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: #111b31a3;
          backdrop-filter: blur(3px);
        }

        .sd-modal {
          width: min(450px, 100%);
          overflow: hidden;
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 70px #101a3030;
        }

        .sd-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          padding: 20px 22px;
          border-bottom: 1px solid #edf0f6;
        }

        .sd-modal-header h2 {
          margin: 0;
          color: #202c43;
          font-size: 16px;
        }

        .sd-modal-header p {
          margin: 7px 0 0;
          color: #8792a5;
          font-size: 11px;
          line-height: 1.55;
        }

        .sd-close {
          display: grid;
          place-items: center;
          flex-shrink: 0;
          width: 31px;
          height: 31px;
          color: #7c879a;
          background: white;
          border: 1px solid #e7ebf3;
          border-radius: 8px;
        }

        .sd-modal-body {
          padding: 22px;
          color: #69768c;
          font-size: 12px;
          line-height: 1.65;
        }

        .sd-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 9px;
          padding: 15px 22px;
          background: #fbfcfe;
          border-top: 1px solid #edf0f6;
        }

        .sd-detail-panel {
          position: fixed;
          inset: 0 0 0 auto;
          z-index: 120;
          width: min(460px, 100%);
          height: 100vh;
          overflow-y: auto;
          background: white;
          border-left: 1px solid #e5eaf2;
          box-shadow: -15px 0 55px #13203a1a;
        }

        .sd-detail-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          padding: 22px;
          border-bottom: 1px solid #edf0f6;
        }

        .sd-detail-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .sd-detail-title h2 {
          margin: 0;
          color: #202c43;
          font-size: 16px;
        }

        .sd-detail-title p {
          margin: 5px 0 0;
          color: #8792a5;
          font-size: 10px;
        }

        .sd-detail-body {
          padding: 22px;
        }

        .sd-detail-body h3 {
          margin: 24px 0 12px;
          color: #34415a;
          font-size: 12px;
        }

        .sd-detail-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 20px;
        }

        .sd-detail-info div {
          padding: 12px;
          background: #fbfcfe;
          border: 1px solid #e9edf4;
          border-radius: 9px;
          overflow-wrap: anywhere;
        }

        .sd-detail-info span {
          display: block;
          margin-bottom: 6px;
          color: #8b96a9;
          font-size: 10px;
        }

        .sd-detail-info strong {
          color: #34415a;
          font-size: 11px;
        }

        .sd-detail-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
          margin-top: 22px;
        }

        .sd-toast {
          position: fixed;
          right: 24px;
          bottom: 24px;
          z-index: 200;
          display: flex;
          align-items: center;
          gap: 10px;
          max-width: calc(100% - 32px);
          padding: 13px 16px;
          color: white;
          background: #17253e;
          border-radius: 11px;
          box-shadow: 0 10px 35px #17253e30;
          font-size: 12px;
        }

        .sd-page-note {
          margin-top: 18px;
          color: #9aa4b4;
          font-size: 10px;
          line-height: 1.6;
          text-align: center;
        }

        @media (max-width: 1050px) {
          .sd-page {
            padding: 22px;
          }

          .sd-header {
            flex-direction: column;
          }

          .sd-metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .sd-bottom-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .sd-page {
            padding: 14px;
          }

          .sd-header h1 {
            font-size: 22px;
          }

          .sd-title-icon {
            width: 42px;
            height: 42px;
          }

          .sd-header-actions {
            width: 100%;
          }

          .sd-header-actions .sd-btn {
            flex: 1;
          }

          .sd-metrics {
            gap: 10px;
          }

          .sd-metric {
            padding: 14px;
          }

          .sd-metric-value {
            margin-top: 13px;
            font-size: 25px;
          }

          .sd-metric-caption {
            font-size: 9px;
          }

          .sd-card-heading {
            padding: 17px;
          }

          .sd-tabs {
            gap: 15px;
            padding: 0 16px;
          }

          .sd-toolbar {
            padding: 14px;
          }

          .sd-search {
            flex-basis: 100%;
            max-width: none;
          }

          .sd-select {
            flex: 1;
            min-width: 0;
          }

          .sd-footer {
            align-items: flex-start;
            flex-direction: column;
            padding: 14px 17px;
          }

          .sd-activity-time {
            display: none;
          }
        }
      `}</style>

      <div className="sd-container">
        <div className="sd-breadcrumb">
          <span>ModelNow</span>
          <span>/</span>
          <span>Security</span>
          <span>/</span>
          <strong>Sessions &amp; Devices</strong>
        </div>

        <header className="sd-header">
          <div className="sd-title-wrap">
            <div className="sd-title-icon">
              <ShieldCheck size={25} />
            </div>
            <div>
              <h1>Sessions &amp; Devices</h1>
              <p className="sd-subtitle">
                Monitor signed-in sessions, review trusted devices, and manage
                access to your ModelNow account.
              </p>
            </div>
          </div>

          <div className="sd-header-actions">
            <button className="sd-btn" onClick={exportSessions}>
              <Download size={14} />
              Export sessions
            </button>
            <button
              className="sd-btn"
              onClick={() => notify("Demo session list refreshed.")}
            >
              <RefreshCw size={14} />
              Refresh
            </button>
            <button
              className="sd-btn sd-btn-primary"
              onClick={() => setConfirmAction({ type: "all" })}
            >
              <LogOut size={14} />
              Sign out other sessions
            </button>
          </div>
        </header>

        <section className="sd-metrics">
          <div className="sd-metric">
            <div className="sd-metric-top">
              <span className="sd-metric-icon sd-blue">
                <Activity size={18} />
              </span>
              <span className="sd-metric-caption">Across devices</span>
            </div>
            <div className="sd-metric-value">{sessions.length}</div>
            <div className="sd-metric-label">Total sessions</div>
          </div>

          <div className="sd-metric">
            <div className="sd-metric-top">
              <span className="sd-metric-icon sd-green">
                <CheckCircle2 size={18} />
              </span>
              <span className="sd-metric-caption">Current activity</span>
            </div>
            <div className="sd-metric-value">{activeCount}</div>
            <div className="sd-metric-label">Active sessions</div>
          </div>

          <div className="sd-metric">
            <div className="sd-metric-top">
              <span className="sd-metric-icon sd-purple">
                <Fingerprint size={18} />
              </span>
              <span className="sd-metric-caption">Approved devices</span>
            </div>
            <div className="sd-metric-value">{trustedCount}</div>
            <div className="sd-metric-label">Trusted devices</div>
          </div>

          <div className="sd-metric">
            <div className="sd-metric-top">
              <span className="sd-metric-icon sd-amber">
                <Clock3 size={18} />
              </span>
              <span className="sd-metric-caption">Inactive</span>
            </div>
            <div className="sd-metric-value">{idleCount}</div>
            <div className="sd-metric-label">Idle sessions</div>
          </div>
        </section>

        {sessions.some((session) => !session.current && !session.trusted) && (
          <div className="sd-notice">
            <AlertTriangle size={19} />
            <div>
              <strong>Review sessions from untrusted devices</strong>
              <p>
                One or more sessions are not associated with a trusted device.
                Review their details and terminate any session you do not recognize.
              </p>
            </div>
          </div>
        )}

        <section className="sd-card">
          <div className="sd-card-heading">
            <div>
              <h2>Access management</h2>
              <p>View current sign-ins and the devices associated with your account.</p>
            </div>
            <span className="sd-count">
              {activeTab === "sessions"
                ? `${sessions.length} sessions`
                : `${devices.length} devices`}
            </span>
          </div>

          <div className="sd-tabs">
            <button
              className={`sd-tab ${activeTab === "sessions" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("sessions");
                setSearch("");
              }}
            >
              <Activity size={15} />
              Active sessions
              <span className="sd-tab-count">{sessions.length}</span>
            </button>

            <button
              className={`sd-tab ${activeTab === "devices" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("devices");
                setSearch("");
              }}
            >
              <Monitor size={15} />
              Trusted devices
              <span className="sd-tab-count">{devices.length}</span>
            </button>
          </div>

          <div className="sd-toolbar">
            <div className="sd-search">
              <Search size={15} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={
                  activeTab === "sessions"
                    ? "Search sessions, devices, locations..."
                    : "Search devices, browsers, locations..."
                }
                aria-label="Search sessions and devices"
              />
            </div>

            {activeTab === "sessions" && (
              <select
                className="sd-select"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label="Filter sessions by status"
              >
                <option>All sessions</option>
                <option>Current session</option>
                <option>Active</option>
                <option>Idle</option>
              </select>
            )}

            <button
              className="sd-btn"
              onClick={() => {
                setSearch("");
                setStatusFilter("All sessions");
              }}
            >
              Reset filters
            </button>
          </div>

          {activeTab === "sessions" ? (
            filteredSessions.length === 0 ? (
              <div className="sd-empty">
                <Search size={25} />
                <h3>No sessions found</h3>
                <p>Try a different search term or status filter.</p>
              </div>
            ) : (
              <div className="sd-table-wrap">
                <table className="sd-table">
                  <thead>
                    <tr>
                      <th>Device</th>
                      <th>Location</th>
                      <th>Last active</th>
                      <th>Status</th>
                      <th>Trusted</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSessions.map((session) => (
                      <tr key={session.id}>
                        <td>
                          <div className="sd-device-cell">
                            <div className="sd-device-icon">
                              {deviceIcon(session.type, 19)}
                            </div>
                            <div>
                              <div className="sd-device-name">
                                {session.device}
                                {session.current && (
                                  <span className="sd-badge sd-badge-current">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="sd-device-sub">
                                {session.browser} · {session.os}
                              </div>
                              <div className="sd-code" style={{ marginTop: 4 }}>
                                {session.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="sd-location">
                            <MapPin size={13} />
                            <span>
                              {session.location}
                              <br />
                              {session.ip}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="sd-time">
                            <div>{session.lastActive}</div>
                            <div style={{ marginTop: 3, color: "#9aa4b4" }}>
                              Started {session.started}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`sd-badge ${
                              session.current
                                ? "sd-badge-current"
                                : session.status === "Idle"
                                ? "sd-badge-idle"
                                : "sd-badge-active"
                            }`}
                          >
                            <span className="sd-dot" />
                            {session.status}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`sd-badge ${
                              session.trusted
                                ? "sd-badge-trusted"
                                : "sd-badge-untrusted"
                            }`}
                          >
                            {session.trusted ? "Trusted" : "Untrusted"}
                          </span>
                        </td>
                        <td>
                          <div className="sd-actions">
                            <button
                              className="sd-icon-btn"
                              title="View session details"
                              aria-label={`View ${session.device} session`}
                              onClick={() => setSelectedSession(session)}
                            >
                              <Eye size={15} />
                            </button>
                            {!session.current && (
                              <button
                                className="sd-icon-btn danger"
                                title="Terminate session"
                                aria-label={`Terminate ${session.device} session`}
                                onClick={() =>
                                  setConfirmAction({
                                    type: "session",
                                    id: session.id,
                                  })
                                }
                              >
                                <LogOut size={15} />
                              </button>
                            )}
                            <button
                              className="sd-icon-btn"
                              title="More details"
                              aria-label={`More details for ${session.device}`}
                              onClick={() => setSelectedSession(session)}
                            >
                              <MoreHorizontal size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : filteredDevices.length === 0 ? (
            <div className="sd-empty">
              <Search size={25} />
              <h3>No devices found</h3>
              <p>Try a different search term.</p>
            </div>
          ) : (
            <div className="sd-table-wrap">
              <table className="sd-table">
                <thead>
                  <tr>
                    <th>Device</th>
                    <th>Location</th>
                    <th>Last seen</th>
                    <th>Trust status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDevices.map((device) => (
                    <tr key={device.id}>
                      <td>
                        <div className="sd-device-cell">
                          <div className="sd-device-icon">
                            {deviceIcon(device.type, 19)}
                          </div>
                          <div>
                            <div className="sd-device-name">{device.name}</div>
                            <div className="sd-device-sub">
                              {device.browser} · {device.os}
                            </div>
                            <div className="sd-code" style={{ marginTop: 4 }}>
                              {device.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="sd-location">
                          <MapPin size={13} />
                          {device.location}
                        </div>
                      </td>
                      <td>
                        <div className="sd-time">
                          <div>{device.lastSeen}</div>
                          <div style={{ marginTop: 3, color: "#9aa4b4" }}>
                            Trusted since {device.trustedSince}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`sd-badge ${
                            device.trusted
                              ? "sd-badge-trusted"
                              : "sd-badge-untrusted"
                          }`}
                        >
                          <span className="sd-dot" />
                          {device.trusted ? "Trusted" : "Not trusted"}
                        </span>
                      </td>
                      <td>
                        <div className="sd-actions">
                          <button
                            className="sd-icon-btn"
                            title="View device details"
                            aria-label={`View ${device.name}`}
                            onClick={() => setSelectedDevice(device)}
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            className="sd-icon-btn danger"
                            title="Remove device"
                            aria-label={`Remove ${device.name}`}
                            onClick={() =>
                              setConfirmAction({
                                type: "device",
                                id: device.id,
                              })
                            }
                          >
                            <Trash2 size={15} />
                          </button>
                          <button
                            className="sd-icon-btn"
                            title="More details"
                            aria-label={`More details for ${device.name}`}
                            onClick={() => setSelectedDevice(device)}
                          >
                            <MoreHorizontal size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="sd-footer">
            <span>
              {activeTab === "sessions"
                ? `Showing ${filteredSessions.length} of ${sessions.length} sessions`
                : `Showing ${filteredDevices.length} of ${devices.length} devices`}
            </span>
            <span>Demo data · Changes are not saved to a server</span>
          </div>
        </section>

        <div className="sd-bottom-grid">
          <section className="sd-card">
            <div className="sd-card-heading">
              <div>
                <h2>Recent access activity</h2>
                <p>Example account activity for this workspace.</p>
              </div>
              <Activity size={17} color="#8491a7" />
            </div>

            <div className="sd-activity">
              <div className="sd-activity-item">
                <div className="sd-activity-icon">
                  <CheckCircle2 size={15} />
                </div>
                <div className="sd-activity-copy">
                  <strong>Current session active</strong>
                  <p>
                    The current browser session is marked as the account's
                    primary session in this demo.
                  </p>
                </div>
                <span className="sd-activity-time">Now</span>
              </div>

              <div className="sd-activity-item">
                <div className="sd-activity-icon">
                  <Smartphone size={15} />
                </div>
                <div className="sd-activity-copy">
                  <strong>Mobile device activity</strong>
                  <p>
                    A sample mobile session is listed as active.
                  </p>
                </div>
                <span className="sd-activity-time">35m ago</span>
              </div>

              <div className="sd-activity-item">
                <div className="sd-activity-icon">
                  <ShieldAlert size={15} />
                </div>
                <div className="sd-activity-copy">
                  <strong>Untrusted session requires review</strong>
                  <p>
                    Review the listed device before trusting it.
                  </p>
                </div>
                <span className="sd-activity-time">2h ago</span>
              </div>
            </div>
          </section>

          <section className="sd-card">
            <div className="sd-card-heading">
              <div>
                <h2>Account security</h2>
                <p>Recommended controls for session protection.</p>
              </div>
              <LockKeyhole size={17} color="#8491a7" />
            </div>

            <div className="sd-security-content">
              <div className="sd-security-row">
                <CheckCircle2 size={17} />
                <div>
                  <strong>Session inventory available</strong>
                  <p>Sessions can be reviewed in the current interface.</p>
                </div>
              </div>

              <div className="sd-security-row">
                <CheckCircle2 size={17} />
                <div>
                  <strong>Trusted device management</strong>
                  <p>Review which devices are marked as trusted.</p>
                </div>
              </div>

              <div className="sd-security-row">
                <CircleHelp size={17} />
                <div>
                  <strong>Multi-factor authentication</strong>
                  <p>
                    Configure MFA in your account authentication settings when
                    the backend integration is available.
                  </p>
                </div>
              </div>

              <button
                className="sd-btn"
                style={{ width: "100%", marginTop: 12 }}
                onClick={() => setShowHelp(true)}
              >
                <CircleHelp size={14} />
                About sessions and devices
              </button>
            </div>
          </section>
        </div>

        <p className="sd-page-note">
          ModelNow Sessions &amp; Devices · Prototype interface. Sample locations,
          IP addresses, and session timestamps are illustrative, not verified
          account telemetry.
        </p>
      </div>

      {selectedSession && (
        <>
          <div
            onClick={() => setSelectedSession(null)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 115,
              background: "#111b3150",
            }}
          />
          <aside className="sd-detail-panel" role="dialog" aria-modal="true">
            <div className="sd-detail-header">
              <div className="sd-detail-title">
                <div className="sd-device-icon">
                  {deviceIcon(selectedSession.type, 21)}
                </div>
                <div>
                  <h2>{selectedSession.device}</h2>
                  <p>{selectedSession.id}</p>
                </div>
              </div>
              <button
                className="sd-close"
                onClick={() => setSelectedSession(null)}
                aria-label="Close session details"
              >
                <X size={17} />
              </button>
            </div>

            <div className="sd-detail-body">
              <span
                className={`sd-badge ${
                  selectedSession.current
                    ? "sd-badge-current"
                    : selectedSession.status === "Idle"
                    ? "sd-badge-idle"
                    : "sd-badge-active"
                }`}
              >
                <span className="sd-dot" />
                {selectedSession.status}
              </span>

              <div className="sd-detail-info">
                <div>
                  <span>Browser</span>
                  <strong>{selectedSession.browser}</strong>
                </div>
                <div>
                  <span>Operating system</span>
                  <strong>{selectedSession.os}</strong>
                </div>
                <div>
                  <span>Location</span>
                  <strong>{selectedSession.location}</strong>
                </div>
                <div>
                  <span>IP address</span>
                  <strong>{selectedSession.ip}</strong>
                </div>
                <div>
                  <span>Last active</span>
                  <strong>{selectedSession.lastActive}</strong>
                </div>
                <div>
                  <span>Started</span>
                  <strong>{selectedSession.started}</strong>
                </div>
                <div>
                  <span>Trusted device</span>
                  <strong>{selectedSession.trusted ? "Yes" : "No"}</strong>
                </div>
                <div>
                  <span>Session ID</span>
                  <strong>{selectedSession.id}</strong>
                </div>
              </div>

              <h3>Session security</h3>
              <div className="sd-security-row">
                {selectedSession.trusted ? (
                  <CheckCircle2 size={17} />
                ) : (
                  <AlertTriangle size={17} color="#b77912" />
                )}
                <div>
                  <strong>
                    {selectedSession.trusted
                      ? "Device marked as trusted"
                      : "Device is not trusted"}
                  </strong>
                  <p>
                    {selectedSession.trusted
                      ? "This is the current trust state in the demo."
                      : "Review this device and terminate the session if you do not recognize it."}
                  </p>
                </div>
              </div>

              {!selectedSession.current && (
                <div className="sd-detail-actions">
                  <button
                    className="sd-btn sd-btn-danger"
                    onClick={() =>
                      setConfirmAction({
                        type: "session",
                        id: selectedSession.id,
                      })
                    }
                  >
                    <LogOut size={14} />
                    Terminate session
                  </button>
                </div>
              )}
            </div>
          </aside>
        </>
      )}

      {selectedDevice && (
        <>
          <div
            onClick={() => setSelectedDevice(null)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 115,
              background: "#111b3150",
            }}
          />
          <aside className="sd-detail-panel" role="dialog" aria-modal="true">
            <div className="sd-detail-header">
              <div className="sd-detail-title">
                <div className="sd-device-icon">
                  {deviceIcon(selectedDevice.type, 21)}
                </div>
                <div>
                  <h2>{selectedDevice.name}</h2>
                  <p>{selectedDevice.id}</p>
                </div>
              </div>
              <button
                className="sd-close"
                onClick={() => setSelectedDevice(null)}
                aria-label="Close device details"
              >
                <X size={17} />
              </button>
            </div>

            <div className="sd-detail-body">
              <span
                className={`sd-badge ${
                  selectedDevice.trusted
                    ? "sd-badge-trusted"
                    : "sd-badge-untrusted"
                }`}
              >
                <span className="sd-dot" />
                {selectedDevice.trusted ? "Trusted device" : "Not trusted"}
              </span>

              <div className="sd-detail-info">
                <div>
                  <span>Browser</span>
                  <strong>{selectedDevice.browser}</strong>
                </div>
                <div>
                  <span>Operating system</span>
                  <strong>{selectedDevice.os}</strong>
                </div>
                <div>
                  <span>Location</span>
                  <strong>{selectedDevice.location}</strong>
                </div>
                <div>
                  <span>Last seen</span>
                  <strong>{selectedDevice.lastSeen}</strong>
                </div>
                <div>
                  <span>Trusted since</span>
                  <strong>{selectedDevice.trustedSince}</strong>
                </div>
                <div>
                  <span>Device ID</span>
                  <strong>{selectedDevice.id}</strong>
                </div>
              </div>

              <h3>Device management</h3>
              <div className="sd-security-row">
                <Fingerprint size={17} />
                <div>
                  <strong>
                    {selectedDevice.trusted
                      ? "This device is trusted"
                      : "This device is not trusted"}
                  </strong>
                  <p>
                    Changing this setting only updates the current demo state.
                    A production app should validate device identity on the server.
                  </p>
                </div>
              </div>

              <div className="sd-detail-actions">
                <button
                  className="sd-btn sd-btn-primary"
                  onClick={() => toggleTrust(selectedDevice.id)}
                >
                  <ShieldCheck size={14} />
                  {selectedDevice.trusted ? "Remove trust" : "Mark as trusted"}
                </button>
                <button
                  className="sd-btn sd-btn-danger"
                  onClick={() =>
                    setConfirmAction({
                      type: "device",
                      id: selectedDevice.id,
                    })
                  }
                >
                  <Trash2 size={14} />
                  Remove device
                </button>
              </div>
            </div>
          </aside>
        </>
      )}

      {confirmAction && (
        <div
          className="sd-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setConfirmAction(null);
          }}
        >
          <div className="sd-modal" role="dialog" aria-modal="true">
            <div className="sd-modal-header">
              <div>
                <h2>
                  {confirmAction.type === "all"
                    ? "Sign out other sessions?"
                    : confirmAction.type === "device"
                    ? "Remove trusted device?"
                    : "Terminate this session?"}
                </h2>
                <p>
                  {confirmAction.type === "all"
                    ? "Other sessions will be removed from the local demo list. Your current session will remain."
                    : confirmAction.type === "device"
                    ? "This device will be removed from the demo trusted-device list."
                    : "This session will be removed from the demo session list."}
                </p>
              </div>
              <button
                className="sd-close"
                onClick={() => setConfirmAction(null)}
                aria-label="Close confirmation"
              >
                <X size={17} />
              </button>
            </div>

            <div className="sd-modal-body">
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <AlertTriangle size={19} color="#b77912" />
                <span>
                  This is a frontend-only action. It does not revoke real
                  authentication tokens, cookies, or server sessions.
                </span>
              </div>
            </div>

            <div className="sd-modal-footer">
              <button
                className="sd-btn"
                onClick={() => setConfirmAction(null)}
              >
                Cancel
              </button>
              <button
                className="sd-btn sd-btn-danger"
                onClick={() => {
                  if (confirmAction.type === "all") {
                    terminateAllSessions();
                  } else if (confirmAction.type === "session") {
                    terminateSession(confirmAction.id);
                  } else {
                    removeTrustedDevice(confirmAction.id);
                  }
                }}
              >
                {confirmAction.type === "all"
                  ? "Sign out others"
                  : confirmAction.type === "device"
                  ? "Remove device"
                  : "Terminate session"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showHelp && (
        <div
          className="sd-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowHelp(false);
          }}
        >
          <div className="sd-modal" role="dialog" aria-modal="true">
            <div className="sd-modal-header">
              <div>
                <h2>Sessions &amp; devices</h2>
                <p>Understand the controls on this page.</p>
              </div>
              <button
                className="sd-close"
                onClick={() => setShowHelp(false)}
                aria-label="Close help"
              >
                <X size={17} />
              </button>
            </div>

            <div className="sd-modal-body">
              <p>
                <strong>Active sessions:</strong> Browsers and devices currently
                signed in to your account.
              </p>
              <p>
                <strong>Trusted devices:</strong> Devices your account recognizes
                as approved. A production system should verify device trust on
                the server.
              </p>
              <p>
                <strong>Terminate session:</strong> In a production application,
                this should revoke the server-side session and invalidate its
                refresh token.
              </p>
              <p>
                <strong>Security tip:</strong> If you see a device you do not
                recognize, terminate its session and review your password and
                multi-factor authentication settings.
              </p>
            </div>

            <div className="sd-modal-footer">
              <button
                className="sd-btn sd-btn-primary"
                onClick={() => setShowHelp(false)}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {notice && (
        <div className="sd-toast" role="status">
          <CheckCircle2 size={17} color="#73e0ac" />
          {notice}
        </div>
      )}
    </main>
  );
}
