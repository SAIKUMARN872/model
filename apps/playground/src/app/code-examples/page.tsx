
import { useMemo, useState } from "react";
import "./code-examples.css";

type Language = "python" | "javascript" | "typescript" | "curl";

const languages: {
  id: Language;
  label: string;
  extension: string;
}[] = [
  { id: "python", label: "Python", extension: ".py" },
  { id: "javascript", label: "JavaScript", extension: ".js" },
  { id: "typescript", label: "TypeScript", extension: ".ts" },
  { id: "curl", label: "cURL", extension: ".sh" },
];

const providers = [
  "ModelNow API",
  "OpenAI Compatible",
  "Custom Endpoint",
];

const DEFAULT_ENDPOINT =
  "http://localhost:3000/api/playground/chat";

const DEFAULT_MODEL = "gpt-4o-mini";

const DEFAULT_PROMPT =
  "Explain how an AI model works in simple terms.";

function buildExample(
  language: Language,
  endpoint: string,
  model: string,
  prompt: string
): string {
  const safeEndpoint = JSON.stringify(endpoint);
  const safeModel = JSON.stringify(model);
  const safePrompt = JSON.stringify(prompt);

  if (language === "python") {
    return `import requests

url = ${safeEndpoint}

headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_API_KEY"
}

payload = {
    "model": ${safeModel},
    "input": ${safePrompt}
}

response = requests.post(
    url,
    headers=headers,
    json=payload,
    timeout=60
)

response.raise_for_status()

result = response.json()

print(result)`;
  }

  if (language === "javascript") {
    return `const response = await fetch(${safeEndpoint}, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_API_KEY"
  },
  body: JSON.stringify({
    model: ${safeModel},
    input: ${safePrompt}
  })
});

if (!response.ok) {
  throw new Error(
    \`API request failed: \${response.status}\`
  );
}

const result = await response.json();

console.log(result);`;
  }

  if (language === "typescript") {
    return `interface PlaygroundRequest {
  model: string;
  input: string;
}

interface PlaygroundResponse {
  output?: string;
  content?: string;
  response?: string;
  [key: string]: unknown;
}

const endpoint = ${safeEndpoint};

const payload: PlaygroundRequest = {
  model: ${safeModel},
  input: ${safePrompt}
};

async function runModel(): Promise<PlaygroundResponse> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer YOUR_API_KEY"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(
      \`API request failed: \${response.status}\`
    );
  }

  return response.json() as Promise<PlaygroundResponse>;
}

runModel()
  .then((result) => console.log(result))
  .catch(console.error);`;
  }

  const curlPayload = JSON.stringify({
    model,
    input: prompt,
  });

  const shellPayload = curlPayload.replace(/'/g, "'\\''");

  return `curl -X POST '${endpoint.replace(/'/g, "'\\''")}' \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  --data-raw '${shellPayload}'`;
}

export default function CodeExamplesPage() {
  const [language, setLanguage] =
    useState<Language>("python");

  const [provider, setProvider] =
    useState("ModelNow API");

  const [endpoint, setEndpoint] =
    useState(DEFAULT_ENDPOINT);

  const [model, setModel] =
    useState(DEFAULT_MODEL);

  const [prompt, setPrompt] =
    useState(DEFAULT_PROMPT);

  const [copied, setCopied] =
    useState(false);

  const generatedCode = useMemo(
    () =>
      buildExample(
        language,
        endpoint,
        model,
        prompt
      ),
    [language, endpoint, model, prompt]
  );

  const selectedLanguage = languages.find(
    (item) => item.id === language
  );

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(generatedCode);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setCopied(false);
    }
  }

  function downloadCode() {
    const blob = new Blob(
      [generatedCode],
      { type: "text/plain;charset=utf-8" }
    );

    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = objectUrl;
    anchor.download =
      `modelnow-example${selectedLanguage?.extension || ".txt"}`;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(objectUrl);
  }

  function resetConfiguration() {
    setProvider("ModelNow API");
    setEndpoint(DEFAULT_ENDPOINT);
    setModel(DEFAULT_MODEL);
    setPrompt(DEFAULT_PROMPT);
    setLanguage("python");
    setCopied(false);
  }

  return (
    <div className="ce-page">

      {/* Configuration and Generated Code */}

      <div className="ce-main-grid">

        {/* Configuration Panel */}

        <section className="ce-config-panel">

          <div className="ce-panel-heading">
            <div>
              <h2>Configuration</h2>
              <p>
                Customize your API integration.
              </p>
            </div>

            <button
              className="ce-reset-button"
              onClick={resetConfiguration}
              type="button"
            >
              Reset
            </button>
          </div>

          {/* API Provider */}

          <div className="ce-field">
            <label htmlFor="ce-provider">
              API provider
            </label>

            <select
              id="ce-provider"
              value={provider}
              onChange={(event) =>
                setProvider(event.target.value)
              }
            >
              {providers.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <span className="ce-field-hint">
              Choose the API format you want to target.
            </span>
          </div>

          {/* Endpoint */}

          <div className="ce-field">
            <label htmlFor="ce-endpoint">
              API endpoint
            </label>

            <input
              id="ce-endpoint"
              type="url"
              value={endpoint}
              onChange={(event) =>
                setEndpoint(event.target.value)
              }
              placeholder="https://api.example.com/v1/chat"
            />
          </div>

          {/* Model */}

          <div className="ce-field">
            <label htmlFor="ce-model">
              Model name
            </label>

            <input
              id="ce-model"
              value={model}
              onChange={(event) =>
                setModel(event.target.value)
              }
              placeholder="Enter model name"
            />
          </div>

          {/* Prompt */}

          <div className="ce-field">
            <label htmlFor="ce-prompt">
              Sample prompt
            </label>

            <textarea
              id="ce-prompt"
              value={prompt}
              onChange={(event) =>
                setPrompt(event.target.value)
              }
              rows={4}
              placeholder="Enter the prompt to include in the example"
            />
          </div>

          <div className="ce-field">
            <label>
              Authentication
            </label>

            <div className="ce-key-input">
              <input
                value="YOUR_API_KEY"
                readOnly
                aria-label="API key placeholder"
              />
            </div>

            <span className="ce-field-hint">
              Your generated code uses a secure API key
              placeholder. Configure the real key through
              your backend environment variables.
            </span>
          </div>

        </section>

        {/* Generated Integration Panel */}

        <section className="ce-output-panel">

          <div className="ce-panel-heading ce-output-heading">
            <div>
              <h2>Generated integration</h2>
              <p>
                Your example updates as you change
                the configuration.
              </p>
            </div>

            <div className="ce-output-actions">

              <button
                type="button"
                className="ce-secondary-button"
                onClick={downloadCode}
              >
                Download
              </button>

              <button
                type="button"
                className="ce-copy-button"
                onClick={copyCode}
              >
                {copied ? "Copied!" : "Copy code"}
              </button>

            </div>
          </div>

          {/* Language Selection */}

          <div className="ce-language-tabs">
            {languages.map((item) => (
              <button
                type="button"
                key={item.id}
                className={
                  language === item.id ? "active" : ""
                }
                onClick={() => {
                  setLanguage(item.id);
                  setCopied(false);
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Code Toolbar */}

          <div className="ce-code-toolbar">
            <span>
              {selectedLanguage?.label || "Code"} integration
            </span>

            <span>
              {selectedLanguage?.extension}
            </span>
          </div>

          {/* Code Output */}

          <pre className="ce-code-window">
            <code>{generatedCode}</code>
          </pre>

          {/* Footer */}

          <div className="ce-code-footer">
            <span>
              ModelNow Integration Generator
            </span>

            <span>
              Editable example
            </span>
          </div>

        </section>

      </div>

      {/* Integration Information */}

      <section className="ce-info-panel">

        <div className="ce-info-icon">
          i
        </div>

        <div>
          <strong>
            Integration note
          </strong>

          <p>
            These are generated code templates, not
            executed API requests. Confirm that your
            selected provider supports the endpoint and
            request fields shown. Keep real API keys on
            a secure backend, never in browser-side
            application code.
          </p>
        </div>

      </section>

      {/* Configuration Summary */}

      <div className="ce-provider-summary">

        <span>
          Selected provider
        </span>

        <strong>
          {provider}
        </strong>

        <span className="ce-summary-divider" />

        <span>
          Language
        </span>

        <strong>
          {selectedLanguage?.label}
        </strong>

        <span className="ce-summary-divider" />

        <span>
          Model
        </span>

        <strong>
          {model || "Not specified"}
        </strong>

      </div>

    </div>
  );
}
