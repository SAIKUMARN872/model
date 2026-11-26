import { useMemo, useState } from "react";
import {
  Activity,
  Clock3,
  Download,
  Play,
  RotateCcw,
  Timer,
  Zap,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { testPlayground } from "../../services/playgroundApi";
import "./latency.css";

type LatencyResult = {
  id: number;
  run: number;
  latency: number;
  success: boolean;
  timestamp: string;
  error?: string;
  responsePreview?: string;
};

export default function LatencyTestingPage() {
  const [model, setModel] = useState("GPT-4o-mini");
  const [prompt, setPrompt] = useState(
    "Explain how an AI model processes a user request in three sentences."
  );
  const [iterations, setIterations] = useState(5);
  const [results, setResults] = useState<LatencyResult[]>([]);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [runStarted, setRunStarted] = useState(false);

  const successfulResults = results.filter((item) => item.success);
  const failedResults = results.filter((item) => !item.success);

  const metrics = useMemo(() => {
    const values = successfulResults
      .map((item) => item.latency)
      .sort((a, b) => a - b);

    if (!values.length) {
      return {
        average: 0,
        minimum: 0,
        maximum: 0,
        median: 0,
      };
    }

    const total = values.reduce((sum, value) => sum + value, 0);
    const middle = Math.floor(values.length / 2);

    return {
      average: total / values.length,
      minimum: values[0],
      maximum: values[values.length - 1],
      median:
        values.length % 2 === 0
          ? (values[middle - 1] + values[middle]) / 2
          : values[middle],
    };
  }, [results]);

  const successRate =
    results.length > 0
      ? (successfulResults.length / results.length) * 100
      : 0;

  const chartMaximum = Math.max(
    100,
    ...successfulResults.map((item) => item.latency)
  );

  async function runLatencyTest() {
    if (!prompt.trim() || !model.trim() || running) return;

    setRunning(true);
    setRunStarted(true);
    setResults([]);
    setProgress(0);

    const collected: LatencyResult[] = [];

    for (let index = 0; index < iterations; index += 1) {
      const start = performance.now();

      try {
        const response = await testPlayground({
          input: prompt.trim(),
          model: model.trim(),
        });

        const elapsed = performance.now() - start;

        const responseText =
          response.output ??
          response.content ??
          response.response ??
          response.choices?.[0]?.message?.content ??
          response.choices?.[0]?.text ??
          "";

        collected.push({
          id: Date.now() + index,
          run: index + 1,
          latency: elapsed,
          success: true,
          timestamp: new Date().toLocaleTimeString(),
          responsePreview:
            typeof responseText === "string"
              ? responseText.slice(0, 180)
              : JSON.stringify(responseText).slice(0, 180),
        });
      } catch (error) {
        const elapsed = performance.now() - start;

        collected.push({
          id: Date.now() + index,
          run: index + 1,
          latency: elapsed,
          success: false,
          timestamp: new Date().toLocaleTimeString(),
          error:
            error instanceof Error
              ? error.message
              : "Request failed",
        });
      }

      setResults([...collected]);
      setProgress(index + 1);
    }

    setRunning(false);
  }

  function clearResults() {
    if (running) return;

    setResults([]);
    setProgress(0);
    setRunStarted(false);
  }

  function exportResults() {
    const report = {
      model,
      prompt,
      iterations,
      generatedAt: new Date().toISOString(),
      metrics: {
        averageMs: Number(metrics.average.toFixed(2)),
        minimumMs: Number(metrics.minimum.toFixed(2)),
        maximumMs: Number(metrics.maximum.toFixed(2)),
        medianMs: Number(metrics.median.toFixed(2)),
        successRate: Number(successRate.toFixed(2)),
      },
      results,
    };

    const blob = new Blob(
      [JSON.stringify(report, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "modelnow-latency-report.json";
    anchor.click();

    URL.revokeObjectURL(url);
  }

  return (
    <main className="lt-page">
      <section className="lt-metrics">
        <div className="lt-metric-card">
          <div className="lt-metric-icon">
            <Timer size={18} />
          </div>
          <span>Average latency</span>
          <strong>
            {metrics.average.toFixed(2)} <small>ms</small>
          </strong>
          <p>Across successful requests</p>
        </div>

        <div className="lt-metric-card">
          <div className="lt-metric-icon">
            <Zap size={18} />
          </div>
          <span>Minimum latency</span>
          <strong>
            {metrics.minimum.toFixed(2)} <small>ms</small>
          </strong>
          <p>Fastest successful request</p>
        </div>

        <div className="lt-metric-card">
          <div className="lt-metric-icon">
            <Clock3 size={18} />
          </div>
          <span>Maximum latency</span>
          <strong>
            {metrics.maximum.toFixed(2)} <small>ms</small>
          </strong>
          <p>Slowest successful request</p>
        </div>

        <div className="lt-metric-card">
          <div className="lt-metric-icon">
            <CheckCircle2 size={18} />
          </div>
          <span>Success rate</span>
          <strong>
            {successRate.toFixed(1)}
            <small>%</small>
          </strong>
          <p>
            {successfulResults.length} successful / {failedResults.length} failed
          </p>
        </div>
      </section>

      <div className="lt-main-grid">
        <section className="lt-panel lt-config-panel">
          <div className="lt-panel-heading">
            <div>
              <h2>Test configuration</h2>
              <p>Configure your latency test parameters.</p>
            </div>

            <div className="lt-header-actions">
              <span className="lt-status">
                <span />
                API response measurement
              </span>

              <button
                type="button"
                className="lt-secondary-btn"
                onClick={clearResults}
                disabled={running || results.length === 0}
              >
                <RotateCcw size={14} />
                Clear results
              </button>
            </div>
          </div>

          <div className="lt-field">
            <label htmlFor="lt-model">Model</label>
            <input
              id="lt-model"
              value={model}
              onChange={(event) => setModel(event.target.value)}
              placeholder="Enter model name"
              disabled={running}
            />
          </div>

          <div className="lt-field">
            <label htmlFor="lt-prompt">Test prompt</label>
            <textarea
              id="lt-prompt"
              rows={5}
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Enter a prompt for latency testing..."
              disabled={running}
            />
          </div>

          <div className="lt-field">
            <label htmlFor="lt-iterations">
              Number of test requests
            </label>
            <select
              id="lt-iterations"
              value={iterations}
              onChange={(event) =>
                setIterations(Number(event.target.value))
              }
              disabled={running}
            >
              <option value={1}>1 request</option>
              <option value={3}>3 requests</option>
              <option value={5}>5 requests</option>
              <option value={10}>10 requests</option>
              <option value={20}>20 requests</option>
            </select>
            <small>
              Requests run sequentially, one after another.
            </small>
          </div>

          <button
            type="button"
            className="lt-run-btn"
            onClick={runLatencyTest}
            disabled={running || !prompt.trim() || !model.trim()}
          >
            {running ? (
              <>
                <span className="lt-spinner" />
                Running {progress}/{iterations}
              </>
            ) : (
              <>
                <Play size={16} fill="currentColor" />
                Run latency test
              </>
            )}
          </button>

          {running && (
            <div className="lt-progress">
              <div>
                <span>Test progress</span>
                <strong>
                  {Math.round((progress / iterations) * 100)}%
                </strong>
              </div>

              <div className="lt-progress-track">
                <span
                  style={{
                    width: `${(progress / iterations) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          <div className="lt-config-note">
            <strong>Measurement details</strong>
            <p>
              Each measurement includes the frontend-to-backend request
              round trip, including network and server processing time.
              It is not isolated model inference time.
            </p>
          </div>
        </section>

        <section className="lt-panel lt-chart-panel">
          <div className="lt-panel-heading">
            <div>
              <h2>Latency performance</h2>
              <p>
                Response time for each successful test request.
              </p>
            </div>
            <span className="lt-unit-badge">MILLISECONDS</span>
          </div>

          {successfulResults.length > 0 ? (
            <div className="lt-chart">
              <div className="lt-chart-y-labels">
                <span>{Math.round(chartMaximum)} ms</span>
                <span>{Math.round(chartMaximum * 0.75)} ms</span>
                <span>{Math.round(chartMaximum * 0.5)} ms</span>
                <span>{Math.round(chartMaximum * 0.25)} ms</span>
                <span>0 ms</span>
              </div>

              <div className="lt-chart-bars">
                {successfulResults.map((item) => (
                  <div className="lt-chart-column" key={item.id}>
                    <div className="lt-bar-value">
                      {item.latency.toFixed(0)}
                    </div>

                    <div className="lt-bar-track">
                      <div
                        className="lt-bar"
                        style={{
                          height: `${Math.max(
                            2,
                            (item.latency / chartMaximum) * 100
                          )}%`,
                        }}
                      />
                    </div>

                    <span>#{item.run}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="lt-chart-empty">
              <div>
                <Activity size={25} />
              </div>
              <strong>No latency data yet</strong>
              <p>
                Run a test to see response-time measurements here.
              </p>
            </div>
          )}

          <div className="lt-chart-footer">
            <span>
              <i className="lt-legend-dot" />
              Successful requests
            </span>
            <span>{successfulResults.length} data points</span>
          </div>
        </section>
      </div>

      <section className="lt-panel lt-results-panel">
        <div className="lt-panel-heading">
          <div>
            <h2>Request results</h2>
            <p>Detailed response times and request status.</p>
          </div>

          <button
            type="button"
            className="lt-export-btn"
            onClick={exportResults}
            disabled={results.length === 0 || running}
          >
            <Download size={15} />
            Export JSON
          </button>
        </div>

        {results.length > 0 ? (
          <div className="lt-table-wrap">
            <table className="lt-table">
              <thead>
                <tr>
                  <th>Request</th>
                  <th>Status</th>
                  <th>Latency</th>
                  <th>Timestamp</th>
                  <th>Details</th>
                </tr>
              </thead>

              <tbody>
                {results.map((item) => (
                  <tr key={item.id}>
                    <td>Request #{item.run}</td>

                    <td>
                      <span
                        className={
                          item.success
                            ? "lt-result-status lt-success"
                            : "lt-result-status lt-failed"
                        }
                      >
                        {item.success ? (
                          <CheckCircle2 size={13} />
                        ) : (
                          <XCircle size={13} />
                        )}
                        {item.success ? "Success" : "Failed"}
                      </span>
                    </td>

                    <td className="lt-latency-value">
                      {item.latency.toFixed(2)} ms
                    </td>

                    <td>{item.timestamp}</td>

                    <td className="lt-details-cell">
                      {item.error ||
                        item.responsePreview ||
                        "No response text"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="lt-empty-results">
            <Clock3 size={25} />
            <strong>
              {runStarted ? "No results available" : "No test runs yet"}
            </strong>
            <p>
              Configure your test and run it to populate the results table.
            </p>
          </div>
        )}
      </section>

      <section className="lt-panel lt-statistics-panel">
        <div className="lt-panel-heading">
          <div>
            <h2>Additional statistics</h2>
            <p>
              Summary of the completed successful measurements.
            </p>
          </div>
        </div>

        <div className="lt-statistics-grid">
          <div>
            <span>Median latency</span>
            <strong>{metrics.median.toFixed(2)} ms</strong>
          </div>

          <div>
            <span>Completed requests</span>
            <strong>{results.length}</strong>
          </div>

          <div>
            <span>Successful requests</span>
            <strong>{successfulResults.length}</strong>
          </div>

          <div>
            <span>Failed requests</span>
            <strong>{failedResults.length}</strong>
          </div>
        </div>
      </section>
    </main>
  );
}