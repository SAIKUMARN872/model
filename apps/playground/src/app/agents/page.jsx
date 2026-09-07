export default function Page() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px",
        backgroundColor: "#f8fafc",
        color: "#0f172a",
      }}
    >
      <h1>AI Platform</h1>

      <p>
        Welcome to the AI Platform
        dashboard.
      </p>

      <section
        style={{
          marginTop: "24px",
          padding: "24px",
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
        }}
      >
        <h2>Dashboard</h2>

        <p>
          Your application is running
          successfully.
        </p>
      </section>
    </main>
  );
}