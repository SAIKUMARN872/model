type BillingMetric = {
  title: string;
  value: string;
  description: string;
};

type BillingTransaction = {
  id: string;
  description: string;
  amount: string;
  status: "Paid" | "Pending" | "Failed";
  date: string;
};

export default function BillingPage() {
  const billingMetrics: BillingMetric[] = [
    {
      title: "Current Plan",
      value: "Enterprise",
      description: "Active subscription",
    },
    {
      title: "Monthly Spend",
      value: "$12,480",
      description: "Current billing period",
    },
    {
      title: "Usage",
      value: "78%",
      description: "Of monthly allocation",
    },
    {
      title: "Payment Status",
      value: "Active",
      description: "Account in good standing",
    },
  ];

  const transactions: BillingTransaction[] = [
    {
      id: "INV-1001",
      description: "Enterprise subscription",
      amount: "$12,480",
      status: "Paid",
      date: "July 1, 2026",
    },
    {
      id: "INV-1002",
      description: "Additional model usage",
      amount: "$2,840",
      status: "Paid",
      date: "June 1, 2026",
    },
    {
      id: "INV-1003",
      description: "Enterprise subscription",
      amount: "$12,480",
      status: "Paid",
      date: "June 1, 2026",
    },
  ];

  return (
    <main>
      <header>
        <h1>Billing &amp; Usage</h1>
        <p>
          Manage subscriptions, monitor platform usage, review invoices, and
          track billing activity across the ModelNow platform.
        </p>
      </header>

      <section>
        <h2>Billing Overview</h2>

        <div>
          {billingMetrics.map((metric) => (
            <article key={metric.title}>
              <h3>{metric.title}</h3>
              <strong>{metric.value}</strong>
              <p>{metric.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2>Recent Transactions</h2>

        <table>
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{transaction.id}</td>
                <td>{transaction.description}</td>
                <td>{transaction.amount}</td>
                <td>{transaction.status}</td>
                <td>{transaction.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Billing Management</h2>

        <ul>
          <li>Subscription management</li>
          <li>Invoice history</li>
          <li>Payment method management</li>
          <li>Usage-based billing</li>
          <li>Spending limits</li>
          <li>Billing alerts</li>
          <li>Enterprise billing controls</li>
          <li>Usage and cost monitoring</li>
        </ul>
      </section>
    </main>
  );
}
