"use client";

import { useState } from "react";
import { ShieldCheck, Search, Plus, Activity } from "lucide-react";

export default function GovernancePage() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const records = [
    { name: "Governance Reviews baseline review", status: "Active", owner: "Governance Team" },
    { name: "Quarterly controls review", status: "In review", owner: "Risk Team" },
    { name: "Policy compliance assessment", status: "Pending", owner: "Compliance Team" },
  ];

  const filtered = records.filter((record) =>
    record.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="gov-page">
      <style>{`
        .gov-page {
          min-height: 100vh;
          padding: 30px;
          background: #f8fafc;
          color: #172033;
          font-family: Arial, sans-serif;
        }
        .gov-muted { color: #64748b; font-size: 13px; line-height: 1.6; }
        .gov-header {
          display: flex; justify-content: space-between; align-items: flex-start;
          flex-wrap: wrap; gap: 16px; margin-bottom: 26px;
        }
        .gov-title { font-size: 28px; margin: 8px 0; }
        .gov-button {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 11px 15px; border: 1px solid #dbe2ea;
          border-radius: 9px; background: white; color: #172033; cursor: pointer;
        }
        .gov-primary { background: #315fea; border-color: #315fea; color: white; }
        .gov-grid {
          display: grid; grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px; margin-bottom: 22px;
        }
        .gov-card {
          background: white; border: 1px solid #e2e8f0;
          border-radius: 13px; padding: 20px; min-width: 0;
        }
        .gov-value { font-size: 25px; font-weight: 700; margin: 12px 0 5px; }
        .gov-toolbar {
          display: flex; justify-content: space-between; align-items: center;
          gap: 12px; flex-wrap: wrap; margin-bottom: 18px;
        }
        .gov-search {
          display: flex; align-items: center; gap: 8px; padding: 10px 12px;
          border: 1px solid #dbe2ea; border-radius: 9px; background: white;
        }
        .gov-search input { border: 0; outline: none; min-width: 180px; }
        .gov-table-wrap { overflow-x: auto; }
        .gov-table { width: 100%; min-width: 550px; border-collapse: collapse; font-size: 13px; }
        .gov-table th {
          text-align: left; padding: 13px; background: #f8fafc;
          color: #64748b; border-bottom: 1px solid #e2e8f0;
        }
        .gov-table td { padding: 15px 13px; border-bottom: 1px solid #edf0f4; }
        .gov-status {
          display: inline-block; padding: 5px 9px; border-radius: 20px;
          background: #eff6ff; color: #1d4ed8; font-size: 11px;
        }
        .gov-form { display: grid; gap: 12px; margin-top: 18px; }
        .gov-form input {
          padding: 11px; border: 1px solid #dbe2ea; border-radius: 8px;
          width: 100%;
        }
        @media(max-width: 750px) {
          .gov-page { padding: 18px; }
          .gov-grid { grid-template-columns: 1fr; }
          .gov-title { font-size: 23px; }
        }
      `}</style>

      <header className="gov-header">
        <div>
          <p className="gov-muted">ModelNow / Governance</p>
          <h1 className="gov-title">Governance Reviews</h1>
          <p className="gov-muted">Organize governance reviews, findings, decisions, and follow-ups.</p>
        </div>
        <button className="gov-button gov-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> {showForm ? "Close form" : "New record"}
        </button>
      </header>

      <section className="gov-grid">
        <article className="gov-card">
          <ShieldCheck size={22} color="#315fea" />
          <p className="gov-muted">Governance records</p>
          <p className="gov-value">03</p>
          <span className="gov-muted">Illustrative sample records</span>
        </article>
        <article className="gov-card">
          <Activity size={22} color="#15803d" />
          <p className="gov-muted">Active controls</p>
          <p className="gov-value">01</p>
          <span className="gov-muted">Local demonstration data</span>
        </article>
        <article className="gov-card">
          <Search size={22} color="#7c3aed" />
          <p className="gov-muted">Items requiring review</p>
          <p className="gov-value">02</p>
          <span className="gov-muted">Review and pending statuses</span>
        </article>
      </section>

      <section className="gov-card">
        <div className="gov-toolbar">
          <div>
            <h2 style={{ fontSize: 18, margin: "0 0 6px" }}>Governance Reviews register</h2>
            <p className="gov-muted">Search and review sample governance records.</p>
          </div>
          <div className="gov-search">
            <Search size={16} color="#64748b" />
            <input
              aria-label="Search records"
              placeholder="Search records..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        {showForm && (
          <form className="gov-form" onSubmit={(event) => {
            event.preventDefault();
            window.alert("This starter page uses demo data. Backend saving is not connected.");
          }}>
            <label htmlFor="gov-record-name">Record name</label>
            <input id="gov-record-name" required placeholder="Enter a record name" />
            <button className="gov-button gov-primary" type="submit">Submit demo request</button>
          </form>
        )}

        <div className="gov-table-wrap" style={{ marginTop: 18 }}>
          <table className="gov-table">
            <thead>
              <tr><th>Record</th><th>Owner</th><th>Status</th></tr>
            </thead>
            <tbody>
              {filtered.map((record) => (
                <tr key={record.name}>
                  <td>{record.name}</td>
                  <td>{record.owner}</td>
                  <td><span className="gov-status">{record.status}</span></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={3}>No matching records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="gov-muted" style={{ marginTop: 16 }}>
          This is a frontend starter page with sample data; production governance workflows
          require backend integration.
        </p>
      </section>
    </main>
  );
}

