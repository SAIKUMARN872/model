"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Search,
  Download,
  Eye,
  X,
  Plus,
  CheckCircle2,
  Clock3,
  CircleAlert,
  Wallet,
} from "lucide-react";

type EnterpriseStatus = "Active" | "Pending" | "Overdue" | "Suspended";
type BillingCycle = "Monthly" | "Quarterly" | "Yearly";

type EnterpriseAccount = {
  id: string;
  company: string;
  contact: string;
  email: string;
  plan: string;
  contractValue: number;
  billingCycle: BillingCycle;
  paymentTerms: number;
  nextBilling: string;
  status: EnterpriseStatus;
};

const initialAccounts: EnterpriseAccount[] = [
  {
    id: "ENT-001",
    company: "Acme Technologies",
    contact: "Rahul Mehta",
    email: "rahul@acme.example",
    plan: "Enterprise",
    contractValue: 1200000,
    billingCycle: "Yearly",
    paymentTerms: 30,
    nextBilling: "2026-12-01",
    status: "Active",
  },
  {
    id: "ENT-002",
    company: "Northstar Analytics",
    contact: "Priya Sharma",
    email: "priya@northstar.example",
    plan: "Enterprise",
    contractValue: 720000,
    billingCycle: "Yearly",
    paymentTerms: 30,
    nextBilling: "2026-11-15",
    status: "Active",
  },
  {
    id: "ENT-003",
    company: "Vertex Systems",
    contact: "Karan Patel",
    email: "karan@vertex.example",
    plan: "Enterprise Plus",
    contractValue: 180000,
    billingCycle: "Quarterly",
    paymentTerms: 15,
    nextBilling: "2026-11-05",
    status: "Pending",
  },
  {
    id: "ENT-004",
    company: "Bluewave Digital",
    contact: "Sneha Rao",
    email: "sneha@bluewave.example",
    plan: "Enterprise",
    contractValue: 960000,
    billingCycle: "Yearly",
    paymentTerms: 30,
    nextBilling: "2026-10-20",
    status: "Overdue",
  },
  {
    id: "ENT-005",
    company: "Summit Financial",
    contact: "Arjun Kumar",
    email: "arjun@summit.example",
    plan: "Enterprise Plus",
    contractValue: 2400000,
    billingCycle: "Yearly",
    paymentTerms: 45,
    nextBilling: "2027-01-01",
    status: "Active",
  },
  {
    id: "ENT-006",
    company: "Greenfield Labs",
    contact: "Meera Joshi",
    email: "meera@greenfield.example",
    plan: "Enterprise",
    contractValue: 240000,
    billingCycle: "Monthly",
    paymentTerms: 15,
    nextBilling: "2026-11-10",
    status: "Suspended",
  },
  {
    id: "ENT-007",
    company: "Orbit Consulting",
    contact: "Vikram Reddy",
    email: "vikram@orbit.example",
    plan: "Enterprise",
    contractValue: 480000,
    billingCycle: "Quarterly",
    paymentTerms: 30,
    nextBilling: "2026-11-20",
    status: "Active",
  },
];

const statusStyles: Record<EnterpriseStatus, string> = {
  Active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Pending: "bg-amber-50 text-amber-700 ring-amber-200",
  Overdue: "bg-rose-50 text-rose-700 ring-rose-200",
  Suspended: "bg-slate-100 text-slate-600 ring-slate-200",
};

const currency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function EnterpriseBillingPage() {
  const router = useRouter();

  const [accounts, setAccounts] =
    useState<EnterpriseAccount[]>(initialAccounts);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedAccount, setSelectedAccount] =
    useState<EnterpriseAccount | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [notice, setNotice] = useState("");

  const [form, setForm] = useState({
    company: "",
    contact: "",
    email: "",
    plan: "Enterprise",
    contractValue: "120000",
    billingCycle: "Yearly" as BillingCycle,
    paymentTerms: "30",
    nextBilling: "2026-12-01",
  });

  const stats = useMemo(() => {
    const active = accounts.filter((a) => a.status === "Active");
    const overdue = accounts.filter((a) => a.status === "Overdue");

    return {
      total: accounts.length,
      active: active.length,
      contractValue: accounts.reduce((sum, a) => sum + a.contractValue, 0),
      overdue: overdue.length,
      overdueValue: overdue.reduce((sum, a) => sum + a.contractValue, 0),
    };
  }, [accounts]);

  const filteredAccounts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return accounts.filter((account) => {
      const matchesSearch =
        !query ||
        account.company.toLowerCase().includes(query) ||
        account.contact.toLowerCase().includes(query) ||
        account.email.toLowerCase().includes(query) ||
        account.id.toLowerCase().includes(query) ||
        account.plan.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || account.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [accounts, search, statusFilter]);

  function createAccount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const contractValue = Number(form.contractValue);
    const paymentTerms = Number(form.paymentTerms);

    if (!form.company.trim() || !form.contact.trim() || !form.email.trim()) {
      setNotice("Please complete the required customer details.");
      return;
    }

    if (!form.email.includes("@")) {
      setNotice("Enter a valid contact email.");
      return;
    }

    if (
      !Number.isFinite(contractValue) ||
      contractValue <= 0 ||
      !Number.isFinite(paymentTerms) ||
      paymentTerms < 0 ||
      !Number.isInteger(paymentTerms)
    ) {
      setNotice("Enter a valid contract value and payment terms.");
      return;
    }

    const duplicate = accounts.some(
      (account) =>
        account.company.toLowerCase() === form.company.trim().toLowerCase(),
    );

    if (duplicate) {
      setNotice("An account with this company name already exists.");
      return;
    }

    const newAccount: EnterpriseAccount = {
      id: `ENT-${String(Date.now()).slice(-6)}`,
      company: form.company.trim(),
      contact: form.contact.trim(),
      email: form.email.trim(),
      plan: form.plan,
      contractValue,
      billingCycle: form.billingCycle,
      paymentTerms,
      nextBilling: form.nextBilling,
      status: "Pending",
    };

    setAccounts((current) => [newAccount, ...current]);
    setShowCreateForm(false);
    setForm({
      company: "",
      contact: "",
      email: "",
      plan: "Enterprise",
      contractValue: "120000",
      billingCycle: "Yearly",
      paymentTerms: "30",
      nextBilling: "2026-12-01",
    });
    setNotice("Enterprise account created in demo mode.");
  }

  function updateStatus(id: string, status: EnterpriseStatus) {
    setAccounts((current) =>
      current.map((account) =>
        account.id === id ? { ...account, status } : account,
      ),
    );

    setSelectedAccount((current) =>
      current?.id === id ? { ...current, status } : current,
    );

    setNotice(`Account ${id} updated to ${status} in demo mode.`);
  }

  function exportCSV() {
    const headers = [
      "Account ID",
      "Company",
      "Contact",
      "Email",
      "Plan",
      "Contract Value INR",
      "Billing Cycle",
      "Payment Terms Days",
      "Next Billing",
      "Status",
    ];

    const rows = filteredAccounts.map((account) => [
      account.id,
      account.company,
      account.contact,
      account.email,
      account.plan,
      account.contractValue,
      account.billingCycle,
      account.paymentTerms,
      account.nextBilling,
      account.status,
    ]);

    const escapeCSV = (value: string | number) =>
      `"${String(value).replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "modelnow-enterprise-billing.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <button
              onClick={() => router.push("/billing")}
              aria-label="Back to billing"
              className="mt-1 rounded-xl border border-slate-200 bg-white p-2.5 transition hover:bg-slate-100"
            >
              <ArrowLeft size={19} />
            </button>

            <div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span>Billing</span>
                <span>/</span>
                <span className="text-blue-600">Enterprise</span>
              </div>

              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                Enterprise Billing
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage enterprise customers, contracts, and billing terms.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={exportCSV}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"
            >
              <Download size={17} />
              Export CSV
            </button>

            <button
              onClick={() => {
                setNotice("");
                setShowCreateForm(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              <Plus size={17} />
              Add enterprise
            </button>
          </div>
        </header>

        {notice && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            <span>{notice}</span>
            <button
              onClick={() => setNotice("")}
              aria-label="Dismiss notification"
              className="rounded-lg p-1 hover:bg-blue-100"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Enterprise Accounts"
            value={String(stats.total)}
            description="Total customer accounts"
            icon={<Building2 size={20} />}
            iconClass="bg-blue-50 text-blue-600"
          />

          <StatCard
            title="Active Accounts"
            value={String(stats.active)}
            description="Accounts currently active"
            icon={<CheckCircle2 size={20} />}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            title="Total Contract Value"
            value={currency(stats.contractValue)}
            description="Combined sample contract values"
            icon={<Wallet size={20} />}
            iconClass="bg-violet-50 text-violet-600"
          />

          <StatCard
            title="Overdue Accounts"
            value={String(stats.overdue)}
            description={`${currency(stats.overdueValue)} in associated contract value`}
            icon={<CircleAlert size={20} />}
            iconClass="bg-rose-50 text-rose-600"
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center">
            <div>
              <h2 className="font-semibold">Enterprise customers</h2>
              <p className="mt-1 text-sm text-slate-500">
                Search customer accounts and review their contract details.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search company or account..."
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 sm:w-72"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400"
              >
                <option value="All">All statuses</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Company</th>
                  <th className="px-5 py-4 font-semibold">Plan</th>
                  <th className="px-5 py-4 font-semibold">Contract value</th>
                  <th className="px-5 py-4 font-semibold">Billing cycle</th>
                  <th className="px-5 py-4 font-semibold">Next billing</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 text-right font-semibold">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredAccounts.map((account) => (
                  <tr key={account.id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">
                        {account.company}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {account.id} · {account.contact}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {account.plan}
                    </td>

                    <td className="px-5 py-4 font-semibold">
                      {currency(account.contractValue)}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {account.billingCycle}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {formatDate(account.nextBilling)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusStyles[account.status]}`}
                      >
                        {account.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelectedAccount(account)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <Eye size={15} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredAccounts.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-12 text-center text-slate-500"
                    >
                      No enterprise accounts match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-100 px-5 py-4 text-xs text-slate-500">
            Showing {filteredAccounts.length} of {accounts.length} accounts
          </div>
        </section>

        <section className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <CircleAlert size={20} className="mt-0.5 shrink-0 text-amber-600" />
          <div>
            <h3 className="text-sm font-semibold text-amber-900">
              Demo data
            </h3>
            <p className="mt-1 text-sm leading-6 text-amber-800">
              Enterprise accounts are stored in local component state. Real
              contract management requires backend persistence, role-based
              permissions, invoice generation, payment-provider integration,
              and audit logging. Contract value is not necessarily revenue
              collected.
            </p>
          </div>
        </section>
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-enterprise-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-slate-100 p-5">
              <div>
                <h2 id="create-enterprise-title" className="text-xl font-bold">
                  Add enterprise account
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Enter customer and contract information.
                </p>
              </div>

              <button
                onClick={() => setShowCreateForm(false)}
                aria-label="Close form"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={createAccount} className="space-y-4 p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Company name">
                  <input
                    required
                    value={form.company}
                    onChange={(event) =>
                      setForm({ ...form, company: event.target.value })
                    }
                    placeholder="Company name"
                    className="form-input"
                  />
                </FormField>

                <FormField label="Contact person">
                  <input
                    required
                    value={form.contact}
                    onChange={(event) =>
                      setForm({ ...form, contact: event.target.value })
                    }
                    placeholder="Contact name"
                    className="form-input"
                  />
                </FormField>

                <FormField label="Contact email">
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      setForm({ ...form, email: event.target.value })
                    }
                    placeholder="billing@company.com"
                    className="form-input"
                  />
                </FormField>

                <FormField label="Enterprise plan">
                  <select
                    value={form.plan}
                    onChange={(event) =>
                      setForm({ ...form, plan: event.target.value })
                    }
                    className="form-input"
                  >
                    <option>Enterprise</option>
                    <option>Enterprise Plus</option>
                  </select>
                </FormField>

                <FormField label="Contract value (₹)">
                  <input
                    required
                    type="number"
                    min="1"
                    value={form.contractValue}
                    onChange={(event) =>
                      setForm({ ...form, contractValue: event.target.value })
                    }
                    className="form-input"
                  />
                </FormField>

                <FormField label="Billing cycle">
                  <select
                    value={form.billingCycle}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        billingCycle: event.target.value as BillingCycle,
                      })
                    }
                    className="form-input"
                  >
                    <option>Monthly</option>
                    <option>Quarterly</option>
                    <option>Yearly</option>
                  </select>
                </FormField>

                <FormField label="Payment terms (days)">
                  <input
                    required
                    type="number"
                    min="0"
                    step="1"
                    value={form.paymentTerms}
                    onChange={(event) =>
                      setForm({ ...form, paymentTerms: event.target.value })
                    }
                    className="form-input"
                  />
                </FormField>

                <FormField label="Next billing date">
                  <input
                    required
                    type="date"
                    value={form.nextBilling}
                    onChange={(event) =>
                      setForm({ ...form, nextBilling: event.target.value })
                    }
                    className="form-input"
                  />
                </FormField>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Add account
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {selectedAccount && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedAccount(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="enterprise-details-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-slate-100 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Enterprise account
                </p>
                <h2
                  id="enterprise-details-title"
                  className="mt-1 text-xl font-bold"
                >
                  {selectedAccount.company}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedAccount.id}
                </p>
              </div>

              <button
                onClick={() => setSelectedAccount(null)}
                aria-label="Close account details"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Contract value</p>
                <p className="mt-1 text-3xl font-bold">
                  {currency(selectedAccount.contractValue)}
                </p>
                <span
                  className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusStyles[selectedAccount.status]}`}
                >
                  {selectedAccount.status}
                </span>
              </div>

              <DetailRow label="Contact" value={selectedAccount.contact} />
              <DetailRow label="Email" value={selectedAccount.email} />
              <DetailRow label="Plan" value={selectedAccount.plan} />
              <DetailRow
                label="Billing cycle"
                value={selectedAccount.billingCycle}
              />
              <DetailRow
                label="Payment terms"
                value={`${selectedAccount.paymentTerms} days`}
              />
              <DetailRow
                label="Next billing"
                value={formatDate(selectedAccount.nextBilling)}
              />

              <FormField label="Update account status">
                <select
                  value={selectedAccount.status}
                  onChange={(event) =>
                    updateStatus(
                      selectedAccount.id,
                      event.target.value as EnterpriseStatus,
                    )
                  }
                  className="form-input"
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </FormField>

              <p className="text-xs leading-5 text-slate-500">
                Status changes only affect temporary demo state. They do not
                change a real customer subscription or payment.
              </p>
            </div>
          </section>
        </div>
      )}

      <style jsx>{`
        .form-input {
          width: 100%;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 0.65rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
          background: white;
        }

        .form-input:focus {
          border-color: #60a5fa;
          box-shadow: 0 0 0 3px rgb(219 234 254);
        }
      `}</style>
    </main>
  );
}

function StatCard({
  title,
  value,
  description,
  icon,
  iconClass,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
          <p className="mt-2 text-xs text-slate-500">{description}</p>
        </div>
        <div className={`rounded-xl p-3 ${iconClass}`}>{icon}</div>
      </div>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5 text-sm font-medium text-slate-700">
      <span>{label}</span>
      {children}
    </label>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 text-sm last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="max-w-[65%] text-right font-medium text-slate-800">
        {value}
      </span>
    </div>
  );
}