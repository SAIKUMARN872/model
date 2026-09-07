export default function HistoryPage() {
  const historyItems = [
    {
      id: 1,
      title: "AI Model Evaluation",
      description:
        "Evaluated model performance and response quality.",
      date: "Today",
      status: "Completed",
    },
    {
      id: 2,
      title: "Chat Session",
      description:
        "Completed an AI assistant conversation.",
      date: "Yesterday",
      status: "Completed",
    },
    {
      id: 3,
      title: "Model Comparison",
      description:
        "Compared multiple AI models.",
      date: "2 days ago",
      status: "Completed",
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
      <h1>History</h1>

      <p>
        View your previous activities
        and AI interactions.
      </p>

      <section
        style={{
          marginTop: "24px",
          display: "grid",
          gap: "16px",
        }}
      >
        {historyItems.map((item) => (
          <div
            key={item.id}
            style={{
              padding: "20px",
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              border:
                "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
              }}
            >
              <h2
                style={{
                  margin: 0,
                }}
              >
                {item.title}
              </h2>

              <span>
                {item.status}
              </span>
            </div>

            <p
              style={{
                marginTop: "10px",
                color: "#64748b",
              }}
            >
              {item.description}
            </p>

            <small
              style={{
                color: "#94a3b8",
              }}
            >
              {item.date}
            </small>
          </div>
        ))}
      </section>
    </main>
  );
}