
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowDownToLine,
  ArrowUpRight,
  BrainCircuit,
  Search,
  Users,
  Zap,
  CircleDollarSign,
  Clock3,
  Filter,
  X,
} from "lucide-react";

type UserStatus = "Active" | "Idle" | "Restricted";

type UserRecord = {
  id: string;
  name: string;
  email: string;
  organization: string;
  requests: number;
  tokens: number;
  cost: number;
  status: UserStatus;
  lastActive: string;
};

const initialUsers: UserRecord[] = [
  { id: "USR-1001", name: "Aarav Sharma", email: "aarav@example.com", organization: "Acme AI", requests: 8420, tokens: 1240000, cost: 186.42, status: "Active", lastActive: "2 min ago" },
  { id: "USR-1002", name: "Priya Reddy", email: "priya@example.com", organization: "Northstar Labs", requests: 7210, tokens: 980000, cost: 142.8, status: "Active", lastActive: "5 min ago" },
  { id: "USR-1003", name: "Rahul Verma", email: "rahul@example.com", organization: "Acme AI", requests: 5680, tokens: 760000, cost: 108.64, status: "Idle", lastActive: "38 min ago" },
  { id: "USR-1004", name: "Ananya Patel", email: "ananya@example.com", organization: "Vertex Systems", requests: 4920, tokens: 682000, cost: 94.3, status: "Active", lastActive: "8 min ago" },
  { id: "USR-1005", name: "Vikram Rao", email: "vikram@example.com", organization: "Northstar Labs", requests: 3860, tokens: 524000, cost: 76.18, status: "Restricted", lastActive: "3 hours ago" },
  { id: "USR-1006", name: "Meera Singh", email: "meera@example.com", organization: "Vertex Systems", requests: 3240, tokens: 418000, cost: 61.75, status: "Active", lastActive: "12 min ago" },
  { id: "USR-1007", name: "Kiran Kumar", email: "kiran@example.com", organization: "Acme AI", requests: 2180, tokens: 296000, cost: 42.16, status: "Idle", lastActive: "1 hour ago" },
  { id: "USR-1008", name: "Sneha Das", email: "sneha@example.com", organization: "Orbit Digital", requests: 1640, tokens: 218000, cost: 32.4, status: "Active", lastActive: "4 min ago" },
];

const fmt = (value: number) => value.toLocaleString("en-US");
const money = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD" });

export default function UserUsagePage() {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [organization, setOrganization] = useState("All");
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [period, setPeriod] = useState("7");

  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const matchesSearch = `${user.name} ${user.email} ${user.id}`
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchesStatus = status === "All" || user.status === status;
        const matchesOrganization =
          organization === "All" || user.organization === organization;

        return matchesSearch && matchesStatus && matchesOrganization;
      }),
    [users, search, status, organization]
  );

  const totalRequests = filteredUsers.reduce((sum, user) => sum + user.requests, 0);
  const totalTokens = filteredUsers.reduce((sum, user) => sum + user.tokens, 0);
  const totalCost = filteredUsers.reduce((sum, user) => sum + user.cost, 0);
  const activeUsers = filteredUsers.filter((user) => user.status === "Active").length;

  const exportCSV = () => {
    const header = ["User ID", "Name", "Email", "Organization", "Requests", "Tokens", "Cost USD", "Status", "Last Active"];
    const rows = filteredUsers.map((user) => [
      user.id, user.name, user.email, user.organization,
      String(user.requests), String(user.tokens), user.cost.toFixed(2),
      user.status, user.lastActive,
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "modelnow-user-usage.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const updateStatus = (id: string, nextStatus: UserStatus) => {
    setUsers((current) =>
      current.map((user) =>
        user.id === id ? { ...user, status: nextStatus } : user
      )
    );
    setSelectedUser((current) =>
      current?.id === id ? { ...current, status: nextStatus } : current
    );
  };

  const panel = {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    padding: 20,
  } as const;

  const muted = { color: "#64748b", fontSize: 13 } as const;

  const statusStyle = (value: UserStatus) => ({
    display: "inline-block",
    borderRadius: 20,
    padding: "5px 10px",
    fontSize: 11,
    fontWeight: 650,
    background:
      value === "Active" ? "#dcfce7" : value === "Idle" ? "#f1f5f9" : "#fee2e2",
    color:
      value === "Active" ? "#166534" : value === "Idle" ? "#475569" : "#991b1b",
  });

  return (
    <main style={{ minHeight: "100vh", background: "#f8fafc", padding: 30, color: "#0f172a", fontFamily: "Arial, sans-serif" }}>
      <div style={{ maxWidth: 1450, margin: "0 auto" }}>
        <Link href="/usage/overview" style={{ textDecoration: "none", color: "#64748b", fontSize: 13 }}>
          ← Usage &amp; Analytics / Overview
        </Link>

        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 18, flexWrap: "wrap", margin: "22px 0 24px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 30, fontWeight: 750 }}>User Usage</h1>
            <p style={{ ...muted, marginTop: 8 }}>Analyze individual user activity, AI consumption, and estimated costs.</p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <select value={period} onChange={(event) => setPeriod(event.target.value)} style={{ padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: 9, background: "#fff" }}>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
            <button onClick={exportCSV} style={{ display: "flex", alignItems: "center", gap: 8, border: 0, borderRadius: 9, background: "#2563eb", color: "#fff", padding: "11px 14px", cursor: "pointer" }}>
              <ArrowDownToLine size={16} /> Export CSV
            </button>
          </div>
        </header>

        <div style={{ background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", padding: 13, borderRadius: 10, fontSize: 12, marginBottom: 22 }}>
          Sample user records for UI development. Connect your usage API to display actual user metrics. The period selector is a UI control and does not currently fetch historical data.
        </div>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 16, marginBottom: 22 }}>
          {[
            { title: "Users in Results", value: fmt(filteredUsers.length), icon: Users, color: "#2563eb", sub: "Matching current filters" },
            { title: "Total Requests", value: fmt(totalRequests), icon: Activity, color: "#7c3aed", sub: "Across matching users" },
            { title: "Tokens Processed", value: `${(totalTokens / 1000000).toFixed(2)}M`, icon: BrainCircuit, color: "#059669", sub: "Input and output tokens" },
            { title: "Estimated Cost", value: money(totalCost), icon: CircleDollarSign, color: "#d97706", sub: `${activeUsers} active users in results` },
          ].map((metric) => {
            const Icon = metric.icon;
            return (
              <article key={metric.title} style={panel}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={muted}>{metric.title}</span><Icon size={20} color={metric.color} />
                </div>
                <div style={{ fontSize: 27, fontWeight: 750, marginTop: 18 }}>{metric.value}</div>
                <p style={{ ...muted, marginBottom: 0 }}>{metric.sub}</p>
              </article>
            );
          })}
        </section>

        <section style={{ ...panel, marginBottom: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 18 }}>User Activity Directory</h2>
              <p style={muted}>Search, filter, inspect, and manage user usage records.</p>
            </div>
            <span style={{ ...muted, display: "flex", alignItems: "center", gap: 6 }}>
              <Filter size={15} /> {filteredUsers.length} results
            </span>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
            <div style={{ position: "relative", flex: "1 1 240px" }}>
              <Search size={16} style={{ position: "absolute", left: 11, top: 12, color: "#94a3b8" }} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, or user ID..." style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px 10px 35px", border: "1px solid #cbd5e1", borderRadius: 9 }} />
            </div>
            <select value={organization} onChange={(event) => setOrganization(event.target.value)} style={{ padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: 9, background: "#fff" }}>
              <option value="All">All organizations</option>
              <option value="Acme AI">Acme AI</option>
              <option value="Northstar Labs">Northstar Labs</option>
              <option value="Vertex Systems">Vertex Systems</option>
              <option value="Orbit Digital">Orbit Digital</option>
            </select>
            <select value={status} onChange={(event) => setStatus(event.target.value)} style={{ padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: 9, background: "#fff" }}>
              <option value="All">All statuses</option>
              <option value="Active">Active</option>
              <option value="Idle">Idle</option>
              <option value="Restricted">Restricted</option>
            </select>
            {(search || status !== "All" || organization !== "All") && (
              <button onClick={() => { setSearch(""); setStatus("All"); setOrganization("All"); }} style={{ display: "flex", alignItems: "center", gap: 5, padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: 9, background: "#fff", cursor: "pointer" }}>
                <X size={15} /> Clear
              </button>
            )}
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "#f8fafc", color: "#64748b" }}>
                  {["User", "Organization", "Requests", "Tokens", "Est. Cost", "Status", "Last Active", "Action"].map((heading) => (
                    <th key={heading} style={{ padding: 13, borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" }}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td style={{ padding: 13, borderBottom: "1px solid #f1f5f9", minWidth: 190 }}>
                      <div style={{ fontWeight: 650 }}>{user.name}</div>
                      <div style={{ color: "#94a3b8", marginTop: 4 }}>{user.email}</div>
                      <div style={{ color: "#94a3b8", marginTop: 3, fontSize: 10 }}>{user.id}</div>
                    </td>
                    <td style={{ padding: 13, borderBottom: "1px solid #f1f5f9", whiteSpace: "nowrap" }}>{user.organization}</td>
                    <td style={{ padding: 13, borderBottom: "1px solid #f1f5f9" }}>{fmt(user.requests)}</td>
                    <td style={{ padding: 13, borderBottom: "1px solid #f1f5f9" }}>{fmt(user.tokens)}</td>
                    <td style={{ padding: 13, borderBottom: "1px solid #f1f5f9", whiteSpace: "nowrap" }}>{money(user.cost)}</td>
                    <td style={{ padding: 13, borderBottom: "1px solid #f1f5f9" }}><span style={statusStyle(user.status)}>{user.status}</span></td>
                    <td style={{ padding: 13, borderBottom: "1px solid #f1f5f9", whiteSpace: "nowrap", color: "#64748b" }}>{user.lastActive}</td>
                    <td style={{ padding: 13, borderBottom: "1px solid #f1f5f9" }}>
                      <button onClick={() => setSelectedUser(user)} style={{ padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 7, background: "#fff", cursor: "pointer", whiteSpace: "nowrap" }}>View details</button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && <tr><td colSpan={8} style={{ padding: 30, textAlign: "center", color: "#64748b" }}>No users match the selected filters.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <section style={panel}>
          <h2 style={{ fontSize: 18, margin: "0 0 16px" }}>Usage Management</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
            <div style={{ padding: 16, background: "#f8fafc", borderRadius: 10 }}>
              <Zap size={20} color="#2563eb" />
              <h3 style={{ fontSize: 14 }}>Consumption review</h3>
              <p style={muted}>Review token and request usage before applying account limits.</p>
            </div>
            <div style={{ padding: 16, background: "#f8fafc", borderRadius: 10 }}>
              <Clock3 size={20} color="#7c3aed" />
              <h3 style={{ fontSize: 14 }}>Activity monitoring</h3>
              <p style={muted}>Identify active, idle, and restricted users from the sample directory.</p>
            </div>
            <div style={{ padding: 16, background: "#f8fafc", borderRadius: 10 }}>
              <ArrowUpRight size={20} color="#059669" />
              <h3 style={{ fontSize: 14 }}>Cost visibility</h3>
              <p style={muted}>Compare estimated usage costs across users and organizations.</p>
            </div>
          </div>
        </section>

        {selectedUser && (
          <div onClick={() => setSelectedUser(null)} style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(15,23,42,0.45)", display: "flex", justifyContent: "center", alignItems: "center", padding: 20 }}>
            <section onClick={(event) => event.stopPropagation()} style={{ width: "100%", maxWidth: 500, background: "#fff", borderRadius: 16, padding: 25, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 12 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 22 }}>{selectedUser.name}</h2>
                  <p style={muted}>{selectedUser.email}</p>
                  <p style={{ ...muted, fontSize: 11 }}>{selectedUser.id}</p>
                </div>
                <button onClick={() => setSelectedUser(null)} aria-label="Close details" style={{ border: 0, background: "#f1f5f9", borderRadius: 8, padding: 8, cursor: "pointer" }}><X size={18} /></button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
                {[
                  ["Organization", selectedUser.organization],
                  ["Requests", fmt(selectedUser.requests)],
                  ["Tokens", fmt(selectedUser.tokens)],
                  ["Estimated cost", money(selectedUser.cost)],
                  ["Last active", selectedUser.lastActive],
                  ["Status", selectedUser.status],
                ].map(([label, value]) => (
                  <div key={label} style={{ padding: 13, background: "#f8fafc", borderRadius: 9 }}>
                    <div style={muted}>{label}</div><div style={{ marginTop: 6, fontSize: 14, fontWeight: 650 }}>{value}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 22 }}>
                <label htmlFor="user-status" style={{ display: "block", fontSize: 13, fontWeight: 650, marginBottom: 8 }}>Update sample status</label>
                <select id="user-status" value={selectedUser.status} onChange={(event) => updateStatus(selectedUser.id, event.target.value as UserStatus)} style={{ width: "100%", padding: 11, border: "1px solid #cbd5e1", borderRadius: 9, background: "#fff" }}>
                  <option value="Active">Active</option>
                  <option value="Idle">Idle</option>
                  <option value="Restricted">Restricted</option>
                </select>
                <p style={{ ...muted, fontSize: 11 }}>This only changes local sample data; it does not modify a real user account.</p>
              </div>
              <button onClick={() => setSelectedUser(null)} style={{ marginTop: 10, width: "100%", padding: 12, border: 0, borderRadius: 9, background: "#2563eb", color: "#fff", fontWeight: 650, cursor: "pointer" }}>Done</button>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
