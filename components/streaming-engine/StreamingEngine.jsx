import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const StreamingEngine = ({
  apiBaseUrl = "/api",
  workspaceId,
  organizationId,
}) => {
  const [prompt, setPrompt] = useState("");
  const [streamedOutput, setStreamedOutput] =
    useState("");

  const [sessions, setSessions] =
    useState([]);

  const [activeSession, setActiveSession] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [streaming, setStreaming] =
    useState(false);

  const [error, setError] =
    useState(null);

  const [config, setConfig] = useState({
    model: "default",
    temperature: 0.2,
    maxTokens: 4096,
    streamMode: "realtime",
  });

  const abortControllerRef =
    useRef(null);

  const outputRef = useRef(null);

  const loadSessions = useCallback(
    async () => {
      try {
        setLoading(true);
        setError(null);

        const params =
          new URLSearchParams();

        if (workspaceId) {
          params.set(
            "workspaceId",
            workspaceId
          );
        }

        if (organizationId) {
          params.set(
            "organizationId",
            organizationId
          );
        }

        const response =
          await fetch(
            `${apiBaseUrl}/streaming/sessions?${params.toString()}`,
            {
              method: "GET",
              credentials: "include",
              headers: {
                Accept:
                  "application/json",
              },
            }
          );

        if (!response.ok) {
          throw new Error(
            `Failed to load streaming sessions (${response.status}).`
          );
        }

        const data =
          await response.json();

        setSessions(
          Array.isArray(
            data.sessions
          )
            ? data.sessions
            : []
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load streaming sessions."
        );
      } finally {
        setLoading(false);
      }
    },
    [
      apiBaseUrl,
      workspaceId,
      organizationId,
    ]
  );

  useEffect(() => {
    loadSessions();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [loadSessions]);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop =
        outputRef.current.scrollHeight;
    }
  }, [streamedOutput]);

  const startStreaming = async (
    event
  ) => {
    event.preventDefault();

    const normalizedPrompt =
      prompt.trim();

    if (!normalizedPrompt) {
      setError(
        "Please enter a prompt to start streaming."
      );
      return;
    }

    if (streaming) {
      return;
    }

    const controller =
      new AbortController();

    abortControllerRef.current =
      controller;

    try {
      setStreaming(true);
      setError(null);
      setStreamedOutput("");
      setActiveSession(null);

      const response =
        await fetch(
          `${apiBaseUrl}/streaming/execute`,
          {
            method: "POST",
            credentials: "include",
            signal:
              controller.signal,
            headers: {
              "Content-Type":
                "application/json",
              Accept:
                "text/event-stream, application/json",
            },
            body: JSON.stringify({
              prompt:
                normalizedPrompt,
              workspaceId,
              organizationId,
              config,
            }),
          }
        );

      if (!response.ok) {
        throw new Error(
          `Streaming request failed (${response.status}).`
        );
      }

      if (!response.body) {
        throw new Error(
          "Streaming response is not supported by this server."
        );
      }

      const reader =
        response.body.getReader();

      const decoder =
        new TextDecoder("utf-8");

      let buffer = "";
      let sessionData = null;

      const processEvent = (
        rawEvent
      ) => {
        const lines =
          rawEvent.split("\n");

        let eventType = "message";
        let data = "";

        lines.forEach((line) => {
          if (
            line.startsWith(
              "event:"
            )
          ) {
            eventType =
              line
                .slice(6)
                .trim();
          }

          if (
            line.startsWith(
              "data:"
            )
          ) {
            data +=
              line
                .slice(5)
                .trim();
          }
        });

        if (!data) {
          return;
        }

        let parsed;

        try {
          parsed =
            JSON.parse(data);
        } catch {
          parsed = {
            content: data,
          };
        }

        if (
          eventType ===
            "session" ||
          parsed.type ===
            "session"
        ) {
          sessionData =
            parsed.session ||
            parsed;

          setActiveSession(
            sessionData
          );

          return;
        }

        if (
          eventType ===
            "token" ||
          eventType ===
            "content" ||
          parsed.type ===
            "token" ||
          parsed.type ===
            "content"
        ) {
          const content =
            parsed.content ||
            parsed.token ||
            parsed.text ||
            "";

          setStreamedOutput(
            (current) =>
              current + content
          );

          return;
        }

        if (
          eventType ===
            "complete" ||
          parsed.type ===
            "complete"
        ) {
          const finalContent =
            parsed.content ||
            parsed.output;

          if (finalContent) {
            setStreamedOutput(
              finalContent
            );
          }

          if (
            parsed.session
          ) {
            setActiveSession(
              parsed.session
            );
          }

          return;
        }

        if (
          eventType ===
            "error" ||
          parsed.type ===
            "error"
        ) {
          throw new Error(
            parsed.message ||
              "Streaming engine returned an error."
          );
        }
      };

      while (true) {
        const { value, done } =
          await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(
          value,
          {
            stream: true,
          }
        );

        const events =
          buffer.split(
            /\r?\n\r?\n/
          );

        buffer =
          events.pop() || "";

        for (const event of events) {
          processEvent(event);
        }
      }

      if (buffer.trim()) {
        processEvent(buffer);
      }

      const completedSession = {
        ...(sessionData || {}),
        id:
          sessionData?.id ||
          `local-${Date.now()}`,
        prompt:
          normalizedPrompt,
        output:
          streamedOutput,
        createdAt:
          sessionData?.createdAt ||
          new Date().toISOString(),
      };

      setSessions((current) => [
        completedSession,
        ...current.filter(
          (session) =>
            session.id !==
            completedSession.id
        ),
      ]);

      setPrompt("");
    } catch (err) {
      if (
        err?.name ===
        "AbortError"
      ) {
        return;
      }

      setError(
        err instanceof Error
          ? err.message
          : "Streaming execution failed."
      );
    } finally {
      setStreaming(false);
      abortControllerRef.current =
        null;
    }
  };

  const stopStreaming = () => {
    abortControllerRef.current?.abort();

    setStreaming(false);
  };

  const clearOutput = () => {
    setStreamedOutput("");
    setActiveSession(null);
    setError(null);
  };

  const selectSession = (
    session
  ) => {
    setActiveSession(session);
    setPrompt(
      session.prompt || ""
    );
    setStreamedOutput(
      session.output ||
        session.content ||
        ""
    );
  };

  const metrics = useMemo(() => {
    const totalTokens =
      sessions.reduce(
        (sum, session) =>
          sum +
          Number(
            session.totalTokens ||
              0
          ),
        0
      );

    const totalCost =
      sessions.reduce(
        (sum, session) =>
          sum +
          Number(
            session.cost || 0
          ),
        0
      );

    const averageLatency =
      sessions.length > 0
        ? sessions.reduce(
            (sum, session) =>
              sum +
              Number(
                session.latency ||
                  0
              ),
            0
          ) /
          sessions.length
        : 0;

    return {
      totalSessions:
        sessions.length,
      totalTokens,
      totalCost,
      averageLatency,
    };
  }, [sessions]);

  const formatNumber = (
    value
  ) =>
    new Intl.NumberFormat(
      "en-US",
      {
        notation: "compact",
        maximumFractionDigits: 1,
      }
    ).format(
      Number(value) || 0
    );

  const formatCurrency = (
    value
  ) =>
    new Intl.NumberFormat(
      "en-US",
      {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 4,
      }
    ).format(
      Number(value) || 0
    );

  if (loading) {
    return (
      <section className="streaming-engine">
        <div className="streaming-engine__loading">
          Loading streaming engine...
        </div>
      </section>
    );
  }

  return (
    <section className="streaming-engine">
      <header className="streaming-engine__header">
        <div>
          <span className="streaming-engine__eyebrow">
            AI Runtime
          </span>

          <h1>
            Streaming Engine
          </h1>

          <p>
            Run real-time AI generation
            with token streaming,
            runtime controls, and
            enterprise observability.
          </p>
        </div>

        <button
          type="button"
          onClick={loadSessions}
          disabled={streaming}
        >
          Refresh
        </button>
      </header>

      {error && (
        <div
          className="streaming-engine__error"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="streaming-engine__metrics">
        <article>
          <span>
            Total Sessions
          </span>

          <strong>
            {metrics.totalSessions}
          </strong>
        </article>

        <article>
          <span>
            Total Tokens
          </span>

          <strong>
            {formatNumber(
              metrics.totalTokens
            )}
          </strong>
        </article>

        <article>
          <span>
            Total Cost
          </span>

          <strong>
            {formatCurrency(
              metrics.totalCost
            )}
          </strong>
        </article>

        <article>
          <span>
            Avg. Latency
          </span>

          <strong>
            {metrics.averageLatency.toFixed(
              0
            )}
            ms
          </strong>
        </article>
      </div>

      <div className="streaming-engine__workspace">
        <form
          className="streaming-engine__composer"
          onSubmit={startStreaming}
        >
          <div className="streaming-engine__composer-header">
            <div>
              <h2>
                Live AI Stream
              </h2>

              <span
                className={
                  streaming
                    ? "streaming-engine__live"
                    : "streaming-engine__idle"
                }
              >
                {streaming
                  ? "● Streaming"
                  : "● Ready"}
              </span>
            </div>

            {streaming && (
              <button
                type="button"
                onClick={
                  stopStreaming
                }
              >
                Stop
              </button>
            )}
          </div>

          <textarea
            value={prompt}
            onChange={(event) =>
              setPrompt(
                event.target.value
              )
            }
            placeholder="Enter a prompt and start a real-time AI stream..."
            rows={8}
            maxLength={20000}
            disabled={streaming}
          />

          <div className="streaming-engine__config">
            <label>
              Model

              <select
                value={config.model}
                disabled={streaming}
                onChange={(event) =>
                  setConfig(
                    (current) => ({
                      ...current,
                      model:
                        event.target
                          .value,
                    })
                  )
                }
              >
                <option value="default">
                  Default
                </option>

                <option value="fast">
                  Fast Model
                </option>

                <option value="advanced">
                  Advanced Model
                </option>
              </select>
            </label>

            <label>
              Temperature

              <input
                type="number"
                min="0"
                max="2"
                step="0.1"
                value={
                  config.temperature
                }
                disabled={streaming}
                onChange={(event) =>
                  setConfig(
                    (current) => ({
                      ...current,
                      temperature:
                        Number(
                          event.target
                            .value
                        ),
                    })
                  )
                }
              />
            </label>

            <label>
              Max Tokens

              <input
                type="number"
                min="256"
                max="128000"
                step="256"
                value={
                  config.maxTokens
                }
                disabled={streaming}
                onChange={(event) =>
                  setConfig(
                    (current) => ({
                      ...current,
                      maxTokens:
                        Number(
                          event.target
                            .value
                        ),
                    })
                  )
                }
              />
            </label>

            <label>
              Stream Mode

              <select
                value={
                  config.streamMode
                }
                disabled={streaming}
                onChange={(event) =>
                  setConfig(
                    (current) => ({
                      ...current,
                      streamMode:
                        event.target
                          .value,
                    })
                  )
                }
              >
                <option value="realtime">
                  Realtime
                </option>

                <option value="buffered">
                  Buffered
                </option>
              </select>
            </label>
          </div>

          <div className="streaming-engine__actions">
            <button
              type="submit"
              disabled={
                streaming ||
                !prompt.trim()
              }
            >
              {streaming
                ? "Streaming..."
                : "Start Stream"}
            </button>

            <button
              type="button"
              onClick={clearOutput}
              disabled={
                streaming ||
                !streamedOutput
              }
            >
              Clear
            </button>
          </div>
        </form>

        <div className="streaming-engine__output">
          <header>
            <div>
              <h2>
                Live Output
              </h2>

              {activeSession?.id && (
                <span>
                  Session:{" "}
                  {activeSession.id}
                </span>
              )}
            </div>

            {streaming && (
              <span className="streaming-engine__pulse">
                ● Live
              </span>
            )}
          </header>

          <div
            ref={outputRef}
            className="streaming-engine__output-body"
          >
            {streamedOutput ? (
              <pre>
                {streamedOutput}
                {streaming && (
                  <span className="streaming-engine__cursor">
                    ▌
                  </span>
                )}
              </pre>
            ) : (
              <div className="streaming-engine__output-empty">
                <span>
                  ⚡
                </span>

                <h3>
                  Ready for streaming
                </h3>

                <p>
                  Enter a prompt to
                  generate a real-time
                  AI response.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="streaming-engine__history">
        <header>
          <div>
            <h2>
              Streaming Sessions
            </h2>

            <span>
              {sessions.length} sessions
            </span>
          </div>
        </header>

        {sessions.length === 0 ? (
          <div className="streaming-engine__empty">
            No streaming sessions
            available.
          </div>
        ) : (
          <div className="streaming-engine__session-list">
            {sessions.map(
              (session) => (
                <article
                  key={session.id}
                  className="streaming-engine__session"
                >
                  <div>
                    <span>
                      {session.model ||
                        "Default Model"}
                    </span>

                    <h3>
                      {session.title ||
                        session.prompt ||
                        "Untitled Session"}
                    </h3>

                    <p>
                      {(
                        session.output ||
                        session.content ||
                        ""
                      ).slice(
                        0,
                        180
                      )}
                      {(session.output ||
                        session.content ||
                        "").length >
                        180 &&
                        "..."}
                    </p>
                  </div>

                  <div className="streaming-engine__session-meta">
                    <span>
                      Tokens:{" "}
                      {formatNumber(
                        session.totalTokens
                      )}
                    </span>

                    <span>
                      Cost:{" "}
                      {formatCurrency(
                        session.cost
                      )}
                    </span>

                    <span>
                      Latency:{" "}
                      {Number(
                        session.latency ||
                          0
                      ).toFixed(0)}
                      ms
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      selectSession(
                        session
                      )
                    }
                  >
                    View Session
                  </button>
                </article>
              )
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default StreamingEngine;