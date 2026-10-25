"use client";

import {
  AlertCircle,
  Bot,
  Save,
  X,
} from "lucide-react";

type CustomAgentModalProps = {
  open: boolean;
  saving: boolean;
  errorMessage: string;
  customName: string;
  customDescription: string;
  customStepsText: string;
  customToolsText: string;
  customConnectorsText: string;
  onClose: () => void;
  onSave: () => void | Promise<void>;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onStepsChange: (value: string) => void;
  onToolsChange: (value: string) => void;
  onConnectorsChange: (value: string) => void;
};

export default function CustomAgentModal({
  open,
  saving,
  errorMessage,
  customName,
  customDescription,
  customStepsText,
  customToolsText,
  customConnectorsText,
  onClose,
  onSave,
  onNameChange,
  onDescriptionChange,
  onStepsChange,
  onToolsChange,
  onConnectorsChange,
}: CustomAgentModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Bot size={20} />
            </div>

            <h2 className="mt-4 text-xl font-bold">
              Create Custom Enterprise Agent
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Organization defines the custom agent, custom workflow,
              custom tools and custom connectors.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 grid gap-5">
          <label>
            <span className="text-sm font-semibold">
              Agent name
            </span>

            <input
              value={customName}
              onChange={(event) =>
                onNameChange(event.target.value)
              }
              placeholder="Enterprise Procurement Agent"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white"
            />
          </label>

          <label>
            <span className="text-sm font-semibold">
              Description
            </span>

            <textarea
              value={customDescription}
              onChange={(event) =>
                onDescriptionChange(
                  event.target.value,
                )
              }
              rows={3}
              placeholder="Describe what the organization-specific agent should accomplish."
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white"
            />
          </label>

          <label>
            <span className="text-sm font-semibold">
              Custom workflow
            </span>

            <p className="mt-1 text-xs text-slate-500">
              One workflow stage per line.
            </p>

            <textarea
              value={customStepsText}
              onChange={(event) =>
                onStepsChange(event.target.value)
              }
              rows={8}
              placeholder={
                "Organization Request\nUnderstand\nPlan\nExecute\nVerify\nClose"
              }
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white"
            />
          </label>

          <label>
            <span className="text-sm font-semibold">
              Custom tools
            </span>

            <input
              value={customToolsText}
              onChange={(event) =>
                onToolsChange(event.target.value)
              }
              placeholder="knowledge_search, ticketing, approvals"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white"
            />
          </label>

          <label>
            <span className="text-sm font-semibold">
              Custom connectors
            </span>

            <input
              value={customConnectorsText}
              onChange={(event) =>
                onConnectorsChange(
                  event.target.value,
                )
              }
              placeholder="salesforce, sap, workday"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white"
            />
          </label>
        </div>

        {errorMessage && (
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle
              size={17}
              className="mt-0.5 shrink-0"
            />

            <span>{errorMessage}</span>
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => void onSave()}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={16} />

            {saving
              ? "Saving..."
              : "Save custom agent"}
          </button>
        </div>
      </div>
    </div>
  );
}