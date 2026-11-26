import React from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

// Layout
import AdminLayout from "./layouts/AdminLayout";

// Main pages
import Dashboard from "./dashboard";
import Agents from "./agents";
import Analytics from "./analytics";

// Management
import Users from "./users";
import Teams from "./teams";
import Workspaces from "./workspaces";
import Organizations from "./organizations";

// Monitoring
import Usage from "./usage";
import Storage from "./storage";
import Audit from "./audit";

// Security
import ApiKeys from "./api_keys";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Admin Layout */}
        <Route
          path="/"
          element={<AdminLayout />}
        >
          {/* Default route */}
          <Route
            index
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

          {/* Dashboard */}
          <Route
            path="dashboard"
            element={<Dashboard />}
          />

          {/* AI / Agents */}
          <Route
            path="agents"
            element={<Agents />}
          />

          {/* Analytics */}
          <Route
            path="analytics"
            element={<Analytics />}
          />

          {/* Users */}
          <Route
            path="users"
            element={<Users />}
          />

          {/* Teams */}
          <Route
            path="teams"
            element={<Teams />}
          />

          {/* Workspaces */}
          <Route
            path="workspaces"
            element={<Workspaces />}
          />

          {/* Organizations */}
          <Route
            path="organizations"
            element={<Organizations />}
          />

          {/* Usage */}
          <Route
            path="usage"
            element={<Usage />}
          />

          {/* Storage */}
          <Route
            path="storage"
            element={<Storage />}
          />

          {/* Audit Logs */}
          <Route
            path="audit"
            element={<Audit />}
          />

          {/* API Keys */}
          <Route
            path="api-keys"
            element={<ApiKeys />}
          />

          {/* 404 */}
          <Route
            path="*"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}