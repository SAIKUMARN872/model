
import type { CSSProperties } from "react";

export interface ComparisonModel {
  id: string | number;
  name: string;
  provider: string;
  version: string;
  status: string;
}

interface ComparisonTableProps {
  models?: ComparisonModel[];
}

const defaultModels: ComparisonModel[] = [
  {
    id: 1,
    name: "GPT-5",
    provider: "OpenAI",
    version: "Latest",
    status: "Active",
  },
  {
    id: 2,
    name: "Claude",
    provider: "Anthropic",
    version: "Latest",
    status: "Active",
  },
  {
    id: 3,
    name: "Gemini",
    provider: "Google",
    version: "Latest",
    status: "Inactive",
  },
];

const headerStyle: CSSProperties = {
  padding: "15px 18px",
  textAlign: "left",
  backgroundColor: "#f8fafc",
  borderBottom: "1px solid #e8edf3",
  color: "#64748b",
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "0.4px",
  whiteSpace: "nowrap",
};

const cellStyle: CSSProperties = {
  padding: "17px 18px",
  borderBottom: "1px solid #f1f5f9",
  color: "#334155",
  fontSize: "13px",
};

export default function ComparisonTable({
  models = [],
}: ComparisonTableProps) {
  const data = models.length > 0 ? models : defaultModels;

  return (
    <section
      style={{
        width: "100%",
        overflow: "hidden",
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
      }}
    >
      <div
        style={{
          padding: "18px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          borderBottom: "1px solid #edf1f5",
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              color: "#172033",
              fontSize: "15px",
              fontWeight: 700,
            }}
          >
            Model Comparison
          </h3>

          <p
            style={{
              margin: "5px 0 0",
              color: "#94a3b8",
              fontSize: "12px",
            }}
          >
            Compare available AI models and providers.
          </p>
        </div>

        <span
          style={{
            padding: "6px 10px",
            borderRadius: "20px",
            backgroundColor: "#eff6ff",
            color: "#2563eb",
            fontSize: "11px",
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          {data.length} Models
        </span>
      </div>

      <div style={{ width: "100%", overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            minWidth: "600px",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th style={headerStyle}>MODEL</th>
              <th style={headerStyle}>PROVIDER</th>
              <th style={headerStyle}>VERSION</th>
              <th style={headerStyle}>STATUS</th>
            </tr>
          </thead>

          <tbody>
            {data.map((model) => {
              const isActive =
                model.status.toLowerCase() === "active";

              return (
                <tr key={model.id}>
                  <td style={cellStyle}>
                    <strong
                      style={{
                        color: "#172033",
                        fontWeight: 650,
                      }}
                    >
                      {model.name}
                    </strong>
                  </td>

                  <td style={cellStyle}>
                    {model.provider}
                  </td>

                  <td style={cellStyle}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "5px",
                        backgroundColor: "#f1f5f9",
                        color: "#475569",
                        fontSize: "11px",
                        fontWeight: 600,
                      }}
                    >
                      {model.version}
                    </span>
                  </td>

                  <td style={cellStyle}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "7px",
                        padding: "5px 10px",
                        borderRadius: "20px",
                        backgroundColor: isActive
                          ? "#ecfdf5"
                          : "#fff1f2",
                        color: isActive
                          ? "#15803d"
                          : "#be123c",
                        fontSize: "11px",
                        fontWeight: 650,
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span
                        style={{
                          width: "7px",
                          height: "7px",
                          borderRadius: "50%",
                          backgroundColor: isActive
                            ? "#16a34a"
                            : "#e11d48",
                        }}
                      />

                      {model.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div
        style={{
          padding: "12px 18px",
          backgroundColor: "#fafbfc",
          color: "#94a3b8",
          fontSize: "11px",
        }}
      >
        Showing {data.length} model{data.length !== 1 ? "s" : ""}
      </div>
    </section>
  );
}
