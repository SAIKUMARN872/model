export default function RagPage() {
  const documents = [
    {
      id: 1,
      name: "Company Knowledge Base",
      type: "PDF",
      status: "Indexed",
    },
    {
      id: 2,
      name: "Product Documentation",
      type: "DOCX",
      status: "Indexed",
    },
    {
      id: 3,
      name: "Support Documents",
      type: "TXT",
      status: "Processing",
    },
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px",
        backgroundColor: "#f8fafc",
        color: "#0f172a",
      }}
    >
      <h1>RAG</h1>

      <p>
        Manage documents and retrieve
        relevant information for AI
        responses.
      </p>

      <section
        style={{
          marginTop: "24px",
          padding: "24px",
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          border:
            "1px solid #e2e8f0",
        }}
      >
        <h2>Knowledge Documents</h2>

        <div
          style={{
            marginTop: "16px",
            display: "grid",
            gap: "16px",
          }}
        >
          {documents.map((document) => (
            <div
              key={document.id}
              style={{
                padding: "16px",
                border:
                  "1px solid #e2e8f0",
                borderRadius: "8px",
              }}
            >
              <h3>{document.name}</h3>

              <p>
                Type: {document.type}
              </p>

              <p>
                Status: {document.status}
              </p>

              <button
                type="button"
                style={{
                  marginTop: "8px",
                  padding:
                    "10px 16px",
                  border: "none",
                  borderRadius: "6px",
                  backgroundColor:
                    "#2563eb",
                  color: "#ffffff",
                  cursor: "pointer",
                }}
              >
                View Document
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}