import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider.jsx";
import { isKnownRoute, ROUTES } from "../constants/routes.jsx";

export function RequireAuth({ children, fallback = ROUTES.home }) {
  const { authenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div role="status" aria-live="polite">Checking session…</div>;
  }

  if (!authenticated) {
    return (
      <Navigate
        to={fallback}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children;
}

export function normalizeRoutePath(path) {
  if (typeof path !== "string" || !path.startsWith("/")) return null;

  const normalized = path.length > 1
    ? path.replace(/\/+$/, "")
    : path;

  return isKnownRoute(normalized) ? normalized : null;
}

export { ROUTES, isKnownRoute };
