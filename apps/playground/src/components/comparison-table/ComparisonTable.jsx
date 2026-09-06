import React from "react";

export default function ComparisonTable({
  models = [],
}) {
  const defaultModels = [
    {
      id: 1,
      name: "Model A",
      provider: "Provider A",
      version: "1.0",
      status: "Active",
    },
    {
      id: 2,
      name: "Model B",
      provider: "Provider B",
      version: "2.0",
      status: "Active",
    },
    {
      id: 3,
      name: "Model C",
      provider: "Provider C",
      version: "3.0",
      status: "Inactive",
    },
  ];

  const data =
    models.length > 0
      ? models
      : defaultModels;

  return (
    <div
      style={{
        width: "100%",
        overflowX: "auto",
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        border:
          "1px solid #e2e8f0",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse:
            "collapse",
          minWidth: "600px",
        }}
      >
        <thead>
          <tr>
            <th style={headerStyle}>
              Model
            </th>

            <th style={headerStyle}>
              Provider
            </th>

            <th style={headerStyle}>
              Version
            </th>

            <th style={headerStyle}>
              Status
            </th>
          </tr>
        </thead>

        <tbody>
          {data.map((model) => (
            <tr key={model.id}>
              <td style={cellStyle}>
                {model.name}
              </td>

              <td style={cellStyle}>
                {model.provider}
              </td>

              <td style={cellStyle}>
                {model.version}
              </td>

              <td style={cellStyle}>
                <span
                  style={{
                    padding:
                      "4px 10px",
                    borderRadius: "12px",
                    backgroundColor:
                      model.status ===
                      "Active"
                        ? "#dcfce7"
                        : "#fee2e2",
                    color:
                      model.status ===
                      "Active"
                        ? "#166534"
                        : "#991b1b",
                  }}
                >
                  {model.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const headerStyle = {
  padding: "14px 16px",
  textAlign: "left",
  backgroundColor: "#f8fafc",
  borderBottom:
    "1px solid #e2e8f0",
  fontWeight: 600,
};

const cellStyle = {
  padding: "14px 16px",
  borderBottom:
    "1px solid #e2e8f0",
};