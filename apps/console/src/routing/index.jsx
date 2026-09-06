import React from "react";
import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import DashboardPage from "../app/dashboard/page";
import ModelsPage from "../app/models/page";
import AgentsPage from "../app/agents/page";
import PlaygroundPage from "../app/playground/page";
import PromptsPage from "../app/prompts/page";
import ApiKeysPage from "../app/api-keys/page";
import UsagePage from "../app/usage/page";
import BillingPage from "../app/billing/page";
import LogsPage from "../app/logs/page";
import SettingsPage from "../app/settings/page";

/**
 * Application routes.
 */
export const ROUTES = {
  DASHBOARD: "/dashboard",
  MODELS: "/models",
  AGENTS: "/agents",
  PLAYGROUND: "/playground",
  PROMPTS: "/prompts",
  API_KEYS: "/api-keys",
  USAGE: "/usage",
  BILLING: "/billing",
  LOGS: "/logs",
  SETTINGS: "/settings",
};

/**
 * Console Router
 */
const ConsoleRouter = () => {
  return (
    <Routes>
      {/* Default route */}
      <Route
        path="/"
        element={
          <Navigate
            to={ROUTES.DASHBOARD}
            replace
          />
        }
      />

      {/* Dashboard */}
      <Route
        path={ROUTES.DASHBOARD}
        element={<DashboardPage />}
      />

      {/* Models */}
      <Route
        path={ROUTES.MODELS}
        element={<ModelsPage />}
      />

      {/* Agents */}
      <Route
        path={ROUTES.AGENTS}
        element={<AgentsPage />}
      />

      {/* Playground */}
      <Route
        path={ROUTES.PLAYGROUND}
        element={<PlaygroundPage />}
      />

      {/* Prompts */}
      <Route
        path={ROUTES.PROMPTS}
        element={<PromptsPage />}
      />

      {/* API Keys */}
      <Route
        path={ROUTES.API_KEYS}
        element={<ApiKeysPage />}
      />

      {/* Usage */}
      <Route
        path={ROUTES.USAGE}
        element={<UsagePage />}
      />

      {/* Billing */}
      <Route
        path={ROUTES.BILLING}
        element={<BillingPage />}
      />

      {/* Logs */}
      <Route
        path={ROUTES.LOGS}
        element={<LogsPage />}
      />

      {/* Settings */}
      <Route
        path={ROUTES.SETTINGS}
        element={<SettingsPage />}
      />

      {/* Unknown route */}
      <Route
        path="*"
        element={
          <Navigate
            to={ROUTES.DASHBOARD}
            replace
          />
        }
      />
    </Routes>
  );
};

export default ConsoleRouter;