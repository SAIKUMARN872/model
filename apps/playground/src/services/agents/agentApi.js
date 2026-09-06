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

export async function getAgents() {
  return request("/agents");
}

export async function getAgent(id) {
  if (!id) {
    throw new Error(
      "Agent ID is required."
    );
  }

  return request(
    `/agents/${id}`
  );
}

export async function createAgent(
  agentData
) {
  if (!agentData) {
    throw new Error(
      "Agent data is required."
    );
  }

  return request("/agents", {
    method: "POST",
    body: JSON.stringify(
      agentData
    ),
  });
}

export async function updateAgent(
  id,
  agentData
) {
  if (!id) {
    throw new Error(
      "Agent ID is required."
    );
  }

  return request(
    `/agents/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(
        agentData
      ),
    }
  );
}

export async function deleteAgent(
  id
) {
  if (!id) {
    throw new Error(
      "Agent ID is required."
    );
  }

  return request(
    `/agents/${id}`,
    {
      method: "DELETE",
    }
  );
}

export async function runAgent(
  id,
  input
) {
  if (!id) {
    throw new Error(
      "Agent ID is required."
    );
  }

  if (!input) {
    throw new Error(
      "Agent input is required."
    );
  }

  return request(
    `/agents/${id}/run`,
    {
      method: "POST",
      body: JSON.stringify({
        input,
      }),
    }
  );
}

export default {
  getAgents,
  getAgent,
  createAgent,
  updateAgent,
  deleteAgent,
  runAgent,
};