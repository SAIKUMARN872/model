export interface ExperimentConfig {
  id?: string;
  name: string;
  description?: string;
  model?: string;
  prompt?: string;
  parameters?: Record<string, unknown>;
  tags?: string[];
}

export interface ExperimentResult {
  id: string;
  experimentId: string;
  output?: string;
  score?: number;
  metrics?: Record<string, number>;
  status: "pending" | "running" | "completed" | "failed";
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export interface Experiment {
  id: string;
  name: string;
  description?: string;
  status: "draft" | "running" | "completed" | "failed";
  config: ExperimentConfig;
  results: ExperimentResult[];
  createdAt: string;
  updatedAt: string;
}

class ExperimentManager {
  private experiments: Map<
    string,
    Experiment
  > = new Map();

  /**
   * Create a new experiment.
   */
  createExperiment(
    config: ExperimentConfig
  ): Experiment {
    if (!config.name?.trim()) {
      throw new Error(
        "Experiment name is required."
      );
    }

    const id =
      config.id ||
      this.generateId();

    const now =
      new Date().toISOString();

    const experiment: Experiment = {
      id,
      name: config.name,
      description:
        config.description || "",
      status: "draft",
      config,
      results: [],
      createdAt: now,
      updatedAt: now,
    };

    this.experiments.set(
      id,
      experiment
    );

    return experiment;
  }

  /**
   * Get an experiment by ID.
   */
  getExperiment(
    id: string
  ): Experiment | undefined {
    return this.experiments.get(id);
  }

  /**
   * Get all experiments.
   */
  getExperiments(): Experiment[] {
    return Array.from(
      this.experiments.values()
    );
  }

  /**
   * Update an experiment.
   */
  updateExperiment(
    id: string,
    updates: Partial<Experiment>
  ): Experiment {
    const experiment =
      this.experiments.get(id);

    if (!experiment) {
      throw new Error(
        "Experiment not found."
      );
    }

    const updatedExperiment: Experiment = {
      ...experiment,
      ...updates,
      id: experiment.id,
      updatedAt:
        new Date().toISOString(),
    };

    this.experiments.set(
      id,
      updatedExperiment
    );

    return updatedExperiment;
  }

  /**
   * Delete an experiment.
   */
  deleteExperiment(
    id: string
  ): boolean {
    if (
      !this.experiments.has(id)
    ) {
      return false;
    }

    return this.experiments.delete(id);
  }

  /**
   * Start an experiment.
   */
  startExperiment(
    id: string
  ): Experiment {
    return this.updateExperiment(
      id,
      {
        status: "running",
      }
    );
  }

  /**
   * Complete an experiment.
   */
  completeExperiment(
    id: string
  ): Experiment {
    return this.updateExperiment(
      id,
      {
        status: "completed",
      }
    );
  }

  /**
   * Mark an experiment as failed.
   */
  failExperiment(
    id: string
  ): Experiment {
    return this.updateExperiment(
      id,
      {
        status: "failed",
      }
    );
  }

  /**
   * Add a result to an experiment.
   */
  addResult(
    experimentId: string,
    result: Omit<
      ExperimentResult,
      "id" | "experimentId" | "createdAt"
    >
  ): ExperimentResult {
    const experiment =
      this.experiments.get(
        experimentId
      );

    if (!experiment) {
      throw new Error(
        "Experiment not found."
      );
    }

    const experimentResult: ExperimentResult =
      {
        id: this.generateId(),
        experimentId,
        ...result,
        createdAt:
          new Date().toISOString(),
      };

    experiment.results.push(
      experimentResult
    );

    experiment.updatedAt =
      new Date().toISOString();

    this.experiments.set(
      experimentId,
      experiment
    );

    return experimentResult;
  }

  /**
   * Get experiment results.
   */
  getResults(
    experimentId: string
  ): ExperimentResult[] {
    const experiment =
      this.experiments.get(
        experimentId
      );

    if (!experiment) {
      throw new Error(
        "Experiment not found."
      );
    }

    return experiment.results;
  }

  /**
   * Calculate average score.
   */
  getAverageScore(
    experimentId: string
  ): number {
    const results =
      this.getResults(
        experimentId
      );

    const scoredResults =
      results.filter(
        (result) =>
          typeof result.score ===
          "number"
      );

    if (
      scoredResults.length === 0
    ) {
      return 0;
    }

    const total =
      scoredResults.reduce(
        (sum, result) =>
          sum +
          (result.score || 0),
        0
      );

    return (
      total /
      scoredResults.length
    );
  }

  /**
   * Clear all experiments.
   */
  clear(): void {
    this.experiments.clear();
  }

  /**
   * Generate unique ID.
   */
  private generateId(): string {
    return `experiment-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 9)}`;
  }
}

const experimentManager =
  new ExperimentManager();

export default experimentManager;