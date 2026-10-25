"use client";

import { useState } from "react";
import {
  Check,
  ChevronRight,
  Globe,
  MoreHorizontal,
  Plug,
  Search,
  Settings,
  Store,
  Trash2,
  X,
} from "lucide-react";

type Plugin = {
  name: string;
  description: string;
  category: string;
  installed: boolean;
};

const initialPlugins: Plugin[] = [
  {
    name: "Web Search",
    description: "Search the web and retrieve current information.",
    category: "Research",
    installed: true,
  },
  {
    name: "Google Drive",
    description: "Access and work with files stored in Google Drive.",
    category: "Productivity",
    installed: false,
  },
  {
    name: "GitHub",
    description: "Connect repositories and manage development workflows.",
    category: "Development",
    installed: false,
  },
  {
    name: "Slack",
    description: "Connect your workspace and access team conversations.",
    category: "Communication",
    installed: false,
  },
  {
    name: "Notion",
    description: "Connect Notion pages and workspace information.",
    category: "Productivity",
    installed: false,
  },
  {
    name: "Jira",
    description: "Connect projects, issues, and development workflows.",
    category: "Development",
    installed: false,
  },
];

export default function PluginsPage() {
  const [activeTab, setActiveTab] = useState<
    "Browse Plugins" | "Installed" | "Connect" | "Settings"
  >("Browse Plugins");

  const [plugins, setPlugins] = useState(initialPlugins);
  const [search, setSearch] = useState("");
  const [selectedPlugin, setSelectedPlugin] = useState<string | null>(null);
  const [notifications, setNotifications] = useState(true);
  const [autoConnect, setAutoConnect] = useState(false);

  const togglePlugin = (name: string) => {
    setPlugins((current) =>
      current.map((plugin) =>
        plugin.name === name
          ? {
              ...plugin,
              installed: !plugin.installed,
            }
          : plugin,
      ),
    );
  };

  const filteredPlugins = plugins.filter((plugin) => {
    const searchValue = search.toLowerCase();

    return (
      plugin.name.toLowerCase().includes(searchValue) ||
      plugin.description.toLowerCase().includes(searchValue) ||
      plugin.category.toLowerCase().includes(searchValue)
    );
  });

  const installedPlugins = plugins.filter((plugin) => plugin.installed);

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#17181a]">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#e5e7eb] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f1f3f5]">
            <Plug size={20} />
          </div>

          <div className="ml-3">
            <h1 className="text-lg font-semibold">Plugins</h1>

            <p className="text-xs text-[#73777d]">
              Connect ModelNow with external tools and services
            </p>
          </div>
        </div>
      </header>

      {/* Main */}
      <section className="mx-auto max-w-6xl px-6 py-8">
        {/* Navigation */}
        <div className="mb-7 overflow-x-auto rounded-2xl border border-[#e5e7eb] bg-white p-2">
          <div className="flex min-w-max gap-1">
            {(
              [
                "Browse Plugins",
                "Installed",
                "Connect",
                "Settings",
              ] as const
            ).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-xl px-5 py-2.5 text-sm font-medium transition ${
                  activeTab === tab
                    ? "bg-[#17181a] text-white"
                    : "text-[#656a70] hover:bg-[#f3f4f6]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Browse Plugins */}
        {activeTab === "Browse Plugins" && (
          <section>
            <div className="mb-6 rounded-2xl border border-[#e5e7eb] bg-white p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f1f3f5]">
                  <Store size={22} />
                </div>

                <div>
                  <h2 className="text-base font-semibold">
                    Browse Plugins
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-[#73777d]">
                    Extend ModelNow with tools, integrations, and external
                    services.
                  </p>
                </div>
              </div>

              {/* Search */}
              <div className="relative mt-6">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999da3]"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search plugins..."
                  className="h-11 w-full rounded-xl border border-[#e1e3e6] bg-[#fafafa] pl-10 pr-4 text-sm outline-none transition focus:border-[#aeb2b7] focus:bg-white"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {filteredPlugins.map((plugin) => (
                <PluginCard
                  key={plugin.name}
                  plugin={plugin}
                  onToggle={() => togglePlugin(plugin.name)}
                  onOpen={() => setSelectedPlugin(plugin.name)}
                />
              ))}

              {filteredPlugins.length === 0 && (
                <div className="col-span-full rounded-2xl border border-dashed border-[#dfe1e5] bg-white p-10 text-center">
                  <Search
                    size={25}
                    className="mx-auto text-[#9a9da2]"
                  />

                  <p className="mt-3 text-sm font-medium">
                    No plugins found
                  </p>

                  <p className="mt-1 text-xs text-[#85898f]">
                    Try a different search.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Installed */}
        {activeTab === "Installed" && (
          <section>
            <div className="mb-6 rounded-2xl border border-[#e5e7eb] bg-white p-6">
              <h2 className="text-base font-semibold">
                Installed Plugins
              </h2>

              <p className="mt-1 text-sm text-[#73777d]">
                Manage the plugins currently connected to your ModelNow
                account.
              </p>
            </div>

            {installedPlugins.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#dfe1e5] bg-white p-10 text-center">
                <Plug
                  size={25}
                  className="mx-auto text-[#9a9da2]"
                />

                <p className="mt-3 text-sm font-medium">
                  No installed plugins
                </p>

                <p className="mt-1 text-xs text-[#85898f]">
                  Browse plugins to connect your first integration.
                </p>

                <button
                  type="button"
                  onClick={() => setActiveTab("Browse Plugins")}
                  className="mt-5 rounded-xl bg-[#17181a] px-4 py-2.5 text-sm font-medium text-white"
                >
                  Browse Plugins
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {installedPlugins.map((plugin) => (
                  <div
                    key={plugin.name}
                    className="flex items-center gap-4 rounded-2xl border border-[#e5e7eb] bg-white p-5"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f3f4f6]">
                      <Plug size={19} />
                    </div>

                    <div className="flex-1">
                      <p className="text-sm font-semibold">
                        {plugin.name}
                      </p>

                      <p className="mt-1 text-xs text-[#80848a]">
                        {plugin.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => togglePlugin(plugin.name)}
                      className="rounded-lg px-3 py-2 text-xs font-medium text-[#c13d3d] transition hover:bg-[#fff2f2]"
                    >
                      Uninstall
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Connect */}
        {activeTab === "Connect" && (
          <section>
            <div className="mb-6 rounded-2xl border border-[#e5e7eb] bg-white p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f1f3f5]">
                  <Globe size={22} />
                </div>

                <div>
                  <h2 className="text-base font-semibold">
                    Connect a Plugin
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-[#73777d]">
                    Connect ModelNow with an external service using an
                    approved integration.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6">
              <label className="text-sm font-medium">
                Plugin URL or Integration ID
              </label>

              <input
                type="text"
                placeholder="https://example.com/plugin"
                className="mt-2 h-11 w-full rounded-xl border border-[#e1e3e6] bg-[#fafafa] px-4 text-sm outline-none focus:border-[#aeb2b7] focus:bg-white"
              />

              <button
                type="button"
                onClick={() => {
                  setActiveTab("Installed");
                }}
                className="mt-4 rounded-xl bg-[#17181a] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#2b2d30]"
              >
                Connect Plugin
              </button>

              <p className="mt-4 text-xs leading-5 text-[#85898f]">
                Only connect plugins from trusted sources. Authentication
                credentials and permissions should be handled by the backend
                integration layer.
              </p>
            </div>
          </section>
        )}

        {/* Settings */}
        {activeTab === "Settings" && (
          <section>
            <div className="mb-6 rounded-2xl border border-[#e5e7eb] bg-white p-6">
              <h2 className="text-base font-semibold">
                Plugin Settings
              </h2>

              <p className="mt-1 text-sm text-[#73777d]">
                Control how plugins behave inside ModelNow.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white">
              <SettingRow
                title="Plugin Notifications"
                description="Show notifications when plugin tasks finish."
                enabled={notifications}
                onToggle={() =>
                  setNotifications((current) => !current)
                }
              />

              <SettingRow
                title="Automatic Plugin Connections"
                description="Allow approved plugins to reconnect automatically."
                enabled={autoConnect}
                onToggle={() =>
                  setAutoConnect((current) => !current)
                }
              />

              <div className="flex items-center gap-4 border-t border-[#eeeeef] p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3f4f6]">
                  <Settings size={18} />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Manage Permissions
                  </p>

                  <p className="mt-1 text-xs text-[#80848a]">
                    Review permissions granted to connected plugins.
                  </p>
                </div>

                <ChevronRight
                  size={17}
                  className="text-[#9a9da2]"
                />
              </div>
            </div>
          </section>
        )}
      </section>

      {/* Plugin Details Modal */}
      {selectedPlugin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5">
          <div className="w-full max-w-md rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold">
                  {selectedPlugin}
                </h2>

                <p className="mt-1 text-xs text-[#80848a]">
                  Plugin details
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPlugin(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#777b81] hover:bg-[#f3f4f6]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 rounded-xl border border-[#e5e7eb] bg-[#fafafa] p-4">
              <p className="text-sm leading-6 text-[#666b71]">
                This plugin can be connected to ModelNow to extend its AI
                capabilities. Real authentication, permissions, API
                credentials, and connection status should be handled by the
                backend integration system.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                togglePlugin(selectedPlugin);
                setSelectedPlugin(null);
              }}
              className="mt-5 w-full rounded-xl bg-[#17181a] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#2b2d30]"
            >
              {plugins.find((p) => p.name === selectedPlugin)?.installed
                ? "Disconnect Plugin"
                : "Connect Plugin"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function PluginCard({
  plugin,
  onToggle,
  onOpen,
}: {
  plugin: Plugin;
  onToggle: () => void;
  onOpen: () => void;
}) {
  return (
    <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5 transition hover:border-[#d0d3d7] hover:shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f3f4f6]">
          <Plug size={19} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold">
                {plugin.name}
              </h3>

              <p className="mt-1 text-[11px] text-[#8a8e93]">
                {plugin.category}
              </p>
            </div>

            <button
              type="button"
              onClick={onOpen}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#85898f] hover:bg-[#f3f4f6]"
            >
              <MoreHorizontal size={17} />
            </button>
          </div>

          <p className="mt-3 text-xs leading-5 text-[#73777d]">
            {plugin.description}
          </p>

          <div className="mt-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {plugin.installed ? (
                <>
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e8f3ea]">
                    <Check size={12} className="text-[#3d6645]" />
                  </div>

                  <span className="text-xs font-medium text-[#3d6645]">
                    Installed
                  </span>
                </>
              ) : (
                <span className="text-xs text-[#85898f]">
                  Not installed
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={onToggle}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                plugin.installed
                  ? "border border-[#e1e3e6] text-[#555a60] hover:bg-[#f5f5f5]"
                  : "bg-[#17181a] text-white hover:bg-[#2b2d30]"
              }`}
            >
              {plugin.installed ? "Disconnect" : "Connect"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingRow({
  title,
  description,
  enabled,
  onToggle,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-4 border-b border-[#eeeeef] p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3f4f6]">
        <Settings size={18} />
      </div>

      <div className="flex-1">
        <p className="text-sm font-medium">{title}</p>

        <p className="mt-1 text-xs leading-5 text-[#80848a]">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onToggle}
        className={`relative h-6 w-11 rounded-full transition ${
          enabled ? "bg-[#17181a]" : "bg-[#d6d8dc]"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
            enabled ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}