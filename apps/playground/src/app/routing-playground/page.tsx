
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  CircleHelp,
  Copy,
  GitBranch,
  Play,
  Plus,
  RotateCcw,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  Zap,
} from "lucide-react";

import "./routing-playground.css";

type RouteRule = {
  id: number;
  task: string;
  provider: string;
  model: string;
  enabled: boolean;
};

const modelOptions = [
  {
    provider: "OpenAI",
    models: ["GPT-4o", "GPT-4o-mini", "GPT-4.1", "GPT-4.1-mini"],
  },
  {
    provider: "Anthropic",
    models: ["Claude Sonnet", "Claude Haiku", "Claude Opus"],
  },
  {
    provider: "Google",
    models: ["Gemini 2.5 Pro", "Gemini 2.5 Flash"],
  },
  {
    provider: "Meta",
    models: ["Llama 3.3 70B", "Llama 3.1 8B"],
  },
  {
    provider: "Mistral",
    models: ["Mistral Large", "Mistral Small"],
  },
];

const initialRules: RouteRule[] = [
  {
    id: 1,
    task: "Complex reasoning",
    provider: "OpenAI",
    model: "GPT-4.1",
    enabled: true,
  },
  {
    id: 2,
    task: "Fast responses",
    provider: "Google",
    model: "Gemini 2.5 Flash",
    enabled: true,
  },
  {
    id: 3,
    task: "Code generation",
    provider: "Anthropic",
    model: "Claude Sonnet",
    enabled: true,
  },
  {
    id: 4,
    task: "General tasks",
    provider: "OpenAI",
    model: "GPT-4o-mini",
    enabled: true,
  },
];

const strategies = [
  {
    value: "auto",
    label: "Automatic",
    description: "Choose a model based on the task and configured rules.",
  },
  {
    value: "quality",
    label: "Best quality",
    description: "Prefer the configured high-capability model.",
  },
  {
    value: "cost",
    label: "Lowest cost",
    description: "Prefer the configured economical model.",
  },
  {
    value: "latency",
    label: "Lowest latency",
    description: "Prefer the configured fast-response model.",
  },
  {
    value: "manual",
    label: "Manual",
    description: "Always use the selected primary model.",
  },
];

function getModels(provider: string) {
  return (
    modelOptions.find((item) => item.provider === provider)?.models ?? []
  );
}

export default function RoutingPlayground() {
  const [strategy, setStrategy] = useState("auto");

  const [primaryProvider, setPrimaryProvider] = useState("OpenAI");
  const [primaryModel, setPrimaryModel] = useState("GPT-4o-mini");

  const [fallbackProvider, setFallbackProvider] = useState("Anthropic");
  const [fallbackModel, setFallbackModel] = useState("Claude Haiku");
  const [fallbackEnabled, setFallbackEnabled] = useState(true);

  const [rules, setRules] = useState<RouteRule[]>(initialRules);
  const [prompt, setPrompt] = useState("");
  const [taskType, setTaskType] = useState("General tasks");

  const [simulation, setSimulation] = useState<{
    model: string;
    provider: string;
    reason: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  const enabledRules = useMemo(
    () => rules.filter((rule) => rule.enabled),
    [rules]
  );

  const requestPreview = useMemo(
    () => ({
      routing_strategy: strategy,
      task_type: taskType,
      primary: {
        provider: primaryProvider,
        model: primaryModel,
      },
      fallback: fallbackEnabled
        ? {
            enabled: true,
            provider: fallbackProvider,
            model: fallbackModel,
          }
        : { enabled: false },
      rules: enabledRules.map((rule) => ({
        task: rule.task,
        provider: rule.provider,
        model: rule.model,
      })),
      prompt,
    }),
    [
      strategy,
      taskType,
      primaryProvider,
      primaryModel,
      fallbackEnabled,
      fallbackProvider,
      fallbackModel,
      enabledRules,
      prompt,
    ]
  );

  function updateRule(id: number, changes: Partial<RouteRule>) {
    setRules((current) =>
      current.map((rule) =>
        rule.id === id ? { ...rule, ...changes } : rule
      )
    );
    setSimulation(null);
  }

  function changeRuleProvider(id: number, provider: string) {
    const firstModel = getModels(provider)[0] ?? "";
    updateRule(id, { provider, model: firstModel });
  }

  function addRule() {
    const nextId = Math.max(0, ...rules.map((rule) => rule.id)) + 1;

    setRules((current) => [
      ...current,
      {
        id: nextId,
        task: "New task",
        provider: "OpenAI",
        model: "GPT-4o-mini",
        enabled: true,
      },
    ]);

    setSimulation(null);
  }

  function simulateRouting() {
    if (!prompt.trim()) {
      setSimulation(null);
      return;
    }

    if (strategy === "manual") {
      setSimulation({
        provider: primaryProvider,
        model: primaryModel,
        reason: "Manual strategy: primary model selected.",
      });
      return;
    }

    const matchedRule = enabledRules.find(
      (rule) => rule.task === taskType
    );

    if (matchedRule) {
      setSimulation({
        provider: matchedRule.provider,
        model: matchedRule.model,
        reason: `Matched the enabled "${matchedRule.task}" routing rule.`,
      });
      return;
    }

    if (strategy === "quality") {
      const qualityModel = enabledRules.find(
        (rule) => rule.task === "Complex reasoning"
      );

      if (qualityModel) {
        setSimulation({
          provider: qualityModel.provider,
          model: qualityModel.model,
          reason: "Simulation selected the configured quality rule.",
        });
        return;
      }
    }

    if (strategy === "latency") {
      const fastModel = enabledRules.find(
        (rule) => rule.task === "Fast responses"
      );

      if (fastModel) {
        setSimulation({
          provider: fastModel.provider,
          model: fastModel.model,
          reason: "Simulation selected the configured fast-response rule.",
        });
        return;
      }
    }

    if (strategy === "cost") {
      const economicalModel = enabledRules.find(
        (rule) => rule.task === "General tasks"
      );

      if (economicalModel) {
        setSimulation({
          provider: economicalModel.provider,
          model: economicalModel.model,
          reason: "Simulation selected the configured general-task rule.",
        });
        return;
      }
    }

    setSimulation({
      provider: primaryProvider,
      model: primaryModel,
      reason: "No matching enabled rule. Using the primary model.",
    });
  }

  async function copyConfiguration() {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(requestPreview, null, 2)
      );

      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  function resetConfiguration() {
    setStrategy("auto");
    setPrimaryProvider("OpenAI");
    setPrimaryModel("GPT-4o-mini");
    setFallbackProvider("Anthropic");
    setFallbackModel("Claude Haiku");
    setFallbackEnabled(true);
    setRules(initialRules);
    setPrompt("");
    setTaskType("General tasks");
    setSimulation(null);
    setCopied(false);
  }

  return (
    <main className="rp-page">
      {/* Duplicate Routing Playground heading removed */}

      <section className="rp-overview">
        <div className="rp-stat-card">
          <span className="rp-stat-icon">
            <GitBranch size={18} />
          </span>
          <div>
            <strong>{rules.length}</strong>
            <span>Total routing rules</span>
          </div>
        </div>

        <div className="rp-stat-card">
          <span className="rp-stat-icon">
            <Check size={18} />
          </span>
          <div>
            <strong>{enabledRules.length}</strong>
            <span>Active rules</span>
          </div>
        </div>

        <div className="rp-stat-card">
          <span className="rp-stat-icon">
            <ShieldCheck size={18} />
          </span>
          <div>
            <strong>
              {fallbackEnabled ? "Enabled" : "Disabled"}
            </strong>
            <span>Fallback configuration</span>
          </div>
        </div>

        <div className="rp-stat-card">
          <span className="rp-stat-icon">
            <Zap size={18} />
          </span>
          <div>
            <strong>{modelOptions.length}</strong>
            <span>Configured providers</span>
          </div>
        </div>
      </section>

      <div className="rp-main-grid">
        <section className="rp-panel rp-config-panel">
          <div className="rp-panel-heading">
            <div>
              <h2>
                <Settings2 size={18} />
                Routing configuration
              </h2>
              <p>Define how incoming requests should be routed.</p>
            </div>

            <div className="rp-header-actions">
              <span className="rp-local-badge">
                <span />
                Frontend simulation
              </span>

              <button
                type="button"
                className="rp-reset-btn"
                onClick={resetConfiguration}
              >
                <RotateCcw size={15} />
                Reset
              </button>
            </div>
          </div>

          <div className="rp-field">
            <label htmlFor="rp-strategy">Routing strategy</label>

            <select
              id="rp-strategy"
              value={strategy}
              onChange={(event) => {
                setStrategy(event.target.value);
                setSimulation(null);
              }}
            >
              {strategies.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <small>
              {
                strategies.find((item) => item.value === strategy)
                  ?.description
              }
            </small>
          </div>

          <div className="rp-section-divider" />

          <div className="rp-subheading">
            <div>
              <h3>Primary model</h3>
              <p>Default model for incoming requests.</p>
            </div>

            <span className="rp-tag">PRIMARY</span>
          </div>

          <div className="rp-two-fields">
            <div className="rp-field">
              <label htmlFor="rp-primary-provider">Provider</label>

              <select
                id="rp-primary-provider"
                value={primaryProvider}
                onChange={(event) => {
                  const provider = event.target.value;
                  setPrimaryProvider(provider);
                  setPrimaryModel(getModels(provider)[0] ?? "");
                  setSimulation(null);
                }}
              >
                {modelOptions.map((item) => (
                  <option key={item.provider} value={item.provider}>
                    {item.provider}
                  </option>
                ))}
              </select>
            </div>

            <div className="rp-field">
              <label htmlFor="rp-primary-model">Model</label>

              <select
                id="rp-primary-model"
                value={primaryModel}
                onChange={(event) => {
                  setPrimaryModel(event.target.value);
                  setSimulation(null);
                }}
              >
                {getModels(primaryProvider).map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rp-section-divider" />

          <div className="rp-subheading">
            <div>
              <h3>Fallback model</h3>
              <p>
                Alternative configuration if the primary model fails.
              </p>
            </div>

            <label className="rp-switch">
              <input
                type="checkbox"
                checked={fallbackEnabled}
                onChange={(event) => {
                  setFallbackEnabled(event.target.checked);
                  setSimulation(null);
                }}
              />
              <span />
            </label>
          </div>

          {fallbackEnabled && (
            <div className="rp-two-fields">
              <div className="rp-field">
                <label htmlFor="rp-fallback-provider">Provider</label>

                <select
                  id="rp-fallback-provider"
                  value={fallbackProvider}
                  onChange={(event) => {
                    const provider = event.target.value;
                    setFallbackProvider(provider);
                    setFallbackModel(getModels(provider)[0] ?? "");
                    setSimulation(null);
                  }}
                >
                  {modelOptions.map((item) => (
                    <option key={item.provider} value={item.provider}>
                      {item.provider}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rp-field">
                <label htmlFor="rp-fallback-model">Model</label>

                <select
                  id="rp-fallback-model"
                  value={fallbackModel}
                  onChange={(event) => {
                    setFallbackModel(event.target.value);
                    setSimulation(null);
                  }}
                >
                  {getModels(fallbackProvider).map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </section>

        <section className="rp-panel rp-rules-panel">
          <div className="rp-panel-heading">
            <div>
              <h2>
                <SlidersHorizontal size={18} />
                Task-based routing rules
              </h2>
              <p>Assign models to different request categories.</p>
            </div>

            <button
              type="button"
              className="rp-add-btn"
              onClick={addRule}
            >
              <Plus size={15} />
              Add rule
            </button>
          </div>

          <div className="rp-rules-list">
            {rules.map((rule) => (
              <div
                className={`rp-rule ${
                  !rule.enabled ? "rp-rule-disabled" : ""
                }`}
                key={rule.id}
              >
                <div className="rp-rule-top">
                  <label className="rp-rule-toggle">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={(event) =>
                        updateRule(rule.id, {
                          enabled: event.target.checked,
                        })
                      }
                    />
                    <span />
                  </label>

                  <input
                    className="rp-task-input"
                    aria-label="Task category"
                    value={rule.task}
                    onChange={(event) =>
                      updateRule(rule.id, {
                        task: event.target.value,
                      })
                    }
                  />

                  <button
                    type="button"
                    className="rp-delete-btn"
                    title="Delete rule"
                    onClick={() => {
                      setRules((current) =>
                        current.filter((item) => item.id !== rule.id)
                      );
                      setSimulation(null);
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="rp-two-fields rp-rule-fields">
                  <div className="rp-field">
                    <label>Provider</label>

                    <select
                      value={rule.provider}
                      onChange={(event) =>
                        changeRuleProvider(rule.id, event.target.value)
                      }
                    >
                      {modelOptions.map((item) => (
                        <option
                          key={item.provider}
                          value={item.provider}
                        >
                          {item.provider}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="rp-field">
                    <label>Model</label>

                    <select
                      value={rule.model}
                      onChange={(event) =>
                        updateRule(rule.id, {
                          model: event.target.value,
                        })
                      }
                    >
                      {getModels(rule.provider).map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}

            {rules.length === 0 && (
              <div className="rp-empty">
                No routing rules yet. Select Add rule to create one.
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="rp-panel rp-simulation-panel">
        <div className="rp-panel-heading">
          <div>
            <h2>
              <Play size={18} />
              Routing simulator
            </h2>
            <p>Enter a request and preview the selected route.</p>
          </div>

          <span className="rp-demo-label">LOCAL SIMULATION</span>
        </div>

        <div className="rp-simulation-grid">
          <div className="rp-simulation-input">
            <div className="rp-field">
              <label htmlFor="rp-task-type">Request category</label>

              <select
                id="rp-task-type"
                value={taskType}
                onChange={(event) => {
                  setTaskType(event.target.value);
                  setSimulation(null);
                }}
              >
                <option>General tasks</option>
                <option>Complex reasoning</option>
                <option>Fast responses</option>
                <option>Code generation</option>
              </select>
            </div>

            <div className="rp-field">
              <label htmlFor="rp-prompt">Test prompt</label>

              <textarea
                id="rp-prompt"
                rows={5}
                placeholder="Enter a prompt to simulate model routing..."
                value={prompt}
                onChange={(event) => {
                  setPrompt(event.target.value);
                  setSimulation(null);
                }}
              />
            </div>

            <button
              type="button"
              className="rp-run-btn"
              onClick={simulateRouting}
              disabled={!prompt.trim()}
            >
              <Play size={16} fill="currentColor" />
              Simulate routing
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="rp-simulation-result">
            {simulation ? (
              <>
                <div className="rp-result-success">
                  <Check size={16} />
                  Routing simulation complete
                </div>

                <div className="rp-route-flow">
                  <div className="rp-route-node">
                    <span className="rp-route-node-icon">
                      <GitBranch size={17} />
                    </span>

                    <div>
                      <small>SELECTED PROVIDER</small>
                      <strong>{simulation.provider}</strong>
                    </div>
                  </div>

                  <div className="rp-route-connector">
                    <ArrowRight size={18} />
                  </div>

                  <div className="rp-route-node rp-route-selected">
                    <span className="rp-route-node-icon">
                      <Zap size={17} />
                    </span>

                    <div>
                      <small>SELECTED MODEL</small>
                      <strong>{simulation.model}</strong>
                    </div>
                  </div>
                </div>

                <div className="rp-reason">
                  <CircleHelp size={15} />
                  {simulation.reason}
                </div>

                <div className="rp-simulation-disclaimer">
                  This is a local configuration simulation. No model API was called.
                </div>
              </>
            ) : (
              <div className="rp-result-placeholder">
                <div className="rp-placeholder-icon">
                  <GitBranch size={25} />
                </div>

                <strong>Routing result will appear here</strong>

                <p>
                  Choose a task category, enter a prompt and run the simulation.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rp-panel rp-preview-panel">
        <div className="rp-panel-heading">
          <div>
            <h2>Configuration preview</h2>
            <p>Review the routing configuration as JSON.</p>
          </div>

          <button
            type="button"
            className="rp-copy-btn"
            onClick={copyConfiguration}
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? "Copied" : "Copy JSON"}
          </button>
        </div>

        <pre className="rp-json-preview">
          {JSON.stringify(requestPreview, null, 2)}
        </pre>
      </section>
    </main>
  );
}
