export default function ModelsPage() {
  const models = [
    {
      id: 1,
      name: "Default AI Model",
      provider: "Local",
      version: "1.0.0",
      status: "Active",
    },
    {
      id: 2,
      name: "Advanced AI Model",
      provider: "AI Provider",
      version: "2.0.0",
      status: "Active",
    },
    {
      id: 3,
      name: "Fast AI Model",
      provider: "AI Provider",
      version: "1.5.0",
      status: "Inactive",
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
      <h1>AI Models</h1>

      <p>
        View and manage available AI
        models.
      </p>

      <section
        style={{
          marginTop: "24px",
          display: "grid",
          gap: "16px",
        }}
      >
        {models.map((model) => (
          <div
            key={model.id}
            style={{
              padding: "20px",
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              border:
                "1px solid #e2e8f0",
            }}
          >
            <h2>{model.name}</h2>

            <p>
              Provider: {model.provider}
            </p>

            <p>
              Version: {model.version}
            </p>

            <p>
              Status: {model.status}
            </p>

            <button
              type="button"
              style={{
                marginTop: "10px",
                padding: "10px 16px",
                border: "none",
                borderRadius: "6px",
                backgroundColor:
                  "#2563eb",
                color: "#ffffff",
                cursor: "pointer",
              }}
            >
              View Model
            </button>
          </div>
        ))}
      </section>
    </main>
  );
}