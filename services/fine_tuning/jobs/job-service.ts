import { randomUUID } from "node:crypto";
import type {
  CreateFineTuningJobInput,
  FineTuningJob
} from "../fine-tuning.types.js";
import { DatasetService } from "../datasets/dataset-service.js";
import { FineTuningRepository } from "../repository/fine-tuning-repository.js";
import { fineTuningConfig } from "../config/config.js";
import {
  assertJobTransition,
  createFineTuningJob,
  validateCreateJobInput
} from "./job-schema.js";

export class JobService {
  constructor(
    private readonly datasets: DatasetService,
    readonly repository = new FineTuningRepository(),
    private readonly idFactory: () => string = randomUUID
  ) {}

  async create(input: CreateFineTuningJobInput): Promise<FineTuningJob> {
    const valid = validateCreateJobInput(input);
    const dataset = await this.datasets.get(valid.datasetId);

    if (dataset.records.length === 0) {
      throw new Error("Cannot train with an empty dataset.");
    }

    const hyperparameters = {
      epochs: fineTuningConfig.defaultEpochs,
      learningRate: fineTuningConfig.defaultLearningRate,
      ...valid.hyperparameters
    };

    return this.repository.create(
      createFineTuningJob(this.idFactory(), {
        ...valid,
        hyperparameters
      })
    );
  }

  async get(id: string): Promise<FineTuningJob> {
    const job = await this.repository.getById(id);
    if (!job) throw new Error(`Job '${id}' not found.`);
    return job;
  }

  async list(): Promise<FineTuningJob[]> {
    return this.repository.list();
  }

  async start(id: string): Promise<FineTuningJob> {
    const job = await this.get(id);
    assertJobTransition(job.status, "running");

    return this.repository.update(id, {
      status: "running",
      progress: 0,
      startedAt: new Date(),
      error: undefined,
      resultModel: undefined,
      completedAt: undefined
    });
  }

  async updateProgress(id: string, progress: number): Promise<FineTuningJob> {
    const job = await this.get(id);

    if (job.status !== "running") {
      throw new Error("Progress can only be updated for running jobs.");
    }

    if (!Number.isFinite(progress) || progress < 0 || progress > 100) {
      throw new TypeError("progress must be between 0 and 100.");
    }

    return this.repository.update(id, { progress });
  }

  async succeed(id: string, resultModel: string): Promise<FineTuningJob> {
    const job = await this.get(id);
    assertJobTransition(job.status, "succeeded");

    if (!resultModel.trim()) throw new TypeError("resultModel is required.");

    return this.repository.update(id, {
      status: "succeeded",
      progress: 100,
      resultModel,
      completedAt: new Date(),
      error: undefined
    });
  }

  async fail(id: string, error: unknown): Promise<FineTuningJob> {
    const job = await this.get(id);
    assertJobTransition(job.status, "failed");

    return this.repository.update(id, {
      status: "failed",
      error: error instanceof Error ? error.message : String(error),
      completedAt: new Date()
    });
  }

  async retry(id: string): Promise<FineTuningJob> {
    const job = await this.get(id);
    assertJobTransition(job.status, "queued");

    return this.repository.update(id, {
      status: "queued",
      progress: 0,
      error: undefined,
      resultModel: undefined,
      startedAt: undefined,
      completedAt: undefined
    });
  }

  async cancel(id: string): Promise<FineTuningJob> {
    const job = await this.get(id);
    assertJobTransition(job.status, "cancelled");

    return this.repository.update(id, {
      status: "cancelled",
      completedAt: new Date()
    });
  }

  async delete(id: string): Promise<boolean> {
    const job = await this.get(id);

    if (job.status === "running") {
      throw new Error("Cannot delete a running job.");
    }

    return this.repository.delete(id);
  }
}
