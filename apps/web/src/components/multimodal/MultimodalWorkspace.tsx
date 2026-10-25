"use client";

import type { ChangeEvent } from "react";
import { RefreshCw } from "lucide-react";

import UploadArea from "./UploadArea";
import ResultPanel from "./ResultPanel";

import type { MediaCategory } from "./CategoryTabs";
import type { MediaTool } from "./ToolSidebar";

type MultimodalWorkspaceProps = {
  activeCategory: MediaCategory;
  currentTool?: MediaTool;
  prompt: string;
  uploadedFile: File | null;
  generating: boolean;
  generated: boolean;
  result: string;
  onPromptChange: (value: string) => void;
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
  onGenerate: () => void;
  onReset: () => void;
};

export default function MultimodalWorkspace({
  activeCategory,
  currentTool,
  prompt,
  uploadedFile,
  generating,
  generated,
  result,
  onPromptChange,
  onUpload,
  onRemoveFile,
  onGenerate,
  onReset,
}: MultimodalWorkspaceProps) {
  const CurrentToolIcon = currentTool?.icon;

  return (
    <div className="min-w-0">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-5 md:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {CurrentToolIcon && (
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-700">
                  <CurrentToolIcon size={20} />
                </div>
              )}

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  {activeCategory}
                </p>

                <h3 className="font-semibold text-slate-900">
                  {currentTool?.name}
                </h3>

                <p className="mt-0.5 text-xs text-slate-500">
                  {currentTool?.description}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onReset}
              className="flex h-9 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-medium text-slate-500 hover:bg-slate-50"
            >
              <RefreshCw size={14} />
              Reset
            </button>
          </div>
        </div>

        <UploadArea
          prompt={prompt}
          activeCategory={activeCategory}
          uploadedFile={uploadedFile}
          generating={generating}
          onPromptChange={onPromptChange}
          onUpload={onUpload}
          onRemoveFile={onRemoveFile}
          onGenerate={onGenerate}
        />

        <ResultPanel
          generated={generated}
          activeCategory={activeCategory}
          result={result}
        />
      </div>
    </div>
  );
}