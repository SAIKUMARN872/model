"use client";

import { useMemo, useState } from "react";

import { initialPlugins } from "../../config/plugins";
import type { Plugin } from "../../services/plugins/types";

import PluginHeader from "./PluginHeader";
import PluginTabs from "./PluginTabs";
import PluginSearch from "./PluginSearch";
import PluginCard from "./PluginCard";
import ConnectPlugin from "./ConnectPlugin";
import PluginSettings from "./PluginSettings";
import PluginDetailsModal from "./PluginDetailsModal";
import PluginConnectionModal from "./PluginConnectionModal";
import PluginEmptyState from "./PluginEmptyState";

type PluginTab =
  | "Browse Plugins"
  | "Connect"
  | "Settings";

const categories = [
  "All",
  "Productivity",
  "Development",
  "Business",
  "Communication",
  "Design",
  "Data",
  "Research",
] as const;

type PluginCategory = (typeof categories)[number];

export default function PluginPage() {
  const [activeTab, setActiveTab] =
    useState<PluginTab>("Browse Plugins");

  const [plugins, setPlugins] =
    useState<Plugin[]>(initialPlugins);

  const [search, setSearch] = useState("");

  const [category, setCategory] =
    useState<PluginCategory>("All");

  const [selectedPlugin, setSelectedPlugin] =
    useState<Plugin | null>(null);

  const [connectionPlugin, setConnectionPlugin] =
    useState<Plugin | null>(null);

  const [notifications, setNotifications] =
    useState(true);

  const [autoConnect, setAutoConnect] =
    useState(false);

  /*
   * Connect / disconnect plugin
   */
  const togglePlugin = (name: string) => {
    setPlugins((currentPlugins) =>
      currentPlugins.map((plugin) =>
        plugin.name === name
          ? {
              ...plugin,
              installed: !plugin.installed,
            }
          : plugin
      )
    );

    setSelectedPlugin((currentPlugin) =>
      currentPlugin?.name === name
        ? {
            ...currentPlugin,
            installed: !currentPlugin.installed,
          }
        : currentPlugin
    );
  };

  /*
   * Open connection modal
   */
  const openConnectionModal = (plugin: Plugin) => {
    setConnectionPlugin(plugin);
  };

  /*
   * Close connection modal
   */
  const closeConnectionModal = () => {
    setConnectionPlugin(null);
  };

  /*
   * Complete plugin connection
   */
  const handlePluginConnection = (plugin: Plugin) => {
    setPlugins((currentPlugins) =>
      currentPlugins.map((currentPlugin) =>
        currentPlugin.id === plugin.id
          ? {
              ...currentPlugin,
              installed: true,
            }
          : currentPlugin
      )
    );

    setConnectionPlugin(null);
  };

  /*
   * Filter plugins
   */
  const filteredPlugins = useMemo(() => {
    const query = search.trim().toLowerCase();

    return plugins.filter((plugin) => {
      const matchesCategory =
        category === "All" ||
        plugin.category === category;

      const matchesSearch =
        !query ||
        plugin.name
          .toLowerCase()
          .includes(query) ||
        plugin.description
          .toLowerCase()
          .includes(query) ||
        plugin.category
          .toLowerCase()
          .includes(query);

      return (
        matchesCategory &&
        matchesSearch
      );
    });
  }, [plugins, search, category]);

  /*
   * Custom / advanced connection handler
   */
  const handleConnect = (pluginId: string) => {
    console.log(
      "Plugin connection requested:",
      pluginId
    );
  };

  /*
   * Plugin permissions
   */
  const handleManagePermissions = () => {
    console.log(
      "Manage plugin permissions"
    );
  };

  /*
   * Clear filters
   */
  const clearSearch = () => {
    setSearch("");
    setCategory("All");
  };

  return (
    <main className="min-h-screen bg-[#fafafa] px-6 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <PluginHeader />

        {/* Tabs */}
        <PluginTabs
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {/* ================================================= */}
        {/* Browse Plugins */}
        {/* ================================================= */}

        {activeTab === "Browse Plugins" && (
          <section>
            <div className="mb-6">
              <h2 className="text-base font-semibold text-[#17181a]">
                Plugin Marketplace
              </h2>

              <p className="mt-1 text-sm text-[#85898f]">
                Connect ModelNow with tools and
                services used in your workflows.
              </p>
            </div>

            {/* Search */}
            <div className="mb-4 max-w-xl">
              <PluginSearch
                value={search}
                onChange={setSearch}
              />
            </div>

            {/* Categories */}
            <div className="mb-6 flex flex-wrap gap-2">
              {categories.map((item) => {
                const isActive =
                  category === item;

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      setCategory(item)
                    }
                    className={`rounded-full px-4 py-2 text-xs font-medium transition ${
                      isActive
                        ? "bg-[#17181a] text-white"
                        : "border border-[#e1e3e6] bg-white text-[#73777d] hover:bg-[#f5f5f5]"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>

            {/* Plugin Results */}
            {filteredPlugins.length === 0 ? (
              <PluginEmptyState
                title="No plugins found"
                description="Try searching with a different plugin name, category, or keyword."
                actionLabel="Clear Filters"
                onAction={clearSearch}
              />
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredPlugins.map((plugin) => (
                  <PluginCard
                    key={plugin.name}
                    plugin={plugin}
                    onToggle={() => {
                      if (plugin.installed) {
                        togglePlugin(plugin.name);
                        return;
                      }

                      openConnectionModal(plugin);
                    }}
                    onOpen={() =>
                      setSelectedPlugin(plugin)
                    }
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ================================================= */}
        {/* Connect Plugin */}
        {/* ================================================= */}

        {activeTab === "Connect" && (
          <section>
            <div className="mb-6">
              <h2 className="text-base font-semibold text-[#17181a]">
                Connect Integration
              </h2>

              <p className="mt-1 text-sm text-[#85898f]">
                Add an external integration to
                the ModelNow ecosystem.
              </p>
            </div>

            <ConnectPlugin
              onConnect={handleConnect}
            />
          </section>
        )}

        {/* ================================================= */}
        {/* Plugin Settings */}
        {/* ================================================= */}

        {activeTab === "Settings" && (
          <section>
            <div className="mb-6">
              <h2 className="text-base font-semibold text-[#17181a]">
                Plugin Settings
              </h2>

              <p className="mt-1 text-sm text-[#85898f]">
                Control how ModelNow handles
                connected plugins.
              </p>
            </div>

            <PluginSettings
              notifications={notifications}
              autoConnect={autoConnect}
              onNotificationsChange={() =>
                setNotifications(
                  (value) => !value
                )
              }
              onAutoConnectChange={() =>
                setAutoConnect(
                  (value) => !value
                )
              }
              onManagePermissions={
                handleManagePermissions
              }
            />
          </section>
        )}
      </div>

      {/* ================================================= */}
      {/* Plugin Details Modal */}
      {/* ================================================= */}

      <PluginDetailsModal
        plugin={selectedPlugin}
        onClose={() =>
          setSelectedPlugin(null)
        }
        onToggle={() => {
          if (!selectedPlugin) {
            return;
          }

          togglePlugin(
            selectedPlugin.name
          );
        }}
      />

      {/* ================================================= */}
      {/* Plugin Connection Modal */}
      {/* ================================================= */}

      <PluginConnectionModal
        plugin={connectionPlugin}
        onClose={closeConnectionModal}
        onConnected={handlePluginConnection}
      />
    </main>
  );
}