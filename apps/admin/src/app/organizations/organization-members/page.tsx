"use client";

import {
  useMemo,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";
import {
  Users,
  Search,
  Plus,
  X,
  Pencil,
  Eye,
  ShieldCheck,
  UserCheck,
  UserX,
  Clock3,
  Mail,
  CalendarDays,
  Download,
  RefreshCw,
  Filter,
  MoreHorizontal,
  CheckCircle2,
  Building2,
  Trash2,
  ChevronDown,
  ArrowUpRight,
  UserPlus,
  LockKeyhole,
  Activity,
  SlidersHorizontal,
} from "lucide-react";

type MemberRole = "Owner" | "Admin" | "Developer" | "Member" | "Viewer";
type MemberStatus = "Active" | "Invited" | "Suspended";
type ModalType = "add" | "edit" | "view" | null;

type OrganizationMember = {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  status: MemberStatus;
  team: string;
  joinedAt: string;
  lastActive: string;
};

const initialMembers: OrganizationMember[] = [
  {
    id: "MEM-1001",
    name: "Olivia Martin",
    email: "olivia@acme.com",
    role: "Owner",
    status: "Active",
    team: "Leadership",
    joinedAt: "2026-01-12",
    lastActive: "Today",
  },
  {
    id: "MEM-1002",
    name: "Ethan Williams",
    email: "ethan@acme.com",
    role: "Admin",
    status: "Active",
    team: "Engineering",
    joinedAt: "2026-02-04",
    lastActive: "Today",
  },
  {
    id: "MEM-1003",
    name: "Sophia Chen",
    email: "sophia@acme.com",
    role: "Developer",
    status: "Active",
    team: "AI Platform",
    joinedAt: "2026-03-18",
    lastActive: "Yesterday",
  },
  {
    id: "MEM-1004",
    name: "Noah Johnson",
    email: "noah@acme.com",
    role: "Member",
    status: "Active",
    team: "Operations",
    joinedAt: "2026-04-10",
    lastActive: "2 hours ago",
  },
  {
    id: "MEM-1005",
    name: "Ava Patel",
    email: "ava@acme.com",
    role: "Viewer",
    status: "Invited",
    team: "Research",
    joinedAt: "2026-10-28",
    lastActive: "Never",
  },
  {
    id: "MEM-1006",
    name: "Liam Garcia",
    email: "liam@acme.com",
    role: "Developer",
    status: "Suspended",
    team: "Engineering",
    joinedAt: "2026-05-20",
    lastActive: "Oct 25, 2026",
  },
  {
    id: "MEM-1007",
    name: "Isabella Brown",
    email: "isabella@acme.com",
    role: "Member",
    status: "Active",
    team: "Customer Success",
    joinedAt: "2026-06-03",
    lastActive: "Yesterday",
  },
];

const roleStyles: Record<MemberRole, string> = {
  Owner: "member-role-owner",
  Admin: "member-role-admin",
  Developer: "member-role-developer",
  Member: "member-role-member",
  Viewer: "member-role-viewer",
};

const statusStyles: Record<MemberStatus, string> = {
  Active: "member-status-active",
  Invited: "member-status-invited",
  Suspended: "member-status-suspended",
};

const emptyForm = {
  name: "",
  email: "",
  role: "Member" as MemberRole,
  status: "Invited" as MemberStatus,
  team: "General",
};

const css = `
.member-page {
  --member-primary: #315fea;
  --member-primary-dark: #244ac5;
  --member-border: #e5eaf2;
  --member-muted: #748198;
  --member-text: #182338;
  --member-surface: #ffffff;
  --member-bg: #f5f7fb;
  min-height: 100vh;
  padding: 30px;
  color: var(--member-text);
  background: var(--member-bg);
  font-family: Arial, Helvetica, sans-serif;
}
.member-page * { box-sizing: border-box; }
.member-container { max-width: 1600px; margin: 0 auto; }
.member-header { display:flex; justify-content:space-between; align-items:flex-start; gap:20px; margin-bottom:25px; }
.member-breadcrumb { color:var(--member-muted); font-size:12px; margin:0 0 12px; }
.member-title { font-size:30px; letter-spacing:-1px; font-weight:750; margin:0; }
.member-subtitle { color:var(--member-muted); font-size:14px; line-height:1.7; margin:9px 0 0; }
.member-header-actions { display:flex; flex-wrap:wrap; gap:10px; }
.member-btn { display:inline-flex; align-items:center; justify-content:center; gap:8px; border:1px solid var(--member-border); background:#fff; color:#344158; border-radius:9px; padding:10px 14px; font-size:13px; font-weight:650; cursor:pointer; transition:all .18s ease; white-space:nowrap; }
.member-btn:hover { background:#f8faff; border-color:#c9d5f2; }
.member-btn-primary { background:var(--member-primary); color:white; border-color:var(--member-primary); }
.member-btn-primary:hover { background:var(--member-primary-dark); border-color:var(--member-primary-dark); }
.member-btn-danger { color:#c83b4b; }
.member-btn:disabled { opacity:.5; cursor:not-allowed; }
.member-notice { border:1px solid #bfdbfe; background:#eff6ff; color:#1d4ed8; border-radius:10px; padding:13px 15px; font-size:13px; line-height:1.6; margin-bottom:18px; }
.member-demo { border:1px solid #d8e5ff; background:linear-gradient(110deg,#eef4ff,#f8faff); border-radius:12px; padding:15px 17px; display:flex; align-items:flex-start; gap:12px; margin-bottom:22px; }
.member-demo-icon { display:flex; align-items:center; justify-content:center; flex-shrink:0; width:35px; height:35px; border-radius:10px; background:white; color:var(--member-primary); }
.member-demo strong { display:block; font-size:13px; margin-bottom:4px; }
.member-demo p { font-size:12px; color:#60708b; line-height:1.65; margin:0; }
.member-stats { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:15px; margin-bottom:22px; }
.member-stat { border:1px solid var(--member-border); border-radius:13px; background:white; padding:19px; min-width:0; box-shadow:0 2px 5px rgba(25,42,70,.025); }
.member-stat-top { display:flex; justify-content:space-between; align-items:center; gap:10px; }
.member-stat-label { color:var(--member-muted); font-size:12px; font-weight:600; }
.member-stat-icon { display:flex; align-items:center; justify-content:center; width:39px; height:39px; border-radius:11px; }
.member-stat-value { font-size:29px; letter-spacing:-.7px; font-weight:750; margin-top:15px; }
.member-stat-foot { color:#8a96a9; font-size:11px; margin-top:5px; }
.member-panel { border:1px solid var(--member-border); border-radius:13px; background:white; overflow:hidden; box-shadow:0 2px 5px rgba(25,42,70,.025); }
.member-panel-header { display:flex; align-items:center; justify-content:space-between; gap:15px; padding:20px; border-bottom:1px solid #edf0f5; }
.member-panel-heading { font-size:15px; font-weight:750; margin:0; }
.member-panel-caption { color:var(--member-muted); font-size:12px; margin-top:5px; }
.member-toolbar { display:flex; align-items:center; flex-wrap:wrap; gap:9px; }
.member-search { position:relative; min-width:260px; }
.member-search svg { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#8b96a9; pointer-events:none; }
.member-input { width:100%; border:1px solid #dfe5ef; background:white; color:#1e293b; border-radius:9px; padding:10px 12px; font-size:13px; outline:none; transition:border .15s,box-shadow .15s; }
.member-search .member-input { padding-left:37px; }
.member-input:focus { border-color:#8ca9ff; box-shadow:0 0 0 3px rgba(49,95,234,.1); }
.member-input::placeholder { color:#9aa5b5; }
.member-filter-row { display:flex; align-items:flex-end; flex-wrap:wrap; gap:14px; padding:17px 20px; background:#f9faff; border-bottom:1px solid #edf0f5; }
.member-field { display:grid; gap:7px; min-width:150px; }
.member-field label { color:#536176; font-size:12px; font-weight:650; }
.member-select { width:100%; min-width:145px; border:1px solid #dfe5ef; border-radius:8px; background:white; padding:10px 11px; color:#334155; font-size:12px; outline:none; }
.member-select:focus { border-color:#8ca9ff; }
.member-table-wrap { width:100%; overflow-x:auto; }
.member-table { width:100%; min-width:1050px; border-collapse:collapse; text-align:left; font-size:12px; }
.member-table thead { background:#f8faff; color:#7b879a; }
.member-table th { padding:14px 18px; font-size:10px; font-weight:750; text-transform:uppercase; letter-spacing:.65px; white-space:nowrap; }
.member-table td { padding:15px 18px; border-top:1px solid #edf0f5; vertical-align:middle; }
.member-table tbody tr { transition:background .15s; }
.member-table tbody tr:hover { background:#fafbff; }
.member-person { display:flex; align-items:center; gap:11px; min-width:215px; }
.member-avatar { display:flex; align-items:center; justify-content:center; flex-shrink:0; width:39px; height:39px; border-radius:12px; background:#eaf0ff; color:#315fea; font-size:12px; font-weight:750; }
.member-person-name { color:#26344a; font-size:12px; font-weight:750; }
.member-person-email { color:#7c899c; font-size:11px; margin-top:4px; }
.member-person-id { color:#a0a9b8; font-size:10px; margin-top:4px; }
.member-role,.member-status { display:inline-flex; align-items:center; gap:5px; padding:5px 9px; border-radius:20px; font-size:10px; font-weight:750; white-space:nowrap; }
.member-role-owner { background:#f0eaff; color:#7040bd; }
.member-role-admin { background:#eaf1ff; color:#315fea; }
.member-role-developer { background:#e8efff; color:#4b57c5; }
.member-role-member { background:#f0f2f6; color:#5e6b7e; }
.member-role-viewer { background:#fff5dc; color:#996b00; }
.member-status-active { background:#e6f8ee; color:#12834c; }
.member-status-invited { background:#fff4d9; color:#9b6a00; }
.member-status-suspended { background:#ffebed; color:#c73548; }
.member-table-muted { color:#69778b; white-space:nowrap; }
.member-actions { display:flex; align-items:center; justify-content:flex-end; gap:3px; }
.member-icon-btn { display:inline-flex; align-items:center; justify-content:center; width:31px; height:31px; border:1px solid transparent; background:transparent; color:#758197; border-radius:8px; cursor:pointer; }
.member-icon-btn:hover { background:#edf3ff; color:#315fea; }
.member-icon-btn.danger:hover { background:#fff0f1; color:#c73548; }
.member-empty { padding:55px 15px!important; text-align:center; color:#8490a3; }
.member-empty strong { display:block; color:#344158; font-size:14px; margin:12px 0 5px; }
.member-empty p { margin:0; font-size:12px; }
.member-panel-footer { display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; padding:14px 20px; border-top:1px solid #edf0f5; color:#8490a3; font-size:11px; }
.member-security { display:flex; gap:12px; align-items:flex-start; padding:17px; border:1px solid var(--member-border); background:white; border-radius:12px; margin-top:18px; }
.member-security-icon { display:flex; align-items:center; justify-content:center; flex-shrink:0; width:36px; height:36px; border-radius:10px; background:#eaf1ff; color:#315fea; }
.member-security strong { font-size:12px; display:block; }
.member-security p { font-size:12px; color:#7b879a; line-height:1.7; margin:5px 0 0; }
.member-modal-backdrop { position:fixed; inset:0; z-index:100; display:flex; align-items:center; justify-content:center; overflow-y:auto; padding:20px; background:rgba(15,23,42,.5); backdrop-filter:blur(3px); }
.member-modal { width:100%; max-width:540px; max-height:calc(100vh - 40px); overflow-y:auto; border-radius:17px; background:white; box-shadow:0 24px 80px rgba(15,23,42,.23); animation:memberModalIn .18s ease-out; }
.member-modal-header { display:flex; align-items:flex-start; justify-content:space-between; gap:15px; padding:21px; border-bottom:1px solid #edf0f5; }
.member-modal-title { font-size:19px; font-weight:750; margin:0; letter-spacing:-.3px; }
.member-modal-subtitle { color:#8490a3; font-size:12px; line-height:1.6; margin:6px 0 0; }
.member-modal-body { padding:21px; }
.member-form { display:grid; gap:16px; }
.member-form-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px; }
.member-form-field { display:grid; gap:7px; min-width:0; }
.member-form-field > span { font-size:12px; font-weight:650; color:#46546a; }
.member-form-field .member-input,.member-form-field .member-select { padding:11px 12px; font-size:13px; }
.member-error { border:1px solid #fecaca; border-radius:8px; padding:10px 12px; background:#fef2f2; color:#b91c1c; font-size:12px; line-height:1.6; }
.member-modal-footer { display:flex; justify-content:flex-end; flex-wrap:wrap; gap:9px; border-top:1px solid #edf0f5; padding-top:17px; margin-top:2px; }
.member-detail-hero { display:flex; align-items:center; gap:13px; margin-bottom:22px; }
.member-detail-avatar { display:flex; align-items:center; justify-content:center; width:53px; height:53px; border-radius:15px; background:#eaf0ff; color:#315fea; font-size:16px; font-weight:750; }
.member-detail-name { font-size:16px; font-weight:750; margin:0; }
.member-detail-email { font-size:12px; color:#7b879a; margin-top:5px; overflow-wrap:anywhere; }
.member-detail-row { display:flex; align-items:flex-start; justify-content:space-between; gap:18px; border-bottom:1px solid #edf0f5; padding:13px 0; font-size:12px; }
.member-detail-row:last-of-type { border-bottom:0; }
.member-detail-label { color:#8490a3; }
.member-detail-value { text-align:right; font-weight:650; overflow-wrap:anywhere; }
@keyframes memberModalIn { from { opacity:0; transform:translateY(8px) scale(.99); } to { opacity:1; transform:translateY(0) scale(1); } }
@media (max-width:1050px) {
  .member-page { padding:22px; }
  .member-stats { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .member-panel-header { align-items:flex-start; flex-direction:column; }
  .member-toolbar { width:100%; }
  .member-search { flex:1; }
}
@media (max-width:650px) {
  .member-page { padding:15px; }
  .member-header { flex-direction:column; }
  .member-header-actions { width:100%; }
  .member-header-actions .member-btn { flex:1; }
  .member-title { font-size:25px; }
  .member-stats { gap:10px; }
  .member-stat { padding:14px; }
  .member-stat-value { font-size:25px; }
  .member-stat-icon { width:33px; height:33px; }
  .member-panel-header { padding:15px; }
  .member-toolbar { align-items:stretch; }
  .member-search { min-width:100%; }
  .member-filter-row { padding:15px; }
  .member-field { flex:1; min-width:130px; }
  .member-panel-footer { padding:13px 15px; }
  .member-form-grid { grid-template-columns:1fr; }
  .member-modal-backdrop { padding:10px; }
  .member-modal { max-height:calc(100vh - 20px); }
  .member-modal-header,.member-modal-body { padding:16px; }
  .member-detail-row { gap:10px; }
}
`;

export default function OrganizationMembersPage() {
  const [members, setMembers] =
    useState<OrganizationMember[]>(initialMembers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [teamFilter, setTeamFilter] = useState("All");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [modal, setModal] = useState<ModalType>(null);
  const [selected, setSelected] = useState<OrganizationMember | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const teams = useMemo(
    () => Array.from(new Set(members.map((member) => member.team))).sort(),
    [members]
  );

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return members.filter((member) => {
      const matchesSearch =
        !query ||
        member.name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query) ||
        member.id.toLowerCase().includes(query);

      return (
        matchesSearch &&
        (roleFilter === "All" || member.role === roleFilter) &&
        (statusFilter === "All" || member.status === statusFilter) &&
        (teamFilter === "All" || member.team === teamFilter)
      );
    });
  }, [members, search, roleFilter, statusFilter, teamFilter]);

  const metrics = useMemo(
    () => ({
      total: members.length,
      active: members.filter((member) => member.status === "Active").length,
      invited: members.filter((member) => member.status === "Invited").length,
      suspended: members.filter((member) => member.status === "Suspended").length,
      admins: members.filter(
        (member) => member.role === "Admin" || member.role === "Owner"
      ).length,
    }),
    [members]
  );

  function notify(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3500);
  }

  function openAdd() {
    setSelected(null);
    setForm({ ...emptyForm });
    setError("");
    setModal("add");
  }

  function openEdit(member: OrganizationMember) {
    setSelected(member);
    setForm({
      name: member.name,
      email: member.email,
      role: member.role,
      status: member.status,
      team: member.team,
    });
    setError("");
    setModal("edit");
  }

  function saveMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const team = form.team.trim();

    if (!name || !email || !team) {
      setError("Name, email, and team are required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }

    if (
      members.some(
        (member) =>
          member.email.toLowerCase() === email &&
          member.id !== selected?.id
      )
    ) {
      setError("A member with this email address already exists.");
      return;
    }

    if (modal === "edit" && selected) {
      if (selected.role === "Owner" && form.role !== "Owner") {
        const anotherOwnerExists = members.some(
          (member) => member.id !== selected.id && member.role === "Owner"
        );

        if (!anotherOwnerExists) {
          setError("Assign another owner before changing the current owner's role.");
          return;
        }
      }

      if (selected.role === "Owner" && form.status !== "Active") {
        setError("The organization owner must remain active in this preview.");
        return;
      }

      setMembers((current) =>
        current.map((member) =>
          member.id === selected.id
            ? { ...member, name, email, role: form.role, status: form.status, team }
            : member
        )
      );

      setSelected((current) =>
        current?.id === selected.id
          ? { ...current, name, email, role: form.role, status: form.status, team }
          : current
      );

      notify("Member details updated.");
    } else {
      if (form.role === "Owner" && members.some((member) => member.role === "Owner")) {
        setError("An owner already exists in this sample organization.");
        return;
      }

      const newMember: OrganizationMember = {
        id: `MEM-${Date.now().toString().slice(-6)}`,
        name,
        email,
        role: form.role,
        status: form.status,
        team,
        joinedAt: new Date().toISOString().slice(0, 10),
        lastActive: "Never",
      };

      setMembers((current) => [newMember, ...current]);
      notify(form.status === "Invited" ? "Invitation added to the preview." : "Member added to the preview.");
    }

    setModal(null);
  }

  function changeStatus(member: OrganizationMember) {
    if (member.role === "Owner") {
      notify("The organization owner cannot be suspended here.");
      return;
    }

    const nextStatus: MemberStatus =
      member.status === "Suspended" ? "Active" : "Suspended";

    setMembers((current) =>
      current.map((item) =>
        item.id === member.id ? { ...item, status: nextStatus } : item
      )
    );

    setSelected((current) =>
      current?.id === member.id ? { ...current, status: nextStatus } : current
    );

    notify(`${member.name} is now ${nextStatus.toLowerCase()}.`);
  }

  function resendInvitation(member: OrganizationMember) {
    notify(`Demo preview: invitation resend prepared for ${member.email}.`);
  }

  function removeMember(member: OrganizationMember) {
    if (member.role === "Owner") {
      notify("The organization owner cannot be removed.");
      return;
    }

    if (!window.confirm(`Remove ${member.name} from this sample organization?`)) {
      return;
    }

    setMembers((current) => current.filter((item) => item.id !== member.id));

    if (selected?.id === member.id) {
      setSelected(null);
      setModal(null);
    }

    notify(`${member.name} was removed from the preview.`);
  }

  function resetFilters() {
    setSearch("");
    setRoleFilter("All");
    setStatusFilter("All");
    setTeamFilter("All");
  }

  function exportCsv() {
    const headers = [
      "Member ID",
      "Name",
      "Email",
      "Role",
      "Status",
      "Team",
      "Joined Date",
      "Last Active",
    ];

    const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;

    const rows = filteredMembers.map((member) => [
      member.id,
      member.name,
      member.email,
      member.role,
      member.status,
      member.team,
      member.joinedAt,
      member.lastActive,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\r\n");

    const url = URL.createObjectURL(
      new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    );

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "modelnow-organization-members.csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);

    notify("Member CSV exported.");
  }

  function initials(name: string) {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  const metricCards = [
    {
      label: "Total members",
      value: metrics.total,
      caption: "Organization directory",
      icon: Users,
      color: "#315fea",
      background: "#eaf0ff",
    },
    {
      label: "Active members",
      value: metrics.active,
      caption: "Currently enabled",
      icon: UserCheck,
      color: "#15803d",
      background: "#e7f8ee",
    },
    {
      label: "Pending invitations",
      value: metrics.invited,
      caption: "Awaiting acceptance",
      icon: Clock3,
      color: "#a66b00",
      background: "#fff4d8",
    },
    {
      label: "Suspended members",
      value: metrics.suspended,
      caption: "Access currently disabled",
      icon: UserX,
      color: "#c73548",
      background: "#ffebee",
    },
  ];

  return (
    <main className="member-page" style={{ "--member-primary": "#315fea" } as CSSProperties}>
      <style>{css}</style>

      <div className="member-container">
        <header className="member-header">
          <div>
            <p className="member-breadcrumb">Admin / Organizations / Members</p>
            <h1 className="member-title">Organization Members</h1>
            <p className="member-subtitle">
              Manage your organization&apos;s people, permissions, invitations, and access.
            </p>
          </div>

          <div className="member-header-actions">
            <button className="member-btn" onClick={exportCsv}>
              <Download size={16} />
              Export CSV
            </button>
            <button className="member-btn member-btn-primary" onClick={openAdd}>
              <UserPlus size={16} />
              Add member
            </button>
          </div>
        </header>

        {notice && (
          <div className="member-notice" role="status">
            {notice}
          </div>
        )}

        <div className="member-demo">
          <div className="member-demo-icon">
            <Activity size={18} />
          </div>
          <div>
            <strong>Organization access management</strong>
            <p>
              This is a frontend preview using sample data. Changes are held in page
              state and are not yet persisted to the backend or connected to a real
              invitation service.
            </p>
          </div>
        </div>

        <section className="member-stats" aria-label="Member statistics">
          {metricCards.map((metric) => {
            const Icon = metric.icon;

            return (
              <article className="member-stat" key={metric.label}>
                <div className="member-stat-top">
                  <span className="member-stat-label">{metric.label}</span>
                  <span
                    className="member-stat-icon"
                    style={{
                      background: metric.background,
                      color: metric.color,
                    }}
                  >
                    <Icon size={19} />
                  </span>
                </div>
                <div className="member-stat-value">{metric.value}</div>
                <div className="member-stat-foot">{metric.caption}</div>
              </article>
            );
          })}
        </section>

        <section className="member-panel">
          <div className="member-panel-header">
            <div>
              <h2 className="member-panel-heading">Member directory</h2>
              <p className="member-panel-caption">
                Showing {filteredMembers.length} of {members.length} members
              </p>
            </div>

            <div className="member-toolbar">
              <div className="member-search">
                <Search size={16} />
                <input
                  className="member-input"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search name, email, or ID..."
                  aria-label="Search members"
                />
              </div>

              <button
                className="member-btn"
                onClick={() => setFiltersOpen((current) => !current)}
                aria-expanded={filtersOpen}
              >
                <SlidersHorizontal size={15} />
                Filters
                <ChevronDown
                  size={14}
                  style={{
                    transform: filtersOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform .15s",
                  }}
                />
              </button>
            </div>
          </div>

          {filtersOpen && (
            <div className="member-filter-row">
              <div className="member-field">
                <label htmlFor="member-role-filter">Role</label>
                <select
                  id="member-role-filter"
                  className="member-select"
                  value={roleFilter}
                  onChange={(event) => setRoleFilter(event.target.value)}
                >
                  <option value="All">All roles</option>
                  <option value="Owner">Owner</option>
                  <option value="Admin">Admin</option>
                  <option value="Developer">Developer</option>
                  <option value="Member">Member</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>

              <div className="member-field">
                <label htmlFor="member-status-filter">Status</label>
                <select
                  id="member-status-filter"
                  className="member-select"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <option value="All">All statuses</option>
                  <option value="Active">Active</option>
                  <option value="Invited">Invited</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>

              <div className="member-field">
                <label htmlFor="member-team-filter">Team</label>
                <select
                  id="member-team-filter"
                  className="member-select"
                  value={teamFilter}
                  onChange={(event) => setTeamFilter(event.target.value)}
                >
                  <option value="All">All teams</option>
                  {teams.map((team) => (
                    <option value={team} key={team}>
                      {team}
                    </option>
                  ))}
                </select>
              </div>

              <button className="member-btn" onClick={resetFilters}>
                <RefreshCw size={14} />
                Reset filters
              </button>
            </div>
          )}

          <div className="member-table-wrap">
            <table className="member-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Role</th>
                  <th>Team</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Last active</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <div className="member-person">
                        <div className="member-avatar">{initials(member.name)}</div>
                        <div>
                          <div className="member-person-name">{member.name}</div>
                          <div className="member-person-email">{member.email}</div>
                          <div className="member-person-id">{member.id}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className={`member-role ${roleStyles[member.role]}`}>
                        {member.role === "Owner" && <ShieldCheck size={12} />}
                        {member.role}
                      </span>
                    </td>

                    <td>
                      <span className="member-table-muted">
                        <Building2
                          size={13}
                          style={{ display: "inline", marginRight: 6, verticalAlign: "-2px" }}
                        />
                        {member.team}
                      </span>
                    </td>

                    <td>
                      <span className={`member-status ${statusStyles[member.status]}`}>
                        <span
                          style={{
                            width: 5,
                            height: 5,
                            display: "inline-block",
                            borderRadius: "50%",
                            background: "currentColor",
                          }}
                        />
                        {member.status}
                      </span>
                    </td>

                    <td>
                      <span className="member-table-muted">
                        <CalendarDays
                          size={13}
                          style={{ display: "inline", marginRight: 5, verticalAlign: "-2px" }}
                        />
                        {member.joinedAt}
                      </span>
                    </td>

                    <td className="member-table-muted">{member.lastActive}</td>

                    <td>
                      <div className="member-actions">
                        <button
                          className="member-icon-btn"
                          title="View member"
                          aria-label={`View ${member.name}`}
                          onClick={() => {
                            setSelected(member);
                            setModal("view");
                          }}
                        >
                          <Eye size={15} />
                        </button>

                        <button
                          className="member-icon-btn"
                          title="Edit member"
                          aria-label={`Edit ${member.name}`}
                          onClick={() => openEdit(member)}
                        >
                          <Pencil size={15} />
                        </button>

                        {member.status === "Invited" ? (
                          <button
                            className="member-icon-btn"
                            title="Resend invitation"
                            aria-label={`Resend invitation to ${member.name}`}
                            onClick={() => resendInvitation(member)}
                          >
                            <Mail size={15} />
                          </button>
                        ) : (
                          <button
                            className="member-icon-btn"
                            title={member.status === "Suspended" ? "Activate member" : "Suspend member"}
                            aria-label={`Change access for ${member.name}`}
                            onClick={() => changeStatus(member)}
                          >
                            {member.status === "Suspended" ? (
                              <CheckCircle2 size={15} />
                            ) : (
                              <ShieldCheck size={15} />
                            )}
                          </button>
                        )}

                        <button
                          className="member-icon-btn danger"
                          title="Remove member"
                          aria-label={`Remove ${member.name}`}
                          onClick={() => removeMember(member)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredMembers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="member-empty">
                      <Users size={30} style={{ margin: "0 auto" }} />
                      <strong>No members found</strong>
                      <p>Try another search or change the selected filters.</p>
                      <button
                        className="member-btn"
                        style={{ marginTop: 15 }}
                        onClick={resetFilters}
                      >
                        <RefreshCw size={14} />
                        Clear filters
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <footer className="member-panel-footer">
            <span>
              Showing {filteredMembers.length} of {members.length} members
            </span>
            <span>
              <ShieldCheck
                size={13}
                style={{ display: "inline", marginRight: 5, verticalAlign: "-2px" }}
              />
              {metrics.admins} owners and administrators
            </span>
          </footer>
        </section>

        <section className="member-security">
          <div className="member-security-icon">
            <LockKeyhole size={18} />
          </div>
          <div>
            <strong>Security and permissions</strong>
            <p>
              Production role changes, invitations, suspensions, and removals
              should be validated by the backend and recorded in audit logs.
              Frontend restrictions alone do not enforce security.
            </p>
          </div>
          <ArrowUpRight size={16} color="#8490a3" style={{ marginLeft: "auto", flexShrink: 0 }} />
        </section>
      </div>

      {(modal === "add" || modal === "edit") && (
        <div
          className="member-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setModal(null);
          }}
        >
          <section
            className="member-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="member-form-title"
          >
            <div className="member-modal-header">
              <div>
                <h2 className="member-modal-title" id="member-form-title">
                  {modal === "add" ? "Add organization member" : "Edit member"}
                </h2>
                <p className="member-modal-subtitle">
                  Configure this person&apos;s organization membership and access.
                </p>
              </div>
              <button
                className="member-icon-btn"
                onClick={() => setModal(null)}
                aria-label="Close member form"
              >
                <X size={19} />
              </button>
            </div>

            <div className="member-modal-body">
              <form className="member-form" onSubmit={saveMember}>
                <label className="member-form-field">
                  <span>Full name *</span>
                  <input
                    className="member-input"
                    required
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    placeholder="Enter full name"
                  />
                </label>

                <label className="member-form-field">
                  <span>Email address *</span>
                  <input
                    className="member-input"
                    required
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    placeholder="person@company.com"
                  />
                </label>

                <div className="member-form-grid">
                  <label className="member-form-field">
                    <span>Organization role</span>
                    <select
                      className="member-select"
                      value={form.role}
                      onChange={(event) =>
                        setForm({ ...form, role: event.target.value as MemberRole })
                      }
                    >
                      <option value="Owner">Owner</option>
                      <option value="Admin">Admin</option>
                      <option value="Developer">Developer</option>
                      <option value="Member">Member</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                  </label>

                  <label className="member-form-field">
                    <span>Membership status</span>
                    <select
                      className="member-select"
                      value={form.status}
                      onChange={(event) =>
                        setForm({ ...form, status: event.target.value as MemberStatus })
                      }
                    >
                      <option value="Active">Active</option>
                      <option value="Invited">Invited</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </label>
                </div>

                <label className="member-form-field">
                  <span>Team or department *</span>
                  <input
                    className="member-input"
                    required
                    value={form.team}
                    onChange={(event) => setForm({ ...form, team: event.target.value })}
                    placeholder="Engineering"
                    list="organization-member-teams"
                  />
                  <datalist id="organization-member-teams">
                    {teams.map((team) => (
                      <option key={team} value={team} />
                    ))}
                  </datalist>
                </label>

                {error && (
                  <div className="member-error" role="alert">
                    {error}
                  </div>
                )}

                <div className="member-modal-footer">
                  <button
                    className="member-btn"
                    type="button"
                    onClick={() => setModal(null)}
                  >
                    Cancel
                  </button>
                  <button className="member-btn member-btn-primary" type="submit">
                    {modal === "add" ? (
                      <>
                        <Plus size={15} />
                        Add member
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={15} />
                        Save changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      )}

      {modal === "view" && selected && (
        <div
          className="member-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setModal(null);
          }}
        >
          <section
            className="member-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="member-detail-title"
          >
            <div className="member-modal-header">
              <div>
                <h2 className="member-modal-title" id="member-detail-title">
                  Member profile
                </h2>
                <p className="member-modal-subtitle">{selected.id}</p>
              </div>
              <button
                className="member-icon-btn"
                onClick={() => setModal(null)}
                aria-label="Close member details"
              >
                <X size={19} />
              </button>
            </div>

            <div className="member-modal-body">
              <div className="member-detail-hero">
                <div className="member-detail-avatar">{initials(selected.name)}</div>
                <div>
                  <h3 className="member-detail-name">{selected.name}</h3>
                  <p className="member-detail-email">{selected.email}</p>
                  <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 9 }}>
                    <span className={`member-role ${roleStyles[selected.role]}`}>
                      {selected.role}
                    </span>
                    <span className={`member-status ${statusStyles[selected.status]}`}>
                      {selected.status}
                    </span>
                  </div>
                </div>
              </div>

              {[
                ["Member ID", selected.id],
                ["Email address", selected.email],
                ["Team / department", selected.team],
                ["Joined date", selected.joinedAt],
                ["Last active", selected.lastActive],
              ].map(([label, value]) => (
                <div className="member-detail-row" key={label}>
                  <span className="member-detail-label">{label}</span>
                  <span className="member-detail-value">{value}</span>
                </div>
              ))}

              <div className="member-modal-footer">
                {selected.status === "Invited" && (
                  <button
                    className="member-btn"
                    onClick={() => resendInvitation(selected)}
                  >
                    <Mail size={15} />
                    Resend invitation
                  </button>
                )}

                {selected.role !== "Owner" && (
                  <button
                    className="member-btn member-btn-danger"
                    onClick={() => removeMember(selected)}
                  >
                    <Trash2 size={15} />
                    Remove
                  </button>
                )}

                <button
                  className="member-btn member-btn-primary"
                  onClick={() => openEdit(selected)}
                >
                  <Pencil size={15} />
                  Edit member
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}