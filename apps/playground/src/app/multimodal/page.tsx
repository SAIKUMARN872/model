
import { useEffect, useRef, useState } from "react";
import {
  Image,
  AudioLines,
  Video,
  Upload,
  X,
  Play,
  Loader2,
  Copy,
  Check,
  RotateCcw,
  FileAudio,
  FileVideo,
  Sparkles,
} from "lucide-react";

import {
  getAvailableModels,
  testPlayground,
} from "../../services/playgroundApi";

import "./multimodal.css";

type MediaType = "image" | "audio" | "video";

type MediaFile = {
  id: string;
  file: File;
  type: MediaType;
  preview: string;
  data: string;
};

const MAX_FILE_SIZE = 50 * 1024 * 1024;

const ACCEPTED_TYPES = [
  "image/*",
  "audio/*",
  "video/*",
];

function getMediaType(file: File): MediaType | null {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("audio/")) return "audio";
  if (file.type.startsWith("video/")) return "video";
  return null;
}

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Unable to read the selected file."));
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read the selected file."));
    };

    reader.readAsDataURL(file);
  });
}

function getResponseText(result: any): string {
  return (
    result?.output ??
    result?.content ??
    result?.response ??
    result?.choices?.[0]?.message?.content ??
    result?.choices?.[0]?.text ??
    (typeof result?.data === "string" ? result.data : null) ??
    "The API returned no readable response."
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function MultimodalPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [modelsLoading, setModelsLoading] = useState(true);

  const [mediaType, setMediaType] = useState<MediaType>("image");
  const [files, setFiles] = useState<MediaFile[]>([]);

  const [prompt, setPrompt] = useState(
    "Analyze the uploaded media and explain its contents."
  );

  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [latency, setLatency] = useState<number | null>(null);
  const [responseModel, setResponseModel] = useState("");

  useEffect(() => {
    let active = true;

    async function loadModels() {
      setModelsLoading(true);

      try {
        const result: any = await getAvailableModels();

        const modelList = Array.isArray(result)
          ? result
          : result?.models ??
            result?.data?.models ??
            [];

        const names = modelList
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
          setSelectedModel((current) =>
            current && names.includes(current)
              ? current
              : names[0] ?? ""
          );

          if (names.length === 0) {
            setError("No models are currently available.");
          }
        }
      } catch (err: any) {
        if (active) {
          setModels([]);
          setSelectedModel("");
          setError(
            err?.message ?? "Unable to load available models. Check your API connection."
          );
        }
      } finally {
        if (active) {
          setModelsLoading(false);
        }
      }
    }

    void loadModels();

    return () => {
      active = false;
    };
  }, []);

  const filteredFiles = files.filter(
    (item) => item.type === mediaType
  );

  async function handleFiles(selectedFiles: FileList | null) {
    if (!selectedFiles) return;

    setError("");

    const newFiles: MediaFile[] = [];

    for (const file of Array.from(selectedFiles)) {
      const type = getMediaType(file);

      if (!type) {
        setError(
          `${file.name}: Unsupported file type. Select an image, audio, or video file.`
        );
        continue;
      }

      if (type !== mediaType) {
        setError(
          `${file.name}: Select the matching media tab before uploading this file.`
        );
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError(
          `${file.name}: File exceeds the 50 MB upload limit.`
        );
        continue;
      }

      try {
        const data = await readFile(file);

        newFiles.push({
          id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
          file,
          type,
          preview: data,
          data,
        });
      } catch {
        setError(`Could not read ${file.name}.`);
      }
    }

    setFiles((previous) => [...previous, ...newFiles]);
  }

  function removeFile(id: string) {
    setFiles((previous) =>
      previous.filter((item) => item.id !== id)
    );
  }

  function clearWorkspace() {
    setFiles([]);
    setPrompt(
      "Analyze the uploaded media and explain its contents."
    );
    setResponse("");
    setError("");
    setLatency(null);
    setResponseModel("");
    setCopied(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleTest() {
    if (modelsLoading) {
      setError("Please wait while available models are loading.");
      return;
    }

    if (!prompt.trim()) {
      setError("Enter a prompt before testing.");
      return;
    }

    if (filteredFiles.length === 0) {
      setError(
        `Upload at least one ${mediaType} file before testing.`
      );
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
    setResponseModel("");

    const startedAt = performance.now();

    try {
      const result: any = await testPlayground({
        input: prompt.trim(),
        model: selectedModel,
        attachments: filteredFiles.map((item) => ({
          name: item.file.name,
          type: item.file.type,
          size: item.file.size,
          data: item.data,
        })),
        mediaType,
      });

      setLatency(
        Math.round(performance.now() - startedAt)
      );

      setResponse(getResponseText(result));
      setResponseModel(result?.model ?? selectedModel);
    } catch (err: any) {
      setError(
        err?.message ??
          "The multimodal request failed. Check your API connection and backend media support."
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

  const mediaTabs = [
    {
      id: "image" as MediaType,
      label: "Image",
      description: "Visual understanding",
      icon: Image,
    },
    {
      id: "audio" as MediaType,
      label: "Audio",
      description: "Speech and sound",
      icon: AudioLines,
    },
    {
      id: "video" as MediaType,
      label: "Video",
      description: "Video understanding",
      icon: Video,
    },
  ];

  return (
    <div className="mm-page">
      <div className="mm-tabs">
        {mediaTabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              className={`mm-tab ${
                mediaType === tab.id ? "active" : ""
              }`}
              onClick={() => {
                setMediaType(tab.id);
                setError("");
                setResponse("");
                setLatency(null);
                setResponseModel("");
              }}
            >
              <Icon size={19} />

              <span>
                <strong>{tab.label}</strong>
                <small>{tab.description}</small>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mm-workspace">
        <section className="mm-panel mm-input-panel">
          <div className="mm-panel-heading">
            <div>
              <h2>Media Input</h2>
              <p>Upload files for model testing.</p>
            </div>

            <div className="mm-input-actions">
              <span className="mm-file-count">
                {filteredFiles.length} files
              </span>

              <button
                type="button"
                className="mm-reset-button"
                onClick={clearWorkspace}
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
            accept={ACCEPTED_TYPES.join(",")}
            multiple
            hidden
            onChange={(event) => {
              void handleFiles(event.target.files);
              event.target.value = "";
            }}
          />

          <button
            type="button"
            className="mm-upload-area"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            <span className="mm-upload-icon">
              <Upload size={24} />
            </span>

            <strong>Upload {mediaType} files</strong>

            <span>Click to browse your device</span>

            <small>Maximum file size: 50 MB per file</small>
          </button>

          {filteredFiles.length > 0 && (
            <div className="mm-file-list">
              <div className="mm-list-title">
                Uploaded files
              </div>

              {filteredFiles.map((item) => (
                <div className="mm-file-item" key={item.id}>
                  {item.type === "image" && (
                    <img
                      className="mm-image-preview"
                      src={item.preview}
                      alt={item.file.name}
                    />
                  )}

                  {item.type === "audio" && (
                    <div className="mm-file-icon">
                      <FileAudio size={21} />
                    </div>
                  )}

                  {item.type === "video" && (
                    <div className="mm-file-icon">
                      <FileVideo size={21} />
                    </div>
                  )}

                  <div className="mm-file-info">
                    <strong>{item.file.name}</strong>
                    <small>{formatSize(item.file.size)}</small>
                  </div>

                  <button
                    type="button"
                    className="mm-icon-button"
                    title="Remove file"
                    onClick={() => removeFile(item.id)}
                    disabled={loading}
                  >
                    <X size={17} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mm-prompt-section">
            <label htmlFor="mm-prompt">
              Instructions / Prompt
            </label>

            <textarea
              id="mm-prompt"
              value={prompt}
              onChange={(event) =>
                setPrompt(event.target.value)
              }
              placeholder="Ask the model something about your uploaded media..."
              rows={5}
              disabled={loading}
            />

            <div className="mm-prompt-hint">
              Be specific about what you want the model to analyze.
            </div>
          </div>

          <div className="mm-model-section">
            <label htmlFor="mm-model">AI Model</label>

            <select
              id="mm-model"
              value={selectedModel}
              onChange={(event) =>
                setSelectedModel(event.target.value)
              }
              disabled={loading || modelsLoading || models.length === 0}
            >
              {modelsLoading && (
                <option value="">Loading models...</option>
              )}

              {!modelsLoading && models.length === 0 && (
                <option value="">No models available</option>
              )}

              {models.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="mm-run-button"
            onClick={handleTest}
            disabled={
              loading ||
              modelsLoading ||
              models.length === 0 ||
              !selectedModel
            }
          >
            {loading || modelsLoading ? (
              <>
                <Loader2 size={17} className="mm-spin" />
                {modelsLoading ? "Loading Models..." : "Testing..."}
              </>
            ) : (
              <>
                <Play size={17} />
                Run Multimodal Test
              </>
            )}
          </button>

          {error && (
            <div className="mm-error" role="alert">
              {error}
            </div>
          )}
        </section>

        <section className="mm-panel mm-output-panel">
          <div className="mm-panel-heading">
            <div>
              <h2>Model Response</h2>
              <p>The actual response returned by the API.</p>
            </div>

            <span className="mm-response-status">
              {loading
                ? "Running"
                : response
                  ? "Completed"
                  : "Ready"}
            </span>
          </div>

          {!response && !loading && (
            <div className="mm-empty-state">
              <div className="mm-empty-icon">
                <Sparkles size={27} />
              </div>

              <h3>Ready to test your media</h3>

              <p>
                Upload an image, audio, or video file,
                enter your instructions, and run the test.
                Your model response will appear here.
              </p>
            </div>
          )}

          {loading && (
            <div className="mm-loading-state">
              <Loader2 size={28} className="mm-spin" />

              <strong>Processing your request</strong>

              <span>
                Waiting for the model response...
              </span>
            </div>
          )}

          {response && (
            <div className="mm-result">
              <div className="mm-result-toolbar">
                <div className="mm-result-label">
                  <span className="mm-success-dot" />
                  Response
                </div>

                <button
                  type="button"
                  className="mm-copy-button"
                  onClick={copyResponse}
                >
                  {copied ? (
                    <Check size={15} />
                  ) : (
                    <Copy size={15} />
                  )}

                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              <pre className="mm-response-text">
                {response}
              </pre>

              <div className="mm-metrics">
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
                  <small>Media files</small>
                  <strong>{filteredFiles.length}</strong>
                </div>
              </div>
            </div>
          )}

          <div className="mm-capability-note">
            <Sparkles size={16} />

            <span>
              Results depend on the selected model and
              the multimodal capabilities enabled by
              your backend provider.
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}
