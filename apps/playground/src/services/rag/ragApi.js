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

export async function getDocuments(
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
    `/rag/documents${
      queryString
        ? `?${queryString}`
        : ""
    }`
  );
}

export async function getDocument(
  id
) {
  if (!id) {
    throw new Error(
      "Document ID is required."
    );
  }

  return request(
    `/rag/documents/${id}`
  );
}

export async function uploadDocument(
  documentData
) {
  if (!documentData) {
    throw new Error(
      "Document data is required."
    );
  }

  return request(
    "/rag/documents",
    {
      method: "POST",
      body: JSON.stringify(
        documentData
      ),
    }
  );
}

export async function deleteDocument(
  id
) {
  if (!id) {
    throw new Error(
      "Document ID is required."
    );
  }

  return request(
    `/rag/documents/${id}`,
    {
      method: "DELETE",
    }
  );
}

export async function searchDocuments(
  query,
  options = {}
) {
  if (!query?.trim()) {
    throw new Error(
      "Search query is required."
    );
  }

  return request("/rag/search", {
    method: "POST",
    body: JSON.stringify({
      query,
      ...options,
    }),
  });
}

export async function retrieveDocuments(
  query,
  options = {}
) {
  if (!query?.trim()) {
    throw new Error(
      "Retrieval query is required."
    );
  }

  return request(
    "/rag/retrieve",
    {
      method: "POST",
      body: JSON.stringify({
        query,
        ...options,
      }),
    }
  );
}

export async function generateRagResponse(
  query,
  options = {}
) {
  if (!query?.trim()) {
    throw new Error(
      "RAG query is required."
    );
  }

  return request(
    "/rag/generate",
    {
      method: "POST",
      body: JSON.stringify({
        query,
        ...options,
      }),
    }
  );
}

export async function getRagStatus() {
  return request(
    "/rag/status"
  );
}

export default {
  getDocuments,
  getDocument,
  uploadDocument,
  deleteDocument,
  searchDocuments,
  retrieveDocuments,
  generateRagResponse,
  getRagStatus,
};