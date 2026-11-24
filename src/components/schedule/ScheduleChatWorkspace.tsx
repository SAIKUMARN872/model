"use client";

import StandaloneChatComposer from "../StandaloneChatComposer";

type ScheduleChatWorkspaceProps = {
  onBack: () => void;
  recommendationTitle?: string;
  recommendationDescription?: string;
};

export default function ScheduleChatWorkspace({
  onBack,
  recommendationTitle,
  recommendationDescription,
}: ScheduleChatWorkspaceProps) {
  return (
    <section className="flex min-w-0 flex-1 flex-col bg-white">
      <header className="shrink-0 border-b border-gray-200 px-6 py-4">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
          >
            &larr; Back to Schedule
          </button>

          <div className="h-5 w-px bg-gray-200" />

          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-gray-900">
              {recommendationTitle || "ModelNow Chat"}
            </h2>

            <p className="truncate text-xs text-gray-500">
              {recommendationDescription ||
                "Describe the task you want to schedule."}
            </p>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
      <StandaloneChatComposer />
      </div>
    </section>
  );
}