"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownToLine,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  ExternalLink,
  FileCheck2,
  FileText,
  Filter,
  Globe2,
  Plus,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from "lucide-react";

type RiskLevel = "Low" | "Medium" | "High" | "Critical";
type VendorStatus =
  | "Active"
  | "Under Review"
  | "Pending Approval"
  | "Suspended";

type Vendor = {
  id: string;
  name: string;
  category: string;
  service: string;
  owner: string;
  email: string;
  region: string;
  risk: RiskLevel;
  status: VendorStatus;
  assessment: string;
  nextReview: string;
  lastReview: string;
  dataAccess: string;
  contractEnd: string;
  certifications: string[];
  notes: string;
};

const initialVendors: Vendor[] = [
  {
    id: "VEN-001",
    name: "CloudScale Infrastructure",
    category: "Cloud Infrastructure",
    service: "Cloud hosting and compute",
    owner: "Platform Engineering",
    email: "vendor@example.com",
    region: "United States",
    risk: "High",
    status: "Active",
    assessment: "Completed",
    nextReview: "2026-11-20",
    lastReview: "2026-08-20",
    dataAccess: "Confidential",
    contractEnd: "2027-08-31",
    certifications: ["SOC 2", "ISO 27001"],
    notes: "Infrastructure provider requiring periodic security review.",
  },
  {
    id: "VEN-002",
    name: "DataBridge Analytics",
    category: "Data Processing",
    service: "Analytics and data transformation",
    owner: "Data Platform",
    email: "vendor@example.com",
    region: "India",
    risk: "Critical",
    status: "Under Review",
    assessment: "In Progress",
    nextReview: "2026-11-10",
    lastReview: "2026-05-15",
    dataAccess: "Restricted",
    contractEnd: "2027-02-28",
    certifications: ["ISO 27001"],
    notes: "Enhanced review required because of sensitive data processing.",
  },
  {
    id: "VEN-003",
    name: "ModelWorks AI",
    category: "AI Model Provider",
    service: "Foundation model API",
    owner: "AI Platform",
    email: "vendor@example.com",
    region: "United States",
    risk: "High",
    status: "Pending Approval",
    assessment: "In Progress",
    nextReview: "2026-11-14",
    lastReview: "2026-09-14",
    dataAccess: "Confidential",
    contractEnd: "2027-09-30",
    certifications: ["SOC 2"],
    notes: "Model evaluation and data-retention documentation need review.",
  },
  {
    id: "VEN-004",
    name: "SecureOps Systems",
    category: "Security Services",
    service: "Security monitoring",
    owner: "Security Operations",
    email: "vendor@example.com",
    region: "United Kingdom",
    risk: "Medium",
    status: "Active",
    assessment: "Completed",
    nextReview: "2027-01-15",
    lastReview: "2026-07-15",
    dataAccess: "Internal",
    contractEnd: "2027-12-31",
    certifications: ["SOC 2", "ISO 27001"],
    notes: "Security monitoring partner with established review history.",
  },
  {
    id: "VEN-005",
    name: "PeopleFirst HR",
    category: "HR Technology",
    service: "Recruitment and workforce tools",
    owner: "Human Resources",
    email: "vendor@example.com",
    region: "India",
    risk: "Medium",
    status: "Under Review",
    assessment: "In Progress",
    nextReview: "2026-11-08",
    lastReview: "2026-04-08",
    dataAccess: "Confidential",
    contractEnd: "2027-04-30",
    certifications: [],
    notes: "Review access to employee and candidate information.",
  },
  {
    id: "VEN-006",
    name: "Workflow Orbit",
    category: "Business Software",
    service: "Workflow automation",
    owner: "Business Operations",
    email: "vendor@example.com",
    region: "Singapore",
    risk: "Low",
    status: "Active",
    assessment: "Completed",
    nextReview: "2027-03-01",
    lastReview: "2026-09-01",
    dataAccess: "Internal",
    contractEnd: "2028-03-31",
    certifications: [],
    notes: "Low-risk workflow provider with limited data access.",
  },
];

const riskLevels: RiskLevel[] = [
  "Low",
  "Medium",
  "High",
  "Critical",
];

const vendorStatuses: VendorStatus[] = [
  "Active",
  "Under Review",
  "Pending Approval",
  "Suspended",
];

const categories = [
  "Cloud Infrastructure",
  "Data Processing",
  "AI Model Provider",
  "Security Services",
  "HR Technology",
  "Business Software",
  "Consulting",
  "Other",
];

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 12px",
  borderRadius: 9,
  border: "1px solid var(--vg-border)",
  background: "var(--vg-input)",
  color: "var(--vg-text)",
  fontSize: 13,
  outline: "none",
};

function formatDate(value: string) {
  if (!value) return "Not set";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getRiskClass(risk: RiskLevel) {
  return `risk-${risk.toLowerCase()}`;
}

function getStatusClass(status: VendorStatus) {
  return `status-${status
    .toLowerCase()
    .replaceAll(" ", "-")}`;
}

function isOverdue(date: string) {
  if (!date) return false;

  return new Date(`${date}T23:59:59`).getTime() < Date.now();
}

function downloadCsv(vendors: Vendor[]) {
  const headers = [
    "Vendor ID",
    "Vendor Name",
    "Category",
    "Service",
    "Owner",
    "Region",
    "Risk",
    "Status",
    "Assessment",
    "Next Review",
    "Data Access",
    "Contract End",
  ];

  const rows = vendors.map((vendor) => [
    vendor.id,
    vendor.name,
    vendor.category,
    vendor.service,
    vendor.owner,
    vendor.region,
    vendor.risk,
    vendor.status,
    vendor.assessment,
    vendor.nextReview,
    vendor.dataAccess,
    vendor.contractEnd,
  ]);

  const escapeCell = (value: string) =>
    `"${String(value).replaceAll('"', '""')}"`;

  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCell).join(","))
    .join("\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "modelnow-vendor-governance.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

export default function VendorGovernancePage() {
  const [vendors, setVendors] =
    useState<Vendor[]>(initialVendors);

  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [selectedVendor, setSelectedVendor] =
    useState<Vendor | null>(null);

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [showFilters, setShowFilters] = useState(false);
  const [notification, setNotification] = useState("");

  const [form, setForm] = useState({
    name: "",
    category: "AI Model Provider",
    service: "",
    owner: "",
    email: "",
    region: "",
    risk: "Medium" as RiskLevel,
    dataAccess: "Internal",
    contractEnd: "",
    nextReview: "",
    notes: "",
  });

  const metrics = useMemo(() => {
    const active = vendors.filter(
      (vendor) => vendor.status === "Active",
    ).length;

    const highRisk = vendors.filter(
      (vendor) =>
        vendor.risk === "High" ||
        vendor.risk === "Critical",
    ).length;

    const underReview = vendors.filter(
      (vendor) =>
        vendor.status === "Under Review" ||
        vendor.assessment === "In Progress",
    ).length;

    const pending = vendors.filter(
      (vendor) =>
        vendor.status === "Pending Approval",
    ).length;

    const overdue = vendors.filter((vendor) =>
      isOverdue(vendor.nextReview),
    ).length;

    return {
      total: vendors.length,
      active,
      highRisk,
      underReview,
      pending,
      overdue,
    };
  }, [vendors]);

  const filteredVendors = useMemo(() => {
    const query = search.trim().toLowerCase();

    return vendors.filter((vendor) => {
      const matchesSearch =
        !query ||
        [
          vendor.id,
          vendor.name,
          vendor.category,
          vendor.service,
          vendor.owner,
          vendor.region,
        ].some((value) =>
          value.toLowerCase().includes(query),
        );

      const matchesRisk =
        riskFilter === "All" ||
        vendor.risk === riskFilter;

      const matchesStatus =
        statusFilter === "All" ||
        vendor.status === statusFilter;

      const matchesCategory =
        categoryFilter === "All" ||
        vendor.category === categoryFilter;

      return (
        matchesSearch &&
        matchesRisk &&
        matchesStatus &&
        matchesCategory
      );
    });
  }, [
    vendors,
    search,
    riskFilter,
    statusFilter,
    categoryFilter,
  ]);

  function notify(message: string) {
    setNotification(message);

    window.setTimeout(() => {
      setNotification("");
    }, 3000);
  }

  function updateVendor(
    id: string,
    changes: Partial<Vendor>,
  ) {
    setVendors((current) =>
      current.map((vendor) =>
        vendor.id === id
          ? { ...vendor, ...changes }
          : vendor,
      ),
    );

    setSelectedVendor((current) =>
      current?.id === id
        ? { ...current, ...changes }
        : current,
    );
  }

  function createVendor(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim() || !form.owner.trim()) {
      notify("Enter a vendor name and owner.");
      return;
    }

    const vendor: Vendor = {
      id: `VEN-${String(Date.now()).slice(-6)}`,
      name: form.name.trim(),
      category: form.category,
      service: form.service.trim() || "Not specified",
      owner: form.owner.trim(),
      email: form.email.trim() || "Not provided",
      region: form.region.trim() || "Not specified",
      risk: form.risk,
      status: "Pending Approval",
      assessment: "Not Started",
      nextReview: form.nextReview,
      lastReview: "",
      dataAccess: form.dataAccess,
      contractEnd: form.contractEnd,
      certifications: [],
      notes: form.notes.trim(),
    };

    setVendors((current) => [vendor, ...current]);
    setShowCreateModal(false);

    setForm({
      name: "",
      category: "AI Model Provider",
      service: "",
      owner: "",
      email: "",
      region: "",
      risk: "Medium",
      dataAccess: "Internal",
      contractEnd: "",
      nextReview: "",
      notes: "",
    });

    notify("Vendor added to the local register.");
  }

  function resetFilters() {
    setSearch("");
    setRiskFilter("All");
    setStatusFilter("All");
    setCategoryFilter("All");
  }

  const activeFilters =
    Number(riskFilter !== "All") +
    Number(statusFilter !== "All") +
    Number(categoryFilter !== "All");

  return (
    <main className="vg-page">
      <style jsx global>{`
        :root {
          --vg-bg: #f7f8fc;
          --vg-card: #ffffff;
          --vg-text: #172033;
          --vg-muted: #778198;
          --vg-border: #e5e9f1;
          --vg-input: #ffffff;
          --vg-hover: #f5f7fb;
          --vg-blue: #4169e1;
          --vg-blue-light: #edf2ff;
        }

        .vg-page {
          min-height: 100vh;
          padding: 30px;
          background: var(--vg-bg);
          color: var(--vg-text);
          font-family: Arial, Helvetica, sans-serif;
          box-sizing: border-box;
        }

        .vg-page * {
          box-sizing: border-box;
        }

        .vg-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          flex-wrap: wrap;
          margin-bottom: 26px;
        }

        .vg-eyebrow {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #4169e1;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 10px;
        }

        .vg-title {
          font-size: clamp(25px, 3vw, 33px);
          line-height: 1.2;
          letter-spacing: -1px;
          margin: 0 0 9px;
          font-weight: 750;
        }

        .vg-subtitle {
          font-size: 14px;
          color: var(--vg-muted);
          line-height: 1.65;
          max-width: 680px;
          margin: 0;
        }

        .vg-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .vg-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 1px solid var(--vg-border);
          background: var(--vg-card);
          color: var(--vg-text);
          padding: 10px 14px;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 650;
          cursor: pointer;
          transition: 0.15s ease;
          white-space: nowrap;
        }

        .vg-btn:hover {
          background: var(--vg-hover);
          border-color: #c9d2e3;
        }

        .vg-btn-primary {
          color: white;
          background: #4169e1;
          border-color: #4169e1;
        }

        .vg-btn-primary:hover {
          background: #3155c5;
          border-color: #3155c5;
        }

        .vg-btn-danger {
          color: #dc4242;
          border-color: #f1cccc;
          background: #fff8f8;
        }

        .vg-metrics {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 15px;
          margin-bottom: 22px;
        }

        .vg-metric {
          background: var(--vg-card);
          border: 1px solid var(--vg-border);
          border-radius: 13px;
          padding: 18px;
          min-width: 0;
        }

        .vg-metric-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 17px;
        }

        .vg-metric-label {
          font-size: 12px;
          color: var(--vg-muted);
          font-weight: 600;
        }

        .vg-metric-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 35px;
          height: 35px;
          border-radius: 10px;
          flex-shrink: 0;
        }

        .vg-metric-value {
          font-size: 29px;
          line-height: 1.1;
          font-weight: 750;
          letter-spacing: -1px;
          margin-bottom: 7px;
        }

        .vg-metric-caption {
          font-size: 11px;
          color: var(--vg-muted);
          line-height: 1.5;
        }

        .vg-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 285px;
          gap: 18px;
          align-items: start;
        }

        .vg-panel {
          background: var(--vg-card);
          border: 1px solid var(--vg-border);
          border-radius: 13px;
          overflow: hidden;
          min-width: 0;
        }

        .vg-panel-header {
          padding: 19px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid var(--vg-border);
          flex-wrap: wrap;
        }

        .vg-panel-title {
          font-size: 15px;
          font-weight: 750;
          margin: 0;
        }

        .vg-panel-description {
          color: var(--vg-muted);
          font-size: 12px;
          margin: 6px 0 0;
          line-height: 1.5;
        }

        .vg-search-row {
          display: flex;
          gap: 9px;
          align-items: center;
          flex-wrap: wrap;
          padding: 15px 20px;
          border-bottom: 1px solid var(--vg-border);
        }

        .vg-search {
          flex: 1;
          min-width: 170px;
          position: relative;
        }

        .vg-search input {
          width: 100%;
          padding: 10px 12px 10px 36px;
          border: 1px solid var(--vg-border);
          background: var(--vg-input);
          color: var(--vg-text);
          border-radius: 9px;
          outline: none;
          font-size: 12px;
        }

        .vg-search input:focus,
        .vg-field input:focus,
        .vg-field select:focus,
        .vg-field textarea:focus {
          border-color: #7893ed;
          box-shadow: 0 0 0 3px rgba(65, 105, 225, 0.09);
        }

        .vg-search-icon {
          position: absolute;
          left: 11px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--vg-muted);
        }

        .vg-select {
          padding: 10px 28px 10px 10px;
          border: 1px solid var(--vg-border);
          background: var(--vg-input);
          color: var(--vg-text);
          border-radius: 9px;
          font-size: 12px;
          outline: none;
          max-width: 190px;
        }

        .vg-table-wrap {
          overflow-x: auto;
          width: 100%;
        }

        .vg-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          min-width: 850px;
        }

        .vg-table th {
          padding: 12px 15px;
          background: var(--vg-hover);
          color: var(--vg-muted);
          font-size: 10px;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: 0.55px;
          white-space: nowrap;
          border-bottom: 1px solid var(--vg-border);
        }

        .vg-table td {
          padding: 15px;
          border-bottom: 1px solid var(--vg-border);
          vertical-align: middle;
          font-size: 12px;
        }

        .vg-table tbody tr:last-child td {
          border-bottom: none;
        }

        .vg-table tbody tr:hover {
          background: var(--vg-hover);
        }

        .vg-vendor-name {
          font-size: 12px;
          font-weight: 750;
          margin-bottom: 5px;
          white-space: nowrap;
        }

        .vg-vendor-id {
          font-size: 10px;
          color: var(--vg-muted);
        }

        .vg-category {
          color: var(--vg-muted);
          font-size: 11px;
          margin-top: 5px;
          white-space: nowrap;
        }

        .vg-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 8px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 750;
          white-space: nowrap;
        }

        .risk-low {
          color: #13804b;
          background: #e7f8ef;
        }

        .risk-medium {
          color: #9a6900;
          background: #fff4d7;
        }

        .risk-high {
          color: #c05b18;
          background: #fff0e4;
        }

        .risk-critical {
          color: #c53030;
          background: #ffe8e8;
        }

        .status-active {
          color: #147d4d;
          background: #e7f8ef;
        }

        .status-under-review {
          color: #9a6900;
          background: #fff4d7;
        }

        .status-pending-approval {
          color: #3556b5;
          background: #eaf0ff;
        }

        .status-suspended {
          color: #c53030;
          background: #ffe8e8;
        }

        .vg-muted {
          color: var(--vg-muted);
        }

        .vg-small {
          font-size: 11px;
          line-height: 1.6;
        }

        .vg-text-button {
          border: 0;
          background: transparent;
          color: #4169e1;
          cursor: pointer;
          padding: 0;
          font-size: 11px;
          font-weight: 750;
        }

        .vg-text-button:hover {
          text-decoration: underline;
        }

        .vg-empty {
          padding: 48px 20px;
          text-align: center;
          color: var(--vg-muted);
        }

        .vg-sidebar {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .vg-side-card {
          padding: 19px;
          background: var(--vg-card);
          border: 1px solid var(--vg-border);
          border-radius: 13px;
        }

        .vg-side-title {
          font-size: 14px;
          font-weight: 750;
          margin: 0 0 16px;
        }

        .vg-review-item {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          padding: 12px 0;
          border-bottom: 1px solid var(--vg-border);
        }

        .vg-review-item:first-of-type {
          padding-top: 0;
        }

        .vg-review-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .vg-review-icon {
          width: 33px;
          height: 33px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          flex-shrink: 0;
        }

        .vg-review-name {
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 5px;
        }

        .vg-review-description {
          color: var(--vg-muted);
          font-size: 11px;
          line-height: 1.55;
        }

        .vg-progress-row {
          margin-bottom: 15px;
        }

        .vg-progress-row:last-child {
          margin-bottom: 0;
        }

        .vg-progress-heading {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          font-size: 11px;
          margin-bottom: 8px;
        }

        .vg-progress-track {
          width: 100%;
          height: 6px;
          border-radius: 20px;
          background: var(--vg-border);
          overflow: hidden;
        }

        .vg-progress-fill {
          height: 100%;
          border-radius: inherit;
          background: #4169e1;
          transition: width 0.2s ease;
        }

        .vg-info-banner {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 14px;
          border: 1px solid #dce5ff;
          background: #f0f4ff;
          border-radius: 10px;
          color: #344c91;
          font-size: 11px;
          line-height: 1.6;
          margin-top: 18px;
        }

        .vg-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
          padding: 14px 20px;
          border-top: 1px solid var(--vg-border);
          color: var(--vg-muted);
          font-size: 11px;
        }

        .vg-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: rgba(12, 20, 38, 0.48);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          overflow-y: auto;
          backdrop-filter: blur(3px);
        }

        .vg-modal {
          width: 100%;
          max-width: 650px;
          max-height: 92vh;
          overflow-y: auto;
          background: var(--vg-card);
          color: var(--vg-text);
          border: 1px solid var(--vg-border);
          border-radius: 15px;
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.2);
        }

        .vg-modal-wide {
          max-width: 760px;
        }

        .vg-modal-header {
          padding: 21px 23px;
          border-bottom: 1px solid var(--vg-border);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 15px;
        }

        .vg-modal-header h2 {
          font-size: 19px;
          margin: 0 0 7px;
        }

        .vg-modal-header p {
          color: var(--vg-muted);
          font-size: 12px;
          line-height: 1.5;
          margin: 0;
        }

        .vg-close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 33px;
          height: 33px;
          flex-shrink: 0;
          border: 1px solid var(--vg-border);
          background: var(--vg-card);
          color: var(--vg-text);
          border-radius: 8px;
          cursor: pointer;
        }

        .vg-form {
          padding: 22px 23px;
        }

        .vg-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .vg-field {
          display: flex;
          flex-direction: column;
          gap: 7px;
          min-width: 0;
        }

        .vg-field-full {
          grid-column: 1 / -1;
        }

        .vg-field label {
          font-size: 12px;
          font-weight: 700;
        }

        .vg-field input,
        .vg-field select,
        .vg-field textarea {
          width: 100%;
          padding: 11px 12px;
          border: 1px solid var(--vg-border);
          background: var(--vg-input);
          color: var(--vg-text);
          border-radius: 9px;
          outline: none;
          font-family: inherit;
          font-size: 12px;
        }

        .vg-field textarea {
          resize: vertical;
          min-height: 85px;
        }

        .vg-help {
          color: var(--vg-muted);
          font-size: 10px;
          line-height: 1.5;
        }

        .vg-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 9px;
          flex-wrap: wrap;
          padding-top: 21px;
          margin-top: 20px;
          border-top: 1px solid var(--vg-border);
        }

        .vg-detail-body {
          padding: 22px 23px;
        }

        .vg-detail-summary {
          display: flex;
          gap: 13px;
          align-items: center;
          margin-bottom: 23px;
        }

        .vg-detail-logo {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--vg-blue-light);
          color: #4169e1;
          border-radius: 12px;
          flex-shrink: 0;
        }

        .vg-detail-summary h3 {
          font-size: 16px;
          margin: 0 0 6px;
        }

        .vg-detail-summary p {
          color: var(--vg-muted);
          font-size: 11px;
          margin: 0;
        }

        .vg-detail-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .vg-detail-item {
          border: 1px solid var(--vg-border);
          background: var(--vg-hover);
          border-radius: 10px;
          padding: 13px;
          min-width: 0;
        }

        .vg-detail-label {
          color: var(--vg-muted);
          font-size: 10px;
          margin-bottom: 8px;
        }

        .vg-detail-value {
          font-size: 12px;
          font-weight: 700;
          overflow-wrap: anywhere;
          line-height: 1.5;
        }

        .vg-cert-list {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin-top: 9px;
        }

        .vg-cert {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 8px;
          background: #e7f8ef;
          color: #147d4d;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 700;
        }

        .vg-detail-section {
          margin-top: 22px;
        }

        .vg-detail-section h4 {
          font-size: 13px;
          margin: 0 0 11px;
        }

        .vg-detail-section p {
          font-size: 12px;
          color: var(--vg-muted);
          line-height: 1.7;
          margin: 0;
          overflow-wrap: anywhere;
        }

        .vg-toast {
          position: fixed;
          right: 24px;
          bottom: 24px;
          z-index: 200;
          display: flex;
          align-items: center;
          gap: 10px;
          max-width: calc(100vw - 32px);
          padding: 13px 17px;
          background: #172033;
          color: white;
          border-radius: 10px;
          box-shadow: 0 10px 35px rgba(0, 0, 0, 0.2);
          font-size: 12px;
        }

        .vg-mobile-filters {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          width: 100%;
        }

        @media (max-width: 1200px) {
          .vg-metrics {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .vg-layout {
            grid-template-columns: minmax(0, 1fr);
          }

          .vg-sidebar {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            align-items: start;
          }
        }

        @media (max-width: 700px) {
          .vg-page {
            padding: 17px;
          }

          .vg-metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
          }

          .vg-metric {
            padding: 14px;
          }

          .vg-metric-value {
            font-size: 25px;
          }

          .vg-sidebar {
            grid-template-columns: minmax(0, 1fr);
          }

          .vg-panel-header {
            align-items: flex-start;
          }

          .vg-search-row {
            padding: 13px;
          }

          .vg-select {
            max-width: none;
            flex: 1;
            min-width: 125px;
          }

          .vg-form-grid,
          .vg-detail-grid {
            grid-template-columns: minmax(0, 1fr);
          }

          .vg-field-full {
            grid-column: auto;
          }

          .vg-modal-overlay {
            padding: 10px;
          }

          .vg-modal-header,
          .vg-form,
          .vg-detail-body {
            padding: 17px;
          }

          .vg-header-actions {
            width: 100%;
          }

          .vg-header-actions .vg-btn {
            flex: 1;
          }
        }
      `}</style>

      <header className="vg-header">
        <div>
          <div className="vg-eyebrow">
            <ShieldCheck size={15} />
            ModelNow · Governance Center
          </div>

          <h1 className="vg-title">Vendor Governance</h1>

          <p className="vg-subtitle">
            Manage third-party AI providers, service partners,
            vendor risk assessments, due diligence, and review
            schedules from one workspace.
          </p>
        </div>

        <div className="vg-header-actions">
          <button
            className="vg-btn"
            onClick={() => downloadCsv(filteredVendors)}
          >
            <ArrowDownToLine size={15} />
            Export CSV
          </button>

          <button
            className="vg-btn vg-btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={16} />
            Add vendor
          </button>
        </div>
      </header>

      <section className="vg-metrics">
        <div className="vg-metric">
          <div className="vg-metric-top">
            <span className="vg-metric-label">
              Total vendors
            </span>
            <span
              className="vg-metric-icon"
              style={{
                color: "#4169e1",
                background: "#edf2ff",
              }}
            >
              <Building2 size={18} />
            </span>
          </div>
          <div className="vg-metric-value">{metrics.total}</div>
          <div className="vg-metric-caption">
            Registered in the vendor inventory
          </div>
        </div>

        <div className="vg-metric">
          <div className="vg-metric-top">
            <span className="vg-metric-label">
              Active vendors
            </span>
            <span
              className="vg-metric-icon"
              style={{
                color: "#16834e",
                background: "#e7f8ef",
              }}
            >
              <CheckCircle2 size={18} />
            </span>
          </div>
          <div className="vg-metric-value">{metrics.active}</div>
          <div className="vg-metric-caption">
            Currently marked active
          </div>
        </div>

        <div className="vg-metric">
          <div className="vg-metric-top">
            <span className="vg-metric-label">
              High / critical risk
            </span>
            <span
              className="vg-metric-icon"
              style={{
                color: "#d14b35",
                background: "#fff0e9",
              }}
            >
              <ShieldAlert size={18} />
            </span>
          </div>
          <div className="vg-metric-value">
            {metrics.highRisk}
          </div>
          <div className="vg-metric-caption">
            Vendors requiring closer oversight
          </div>
        </div>

        <div className="vg-metric">
          <div className="vg-metric-top">
            <span className="vg-metric-label">
              In review
            </span>
            <span
              className="vg-metric-icon"
              style={{
                color: "#a56b00",
                background: "#fff4d7",
              }}
            >
              <Activity size={18} />
            </span>
          </div>
          <div className="vg-metric-value">
            {metrics.underReview}
          </div>
          <div className="vg-metric-caption">
            Assessments needing follow-up
          </div>
        </div>

        <div className="vg-metric">
          <div className="vg-metric-top">
            <span className="vg-metric-label">
              Review overdue
            </span>
            <span
              className="vg-metric-icon"
              style={{
                color: "#a23c9e",
                background: "#f9eafa",
              }}
            >
              <Clock3 size={18} />
            </span>
          </div>
          <div className="vg-metric-value">
            {metrics.overdue}
          </div>
          <div className="vg-metric-caption">
            Past their scheduled review date
          </div>
        </div>
      </section>

      <section className="vg-layout">
        <div className="vg-panel">
          <div className="vg-panel-header">
            <div>
              <h2 className="vg-panel-title">
                Vendor register
              </h2>
              <p className="vg-panel-description">
                Review vendor profiles, risk ratings, and due
                diligence status.
              </p>
            </div>

            <span className="vg-badge status-active">
              {filteredVendors.length} results
            </span>
          </div>

          <div className="vg-search-row">
            <div className="vg-search">
              <Search
                size={15}
                className="vg-search-icon"
              />
              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search vendors, owners, services..."
                aria-label="Search vendors"
              />
            </div>

            <button
              className="vg-btn"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={14} />
              Filters
              {activeFilters > 0 && (
                <span className="vg-badge status-pending-approval">
                  {activeFilters}
                </span>
              )}
              <ChevronDown size={13} />
            </button>
          </div>

          {showFilters && (
            <div className="vg-search-row">
              <div className="vg-mobile-filters">
                <select
                  className="vg-select"
                  value={riskFilter}
                  onChange={(event) =>
                    setRiskFilter(event.target.value)
                  }
                  aria-label="Filter by risk"
                >
                  <option value="All">All risk levels</option>
                  {riskLevels.map((risk) => (
                    <option key={risk} value={risk}>
                      {risk} risk
                    </option>
                  ))}
                </select>

                <select
                  className="vg-select"
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value)
                  }
                  aria-label="Filter by status"
                >
                  <option value="All">All statuses</option>
                  {vendorStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                <select
                  className="vg-select"
                  value={categoryFilter}
                  onChange={(event) =>
                    setCategoryFilter(event.target.value)
                  }
                  aria-label="Filter by category"
                >
                  <option value="All">All categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                <button
                  className="vg-btn"
                  onClick={resetFilters}
                >
                  <X size={13} />
                  Clear filters
                </button>
              </div>
            </div>
          )}

          <div className="vg-table-wrap">
            <table className="vg-table">
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Risk level</th>
                  <th>Status</th>
                  <th>Assessment</th>
                  <th>Next review</th>
                  <th>Owner</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredVendors.map((vendor) => (
                  <tr key={vendor.id}>
                    <td>
                      <div className="vg-vendor-name">
                        {vendor.name}
                      </div>
                      <div className="vg-vendor-id">
                        {vendor.id}
                      </div>
                      <div className="vg-category">
                        {vendor.category}
                      </div>
                    </td>

                    <td>
                      <span
                        className={`vg-badge ${getRiskClass(
                          vendor.risk,
                        )}`}
                      >
                        {vendor.risk === "Critical" && (
                          <AlertTriangle size={11} />
                        )}
                        {vendor.risk}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`vg-badge ${getStatusClass(
                          vendor.status,
                        )}`}
                      >
                        {vendor.status}
                      </span>
                    </td>

                    <td>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 650,
                        }}
                      >
                        {vendor.assessment}
                      </div>
                      <div className="vg-category">
                        {vendor.certifications.length} certification
                        {vendor.certifications.length === 1
                          ? ""
                          : "s"}
                      </div>
                    </td>

                    <td>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 650,
                          color: isOverdue(vendor.nextReview)
                            ? "#c53030"
                            : "var(--vg-text)",
                        }}
                      >
                        {formatDate(vendor.nextReview)}
                      </div>
                      {isOverdue(vendor.nextReview) && (
                        <div
                          style={{
                            color: "#c53030",
                            fontSize: 10,
                            marginTop: 5,
                          }}
                        >
                          Overdue
                        </div>
                      )}
                    </td>

                    <td>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 650,
                        }}
                      >
                        {vendor.owner}
                      </div>
                      <div className="vg-category">
                        {vendor.region}
                      </div>
                    </td>

                    <td>
                      <button
                        className="vg-text-button"
                        onClick={() =>
                          setSelectedVendor(vendor)
                        }
                      >
                        View details
                        <ExternalLink
                          size={11}
                          style={{
                            display: "inline",
                            marginLeft: 4,
                            verticalAlign: "middle",
                          }}
                        />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredVendors.length === 0 && (
              <div className="vg-empty">
                <Search
                  size={27}
                  style={{ marginBottom: 10, opacity: 0.5 }}
                />
                <div
                  style={{
                    fontWeight: 700,
                    marginBottom: 7,
                    color: "var(--vg-text)",
                  }}
                >
                  No vendors found
                </div>
                <div className="vg-small">
                  Try changing your search or filters.
                </div>
                <button
                  className="vg-btn"
                  style={{ marginTop: 14 }}
                  onClick={resetFilters}
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>

          <div className="vg-footer">
            <span>
              Showing {filteredVendors.length} of {vendors.length}{" "}
              vendors
            </span>
            <span>Local demonstration data</span>
          </div>
        </div>

        <aside className="vg-sidebar">
          <div className="vg-side-card">
            <h3 className="vg-side-title">
              <CalendarDays
                size={16}
                style={{
                  display: "inline",
                  marginRight: 8,
                  verticalAlign: "middle",
                  color: "#4169e1",
                }}
              />
              Review priorities
            </h3>

            {vendors
              .filter(
                (vendor) =>
                  vendor.status === "Under Review" ||
                  vendor.status === "Pending Approval" ||
                  isOverdue(vendor.nextReview),
              )
              .sort((a, b) => {
                const aDate = a.nextReview
                  ? new Date(`${a.nextReview}T00:00:00`).getTime()
                  : Number.MAX_SAFE_INTEGER;

                const bDate = b.nextReview
                  ? new Date(`${b.nextReview}T00:00:00`).getTime()
                  : Number.MAX_SAFE_INTEGER;

                return aDate - bDate;
              })
              .slice(0, 4)
              .map((vendor) => (
                <div
                  className="vg-review-item"
                  key={vendor.id}
                >
                  <div
                    className="vg-review-icon"
                    style={{
                      color:
                        vendor.risk === "Critical" ||
                        vendor.risk === "High"
                          ? "#c53030"
                          : "#a56b00",
                      background:
                        vendor.risk === "Critical" ||
                        vendor.risk === "High"
                          ? "#ffe8e8"
                          : "#fff4d7",
                    }}
                  >
                    <AlertTriangle size={16} />
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="vg-review-name">
                      {vendor.name}
                    </div>
                    <div className="vg-review-description">
                      {vendor.status}
                      <br />
                      Review: {formatDate(vendor.nextReview)}
                    </div>
                    <button
                      className="vg-text-button"
                      style={{ marginTop: 6 }}
                      onClick={() =>
                        setSelectedVendor(vendor)
                      }
                    >
                      Review vendor
                    </button>
                  </div>
                </div>
              ))}

            {vendors.filter(
              (vendor) =>
                vendor.status === "Under Review" ||
                vendor.status === "Pending Approval" ||
                isOverdue(vendor.nextReview),
            ).length === 0 && (
              <p className="vg-small vg-muted">
                No immediate review priorities in this register.
              </p>
            )}
          </div>

          <div className="vg-side-card">
            <h3 className="vg-side-title">
              Risk distribution
            </h3>

            {riskLevels.map((risk) => {
              const count = vendors.filter(
                (vendor) => vendor.risk === risk,
              ).length;

              const percentage =
                vendors.length > 0
                  ? (count / vendors.length) * 100
                  : 0;

              const color =
                risk === "Low"
                  ? "#16834e"
                  : risk === "Medium"
                    ? "#d69a17"
                    : risk === "High"
                      ? "#e77a32"
                      : "#d64545";

              return (
                <div className="vg-progress-row" key={risk}>
                  <div className="vg-progress-heading">
                    <span>{risk} risk</span>
                    <span
                      style={{
                        fontWeight: 750,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {count}
                    </span>
                  </div>
                  <div className="vg-progress-track">
                    <div
                      className="vg-progress-fill"
                      style={{
                        width: `${percentage}%`,
                        background: color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="vg-side-card">
            <h3 className="vg-side-title">
              Due diligence checklist
            </h3>

            {[
              "Security assessment",
              "Data processing review",
              "AI risk assessment",
              "Contract and legal review",
            ].map((item, index) => (
              <div
                key={item}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 9,
                  padding: "9px 0",
                  borderBottom:
                    index < 3
                      ? "1px solid var(--vg-border)"
                      : "none",
                  fontSize: 11,
                  lineHeight: 1.5,
                }}
              >
                <FileCheck2
                  size={15}
                  color="#4169e1"
                  style={{ flexShrink: 0, marginTop: 1 }}
                />
                <span>{item}</span>
              </div>
            ))}

            <div className="vg-info-banner">
              <Shield size={17} style={{ flexShrink: 0 }} />
              <span>
                Complete the applicable checks before granting
                a vendor access to sensitive systems or data.
              </span>
            </div>
          </div>
        </aside>
      </section>

      {showCreateModal && (
        <div
          className="vg-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowCreateModal(false);
            }
          }}
        >
          <section
            className="vg-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="vg-create-title"
          >
            <div className="vg-modal-header">
              <div>
                <h2 id="vg-create-title">Register a vendor</h2>
                <p>
                  Add a third-party provider to the governance
                  register.
                </p>
              </div>

              <button
                className="vg-close"
                onClick={() => setShowCreateModal(false)}
                aria-label="Close registration form"
              >
                <X size={17} />
              </button>
            </div>

            <form className="vg-form" onSubmit={createVendor}>
              <div className="vg-form-grid">
                <div className="vg-field">
                  <label htmlFor="vg-name">Vendor name *</label>
                  <input
                    id="vg-name"
                    required
                    value={form.name}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        name: event.target.value,
                      })
                    }
                    placeholder="e.g. Acme AI Services"
                  />
                </div>

                <div className="vg-field">
                  <label htmlFor="vg-category">Category *</label>
                  <select
                    id="vg-category"
                    value={form.category}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        category: event.target.value,
                      })
                    }
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="vg-field">
                  <label htmlFor="vg-service">
                    Service provided
                  </label>
                  <input
                    id="vg-service"
                    value={form.service}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        service: event.target.value,
                      })
                    }
                    placeholder="Describe the service"
                  />
                </div>

                <div className="vg-field">
                  <label htmlFor="vg-owner">
                    Internal owner *
                  </label>
                  <input
                    id="vg-owner"
                    required
                    value={form.owner}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        owner: event.target.value,
                      })
                    }
                    placeholder="Responsible team or person"
                  />
                </div>

                <div className="vg-field">
                  <label htmlFor="vg-email">
                    Contact email
                  </label>
                  <input
                    id="vg-email"
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        email: event.target.value,
                      })
                    }
                    placeholder="contact@vendor.com"
                  />
                </div>

                <div className="vg-field">
                  <label htmlFor="vg-region">Region</label>
                  <input
                    id="vg-region"
                    value={form.region}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        region: event.target.value,
                      })
                    }
                    placeholder="Country or operating region"
                  />
                </div>

                <div className="vg-field">
                  <label htmlFor="vg-risk">Initial risk level</label>
                  <select
                    id="vg-risk"
                    value={form.risk}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        risk: event.target.value as RiskLevel,
                      })
                    }
                  >
                    {riskLevels.map((risk) => (
                      <option key={risk} value={risk}>
                        {risk}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="vg-field">
                  <label htmlFor="vg-access">
                    Data access level
                  </label>
                  <select
                    id="vg-access"
                    value={form.dataAccess}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        dataAccess: event.target.value,
                      })
                    }
                  >
                    <option>Public</option>
                    <option>Internal</option>
                    <option>Confidential</option>
                    <option>Restricted</option>
                  </select>
                </div>

                <div className="vg-field">
                  <label htmlFor="vg-next-review">
                    Next review date
                  </label>
                  <input
                    id="vg-next-review"
                    type="date"
                    value={form.nextReview}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        nextReview: event.target.value,
                      })
                    }
                  />
                </div>

                <div className="vg-field">
                  <label htmlFor="vg-contract-end">
                    Contract end date
                  </label>
                  <input
                    id="vg-contract-end"
                    type="date"
                    value={form.contractEnd}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        contractEnd: event.target.value,
                      })
                    }
                  />
                </div>

                <div className="vg-field vg-field-full">
                  <label htmlFor="vg-notes">
                    Notes and due diligence requirements
                  </label>
                  <textarea
                    id="vg-notes"
                    value={form.notes}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        notes: event.target.value,
                      })
                    }
                    placeholder="Record known risks, required documents, or follow-up actions..."
                  />
                  <span className="vg-help">
                    New vendors are initially marked Pending Approval.
                  </span>
                </div>
              </div>

              <div className="vg-modal-actions">
                <button
                  type="button"
                  className="vg-btn"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="vg-btn vg-btn-primary"
                >
                  <Plus size={15} />
                  Register vendor
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {selectedVendor && (
        <div
          className="vg-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedVendor(null);
            }
          }}
        >
          <section
            className="vg-modal vg-modal-wide"
            role="dialog"
            aria-modal="true"
            aria-labelledby="vg-detail-title"
          >
            <div className="vg-modal-header">
              <div>
                <h2 id="vg-detail-title">Vendor details</h2>
                <p>
                  {selectedVendor.id} · Vendor governance record
                </p>
              </div>

              <button
                className="vg-close"
                onClick={() => setSelectedVendor(null)}
                aria-label="Close vendor details"
              >
                <X size={17} />
              </button>
            </div>

            <div className="vg-detail-body">
              <div className="vg-detail-summary">
                <div className="vg-detail-logo">
                  <Building2 size={24} />
                </div>

                <div style={{ minWidth: 0, flex: 1 }}>
                  <h3>{selectedVendor.name}</h3>
                  <p>
                    {selectedVendor.category} ·{" "}
                    {selectedVendor.region}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 7,
                      marginTop: 10,
                    }}
                  >
                    <span
                      className={`vg-badge ${getRiskClass(
                        selectedVendor.risk,
                      )}`}
                    >
                      {selectedVendor.risk} risk
                    </span>

                    <span
                      className={`vg-badge ${getStatusClass(
                        selectedVendor.status,
                      )}`}
                    >
                      {selectedVendor.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="vg-detail-grid">
                <div className="vg-detail-item">
                  <div className="vg-detail-label">
                    Service provided
                  </div>
                  <div className="vg-detail-value">
                    {selectedVendor.service}
                  </div>
                </div>

                <div className="vg-detail-item">
                  <div className="vg-detail-label">
                    Internal owner
                  </div>
                  <div className="vg-detail-value">
                    {selectedVendor.owner}
                  </div>
                </div>

                <div className="vg-detail-item">
                  <div className="vg-detail-label">
                    Contact email
                  </div>
                  <div className="vg-detail-value">
                    {selectedVendor.email}
                  </div>
                </div>

                <div className="vg-detail-item">
                  <div className="vg-detail-label">
                    Data access level
                  </div>
                  <div className="vg-detail-value">
                    {selectedVendor.dataAccess}
                  </div>
                </div>

                <div className="vg-detail-item">
                  <div className="vg-detail-label">
                    Assessment status
                  </div>
                  <div className="vg-detail-value">
                    {selectedVendor.assessment}
                  </div>
                </div>

                <div className="vg-detail-item">
                  <div className="vg-detail-label">
                    Last review
                  </div>
                  <div className="vg-detail-value">
                    {formatDate(selectedVendor.lastReview)}
                  </div>
                </div>

                <div className="vg-detail-item">
                  <div className="vg-detail-label">
                    Next review
                  </div>
                  <div className="vg-detail-value">
                    {formatDate(selectedVendor.nextReview)}
                  </div>
                </div>

                <div className="vg-detail-item">
                  <div className="vg-detail-label">
                    Contract end date
                  </div>
                  <div className="vg-detail-value">
                    {formatDate(selectedVendor.contractEnd)}
                  </div>
                </div>
              </div>

              <div className="vg-detail-section">
                <h4>
                  <FileCheck2
                    size={15}
                    style={{
                      display: "inline",
                      marginRight: 7,
                      verticalAlign: "middle",
                    }}
                  />
                  Certifications and documentation
                </h4>

                {selectedVendor.certifications.length > 0 ? (
                  <div className="vg-cert-list">
                    {selectedVendor.certifications.map(
                      (certification) => (
                        <span
                          className="vg-cert"
                          key={certification}
                        >
                          <Check size={12} />
                          {certification}
                        </span>
                      ),
                    )}
                  </div>
                ) : (
                  <p>
                    No certifications have been recorded in this
                    demonstration profile.
                  </p>
                )}
              </div>

              <div className="vg-detail-section">
                <h4>Notes and risk considerations</h4>
                <p>
                  {selectedVendor.notes ||
                    "No additional notes have been recorded."}
                </p>
              </div>

              <div className="vg-detail-section">
                <h4>Update governance record</h4>

                <div className="vg-form-grid">
                  <div className="vg-field">
                    <label htmlFor="vg-edit-risk">
                      Risk level
                    </label>
                    <select
                      id="vg-edit-risk"
                      value={selectedVendor.risk}
                      onChange={(event) =>
                        updateVendor(selectedVendor.id, {
                          risk: event.target.value as RiskLevel,
                        })
                      }
                    >
                      {riskLevels.map((risk) => (
                        <option key={risk} value={risk}>
                          {risk}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="vg-field">
                    <label htmlFor="vg-edit-status">
                      Vendor status
                    </label>
                    <select
                      id="vg-edit-status"
                      value={selectedVendor.status}
                      onChange={(event) =>
                        updateVendor(selectedVendor.id, {
                          status: event.target.value as VendorStatus,
                        })
                      }
                    >
                      {vendorStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="vg-field">
                    <label htmlFor="vg-edit-assessment">
                      Assessment status
                    </label>
                    <select
                      id="vg-edit-assessment"
                      value={selectedVendor.assessment}
                      onChange={(event) =>
                        updateVendor(selectedVendor.id, {
                          assessment: event.target.value,
                        })
                      }
                    >
                      <option>Not Started</option>
                      <option>In Progress</option>
                      <option>Completed</option>
                      <option>Needs Remediation</option>
                    </select>
                  </div>

                  <div className="vg-field">
                    <label htmlFor="vg-edit-review">
                      Next review date
                    </label>
                    <input
                      id="vg-edit-review"
                      type="date"
                      value={selectedVendor.nextReview}
                      onChange={(event) =>
                        updateVendor(selectedVendor.id, {
                          nextReview: event.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="vg-modal-actions">
                <button
                  className="vg-btn"
                  onClick={() => setSelectedVendor(null)}
                >
                  Close
                </button>

                <button
                  className="vg-btn vg-btn-primary"
                  onClick={() => {
                    notify("Vendor record updated locally.");
                    setSelectedVendor(null);
                  }}
                >
                  <Check size={15} />
                  Save changes
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {notification && (
        <div className="vg-toast" role="status">
          <CheckCircle2 size={17} color="#7ce2a4" />
          {notification}
        </div>
      )}
    </main>
  );
}