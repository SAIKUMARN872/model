"use client";

import React, { useMemo, useState } from "react";

import ModelSelector from "../../components/playground/ModelSelector";
import ParameterPanel from "../../components/playground/ParameterPanel";
import PromptEditor from "../../components/playground/PromptEditor";
import ResponseViewer from "../../components/playground/ResponseViewer";

import usePlayground from "../../hooks/usePlayground";

import Spinner from "../../components/loading/Spinner";

/**
 * Enterprise AI Playground
 *
 * Route:
 * /playground
 *
 * Responsibilities:
 * - Select AI model
 * - Write and edit prompts
 * - Configure generation parameters
 * - Execute model requests
 * - Display model responses
 * - Track request status
 * - Handle errors
 * - Clear playground state
 */
export default function PlaygroundPage() {
  const [selectedModel, setSelectedModel] =
    useState("");

  const [prompt, setPrompt] =
    useState("");

  const [parameters, setParameters] =
    useState({
      temperature: 0.7,
      maxTokens: 1000,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
    });

  const [response, setResponse] =
    useState(null);

  const [error, setError] =
    useState(null);

  const [isRunning, setIsRunning] =
    useState(false);

  /**
   * Playground hook.
   *
   * The hook can later be connected to
   * playgroundApi.js for streaming or
   * non-streaming inference.
   */
  const playground = usePlayground();

  /**
   * Extract available models.
   */
  const models = useMemo(() => {
    const data =
      playground?.models ||
      playground?.data?.models ||
      [];

    return Array.isArray(data)
      ? data
      : [];
  }, [playground]);

  /**
   * Extract response from hook if available.
   */
  const hookResponse =
    playground?.response ||
    playground?.data?.response ||
    null;

  /**
   * Use local response first, then
   * hook response.
   */
  const displayedResponse =
    response ||
    hookResponse;

  /**
   * Handle model selection.
   */
  const handleModelChange = (
    model
  ) => {
    if (
      typeof model === "string"
    ) {
      setSelectedModel(model);
      return;
    }

    setSelectedModel(
      model?.id ||
        model?.modelId ||
        model?.name ||
        ""
    );
  };

  /**
   * Handle parameter changes.
   */
  const handleParameterChange = (
    name,
    value
  ) => {
    setParameters((current) => ({
      ...current,
      [name]: value,
    }));
  };

  /**
   * Execute playground request.
   */
  const handleRun = async () => {
    if (!selectedModel) {
      setError(
        "Please select a model before running the prompt."
      );

      return;
    }

    if (!prompt.trim()) {
      setError(
        "Please enter a prompt before running the request."
      );

      return;
    }

    try {
      setIsRunning(true);
      setError(null);
      setResponse(null);

      const payload = {
        model: selectedModel,
        prompt: prompt.trim(),
        parameters: {
          temperature:
            Number(
              parameters.temperature
            ),
          maxTokens:
            Number(
              parameters.maxTokens
            ),
          topP:
            Number(
              parameters.topP
            ),
          frequencyPenalty:
            Number(
              parameters.frequencyPenalty
            ),
          presencePenalty:
            Number(
              parameters.presencePenalty
            ),
        },
      };

      /**
       * Prefer the hook's execute method.
       */
      if (
        typeof playground?.run ===
        "function"
      ) {
        const result =
          await playground.run(
            payload
          );

        setResponse(result);
      } else if (
        typeof playground?.execute ===
        "function"
      ) {
        const result =
          await playground.execute(
            payload
          );

        setResponse(result);
      } else if (
        typeof playground?.runPlayground ===
        "function"
      ) {
        const result =
          await playground.runPlayground(
            payload
          );

        setResponse(result);
      } else {
        throw new Error(
          "Playground execution method is not available."
        );
      }
    } catch (requestError) {
      console.error(
        "Playground request failed:",
        requestError
      );

      setError(
        requestError?.message ||
          "Unable to execute the playground request."
      );
    } finally {
      setIsRunning(false);
    }
  };

  /**
   * Clear playground.
   */
  const handleClear = () => {
    setPrompt("");

    setResponse(null);

    setError(null);

    setParameters({
      temperature: 0.7,
      maxTokens: 1000,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
    });
  };

  /**
   * Stop execution.
   *
   * This will use the hook's cancel method
   * if one is implemented.
   */
  const handleStop = () => {
    if (
      typeof playground?.cancel ===
      "function"
    ) {
      playground.cancel();
    }

    if (
      typeof playground?.stop ===
      "function"
    ) {
      playground.stop();
    }

    setIsRunning(false);
  };

  /**
   * Initial model loading state.
   */
  const modelsLoading =
    playground?.loadingModels ||
    playground?.modelsLoading ||
    false;

  return (
    <main
      className="console-playground"
      aria-label="AI Playground"
    >
      {/* ========================================
          Page Header
      ========================================= */}
      <header className="playground-header">
        <div>
          <h1>
            Playground
          </h1>

          <p>
            Experiment with AI models,
            prompts, and generation
            parameters.
          </p>
        </div>

        <div className="playground-header__actions">
          <button
            type="button"
            onClick={handleClear}
            disabled={
              isRunning
            }
            className="playground-secondary-button"
          >
            Clear
          </button>

          {isRunning ? (
            <button
              type="button"
              onClick={handleStop}
              className="playground-danger-button"
            >
              Stop
            </button>
          ) : (
            <button
              type="button"
              onClick={handleRun}
              disabled={
                !selectedModel ||
                !prompt.trim()
              }
              className="playground-primary-button"
            >
              Run
            </button>
          )}
        </div>
      </header>

      {/* ========================================
          Error Banner
      ========================================= */}
      {error && (
        <div
          className="playground-error"
          role="alert"
        >
          <div>
            <strong>
              Request Error
            </strong>

            <p>
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setError(null)
            }
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {/* ========================================
          Main Playground Layout
      ========================================= */}
      <div className="playground-layout">
        {/* ======================================
            Left Configuration Panel
        ======================================= */}
        <aside
          className="playground-sidebar"
          aria-label="Playground configuration"
        >
          {/* Model Selector */}
          <section className="playground-panel">
            <header className="playground-panel__header">
              <h2>
                Model
              </h2>

              <p>
                Select the model to use.
              </p>
            </header>

            <div className="playground-panel__content">
              {modelsLoading ? (
                <div className="playground-loading">
                  <Spinner />

                  <span>
                    Loading models...
                  </span>
                </div>
              ) : (
                <ModelSelector
                  models={models}
                  value={
                    selectedModel
                  }
                  selectedModel={
                    selectedModel
                  }
                  onChange={
                    handleModelChange
                  }
                  onModelChange={
                    handleModelChange
                  }
                />
              )}
            </div>
          </section>

          {/* Parameters */}
          <section className="playground-panel">
            <header className="playground-panel__header">
              <h2>
                Parameters
              </h2>

              <p>
                Configure model generation.
              </p>
            </header>

            <div className="playground-panel__content">
              <ParameterPanel
                parameters={
                  parameters
                }
                values={
                  parameters
                }
                onChange={
                  handleParameterChange
                }
                onParameterChange={
                  handleParameterChange
                }
              />
            </div>
          </section>
        </aside>

        {/* ======================================
            Main Workspace
        ======================================= */}
        <section
          className="playground-workspace"
          aria-label="Prompt workspace"
        >
          {/* Prompt Editor */}
          <div className="playground-workspace__section">
            <header className="playground-section-header">
              <div>
                <h2>
                  Prompt
                </h2>

                <p>
                  Enter instructions for
                  the selected model.
                </p>
              </div>

              <span>
                {prompt.length} characters
              </span>
            </header>

            <PromptEditor
              value={prompt}
              prompt={prompt}
              onChange={setPrompt}
              onPromptChange={
                setPrompt
              }
              disabled={isRunning}
            />
          </div>

          {/* Response */}
          <div className="playground-workspace__section">
            <header className="playground-section-header">
              <div>
                <h2>
                  Response
                </h2>

                <p>
                  Model output will appear
                  here.
                </p>
              </div>

              {isRunning && (
                <div className="playground-running">
                  <Spinner />

                  <span>
                    Generating response...
                  </span>
                </div>
              )}
            </header>

            <div className="playground-response">
              {isRunning &&
              !displayedResponse ? (
                <div className="playground-response-loading">
                  <Spinner />

                  <p>
                    Waiting for model
                    response...
                  </p>
                </div>
              ) : displayedResponse ? (
                <ResponseViewer
                  response={
                    displayedResponse
                  }
                  data={
                    displayedResponse
                  }
                />
              ) : (
                <div className="playground-response-empty">
                  <h3>
                    No response yet
                  </h3>

                  <p>
                    Select a model, enter
                    a prompt, and click
                    Run to generate a
                    response.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* ========================================
          Request Metadata
      ========================================= */}
      {displayedResponse && (
        <section
          className="playground-metadata"
          aria-label="Request metadata"
        >
          <div className="playground-metadata-card">
            <span>
              Model
            </span>

            <strong>
              {selectedModel ||
                "—"}
            </strong>
          </div>

          <div className="playground-metadata-card">
            <span>
              Temperature
            </span>

            <strong>
              {
                parameters.temperature
              }
            </strong>
          </div>

          <div className="playground-metadata-card">
            <span>
              Max Tokens
            </span>

            <strong>
              {
                parameters.maxTokens
              }
            </strong>
          </div>

          <div className="playground-metadata-card">
            <span>
              Top P
            </span>

            <strong>
              {parameters.topP}
            </strong>
          </div>
        </section>
      )}
    </main>
  );
}