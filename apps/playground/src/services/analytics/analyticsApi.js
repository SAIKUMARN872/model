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

export async function getAnalytics(
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
    `/analytics${
      queryString
        ? `?${queryString}`
        : ""
    }`
  );
}

export async function getAnalyticsSummary() {
  return request(
    "/analytics/summary"
  );
}

export async function getAnalyticsMetrics(
  params = {}
) {
  const query = new URLSearchParams(
    params
  ).toString();

  return request(
    `/analytics/metrics${
      query ? `?${query}` : ""
    }`
  );
}

export async function getUsageStats(
  params = {}
) {
  const query = new URLSearchParams(
    params
  ).toString();

  return request(
    `/analytics/usage${
      query ? `?${query}` : ""
    }`
  );
}

export async function getPerformanceStats(
  params = {}
) {
  const query = new URLSearchParams(
    params
  ).toString();

  return request(
    `/analytics/performance${
      query ? `?${query}` : ""
    }`
  );
}

export async function recordAnalytics(
  analyticsData
) {
  if (!analyticsData) {
    throw new Error(
      "Analytics data is required."
    );
  }

  return request("/analytics", {
    method: "POST",
    body: JSON.stringify(
      analyticsData
    ),
  });
}

export async function deleteAnalytics(
  id
) {
  if (!id) {
    throw new Error(
      "Analytics ID is required."
    );
  }

  return request(
    `/analytics/${id}`,
    {
      method: "DELETE",
    }
  );
}

export default {
  getAnalytics,
  getAnalyticsSummary,
  getAnalyticsMetrics,
  getUsageStats,
  getPerformanceStats,
  recordAnalytics,
  deleteAnalytics,
};