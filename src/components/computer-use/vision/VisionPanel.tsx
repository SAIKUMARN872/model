import {
  Camera,
  ScanSearch,
  FileText,
  Image as ImageIcon,
} from "lucide-react";

import Section from "../shared/Section";
import ActionButton from "../shared/ActionButton";

type LogType = "success" | "info" | "warning" | "error";

type VisionPanelProps = {
  screenshot: () => void;
  detectUI: () => void;
  addLog: (message: string, type?: LogType) => void;
};

export default function VisionPanel({
  screenshot,
  detectUI,
  addLog,
}: VisionPanelProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <div className="xl:col-span-2">
        <Section
          title="Screen & Vision"
          description="Understand visual computer state before taking actions."
        >
          <div className="mb-4 flex flex-wrap gap-2">
            <ActionButton
              icon={Camera}
              label="Screenshot"
              onClick={screenshot}
            />

            <ActionButton
              icon={ScanSearch}
              label="Detect UI Elements"
              onClick={detectUI}
            />

            <ActionButton
              icon={FileText}
              label="OCR Text"
              onClick={() => addLog("OCR completed", "success")}
            />

            <ActionButton
              icon={ImageIcon}
              label="Image Understanding"
              onClick={() =>
                addLog("Image understanding completed", "success")
              }
            />
          </div>

          <div className="relative h-[390px] overflow-hidden rounded-xl border border-slate-300 bg-slate-900">
            <div className="absolute left-0 right-0 top-0 flex h-9 items-center gap-2 border-b border-slate-700 bg-slate-800 px-4">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400" />

              <span className="ml-3 text-xs text-slate-400">
                enterprise-app.local
              </span>
            </div>

            <div className="flex h-full items-center justify-center pt-9">
              <div className="w-[80%] rounded-xl bg-white p-6">
                <div className="mb-5 h-4 w-48 rounded bg-slate-200" />

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="h-24 rounded-lg bg-slate-100" />
                  <div className="h-24 rounded-lg bg-slate-100" />
                  <div className="h-24 rounded-lg bg-slate-100" />
                </div>

                <div className="mt-5 h-28 rounded-lg bg-slate-100" />
              </div>
            </div>
          </div>
        </Section>
      </div>

      <Section
        title="Vision State"
        description="Detected visual state."
      >
        <InfoRow label="Screen" value="1920 × 1080" />
        <InfoRow label="UI Elements" value="18 detected" />
        <InfoRow label="Text Blocks" value="42 detected" />
        <InfoRow label="Confidence" value="98.1%" />
        <InfoRow label="Visual State" value="Stable" />
      </Section>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-3 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}