import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

const PluginMarketplace = ({
  apiBaseUrl = "/api",
  workspaceId,
  organizationId,
}) => {
  const [plugins, setPlugins] = useState([]);
  const [categories, setCategories] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [installingId, setInstallingId] =
    useState(null);

  const [error, setError] =
    useState(null);

  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("all");

  const [status, setStatus] =
    useState("all");

  const [selectedPlugin, setSelectedPlugin] =
    useState(null);

  const loadPlugins = useCallback(
    async () => {
      try {
        setLoading(true);
        setError(null);

        const params =
          new URLSearchParams();

        if (workspaceId) {
          params.set(
            "workspaceId",
            workspaceId
          );
        }

        if (organizationId) {
          params.set(
            "organizationId",
            organizationId
          );
        }

        const response =
          await fetch(
            `${apiBaseUrl}/plugins?${params.toString()}`,
            {
              method: "GET",
              credentials: "include",
              headers: {
                Accept:
                  "application/json",
              },
            }
          );

        if (!response.ok) {
          throw new Error(
            `Failed to load plugins (${response.status}).`
          );
        }

        const data =
          await response.json();

        const pluginList =
          Array.isArray(data.plugins)
            ? data.plugins
            : [];

        setPlugins(pluginList);

        setCategories(
          Array.isArray(
            data.categories
          )
            ? data.categories
            : [
                ...new Set(
                  pluginList
                    .map(
                      (plugin) =>
                        plugin.category
                    )
                    .filter(Boolean)
                ),
              ]
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load plugin marketplace."
        );
      } finally {
        setLoading(false);
      }
    },
    [
      apiBaseUrl,
      workspaceId,
      organizationId,
    ]
  );

  useEffect(() => {
    loadPlugins();
  }, [loadPlugins]);

  const filteredPlugins = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return plugins.filter((plugin) => {
      const matchesSearch =
        !query ||
        [
          plugin.name,
          plugin.description,
          plugin.provider,
          plugin.category,
          ...(plugin.tags || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesCategory =
        category === "all" ||
        plugin.category === category;

      const matchesStatus =
        status === "all" ||
        plugin.status === status;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    });
  }, [
    plugins,
    search,
    category,
    status,
  ]);

  const installPlugin = async (
    plugin
  ) => {
    if (!plugin?.id) return;

    try {
      setInstallingId(plugin.id);
      setError(null);

      const response =
        await fetch(
          `${apiBaseUrl}/plugins/${plugin.id}/install`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type":
                "application/json",
              Accept:
                "application/json",
            },
            body: JSON.stringify({
              workspaceId,
              organizationId,
            }),
          }
        );

      if (!response.ok) {
        throw new Error(
          `Failed to install ${plugin.name}.`
        );
      }

      const data =
        await response.json();

      setPlugins((current) =>
        current.map((item) =>
          item.id === plugin.id
            ? {
                ...item,
                installed: true,
                installationId:
                  data.installation?.id ||
                  item.installationId,
              }
            : item
        )
      );

      setSelectedPlugin((current) =>
        current?.id === plugin.id
          ? {
              ...current,
              installed: true,
            }
          : current
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to install plugin."
      );
    } finally {
      setInstallingId(null);
    }
  };

  const uninstallPlugin = async (
    plugin
  ) => {
    if (!plugin?.id) return;

    const confirmed =
      window.confirm(
        `Uninstall ${plugin.name}?`
      );

    if (!confirmed) return;

    try {
      setInstallingId(plugin.id);
      setError(null);

      const response =
        await fetch(
          `${apiBaseUrl}/plugins/${plugin.id}/uninstall`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type":
                "application/json",
              Accept:
                "application/json",
            },
            body: JSON.stringify({
              workspaceId,
              organizationId,
            }),
          }
        );

      if (!response.ok) {
        throw new Error(
          `Failed to uninstall ${plugin.name}.`
        );
      }

      setPlugins((current) =>
        current.map((item) =>
          item.id === plugin.id
            ? {
                ...item,
                installed: false,
                installationId: null,
              }
            : item
        )
      );

      setSelectedPlugin((current) =>
        current?.id === plugin.id
          ? {
              ...current,
              installed: false,
            }
          : current
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to uninstall plugin."
      );
    } finally {
      setInstallingId(null);
    }
  };

  const togglePlugin = async (
    plugin
  ) => {
    if (plugin.installed) {
      await uninstallPlugin(plugin);
    } else {
      await installPlugin(plugin);
    }
  };

  const formatNumber = (value) =>
    new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(Number(value) || 0);

  const formatRating = (rating) =>
    Number(rating || 0).toFixed(1);

  if (loading) {
    return (
      <section className="plugin-marketplace">
        <div className="plugin-marketplace__loading">
          Loading plugin marketplace...
        </div>
      </section>
    );
  }

  return (
    <section className="plugin-marketplace">
      <header className="plugin-marketplace__header">
        <div>
          <span className="plugin-marketplace__eyebrow">
            Integrations
          </span>

          <h1>
            Plugin Marketplace
          </h1>

          <p>
            Discover, install, and manage
            trusted plugins that extend
            your AI workspace.
          </p>
        </div>

        <button
          type="button"
          onClick={loadPlugins}
        >
          Refresh
        </button>
      </header>

      {error && (
        <div
          className="plugin-marketplace__error"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="plugin-marketplace__toolbar">
        <input
          type="search"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search plugins..."
          aria-label="Search plugins"
        />

        <select
          value={category}
          onChange={(event) =>
            setCategory(
              event.target.value
            )
          }
        >
          <option value="all">
            All Categories
          </option>

          {categories.map(
            (item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            )
          )}
        </select>

        <select
          value={status}
          onChange={(event) =>
            setStatus(
              event.target.value
            )
          }
        >
          <option value="all">
            All Plugins
          </option>

          <option value="installed">
            Installed
          </option>

          <option value="available">
            Available
          </option>
        </select>
      </div>

      <div className="plugin-marketplace__stats">
        <div>
          <span>
            Total Plugins
          </span>

          <strong>
            {plugins.length}
          </strong>
        </div>

        <div>
          <span>
            Installed
          </span>

          <strong>
            {
              plugins.filter(
                (plugin) =>
                  plugin.installed
              ).length
            }
          </strong>
        </div>

        <div>
          <span>
            Available
          </span>

          <strong>
            {
              plugins.filter(
                (plugin) =>
                  !plugin.installed
              ).length
            }
          </strong>
        </div>
      </div>

      {filteredPlugins.length ===
      0 ? (
        <div className="plugin-marketplace__empty">
          <h3>
            No plugins found
          </h3>

          <p>
            Try changing your search
            or filter settings.
          </p>
        </div>
      ) : (
        <div className="plugin-marketplace__grid">
          {filteredPlugins.map(
            (plugin) => (
              <article
                key={plugin.id}
                className="plugin-marketplace__card"
              >
                <div className="plugin-marketplace__card-top">
                  <div className="plugin-marketplace__icon">
                    {plugin.icon ? (
                      <img
                        src={plugin.icon}
                        alt=""
                      />
                    ) : (
                      plugin.name
                        ?.charAt(0)
                        ?.toUpperCase() ||
                      "P"
                    )}
                  </div>

                  <span
                    className={`plugin-marketplace__status plugin-marketplace__status--${
                      plugin.installed
                        ? "installed"
                        : "available"
                    }`}
                  >
                    {plugin.installed
                      ? "Installed"
                      : "Available"}
                  </span>
                </div>

                <div className="plugin-marketplace__content">
                  <span className="plugin-marketplace__category">
                    {plugin.category ||
                      "General"}
                  </span>

                  <h3>
                    {plugin.name}
                  </h3>

                  <p>
                    {plugin.description ||
                      "Extend your workspace with this plugin."}
                  </p>

                  <div className="plugin-marketplace__provider">
                    By{" "}
                    <strong>
                      {plugin.provider ||
                        "Community"}
                    </strong>
                  </div>

                  <div className="plugin-marketplace__metrics">
                    <span>
                      ★{" "}
                      {formatRating(
                        plugin.rating
                      )}
                    </span>

                    <span>
                      {formatNumber(
                        plugin.installCount
                      )}{" "}
                      installs
                    </span>
                  </div>

                  {plugin.tags?.length >
                    0 && (
                    <div className="plugin-marketplace__tags">
                      {plugin.tags
                        .slice(0, 4)
                        .map((tag) => (
                          <span
                            key={tag}
                          >
                            {tag}
                          </span>
                        ))}
                    </div>
                  )}
                </div>

                <footer className="plugin-marketplace__card-footer">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedPlugin(
                        plugin
                      )
                    }
                  >
                    Details
                  </button>

                  <button
                    type="button"
                    disabled={
                      installingId ===
                      plugin.id
                    }
                    onClick={() =>
                      togglePlugin(
                        plugin
                      )
                    }
                  >
                    {installingId ===
                    plugin.id
                      ? "Processing..."
                      : plugin.installed
                        ? "Uninstall"
                        : "Install"}
                  </button>
                </footer>
              </article>
            )
          )}
        </div>
      )}

      {selectedPlugin && (
        <div
          className="plugin-marketplace__modal-backdrop"
          onClick={() =>
            setSelectedPlugin(null)
          }
        >
          <div
            className="plugin-marketplace__modal"
            role="dialog"
            aria-modal="true"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <header>
              <div>
                <span>
                  {
                    selectedPlugin.category
                  }
                </span>

                <h2>
                  {selectedPlugin.name}
                </h2>

                <p>
                  By{" "}
                  {
                    selectedPlugin.provider
                  }
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedPlugin(
                    null
                  )
                }
              >
                ×
              </button>
            </header>

            <div className="plugin-marketplace__modal-body">
              <p>
                {selectedPlugin.description}
              </p>

              <div className="plugin-marketplace__detail-grid">
                <div>
                  <span>
                    Version
                  </span>

                  <strong>
                    {selectedPlugin.version ||
                      "Latest"}
                  </strong>
                </div>

                <div>
                  <span>
                    Rating
                  </span>

                  <strong>
                    ★{" "}
                    {formatRating(
                      selectedPlugin.rating
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Installations
                  </span>

                  <strong>
                    {formatNumber(
                      selectedPlugin.installCount
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Security
                  </span>

                  <strong>
                    {selectedPlugin.securityStatus ||
                      "Verified"}
                  </strong>
                </div>
              </div>

              {selectedPlugin.permissions
                ?.length > 0 && (
                <div>
                  <h4>
                    Required Permissions
                  </h4>

                  <ul>
                    {selectedPlugin.permissions.map(
                      (permission) => (
                        <li
                          key={
                            permission
                          }
                        >
                          {permission}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

              {selectedPlugin.features
                ?.length > 0 && (
                <div>
                  <h4>
                    Features
                  </h4>

                  <ul>
                    {selectedPlugin.features.map(
                      (feature) => (
                        <li
                          key={feature}
                        >
                          {feature}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </div>

            <footer>
              <button
                type="button"
                onClick={() =>
                  setSelectedPlugin(
                    null
                  )
                }
              >
                Close
              </button>

              <button
                type="button"
                disabled={
                  installingId ===
                  selectedPlugin.id
                }
                onClick={() =>
                  togglePlugin(
                    selectedPlugin
                  )
                }
              >
                {installingId ===
                selectedPlugin.id
                  ? "Processing..."
                  : selectedPlugin.installed
                    ? "Uninstall Plugin"
                    : "Install Plugin"}
              </button>
            </footer>
          </div>
        </div>
      )}
    </section>
  );
};

export default PluginMarketplace;