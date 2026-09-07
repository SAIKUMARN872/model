"use client";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3000/api";

async function request(
  endpoint,
  options = {}
) {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      headers: {
        "Content-Type":
          "application/json",
        ...(options.headers || {}),
      },
      ...options,
    }
  );

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        `Request failed with status ${response.status}`
    );
  }

  return data;
}

export async function getCosts(
  params = {}
) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        query.append(
          key,
          String(value)
        );
      }
    }
  );

  const queryString =
    query.toString();

  return request(
    `/costs${
      queryString
        ? `?${queryString}`
        : ""
    }`
  );
}

export async function getCostSummary() {
  return request(
    "/costs/summary"
  );
}

export async function getCostByModel(
  modelId
) {
  if (!modelId) {
    throw new Error(
      "Model ID is required."
    );
  }

  return request(
    `/costs/model/${modelId}`
  );
}

export async function getCostByProvider(
  providerId
) {
  if (!providerId) {
    throw new Error(
      "Provider ID is required."
    );
  }

  return request(
    `/costs/provider/${providerId}`
  );
}

export async function getCostUsage(
  params = {}
) {
  const query = new URLSearchParams(
    params
  ).toString();

  return request(
    `/costs/usage${
      query ? `?${query}` : ""
    }`
  );
}

export async function recordCost(
  costData
) {
  if (!costData) {
    throw new Error(
      "Cost data is required."
    );
  }

  return request("/costs", {
    method: "POST",
    body: JSON.stringify(
      costData
    ),
  });
}

export async function deleteCost(
  id
) {
  if (!id) {
    throw new Error(
      "Cost ID is required."
    );
  }

  return request(
    `/costs/${id}`,
    {
      method: "DELETE",
    }
  );
}

export default {
  getCosts,
  getCostSummary,
  getCostByModel,
  getCostByProvider,
  getCostUsage,
  recordCost,
  deleteCost,
};