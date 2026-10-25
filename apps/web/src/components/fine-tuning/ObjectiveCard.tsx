"use client";

import { Info, Target } from "lucide-react";

type ObjectiveCardProps = {
  objective: string;
  autopilotRunning: boolean;
  onObjectiveChange: (value: string) => void;
};

export default function ObjectiveCard({
  objective,
  autopilotRunning,
  onObjectiveChange,
}: ObjectiveCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-purple-600">
          <Target size={21} />
        </div>

        <div>
          <h3 className="font-semibold">
            What should the model become better at?
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Describe the business outcome in normal language.
          </p>
        </div>
      </div>

      <textarea
        value={objective}
        onChange={(event) =>
          onObjectiveChange(event.target.value)
        }
        disabled={autopilotRunning}
        placeholder="Example: Make the model better at answering customer support questions using our company's support conversations."
        className="mt-5 min-h-[130px] w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
      />

      <div className="mt-4 flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 p-3.5 text-xs leading-5 text-blue-700">
        <Info
          size={15}
          className="mt-0.5 shrink-0"
        />

        <span>
          ModelNow uses this objective together with the
          dataset to determine the appropriate training
          strategy.
        </span>
      </div>
    </div>
  );
}