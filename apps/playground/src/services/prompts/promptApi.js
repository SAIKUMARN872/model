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

export async function getPrompts(
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
    `/prompts${
      queryString
        ? `?${queryString}`
        : ""
    }`
  );
}

export async function getPrompt(id) {
  if (!id) {
    throw new Error(
      "Prompt ID is required."
    );
  }

  return request(
    `/prompts/${id}`
  );
}

export async function createPrompt(
  promptData
) {
  if (!promptData) {
    throw new Error(
      "Prompt data is required."
    );
  }

  return request("/prompts", {
    method: "POST",
    body: JSON.stringify(
      promptData
    ),
  });
}

export async function updatePrompt(
  id,
  promptData
) {
  if (!id) {
    throw new Error(
      "Prompt ID is required."
    );
  }

  return request(
    `/prompts/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(
        promptData
      ),
    }
  );
}

export async function deletePrompt(
  id
) {
  if (!id) {
    throw new Error(
      "Prompt ID is required."
    );
  }

  return request(
    `/prompts/${id}`,
    {
      method: "DELETE",
    }
  );
}

export async function runPrompt(
  id,
  inputData
) {
  if (!id) {
    throw new Error(
      "Prompt ID is required."
    );
  }

  return request(
    `/prompts/${id}/run`,
    {
      method: "POST",
      body: JSON.stringify(
        inputData || {}
      ),
    }
  );
}

export async function testPrompt(
  promptData
) {
  if (!promptData) {
    throw new Error(
      "Prompt data is required."
    );
  }

  return request(
    "/prompts/test",
    {
      method: "POST",
      body: JSON.stringify(
        promptData
      ),
    }
  );
}

export async function getPromptVersions(
  id
) {
  if (!id) {
    throw new Error(
      "Prompt ID is required."
    );
  }

  return request(
    `/prompts/${id}/versions`
  );
}

export default {
  getPrompts,
  getPrompt,
  createPrompt,
  updatePrompt,
  deletePrompt,
  runPrompt,
  testPrompt,
  getPromptVersions,
};