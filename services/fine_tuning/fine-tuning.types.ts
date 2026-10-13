export type FineTuningStatus =
  | "queued"
  | "running"
  | "succeeded"
  | "failed"
  | "cancelled";

export type DatasetFormat = "jsonl" | "json" | "csv";

export interface FineTuningDataset {
  id: string;
  name: string;
  description?: string;
  format: DatasetFormat;
  records: Array<Record<string, unknown>>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDatasetInput {
  name: string;
  description?: string;
  format: DatasetFormat;
  records: Array<Record<string, unknown>>;
}

export interface FineTuningJob {
  id: string;
  datasetId: string;
  baseModel: string;
  status: FineTuningStatus;
  hyperparameters: Record<string, number>;
  progress: number;
  resultModel?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface CreateFineTuningJobInput {
  datasetId: string;
  baseModel: string;
  hyperparameters?: Record<string, number>;
}

export interface FineTuningDeployment {
  id: string;
  jobId: string;
  model: string;
  endpoint: string;
  status: "creating" | "ready" | "failed" | "deleted";
  createdAt: Date;
  updatedAt: Date;
  error?: string;
}

export interface CreateDeploymentInput {
  jobId: string;
  model?: string;
}

export interface FineTuningConfig {
  defaultBaseModel: string;
  maxDatasetRecords: number;
  maxConcurrentJobs: number;
  defaultEpochs: number;
  defaultLearningRate: number;
}

export interface FineTuningSettings {
  autoDeploy: boolean;
  retainCompletedJobs: boolean;
  maxRetries: number;
}
