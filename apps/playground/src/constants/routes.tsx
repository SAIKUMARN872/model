import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import ChatPage from "../app/chat/page";
import ModelsPage from "../app/models/page";
import PromptsPage from "../app/prompts/page";
import RagPage from "../app/rag/page";
import SettingsPage from "../app/settings/page";
import AgentsPage from "../app/agents/page";
import EvaluationPage from "../app/evaluation/page";
import HistoryPage from "../app/history/page";
import ComparePage from "../app/compare/page";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/chat" replace />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/models" element={<ModelsPage />} />
        <Route path="/prompts" element={<PromptsPage />} />
        <Route path="/rag" element={<RagPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/agents" element={<AgentsPage />} />
        <Route path="/evaluation" element={<EvaluationPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="*" element={<Navigate to="/chat" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
