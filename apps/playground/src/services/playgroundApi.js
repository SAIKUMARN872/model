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

export async function runPlayground(
  playgroundData
) {
  if (!playgroundData) {
    throw new Error(
      "Playground data is required."
    );
  }

  return request(
    "/playground/run",
    {
      method: "POST",
      body: JSON.stringify(
        playgroundData
      ),
    }
  );
}

export async function testPlayground(
  playgroundData
) {
  if (!playgroundData) {
    throw new Error(
      "Playground data is required."
    );
  }

  return request(
    "/playground/test",
    {
      method: "POST",
      body: JSON.stringify(
        playgroundData
      ),
    }
  );
}

export async function getPlaygroundHistory(
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
    `/playground/history${
      queryString
        ? `?${queryString}`
        : ""
    }`
  );
}

export async function getPlaygroundRun(
  id
) {
  if (!id) {
    throw new Error(
      "Playground run ID is required."
    );
  }

  return request(
    `/playground/runs/${id}`
  );
}

export async function deletePlaygroundRun(
  id
) {
  if (!id) {
    throw new Error(
      "Playground run ID is required."
    );
  }

  return request(
    `/playground/runs/${id}`,
    {
      method: "DELETE",
    }
  );
}

export async function comparePlayground(
  comparisonData
) {
  if (!comparisonData) {
    throw new Error(
      "Comparison data is required."
    );
  }

  return request(
    "/playground/compare",
    {
      method: "POST",
      body: JSON.stringify(
        comparisonData
      ),
    }
  );
}

export default {
  runPlayground,
  testPlayground,
  getPlaygroundHistory,
  getPlaygroundRun,
  deletePlaygroundRun,
  comparePlayground,
};