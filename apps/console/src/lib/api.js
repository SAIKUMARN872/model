const buildErrorMessage = (payload, fallback) => {
  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  if (payload && typeof payload === "object") {
    return (
      payload.message ||
      payload.error?.message ||
      payload.error ||
      fallback
    );
  }

  return fallback;
};

async function request(url, options = {}) {
  const headers = new Headers(options.headers || {});

  headers.set("Accept", "application/json");

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  let response;

  try {
    response = await fetch(url, {
      ...options,
      headers,
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Unable to connect to the server."
    );
  }

  if (response.status === 204) {
    if (!response.ok) {
      throw new Error("The request could not be completed.");
    }

    return null;
  }

  const contentType = response.headers.get("content-type") || "";
  let payload;

  if (contentType.includes("application/json")) {
    try {
      payload = await response.json();
    } catch {
      throw new Error("The server returned invalid JSON.");
    }
  } else {
    payload = await response.text();
  }

  if (!response.ok) {
    throw new Error(
      buildErrorMessage(
        payload,
        `Request failed with status ${response.status}.`
      )
    );
  }

  return payload;
}

export const api = Object.freeze({
  get(url) {
    return request(url, {
      method: "GET",
    });
  },

  post(url, body = {}) {
    return request(url, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  delete(url) {
    return request(url, {
      method: "DELETE",
    });
  },
});
