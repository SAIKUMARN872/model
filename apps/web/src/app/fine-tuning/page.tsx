"use client";

import {
  ArrowLeft,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

import {
  useEffect,
  useState,
  type ChangeEvent,
} from "react";

import AutopilotPanel from "../../components/fine-tuning/AutopilotPanel";

import DataPreparationPanel from "../../components/fine-tuning/DataPreparationPanel";

import DatasetValidationPanel, {
  type DatasetValidationResult,
} from "../../components/fine-tuning/DatasetValidationPanel";

import ExperimentResults from "../../components/fine-tuning/ExperimentResults";

import ExpertView from "../../components/fine-tuning/ExpertView";

import FineTuningHero, {
  type FineTuningDataset,
} from "../../components/fine-tuning/FineTuningHero";

import GPUInfrastructurePanel from "../../components/fine-tuning/GPUInfrastructurePanel";

import ModelSelectionPanel from "../../components/fine-tuning/ModelSelectionPanel";

import MonitoringPanel from "../../components/fine-tuning/MonitoringPanel";

import ProductionModelCard from "../../components/fine-tuning/ProductionModelCard";

import SmallDataTrainingProfile from "../../components/fine-tuning/SmallDataTrainingProfile";

import SmallDatasetOverride from "../../components/fine-tuning/SmallDatasetOverride";

import TrainingConfigPanel from "../../components/fine-tuning/TrainingConfigPanel";

import TrainingStrategyPanel from "../../components/fine-tuning/TrainingStrategyPanel";

const LIFECYCLE_STAGE_COUNT = 13;

const foundationModelNames: Record<string, string> = {
  "modelnow-foundation-8b":
    "ModelNow-Foundation-8B",
  "modelnow-quality-12b":
    "ModelNow-Quality-12B",
  "modelnow-efficient-4b":
    "ModelNow-Efficient-4B",
};

const automationMessages = [
  "Understanding dataset structure",
  "Validating dataset quality",
  "Preparing optimized training examples",
  "Selecting and running the training strategy",
  "Evaluating model performance",
  "Running automated benchmarks",
  "Registering the model and preserving lineage",
  "Preparing the model export",
  "Deploying the selected model",
  "Activating production inference",
  "Monitoring production behavior",
  "Running continuous evaluation",
  "Identifying optimization opportunities",
];

const experimentResults = [
  {
    name: "Candidate A",
    strategy: "Balanced optimization",
    status: "evaluated",
    score: 91.4,
    description:
      "Balanced configuration evaluated across quality, latency and training cost.",
  },
  {
    name: "Candidate B",
    strategy: "Quality optimization",
    status: "selected",
    score: 94.0,
    description:
      "Highest evaluation quality across the automated experiment set.",
  },
  {
    name: "Candidate C",
    strategy: "Efficiency optimization",
    status: "evaluated",
    score: 92.7,
    description:
      "Lower-cost configuration evaluated for efficient production serving.",
  },
];

const SUPPORTED_EXTENSIONS = [
  ".jsonl",
  ".json",
  ".csv",
  ".txt",
];

type FineTuningBackendAction =
  | "start_autopilot"
  | "dataset_upload"
  | "enable_small_data"
  | "select_model"
  | "select_training_strategy"
  | "continue_training"
  | "save_training_config"
  | "show_expert_view"
  | "show_model_details"
  | "access_released_model"
  | "reset_workflow";

type FineTuningActionPayload = {
  datasetName?: string;
  objective?: string;
  modelId?: string;
  enabled?: boolean;
  smallDataMode?: boolean;
  trainingStrategy?: string;
};

function getExtension(filename: string) {
  const lower = filename.toLowerCase();

  return (
    SUPPORTED_EXTENSIONS.find((extension) =>
      lower.endsWith(extension),
    ) ?? ""
  );
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

async function readSample(
  file: File,
  maxBytes = 1024 * 1024,
) {
  const blob = file.slice(
    0,
    Math.min(file.size, maxBytes),
  );

  return blob.text();
}

async function countNewlines(file: File) {
  const reader = file.stream().getReader();

  let lineCount = 0;
  let lastByteWasNewline = true;

  try {
    while (true) {
      const { done, value } =
        await reader.read();

      if (done) {
        break;
      }

      const bytes = value as Uint8Array;

      for (
        let index = 0;
        index < bytes.length;
        index += 1
      ) {
        if (bytes[index] === 10) {
          lineCount += 1;
          lastByteWasNewline = true;
        } else {
          lastByteWasNewline = false;
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  if (!lastByteWasNewline && file.size > 0) {
    lineCount += 1;
  }

  return lineCount;
}

function countNonEmptyLines(sample: string) {
  return sample
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .length;
}

function fileLooksLikeStructuredData(format: string) {
  return ["CSV", "JSONL", "JSON"].includes(format);
}

function calculateStructuralQuality(
  format: string,
  sample: string,
  totalLines: number,
) {
  if (!sample.trim()) {
    return 0;
  }

  const rawLines = sample.split(/\r?\n/);

  const nonEmptyLines = rawLines.filter(
    (line) => line.trim().length > 0,
  );

  if (nonEmptyLines.length === 0) {
    return 0;
  }

  let score = 100;

  const emptyRatio =
    rawLines.length > 0
      ? (rawLines.length - nonEmptyLines.length) /
        rawLines.length
      : 0;

  score -= Math.min(
    emptyRatio * 25,
    12,
  );

  if (format === "CSV") {
    const header = nonEmptyLines[0] ?? "";

    const headerColumns =
      header.split(",").length;

    if (headerColumns <= 1) {
      score -= 25;
    } else {
      const sampleRows =
        nonEmptyLines.slice(1, 30);

      const malformedRows =
        sampleRows.filter(
          (row) =>
            row.split(",").length !==
            headerColumns,
        );

      if (sampleRows.length > 0) {
        score -= Math.min(
          (malformedRows.length /
            sampleRows.length) *
            30,
          30,
        );
      }
    }
  }

  if (format === "JSONL") {
    const jsonLines =
      nonEmptyLines.slice(0, 100);

    let invalidJson = 0;

    for (const line of jsonLines) {
      try {
        JSON.parse(line);
      } catch {
        invalidJson += 1;
      }
    }

    if (jsonLines.length > 0) {
      score -= Math.min(
        (invalidJson /
          jsonLines.length) *
          40,
        40,
      );
    }
  }

  if (format === "JSON") {
    const trimmed = sample.trim();

    if (
      !trimmed.startsWith("[") &&
      !trimmed.startsWith("{")
    ) {
      score -= 35;
    }
  }

  if (
    totalLines <= 1 &&
    fileLooksLikeStructuredData(format)
  ) {
    score -= 20;
  }

  return Math.max(
    0,
    Math.min(100, Math.round(score)),
  );
}

async function analyzeDatasetFile(
  file: File,
): Promise<FineTuningDataset> {
  const extension = getExtension(file.name);

  const format =
    extension === ".csv"
      ? "CSV"
      : extension === ".jsonl"
        ? "JSONL"
        : extension === ".json"
          ? "JSON"
          : "TXT";

  const sample = await readSample(file);

  let examples = 0;

  if (
    format === "CSV" ||
    format === "JSONL" ||
    format === "TXT"
  ) {
    const lines =
      await countNewlines(file);

    if (format === "CSV") {
      examples = Math.max(
        0,
        lines - 1,
      );
    } else {
      examples =
        countNonEmptyLines(sample);

      if (file.size > sample.length * 2) {
        const sampleLines =
          Math.max(
            1,
            countNonEmptyLines(sample),
          );

        const estimated =
          Math.round(
            (file.size /
              Math.max(
                sample.length,
                1,
              )) *
              sampleLines,
          );

        examples = Math.max(
          examples,
          estimated,
        );
      }
    }
  } else {
    const trimmed = sample.trim();

    if (trimmed.startsWith("[")) {
      const objectMatches =
        trimmed.match(
          /\{[\s\S]*?\}/g,
        );

      if (objectMatches?.length) {
        const sampleObjects =
          objectMatches.length;

        if (
          file.size <=
          25 * 1024 * 1024
        ) {
          try {
            const fullText =
              await file.text();

            const parsed =
              JSON.parse(fullText);

            if (Array.isArray(parsed)) {
              examples =
                parsed.length;
            } else {
              examples = 1;
            }
          } catch {
            const estimated =
              Math.round(
                (file.size /
                  Math.max(
                    sample.length,
                    1,
                  )) *
                  sampleObjects,
              );

            examples = Math.max(
              sampleObjects,
              estimated,
            );
          }
        } else {
          const estimated =
            Math.round(
              (file.size /
                Math.max(
                  sample.length,
                  1,
                )) *
                sampleObjects,
            );

          examples = Math.max(
            sampleObjects,
            estimated,
          );
        }
      } else {
        examples = 1;
      }
    } else {
      examples = 1;
    }
  }

  const lineCount =
    format === "JSON"
      ? Math.max(
          1,
          countNonEmptyLines(sample),
        )
      : await countNewlines(file);

  const quality =
    calculateStructuralQuality(
      format,
      sample,
      lineCount,
    );

  let structuralStatus =
    "Basic structure detected";

  if (quality >= 90) {
    structuralStatus =
      "Healthy structure";
  } else if (quality >= 70) {
    structuralStatus =
      "Review recommended";
  } else if (quality > 0) {
    structuralStatus =
      "Potential data issues detected";
  } else {
    structuralStatus =
      "Unable to inspect structure";
  }

  return {
    name: file.name,
    size: formatFileSize(file.size),
    examples: Math.max(
      1,
      examples,
    ),
    quality,
    format,
    structuralStatus,
  };
}

async function validateDatasetFile(
  file: File,
  dataset: FineTuningDataset,
): Promise<DatasetValidationResult> {
  const sample = await readSample(file);

  const nonEmptyLines = sample
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const issues: string[] = [];
  const warnings: string[] = [];

  const minimumExamples = 20;

  const formatValid =
    Boolean(getExtension(file.name));

  let structureValid =
    dataset.quality >= 70 &&
    sample.trim().length > 0;

  let contentValid = true;

  if (!sample.trim()) {
    contentValid = false;
    structureValid = false;
  }

  if (dataset.format === "CSV") {
    const header =
      nonEmptyLines[0] ?? "";

    const headerColumns =
      header.split(",").length;

    if (headerColumns <= 1) {
      contentValid = false;
    } else {
      const rows =
        nonEmptyLines.slice(1, 31);

      const malformedRows =
        rows.filter(
          (row) =>
            row.split(",").length !==
            headerColumns,
        );

      if (
        rows.length > 0 &&
        malformedRows.length /
          rows.length >
          0.2
      ) {
        contentValid = false;
      }
    }
  }

  if (dataset.format === "JSONL") {
    const jsonLines =
      nonEmptyLines.slice(0, 100);

    let invalidLines = 0;

    for (const line of jsonLines) {
      try {
        JSON.parse(line);
      } catch {
        invalidLines += 1;
      }
    }

    if (
      jsonLines.length > 0 &&
      invalidLines / jsonLines.length >
        0.1
    ) {
      contentValid = false;
    }
  }

  if (dataset.format === "JSON") {
    try {
      if (
        file.size <=
        25 * 1024 * 1024
      ) {
        const fullText =
          await file.text();

        JSON.parse(fullText);
      } else {
        const trimmed =
          sample.trim();

        if (
          !trimmed.startsWith("[") &&
          !trimmed.startsWith("{")
        ) {
          contentValid = false;
        }
      }
    } catch {
      contentValid = false;
    }
  }

  const minimumExamplesMet =
    dataset.examples >=
    minimumExamples;

  if (!formatValid) {
    issues.push(
      "The uploaded file format is not supported.",
    );
  }

  if (!structureValid) {
    issues.push(
      "The dataset structure needs correction before training.",
    );
  }

  if (!contentValid) {
    issues.push(
      "The dataset contains malformed or invalid training content.",
    );
  }

  if (!minimumExamplesMet) {
    issues.push(
      `The dataset contains fewer than ${minimumExamples} detected examples.`,
    );
  }

  if (
    dataset.quality >= 70 &&
    dataset.quality < 90
  ) {
    warnings.push(
      "Dataset structure is usable, but ModelNow recommends reviewing the data before training.",
    );
  }

  const linesForDuplicateCheck =
    nonEmptyLines.slice(0, 500);

  const normalizedLines =
    linesForDuplicateCheck.map(
      (line) =>
        line
          .replace(/\s+/g, " ")
          .trim()
          .toLowerCase(),
    );

  const uniqueLines =
    new Set(normalizedLines);

  const duplicateRatio =
    normalizedLines.length > 0
      ? 1 -
        uniqueLines.size /
          normalizedLines.length
      : 0;

  let duplicateRisk:
    | "low"
    | "medium"
    | "high" = "low";

  if (duplicateRatio >= 0.2) {
    duplicateRisk = "high";

    warnings.push(
      "A high proportion of sampled examples appear duplicated.",
    );
  } else if (duplicateRatio >= 0.05) {
    duplicateRisk = "medium";

    warnings.push(
      "Some duplicate examples were detected in the sampled data.",
    );
  }

  if (
    dataset.examples >= 20 &&
    dataset.examples < 100
  ) {
    warnings.push(
      "The dataset is usable, but a larger training set may improve the quality of adaptation.",
    );
  }

  const duplicatePenalty =
    duplicateRisk === "high"
      ? 15
      : duplicateRisk === "medium"
        ? 7
        : 0;

  const minimumExamplePenalty =
    minimumExamplesMet ? 0 : 20;

  const qualityScore = Math.max(
    0,
    Math.min(
      100,
      dataset.quality -
        duplicatePenalty -
        minimumExamplePenalty,
    ),
  );

  return {
    formatValid,
    structureValid,
    contentValid,
    minimumExamplesMet,
    duplicateRisk,
    qualityScore,
    issues,
    warnings,
  };
}

export default function FineTuningPage() {
  const [dataset, setDataset] =
    useState<FineTuningDataset | null>(
      null,
    );

  const [validation, setValidation] =
    useState<DatasetValidationResult | null>(
      null,
    );

  const [objective, setObjective] =
    useState("");

  const [
    selectedModelId,
    setSelectedModelId,
  ] = useState(
    "modelnow-foundation-8b",
  );

  const [
    selectedTrainingStrategy,
    setSelectedTrainingStrategy,
  ] = useState("QLoRA");

  const [
    trainingHandoffStarted,
    setTrainingHandoffStarted,
  ] = useState(false);

  const [
    autopilotRunning,
    setAutopilotRunning,
  ] = useState(false);

  const [
    autopilotComplete,
    setAutopilotComplete,
  ] = useState(false);

  const [
    currentStep,
    setCurrentStep,
  ] = useState(0);

  const [
    progress,
    setProgress,
  ] = useState(0);

  const [
    activeMessage,
    setActiveMessage,
  ] = useState(
    "Waiting for your dataset and objective",
  );

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    datasetAnalyzing,
    setDatasetAnalyzing,
  ] = useState(false);

  const [
    smallDatasetOverride,
    setSmallDatasetOverride,
  ] = useState(false);

  const [
    showExpertView,
    setShowExpertView,
  ] = useState(false);

  const [
    showModelDetails,
    setShowModelDetails,
  ] = useState(false);

  const handleBackendAction = (
    action: FineTuningBackendAction,
    payload: FineTuningActionPayload = {},
  ) => {
    console.info(
      "[ModelNow Fine-tuning action]",
      {
        action,
        payload,
      },
    );

    // Backend team will connect the
    // real API call here later.
  };

  const handleModelSelect = (
    modelId: string,
  ) => {
    setSelectedModelId(modelId);

    handleBackendAction(
      "select_model",
      {
        modelId,
        datasetName:
          dataset?.name,
        objective:
          objective.trim() ||
          undefined,
        smallDataMode:
          smallDatasetOverride,
        trainingStrategy:
          selectedTrainingStrategy,
      },
    );
  };

  const handleTrainingStrategySelect = (
    strategy: string,
  ) => {
    setSelectedTrainingStrategy(
      strategy,
    );

    handleBackendAction(
      "select_training_strategy",
      {
        datasetName:
          dataset?.name,
        objective:
          objective.trim() ||
          undefined,
        modelId:
          selectedModelId,
        trainingStrategy:
          strategy,
        smallDataMode:
          smallDatasetOverride,
      },
    );
  };

  const handleToggleExpertView = () => {
    setShowExpertView((previous) => {
      const next = !previous;

      handleBackendAction(
        "show_expert_view",
        {
          enabled: next,
          modelId:
            selectedModelId,
          datasetName:
            dataset?.name,
          objective:
            objective.trim() ||
            undefined,
        },
      );

      return next;
    });
  };

  const handleToggleModelDetails = () => {
    setShowModelDetails((previous) => {
      const next = !previous;

      handleBackendAction(
        "show_model_details",
        {
          enabled: next,
          modelId:
            selectedModelId,
        },
      );

      return next;
    });
  };

  const handleUseReleasedModel = () => {
    handleBackendAction(
      "access_released_model",
      {
        modelId:
          "modelnow-support-v1",
        trainingStrategy:
          selectedTrainingStrategy,
      },
    );
  };

  const handleSaveTrainingConfig = () => {
    handleBackendAction(
      "save_training_config",
      {
        datasetName:
          dataset?.name,
        objective:
          objective.trim() ||
          undefined,
        modelId:
          selectedModelId,
        smallDataMode:
          smallDatasetOverride,
        trainingStrategy:
          selectedTrainingStrategy,
      },
    );

    setActiveMessage(
      "Training configuration is ready for backend integration.",
    );
  };

  useEffect(() => {
    if (!autopilotRunning) {
      return;
    }

    let completionTimeout:
      | number
      | undefined;

    const interval =
      window.setInterval(() => {
        setCurrentStep(
          (previous) => {
            const next = Math.min(
              previous + 1,
              LIFECYCLE_STAGE_COUNT,
            );

            const messageIndex =
              Math.min(
                Math.max(
                  next - 1,
                  0,
                ),
                automationMessages.length -
                  1,
              );

            setActiveMessage(
              automationMessages[
                messageIndex
              ],
            );

            setProgress(
              Math.round(
                (next /
                  LIFECYCLE_STAGE_COUNT) *
                  100,
              ),
            );

            if (
              next >=
              LIFECYCLE_STAGE_COUNT
            ) {
              window.clearInterval(
                interval,
              );

              completionTimeout =
                window.setTimeout(
                  () => {
                    setAutopilotRunning(
                      false,
                    );

                    setAutopilotComplete(
                      true,
                    );

                    setCurrentStep(
                      LIFECYCLE_STAGE_COUNT,
                    );

                    setProgress(100);

                    setActiveMessage(
                      "Autopilot completed. Your ModelNow fine-tuned model is ready.",
                    );
                  },
                  700,
                );
            }

            return next;
          },
        );
      }, 1000);

    return () => {
      window.clearInterval(interval);

      if (
        completionTimeout !==
        undefined
      ) {
        window.clearTimeout(
          completionTimeout,
        );
      }
    };
  }, [autopilotRunning]);

  const handleDatasetChange =
    async (
      event: ChangeEvent<HTMLInputElement>,
    ) => {
      const file =
        event.target.files?.[0];

      if (!file) {
        return;
      }

      const extension =
        getExtension(file.name);

      if (!extension) {
        setErrorMessage(
          "Please upload a JSONL, JSON, CSV or TXT training dataset.",
        );

        return;
      }

      setErrorMessage("");
      setDatasetAnalyzing(true);
      setValidation(null);
      setSmallDatasetOverride(false);
      setTrainingHandoffStarted(false);
      setAutopilotComplete(false);
      setAutopilotRunning(false);
      setCurrentStep(1);

      setSelectedModelId(
        "modelnow-foundation-8b",
      );

      setSelectedTrainingStrategy(
        "QLoRA",
      );

      setProgress(
        Math.round(
          (1 /
            LIFECYCLE_STAGE_COUNT) *
            100,
        ),
      );

      setActiveMessage(
        "Inspecting the uploaded dataset...",
      );

      try {
        const analyzedDataset =
          await analyzeDatasetFile(
            file,
          );

        const datasetValidation =
          await validateDatasetFile(
            file,
            analyzedDataset,
          );

        setDataset(
          analyzedDataset,
        );

        setValidation(
          datasetValidation,
        );

        setActiveMessage(
          `${analyzedDataset.examples.toLocaleString()} training examples detected.`,
        );

        handleBackendAction(
          "dataset_upload",
          {
            datasetName:
              analyzedDataset.name,
            objective:
              objective.trim() ||
              undefined,
            smallDataMode:
              false,
            trainingStrategy:
              selectedTrainingStrategy,
          },
        );
      } catch {
        setDataset(null);
        setValidation(null);
        setSmallDatasetOverride(false);
        setTrainingHandoffStarted(false);

        setErrorMessage(
          "ModelNow could not inspect this file. Please check the dataset format and try again.",
        );

        setActiveMessage(
          "Dataset analysis failed.",
        );
      } finally {
        setDatasetAnalyzing(false);
      }
    };

  const startAutopilot = () => {
    if (!dataset) {
      setErrorMessage(
        "Add a training dataset before starting Autopilot.",
      );

      return;
    }

    if (!validation) {
      setErrorMessage(
        "Complete dataset validation before starting Autopilot.",
      );

      return;
    }

    const hasNonSizeValidationIssues =
      validation.issues.some(
        (issue) =>
          !issue.startsWith(
            "The dataset contains fewer than",
          ),
      );

    if (hasNonSizeValidationIssues) {
      setErrorMessage(
        "Resolve the dataset validation issues before starting Autopilot.",
      );

      return;
    }

    if (
      !validation.minimumExamplesMet &&
      !smallDatasetOverride
    ) {
      setErrorMessage(
        "Enable small-data mode before starting Autopilot with this dataset.",
      );

      return;
    }

    if (
      objective.trim().length < 10
    ) {
      setErrorMessage(
        "Describe what you want the model to become better at.",
      );

      return;
    }

    setErrorMessage("");
    setAutopilotComplete(false);
    setAutopilotRunning(true);
    setTrainingHandoffStarted(false);
    setCurrentStep(1);

    setProgress(
      Math.round(
        (1 /
          LIFECYCLE_STAGE_COUNT) *
          100,
      ),
    );

    setActiveMessage(
      automationMessages[0],
    );

    handleBackendAction(
      "start_autopilot",
      {
        datasetName:
          dataset.name,
        objective:
          objective.trim(),
        modelId:
          selectedModelId,
        smallDataMode:
          smallDatasetOverride,
        trainingStrategy:
          selectedTrainingStrategy,
      },
    );
  };

  const handleTrainingHandoff =
    () => {
      setTrainingHandoffStarted(true);
      setErrorMessage("");

      setActiveMessage(
        `Ready for backend training handoff with ${
          foundationModelNames[
            selectedModelId
          ] ??
          "ModelNow-Foundation-8B"
        } using ${
          selectedTrainingStrategy
        }.`,
      );

      handleBackendAction(
        "continue_training",
        {
          datasetName:
            dataset?.name,
          objective:
            objective.trim() ||
            undefined,
          modelId:
            selectedModelId,
          smallDataMode:
            smallDatasetOverride,
          trainingStrategy:
            selectedTrainingStrategy,
        },
      );
    };

  const handleEnableSmallData =
    () => {
      setSmallDatasetOverride(true);
      setErrorMessage("");

      handleBackendAction(
        "enable_small_data",
        {
          datasetName:
            dataset?.name,
          objective:
            objective.trim() ||
            undefined,
          modelId:
            selectedModelId,
          enabled: true,
          smallDataMode: true,
          trainingStrategy:
            selectedTrainingStrategy,
        },
      );
    };

  const resetWorkflow = () => {
    handleBackendAction(
      "reset_workflow",
      {
        datasetName:
          dataset?.name,
        objective:
          objective.trim() ||
          undefined,
        modelId:
          selectedModelId,
        smallDataMode:
          smallDatasetOverride,
        trainingStrategy:
          selectedTrainingStrategy,
      },
    );

    setDataset(null);
    setValidation(null);
    setObjective("");

    setSelectedModelId(
      "modelnow-foundation-8b",
    );

    setSelectedTrainingStrategy(
      "QLoRA",
    );

    setTrainingHandoffStarted(false);

    setAutopilotRunning(false);
    setAutopilotComplete(false);

    setCurrentStep(0);
    setProgress(0);

    setActiveMessage(
      "Waiting for your dataset and objective",
    );

    setErrorMessage("");
    setDatasetAnalyzing(false);
    setSmallDatasetOverride(false);

    setShowModelDetails(false);
    setShowExpertView(false);
  };

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-[1500px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <a
              href="/chat"
              aria-label="Back to chat"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowLeft size={19} />
            </a>

            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
                <Sparkles size={19} />
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-base font-semibold sm:text-lg">
                  ModelNow Fine-tuning
                </h1>

                <p className="truncate text-xs text-slate-500">
                  Autonomous model customization
                </p>
              </div>
            </div>
          </div>

          {(dataset || objective) && (
            <button
              type="button"
              onClick={resetWorkflow}
              className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Start new model
            </button>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] space-y-6 px-4 py-6 sm:px-6">
        <FineTuningHero
          dataset={dataset}
          objective={objective}
          datasetAnalyzing={datasetAnalyzing}
          autopilotRunning={autopilotRunning}
          autopilotComplete={autopilotComplete}
          errorMessage={errorMessage}
          showExpertView={showExpertView}
          onDatasetChange={handleDatasetChange}
          onObjectiveChange={setObjective}
          onStartAutopilot={startAutopilot}
          onToggleExpertView={
            handleToggleExpertView
          }
        />

        {dataset && validation && (
          <DatasetValidationPanel
            validation={validation}
            analyzing={datasetAnalyzing}
          />
        )}

        {dataset &&
          validation &&
          !validation.minimumExamplesMet && (
            <SmallDatasetOverride
              examples={dataset.examples}
              enabled={smallDatasetOverride}
              onEnable={
                handleEnableSmallData
              }
            />
          )}

        <SmallDataTrainingProfile
          enabled={smallDatasetOverride}
        />

        {dataset && (
          <DataPreparationPanel
            currentStep={currentStep}
            running={autopilotRunning}
            complete={autopilotComplete}
          />
        )}

        {dataset && (
          <ModelSelectionPanel
            currentStep={currentStep}
            running={autopilotRunning}
            complete={autopilotComplete}
            expertMode={showExpertView}
            selectedModelId={selectedModelId}
            onModelSelect={handleModelSelect}
            onContinueToTraining={
              handleTrainingHandoff
            }
          />
        )}

        {trainingHandoffStarted && (
          <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600">
                <CheckCircle2 size={21} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  Backend handoff point
                </p>

                <h2 className="mt-2 text-xl font-bold text-slate-950">
                  Model selection is ready for backend integration
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Selected foundation model:{" "}
                  <span className="font-semibold text-slate-900">
                    {
                      foundationModelNames[
                        selectedModelId
                      ] ??
                      "ModelNow-Foundation-8B"
                    }
                  </span>{" "}
                  using{" "}
                  <span className="font-semibold text-slate-900">
                    {selectedTrainingStrategy}
                  </span>
                  .
                </p>

                <div className="mt-4 inline-flex items-center rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700">
                  Ready for backend training API
                </div>
              </div>
            </div>
          </section>
        )}

        <AutopilotPanel
          running={autopilotRunning}
          complete={autopilotComplete}
          currentStep={currentStep}
          progress={progress}
          activeMessage={activeMessage}
          messages={automationMessages}
        />

        {dataset && (
          <TrainingStrategyPanel
            selectedStrategy={
              selectedTrainingStrategy
            }
            baseModel={
              foundationModelNames[
                selectedModelId
              ] ??
              "ModelNow-Foundation-8B"
            }
            computeProfile="ModelNow managed GPU infrastructure"
            currentStep={currentStep}
            running={autopilotRunning}
            complete={autopilotComplete}
            smallDataMode={
              smallDatasetOverride
            }
            onStrategySelect={
              handleTrainingStrategySelect
            }
          />
        )}

        {dataset && (
          <TrainingConfigPanel
            currentStep={currentStep}
            running={autopilotRunning}
            complete={autopilotComplete}
            smallDataMode={
              smallDatasetOverride
            }
          />
        )}

        {dataset && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-950">
                  Training configuration
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Confirm the current ModelNow training configuration for backend execution.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  handleSaveTrainingConfig
                }
                disabled={
                  autopilotRunning
                }
                className="shrink-0 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Confirm training configuration
              </button>
            </div>
          </section>
        )}

        {dataset && (
          <GPUInfrastructurePanel
            currentStep={currentStep}
            running={autopilotRunning}
            complete={autopilotComplete}
            smallDataMode={
              smallDatasetOverride
            }
          />
        )}

        {autopilotComplete && (
          <ExperimentResults
            experiments={experimentResults}
          />
        )}

        {autopilotComplete && (
          <ProductionModelCard
            showModelDetails={
              showModelDetails
            }
            onToggleModelDetails={
              handleToggleModelDetails
            }
            onUseModel={
              handleUseReleasedModel
            }
          />
        )}

        {autopilotComplete && (
          <MonitoringPanel
            requests="12,480"
            latency="420 ms"
            quality="94%"
            errorRate="0.8%"
          />
        )}

        {showExpertView && (
          <ExpertView
            baseModel={
              foundationModelNames[
                selectedModelId
              ] ??
              "ModelNow automatic selection"
            }
            trainingMethod={
              selectedTrainingStrategy
            }
            optimization="ModelNow optimization engine"
            evaluation="Objective-aware continuous evaluation"
          />
        )}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              ModelNow fine-tuning platform
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              Autonomous model lifecycle
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              ModelNow owns the complete fine-tuning lifecycle,
              from dataset intelligence through training,
              evaluation, deployment and continuous optimization.
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "Dataset intelligence",
              "Validation & quality",
              "Data preparation",
              "Model selection",
              "ModelNow training engine",
              "LoRA",
              "QLoRA",
              "PEFT",
              "Full fine-tuning",
              "Distributed training",
              "Checkpoint management",
              "Evaluation",
              "Benchmarking",
              "Model registry",
              "Model lineage",
              "Model export",
              "Deployment",
              "Inference",
              "Monitoring",
              "Continuous evaluation",
              "Optimization",
              "Retraining",
            ].map((module) => (
              <div
                key={module}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700"
              >
                {module}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}