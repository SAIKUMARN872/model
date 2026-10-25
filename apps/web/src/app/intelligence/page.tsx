"use client";

import { useState } from "react";

const models = [
  {
    name: "Fast Model",
    provider: "Low-cost inference",
    cost: "$0.0008",
    latency: "180 ms",
    quality: "87%",
    use: "Simple and high-volume tasks",
  },
  {
    name: "Balanced Model",
    provider: "General purpose",
    cost: "$0.0021",
    latency: "420 ms",
    quality: "94%",
    use: "Most business requests",
  },
  {
    name: "Reasoning Model",
    provider: "Advanced reasoning",
    cost: "$0.0085",
    latency: "980 ms",
    quality: "98%",
    use: "Complex analysis and reasoning",
  },
];

export default function IntelligencePage() {
  const [routingMode, setRoutingMode] = useState("Automatic");
  const [selectedModel, setSelectedModel] = useState("Auto");
  const [testPrompt, setTestPrompt] = useState("");
  const [result, setResult] = useState("");

  const analyzeRequest = () => {
    if (!testPrompt.trim()) return;

    setSelectedModel("Balanced Model");

    setResult(
      "ModelNow selected Balanced Model because it provides the best current balance between cost, latency and response quality."
    );
  };

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-gray-900">
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside className="hidden w-64 border-r bg-white p-5 md:block">

          <div className="mb-8">
            <h1 className="text-2xl font-bold">
              ModelNow
            </h1>

            <p className="mt-1 text-xs text-gray-500">
              Enterprise AI Platform
            </p>
          </div>

          <nav className="space-y-2">

            <a
              href="/chat"
              className="block rounded-lg px-4 py-3 text-sm text-gray-600 hover:bg-gray-100"
            >
              Chat
            </a>

            <a
              href="/intelligence"
              className="block rounded-lg bg-gray-100 px-4 py-3 text-sm font-semibold"
            >
              AI Intelligence
            </a>

            <a
              href="/documents"
              className="block rounded-lg px-4 py-3 text-sm text-gray-600 hover:bg-gray-100"
            >
              Files & Knowledge
            </a>

            <a
              href="/agents"
              className="block rounded-lg px-4 py-3 text-sm text-gray-600 hover:bg-gray-100"
            >
              Agents & Automation
            </a>

            <a
              href="/models"
              className="block rounded-lg px-4 py-3 text-sm text-gray-600 hover:bg-gray-100"
            >
              Models
            </a>

            <a
              href="/enterprise"
              className="block rounded-lg px-4 py-3 text-sm text-gray-600 hover:bg-gray-100"
            >
              Enterprise
            </a>

          </nav>

        </aside>

        {/* Main */}
        <section className="flex-1">

          {/* Header */}
          <header className="border-b bg-white px-6 py-5 md:px-10">

            <h1 className="text-2xl font-bold">
              ModelNow Intelligence
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Optimize every AI request for cost, latency and quality.
            </p>

          </header>

          <div className="mx-auto max-w-7xl space-y-6 p-6 md:p-10">

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-3">

              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <p className="text-sm text-gray-500">
                  Cost Optimization
                </p>

                <p className="mt-3 text-3xl font-bold">
                  ↓ 32%
                </p>

                <p className="mt-2 text-xs text-gray-500">
                  Estimated AI spending reduction
                </p>
              </div>

              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <p className="text-sm text-gray-500">
                  Latency Optimization
                </p>

                <p className="mt-3 text-3xl font-bold">
                  ↓ 41%
                </p>

                <p className="mt-2 text-xs text-gray-500">
                  Faster model selection and execution
                </p>
              </div>

              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <p className="text-sm text-gray-500">
                  Quality Improvement
                </p>

                <p className="mt-3 text-3xl font-bold">
                  ↑ 18%
                </p>

                <p className="mt-2 text-xs text-gray-500">
                  Better model-task matching
                </p>
              </div>

            </div>

            {/* Router */}
            <section className="rounded-2xl border bg-white p-6 shadow-sm">

              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

                <div>
                  <h2 className="text-xl font-semibold">
                    AI Model Router
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Automatically select the most suitable model for each request.
                  </p>
                </div>

                <select
                  value={routingMode}
                  onChange={(e) =>
                    setRoutingMode(e.target.value)
                  }
                  className="rounded-lg border px-4 py-2 text-sm"
                >
                  <option>Automatic</option>
                  <option>Cost Optimized</option>
                  <option>Latency Optimized</option>
                  <option>Quality Optimized</option>
                </select>

              </div>

              <div className="mt-6 rounded-xl bg-gray-50 p-5">

                <div className="grid gap-4 md:grid-cols-4">

                  <div>
                    <p className="text-xs text-gray-500">
                      Routing Mode
                    </p>

                    <p className="mt-1 font-semibold">
                      {routingMode}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Selected Model
                    </p>

                    <p className="mt-1 font-semibold">
                      {selectedModel}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Expected Cost
                    </p>

                    <p className="mt-1 font-semibold">
                      $0.0021
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Expected Latency
                    </p>

                    <p className="mt-1 font-semibold">
                      420 ms
                    </p>
                  </div>

                </div>

              </div>

            </section>

            {/* Model Comparison */}
            <section>

              <div className="mb-4">
                <h2 className="text-xl font-semibold">
                  Model Selection Intelligence
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Compare models before the backend router makes the final decision.
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">

                {models.map((model) => (

                  <button
                    key={model.name}
                    type="button"
                    onClick={() =>
                      setSelectedModel(model.name)
                    }
                    className={`rounded-2xl border bg-white p-6 text-left shadow-sm transition hover:shadow-md ${
                      selectedModel === model.name
                        ? "border-black"
                        : ""
                    }`}
                  >

                    <div className="flex items-center justify-between">

                      <h3 className="font-semibold">
                        {model.name}
                      </h3>

                      {selectedModel === model.name && (
                        <span className="rounded-full bg-black px-2 py-1 text-[10px] text-white">
                          Selected
                        </span>
                      )}

                    </div>

                    <p className="mt-1 text-xs text-gray-500">
                      {model.provider}
                    </p>

                    <div className="mt-6 grid grid-cols-3 gap-3">

                      <div>
                        <p className="text-xs text-gray-400">
                          Cost
                        </p>
                        <p className="mt-1 font-semibold">
                          {model.cost}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400">
                          Latency
                        </p>
                        <p className="mt-1 font-semibold">
                          {model.latency}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400">
                          Quality
                        </p>
                        <p className="mt-1 font-semibold">
                          {model.quality}
                        </p>
                      </div>

                    </div>

                    <div className="mt-5 border-t pt-4">

                      <p className="text-xs text-gray-500">
                        Best for
                      </p>

                      <p className="mt-1 text-sm">
                        {model.use}
                      </p>

                    </div>

                  </button>

                ))}

              </div>

            </section>

            {/* Test Router */}
            <section className="rounded-2xl border bg-white p-6 shadow-sm">

              <h2 className="text-xl font-semibold">
                Test ModelNow Router
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Enter a request and see which model ModelNow would select.
              </p>

              <div className="mt-5 flex flex-col gap-3 md:flex-row">

                <input
                  value={testPrompt}
                  onChange={(e) =>
                    setTestPrompt(e.target.value)
                  }
                  placeholder="Example: Analyze this enterprise sales report..."
                  className="flex-1 rounded-xl border px-4 py-3 text-sm outline-none focus:border-black"
                />

                <button
                  type="button"
                  onClick={analyzeRequest}
                  className="rounded-xl bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-800"
                >
                  Analyze Request
                </button>

              </div>

              {result && (
                <div className="mt-5 rounded-xl border bg-gray-50 p-5">

                  <p className="text-sm font-semibold">
                    ModelNow Decision
                  </p>

                  <p className="mt-2 text-sm text-gray-600">
                    {result}
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">

                    <div className="rounded-lg bg-white p-3">
                      <p className="text-xs text-gray-400">
                        Cost
                      </p>
                      <p className="mt-1 font-semibold">
                        Optimized
                      </p>
                    </div>

                    <div className="rounded-lg bg-white p-3">
                      <p className="text-xs text-gray-400">
                        Latency
                      </p>
                      <p className="mt-1 font-semibold">
                        Optimized
                      </p>
                    </div>

                    <div className="rounded-lg bg-white p-3">
                      <p className="text-xs text-gray-400">
                        Quality
                      </p>
                      <p className="mt-1 font-semibold">
                        High
                      </p>
                    </div>

                  </div>

                </div>
              )}

            </section>

            {/* Architecture explanation */}
            <section className="rounded-2xl bg-black p-6 text-white shadow-sm">

              <h2 className="text-xl font-semibold">
                How ModelNow Thinks
              </h2>

              <div className="mt-6 grid gap-4 md:grid-cols-5">

                {[
                  "User Request",
                  "Understand Context",
                  "Evaluate Models",
                  "Optimize Cost / Latency / Quality",
                  "Execute Best Model",
                ].map((step, index) => (

                  <div
                    key={step}
                    className="rounded-xl border border-gray-700 p-4"
                  >
                    <p className="text-xs text-gray-400">
                      Step {index + 1}
                    </p>

                    <p className="mt-2 text-sm font-medium">
                      {step}
                    </p>
                  </div>

                ))}

              </div>

            </section>

          </div>
        </section>
      </div>
    </main>
  );
}