"use client";

import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  CloudUpload,
  Database,
  FileText,
  Info,
  Play,
  Rocket,
  ShieldCheck,
  Sparkles,
  Upload,
  X,
  BrainCircuit,
  BarChart3,
  Zap,
  Target,
  WandSparkles,
} from "lucide-react";

type Stage =
  | "upload"
  | "analyzing"
  | "configure"
  | "training"
  | "evaluation"
  | "ready"
  | "deployed";

type DatasetInfo = {
  name: string;
  size: string;
  examples: string;
  quality: number;
};

type ModelRecommendation = {
  name: string;
  reason: string;
  score: number;
  latency: string;
  cost: string;
};

export default function FineTuningPage() {
  const [stage, setStage] = useState<Stage>("upload");

  const [dataset, setDataset] = useState<DatasetInfo | null>(null);
  const [objective, setObjective] = useState("");
  const [taskType, setTaskType] = useState("Analyzing...");

  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [trainingProgress, setTrainingProgress] = useState(0);

  const [selectedModel, setSelectedModel] = useState<ModelRecommendation>({
    name: "ModelNow Balanced",
    reason: "Best balance of quality, cost and latency for this workload.",
    score: 94,
    latency: "420 ms",
    cost: "$0.0021 / 1K tokens",
  });

  const [showDeployModal, setShowDeployModal] = useState(false);
  const [deploymentDone, setDeploymentDone] = useState(false);

  const [advancedOpen, setAdvancedOpen] = useState(false);

  const uploadDataset = () => {
    setDataset({
      name: "customer-support-data.jsonl",
      size: "48.6 MB",
      examples: "48,240 examples",
      quality: 94,
    });

    setStage("analyzing");
    setAnalysisProgress(0);

    let progress = 0;

    const interval = setInterval(() => {
      progress += 20;
      setAnalysisProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);

        setTaskType("Customer Support / Instruction Tuning");

        setTimeout(() => {
          setStage("configure");
        }, 500);
      }
    }, 350);
  };

  const startTraining = () => {
    setStage("training");
    setTrainingProgress(0);

    let progress = 0;

    const interval = setInterval(() => {
      progress += 10;
      setTrainingProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);

        setTimeout(() => {
          setStage("evaluation");
        }, 500);
      }
    }, 300);
  };

  const finishEvaluation = () => {
    setStage("ready");
  };

  const deployModel = () => {
    setShowDeployModal(false);
    setDeploymentDone(true);
    setStage("deployed");
  };

  const resetWorkflow = () => {
    setStage("upload");
    setDataset(null);
    setObjective("");
    setTaskType("Analyzing...");
    setAnalysisProgress(0);
    setTrainingProgress(0);
    setDeploymentDone(false);
  };

  const stageComplete = (target: Stage) => {
    const order: Stage[] = [
      "upload",
      "analyzing",
      "configure",
      "training",
      "evaluation",
      "ready",
      "deployed",
    ];

    return order.indexOf(stage) > order.indexOf(target);
  };

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <a
              href="/chat"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            >
              <ArrowLeft size={18} />
            </a>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
                <Sparkles size={18} />
              </div>

              <div>
                <h1 className="text-lg font-semibold">
                  ModelNow Fine-tuning
                </h1>
                <p className="text-xs text-slate-500">
                  Turn raw business data into specialized AI models
                </p>
              </div>
            </div>
          </div>

          {stage !== "upload" && (
            <button
              onClick={resetWorkflow}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold hover:bg-slate-50"
            >
              Start new model
            </button>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] space-y-6 px-6 py-6">
        {/* Hero */}
        <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700">
                <WandSparkles size={14} />
                Automatic Model Customization
              </div>

              <h2 className="max-w-3xl text-3xl font-bold tracking-tight">
                Fine-tune AI models without managing complex training
                configuration.
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                Upload your raw training data and tell ModelNow what you want
                the model to become better at. ModelNow Intelligence analyzes
                the data, selects the best base model, prepares the training
                strategy, evaluates the result and prepares it for deployment.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    document
                      .getElementById("dataset-upload")
                      ?.click();
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <CloudUpload size={16} />
                  Upload raw data
                </button>

                <a
                  href="/models"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold hover:bg-slate-50"
                >
                  <BrainCircuit size={16} />
                  View models
                </a>

                <input
                  id="dataset-upload"
                  type="file"
                  accept=".jsonl,.json,.csv,.txt"
                  className="hidden"
                  onChange={uploadDataset}
                />
              </div>
            </div>

            {/* Automatic Pipeline */}
            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                ModelNow intelligent pipeline
              </p>

              <div className="space-y-3">
                {[
                  ["01", "Upload raw data", "upload"],
                  ["02", "AI data analysis", "analyzing"],
                  ["03", "Automatic model selection", "configure"],
                  ["04", "Fine-tuning", "training"],
                  ["05", "Evaluation", "evaluation"],
                  ["06", "Deploy", "deployed"],
                ].map(([number, title, target]) => {
                  const completed =
                    stageComplete(target as Stage) ||
                    (target === "upload" && dataset !== null);

                  return (
                    <div
                      key={number}
                      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3"
                    >
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-bold ${
                          completed
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {completed ? (
                          <CheckCircle2 size={15} />
                        ) : (
                          number
                        )}
                      </div>

                      <span className="text-xs font-medium">
                        {title}
                      </span>

                      {completed && (
                        <CheckCircle2
                          size={15}
                          className="ml-auto text-emerald-500"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* KPI Cards */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={<Database size={17} />}
            title="Raw data"
            value={dataset ? dataset.examples : "Waiting"}
            description="Training examples"
          />

          <MetricCard
            icon={<Target size={17} />}
            title="Data quality"
            value={dataset ? `${dataset.quality}%` : "--"}
            description="AI validation score"
          />

          <MetricCard
            icon={<BrainCircuit size={17} />}
            title="Model selection"
            value={dataset ? "Automatic" : "--"}
            description="ModelNow Intelligence"
          />

          <MetricCard
            icon={<Rocket size={17} />}
            title="Deployment"
            value={deploymentDone ? "Live" : "Not deployed"}
            description="Production model"
          />
        </section>

        {/* Step 1 — Upload */}
        {stage === "upload" && (
          <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <CloudUpload size={30} />
              </div>

              <h2 className="mt-5 text-xl font-bold">
                Upload your raw training data
              </h2>

              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
                ModelNow will inspect the dataset automatically. You do not
                need to manually prepare every training parameter.
              </p>

              <button
                onClick={() =>
                  document.getElementById("dataset-upload")?.click()
                }
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <Upload size={16} />
                Select dataset
              </button>

              <p className="mt-3 text-xs text-slate-400">
                Supported formats: JSONL, JSON, CSV and TXT
              </p>

              <input
                id="dataset-upload"
                type="file"
                accept=".jsonl,.json,.csv,.txt"
                className="hidden"
                onChange={uploadDataset}
              />
            </div>
          </section>
        )}

        {/* Step 2 — Analysis */}
        {stage === "analyzing" && (
          <section className="rounded-2xl border border-blue-200 bg-white p-7 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Sparkles size={22} />
              </div>

              <div className="flex-1">
                <h2 className="text-lg font-semibold">
                  ModelNow is analyzing your data
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Understanding dataset structure, quality and the best
                  training strategy.
                </p>

                <div className="mt-6">
                  <div className="mb-2 flex justify-between text-xs">
                    <span className="font-semibold">
                      AI data analysis
                    </span>

                    <span className="font-semibold text-blue-600">
                      {analysisProgress}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${analysisProgress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  <AnalysisItem
                    done={analysisProgress >= 20}
                    text="Dataset structure detected"
                  />
                  <AnalysisItem
                    done={analysisProgress >= 40}
                    text="Data quality checked"
                  />
                  <AnalysisItem
                    done={analysisProgress >= 60}
                    text="Task type identified"
                  />
                  <AnalysisItem
                    done={analysisProgress >= 80}
                    text="Training strategy generated"
                  />
                  <AnalysisItem
                    done={analysisProgress >= 100}
                    text="Base model candidates evaluated"
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Step 3 — Automatic Model Selection */}
        {stage === "configure" && dataset && (
          <section className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 size={14} />
                    Analysis complete
                  </div>

                  <h2 className="mt-4 text-xl font-bold">
                    ModelNow has prepared your fine-tuning plan
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    You provide the data and objective. ModelNow handles the
                    technical configuration automatically.
                  </p>
                </div>

                <div className="hidden rounded-xl bg-purple-50 p-4 text-purple-700 md:block">
                  <BrainCircuit size={28} />
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <InfoCard
                  title="Dataset"
                  value={dataset.name}
                  description={`${dataset.size} • ${dataset.examples}`}
                  icon={<FileText size={18} />}
                />

                <InfoCard
                  title="Detected task"
                  value={taskType}
                  description="Automatically identified"
                  icon={<Target size={18} />}
                />

                <InfoCard
                  title="Data quality"
                  value={`${dataset.quality}%`}
                  description="Ready for training"
                  icon={<BarChart3 size={18} />}
                />
              </div>
            </section>

            {/* Objective */}
            <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Target size={18} />
                </div>

                <div>
                  <h2 className="font-semibold">
                    What should the model become better at?
                  </h2>
                  <p className="text-xs text-slate-500">
                    Describe the business objective in normal language.
                  </p>
                </div>
              </div>

              <textarea
                value={objective}
                onChange={(event) => setObjective(event.target.value)}
                placeholder="Example: Make the model better at answering customer support questions using our company's support conversations."
                className="mt-5 min-h-[120px] w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-blue-400 focus:bg-white"
              />

              <div className="mt-4 flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs leading-5 text-blue-700">
                <Info size={16} className="shrink-0" />
                ModelNow will use this objective together with your dataset
                to select the appropriate training strategy.
              </div>
            </section>

            {/* Automatic model recommendation */}
            <section className="rounded-2xl border border-purple-200 bg-white p-7 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700">
                    <Sparkles size={14} />
                    ModelNow Intelligence
                  </div>

                  <h2 className="mt-4 text-xl font-bold">
                    Recommended base model
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    ModelNow evaluated available models based on your task,
                    dataset and expected production requirements.
                  </p>
                </div>

                <div className="rounded-xl bg-slate-900 px-4 py-3 text-right text-white">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">
                    Match
                  </p>
                  <p className="text-xl font-bold">
                    {selectedModel.score}%
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border-2 border-blue-200 bg-blue-50/50 p-5">
                <div className="flex flex-col gap-5 md:flex-row md:items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                    <BrainCircuit size={23} />
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold">
                        {selectedModel.name}
                      </h3>

                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                        Recommended
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-slate-600">
                      {selectedModel.reason}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-right">
                    <div>
                      <p className="text-[10px] text-slate-400">
                        Latency
                      </p>
                      <p className="text-xs font-semibold">
                        {selectedModel.latency}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] text-slate-400">
                        Cost
                      </p>
                      <p className="text-xs font-semibold">
                        {selectedModel.cost}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Candidate models */}
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <ModelCandidate
                  name="ModelNow Fast"
                  score={87}
                  description="Lower latency and lower cost."
                  selected={false}
                />

                <ModelCandidate
                  name="ModelNow Balanced"
                  score={94}
                  description="Best overall production balance."
                  selected={true}
                />

                <ModelCandidate
                  name="ModelNow Reasoning"
                  score={91}
                  description="Higher reasoning capability."
                  selected={false}
                />
              </div>

              {/* Advanced */}
              <div className="mt-5 border-t border-slate-200 pt-5">
                <button
                  onClick={() => setAdvancedOpen(!advancedOpen)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  {advancedOpen ? "Hide" : "Show"} advanced training controls
                </button>

                {advancedOpen && (
                  <div className="mt-4 grid gap-4 rounded-xl bg-slate-50 p-5 md:grid-cols-3">
                    <AdvancedItem
                      title="Training strategy"
                      value="Instruction fine-tuning"
                    />
                    <AdvancedItem
                      title="Optimization"
                      value="ModelNow automatic"
                    />
                    <AdvancedItem
                      title="Evaluation"
                      value="Automatic benchmark"
                    />
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={startTraining}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <Play size={16} />
                  Start automatic fine-tuning
                  <ChevronRight size={16} />
                </button>
              </div>
            </section>
          </section>
        )}

        {/* Step 4 — Training */}
        {stage === "training" && (
          <section className="rounded-2xl border border-blue-200 bg-white p-7 shadow-sm">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <BrainCircuit size={30} />
              </div>

              <h2 className="mt-5 text-xl font-bold">
                ModelNow is fine-tuning your model
              </h2>

              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
                Training is being handled automatically using the selected
                model and ModelNow-generated configuration.
              </p>
            </div>

            <div className="mx-auto mt-8 max-w-3xl">
              <div className="mb-2 flex justify-between text-xs">
                <span className="font-semibold">
                  Fine-tuning progress
                </span>

                <span className="font-semibold text-blue-600">
                  {trainingProgress}%
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${trainingProgress}%` }}
                />
              </div>

              <div className="mt-7 grid gap-3 md:grid-cols-4">
                <TrainingStatus
                  title="Preparing data"
                  done={trainingProgress >= 20}
                />
                <TrainingStatus
                  title="Training"
                  done={trainingProgress >= 50}
                />
                <TrainingStatus
                  title="Optimizing"
                  done={trainingProgress >= 80}
                />
                <TrainingStatus
                  title="Finalizing"
                  done={trainingProgress >= 100}
                />
              </div>
            </div>
          </section>
        )}

        {/* Step 5 — Evaluation */}
        {stage === "evaluation" && (
          <section className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <BarChart3 size={22} />
                </div>

                <div>
                  <h2 className="text-xl font-bold">
                    Fine-tuning complete — evaluating model
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    ModelNow compares the specialized model against the
                    original base model before deployment.
                  </p>
                </div>
              </div>

              <div className="mt-7 grid gap-4 md:grid-cols-2">
                <EvaluationCard
                  title="Base Model"
                  score="86%"
                  description="General-purpose performance"
                />

                <EvaluationCard
                  title="Fine-tuned Model"
                  score="94%"
                  description="Specialized workload performance"
                  recommended
                />
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-4">
              <ScoreCard title="Domain knowledge" value="+18%" />
              <ScoreCard title="Instruction following" value="+12%" />
              <ScoreCard title="Task accuracy" value="+9%" />
              <ScoreCard title="Response quality" value="+14%" />
            </section>

            <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
              <div className="flex items-start gap-3">
                <CheckCircle2
                  size={20}
                  className="mt-0.5 text-emerald-600"
                />

                <div className="flex-1">
                  <h3 className="text-sm font-bold text-emerald-900">
                    ModelNow recommends deployment
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-emerald-700">
                    The fine-tuned model demonstrates improved performance
                    for the detected workload and is ready for deployment.
                  </p>
                </div>

                <button
                  onClick={finishEvaluation}
                  className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Continue
                </button>
              </div>
            </section>
          </section>
        )}

        {/* Step 6 — Ready to Deploy */}
        {stage === "ready" && (
          <section className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 size={14} />
                    Model ready
                  </div>

                  <h2 className="mt-4 text-2xl font-bold">
                    Your specialized model is ready for production
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    ModelNow has completed training and evaluation. Deploy
                    this model to make it available through ModelNow Chat,
                    agents and enterprise workflows.
                  </p>
                </div>

                <div className="hidden h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 md:flex">
                  <Rocket size={26} />
                </div>
              </div>

              <div className="mt-7 grid gap-4 md:grid-cols-3">
                <InfoCard
                  title="Model"
                  value="ModelNow Balanced"
                  description="Fine-tuned version"
                  icon={<BrainCircuit size={18} />}
                />

                <InfoCard
                  title="Evaluation"
                  value="94%"
                  description="Overall task score"
                  icon={<BarChart3 size={18} />}
                />

                <InfoCard
                  title="Status"
                  value="Ready"
                  description="Passed evaluation"
                  icon={<CheckCircle2 size={18} />}
                />
              </div>

              <div className="mt-7 flex justify-end">
                <button
                  onClick={() => setShowDeployModal(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  <Rocket size={17} />
                  Deploy to ModelNow
                </button>
              </div>
            </section>
          </section>
        )}

        {/* Deployed */}
        {stage === "deployed" && (
          <section className="rounded-2xl border border-emerald-200 bg-white p-8 shadow-sm">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Rocket size={30} />
              </div>

              <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                <CheckCircle2 size={14} />
                Production deployment successful
              </div>

              <h2 className="mt-4 text-2xl font-bold">
                Your ModelNow model is live
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                The specialized model is now ready to be used by Chat,
                Agents and enterprise workflows.
              </p>

              <div className="mt-7 grid gap-4 text-left md:grid-cols-3">
                <DeploymentCard
                  title="Model"
                  value="ModelNow-Support-v1"
                />

                <DeploymentCard
                  title="Environment"
                  value="Production"
                />

                <DeploymentCard
                  title="Version"
                  value="v1.0"
                />
              </div>

              <div className="mt-6 rounded-xl bg-slate-50 p-4 text-left">
                <p className="text-[10px] uppercase tracking-wider text-slate-400">
                  Model endpoint
                </p>

                <p className="mt-1 font-mono text-xs text-slate-700">
                  /v1/models/modelnow-support-v1
                </p>
              </div>

              <div className="mt-7 flex justify-center gap-3">
                <a
                  href="/chat"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Open ModelNow Chat
                  <ChevronRight size={16} />
                </a>

                <a
                  href="/models"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold hover:bg-slate-50"
                >
                  View model
                </a>
              </div>
            </div>
          </section>
        )}

        {/* Architecture */}
        <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
              <Zap size={14} />
              ModelNow architecture
            </div>

            <h2 className="mt-4 text-xl font-bold">
              From raw data to production AI
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              ModelNow hides unnecessary ML complexity while keeping the
              complete enterprise fine-tuning lifecycle under one workflow.
            </p>
          </div>

          <div className="mt-7 grid gap-3 md:grid-cols-6">
            <ArchitectureStep
              number="01"
              title="Raw Data"
              icon={<CloudUpload size={18} />}
            />

            <ArchitectureArrow />

            <ArchitectureStep
              number="02"
              title="AI Analysis"
              icon={<Sparkles size={18} />}
            />

            <ArchitectureArrow />

            <ArchitectureStep
              number="03"
              title="Auto Model"
              icon={<BrainCircuit size={18} />}
            />

            <ArchitectureArrow />

            <ArchitectureStep
              number="04"
              title="Fine-tune"
              icon={<Database size={18} />}
            />

            <ArchitectureArrow />

            <ArchitectureStep
              number="05"
              title="Evaluate"
              icon={<BarChart3 size={18} />}
            />

            <ArchitectureArrow />

            <ArchitectureStep
              number="06"
              title="Deploy"
              icon={<Rocket size={18} />}
            />
          </div>
        </section>

        {/* Enterprise controls */}
        <section className="grid gap-5 lg:grid-cols-3">
          <ControlCard
            icon={<ShieldCheck size={20} />}
            title="Enterprise data protection"
            description="Training data remains within the configured enterprise data boundary and access controls."
          />

          <ControlCard
            icon={<BarChart3 size={20} />}
            title="Automatic evaluation"
            description="Every fine-tuned model can be evaluated against a consistent benchmark before production."
          />

          <ControlCard
            icon={<Rocket size={20} />}
            title="Production deployment"
            description="Deploy approved model versions into ModelNow Chat, agents and enterprise workflows."
          />
        </section>
      </div>

      {/* Deploy Modal */}
      {showDeployModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Rocket size={21} />
                </div>

                <h2 className="mt-4 text-lg font-semibold">
                  Deploy specialized model?
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  ModelNow will publish the evaluated fine-tuned model as a
                  production model.
                </p>
              </div>

              <button
                onClick={() => setShowDeployModal(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 space-y-3 rounded-xl bg-slate-50 p-4">
              <DeploymentRow
                label="Model"
                value="ModelNow-Support-v1"
              />

              <DeploymentRow
                label="Environment"
                value="Production"
              />

              <DeploymentRow
                label="Version"
                value="v1.0"
              />

              <DeploymentRow
                label="Evaluation score"
                value="94%"
              />
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setShowDeployModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={deployModel}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                <Rocket size={16} />
                Deploy model
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/* ---------------- Components ---------------- */

function MetricCard({
  icon,
  title,
  value,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">{title}</span>
        <span className="text-blue-600">{icon}</span>
      </div>

      <p className="mt-3 text-xl font-bold">{value}</p>

      <p className="mt-1 text-xs text-slate-400">{description}</p>
    </div>
  );
}

function AnalysisItem({
  done,
  text,
}: {
  done: boolean;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
      {done ? (
        <CheckCircle2
          size={17}
          className="text-emerald-500"
        />
      ) : (
        <div className="h-4 w-4 rounded-full border-2 border-slate-300" />
      )}

      <span className="text-xs font-medium">{text}</span>
    </div>
  );
}

function InfoCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}
        <span className="text-xs font-semibold">{title}</span>
      </div>

      <p className="mt-3 text-sm font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-[11px] text-slate-400">
        {description}
      </p>
    </div>
  );
}

function ModelCandidate({
  name,
  score,
  description,
  selected,
}: {
  name: string;
  score: number;
  description: string;
  selected: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        selected
          ? "border-blue-200 bg-blue-50"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold">{name}</span>

        {selected && (
          <CheckCircle2
            size={15}
            className="text-blue-600"
          />
        )}
      </div>

      <p className="mt-3 text-lg font-bold">{score}%</p>

      <p className="mt-1 text-[11px] leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function AdvancedItem({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-slate-400">
        {title}
      </p>

      <p className="mt-1 text-xs font-semibold">{value}</p>
    </div>
  );
}

function TrainingStatus({
  title,
  done,
}: {
  title: string;
  done: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-4 text-center">
      {done ? (
        <CheckCircle2
          size={18}
          className="mx-auto text-emerald-500"
        />
      ) : (
        <div className="mx-auto h-[18px] w-[18px] rounded-full border-2 border-slate-300" />
      )}

      <p className="mt-2 text-[11px] font-semibold">{title}</p>
    </div>
  );
}

function EvaluationCard({
  title,
  score,
  description,
  recommended,
}: {
  title: string;
  score: string;
  description: string;
  recommended?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-6 ${
        recommended
          ? "border-emerald-200 bg-emerald-50"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">{title}</p>

        {recommended && (
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
            Better
          </span>
        )}
      </div>

      <p className="mt-4 text-3xl font-bold">{score}</p>

      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  );
}

function ScoreCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs text-slate-500">{title}</p>
      <p className="mt-2 text-xl font-bold text-emerald-600">
        {value}
      </p>
      <p className="mt-1 text-[10px] text-slate-400">
        Improvement
      </p>
    </div>
  );
}

function DeploymentCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-[10px] uppercase tracking-wider text-slate-400">
        {title}
      </p>

      <p className="mt-2 text-sm font-bold">{value}</p>
    </div>
  );
}

function DeploymentRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function ArchitectureStep({
  number,
  title,
  icon,
}: {
  number: string;
  title: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
      <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-white text-blue-600">
        {icon}
      </div>

      <p className="mt-2 text-[9px] font-semibold text-slate-400">
        {number}
      </p>

      <p className="mt-1 text-xs font-semibold">{title}</p>
    </div>
  );
}

function ArchitectureArrow() {
  return (
    <div className="hidden items-center justify-center text-slate-300 md:flex">
      <ChevronRight size={18} />
    </div>
  );
}

function ControlCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-700">
        {icon}
      </div>

      <h3 className="mt-4 text-sm font-semibold">{title}</h3>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}