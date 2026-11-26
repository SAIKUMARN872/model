"use client";

import {
  CheckCircle2,
  Download,
  Image as ImageIcon,
  Play,
  Volume2,
  Mic,
} from "lucide-react";

type ResultPanelProps = {
  generated: boolean;
  activeCategory: string;
  result: string;
};

export default function ResultPanel({
  generated,
  activeCategory,
  result,
}: ResultPanelProps) {
  if (!generated) {
    return null;
  }

  return (
    <div className="mx-5 mb-5 overflow-hidden rounded-2xl border border-slate-200 md:mx-6">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <CheckCircle2
            size={15}
            className="text-emerald-600"
          />

          <span className="text-xs font-semibold text-slate-700">
            Processing result
          </span>
        </div>

        <button
          type="button"
          className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-slate-900"
        >
          <Download size={13} />
          Export
        </button>
      </div>

      <div className="p-5">
        {(activeCategory === "Image" ||
          activeCategory === "Cross-modal") && (
          <div className="mb-4 flex aspect-video items-center justify-center rounded-xl bg-slate-100">
            <div className="text-center">
              <ImageIcon
                size={32}
                className="mx-auto text-slate-400"
              />

              <p className="mt-2 text-xs text-slate-500">
                Visual processing output
              </p>
            </div>
          </div>
        )}

        {activeCategory === "Video" && (
          <div className="mb-4 flex aspect-video items-center justify-center rounded-xl bg-slate-100">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                <Play
                  size={19}
                  className="ml-0.5 text-slate-700"
                />
              </div>

              <p className="mt-3 text-xs text-slate-500">
                Video processing output
              </p>
            </div>
          </div>
        )}

        {activeCategory === "Audio" && (
          <div className="mb-4 flex items-center gap-4 rounded-xl bg-slate-50 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
              <Volume2
                size={20}
                className="text-slate-600"
              />
            </div>

            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-700">
                Audio processing output
              </p>

              <div className="mt-3 flex items-center gap-1">
                {Array.from({ length: 35 }).map((_, index) => (
                  <span
                    key={index}
                    className="w-1 rounded-full bg-slate-300"
                    style={{
                      height: `${8 + ((index * 9) % 22)}px`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeCategory === "Voice" && (
          <div className="mb-4 flex items-center gap-4 rounded-xl bg-slate-50 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
              <Mic
                size={20}
                className="text-slate-600"
              />
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-700">
                Voice processing output
              </p>

              <p className="mt-1 text-[11px] text-slate-400">
                AI voice response ready
              </p>
            </div>
          </div>
        )}

        <p className="text-sm leading-7 text-slate-600">
          {result}
        </p>
      </div>
    </div>
  );
}