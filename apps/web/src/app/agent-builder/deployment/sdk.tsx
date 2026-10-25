"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Code2,
  Copy,
  Download,
  ExternalLink,
  Globe,
  KeyRound,
  Package,
  Play,
  Plus,
  Rocket,
  Settings2,
  ShieldCheck,
  Terminal,
  Zap,
} from "lucide-react";

type SdkLanguage =
  | "JavaScript"
  | "Python"
  | "TypeScript"
  | "Java"
  | "Go"
  | "C#";

type SdkOption = {
  language: SdkLanguage;
  packageName: string;
  installCommand: string;
};

const sdkOptions: SdkOption[] = [
  {
    language: "JavaScript",
    packageName: "@modelnow/sdk",
    installCommand: "npm install @modelnow/sdk",
  },
  {
    language: "TypeScript",
    packageName: "@modelnow/sdk",
    installCommand: "npm install @modelnow/sdk",
  },
  {
    language: "Python",
    packageName: "modelnow",
    installCommand: "pip install modelnow",
  },
  {
    language: "Java",
    packageName: "modelnow-sdk",
    installCommand: "mvn install modelnow-sdk",
  },
  {
    language: "Go",
    packageName: "github.com/modelnow/sdk-go",
    installCommand: "go get github.com/modelnow/sdk-go",
  },
  {
    language: "C#",
    packageName: "ModelNow.SDK",
    installCommand: "dotnet add package ModelNow.SDK",
  },
];

const sdkCode: Record<SdkLanguage, string> = {
  JavaScript: `import { ModelNow } from "@modelnow/sdk";

const modelnow = new ModelNow({
  apiKey: process.env.MODELNOW_API_KEY,
});

const response = await modelnow.chat.completions.create({
  model: "modelnow-auto",
  messages: [
    {
      role: "user",
      content: "Analyze this customer request.",
    },
  ],
});

console.log(response.output);`,

  TypeScript: `import { ModelNow } from "@modelnow/sdk";

const modelnow = new ModelNow({
  apiKey: process.env.MODELNOW_API_KEY,
});

const response = await modelnow.chat.completions.create({
  model: "modelnow-auto",
  messages: [
    {
      role: "user",
      content: "Analyze this customer request.",
    },
  ],
});

console.log(response.output);`,

  Python: `import os
from modelnow import ModelNow

modelnow = ModelNow(
    api_key=os.environ["MODELNOW_API_KEY"]
)

response = modelnow.chat.completions.create(
    model="modelnow-auto",
    messages=[
        {
            "role": "user",
            "content": "Analyze this customer request."
        }
    ]
)

print(response.output)`,

  Java: `import com.modelnow.ModelNow;

public class Main {
    public static void main(String[] args) {
        ModelNow modelnow = new ModelNow(
            System.getenv("MODELNOW_API_KEY")
        );

        var response = modelnow.chat().completions().create(
            "modelnow-auto",
            "Analyze this customer request."
        );

        System.out.println(response.output());
    }
}`,

  Go: `package main

import (
    "context"
    "fmt"
    "os"

    "github.com/modelnow/sdk-go"
)

func main() {
    client := modelnow.NewClient(
        os.Getenv("MODELNOW_API_KEY"),
    )

    response, err := client.Chat.Completions.Create(
        context.Background(),
        "modelnow-auto",
        "Analyze this customer request.",
    )

    if err != nil {
        panic(err)
    }

    fmt.Println(response.Output)
}`,

  "C#": `using ModelNow.SDK;

var modelnow = new ModelNowClient(
    Environment.GetEnvironmentVariable("MODELNOW_API_KEY")
);

var response = await modelnow.Chat.Completions.CreateAsync(
    "modelnow-auto",
    "Analyze this customer request."
);

Console.WriteLine(response.Output);`,
};

export default function SdkPage() {
  const router = useRouter();

  const [selectedLanguage, setSelectedLanguage] =
    useState<SdkLanguage>("TypeScript");

  const [showLanguages, setShowLanguages] = useState(false);
  const [copied, setCopied] = useState(false);
  const [apiKey, setApiKey] = useState("mn_live_••••••••••••••••••");
  const [showKey, setShowKey] = useState(false);
  const [environment, setEnvironment] = useState("Production");

  const selectedSdk = useMemo(
    () =>
      sdkOptions.find(
        (option) => option.language === selectedLanguage
      ) ?? sdkOptions[1],
    [selectedLanguage]
  );

  const code = sdkCode[selectedLanguage];

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setCopied(false);
    }
  };

  const handleGenerateKey = () => {
    setApiKey(
      `mn_live_${Math.random().toString(36).slice(2, 24)}`
    );
    setShowKey(true);
  };

  return (
    <main className="min-h-screen bg-[#08070d] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#08070d]/95 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() =>
                router.push("/agent-builder/deployment")
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-gray-300 transition hover:bg-white/[0.08] hover:text-white"
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <Package size={18} className="text-violet-400" />
                <h1 className="text-sm font-semibold">
                  SDK Deployment
                </h1>
              </div>

              <p className="mt-0.5 text-xs text-gray-500">
                Integrate ModelNow into your applications
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                router.push("/agent-builder/observability")
              }
              className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-gray-300 transition hover:bg-white/[0.08] hover:text-white md:flex"
            >
              <Zap size={14} />
              Observability
            </button>

            <button
              onClick={() => alert("Connection test started.")}
              className="flex items-center gap-2 rounded-lg bg-violet-600 px-3.5 py-2 text-xs font-medium transition hover:bg-violet-500"
            >
              <Play size={14} />
              Test Connection
            </button>
          </div>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-64px)] grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)_300px]">
        {/* LEFT SIDEBAR */}
        <aside className="border-r border-white/10 bg-[#0b0a11] p-5">
          <div className="mb-6">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">
              Deployment
            </p>

            <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.07] p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/15">
                  <Package
                    size={17}
                    className="text-violet-400"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium">
                    ModelNow SDK
                  </p>
                  <p className="text-xs text-gray-500">
                    v1.0.0
                  </p>
                </div>
              </div>
            </div>
          </div>

          <nav className="space-y-1">
            {[
              {
                label: "Overview",
                icon: Rocket,
                route: "/agent-builder/deployment",
              },
              {
                label: "Chat",
                icon: Package,
                route: "/agent-builder/deployment/chat",
              },
              {
                label: "API",
                icon: Terminal,
                route: "/agent-builder/deployment/api",
              },
              {
                label: "SDK",
                icon: Code2,
                route: "/agent-builder/deployment/sdk",
                active: true,
              },
              {
                label: "Webhooks",
                icon: Zap,
                route: "/agent-builder/deployment/webhooks",
              },
              {
                label: "Website Embed",
                icon: Globe,
                route: "/agent-builder/deployment/website-embed",
              },
              {
                label: "Background Agents",
                icon: Play,
                route: "/agent-builder/deployment/background-agents",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  onClick={() => router.push(item.route)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                    item.active
                      ? "bg-violet-500/10 text-violet-300"
                      : "text-gray-400 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <Icon size={16} />

                  <span>{item.label}</span>

                  {item.active && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-400" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mt-8 border-t border-white/10 pt-5">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">
              Resources
            </p>

            <button className="mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-gray-400 transition hover:bg-white/[0.04] hover:text-white">
              <ExternalLink size={15} />
              Documentation
            </button>

            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-gray-400 transition hover:bg-white/[0.04] hover:text-white">
              <Download size={15} />
              SDK Releases
            </button>
          </div>
        </aside>

        {/* CENTER */}
        <section className="min-w-0 p-6 lg:p-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8">
              <div className="mb-3 flex items-center gap-2 text-xs text-violet-400">
                <Code2 size={15} />
                Developer SDK
              </div>

              <h2 className="text-2xl font-semibold tracking-tight">
                Build with ModelNow
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
                Integrate your ModelNow agents into any application
                using the official SDKs.
              </p>
            </div>

            {/* SDK LANGUAGE */}
            <div className="mb-6 rounded-2xl border border-white/10 bg-[#0d0c14] p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">
                    Choose your SDK
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    Select your application language.
                  </p>
                </div>

                <div className="relative">
                  <button
                    onClick={() =>
                      setShowLanguages((value) => !value)
                    }
                    className="flex min-w-[170px] items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm"
                  >
                    {selectedLanguage}
                    <ChevronDown size={15} />
                  </button>

                  {showLanguages && (
                    <div className="absolute right-0 top-[calc(100%+8px)] z-30 w-[210px] rounded-xl border border-white/10 bg-[#121019] p-1.5 shadow-2xl">
                      {sdkOptions.map((option) => (
                        <button
                          key={option.language}
                          onClick={() => {
                            setSelectedLanguage(
                              option.language
                            );
                            setShowLanguages(false);
                            setCopied(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm ${
                            selectedLanguage === option.language
                              ? "bg-violet-500/10 text-violet-300"
                              : "text-gray-400 hover:bg-white/[0.05] hover:text-white"
                          }`}
                        >
                          {option.language}

                          {selectedLanguage === option.language && (
                            <Check size={14} />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {sdkOptions.slice(0, 3).map((option) => (
                  <button
                    key={option.language}
                    onClick={() =>
                      setSelectedLanguage(option.language)
                    }
                    className={`rounded-xl border p-4 text-left transition ${
                      selectedLanguage === option.language
                        ? "border-violet-500/40 bg-violet-500/[0.08]"
                        : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"
                    }`}
                  >
                    <Code2
                      size={17}
                      className={
                        selectedLanguage === option.language
                          ? "mb-3 text-violet-400"
                          : "mb-3 text-gray-500"
                      }
                    />

                    <p className="text-sm font-medium">
                      {option.language}
                    </p>

                    <p className="mt-1 truncate text-xs text-gray-500">
                      {option.packageName}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* INSTALL */}
            <div className="mb-6">
              <h3 className="mb-1 text-sm font-semibold">
                1. Install the SDK
              </h3>

              <p className="mb-3 text-xs text-gray-500">
                Add the ModelNow package to your project.
              </p>

              <div className="overflow-hidden rounded-xl border border-white/10 bg-[#050509]">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Terminal size={14} />
                    Installation
                  </div>

                  <button
                    onClick={() =>
                      handleCopy(selectedSdk.installCommand)
                    }
                    className="flex items-center gap-2 text-xs text-gray-500 hover:text-white"
                  >
                    {copied ? (
                      <>
                        <Check size={13} />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        Copy
                      </>
                    )}
                  </button>
                </div>

                <pre className="overflow-x-auto p-5 text-sm text-gray-300">
                  <code>
                    <span className="text-violet-400">$</span>{" "}
                    {selectedSdk.installCommand}
                  </code>
                </pre>
              </div>
            </div>

            {/* CODE */}
            <div className="mb-6">
              <h3 className="mb-1 text-sm font-semibold">
                2. Initialize ModelNow
              </h3>

              <p className="mb-3 text-xs text-gray-500">
                Create a client and send your first AI request.
              </p>

              <div className="overflow-hidden rounded-xl border border-white/10 bg-[#050509]">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-400/70" />
                    <span className="h-2 w-2 rounded-full bg-yellow-400/70" />
                    <span className="h-2 w-2 rounded-full bg-green-400/70" />

                    <span className="ml-2 text-xs text-gray-500">
                      example.
                      {selectedLanguage === "Python"
                        ? "py"
                        : selectedLanguage === "Java"
                        ? "java"
                        : selectedLanguage === "Go"
                        ? "go"
                        : selectedLanguage === "C#"
                        ? "cs"
                        : "ts"}
                    </span>
                  </div>

                  <button
                    onClick={() => handleCopy(code)}
                    className="flex items-center gap-2 text-xs text-gray-500 hover:text-white"
                  >
                    <Copy size={13} />
                    Copy
                  </button>
                </div>

                <pre className="max-h-[430px] overflow-auto p-5 text-[13px] leading-6 text-gray-300">
                  <code>{code}</code>
                </pre>
              </div>
            </div>

            {/* API KEY */}
            <div className="mb-6 rounded-2xl border border-white/10 bg-[#0d0c14] p-5">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <KeyRound
                      size={16}
                      className="text-violet-400"
                    />
                    <h3 className="text-sm font-semibold">
                      API credentials
                    </h3>
                  </div>

                  <p className="mt-1 text-xs text-gray-500">
                    Keep your API key secure.
                  </p>
                </div>

                <button
                  onClick={handleGenerateKey}
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-gray-300 hover:bg-white/[0.08]"
                >
                  <Plus size={14} />
                  Generate key
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-[1fr_180px]">
                <div>
                  <label className="mb-2 block text-xs text-gray-500">
                    API key
                  </label>

                  <div className="flex items-center rounded-lg border border-white/10 bg-[#08070d] p-2">
                    <input
                      value={
                        showKey
                          ? apiKey
                          : "••••••••••••••••••••••••"
                      }
                      readOnly
                      className="min-w-0 flex-1 bg-transparent px-2 text-sm text-gray-300 outline-none"
                    />

                    <button
                      onClick={() =>
                        setShowKey((value) => !value)
                      }
                      className="px-2 py-1.5 text-xs text-gray-500 hover:text-white"
                    >
                      {showKey ? "Hide" : "Show"}
                    </button>

                    <button
                      onClick={() => handleCopy(apiKey)}
                      className="p-1.5 text-gray-500 hover:text-white"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs text-gray-500">
                    Environment
                  </label>

                  <select
                    value={environment}
                    onChange={(event) =>
                      setEnvironment(event.target.value)
                    }
                    className="w-full rounded-lg border border-white/10 bg-[#08070d] px-3 py-2.5 text-sm text-gray-300 outline-none"
                  >
                    <option>Production</option>
                    <option>Staging</option>
                    <option>Development</option>
                  </select>
                </div>
              </div>
            </div>

            {/* PRODUCTION */}
            <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.04] p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                  <ShieldCheck
                    size={19}
                    className="text-emerald-400"
                  />
                </div>

                <div>
                  <h3 className="text-sm font-semibold">
                    Production-ready integration
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    SDK integrations can support authentication,
                    retries, streaming, request tracing, usage
                    tracking, and observability.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT SIDEBAR */}
        <aside className="border-l border-white/10 bg-[#0b0a11] p-5">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">
            SDK Configuration
          </p>

          <div className="space-y-3">
            <ConfigCard
              icon={<Settings2 size={16} />}
              title="Runtime"
              value="Managed"
            />

            <ConfigCard
              icon={<ShieldCheck size={16} />}
              title="Authentication"
              value="API Key"
            />

            <ConfigCard
              icon={<Globe size={16} />}
              title="Region"
              value="Auto"
            />

            <ConfigCard
              icon={<Zap size={16} />}
              title="Streaming"
              value="Enabled"
            />
          </div>

          <div className="mt-6 border-t border-white/10 pt-5">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">
              Quick Start
            </p>

            <div className="space-y-3 text-xs text-gray-500">
              <p>
                <span className="mr-2 text-violet-400">01</span>
                Install the SDK package.
              </p>

              <p>
                <span className="mr-2 text-violet-400">02</span>
                Configure your API key.
              </p>

              <p>
                <span className="mr-2 text-violet-400">03</span>
                Initialize the client.
              </p>

              <p>
                <span className="mr-2 text-violet-400">04</span>
                Send your first request.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-violet-500/15 bg-violet-500/[0.04] p-4">
            <div className="flex items-center gap-2">
              <Rocket size={15} className="text-violet-400" />
              <span className="text-xs font-medium">
                Deploy with confidence
              </span>
            </div>

            <p className="mt-2 text-[11px] leading-5 text-gray-500">
              Monitor SDK requests, latency, token usage, cost, and
              errors from Observability.
            </p>

            <button
              onClick={() =>
                router.push("/agent-builder/observability")
              }
              className="mt-3 flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300"
            >
              Open Observability
              <ChevronDown
                size={13}
                className="-rotate-90"
              />
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}

function ConfigCard({
  icon,
  title,
  value,
}: {
  icon: ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05] text-gray-400">
        {icon}
      </div>

      <div>
        <p className="text-xs text-gray-500">{title}</p>
        <p className="mt-0.5 text-sm text-gray-300">{value}</p>
      </div>
    </div>
  );
}