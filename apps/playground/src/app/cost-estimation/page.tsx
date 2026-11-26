import { useMemo, useState } from "react";
import {
  Calculator,
  Coins,
  Copy,
  RotateCcw,
  TrendingUp,
  Zap,
} from "lucide-react";
import "./cost-estimation.css";

type ModelPricing = {
  name: string;
  provider: string;
  input: number;
  output: number;
};

const defaultModels: ModelPricing[] = [
  { name: "GPT-4o", provider: "OpenAI", input: 2.5, output: 10 },
  { name: "GPT-4o-mini", provider: "OpenAI", input: 0.15, output: 0.6 },
  { name: "GPT-4.1", provider: "OpenAI", input: 2, output: 8 },
  { name: "Claude Sonnet", provider: "Anthropic", input: 3, output: 15 },
  { name: "Claude Haiku", provider: "Anthropic", input: 0.8, output: 4 },
  { name: "Gemini 2.5 Flash", provider: "Google", input: 0.3, output: 2.5 },
  { name: "Gemini 2.5 Pro", provider: "Google", input: 1.25, output: 10 },
  { name: "Llama 3.3 70B", provider: "Meta", input: 0.9, output: 0.9 },
  { name: "Mistral Large", provider: "Mistral", input: 2, output: 6 },
];

const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(Number.isFinite(value) ? value : 0);

export default function CostEstimationPage() {
  const models = defaultModels;

  const [selectedModel, setSelectedModel] = useState("GPT-4o-mini");
  const [inputTokens, setInputTokens] = useState(1000);
  const [outputTokens, setOutputTokens] = useState(500);
  const [requests, setRequests] = useState(1000);
  const [currency, setCurrency] = useState("USD");
  const [customInputPrice, setCustomInputPrice] = useState("");
  const [customOutputPrice, setCustomOutputPrice] = useState("");

  const model =
    models.find((item) => item.name === selectedModel) ?? models[0];

  const inputPrice =
    customInputPrice.trim() === ""
      ? model?.input ?? 0
      : Math.max(0, Number(customInputPrice) || 0);

  const outputPrice =
    customOutputPrice.trim() === ""
      ? model?.output ?? 0
      : Math.max(0, Number(customOutputPrice) || 0);

  const estimate = useMemo(() => {
    const safeInput = Math.max(0, inputTokens);
    const safeOutput = Math.max(0, outputTokens);
    const safeRequests = Math.max(0, requests);

    const inputCost =
      (safeInput * safeRequests * inputPrice) / 1_000_000;

    const outputCost =
      (safeOutput * safeRequests * outputPrice) / 1_000_000;

    return {
      inputCost,
      outputCost,
      total: inputCost + outputCost,
      totalTokens: (safeInput + safeOutput) * safeRequests,
      averagePerRequest:
        safeRequests > 0
          ? (inputCost + outputCost) / safeRequests
          : 0,
    };
  }, [inputTokens, outputTokens, requests, inputPrice, outputPrice]);

  const monthlyEstimate = estimate.total;
  const yearlyEstimate = monthlyEstimate * 12;

  function updateModel(name: string) {
    setSelectedModel(name);
    setCustomInputPrice("");
    setCustomOutputPrice("");
  }

  function resetCalculator() {
    setSelectedModel("GPT-4o-mini");
    setInputTokens(1000);
    setOutputTokens(500);
    setRequests(1000);
    setCurrency("USD");
    setCustomInputPrice("");
    setCustomOutputPrice("");
  }

  async function copyEstimate() {
    const report = {
      model: selectedModel,
      provider: model?.provider,
      inputTokensPerRequest: inputTokens,
      outputTokensPerRequest: outputTokens,
      requests,
      inputPricePerMillionTokens: inputPrice,
      outputPricePerMillionTokens: outputPrice,
      inputCost: estimate.inputCost,
      outputCost: estimate.outputCost,
      estimatedTotal: estimate.total,
      estimatedYearlyTotal: yearlyEstimate,
      currency,
      note: "Frontend estimate using configured sample pricing.",
    };

    try {
      await navigator.clipboard.writeText(
        JSON.stringify(report, null, 2)
      );
    } catch {
      // Clipboard may be unavailable in some browser contexts.
    }
  }

  const displayMoney = (value: number) => {
    if (currency === "INR") {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }).format(value * 84);
    }

    return money(value);
  };

  return (
    <main className="ce-page">
      <section className="ce-summary-grid">
        <div className="ce-summary-card ce-total-card">
          <div className="ce-summary-icon">
            <Coins size={18} />
          </div>
          <span>Estimated usage cost</span>
          <strong>{displayMoney(estimate.total)}</strong>
          <small>For the configured request volume</small>
        </div>

        <div className="ce-summary-card">
          <div className="ce-summary-icon">
            <Zap size={18} />
          </div>
          <span>Average cost per request</span>
          <strong>{displayMoney(estimate.averagePerRequest)}</strong>
          <small>Input and output combined</small>
        </div>

        <div className="ce-summary-card">
          <div className="ce-summary-icon">
            <TrendingUp size={18} />
          </div>
          <span>Projected yearly cost</span>
          <strong>{displayMoney(yearlyEstimate)}</strong>
          <small>Assuming the same usage every month</small>
        </div>

        <div className="ce-summary-card">
          <div className="ce-summary-icon">
            <Calculator size={18} />
          </div>
          <span>Total tokens</span>
          <strong>
            {estimate.totalTokens.toLocaleString("en-US")}
          </strong>
          <small>Across all configured requests</small>
        </div>
      </section>

      <div className="ce-main-grid">
        <section className="ce-panel">
          <div className="ce-panel-heading">
            <div>
              <h2>Usage configuration</h2>
              <p>Choose a model and enter your expected usage.</p>
            </div>

            <div className="ce-header-actions">
              <span className="ce-status">
                <span />
                Local calculator
              </span>

              <button
                type="button"
                className="ce-reset-btn"
                onClick={resetCalculator}
              >
                <RotateCcw size={14} />
                Reset
              </button>
            </div>
          </div>

          <div className="ce-field">
            <label htmlFor="ce-model">AI model</label>
            <select
              id="ce-model"
              value={selectedModel}
              onChange={(event) => updateModel(event.target.value)}
            >
              {models.map((item) => (
                <option key={item.name} value={item.name}>
                  {item.provider} — {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="ce-field">
            <label htmlFor="ce-input-tokens">
              Average input tokens per request
            </label>
            <input
              id="ce-input-tokens"
              type="number"
              min="0"
              value={inputTokens}
              onChange={(event) =>
                setInputTokens(
                  Math.max(0, Number(event.target.value) || 0)
                )
              }
            />
            <small>
              Tokens sent to the model, including prompt and context.
            </small>
          </div>

          <div className="ce-field">
            <label htmlFor="ce-output-tokens">
              Average output tokens per request
            </label>
            <input
              id="ce-output-tokens"
              type="number"
              min="0"
              value={outputTokens}
              onChange={(event) =>
                setOutputTokens(
                  Math.max(0, Number(event.target.value) || 0)
                )
              }
            />
            <small>
              Tokens generated by the model in its response.
            </small>
          </div>

          <div className="ce-field">
            <label htmlFor="ce-requests">Number of requests</label>
            <input
              id="ce-requests"
              type="number"
              min="0"
              value={requests}
              onChange={(event) =>
                setRequests(
                  Math.max(0, Number(event.target.value) || 0)
                )
              }
            />
            <small>
              Expected request volume for this estimate.
            </small>
          </div>

          <div className="ce-field">
            <label htmlFor="ce-currency">Display currency</label>
            <select
              id="ce-currency"
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
            >
              <option value="USD">USD — US Dollar</option>
              <option value="INR">INR — Indian Rupee</option>
            </select>
          </div>
        </section>

        <section className="ce-panel">
          <div className="ce-panel-heading">
            <div>
              <h2>Model pricing</h2>
              <p>Configure the rates used by this calculator.</p>
            </div>
            <span className="ce-editable-label">EDITABLE</span>
          </div>

          <div className="ce-provider-info">
            <span>Selected provider</span>
            <strong>{model?.provider ?? "Custom"}</strong>
          </div>

          <div className="ce-price-fields">
            <div className="ce-field">
              <label htmlFor="ce-input-price">
                Input price per 1M tokens (USD)
              </label>
              <input
                id="ce-input-price"
                type="number"
                min="0"
                step="0.01"
                placeholder={String(model?.input ?? 0)}
                value={customInputPrice}
                onChange={(event) =>
                  setCustomInputPrice(event.target.value)
                }
              />
              <small>
                Default sample rate: ${model?.input ?? 0} per million tokens.
              </small>
            </div>

            <div className="ce-field">
              <label htmlFor="ce-output-price">
                Output price per 1M tokens (USD)
              </label>
              <input
                id="ce-output-price"
                type="number"
                min="0"
                step="0.01"
                placeholder={String(model?.output ?? 0)}
                value={customOutputPrice}
                onChange={(event) =>
                  setCustomOutputPrice(event.target.value)
                }
              />
              <small>
                Default sample rate: ${model?.output ?? 0} per million tokens.
              </small>
            </div>
          </div>

          <div className="ce-pricing-note">
            <strong>Pricing note</strong>
            <p>
              These are editable demonstration values. Actual provider prices
              may differ by model version, region, context window, cached
              tokens, batch usage, and provider billing rules.
            </p>
          </div>

          <div className="ce-breakdown">
            <h3>Cost breakdown</h3>

            <div className="ce-breakdown-row">
              <span>Input token cost</span>
              <strong>{displayMoney(estimate.inputCost)}</strong>
            </div>

            <div className="ce-breakdown-row">
              <span>Output token cost</span>
              <strong>{displayMoney(estimate.outputCost)}</strong>
            </div>

            <div className="ce-breakdown-row ce-breakdown-total">
              <span>Total estimated cost</span>
              <strong>{displayMoney(estimate.total)}</strong>
            </div>
          </div>

          <button
            type="button"
            className="ce-copy-btn"
            onClick={copyEstimate}
          >
            <Copy size={15} />
            Copy estimate report
          </button>
        </section>
      </div>

      <section className="ce-panel ce-projection-panel">
        <div className="ce-panel-heading">
          <div>
            <h2>Usage projection</h2>
            <p>Estimated spend at different request volumes.</p>
          </div>
        </div>

        <div className="ce-projection-table-wrap">
          <table className="ce-projection-table">
            <thead>
              <tr>
                <th>Request volume</th>
                <th>Input tokens</th>
                <th>Output tokens</th>
                <th>Estimated cost</th>
              </tr>
            </thead>

            <tbody>
              {[100, 1000, 10000, 100000].map((volume) => {
                const inputTotal =
                  (inputTokens * volume * inputPrice) / 1_000_000;

                const outputTotal =
                  (outputTokens * volume * outputPrice) / 1_000_000;

                return (
                  <tr key={volume}>
                    <td>{volume.toLocaleString("en-US")}</td>
                    <td>
                      {(inputTokens * volume).toLocaleString("en-US")}
                    </td>
                    <td>
                      {(outputTokens * volume).toLocaleString("en-US")}
                    </td>
                    <td className="ce-table-cost">
                      {displayMoney(inputTotal + outputTotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}