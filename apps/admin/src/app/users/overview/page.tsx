// ModelNow Admin Users page

"use client";

import { Users, UserCheck, UserX, Clock3, ShieldCheck } from "lucide-react";

export default function UsersOverviewPage() {
  const metrics = [
    { label: "Total Users", value: "12,840", icon: Users },
    { label: "Active Users", value: "10,245", icon: UserCheck },
    { label: "Inactive Users", value: "2,425", icon: UserX },
    { label: "Pending Verification", value: "128", icon: Clock3 },
  ];

  return (
    <main className="mn-page">
      <p style={{ color: "var(--admin-muted)", fontSize: 12 }}>Administration / Users / Overview</p>
      <h1>User Overview</h1>
      <p style={{ color: "var(--admin-muted)" }}>Monitor user accounts, access and account activity across ModelNow.</p>

      <div className="users-overview-grid">
        {metrics.map(({ label, value, icon: Icon }) => (
          <article className="mn-card" key={label}>
            <Icon size={22} color="var(--admin-primary)" />
            <p style={{ color: "var(--admin-muted)" }}>{label}</p>
            <h2>{value}</h2>
          </article>
        ))}
      </div>

      <section className="mn-card" style={{ marginTop: 22 }}>
        <ShieldCheck size={22} color="var(--admin-primary)" />
        <h2>Administration Summary</h2>
        <p>Review active accounts, pending verification, suspended users and recent sign-in activity.</p>
        <p style={{ color: "var(--admin-muted)", fontSize: 12 }}>The figures above are sample values. Connect the Admin API to display live metrics.</p>
      </section>

      <style jsx>{`
        .users-overview-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-top: 24px;
        }
        .users-overview-grid article { padding: 22px; }
        .users-overview-grid h2 { font-size: 28px; margin: 10px 0 0; }
        @media(max-width: 900px) {
          .users-overview-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media(max-width: 500px) {
          .users-overview-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  );
}
