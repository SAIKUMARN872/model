import { api } from "../lib/api.js";
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken
} from "./tokens.jsx";

const SESSION_ENDPOINT = import.meta.env.VITE_CONSOLE_AUTH_SESSION_ENDPOINT;
const LOGOUT_ENDPOINT = import.meta.env.VITE_CONSOLE_AUTH_LOGOUT_ENDPOINT;

function requireSameOriginPath(path, settingName) {
  if (
    typeof path !== "string" ||
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path.includes("\\") ||
    /[\r\n]/.test(path)
  ) {
    throw new Error(`${settingName} must be configured as a same-origin path.`);
  }

  return path;
}

function readSessionPayload(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("The authentication service returned an invalid session.");
  }

  const user = payload.user ?? payload.data?.user ?? null;

  if (!user || typeof user !== "object" || Array.isArray(user)) {
    throw new Error("The authentication service did not return a verified user.");
  }

  return Object.freeze({
    authenticated: true,
    user: Object.freeze({
      id: typeof user.id === "string" ? user.id : null,
      email: typeof user.email === "string" ? user.email : null,
      name: typeof user.name === "string" ? user.name : null
    }),
    expiresAt: typeof payload.expiresAt === "string"
      ? payload.expiresAt
      : null
  });
}

export const AuthService = Object.freeze({
  async getSession() {
    if (typeof SESSION_ENDPOINT !== "string" || !SESSION_ENDPOINT.trim()) {
      throw new Error(
        "Authentication is not configured. Set VITE_CONSOLE_AUTH_SESSION_ENDPOINT " +
        "to a verified same-origin session endpoint."
      );
    }

    const payload = await api.get(
      requireSameOriginPath(SESSION_ENDPOINT, "VITE_CONSOLE_AUTH_SESSION_ENDPOINT")
    );

    return readSessionPayload(payload);
  },

  async signOut() {
    try {
      if (typeof LOGOUT_ENDPOINT !== "string" || !LOGOUT_ENDPOINT.trim()) {
        throw new Error(
          "Sign-out endpoint is not configured. The server session cannot be revoked here."
        );
      }

      await api.post(
        requireSameOriginPath(LOGOUT_ENDPOINT, "VITE_CONSOLE_AUTH_LOGOUT_ENDPOINT"),
        {}
      );
    } finally {
      clearAccessToken();
    }
  },

  getAccessToken,

  setAccessToken,

  clearAccessToken
});

export default AuthService;
