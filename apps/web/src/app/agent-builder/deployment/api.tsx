"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Code2,
  Copy,
  Globe,
  KeyRound,
  Link2,
  Lock,
  Play,
  Plus,
  RefreshCw,
  Save,
  Server,
  Settings2,
  ShieldCheck,
  Trash2,
  Webhook,
  X,
  Zap,
} from "lucide-react";

type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type ApiEndpoint = {
  id: string;
  name: string;
  method: ApiMethod;
  path: string;
  description: string;
  enabled: boolean;
};

type HeaderItem = {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
};

type ParameterItem = {
  id: string;
  key: string;
  value: string;
  required: boolean;
};

const initialEndpoints: ApiEndpoint[] = [
  {
    id: "chat",
    name: "Chat Completion",
    method: "POST",
    path: "/v1/chat/completions",
    description: "Generate an AI response from messages.",
    enabled: true,
  },
  {
    id: "models",
    name: "List Models",
    method: "GET",
    path: "/v1/models",
    description: "Return available ModelNow models.",
    enabled: true,
  },
  {
    id: "agent-run",
    name: "Run Agent",
    method: "POST",
    path: "/v1/agents/run",
    description: "Execute a deployed agent.",
    enabled: true,
  },
];

const initialHeaders: HeaderItem[] = [
  {
    id: "content-type",
    key: "Content-Type",
    value: "application/json",
    enabled: true,
  },
  {
    id: "authorization",
    key: "Authorization",
    value: "Bearer {{MODELNOW_API_KEY}}",
    enabled: true,
  },
];

const initialParameters: ParameterItem[] = [
  {
    id: "model",
    key: "model",
    value: "modelnow-auto",
    required: true,
  },
  {
    id: "temperature",
    key: "temperature",
    value: "0.2",
    required: false,
  },
];

const methodClasses: Record<ApiMethod, string> = {
  GET: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  POST: "border-blue-500/20 bg-blue-500/10 text-blue-300",
  PUT: "border-amber-500/20 bg-amber-500/10 text-amber-300",
  PATCH: "border-violet-500/20 bg-violet-500/10 text-violet-300",
  DELETE: "border-red-500/20 bg-red-500/10 text-red-300",
};

export default function DeploymentApiPage() {
  const router = useRouter();

  const [endpoints, setEndpoints] =
    useState<ApiEndpoint[]>(initialEndpoints);

  const [selectedEndpointId, setSelectedEndpointId] =
    useState("chat");

  const [headers, setHeaders] =
    useState<HeaderItem[]>(initialHeaders);

  const [parameters, setParameters] =
    useState<ParameterItem[]>(initialParameters);

  const [apiName, setApiName] =
    useState("ModelNow Production API");

  const [baseUrl, setBaseUrl] =
    useState("https://api.modelnow.ai");

  const [version, setVersion] =
    useState("v1");

  const [authentication, setAuthentication] =
    useState("API Key");

  const [rateLimit, setRateLimit] =
    useState("60 requests/min");

  const [environment, setEnvironment] =
    useState("Production");

  const [temperature, setTemperature] =
    useState("0.2");

  const [streaming, setStreaming] =
    useState(true);

  const [isPublic, setIsPublic] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [testing, setTesting] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  const [copied, setCopied] =
    useState(false);

  const [testResult, setTestResult] =
    useState<"success" | "error" | null>(null);

  const selectedEndpoint = useMemo(
    () =>
      endpoints.find(
        (endpoint) => endpoint.id === selectedEndpointId,
      ) ?? endpoints[0],
    [endpoints, selectedEndpointId],
  );

  const fullEndpointUrl = selectedEndpoint
    ? `${baseUrl}/${version.replace(
        /^\/+/,
        "",
      )}${selectedEndpoint.path}`
    : `${baseUrl}/${version}`;

  const requestExample = `curl ${fullEndpointUrl} \\
  -H "Authorization: Bearer $MODELNOW_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "modelnow-auto",
    "messages": [
      {
        "role": "user",
        "content": "Hello from my application"
      }
    ],
    "temperature": ${temperature || "0.2"},
    "stream": ${streaming}
  }'`;

  const handleSave = async () => {
    setSaving(true);

    await new Promise((resolve) =>
      setTimeout(resolve, 800),
    );

    setSaving(false);
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 1800);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);

    await new Promise((resolve) =>
      setTimeout(resolve, 1200),
    );

    setTesting(false);
    setTestResult("success");
  };

  const copyRequest = async () => {
    try {
      await navigator.clipboard.writeText(requestExample);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      setCopied(false);
    }
  };

  const addEndpoint = () => {
    const id = `endpoint-${Date.now()}`;

    const endpoint: ApiEndpoint = {
      id,
      name: "New Endpoint",
      method: "POST",
      path: "/v1/new-endpoint",
      description: "Custom API endpoint.",
      enabled: true,
    };

    setEndpoints((current) => [
      ...current,
      endpoint,
    ]);

    setSelectedEndpointId(id);
  };

  const deleteEndpoint = (id: string) => {
    if (endpoints.length <= 1) {
      return;
    }

    const remaining = endpoints.filter(
      (endpoint) => endpoint.id !== id,
    );

    setEndpoints(remaining);

    if (selectedEndpointId === id) {
      setSelectedEndpointId(
        remaining[0]?.id ?? "",
      );
    }
  };

  const updateEndpoint = (
    id: string,
    field: keyof ApiEndpoint,
    value: string | boolean,
  ) => {
    setEndpoints((current) =>
      current.map((endpoint) =>
        endpoint.id === id
          ? {
              ...endpoint,
              [field]: value,
            }
          : endpoint,
      ),
    );
  };

  const addHeader = () => {
    setHeaders((current) => [
      ...current,
      {
        id: `header-${Date.now()}`,
        key: "",
        value: "",
        enabled: true,
      },
    ]);
  };

  const updateHeader = (
    id: string,
    field: keyof HeaderItem,
    value: string | boolean,
  ) => {
    setHeaders((current) =>
      current.map((header) =>
        header.id === id
          ? {
              ...header,
              [field]: value,
            }
          : header,
      ),
    );
  };

  const removeHeader = (id: string) => {
    setHeaders((current) =>
      current.filter(
        (header) => header.id !== id,
      ),
    );
  };

  const addParameter = () => {
    setParameters((current) => [
      ...current,
      {
        id: `parameter-${Date.now()}`,
        key: "",
        value: "",
        required: false,
      },
    ]);
  };

  const updateParameter = (
    id: string,
    field: keyof ParameterItem,
    value: string | boolean,
  ) => {
    setParameters((current) =>
      current.map((parameter) =>
        parameter.id === id
          ? {
              ...parameter,
              [field]: value,
            }
          : parameter,
      ),
    );
  };

  const removeParameter = (id: string) => {
    setParameters((current) =>
      current.filter(
        (parameter) => parameter.id !== id,
      ),
    );
  };

  return (
    <main className="min-h-screen bg-[#07070a] text-white">
      <div className="mx-auto flex min-h-screen max-w-[1700px] flex-col">

        {/* HEADER */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.08] bg-[#09090d] px-5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-white/50 transition hover:bg-white/[0.07] hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10">
              <Code2 className="h-5 w-5 text-violet-300" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold">
                  API Deployment
                </h1>

                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/[0.07] px-2 py-0.5 text-[9px] text-emerald-300">
                  {environment.toUpperCase()}
                </span>
              </div>

              <p className="text-[11px] text-white/30">
                Deploy AI models and agents through production APIs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTest}
              disabled={testing}
              className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[11px] font-medium text-white/55 transition hover:bg-white/[0.07] hover:text-white disabled:opacity-50"
            >
              {testing ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}

              {testing ? "Testing..." : "Test API"}
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-violet-600 px-3.5 py-2 text-[11px] font-semibold text-white transition hover:bg-violet-500 disabled:opacity-60"
            >
              {saving ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : saved ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}

              {saving
                ? "Saving..."
                : saved
                  ? "Saved"
                  : "Save Deployment"}
            </button>
          </div>
        </header>

        {/* WORKSPACE */}
        <div className="flex min-h-0 flex-1">

          {/* LEFT SIDEBAR */}
          <aside className="hidden w-[250px] shrink-0 overflow-y-auto border-r border-white/[0.08] bg-[#09090d] lg:block">
            <div className="border-b border-white/[0.06] p-4">
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/25">
                Deployment
              </p>

              <div className="mt-3 rounded-xl border border-violet-500/15 bg-violet-500/[0.04] p-3">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-violet-300" />

                  <span className="text-[10px] font-medium text-white/65">
                    {apiName}
                  </span>
                </div>

                <p className="mt-2 truncate text-[9px] text-white/25">
                  {baseUrl}
                </p>
              </div>
            </div>

            <div className="border-b border-white/[0.06] p-3">
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-white/25">
                  Endpoints
                </span>

                <button
                  type="button"
                  onClick={addEndpoint}
                  className="flex h-6 w-6 items-center justify-center rounded-md text-white/30 hover:bg-white/[0.06] hover:text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-1.5">
                {endpoints.map((endpoint) => (
                  <button
                    key={endpoint.id}
                    type="button"
                    onClick={() =>
                      setSelectedEndpointId(endpoint.id)
                    }
                    className={`group w-full rounded-xl border p-3 text-left transition ${
                      selectedEndpointId === endpoint.id
                        ? "border-violet-500/20 bg-violet-500/[0.07]"
                        : "border-transparent bg-white/[0.02] hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-md border px-1.5 py-0.5 text-[7px] font-bold ${methodClasses[endpoint.method]}`}
                      >
                        {endpoint.method}
                      </span>

                      <span className="min-w-0 flex-1 truncate text-[10px] font-medium text-white/60">
                        {endpoint.name}
                      </span>

                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          endpoint.enabled
                            ? "bg-emerald-400"
                            : "bg-white/15"
                        }`}
                      />
                    </div>

                    <p className="mt-2 truncate font-mono text-[8px] text-white/25">
                      {endpoint.path}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1 p-3">
              <SidebarItem
                icon={<Settings2 className="h-3.5 w-3.5" />}
                label="API Settings"
              />

              <SidebarItem
                icon={<KeyRound className="h-3.5 w-3.5" />}
                label="API Keys"
              />

              <SidebarItem
                icon={<Activity className="h-3.5 w-3.5" />}
                label="Usage & Analytics"
              />

              <SidebarItem
                icon={<ShieldCheck className="h-3.5 w-3.5" />}
                label="Security"
              />

              <SidebarItem
                icon={<Webhook className="h-3.5 w-3.5" />}
                label="Webhooks"
              />
            </div>
          </aside>

          {/* MAIN */}
          <section className="min-w-0 flex-1 overflow-y-auto bg-[#07070a]">
            <div className="mx-auto max-w-[1050px] p-5 lg:p-7">

              {/* METRICS */}
              <section className="grid gap-3 md:grid-cols-4">
                <MetricCard
                  icon={<Activity className="h-4 w-4" />}
                  label="API Status"
                  value="Operational"
                  valueClass="text-emerald-300"
                />

                <MetricCard
                  icon={<Zap className="h-4 w-4" />}
                  label="Avg Latency"
                  value="184 ms"
                />

                <MetricCard
                  icon={<Globe className="h-4 w-4" />}
                  label="Requests"
                  value="24.8K"
                />

                <MetricCard
                  icon={<ShieldCheck className="h-4 w-4" />}
                  label="Success Rate"
                  value="99.7%"
                  valueClass="text-emerald-300"
                />
              </section>

              {/* API CONFIGURATION */}
              <section className="mt-5 rounded-2xl border border-white/[0.08] bg-[#0a0a0f]">
                <div className="border-b border-white/[0.06] p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xs font-semibold">
                        API Configuration
                      </h2>

                      <p className="mt-1 text-[10px] text-white/30">
                        Configure the public endpoint for your AI
                        application.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 rounded-lg border border-emerald-500/15 bg-emerald-500/[0.04] px-2.5 py-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span className="text-[9px] text-emerald-300">
                        Live
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 p-5 md:grid-cols-2">
                  <InputField
                    label="API Name"
                    value={apiName}
                    onChange={setApiName}
                  />

                  <InputField
                    label="Base URL"
                    value={baseUrl}
                    onChange={setBaseUrl}
                  />

                  <SelectField
                    label="API Version"
                    value={version}
                    onChange={setVersion}
                    options={["v1", "v2-beta"]}
                  />

                  <SelectField
                    label="Authentication"
                    value={authentication}
                    onChange={setAuthentication}
                    options={[
                      "API Key",
                      "OAuth 2.0",
                      "JWT",
                    ]}
                  />

                  <SelectField
                    label="Rate Limit"
                    value={rateLimit}
                    onChange={setRateLimit}
                    options={[
                      "30 requests/min",
                      "60 requests/min",
                      "120 requests/min",
                      "Custom",
                    ]}
                  />

                  <SelectField
                    label="Environment"
                    value={environment}
                    onChange={setEnvironment}
                    options={[
                      "Development",
                      "Staging",
                      "Production",
                    ]}
                  />
                </div>
              </section>

              {/* ENDPOINT */}
              {selectedEndpoint && (
                <section className="mt-5 rounded-2xl border border-white/[0.08] bg-[#0a0a0f]">
                  <div className="border-b border-white/[0.06] p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h2 className="text-xs font-semibold">
                          Endpoint
                        </h2>

                        <p className="mt-1 text-[10px] text-white/30">
                          Configure how applications interact with
                          this endpoint.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          updateEndpoint(
                            selectedEndpoint.id,
                            "enabled",
                            !selectedEndpoint.enabled,
                          )
                        }
                        className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[9px] ${
                          selectedEndpoint.enabled
                            ? "border-emerald-500/20 bg-emerald-500/[0.05] text-emerald-300"
                            : "border-white/[0.08] bg-white/[0.03] text-white/30"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            selectedEndpoint.enabled
                              ? "bg-emerald-400"
                              : "bg-white/20"
                          }`}
                        />

                        {selectedEndpoint.enabled
                          ? "Enabled"
                          : "Disabled"}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-5 p-5">
                    <div className="grid gap-4 md:grid-cols-[130px_1fr]">
                      <div>
                        <label className="mb-1.5 block text-[9px] text-white/35">
                          Method
                        </label>

                        <select
                          value={selectedEndpoint.method}
                          onChange={(event) =>
                            updateEndpoint(
                              selectedEndpoint.id,
                              "method",
                              event.target.value as ApiMethod,
                            )
                          }
                          className="h-10 w-full rounded-lg border border-white/[0.08] bg-black/20 px-3 text-[10px] text-white/65 outline-none"
                        >
                          <option>GET</option>
                          <option>POST</option>
                          <option>PUT</option>
                          <option>PATCH</option>
                          <option>DELETE</option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-[9px] text-white/35">
                          Endpoint Path
                        </label>

                        <div className="flex h-10 items-center rounded-lg border border-white/[0.08] bg-black/20 px-3">
                          <span className="whitespace-nowrap text-[10px] text-white/25">
                            {baseUrl}/
                            {version.replace(
                              /^\/+/,
                              "",
                            )}
                          </span>

                          <input
                            value={selectedEndpoint.path}
                            onChange={(event) =>
                              updateEndpoint(
                                selectedEndpoint.id,
                                "path",
                                event.target.value,
                              )
                            }
                            className="min-w-0 flex-1 bg-transparent px-1 text-[10px] text-white/70 outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[9px] text-white/35">
                        Endpoint Name
                      </label>

                      <input
                        value={selectedEndpoint.name}
                        onChange={(event) =>
                          updateEndpoint(
                            selectedEndpoint.id,
                            "name",
                            event.target.value,
                          )
                        }
                        className="h-10 w-full rounded-lg border border-white/[0.08] bg-black/20 px-3 text-[10px] text-white/65 outline-none focus:border-violet-500/40"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[9px] text-white/35">
                        Description
                      </label>

                      <textarea
                        value={selectedEndpoint.description}
                        onChange={(event) =>
                          updateEndpoint(
                            selectedEndpoint.id,
                            "description",
                            event.target.value,
                          )
                        }
                        rows={3}
                        className="w-full resize-none rounded-lg border border-white/[0.08] bg-black/20 px-3 py-2.5 text-[10px] leading-4 text-white/65 outline-none focus:border-violet-500/40"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          deleteEndpoint(
                            selectedEndpoint.id,
                          )
                        }
                        className="flex items-center gap-2 rounded-lg border border-red-500/15 bg-red-500/[0.04] px-3 py-2 text-[9px] text-red-300/70 hover:bg-red-500/[0.08] hover:text-red-300"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove Endpoint
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {/* HEADERS + PARAMETERS */}
              <section className="mt-5 grid gap-5 lg:grid-cols-2">

                {/* HEADERS */}
                <div className="rounded-2xl border border-white/[0.08] bg-[#0a0a0f]">
                  <div className="flex items-center justify-between border-b border-white/[0.06] p-5">
                    <div>
                      <h2 className="text-xs font-semibold">
                        Headers
                      </h2>

                      <p className="mt-1 text-[9px] text-white/25">
                        HTTP headers sent with requests.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={addHeader}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] text-white/30 hover:bg-white/[0.06] hover:text-white"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2 p-4">
                    {headers.map((header) => (
                      <div
                        key={header.id}
                        className="flex items-center gap-2"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            updateHeader(
                              header.id,
                              "enabled",
                              !header.enabled,
                            )
                          }
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                            header.enabled
                              ? "border-violet-500/50 bg-violet-500/20"
                              : "border-white/10 bg-white/[0.02]"
                          }`}
                        >
                          {header.enabled && (
                            <Check className="h-3 w-3 text-violet-300" />
                          )}
                        </button>

                        <input
                          value={header.key}
                          onChange={(event) =>
                            updateHeader(
                              header.id,
                              "key",
                              event.target.value,
                            )
                          }
                          placeholder="Header"
                          className="h-8 min-w-0 flex-1 rounded-lg border border-white/[0.07] bg-black/20 px-2 text-[9px] text-white/55 outline-none"
                        />

                        <input
                          value={header.value}
                          onChange={(event) =>
                            updateHeader(
                              header.id,
                              "value",
                              event.target.value,
                            )
                          }
                          placeholder="Value"
                          className="h-8 min-w-0 flex-[1.4] rounded-lg border border-white/[0.07] bg-black/20 px-2 text-[9px] text-white/55 outline-none"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeHeader(header.id)
                          }
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/20 hover:bg-red-500/[0.06] hover:text-red-300"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PARAMETERS */}
                <div className="rounded-2xl border border-white/[0.08] bg-[#0a0a0f]">
                  <div className="flex items-center justify-between border-b border-white/[0.06] p-5">
                    <div>
                      <h2 className="text-xs font-semibold">
                        Parameters
                      </h2>

                      <p className="mt-1 text-[9px] text-white/25">
                        Request parameters and values.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={addParameter}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] text-white/30 hover:bg-white/[0.06] hover:text-white"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2 p-4">
                    {parameters.map((parameter) => (
                      <div
                        key={parameter.id}
                        className="flex items-center gap-2"
                      >
                        <input
                          value={parameter.key}
                          onChange={(event) =>
                            updateParameter(
                              parameter.id,
                              "key",
                              event.target.value,
                            )
                          }
                          placeholder="Key"
                          className="h-8 min-w-0 flex-1 rounded-lg border border-white/[0.07] bg-black/20 px-2 text-[9px] text-white/55 outline-none"
                        />

                        <input
                          value={parameter.value}
                          onChange={(event) =>
                            updateParameter(
                              parameter.id,
                              "value",
                              event.target.value,
                            )
                          }
                          placeholder="Value"
                          className="h-8 min-w-0 flex-[1.2] rounded-lg border border-white/[0.07] bg-black/20 px-2 text-[9px] text-white/55 outline-none"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            updateParameter(
                              parameter.id,
                              "required",
                              !parameter.required,
                            )
                          }
                          className={`whitespace-nowrap rounded-md border px-1.5 py-1 text-[7px] ${
                            parameter.required
                              ? "border-violet-500/20 bg-violet-500/10 text-violet-300"
                              : "border-white/[0.07] text-white/20"
                          }`}
                        >
                          Required
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            removeParameter(parameter.id)
                          }
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/20 hover:bg-red-500/[0.06] hover:text-red-300"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* RUNTIME SETTINGS */}
              <section className="mt-5 rounded-2xl border border-white/[0.08] bg-[#0a0a0f]">
                <div className="border-b border-white/[0.06] p-5">
                  <h2 className="text-xs font-semibold">
                    Runtime Settings
                  </h2>

                  <p className="mt-1 text-[10px] text-white/30">
                    Control model behavior and production execution.
                  </p>
                </div>

                <div className="grid gap-4 p-5 md:grid-cols-3">

                  {/* TEMPERATURE */}
                  <div>
                    <label className="mb-1.5 block text-[9px] text-white/35">
                      Temperature
                    </label>

                    <input
                      type="number"
                      min="0"
                      max="2"
                      step="0.1"
                      value={temperature}
                      onChange={(event) =>
                        setTemperature(event.target.value)
                      }
                      className="h-9 w-full rounded-lg border border-white/[0.08] bg-black/20 px-3 text-[10px] text-white/60 outline-none focus:border-violet-500/40"
                    />

                    <p className="mt-1 text-[8px] text-white/20">
                      Range: 0 to 2
                    </p>
                  </div>

                  {/* TIMEOUT */}
                  <div>
                    <label className="mb-1.5 block text-[9px] text-white/35">
                      Timeout
                    </label>

                    <select className="h-9 w-full rounded-lg border border-white/[0.08] bg-black/20 px-3 text-[10px] text-white/60 outline-none">
                      <option>30 seconds</option>
                      <option>60 seconds</option>
                      <option>120 seconds</option>
                      <option>300 seconds</option>
                    </select>
                  </div>

                  {/* MAX TOKENS */}
                  <div>
                    <label className="mb-1.5 block text-[9px] text-white/35">
                      Max Tokens
                    </label>

                    <select className="h-9 w-full rounded-lg border border-white/[0.08] bg-black/20 px-3 text-[10px] text-white/60 outline-none">
                      <option>2,048</option>
                      <option>4,096</option>
                      <option>8,192</option>
                      <option>16,384</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-3 border-t border-white/[0.06] p-5 md:grid-cols-3">
                  <ToggleCard
                    icon={<Zap className="h-4 w-4" />}
                    title="Streaming"
                    description="Stream tokens as generated."
                    enabled={streaming}
                    onChange={() =>
                      setStreaming(
                        (value) => !value,
                      )
                    }
                  />

                  <ToggleCard
                    icon={<Lock className="h-4 w-4" />}
                    title="Strict Auth"
                    description="Reject unauthenticated requests."
                    enabled={true}
                    onChange={() => {}}
                  />

                  <ToggleCard
                    icon={<Globe className="h-4 w-4" />}
                    title="Public API"
                    description="Allow external clients."
                    enabled={isPublic}
                    onChange={() =>
                      setIsPublic(
                        (value) => !value,
                      )
                    }
                  />
                </div>
              </section>

              {/* REQUEST EXAMPLE */}
              <section className="mt-5 rounded-2xl border border-white/[0.08] bg-[#0a0a0f]">
                <div className="flex items-center justify-between border-b border-white/[0.06] p-5">
                  <div>
                    <h2 className="text-xs font-semibold">
                      API Request
                    </h2>

                    <p className="mt-1 text-[10px] text-white/30">
                      Copy this example to integrate the API.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={copyRequest}
                    className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[9px] text-white/40 hover:bg-white/[0.07] hover:text-white"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-300" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}

                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>

                <div className="overflow-x-auto p-5">
                  <pre className="rounded-xl border border-white/[0.06] bg-black/30 p-4 font-mono text-[9px] leading-5 text-white/45">
                    {requestExample}
                  </pre>
                </div>
              </section>

              {/* SECURITY */}
              <section className="mt-5 rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.025] p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                    <ShieldCheck className="h-5 w-5 text-emerald-300" />
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-xs font-semibold">
                      Production Security
                    </h2>

                    <p className="mt-1 max-w-2xl text-[10px] leading-5 text-white/30">
                      API authentication, rate limiting, environment
                      controls, audit logging and request governance
                      should be enforced before exposing this endpoint
                      publicly.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <SecurityBadge
                        icon={<KeyRound className="h-3 w-3" />}
                        label="API Authentication"
                      />

                      <SecurityBadge
                        icon={<Lock className="h-3 w-3" />}
                        label="Rate Limiting"
                      />

                      <SecurityBadge
                        icon={<Activity className="h-3 w-3" />}
                        label="Audit Logs"
                      />

                      <SecurityBadge
                        icon={<ShieldCheck className="h-3 w-3" />}
                        label="Guardrails"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* TEST RESULT */}
              {testResult === "success" && (
                <section className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                      <Check className="h-4 w-4 text-emerald-300" />
                    </div>

                    <div>
                      <p className="text-[10px] font-medium text-emerald-200">
                        API test successful
                      </p>

                      <p className="mt-1 text-[9px] text-white/30">
                        Endpoint responded successfully in 184 ms.
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {/* CTA */}
              <section className="mt-5 rounded-2xl border border-violet-500/15 bg-gradient-to-r from-violet-500/[0.07] to-blue-500/[0.04] p-5">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <Webhook className="h-4 w-4 text-violet-300" />

                      <h2 className="text-xs font-semibold">
                        Ready to integrate?
                      </h2>
                    </div>

                    <p className="mt-1 text-[10px] text-white/30">
                      Use the API endpoint from your application,
                      backend service or AI agent.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={copyRequest}
                    className="flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-[10px] font-semibold text-white transition hover:bg-violet-500"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Link2 className="h-3.5 w-3.5" />
                    )}

                    {copied
                      ? "Request Copied"
                      : "Copy API Request"}

                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </section>
            </div>
          </section>
        </div>

        {/* FOOTER */}
        <footer className="flex h-7 shrink-0 items-center justify-between border-t border-white/[0.07] bg-[#08080b] px-4">
          <div className="flex items-center gap-4 text-[9px] text-white/25">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              API Operational
            </span>

            <span>Deployment / API</span>
          </div>

          <span className="text-[9px] text-white/25">
            ModelNow
          </span>
        </footer>
      </div>
    </main>
  );
}

function SidebarItem({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[10px] text-white/35 transition hover:bg-white/[0.05] hover:text-white/70"
    >
      {icon}
      {label}
    </button>
  );
}

function MetricCard({
  icon,
  label,
  value,
  valueClass = "text-white/70",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#0a0a0f] p-4">
      <div className="flex items-center gap-2 text-white/25">
        {icon}
        <span className="text-[9px] uppercase tracking-[0.1em]">
          {label}
        </span>
      </div>

      <p className={`mt-3 text-sm font-semibold ${valueClass}`}>
        {value}
      </p>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[9px] text-white/35">
        {label}
      </label>

      <input
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-9 w-full rounded-lg border border-white/[0.08] bg-black/20 px-3 text-[10px] text-white/65 outline-none transition focus:border-violet-500/40"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[9px] text-white/35">
        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="h-9 w-full appearance-none rounded-lg border border-white/[0.08] bg-black/20 px-3 pr-8 text-[10px] text-white/65 outline-none transition focus:border-violet-500/40"
        >
          {options.map((option) => (
            <option key={option}>
              {option}
            </option>
          ))}
        </select>

        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-white/25" />
      </div>
    </div>
  );
}

function ToggleCard({
  icon,
  title,
  description,
  enabled,
  onChange,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`rounded-xl border p-3 text-left transition ${
        enabled
          ? "border-violet-500/20 bg-violet-500/[0.05]"
          : "border-white/[0.07] bg-white/[0.02]"
      }`}
    >
      <div className="flex items-center justify-between">
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-lg ${
            enabled
              ? "bg-violet-500/10 text-violet-300"
              : "bg-white/[0.04] text-white/25"
          }`}
        >
          {icon}
        </div>

        <span
          className={`h-1.5 w-1.5 rounded-full ${
            enabled
              ? "bg-violet-400"
              : "bg-white/15"
          }`}
        />
      </div>

      <p className="mt-3 text-[10px] font-medium text-white/55">
        {title}
      </p>

      <p className="mt-1 text-[8px] leading-4 text-white/25">
        {description}
      </p>
    </button>
  );
}

function SecurityBadge({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <span className="flex items-center gap-1.5 rounded-md border border-emerald-500/15 bg-emerald-500/[0.04] px-2 py-1.5 text-[8px] text-emerald-300/70">
      {icon}
      {label}
    </span>
  );
}