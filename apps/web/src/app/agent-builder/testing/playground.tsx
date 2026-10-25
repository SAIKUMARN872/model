"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Copy,
  Database,
  FileText,
  Play,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Target,
  TestTube2,
  UserRound,
  XCircle,
  Zap,
} from "lucide-react";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  latency?: string;
  tokens?: number;
};

type ModelOption = {
  name: string;
  provider: string;
  description: string;
};

const models: ModelOption[] = [
  {
    name: "GPT-5",
    provider: "OpenAI",
    description: "General-purpose reasoning and generation",
  },
  {
    name: "Claude Sonnet",
    provider: "Anthropic",
    description: "Strong reasoning and long-context tasks",
  },
  {
    name: "Gemini",
    provider: "Google",
    description: "Multimodal and high-volume workloads",
  },
];

const initialMessages: Message[] = [
  {
    id: 1,
    role: "user",
    content:
      "Explain how an AI agent can use tools to complete a multi-step workflow.",
  },
  {
    id: 2,
    role: "assistant",
    content:
      "An AI agent can combine reasoning, tools, memory, and workflow steps. It first interprets the goal, plans the required actions, calls the appropriate tools, observes their results, and then continues until the task is completed or human approval is required.",
    latency: "1.24s",
    tokens: 184,
  },
];

export default function PlaygroundPage() {
  const [model, setModel] = useState("GPT-5");
  const [temperature, setTemperature] = useState("0.7");
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful AI assistant. Give accurate, concise and useful answers."
  );
  const [input, setInput] = useState("");
  const [messages, setMessages] =
    useState<Message[]>(initialMessages);
  const [isRunning, setIsRunning] = useState(false);
  const [activePanel, setActivePanel] = useState<
    "chat" | "evaluation" | "trace"
  >("chat");
  const [showSettings, setShowSettings] = useState(true);

  const selectedModel = useMemo(() => {
    return models.find((item) => item.name === model) ?? models[0];
  }, [model]);

  const totalTokens = useMemo(() => {
    return messages.reduce(
      (total, message) => total + (message.tokens ?? 0),
      0
    );
  }, [messages]);

  const runPrompt = () => {
    const trimmedInput = input.trim();

    if (!trimmedInput || isRunning) {
      return;
    }

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: trimmedInput,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsRunning(true);

    window.setTimeout(() => {
      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content:
          "This Playground response is ready for backend model execution. The production runtime can connect the selected model, collect tokens, measure latency, evaluate quality, and create an execution trace.",
        latency: "1.31s",
        tokens: 142,
      };

      setMessages((current) => [
        ...current,
        assistantMessage,
      ]);

      setIsRunning(false);
    }, 900);
  };

  const clearConversation = () => {
    setMessages([]);
  };

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#172033]">
      <div className="mx-auto max-w-[1600px] px-6 py-5">
        <header className="mb-5 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-[#667085]">
              <Link
                href="/agent-builder"
                className="hover:text-[#172033]"
              >
                Agent Builder
              </Link>

              <span>/</span>

              <Link
                href="/agent-builder/testing"
                className="hover:text-[#172033]"
              >
                Testing & Evaluation
              </Link>

              <span>/</span>

              <span className="text-[#172033]">
                Playground
              </span>
            </div>

            <div className="mt-2 flex items-center gap-3">
              <h1 className="text-[27px] font-semibold tracking-[-0.6px]">
                Playground
              </h1>

              <span className="rounded-full bg-[#ecfdf3] px-2.5 py-1 text-[10px] font-medium text-[#027a48]">
                Evaluation Ready
              </span>
            </div>

            <p className="mt-1.5 text-sm text-[#667085]">
              Test prompts, models, agents, tools and responses in
              an interactive environment.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/agent-builder/testing"
              className="flex h-9 items-center gap-2 rounded-lg border border-[#dfe3e8] bg-white px-3 text-xs font-medium text-[#475467] hover:bg-[#f8f9fb]"
            >
              <ArrowLeft size={15} />
              Back
            </Link>

            <button
              type="button"
              onClick={clearConversation}
              className="flex h-9 items-center gap-2 rounded-lg border border-[#dfe3e8] bg-white px-3 text-xs font-medium text-[#475467] hover:bg-[#f8f9fb]"
            >
              <RefreshCw size={15} />
              Reset
            </button>

            <button
              type="button"
              onClick={() =>
                setShowSettings((current) => !current)
              }
              className="flex h-9 items-center gap-2 rounded-lg bg-[#171a21] px-3 text-xs font-medium text-white hover:bg-[#282c35]"
            >
              <Settings2 size={15} />
              Settings
            </button>
          </div>
        </header>

        <div
          className={`grid min-h-[760px] gap-4 ${
            showSettings
              ? "grid-cols-[minmax(0,1fr)_320px]"
              : "grid-cols-1"
          }`}
        >
          <section className="flex min-h-[760px] flex-col overflow-hidden rounded-xl border border-[#e1e5eb] bg-white">
            <div className="flex items-center justify-between border-b border-[#edf0f3] px-4 py-3">
              <div className="flex items-center gap-1">
                <PanelTab
                  active={activePanel === "chat"}
                  onClick={() => setActivePanel("chat")}
                >
                  <TestTube2 size={14} />
                  Chat
                </PanelTab>

                <PanelTab
                  active={activePanel === "evaluation"}
                  onClick={() =>
                    setActivePanel("evaluation")
                  }
                >
                  <BarChart3 size={14} />
                  Evaluation
                </PanelTab>

                <PanelTab
                  active={activePanel === "trace"}
                  onClick={() => setActivePanel("trace")}
                >
                  <Activity size={14} />
                  Trace
                </PanelTab>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-[10px] text-[#667085]">
                  <span className="h-2 w-2 rounded-full bg-[#12b76a]" />
                  Runtime ready
                </div>

                <div className="text-[10px] text-[#98a2b3]">
                  {selectedModel.provider}
                </div>
              </div>
            </div>

            {activePanel === "chat" && (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-6">
                  {messages.length === 0 ? (
                    <EmptyState />
                  ) : (
                    <div className="mx-auto max-w-[900px] space-y-6">
                      {messages.map((message) => (
                        <MessageRow
                          key={message.id}
                          message={message}
                        />
                      ))}

                      {isRunning && (
                        <div className="flex gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#171a21] text-white">
                            <Zap size={15} />
                          </div>

                          <div className="rounded-xl border border-[#e1e5eb] bg-[#fafbfc] px-4 py-3">
                            <div className="flex items-center gap-2 text-xs text-[#667085]">
                              <span className="h-2 w-2 animate-pulse rounded-full bg-[#667085]" />
                              Running evaluation...
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="border-t border-[#edf0f3] bg-[#fafbfc] px-5 py-4">
                  <div className="mx-auto max-w-[900px]">
                    <div className="rounded-xl border border-[#dfe3e8] bg-white shadow-sm">
                      <textarea
                        value={input}
                        onChange={(event) =>
                          setInput(event.target.value)
                        }
                        onKeyDown={(event) => {
                          if (
                            event.key === "Enter" &&
                            !event.shiftKey
                          ) {
                            event.preventDefault();
                            runPrompt();
                          }
                        }}
                        placeholder="Enter a prompt to test your model..."
                        rows={4}
                        className="w-full resize-none rounded-t-xl px-4 py-3 text-sm outline-none placeholder:text-[#98a2b3]"
                      />

                      <div className="flex items-center justify-between border-t border-[#edf0f3] px-3 py-2">
                        <div className="flex items-center gap-1">
                          <ToolButton>
                            <FileText size={15} />
                          </ToolButton>

                          <ToolButton>
                            <Database size={15} />
                          </ToolButton>

                          <ToolButton>
                            <Target size={15} />
                          </ToolButton>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[#98a2b3]">
                            Enter to run
                          </span>

                          <button
                            type="button"
                            onClick={runPrompt}
                            disabled={
                              !input.trim() || isRunning
                            }
                            className="flex h-8 items-center gap-1.5 rounded-lg bg-[#171a21] px-3 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Play size={14} />
                            Run
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[10px] text-[#98a2b3]">
                      <span>
                        {selectedModel.name} · Temperature{" "}
                        {temperature}
                      </span>

                      <span>
                        {totalTokens.toLocaleString()} tokens
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activePanel === "evaluation" && (
              <EvaluationPanel />
            )}

            {activePanel === "trace" && <TracePanel />}
          </section>

          {showSettings && (
            <aside className="rounded-xl border border-[#e1e5eb] bg-white">
              <div className="border-b border-[#edf0f3] px-5 py-4">
                <h2 className="text-[15px] font-semibold">
                  Playground Configuration
                </h2>

                <p className="mt-1 text-[11px] leading-5 text-[#667085]">
                  Configure the runtime before executing a test.
                </p>
              </div>

              <div className="space-y-5 p-5">
                <ConfigSection title="Model">
                  <label className="text-[10px] font-medium text-[#667085]">
                    Model
                  </label>

                  <div className="relative mt-1.5">
                    <select
                      value={model}
                      onChange={(event) =>
                        setModel(event.target.value)
                      }
                      className="h-10 w-full appearance-none rounded-lg border border-[#dfe3e8] bg-white px-3 pr-9 text-xs font-medium outline-none"
                    >
                      {models.map((item) => (
                        <option key={item.name}>
                          {item.name}
                        </option>
                      ))}
                    </select>

                    <ChevronDown
                      size={14}
                      className="pointer-events-none absolute right-3 top-3 text-[#98a2b3]"
                    />
                  </div>

                  <p className="mt-1.5 text-[10px] leading-4 text-[#98a2b3]">
                    {selectedModel.description}
                  </p>
                </ConfigSection>

                <ConfigSection title="Generation">
                  <label className="text-[10px] font-medium text-[#667085]">
                    Temperature
                  </label>

                  <div className="mt-2 flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={temperature}
                      onChange={(event) =>
                        setTemperature(event.target.value)
                      }
                      className="w-full"
                    />

                    <span className="w-8 text-right text-xs font-medium">
                      {temperature}
                    </span>
                  </div>
                </ConfigSection>

                <ConfigSection title="System Prompt">
                  <textarea
                    value={systemPrompt}
                    onChange={(event) =>
                      setSystemPrompt(event.target.value)
                    }
                    rows={7}
                    className="w-full resize-none rounded-lg border border-[#dfe3e8] px-3 py-2.5 text-xs leading-5 outline-none"
                  />
                </ConfigSection>

                <ConfigSection title="Runtime">
                  <RuntimeRow
                    label="Streaming"
                    value="Enabled"
                  />

                  <RuntimeRow
                    label="Tool calls"
                    value="Enabled"
                  />

                  <RuntimeRow
                    label="Trace collection"
                    value="Enabled"
                  />

                  <RuntimeRow
                    label="Safety checks"
                    value="Enabled"
                  />
                </ConfigSection>

                <ConfigSection title="Evaluation">
                  <RuntimeRow
                    label="Quality scoring"
                    value="Enabled"
                  />

                  <RuntimeRow
                    label="Latency tracking"
                    value="Enabled"
                  />

                  <RuntimeRow
                    label="Token tracking"
                    value="Enabled"
                  />
                </ConfigSection>

                <div className="rounded-lg bg-[#f8f9fb] p-3">
                  <div className="flex items-center gap-2 text-xs font-medium">
                    <ShieldCheck size={14} />
                    Safe evaluation environment
                  </div>

                  <p className="mt-1.5 text-[10px] leading-5 text-[#667085]">
                    Requests in Playground can be traced, evaluated,
                    and compared without changing production traffic.
                  </p>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </main>
  );
}

function PanelTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium ${
        active
          ? "bg-[#171a21] text-white"
          : "text-[#667085] hover:bg-[#f8f9fb]"
      }`}
    >
      {children}
    </button>
  );
}

function ToolButton({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className="flex h-8 w-8 items-center justify-center rounded-lg text-[#667085] hover:bg-[#f2f4f7]"
    >
      {children}
    </button>
  );
}

function MessageRow({
  message,
}: {
  message: Message;
}) {
  const isUser = message.role === "user";

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
    } catch {
      // Clipboard unavailable.
    }
  };

  return (
    <div
      className={`flex gap-3 ${
        isUser ? "justify-end" : ""
      }`}
    >
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#171a21] text-white">
          <Zap size={15} />
        </div>
      )}

      <div
        className={`max-w-[78%] ${
          isUser
            ? "rounded-xl bg-[#171a21] px-4 py-3 text-white"
            : "rounded-xl border border-[#e1e5eb] bg-white px-4 py-3"
        }`}
      >
        <p className="whitespace-pre-wrap text-sm leading-6">
          {message.content}
        </p>

        {!isUser && (
          <div className="mt-3 flex items-center justify-between border-t border-[#edf0f3] pt-2">
            <div className="flex items-center gap-3 text-[10px] text-[#98a2b3]">
              {message.latency && (
                <span className="flex items-center gap-1">
                  <Clock3 size={11} />
                  {message.latency}
                </span>
              )}

              {message.tokens !== undefined && (
                <span>{message.tokens} tokens</span>
              )}
            </div>

            <button
              type="button"
              onClick={copyMessage}
              className="text-[#98a2b3] hover:text-[#475467]"
            >
              <Copy size={13} />
            </button>
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#eaecf0] text-[#475467]">
          <UserRound size={15} />
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-[520px] items-center justify-center">
      <div className="max-w-[520px] text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#f2f4f7] text-[#475467]">
          <TestTube2 size={23} />
        </div>

        <h2 className="mt-5 text-lg font-semibold">
          Start an evaluation
        </h2>

        <p className="mt-2 text-sm leading-6 text-[#667085]">
          Enter a prompt below to test your selected model.
          Responses can be evaluated for quality, latency, tokens,
          safety, and tool execution.
        </p>

        <div className="mt-5 grid grid-cols-3 gap-2 text-left">
          <SuggestionCard
            title="Quality"
            description="Evaluate response quality"
          />

          <SuggestionCard
            title="Latency"
            description="Measure response speed"
          />

          <SuggestionCard
            title="Safety"
            description="Check guardrails"
          />
        </div>
      </div>
    </div>
  );
}

function SuggestionCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-[#e1e5eb] bg-white p-3">
      <div className="text-xs font-semibold">{title}</div>

      <div className="mt-1 text-[10px] leading-4 text-[#98a2b3]">
        {description}
      </div>
    </div>
  );
}

function ConfigSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-2.5 text-[11px] font-semibold uppercase tracking-wide text-[#667085]">
        {title}
      </h3>

      {children}
    </section>
  );
}

function RuntimeRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-[#f2f4f7] py-2.5 last:border-b-0">
      <span className="text-xs text-[#475467]">
        {label}
      </span>

      <span className="flex items-center gap-1.5 text-[10px] font-medium text-[#027a48]">
        <CheckCircle2 size={12} />
        {value}
      </span>
    </div>
  );
}

function EvaluationPanel() {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mx-auto max-w-[1050px]">
        <div className="mb-5 grid grid-cols-4 gap-3">
          <SmallMetric
            label="Quality"
            value="94.8%"
            icon={<Target size={15} />}
          />

          <SmallMetric
            label="Latency"
            value="1.42s"
            icon={<Clock3 size={15} />}
          />

          <SmallMetric
            label="Tokens"
            value="184"
            icon={<Database size={15} />}
          />

          <SmallMetric
            label="Safety"
            value="98.1%"
            icon={<ShieldCheck size={15} />}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <ScoreCard
            title="Response Quality"
            score="94.8"
            description="The response follows the instruction and provides a relevant answer."
          />

          <ScoreCard
            title="Instruction Following"
            score="96.2"
            description="The model follows the requested format and task requirements."
          />

          <ScoreCard
            title="Groundedness"
            score="92.4"
            description="Claims remain consistent with the available context."
          />

          <ScoreCard
            title="Safety"
            score="98.1"
            description="No unsafe behavior detected during the evaluation."
          />
        </div>
      </div>
    </div>
  );
}

function TracePanel() {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mx-auto max-w-[1050px]">
        <div className="mb-5 rounded-xl border border-[#e1e5eb] bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-semibold">
                Execution Trace
              </h2>

              <p className="mt-1 text-xs text-[#667085]">
                Request execution timeline and runtime events.
              </p>
            </div>

            <span className="rounded-full bg-[#ecfdf3] px-2.5 py-1 text-[10px] font-medium text-[#027a48]">
              Completed
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <TraceItem
            step="01"
            title="Request received"
            description="Playground request accepted by evaluation runtime."
            time="0ms"
          />

          <TraceItem
            step="02"
            title="Model selected"
            description="Selected model prepared for evaluation."
            time="12ms"
          />

          <TraceItem
            step="03"
            title="Prompt processed"
            description="System prompt and user prompt prepared."
            time="48ms"
          />

          <TraceItem
            step="04"
            title="Model execution"
            description="Model generated the response."
            time="1.21s"
          />

          <TraceItem
            step="05"
            title="Evaluation completed"
            description="Quality, safety, token and latency metrics collected."
            time="1.42s"
          />
        </div>
      </div>
    </div>
  );
}

function TraceItem({
  step,
  title,
  description,
  time,
}: {
  step: string;
  title: string;
  description: string;
  time: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#e1e5eb] bg-white p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f2f4f7] text-[10px] font-semibold text-[#475467]">
        {step}
      </div>

      <div className="flex-1">
        <div className="text-sm font-medium">
          {title}
        </div>

        <div className="mt-1 text-xs text-[#667085]">
          {description}
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-[#98a2b3]">
        <Clock3 size={13} />
        {time}
      </div>
    </div>
  );
}

function SmallMetric({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#e1e5eb] bg-white p-4">
      <div className="flex items-center justify-between text-[#667085]">
        <span className="text-[10px] font-medium">
          {label}
        </span>

        {icon}
      </div>

      <div className="mt-3 text-xl font-semibold">
        {value}
      </div>
    </div>
  );
}

function ScoreCard({
  title,
  score,
  description,
}: {
  title: string;
  score: string;
  description: string;
}) {
  const numericScore = Number(score);

  return (
    <div className="rounded-xl border border-[#e1e5eb] bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          {title}
        </h3>

        <span className="text-lg font-semibold text-[#027a48]">
          {score}
        </span>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#eaecf0]">
        <div
          className="h-full rounded-full bg-[#12b76a]"
          style={{
            width: `${numericScore}%`,
          }}
        />
      </div>

      <p className="mt-3 text-xs leading-5 text-[#667085]">
        {description}
      </p>
    </div>
  );
}