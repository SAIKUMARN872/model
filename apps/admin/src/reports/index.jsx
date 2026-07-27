import React, {
  useCallback,
  useMemo,
  useState,
} from "react";

/**
 * Reports Module
 *
 * Responsibilities:
 * - Report definitions
 * - Report generation
 * - Filtering
 * - Date range selection
 * - Report status
 * - CSV export
 * - JSON export
 * - Report download
 * - Report deletion
 */

/* -------------------------------------------------
   Report Types
------------------------------------------------- */

export const REPORT_TYPES = {
  USAGE: "usage",

  COST: "cost",

  AUDIT: "audit",

  SECURITY: "security",

  USERS: "users",

  ORGANIZATIONS:
    "organizations",

  COMPLIANCE:
    "compliance",

  PERFORMANCE:
    "performance",
};

/* -------------------------------------------------
   Report Status
------------------------------------------------- */

export const REPORT_STATUS = {
  PENDING: "pending",

  GENERATING:
    "generating",

  COMPLETED:
    "completed",

  FAILED: "failed",
};

/* -------------------------------------------------
   Report Labels
------------------------------------------------- */

export const REPORT_TYPE_LABELS = {
  [REPORT_TYPES.USAGE]:
    "Usage Report",

  [REPORT_TYPES.COST]:
    "Cost Report",

  [REPORT_TYPES.AUDIT]:
    "Audit Report",

  [REPORT_TYPES.SECURITY]:
    "Security Report",

  [REPORT_TYPES.USERS]:
    "User Report",

  [REPORT_TYPES.ORGANIZATIONS]:
    "Organization Report",

  [REPORT_TYPES.COMPLIANCE]:
    "Compliance Report",

  [REPORT_TYPES.PERFORMANCE]:
    "Performance Report",
};

/* -------------------------------------------------
   Utility: Generate ID
------------------------------------------------- */

function generateId() {
  return `report-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 9)}`;
}

/* -------------------------------------------------
   Utility: Format Date
------------------------------------------------- */

export function formatReportDate(
  date
) {
  if (!date) {
    return "-";
  }

  try {
    return new Intl.DateTimeFormat(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    ).format(
      new Date(date)
    );
  } catch {
    return "-";
  }
}

/* -------------------------------------------------
   Create Report
------------------------------------------------- */

export function createReport(
  config = {}
) {
  return {
    id:
      config.id ||
      generateId(),

    name:
      config.name ||
      "Untitled Report",

    type:
      config.type ||
      REPORT_TYPES.USAGE,

    status:
      config.status ||
      REPORT_STATUS.PENDING,

    description:
      config.description ||
      "",

    dateFrom:
      config.dateFrom ||
      null,

    dateTo:
      config.dateTo ||
      null,

    organizationId:
      config.organizationId ||
      null,

    createdBy:
      config.createdBy ||
      null,

    createdAt:
      config.createdAt ||
      new Date().toISOString(),

    completedAt:
      config.completedAt ||
      null,

    data:
      config.data ||
      [],

    error:
      config.error ||
      null,
  };
}

/* -------------------------------------------------
   Convert Data to CSV
------------------------------------------------- */

export function convertToCSV(
  data = []
) {
  if (
    !Array.isArray(data) ||
    data.length === 0
  ) {
    return "";
  }

  const headers = Object.keys(
    data[0]
  );

  const rows = data.map(
    (item) =>
      headers
        .map((header) => {
          const value =
            item[header] ?? "";

          const stringValue =
            String(value)
              .replace(
                /"/g,
                '""'
              );

          return `"${stringValue}"`;
        })
        .join(",")
  );

  return [
    headers.join(","),
    ...rows,
  ].join("\n");
}

/* -------------------------------------------------
   Download File
------------------------------------------------- */

export function downloadFile(
  content,
  filename,
  mimeType
) {
  const blob =
    new Blob(
      [content],
      {
        type: mimeType,
      }
    );

  const url =
    URL.createObjectURL(
      blob
    );

  const link =
    document.createElement(
      "a"
    );

  link.href = url;

  link.download =
    filename;

  document.body.appendChild(
    link
  );

  link.click();

  document.body.removeChild(
    link
  );

  URL.revokeObjectURL(
    url
  );
}

/* -------------------------------------------------
   Export Report as CSV
------------------------------------------------- */

export function exportReportCSV(
  report
) {
  if (!report) {
    return;
  }

  const csv =
    convertToCSV(
      report.data
    );

  downloadFile(
    csv,
    `${report.name
      .toLowerCase()
      .replace(
        /\s+/g,
        "-"
      )}.csv`,
    "text/csv;charset=utf-8;"
  );
}

/* -------------------------------------------------
   Export Report as JSON
------------------------------------------------- */

export function exportReportJSON(
  report
) {
  if (!report) {
    return;
  }

  const json =
    JSON.stringify(
      report,
      null,
      2
    );

  downloadFile(
    json,
    `${report.name
      .toLowerCase()
      .replace(
        /\s+/g,
        "-"
      )}.json`,
    "application/json"
  );
}

/* -------------------------------------------------
   Report Hook
------------------------------------------------- */

export function useReports(
  initialReports = []
) {
  const [
    reports,
    setReports,
  ] = useState(
    initialReports
  );

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState(null);

  /* -----------------------------------------------
     Add Report
  ------------------------------------------------ */

  const addReport =
    useCallback(
      (config) => {
        const report =
          createReport(
            config
          );

        setReports(
          (current) => [
            report,
            ...current,
          ]
        );

        return report;
      },
      []
    );

  /* -----------------------------------------------
     Update Report
  ------------------------------------------------ */

  const updateReport =
    useCallback(
      (
        reportId,
        updates
      ) => {
        setReports(
          (current) =>
            current.map(
              (report) =>
                report.id ===
                reportId
                  ? {
                      ...report,
                      ...updates,
                    }
                  : report
            )
        );
      },
      []
    );

  /* -----------------------------------------------
     Delete Report
  ------------------------------------------------ */

  const deleteReport =
    useCallback(
      (reportId) => {
        setReports(
          (current) =>
            current.filter(
              (report) =>
                report.id !==
                reportId
            )
        );
      },
      []
    );

  /* -----------------------------------------------
     Generate Report
  ------------------------------------------------ */

  const generateReport =
    useCallback(
      async (
        config
      ) => {
        setIsLoading(
          true
        );

        setError(
          null
        );

        const report =
          addReport({
            ...config,

            status:
              REPORT_STATUS.GENERATING,
          });

        try {
          /*
           * Replace this simulated
           * operation with your API:
           *
           * const response =
           *   await reportsApi.generate(config);
           */

          await new Promise(
            (resolve) =>
              setTimeout(
                resolve,
                800
              )
          );

          const completedReport =
            {
              ...report,

              status:
                REPORT_STATUS.COMPLETED,

              completedAt:
                new Date().toISOString(),

              data:
                config.data ||
                [],
            };

          updateReport(
            report.id,
            completedReport
          );

          return completedReport;
        } catch (generationError) {
          const failedReport =
            {
              ...report,

              status:
                REPORT_STATUS.FAILED,

              error:
                generationError.message ||
                "Report generation failed.",
            };

          updateReport(
            report.id,
            failedReport
          );

          setError(
            failedReport.error
          );

          throw generationError;
        } finally {
          setIsLoading(
            false
          );
        }
      },
      [
        addReport,
        updateReport,
      ]
    );

  /* -----------------------------------------------
     Clear Reports
  ------------------------------------------------ */

  const clearReports =
    useCallback(() => {
      setReports(
        []
      );
    }, []);

  return {
    reports,

    isLoading,

    error,

    addReport,

    updateReport,

    deleteReport,

    generateReport,

    clearReports,
  };
}

/* -------------------------------------------------
   Report Filters
------------------------------------------------- */

export function useReportFilters(
  reports = []
) {
  const [
    search,
    setSearch,
  ] = useState("");

  const [
    type,
    setType,
  ] = useState("all");

  const [
    status,
    setStatus,
  ] = useState("all");

  const filteredReports =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return reports.filter(
        (report) => {
          const matchesSearch =
            !query ||
            report.name
              ?.toLowerCase()
              .includes(
                query
              ) ||
            report.description
              ?.toLowerCase()
              .includes(
                query
              );

          const matchesType =
            type === "all" ||
            report.type ===
              type;

          const matchesStatus =
            status === "all" ||
            report.status ===
              status;

          return (
            matchesSearch &&
            matchesType &&
            matchesStatus
          );
        }
      );
    }, [
      reports,
      search,
      type,
      status,
    ]);

  const resetFilters =
    useCallback(() => {
      setSearch("");

      setType(
        "all"
      );

      setStatus(
        "all"
      );
    }, []);

  return {
    search,

    setSearch,

    type,

    setType,

    status,

    setStatus,

    filteredReports,

    resetFilters,
  };
}

/* -------------------------------------------------
   Report Status Badge
------------------------------------------------- */

export function ReportStatusBadge({
  status,
}) {
  const statusLabels = {
    [REPORT_STATUS.PENDING]:
      "Pending",

    [REPORT_STATUS.GENERATING]:
      "Generating",

    [REPORT_STATUS.COMPLETED]:
      "Completed",

    [REPORT_STATUS.FAILED]:
      "Failed",
  };

  return (
    <span
      className={`report-status report-status-${status}`}
    >
      {statusLabels[
        status
      ] || status}
    </span>
  );
}

/* -------------------------------------------------
   Report Card
------------------------------------------------- */

export function ReportCard({
  report,

  onExportCSV,

  onExportJSON,

  onDelete,
}) {
  return (
    <article
      className="report-card"
    >
      <div className="report-card-header">
        <div>
          <h3>
            {report.name}
          </h3>

          <p>
            {
              REPORT_TYPE_LABELS[
                report.type
              ]
            }
          </p>
        </div>

        <ReportStatusBadge
          status={
            report.status
          }
        />
      </div>

      {report.description && (
        <p>
          {
            report.description
          }
        </p>
      )}

      <div className="report-meta">
        <span>
          Created:{" "}
          {formatReportDate(
            report.createdAt
          )}
        </span>

        {report.completedAt && (
          <span>
            Completed:{" "}
            {formatReportDate(
              report.completedAt
            )}
          </span>
        )}
      </div>

      {report.status ===
        REPORT_STATUS.COMPLETED && (
        <div className="report-actions">
          <button
            type="button"
            onClick={() =>
              onExportCSV?.(
                report
              )
            }
          >
            Export CSV
          </button>

          <button
            type="button"
            onClick={() =>
              onExportJSON?.(
                report
              )
            }
          >
            Export JSON
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() =>
          onDelete?.(
            report.id
          )
        }
      >
        Delete
      </button>
    </article>
  );
}

/* -------------------------------------------------
   Reports Dashboard
------------------------------------------------- */

export function ReportsDashboard({
  initialReports = [],
}) {
  const {
    reports,

    isLoading,

    error,

    generateReport,

    deleteReport,
  } =
    useReports(
      initialReports
    );

  const {
    search,

    setSearch,

    type,

    setType,

    status,

    setStatus,

    filteredReports,

    resetFilters,
  } =
    useReportFilters(
      reports
    );

  const [
    reportName,
    setReportName,
  ] = useState("");

  const [
    reportType,
    setReportType,
  ] = useState(
    REPORT_TYPES.USAGE
  );

  /* -----------------------------------------------
     Generate
  ------------------------------------------------ */

  const handleGenerate =
    async (
      event
    ) => {
      event.preventDefault();

      if (
        !reportName.trim()
      ) {
        return;
      }

      await generateReport({
        name:
          reportName,

        type:
          reportType,

        description:
          `Generated ${REPORT_TYPE_LABELS[
            reportType
          ]}.`,

        data: [],
      });

      setReportName("");
    };

  return (
    <section className="reports-dashboard">
      <header>
        <h1>
          Reports
        </h1>

        <p>
          Generate and manage
          administrative reports.
        </p>
      </header>

      {/* Generate Report */}

      <form
        onSubmit={
          handleGenerate
        }
        className="report-generator"
      >
        <input
          type="text"
          value={
            reportName
          }
          onChange={(
            event
          ) =>
            setReportName(
              event.target.value
            )
          }
          placeholder="Report name"
        />

        <select
          value={
            reportType
          }
          onChange={(
            event
          ) =>
            setReportType(
              event.target.value
            )
          }
        >
          {Object.entries(
            REPORT_TYPE_LABELS
          ).map(
            ([
              value,
              label,
            ]) => (
              <option
                key={
                  value
                }
                value={
                  value
                }
              >
                {label}
              </option>
            )
          )}
        </select>

        <button
          type="submit"
          disabled={
            isLoading ||
            !reportName.trim()
          }
        >
          {isLoading
            ? "Generating..."
            : "Generate Report"}
        </button>
      </form>

      {/* Filters */}

      <div className="report-filters">
        <input
          type="search"
          value={
            search
          }
          onChange={(
            event
          ) =>
            setSearch(
              event.target.value
            )
          }
          placeholder="Search reports..."
        />

        <select
          value={
            type
          }
          onChange={(
            event
          ) =>
            setType(
              event.target.value
            )
          }
        >
          <option value="all">
            All Types
          </option>

          {Object.entries(
            REPORT_TYPE_LABELS
          ).map(
            ([
              value,
              label,
            ]) => (
              <option
                key={
                  value
                }
                value={
                  value
                }
              >
                {label}
              </option>
            )
          )}
        </select>

        <select
          value={
            status
          }
          onChange={(
            event
          ) =>
            setStatus(
              event.target.value
            )
          }
        >
          <option value="all">
            All Statuses
          </option>

          {Object.entries(
            REPORT_STATUS
          ).map(
            ([
              key,
              value,
            ]) => (
              <option
                key={
                  value
                }
                value={
                  value
                }
              >
                {key}
              </option>
            )
          )}
        </select>

        <button
          type="button"
          onClick={
            resetFilters
          }
        >
          Reset
        </button>
      </div>

      {/* Error */}

      {error && (
        <div className="report-error">
          {error}
        </div>
      )}

      {/* Reports */}

      <div className="reports-list">
        {filteredReports.length ===
        0 ? (
          <div className="empty-state">
            No reports found.
          </div>
        ) : (
          filteredReports.map(
            (
              report
            ) => (
              <ReportCard
                key={
                  report.id
                }
                report={
                  report
                }
                onExportCSV={
                  exportReportCSV
                }
                onExportJSON={
                  exportReportJSON
                }
                onDelete={
                  deleteReport
                }
              />
            )
          )
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------
   Default Export
------------------------------------------------- */

export default ReportsDashboard;