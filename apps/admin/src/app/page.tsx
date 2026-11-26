
"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Bot,
  Building2,
  Clock3,
  CreditCard,
  Server,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";

import Sidebar from "../components/sidebar";
import Navbar from "../components/navbar";

const overviewStats = [
  {
    label: "Total Users",
    value: "12,840",
    change: "+12.8%",
    positive: true,
    icon: Users,
    description: "Compared to last month",
  },
  {
    label: "Organizations",
    value: "248",
    change: "+8.2%",
    positive: true,
    icon: Building2,
    description: "Compared to last month",
  },
  {
    label: "API Requests",
    value: "8.42M",
    change: "+18.4%",
    positive: true,
    icon: Zap,
    description: "Compared to last month",
  },
  {
    label: "Monthly Revenue",
    value: "$48,290",
    change: "-2.4%",
    positive: false,
    icon: CreditCard,
    description: "Compared to last month",
  },
];

const services = [
  {
    name: "AI Gateway",
    description: "Model routing and API requests",
    status: "Operational",
    icon: Zap,
  },
  {
    name: "Agent Service",
    description: "AI agent execution",
    status: "Operational",
    icon: Bot,
  },
  {
    name: "Infrastructure",
    description: "Platform infrastructure",
    status: "Operational",
    icon: Server,
  },
  {
    name: "Security Service",
    description: "Authentication and access control",
    status: "Operational",
    icon: ShieldCheck,
  },
];

const activities = [
  {
    title: "New organization registered",
    description: "Acme Technologies created an organization",
    time: "5 minutes ago",
    icon: Building2,
  },
  {
    title: "New user joined",
    description: "A new user account was created",
    time: "18 minutes ago",
    icon: Users,
  },
  {
    title: "API usage threshold updated",
    description: "Workspace usage configuration changed",
    time: "42 minutes ago",
    icon: Activity,
  },
  {
    title: "Billing payment received",
    description: "Monthly subscription payment processed",
    time: "1 hour ago",
    icon: CreditCard,
  },
];

export default function AdminPage() {
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobileNavigation = useCallback(() => {
    setMobileOpen(false);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [mobileOpen]);

  return (
    <div className="admin-layout">
      {/* Mobile backdrop */}
      {mobileOpen && (
        <button
          type="button"
          className="admin-mobile-backdrop"
          onClick={closeMobileNavigation}
          aria-label="Close navigation"
        />
      )}

      {/* Sidebar */}
      <aside
        id="admin-sidebar"
        className={[
          "admin-sidebar",
          collapsed ? "is-collapsed" : "",
          mobileOpen ? "is-mobile-open" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-label="Main sidebar"
      >
        <Sidebar
          collapsed={collapsed}
          onCollapse={() => setCollapsed((value) => !value)}
          onNavigate={closeMobileNavigation}
        />
      </aside>

      {/* Main application area */}
      <div className="admin-main">
        {/* Navbar */}
        <Navbar
          onMobileMenuClick={() => setMobileOpen(true)}
        />

        {/* Page content */}
        <main
          id="main-content"
          className="admin-content"
          tabIndex={-1}
        >
          <div className="admin-overview">

            {/* Page heading */}
            <section className="admin-overview-heading">
              <div>
                <span className="admin-overview-eyebrow">
                  ADMINISTRATION
                </span>

                <h1>Platform Overview</h1>

                <p>
                  Monitor your ModelNow platform, manage resources,
                  and track overall system performance.
                </p>
              </div>

              <div className="admin-overview-date">
                <Clock3 size={16} />
                <span>Platform Overview</span>
              </div>
            </section>

            {/* Statistics */}
            <section className="admin-overview-stats">
              {overviewStats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <article
                    className="admin-overview-stat-card"
                    key={stat.label}
                  >
                    <div className="admin-overview-stat-top">
                      <span>{stat.label}</span>

                      <span className="admin-overview-stat-icon">
                        <Icon size={19} />
                      </span>
                    </div>

                    <h2>{stat.value}</h2>

                    <div className="admin-overview-stat-bottom">
                      <span
                        className={
                          stat.positive
                            ? "admin-stat-positive"
                            : "admin-stat-negative"
                        }
                      >
                        {stat.positive ? (
                          <ArrowUpRight size={15} />
                        ) : (
                          <ArrowDownRight size={15} />
                        )}

                        {stat.change}
                      </span>

                      <span>{stat.description}</span>
                    </div>
                  </article>
                );
              })}
            </section>

            {/* Platform status */}
            <section className="admin-overview-section">
              <div className="admin-overview-section-heading">
                <div>
                  <h2>Platform Services</h2>
                  <p>
                    Current health of your ModelNow services.
                  </p>
                </div>

                <span className="admin-service-summary">
                  <span />
                  All systems operational
                </span>
              </div>

              <div className="admin-service-grid">
                {services.map((service) => {
                  const Icon = service.icon;

                  return (
                    <article
                      className="admin-service-card"
                      key={service.name}
                    >
                      <div className="admin-service-card-top">
                        <span className="admin-service-icon">
                          <Icon size={20} />
                        </span>

                        <span className="admin-service-status">
                          <span />
                          {service.status}
                        </span>
                      </div>

                      <h3>{service.name}</h3>

                      <p>{service.description}</p>
                    </article>
                  );
                })}
              </div>
            </section>

            {/* Activity and system health */}
            <section className="admin-overview-bottom">

              {/* Recent activity */}
              <article className="admin-overview-panel">
                <div className="admin-overview-section-heading">
                  <div>
                    <h2>Recent Activity</h2>
                    <p>
                      Latest administrative and platform events.
                    </p>
                  </div>

                  <Activity size={19} />
                </div>

                <div className="admin-activity-list">
                  {activities.map((activity, index) => {
                    const Icon = activity.icon;

                    return (
                      <div
                        className="admin-activity-item"
                        key={index}
                      >
                        <span className="admin-activity-icon">
                          <Icon size={17} />
                        </span>

                        <div className="admin-activity-content">
                          <strong>{activity.title}</strong>
                          <p>{activity.description}</p>
                        </div>

                        <span className="admin-activity-time">
                          {activity.time}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </article>

              {/* System health */}
              <article className="admin-overview-panel">
                <div className="admin-overview-section-heading">
                  <div>
                    <h2>System Health</h2>
                    <p>
                      Platform infrastructure status.
                    </p>
                  </div>

                  <Server size={19} />
                </div>

                <div className="admin-health-overall">
                  <span className="admin-health-check">
                    <ShieldCheck size={27} />
                  </span>

                  <div>
                    <strong>Healthy</strong>
                    <p>All monitored services are operational.</p>
                  </div>
                </div>

                <div className="admin-health-metric">
                  <div>
                    <span>API Availability</span>
                    <strong>99.98%</strong>
                  </div>

                  <div className="admin-health-progress">
                    <span style={{ width: "99.98%" }} />
                  </div>
                </div>

                <div className="admin-health-metric">
                  <div>
                    <span>Service Health</span>
                    <strong>100%</strong>
                  </div>

                  <div className="admin-health-progress">
                    <span style={{ width: "100%" }} />
                  </div>
                </div>

                <div className="admin-health-metric">
                  <div>
                    <span>Infrastructure</span>
                    <strong>Operational</strong>
                  </div>

                  <div className="admin-health-progress">
                    <span style={{ width: "100%" }} />
                  </div>
                </div>
              </article>
            </section>

          </div>
        </main>

        {/* Footer */}
        <footer className="admin-footer">
          <span>
            <strong>ModelNow</strong> Admin Console
          </span>

          <span>
            Enterprise platform management
          </span>
        </footer>
      </div>

      {/* Page styles */}
      <style jsx global>{`
        .admin-overview {
          width: 100%;
          max-width: 1600px;
          margin: 0 auto;
        }

        .admin-overview-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 26px;
        }

        .admin-overview-eyebrow {
          color: #64748b;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.1px;
        }

        .admin-overview-heading h1 {
          margin: 7px 0;
          color: #0f172a;
          font-size: 27px;
          font-weight: 700;
        }

        .admin-overview-heading p,
        .admin-overview-section-heading p {
          margin: 0;
          color: #64748b;
          font-size: 13px;
        }

        .admin-overview-date {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 13px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          color: #475569;
          background: white;
          font-size: 12px;
        }

        .admin-overview-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 28px;
        }

        .admin-overview-stat-card,
        .admin-service-card,
        .admin-overview-panel {
          min-width: 0;
          padding: 19px;
          border: 1px solid #e2e8f0;
          border-radius: 11px;
          background: #fff;
        }

        .admin-overview-stat-top,
        .admin-overview-stat-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .admin-overview-stat-top {
          color: #64748b;
          font-size: 12px;
          font-weight: 500;
        }

        .admin-overview-stat-icon,
        .admin-service-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 37px;
          height: 37px;
          border-radius: 9px;
          color: #2563eb;
          background: #eff6ff;
        }

        .admin-overview-stat-card h2 {
          margin: 17px 0 12px;
          color: #0f172a;
          font-size: 26px;
          font-weight: 700;
        }

        .admin-overview-stat-bottom {
          justify-content: flex-start;
          flex-wrap: wrap;
          color: #94a3b8;
          font-size: 11px;
        }

        .admin-stat-positive,
        .admin-stat-negative {
          display: inline-flex;
          align-items: center;
          gap: 2px;
          font-weight: 600;
        }

        .admin-stat-positive {
          color: #15803d;
        }

        .admin-stat-negative {
          color: #dc2626;
        }

        .admin-overview-section {
          margin-bottom: 27px;
        }

        .admin-overview-section-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 16px;
        }

        .admin-overview-section-heading h2 {
          margin: 0 0 5px;
          color: #0f172a;
          font-size: 16px;
          font-weight: 650;
        }

        .admin-overview-section-heading > svg {
          color: #64748b;
        }

        .admin-service-summary,
        .admin-service-status {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: #15803d;
          font-size: 11px;
          font-weight: 600;
        }

        .admin-service-summary > span,
        .admin-service-status > span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #16a34a;
        }

        .admin-service-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 15px;
        }

        .admin-service-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .admin-service-status {
          font-size: 10px;
        }

        .admin-service-card h3 {
          margin: 17px 0 5px;
          color: #0f172a;
          font-size: 14px;
          font-weight: 650;
        }

        .admin-service-card p {
          margin: 0;
          color: #64748b;
          font-size: 11px;
          line-height: 1.5;
        }

        .admin-overview-bottom {
          display: grid;
          grid-template-columns: minmax(0, 1.5fr) minmax(280px, 1fr);
          gap: 17px;
          align-items: start;
        }

        .admin-overview-panel {
          padding: 20px;
        }

        .admin-activity-list {
          display: flex;
          flex-direction: column;
        }

        .admin-activity-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 0;
          border-bottom: 1px solid #f1f5f9;
        }

        .admin-activity-item:last-child {
          border-bottom: 0;
        }

        .admin-activity-icon {
          display: flex;
          flex-shrink: 0;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 8px;
          color: #475569;
          background: #f1f5f9;
        }

        .admin-activity-content {
          min-width: 0;
          flex: 1;
        }

        .admin-activity-content strong {
          display: block;
          color: #334155;
          font-size: 12px;
          font-weight: 600;
        }

        .admin-activity-content p {
          margin: 4px 0 0;
          color: #94a3b8;
          font-size: 11px;
        }

        .admin-activity-time {
          flex-shrink: 0;
          color: #94a3b8;
          font-size: 10px;
        }

        .admin-health-overall {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 17px 0;
          border-bottom: 1px solid #f1f5f9;
        }

        .admin-health-check {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 43px;
          height: 43px;
          border-radius: 10px;
          color: #15803d;
          background: #f0fdf4;
        }

        .admin-health-overall strong {
          color: #15803d;
          font-size: 14px;
        }

        .admin-health-overall p {
          margin: 4px 0 0;
          color: #64748b;
          font-size: 11px;
        }

        .admin-health-metric {
          padding: 15px 0 4px;
        }

        .admin-health-metric > div:first-child {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 9px;
          color: #64748b;
          font-size: 11px;
        }

        .admin-health-metric strong {
          color: #334155;
          font-size: 11px;
        }

        .admin-health-progress {
          height: 6px;
          overflow: hidden;
          border-radius: 10px;
          background: #e2e8f0;
        }

        .admin-health-progress span {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: #16a34a;
        }

        @media (max-width: 1100px) {
          .admin-overview-stats,
          .admin-service-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 760px) {
          .admin-overview-heading {
            align-items: flex-start;
            flex-direction: column;
          }

          .admin-overview-bottom {
            grid-template-columns: 1fr;
          }

          .admin-activity-time {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .admin-overview-stats,
          .admin-service-grid {
            grid-template-columns: 1fr;
          }

          .admin-overview-heading h1 {
            font-size: 23px;
          }
        }
      `}</style>
    </div>
  );
}
