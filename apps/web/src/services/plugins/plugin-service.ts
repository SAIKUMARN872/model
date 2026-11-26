import { initialPlugins } from "../../config/plugins";
import type { Plugin } from "./types";

/**
 * Plugin Service
 *
 * Central place for plugin-related operations.
 *
 * Currently this service works with the local plugin configuration.
 * Later these functions can be connected to ModelNow backend APIs
 * without changing the UI components.
 */

export function getPlugins(): Plugin[] {
  return [...initialPlugins];
}

export function getInstalledPlugins(
  plugins: Plugin[] = initialPlugins
): Plugin[] {
  return plugins.filter((plugin) => plugin.installed);
}

export function getPluginById(
  id: string,
  plugins: Plugin[] = initialPlugins
): Plugin | undefined {
  return plugins.find((plugin) => plugin.id === id);
}

export function connectPlugin(
  id: string,
  plugins: Plugin[] = initialPlugins
): Plugin[] {
  return plugins.map((plugin) =>
    plugin.id === id
      ? {
          ...plugin,
          installed: true,
        }
      : plugin
  );
}

export function disconnectPlugin(
  id: string,
  plugins: Plugin[] = initialPlugins
): Plugin[] {
  return plugins.map((plugin) =>
    plugin.id === id
      ? {
          ...plugin,
          installed: false,
        }
      : plugin
  );
}

export function getPluginPermissions(
  id: string,
  plugins: Plugin[] = initialPlugins
): string[] {
  const plugin = getPluginById(id, plugins);

  return plugin?.permissions ?? [];
}