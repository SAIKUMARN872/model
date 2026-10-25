"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  Clock3,
  HeartHandshake,
  MoreHorizontal,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
  UserCheck,
  UserPlus,
  Users,
  Workflow,
  X,
  Zap,
} from "lucide-react";

type Employee = {
  id: string;
  name: string;
  role: string;
  department: string;
  status: string;
  location: string;
  performance: number;
};

type Candidate = {
  name: string;
  role: string;
  experience: string;
  score: number;
  stage: string;
};

type Activity = {
  title: string;
  department: string;
  time: string;
  icon: React.ElementType;
};

type WorkflowItem = {
  title: string;
  description: string;
  icon: React.ElementType;
  status: string;
};

const employeeData: Employee[] = [
  {
    id: "EMP-1042",
    name: "Ananya Rao",
    role: "Product Manager",
    department: "Product",
    status: "Active",
    location: "Hyderabad",
    performance: 94,
  },
  {
    id: "EMP-1087",
    name: "Rahul Sharma",
    role: "Senior Software Engineer",
    department: "Engineering",
    status: "Active",
    location: "Bengaluru",
    performance: 91,
  },
  {
    id: "EMP-1124",
    name: "Priya Menon",
    role: "HR Business Partner",
    department: "Human Resources",
    status: "Active",
    location: "Mumbai",
    performance: 88,
  },
  {
    id: "EMP-1178",
    name: "Arjun Reddy",
    role: "Sales Executive",
    department: "Sales",
    status: "On Leave",
    location: "Chennai",
    performance: 86,
  },
  {
    id: "EMP-1203",
    name: "Sneha Kapoor",
    role: "Finance Analyst",
    department: "Finance",
    status: "Active",
    location: "Pune",
    performance: 93,
  },
];

const candidateData: Candidate[] = [
  {
    name: "Kiran Kumar",
    role: "Frontend Developer",
    experience: "3 years",
    score: 94,
    stage: "AI Shortlisted",
  },
  {
    name: "Megha Patel",
    role: "Data Analyst",
    experience: "2 years",
    score: 91,
    stage: "Interview",
  },
  {
    name: "Vikram Singh",
    role: "Sales Manager",
    experience: "5 years",
    score: 87,
    stage: "Screening",
  },
  {
    name: "Divya Nair",
    role: "HR Executive",
    experience: "2 years",
    score: 84,
    stage: "Review",
  },
];

const activityData: Activity[] = [
  {
    title: "AI shortlisted 12 candidates",
    department: "Recruitment",
    time: "8 min ago",
    icon: UserCheck,
  },
  {
    title: "Employee onboarding completed",
    department: "HR Operations",
    time: "24 min ago",
    icon: CheckCircle2,
  },
  {
    title: "Leave request approved",
    department: "Employee Services",
    time: "42 min ago",
    icon: CalendarDays,
  },
  {
    title: "Performance review generated",
    department: "Workforce",
    time: "1 hr ago",
    icon: BarChart3,
  },
];

const workflowData: WorkflowItem[] = [
  {
    title: "AI Recruitment",
    description:
      "Screen candidates, score profiles and recommend the best matches.",
    icon: UserCheck,
    status: "Active",
  },
  {
    title: "Employee Onboarding",
    description:
      "Automate joining documents, tasks, approvals and access requests.",
    icon: Workflow,
    status: "Active",
  },
  {
    title: "Leave Management",
    description:
      "Process leave requests with policy-aware AI approvals.",
    icon: CalendarDays,
    status: "Active",
  },
  {
    title: "Performance Intelligence",
    description:
      "Analyze employee performance and generate review insights.",
    icon: Target,
    status: "Active",
  },
];

const agentData = [
  {
    name: "Recruitment Intelligence Agent",
    description:
      "Analyzes resumes and ranks candidates automatically.",
    tasks: "1,284 tasks",
  },
  {
    name: "Employee Support Agent",
    description:
      "Answers employee questions about HR policies and services.",
    tasks: "3,842 tasks",
  },
  {
    name: "Onboarding Agent",
    description:
      "Coordinates onboarding tasks across HR and IT systems.",
    tasks: "428 tasks",
  },
  {
    name: "Workforce Analytics Agent",
    description:
      "Monitors workforce trends and identifies HR insights.",
    tasks: "892 tasks",
  },
];

const integrationData = [
  {
    name: "HR Database",
    description: "Employee records",
  },
  {
    name: "Recruitment Platform",
    description: "Candidate data",
  },
  {
    name: "Payroll System",
    description: "Payroll & compensation",
  },
  {
    name: "Enterprise Identity",
    description: "Employee access",
  },
];

export default function HRPage() {
  const [activeTab, setActiveTab] = useState<
    "employees" | "recruitment" | "activities"
  >("employees");

  const [search, setSearch] = useState("");
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const filteredEmployees = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return employeeData;
    }

    return employeeData.filter(
      (employee) =>
        employee.name.toLowerCase().includes(value) ||
        employee.role.toLowerCase().includes(value) ||
        employee.department.toLowerCase().includes(value)
    );
  }, [search]);

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/enterprise"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
            >
              <ArrowLeft size={18} />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight">
                  ModelNow HR
                </h1>

                <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                  Enterprise
                </span>
              </div>

              <p className="text-xs text-slate-500">
                AI-powered human resources operations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 md:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              HR systems operational
            </div>

            <button
              onClick={() => setShowEmployeeModal(true)}
              className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Plus size={16} />
              Add Employee
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-6 py-8">
        {/* HERO */}
        <section className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="grid gap-8 p-7 lg:grid-cols-[1.5fr_1fr] lg:p-9">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
                <Sparkles size={14} />
                ModelNow HR Intelligence
              </div>

              <h2 className="max-w-3xl text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
                Intelligent workforce operations for your enterprise.
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
                Manage employees, recruitment, onboarding, workforce
                analytics and HR workflows through one AI-powered platform.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => setShowCandidateModal(true)}
                  className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
                >
                  <UserCheck size={16} />
                  AI Recruitment
                </button>

                <button
                  onClick={() => setShowEmployeeModal(true)}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <UserPlus size={16} />
                  Add Employee
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Workforce Intelligence
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    HR operations overview
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                  <HeartHandshake
                    size={20}
                    className="text-violet-600"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <MiniProgress
                  label="Employee engagement"
                  value={92}
                />

                <MiniProgress
                  label="Recruitment efficiency"
                  value={87}
                />

                <MiniProgress
                  label="Onboarding completion"
                  value={96}
                />
              </div>
            </div>
          </div>
        </section>

        {/* KPI CARDS */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            title="Total Employees"
            value="1,284"
            change="+8.4%"
            icon={Users}
          />

          <KpiCard
            title="Open Positions"
            value="48"
            change="+12 this month"
            icon={BriefcaseBusiness}
          />

          <KpiCard
            title="AI Shortlisted"
            value="186"
            change="+24.8%"
            icon={UserCheck}
          />

          <KpiCard
            title="Onboarding"
            value="32"
            change="96% completed"
            icon={UserPlus}
          />
        </section>

        {/* AI AUTOMATION */}
        <section className="mb-8">
          <SectionHeading
            title="HR AI Automation"
            description="AI agents continuously automate repetitive HR operations."
          />

          <div className="grid gap-4 md:grid-cols-3">
            <AutomationCard
              icon={UserCheck}
              title="AI Recruitment"
              description="Resume screening, candidate scoring and interview recommendations."
              metric="186 candidates"
            />

            <AutomationCard
              icon={Workflow}
              title="Employee Operations"
              description="Automate onboarding, employee requests and HR approvals."
              metric="428 workflows"
            />

            <AutomationCard
              icon={BarChart3}
              title="Workforce Intelligence"
              description="Analyze workforce performance, engagement and organizational trends."
              metric="92% engagement"
            />
          </div>
        </section>

        {/* TABS */}
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-2">
              <TabButton
                active={activeTab === "employees"}
                onClick={() => setActiveTab("employees")}
              >
                Employees
              </TabButton>

              <TabButton
                active={activeTab === "recruitment"}
                onClick={() => setActiveTab("recruitment")}
              >
                Recruitment
              </TabButton>

              <TabButton
                active={activeTab === "activities"}
                onClick={() => setActiveTab("activities")}
              >
                Activities
              </TabButton>
            </div>

            <div className="relative w-full md:w-80">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search employees..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-slate-400"
              />
            </div>
          </div>

          {activeTab === "employees" && (
            <EmployeeTable employees={filteredEmployees} />
          )}

          {activeTab === "recruitment" && (
            <RecruitmentTable
              candidates={candidateData}
              onAddCandidate={() => setShowCandidateModal(true)}
            />
          )}

          {activeTab === "activities" && <ActivityList />}
        </section>

        {/* WORKFLOWS */}
        <section className="mb-8">
          <SectionHeading
            title="HR Workflows"
            description="Automate common employee and HR processes."
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {workflowData.map((workflow) => (
              <WorkflowCard
                key={workflow.title}
                workflow={workflow}
              />
            ))}
          </div>
        </section>

        {/* AI AGENTS */}
        <section className="mb-8">
          <SectionHeading
            title="HR AI Agents"
            description="Specialized agents operating across your HR ecosystem."
          />

          <div className="grid gap-4 lg:grid-cols-2">
            {agentData.map((agent) => {
              const selected = selectedAgent === agent.name;

              return (
                <button
                  key={agent.name}
                  onClick={() =>
                    setSelectedAgent(selected ? null : agent.name)
                  }
                  className={`rounded-xl border p-5 text-left transition ${
                    selected
                      ? "border-violet-300 bg-violet-50"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                        <Zap size={20} />
                      </div>

                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {agent.name}
                        </h3>

                        <p className="mt-1 text-sm leading-5 text-slate-500">
                          {agent.description}
                        </p>

                        <p className="mt-3 text-xs font-semibold text-violet-700">
                          {agent.tasks}
                        </p>
                      </div>
                    </div>

                    <ChevronRight
                      size={18}
                      className={`shrink-0 transition ${
                        selected
                          ? "rotate-90 text-violet-600"
                          : "text-slate-400"
                      }`}
                    />
                  </div>

                  {selected && (
                    <div className="mt-4 rounded-lg border border-violet-200 bg-white p-4 text-xs text-slate-600">
                      Agent controls and live execution details will be
                      connected to the ModelNow backend.
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* INTEGRATIONS */}
        <section className="mb-8">
          <SectionHeading
            title="HR Integrations"
            description="Connect ModelNow with your existing enterprise systems."
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {integrationData.map((integration) => (
              <div
                key={integration.name}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                    <Settings2
                      size={18}
                      className="text-slate-600"
                    />
                  </div>

                  <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                    <CheckCircle2 size={11} />
                    Connected
                  </span>
                </div>

                <h3 className="mt-4 text-sm font-semibold">
                  {integration.name}
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  {integration.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* SECURITY */}
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck
                  size={20}
                  className="text-emerald-600"
                />

                <h2 className="text-lg font-bold">
                  HR Security & Governance
                </h2>
              </div>

              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Enterprise HR data is protected through identity controls,
                role-based access, audit logging and policy enforcement.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <SecurityItem label="RBAC" />
              <SecurityItem label="Audit Logs" />
              <SecurityItem label="Data Policy" />
              <SecurityItem label="SSO" />
            </div>
          </div>
        </section>

        {/* ARCHITECTURE */}
        <section className="rounded-2xl border border-slate-200 bg-slate-950 p-7 text-white">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
              ModelNow Architecture
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              From employee request to intelligent HR execution.
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              ModelNow connects employees, HR data, AI agents, workflows and
              enterprise systems through one intelligent orchestration layer.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            <ArchitectureStep
              number="01"
              title="Employee"
              description="Request"
            />

            <ArchitectureStep
              number="02"
              title="Understand"
              description="Intent"
            />

            <ArchitectureStep
              number="03"
              title="AI Agent"
              description="Plan"
            />

            <ArchitectureStep
              number="04"
              title="Workflow"
              description="Execute"
            />

            <ArchitectureStep
              number="05"
              title="Enterprise"
              description="Systems"
            />

            <ArchitectureStep
              number="06"
              title="Analytics"
              description="Insights"
            />
          </div>
        </section>
      </div>

      {/* ADD EMPLOYEE MODAL */}
      {showEmployeeModal && (
        <Modal
          title="Add Employee"
          onClose={() => setShowEmployeeModal(false)}
        >
          <div className="space-y-4">
            <Input
              label="Employee Name"
              placeholder="Enter employee name"
            />

            <Input
              label="Email"
              placeholder="employee@company.com"
            />

            <Input
              label="Job Role"
              placeholder="e.g. Software Engineer"
            />

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Department"
                placeholder="Engineering"
              />

              <Input
                label="Location"
                placeholder="Hyderabad"
              />
            </div>

            <button
              onClick={() => setShowEmployeeModal(false)}
              className="w-full rounded-lg bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Create Employee
            </button>
          </div>
        </Modal>
      )}

      {/* RECRUITMENT MODAL */}
      {showCandidateModal && (
        <Modal
          title="AI Recruitment"
          onClose={() => setShowCandidateModal(false)}
        >
          <div className="rounded-xl border border-violet-200 bg-violet-50 p-4">
            <div className="flex items-center gap-3">
              <Sparkles
                size={20}
                className="text-violet-600"
              />

              <div>
                <p className="text-sm font-semibold text-violet-900">
                  AI recruitment ready
                </p>

                <p className="mt-1 text-xs text-violet-700">
                  ModelNow can analyze resumes, score candidates and
                  recommend the best profiles.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {candidateData.slice(0, 3).map((candidate) => (
              <div
                key={candidate.name}
                className="flex items-center justify-between rounded-lg border border-slate-200 p-4"
              >
                <div>
                  <p className="text-sm font-semibold">
                    {candidate.name}
                  </p>

                  <p className="text-xs text-slate-500">
                    {candidate.role} · {candidate.experience}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-violet-600">
                    {candidate.score}
                  </p>

                  <p className="text-[10px] text-slate-400">
                    AI score
                  </p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowCandidateModal(false)}
            className="mt-5 w-full rounded-lg bg-violet-600 py-3 text-sm font-semibold text-white hover:bg-violet-700"
          >
            Start AI Screening
          </button>
        </Modal>
      )}
    </main>
  );
}

/* ---------------- COMPONENTS ---------------- */

function KpiCard({
  title,
  value,
  change,
  icon: Icon,
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight">
            {value}
          </p>

          <p className="mt-1 text-xs font-semibold text-emerald-600">
            {change}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
          <Icon size={19} className="text-slate-700" />
        </div>
      </div>
    </div>
  );
}

function MiniProgress({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-medium text-slate-600">
          {label}
        </span>

        <span className="font-bold text-slate-900">
          {value}%
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-violet-600"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function AutomationCard({
  icon: Icon,
  title,
  description,
  metric,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  metric: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
        <Icon size={19} />
      </div>

      <h3 className="mt-4 text-sm font-bold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-5 text-slate-500">
        {description}
      </p>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-xs font-semibold text-violet-700">
          {metric}
        </span>

        <ArrowUpRight
          size={15}
          className="text-slate-400"
        />
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
        active
          ? "bg-slate-900 text-white"
          : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}

function EmployeeTable({
  employees,
}: {
  employees: Employee[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px] text-left">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr className="text-xs uppercase tracking-wide text-slate-500">
            <th className="px-5 py-4 font-semibold">
              Employee
            </th>

            <th className="px-5 py-4 font-semibold">
              Department
            </th>

            <th className="px-5 py-4 font-semibold">
              Location
            </th>

            <th className="px-5 py-4 font-semibold">
              Performance
            </th>

            <th className="px-5 py-4 font-semibold">
              Status
            </th>

            <th className="px-5 py-4" />
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {employees.map((employee) => (
            <tr
              key={employee.id}
              className="hover:bg-slate-50"
            >
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                    {employee.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")}
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      {employee.name}
                    </p>

                    <p className="text-xs text-slate-500">
                      {employee.role}
                    </p>
                  </div>
                </div>
              </td>

              <td className="px-5 py-4 text-sm text-slate-600">
                {employee.department}
              </td>

              <td className="px-5 py-4 text-sm text-slate-600">
                {employee.location}
              </td>

              <td className="px-5 py-4">
                <span className="font-semibold text-slate-800">
                  {employee.performance}%
                </span>
              </td>

              <td className="px-5 py-4">
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                    employee.status === "Active"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {employee.status}
                </span>
              </td>

              <td className="px-5 py-4">
                <button className="text-slate-400 hover:text-slate-700">
                  <MoreHorizontal size={18} />
                </button>
              </td>
            </tr>
          ))}

          {employees.length === 0 && (
            <tr>
              <td
                colSpan={6}
                className="px-5 py-12 text-center text-sm text-slate-500"
              >
                No employees found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function RecruitmentTable({
  candidates,
  onAddCandidate,
}: {
  candidates: Candidate[];
  onAddCandidate: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between border-b border-slate-100 p-5">
        <div>
          <h3 className="font-semibold">
            AI Candidate Pipeline
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            Candidates ranked using ModelNow intelligence.
          </p>
        </div>

        <button
          onClick={onAddCandidate}
          className="flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-700"
        >
          <Plus size={14} />
          New Screening
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[750px] text-left">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-4">
                Candidate
              </th>

              <th className="px-5 py-4">
                Role
              </th>

              <th className="px-5 py-4">
                Experience
              </th>

              <th className="px-5 py-4">
                AI Score
              </th>

              <th className="px-5 py-4">
                Stage
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {candidates.map((candidate) => (
              <tr key={candidate.name}>
                <td className="px-5 py-4 text-sm font-semibold">
                  {candidate.name}
                </td>

                <td className="px-5 py-4 text-sm text-slate-600">
                  {candidate.role}
                </td>

                <td className="px-5 py-4 text-sm text-slate-600">
                  {candidate.experience}
                </td>

                <td className="px-5 py-4">
                  <span className="font-bold text-violet-600">
                    {candidate.score}%
                  </span>
                </td>

                <td className="px-5 py-4">
                  <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-semibold text-violet-700">
                    {candidate.stage}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ActivityList() {
  return (
    <div className="divide-y divide-slate-100">
      {activityData.map((activity) => {
        const Icon = activity.icon;

        return (
          <div
            key={activity.title}
            className="flex items-center gap-4 p-5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
              <Icon
                size={18}
                className="text-slate-600"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">
                {activity.title}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {activity.department}
              </p>
            </div>

            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Clock3 size={13} />
              {activity.time}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function WorkflowCard({
  workflow,
}: {
  workflow: WorkflowItem;
}) {
  const Icon = workflow.icon;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
          <Icon
            size={19}
            className="text-slate-700"
          />
        </div>

        <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
          {workflow.status}
        </span>
      </div>

      <h3 className="mt-4 text-sm font-bold">
        {workflow.title}
      </h3>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        {workflow.description}
      </p>

      <button className="mt-4 flex items-center gap-1 text-xs font-semibold text-violet-700">
        Configure
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-bold tracking-tight">
        {title}
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        {description}
      </p>
    </div>
  );
}

function SecurityItem({
  label,
}: {
  label: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-center">
      <CheckCircle2
        size={15}
        className="mx-auto text-emerald-600"
      />

      <p className="mt-1 text-[10px] font-semibold text-slate-600">
        {label}
      </p>
    </div>
  );
}

function ArchitectureStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-[10px] font-bold tracking-widest text-violet-300">
        {number}
      </p>

      <p className="mt-3 text-sm font-semibold">
        {title}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <h2 className="text-lg font-bold">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  );
}

function Input({
  label,
  placeholder,
}: {
  label: string;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-600">
        {label}
      </span>

      <input
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400"
      />
    </label>
  );
}