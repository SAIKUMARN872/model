"use client";

import {
  useRef,
  useState,
  type ChangeEvent,
  type ElementType,
  type KeyboardEvent,
  type RefObject,
} from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArrowUp,
  BarChart3,
  Bell,
  Bot,
  Brain,
  BriefcaseBusiness,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Code2,
  Database,
  ExternalLink,
  FileCode2,
  FileText,
  Globe,
  HelpCircle,
  Image as ImageIcon,
  Layers3,
  MessageSquare,
  Mic,
  Monitor,
  MoreVertical,
  Play,
  Pin,
  Plus,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  Sparkles,
  Target,
  TestTube2,
  Trash2,
  User,
  Video,
  Workflow,
  X,
  Zap,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

type Capability = {
  name: string;
  description: string;
  icon: ElementType;
  href?: string;
};

type BusinessWorkflow = {
  name: string;
  description: string;
  href: string;
};

type PlusMenuItem = {
  name: string;
  description: string;
  icon: ElementType;
  action: string;
};

type ActivePage =
  | "home"
  | "plugins"
  | "schedule"
  | "projects"
  | "customise"
  | "library"
  | "plans"
  | "pinned"
  | "recents"
  | "agent-builder";

/* =========================================================
   PLATFORM FEATURES
========================================================= */

const platformCapabilities: Capability[] = [
  {
    name: "Browser Automation",
    description: "Automate tasks across websites and browsers",
    icon: Globe,
    href: "/browser-automation",
  },
  {
    name: "Fine-tuning",
    description: "Customize AI models for special domains",
    icon: Target,
    href: "/fine-tuning",
  },
  {
    name: "Agent Workflows",
    description: "Build intelligent AI agents and workflows",
    icon: Workflow,
  },
  {
    name: "Computer Use",
    description: "Control computers, applications and browsers with AI",
    icon: Monitor,
    href: "/computer-use",
  },
  {
    name: "Knowledge & RAG",
    description:
      "Private company knowledge, documents and enterprise data",
    icon: Database,
    href: "/knowledge",
  },
  {
    name: "Multimodal AI",
    description:
      "Work with voice, camera, images, documents and videos",
    icon: Video,
    href: "/multimodal-ai",
  },
];

/* =========================================================
   BUSINESS WORKFLOWS
========================================================= */

const businessWorkflows: BusinessWorkflow[] = [
  {
    name: "Business Support",
    description: "AI-powered business support operations",
    href: "/enterprise/business-support",
  },
  {
    name: "CRM",
    description: "Customer relationship management",
    href: "/enterprise/crm",
  },
  {
    name: "ERP",
    description: "Enterprise resource planning",
    href: "/enterprise/erp",
  },
  {
    name: "HR",
    description: "Human resources automation",
    href: "/enterprise/hr",
  },
  {
    name: "Sales",
    description: "AI-powered sales operations",
    href: "/enterprise/sales",
  },
  {
    name: "Finance",
    description: "Finance and accounting automation",
    href: "/enterprise/finance",
  },
];

/* =========================================================
   PLUS MENU
========================================================= */

const plusMenuItems: PlusMenuItem[] = [
  {
    name: "New Chat",
    description: "Start a fresh conversation",
    icon: MessageSquare,
    action: "new-chat",
  },
  {
    name: "Chart",
    description: "View AI analytics and charts",
    icon: BarChart3,
    action: "chart",
  },
  {
    name: "Voice",
    description: "Open voice mode",
    icon: Mic,
    action: "voice",
  },
  {
    name: "Camera",
    description: "Take a photo",
    icon: Camera,
    action: "camera",
  },
  {
    name: "Photos",
    description: "Upload photos",
    icon: ImageIcon,
    action: "photos",
  },
  {
    name: "PDF / Document",
    description: "Upload documents and files",
    icon: FileText,
    action: "document",
  },
  {
    name: "Web Search",
    description: "Search the web",
    icon: Globe,
    action: "web-search",
  },
  {
    name: "Deep Search",
    description: "Perform deeper research",
    icon: Search,
    action: "deep-search",
  },
  {
    name: "Agent Builder",
    description: "Build an AI agent",
    icon: Bot,
    action: "agent-builder",
  },
];

/* =========================================================
   AGENT BUILDER SECTIONS
========================================================= */

const agentBuilderSections = [
  {
    title: "Agent Creation",
    icon: Bot,
    items: [
      ["Create with AI", "Describe your agent and let AI build it"],
      ["Visual Builder", "Build agents using a visual canvas"],
      ["Pro-Code Builder", "Build advanced agents with code"],
      ["Templates", "Start from production-ready templates"],
      ["Import / Duplicate Agent", "Reuse an existing agent"],
    ],
  },
  {
    title: "Agent Intelligence",
    icon: Brain,
    items: [
      ["Agent Brain", "Core reasoning and decision engine"],
      ["Planning & Reasoning", "Plan complex multi-step tasks"],
      ["Model Router", "Automatically select the right model"],
      ["Prompt Optimization", "Optimize prompts automatically"],
      ["Context Optimization", "Reduce context cost and latency"],
      ["Goal Management", "Track and manage agent goals"],
      ["Multi-Agent Collaboration", "Coordinate multiple agents"],
    ],
  },
  {
    title: "Workflow Orchestration",
    icon: Workflow,
    items: [
      ["Visual Canvas", "Connect agents, tools and logic"],
      ["Triggers", "Start agents from events"],
      ["Conditions", "Create intelligent branches"],
      ["Loops", "Repeat tasks dynamically"],
      ["Parallel Execution", "Run tasks simultaneously"],
      ["Human Approval", "Require approval for sensitive actions"],
      ["Sub-Agents", "Delegate tasks to specialized agents"],
      ["Error Recovery", "Automatically recover failed tasks"],
    ],
  },
  {
    title: "Tools & Actions",
    icon: Zap,
    items: [
      ["MCP", "Connect Model Context Protocol tools"],
      ["REST APIs", "Connect external APIs"],
      ["Browser Automation", "Automate browser tasks"],
      ["Computer Use", "Control computers with AI"],
      ["Database Tools", "Read and write enterprise data"],
      ["Code Execution", "Execute controlled code"],
      ["Custom Tools", "Create your own tools"],
    ],
  },
  {
    title: "Knowledge & Memory",
    icon: Database,
    items: [
      ["RAG", "Ground agents in private knowledge"],
      ["Documents", "Connect company documents"],
      ["Websites", "Connect website knowledge"],
      ["Short-Term Memory", "Remember current tasks"],
      ["Long-Term Memory", "Persist important information"],
      ["Context Management", "Control agent context"],
    ],
  },
  {
    title: "Testing & Evaluation",
    icon: TestTube2,
    items: [
      ["Playground", "Interactively test your agent"],
      ["Test Cases", "Create repeatable tests"],
      ["Evaluation Datasets", "Evaluate agent quality"],
      ["Trace Viewer", "Inspect execution traces"],
      ["Quality Evaluation", "Measure response quality"],
      ["Regression Testing", "Detect performance regressions"],
    ],
  },
  {
    title: "Security & Governance",
    icon: ShieldCheck,
    items: [
      ["Permissions", "Control what agents can access"],
      ["Tool Policies", "Control tool execution"],
      ["Guardrails", "Protect against unsafe actions"],
      ["Human Approvals", "Add approval checkpoints"],
      ["Audit Logs", "Track agent activity"],
      ["Enterprise Access Control", "Manage organizational access"],
    ],
  },
  {
    title: "Deployment",
    icon: ExternalLink,
    items: [
      ["Chat", "Deploy as an AI assistant"],
      ["API", "Expose your agent through APIs"],
      ["SDK", "Integrate into applications"],
      ["Webhooks", "Trigger agents from events"],
      ["Website Embed", "Embed agents into websites"],
      ["Background Agents", "Run agents autonomously"],
    ],
  },
  {
    title: "Observability & Optimization",
    icon: BarChart3,
    items: [
      ["Execution Traces", "Understand every agent step"],
      ["Cost Analytics", "Track AI spending"],
      ["Latency Analytics", "Track execution latency"],
      ["Token Usage", "Monitor token consumption"],
      ["Success Rate", "Measure successful executions"],
      ["Agent Versions", "Track agent versions"],
      ["AI Optimization Engine", "Automatically improve cost, speed and quality"],
    ],
  },
];

/* =========================================================
   HOME PAGE
========================================================= */

export default function HomePage() {
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [activePage, setActivePage] =
    useState<ActivePage>("home");

  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  const [profileOpen, setProfileOpen] =
    useState(false);

  const [moreOpen, setMoreOpen] =
    useState(false);

  const [plusOpen, setPlusOpen] =
    useState(false);

  const [agentWorkflowOpen, setAgentWorkflowOpen] =
    useState(false);

  const [selectedCapability, setSelectedCapability] =
    useState<string | null>(null);

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const photoInputRef =
    useRef<HTMLInputElement>(null);

  const cameraInputRef =
    useRef<HTMLInputElement>(null);

  /* =======================================================
     NEW CHAT
  ======================================================= */

  function startNewChat() {
    setMessages([]);
    setInput("");
    setIsLoading(false);
    setPlusOpen(false);
    setMoreOpen(false);
    setProfileOpen(false);
    setAgentWorkflowOpen(false);
    setSelectedCapability(null);
    setActivePage("home");
  }

  /* =======================================================
     SIDEBAR
  ======================================================= */

  function handleSidebarClick(label: string) {
    setMobileSidebarOpen(false);
    setProfileOpen(false);
    setMoreOpen(false);
    setPlusOpen(false);

    switch (label) {
      case "New Chat":
        startNewChat();
        break;

      case "Plugins":
        setActivePage("plugins");
        break;

      case "Schedule":
        setActivePage("schedule");
        break;

      case "Projects":
        setActivePage("projects");
        break;

      case "Customize":
        setActivePage("customise");
        break;

      case "Library":
        setActivePage("library");
        break;

      case "Plans":
        setActivePage("plans");
        break;

      case "Pinned":
        setActivePage("pinned");
        break;

      case "Recents":
        setActivePage("recents");
        break;
    }
  }

  /* =======================================================
     PLUS MENU
  ======================================================= */

  function handlePlusItem(item: PlusMenuItem) {
    setPlusOpen(false);

    switch (item.action) {
      case "new-chat":
        startNewChat();
        break;

      case "chart":
        router.push("/chart");
        break;

      case "voice":
        router.push("/voice");
        break;

      case "camera":
        cameraInputRef.current?.click();
        break;

      case "photos":
        photoInputRef.current?.click();
        break;

      case "document":
        fileInputRef.current?.click();
        break;

      case "web-search":
        setInput("Search the web for ");
        break;

      case "deep-search":
        setInput("Perform deep research on ");
        break;

      case "agent-builder":
        setActivePage("agent-builder");
        break;
    }
  }

  /* =======================================================
     FILE HANDLERS
  ======================================================= */

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setInput(`Attached: ${file.name}`);
    event.target.value = "";
  }

  function handlePhotoChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setInput(`Photo attached: ${file.name}`);
    event.target.value = "";
  }

  function handleCameraChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setInput(`Camera image attached: ${file.name}`);
    event.target.value = "";
  }

  /* =======================================================
     FEATURE CLICK
  ======================================================= */

  function handleCapabilityClick(
    capability: Capability
  ) {
    setSelectedCapability(capability.name);

    if (capability.href) {
      router.push(capability.href);
      return;
    }

    if (capability.name === "Agent Workflows") {
      setAgentWorkflowOpen((value) => !value);
      setActivePage("agent-builder");
    }
  }

  /* =======================================================
     WORKFLOW CLICK
  ======================================================= */

  function handleWorkflowClick(
    workflow: BusinessWorkflow
  ) {
    router.push(workflow.href);
  }

  /* =======================================================
     SEND MESSAGE
  ======================================================= */

  function sendMessage() {
    const text = input.trim();

    if (!text || isLoading) return;

    setMessages((previous) => [
      ...previous,
      {
        id: Date.now(),
        role: "user",
        content: text,
      },
    ]);

    setInput("");
    setIsLoading(true);

    setTimeout(() => {
      setMessages((previous) => [
        ...previous,
        {
          id: Date.now() + 1,
          role: "assistant",
          content:
            "Your message was received. ModelNow AI response integration will be connected next.",
        },
      ]);

      setIsLoading(false);
    }, 700);
  }

  /* =======================================================
     KEYBOARD
  ======================================================= */

  function handleKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      sendMessage();
    }
  }

  /* =======================================================
     PROFILE
  ======================================================= */

  function handleProfileAction(
    action: string
  ) {
    setProfileOpen(false);

    switch (action) {
      case "account":
        router.push("/account");
        break;

      case "settings":
        router.push("/settings");
        break;

      case "notifications":
        router.push("/notifications");
        break;

      case "security":
        router.push("/security");
        break;

      case "help":
        router.push("/help-support");
        break;

      case "logout":
        router.push("/logout");
        break;
    }
  }

  /* =======================================================
     MORE MENU
  ======================================================= */

  function handleMoreAction(
    action: string
  ) {
    setMoreOpen(false);

    switch (action) {
      case "pin":
        setActivePage("pinned");
        break;

      case "share":
        router.push("/share");
        break;

      case "archive":
        router.push("/archive");
        break;

      case "delete":
        router.push("/delete");
        break;
    }
  }

  /* =======================================================
     MIDDLE CONTENT
  ======================================================= */

  function renderMiddleContent() {
    if (activePage === "home") {
      return (
        <>
          {messages.length === 0 ? (
            <EmptyState
              input={input}
              setInput={setInput}
              isLoading={isLoading}
              sendMessage={sendMessage}
              handleKeyDown={handleKeyDown}
              agentWorkflowOpen={agentWorkflowOpen}
              setAgentWorkflowOpen={
                setAgentWorkflowOpen
              }
              selectedCapability={
                selectedCapability
              }
              onSelectCapability={
                handleCapabilityClick
              }
              onSelectWorkflow={
                handleWorkflowClick
              }
              plusOpen={plusOpen}
              setPlusOpen={setPlusOpen}
              handlePlusItem={handlePlusItem}
              fileInputRef={fileInputRef}
              photoInputRef={photoInputRef}
              cameraInputRef={cameraInputRef}
              handleFileChange={handleFileChange}
              handlePhotoChange={handlePhotoChange}
              handleCameraChange={
                handleCameraChange
              }
              openVoice={() =>
                router.push("/voice")
              }
            />
          ) : (
            <div className="mx-auto w-full max-w-4xl px-4 py-8 md:px-8">
              <div className="space-y-6">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                  />
                ))}

                {isLoading && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
                      <Sparkles size={16} />
                    </div>

                    <div className="rounded-2xl bg-slate-100 px-4 py-3">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400" />
                        <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400" />
                        <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      );
    }

    if (activePage === "agent-builder") {
      return (
        <AgentBuilder />
      );
    }

    return (
      <WorkspacePage
        page={activePage}
        onOpenAgentBuilder={() =>
          setActivePage("agent-builder")
        }
      />
    );
  }

  return (
    <main className="flex min-h-screen bg-white text-slate-900">
      {/* MOBILE OVERLAY */}

      {mobileSidebarOpen && (
        <button
          aria-label="Close sidebar"
          onClick={() =>
            setMobileSidebarOpen(false)
          }
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
        />
      )}

      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex w-64 shrink-0 flex-col
          border-r border-slate-200
          bg-slate-50
          transition-transform
          lg:static lg:translate-x-0
          ${
            mobileSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* LOGO */}

        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5">
          <button
            onClick={startNewChat}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Sparkles size={18} />
            </div>

            <div className="text-left">
              <h1 className="font-bold">
                ModelNow
              </h1>

              <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                AI Platform
              </p>
            </div>
          </button>

          <button
            onClick={() =>
              setMobileSidebarOpen(false)
            }
            className="rounded-lg p-2 text-slate-400 hover:bg-white lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* NAVIGATION */}

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            <button
              onClick={() =>
                handleSidebarClick("New Chat")
              }
              className="
                flex w-full
                items-center gap-3
                rounded-xl
                bg-black
                px-4 py-3
                text-left
                text-sm font-semibold
                text-white
                shadow-sm
                transition
                hover:bg-slate-800
              "
            >
              <MessageSquare size={17} />
              <span>New Chat</span>
            </button>

            <SidebarItem
              label="Plugins"
              icon={Layers3}
              active={
                activePage === "plugins"
              }
              onClick={() =>
                handleSidebarClick("Plugins")
              }
            />

            <SidebarItem
              label="Schedule"
              icon={Clock3}
              active={
                activePage === "schedule"
              }
              onClick={() =>
                handleSidebarClick("Schedule")
              }
            />

            <SidebarItem
              label="Projects"
              icon={BriefcaseBusiness}
              active={
                activePage === "projects"
              }
              onClick={() =>
                handleSidebarClick("Projects")
              }
            />

            <SidebarItem
              label="Customize"
              icon={Settings}
              active={
                activePage === "customise"
              }
              onClick={() =>
                handleSidebarClick("Customize")
              }
            />

            <SidebarItem
              label="Library"
              icon={Database}
              active={
                activePage === "library"
              }
              onClick={() =>
                handleSidebarClick("Library")
              }
            />

            <SidebarItem
              label="Plans"
              icon={Sparkles}
              active={
                activePage === "plans"
              }
              onClick={() =>
                handleSidebarClick("Plans")
              }
            />

            <SidebarItem
              label="Agent Builder"
              icon={Bot}
              active={
                activePage === "agent-builder"
              }
              onClick={() =>
                setActivePage("agent-builder")
              }
            />
          </div>

          <div className="mt-7">
            <p className="mb-2 px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Pinned
            </p>

            <SidebarItem
              label="Pinned"
              icon={Pin}
              active={
                activePage === "pinned"
              }
              onClick={() =>
                handleSidebarClick("Pinned")
              }
            />
          </div>

          <div className="mt-6">
            <p className="mb-2 px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Recents
            </p>

            <SidebarItem
              label="Recents"
              icon={Clock3}
              active={
                activePage === "recents"
              }
              onClick={() =>
                handleSidebarClick("Recents")
              }
            />
          </div>
        </nav>

        {/* ACCOUNT */}

        <div className="relative border-t border-slate-200 p-3">
          {profileOpen && (
            <div className="absolute bottom-16 left-3 right-3 z-50 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
              <div className="px-3 py-2">
                <p className="text-xs font-semibold">
                  Account
                </p>

                <p className="text-[11px] text-slate-400">
                  ModelNow workspace
                </p>
              </div>

              <ProfileMenuItem
                icon={User}
                label="Account"
                onClick={() =>
                  handleProfileAction("account")
                }
              />

              <ProfileMenuItem
                icon={Settings}
                label="Settings"
                onClick={() =>
                  handleProfileAction("settings")
                }
              />

              <ProfileMenuItem
                icon={Bell}
                label="Notifications"
                onClick={() =>
                  handleProfileAction(
                    "notifications"
                  )
                }
              />

              <ProfileMenuItem
                icon={ShieldCheck}
                label="Security"
                onClick={() =>
                  handleProfileAction("security")
                }
              />

              <ProfileMenuItem
                icon={HelpCircle}
                label="Help & Support"
                onClick={() =>
                  handleProfileAction("help")
                }
              />

              <div className="my-1 border-t border-slate-100" />

              <ProfileMenuItem
                icon={LogOutIcon}
                label="Log out"
                onClick={() =>
                  handleProfileAction("logout")
                }
              />
            </div>
          )}

          <button
            onClick={() =>
              setProfileOpen(
                (value) => !value
              )
            }
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-white"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
              U
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                User
              </p>

              <p className="truncate text-[10px] text-slate-400">
                ModelNow account
              </p>
            </div>

            <ChevronRight
              size={16}
              className={`transition ${
                profileOpen
                  ? "rotate-90"
                  : ""
              }`}
            />
          </button>
        </div>
      </aside>

      {/* ===================================================
          MAIN AREA
      =================================================== */}

      <section className="relative flex min-w-0 flex-1 flex-col">
        {/* HEADER */}

        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-7">
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                setMobileSidebarOpen(true)
              }
              className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-slate-100 lg:hidden"
            >
              <Layers3 size={19} />
            </button>

            <div>
              <h2 className="font-semibold">
                {activePage === "agent-builder"
                  ? "Agent Builder"
                  : "ModelNow"}
              </h2>

              <p className="text-xs text-slate-400">
                {activePage ===
                "agent-builder"
                  ? "Build intelligent AI agents"
                  : "AI workspace"}
              </p>
            </div>
          </div>

          <div className="relative flex items-center gap-1">
            <button
              onClick={() =>
                router.push("/dashboard")
              }
              className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-slate-100"
            >
              Dashboard
            </button>

            <button
              aria-label="Chat options"
              onClick={() => {
                setMoreOpen(
                  (value) => !value
                );
                setProfileOpen(false);
                setPlusOpen(false);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-slate-100"
            >
              <MoreVertical size={19} />
            </button>

            {moreOpen && (
              <div className="absolute right-0 top-12 z-50 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                <MoreMenuItem
                  icon={Pin}
                  label="Pin Chat"
                  onClick={() =>
                    handleMoreAction("pin")
                  }
                />

                <MoreMenuItem
                  icon={Share2}
                  label="Share"
                  onClick={() =>
                    handleMoreAction("share")
                  }
                />

                <MoreMenuItem
                  icon={Archive}
                  label="Archive"
                  onClick={() =>
                    handleMoreAction("archive")
                  }
                />

                <div className="my-1 border-t border-slate-100" />

                <MoreMenuItem
                  icon={Trash2}
                  label="Delete"
                  onClick={() =>
                    handleMoreAction("delete")
                  }
                />
              </div>
            )}
          </div>
        </header>

        {/* MIDDLE CONTENT */}

        <div className="min-h-0 flex-1 overflow-y-auto">
          {renderMiddleContent()}
        </div>

        {/* CHAT COMPOSER */}

        {activePage === "home" &&
          messages.length > 0 && (
            <Composer
              input={input}
              setInput={setInput}
              isLoading={isLoading}
              sendMessage={sendMessage}
              handleKeyDown={handleKeyDown}
              plusOpen={plusOpen}
              setPlusOpen={setPlusOpen}
              handlePlusItem={handlePlusItem}
              openVoice={() =>
                router.push("/voice")
              }
            />
          )}
      </section>
    </main>
  );
}

/* =========================================================
   AGENT BUILDER
========================================================= */

function AgentBuilder() {
  const [selectedSection, setSelectedSection] =
    useState("Agent Creation");

  const [builderMode, setBuilderMode] =
    useState<
      "ai" | "visual" | "code"
    >("ai");

  const currentSection =
    agentBuilderSections.find(
      (section) =>
        section.title === selectedSection
    );

  return (
    <div className="flex min-h-full flex-col bg-slate-50">
      {/* BUILDER TOP */}

      <div className="border-b border-slate-200 bg-white px-6 py-5">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Bot
                size={21}
                className="text-slate-900"
              />

              <h1 className="text-xl font-bold">
                ModelNow Agent Builder
              </h1>
            </div>

            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Create, reason, orchestrate, test,
              deploy and optimize production AI
              agents from one platform.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50">
              Import Agent
            </button>

            <button className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              <Plus size={16} />
              New Agent
            </button>
          </div>
        </div>

        {/* BUILDER MODE */}

        <div className="mt-5 flex w-fit rounded-xl border border-slate-200 bg-slate-50 p-1">
          <BuilderModeButton
            active={builderMode === "ai"}
            icon={Sparkles}
            label="Create with AI"
            onClick={() =>
              setBuilderMode("ai")
            }
          />

          <BuilderModeButton
            active={builderMode === "visual"}
            icon={Workflow}
            label="Visual Builder"
            onClick={() =>
              setBuilderMode("visual")
            }
          />

          <BuilderModeButton
            active={builderMode === "code"}
            icon={Code2}
            label="Pro-Code"
            onClick={() =>
              setBuilderMode("code")
            }
          />
        </div>
      </div>

      {/* BUILDER BODY */}

      <div className="flex min-h-0 flex-1">
        {/* AGENT BUILDER NAV */}

        <aside className="hidden w-64 shrink-0 overflow-y-auto border-r border-slate-200 bg-white p-3 lg:block">
          <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Agent Platform
          </p>

          <div className="space-y-1">
            {agentBuilderSections.map(
              (section) => {
                const Icon = section.icon;

                return (
                  <button
                    key={section.title}
                    onClick={() =>
                      setSelectedSection(
                        section.title
                      )
                    }
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
                      selectedSection ===
                      section.title
                        ? "bg-slate-900 font-semibold text-white"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Icon size={17} />

                    <span className="flex-1">
                      {section.title}
                    </span>

                    <ChevronRight
                      size={14}
                      className={
                        selectedSection ===
                        section.title
                          ? "text-slate-300"
                          : "text-slate-300"
                      }
                    />
                  </button>
                );
              }
            )}
          </div>
        </aside>

        {/* BUILDER WORKSPACE */}

        <div className="min-w-0 flex-1 p-5 md:p-7">
          {/* MOBILE SECTION SELECTOR */}

          <div className="mb-5 lg:hidden">
            <select
              value={selectedSection}
              onChange={(event) =>
                setSelectedSection(
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
            >
              {agentBuilderSections.map(
                (section) => (
                  <option
                    key={section.title}
                    value={section.title}
                  >
                    {section.title}
                  </option>
                )
              )}
            </select>
          </div>

          {/* AI CREATION */}

          {builderMode === "ai" && (
            <div className="mx-auto max-w-5xl">
              <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
                  <Sparkles size={22} />
                </div>

                <h2 className="mt-5 text-2xl font-bold">
                  Create an agent with AI
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Describe what you want your agent
                  to accomplish. ModelNow can
                  generate the agent goal, workflow,
                  tools, knowledge sources and
                  guardrails.
                </p>

                <textarea
                  placeholder="Example: Build an enterprise sales research agent that searches company websites, analyzes CRM records, prepares a lead summary and asks for human approval before sending an email."
                  className="mt-6 min-h-36 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 outline-none focus:border-slate-400"
                />

                <div className="mt-4 flex flex-wrap gap-2">
                  <Suggestion
                    label="Research Agent"
                  />
                  <Suggestion
                    label="Customer Support Agent"
                  />
                  <Suggestion
                    label="Sales Agent"
                  />
                  <Suggestion
                    label="Data Analyst Agent"
                  />
                  <Suggestion
                    label="Browser Agent"
                  />
                </div>

                <button className="mt-6 flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
                  <Sparkles size={16} />
                  Generate Agent
                </button>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <BuilderCard
                  icon={Brain}
                  title="Agent Brain"
                  description="Planning, reasoning, goals and model routing."
                />

                <BuilderCard
                  icon={Workflow}
                  title="Visual Orchestration"
                  description="Build complex workflows without writing code."
                />

                <BuilderCard
                  icon={Code2}
                  title="Pro-Code"
                  description="Drop into code when your agent needs advanced control."
                />
              </div>
            </div>
          )}

          {/* VISUAL BUILDER */}

          {builderMode === "visual" && (
            <div className="h-full min-h-[620px] rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                  <h2 className="font-semibold">
                    Visual Agent Canvas
                  </h2>

                  <p className="text-xs text-slate-400">
                    Drag logic, tools and agents into
                    your workflow.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium">
                    Test
                  </button>

                  <button className="flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white">
                    <Play size={13} />
                    Run
                  </button>
                </div>
              </div>

              <div className="relative min-h-[540px] overflow-hidden bg-[radial-gradient(#d1d5db_1px,transparent_1px)] [background-size:20px_20px]">
                <AgentNode
                  title="Trigger"
                  description="New customer request"
                  icon={Zap}
                  className="left-8 top-16"
                />

                <AgentNode
                  title="Agent Brain"
                  description="Plan and reason"
                  icon={Brain}
                  className="left-[32%] top-32"
                />

                <AgentNode
                  title="Knowledge"
                  description="Search company data"
                  icon={Database}
                  className="left-[60%] top-20"
                />

                <AgentNode
                  title="Human Approval"
                  description="Approve sensitive action"
                  icon={ShieldCheck}
                  className="left-[35%] top-[55%]"
                />

                <AgentNode
                  title="Action"
                  description="Execute API / browser task"
                  icon={Workflow}
                  className="right-8 top-[60%]"
                />

                <div className="absolute bottom-5 left-5 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <p className="text-xs font-semibold">
                    No-code + AI orchestration
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400">
                    Build without code, then switch to
                    Pro-Code whenever needed.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* PRO CODE */}

          {builderMode === "code" && (
            <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                  <h2 className="font-semibold">
                    Pro-Code Agent Builder
                  </h2>

                  <p className="text-xs text-slate-400">
                    Full control using the ModelNow
                    Agent SDK.
                  </p>
                </div>

                <button className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white">
                  <Play size={13} />
                  Run Agent
                </button>
              </div>

              <div className="grid min-h-[580px] lg:grid-cols-[1fr_320px]">
                <pre className="overflow-auto bg-slate-950 p-6 text-xs leading-6 text-slate-200">
{`import {
  Agent,
  ModelRouter,
  Knowledge,
  BrowserTool,
  HumanApproval,
} from "@modelnow/agent";

const agent = new Agent({
  name: "Enterprise Research Agent",

  goal:
    "Research a company and prepare a qualified lead report",

  brain: {
    planning: true,
    reasoning: true,
  },

  modelRouter: new ModelRouter({
    strategy: "quality-cost-balanced",
  }),

  knowledge: new Knowledge({
    sources: [
      "company-documents",
      "crm",
      "web",
    ],
  }),

  tools: [
    new BrowserTool(),
  ],

  approvals: [
    new HumanApproval({
      before: "external_action",
    }),
  ],
});

await agent.run({
  input: "Research this company",
});`}
                </pre>

                <div className="border-l border-slate-200 bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Agent configuration
                  </p>

                  <ConfigRow
                    label="Planning"
                    value="Enabled"
                  />

                  <ConfigRow
                    label="Reasoning"
                    value="Enabled"
                  />

                  <ConfigRow
                    label="Model Router"
                    value="Auto"
                  />

                  <ConfigRow
                    label="Knowledge"
                    value="Connected"
                  />

                  <ConfigRow
                    label="Human Approval"
                    value="Required"
                  />

                  <ConfigRow
                    label="Browser Tool"
                    value="Enabled"
                  />
                </div>
              </div>
            </div>
          )}

          {/* CURRENT SECTION */}

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              {currentSection &&
                (() => {
                  const Icon =
                    currentSection.icon;

                  return (
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                      <Icon size={18} />
                    </div>
                  );
                })()}

              <div>
                <h3 className="font-semibold">
                  {selectedSection}
                </h3>

                <p className="text-xs text-slate-400">
                  ModelNow Agent Builder capability
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {currentSection?.items.map(
                ([name, description]) => (
                  <button
                    key={name}
                    className="group rounded-2xl border border-slate-200 p-4 text-left transition hover:border-slate-300 hover:shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
                        <CheckCircle2
                          size={16}
                        />
                      </div>

                      <div>
                        <p className="text-sm font-semibold">
                          {name}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-400">
                          {description}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   WORKSPACE PAGES
========================================================= */

function WorkspacePage({
  page,
  onOpenAgentBuilder,
}: {
  page: ActivePage;
  onOpenAgentBuilder: () => void;
}) {
  const titles: Record<
    Exclude<ActivePage, "home" | "agent-builder">,
    string
  > = {
    plugins: "Plugins",
    schedule: "Schedule",
    projects: "Projects",
    customise: "Customize",
    library: "Library",
    plans: "Plans",
    pinned: "Pinned Chats",
    recents: "Recent Chats",
  };

  const title =
    titles[
      page as Exclude<
        ActivePage,
        "home" | "agent-builder"
      >
    ];

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8">
      <div className="mb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
          ModelNow Workspace
        </p>

        <h1 className="mt-2 text-2xl font-bold">
          {title}
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Manage your ModelNow workspace without
          leaving the main application.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <WorkspaceCard
          icon={Bot}
          title="Agent Builder"
          description="Create intelligent agents using AI, visual workflows or code."
          onClick={onOpenAgentBuilder}
        />

        <WorkspaceCard
          icon={Workflow}
          title="Automation"
          description="Connect agents, tools, APIs and business processes."
        />

        <WorkspaceCard
          icon={BarChart3}
          title="Analytics"
          description="Monitor cost, latency, tokens and execution quality."
        />
      </div>
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  input,
  setInput,
  isLoading,
  sendMessage,
  handleKeyDown,
  agentWorkflowOpen,
  setAgentWorkflowOpen,
  selectedCapability,
  onSelectCapability,
  onSelectWorkflow,
  plusOpen,
  setPlusOpen,
  handlePlusItem,
  fileInputRef,
  photoInputRef,
  cameraInputRef,
  handleFileChange,
  handlePhotoChange,
  handleCameraChange,
  openVoice,
}: {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  sendMessage: () => void;
  handleKeyDown: (
    event: KeyboardEvent<HTMLTextAreaElement>
  ) => void;
  agentWorkflowOpen: boolean;
  setAgentWorkflowOpen: (
    value: boolean
  ) => void;
  selectedCapability: string | null;
  onSelectCapability: (
    capability: Capability
  ) => void;
  onSelectWorkflow: (
    workflow: BusinessWorkflow
  ) => void;
  plusOpen: boolean;
  setPlusOpen: (value: boolean) => void;
  handlePlusItem: (
    item: PlusMenuItem
  ) => void;
  fileInputRef: RefObject<
    HTMLInputElement | null
  >;
  photoInputRef: RefObject<
    HTMLInputElement | null
  >;
  cameraInputRef: RefObject<
    HTMLInputElement | null
  >;
  handleFileChange: (
    event: ChangeEvent<HTMLInputElement>
  ) => void;
  handlePhotoChange: (
    event: ChangeEvent<HTMLInputElement>
  ) => void;
  handleCameraChange: (
    event: ChangeEvent<HTMLInputElement>
  ) => void;
  openVoice: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-8">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white">
          <Sparkles size={27} />
        </div>

        <h2 className="text-2xl font-bold md:text-3xl">
          ModelNow
        </h2>

        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">
          One intelligent AI platform for models,
          automation, enterprise workflows,
          knowledge and multimodal AI.
        </p>
      </div>

      <div className="mx-auto mb-12 max-w-3xl">
        <div className="relative rounded-2xl border border-slate-200 bg-white shadow-sm">
          <textarea
            value={input}
            onChange={(event) =>
              setInput(event.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder="Message ModelNow..."
            rows={3}
            className="w-full resize-none bg-transparent px-5 pt-5 text-sm leading-6 outline-none placeholder:text-slate-400"
          />

          <div className="flex items-center justify-between px-3 pb-3 pt-2">
            <div className="relative z-[60]">
              <button
                aria-label="Open tools"
                onClick={() =>
                  setPlusOpen(!plusOpen)
                }
                className={`flex h-9 w-9 items-center justify-center rounded-xl text-xl transition ${
                  plusOpen
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                +
              </button>

              {plusOpen && (
                <PlusMenu
                  onSelect={handlePlusItem}
                />
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                aria-label="Voice"
                onClick={openVoice}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
              >
                <Mic size={19} />
              </button>

              <button
                aria-label="Send"
                onClick={sendMessage}
                disabled={
                  !input.trim() ||
                  isLoading
                }
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  input.trim() && !isLoading
                    ? "bg-slate-900 text-white hover:bg-slate-800"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                <ArrowUp size={18} />
              </button>
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.json"
          onChange={handleFileChange}
        />

        <input
          ref={photoInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handlePhotoChange}
        />

        <input
          ref={cameraInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          capture="environment"
          onChange={handleCameraChange}
        />
      </div>

      <section>
        <h2 className="mb-5 text-xl font-bold">
          Features
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          {platformCapabilities.map(
            (capability) => {
              const Icon = capability.icon;

              const selected =
                selectedCapability ===
                capability.name;

              const isAgentWorkflow =
                capability.name ===
                "Agent Workflows";

              return (
                <div
                  key={capability.name}
                  className={`overflow-hidden rounded-2xl border bg-white transition ${
                    selected
                      ? "border-slate-400 shadow-md"
                      : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                  }`}
                >
                  <button
                    onClick={() =>
                      onSelectCapability(
                        capability
                      )
                    }
                    className="flex w-full items-center gap-4 p-5 text-left"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-700">
                      <Icon size={21} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold">
                        {capability.name}
                      </h3>

                      <p className="mt-1 text-sm leading-5 text-slate-500">
                        {capability.description}
                      </p>
                    </div>

                    <ChevronRight
                      size={17}
                      className="text-slate-300"
                    />
                  </button>

                  {isAgentWorkflow &&
                    agentWorkflowOpen && (
                      <div className="border-t border-slate-100 p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                              Business workflows
                            </p>

                            <p className="mt-1 text-[10px] text-slate-400">
                              Select an enterprise workflow
                            </p>
                          </div>

                          <button
                            onClick={() =>
                              setAgentWorkflowOpen(
                                false
                              )
                            }
                            className="rounded-lg p-1.5 hover:bg-slate-100"
                          >
                            <X size={14} />
                          </button>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2">
                          {businessWorkflows.map(
                            (workflow) => (
                              <button
                                key={
                                  workflow.name
                                }
                                onClick={() =>
                                  onSelectWorkflow(
                                    workflow
                                  )
                                }
                                className="flex items-center gap-2 rounded-xl border border-transparent p-3 text-left hover:border-slate-200 hover:bg-slate-50"
                              >
                                <BriefcaseBusiness
                                  size={15}
                                />

                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium">
                                    {
                                      workflow.name
                                    }
                                  </p>

                                  <p className="truncate text-[10px] text-slate-400">
                                    {
                                      workflow.description
                                    }
                                  </p>
                                </div>

                                <ExternalLink
                                  size={13}
                                  className="text-slate-300"
                                />
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              );
            }
          )}
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   PLUS MENU
========================================================= */

function PlusMenu({
  onSelect,
}: {
  onSelect: (
    item: PlusMenuItem
  ) => void;
}) {
  return (
    <div className="absolute bottom-[calc(100%+12px)] left-0 z-[100] w-[280px] max-h-[min(600px,calc(100vh-120px))] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
      <div className="sticky top-0 z-10 bg-white px-3 py-2">
        <p className="text-xs font-semibold">
          Add to chat
        </p>

        <p className="text-[10px] text-slate-400">
          Choose a ModelNow capability
        </p>
      </div>

      {plusMenuItems.map((item) => {
        const Icon = item.icon;

        return (
          <button
            key={item.action}
            onClick={() =>
              onSelect(item)
            }
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-50"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-600">
              <Icon size={17} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900">
                {item.name}
              </p>

              <p className="text-[10px] leading-4 text-slate-400">
                {item.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* =========================================================
   COMPOSER
========================================================= */

function Composer({
  input,
  setInput,
  isLoading,
  sendMessage,
  handleKeyDown,
  plusOpen,
  setPlusOpen,
  handlePlusItem,
  openVoice,
}: {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  sendMessage: () => void;
  handleKeyDown: (
    event: KeyboardEvent<HTMLTextAreaElement>
  ) => void;
  plusOpen: boolean;
  setPlusOpen: (value: boolean) => void;
  handlePlusItem: (
    item: PlusMenuItem
  ) => void;
  openVoice: () => void;
}) {
  return (
    <div className="shrink-0 border-t border-slate-200 bg-white px-4 pb-5 pt-3 md:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="relative rounded-2xl border border-slate-200 bg-white shadow-sm">
          <textarea
            value={input}
            onChange={(event) =>
              setInput(event.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder="Message ModelNow..."
            rows={2}
            className="w-full resize-none bg-transparent px-4 pt-4 text-sm leading-6 outline-none placeholder:text-slate-400"
          />

          <div className="flex items-center justify-between px-3 pb-3 pt-2">
            <div className="relative z-[60]">
              <button
                aria-label="Open tools"
                onClick={() =>
                  setPlusOpen(!plusOpen)
                }
                className={`flex h-9 w-9 items-center justify-center rounded-xl text-xl ${
                  plusOpen
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                +
              </button>

              {plusOpen && (
                <PlusMenu
                  onSelect={handlePlusItem}
                />
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                aria-label="Voice"
                onClick={openVoice}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
              >
                <Mic size={19} />
              </button>

              <button
                aria-label="Send"
                onClick={sendMessage}
                disabled={
                  !input.trim() ||
                  isLoading
                }
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  input.trim() && !isLoading
                    ? "bg-slate-900 text-white hover:bg-slate-800"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                <ArrowUp size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   CHAT MESSAGE
========================================================= */

function ChatMessage({
  message,
}: {
  message: Message;
}) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-md bg-slate-900 px-4 py-3 text-sm leading-6 text-white">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
        <Sparkles size={16} />
      </div>

      <div className="max-w-[80%] rounded-2xl rounded-tl-md bg-slate-100 px-4 py-3 text-sm leading-6 text-slate-700">
        {message.content}
      </div>
    </div>
  );
}

/* =========================================================
   SIDEBAR ITEM
========================================================= */

function SidebarItem({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  icon: ElementType;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-medium transition ${
        active
          ? "bg-white text-slate-900 shadow-sm"
          : "text-slate-600 hover:bg-white hover:text-slate-900"
      }`}
    >
      <Icon
        size={17}
        className={
          active
            ? "text-slate-900"
            : "text-slate-500"
        }
      />

      <span>{label}</span>
    </button>
  );
}

/* =========================================================
   BUILDER MODE BUTTON
========================================================= */

function BuilderModeButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition ${
        active
          ? "bg-white text-slate-900 shadow-sm"
          : "text-slate-500 hover:text-slate-900"
      }`}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}

/* =========================================================
   AGENT NODE
========================================================= */

function AgentNode({
  title,
  description,
  icon: Icon,
  className,
}: {
  title: string;
  description: string;
  icon: ElementType;
  className: string;
}) {
  return (
    <div
      className={`absolute w-52 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
          <Icon size={16} />
        </div>

        <div>
          <p className="text-sm font-semibold">
            {title}
          </p>

          <p className="text-[10px] text-slate-400">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   BUILDER CARD
========================================================= */

function BuilderCard({
  icon: Icon,
  title,
  description,
}: {
  icon: ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
        <Icon size={18} />
      </div>

      <h3 className="mt-4 font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-5 text-slate-400">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   WORKSPACE CARD
========================================================= */

function WorkspaceCard({
  icon: Icon,
  title,
  description,
  onClick,
}: {
  icon: ElementType;
  title: string;
  description: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-slate-300 hover:shadow-sm"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
        <Icon size={18} />
      </div>

      <h3 className="mt-4 font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-5 text-slate-400">
        {description}
      </p>
    </button>
  );
}

/* =========================================================
   SUGGESTION
========================================================= */

function Suggestion({
  label,
}: {
  label: string;
}) {
  return (
    <button className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-50">
      {label}
    </button>
  );
}

/* =========================================================
   CONFIG ROW
========================================================= */

function ConfigRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-3 last:border-0">
      <span className="text-xs text-slate-500">
        {label}
      </span>

      <span className="text-xs font-semibold text-slate-900">
        {value}
      </span>
    </div>
  );
}

/* =========================================================
   MORE MENU ITEM
========================================================= */

function MoreMenuItem({
  icon: Icon,
  label,
  onClick,
}: {
  icon: ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
    >
      <Icon size={17} className="text-slate-500" />
      <span>{label}</span>
    </button>
  );
}

/* =========================================================
   PROFILE MENU ITEM
========================================================= */

function ProfileMenuItem({
  icon: Icon,
  label,
  onClick,
}: {
  icon: ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900"
    >
      <Icon size={16} />
      <span>{label}</span>
    </button>
  );
}

/* =========================================================
   LOGOUT ICON
========================================================= */

function LogOutIcon({
  size = 16,
}: {
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line
        x1="21"
        y1="12"
        x2="9"
        y2="12"
      />
    </svg>
  );
}