"use client";

import type { ChangeEvent } from "react";
import {
  Upload,
  FileText,
  X,
  Loader2,
  Send,
} from "lucide-react";

type UploadAreaProps = {
  prompt: string;
  uploadedFile: File | null;
  generating: boolean;
  activeCategory: string;
  onPromptChange: (value: string) => void;
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
  onGenerate: () => void;
};

export default function UploadArea({
  prompt,
  uploadedFile,
  generating,
  activeCategory,
  onPromptChange,
  onUpload,
  onRemoveFile,
  onGenerate,
}: UploadAreaProps) {
  const disabled =
    generating ||
    (!prompt.trim() && !uploadedFile);

  return (
    <div className="p-5 md:p-6">

      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
        Multimodal instruction
      </label>

      <div className="rounded-2xl border border-slate-200 bg-slate-50/50 focus-within:border-slate-400 focus-within:bg-white">

        <textarea
          value={prompt}
          onChange={(event) =>
            onPromptChange(event.target.value)
          }
          placeholder={`Describe what you want ModelNow to do with ${activeCategory.toLowerCase()}...`}
          rows={6}
          className="w-full resize-none bg-transparent px-4 py-4 text-sm leading-6 outline-none placeholder:text-slate-400"
        />

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-3 py-3">

          <div className="flex flex-wrap items-center gap-2">

            <label className="flex h-9 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 hover:bg-slate-50">

              <Upload size={14} />

              Upload media

              <input
                type="file"
                className="hidden"
                accept="image/*,audio/*,video/*,.pdf,.txt,.doc,.docx"
                onChange={onUpload}
              />

            </label>

            {uploadedFile && (
              <div className="flex max-w-[260px] items-center gap-2 rounded-xl bg-slate-100 px-3 py-2">

                <FileText
                  size={13}
                  className="shrink-0 text-slate-500"
                />

                <span className="truncate text-[11px] text-slate-600">
                  {uploadedFile.name}
                </span>

                <button
                  type="button"
                  onClick={onRemoveFile}
                  className="shrink-0 text-slate-400 hover:text-slate-700"
                  aria-label="Remove uploaded file"
                >
                  <X size={13} />
                </button>

              </div>
            )}

          </div>

          <button
            type="button"
            onClick={onGenerate}
            disabled={disabled}
            className={`flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-semibold transition ${
              disabled
                ? "bg-slate-100 text-slate-400"
                : "bg-slate-900 text-white hover:bg-slate-800"
            }`}
          >

            {generating ? (
              <>
                <Loader2
                  size={14}
                  className="animate-spin"
                />
                Processing
              </>
            ) : (
              <>
                <Send size={14} />
                Run
              </>
            )}

          </button>

        </div>

      </div>

    </div>
  );
}