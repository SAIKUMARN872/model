type SettingsMetric = {
  title: string;
  value: string;
  description: string;
};

type PlatformSetting = {
  id: string;
  category: string;
  setting: string;
  value: string;
  status: "Enabled" | "Disabled" | "Requires Review";
  lastUpdated: string;
};

export default function SettingsPage() {
  const settingsMetrics: SettingsMetric[] = [
    {
      title: "Platform Status",
      value: "Operational",
      description: "All core administrative services are running",
    },
    {
      title: "Active Configurations",
      value: "86",
      description: "Configuration settings currently enabled",
    },
    {
      title: "Pending Changes",
      value: "7",
      description: "Configuration changes awaiting approval",
    },
    {
      title: "Security Controls",
      value: "100%",
      description: "Required security controls configured",
    },
  ];

  const platformSettings: PlatformSetting[] = [
    {
      id: "SET-1001",
      category: "Security",
      setting: "Multi-Factor Authentication",
      value: "Required",
      status: "Enabled",
      lastUpdated: "July 20, 2026",
    },
    {
      id: "SET-1002",
      category: "Security",
      setting: "Session Timeout",
      value: "30 minutes",
      status: "Enabled",
      lastUpdated: "July 18, 2026",
    },
    {
      id: "SET-1003",
      category: "Access",
      setting: "Single Sign-On",
      value: "Enabled",
      status: "Enabled",
      lastUpdated: "July 15, 2026",
    },
    {
      id: "SET-1004",
      category: "Notifications",
      setting: "Security Alerts",
      value: "Enabled",
      status: "Enabled",
      lastUpdated: "July 12, 2026",
    },
    {
      id: "SET-1005",
      category: "Platform",
      setting: "Maintenance Mode",
      value: "Disabled",
      status: "Disabled",
      lastUpdated: "July 10, 2026",
    },
    {
      id: "SET-1006",
      category: "Compliance",
      setting: "Audit Log Retention",
      value: "7 years",
      status: "Requires Review",
      lastUpdated: "July 8, 2026",
    },
  ];

  return (
    <main>
      <header>
        <h1>Platform Settings</h1>

        <p>
          Configure platform-wide security, access, notifications, compliance,
          and operational settings across the ModelNow administration portal.
        </p>
      </header>

      <section>
        <h2>Settings Overview</h2>

        <div>
          {settingsMetrics.map((metric) => (
            <article key={metric.title}>
              <h3>{metric.title}</h3>

              <strong>{metric.value}</strong>

              <p>{metric.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2>Platform Configuration</h2>

        <table>
          <thead>
            <tr>
              <th>Setting ID</th>
              <th>Category</th>
              <th>Setting</th>
              <th>Value</th>
              <th>Status</th>
              <th>Last Updated</th>
            </tr>
          </thead>

          <tbody>
            {platformSettings.map((setting) => (
              <tr key={setting.id}>
                <td>{setting.id}</td>
                <td>{setting.category}</td>
                <td>{setting.setting}</td>
                <td>{setting.value}</td>
                <td>{setting.status}</td>
                <td>{setting.lastUpdated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Configuration Capabilities</h2>

        <ul>
          <li>Platform-wide configuration management</li>
          <li>Security policy configuration</li>
          <li>Authentication and session controls</li>
          <li>Single sign-on configuration</li>
          <li>Notification preferences</li>
          <li>Audit log retention settings</li>
          <li>Compliance configuration</li>
          <li>Maintenance and operational controls</li>
          <li>Configuration approval workflows</li>
          <li>Administrative configuration audit history</li>
        </ul>
      </section>
    </main>
  );
}