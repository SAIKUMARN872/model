
import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import ErrorBoundary from "./errors/ErrorBoundary";
import { AuthProvider } from "./providers/AuthProvider";

import PlaygroundLayout from "./components/layout/PlaygroundLayout";

// Public website
import PublicPage from "./app/public/page";

// Login
import LoginPage from "./app/login/page";

// Core Playground
import ChatPage from "./app/chat/page";
import ModelsPage from "./app/models/page";
import ComparePage from "./app/compare/page";
import SettingsPage from "./app/settings/page";
import LogoutPage from "./app/logout/page";

// Prompt configuration
import PromptsPage from "./app/prompts/page";
import ParametersPage from "./app/parameters/page";
import SystemInstructionsPage from "./app/system-instructions/page";

// Model capability testing
import StructuredOutputPage from "./app/structured-output/page";
import MultimodalPage from "./app/multimodal/page";
import WebSearchPage from "./app/web-search/page";
import FileTestingPage from "./app/file-testing/page";
import CodeExamplesPage from "./app/code-examples/page";

// Model routing and tools
import RoutingPlayground from "./app/routing-playground/page";
import CostEstimationPage from "./app/cost-estimation/page";
import LatencyTestingPage from "./app/latency/page";
import ApiBuilderPage from "./app/api-builder/page";

// Knowledge and AI tools
import KnowledgeHubPage from "./app/knowledge-hub/page";
import FineTuningPage from "./app/fine-tuning/page";
import AgentsPage from "./app/agents/page";
import RagPage from "./app/rag/page";
import EvaluationPage from "./app/evaluation/page";

// Workspace
import HistoryPage from "./app/history/page";

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>

            {/* Public landing page */}
            <Route
              path="/"
              element={<PublicPage />}
            />

            {/* Public login page */}
            <Route
              path="/login"
              element={<LoginPage />}
            />

            {/* Existing Playground application */}
            <Route element={<PlaygroundLayout />}>

              {/* Core Playground */}
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/models" element={<ModelsPage />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/logout" element={<LogoutPage />} />

              {/* Prompt configuration */}
              <Route path="/prompts" element={<PromptsPage />} />
              <Route path="/parameters" element={<ParametersPage />} />
              <Route
                path="/system-instructions"
                element={<SystemInstructionsPage />}
              />

              {/* Model capability testing */}
              <Route
                path="/structured-output"
                element={<StructuredOutputPage />}
              />
              <Route path="/multimodal" element={<MultimodalPage />} />
              <Route path="/web-search" element={<WebSearchPage />} />
              <Route path="/file-testing" element={<FileTestingPage />} />
              <Route
                path="/code-examples"
                element={<CodeExamplesPage />}
              />

              {/* Model routing */}
              <Route
                path="/routing-playground"
                element={<RoutingPlayground />}
              />
              <Route
                path="/cost-estimation"
                element={<CostEstimationPage />}
              />
              <Route path="/latency" element={<LatencyTestingPage />} />
              <Route path="/api-builder" element={<ApiBuilderPage />} />

              {/* Knowledge and AI tools */}
              <Route
                path="/knowledge-hub"
                element={<KnowledgeHubPage />}
              />
              <Route
                path="/fine-tuning"
                element={<FineTuningPage />}
              />
              <Route path="/agents" element={<AgentsPage />} />
              <Route path="/rag" element={<RagPage />} />
              <Route path="/evaluation" element={<EvaluationPage />} />

              {/* Workspace */}
              <Route path="/history" element={<HistoryPage />} />

              {/* Unknown routes */}
              <Route
                path="*"
                element={<Navigate to="/chat" replace />}
              />

            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
