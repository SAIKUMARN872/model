import type { ReactNode } from "react";
import { X } from "lucide-react";

type ModalProps = {
  title: string;
  children: ReactNode;
  onClose: () => void;
};

export default function Modal({
  title,
  children,
  onClose,
}: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <h3 className="font-semibold">{title}</h3>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}