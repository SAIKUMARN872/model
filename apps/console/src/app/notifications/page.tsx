import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Bell, ShieldCheck } from "lucide-react";

export default function NotificationsPage() {
  return (
    <main className="mn-dashboard mn-page">
      <Link to="/" className="mn-back-link"><ArrowLeft size={16} /> Dashboard</Link>
      <header className="mn-page__header">
        <span className="mn-resource__icon"><Bell size={22} /></span>
        <div>
          <p className="mn-eyebrow">MODELNOW PLATFORM</p>
          <h1>Notifications</h1>
          <p className="mn-muted">Review important updates and alerts for your organization.</p>
        </div>
      </header>

      <section className="mn-panel">
        <h2>Notification inbox</h2>
        <p className="mn-muted">The notification service is not connected to this page yet. Notifications will appear when an authenticated backend provides the organization's records.</p>
        <p><ShieldCheck size={17} /> No notification records or delivery statuses are fabricated.</p>
      </section>
    </main>
  );
}