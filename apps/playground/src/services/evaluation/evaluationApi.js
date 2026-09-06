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

export async function getEvaluations(
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
    `/evaluations${
      queryString
        ? `?${queryString}`
        : ""
    }`
  );
}

export async function getEvaluation(
  id
) {
  if (!id) {
    throw new Error(
      "Evaluation ID is required."
    );
  }

  return request(
    `/evaluations/${id}`
  );
}

export async function createEvaluation(
  evaluationData
) {
  if (!evaluationData) {
    throw new Error(
      "Evaluation data is required."
    );
  }

  return request("/evaluations", {
    method: "POST",
    body: JSON.stringify(
      evaluationData
    ),
  });
}

export async function updateEvaluation(
  id,
  evaluationData
) {
  if (!id) {
    throw new Error(
      "Evaluation ID is required."
    );
  }

  return request(
    `/evaluations/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(
        evaluationData
      ),
    }
  );
}

export async function deleteEvaluation(
  id
) {
  if (!id) {
    throw new Error(
      "Evaluation ID is required."
    );
  }

  return request(
    `/evaluations/${id}`,
    {
      method: "DELETE",
    }
  );
}

export async function runEvaluation(
  evaluationId,
  inputData
) {
  if (!evaluationId) {
    throw new Error(
      "Evaluation ID is required."
    );
  }

  return request(
    `/evaluations/${evaluationId}/run`,
    {
      method: "POST",
      body: JSON.stringify(
        inputData || {}
      ),
    }
  );
}

export async function getEvaluationResults(
  evaluationId
) {
  if (!evaluationId) {
    throw new Error(
      "Evaluation ID is required."
    );
  }

  return request(
    `/evaluations/${evaluationId}/results`
  );
}

export default {
  getEvaluations,
  getEvaluation,
  createEvaluation,
  updateEvaluation,
  deleteEvaluation,
  runEvaluation,
  getEvaluationResults,
};