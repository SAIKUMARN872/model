
import { useRef, useState } from "react";
import {
  Brain,
  Upload,
  FileText,
  Settings2,
  Play,
  Clock3,
  CheckCircle2,
  AlertCircle,
  Database,
  Trash2,
} from "lucide-react";

import "./fine-tuning.css";

export default function FineTuningPage() {
  const fileRef = useRef<HTMLInputElement>(null);

  const [model, setModel] = useState(
    "ModelNow Foundation 8B"
  );

  const [jobName, setJobName] = useState(
    "My fine-tuning job"
  );

  const [epochs, setEpochs] = useState("3");
  const [learningRate, setLearningRate] = useState("0.0002");
  const [batchSize, setBatchSize] = useState("4");

  const [dataset, setDataset] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Submit training configuration

  const submitJob = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!dataset) {
      window.alert("Please upload a training dataset first.");
      return;
    }

    if (!jobName.trim()) {
      window.alert("Please enter a training job name.");
      return;
    }

    setSubmitted(true);
  };

  // Handle dataset upload

  const handleDatasetUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0] || null;

    if (!file) return;

    const validExtensions = [".jsonl", ".json", ".csv"];

    const isValid = validExtensions.some((extension) =>
      file.name.toLowerCase().endsWith(extension)
    );

    if (!isValid) {
      window.alert("Please upload a JSONL, JSON or CSV file.");
      event.target.value = "";
      return;
    }

    setDataset(file);
    setSubmitted(false);
  };

  // Remove dataset

  const removeDataset = () => {
    setDataset(null);
    setSubmitted(false);

    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  return (
    <div className="wt-page">

      {/* Training Statistics */}

      <div className="wt-stats">

        <div className="wt-stat">
          <span>Training jobs</span>
          <strong>{submitted ? "1" : "0"}</strong>
          <Brain />
        </div>

        <div className="wt-stat">
          <span>Datasets uploaded</span>
          <strong>{dataset ? "1" : "0"}</strong>
          <Database />
        </div>

        <div className="wt-stat">
          <span>Current status</span>
          <strong className="wt-stat-small">
            {submitted ? "Draft" : "Idle"}
          </strong>
          <Clock3 />
        </div>

      </div>

      <form onSubmit={submitJob}>

        <div className="wt-two-column">

          {/* Training Configuration */}

          <section className="wt-panel">

            <div className="wt-panel-heading">
              <div>
                <h2>
                  <Brain size={18} />
                  Training configuration
                </h2>

                <p>
                  Choose the model and configure your training job.
                </p>
              </div>
            </div>

            <div className="wt-field">
              <label htmlFor="ft-job-name">
                Job name
              </label>

              <input
                id="ft-job-name"
                value={jobName}
                onChange={(event) => {
                  setJobName(event.target.value);
                  setSubmitted(false);
                }}
                placeholder="Enter a job name"
                required
              />
            </div>

            <div className="wt-field">
              <label htmlFor="ft-model">
                Base model
              </label>

              <select
                id="ft-model"
                value={model}
                onChange={(event) => {
                  setModel(event.target.value);
                  setSubmitted(false);
                }}
              >
                <option>ModelNow Foundation 8B</option>
                <option>ModelNow Quality 12B</option>
                <option>ModelNow Efficient 4B</option>
                <option>Llama 3</option>
                <option>Mistral</option>
              </select>

              <span className="wt-help">
                Select the pretrained model you want to customize.
              </span>
            </div>

            {/* Hyperparameters */}

            <div className="wt-section-label">
              <Settings2 size={16} />
              Hyperparameters
            </div>

            <div className="wt-form-grid">

              <div className="wt-field">
                <label htmlFor="ft-epochs">
                  Epochs
                </label>

                <input
                  id="ft-epochs"
                  type="number"
                  min="1"
                  max="100"
                  value={epochs}
                  onChange={(event) => {
                    setEpochs(event.target.value);
                    setSubmitted(false);
                  }}
                />
              </div>

              <div className="wt-field">
                <label htmlFor="ft-batch">
                  Batch size
                </label>

                <select
                  id="ft-batch"
                  value={batchSize}
                  onChange={(event) => {
                    setBatchSize(event.target.value);
                    setSubmitted(false);
                  }}
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="4">4</option>
                  <option value="8">8</option>
                  <option value="16">16</option>
                </select>
              </div>

              <div className="wt-field wt-full">
                <label htmlFor="ft-learning-rate">
                  Learning rate
                </label>

                <input
                  id="ft-learning-rate"
                  type="number"
                  min="0"
                  step="any"
                  value={learningRate}
                  onChange={(event) => {
                    setLearningRate(event.target.value);
                    setSubmitted(false);
                  }}
                  placeholder="0.0002"
                />
              </div>

            </div>

          </section>

          {/* Training Dataset */}

          <section className="wt-panel">

            <div className="wt-panel-heading">
              <div>
                <h2>
                  <Database size={18} />
                  Training dataset
                </h2>

                <p>
                  Upload the examples used to train your model.
                </p>
              </div>
            </div>

            <div
              className="wt-dataset-upload"
              onClick={() => fileRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  fileRef.current?.click();
                }
              }}
            >
              <Upload size={25} />

              <h3>
                {dataset
                  ? "Replace dataset"
                  : "Upload training dataset"}
              </h3>

              <p>
                Choose a JSONL, JSON or CSV file from your computer.
              </p>

              <span className="wt-file-types">
                .JSONL · .JSON · .CSV
              </span>

              <input
                ref={fileRef}
                type="file"
                accept=".jsonl,.json,.csv"
                hidden
                onChange={handleDatasetUpload}
              />
            </div>

            {/* Selected Dataset */}

            {dataset && (
              <div className="wt-selected-file">

                <FileText size={19} />

                <div>
                  <strong>{dataset.name}</strong>
                  <span>
                    {(dataset.size / 1024).toFixed(1)} KB
                  </span>
                </div>

                <button
                  type="button"
                  className="wt-icon-button wt-danger"
                  onClick={removeDataset}
                  aria-label="Remove dataset"
                >
                  <Trash2 size={16} />
                </button>

              </div>
            )}

            {/* Dataset Information */}

            <div className="wt-info-card">
              <AlertCircle size={17} />

              <div>
                <strong>Dataset preparation</strong>

                <p>
                  Use consistent examples with the input and
                  output fields expected by your selected
                  model's training format.
                </p>
              </div>
            </div>

          </section>

        </div>

        {/* Training Job Review */}

        <section className="wt-panel wt-review-panel">

          <div className="wt-panel-heading">
            <div>
              <h2>Review training job</h2>

              <p>
                Check your configuration before submitting.
              </p>
            </div>
          </div>

          <div className="wt-review-grid">

            <div>
              <span>Job name</span>
              <strong>{jobName || "Not set"}</strong>
            </div>

            <div>
              <span>Base model</span>
              <strong>{model}</strong>
            </div>

            <div>
              <span>Epochs</span>
              <strong>{epochs}</strong>
            </div>

            <div>
              <span>Batch size</span>
              <strong>{batchSize}</strong>
            </div>

            <div>
              <span>Learning rate</span>
              <strong>{learningRate}</strong>
            </div>

            <div>
              <span>Dataset</span>
              <strong>
                {dataset?.name || "Not uploaded"}
              </strong>
            </div>

          </div>

          <div className="wt-actions">

            <button
              className="wt-primary"
              type="submit"
              disabled={
                !dataset ||
                !jobName.trim() ||
                Number(epochs) < 1 ||
                Number(epochs) > 100 ||
                !Number.isFinite(Number(learningRate)) ||
                Number(learningRate) <= 0
              }
            >
              <Play size={16} />
              Create training job
            </button>

          </div>

          {submitted && (
            <div className="wt-success-message">
              <CheckCircle2 size={17} />

              Training job configuration saved in this
              browser. No model training has started
              because the backend is not connected.
            </div>
          )}

        </section>

      </form>

    </div>
  );
}
