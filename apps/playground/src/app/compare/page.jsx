export default function ComparePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px",
        backgroundColor: "#f8fafc",
        color: "#0f172a",
      }}
    >
      <h1>Compare Models</h1>

      <p>
        Compare different AI models
        and their capabilities.
      </p>

      <section
        style={{
          marginTop: "24px",
          padding: "24px",
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          border:
            "1px solid #e2e8f0",
          overflowX: "auto",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse:
              "collapse",
          }}
        >
          <thead>
            <tr>
              <th style={cellStyle}>
                Feature
              </th>
              <th style={cellStyle}>
                Model A
              </th>
              <th style={cellStyle}>
                Model B
              </th>
              <th style={cellStyle}>
                Model C
              </th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td style={cellStyle}>
                Provider
              </td>
              <td style={cellStyle}>
                Provider A
              </td>
              <td style={cellStyle}>
                Provider B
              </td>
              <td style={cellStyle}>
                Provider C
              </td>
            </tr>

            <tr>
              <td style={cellStyle}>
                Version
              </td>
              <td style={cellStyle}>
                1.0
              </td>
              <td style={cellStyle}>
                2.0
              </td>
              <td style={cellStyle}>
                3.0
              </td>
            </tr>

            <tr>
              <td style={cellStyle}>
                Status
              </td>
              <td style={cellStyle}>
                Active
              </td>
              <td style={cellStyle}>
                Active
              </td>
              <td style={cellStyle}>
                Active
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>
  );
}

const cellStyle = {
  padding: "14px",
  textAlign: "left",
  borderBottom:
    "1px solid #e2e8f0",
};