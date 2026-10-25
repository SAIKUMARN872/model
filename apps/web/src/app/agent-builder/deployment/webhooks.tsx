"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  Check,
  ChevronDown,
  Clock3,
  Code2,
  Copy,
  ExternalLink,
  Globe,
  KeyRound,
  MoreHorizontal,
  Play,
  Plus,
  RefreshCw,
  Rocket,
  ShieldCheck,
  Terminal,
  Trash2,
  Webhook,
  Zap,
  X,
} from "lucide-react";

type WebhookStatus = "Active" | "Paused" | "Failed";

type WebhookEvent =
  | "agent.completed"
  | "agent.failed"
  | "agent.started"
  | "workflow.completed"
  | "workflow.failed"
  | "approval.required";

type Webhook = {
  id: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  status: WebhookStatus;
  deliveries: string;
  successRate: string;
  lastDelivery: string;
};

const webhookEvents: {
  value: WebhookEvent;
  label: string;
  description: string;
}[] = [
  {
    value: "agent.completed",
    label: "Agent completed",
    description: "Triggered when an agent finishes successfully.",
  },
  {
    value: "agent.failed",
    label: "Agent failed",
    description: "Triggered when an agent execution fails.",
  },
  {
    value: "agent.started",
    label: "Agent started",
    description: "Triggered when an agent execution begins.",
  },
  {
    value: "workflow.completed",
    label: "Workflow completed",
    description: "Triggered when a workflow completes.",
  },
  {
    value: "workflow.failed",
    label: "Workflow failed",
    description: "Triggered when a workflow fails.",
  },
  {
    value: "approval.required",
    label: "Approval required",
    description: "Triggered when human approval is required.",
  },
];

const initialWebhooks: Webhook[] = [
  {
    id: "wh_001",
    name: "Production Events",
    url: "https://api.example.com/modelnow/webhooks",
    events: ["agent.completed", "agent.failed"],
    status: "Active",
    deliveries: "12.8K",
    successRate: "99.8%",
    lastDelivery: "2 min ago",
  },
  {
    id: "wh_002",
    name: "Workflow Automation",
    url: "https://automation.example.com/hooks/modelnow",
    events: ["workflow.completed", "workflow.failed"],
    status: "Active",
    deliveries: "8.4K",
    successRate: "99.5%",
    lastDelivery: "6 min ago",
  },
  {
    id: "wh_003",
    name: "Human Approval",
    url: "https://ops.example.com/approval",
    events: ["approval.required"],
    status: "Paused",
    deliveries: "1.2K",
    successRate: "98.9%",
    lastDelivery: "1 hour ago",
  },
];

export default function WebhooksPage() {
  const router = useRouter();

  const [webhooks, setWebhooks] =
    useState<Webhook[]>(initialWebhooks);

  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedWebhook, setSelectedWebhook] =
    useState<Webhook | null>(null);

  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied] = useState(false);

  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");

  const [selectedEvents, setSelectedEvents] = useState<
    WebhookEvent[]
  >(["agent.completed"]);

  const [secret, setSecret] = useState(
    "whsec_modelnow_live_9f8d7a6c"
  );

  const filteredWebhooks = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return webhooks;
    }

    return webhooks.filter(
      (webhook) =>
        webhook.name.toLowerCase().includes(value) ||
        webhook.url.toLowerCase().includes(value) ||
        webhook.status.toLowerCase().includes(value)
    );
  }, [search, webhooks]);

  const toggleEvent = (event: WebhookEvent) => {
    setSelectedEvents((current) => {
      if (current.includes(event)) {
        return current.filter((item) => item !== event);
      }

      return [...current, event];
    });
  };

  const createWebhook = () => {
    if (!newName.trim() || !newUrl.trim()) {
      return;
    }

    const webhook: Webhook = {
      id: `wh_${Date.now()}`,
      name: newName.trim(),
      url: newUrl.trim(),
      events:
        selectedEvents.length > 0
          ? selectedEvents
          : ["agent.completed"],
      status: "Active",
      deliveries: "0",
      successRate: "—",
      lastDelivery: "Never",
    };

    setWebhooks((current) => [webhook, ...current]);

    setNewName("");
    setNewUrl("");
    setSelectedEvents(["agent.completed"]);
    setShowCreate(false);
  };

  const toggleWebhookStatus = (id: string) => {
    setWebhooks((current) =>
      current.map((webhook) =>
        webhook.id === id
          ? {
              ...webhook,
              status:
                webhook.status === "Active"
                  ? "Paused"
                  : "Active",
            }
          : webhook
      )
    );
  };

  const deleteWebhook = (id: string) => {
    setWebhooks((current) =>
      current.filter((webhook) => webhook.id !== id)
    );

    setSelectedWebhook((current) =>
      current?.id === id ? null : current
    );
  };

  const testWebhook = (webhook: Webhook) => {
    alert(`Test webhook sent to ${webhook.url}`);
  };

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#08070d] text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#08070d]/95 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() =>
                router.push("/agent-builder/deployment")
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-gray-300 transition hover:bg-white/[0.08] hover:text-white"
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <Webhook
                  size={18}
                  className="text-violet-400"
                />
                <h1 className="text-sm font-semibold">
                  Webhooks
                </h1>
              </div>

              <p className="mt-0.5 text-xs text-gray-500">
                Connect ModelNow events to your systems
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                router.push("/agent-builder/observability")
              }
              className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-gray-300 transition hover:bg-white/[0.08] hover:text-white md:flex"
            >
              <Activity size={14} />
              Observability
            </button>

            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 rounded-lg bg-violet-600 px-3.5 py-2 text-xs font-medium transition hover:bg-violet-500"
            >
              <Plus size={14} />
              New Webhook
            </button>
          </div>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-64px)] grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)_300px]">
        {/* LEFT SIDEBAR */}
        <aside className="border-r border-white/10 bg-[#0b0a11] p-5">
          <div className="mb-6">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">
              Deployment
            </p>

            <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.07] p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/15">
                  <Webhook
                    size={17}
                    className="text-violet-400"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium">
                    Webhooks
                  </p>
                  <p className="text-xs text-gray-500">
                    Event delivery
                  </p>
                </div>
              </div>
            </div>
          </div>

          <nav className="space-y-1">
            {[
              {
                label: "Overview",
                icon: Rocket,
                route: "/agent-builder/deployment",
              },
              {
                label: "Chat",
                icon: Zap,
                route: "/agent-builder/deployment/chat",
              },
              {
                label: "API",
                icon: Terminal,
                route: "/agent-builder/deployment/api",
              },
              {
                label: "SDK",
                icon: Code2,
                route: "/agent-builder/deployment/sdk",
              },
              {
                label: "Webhooks",
                icon: Webhook,
                route: "/agent-builder/deployment/webhooks",
                active: true,
              },
              {
                label: "Website Embed",
                icon: Globe,
                route: "/agent-builder/deployment/website-embed",
              },
              {
                label: "Background Agents",
                icon: Play,
                route: "/agent-builder/deployment/background-agents",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  onClick={() => router.push(item.route)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                    item.active
                      ? "bg-violet-500/10 text-violet-300"
                      : "text-gray-400 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>

                  {item.active && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-400" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mt-8 border-t border-white/10 pt-5">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">
              Resources
            </p>

            <button className="mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-gray-400 transition hover:bg-white/[0.04] hover:text-white">
              <ExternalLink size={15} />
              Documentation
            </button>

            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-gray-400 transition hover:bg-white/[0.04] hover:text-white">
              <ShieldCheck size={15} />
              Security
            </button>
          </div>
        </aside>

        {/* CENTER */}
        <section className="min-w-0 p-6 lg:p-8">
          <div className="mx-auto max-w-5xl">
            <div className="mb-7">
              <div className="mb-3 flex items-center gap-2 text-xs text-violet-400">
                <Webhook size={15} />
                Event-driven integrations
              </div>

              <h2 className="text-2xl font-semibold tracking-tight">
                Webhooks
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
                Send real-time ModelNow events to your applications,
                automation platforms, databases, and internal
                services.
              </p>
            </div>

            {/* METRICS */}
            <div className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <MetricCard
                icon={<Webhook size={16} />}
                label="Webhooks"
                value={String(webhooks.length)}
              />

              <MetricCard
                icon={<Activity size={16} />}
                label="Active"
                value={String(
                  webhooks.filter(
                    (webhook) => webhook.status === "Active"
                  ).length
                )}
              />

              <MetricCard
                icon={<Zap size={16} />}
                label="Deliveries"
                value="22.4K"
              />

              <MetricCard
                icon={<Check size={16} />}
                label="Success rate"
                value="99.6%"
              />
            </div>

            {/* SEARCH */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold">
                  Your webhooks
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Manage event destinations and delivery settings.
                </p>
              </div>

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search webhooks..."
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-xs text-gray-300 outline-none placeholder:text-gray-600 focus:border-violet-500/40 sm:w-72"
              />
            </div>

            {/* TABLE */}
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d0c14]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px]">
                  <thead>
                    <tr className="border-b border-white/10 text-left">
                      <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                        Webhook
                      </th>
                      <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                        Events
                      </th>
                      <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                        Status
                      </th>
                      <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                        Deliveries
                      </th>
                      <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                        Success
                      </th>
                      <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                        Last delivery
                      </th>
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>

                  <tbody>
                    {filteredWebhooks.map((webhook) => (
                      <WebhookRow
                        key={webhook.id}
                        webhook={webhook}
                        onOpen={() =>
                          setSelectedWebhook(webhook)
                        }
                        onToggle={() =>
                          toggleWebhookStatus(webhook.id)
                        }
                        onTest={() => testWebhook(webhook)}
                        onDelete={() =>
                          deleteWebhook(webhook.id)
                        }
                      />
                    ))}

                    {filteredWebhooks.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-5 py-16 text-center"
                        >
                          <Webhook
                            size={28}
                            className="mx-auto text-gray-600"
                          />

                          <p className="mt-3 text-sm text-gray-400">
                            No webhooks found
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SUPPORTED EVENTS */}
            <div className="mt-7">
              <div className="mb-4">
                <h3 className="text-sm font-semibold">
                  Supported events
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Choose which ModelNow events your applications
                  should receive.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {webhookEvents.map((event) => (
                  <div
                    key={event.value}
                    className="rounded-xl border border-white/10 bg-[#0d0c14] p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10">
                        <Activity
                          size={15}
                          className="text-violet-400"
                        />
                      </div>

                      <div>
                        <p className="text-sm font-medium">
                          {event.label}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-gray-500">
                          {event.description}
                        </p>

                        <code className="mt-2 inline-block rounded-md bg-black/30 px-2 py-1 text-[10px] text-violet-300">
                          {event.value}
                        </code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECURITY */}
            <div className="mt-7 rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.04] p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                  <ShieldCheck
                    size={19}
                    className="text-emerald-400"
                  />
                </div>

                <div>
                  <h3 className="text-sm font-semibold">
                    Secure webhook delivery
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Every webhook request can be signed so your
                    application can verify the event source.
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {[
                      "HMAC signatures",
                      "Automatic retries",
                      "TLS required",
                      "Delivery logs",
                      "Replay protection",
                    ].map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-gray-400"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT SIDEBAR */}
        <aside className="border-l border-white/10 bg-[#0b0a11] p-5">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">
            Webhook Configuration
          </p>

          <div className="space-y-3">
            <ConfigCard
              icon={<RefreshCw size={16} />}
              title="Retries"
              value="Enabled"
            />

            <ConfigCard
              icon={<Clock3 size={16} />}
              title="Retry window"
              value="24 hours"
            />

            <ConfigCard
              icon={<ShieldCheck size={16} />}
              title="Signing"
              value="HMAC SHA-256"
            />

            <ConfigCard
              icon={<Globe size={16} />}
              title="TLS"
              value="Required"
            />
          </div>

          <div className="mt-6 border-t border-white/10 pt-5">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">
              Signing secret
            </p>

            <div className="rounded-xl border border-white/10 bg-[#0d0c14] p-3">
              <div className="flex items-center gap-2">
                <KeyRound
                  size={14}
                  className="text-violet-400"
                />

                <span className="text-xs text-gray-400">
                  Webhook secret
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 p-2">
                <input
                  readOnly
                  value={
                    showSecret
                      ? secret
                      : "••••••••••••••••••"
                  }
                  className="min-w-0 flex-1 bg-transparent px-1 text-[11px] text-gray-400 outline-none"
                />

                <button
                  onClick={() =>
                    setShowSecret((value) => !value)
                  }
                  className="text-[10px] text-gray-500 hover:text-white"
                >
                  {showSecret ? "Hide" : "Show"}
                </button>

                <button
                  onClick={() => copyText(secret)}
                  className="p-1 text-gray-500 hover:text-white"
                >
                  {copied ? (
                    <Check size={13} />
                  ) : (
                    <Copy size={13} />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-violet-500/15 bg-violet-500/[0.04] p-4">
            <div className="flex items-center gap-2">
              <Rocket
                size={15}
                className="text-violet-400"
              />

              <span className="text-xs font-medium">
                Reliable event delivery
              </span>
            </div>

            <p className="mt-2 text-[11px] leading-5 text-gray-500">
              Monitor delivery latency, failures, retries, and
              webhook events from Observability.
            </p>

            <button
              onClick={() =>
                router.push("/agent-builder/observability")
              }
              className="mt-3 flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300"
            >
              View delivery logs
              <ChevronDown
                size={13}
                className="-rotate-90"
              />
            </button>
          </div>
        </aside>
      </div>

      {/* CREATE MODAL */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-[#100e17] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold">
                  Create webhook
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Configure a new event destination.
                </p>
              </div>

              <button
                onClick={() => setShowCreate(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-white/[0.05] hover:text-white"
              >
                <X size={17} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div>
                <label className="mb-2 block text-xs text-gray-400">
                  Webhook name
                </label>

                <input
                  value={newName}
                  onChange={(event) =>
                    setNewName(event.target.value)
                  }
                  placeholder="Production Events"
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-gray-300 outline-none placeholder:text-gray-600 focus:border-violet-500/40"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs text-gray-400">
                  Endpoint URL
                </label>

                <input
                  value={newUrl}
                  onChange={(event) =>
                    setNewUrl(event.target.value)
                  }
                  placeholder="https://api.example.com/webhooks/modelnow"
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-gray-300 outline-none placeholder:text-gray-600 focus:border-violet-500/40"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs text-gray-400">
                  Events
                </label>

                <div className="grid gap-2">
                  {webhookEvents.map((event) => {
                    const selected = selectedEvents.includes(
                      event.value
                    );

                    return (
                      <button
                        key={event.value}
                        onClick={() =>
                          toggleEvent(event.value)
                        }
                        className={`flex items-center gap-3 rounded-lg border p-3 text-left transition ${
                          selected
                            ? "border-violet-500/30 bg-violet-500/[0.08]"
                            : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"
                        }`}
                      >
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                            selected
                              ? "border-violet-500 bg-violet-500"
                              : "border-white/20"
                          }`}
                        >
                          {selected && (
                            <Check
                              size={12}
                              className="text-white"
                            />
                          )}
                        </div>

                        <div>
                          <p className="text-xs font-medium">
                            {event.label}
                          </p>

                          <p className="mt-0.5 text-[10px] text-gray-600">
                            {event.value}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl border border-amber-500/15 bg-amber-500/[0.04] p-3">
                <div className="flex items-start gap-3">
                  <ShieldCheck
                    size={16}
                    className="mt-0.5 text-amber-400"
                  />

                  <p className="text-xs leading-5 text-gray-500">
                    Webhook requests will be signed using your
                    ModelNow signing secret.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-white/10 px-5 py-4">
              <button
                onClick={() => setShowCreate(false)}
                className="rounded-lg border border-white/10 px-4 py-2 text-xs text-gray-400 hover:bg-white/[0.05] hover:text-white"
              >
                Cancel
              </button>

              <button
                onClick={createWebhook}
                disabled={!newName.trim() || !newUrl.trim()}
                className="rounded-lg bg-violet-600 px-4 py-2 text-xs font-medium transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Create webhook
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAILS MODAL */}
      {selectedWebhook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#100e17] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold">
                  {selectedWebhook.name}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  {selectedWebhook.id}
                </p>
              </div>

              <button
                onClick={() => setSelectedWebhook(null)}
                className="rounded-lg p-2 text-gray-500 hover:bg-white/[0.05] hover:text-white"
              >
                <X size={17} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <p className="mb-2 text-[10px] uppercase tracking-wider text-gray-600">
                  Endpoint
                </p>

                <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 p-3">
                  <Globe
                    size={14}
                    className="shrink-0 text-gray-500"
                  />

                  <p className="min-w-0 flex-1 truncate text-xs text-gray-400">
                    {selectedWebhook.url}
                  </p>

                  <button
                    onClick={() =>
                      copyText(selectedWebhook.url)
                    }
                    className="text-gray-500 hover:text-white"
                  >
                    <Copy size={13} />
                  </button>
                </div>
              </div>

              <div>
                <p className="mb-2 text-[10px] uppercase tracking-wider text-gray-600">
                  Events
                </p>

                <div className="flex flex-wrap gap-2">
                  {selectedWebhook.events.map((event) => (
                    <span
                      key={event}
                      className="rounded-full border border-violet-500/20 bg-violet-500/[0.08] px-2.5 py-1 text-[10px] text-violet-300"
                    >
                      {event}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <SmallMetric
                  label="Status"
                  value={selectedWebhook.status}
                />

                <SmallMetric
                  label="Deliveries"
                  value={selectedWebhook.deliveries}
                />

                <SmallMetric
                  label="Success"
                  value={selectedWebhook.successRate}
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/10 px-5 py-4">
              <button
                onClick={() =>
                  toggleWebhookStatus(selectedWebhook.id)
                }
                className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-400 hover:bg-white/[0.05] hover:text-white"
              >
                <RefreshCw size={13} />

                {selectedWebhook.status === "Active"
                  ? "Pause"
                  : "Activate"}
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    testWebhook(selectedWebhook)
                  }
                  className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-300 hover:bg-white/[0.05]"
                >
                  <Play size={13} />
                  Test
                </button>

                <button
                  onClick={() => {
                    deleteWebhook(selectedWebhook.id);
                    setSelectedWebhook(null);
                  }}
                  className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/[0.05] px-3 py-2 text-xs text-red-400 hover:bg-red-500/[0.1]"
                >
                  <Trash2 size={13} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0d0c14] p-4">
      <div className="mb-3 flex items-center gap-2 text-gray-500">
        {icon}
        <span className="text-[11px]">{label}</span>
      </div>

      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}

function ConfigCard({
  icon,
  title,
  value,
}: {
  icon: ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05] text-gray-400">
        {icon}
      </div>

      <div>
        <p className="text-xs text-gray-500">{title}</p>
        <p className="mt-0.5 text-sm text-gray-300">{value}</p>
      </div>
    </div>
  );
}

function SmallMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
      <p className="text-[10px] text-gray-600">{label}</p>

      <p className="mt-1 truncate text-xs text-gray-300">
        {value}
      </p>
    </div>
  );
}

function WebhookRow({
  webhook,
  onOpen,
  onToggle,
  onTest,
  onDelete,
}: {
  webhook: Webhook;
  onOpen: () => void;
  onToggle: () => void;
  onTest: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const statusClass =
    webhook.status === "Active"
      ? "border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-400"
      : webhook.status === "Paused"
      ? "border-yellow-500/20 bg-yellow-500/[0.08] text-yellow-400"
      : "border-red-500/20 bg-red-500/[0.08] text-red-400";

  return (
    <tr className="border-b border-white/[0.06] transition hover:bg-white/[0.02]">
      <td className="px-5 py-4">
        <button onClick={onOpen} className="text-left">
          <p className="text-sm font-medium text-gray-200 hover:text-violet-300">
            {webhook.name}
          </p>

          <p className="mt-1 max-w-[260px] truncate text-[11px] text-gray-600">
            {webhook.url}
          </p>
        </button>
      </td>

      <td className="px-5 py-4">
        <div className="flex max-w-[190px] flex-wrap gap-1.5">
          {webhook.events.slice(0, 2).map((event) => (
            <span
              key={event}
              className="rounded-md bg-violet-500/[0.08] px-2 py-1 text-[9px] text-violet-300"
            >
              {event}
            </span>
          ))}

          {webhook.events.length > 2 && (
            <span className="rounded-md bg-white/[0.05] px-2 py-1 text-[9px] text-gray-500">
              +{webhook.events.length - 2}
            </span>
          )}
        </div>
      </td>

      <td className="px-5 py-4">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] ${statusClass}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {webhook.status}
        </span>
      </td>

      <td className="px-5 py-4 text-xs text-gray-400">
        {webhook.deliveries}
      </td>

      <td className="px-5 py-4 text-xs text-gray-400">
        {webhook.successRate}
      </td>

      <td className="px-5 py-4 text-xs text-gray-500">
        {webhook.lastDelivery}
      </td>

      <td className="relative px-5 py-4 text-right">
        <button
          onClick={() => setMenuOpen((value) => !value)}
          className="rounded-lg p-2 text-gray-500 hover:bg-white/[0.05] hover:text-white"
        >
          <MoreHorizontal size={16} />
        </button>

        {menuOpen && (
          <div className="absolute right-4 top-12 z-20 w-36 rounded-xl border border-white/10 bg-[#121019] p-1.5 text-left shadow-2xl">
            <button
              onClick={() => {
                setMenuOpen(false);
                onOpen();
              }}
              className="w-full rounded-lg px-3 py-2 text-xs text-gray-400 hover:bg-white/[0.05] hover:text-white"
            >
              View details
            </button>

            <button
              onClick={() => {
                setMenuOpen(false);
                onTest();
              }}
              className="w-full rounded-lg px-3 py-2 text-xs text-gray-400 hover:bg-white/[0.05] hover:text-white"
            >
              Send test
            </button>

            <button
              onClick={() => {
                setMenuOpen(false);
                onToggle();
              }}
              className="w-full rounded-lg px-3 py-2 text-xs text-gray-400 hover:bg-white/[0.05] hover:text-white"
            >
              {webhook.status === "Active"
                ? "Pause"
                : "Activate"}
            </button>

            <button
              onClick={() => {
                setMenuOpen(false);
                onDelete();
              }}
              className="w-full rounded-lg px-3 py-2 text-xs text-red-400 hover:bg-red-500/[0.08]"
            >
              Delete
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}