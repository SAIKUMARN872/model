"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";

type ModalProps = {
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
};

export default function Modal({
  title,
  description,
  onClose,
  children,
}: ModalProps) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#0b101b] shadow-2xl">
        <div className="flex items-start justify-between border-b border-white/10 p-5">
          <div>
            <h2 className="font-semibold text-white">
              {title}
            </h2>

            {description && (
              <p className="mt-1 text-xs text-gray-500">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-white/5 hover:text-white"
          >
            <X size={17} />
          </button>
        </div>

        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  );
}