import {
  Cpu,
  MemoryStick,
  Monitor,
  Power,
  RefreshCw,
  RotateCcw,
  Server,
} from "lucide-react";

import Section from "../shared/Section";
import ActionButton from "../shared/ActionButton";

type ManagerPanelProps = {
  running: boolean;
  start: () => void;
  stop: () => void;
  restart: () => void;
  reset: () => void;
};

type ResourceProps = {
  label: string;
  value: string;
  icon: typeof Cpu;
};

function Resource({
  label,
  value,
  icon: Icon,
}: ResourceProps) {
  return (
    <div className="mb-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <Icon size={15} />
          {label}
        </div>

        <span className="text-xs font-semibold">{value}</span>
      </div>

      <div className="h-2 rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-slate-900"
          style={{ width: value }}
        />
      </div>
    </div>
  );
}

export default function ManagerPanel({
  running,
  start,
  stop,
  restart,
  reset,
}: ManagerPanelProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <div className="xl:col-span-2">
        <Section
          title="Virtual Computer"
          description="Create and manage isolated computer environments."
        >
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-xl ${
                    running
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  <Monitor size={28} />
                </div>

                <div>
                  <p className="font-semibold">
                    ModelNow Virtual Computer
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Ubuntu Enterprise Desktop · Session #1284
                  </p>

                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        running ? "bg-emerald-500" : "bg-red-500"
                      }`}
                    />

                    {running ? "Running" : "Stopped"}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {!running ? (
                  <ActionButton
                    icon={Power}
                    label="Start"
                    onClick={start}
                  />
                ) : (
                  <ActionButton
                    icon={Power}
                    label="Stop"
                    onClick={stop}
                    danger
                  />
                )}

                <ActionButton
                  icon={RefreshCw}
                  label="Restart"
                  onClick={restart}
                />

                <ActionButton
                  icon={RotateCcw}
                  label="Reset Environment"
                  onClick={reset}
                />
              </div>
            </div>
          </div>
        </Section>
      </div>

      <Section
        title="Resource Monitoring"
        description="Current virtual computer resources."
      >
        <Resource
          label="CPU"
          value="38%"
          icon={Cpu}
        />

        <Resource
          label="Memory"
          value="61%"
          icon={MemoryStick}
        />

        <Resource
          label="Storage"
          value="42%"
          icon={Server}
        />
      </Section>
    </div>
  );
}