"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  Globe,
  Monitor,
  Palette,
  Play,
  RefreshCw,
  Rocket,
  Settings2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Terminal,
  Webhook,
  X,
} from "lucide-react";

type EmbedTheme = "dark" | "light" | "system";
type EmbedPosition = "bottom-right" | "bottom-left";
type EmbedStatus = "Published" | "Draft";

type EmbedConfig = {
  id: string;
  name: string;
  agent: string;
  status: EmbedStatus;
  domain: string;
  theme: EmbedTheme;
  position: EmbedPosition;
  conversations: string;
  lastUpdated: string;
};

const initialEmbeds: EmbedConfig[] = [
  {
    id: "embed_001",
    name: "ModelNow Support",
    agent: "Customer Support Agent",
    status: "Published",
    domain: "example.com",
    theme: "dark",
    position: "bottom-right",
    conversations: "8.4K",
    lastUpdated: "12 min ago",
  },
  {
    id: "embed_002",
    name: "Product Assistant",
    agent: "ModelNow Assistant",
    status: "Published",
    domain: "product.example.com",
    theme: "system",
    position: "bottom-right",
    conversations: "4.2K",
    lastUpdated: "1 hour ago",
  },
  {
    id: "embed_003",
    name: "Research Widget",
    agent: "Research Agent",
    status: "Draft",
    domain: "research.example.com",
    theme: "light",
    position: "bottom-left",
    conversations: "0",
    lastUpdated: "Yesterday",
  },
];

const embedCode = `<script src="https://cdn.modelnow.ai/embed.js"
  data-agent="customer-support-agent"
  data-theme="dark"
  data-position="bottom-right"
  data-primary-color="#7c3aed"
  async>
</script>`;

export default function WebsiteEmbedPage() {
  const router = useRouter();

  const [embeds, setEmbeds] =
    useState<EmbedConfig[]>(initialEmbeds);

  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedEmbed, setSelectedEmbed] =
    useState<EmbedConfig | null>(null);
  const [copied, setCopied] = useState(false);

  const [newName, setNewName] = useState("");
  const [newAgent, setNewAgent] =
    useState("Customer Support Agent");
  const [newDomain, setNewDomain] = useState("");
  const [newTheme, setNewTheme] =
    useState<EmbedTheme>("dark");
  const [newPosition, setNewPosition] =
    useState<EmbedPosition>("bottom-right");

  const filteredEmbeds = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return embeds;
    }

    return embeds.filter((embed) => {
      return (
        embed.name.toLowerCase().includes(query) ||
        embed.agent.toLowerCase().includes(query) ||
        embed.domain.toLowerCase().includes(query) ||
        embed.status.toLowerCase().includes(query)
      );
    });
  }, [embeds, search]);

  const createEmbed = () => {
    if (!newName.trim() || !newDomain.trim()) {
      return;
    }

    const newEmbed: EmbedConfig = {
      id: `embed_${Date.now()}`,
      name: newName.trim(),
      agent: newAgent,
      status: "Draft",
      domain: newDomain.trim(),
      theme: newTheme,
      position: newPosition,
      conversations: "0",
      lastUpdated: "Just now",
    };

    setEmbeds((current) => [newEmbed, ...current]);

    setNewName("");
    setNewAgent("Customer Support Agent");
    setNewDomain("");
    setNewTheme("dark");
    setNewPosition("bottom-right");
    setShowCreate(false);
  };

  const togglePublish = (id: string) => {
    setEmbeds((current) =>
      current.map((embed) => {
        if (embed.id !== id) {
          return embed;
        }

        return {
          ...embed,
          status:
            embed.status === "Published"
              ? "Draft"
              : "Published",
          lastUpdated: "Just now",
        };
      })
    );
  };

  const deleteEmbed = (id: string) => {
    setEmbeds((current) =>
      current.filter((embed) => embed.id !== id)
    );

    setSelectedEmbed((current) =>
      current?.id === id ? null : current
    );
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#08070d] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#08070d]/95 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() =>
                router.push("/agent-builder/deployment")
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-gray-400 hover:bg-white/[0.08] hover:text-white"
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <Globe
                  size={18}
                  className="text-violet-400"
                />
                <h1 className="text-sm font-semibold">
                  Website Embed
                </h1>
              </div>

              <p className="text-xs text-gray-500">
                Deploy your AI agent directly on any website
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                router.push("/agent-builder/observability")
              }
              className="hidden items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-400 hover:bg-white/[0.05] hover:text-white md:flex"
            >
              <Activity size={14} />
              Observability
            </button>

            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-xs font-medium hover:bg-violet-500"
            >
              <Sparkles size={14} />
              Create Embed
            </button>
          </div>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-64px)] grid-cols-1 lg:grid-cols-[250px_minmax(0,1fr)_290px]">
        {/* LEFT */}
        <aside className="border-r border-white/10 bg-[#0b0a11] p-5">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">
            Deployment
          </p>

          <div className="mb-5 rounded-xl border border-violet-500/20 bg-violet-500/[0.07] p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/15">
                <Globe
                  size={17}
                  className="text-violet-400"
                />
              </div>

              <div>
                <p className="text-sm font-medium">
                  Website Embed
                </p>
                <p className="text-xs text-gray-500">
                  Web deployment
                </p>
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
                icon: Sparkles,
                route: "/agent-builder/deployment/chat",
              },
              {
                label: "API",
                icon: Terminal,
                route: "/agent-builder/deployment/api",
              },
              {
                label: "SDK",
                icon: Terminal,
                route: "/agent-builder/deployment/sdk",
              },
              {
                label: "Webhooks",
                icon: Webhook,
                route: "/agent-builder/deployment/webhooks",
              },
              {
                label: "Website Embed",
                icon: Globe,
                route: "/agent-builder/deployment/website-embed",
                active: true,
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
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm ${
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

            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-400 hover:bg-white/[0.04] hover:text-white">
              <ExternalLink size={15} />
              Documentation
            </button>

            <button className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-400 hover:bg-white/[0.04] hover:text-white">
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
                <Globe size={15} />
                Website deployment
              </div>

              <h2 className="text-2xl font-semibold">
                Add your AI agent to any website
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
                Create a customizable AI chat widget and embed
                it into your website with one lightweight script.
              </p>
            </div>

            <div className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <MetricCard
                icon={<Globe size={16} />}
                label="Embeds"
                value={String(embeds.length)}
              />

              <MetricCard
                icon={<Check size={16} />}
                label="Published"
                value={String(
                  embeds.filter(
                    (embed) => embed.status === "Published"
                  ).length
                )}
              />

              <MetricCard
                icon={<Sparkles size={16} />}
                label="Conversations"
                value="12.6K"
              />

              <MetricCard
                icon={<Activity size={16} />}
                label="Avg response"
                value="420 ms"
              />
            </div>

            <div className="mb-7 grid gap-4 lg:grid-cols-3">
              <QuickCard
                icon={<Palette size={17} />}
                title="Customizable"
                description="Theme, colors, position and branding."
              />

              <QuickCard
                icon={<ShieldCheck size={17} />}
                title="Secure"
                description="Domain restrictions and secure runtime."
              />

              <QuickCard
                icon={<RefreshCw size={17} />}
                title="Auto-updated"
                description="Agent changes are reflected automatically."
              />
            </div>

            <div className="mb-7 rounded-2xl border border-white/10 bg-[#0d0c14]">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div>
                  <h3 className="text-sm font-semibold">
                    Embed code
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    Paste this script before the closing body tag.
                  </p>
                </div>

                <button
                  onClick={copyCode}
                  className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-400 hover:bg-white/[0.05] hover:text-white"
                >
                  {copied ? (
                    <Check size={13} />
                  ) : (
                    <Copy size={13} />
                  )}

                  {copied ? "Copied" : "Copy code"}
                </button>
              </div>

              <div className="overflow-x-auto p-5">
                <pre className="rounded-xl border border-white/10 bg-[#08070d] p-5 text-xs leading-6 text-gray-400">
                  <code>{embedCode}</code>
                </pre>
              </div>
            </div>

            <div>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold">
                    Website embeds
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    Manage your deployed AI widgets.
                  </p>
                </div>

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search embeds..."
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-xs text-gray-300 outline-none placeholder:text-gray-600 focus:border-violet-500/40 sm:w-64"
                />
              </div>

              <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d0c14]">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px]">
                    <thead>
                      <tr className="border-b border-white/10 text-left">
                        <th className="px-5 py-3 text-[10px] uppercase tracking-wider text-gray-500">
                          Embed
                        </th>
                        <th className="px-5 py-3 text-[10px] uppercase tracking-wider text-gray-500">
                          Agent
                        </th>
                        <th className="px-5 py-3 text-[10px] uppercase tracking-wider text-gray-500">
                          Status
                        </th>
                        <th className="px-5 py-3 text-[10px] uppercase tracking-wider text-gray-500">
                          Domain
                        </th>
                        <th className="px-5 py-3 text-[10px] uppercase tracking-wider text-gray-500">
                          Conversations
                        </th>
                        <th className="px-5 py-3 text-[10px] uppercase tracking-wider text-gray-500">
                          Updated
                        </th>
                        <th className="px-5 py-3" />
                      </tr>
                    </thead>

                    <tbody>
                      {filteredEmbeds.map((embed) => (
                        <EmbedRow
                          key={embed.id}
                          embed={embed}
                          onOpen={() =>
                            setSelectedEmbed(embed)
                          }
                          onToggle={() =>
                            togglePublish(embed.id)
                          }
                          onDelete={() =>
                            deleteEmbed(embed.id)
                          }
                        />
                      ))}

                      {filteredEmbeds.length === 0 && (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-5 py-16 text-center text-sm text-gray-500"
                          >
                            No website embeds found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT */}
        <aside className="border-l border-white/10 bg-[#0b0a11] p-5">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">
            Live Preview
          </p>

          <div className="relative h-[330px] overflow-hidden rounded-2xl border border-white/10 bg-[#15131d]">
            <div className="absolute inset-x-0 top-0 border-b border-white/10 bg-[#111019] px-4 py-3">
              <div className="flex gap-2">
                <span className="h-2 w-2 rounded-full bg-red-400" />
                <span className="h-2 w-2 rounded-full bg-yellow-400" />
                <span className="h-2 w-2 rounded-full bg-green-400" />
              </div>
            </div>

            <div className="absolute bottom-4 right-4 w-56 rounded-2xl border border-white/10 bg-[#100e17] shadow-2xl">
              <div className="flex items-center gap-2 border-b border-white/10 px-3 py-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/15">
                  <Sparkles
                    size={13}
                    className="text-violet-400"
                  />
                </div>

                <div>
                  <p className="text-[10px] font-medium">
                    ModelNow Assistant
                  </p>
                  <p className="text-[8px] text-emerald-400">
                    Online
                  </p>
                </div>
              </div>

              <div className="space-y-2 p-3">
                <div className="max-w-[80%] rounded-lg bg-white/[0.06] p-2 text-[9px] text-gray-400">
                  Hi! How can I help you today?
                </div>

                <div className="ml-auto max-w-[80%] rounded-lg bg-violet-600/80 p-2 text-[9px] text-white">
                  I need help with my account.
                </div>
              </div>

              <div className="border-t border-white/10 p-2">
                <div className="rounded-lg border border-white/10 px-2 py-1.5 text-[8px] text-gray-600">
                  Ask anything...
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <p className="mb-3 text-[10px] uppercase tracking-[0.18em] text-gray-500">
              Appearance
            </p>

            <div className="space-y-2">
              <ConfigItem
                icon={<Palette size={15} />}
                label="Theme"
                value="Dark"
              />

              <ConfigItem
                icon={<Globe size={15} />}
                label="Position"
                value="Bottom right"
              />

              <ConfigItem
                icon={<Monitor size={15} />}
                label="Desktop"
                value="Enabled"
              />

              <ConfigItem
                icon={<Smartphone size={15} />}
                label="Mobile"
                value="Enabled"
              />
            </div>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-3 py-2.5 text-xs font-medium hover:bg-violet-500"
          >
            <Settings2 size={14} />
            Configure widget
          </button>
        </aside>
      </div>

      {/* CREATE MODAL */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-[#100e17] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold">
                  Create website embed
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Configure your website AI widget.
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
                  Embed name
                </label>

                <input
                  value={newName}
                  onChange={(event) =>
                    setNewName(event.target.value)
                  }
                  placeholder="My Website Assistant"
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-gray-300 outline-none placeholder:text-gray-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs text-gray-400">
                  Agent
                </label>

                <select
                  value={newAgent}
                  onChange={(event) =>
                    setNewAgent(event.target.value)
                  }
                  className="w-full rounded-lg border border-white/10 bg-[#0d0c14] px-3 py-2.5 text-sm text-gray-300 outline-none"
                >
                  <option>
                    Customer Support Agent
                  </option>
                  <option>ModelNow Assistant</option>
                  <option>Research Agent</option>
                  <option>Analytics Agent</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs text-gray-400">
                  Allowed domain
                </label>

                <input
                  value={newDomain}
                  onChange={(event) =>
                    setNewDomain(event.target.value)
                  }
                  placeholder="example.com"
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-gray-300 outline-none placeholder:text-gray-600"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs text-gray-400">
                    Theme
                  </label>

                  <select
                    value={newTheme}
                    onChange={(event) =>
                      setNewTheme(
                        event.target.value as EmbedTheme
                      )
                    }
                    className="w-full rounded-lg border border-white/10 bg-[#0d0c14] px-3 py-2.5 text-sm text-gray-300 outline-none"
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="system">System</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs text-gray-400">
                    Position
                  </label>

                  <select
                    value={newPosition}
                    onChange={(event) =>
                      setNewPosition(
                        event.target.value as EmbedPosition
                      )
                    }
                    className="w-full rounded-lg border border-white/10 bg-[#0d0c14] px-3 py-2.5 text-sm text-gray-300 outline-none"
                  >
                    <option value="bottom-right">
                      Bottom right
                    </option>
                    <option value="bottom-left">
                      Bottom left
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-white/10 px-5 py-4">
              <button
                onClick={() => setShowCreate(false)}
                className="rounded-lg border border-white/10 px-4 py-2 text-xs text-gray-400 hover:bg-white/[0.05]"
              >
                Cancel
              </button>

              <button
                onClick={createEmbed}
                disabled={
                  !newName.trim() || !newDomain.trim()
                }
                className="rounded-lg bg-violet-600 px-4 py-2 text-xs font-medium hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Create embed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAILS MODAL */}
      {selectedEmbed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#100e17] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold">
                  {selectedEmbed.name}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  {selectedEmbed.id}
                </p>
              </div>

              <button
                onClick={() => setSelectedEmbed(null)}
                className="rounded-lg p-2 text-gray-500 hover:bg-white/[0.05] hover:text-white"
              >
                <X size={17} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <p className="mb-2 text-[10px] uppercase tracking-wider text-gray-600">
                  Agent
                </p>

                <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-xs text-gray-300">
                  {selectedEmbed.agent}
                </div>
              </div>

              <div>
                <p className="mb-2 text-[10px] uppercase tracking-wider text-gray-600">
                  Domain
                </p>

                <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] p-3">
                  <Globe
                    size={14}
                    className="text-gray-500"
                  />

                  <span className="text-xs text-gray-300">
                    {selectedEmbed.domain}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                  <p className="text-[10px] text-gray-600">
                    Status
                  </p>
                  <p className="mt-1 truncate text-xs text-gray-300">
                    {selectedEmbed.status}
                  </p>
                </div>

                <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                  <p className="text-[10px] text-gray-600">
                    Theme
                  </p>
                  <p className="mt-1 truncate text-xs text-gray-300">
                    {selectedEmbed.theme}
                  </p>
                </div>

                <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                  <p className="text-[10px] text-gray-600">
                    Position
                  </p>
                  <p className="mt-1 truncate text-xs text-gray-300">
                    {selectedEmbed.position ===
                    "bottom-right"
                      ? "Bottom right"
                      : "Bottom left"}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-[#08070d] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-medium">
                    Installation code
                  </p>

                  <button
                    onClick={copyCode}
                    className="flex items-center gap-1.5 text-[10px] text-violet-400"
                  >
                    {copied ? (
                      <Check size={12} />
                    ) : (
                      <Copy size={12} />
                    )}

                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>

                <pre className="overflow-x-auto text-[10px] leading-5 text-gray-500">
                  <code>{embedCode}</code>
                </pre>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/10 px-5 py-4">
              <button
                onClick={() =>
                  togglePublish(selectedEmbed.id)
                }
                className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-400 hover:bg-white/[0.05]"
              >
                <RefreshCw size={13} />

                {selectedEmbed.status === "Published"
                  ? "Unpublish"
                  : "Publish"}
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    deleteEmbed(selectedEmbed.id);
                    setSelectedEmbed(null);
                  }}
                  className="rounded-lg border border-red-500/20 bg-red-500/[0.05] px-3 py-2 text-xs text-red-400"
                >
                  Delete
                </button>

                <button
                  onClick={() => setSelectedEmbed(null)}
                  className="rounded-lg bg-violet-600 px-4 py-2 text-xs font-medium hover:bg-violet-500"
                >
                  Done
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

function QuickCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0d0c14] p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
        {icon}
      </div>

      <p className="mt-3 text-sm font-medium">{title}</p>

      <p className="mt-1 text-xs leading-5 text-gray-500">
        {description}
      </p>
    </div>
  );
}

function ConfigItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <div className="text-gray-500">{icon}</div>

      <div className="flex-1">
        <p className="text-[10px] text-gray-600">{label}</p>
        <p className="mt-0.5 text-xs text-gray-300">
          {value}
        </p>
      </div>
    </div>
  );
}

function EmbedRow({
  embed,
  onOpen,
  onToggle,
  onDelete,
}: {
  embed: EmbedConfig;
  onOpen: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const published = embed.status === "Published";

  return (
    <tr className="border-b border-white/[0.06] hover:bg-white/[0.02]">
      <td className="px-5 py-4">
        <button onClick={onOpen} className="text-left">
          <p className="text-sm font-medium text-gray-200 hover:text-violet-300">
            {embed.name}
          </p>

          <p className="mt-1 text-[11px] text-gray-600">
            {embed.id}
          </p>
        </button>
      </td>

      <td className="px-5 py-4 text-xs text-gray-400">
        {embed.agent}
      </td>

      <td className="px-5 py-4">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] ${
            published
              ? "border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-400"
              : "border-yellow-500/20 bg-yellow-500/[0.08] text-yellow-400"
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {embed.status}
        </span>
      </td>

      <td className="px-5 py-4 text-xs text-gray-500">
        {embed.domain}
      </td>

      <td className="px-5 py-4 text-xs text-gray-400">
        {embed.conversations}
      </td>

      <td className="px-5 py-4 text-xs text-gray-500">
        {embed.lastUpdated}
      </td>

      <td className="relative px-5 py-4 text-right">
        <button
          onClick={() => setMenuOpen((value) => !value)}
          className="rounded-lg p-2 text-gray-500 hover:bg-white/[0.05] hover:text-white"
        >
          <Settings2 size={15} />
        </button>

        {menuOpen && (
          <div className="absolute right-4 top-12 z-30 w-36 rounded-xl border border-white/10 bg-[#121019] p-1.5 shadow-2xl">
            <button
              onClick={() => {
                setMenuOpen(false);
                onOpen();
              }}
              className="w-full rounded-lg px-3 py-2 text-left text-xs text-gray-400 hover:bg-white/[0.05] hover:text-white"
            >
              Configure
            </button>

            <button
              onClick={() => {
                setMenuOpen(false);
                onToggle();
              }}
              className="w-full rounded-lg px-3 py-2 text-left text-xs text-gray-400 hover:bg-white/[0.05] hover:text-white"
            >
              {published ? "Unpublish" : "Publish"}
            </button>

            <button
              onClick={() => {
                setMenuOpen(false);
                onDelete();
              }}
              className="w-full rounded-lg px-3 py-2 text-left text-xs text-red-400 hover:bg-red-500/[0.08]"
            >
              Delete
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}