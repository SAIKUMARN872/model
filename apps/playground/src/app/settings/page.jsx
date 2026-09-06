export default function SettingsPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px",
        backgroundColor: "#f8fafc",
        color: "#0f172a",
      }}
    >
      <h1>Settings</h1>

      <p>
        Manage your application
        preferences and account settings.
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
        <h2>General Settings</h2>

        <div
          style={{
            marginTop: "20px",
            display: "grid",
            gap: "20px",
          }}
        >
          <div>
            <label>
              Application Language
            </label>

            <select
              style={{
                display: "block",
                marginTop: "8px",
                padding: "10px",
                borderRadius: "6px",
                border:
                  "1px solid #e2e8f0",
              }}
              defaultValue="en"
            >
              <option value="en">
                English
              </option>
              <option value="te">
                Telugu
              </option>
              <option value="hi">
                Hindi
              </option>
            </select>
          </div>

          <div>
            <label>
              Theme
            </label>

            <select
              style={{
                display: "block",
                marginTop: "8px",
                padding: "10px",
                borderRadius: "6px",
                border:
                  "1px solid #e2e8f0",
              }}
              defaultValue="light"
            >
              <option value="light">
                Light
              </option>
              <option value="dark">
                Dark
              </option>
            </select>
          </div>

          <div>
            <label>
              Notifications
            </label>

            <div
              style={{
                marginTop: "8px",
              }}
            >
              <input
                type="checkbox"
                defaultChecked
              />

              <span
                style={{
                  marginLeft: "8px",
                }}
              >
                Enable notifications
              </span>
            </div>
          </div>

          <button
            type="button"
            style={{
              width: "fit-content",
              padding: "10px 20px",
              border: "none",
              borderRadius: "6px",
              backgroundColor:
                "#2563eb",
              color: "#ffffff",
              cursor: "pointer",
            }}
          >
            Save Settings
          </button>
        </div>
      </section>
    </main>
  );
}