import React from "react";
import { Link } from "react-router-dom";
import {
  Activity, ArrowRight, Boxes, CreditCard, FileKey2,
  Gauge, Workflow, Zap
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const resources = [
  { title: "Fast Mode", description: "Read the Fast Mode documentation and learn how to use it.", path: "/docs/fast-mode", icon: Zap },
  { title: "Batch API", description: "Learn how to submit and process batch requests.", path: "/docs/batch-api", icon: Activity },
  { title: "Prompt Caching", description: "Learn how prompt caching improves efficiency and reduces repeated-input costs.", path: "/docs/prompt-caching", icon: Boxes }
];

type MetricCardProps = {
  title: string;
  value: string;
  detail: string;
  icon: LucideIcon;
};

function MetricCard({ title, value, detail, icon: Icon }: MetricCardProps) {
  return (
    <article className="mn-metric-card">
      <div className="mn-metric-card__heading">
        <span>{title}</span>
        <Icon size={18} aria-hidden="true" />
      </div>
      <strong className="mn-metric-card__value">{value}</strong>
      <p>{detail}</p>
    </article>
  );
}

export default function DashboardPage() {
  return (
    <main className="mn-dashboard">
      <header className="mn-dashboard__header">
        <div>
          <p className="mn-eyebrow">MODELNOW CONSOLE</p>
          <h1>Welcome to ModelNow</h1>
          <p className="mn-muted">Your workspace for AI models, API access, and enterprise workflows.</p>
        </div>
        <div className="mn-dashboard__actions">
          <Link className="mn-action" to="/api-keys?create=1">
            <FileKey2 size={18} /> Get API key
          </Link>
          <Link className="mn-action mn-action--primary" to="/plans">
            <ArrowRight size={16} /> Upgrade
          </Link>
        </div>
      </header>

      <section className="mn-metrics-grid" aria-label="Organization metrics">
        <Link to="/credits" className="mn-metric-card mn-metric-card--link"><MetricCard title="Organization credits" value="—" detail="Open your organization credit balance." icon={Gauge} /></Link>
        <Link to="/spend" className="mn-metric-card mn-metric-card--link"><MetricCard title="Spend this month" value="—" detail="Open total, token, execution, and runtime cost." icon={CreditCard} /></Link>
        <Link to="/prompt-caching" className="mn-metric-card mn-metric-card--link"><MetricCard title="Prompt caching" value="—" detail="Open cache usage and performance metrics." icon={Zap} /></Link>
      </section>

      <Link to="/token-volume" className="mn-token-panel mn-token-panel--link" aria-label="Open token volume details">
        <div>
          <div className="mn-metric-card__heading"><span>Token volume</span><Activity size={18} /></div>
          <strong className="mn-metric-card__value">—</strong>
          <p>Connect the usage API to display token activity.</p>
        </div>
        <Link className="mn-action" to="/usage">View usage <ArrowRight size={16} /></Link>
      </Link>

      <section className="mn-api-prompt">
        <div className="mn-api-prompt__icon"><FileKey2 size={22} /></div>
        <div>
          <h2>Ready to connect your application?</h2>
          <p>Create and manage credentials through the authenticated API-key service.</p>
        </div>
        <Link className="mn-action mn-action--primary" to="/api-keys?create=1">
          Get API key <ArrowRight size={16} />
        </Link>
      </section>

      <style>{`
        .mn-api-catalog-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
        }
        .mn-api-catalog-card {
          min-width: 0;
          overflow: hidden;
          border: 1px solid var(--border, #e5e7eb);
          border-radius: 16px;
          background: var(--card, #fff);
        }
        .mn-api-catalog-card__banner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          min-height: 150px;
          margin: 12px 12px 0;
          border-radius: 10px;
          color: #fff;
          text-decoration: none;
          text-align: center;
          padding: 16px;
          transition: filter 150ms ease;
        }
        .mn-api-catalog-card__banner:hover {
          filter: brightness(1.15);
        }
        .mn-api-catalog-card__banner span {
          font-size: clamp(16px, 1.6vw, 25px);
          font-weight: 500;
        }
        .mn-api-catalog-card__body {
          display: grid;
          gap: 8px;
          padding: 16px;
        }
        .mn-api-catalog-card__body h3 {
          margin: 0;
          font-size: 18px;
        }
        .mn-api-catalog-card__body h3 a {
          color: inherit;
          text-decoration: none;
        }
        .mn-api-catalog-card__body h3 a:hover {
          text-decoration: underline;
        }
        .mn-api-catalog-card__price {
          margin: 2px 0 0;
          font-size: 22px;
          font-weight: 700;
        }
        .mn-api-catalog-card__body .mn-muted {
          margin: 0;
        }
        .mn-api-catalog-card__body .mn-text-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 8px;
        }
        @media (max-width: 1000px) {
          .mn-api-catalog-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 600px) {
          .mn-api-catalog-grid {
            grid-template-columns: minmax(0, 1fr);
          }
        }
      `}</style>      <section className="mn-dashboard-section">
        <div className="mn-section-heading">
          <div>
            <p className="mn-eyebrow">EXPLORE APIS</p>
            <h2>Explore ModelNow APIs</h2>
            <p className="mn-muted">Discover AI capabilities and pricing for your applications.</p>
          </div>
        </div>

        <div className="mn-api-catalog-grid">
          {[
            {
              title: "Browser Automation API",
              price: "$0.05",
              detail: "Per browser task",
              path: "/browser-automation",
              icon: Gauge,
              banner: "linear-gradient(120deg, #102e32, #315e61, #0b171d)"
            },
            {
              title: "Knowledge Hub API",
              price: "$0.01",
              detail: "Per search",
              path: "/knowledge-hub",
              icon: Boxes,
              banner: "linear-gradient(120deg, #080d1c, #183b53, #07101a)"
            },
            {
              title: "Agents & Workflows API",
              price: "$0.05",
              detail: "Per workflow execution",
              path: "/agents",
              icon: Workflow,
              banner: "linear-gradient(120deg, #30251d, #8b6038, #111c1c)"
            },
            {
              title: "Fine-Tuning API",
              price: "$10.00+",
              detail: "Per training job, plus compute",
              path: "/fine-tuning",
              icon: Zap,
              banner: "linear-gradient(120deg, #101321, #39355b, #101820)"
            },
            {
              title: "Computer Use API",
              price: "$0.10",
              detail: "Per computer-use task",
              path: "/computer-use",
              icon: FileKey2,
              banner: "linear-gradient(120deg, #0c1c25, #28505c, #15131e)"
            },
            {
              title: "Multimodal AI API",
              price: "$0.05",
              detail: "Per operation",
              path: "/multimodal-ai",
              icon: Activity,
              banner: "linear-gradient(120deg, #151c32, #23616b, #4c392f)"
            }
          ].map(({ title, price, detail, path, icon: Icon, banner }) => (
            <article className="mn-api-catalog-card" key={title}>
              <Link
                className="mn-api-catalog-card__banner"
                to={path}
                style={{ background: banner }}
                aria-label={`Explore ${title}`}
              >
                <Icon size={32} aria-hidden="true" />
                <span>{title.replace(" API", "")}</span>
              </Link>
              <div className="mn-api-catalog-card__body">
                <h3><Link to={path}>{title}</Link></h3>
                <p className="mn-api-catalog-card__price">{price}</p>
                <p className="mn-muted">{detail}</p>
                <Link className="mn-text-link" to={path}>
                  Explore API <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="mn-dashboard-section">
        <div className="mn-section-heading">
          <div>
            <p className="mn-eyebrow">WORKSPACE</p>
            <h2>Resources</h2>
            <p className="mn-muted">Quick access to your ModelNow tools.</p>
          </div>
        </div>
        <div className="mn-resources-grid">
          {resources.filter(({ title }) => ["Fast Mode", "Batch API", "Prompt Caching"].includes(title)).map(({ title, description, path, icon: Icon }) => (
            <article className="mn-resource" key={title}>
              <span className="mn-resource__icon"><Icon size={20} aria-hidden="true" /></span>
              <div className="mn-resource__body">
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
              <Link className="mn-resource__open" to={path}>
                Open documentation <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <p className="mn-dashboard__note">
        Live balances, usage, caching, and billing values will appear when their backend services are connected.
      </p>
    </main>
  );
}
