import test from "node:test";
import assert from "node:assert/strict";

import {
  fineTuningConfig,
  defaultFineTuningSettings,
  validateFineTuningConfig,
  validateFineTuningSettings,
  validateDatasetInput,
  createDatasetRecord,
  DatasetRepository,
  DatasetService,
  DatasetController,
  validateCreateJobInput,
  createFineTuningJob,
  assertJobTransition,
  FineTuningRepository,
  JobService,
  JobManager,
  JobController,
  DeploymentManager,
  DeploymentService,
  validateDeploymentJobStatus,
  createDeploymentRecord,
  TrainingWorker,
  EvaluationWorker,
  DeploymentWorker
} from "./index.js";

let sequence = 0;

function nextId(prefix = "test") {
  sequence += 1;
  return `${prefix}-${sequence}`;
}

function resetIds() {
  sequence = 0;
}

function sampleDatasetInput() {
  return {
    name: "training-data",
    description: "Mock dataset",
    format: "jsonl" as const,
    records: [
      { prompt: "Hello", completion: "Hi" },
      { prompt: "How are you?", completion: "Fine" }
    ]
  };
}

async function createDatasetService() {
  resetIds();
  const service = new DatasetService(new DatasetRepository(), () =>
    nextId("dataset")
  );
  const dataset = await service.create(sampleDatasetInput());

  return { service, dataset };
}

async function createJobEnvironment() {
  const { service: datasets, dataset } = await createDatasetService();

  const jobs = new JobService(
    datasets,
    new FineTuningRepository(),
    () => nextId("job")
  );

  return { datasets, dataset, jobs };
}

async function createSucceededJob() {
  const environment = await createJobEnvironment();

  const job = await environment.jobs.create({
    datasetId: environment.dataset.id,
    baseModel: "base-model"
  });

  await environment.jobs.start(job.id);

  const succeeded = await environment.jobs.succeed(
    job.id,
    "fine-tuned-model"
  );

  return { ...environment, job: succeeded };
}

// Configuration tests

test("configuration exposes expected defaults", () => {
  assert.equal(fineTuningConfig.defaultBaseModel, "base-model");
  assert.equal(fineTuningConfig.maxConcurrentJobs, 2);
  assert.equal(fineTuningConfig.defaultEpochs, 3);
  assert.ok(fineTuningConfig.maxDatasetRecords > 0);
});

test("configuration validation accepts valid values", () => {
  assert.doesNotThrow(() =>
    validateFineTuningConfig({ ...fineTuningConfig })
  );
});

test("configuration validation rejects blank model", () => {
  assert.throws(
    () =>
      validateFineTuningConfig({
        ...fineTuningConfig,
        defaultBaseModel: " "
      }),
    /defaultBaseModel/
  );
});

test("configuration validation rejects invalid dataset limit", () => {
  assert.throws(
    () =>
      validateFineTuningConfig({
        ...fineTuningConfig,
        maxDatasetRecords: 0
      }),
    /maxDatasetRecords/
  );
});

test("configuration validation rejects invalid concurrency", () => {
  assert.throws(
    () =>
      validateFineTuningConfig({
        ...fineTuningConfig,
        maxConcurrentJobs: 0
      }),
    /maxConcurrentJobs/
  );
});

test("configuration validation rejects invalid epochs", () => {
  assert.throws(
    () =>
      validateFineTuningConfig({
        ...fineTuningConfig,
        defaultEpochs: 0
      }),
    /defaultEpochs/
  );
});

test("configuration validation rejects invalid learning rate", () => {
  assert.throws(
    () =>
      validateFineTuningConfig({
        ...fineTuningConfig,
        defaultLearningRate: -1
      }),
    /defaultLearningRate/
  );
});

test("settings expose expected defaults", () => {
  assert.equal(defaultFineTuningSettings.autoDeploy, false);
  assert.equal(defaultFineTuningSettings.retainCompletedJobs, true);
  assert.equal(defaultFineTuningSettings.maxRetries, 2);
});

test("settings validation accepts valid settings", () => {
  assert.doesNotThrow(() =>
    validateFineTuningSettings({ ...defaultFineTuningSettings })
  );
});

test("settings validation rejects negative retries", () => {
  assert.throws(
    () =>
      validateFineTuningSettings({
        ...defaultFineTuningSettings,
        maxRetries: -1
      }),
    /maxRetries/
  );
});

test("settings validation rejects non-boolean flags", () => {
  assert.throws(
    () =>
      validateFineTuningSettings({
        ...defaultFineTuningSettings,
        autoDeploy: "yes"
      } as never),
    /boolean/
  );
});

// Dataset schema tests

test("dataset schema accepts valid input", () => {
  const result = validateDatasetInput(sampleDatasetInput());

  assert.equal(result.name, "training-data");
  assert.equal(result.format, "jsonl");
  assert.equal(result.records.length, 2);
});

test("dataset schema trims dataset name", () => {
  assert.equal(
    validateDatasetInput({
      ...sampleDatasetInput(),
      name: "  sample  "
    }).name,
    "sample"
  );
});

test("dataset schema rejects null input", () => {
  assert.throws(() => validateDatasetInput(null), /object/);
});

test("dataset schema rejects arrays as input", () => {
  assert.throws(() => validateDatasetInput([]), /object/);
});

test("dataset schema rejects missing name", () => {
  assert.throws(
    () => validateDatasetInput({ format: "jsonl", records: [] }),
    /name/
  );
});

test("dataset schema rejects blank name", () => {
  assert.throws(
    () =>
      validateDatasetInput({
        ...sampleDatasetInput(),
        name: " "
      }),
    /name/
  );
});

test("dataset schema rejects unsupported format", () => {
  assert.throws(
    () =>
      validateDatasetInput({
        ...sampleDatasetInput(),
        format: "xml"
      }),
    /format/
  );
});

test("dataset schema rejects non-array records", () => {
  assert.throws(
    () =>
      validateDatasetInput({
        ...sampleDatasetInput(),
        records: {}
      }),
    /records/
  );
});

test("dataset schema rejects non-object records", () => {
  assert.throws(
    () =>
      validateDatasetInput({
        ...sampleDatasetInput(),
        records: ["not-an-object"]
      }),
    /records/
  );
});

test("dataset schema rejects invalid description", () => {
  assert.throws(
    () =>
      validateDatasetInput({
        ...sampleDatasetInput(),
        description: 123
      }),
    /description/
  );
});

test("dataset record gets an ID and timestamps", () => {
  const record = createDatasetRecord("dataset-x", sampleDatasetInput());

  assert.equal(record.id, "dataset-x");
  assert.ok(record.createdAt instanceof Date);
  assert.ok(record.updatedAt instanceof Date);
});

// Dataset repository tests

test("dataset repository creates and retrieves a dataset", async () => {
  const repository = new DatasetRepository();
  const record = createDatasetRecord("repo-dataset", sampleDatasetInput());

  await repository.create(record);

  assert.equal(
    (await repository.getById("repo-dataset"))?.name,
    "training-data"
  );
});

test("dataset repository rejects duplicate IDs", async () => {
  const repository = new DatasetRepository();
  const record = createDatasetRecord("duplicate-dataset", sampleDatasetInput());

  await repository.create(record);

  await assert.rejects(
    repository.create(record),
    /already exists/
  );
});

test("dataset repository returns undefined for missing IDs", async () => {
  const repository = new DatasetRepository();

  assert.equal(await repository.getById("missing"), undefined);
});

test("dataset repository clones records", async () => {
  const repository = new DatasetRepository();
  const record = createDatasetRecord("clone-dataset", sampleDatasetInput());

  await repository.create(record);

  const loaded = await repository.getById(record.id);
  assert.ok(loaded);

  loaded.name = "changed";

  assert.equal(
    (await repository.getById(record.id))?.name,
    "training-data"
  );
});

test("dataset repository updates name and description", async () => {
  const repository = new DatasetRepository();
  const record = createDatasetRecord("update-dataset", sampleDatasetInput());

  await repository.create(record);

  const updated = await repository.update(record.id, {
    name: "updated-name",
    description: "Updated"
  });

  assert.equal(updated.name, "updated-name");
  assert.equal(updated.description, "Updated");
});

test("dataset repository rejects updating missing dataset", async () => {
  const repository = new DatasetRepository();

  await assert.rejects(
    repository.update("missing", { name: "updated" }),
    /not found/
  );
});

test("dataset repository deletes a dataset", async () => {
  const repository = new DatasetRepository();
  const record = createDatasetRecord("delete-dataset", sampleDatasetInput());

  await repository.create(record);

  assert.equal(await repository.delete(record.id), true);
  assert.equal(await repository.getById(record.id), undefined);
});

test("dataset repository counts and clears datasets", async () => {
  const repository = new DatasetRepository();

  await repository.create(
    createDatasetRecord("count-1", sampleDatasetInput())
  );
  await repository.create(
    createDatasetRecord("count-2", sampleDatasetInput())
  );

  assert.equal(await repository.count(), 2);

  await repository.clear();

  assert.equal(await repository.count(), 0);
});

// Dataset service and controller tests

test("dataset service creates a dataset", async () => {
  const { service, dataset } = await createDatasetService();

  assert.equal(dataset.id, "dataset-1");
  assert.equal(dataset.records.length, 2);
  assert.equal(dataset.format, "jsonl");

  assert.equal((await service.get(dataset.id)).name, dataset.name);
});

test("dataset service rejects invalid input", async () => {
  const { service } = await createDatasetService();

  await assert.rejects(
    service.create({ ...sampleDatasetInput(), name: "" }),
    /name/
  );
});

test("dataset service lists datasets", async () => {
  const { service } = await createDatasetService();

  await service.create({
    ...sampleDatasetInput(),
    name: "second-dataset"
  });

  assert.equal((await service.list()).length, 2);
});

test("dataset service updates a dataset", async () => {
  const { service, dataset } = await createDatasetService();

  const updated = await service.update(dataset.id, {
    name: "renamed"
  });

  assert.equal(updated.name, "renamed");
});

test("dataset service rejects blank update name", async () => {
  const { service, dataset } = await createDatasetService();

  await assert.rejects(
    service.update(dataset.id, { name: " " }),
    /cannot be empty/
  );
});

test("dataset service rejects missing dataset", async () => {
  const { service } = await createDatasetService();

  await assert.rejects(service.get("missing"), /not found/);
});

test("dataset controller creates a dataset", async () => {
  const { service } = await createDatasetService();
  const controller = new DatasetController(service);

  const response = await controller.create({
    ...sampleDatasetInput(),
    name: "controller-dataset"
  });

  assert.equal(response.statusCode, 201);
});

test("dataset controller returns 400 for invalid input", async () => {
  const { service } = await createDatasetService();
  const controller = new DatasetController(service);

  const response = await controller.create({ name: "" });

  assert.equal(response.statusCode, 400);
});

test("dataset controller gets a dataset", async () => {
  const { service, dataset } = await createDatasetService();
  const controller = new DatasetController(service);

  assert.equal((await controller.get(dataset.id)).statusCode, 200);
});

test("dataset controller returns 404 for missing dataset", async () => {
  const { service } = await createDatasetService();
  const controller = new DatasetController(service);

  assert.equal((await controller.get("missing")).statusCode, 404);
});

test("dataset controller lists and deletes datasets", async () => {
  const { service, dataset } = await createDatasetService();
  const controller = new DatasetController(service);

  assert.equal((await controller.list()).statusCode, 200);
  assert.equal((await controller.delete(dataset.id)).statusCode, 204);
});

// Job schema tests

test("job schema accepts valid input", () => {
  const result = validateCreateJobInput({
    datasetId: "dataset-1",
    baseModel: "base-model",
    hyperparameters: { epochs: 4, learningRate: 0.001 }
  });

  assert.equal(result.datasetId, "dataset-1");
  assert.equal(result.hyperparameters?.epochs, 4);
});

test("job schema rejects null input", () => {
  assert.throws(() => validateCreateJobInput(null), /object/);
});

test("job schema rejects missing dataset ID", () => {
  assert.throws(
    () => validateCreateJobInput({ baseModel: "model" }),
    /datasetId/
  );
});

test("job schema rejects blank base model", () => {
  assert.throws(
    () =>
      validateCreateJobInput({
        datasetId: "dataset-1",
        baseModel: " "
      }),
    /baseModel/
  );
});

test("job schema rejects invalid hyperparameters", () => {
  assert.throws(
    () =>
      validateCreateJobInput({
        datasetId: "dataset-1",
        baseModel: "model",
        hyperparameters: { epochs: -1 }
      }),
    /positive number/
  );
});

test("job schema creates queued jobs", () => {
  const job = createFineTuningJob("job-x", {
    datasetId: "dataset-x",
    baseModel: "base-model"
  });

  assert.equal(job.id, "job-x");
  assert.equal(job.status, "queued");
  assert.equal(job.progress, 0);
});

test("job schema accepts valid status transitions", () => {
  assert.doesNotThrow(() => assertJobTransition("queued", "running"));
  assert.doesNotThrow(() => assertJobTransition("running", "succeeded"));
  assert.doesNotThrow(() => assertJobTransition("running", "failed"));
  assert.doesNotThrow(() => assertJobTransition("failed", "queued"));
});

test("job schema rejects invalid status transitions", () => {
  assert.throws(
    () => assertJobTransition("succeeded", "running"),
    /Invalid job transition/
  );
});

// Fine-tuning repository tests

test("fine-tuning repository creates and gets a job", async () => {
  const repository = new FineTuningRepository();
  const job = createFineTuningJob("repository-job", {
    datasetId: "dataset-x",
    baseModel: "base-model"
  });

  await repository.create(job);

  assert.equal((await repository.getById(job.id))?.status, "queued");
});

test("fine-tuning repository rejects duplicate jobs", async () => {
  const repository = new FineTuningRepository();
  const job = createFineTuningJob("duplicate-job", {
    datasetId: "dataset-x",
    baseModel: "base-model"
  });

  await repository.create(job);

  await assert.rejects(repository.create(job), /already exists/);
});

test("fine-tuning repository returns undefined for missing job", async () => {
  const repository = new FineTuningRepository();

  assert.equal(await repository.getById("missing"), undefined);
});

test("fine-tuning repository updates a job", async () => {
  const repository = new FineTuningRepository();
  const job = createFineTuningJob("update-job", {
    datasetId: "dataset-x",
    baseModel: "base-model"
  });

  await repository.create(job);

  const updated = await repository.update(job.id, {
    status: "running",
    progress: 25
  });

  assert.equal(updated.status, "running");
  assert.equal(updated.progress, 25);
});

test("fine-tuning repository rejects missing job updates", async () => {
  const repository = new FineTuningRepository();

  await assert.rejects(
    repository.update("missing", { status: "running" }),
    /not found/
  );
});

test("fine-tuning repository lists and counts jobs", async () => {
  const repository = new FineTuningRepository();

  await repository.create(
    createFineTuningJob("list-job-1", {
      datasetId: "dataset-x",
      baseModel: "model"
    })
  );

  await repository.create(
    createFineTuningJob("list-job-2", {
      datasetId: "dataset-x",
      baseModel: "model"
    })
  );

  assert.equal((await repository.list()).length, 2);
  assert.equal(await repository.count(), 2);
  assert.equal(await repository.count("queued"), 2);
  assert.equal(await repository.count("running"), 0);
});

test("fine-tuning repository deletes and clears jobs", async () => {
  const repository = new FineTuningRepository();

  await repository.create(
    createFineTuningJob("delete-job", {
      datasetId: "dataset-x",
      baseModel: "model"
    })
  );

  assert.equal(await repository.delete("delete-job"), true);
  await repository.clear();

  assert.equal(await repository.count(), 0);
});

// Job service and manager tests

test("job service creates a job with default hyperparameters", async () => {
  const { jobs, dataset } = await createJobEnvironment();

  const job = await jobs.create({
    datasetId: dataset.id,
    baseModel: "base-model"
  });

  assert.equal(job.status, "queued");
  assert.equal(job.hyperparameters.epochs, fineTuningConfig.defaultEpochs);
  assert.equal(
    job.hyperparameters.learningRate,
    fineTuningConfig.defaultLearningRate
  );
});

test("job service accepts custom hyperparameters", async () => {
  const { jobs, dataset } = await createJobEnvironment();

  const job = await jobs.create({
    datasetId: dataset.id,
    baseModel: "base-model",
    hyperparameters: { epochs: 5 }
  });

  assert.equal(job.hyperparameters.epochs, 5);
});

test("job service rejects unknown dataset", async () => {
  const { jobs } = await createJobEnvironment();

  await assert.rejects(
    jobs.create({ datasetId: "missing", baseModel: "model" }),
    /not found/
  );
});

test("job service rejects empty dataset", async () => {
  resetIds();

  const datasets = new DatasetService(new DatasetRepository(), () =>
    nextId("dataset")
  );

  const dataset = await datasets.create({
    name: "empty",
    format: "json",
    records: []
  });

  const jobs = new JobService(
    datasets,
    new FineTuningRepository(),
    () => nextId("job")
  );

  await assert.rejects(
    jobs.create({ datasetId: dataset.id, baseModel: "model" }),
    /empty dataset/
  );
});

test("job service gets and lists jobs", async () => {
  const { jobs, dataset } = await createJobEnvironment();
  const job = await jobs.create({
    datasetId: dataset.id,
    baseModel: "model"
  });

  assert.equal((await jobs.get(job.id)).id, job.id);
  assert.equal((await jobs.list()).length, 1);
});

test("job service starts a job", async () => {
  const { jobs, dataset } = await createJobEnvironment();
  const job = await jobs.create({
    datasetId: dataset.id,
    baseModel: "model"
  });

  const running = await jobs.start(job.id);

  assert.equal(running.status, "running");
  assert.ok(running.startedAt);
});

test("job service updates running-job progress", async () => {
  const { jobs, dataset } = await createJobEnvironment();
  const job = await jobs.create({
    datasetId: dataset.id,
    baseModel: "model"
  });

  await jobs.start(job.id);

  const updated = await jobs.updateProgress(job.id, 40);

  assert.equal(updated.progress, 40);
});

test("job service rejects invalid progress", async () => {
  const { jobs, dataset } = await createJobEnvironment();
  const job = await jobs.create({
    datasetId: dataset.id,
    baseModel: "model"
  });

  await jobs.start(job.id);

  await assert.rejects(jobs.updateProgress(job.id, 101), /between 0 and 100/);
});

test("job service rejects progress for queued jobs", async () => {
  const { jobs, dataset } = await createJobEnvironment();
  const job = await jobs.create({
    datasetId: dataset.id,
    baseModel: "model"
  });

  await assert.rejects(jobs.updateProgress(job.id, 10), /running jobs/);
});

test("job service succeeds a running job", async () => {
  const { jobs, dataset } = await createJobEnvironment();
  const job = await jobs.create({
    datasetId: dataset.id,
    baseModel: "model"
  });

  await jobs.start(job.id);

  const completed = await jobs.succeed(job.id, "trained-model");

  assert.equal(completed.status, "succeeded");
  assert.equal(completed.progress, 100);
  assert.equal(completed.resultModel, "trained-model");
  assert.ok(completed.completedAt);
});

test("job service rejects blank result model", async () => {
  const { jobs, dataset } = await createJobEnvironment();
  const job = await jobs.create({
    datasetId: dataset.id,
    baseModel: "model"
  });

  await jobs.start(job.id);

  await assert.rejects(jobs.succeed(job.id, " "), /resultModel/);
});

test("job service records failed jobs", async () => {
  const { jobs, dataset } = await createJobEnvironment();
  const job = await jobs.create({
    datasetId: dataset.id,
    baseModel: "model"
  });

  await jobs.start(job.id);

  const failed = await jobs.fail(job.id, new Error("training failed"));

  assert.equal(failed.status, "failed");
  assert.equal(failed.error, "training failed");
});

test("job service retries a failed job", async () => {
  const { jobs, dataset } = await createJobEnvironment();
  const job = await jobs.create({
    datasetId: dataset.id,
    baseModel: "model"
  });

  await jobs.start(job.id);
  await jobs.fail(job.id, "failed");

  const retried = await jobs.retry(job.id);

  assert.equal(retried.status, "queued");
  assert.equal(retried.progress, 0);
});

test("job service cancels a queued job", async () => {
  const { jobs, dataset } = await createJobEnvironment();
  const job = await jobs.create({
    datasetId: dataset.id,
    baseModel: "model"
  });

  const cancelled = await jobs.cancel(job.id);

  assert.equal(cancelled.status, "cancelled");
});

test("job service rejects deleting a running job", async () => {
  const { jobs, dataset } = await createJobEnvironment();
  const job = await jobs.create({
    datasetId: dataset.id,
    baseModel: "model"
  });

  await jobs.start(job.id);

  await assert.rejects(jobs.delete(job.id), /running job/);
});

test("job manager delegates submit and get", async () => {
  const { jobs, dataset } = await createJobEnvironment();
  const manager = new JobManager(jobs);

  const job = await manager.submit({
    datasetId: dataset.id,
    baseModel: "model"
  });

  assert.equal((await manager.get(job.id)).id, job.id);
  assert.equal((await manager.list()).length, 1);
});

test("job controller creates and gets jobs", async () => {
  const { jobs, dataset } = await createJobEnvironment();
  const controller = new JobController(jobs);

  const response = await controller.create({
    datasetId: dataset.id,
    baseModel: "model"
  });

  assert.equal(response.statusCode, 201);

  const job = response.body as { id: string };

  assert.equal((await controller.get(job.id)).statusCode, 200);
});

test("job controller handles invalid creation", async () => {
  const { jobs } = await createJobEnvironment();
  const controller = new JobController(jobs);

  assert.equal((await controller.create({})).statusCode, 400);
});

test("job controller lists, cancels, and retries jobs", async () => {
  const { jobs, dataset } = await createJobEnvironment();
  const controller = new JobController(jobs);

  const response = await controller.create({
    datasetId: dataset.id,
    baseModel: "model"
  });

  const job = response.body as { id: string };

  assert.equal((await controller.list()).statusCode, 200);
  assert.equal((await controller.cancel(job.id)).statusCode, 200);
});

// Deployment schema, manager, and service tests

test("deployment schema accepts succeeded jobs", () => {
  assert.doesNotThrow(() => validateDeploymentJobStatus("succeeded"));
});

test("deployment schema rejects non-succeeded jobs", () => {
  assert.throws(
    () => validateDeploymentJobStatus("running"),
    /successfully completed/
  );
});

test("deployment schema creates deployment records", () => {
  const deployment = createDeploymentRecord(
    "deployment-x",
    "job-x",
    "model-x",
    "https://example.invalid/model"
  );

  assert.equal(deployment.status, "creating");
  assert.equal(deployment.jobId, "job-x");
  assert.ok(deployment.createdAt instanceof Date);
});

test("deployment manager creates and retrieves deployments", async () => {
  const manager = new DeploymentManager();
  const deployment = createDeploymentRecord(
    "deployment-1",
    "job-1",
    "model-1",
    "https://example.invalid/model"
  );

  await manager.create(deployment);

  assert.equal((await manager.get(deployment.id))?.status, "creating");
});

test("deployment manager rejects duplicate IDs", async () => {
  const manager = new DeploymentManager();
  const deployment = createDeploymentRecord(
    "duplicate-deployment",
    "job-1",
    "model-1",
    "https://example.invalid/model"
  );

  await manager.create(deployment);

  await assert.rejects(manager.create(deployment), /already exists/);
});

test("deployment manager updates deployment status", async () => {
  const manager = new DeploymentManager();
  const deployment = createDeploymentRecord(
    "deployment-2",
    "job-1",
    "model-1",
    "https://example.invalid/model"
  );

  await manager.create(deployment);

  const updated = await manager.update(deployment.id, {
    status: "ready"
  });

  assert.equal(updated.status, "ready");
});

test("deployment manager returns undefined for missing deployment", async () => {
  const manager = new DeploymentManager();

  assert.equal(await manager.get("missing"), undefined);
});

test("deployment manager lists and soft-deletes deployments", async () => {
  const manager = new DeploymentManager();
  const deployment = createDeploymentRecord(
    "deployment-3",
    "job-1",
    "model-1",
    "https://example.invalid/model"
  );

  await manager.create(deployment);

  assert.equal((await manager.list()).length, 1);
  assert.equal(await manager.delete(deployment.id), true);
  assert.equal((await manager.get(deployment.id))?.status, "deleted");
});

test("deployment manager returns false for missing delete", async () => {
  const manager = new DeploymentManager();

  assert.equal(await manager.delete("missing"), false);
});

test("deployment service creates deployment for trained model", async () => {
  const { jobs, job } = await createSucceededJob();

  const deployments = new DeploymentService(
    jobs,
    new DeploymentManager(),
    () => "deployment-test",
    (id) => `https://example.invalid/${id}`
  );

  const deployment = await deployments.create({ jobId: job.id });

  assert.equal(deployment.id, "deployment-test");
  assert.equal(deployment.model, "fine-tuned-model");
  assert.equal(deployment.status, "creating");
});

test("deployment service rejects deployment for queued job", async () => {
  const { jobs, dataset } = await createJobEnvironment();
  const job = await jobs.create({
    datasetId: dataset.id,
    baseModel: "model"
  });

  const deployments = new DeploymentService(jobs);

  await assert.rejects(
    deployments.create({ jobId: job.id }),
    /successfully completed/
  );
});

test("deployment service rejects missing model", async () => {
  const { jobs, job } = await createSucceededJob();
  await jobs.repository.update(job.id, { resultModel: undefined });

  const deployments = new DeploymentService(jobs);

  await assert.rejects(
    deployments.create({ jobId: job.id }),
    /No trained model/
  );
});

test("deployment service marks deployment ready", async () => {
  const { jobs, job } = await createSucceededJob();

  const deployments = new DeploymentService(
    jobs,
    new DeploymentManager(),
    () => "deployment-ready"
  );

  await deployments.create({ jobId: job.id });

  const ready = await deployments.markReady("deployment-ready");

  assert.equal(ready.status, "ready");
});

test("deployment service marks deployment failed", async () => {
  const { jobs, job } = await createSucceededJob();

  const deployments = new DeploymentService(
    jobs,
    new DeploymentManager(),
    () => "deployment-failed"
  );

  await deployments.create({ jobId: job.id });

  const failed = await deployments.markFailed(
    "deployment-failed",
    new Error("provision failed")
  );

  assert.equal(failed.status, "failed");
  assert.equal(failed.error, "provision failed");
});

test("deployment service deletes a deployment", async () => {
  const { jobs, job } = await createSucceededJob();

  const deployments = new DeploymentService(
    jobs,
    new DeploymentManager(),
    () => "deployment-delete"
  );

  await deployments.create({ jobId: job.id });

  assert.equal(await deployments.delete("deployment-delete"), true);
});

// Worker tests

test("training worker runs trainer and completes job", async () => {
  const { jobs, dataset } = await createJobEnvironment();

  const job = await jobs.create({
    datasetId: dataset.id,
    baseModel: "model"
  });

  const worker = new TrainingWorker(jobs, async (_job, progress) => {
    await progress(50);
    await progress(90);
    return "trained-model";
  });

  const result = await worker.process(job.id);

  assert.equal(result.status, "succeeded");
  assert.equal(result.progress, 100);
  assert.equal(result.resultModel, "trained-model");
});

test("training worker records trainer errors", async () => {
  const { jobs, dataset } = await createJobEnvironment();

  const job = await jobs.create({
    datasetId: dataset.id,
    baseModel: "model"
  });

  const worker = new TrainingWorker(jobs, async () => {
    throw new Error("trainer crashed");
  });

  const result = await worker.process(job.id);

  assert.equal(result.status, "failed");
  assert.equal(result.error, "trainer crashed");
});

test("evaluation worker evaluates succeeded jobs", async () => {
  const { jobs, job } = await createSucceededJob();

  const worker = new EvaluationWorker(jobs, (candidate) => {
    return candidate.resultModel === "fine-tuned-model";
  });

  const result = await worker.evaluate(job.id);

  assert.equal(result.jobId, job.id);
  assert.equal(result.passed, true);
});

test("evaluation worker rejects unfinished jobs", async () => {
  const { jobs, dataset } = await createJobEnvironment();
  const job = await jobs.create({
    datasetId: dataset.id,
    baseModel: "model"
  });

  const worker = new EvaluationWorker(jobs, () => true);

  await assert.rejects(
    worker.evaluate(job.id),
    /successfully trained/
  );
});

test("deployment worker provisions and marks deployment ready", async () => {
  const { jobs, job } = await createSucceededJob();

  const deployments = new DeploymentService(
    jobs,
    new DeploymentManager(),
    () => "worker-deployment"
  );

  await deployments.create({ jobId: job.id });

  const worker = new DeploymentWorker(deployments, async () => undefined);
  const result = await worker.process("worker-deployment");

  assert.equal(result.status, "ready");
});

test("deployment worker records provisioning failures", async () => {
  const { jobs, job } = await createSucceededJob();

  const deployments = new DeploymentService(
    jobs,
    new DeploymentManager(),
    () => "worker-failure"
  );

  await deployments.create({ jobId: job.id });

  const worker = new DeploymentWorker(deployments, async () => {
    throw new Error("provider unavailable");
  });

  const result = await worker.process("worker-failure");

  assert.equal(result.status, "failed");
  assert.equal(result.error, "provider unavailable");
});
