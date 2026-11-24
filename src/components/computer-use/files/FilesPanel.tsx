import {
  CheckCircle2,
  Copy,
  Download,
  FileText,
  FolderOpen,
  Move,
  Pencil,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";

import Section from "../shared/Section";
import ActionButton from "../shared/ActionButton";

type FilesPanelProps = {
  selectedFile: string;
  setSelectedFile: (value: string) => void;
  runAction: (action: string) => void;
  openModal: () => void;
};

export default function FilesPanel({
  selectedFile,
  setSelectedFile,
  runAction,
  openModal,
}: FilesPanelProps) {
  const files = [
    "Quarterly_Report.xlsx",
    "Customer_Data.csv",
    "Invoice_2026.pdf",
    "Project_Notes.docx",
  ];

  return (
    <Section
      title="File Operations"
      description="Manage files inside the computer environment."
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <ActionButton
          icon={Upload}
          label="Upload"
          onClick={openModal}
        />

        <ActionButton
          icon={Download}
          label="Download"
          onClick={() => runAction("Download")}
        />

        <ActionButton
          icon={Plus}
          label="Create"
          onClick={() => runAction("Create file")}
        />
      </div>

      <div className="space-y-2">
        {files.map((file) => {
          const active = selectedFile === file;

          return (
            <button
              key={file}
              onClick={() => setSelectedFile(file)}
              className={`flex w-full items-center justify-between rounded-xl border p-4 text-left ${
                active
                  ? "border-slate-400 bg-slate-50"
                  : "border-slate-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText size={18} />

                <div>
                  <p className="text-sm font-medium">{file}</p>

                  <p className="text-xs text-slate-500">
                    Enterprise document
                  </p>
                </div>
              </div>

              {active && (
                <CheckCircle2
                  size={18}
                  className="text-emerald-600"
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {[
          ["Open", FolderOpen],
          ["Rename", Pencil],
          ["Copy", Copy],
          ["Move", Move],
          ["Delete", Trash2],
        ].map(([label, Icon]: any) => (
          <ActionButton
            key={label}
            icon={Icon}
            label={label}
            onClick={() => runAction(`${label} ${selectedFile}`)}
            danger={label === "Delete"}
          />
        ))}
      </div>
    </Section>
  );
}