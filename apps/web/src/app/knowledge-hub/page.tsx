"use client";

import {
  useMemo,
  useState,
  useRef,
  type ElementType,
  type ReactNode,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BarChart3,
  BookOpen,
  Bot,
  Brain,
  Camera,
  Check,
  ChevronDown,
  ChevronRight,
  Cloud,
  Database,
  FileAudio,
  FileImage,
  FileSpreadsheet,
  FileText,
  Globe,
  HardDrive,
  Image as ImageIcon,
  KeyRound,
  Link2,
  Lock,
  Mail,
  MessageSquare,
  Mic,
  MoreHorizontal,
  Network,
  Paperclip,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Sparkles,
  Trash2,
  Upload,
  Users,
  Webhook,
  X,
  Zap,
} from "lucide-react";

type Tab =
  | "bases"
  | "documents"
  | "search"
  | "rag"
  | "web"
  | "enterprise"
  | "security"
  | "management";

type SourceType =
  | "PDF"
  | "DOCX"
  | "TXT"
  | "CSV"
  | "Image"
  | "Audio"
  | "Video"
  | "Web"
  | "URL"
  | "Email"
  | "Database"
  | "API"
  | "Cloud";

type KnowledgeDocument = {
  id: number;
  name: string;
  source: SourceType;
  collection: string;
  chunks: number;
  status: "Indexed" | "Processing" | "Error";
  updated: string;
  size: string;
};

type Collection = {
  id: number;
  name: string;
  description: string;
  documents: number;
  chunks: string;
  type: "Private" | "Shared";
};

type SearchResult = {
  id: number;
  title: string;
  collection: string;
  score: number;
  content: string;
};

type PlusMenuItem = {
  name: string;
  description: string;
  icon: ElementType;
  action: string;
};

const plusMenuItems: PlusMenuItem[] = [
  {
    name: "New Chat",
    description: "Start a fresh session",
    icon: MessageSquare,
    action: "new-chat",
  },
  {
    name: "Upload Document",
    description: "Attach PDF, DOCX, TXT or CSV",
    icon: FileText,
    action: "document",
  },
  {
    name: "Upload Photos",
    description: "Send images from device",
    icon: ImageIcon,
    action: "photos",
  },
  {
    name: "Camera Capture",
    description: "Snap and ingest a document",
    icon: Camera,
    action: "camera",
  },
  {
    name: "Analytics & Chart",
    description: "AI data analytics prompt",
    icon: BarChart3,
    action: "chart",
  },
  {
    name: "Web Search",
    description: "Search live web sources",
    icon: Globe,
    action: "web-search",
  },
  {
    name: "Deep Research",
    description: "Run in-depth RAG synthesis",
    icon: Search,
    action: "deep-search",
  },
];

const initialCollections: Collection[] = [
  {
    id: 1,
    name: "HR Policies",
    description: "Employee policies, leave, benefits and internal procedures.",
    documents: 642,
    chunks: "8.4K",
    type: "Private",
  },
  {
    id: 2,
    name: "Product Knowledge",
    description: "Product documentation, features, guides and technical references.",
    documents: 824,
    chunks: "12.8K",
    type: "Shared",
  },
  {
    id: 3,
    name: "Finance Documents",
    description: "Invoices, financial policies, reports and accounting references.",
    documents: 386,
    chunks: "6.2K",
    type: "Private",
  },
  {
    id: 4,
    name: "CRM Knowledge",
    description: "Customer records, account information and CRM documentation.",
    documents: 512,
    chunks: "9.1K",
    type: "Shared",
  },
];

const initialDocuments: KnowledgeDocument[] = [
  {
    id: 1,
    name: "Employee Handbook.pdf",
    source: "PDF",
    collection: "HR Policies",
    chunks: 184,
    status: "Indexed",
    updated: "Today",
    size: "4.8 MB",
  },
  {
    id: 2,
    name: "Product Documentation.docx",
    source: "DOCX",
    collection: "Product Knowledge",
    chunks: 326,
    status: "Indexed",
    updated: "Today",
    size: "8.2 MB",
  },
  {
    id: 3,
    name: "Finance Policy 2026.pdf",
    source: "PDF",
    collection: "Finance Documents",
    chunks: 218,
    status: "Indexed",
    updated: "Yesterday",
    size: "3.1 MB",
  },
  {
    id: 4,
    name: "Customer Support Guide.md",
    source: "TXT",
    collection: "CRM Knowledge",
    chunks: 96,
    status: "Indexed",
    updated: "Yesterday",
    size: "820 KB",
  },
  {
    id: 5,
    name: "Sales Data.xlsx",
    source: "CSV",
    collection: "CRM Knowledge",
    chunks: 472,
    status: "Processing",
    updated: "2 hours ago",
    size: "12.4 MB",
  },
];

const sourceOptions: {
  type: SourceType;
  label: string;
  icon: ElementType;
}[] = [
  { type: "PDF", label: "PDF", icon: FileText },
  { type: "DOCX", label: "DOC / DOCX", icon: FileText },
  { type: "TXT", label: "TXT / Markdown", icon: FileText },
  { type: "CSV", label: "CSV / Excel", icon: FileSpreadsheet },
  { type: "Image", label: "Images", icon: FileImage },
  { type: "Audio", label: "Audio / Video", icon: FileAudio },
  { type: "Video", label: "Video", icon: FileAudio },
  { type: "Web", label: "Web Pages", icon: Globe },
  { type: "URL", label: "URLs", icon: Link2 },
  { type: "Email", label: "Email", icon: Mail },
  { type: "Database", label: "Database", icon: Database },
  { type: "API", label: "API", icon: Webhook },
  { type: "Cloud", label: "Cloud Storage", icon: Cloud },
];

const searchResults: SearchResult[] = [
  {
    id: 1,
    title: "Employee leave policy",
    collection: "HR Policies",
    score: 97,
    content:
      "Employees are eligible for annual leave according to their employment level and company leave policy.",
  },
  {
    id: 2,
    title: "Leave approval process",
    collection: "HR Policies",
    score: 93,
    content:
      "Leave requests should be submitted through the employee portal and approved by the reporting manager.",
  },
  {
    id: 3,
    title: "Product onboarding guide",
    collection: "Product Knowledge",
    score: 86,
    content:
      "The onboarding workflow introduces users to the product dashboard, workspace and available AI services.",
  },
];

const enterpriseKnowledge = [
  {
    title: "Company Knowledge",
    description: "Central company-wide knowledge and internal documentation.",
    icon: BookOpen,
    documents: "2,584",
  },
  {
    title: "HR Knowledge",
    description: "Policies, employee information and HR processes.",
    icon: Users,
    documents: "642",
  },
  {
    title: "CRM Knowledge",
    description: "Customers, accounts, contacts and support information.",
    icon: Network,
    documents: "512",
  },
  {
    title: "ERP Knowledge",
    description: "Operations, inventory and enterprise resource information.",
    icon: Database,
    documents: "438",
  },
  {
    title: "Finance Knowledge",
    description: "Financial documents, invoices and accounting information.",
    icon: FileSpreadsheet,
    documents: "386",
  },
  {
    title: "Sales Knowledge",
    description: "Sales playbooks, customer information and sales enablement.",
    icon: Zap,
    documents: "284",
  },
  {
    title: "Customer Support",
    description: "Support documentation, FAQs and customer issue knowledge.",
    icon: Bot,
    documents: "722",
  },
];

export default function KnowledgePage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>("bases");
  const [collections, setCollections] = useState<Collection[]>(initialCollections);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>(initialDocuments);

  const [showUpload, setShowUpload] = useState(false);
  const [showCollection, setShowCollection] = useState(false);
  const [showSource, setShowSource] = useState(false);

  const [selectedSource, setSelectedSource] = useState<SourceType>("PDF");
  const [selectedCollection, setSelectedCollection] = useState("HR Policies");

  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDescription, setNewCollectionDescription] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [ragQuery, setRagQuery] = useState("");
  const [ragAnswer, setRagAnswer] = useState("");

  // In-Hub Chat Box State
  const [chatInput, setChatInput] = useState("");
  const [plusOpen, setPlusOpen] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatAttachments, setChatAttachments] = useState<string[]>([]);
  const [chatConversation, setChatConversation] = useState<
    { role: "user" | "assistant"; text: string }[]
  >([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [retrievalMode, setRetrievalMode] = useState("Hybrid Retrieval");
  const [topK, setTopK] = useState(5);
  const [reranking, setReranking] = useState(true);
  const [compression, setCompression] = useState(true);

  const [ragMode, setRagMode] = useState("Advanced RAG");
  const [temperature, setTemperature] = useState(0.2);

  const [security, setSecurity] = useState({
    permissions: true,
    rbac: true,
    documentPermissions: true,
    tenantIsolation: true,
    auditLogs: true,
  });

  const [management, setManagement] = useState({
    autoSync: true,
    versioning: true,
    sourceTracking: true,
    autoDelete: false,
  });

  const [syncing, setSyncing] = useState(false);
  const [notification, setNotification] = useState("");

  const filteredSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return searchResults;
    const q = searchQuery.toLowerCase();
    return searchResults.filter(
      (result) =>
        result.title.toLowerCase().includes(q) ||
        result.content.toLowerCase().includes(q) ||
        result.collection.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const showNotification = (message: string) => {
    setNotification(message);
    window.setTimeout(() => {
      setNotification("");
    }, 2500);
  };

  const handleUpload = () => {
    const newDocument: KnowledgeDocument = {
      id: Date.now(),
      name: `New ${selectedSource} Knowledge Source`,
      source: selectedSource,
      collection: selectedCollection,
      chunks: 0,
      status: "Processing",
      updated: "Just now",
      size: "—",
    };

    setDocuments((current) => [newDocument, ...current]);
    setShowUpload(false);
    showNotification("Knowledge source added and processing started.");
  };

  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) return;

    const newCollection: Collection = {
      id: Date.now(),
      name: newCollectionName.trim(),
      description:
        newCollectionDescription.trim() ||
        "New ModelNow enterprise knowledge collection.",
      documents: 0,
      chunks: "0",
      type: "Private",
    };

    setCollections((current) => [...current, newCollection]);
    setNewCollectionName("");
    setNewCollectionDescription("");
    setShowCollection(false);
    showNotification("Knowledge collection created.");
  };

  const handleDeleteDocument = (id: number) => {
    setDocuments((current) => current.filter((document) => document.id !== id));
    showNotification("Knowledge source deleted.");
  };

  const handleUpdateDocument = (id: number) => {
    setDocuments((current) =>
      current.map((document) =>
        document.id === id
          ? {
              ...document,
              status: "Processing",
              updated: "Just now",
            }
          : document
      )
    );
    showNotification("Knowledge source update started.");
  };

  const handleSync = () => {
    setSyncing(true);
    window.setTimeout(() => {
      setSyncing(false);
      showNotification("Knowledge sources synchronized.");
    }, 1500);
  };

  const runRAG = () => {
    if (!ragQuery.trim()) return;
    setRagAnswer(
      `Based on the selected knowledge sources, the answer was generated using ${ragMode} with ${retrievalMode}. Top-${topK} retrieval was applied${
        reranking ? ", followed by reranking" : ""
      }${compression ? " and context compression" : ""}.`
    );
  };

  // Chat Composer Send Function
  const handleChatSend = () => {
    const trimmed = chatInput.trim();
    if ((!trimmed && chatAttachments.length === 0) || chatLoading) return;

    const queryToSend = trimmed;
    const attachmentPrefix =
      chatAttachments.length > 0
        ? `[Attached: ${chatAttachments.join(", ")}] `
        : "";

    const userMessage = attachmentPrefix + (queryToSend || "Explain the attached document.");

    setChatConversation((prev) => [...prev, { role: "user", text: userMessage }]);
    setChatInput("");
    setChatAttachments([]);
    setPlusOpen(false);
    setChatLoading(true);

    setTimeout(() => {
      setChatConversation((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `[ModelNow RAG grounded via ${selectedCollection}] Retrieved top-${topK} chunks using ${retrievalMode}. Context synthesized successfully.`,
        },
      ]);
      setChatLoading(false);
    }, 1000);
  };

  const handleChatKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleChatSend();
    }
  };

  const handlePlusAction = (action: string) => {
    setPlusOpen(false);
    switch (action) {
      case "new-chat":
        setChatConversation([]);
        setChatInput("");
        setChatAttachments([]);
        showNotification("Fresh chat session started.");
        break;
      case "document":
        fileInputRef.current?.click();
        break;
      case "photos":
        photoInputRef.current?.click();
        break;
      case "camera":
        cameraInputRef.current?.click();
        break;
      case "chart":
        setChatInput((prev) => (prev ? `${prev} Analyze data & build chart: ` : "Analyze data & build chart: "));
        break;
      case "web-search":
        setChatInput((prev) => (prev ? `${prev} Search web for: ` : "Search web for: "));
        break;
      case "deep-search":
        setChatInput((prev) => (prev ? `${prev} Deep research query: ` : "Deep research query: "));
        break;
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setChatAttachments((prev) => [...prev, file.name]);
      showNotification(`File attached: ${file.name}`);
    }
    e.target.value = "";
  };

  const toggleSecurity = (key: keyof typeof security) => {
    setSecurity((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const toggleManagement = (key: keyof typeof management) => {
    setManagement((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  return (
    <main className="min-h-screen bg-[#070b14] text-white">
      {notification && (
        <div className="fixed right-6 top-6 z-[100] flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-[#0d1714] px-4 py-3 text-sm shadow-2xl">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
            <Check size={14} />
          </div>
          {notification}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#070b14]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/chat")}
              className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-300 transition hover:bg-white/5 hover:text-white"
            >
              <ArrowLeft size={16} />
              Back to Chat
            </button>

            <div className="h-6 w-px bg-white/10" />

            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15">
                <Brain size={19} className="text-violet-400" />
              </div>

              <div>
                <div className="font-semibold">ModelNow Knowledge</div>
                <div className="text-xs text-gray-500">
                  Enterprise RAG Platform
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-300 transition hover:bg-white/5 disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={syncing ? "animate-spin" : ""}
              />
              {syncing ? "Syncing..." : "Sync"}
            </button>

            <button
              onClick={() => setShowCollection(true)}
              className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-500"
            >
              <Plus size={15} />
              New Collection
            </button>
          </div>
        </div>
      </header>

      {/* ModelNow Knowledge Intelligence Banner Box */}
      <section className="mx-auto max-w-[1500px] px-6 pt-8 pb-4">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/10 via-white/[0.025] to-cyan-500/5 p-7">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm text-violet-300">
                <Sparkles size={16} />
                Knowledge & RAG
              </div>

              <h1 className="text-3xl font-semibold tracking-tight">
                ModelNow Knowledge Intelligence
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-400">
                Ingest enterprise data, process and index knowledge, retrieve
                relevant context and power reliable AI responses with
                enterprise-grade RAG.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Metric label="Knowledge Sources" value="28" />
              <Metric label="Indexed Documents" value="2,584" />
              <Metric label="Retrieval Accuracy" value="94.8%" />
              <Metric
                label="Active Collections"
                value={String(collections.length)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* CHAT BOX DIRECTLY UNDER THE INTELLIGENCE BANNER */}
      <section className="mx-auto max-w-[1500px] px-6 pb-8">
        <div className="rounded-2xl border border-violet-500/30 bg-[#0b101b] p-5 shadow-2xl shadow-violet-500/5">
          <div className="mb-3 flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-2 font-medium text-violet-300">
              <Sparkles size={14} className="text-violet-400" />
              Direct Knowledge Hub Chat
            </span>
            <span>
              Target Collection: <strong className="text-white">{selectedCollection}</strong>
            </span>
          </div>

          {/* Conversation history if any */}
          {chatConversation.length > 0 && (
            <div className="mb-4 max-h-56 space-y-3 overflow-y-auto rounded-xl border border-white/5 bg-black/20 p-4">
              {chatConversation.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start gap-2.5"
                  }`}
                >
                  {msg.role !== "user" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white">
                      <Bot size={15} />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-xl px-3.5 py-2 text-xs leading-5 ${
                      msg.role === "user"
                        ? "bg-violet-600 text-white"
                        : "border border-white/10 bg-white/5 text-gray-300"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex items-center gap-2 text-xs text-violet-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />
                  <span>Synthesizing response from knowledge base...</span>
                </div>
              )}
            </div>
          )}

          {/* Attachments preview */}
          {chatAttachments.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {chatAttachments.map((name, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-lg border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-xs text-violet-300"
                >
                  <Paperclip size={12} />
                  <span className="max-w-[180px] truncate">{name}</span>
                  <button
                    onClick={() =>
                      setChatAttachments((prev) => prev.filter((_, idx) => idx !== i))
                    }
                    className="text-violet-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input Box: Plus (Left), Textarea (Center), Mic & Arrow (Right) */}
          <div className="relative flex flex-col rounded-xl border border-white/15 bg-black/30 transition focus-within:border-violet-500/60 focus-within:ring-1 focus-within:ring-violet-500/30">
            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={handleChatKeyDown}
              placeholder="Ask questions about your enterprise documents, collections or models..."
              rows={2}
              className="w-full resize-none bg-transparent px-4 pt-3 text-sm text-white outline-none placeholder:text-gray-500"
            />

            <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
              {/* Plus (+) Button on the Left */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setPlusOpen(!plusOpen)}
                  aria-label="Add options"
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-lg transition ${
                    plusOpen
                      ? "bg-violet-600 text-white"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  +
                </button>

                {/* Popup Menu */}
                {plusOpen && (
                  <div className="absolute bottom-11 left-0 z-50 max-h-[360px] w-64 overflow-y-auto rounded-xl border border-white/15 bg-[#0b101b] p-2 shadow-2xl backdrop-blur-xl">
                    <div className="border-b border-white/10 px-2 py-1.5 text-[11px] font-semibold uppercase text-gray-400">
                      Add to Knowledge Chat
                    </div>

                    <div className="mt-1 space-y-0.5">
                      {plusMenuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.action}
                            type="button"
                            onClick={() => handlePlusAction(item.action)}
                            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition hover:bg-white/5"
                          >
                            <div className="flex h-7 w-7 items-center justify-center rounded bg-violet-500/10 text-violet-400">
                              <Icon size={15} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium text-white">{item.name}</p>
                              <p className="truncate text-[10px] text-gray-500">{item.description}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Mic & Arrow mark on the Right */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => router.push("/voice")}
                  title="Open Voice Chat"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-white/5 hover:text-white"
                >
                  <Mic size={18} />
                </button>

                <button
                  type="button"
                  onClick={handleChatSend}
                  disabled={(!chatInput.trim() && chatAttachments.length === 0) || chatLoading}
                  title="Send Prompt"
                  className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                    (chatInput.trim() || chatAttachments.length > 0) && !chatLoading
                      ? "bg-violet-600 text-white hover:bg-violet-500 shadow-md shadow-violet-500/20 active:scale-95"
                      : "bg-white/5 text-gray-600 cursor-not-allowed"
                  }`}
                >
                  <ArrowUp size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Knowledge Hub Sections */}
      <section className="mx-auto max-w-[1500px] px-6 pb-8">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="h-fit rounded-2xl border border-white/10 bg-[#0b101b] p-3">
            <div className="mb-3 px-3 py-2 text-xs font-medium uppercase tracking-wider text-gray-500">
              Knowledge Flow
            </div>

            <FlowItem
              icon={Upload}
              title="Knowledge Ingestion"
              active={activeTab === "bases"}
              onClick={() => setActiveTab("bases")}
            />

            <FlowItem
              icon={HardDrive}
              title="Knowledge Bases"
              active={activeTab === "documents"}
              onClick={() => setActiveTab("documents")}
            />

            <FlowItem
              icon={Search}
              title="Retrieval"
              active={activeTab === "search"}
              onClick={() => setActiveTab("search")}
            />

            <FlowItem
              icon={Bot}
              title="RAG Engine"
              active={activeTab === "rag"}
              onClick={() => setActiveTab("rag")}
            />

            <FlowItem
              icon={Globe}
              title="Web Knowledge"
              active={activeTab === "web"}
              onClick={() => setActiveTab("web")}
            />

            <FlowItem
              icon={Network}
              title="Enterprise Knowledge"
              active={activeTab === "enterprise"}
              onClick={() => setActiveTab("enterprise")}
            />

            <FlowItem
              icon={Shield}
              title="Security"
              active={activeTab === "security"}
              onClick={() => setActiveTab("security")}
            />

            <FlowItem
              icon={Settings}
              title="Knowledge Management"
              active={activeTab === "management"}
              onClick={() => setActiveTab("management")}
            />

            <div className="mt-5 rounded-xl border border-violet-500/15 bg-violet-500/5 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Lock size={15} className="text-violet-400" />
                Enterprise Protected
              </div>

              <p className="mt-2 text-xs leading-5 text-gray-500">
                Knowledge access is controlled through permissions, RBAC,
                tenant isolation and audit logging.
              </p>
            </div>
          </aside>

          <div className="min-w-0">
            {activeTab === "bases" && (
              <IngestionView
                sourceOptions={sourceOptions}
                selectedSource={selectedSource}
                setSelectedSource={setSelectedSource}
                onUpload={() => setShowUpload(true)}
                onOpenSource={() => setShowSource(true)}
              />
            )}

            {activeTab === "documents" && (
              <KnowledgeBasesView
                collections={collections}
                documents={documents}
                selectedCollection={selectedCollection}
                onSelectCollection={setSelectedCollection}
                onUpload={() => setShowUpload(true)}
                onCreateCollection={() => setShowCollection(true)}
                onDelete={handleDeleteDocument}
                onUpdate={handleUpdateDocument}
              />
            )}

            {activeTab === "search" && (
              <RetrievalView
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                results={filteredSearchResults}
                retrievalMode={retrievalMode}
                setRetrievalMode={setRetrievalMode}
                topK={topK}
                setTopK={setTopK}
                reranking={reranking}
                setReranking={setReranking}
                compression={compression}
                setCompression={setCompression}
              />
            )}

            {activeTab === "rag" && (
              <RAGView
                ragQuery={ragQuery}
                setRagQuery={setRagQuery}
                ragAnswer={ragAnswer}
                runRAG={runRAG}
                ragMode={ragMode}
                setRagMode={setRagMode}
                temperature={temperature}
                setTemperature={setTemperature}
                retrievalMode={retrievalMode}
                topK={topK}
              />
            )}

            {activeTab === "web" && <WebKnowledgeView />}

            {activeTab === "enterprise" && (
              <EnterpriseKnowledgeView />
            )}

            {activeTab === "security" && (
              <SecurityView
                security={security}
                toggleSecurity={toggleSecurity}
              />
            )}

            {activeTab === "management" && (
              <ManagementView
                management={management}
                toggleManagement={toggleManagement}
                documents={documents}
                collections={collections}
                onSync={handleSync}
                syncing={syncing}
              />
            )}
          </div>
        </div>
      </section>

      {/* Hidden Hardware Input elements for upload triggers */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.json"
        onChange={handleFileUpload}
      />
      <input
        ref={photoInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleFileUpload}
      />
      <input
        ref={cameraInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        capture="environment"
        onChange={handleFileUpload}
      />

      {/* Upload Source Modal */}
      {showUpload && (
        <Modal
          title="Add Knowledge Source"
          description="Select a source and collection for the new knowledge."
          onClose={() => setShowUpload(false)}
        >
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-medium text-gray-400">
                Source Type
              </label>

              <select
                value={selectedSource}
                onChange={(event) =>
                  setSelectedSource(
                    event.target.value as SourceType
                  )
                }
                className="w-full rounded-xl border border-white/10 bg-[#0b101b] px-3 py-3 text-sm outline-none focus:border-violet-500/50"
              >
                {sourceOptions.map((source) => (
                  <option key={source.type} value={source.type}>
                    {source.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-gray-400">
                Knowledge Collection
              </label>

              <select
                value={selectedCollection}
                onChange={(event) =>
                  setSelectedCollection(event.target.value)
                }
                className="w-full rounded-xl border border-white/10 bg-[#0b101b] px-3 py-3 text-sm outline-none focus:border-violet-500/50"
              >
                {collections.map((collection) => (
                  <option
                    key={collection.id}
                    value={collection.name}
                  >
                    {collection.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center">
              <Upload
                size={28}
                className="mx-auto mb-3 text-gray-500"
              />

              <p className="text-sm text-gray-300">
                Select or upload your knowledge source
              </p>

              <p className="mt-1 text-xs text-gray-600">
                Source content will be extracted, chunked and embedded.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowUpload(false)}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-300"
              >
                Cancel
              </button>

              <button
                onClick={handleUpload}
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium"
              >
                Start Ingestion
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* New Collection Modal */}
      {showCollection && (
        <Modal
          title="Create Knowledge Collection"
          description="Organize related enterprise knowledge into a collection."
          onClose={() => setShowCollection(false)}
        >
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-xs text-gray-400">
                Collection Name
              </label>

              <input
                value={newCollectionName}
                onChange={(event) =>
                  setNewCollectionName(event.target.value)
                }
                placeholder="e.g. Legal Documents"
                className="w-full rounded-xl border border-white/10 bg-[#0b101b] px-3 py-3 text-sm outline-none focus:border-violet-500/50"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs text-gray-400">
                Description
              </label>

              <textarea
                value={newCollectionDescription}
                onChange={(event) =>
                  setNewCollectionDescription(event.target.value)
                }
                placeholder="Describe what this collection contains..."
                rows={4}
                className="w-full resize-none rounded-xl border border-white/10 bg-[#0b101b] px-3 py-3 text-sm outline-none focus:border-violet-500/50"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCollection(false)}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-300"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateCollection}
                disabled={!newCollectionName.trim()}
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
              >
                Create Collection
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Connect Remote Source Modal */}
      {showSource && (
        <Modal
          title="Knowledge Source Connector"
          description="Connect external enterprise knowledge sources."
          onClose={() => setShowSource(false)}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Website", Globe],
              ["Database", Database],
              ["API", Webhook],
              ["Cloud Storage", Cloud],
              ["Email", Mail],
              ["URL", Link2],
            ].map(([name, Icon]) => {
              const Component = Icon as ElementType;

              return (
                <button
                  key={String(name)}
                  onClick={() => {
                    setShowSource(false);
                    showNotification(`${String(name)} connector selected.`);
                  }}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-left transition hover:border-violet-500/30 hover:bg-violet-500/5"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10">
                    <Component
                      size={17}
                      className="text-violet-400"
                    />
                  </div>

                  <div>
                    <div className="text-sm font-medium">
                      {String(name)}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      Connect source
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Modal>
      )}
    </main>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-[115px] rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="text-xl font-semibold">{value}</div>
      <div className="mt-1 text-[11px] text-gray-500">{label}</div>
    </div>
  );
}

function FlowItem({
  icon: Icon,
  title,
  active,
  onClick,
}: {
  icon: ElementType;
  title: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
        active
          ? "bg-violet-500/10 text-white"
          : "text-gray-400 hover:bg-white/[0.03] hover:text-white"
      }`}
    >
      <Icon
        size={17}
        className={active ? "text-violet-400" : "text-gray-500"}
      />

      <span className="flex-1">{title}</span>

      {active && (
        <div className="h-1.5 w-1.5 rounded-full bg-violet-400" />
      )}
    </button>
  );
}

function Section({
  id,
  title,
  description,
  icon: Icon,
  expanded,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  description: string;
  icon: ElementType;
  expanded: boolean;
  onToggle: (id: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b101b]">
      <button
        onClick={() => onToggle(id)}
        className="flex w-full items-center gap-4 p-5 text-left"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
          <Icon size={19} className="text-violet-400" />
        </div>

        <div className="flex-1">
          <div className="font-medium">{title}</div>
          <div className="mt-1 text-xs text-gray-500">
            {description}
          </div>
        </div>

        {expanded ? (
          <ChevronDown size={18} className="text-gray-500" />
        ) : (
          <ChevronRight size={18} className="text-gray-500" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-white/10 p-5">{children}</div>
      )}
    </div>
  );
}

function IngestionView({
  sourceOptions,
  selectedSource,
  setSelectedSource,
  onUpload,
  onOpenSource,
}: {
  sourceOptions: {
    type: SourceType;
    label: string;
    icon: ElementType;
  }[];
  selectedSource: SourceType;
  setSelectedSource: (source: SourceType) => void;
  onUpload: () => void;
  onOpenSource: () => void;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    ingestion: true,
    processing: true,
    index: true,
    retrieval: true,
    rag: true,
  });

  const toggle = (id: string) => {
    setExpanded((current) => ({
      ...current,
      [id]: !current[id],
    }));
  };

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              Knowledge Ingestion & Processing
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Bring structured and unstructured data into ModelNow.
            </p>
          </div>

          <button
            onClick={onUpload}
            className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium hover:bg-violet-500"
          >
            <Upload size={16} />
            Add Source
          </button>
        </div>
      </div>

      <Section
        id="ingestion"
        title="Knowledge Ingestion"
        description="Connect documents, media, websites and enterprise systems."
        icon={Upload}
        expanded={expanded.ingestion}
        onToggle={toggle}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {sourceOptions.map((source) => {
            const Icon = source.icon;
            const selected = selectedSource === source.type;

            return (
              <button
                key={source.type}
                onClick={() => setSelectedSource(source.type)}
                className={`rounded-xl border p-4 text-left transition ${
                  selected
                    ? "border-violet-500/40 bg-violet-500/10"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20"
                }`}
              >
                <Icon
                  size={19}
                  className={
                    selected ? "text-violet-400" : "text-gray-500"
                  }
                />

                <div className="mt-3 text-sm font-medium">
                  {source.label}
                </div>

                <div className="mt-1 text-xs text-gray-600">
                  {selected ? "Selected" : "Available source"}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={onUpload}
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black"
          >
            <Upload size={15} />
            Upload Source
          </button>

          <button
            onClick={onOpenSource}
            className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-300"
          >
            <Link2 size={15} />
            Connect Source
          </button>
        </div>
      </Section>

      <Section
        id="processing"
        title="Data Processing"
        description="Transform raw information into clean AI-ready knowledge."
        icon={FileText}
        expanded={expanded.processing}
        onToggle={toggle}
      >
        <PipelineGrid
          items={[
            ["Document Parsing", "Extract text and structure"],
            ["Cleaning", "Normalize source content"],
            ["OCR", "Extract text from images"],
            ["Metadata Extraction", "Identify useful metadata"],
            ["Chunking", "Split content into context windows"],
            ["Deduplication", "Remove duplicate knowledge"],
          ]}
        />
      </Section>
    </div>
  );
}

function PipelineGrid({
  items,
}: {
  items: string[][];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(([title, description]) => (
        <div
          key={title}
          className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
        >
          <div className="text-sm font-medium">{title}</div>
          <div className="mt-1 text-xs leading-5 text-gray-600">
            {description}
          </div>
        </div>
      ))}
    </div>
  );
}

function KnowledgeBasesView({
  collections,
  documents,
  selectedCollection,
  onSelectCollection,
  onUpload,
  onCreateCollection,
  onDelete,
  onUpdate,
}: {
  collections: Collection[];
  documents: KnowledgeDocument[];
  selectedCollection: string;
  onSelectCollection: (col: string) => void;
  onUpload: () => void;
  onCreateCollection: () => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-semibold">Knowledge Bases</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage collections and indexed knowledge sources.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onCreateCollection}
            className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm"
          >
            <Plus size={15} />
            Collection
          </button>

          <button
            onClick={onUpload}
            className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium"
          >
            <Upload size={15} />
            Upload
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {collections.map((collection) => {
          const isSelected = selectedCollection === collection.name;
          return (
            <div
              key={collection.id}
              onClick={() => onSelectCollection(collection.name)}
              className={`cursor-pointer rounded-2xl border p-5 transition ${
                isSelected
                  ? "border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/5"
                  : "border-white/10 bg-[#0b101b] hover:border-violet-500/30"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                    <BookOpen
                      size={19}
                      className="text-violet-400"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{collection.name}</div>
                      {isSelected && (
                        <span className="rounded bg-violet-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                          Selected for Chat
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-gray-600">
                      {collection.type} knowledge
                    </div>
                  </div>
                </div>

                <button className="rounded-lg p-2 text-gray-500 hover:bg-white/5 hover:text-white">
                  <MoreHorizontal size={17} />
                </button>
              </div>

              <p className="mt-4 text-xs leading-5 text-gray-500">
                {collection.description}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <MiniStat
                  label="Documents"
                  value={String(collection.documents)}
                />
                <MiniStat
                  label="Chunks"
                  value={collection.chunks}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0b101b]">
        <div className="border-b border-white/10 p-5">
          <h3 className="font-medium">Knowledge Sources</h3>
          <p className="mt-1 text-xs text-gray-600">
            Indexed and processing documents across your collections.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-white/10 text-xs text-gray-600">
              <tr>
                <th className="px-5 py-4">Source</th>
                <th className="px-5 py-4">Collection</th>
                <th className="px-5 py-4">Chunks</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Updated</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {documents.map((document) => (
                <tr
                  key={document.id}
                  className="border-b border-white/5 last:border-0"
                >
                  <td className="px-5 py-4">
                    <div className="font-medium text-gray-200">
                      {document.name}
                    </div>
                    <div className="mt-1 text-xs text-gray-600">
                      {document.source} · {document.size}
                    </div>
                  </td>

                  <td className="px-5 py-4 text-gray-400">
                    {document.collection}
                  </td>

                  <td className="px-5 py-4 text-gray-400">
                    {document.chunks}
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge status={document.status} />
                  </td>

                  <td className="px-5 py-4 text-gray-500">
                    {document.updated}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => onUpdate(document.id)}
                        title="Update"
                        className="rounded-lg p-2 text-gray-500 hover:bg-white/5 hover:text-white"
                      >
                        <RefreshCw size={15} />
                      </button>

                      <button
                        onClick={() => onDelete(document.id)}
                        title="Delete"
                        className="rounded-lg p-2 text-gray-500 hover:bg-red-500/10 hover:text-red-400"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RetrievalView({
  searchQuery,
  setSearchQuery,
  results,
  retrievalMode,
  setRetrievalMode,
  topK,
  setTopK,
  reranking,
  setReranking,
  compression,
  setCompression,
}: {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  results: SearchResult[];
  retrievalMode: string;
  setRetrievalMode: (value: string) => void;
  topK: number;
  setTopK: (value: number) => void;
  reranking: boolean;
  setReranking: (value: boolean) => void;
  compression: boolean;
  setCompression: (value: boolean) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Retrieval Engine</h2>
        <p className="mt-1 text-sm text-gray-500">
          Search enterprise knowledge and configure retrieval quality.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0b101b] p-5">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"
          />

          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search your knowledge..."
            className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-11 pr-4 text-sm outline-none focus:border-violet-500/50"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          {results.map((result) => (
            <div
              key={result.id}
              className="rounded-2xl border border-white/10 bg-[#0b101b] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium">{result.title}</div>
                  <div className="mt-1 text-xs text-violet-400">
                    {result.collection}
                  </div>
                </div>

                <div className="rounded-lg bg-emerald-500/10 px-2 py-1 text-xs text-emerald-400">
                  {result.score}% match
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-gray-500">
                {result.content}
              </p>
            </div>
          ))}

          {results.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-gray-600">
              No matching knowledge found.
            </div>
          )}
        </div>

        <div className="h-fit rounded-2xl border border-white/10 bg-[#0b101b] p-5">
          <h3 className="font-medium">Retrieval Controls</h3>

          <div className="mt-5 space-y-5">
            <div>
              <label className="mb-2 block text-xs text-gray-500">
                Retrieval Strategy
              </label>

              <select
                value={retrievalMode}
                onChange={(event) =>
                  setRetrievalMode(event.target.value)
                }
                className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-sm"
              >
                <option>Semantic Search</option>
                <option>Keyword Search</option>
                <option>Hybrid Retrieval</option>
              </select>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs text-gray-500">
                  Top-K Retrieval
                </label>
                <span className="text-sm font-medium">{topK}</span>
              </div>

              <input
                type="range"
                min={1}
                max={20}
                value={topK}
                onChange={(event) =>
                  setTopK(Number(event.target.value))
                }
                className="w-full accent-violet-500"
              />
            </div>

            <Toggle
              label="Reranking"
              description="Reorder retrieved chunks by relevance."
              checked={reranking}
              onChange={() => setReranking(!reranking)}
            />

            <Toggle
              label="Context Compression"
              description="Remove unnecessary retrieved context."
              checked={compression}
              onChange={() => setCompression(!compression)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function RAGView({
  ragQuery,
  setRagQuery,
  ragAnswer,
  runRAG,
  ragMode,
  setRagMode,
  temperature,
  setTemperature,
  retrievalMode,
  topK,
}: {
  ragQuery: string;
  setRagQuery: (value: string) => void;
  ragAnswer: string;
  runRAG: () => void;
  ragMode: string;
  setRagMode: (value: string) => void;
  temperature: number;
  setTemperature: (value: number) => void;
  retrievalMode: string;
  topK: number;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">RAG Playground</h2>
        <p className="mt-1 text-sm text-gray-500">
          Test retrieval-augmented generation against your enterprise knowledge.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-white/10 bg-[#0b101b] p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-medium">Ask your knowledge</h3>
              <p className="mt-1 text-xs text-gray-600">
                Query the active knowledge context.
              </p>
            </div>

            <div className="rounded-lg bg-violet-500/10 px-3 py-1.5 text-xs text-violet-300">
              {ragMode}
            </div>
          </div>

          <textarea
            value={ragQuery}
            onChange={(event) => setRagQuery(event.target.value)}
            placeholder="Ask something about your company knowledge..."
            rows={7}
            className="w-full resize-none rounded-xl border border-white/10 bg-black/20 p-4 text-sm leading-6 outline-none focus:border-violet-500/50"
          />

          <div className="mt-4 flex justify-end">
            <button
              onClick={runRAG}
              disabled={!ragQuery.trim()}
              className="flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium hover:bg-violet-500 disabled:opacity-40"
            >
              <Sparkles size={15} />
              Run RAG
            </button>
          </div>

          {ragAnswer && (
            <div className="mt-5 rounded-xl border border-violet-500/20 bg-violet-500/5 p-5">
              <div className="flex items-center gap-2 text-sm font-medium text-violet-300">
                <Bot size={16} />
                ModelNow RAG Response
              </div>

              <p className="mt-3 text-sm leading-6 text-gray-300">
                {ragAnswer}
              </p>
            </div>
          )}
        </div>

        <div className="h-fit rounded-2xl border border-white/10 bg-[#0b101b] p-5">
          <h3 className="font-medium">RAG Configuration</h3>

          <div className="mt-5 space-y-5">
            <div>
              <label className="mb-2 block text-xs text-gray-500">
                RAG Strategy
              </label>

              <select
                value={ragMode}
                onChange={(event) => setRagMode(event.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-sm"
              >
                <option>Standard RAG</option>
                <option>Advanced RAG</option>
                <option>Multi-query RAG</option>
                <option>Agentic RAG</option>
              </select>
            </div>

            <div>
              <div className="mb-2 flex justify-between">
                <label className="text-xs text-gray-500">Temperature</label>
                <span className="text-sm">{temperature}</span>
              </div>

              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={temperature}
                onChange={(event) =>
                  setTemperature(Number(event.target.value))
                }
                className="w-full accent-violet-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WebKnowledgeView() {
  const [url, setUrl] = useState("");
  const [freshness, setFreshness] = useState(true);
  const [verification, setVerification] = useState(true);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Web Knowledge</h2>
        <p className="mt-1 text-sm text-gray-500">
          Combine enterprise knowledge with current web information.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0b101b] p-5">
        <div className="flex items-center gap-3">
          <Globe size={20} className="text-violet-400" />
          <div>
            <h3 className="font-medium">Web Source Ingestion</h3>
            <p className="mt-1 text-xs text-gray-600">
              Add websites and URLs as knowledge sources.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://example.com/documentation"
            className="flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none"
          />

          <button
            onClick={() => setUrl("")}
            className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-medium"
          >
            Ingest URL
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ToggleCard
          icon={RefreshCw}
          title="Freshness Detection"
          description="Detect when indexed web content has changed."
          checked={freshness}
          onChange={() => setFreshness(!freshness)}
        />

        <ToggleCard
          icon={Check}
          title="Source Verification"
          description="Verify source availability and retrieval integrity."
          checked={verification}
          onChange={() => setVerification(!verification)}
        />
      </div>
    </div>
  );
}

function EnterpriseKnowledgeView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Enterprise Knowledge</h2>
        <p className="mt-1 text-sm text-gray-500">
          Connect business-specific knowledge domains to ModelNow.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {enterpriseKnowledge.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="rounded-2xl border border-white/10 bg-[#0b101b] p-5 transition hover:border-violet-500/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                  <Icon size={19} className="text-violet-400" />
                </div>
                <span className="text-xs text-gray-600">{item.documents} docs</span>
              </div>

              <h3 className="mt-4 font-medium">{item.title}</h3>
              <p className="mt-2 text-xs leading-5 text-gray-500">
                {item.description}
              </p>

              <button className="mt-4 flex items-center gap-1 text-xs text-violet-400">
                Open knowledge
                <ArrowRight size={13} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SecurityView({
  security,
  toggleSecurity,
}: {
  security: {
    permissions: boolean;
    rbac: boolean;
    documentPermissions: boolean;
    tenantIsolation: boolean;
    auditLogs: boolean;
  };
  toggleSecurity: (key: keyof typeof security) => void;
}) {
  const items: {
    key: keyof typeof security;
    title: string;
    description: string;
    icon: ElementType;
  }[] = [
    {
      key: "permissions",
      title: "User Permissions",
      description: "Control who can access knowledge resources.",
      icon: Users,
    },
    {
      key: "rbac",
      title: "Role-Based Access",
      description: "Apply role-level knowledge access policies.",
      icon: KeyRound,
    },
    {
      key: "tenantIsolation",
      title: "Tenant Isolation",
      description: "Keep enterprise tenant data isolated.",
      icon: Lock,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Knowledge Security</h2>
        <p className="mt-1 text-sm text-gray-500">
          Enterprise controls for protecting knowledge and retrieval.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <ToggleCard
            key={item.key}
            icon={item.icon}
            title={item.title}
            description={item.description}
            checked={security[item.key]}
            onChange={() => toggleSecurity(item.key)}
          />
        ))}
      </div>
    </div>
  );
}

function ManagementView({
  management,
  toggleManagement,
  documents,
  collections,
  onSync,
  syncing,
}: {
  management: {
    autoSync: boolean;
    versioning: boolean;
    sourceTracking: boolean;
    autoDelete: boolean;
  };
  toggleManagement: (key: keyof typeof management) => void;
  documents: KnowledgeDocument[];
  collections: Collection[];
  onSync: () => void;
  syncing: boolean;
}) {
  const items: {
    key: keyof typeof management;
    title: string;
    description: string;
    icon: ElementType;
  }[] = [
    {
      key: "autoSync",
      title: "Automatic Sync",
      description: "Synchronize connected sources automatically.",
      icon: RefreshCw,
    },
    {
      key: "versioning",
      title: "Knowledge Versioning",
      description: "Maintain versions of indexed knowledge.",
      icon: FileText,
    },
    {
      key: "sourceTracking",
      title: "Source Management",
      description: "Track source ownership and origin.",
      icon: Link2,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-semibold">Knowledge Management</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage synchronization, versions, sources and knowledge lifecycle.
          </p>
        </div>

        <button
          onClick={onSync}
          disabled={syncing}
          className="flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          <RefreshCw
            size={15}
            className={syncing ? "animate-spin" : ""}
          />
          {syncing ? "Synchronizing..." : "Sync Knowledge"}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <ToggleCard
            key={item.key}
            icon={item.icon}
            title={item.title}
            description={item.description}
            checked={management[item.key]}
            onChange={() => toggleManagement(item.key)}
          />
        ))}
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="text-lg font-semibold">{value}</div>
      <div className="mt-1 text-[11px] text-gray-600">{label}</div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: KnowledgeDocument["status"];
}) {
  const styles =
    status === "Indexed"
      ? "bg-emerald-500/10 text-emerald-400"
      : status === "Processing"
      ? "bg-amber-500/10 text-amber-400"
      : "bg-red-500/10 text-red-400";

  return (
    <span className={`rounded-lg px-2 py-1 text-xs ${styles}`}>
      {status}
    </span>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      className="flex w-full items-center justify-between gap-4 text-left"
    >
      <div>
        <div className="text-sm text-gray-300">{label}</div>
        <div className="mt-1 text-xs leading-5 text-gray-600">
          {description}
        </div>
      </div>

      <div
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-violet-600" : "bg-white/10"
        }`}
      >
        <div
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </div>
    </button>
  );
}

function ToggleCard({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon: ElementType;
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 transition ${
        checked
          ? "border-violet-500/20 bg-violet-500/5"
          : "border-white/10 bg-[#0b101b]"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
          <Icon size={18} className="text-violet-400" />
        </div>

        <div className="flex-1">
          <div className="font-medium">{title}</div>
          <div className="mt-1 text-xs leading-5 text-gray-500">
            {description}
          </div>
        </div>

        <button
          onClick={onChange}
          className={`relative h-6 w-11 shrink-0 rounded-full transition ${
            checked ? "bg-violet-600" : "bg-white/10"
          }`}
        >
          <div
            className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
              checked ? "left-6" : "left-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
}

function Modal({
  title,
  description,
  onClose,
  children,
}: {
  title: string;
  description: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#0b101b] shadow-2xl">
        <div className="flex items-start justify-between border-b border-white/10 p-5">
          <div>
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-1 text-xs text-gray-500">{description}</p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-white/5 hover:text-white"
          >
            <X size={17} />
          </button>
        </div>

        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}