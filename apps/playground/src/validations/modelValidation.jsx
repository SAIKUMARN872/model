"use client";

import React, { useState } from "react";

export const validateModel = (
  model = {}
) => {
  const errors = {};

  if (!model.name?.trim()) {
    errors.name =
      "Model name is required.";
  }

  if (!model.provider?.trim()) {
    errors.provider =
      "Model provider is required.";
  }

  if (
    model.temperature !== undefined &&
    model.temperature !== ""
  ) {
    const temperature =
      Number(model.temperature);

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
    model.maxTokens !== undefined &&
    model.maxTokens !== ""
  ) {
    const maxTokens =
      Number(model.maxTokens);

    if (
      !Number.isInteger(maxTokens) ||
      maxTokens <= 0
    ) {
      errors.maxTokens =
        "Max tokens must be a positive integer.";
    }
  }

  if (
    model.topP !== undefined &&
    model.topP !== ""
  ) {
    const topP =
      Number(model.topP);

    if (
      Number.isNaN(topP) ||
      topP < 0 ||
      topP > 1
    ) {
      errors.topP =
        "Top P must be between 0 and 1.";
    }
  }

  return errors;
};

export const isValidModel = (
  model
) => {
  return (
    Object.keys(
      validateModel(model)
    ).length === 0
  );
};

export default function ModelValidation({
  initialModel = {},
  onValid,
  onSubmit,
}) {
  const [model, setModel] =
    useState({
      name:
        initialModel.name || "",
      provider:
        initialModel.provider || "",
      version:
        initialModel.version || "",
      temperature:
        initialModel.temperature ?? 0.7,
      maxTokens:
        initialModel.maxTokens ?? 2048,
      topP:
        initialModel.topP ?? 1,
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

    const updatedModel = {
      ...model,
      [name]: value,
    };

    setModel(updatedModel);

    const validationErrors =
      validateModel(
        updatedModel
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
      onValid(updatedModel);
    }
  };

  const handleSubmit = (
    event
  ) => {
    event.preventDefault();

    const validationErrors =
      validateModel(model);

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

    if (onSubmit) {
      onSubmit({
        ...model,
        temperature:
          Number(
            model.temperature
          ),
        maxTokens:
          Number(
            model.maxTokens
          ),
        topP: Number(
          model.topP
        ),
      });
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
        maxWidth: "600px",
      }}
    >
      <div>
        <label>
          Model Name
        </label>

        <input
          type="text"
          name="name"
          value={model.name}
          onChange={
            handleChange
          }
          placeholder="Enter model name"
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
          Provider
        </label>

        <input
          type="text"
          name="provider"
          value={
            model.provider
          }
          onChange={
            handleChange
          }
          placeholder="Enter provider"
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "6px",
          }}
        />

        {errors.provider && (
          <p
            style={{
              color: "#dc2626",
              fontSize: "13px",
            }}
          >
            {errors.provider}
          </p>
        )}
      </div>

      <div>
        <label>
          Version
        </label>

        <input
          type="text"
          name="version"
          value={
            model.version
          }
          onChange={
            handleChange
          }
          placeholder="e.g. 1.0.0"
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "6px",
          }}
        />
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
            model.temperature
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
            model.maxTokens
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

      <div>
        <label>
          Top P
        </label>

        <input
          type="number"
          name="topP"
          min="0"
          max="1"
          step="0.1"
          value={model.topP}
          onChange={
            handleChange
          }
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "6px",
          }}
        />

        {errors.topP && (
          <p
            style={{
              color: "#dc2626",
              fontSize: "13px",
            }}
          >
            {errors.topP}
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
        Validate Model
      </button>
    </form>
  );
}