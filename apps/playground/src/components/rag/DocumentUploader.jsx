"use client";

import React, { useState } from "react";

export default function DocumentUploader({
  onUpload,
}) {
  const [file, setFile] =
    useState(null);

  const [message, setMessage] =
    useState("");

  const handleFileChange = (
    event
  ) => {
    const selectedFile =
      event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    setFile(selectedFile);
    setMessage("");
  };

  const handleUpload = () => {
    if (!file) {
      setMessage(
        "Please select a document first."
      );
      return;
    }

    if (onUpload) {
      onUpload(file);
    }

    setMessage(
      "Document uploaded successfully."
    );
  };

  return (
    <div
      style={{
        width: "100%",
        padding: "24px",
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        border:
          "1px solid #e2e8f0",
        boxSizing: "border-box",
      }}
    >
      <h2
        style={{
          marginTop: 0,
          color: "#0f172a",
        }}
      >
        Upload Document
      </h2>

      <p
        style={{
          color: "#64748b",
        }}
      >
        Select a document to add it
        to your knowledge base.
      </p>

      <input
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        onChange={handleFileChange}
        style={{
          marginTop: "12px",
          width: "100%",
        }}
      />

      {file && (
        <p
          style={{
            marginTop: "12px",
            color: "#0f172a",
          }}
        >
          Selected: {file.name}
        </p>
      )}

      <button
        type="button"
        onClick={handleUpload}
        disabled={!file}
        style={{
          marginTop: "16px",
          padding: "10px 20px",
          border: "none",
          borderRadius: "6px",
          backgroundColor: file
            ? "#2563eb"
            : "#94a3b8",
          color: "#ffffff",
          cursor: file
            ? "pointer"
            : "not-allowed",
        }}
      >
        Upload Document
      </button>

      {message && (
        <p
          style={{
            marginTop: "12px",
            color: "#166534",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}