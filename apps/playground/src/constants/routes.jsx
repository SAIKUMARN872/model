import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <div>Home</div>
          }
        />

        <Route
          path="/models"
          element={
            <div>Models</div>
          }
        />

        <Route
          path="/prompts"
          element={
            <div>Prompts</div>
          }
        />

        <Route
          path="/rag"
          element={
            <div>RAG</div>
          }
        />

        <Route
          path="/settings"
          element={
            <div>Settings</div>
          }
        />

        <Route
          path="/chat"
          element={
            <div>Chat</div>
          }
        />

        <Route
          path="/agents"
          element={
            <div>Agents</div>
          }
        />

        <Route
          path="/evaluation"
          element={
            <div>Evaluation</div>
          }
        />

        <Route
          path="/history"
          element={
            <div>History</div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}