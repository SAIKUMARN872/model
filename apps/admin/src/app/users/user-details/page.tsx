// ModelNow Admin Users page
"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Search,
  UserRound,
  Mail,
  Building2,
  ShieldCheck,
  Clock3,
  CalendarDays,
  CheckCircle2,
  Ban,
  KeyRound,
  Activity,
  Monitor,
  Smartphone,
  Globe,
  RefreshCw,
  X,
} from "lucide-react";

type UserStatus = "Active" | "Suspended" | "Pending";

type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: string;
  status: UserStatus;
  joined: string;
  lastActive: string;
  location: string;
  phone: string;
};

const initialUsers: UserRecord[] = [
  {
    id: "USR-1001",
    name: "Alex Morgan",
    email: "alex.morgan@example.com",
    role: "Super Administrator",
    organization: "Acme Corporation",
    status: "Active",
    joined: "January 12, 2026",
    lastActive: "2 minutes ago",
    location: "New York, United States",
    phone: "+1 212 555 0142",
  },
  {
    id: "USR-1002",
    name: "Jordan Lee",
    email: "jordan.lee@example.com",
    role: "Organization Administrator",
    organization: "Northstar Technologies",
    status: "Active",
    joined: "February 04, 2026",
    lastActive: "15 minutes ago",
    location: "San Francisco, United States",
    phone: "+1 415 555 0184",
  },
  {
    id: "USR-1003",
    name: "Taylor Smith",
    email: "taylor.smith@example.com",
    role: "Workspace Administrator",
    organization: "Vertex Labs",
    status: "Active",
    joined: "March 18, 2026",
    lastActive: "32 minutes ago",
    location: "London, United Kingdom",
    phone: "+44 20 7946 0123",
  },
  {
    id: "USR-1004",
    name: "Morgan Davis",
    email: "morgan.davis@example.com",
    role: "Security Auditor",
    organization: "CloudWorks",
    status: "Pending",
    joined: "November 02, 2026",
    lastActive: "Never",
    location: "Not available",
    phone: "Not provided",
  },
  {
    id: "USR-1005",
    name: "Casey Wilson",
    email: "casey.wilson@example.com",
    role: "Member",
    organization: "Nova Research",
    status: "Suspended",
    joined: "August 21, 2026",
    lastActive: "2 days ago",
    location: "Chicago, United States",
    phone: "+1 312 555 0166",
  },
];

const activityItems = [
  {
    title: "Signed in to ModelNow",
    description: "Successful authentication",
    time: "2 minutes ago",
    icon: CheckCircle2,
    color: "green",
  },
  {
    title: "Opened AI Gateway",
    description: "Accessed the model workspace",
    time: "18 minutes ago",
    icon: Activity,
    color: "blue",
  },
  {
    title: "Session refreshed",
    description: "Session token refreshed",
    time: "42 minutes ago",
    icon: RefreshCw,
    color: "purple",
  },
  {
    title: "Security verification completed",
    description: "Account verification successful",
    time: "Yesterday",
    icon: ShieldCheck,
    color: "orange",
  },
];

export default function UserDetailsPage() {
  const [users, setUsers] = useState(initialUsers);
  const [searchId, setSearchId] = useState("USR-1001");
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(
    initialUsers[0]
  );
  const [activeTab, setActiveTab] = useState("Overview");
  const [notice, setNotice] = useState("");
  const [confirmStatus, setConfirmStatus] = useState(false);

  function findUser() {
    const found = users.find(
      (user) => user.id.toLowerCase() === searchId.trim().toLowerCase()
    );

    if (!found) {
      setSelectedUser(null);
      setNotice("No user found. Check the user ID and try again.");
      return;
    }

    setSelectedUser(found);
    setNotice("");
    setActiveTab("Overview");
  }

  function toggleStatus() {
    if (!selectedUser) return;

    const nextStatus: UserStatus =
      selectedUser.status === "Active" ? "Suspended" : "Active";

    const updatedUser = { ...selectedUser, status: nextStatus };

    setUsers((current) =>
      current.map((user) =>
        user.id === selectedUser.id ? updatedUser : user
      )
    );

    setSelectedUser(updatedUser);
    setConfirmStatus(false);
    setNotice(
      `${selectedUser.name}'s status changed to ${nextStatus.toLowerCase()}.`
    );
  }

  return (
    <main className="user-details-page">
      <header className="page-header">
        <div>
          <div className="breadcrumbs">
            Administration <span>/</span> Users <span>/</span> User Details
          </div>
          <h1>User Details</h1>
          <p>Inspect user profiles, access permissions, security, and activity.</p>
        </div>
        <button
          className="button secondary"
          onClick={() => {
            setSearchId("");
            setSelectedUser(null);
            setNotice("");
          }}
        >
          <ArrowLeft size={16} />
          Clear selection
        </button>
      </header>

      {notice && (
        <div className="notice" role="status">
          {notice}
          <button
            className="icon-button"
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
          >
            <X size={16} />
          </button>
        </div>
      )}

      <section className="lookup-panel">
        <div className="lookup-title">
          <div className="lookup-icon">
            <Search size={20} />
          </div>
          <div>
            <h2>Find a user</h2>
            <p>Enter a user ID to inspect the corresponding account.</p>
          </div>
        </div>

        <form
          className="lookup-form"
          onSubmit={(event) => {
            event.preventDefault();
            findUser();
          }}
        >
          <input
            value={searchId}
            onChange={(event) => setSearchId(event.target.value)}
            placeholder="Enter user ID, e.g. USR-1001"
            aria-label="User ID"
          />
          <button className="button primary" type="submit">
            <Search size={16} />
            Find user
          </button>
        </form>

        <div className="quick-users">
          <span>Quick select:</span>
          {users.map((user) => (
            <button
              key={user.id}
              className={`quick-user ${
                selectedUser?.id === user.id ? "quick-user-active" : ""
              }`}
              onClick={() => {
                setSelectedUser(user);
                setSearchId(user.id);
                setNotice("");
                setActiveTab("Overview");
              }}
            >
              {user.id}
            </button>
          ))}
        </div>
      </section>

      {!selectedUser ? (
        <section className="empty-panel">
          <div className="empty-icon">
            <UserRound size={30} />
          </div>
          <h2>Select a user to continue</h2>
          <p>Search by user ID or choose one of the available demo accounts.</p>
        </section>
      ) : (
        <>
          <section className="profile-card">
            <div className="profile-top">
              <div className="profile-identity">
                <div className="avatar">
                  {selectedUser.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .toUpperCase()}
                </div>
                <div>
                  <div className="profile-name-row">
                    <h2>{selectedUser.name}</h2>
                    <span
                      className={`status status-${selectedUser.status.toLowerCase()}`}
                    >
                      <span className="status-dot" />
                      {selectedUser.status}
                    </span>
                  </div>
                  <p className="profile-email">
                    <Mail size={14} />
                    {selectedUser.email}
                  </p>
                  <p className="profile-id">
                    User ID: {selectedUser.id}
                  </p>
                </div>
              </div>

              <div className="profile-actions">
                <button
                  className={`button ${
                    selectedUser.status === "Active" ? "danger" : "primary"
                  }`}
                  disabled={selectedUser.status === "Pending"}
                  onClick={() => setConfirmStatus(true)}
                >
                  {selectedUser.status === "Active" ? (
                    <Ban size={16} />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}
                  {selectedUser.status === "Active"
                    ? "Suspend user"
                    : selectedUser.status === "Suspended"
                      ? "Activate user"
                      : "Pending verification"}
                </button>
              </div>
            </div>

            <div className="profile-stats">
              <ProfileStat
                icon={<ShieldCheck size={17} />}
                label="Assigned role"
                value={selectedUser.role}
              />
              <ProfileStat
                icon={<Building2 size={17} />}
                label="Organization"
                value={selectedUser.organization}
              />
              <ProfileStat
                icon={<Clock3 size={17} />}
                label="Last active"
                value={selectedUser.lastActive}
              />
              <ProfileStat
                icon={<CalendarDays size={17} />}
                label="Member since"
                value={selectedUser.joined}
              />
            </div>
          </section>

          <nav className="tabs" aria-label="User detail sections">
            {["Overview", "Security", "Activity", "Sessions"].map((tab) => (
              <button
                key={tab}
                className={`tab ${activeTab === tab ? "tab-active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "Overview" && <UserRound size={15} />}
                {tab === "Security" && <KeyRound size={15} />}
                {tab === "Activity" && <Activity size={15} />}
                {tab === "Sessions" && <Monitor size={15} />}
                {tab}
              </button>
            ))}
          </nav>

          {activeTab === "Overview" && (
            <div className="content-grid">
              <section className="content-card">
                <div className="section-heading">
                  <div>
                    <h3>Account information</h3>
                    <p>Identity and organization details</p>
                  </div>
                  <UserRound size={19} />
                </div>

                <div className="information-list">
                  <InfoRow label="Full name" value={selectedUser.name} />
                  <InfoRow label="Email address" value={selectedUser.email} />
                  <InfoRow label="User ID" value={selectedUser.id} />
                  <InfoRow label="Phone number" value={selectedUser.phone} />
                  <InfoRow
                    label="Organization"
                    value={selectedUser.organization}
                  />
                  <InfoRow label="Assigned role" value={selectedUser.role} />
                  <InfoRow label="Account created" value={selectedUser.joined} />
                  <InfoRow label="Last activity" value={selectedUser.lastActive} />
                </div>
              </section>

              <div className="right-column">
                <section className="content-card">
                  <div className="section-heading">
                    <div>
                      <h3>Account health</h3>
                      <p>Current account state</p>
                    </div>
                    <Activity size={19} />
                  </div>

                  <div className="health-row">
                    <span>Account status</span>
                    <span
                      className={`status status-${selectedUser.status.toLowerCase()}`}
                    >
                      <span className="status-dot" />
                      {selectedUser.status}
                    </span>
                  </div>
                  <div className="health-row">
                    <span>Email</span>
                    <span className="health-value">
                      {selectedUser.status === "Pending"
                        ? "Verification pending"
                        : "Account available"}
                    </span>
                  </div>
                  <div className="health-row">
                    <span>Role assignment</span>
                    <span className="health-value">Assigned</span>
                  </div>
                  <div className="health-row">
                    <span>Organization</span>
                    <span className="health-value">Linked</span>
                  </div>
                </section>

                <section className="content-card">
                  <div className="section-heading">
                    <div>
                      <h3>Recent activity</h3>
                      <p>Sample platform events</p>
                    </div>
                    <Clock3 size={19} />
                  </div>

                  <div className="activity-list">
                    {activityItems.slice(0, 3).map((item) => {
                      const Icon = item.icon;

                      return (
                        <div className="activity-item" key={item.title}>
                          <div className={`activity-icon ${item.color}`}>
                            <Icon size={16} />
                          </div>
                          <div className="activity-copy">
                            <strong>{item.title}</strong>
                            <span>{item.description}</span>
                            <small>{item.time}</small>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>
            </div>
          )}

          {activeTab === "Security" && (
            <div className="content-grid">
              <section className="content-card">
                <div className="section-heading">
                  <div>
                    <h3>Security overview</h3>
                    <p>Account access and protection information</p>
                  </div>
                  <ShieldCheck size={19} />
                </div>
                <InfoRow
                  label="Account status"
                  value={selectedUser.status}
                />
                <InfoRow label="Assigned role" value={selectedUser.role} />
                <InfoRow
                  label="Email address"
                  value={selectedUser.email}
                />
                <InfoRow
                  label="Verification"
                  value={
                    selectedUser.status === "Pending"
                      ? "Pending"
                      : "Demo: assumed verified"
                  }
                />
                <div className="security-notice">
                  <ShieldCheck size={18} />
                  <div>
                    <strong>Security integration required</strong>
                    <p>
                      MFA, password policy, recovery methods, and real sign-in
                      events must be loaded from your authentication backend.
                    </p>
                  </div>
                </div>
              </section>
              <section className="content-card">
                <div className="section-heading">
                  <div>
                    <h3>Access management</h3>
                    <p>Current permissions assignment</p>
                  </div>
                  <KeyRound size={19} />
                </div>
                <div className="permission-item">
                  <ShieldCheck size={18} />
                  <div>
                    <strong>{selectedUser.role}</strong>
                    <p>Role assigned to this account</p>
                  </div>
                </div>
                <div className="permission-item">
                  <Building2 size={18} />
                  <div>
                    <strong>{selectedUser.organization}</strong>
                    <p>Organization association</p>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === "Activity" && (
            <section className="content-card full-card">
              <div className="section-heading">
                <div>
                  <h3>User activity</h3>
                  <p>Illustrative events for {selectedUser.name}</p>
                </div>
                <Activity size={19} />
              </div>
              <div className="activity-list full-activity-list">
                {activityItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div className="activity-item" key={item.title}>
                      <div className={`activity-icon ${item.color}`}>
                        <Icon size={16} />
                      </div>
                      <div className="activity-copy">
                        <strong>{item.title}</strong>
                        <span>{item.description}</span>
                      </div>
                      <small className="activity-time">{item.time}</small>
                    </div>
                  );
                })}
              </div>
              <p className="demo-note">
                These are sample events, not actual audit records.
              </p>
            </section>
          )}

          {activeTab === "Sessions" && (
            <section className="content-card full-card">
              <div className="section-heading">
                <div>
                  <h3>User sessions</h3>
                  <p>Session details for the selected account</p>
                </div>
                <Monitor size={19} />
              </div>

              {selectedUser.status === "Active" ? (
                <div className="session-row">
                  <div className="session-device">
                    <div className="session-icon">
                      <Monitor size={20} />
                    </div>
                    <div>
                      <strong>Web browser session</strong>
                      <p>Browser and operating system details unavailable</p>
                      <small>{selectedUser.lastActive}</small>
                    </div>
                  </div>
                  <span className="status status-active">
                    <span className="status-dot" />
                    Account active
                  </span>
                </div>
              ) : (
                <div className="empty-state small-empty">
                  <Smartphone size={25} />
                  <strong>No session data available</strong>
                  <span>
                    {selectedUser.status === "Pending"
                      ? "The account is awaiting verification."
                      : "This account is suspended in the demo."}
                  </span>
                </div>
              )}

              <div className="security-notice">
                <Globe size={18} />
                <div>
                  <strong>Live session data is not connected</strong>
                  <p>
                    Connect your authentication provider to retrieve session
                    IDs, IP addresses, device information, and revoke sessions.
                  </p>
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {confirmStatus && selectedUser && (
        <div className="modal-backdrop">
          <section className="confirm-modal" role="dialog" aria-modal="true">
            <div className="confirm-icon">
              {selectedUser.status === "Active" ? (
                <Ban size={23} />
              ) : (
                <CheckCircle2 size={23} />
              )}
            </div>
            <h2>
              {selectedUser.status === "Active"
                ? "Suspend this user?"
                : "Activate this user?"}
            </h2>
            <p>
              {selectedUser.status === "Active"
                ? `${selectedUser.name} will be marked as suspended in this demo.`
                : `${selectedUser.name} will be marked as active in this demo.`}
            </p>
            <div className="modal-actions">
              <button
                className="button secondary"
                onClick={() => setConfirmStatus(false)}
              >
                Cancel
              </button>
              <button
                className={`button ${
                  selectedUser.status === "Active" ? "danger" : "primary"
                }`}
                onClick={toggleStatus}
              >
                Confirm
              </button>
            </div>
          </section>
        </div>
      )}

      <style jsx>{`
        .user-details-page {
          --text: #172033;
          --muted: #748094;
          --border: #e4e8ef;
          --primary: #315fea;
          min-height: 100%;
          padding: 30px;
          background: #f7f8fb;
          color: var(--text);
          font-family: Arial, Helvetica, sans-serif;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 24px;
        }

        .breadcrumbs {
          margin-bottom: 11px;
          color: var(--muted);
          font-size: 12px;
        }

        .breadcrumbs span {
          margin: 0 8px;
          color: #a0a8b6;
        }

        h1 {
          margin: 0;
          font-size: 29px;
          letter-spacing: -0.7px;
        }

        .page-header p {
          margin: 8px 0 0;
          color: var(--muted);
          font-size: 13px;
          line-height: 1.6;
        }

        .button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 39px;
          padding: 0 14px;
          border: 1px solid transparent;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
        }

        .button:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .primary {
          color: white;
          background: var(--primary);
        }

        .primary:hover:not(:disabled) {
          background: #244dc9;
        }

        .secondary {
          color: #344054;
          background: white;
          border-color: #dfe4ec;
        }

        .secondary:hover {
          background: #f4f6fa;
        }

        .danger {
          color: #fff;
          background: #d92d3f;
        }

        .notice {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
          padding: 12px 14px;
          border: 1px solid #c7d7fe;
          border-radius: 8px;
          color: #2447a7;
          background: #eef4ff;
          font-size: 12px;
        }

        .icon-button {
          display: inline-grid;
          place-items: center;
          width: 32px;
          height: 32px;
          border: 1px solid transparent;
          border-radius: 7px;
          color: #748094;
          background: transparent;
          cursor: pointer;
        }

        .icon-button:hover {
          color: #315fea;
          background: #edf2ff;
        }

        .lookup-panel,
        .profile-card,
        .content-card,
        .empty-panel {
          border: 1px solid var(--border);
          border-radius: 12px;
          background: white;
        }

        .lookup-panel {
          padding: 20px;
          margin-bottom: 20px;
        }

        .lookup-title {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 17px;
        }

        .lookup-icon {
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          border-radius: 10px;
          color: #315fea;
          background: #edf2ff;
        }

        .lookup-title h2 {
          margin: 0;
          font-size: 15px;
        }

        .lookup-title p {
          margin: 5px 0 0;
          color: var(--muted);
          font-size: 12px;
        }

        .lookup-form {
          display: flex;
          gap: 10px;
        }

        .lookup-form input {
          flex: 1;
          min-width: 0;
          height: 40px;
          padding: 0 12px;
          border: 1px solid #dfe4ec;
          border-radius: 8px;
          outline: none;
          color: var(--text);
          font-size: 12px;
        }

        .lookup-form input:focus {
          border-color: #9db4ff;
        }

        .quick-users {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 15px;
          color: var(--muted);
          font-size: 11px;
        }

        .quick-user {
          padding: 6px 9px;
          border: 1px solid #e0e5ee;
          border-radius: 6px;
          color: #5b6577;
          background: #fff;
          font-size: 10px;
          cursor: pointer;
        }

        .quick-user-active,
        .quick-user:hover {
          color: #315fea;
          border-color: #c6d4ff;
          background: #f0f4ff;
        }

        .profile-card {
          margin-bottom: 20px;
          padding: 23px;
        }

        .profile-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
        }

        .profile-identity {
          display: flex;
          align-items: center;
          gap: 15px;
          min-width: 0;
        }

        .avatar {
          display: grid;
          place-items: center;
          width: 65px;
          height: 65px;
          flex-shrink: 0;
          border-radius: 50%;
          color: #3155bd;
          background: #eaf0ff;
          font-size: 19px;
          font-weight: 750;
        }

        .profile-name-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
        }

        .profile-name-row h2 {
          margin: 0;
          font-size: 21px;
          letter-spacing: -0.4px;
        }

        .profile-email,
        .profile-id {
          display: flex;
          align-items: center;
          gap: 7px;
          margin: 9px 0 0;
          color: #737e90;
          font-size: 12px;
          overflow-wrap: anywhere;
        }

        .profile-id {
          color: #9aa2b1;
          font-size: 10px;
        }

        .status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 8px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 700;
          white-space: nowrap;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        .status-active {
          color: #167647;
          background: #e9f8ef;
        }

        .status-pending {
          color: #a96508;
          background: #fff4df;
        }

        .status-suspended {
          color: #c23645;
          background: #fff0f1;
        }

        .profile-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 15px;
          margin-top: 24px;
          padding-top: 21px;
          border-top: 1px solid #edf0f5;
        }

        .profile-stat {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          min-width: 0;
        }

        .stat-icon {
          display: grid;
          place-items: center;
          width: 33px;
          height: 33px;
          flex-shrink: 0;
          border-radius: 8px;
          color: #526bba;
          background: #f0f3ff;
        }

        .stat-label {
          margin-bottom: 6px;
          color: #8791a2;
          font-size: 10px;
        }

        .stat-value {
          color: #344054;
          font-size: 11px;
          font-weight: 650;
          line-height: 1.5;
          overflow-wrap: anywhere;
        }

        .tabs {
          display: flex;
          gap: 23px;
          padding: 0 5px;
          margin-bottom: 18px;
          border-bottom: 1px solid #dfe4ec;
          overflow-x: auto;
        }

        .tab {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 12px 5px;
          border: 0;
          border-bottom: 2px solid transparent;
          color: #748094;
          background: transparent;
          font-size: 12px;
          cursor: pointer;
          white-space: nowrap;
        }

        .tab-active {
          border-bottom-color: #315fea;
          color: #315fea;
          font-weight: 700;
        }

        .content-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
          align-items: start;
          gap: 18px;
        }

        .content-card {
          padding: 21px;
          min-width: 0;
        }

        .section-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 19px;
          color: #687386;
        }

        .section-heading h3 {
          margin: 0;
          color: #1e293b;
          font-size: 14px;
        }

        .section-heading p {
          margin: 5px 0 0;
          color: #8791a2;
          font-size: 11px;
        }

        .information-list {
          display: grid;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 15px;
          padding: 13px 0;
          border-bottom: 1px solid #edf0f5;
        }

        .info-row:last-child {
          border-bottom: 0;
        }

        .info-label {
          color: #7b8596;
          font-size: 11px;
        }

        .info-value {
          color: #344054;
          font-size: 11px;
          font-weight: 650;
          text-align: right;
          overflow-wrap: anywhere;
        }

        .right-column {
          display: grid;
          gap: 18px;
        }

        .health-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid #edf0f5;
          color: #697386;
          font-size: 11px;
        }

        .health-row:last-child {
          border-bottom: 0;
        }

        .health-value {
          color: #344054;
          font-size: 11px;
          font-weight: 650;
          text-align: right;
        }

        .activity-list {
          display: grid;
          gap: 17px;
        }

        .activity-item {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          min-width: 0;
        }

        .activity-icon {
          display: grid;
          place-items: center;
          width: 34px;
          height: 34px;
          flex-shrink: 0;
          border-radius: 9px;
        }

        .activity-icon.green {
          color: #16804a;
          background: #e7f8ef;
        }

        .activity-icon.blue {
          color: #315fea;
          background: #edf2ff;
        }

        .activity-icon.purple {
          color: #7954bd;
          background: #f2edff;
        }

        .activity-icon.orange {
          color: #b96a09;
          background: #fff3dc;
        }

        .activity-copy {
          display: grid;
          gap: 5px;
          min-width: 0;
          flex: 1;
        }

        .activity-copy strong {
          color: #344054;
          font-size: 11px;
        }

        .activity-copy span,
        .activity-copy small {
          color: #8791a2;
          font-size: 10px;
          line-height: 1.5;
        }

        .full-card {
          margin-bottom: 20px;
        }

        .full-activity-list {
          gap: 0;
        }

        .full-activity-list .activity-item {
          align-items: center;
          padding: 15px 0;
          border-bottom: 1px solid #edf0f5;
        }

        .full-activity-list .activity-item:last-child {
          border-bottom: 0;
        }

        .activity-time {
          color: #8791a2;
          font-size: 10px;
          white-space: nowrap;
        }

        .demo-note {
          margin: 18px 0 0;
          color: #8791a2;
          font-size: 11px;
        }

        .security-notice {
          display: flex;
          gap: 11px;
          margin-top: 18px;
          padding: 13px;
          border: 1px solid #dce7ff;
          border-radius: 9px;
          color: #315fea;
          background: #f3f6ff;
        }

        .security-notice strong {
          display: block;
          color: #344d92;
          font-size: 11px;
        }

        .security-notice p {
          margin: 6px 0 0;
          color: #66769b;
          font-size: 10px;
          line-height: 1.7;
        }

        .permission-item {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          padding: 14px 0;
          border-bottom: 1px solid #edf0f5;
          color: #526bba;
        }

        .permission-item strong {
          color: #344054;
          font-size: 11px;
        }

        .permission-item p {
          margin: 5px 0 0;
          color: #8791a2;
          font-size: 10px;
        }

        .session-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          padding: 17px 0;
        }

        .session-device {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .session-icon {
          display: grid;
          place-items: center;
          width: 43px;
          height: 43px;
          flex-shrink: 0;
          border-radius: 10px;
          color: #315fea;
          background: #edf2ff;
        }

        .session-device strong {
          color: #344054;
          font-size: 12px;
        }

        .session-device p {
          margin: 6px 0;
          color: #8791a2;
          font-size: 11px;
          line-height: 1.5;
        }

        .session-device small {
          color: #8791a2;
          font-size: 10px;
        }

        .empty-panel {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 280px;
          text-align: center;
          padding: 25px;
        }

        .empty-icon {
          display: grid;
          place-items: center;
          width: 62px;
          height: 62px;
          border-radius: 16px;
          color: #315fea;
          background: #edf2ff;
        }

        .empty-panel h2 {
          margin: 18px 0 8px;
          font-size: 17px;
        }

        .empty-panel p {
          margin: 0;
          color: #8791a2;
          font-size: 12px;
          line-height: 1.6;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 35px 10px;
          color: #8791a2;
          text-align: center;
        }

        .empty-state strong {
          color: #344054;
          font-size: 13px;
        }

        .empty-state span {
          font-size: 11px;
          line-height: 1.6;
        }

        .small-empty {
          min-height: 150px;
        }

        .modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: #0f172a80;
          backdrop-filter: blur(3px);
        }

        .confirm-modal {
          width: 100%;
          max-width: 390px;
          padding: 25px;
          border-radius: 14px;
          background: white;
          box-shadow: 0 20px 70px #0f172a30;
        }

        .confirm-icon {
          display: grid;
          place-items: center;
          width: 47px;
          height: 47px;
          border-radius: 12px;
          color: #c23645;
          background: #fff0f1;
        }

        .confirm-modal h2 {
          margin: 17px 0 9px;
          font-size: 19px;
        }

        .confirm-modal p {
          margin: 0;
          color: #748094;
          font-size: 12px;
          line-height: 1.7;
        }

        .confirm-modal .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 9px;
          margin-top: 23px;
        }

        @media (max-width: 1050px) {
          .profile-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .content-grid {
            grid-template-columns: 1fr;
          }

          .right-column {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 650px) {
          .user-details-page {
            padding: 15px;
          }

          .page-header {
            flex-direction: column;
          }

          .profile-top {
            flex-direction: column;
          }

          .profile-identity {
            align-items: flex-start;
          }

          .profile-name-row h2 {
            font-size: 18px;
          }

          .profile-stats {
            grid-template-columns: 1fr;
          }

          .right-column {
            grid-template-columns: 1fr;
          }

          .lookup-form {
            flex-direction: column;
          }

          .lookup-form .button {
            width: 100%;
          }

          .quick-users {
            align-items: flex-start;
          }

          .profile-card,
          .content-card,
          .lookup-panel {
            padding: 16px;
          }

          .info-row {
            gap: 10px;
          }

          .session-row {
            align-items: flex-start;
            flex-direction: column;
          }

          .full-activity-list .activity-item {
            flex-wrap: wrap;
          }

          .activity-time {
            margin-left: 45px;
          }
        }
      `}</style>
    </main>
  );
}

function ProfileStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="profile-stat">
      <div className="stat-icon">{icon}</div>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="info-row">
      <span className="info-label">{label}</span>
      <span className="info-value">{value}</span>
    </div>
  );
}