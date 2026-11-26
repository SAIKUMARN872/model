import { useRef, useState } from "react";
import type { ChangeEvent, DragEvent, CSSProperties } from "react";
import {
  Upload,
  FileText,
  FileCheck2,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface DocumentUploaderProps {
  onUpload?: (file: File) => void | Promise<void>;
}

const acceptedExtensions = [".pdf", ".doc", ".docx", ".txt"];

export default function DocumentUploader({
  onUpload,
}: DocumentUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error" | ""
  >("");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const containerStyle: CSSProperties = {
    width: "100%",
    padding: "24px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    boxSizing: "border-box",
    color: "#0f172a",
  };

  const isValidFile = (selectedFile: File): boolean => {
    const extension = selectedFile.name
      .substring(selectedFile.name.lastIndexOf("."))
      .toLowerCase();

    return acceptedExtensions.includes(extension);
  };

  const selectFile = (selectedFile?: File): void => {
    if (!selectedFile) return;

    if (!isValidFile(selectedFile)) {
      setFile(null);
      setMessage("Unsupported file format. Please select PDF, DOC, DOCX, or TXT.");
      setMessageType("error");

      if (inputRef.current) {
        inputRef.current.value = "";
      }

      return;
    }

    setFile(selectedFile);
    setMessage("");
    setMessageType("");
  };

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    selectFile(event.target.files?.[0]);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (
    event: DragEvent<HTMLDivElement>
  ): void => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    setIsDragging(false);
    selectFile(event.dataTransfer.files?.[0]);
  };

  const handleRemoveFile = (): void => {
    setFile(null);
    setMessage("");
    setMessageType("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleUpload = async (): Promise<void> => {
    if (!file) {
      setMessage("Please select a document first.");
      setMessageType("error");
      return;
    }

    if (!onUpload) {
      setMessage("Upload handler is not configured.");
      setMessageType("error");
      return;
    }

    try {
      setIsUploading(true);
      setMessage("");
      setMessageType("");

      await onUpload(file);

      setMessage("Document uploaded successfully.");
      setMessageType("success");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Document upload failed. Please try again."
      );
      setMessageType("error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section style={containerStyle}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "8px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#eff6ff",
            borderRadius: "10px",
            color: "#2563eb",
          }}
        >
          <FileText size={21} />
        </div>

        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            Upload Document
          </h2>

          <p
            style={{
              margin: "4px 0 0",
              fontSize: "13px",
              color: "#64748b",
            }}
          >
            Add documents to your knowledge base.
          </p>
        </div>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        style={{
          marginTop: "22px",
          padding: "30px 20px",
          border: `1.5px dashed ${
            isDragging ? "#2563eb" : "#cbd5e1"
          }`,
          borderRadius: "12px",
          background: isDragging ? "#eff6ff" : "#f8fafc",
          textAlign: "center",
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            margin: "0 auto 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            color: "#2563eb",
          }}
        >
          <Upload size={23} />
        </div>

        <p
          style={{
            margin: "0 0 6px",
            color: "#1e293b",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          Drop your document here or{" "}
          <span style={{ color: "#2563eb" }}>browse files</span>
        </p>

        <p
          style={{
            margin: 0,
            color: "#94a3b8",
            fontSize: "12px",
          }}
        >
          Supported formats: PDF, DOC, DOCX, TXT
        </p>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileChange}
          aria-label="Choose a document"
          style={{ display: "none" }}
        />
      </div>

      {file && (
        <div
          style={{
            marginTop: "16px",
            padding: "13px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
          }}
        >
          <FileCheck2
            size={22}
            color="#2563eb"
          />

          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                fontWeight: 600,
                color: "#1e293b",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {file.name}
            </p>

            <p
              style={{
                margin: "4px 0 0",
                fontSize: "11px",
                color: "#64748b",
              }}
            >
              {(file.size / 1024).toFixed(1)} KB
            </p>
          </div>

          <button
            type="button"
            onClick={handleRemoveFile}
            disabled={isUploading}
            aria-label="Remove selected document"
            style={{
              border: "none",
              background: "transparent",
              color: "#64748b",
              cursor: isUploading ? "not-allowed" : "pointer",
              padding: "5px",
            }}
          >
            <X size={17} />
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={handleUpload}
        disabled={!file || isUploading}
        style={{
          width: "100%",
          marginTop: "18px",
          padding: "12px 18px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "9px",
          border: "none",
          borderRadius: "9px",
          background:
            file && !isUploading ? "#2563eb" : "#94a3b8",
          color: "#ffffff",
          fontSize: "13px",
          fontWeight: 600,
          cursor:
            file && !isUploading ? "pointer" : "not-allowed",
        }}
      >
        <Upload size={16} />
        {isUploading ? "Uploading..." : "Upload Document"}
      </button>

      {message && (
        <div
          role="status"
          style={{
            marginTop: "14px",
            display: "flex",
            alignItems: "flex-start",
            gap: "8px",
            color: messageType === "success" ? "#15803d" : "#dc2626",
            fontSize: "13px",
          }}
        >
          {messageType === "success" ? (
            <CheckCircle2 size={16} />
          ) : (
            <AlertCircle size={16} />
          )}

          <span>{message}</span>
        </div>
      )}
    </section>
  );
}