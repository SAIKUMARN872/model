"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Brain,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  Code2,
  Database,
  FileText,
  GitBranch,
  Globe,
  Layers3,
  MessageSquare,
  Network,
  Play,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wrench,
  X,
  Zap,
} from "lucide-react";

type TemplateCategory =
  | "All"
  | "Customer Support"
  | "Research"
  | "Automation"
  | "Developer"
  | "Data"
  | "Enterprise";

type Template = {
  id: string;
  name: string;
  description: string;
  category: Exclude<TemplateCategory, "All">;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  tags: string[];
  model: string;
  tools: string[];
  featured?: boolean;
  popular?: boolean;
};

const templates: Template[] = [
  {
    id: "customer-support",
    name: "Customer Support Agent",
    description:
      "Handle customer questions, search knowledge bases, create tickets and escalate complex issues to humans.",
    category: "Customer Support",
    icon: MessageSquare,
    color: "blue",
    tags: ["Support", "RAG", "Human Approval"],
    model: "GPT-5.6",
    tools: ["Knowledge Base", "Ticketing", "Web Search"],
    featured: true,
    popular: true,
  },
  {
    id: "research-agent",
    name: "Deep Research Agent",
    description:
      "Research topics across multiple sources, compare information and produce structured reports with citations.",
    category: "Research",
    icon: Search,
    color: "violet",
    tags: ["Research", "Web", "Reports"],
    model: "GPT-5.6",
    tools: ["Web Search", "Browser", "RAG"],
    featured: true,
    popular: true,
  },
  {
    id: "browser-agent",
    name: "Browser Automation Agent",
    description:
      "Automate approved browser tasks such as data collection, navigation, form processing and repetitive workflows.",
    category: "Automation",
    icon: Globe,
    color: "cyan",
    tags: ["Browser", "Automation", "Workflow"],
    model: "GPT-5.6",
    tools: ["Browser Automation", "Computer Use"],
    popular: true,
  },
  {
    id: "coding-agent",
    name: "Software Engineer Agent",
    description:
      "Analyze repositories, write code, review changes, debug issues and assist with development workflows.",
    category: "Developer",
    icon: Code2,
    color: "emerald",
    tags: ["Code", "GitHub", "Developer"],
    model: "GPT-5.6",
    tools: ["Code Execution", "GitHub", "Terminal"],
    featured: true,
  },
  {
    id: "data-analyst",
    name: "Data Analyst Agent",
    description:
      "Query structured data, analyze datasets, identify trends and generate business-ready insights.",
    category: "Data",
    icon: Database,
    color: "amber",
    tags: ["SQL", "Analytics", "Data"],
    model: "GPT-5.6",
    tools: ["Database", "Code Execution"],
    popular: true,
  },
  {
    id: "sales-agent",
    name: "Sales Assistant",
    description:
      "Research prospects, summarize accounts, prepare outreach and help sales teams manage follow-up workflows.",
    category: "Enterprise",
    icon: BriefcaseBusiness,
    color: "orange",
    tags: ["Sales", "CRM", "Research"],
    model: "GPT-5.6",
    tools: ["CRM", "Web Search", "REST API"],
  },
  {
    id: "knowledge-agent",
    name: "Enterprise Knowledge Agent",
    description:
      "Answer questions using private company documents, policies, websites and connected knowledge sources.",
    category: "Enterprise",
    icon: Brain,
    color: "pink",
    tags: ["RAG", "Enterprise", "Knowledge"],
    model: "GPT-5.6",
    tools: ["RAG", "Documents", "Database"],
    featured: true,
  },
  {
    id: "workflow-agent",
    name: "Workflow Orchestrator",
    description:
      "Coordinate multiple tools and sub-agents through triggers, conditions, parallel execution and recovery.",
    category: "Automation",
    icon: Network,
    color: "indigo",
    tags: ["Agents", "Workflow", "Orchestration"],
    model: "ModelNow Auto Router",
    tools: ["MCP", "REST API", "Sub-Agents"],
  },
  {
    id: "document-agent",
    name: "Document Intelligence Agent",
    description:
      "Read, classify, extract and summarize information from large collections of business documents.",
    category: "Research",
    icon: FileText,
    color: "rose",
    tags: ["Documents", "Extraction", "RAG"],
    model: "GPT-5.6",
    tools: ["Documents", "RAG", "Code Execution"],
  },
  {
    id: "database-agent",
    name: "Database Assistant",
    description:
      "Understand natural language questions, generate database queries and return useful data insights.",
    category: "Data",
    icon: Database,
    color: "teal",
    tags: ["Database", "SQL", "Analytics"],
    model: "GPT-5.6",
    tools: ["Database", "Code Execution"],
  },
  {
    id: "multi-agent",
    name: "Multi-Agent Team",
    description:
      "Create a coordinated team of specialized agents with planning, delegation, review and result synthesis.",
    category: "Enterprise",
    icon: Users,
    color: "purple",
    tags: ["Multi-Agent", "Planning", "Enterprise"],
    model: "ModelNow Auto Router",
    tools: ["Sub-Agents", "MCP", "RAG"],
    popular: true,
  },
  {
    id: "security-agent",
    name: "Security Review Agent",
    description:
      "Review application configurations, identify potential security risks and prepare structured findings.",
    category: "Enterprise",
    icon: ShieldCheck,
    color: "red",
    tags: ["Security", "Governance", "Audit"],
    model: "GPT-5.6",
    tools: ["Code Execution", "Database", "Custom Tools"],
  },
];

const categories: TemplateCategory[] = [
  "All",
  "Customer Support",
  "Research",
  "Automation",
  "Developer",
  "Data",
  "Enterprise",
];

export default function TemplatesPage() {
  const router = useRouter();

  const [category, setCategory] =
    useState<TemplateCategory>("All");
  const [search, setSearch] = useState("");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<Template | null>(null);
  const [createdTemplate, setCreatedTemplate] =
    useState<string | null>(null);

  const filteredTemplates = useMemo(() => {
    const query = search.trim().toLowerCase();

    return templates.filter((template) => {
      const categoryMatch =
        category === "All" || template.category === category;

      const featuredMatch =
        !featuredOnly || template.featured === true;

      const searchMatch =
        !query ||
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.tags.some((tag) =>
          tag.toLowerCase().includes(query),
        );

      return categoryMatch && featuredMatch && searchMatch;
    });
  }, [category, search, featuredOnly]);

  const useTemplate = (template: Template) => {
    setCreatedTemplate(template.id);

    setTimeout(() => {
      router.push(
        `/agent-builder/creation/create-with-ai?template=${template.id}`,
      );
    }, 500);
  };

  return (
    <main className="min-h-screen bg-[#07070a] text-white">
      <div className="mx-auto min-h-screen max-w-[1500px]">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-white/[0.08] px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-white/50 transition hover:bg-white/[0.07] hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10">
              <Layers3 className="h-5 w-5 text-violet-300" />
            </div>

            <div>
              <h1 className="text-sm font-semibold">
                Agent Templates
              </h1>

              <p className="text-[11px] text-white/30">
                Start with a production-ready agent blueprint
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/agent-builder/creation/create-with-ai",
              )
            }
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-500"
          >
            <Sparkles className="h-4 w-4" />
            Create with AI
          </button>
        </header>

        {/* Main */}
        <section className="px-6 py-7">
          <div className="mx-auto max-w-[1250px]">
            {/* Hero */}
            <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-violet-500/[0.12] via-white/[0.025] to-transparent p-7">
              <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-violet-500/[0.08] blur-3xl" />

              <div className="relative max-w-3xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/[0.07] px-3 py-1.5 text-[10px] font-medium text-violet-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  ModelNow Agent Library
                </div>

                <h2 className="text-3xl font-semibold tracking-tight">
                  Start building from a
                  <span className="text-violet-400">
                    {" "}
                    proven agent pattern.
                  </span>
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/40">
                  Choose a template, customize the instructions,
                  models, tools, memory and workflows, then continue
                  building your production agent in ModelNow.
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-4 text-[11px] text-white/30">
                  <span className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-300" />
                    Preconfigured tools
                  </span>

                  <span className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-300" />
                    Model configuration
                  </span>

                  <span className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-300" />
                    Memory setup
                  </span>

                  <span className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-300" />
                    Security defaults
                  </span>
                </div>
              </div>
            </div>

            {/* Search + filters */}
            <div className="mt-7 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative max-w-[420px] flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search templates..."
                  className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.025] pl-10 pr-4 text-xs text-white outline-none placeholder:text-white/20 focus:border-violet-500/40"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 transition hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  setFeaturedOnly((value) => !value)
                }
                className={`flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-xs font-medium transition ${
                  featuredOnly
                    ? "border-amber-500/30 bg-amber-500/[0.08] text-amber-300"
                    : "border-white/[0.08] bg-white/[0.025] text-white/45 hover:text-white"
                }`}
              >
                <Star className="h-3.5 w-3.5" />
                Featured only
              </button>
            </div>

            {/* Categories */}
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {categories.map((item) => {
                const active = category === item;

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={`shrink-0 rounded-full border px-3.5 py-2 text-[10px] font-medium transition ${
                      active
                        ? "border-violet-500/30 bg-violet-500/[0.1] text-violet-300"
                        : "border-white/[0.07] bg-white/[0.02] text-white/35 hover:bg-white/[0.05] hover:text-white/65"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>

            {/* Result count */}
            <div className="mt-7 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">
                  Agent Templates
                </h3>

                <p className="mt-1 text-[11px] text-white/30">
                  {filteredTemplates.length} templates available
                </p>
              </div>
            </div>

            {/* Template grid */}
            {filteredTemplates.length > 0 ? (
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredTemplates.map((template) => {
                  const Icon = template.icon;
                  const isCreating =
                    createdTemplate === template.id;

                  return (
                    <div
                      key={template.id}
                      className="group relative flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition hover:-translate-y-0.5 hover:border-violet-500/25 hover:bg-white/[0.04]"
                    >
                      {/* Featured */}
                      {template.featured && (
                        <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/[0.07] px-2 py-1 text-[9px] font-medium text-amber-300">
                          <Star className="h-2.5 w-2.5 fill-current" />
                          Featured
                        </div>
                      )}

                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                          <Icon className="h-5 w-5" />
                        </div>

                        {!template.featured && template.popular && (
                          <span className="rounded-full border border-white/[0.07] bg-white/[0.03] px-2 py-1 text-[9px] text-white/30">
                            Popular
                          </span>
                        )}
                      </div>

                      <h4 className="mt-5 pr-16 text-sm font-semibold">
                        {template.name}
                      </h4>

                      <p className="mt-2 min-h-[60px] text-xs leading-5 text-white/35">
                        {template.description}
                      </p>

                      {/* Tags */}
                      <div className="mt-4 flex min-h-[25px] flex-wrap gap-1.5">
                        {template.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md border border-white/[0.06] bg-white/[0.025] px-2 py-1 text-[9px] text-white/30"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Config */}
                      <div className="mt-5 space-y-2 border-t border-white/[0.06] pt-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-white/25">
                            Model
                          </span>

                          <span className="text-[10px] text-white/50">
                            {template.model}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[10px] text-white/25">
                            Tools
                          </span>

                          <span className="truncate text-right text-[10px] text-white/50">
                            {template.tools.join(" • ")}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-5 flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedTemplate(template)
                          }
                          className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.025] text-[10px] font-medium text-white/50 transition hover:bg-white/[0.06] hover:text-white"
                        >
                          Preview
                        </button>

                        <button
                          type="button"
                          onClick={() => useTemplate(template)}
                          disabled={isCreating}
                          className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-violet-600 text-[10px] font-semibold text-white transition hover:bg-violet-500 disabled:opacity-60"
                        >
                          {isCreating ? (
                            <>
                              <Check className="h-3.5 w-3.5" />
                              Loading
                            </>
                          ) : (
                            <>
                              Use Template
                              <ArrowRight className="h-3.5 w-3.5" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.02] p-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.04]">
                  <Search className="h-5 w-5 text-white/25" />
                </div>

                <h3 className="mt-4 text-sm font-medium text-white/70">
                  No templates found
                </h3>

                <p className="mt-2 text-xs text-white/30">
                  Try another search term or category.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setCategory("All");
                    setFeaturedOnly(false);
                  }}
                  className="mt-5 rounded-lg border border-white/[0.08] px-4 py-2 text-xs text-white/50 transition hover:bg-white/[0.05] hover:text-white"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Custom template CTA */}
            <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
                  <Plus className="h-5 w-5 text-violet-300" />
                </div>

                <div>
                  <h3 className="text-sm font-semibold">
                    Build your own template
                  </h3>

                  <p className="mt-1 max-w-xl text-xs leading-5 text-white/35">
                    Create a reusable internal agent blueprint with
                    your own instructions, tools, memory, security
                    policies and workflow configuration.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/agent-builder/creation/create-with-ai",
                  )
                }
                className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-violet-500/20 bg-violet-500/[0.07] px-4 py-2.5 text-xs font-medium text-violet-300 transition hover:bg-violet-500/[0.12]"
              >
                <Sparkles className="h-4 w-4" />
                Create Custom Agent
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Preview Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm">
          <div className="w-full max-w-[620px] overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0b0b10] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10">
                  <selectedTemplate.icon className="h-4 w-4 text-violet-300" />
                </div>

                <div>
                  <h3 className="text-sm font-semibold">
                    {selectedTemplate.name}
                  </h3>

                  <p className="text-[10px] text-white/30">
                    {selectedTemplate.category}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTemplate(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 transition hover:bg-white/[0.06] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5">
              <p className="text-xs leading-6 text-white/45">
                {selectedTemplate.description}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <PreviewItem
                  icon={<Bot className="h-3.5 w-3.5" />}
                  label="Model"
                  value={selectedTemplate.model}
                />

                <PreviewItem
                  icon={<Wrench className="h-3.5 w-3.5" />}
                  label="Tools"
                  value={`${selectedTemplate.tools.length} configured`}
                />

                <PreviewItem
                  icon={<Brain className="h-3.5 w-3.5" />}
                  label="Intelligence"
                  value="Configured"
                />

                <PreviewItem
                  icon={<ShieldCheck className="h-3.5 w-3.5" />}
                  label="Security"
                  value="Enterprise-ready"
                />
              </div>

              <div className="mt-5 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/25">
                  Included capabilities
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedTemplate.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-2.5 py-1.5 text-[10px] text-white/45"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTemplate(null)}
                  className="rounded-lg border border-white/[0.08] px-4 py-2.5 text-xs text-white/50 transition hover:bg-white/[0.05] hover:text-white"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const template = selectedTemplate;
                    setSelectedTemplate(null);
                    useTemplate(template);
                  }}
                  className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-500"
                >
                  Use Template
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function PreviewItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
      <div className="flex items-center gap-2 text-violet-300/70">
        {icon}
        <span className="text-[9px] uppercase tracking-wider text-white/25">
          {label}
        </span>
      </div>

      <p className="mt-2 text-xs text-white/60">{value}</p>
    </div>
  );
}