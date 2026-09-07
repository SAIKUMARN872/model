"use client";

import React, { useState } from "react";

export const validatePrompt = (
  prompt = {}
) => {
  const errors = {};

  if (!prompt.name?.trim()) {
    errors.name =
      "Prompt name is required.";
  }

  if (!prompt.content?.trim()) {
    errors.content =
      "Prompt content is required.";
  }

  if (
    prompt.description !== undefined &&
    prompt.description.length > 500
  ) {
    errors.description =
      "Description must be 500 characters or less.";
  }

  if (
    prompt.temperature !== undefined &&
    prompt.temperature !== ""
  ) {
    const temperature =
      Number(prompt.temperature);

    if (
      Number.isNaN(temperature) ||
      temperature < 0 ||
      temperature > 2
    ) {
      errors.temperature =
        "Temperature must be between 0 and 2.";
    }
  }

  if (
    prompt.maxTokens !== undefined &&
    prompt.maxTokens !== ""
  ) {
    const maxTokens =
      Number(prompt.maxTokens);

    if (
      !Number.isInteger(maxTokens) ||
      maxTokens <= 0
    ) {
      errors.maxTokens =
        "Max tokens must be a positive integer.";
    }
  }

  return errors;
};

export const isValidPrompt = (
  prompt
) => {
  return (
    Object.keys(
      validatePrompt(prompt)
    ).length === 0
  );
};

export default function PromptValidation({
  initialPrompt = {},
  onValid,
  onSubmit,
}) {
  const [prompt, setPrompt] =
    useState({
      name:
        initialPrompt.name || "",
      description:
        initialPrompt.description ||
        "",
      content:
        initialPrompt.content || "",
      temperature:
        initialPrompt.temperature ??
        0.7,
      maxTokens:
        initialPrompt.maxTokens ??
        2048,
    });

  const [errors, setErrors] =
    useState({});

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    const updatedPrompt = {
      ...prompt,
      [name]: value,
    };

    setPrompt(updatedPrompt);

    const validationErrors =
      validatePrompt(
        updatedPrompt
      );

    setErrors(
      validationErrors
    );

    if (
      Object.keys(
        validationErrors
      ).length === 0 &&
      onValid
    ) {
      onValid(updatedPrompt);
    }
  };

  const handleSubmit = (
    event
  ) => {
    event.preventDefault();

    const validationErrors =
      validatePrompt(prompt);

    setErrors(
      validationErrors
    );

    if (
      Object.keys(
        validationErrors
      ).length > 0
    ) {
      return;
    }

    const validatedPrompt = {
      ...prompt,
      temperature:
        Number(
          prompt.temperature
        ),
      maxTokens:
        Number(
          prompt.maxTokens
        ),
    };

    if (onSubmit) {
      onSubmit(
        validatedPrompt
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        width: "100%",
        maxWidth: "700px",
      }}
    >
      <div>
        <label>
          Prompt Name
        </label>

        <input
          type="text"
          name="name"
          value={prompt.name}
          onChange={
            handleChange
          }
          placeholder="Enter prompt name"
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "6px",
          }}
        />

        {errors.name && (
          <p
            style={{
              color: "#dc2626",
              fontSize: "13px",
            }}
          >
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label>
          Description
        </label>

        <input
          type="text"
          name="description"
          value={
            prompt.description
          }
          onChange={
            handleChange
          }
          placeholder="Describe the prompt"
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "6px",
          }}
        />

        {errors.description && (
          <p
            style={{
              color: "#dc2626",
              fontSize: "13px",
            }}
          >
            {
              errors.description
            }
          </p>
        )}
      </div>

      <div>
        <label>
          Prompt Content
        </label>

        <textarea
          name="content"
          value={
            prompt.content
          }
          onChange={
            handleChange
          }
          placeholder="Enter your prompt instructions..."
          rows={8}
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "6px",
            resize: "vertical",
          }}
        />

        {errors.content && (
          <p
            style={{
              color: "#dc2626",
              fontSize: "13px",
            }}
          >
            {errors.content}
          </p>
        )}
      </div>

      <div>
        <label>
          Temperature
        </label>

        <input
          type="number"
          name="temperature"
          min="0"
          max="2"
          step="0.1"
          value={
            prompt.temperature
          }
          onChange={
            handleChange
          }
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "6px",
          }}
        />

        {errors.temperature && (
          <p
            style={{
              color: "#dc2626",
              fontSize: "13px",
            }}
          >
            {
              errors.temperature
            }
          </p>
        )}
      </div>

      <div>
        <label>
          Max Tokens
        </label>

        <input
          type="number"
          name="maxTokens"
          min="1"
          value={
            prompt.maxTokens
          }
          onChange={
            handleChange
          }
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "6px",
          }}
        />

        {errors.maxTokens && (
          <p
            style={{
              color: "#dc2626",
              fontSize: "13px",
            }}
          >
            {
              errors.maxTokens
            }
          </p>
        )}
      </div>

      <button
        type="submit"
        style={{
          padding: "12px 20px",
          border: "none",
          borderRadius: "6px",
          background:
            "#2563eb",
          color: "#ffffff",
          cursor: "pointer",
        }}
      >
        Validate Prompt
      </button>
    </form>
  );
}