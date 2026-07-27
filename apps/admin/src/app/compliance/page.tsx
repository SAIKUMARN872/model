type ComplianceMetric = {
  title: string;
  value: string;
  description: string;
};

type ComplianceFramework = {
  name: string;
  status: "Compliant" | "In Progress" | "Review Required";
  coverage: string;
  lastReview: string;
};

export default function CompliancePage() {
  const complianceMetrics: ComplianceMetric[] = [
    {
      title: "Overall Compliance",
      value: "98.4%",
      description: "Platform-wide compliance score",
    },
    {
      title: "Active Frameworks",
      value: "8",
      description: "Compliance frameworks monitored",
    },
    {
      title: "Open Findings",
      value: "12",
      description: "Items requiring remediation",
    },
    {
      title: "Controls Verified",
      value: "246",
      description: "Controls verified this quarter",
    },
  ];

  const complianceFrameworks: ComplianceFramework[] = [
    {
      name: "SOC 2 Type II",
      status: "Compliant",
      coverage: "100%",
      lastReview: "July 20, 2026",
    },
    {
      name: "ISO 27001",
      status: "Compliant",
      coverage: "98%",
      lastReview: "July 18, 2026",
    },
    {
      name: "GDPR",
      status: "Compliant",
      coverage: "99%",
      lastReview: "July 15, 2026",
    },
    {
      name: "HIPAA",
      status: "Review Required",
      coverage: "94%",
      lastReview: "July 12, 2026",
    },
    {
      name: "PCI DSS",
      status: "In Progress",
      coverage: "87%",
      lastReview: "July 10, 2026",
    },
  ];

  return (
    <main>
      <header>
        <h1>Compliance Center</h1>

        <p>
          Monitor regulatory requirements, security controls, compliance
          frameworks, risk findings, and governance activities across the
          ModelNow platform.
        </p>
      </header>

      <section>
        <h2>Compliance Overview</h2>

        <div>
          {complianceMetrics.map((metric) => (
            <article key={metric.title}>
              <h3>{metric.title}</h3>

              <strong>{metric.value}</strong>

              <p>{metric.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2>Compliance Frameworks</h2>

        <table>
          <thead>
            <tr>
              <th>Framework</th>
              <th>Status</th>
              <th>Coverage</th>
              <th>Last Review</th>
            </tr>
          </thead>

          <tbody>
            {complianceFrameworks.map((framework) => (
              <tr key={framework.name}>
                <td>{framework.name}</td>
                <td>{framework.status}</td>
                <td>{framework.coverage}</td>
                <td>{framework.lastReview}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Compliance Capabilities</h2>

        <ul>
          <li>Regulatory framework monitoring</li>
          <li>Security control management</li>
          <li>Compliance evidence collection</li>
          <li>Risk and finding management</li>
          <li>Policy lifecycle management</li>
          <li>Audit readiness monitoring</li>
          <li>Data privacy governance</li>
          <li>Third-party risk management</li>
          <li>Compliance reporting</li>
          <li>Continuous control monitoring</li>
        </ul>
      </section>
    </main>
  );
}