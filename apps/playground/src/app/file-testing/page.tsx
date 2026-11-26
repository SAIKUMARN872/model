
import { useEffect, useRef, useState } from "react";
import {
  Upload,
  FileText,
  FileSpreadsheet,
  FileJson,
  File,
  X,
  Play,
  Loader2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Clock3,
  Files,
} from "lucide-react";

import {
  getAvailableModels,
  testPlayground,
} from "../../services/playgroundApi";

import "./file-testing.css";

type UploadedFile = {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  extension: string;
  data: string;
};

const MAX_FILE_SIZE = 20 * 1024 * 1024;

const ALLOWED_EXTENSIONS = [
  "pdf",
  "docx",
  "txt",
  "csv",
  "json",
];

function getExtension(name: string): string {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

function getFileIcon(extension: string) {
  if (extension === "csv") return FileSpreadsheet;
  if (extension === "json") return FileJson;
  if (["pdf", "docx", "txt"].includes(extension)) return FileText;
  return File;
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error(`Unable to read ${file.name}.`));
      }
    };

    reader.onerror = () => {
      reject(new Error(`Failed to read ${file.name}.`));
    };

    reader.readAsDataURL(file);
  });
}

function getResponseText(result: any): string {
  const output =
    result?.output ??
    result?.content ??
    result?.response ??
    result?.choices?.[0]?.message?.content ??
    result?.choices?.[0]?.text;

  if (typeof output === "string") return output;

  if (output !== undefined && output !== null) {
    return JSON.stringify(output, null, 2);
  }

  return "The API returned no readable response.";
}

export default function FileTestingPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState("");

  const [files, setFiles] = useState<UploadedFile[]>([]);

  const [prompt, setPrompt] = useState(
    "Summarize the uploaded documents and identify the most important information."
  );

  const [response, setResponse] = useState("");
  const [responseModel, setResponseModel] = useState("");
  const [latency, setLatency] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadModels() {
      try {
        const result: any = await getAvailableModels();

        const list = Array.isArray(result)
          ? result
          : result?.models ?? result?.data?.models ?? [];

        const names = list
          .map((item: any) =>
            typeof item === "string"
              ? item
              : item?.id ?? item?.name ?? item?.model
          )
          .filter(
            (item: unknown): item is string =>
              typeof item === "string" && item.length > 0
          );

        if (active) {
          setModels(names);

          if (names.length > 0) {
            setSelectedModel(names[0]);
          }
        }
      } catch {
        if (active) setModels([]);
      }
    }

    void loadModels();

    return () => {
      active = false;
    };
  }, []);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList) return;

    setError("");

    const incoming = Array.from(fileList);
    const accepted: UploadedFile[] = [];

    for (const file of incoming) {
      const extension = getExtension(file.name);

      if (!ALLOWED_EXTENSIONS.includes(extension)) {
        setError(
          `${file.name}: Unsupported format. Upload PDF, DOCX, TXT, CSV, or JSON files.`
        );
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError(
          `${file.name}: The file exceeds the 20 MB limit.`
        );
        continue;
      }

      try {
        const data = await readFileAsDataUrl(file);

        accepted.push({
          id: `${file.name}-${file.lastModified}-${Math.random()}`,
          file,
          name: file.name,
          size: file.size,
          type: file.type || "application/octet-stream",
          extension,
          data,
        });
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : `Could not read ${file.name}.`
        );
      }
    }

    setFiles((previous) => {
      const existingNames = new Set(
        previous.map((item) => `${item.name}-${item.size}`)
      );

      const uniqueIncoming = accepted.filter(
        (item) =>
          !existingNames.has(`${item.name}-${item.size}`)
      );

      return [...previous, ...uniqueIncoming];
    });
  }

  function removeFile(id: string) {
    setFiles((previous) =>
      previous.filter((item) => item.id !== id)
    );
  }

  function resetWorkspace() {
    setFiles([]);

    setPrompt(
      "Summarize the uploaded documents and identify the most important information."
    );

    setResponse("");
    setResponseModel("");
    setLatency(null);
    setError("");
    setCopied(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleTest() {
    if (files.length === 0) {
      setError("Upload at least one document before testing.");
      return;
    }

    if (!prompt.trim()) {
      setError("Enter a question or instruction for your documents.");
      return;
    }

    if (!selectedModel) {
      setError("Select an available model first.");
      return;
    }

    setLoading(true);
    setError("");
    setResponse("");
    setLatency(null);

    const startedAt = performance.now();

    try {
      const result: any = await testPlayground({
        input: prompt.trim(),
        model: selectedModel,
        attachments: files.map((item) => ({
          name: item.name,
          type: item.type,
          extension: item.extension,
          size: item.size,
          data: item.data,
        })),
        fileContext: {
          enabled: true,
          fileCount: files.length,
        },
      });

      setLatency(
        Math.round(performance.now() - startedAt)
      );

      setResponse(getResponseText(result));
      setResponseModel(result?.model ?? selectedModel);
    } catch (err: any) {
      setError(
        err?.message ??
          "File testing failed. Check the API connection and backend document-processing support."
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyResponse() {
    if (!response) return;

    try {
      await navigator.clipboard.writeText(response);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("Unable to copy the response.");
    }
  }

  const totalSize = files.reduce(
    (total, item) => total + item.size,
    0
  );

  return (
    <div className="ft-page">
      {/* Duplicate File Testing heading removed */}

      <div className="ft-summary">
        <div className="ft-summary-icon">
          <Files size={21} />
        </div>

        <div className="ft-summary-text">
          <strong>Document Testing Workspace</strong>
          <span>
            Test your documents with a selected AI model.
          </span>
        </div>

        <div className="ft-summary-stats">
          <span>{files.length} files</span>
          <span>{formatSize(totalSize)}</span>
        </div>
      </div>

      <div className="ft-layout">
        <section className="ft-panel">
          <div className="ft-panel-heading">
            <div>
              <h2>Upload Documents</h2>
              <p>Add files to your testing session.</p>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <Upload size={19} />

              <button
                type="button"
                className="ft-reset"
                onClick={resetWorkspace}
                disabled={loading}
              >
                <RotateCcw size={15} />
                Reset
              </button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt,.csv,.json"
            multiple
            hidden
            onChange={(event) => {
              void handleFiles(event.target.files);
              event.target.value = "";
            }}
          />

          <button
            type="button"
            className="ft-upload-area"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            <span className="ft-upload-icon">
              <Upload size={24} />
            </span>

            <strong>Click to upload documents</strong>
            <span>or browse files from your computer</span>

            <small>PDF · DOCX · TXT · CSV · JSON</small>
            <small>Maximum 20 MB per file</small>
          </button>

          <div className="ft-file-heading">
            <strong>Uploaded Files</strong>
            <span>{files.length} / unlimited</span>
          </div>

          {files.length === 0 ? (
            <div className="ft-no-files">
              <FileText size={25} />
              <strong>No documents uploaded</strong>
              <span>Your uploaded files will appear here.</span>
            </div>
          ) : (
            <div className="ft-file-list">
              {files.map((item) => {
                const Icon = getFileIcon(item.extension);

                return (
                  <div className="ft-file-item" key={item.id}>
                    <div className="ft-file-icon">
                      <Icon size={21} />
                    </div>

                    <div className="ft-file-info">
                      <strong title={item.name}>
                        {item.name}
                      </strong>

                      <small>
                        {item.extension.toUpperCase()} ·{" "}
                        {formatSize(item.size)}
                      </small>
                    </div>

                    <button
                      type="button"
                      className="ft-remove"
                      title="Remove document"
                      onClick={() => removeFile(item.id)}
                      disabled={loading}
                    >
                      <X size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="ft-prompt">
            <label htmlFor="ft-prompt">
              Question / Instructions
            </label>

            <textarea
              id="ft-prompt"
              rows={5}
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Ask a question about the uploaded documents..."
              disabled={loading}
            />

            <small>
              Example: Extract all important dates and summarize the key findings.
            </small>
          </div>

          <div className="ft-model">
            <label htmlFor="ft-model">AI Model</label>

            <select
              id="ft-model"
              value={selectedModel}
              onChange={(event) =>
                setSelectedModel(event.target.value)
              }
              disabled={loading || models.length === 0}
            >
              {models.length === 0 && (
                <option value="">No models available</option>
              )}

              {models.map((model) => (
                <option value={model} key={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="ft-run"
            onClick={handleTest}
            disabled={loading || models.length === 0}
          >
            {loading ? (
              <>
                <Loader2 size={17} className="ft-spin" />
                Processing Documents...
              </>
            ) : (
              <>
                <Play size={17} />
                Run File Test
              </>
            )}
          </button>

          {error && (
            <div className="ft-error" role="alert">
              {error}
            </div>
          )}
        </section>

        <section className="ft-panel ft-output-panel">
          <div className="ft-panel-heading">
            <div>
              <h2>Model Response</h2>
              <p>Review the actual response from the API.</p>
            </div>

            <Sparkles size={19} />
          </div>

          {!response && !loading && (
            <div className="ft-empty">
              <div className="ft-empty-icon">
                <FileText size={28} />
              </div>

              <h3>Ready to analyze your files</h3>

              <p>
                Upload your documents, enter a question,
                and run the test. The model response will
                appear in this area.
              </p>
            </div>
          )}

          {loading && (
            <div className="ft-loading">
              <Loader2 size={29} className="ft-spin" />
              <strong>Analyzing your documents</strong>
              <span>Waiting for the model response...</span>
            </div>
          )}

          {response && (
            <div className="ft-result">
              <div className="ft-result-toolbar">
                <div>
                  <span className="ft-success-dot" />
                  <strong>Response received</strong>
                </div>

                <button
                  type="button"
                  onClick={copyResponse}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              <pre className="ft-response-text">
                {response}
              </pre>

              <div className="ft-metrics">
                <div>
                  <small>Model</small>
                  <strong>
                    {responseModel || selectedModel}
                  </strong>
                </div>

                <div>
                  <small>Latency</small>
                  <strong>
                    {latency !== null ? `${latency} ms` : "—"}
                  </strong>
                </div>

                <div>
                  <small>Files analyzed</small>
                  <strong>{files.length}</strong>
                </div>
              </div>
            </div>
          )}

          <div className="ft-note">
            <Clock3 size={15} />
            <span>
              File understanding depends on backend document
              extraction, text processing, and provider support.
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}
