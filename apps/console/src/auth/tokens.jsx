const ACCESS_TOKEN_KEY = "modelnow.access-token";

let accessToken = null;

export function setAccessToken(token) {
  if (token === null || token === undefined || token === "") {
    accessToken = null;
    return;
  }

  if (typeof token !== "string" || token.trim() !== token) {
    throw new TypeError("Access token must be a non-empty string.");
  }

  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export function clearAccessToken() {
  accessToken = null;
}

export function hasAccessToken() {
  return typeof accessToken === "string" && accessToken.length > 0;
}

export function getAuthorizationHeader() {
  return hasAccessToken() ? `Bearer ${accessToken}` : null;
}

export const tokenStoragePolicy = Object.freeze({
  storage: "memory",
  persistent: false,
  reason: "Avoid persisting bearer credentials in browser storage."
});

export { ACCESS_TOKEN_KEY };
