export default function PromptsPage() {
  const prompts = [
    {
      id: 1,
      title: "General Assistant",
      description:
        "A prompt for general questions and everyday tasks.",
      category: "General",
    },
    {
      id: 2,
      title: "Code Assistant",
      description:
        "A prompt for programming and technical assistance.",
      category: "Development",
    },
    {
      id: 3,
      title: "Content Writer",
      description:
        "A prompt for writing and content creation.",
      category: "Writing",
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
      <h1>Prompts</h1>

      <p>
        Create and manage reusable AI
        prompts.
      </p>

      <section
        style={{
          marginTop: "24px",
          display: "grid",
          gap: "16px",
        }}
      >
        {prompts.map((prompt) => (
          <div
            key={prompt.id}
            style={{
              padding: "20px",
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              border:
                "1px solid #e2e8f0",
            }}
          >
            <h2>{prompt.title}</h2>

            <p>
              {prompt.description}
            </p>

            <p>
              Category: {prompt.category}
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
              Use Prompt
            </button>
          </div>
        ))}
      </section>
    </main>
  );
}