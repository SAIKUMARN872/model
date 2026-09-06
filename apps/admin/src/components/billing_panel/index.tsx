type BillingMetric = {
  title: string;
  value: string;
  description: string;
};

type BillingSubscription = {
  id: string;
  organization: string;
  plan: "Enterprise" | "Business" | "Starter";
  status: "Active" | "Past Due" | "Cancelled";
  amount: string;
  renewalDate: string;
};

type BillingPanelProps = {
  subscriptions?: BillingSubscription[];
};

const defaultSubscriptions: BillingSubscription[] = [
  {
    id: "SUB-1001",
    organization: "Acme Corporation",
    plan: "Enterprise",
    status: "Active",
    amount: "$4,999 / month",
    renewalDate: "August 12, 2026",
  },
  {
    id: "SUB-1002",
    organization: "Northstar Technologies",
    plan: "Enterprise",
    status: "Active",
    amount: "$4,999 / month",
    renewalDate: "August 20, 2026",
  },
  {
    id: "SUB-1003",
    organization: "Vertex Labs",
    plan: "Business",
    status: "Active",
    amount: "$1,499 / month",
    renewalDate: "August 5, 2026",
  },
  {
    id: "SUB-1004",
    organization: "CloudWorks",
    plan: "Business",
    status: "Past Due",
    amount: "$1,499 / month",
    renewalDate: "July 28, 2026",
  },
  {
    id: "SUB-1005",
    organization: "Nova Research",
    plan: "Starter",
    status: "Cancelled",
    amount: "$299 / month",
    renewalDate: "July 15, 2026",
  },
];

export default function BillingPanel({
  subscriptions = defaultSubscriptions,
}: BillingPanelProps) {
  const billingMetrics: BillingMetric[] = [
    {
      title: "Monthly Recurring Revenue",
      value: "$842,640",
      description: "Current recurring subscription revenue",
    },
    {
      title: "Active Subscriptions",
      value: "1,247",
      description: "Currently active customer subscriptions",
    },
    {
      title: "Past Due Accounts",
      value: "18",
      description: "Subscriptions requiring payment attention",
    },
    {
      title: "Annualized Revenue",
      value: "$10.1M",
      description: "Projected annual recurring revenue",
    },
  ];

  return (
    <section>
      <header>
        <h2>Billing Overview</h2>

        <p>
          Monitor subscriptions, recurring revenue, payment status, and
          enterprise billing activity across the ModelNow platform.
        </p>
      </header>

      <section>
        <h3>Billing Metrics</h3>

        <div>
          {billingMetrics.map((metric) => (
            <article key={metric.title}>
              <h4>{metric.title}</h4>

              <strong>{metric.value}</strong>

              <p>{metric.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h3>Subscription Directory</h3>

        <table>
          <thead>
            <tr>
              <th>Subscription ID</th>
              <th>Organization</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Renewal Date</th>
            </tr>
          </thead>

          <tbody>
            {subscriptions.map((subscription) => (
              <tr key={subscription.id}>
                <td>{subscription.id}</td>
                <td>{subscription.organization}</td>
                <td>{subscription.plan}</td>
                <td>{subscription.status}</td>
                <td>{subscription.amount}</td>
                <td>{subscription.renewalDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h3>Billing Capabilities</h3>

        <ul>
          <li>Subscription lifecycle management</li>
          <li>Enterprise plan management</li>
          <li>Recurring revenue monitoring</li>
          <li>Payment status tracking</li>
          <li>Past-due account monitoring</li>
          <li>Subscription renewal tracking</li>
          <li>Billing account administration</li>
          <li>Revenue reporting</li>
          <li>Plan and pricing governance</li>
          <li>Billing activity audit history</li>
        </ul>
      </section>
    </section>
  );
}