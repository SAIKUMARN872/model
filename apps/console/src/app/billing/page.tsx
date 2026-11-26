"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Info,
  RefreshCw,
  Search,
} from "lucide-react";

import { api } from "../../lib/api.js";
import { getResourceEndpoint } from "../../config/console.js";
import AddPaymentPopup from "./add payment/page";

type Row = Record<string, unknown>;
type ViewMode = "cost" | "usage";
type DateRange = "7d" | "30d" | "90d" | "all";

type DropdownOption = {
  label: string;
  value: string;
};

const PRODUCT_OPTIONS: DropdownOption[] = [
  { label: "All products", value: "all" },
 { label: "Browser Automation", value: "browserautomation" },
  { label: "Computer Use", value: "computeruse" },
  { label: "Agents & Workflows", value: "agentsworkflows" },
  { label: "Advanced RAG", value: "advancedrag" },
  { label: "API Access", value: "apiaccess" },
  { label: "Fine-tuning", value: "finetuning" },
];

const EVENT_OPTIONS: DropdownOption[] = [
  { label: "All events", value: "all" },
  { label: "Browser Automation", value: "browserautomation" },
  { label: "Computer Use", value: "computeruse" },
  { label: "Agents & Workflows", value: "agentsworkflows" },
  { label: "Advanced RAG", value: "advancedrag" },
  { label: "API Access", value: "apiaccess" },
  { label: "Fine-tuning", value: "finetuning" },
];

const DATE_OPTIONS: DropdownOption[] = [
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 90 days", value: "90d" },
  { label: "All time", value: "all" },
];

function isObject(value: unknown): value is Row {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function asRows(value: unknown): Row[] {
  return Array.isArray(value) ? value.filter(isObject) : [];
}

function getValue(source: Row | null, keys: string[]): unknown {
  if (!source) return undefined;

  for (const key of keys) {
    const value = source[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return undefined;
}

function findObject(source: unknown, keys: string[]): Row | null {
  if (!isObject(source)) return null;

  for (const key of keys) {
    if (isObject(source[key])) return source[key] as Row;
  }

  return null;
}

function getNestedRows(source: unknown, keys: string[]): Row[] {
  if (Array.isArray(source)) return asRows(source);
  if (!isObject(source)) return [];

  for (const key of keys) {
    const value = source[key];

    if (Array.isArray(value)) return asRows(value);

    if (isObject(value)) {
      const nested = getNestedRows(value, [
        "items",
        "results",
        "records",
        "data",
        "invoices",
        "events",
      ]);

      if (nested.length) return nested;
    }
  }

  return [];
}

function textValue(value: unknown): string {
  if (value === undefined || value === null || value === "") return "—";

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  return "—";
}

function numberValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.replace(/[$,?\s]/g, ""));
    if (Number.isFinite(parsed)) return parsed;
  }

  return null;
}

function formatMoney(value: unknown, currency = "USD"): string {
  const amount = numberValue(value);
  if (amount === null) return "—";

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function formatDate(value: unknown): string {
  if (!value) return "—";

  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return textValue(value);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function safeUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;

  try {
    const url = new URL(value);

    return url.protocol === "https:" || url.protocol === "http:"
      ? url.href
      : null;
  } catch {
    return null;
  }
}

function humanize(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function errorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Unable to load billing information.";
}

function normalize(value: unknown): string {
  return String(value ?? "")
    .toLowerCase()
    .replace(/api/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function dateFromRow(row: Row): Date | null {
  const value = getValue(row, [
    "createdAt",
    "created_at",
    "date",
    "timestamp",
    "periodStart",
    "period_start",
    "occurredAt",
  ]);

  if (!value) return null;

  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

function amountFromRow(row: Row): number | null {
  return numberValue(
    getValue(row, [
      "cost",
      "amount",
      "totalCost",
      "total_cost",
      "price",
      "total",
      "billedAmount",
      "billed_amount",
    ]),
  );
}

function getRangeStart(range: DateRange): Date | null {
  if (range === "all") return null;

  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const date = new Date();

  date.setDate(date.getDate() - days);
  date.setHours(0, 0, 0, 0);

  return date;
}

function productFromRow(row: Row): string {
  return textValue(
    getValue(row, [
      "product",
      "productName",
      "product_name",
      "model",
      "modelName",
      "model_name",
      "service",
      "api",
    ]),
  );
}

function eventFromRow(row: Row): string {
  return textValue(
    getValue(row, [
      "event",
      "eventName",
      "event_name",
      "type",
      "eventType",
      "event_type",
      "metric",
      "name",
    ]),
  );
}

function Dropdown({
  label,
  value,
  options,
  onChange,
  prefix = "",
  className = "",
}: {
  label: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  prefix?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = options.find((option) => option.value === value);
  const displayLabel = selected?.label ?? label;

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className={`billing-dropdown ${className}`} ref={rootRef}>
      <button
        type="button"
        className={`billing-dropdown-trigger ${open ? "is-open" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span>
          {prefix}
          {displayLabel}
        </span>
        <ChevronDown size={16} />
      </button>

      {open && (
        <div
          className="billing-dropdown-menu"
          role="listbox"
          aria-label={label}
        >
          {options.map((option) => {
            const active = option.value === value;

            return (
              <button
                type="button"
                role="option"
                aria-selected={active}
                className={`billing-dropdown-option ${
                  active ? "is-selected" : ""
                }`}
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                <span>{option.label}</span>
                {active && <Check size={17} strokeWidth={2.2} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function BillingPage() {
  const [endpoint, setEndpoint] = useState<string | null>(null);
  const [configError, setConfigError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [payload, setPayload] = useState<unknown>(null);

  const [viewMode, setViewMode] = useState<ViewMode>("cost");
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [productFilter, setProductFilter] = useState("all");
  const [eventFilter, setEventFilter] = useState("all");
  const [invoiceQuery, setInvoiceQuery] = useState("");
  const [breakdownOpen, setBreakdownOpen] = useState(true);
  const [invoicesOpen, setInvoicesOpen] = useState(true);
  const [addPaymentOpen, setAddPaymentOpen] = useState(false);

  useEffect(() => {
    try {
      setEndpoint(getResourceEndpoint("billing"));
    } catch (err) {
      setConfigError(errorMessage(err));
    }
  }, []);

  const load = useCallback(async () => {
    if (!endpoint) return;

    setLoading(true);
    setError("");

    try {
      const response = await api.get(endpoint);
      setPayload(response);
      setLoaded(true);
    } catch (err) {
      setPayload(null);
      setLoaded(false);
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    if (endpoint) void load();
  }, [endpoint, load]);

  const root = useMemo(() => {
    if (!isObject(payload)) return null;

    return findObject(payload, ["data", "billing", "result"]) ?? payload;
  }, [payload]);

  const summary = useMemo(
    () =>
      findObject(root, [
        "summary",
        "overview",
        "account",
        "balance",
      ]) ?? root,
    [root],
  );

  const invoices = useMemo(
    () =>
      getNestedRows(root, [
        "invoices",
        "invoiceHistory",
        "invoice_history",
        "records",
        "billingRecords",
        "billing_records",
      ]),
    [root],
  );

  const usageRows = useMemo(
    () =>
      getNestedRows(root, [
        "usage",
        "usageRecords",
        "usage_records",
        "usageHistory",
        "usage_history",
        "events",
        "dailyUsage",
        "daily_usage",
        "chart",
        "series",
      ]),
    [root],
  );

  const currency = textValue(
    getValue(summary, ["currency", "billingCurrency"]) ?? "USD",
  );

  const balance = getValue(summary, [
    "creditBalance",
    "credit_balance",
    "balance",
    "availableBalance",
    "available_balance",
    "remainingCredits",
    "remaining_credits",
  ]);

  const paymentMethod = findObject(root, [
    "paymentMethod",
    "payment_method",
    "defaultPaymentMethod",
    "default_payment_method",
  ]);

  const autoRefill = findObject(root, [
    "autoRefill",
    "auto_refill",
    "autoRecharge",
    "auto_recharge",
  ]);

  const usageTier = getValue(summary, [
    "usageTier",
    "usage_tier",
    "tier",
    "plan",
  ]);

  const filteredUsage = useMemo(() => {
    const start = getRangeStart(dateRange);

    return usageRows.filter((row) => {
      const date = dateFromRow(row);

      if (start && date && date < start) return false;

      const product = normalize(productFromRow(row));
      const event = normalize(eventFromRow(row));

      if (
        productFilter !== "all" &&
        !product.includes(normalize(productFilter))
      ) {
        return false;
      }

      if (
        eventFilter !== "all" &&
        event !== normalize(eventFilter)
      ) {
        return false;
      }

      return true;
    });
  }, [usageRows, dateRange, productFilter, eventFilter]);

  const totalCost = useMemo(
    () =>
      filteredUsage.reduce(
        (total, row) => total + (amountFromRow(row) ?? 0),
        0,
      ),
    [filteredUsage],
  );

  const totalRequests = useMemo(
    () =>
      filteredUsage.reduce(
        (total, row) =>
          total +
          (numberValue(
            getValue(row, ["requests", "requestCount", "request_count"]),
          ) ?? 0),
        0,
      ),
    [filteredUsage],
  );

  const totalTokens = useMemo(
    () =>
      filteredUsage.reduce(
        (total, row) =>
          total +
          (numberValue(
            getValue(row, ["totalTokens", "total_tokens", "tokens"]),
          ) ?? 0),
        0,
      ),
    [filteredUsage],
  );

  const chartValues = useMemo(() => {
    return filteredUsage
      .map((row) => {
        const date = dateFromRow(row);

        const value =
          viewMode === "cost"
            ? amountFromRow(row)
            : numberValue(
                getValue(row, [
                  "totalTokens",
                  "total_tokens",
                  "tokens",
                  "requests",
                  "requestCount",
                  "request_count",
                ]),
              );

        return {
          date,
          label: date
            ? date.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                timeZone: "UTC",
              })
            : "—",
          value,
        };
      })
      .filter(
        (
          item,
        ): item is {
          date: Date;
          label: string;
          value: number;
        } => item.date !== null && item.value !== null,
      )
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(-30);
  }, [filteredUsage, viewMode]);

  const maxChartValue = Math.max(
    1,
    ...chartValues.map((item) => item.value),
  );

  const chartPoints = chartValues.map((item, index) => {
    const x =
      chartValues.length <= 1
        ? 50
        : 50 + (index / (chartValues.length - 1)) * 900;

    const y = 250 - (item.value / maxChartValue) * 205;

    return { ...item, x, y };
  });

  const chartPath = chartPoints
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`,
    )
    .join(" ");

  const invoiceColumns = useMemo(() => {
    const keys = [...new Set(invoices.flatMap((row) => Object.keys(row)))];

    const preferred = [
      "invoiceNumber",
      "invoice_number",
      "id",
      "createdAt",
      "created_at",
      "period",
      "amount",
      "currency",
      "status",
      "dueDate",
      "due_date",
    ];

    return [
      ...preferred.filter((key) => keys.includes(key)),
      ...keys.filter((key) => !preferred.includes(key)),
    ].slice(0, 6);
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    const query = invoiceQuery.trim().toLowerCase();

    if (!query) return invoices;

    return invoices.filter((row) =>
      Object.entries(row).some(([key, value]) =>
        `${key} ${textValue(value)}`.toLowerCase().includes(query),
      ),
    );
  }, [invoices, invoiceQuery]);

  const cardNumber = textValue(
    getValue(paymentMethod, [
      "last4",
      "lastFour",
      "last_four",
      "maskedNumber",
      "masked_number",
    ]),
  );

  const cardBrand = textValue(
    getValue(paymentMethod, ["brand", "type", "cardType", "card_type"]),
  );

  const paymentStatus = textValue(
    getValue(paymentMethod, ["status", "state"]),
  );

  const refillEnabled = getValue(autoRefill, [
    "enabled",
    "isEnabled",
    "is_enabled",
    "active",
  ]);

  const refillThreshold = getValue(autoRefill, [
    "threshold",
    "minimumBalance",
    "minimum_balance",
  ]);

  const refillAmount = getValue(autoRefill, [
    "amount",
    "refillAmount",
    "refill_amount",
  ]);

  // Fixed dropdown options: no dynamic options are added from API records.
  const productOptions = PRODUCT_OPTIONS;
  const eventOptions = EVENT_OPTIONS;

  const displayBalance =
    balance === undefined ? "—" : formatMoney(balance, currency);

  return (
    <div className="billing-page">
      <style>{`
        .billing-page {
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
          padding: 24px 30px 60px;
          color: var(--text-primary, #102b3c);
          font-family: inherit;
        }
        .billing-page * { box-sizing: border-box; }
        .billing-page button, .billing-page input { font: inherit; }

        .billing-heading {
          margin: 0 0 42px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .billing-heading h1 {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 27px;
          line-height: 1.25;
          font-weight: 700;
          color: #102b3c;
        }
        .billing-heading p {
          margin: 10px 0 0;
          color: #536b7b;
          font-size: 15px;
        }
        .billing-subtitle {
          margin: 0 0 9px;
          font-size: 19px;
          font-weight: 500;
          color: #102b3c;
        }
        .billing-description {
          margin: 0 0 16px;
          color: #536b7b;
          font-size: 15px;
        }
        .billing-panel {
          background: #fff;
          border: 1px solid #dfe4e8;
          border-radius: 17px;
          box-shadow: 0 2px 4px rgba(15, 23, 42, .045);
        }
        .billing-balance {
          padding: 20px 24px 14px;
          margin-bottom: 50px;
        }
        .billing-balance-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 10px;
        }
        .billing-balance-value {
          font-size: 17px;
          font-weight: 500;
          color: #102b3c;
        }
        .billing-button {
          min-height: 39px;
          border: 1px solid #d7dde2;
          border-radius: 22px;
          padding: 0 16px;
          background: #fff;
          color: #102b3c;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          text-decoration: none;
          white-space: nowrap;
          font-size: 14px;
          font-weight: 500;
        }
        .billing-button:hover {
          background: #f7f9fa;
          border-color: #aebbc4;
        }
        .billing-button-dark {
          background: #252525;
          border-color: #252525;
          color: #fff;
        }
        .billing-button-dark:hover {
          background: #3a3a3a;
          color: #fff;
        }
        .billing-detail-row {
          min-height: 65px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
        }
        .billing-detail-title {
          font-size: 15px;
          color: #102b3c;
        }
        .billing-detail-sub {
          color: #667d8c;
          font-size: 13px;
          margin-top: 4px;
        }
        .billing-detail-sub.is-incomplete { color: #c64b43; }
        .billing-detail-actions {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .billing-section { margin-top: 0; }
        .billing-section-heading {
          font-size: 19px;
          font-weight: 500;
          margin: 0 0 17px;
          color: #102b3c;
        }
        .billing-toolbar {
          display: flex;
          align-items: center;
          gap: 9px;
          flex-wrap: wrap;
          margin-bottom: 21px;
          position: relative;
          z-index: 5;
        }
        .billing-tabs {
          display: inline-flex;
          padding: 4px;
          gap: 3px;
          border-radius: 11px;
          background: #e8eff0;
          min-height: 40px;
          align-items: center;
        }
        .billing-tab {
          border: 1px solid transparent;
          border-radius: 8px;
          background: transparent;
          color: #496170;
          padding: 6px 12px;
          cursor: pointer;
          font-size: 14px;
        }
        .billing-tab--active {
          background: white;
          border-color: #168b9b;
          color: #087e8b;
          box-shadow: 0 1px 2px rgba(0,0,0,.04);
        }
        .billing-dropdown {
          position: relative;
          display: inline-flex;
          min-width: 0;
        }
        .billing-dropdown-trigger {
          min-height: 40px;
          border: 1px solid #d5dadd;
          border-radius: 11px;
          padding: 0 12px;
          background: #f8f9f9;
          color: #102b3c;
          display: inline-flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          cursor: pointer;
          white-space: nowrap;
          font-size: 14px;
          min-width: 150px;
        }
        .billing-dropdown-trigger:hover,
        .billing-dropdown-trigger.is-open {
          background: #fff;
          border-color: #aebbc4;
        }
        .billing-dropdown-menu {
          position: absolute;
          z-index: 30;
          top: calc(100% + 5px);
          left: 0;
          min-width: 100%;
          width: max-content;
          max-width: min(330px, calc(100vw - 36px));
          max-height: 340px;
          overflow-y: auto;
          padding: 5px 0;
          border: 1px solid #d9dfe3;
          border-radius: 17px;
          background: #fff;
          box-shadow: 0 8px 22px rgba(16, 43, 60, .13);
        }
        .billing-dropdown-option {
          width: 100%;
          min-height: 45px;
          padding: 0 15px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 22px;
          border: 0;
          background: #fff;
          color: #102b3c;
          text-align: left;
          white-space: nowrap;
          cursor: pointer;
          font-size: 14px;
        }
        .billing-dropdown-option:hover { background: #f3f6f7; }
        .billing-dropdown-option.is-selected { font-weight: 500; }
        .billing-dropdown-option svg {
          color: #087e8b;
          flex: 0 0 auto;
        }
        .billing-total { margin: 0 0 20px; }
        .billing-total-label {
          font-size: 13px;
          color: #536b7b;
        }
        .billing-total-value {
          font-size: 24px;
          line-height: 1.35;
          font-weight: 650;
          letter-spacing: -.5px;
          color: #102b3c;
        }
        .billing-chart {
          min-height: 500px;
          padding: 18px 13px 17px;
          overflow: hidden;
        }
        .billing-chart-unit {
          font-size: 11px;
          color: #8798a3;
          margin-bottom: 12px;
        }
        .billing-chart-svg {
          width: 100%;
          height: 370px;
          display: block;
          overflow: visible;
        }
        .billing-chart-footer {
          color: #8294a0;
          text-align: center;
          font-size: 13px;
          margin-top: 18px;
        }
        .billing-chart-empty {
          height: 370px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #8294a0;
          font-size: 14px;
          border-bottom: 1px solid #e5e9ec;
        }
        .billing-breakdown {
          margin-top: 38px;
          overflow: hidden;
        }
        .billing-accordion {
          width: 100%;
          min-height: 62px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 18px 0;
          border: 0;
          background: transparent;
          text-align: left;
          color: #102b3c;
          font-weight: 500;
          font-size: 17px;
          cursor: pointer;
        }
        .billing-accordion:hover { color: #087e8b; }
        .billing-accordion svg {
          color: #627b89;
          transition: transform .18s ease;
        }
        .billing-accordion svg.is-open {
          transform: rotate(90deg);
        }
        .billing-table-wrap { overflow-x: auto; }
        .billing-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
          white-space: nowrap;
        }
        .billing-table th {
          text-align: left;
          padding: 12px 14px;
          color: #718491;
          background: #f8fafb;
          font-weight: 600;
          border-bottom: 1px solid #e7ebee;
        }
        .billing-table td {
          padding: 14px;
          border-bottom: 1px solid #edf0f2;
          color: #334b59;
          max-width: 240px;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .billing-table a {
          color: #087e8b;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          text-decoration: none;
        }
        .billing-table a:hover { text-decoration: underline; }
        .billing-status {
          display: inline-flex;
          padding: 4px 9px;
          border-radius: 20px;
          background: #eef2f4;
          color: #526875;
          font-size: 11px;
          font-weight: 600;
        }
        .billing-status--paid {
          background: #e8f7ef;
          color: #16834a;
        }
        .billing-status--failed {
          background: #fff0ed;
          color: #c24135;
        }
        .billing-toolbar-search {
          display: flex;
          align-items: center;
          gap: 8px;
          min-height: 38px;
          padding: 0 11px;
          border: 1px solid #dce2e6;
          border-radius: 9px;
          background: white;
          color: #82909b;
        }
        .billing-toolbar-search input {
          width: 180px;
          border: 0;
          outline: 0;
          color: #263d4a;
          background: transparent;
          font-size: 13px;
        }
        .billing-empty {
          padding: 35px 18px;
          text-align: center;
          color: #8294a0;
          font-size: 13px;
          line-height: 1.6;
        }
        .billing-empty strong {
          display: block;
          color: #344b58;
          font-size: 14px;
          margin-bottom: 6px;
        }
        .billing-notice {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          padding: 15px 17px;
          border: 1px solid #f1d3a3;
          background: #fffaf0;
          color: #854d0e;
          border-radius: 12px;
          margin: 16px 0;
          font-size: 13px;
        }
        .billing-notice--error {
          border-color: #f1c7c7;
          background: #fff5f5;
          color: #a12b2b;
        }
        .billing-notice p {
          margin: 4px 0 0;
          line-height: 1.5;
        }
        .billing-footnote {
          color: #8294a0;
          font-size: 11px;
          margin-top: 14px;
          line-height: 1.6;
        }
        .billing-spin {
          animation: billing-spin 1s linear infinite;
        }
        @keyframes billing-spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 760px) {
          .billing-page { padding: 20px 14px 40px; }
          .billing-heading { margin-bottom: 30px; }
          .billing-balance {
            padding: 17px 15px 12px;
            margin-bottom: 38px;
          }
          .billing-detail-row {
            align-items: flex-start;
            padding: 12px 0;
          }
          .billing-detail-actions { max-width: 55%; }
          .billing-dropdown-trigger { min-width: 130px; }
          .billing-chart { min-height: 390px; }
          .billing-chart-svg,
          .billing-chart-empty { height: 280px; }
          .billing-toolbar { gap: 7px; }
          .billing-toolbar-search { width: 100%; }
          .billing-toolbar-search input {
            flex: 1;
            width: 100%;
          }
        }
      `}</style>

      <header className="billing-heading">
        <div>
          <h1>Billing</h1>
          <p>Manage your API credits, payment details and usage.</p>
        </div>
      </header>

      {(configError || error) && (
        <div className="billing-notice billing-notice--error" role="alert">
          <AlertCircle size={19} />
          <div>
            <strong>Billing data unavailable</strong>
            <p>{configError || error}</p>
          </div>
        </div>
      )}

      {!endpoint && !configError && (
        <div className="billing-notice">
          <Info size={19} />
          <div>
            <strong>Billing endpoint not configured</strong>
          <p>
  Configure NEXT_PUBLIC_CONSOLE_ENDPOINT_BILLING in your
  apps/console/.env.local file with your verified billing API path.
</p>
          </div>
        </div>
      )}

      <section>
        <h2 className="billing-subtitle">API credit balance</h2>
        <p className="billing-description">
          These credits are specifically for API usage. Learn more about API
          credits.
        </p>

        <div className="billing-panel billing-balance">
          <div className="billing-balance-top">
            <div className="billing-balance-value">
              {balance === undefined
                ? "— remaining"
                : `${displayBalance} remaining`}
            </div>

            <a href="/pricing" className="billing-button">
              Buy more credits
            </a>
          </div>

          <div className="billing-detail-row">
            <div>
              <div className="billing-detail-title">Payment method</div>
              <div
                className={`billing-detail-sub ${
                  paymentMethod ? "" : "is-incomplete"
                }`}
              >
                {paymentMethod
                  ? [
                      cardBrand !== "—" ? cardBrand : "",
                      cardNumber !== "—" ? `•••• ${cardNumber}` : "",
                    ]
                      .filter(Boolean)
                      .join(" ") || "Payment method on file"
                  : "Incomplete"}

                {paymentMethod && paymentStatus !== "—"
                  ? ` · ${paymentStatus}`
                  : ""}
              </div>
            </div>

            <div className="billing-detail-actions">
              {!paymentMethod && (
                <button
                  type="button"
                  className="billing-button billing-button-dark"
                  onClick={() => setAddPaymentOpen(true)}
                >
                  Add payment method
                </button>
              )}

              <a href="/pricing" className="billing-button">
                Manage <ExternalLink size={13} />
              </a>
            </div>
          </div>

          <div className="billing-detail-row">
            <div>
              <div className="billing-detail-title">Auto-refill</div>
              <div className="billing-detail-sub">
                {refillEnabled === true
                  ? `Enabled${
                      refillThreshold !== undefined
                        ? ` · Threshold ${textValue(refillThreshold)}`
                        : ""
                    }${
                      refillAmount !== undefined
                        ? ` · Refill ${textValue(refillAmount)}`
                        : ""
                    }`
                  : "Disabled"}
              </div>
            </div>

            <div className="billing-detail-actions">
              <button
                type="button"
                className="billing-button"
                disabled
                title="Auto-refill requires a billing backend endpoint."
              >
                Add auto-refill
              </button>
            </div>
          </div>

          <div className="billing-detail-row">
            <div>
              <div className="billing-detail-title">Usage tier</div>
              <div className="billing-detail-sub">
                {textValue(usageTier)}
              </div>
            </div>

            <div className="billing-detail-actions">
              <a href="/pricing" className="billing-button">
                Learn more <ExternalLink size={13} />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="billing-section">
        <h2 className="billing-section-heading">Usage</h2>

        <div className="billing-toolbar">
          <div className="billing-tabs" role="group" aria-label="Usage metric">
            <button
              type="button"
              className={`billing-tab ${
                viewMode === "cost" ? "billing-tab--active" : ""
              }`}
              onClick={() => setViewMode("cost")}
            >
              Cost
            </button>

            <button
              type="button"
              className={`billing-tab ${
                viewMode === "usage" ? "billing-tab--active" : ""
              }`}
              onClick={() => setViewMode("usage")}
            >
              Usage
            </button>
          </div>

          <Dropdown
            label="All products"
            value={productFilter}
            options={productOptions}
            onChange={setProductFilter}
          />

          <Dropdown
            label="Event"
            prefix="Event: "
            value={eventFilter}
            options={eventOptions}
            onChange={setEventFilter}
          />

          <Dropdown
            label="Date range"
            value={dateRange}
            options={DATE_OPTIONS}
            onChange={(value) => setDateRange(value as DateRange)}
          />

          <button
            type="button"
            className="billing-button"
            onClick={() => void load()}
            disabled={!endpoint || loading}
            title="Refresh billing data"
          >
            <RefreshCw
              size={15}
              className={loading ? "billing-spin" : ""}
            />
          </button>
        </div>

        <div className="billing-total">
          <div className="billing-total-label">Total</div>
          <div className="billing-total-value">
            {viewMode === "cost"
              ? formatMoney(totalCost, currency)
              : totalTokens > 0
                ? totalTokens.toLocaleString()
                : totalRequests > 0
                  ? totalRequests.toLocaleString()
                  : "0"}
          </div>
        </div>

        <div className="billing-panel billing-chart">
          <div className="billing-chart-unit">
            {viewMode === "cost"
              ? currency
              : totalTokens > 0
                ? "Tokens"
                : "Requests"}
          </div>

          {loading ? (
            <div className="billing-chart-empty">
              Loading usage data…
            </div>
          ) : chartPoints.length === 0 ? (
            <div className="billing-chart-empty">
              {loaded
                ? "No usage data available for the selected filters and period."
                : "Usage chart will appear when billing data is connected."}
            </div>
          ) : (
            <svg
              className="billing-chart-svg"
              viewBox="0 0 1000 300"
              preserveAspectRatio="none"
              role="img"
              aria-label={`${viewMode} usage chart`}
            >
              {[45, 96, 147, 198, 250].map((y) => (
                <line
                  key={y}
                  x1="50"
                  y1={y}
                  x2="950"
                  y2={y}
                  stroke="#edf0f1"
                  strokeWidth="1"
                />
              ))}

              <line
                x1="50"
                y1="25"
                x2="50"
                y2="250"
                stroke="#d8dedf"
                strokeWidth="1"
              />

              <line
                x1="50"
                y1="250"
                x2="950"
                y2="250"
                stroke="#d8dedf"
                strokeWidth="1"
              />

              <text x="10" y="48" fill="#8798a3" fontSize="11">
                {viewMode === "cost" ? currency : "Max"}
              </text>

              <text x="10" y="254" fill="#8798a3" fontSize="11">
                {viewMode === "cost" ? `${currency}0` : "0"}
              </text>

              {chartPoints.length > 1 && (
                <path
                  d={chartPath}
                  fill="none"
                  stroke="#168b9b"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {chartPoints.map((point, index) => (
                <g key={`${point.label}-${index}`}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="3.5"
                    fill="#168b9b"
                  >
                    <title>
                      {point.label}:{" "}
                      {viewMode === "cost"
                        ? formatMoney(point.value, currency)
                        : point.value.toLocaleString()}
                    </title>
                  </circle>

                  {index === 0 ||
                  index === chartPoints.length - 1 ||
                  index %
                    Math.max(1, Math.floor(chartPoints.length / 6)) ===
                    0 ? (
                    <text
                      x={point.x}
                      y="273"
                      fill="#8798a3"
                      fontSize="11"
                      textAnchor="middle"
                    >
                      {point.label}
                    </text>
                  ) : null}
                </g>
              ))}
            </svg>
          )}

          <div className="billing-chart-footer">
            Times shown in UTC
          </div>
        </div>
      </section>

      <section className="billing-breakdown">
        <button
          type="button"
          className="billing-accordion"
          onClick={() => setBreakdownOpen((value) => !value)}
          aria-expanded={breakdownOpen}
        >
          <span>Billing breakdown</span>
          <ChevronRight
            size={18}
            className={breakdownOpen ? "is-open" : ""}
          />
        </button>

        {breakdownOpen && (
          <div className="billing-panel">
            {filteredUsage.length === 0 ? (
              <div className="billing-empty">
                <strong>No billing breakdown available</strong>
                Model-wise cost details will appear here when the billing API
                returns usage records for the selected filters.
              </div>
            ) : (
              <div className="billing-table-wrap">
                <table className="billing-table">
                  <thead>
                    <tr>
                      <th>Product / Model</th>
                      <th>Event</th>
                      <th>Requests</th>
                      <th>Tokens</th>
                      <th>Cost</th>
                      <th>Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredUsage.map((row, index) => (
                      <tr
                        key={textValue(row.id ?? row.requestId ?? index)}
                      >
                        <td>{productFromRow(row)}</td>
                        <td>{eventFromRow(row)}</td>
                        <td>
                          {textValue(
                            getValue(row, [
                              "requests",
                              "requestCount",
                              "request_count",
                            ]),
                          )}
                        </td>
                        <td>
                          {textValue(
                            getValue(row, [
                              "totalTokens",
                              "total_tokens",
                              "tokens",
                            ]),
                          )}
                        </td>
                        <td>
                          {formatMoney(amountFromRow(row), currency)}
                        </td>
                        <td>
                          {formatDate(dateFromRow(row)?.toISOString())}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="billing-breakdown">
        <button
          type="button"
          className="billing-accordion"
          onClick={() => setInvoicesOpen((value) => !value)}
          aria-expanded={invoicesOpen}
        >
          <span>Invoice history</span>
          <ChevronRight
            size={18}
            className={invoicesOpen ? "is-open" : ""}
          />
        </button>

        {invoicesOpen && (
          <div className="billing-panel">
            {invoices.length > 0 ? (
              <>
                <div style={{ padding: "14px 16px" }}>
                  <label className="billing-toolbar-search">
                    <Search size={15} />
                    <input
                      value={invoiceQuery}
                      onChange={(event) =>
                        setInvoiceQuery(event.target.value)
                      }
                      placeholder="Search invoices"
                      aria-label="Search invoices"
                    />
                  </label>
                </div>

                <div className="billing-table-wrap">
                  <table className="billing-table">
                    <thead>
                      <tr>
                        {invoiceColumns.map((column) => (
                          <th key={column}>{humanize(column)}</th>
                        ))}
                        <th>Invoice</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredInvoices.map((row, index) => {
                        const url = safeUrl(
                          getValue(row, [
                            "invoiceUrl",
                            "invoice_url",
                            "hostedInvoiceUrl",
                            "hosted_invoice_url",
                            "pdfUrl",
                            "pdf_url",
                          ]),
                        );

                        const status = textValue(
                          getValue(row, [
                            "status",
                            "paymentStatus",
                            "payment_status",
                          ]),
                        );

                        const statusClass =
                          status.toLowerCase() === "paid" ||
                          status.toLowerCase() === "success"
                            ? "billing-status--paid"
                            : status.toLowerCase() === "failed"
                              ? "billing-status--failed"
                              : "";

                        return (
                          <tr
                            key={textValue(
                              row.id ??
                                row.invoiceNumber ??
                                row.invoice_number ??
                                index,
                            )}
                          >
                            {invoiceColumns.map((column) => (
                              <td key={column}>
                                {column.toLowerCase().includes("status") ? (
                                  <span
                                    className={`billing-status ${statusClass}`}
                                  >
                                    {textValue(row[column])}
                                  </span>
                                ) : column.toLowerCase().includes("date") ||
                                  column.toLowerCase().includes("created") ? (
                                  formatDate(row[column])
                                ) : (
                                  textValue(row[column])
                                )}
                              </td>
                            ))}

                            <td>
                              {url ? (
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Open <ExternalLink size={13} />
                                </a>
                              ) : (
                                "—"
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {filteredInvoices.length === 0 && (
                  <div className="billing-empty">
                    No invoices match your search.
                  </div>
                )}
              </>
            ) : (
              <div className="billing-empty">
                <strong>No invoices available</strong>
                {loaded
                  ? "The billing API has not returned any invoice records."
                  : "Invoice history will appear here when billing data is connected."}
              </div>
            )}
          </div>
        )}
      </section>

      <p className="billing-footnote">
        ModelNow Billing · Payment method management and auto-refill require
        verified billing backend endpoints. This page displays billing values
        returned by your configured API and does not create estimated charges.
      </p>

      {addPaymentOpen && (
        <AddPaymentPopup
          onClose={() => setAddPaymentOpen(false)}
        />
      )}
    </div>
  );
}