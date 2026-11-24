"use client";

import {
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Mic,
  Paperclip,
  Send,
  WandSparkles,
  X,
  Zap,
} from "lucide-react";
import { useRef, useState } from "react";
import type { ChangeEvent, FormEvent, KeyboardEvent } from "react";

import DatasetStats from "./DatasetStats";
import DatasetUploadCard from "./DatasetUploadCard";

export type FineTuningDataset = {
  name: string;
  size: string;
  examples: number;
  quality: number;
  format: string;
  structuralStatus: string;
};

type FineTuningHeroProps = {
  dataset: FineTuningDataset | null;
  objective: string;
  datasetAnalyzing: boolean;
  autopilotRunning: boolean;
  autopilotComplete: boolean;
  errorMessage: string;
  showExpertView: boolean;
  onDatasetChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onObjectiveChange: (value: string) => void;
  onStartAutopilot: () => void;
  onToggleExpertView: () => void;
};

export default function FineTuningHero({
  dataset,
  objective,
  datasetAnalyzing,
  autopilotRunning,
  autopilotComplete,
  errorMessage,
  showExpertView,
  onDatasetChange,
  onObjectiveChange,
  onStartAutopilot,
  onToggleExpertView,
}: FineTuningHeroProps) {
  const [attachmentNames, setAttachmentNames] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const objectiveInputRef = useRef<HTMLTextAreaElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  const canStart =
    Boolean(dataset) &&
    objective.trim().length >= 10 &&
    !datasetAnalyzing &&
    !autopilotRunning;

  const handleObjectiveSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (canStart) {
      onStartAutopilot();
    }
  };

  const handleObjectiveKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      if (canStart) {
        onStartAutopilot();
      }
    }
  };

  const handleAttachmentChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files ?? []);

    if (files.length > 0) {
      setAttachmentNames((previous) => [
        ...previous,
        ...files.map((file) => file.name),
      ]);
    }

    event.target.value = "";
  };

  const handleRemoveAttachment = (indexToRemove: number) => {
    setAttachmentNames((previous) =>
      previous.filter((_, index) => index !== indexToRemove),
    );
  };

  const handleMicrophoneClick = () => {
    setIsRecording((previous) => !previous);
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="grid lg:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.85fr)]">
        {/* Main hero */}
        <div className="p-6 sm:p-8 lg:p-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700">
            <WandSparkles size={14} />
            ModelNow Autopilot
          </div>

          {/* Heading */}
          <h2 className="mt-6 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight text-slate-950 sm:text-5xl">
            Upload raw data.
            <br />
            Tell ModelNow the goal.
            <br />
            We handle the AI lifecycle.
          </h2>

          {/* Description */}
          <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
            ModelNow automatically validates your data, prepares training,
            selects the strategy, runs experiments, evaluates the result,
            registers the best version, deploys it, and activates monitoring.
          </p>

          <div className="mt-8 space-y-5">
            {/* Dataset */}
            <DatasetUploadCard
              dataset={dataset}
              datasetAnalyzing={datasetAnalyzing}
              autopilotRunning={autopilotRunning}
              onDatasetChange={onDatasetChange}
            />

            {/* Dataset stats */}
            {dataset && !datasetAnalyzing && (
              <DatasetStats dataset={dataset} />
            )}

            {/* Objective chat box */}
            <div className="space-y-3">
              <div>
                <h3 className="text-base font-semibold text-slate-950">
                  What should the model become better at?
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Describe the outcome you want in plain language. ModelNow
                  will use your goal to guide the fine-tuning workflow.
                </p>
              </div>

              <form onSubmit={handleObjectiveSubmit}>
                <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100">
                  <textarea
                    ref={objectiveInputRef}
                    value={objective}
                    onChange={(event) =>
                      onObjectiveChange(event.target.value)
                    }
                    onKeyDown={handleObjectiveKeyDown}
                    disabled={autopilotRunning}
                    rows={3}
                    placeholder="Example: Make the model better at answering customer support questions using our company knowledge base..."
                    aria-label="Fine-tuning objective"
                    className="min-h-20 w-full resize-y border-0 bg-transparent px-2 py-2 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <div className="mt-2 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-2">
                      {/* Plus / attachment button */}
                      <button
                        type="button"
                        onClick={() => attachmentInputRef.current?.click()}
                        disabled={autopilotRunning}
                        aria-label="Attach files"
                        title="Attach files"
                        className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <span className="text-2xl font-light leading-none">
                          +
                        </span>
                      </button>

                      <input
                        ref={attachmentInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleAttachmentChange}
                        aria-label="Choose attachments"
                      />

                      {/* Microphone button */}
                      <button
                        type="button"
                        onClick={handleMicrophoneClick}
                        disabled={autopilotRunning}
                        aria-label={
                          isRecording
                            ? "Stop microphone mode"
                            : "Use microphone"
                        }
                        title="Microphone"
                        aria-pressed={isRecording}
                        className={`flex h-10 w-10 items-center justify-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          isRecording
                            ? "bg-red-50 text-red-600"
                            : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      >
                        <Mic size={20} />
                      </button>
                    </div>

                    {/* Send button */}
                    <button
                      type="submit"
                      disabled={!canStart}
                      aria-label="Submit objective and start Autopilot"
                      title={
                        !dataset
                          ? "Upload a dataset first"
                          : objective.trim().length < 10
                            ? "Enter at least 10 characters"
                            : "Start Autopilot"
                      }
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </form>

              {/* Selected attachments */}
              {attachmentNames.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {attachmentNames.map((name, index) => (
                    <span
                      key={`${name}-${index}`}
                      className="inline-flex max-w-full items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600"
                    >
                      <Paperclip size={13} />
                      <span className="max-w-48 truncate">{name}</span>

                      <button
                        type="button"
                        aria-label={`Remove ${name}`}
                        onClick={() => handleRemoveAttachment(index)}
                        className="rounded p-0.5 hover:bg-slate-200"
                      >
                        <X size={13} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <p className="text-xs text-slate-400">
                Press Enter to submit or Shift+Enter for a new line.
              </p>
            </div>
          </div>

          {/* Error */}
          {errorMessage && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <X size={17} className="mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onStartAutopilot}
              disabled={!canStart}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Zap size={17} />

              {datasetAnalyzing
                ? "Analyzing dataset..."
                : autopilotRunning
                  ? "Autopilot running..."
                  : autopilotComplete
                    ? "Run again"
                    : "Start Autopilot"}

              <ChevronRight size={17} />
            </button>

            <button
              type="button"
              onClick={onToggleExpertView}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <BrainCircuit size={17} />

              {showExpertView ? "Hide expert view" : "Expert view"}
            </button>
          </div>
        </div>

        {/* Automation panel */}
        <div className="border-t border-slate-200 bg-slate-50 p-6 lg:border-l lg:border-t-0 lg:p-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <BrainCircuit size={23} />
              </div>

              <div className="min-w-0">
                <h3 className="font-semibold">
                  ModelNow handles the technical work
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Users describe outcomes. Autopilot handles the model
                  lifecycle.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {[
                "Data preparation",
                "Model selection",
                "Training strategy",
                "Experiments",
                "Deployment",
                "Monitoring",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                      <CheckCircle2 size={15} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{item}</p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Automatically handled by ModelNow
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}