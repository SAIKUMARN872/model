import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, CreditCard } from "lucide-react";

const plans = [
  { name: "Free", price: "₹0", credits: "500", audience: "Consumers and new users", features: ["Explore ModelNow", "Shared usage allowance", "Upgrade when needed"] },
  { name: "Plus", price: "₹699", cadence: "/ month", credits: "2,000", audience: "Regular users and students", features: ["Higher monthly allowance", "Personal projects", "Usage visibility"] },
  { name: "Pro", price: "₹1,499", cadence: "/ month", credits: "5,000", audience: "Developers and professionals", features: ["Professional workloads", "Development workflows", "Usage visibility"], featured: true },
  { name: "Business", price: "₹4,999", cadence: "/ month", credits: "25,000", audience: "Teams and startups", features: ["Team-oriented usage", "Business workflows", "Usage and billing visibility"] },
  { name: "Enterprise", price: "Custom", credits: "Custom", audience: "Large organizations", features: ["Organization-specific agreement", "Configurable requirements", "Enterprise support options"] }
];

export default function PlansPage() {
  return (
    <main className="mn-dashboard mn-page">
      <Link to="/" className="mn-back-link"><ArrowLeft size={16} /> Dashboard</Link>
      <header className="mn-page__header">
        <span className="mn-resource__icon"><CreditCard size={22} /></span>
        <div>
          <p className="mn-eyebrow">MODELNOW SUBSCRIPTIONS</p>
          <h1>Plans and pricing</h1>
          <p className="mn-muted">Select the plan that matches your usage.</p>
        </div>
      </header>

      <div className="mn-plan-grid mn-plan-grid--page">
        {plans.map((plan) => (
          <article className={`mn-plan-card ${plan.featured ? "mn-plan-card--featured" : ""}`} key={plan.name}>
            {plan.featured ? <span className="mn-pill">Popular</span> : null}
            <h2>{plan.name}</h2>
            <p className="mn-plan-card__price">{plan.price}<span>{plan.cadence || ""}</span></p>
            <p className="mn-plan-card__credits">{plan.credits} credits / month</p>
            <p className="mn-plan-card__audience">{plan.audience}</p>
            <ul>
              {plan.features.map((feature) => (
                <li key={feature}><Check size={16} aria-hidden="true" /> {feature}</li>
              ))}
            </ul>
            <Link className={`mn-action ${plan.featured ? "mn-action--primary" : ""}`} to="/billing">
              View billing
            </Link>
          </article>
        ))}
      </div>

      <p className="mn-dashboard__note">
        Pricing is displayed for reference. Subscription checkout, credit allocation, renewal, and entitlement changes must be confirmed by the billing backend.
      </p>
    </main>
  );
}
