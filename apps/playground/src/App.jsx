"use client";

import React from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import AuthProvider from "./providers/AuthProvider";
import AppRoutes from "./routing";

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ErrorBoundary>
  );
}