
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Braces,
  Copy,
  Check,
  Play,
  RotateCcw,
  Code2,
  FileJson,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";

import {
  getAvailableModels,
  testPlayground,
} from "../../services/playgroundApi";

import "./structured-output.css";

type Model = {
  id?: string;
  name?: string;
  model?: string;
  provider?: string;
};

const DEFAULT_SCHEMA = `{
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "role": {
      "type": "string"
    },
    "skills": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "experience_years": {
      "type": "number"
    }
  },
  "required": ["name", "role", "skills"]
}`;

const EXAMPLE_PROMPT =
  "Create a sample employee profile for a software engineer with skills and experience.";

function validateAgainstSchema(
  value: unknown,
  schema: any,
  path = "root"
): string[] {
  const errors: string[] = [];

  if (!schema || typeof schema !== "object") {
    return [`Invalid schema at ${path}.`];
  }

  if (schema.type === "object") {
    if (
      value === null ||
      typeof value !== "object" ||
      Array.isArray(value)
    ) {
      return [`${path} must be an object.`];
    }

    const objectValue = value as Record<string, unknown>;
    const properties = schema.properties || {};

    for (const requiredKey of schema.required || []) {
      if (!(requiredKey in objectValue)) {
        errors.push(`Missing required field: ${path}.${requiredKey}`);
      }
    }

    for (const [key, childSchema] of Object.entries(properties)) {
      if (key in objectValue) {
        errors.push(
          ...validateAgainstSchema(
            objectValue[key],
            childSchema,
            `${path}.${key}`
          )
        );
      }
    }

    if (schema.additionalProperties === false) {
      for (const key of Object.keys(objectValue)) {
        if (!(key in properties)) {
          errors.push(`Unexpected field: ${path}.${key}`);
        }
      }
    }
  }

  if (schema.type === "array") {
    if (!Array.isArray(value)) {
      return [`${path} must be an array.`];
    }

    if (schema.items) {
      value.forEach((item, index) => {
        errors.push(
          ...validateAgainstSchema(
            item,
            schema.items,
            `${path}[${index}]`
          )
        );
      });
    }
  }

  if (schema.type === "string" && typeof value !== "string") {
    errors.push(`${path} must be a string.`);
  }

  if (
    schema.type === "number" &&
    (typeof value !== "number" || !Number.isFinite(value))
  ) {
    errors.push(`${path} must be a number.`);
  }

  if (schema.type === "integer" && !Number.isInteger(value)) {
    errors.push(`${path} must be an integer.`);
  }

  if (schema.type === "boolean" && typeof value !== "boolean") {
    errors.push(`${path} must be a boolean.`);
  }

  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(`${path} must match one of the allowed enum values.`);
  }

  return errors;
}

function extractResponse(result: any): string {
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

  return "";
}

export default function StructuredOutputPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [prompt, setPrompt] = useState(EXAMPLE_PROMPT);
  const [schemaText, setSchemaText] = useState(DEFAULT_SCHEMA);
  const [responseText, setResponseText] = useState("");

  const [loading, setLoading] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [schemaExpanded, setSchemaExpanded] = useState(true);

  const parsedSchema = useMemo(() => {
    try {
      return {
        schema: JSON.parse(schemaText),
        error: "",
      };
    } catch (err) {
      return {
        schema: null,
        error:
          err instanceof Error
            ? err.message
            : "Invalid JSON schema.",
      };
    }
  }, [schemaText]);

  const parsedResponse = useMemo(() => {
    if (!responseText.trim()) {
      return {
        data: null,
        error: "",
        validationErrors: [],
      };
    }

    try {
      const json = JSON.parse(responseText);

      return {
        data: json,
        error: "",
        validationErrors: parsedSchema.schema
          ? validateAgainstSchema(json, parsedSchema.schema)
          : [],
      };
    } catch (err) {
      return {
        data: null,
        error:
          err instanceof Error
            ? err.message
            : "Response is not valid JSON.",
        validationErrors: [],
      };
    }
  }, [responseText, parsedSchema.schema]);

  const isValidJson =
    Boolean(responseText.trim()) && !parsedResponse.error;

  const isSchemaValid =
    isValidJson &&
    !parsedSchema.error &&
    parsedResponse.validationErrors.length === 0;

  useEffect(() => {
    let active = true;

    async function loadModels() {
      try {
        const result = await getAvailableModels();

        if (!active) return;

        const list = Array.isArray(result)
          ? result
          : Array.isArray((result as any)?.models)
            ? (result as any).models
            : [];

        setModels(list);

        if (list.length) {
          const first = list[0];

          setSelectedModel(
            first.id || first.model || first.name || ""
          );
        }
      } catch {
        if (active) {
          setError(
            "Unable to load models. Check your API connection."
          );
        }
      } finally {
        if (active) setModelsLoading(false);
      }
    }

    void loadModels();

    return () => {
      active = false;
    };
  }, []);

  async function runStructuredTest(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");
    setResponseText("");

    if (!prompt.trim()) {
      setError("Enter a prompt before running the test.");
      return;
    }

    if (!selectedModel) {
      setError("Select an available model.");
      return;
    }

    if (parsedSchema.error) {
      setError("Fix the JSON schema before running the test.");
      return;
    }

    setLoading(true);

    try {
      const systemPrompt = [
        "You are a structured data generation assistant.",
        "Return only valid JSON.",
        "Do not include Markdown code fences or explanations.",
        "Follow this JSON Schema as closely as possible:",
        JSON.stringify(parsedSchema.schema, null, 2),
      ].join("\n\n");

      const result = await testPlayground({
        input: prompt.trim(),
        model: selectedModel,
        systemPrompt,
      });

      const output = extractResponse(result);

      if (!output.trim()) {
        setError(
          "The API returned no readable model response."
        );
      } else {
        setResponseText(output.trim());
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Structured output test failed."
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyResponse() {
    if (!responseText) return;

    try {
      await navigator.clipboard.writeText(
        isValidJson
          ? JSON.stringify(parsedResponse.data, null, 2)
          : responseText
      );

      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setError("Unable to copy the response.");
    }
  }

  function loadExample() {
    setPrompt(EXAMPLE_PROMPT);
    setSchemaText(DEFAULT_SCHEMA);
    setResponseText("");
    setError("");
  }

  function resetAll() {
    setPrompt("");
    setSchemaText(DEFAULT_SCHEMA);
    setResponseText("");
    setError("");
  }

  return (
    <main className="so-page">
      {/* Duplicate Structured Output heading removed */}

      <section className="so-info-strip">
        <div className="so-info-icon">
          <Braces size={20} />
        </div>

        <div>
          <strong>JSON Schema validation</strong>
          <p>
            Generate JSON responses and check their structure, data
            types, required fields, and basic schema rules locally.
          </p>
        </div>
      </section>

      <form onSubmit={runStructuredTest}>
        <section className="so-config-panel">
          <div className="so-panel-heading">
            <div>
              <h2>
                <Code2 size={17} />
                Test Configuration
              </h2>

              <p>
                Configure the model, prompt, and output schema.
              </p>
            </div>

            <span className="so-mode-badge">JSON MODE</span>
          </div>

          {/* Page actions moved here */}
          <div className="so-header-actions">
            <button
              type="button"
              className="so-secondary-btn"
              onClick={loadExample}
              disabled={loading}
            >
              <FileJson size={15} />
              Load example
            </button>

            <button
              type="button"
              className="so-secondary-btn"
              onClick={resetAll}
              disabled={loading}
            >
              <RotateCcw size={15} />
              Reset
            </button>
          </div>

          <label className="so-field so-model-field">
            <span>AI Model</span>

            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={modelsLoading || models.length === 0 || loading}
            >
              {modelsLoading && (
                <option value="">Loading models...</option>
              )}

              {!modelsLoading && models.length === 0 && (
                <option value="">No models available</option>
              )}

              {models.map((model, index) => {
                const value =
                  model.id || model.model || model.name || "";

                return (
                  <option key={`${value}-${index}`} value={value}>
                    {model.name || model.id || model.model}
                    {model.provider ? ` (${model.provider})` : ""}
                  </option>
                );
              })}
            </select>
          </label>

          <label className="so-field">
            <span>Input Prompt</span>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the structured data you want the model to generate..."
              rows={3}
              disabled={loading}
            />
          </label>

          <div className="so-schema-heading">
            <div>
              <strong>JSON Schema</strong>
              <small>
                Define the expected response structure.
              </small>
            </div>

            <button
              type="button"
              className="so-collapse-btn"
              onClick={() => setSchemaExpanded(!schemaExpanded)}
            >
              {schemaExpanded ? "Collapse" : "Expand"}

              <ChevronDown
                size={15}
                className={schemaExpanded ? "so-chevron-open" : ""}
              />
            </button>
          </div>

          {schemaExpanded && (
            <label className="so-field">
              <textarea
                className="so-code-editor"
                value={schemaText}
                onChange={(e) => setSchemaText(e.target.value)}
                spellCheck={false}
                rows={17}
                placeholder="Enter a JSON Schema..."
                disabled={loading}
              />
            </label>
          )}

          {parsedSchema.error ? (
            <div className="so-error" role="alert">
              <AlertCircle size={15} />
              Invalid JSON schema: {parsedSchema.error}
            </div>
          ) : (
            <div className="so-schema-valid">
              <CheckCircle2 size={15} />
              Schema JSON syntax is valid
            </div>
          )}

          {error && (
            <div className="so-error" role="alert">
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          <div className="so-config-footer">
            <span>
              Schema validation runs locally after the model responds.
            </span>

            <button
              type="submit"
              className="so-primary-btn"
              disabled={
                loading ||
                modelsLoading ||
                !selectedModel ||
                Boolean(parsedSchema.error) ||
                !prompt.trim()
              }
            >
              <Play size={15} />
              {loading ? "Generating..." : "Generate JSON"}
            </button>
          </div>
        </section>
      </form>

      <section className="so-results-grid">
        <div className="so-result-panel">
          <div className="so-result-heading">
            <div>
              <h2>
                <Braces size={17} />
                Model Output
              </h2>

              <p>
                Actual response returned by the selected model.
              </p>
            </div>

            <button
              type="button"
              className="so-copy-btn"
              onClick={copyResponse}
              disabled={!responseText}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <pre className="so-output-code">
            {responseText
              ? isValidJson
                ? JSON.stringify(parsedResponse.data, null, 2)
                : responseText
              : "Your model's generated JSON will appear here."}
          </pre>
        </div>

        <div className="so-validation-panel">
          <div className="so-result-heading">
            <div>
              <h2>
                <CheckCircle2 size={17} />
                Validation Results
              </h2>

              <p>
                Local checks against your JSON schema.
              </p>
            </div>
          </div>

          {!responseText ? (
            <div className="so-empty-validation">
              <FileJson size={29} />
              <strong>Waiting for model output</strong>
              <span>
                Run a test to see JSON syntax and schema validation.
              </span>
            </div>
          ) : (
            <div className="so-validation-content">
              <div className="so-validation-item">
                <span>JSON syntax</span>

                {isValidJson ? (
                  <span className="so-status success">
                    <CheckCircle2 size={14} />
                    Valid
                  </span>
                ) : (
                  <span className="so-status failed">
                    <AlertCircle size={14} />
                    Invalid
                  </span>
                )}
              </div>

              <div className="so-validation-item">
                <span>Schema compliance</span>

                {parsedSchema.error ? (
                  <span className="so-status failed">
                    <AlertCircle size={14} />
                    Invalid schema
                  </span>
                ) : isSchemaValid ? (
                  <span className="so-status success">
                    <CheckCircle2 size={14} />
                    Passed
                  </span>
                ) : (
                  <span className="so-status failed">
                    <AlertCircle size={14} />
                    Failed
                  </span>
                )}
              </div>

              {parsedResponse.validationErrors.length > 0 && (
                <div className="so-validation-errors">
                  <strong>Validation issues</strong>

                  {parsedResponse.validationErrors.map(
                    (item, index) => (
                      <div key={`${item}-${index}`}>{item}</div>
                    )
                  )}
                </div>
              )}

              {parsedResponse.error && (
                <div className="so-validation-errors">
                  <strong>JSON parsing error</strong>
                  <div>{parsedResponse.error}</div>
                </div>
              )}

              {isSchemaValid && (
                <div className="so-success-message">
                  <CheckCircle2 size={17} />
                  The response passed the implemented schema checks.
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}