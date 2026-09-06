class ApiClient {
  constructor(baseUrl = "") {
    this.baseUrl = baseUrl;
  }

  async request(
    endpoint,
    options = {}
  ) {
    const url =
      this.baseUrl + endpoint;

    const response = await fetch(url, {
      method:
        options.method || "GET",

      headers: {
        "Content-Type":
          "application/json",
        ...(options.headers || {}),
      },

      body:
        options.body !== undefined
          ? JSON.stringify(
              options.body
            )
          : undefined,
    });

    let data = null;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      throw new Error(
        data?.message ||
          "API request failed."
      );
    }

    return data;
  }

  get(endpoint, headers = {}) {
    return this.request(endpoint, {
      method: "GET",
      headers,
    });
  }

  post(
    endpoint,
    body,
    headers = {}
  ) {
    return this.request(endpoint, {
      method: "POST",
      body,
      headers,
    });
  }

  put(
    endpoint,
    body,
    headers = {}
  ) {
    return this.request(endpoint, {
      method: "PUT",
      body,
      headers,
    });
  }

  patch(
    endpoint,
    body,
    headers = {}
  ) {
    return this.request(endpoint, {
      method: "PATCH",
      body,
      headers,
    });
  }

  delete(
    endpoint,
    headers = {}
  ) {
    return this.request(endpoint, {
      method: "DELETE",
      headers,
    });
  }
}

const client =
  new ApiClient();

module.exports = client;