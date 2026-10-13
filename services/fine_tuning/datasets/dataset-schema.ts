import type {
  CreateDatasetInput,
  DatasetFormat,
  FineTuningDataset
} from "../fine-tuning.types.js";

export function validateDatasetInput(
  value: unknown
): CreateDatasetInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError("Dataset input must be an object.");
  }

  const data = value as Record<string, unknown>;
  const formats: DatasetFormat[] = ["jsonl", "json", "csv"];

  if (typeof data.name !== "string" || !data.name.trim()) {
    throw new TypeError("Dataset name is required.");
  }

  if (!formats.includes(data.format as DatasetFormat)) {
    throw new TypeError("Dataset format must be jsonl, json, or csv.");
  }

  if (
    !Array.isArray(data.records) ||
    !data.records.every(
      (record) =>
        typeof record === "object" &&
        record !== null &&
        !Array.isArray(record)
    )
  ) {
    throw new TypeError("Dataset records must be an array of objects.");
  }

  if (
    data.description !== undefined &&
    typeof data.description !== "string"
  ) {
    throw new TypeError("Dataset description must be a string.");
  }

  return {
    name: data.name.trim(),
    format: data.format as DatasetFormat,
    records: structuredClone(data.records as Array<Record<string, unknown>>),
    ...(typeof data.description === "string"
      ? { description: data.description }
      : {})
  };
}

export function createDatasetRecord(
  id: string,
  input: CreateDatasetInput
): FineTuningDataset {
  const now = new Date();

  return {
    id,
    name: input.name,
    format: input.format,
    records: structuredClone(input.records),
    createdAt: now,
    updatedAt: now,
    ...(input.description !== undefined
      ? { description: input.description }
      : {})
  };
}
