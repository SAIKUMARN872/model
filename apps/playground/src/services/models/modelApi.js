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

export async function getModels(
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
    `/models${
      queryString
        ? `?${queryString}`
        : ""
    }`
  );
}

export async function getModel(id) {
  if (!id) {
    throw new Error(
      "Model ID is required."
    );
  }

  return request(
    `/models/${id}`
  );
}

export async function createModel(
  modelData
) {
  if (!modelData) {
    throw new Error(
      "Model data is required."
    );
  }

  return request("/models", {
    method: "POST",
    body: JSON.stringify(
      modelData
    ),
  });
}

export async function updateModel(
  id,
  modelData
) {
  if (!id) {
    throw new Error(
      "Model ID is required."
    );
  }

  return request(
    `/models/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(
        modelData
      ),
    }
  );
}

export async function deleteModel(
  id
) {
  if (!id) {
    throw new Error(
      "Model ID is required."
    );
  }

  return request(
    `/models/${id}`,
    {
      method: "DELETE",
    }
  );
}

export async function testModel(
  id,
  input
) {
  if (!id) {
    throw new Error(
      "Model ID is required."
    );
  }

  if (!input) {
    throw new Error(
      "Model input is required."
    );
  }

  return request(
    `/models/${id}/test`,
    {
      method: "POST",
      body: JSON.stringify({
        input,
      }),
    }
  );
}

export async function getModelMetrics(
  id
) {
  if (!id) {
    throw new Error(
      "Model ID is required."
    );
  }

  return request(
    `/models/${id}/metrics`
  );
}

export default {
  getModels,
  getModel,
  createModel,
  updateModel,
  deleteModel,
  testModel,
  getModelMetrics,
};