
import { api } from "../lib/api.js";
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "./tokens.jsx";

const SESSION_ENDPOINT =
  process.env.NEXT_PUBLIC_CONSOLE_AUTH_SESSION_ENDPOINT;

const LOGOUT_ENDPOINT =
  process.env.NEXT_PUBLIC_CONSOLE_AUTH_LOGOUT_ENDPOINT;

function requireSameOriginPath(path, settingName) {
  if (
    typeof path !== "string" ||
    !path.trim() ||
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path.includes("\\") ||
    /[\r\n]/.test(path)
  ) {
    throw new Error(
      `${settingName} must be configured as a valid same-origin path.`
    );
  }

  return path;
}

function readSessionPayload(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error(
      "The authentication service returned an invalid session."
    );
  }

  const user = payload.user ?? payload.data?.user ?? null;

  if (!user || typeof user !== "object" || Array.isArray(user)) {
    throw new Error(
      "The authentication service did not return a verified user."
    );
  }

  return Object.freeze({
    authenticated: true,
    user: Object.freeze({
      id: typeof user.id === "string" ? user.id : null,
      email: typeof user.email === "string" ? user.email : null,
      name: typeof user.name === "string" ? user.name : null,
    }),
    expiresAt:
      typeof payload.expiresAt === "string"
        ? payload.expiresAt
        : null,
  });
}

export const AuthService = Object.freeze({
  async getSession() {
    if (
      typeof SESSION_ENDPOINT !== "string" ||
      !SESSION_ENDPOINT.trim()
    ) {
      throw new Error(
        "Authentication is not configured. Set " +
          "NEXT_PUBLIC_CONSOLE_AUTH_SESSION_ENDPOINT " +
          "to your verified same-origin session endpoint."
      );
    }

    const endpoint = requireSameOriginPath(
      SESSION_ENDPOINT,
      "NEXT_PUBLIC_CONSOLE_AUTH_SESSION_ENDPOINT"
    );

    const payload = await api.get(endpoint);

    return readSessionPayload(payload);
  },

  async signOut() {
    try {
      if (
        typeof LOGOUT_ENDPOINT !== "string" ||
        !LOGOUT_ENDPOINT.trim()
      ) {
        throw new Error(
          "Sign-out endpoint is not configured. " +
            "The server session cannot be revoked here."
        );
      }

      const endpoint = requireSameOriginPath(
        LOGOUT_ENDPOINT,
        "NEXT_PUBLIC_CONSOLE_AUTH_LOGOUT_ENDPOINT"
      );

      await api.post(endpoint, {});
    } finally {
      clearAccessToken();
    }
  },

  getAccessToken,
  setAccessToken,
  clearAccessToken,
});

export default AuthService;
