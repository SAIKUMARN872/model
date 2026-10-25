"use client";

import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  Puzzle,
  CalendarDays,
  FolderKanban,
  SlidersHorizontal,
  Library,
  Search,
  Plus,
  Check,
  Globe,
  BarChart3,
  Code2,
  BriefcaseBusiness,
  Clock3,
  Folder,
  Bell,
  Monitor,
  Zap,
  ShieldCheck,
  ArrowRight,
  Trash2,
  Pencil,
  X,
  Sparkles,
  Play,
  RefreshCw,
  Settings2,
  MessageSquare,
  FileText,
  ChevronRight,
  Moon,
  Sun,
  CircleHelp,
} from "lucide-react";

import HomeSidebar from "./components/HomeSidebar";
import WelcomeHeader from "./components/WelcomeHeader";
import MainChatComposer from "./components/MainChatComposer";
import PlatformCards from "./components/PlatformCards";
import PluginPage from "../../components/plugins/PluginPage";
import SchedulePage from "../../components/schedule/SchedulePage";
import ProjectsPage from "../projects/page";
import CustomizePage from "../customize/page";
import LibraryPage from "../library/page";
import PlansPage from "../plans/page";
import ProfileSettingsPage from "../settings/profile/page";

import type {
  ActivePage,
  Chat,
  ChatMessage,
} from "./chat-types";

import {
  createNewChat,
  getChatTitle,
  loadChats,
  saveChats,
} from "./chat-storage";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type WorkspacePage =
  | "plugins"
  | "schedule"
  | "projects"
  | "customize"
  | "library"
  | "plans"
  | "profile";

type PluginItem = {
  id: string;
  name: string;
  description: string;
  icon: typeof Globe;
  category: string;
};

type ProjectItem = {
  id: string;
  name: string;
  createdAt: number;
};

type ScheduledTask = {
  id: string;
  title: string;
  runAt: string;
  frequency: "once" | "daily" | "weekly";
  createdAt: number;
};

type WorkspacePreferences = {
  compactMode: boolean;
  notifications: boolean;
  appearance: "light" | "dark" | "system";
};

const PLUGINS_STORAGE_KEY = "modelnow-home-enabled-plugins-v1";
const PROJECTS_STORAGE_KEY = "modelnow-home-projects-v1";
const SCHEDULE_STORAGE_KEY = "modelnow-home-scheduled-tasks-v1";
const PREFERENCES_STORAGE_KEY = "modelnow-home-preferences-v1";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

function createMessageId(): string {
  return createId("message");
}

function readStoredValue<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key);

    if (!value) return fallback;

    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function writeStoredValue<T>(key: string, value: T): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`ModelNow could not save ${key}:`, error);
    return false;
  }
}

function createPlaceholderResponse(content: string): string {
  const prompt = content.toLowerCase();

  if (prompt.includes("hello") || prompt.includes("hi")) {
    return "Hello! Welcome to ModelNow. What would you like help with today?";
  }

  if (prompt.includes("web search")) {
    return "Your search request has been received. Connect a search provider to enable live web results.";
  }

  if (prompt.includes("research")) {
    return "Your research request has been received. Connect the ModelNow research workflow to retrieve and verify sources.";
  }

  if (prompt.includes("chart") || prompt.includes("analyze data")) {
    return "Your analysis request has been received. Connect the analytics service to analyze your data and generate charts.";
  }

  return "Your message was received. The ModelNow AI response integration still needs to be connected.";
}

/**
 * Persistent state for browser-local workspace features.
 *
 * This is browser persistence, not server-side or account-wide storage.
 */
function usePersistentState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const storedValue = readStoredValue<T>(key, initialValue);
    setValue(storedValue);
    setReady(true);
  }, [key]);

  useEffect(() => {
    if (!ready) return;

    writeStoredValue(key, value);
  }, [key, value, ready]);

  return { value, setValue, ready };
}

/* -------------------------------------------------------------------------- */
/* Static plugin catalogue                                                    */
/* -------------------------------------------------------------------------- */

const pluginItems: PluginItem[] = [
  {
    id: "web-search",
    name: "Web Search",
    description:
      "Search the web for information, current events, and research sources.",
    icon: Globe,
    category: "Research",
  },
  {
    id: "data-analysis",
    name: "Data Analysis",
    description:
      "Work with datasets, calculations, tables, and analytical workflows.",
    icon: BarChart3,
    category: "Productivity",
  },
  {
    id: "developer-tools",
    name: "Developer Tools",
    description:
      "Support coding, debugging, and software development workflows.",
    icon: Code2,
    category: "Development",
  },
  {
    id: "business-tools",
    name: "Business Tools",
    description:
      "Organize business tasks and support professional workflows.",
    icon: BriefcaseBusiness,
    category: "Business",
  },
];

/* -------------------------------------------------------------------------- */
/* Reusable UI                                                                */
/* -------------------------------------------------------------------------- */

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-8">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
        {eyebrow}
      </p>

      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
        {title}
      </h1>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Folder;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 px-6 py-14 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
        <Icon size={22} />
      </div>

      <h3 className="text-base font-semibold text-slate-800">{title}</h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative w-full">
      <Search
        size={18}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
      />

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
      />
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
        checked ? "bg-violet-600" : "bg-slate-300"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
          checked ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

function SmallStatus({
  children,
  active = false,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-emerald-500" : "bg-slate-400"
        }`}
      />
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Workspace sections                                                         */
/* -------------------------------------------------------------------------- */

function WorkspaceSection({
  page,
  chats,
  onSelectChat,
}: {
  page: WorkspacePage;
  chats: Chat[];
  onSelectChat: (chatId: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");

  const [projectName, setProjectName] = useState("");
  const [editingProjectId, setEditingProjectId] = useState<string | null>(
    null,
  );
  const [editingProjectName, setEditingProjectName] = useState("");

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [taskFrequency, setTaskFrequency] =
    useState<ScheduledTask["frequency"]>("once");

  const pluginsState = usePersistentState<string[]>(
    PLUGINS_STORAGE_KEY,
    [],
  );

  const projectsState = usePersistentState<ProjectItem[]>(
    PROJECTS_STORAGE_KEY,
    [],
  );

  const scheduleState = usePersistentState<ScheduledTask[]>(
    SCHEDULE_STORAGE_KEY,
    [],
  );

  const preferencesState = usePersistentState<WorkspacePreferences>(
    PREFERENCES_STORAGE_KEY,
    {
      compactMode: false,
      notifications: true,
      appearance: "light",
    },
  );

  const enabledPlugins = pluginsState.value;
  const projects = projectsState.value;
  const tasks = scheduleState.value;
  const preferences = preferencesState.value;

  const updatePreferences = (
    changes: Partial<WorkspacePreferences>,
  ) => {
    preferencesState.setValue((previous) => ({
      ...previous,
      ...changes,
    }));
  };

  useEffect(() => {
    if (!notice) return;

    const timeout = window.setTimeout(() => setNotice(""), 3500);

    return () => window.clearTimeout(timeout);
  }, [notice]);

  const togglePlugin = (pluginId: string) => {
    pluginsState.setValue((previous) =>
      previous.includes(pluginId)
        ? previous.filter((id) => id !== pluginId)
        : [...previous, pluginId],
    );
  };

  const addProject = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = projectName.trim();

    if (!name) return;

    const duplicate = projects.some(
      (project) => project.name.toLowerCase() === name.toLowerCase(),
    );

    if (duplicate) {
      setNotice("A project with that name already exists.");
      return;
    }

    projectsState.setValue((previous) => [
      {
        id: createId("project"),
        name,
        createdAt: Date.now(),
      },
      ...previous,
    ]);

    setProjectName("");
    setNotice("Project created.");
  };

  const saveProjectRename = (projectId: string) => {
    const name = editingProjectName.trim();

    if (!name) {
      setNotice("Project name cannot be empty.");
      return;
    }

    projectsState.setValue((previous) =>
      previous.map((project) =>
        project.id === projectId ? { ...project, name } : project,
      ),
    );

    setEditingProjectId(null);
    setEditingProjectName("");
    setNotice("Project name updated.");
  };

  const deleteProject = (project: ProjectItem) => {
    const confirmed = window.confirm(
      `Delete project "${project.name}"? This cannot be undone.`,
    );

    if (!confirmed) return;

    projectsState.setValue((previous) =>
      previous.filter((item) => item.id !== project.id),
    );

    setNotice("Project deleted.");
  };

  const addScheduledTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const title = taskTitle.trim();

    if (!title || !taskDate) {
      setNotice("Enter a task name and date/time.");
      return;
    }

    if (new Date(taskDate).getTime() <= Date.now()) {
      setNotice("Choose a future date and time.");
      return;
    }

    const newTask: ScheduledTask = {
      id: createId("task"),
      title,
      runAt: new Date(taskDate).toISOString(),
      frequency: taskFrequency,
      createdAt: Date.now(),
    };

    scheduleState.setValue((previous) =>
      [...previous, newTask].sort(
        (a, b) => new Date(a.runAt).getTime() - new Date(b.runAt).getTime(),
      ),
    );

    setTaskTitle("");
    setTaskDate("");
    setTaskFrequency("once");
    setNotice(
      "Schedule entry saved locally. Automatic execution is not connected.",
    );
  };

  const deleteScheduledTask = (taskId: string) => {
    scheduleState.setValue((previous) =>
      previous.filter((task) => task.id !== taskId),
    );

    setNotice("Schedule entry deleted.");
  };

  const filteredPlugins = pluginItems.filter((plugin) => {
    const query = search.trim().toLowerCase();

    return (
      plugin.name.toLowerCase().includes(query) ||
      plugin.description.toLowerCase().includes(query) ||
      plugin.category.toLowerCase().includes(query)
    );
  });

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const filteredChats = chats
    .filter((chat) => !chat.archived)
    .filter((chat) => {
      const query = search.trim().toLowerCase();

      return (
        chat.title.toLowerCase().includes(query) ||
        chat.messages.some((message) =>
          message.content.toLowerCase().includes(query),
        )
      );
    })
    .sort((a, b) => b.updatedAt - a.updatedAt);

  if (page === "plugins") {
    return (
      <div className="min-w-0 flex-1">
        <PluginPage />
      </div>
    );
  }
  if (page === "schedule") {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <SchedulePage />
    </div>
  );
}
/* -------------------------------- Projects ------------------------------ */

if (page === "projects") {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <ProjectsPage />
    </div>
  );
}
if (page === "customize") {
  return (
    <div className="min-w-0 flex-1">
      <CustomizePage />
    </div>
  );
}

 if (page === "library") {
  return (
    <div className="min-w-0 flex-1">
      <LibraryPage />
    </div>
  );
}

if (page === "plans") {
  return (
    <div className="min-w-0 flex-1">
      <PlansPage />
    </div>
  );
}

if (page === "profile") {
  return (
    <div className="min-w-0 flex-1">
      <ProfileSettingsPage embedded />
    </div>
  );
}
}  
/* -------------------------------------------------------------------------- */
/* Main chat page                                                             */
/* -------------------------------------------------------------------------- */

export default function HomePage() {
  const [activePage, setActivePage] = useState<ActivePage>("home");
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

   /* --------------------------- Load chat history -------------------------- */

  useEffect(() => {
    const savedChats = loadChats();

    const availableChats = savedChats.filter(
      (chat) => !chat.archived,
    );

    // Open an empty, unpinned chat when ModelNow starts.
    // Keep existing conversations and archived chats saved.
    const initialChat =
      availableChats.find(
        (chat) => chat.messages.length === 0 && !chat.pinned,
      ) ?? createNewChat();

    const chatAlreadyExists = savedChats.some(
      (chat) => chat.id === initialChat.id,
    );

    const updatedChats = chatAlreadyExists
      ? savedChats
      : [...savedChats, initialChat];

    setChats(updatedChats);
    setActiveChatId(initialChat.id);
    setActivePage("home");
    setIsLoading(false);
    setLoaded(true);
  }, []);

  /* -------------------------- Persist chat history ------------------------ */

  useEffect(() => {
    if (!loaded) return;

    const saved = saveChats(chats);

    if (!saved) {
      console.error(
        "ModelNow could not save chat history to browser storage.",
      );
    }
  }, [chats, loaded]);

  const activeChat =
    chats.find(
      (chat) => chat.id === activeChatId && !chat.archived,
    ) ?? null;

  /* ------------------------------ New chat -------------------------------- */

  const createAndOpenChat = useCallback(() => {
    const chat = createNewChat();

    setChats((previous) => [...previous, chat]);
    setActiveChatId(chat.id);
    setActivePage("home");
    setIsLoading(false);
  }, []);

  /* ---------------------------- Select a chat ----------------------------- */

  const selectChat = useCallback((chatId: string) => {
    setActiveChatId(chatId);
    setActivePage("home");
    setIsLoading(false);
  }, []);

  /* ---------------------------- Send a message ---------------------------- */

  const sendMessage = useCallback(
    (content: string) => {
      const text = content.trim();

      if (!text || isLoading) return;

      let targetChatId = activeChatId;

      if (
        !targetChatId ||
        !chats.some(
          (chat) => chat.id === targetChatId && !chat.archived,
        )
      ) {
        const newChat = createNewChat();

        targetChatId = newChat.id;
        setActiveChatId(targetChatId);
        setChats((previous) => [...previous, newChat]);
      }

      const userMessage: ChatMessage = {
        id: createMessageId(),
        role: "user",
        content: text,
      };

      setChats((previous) =>
        previous.map((chat) => {
          if (chat.id !== targetChatId) return chat;

          const isFirstMessage = chat.messages.length === 0;

          return {
            ...chat,
            title: isFirstMessage ? getChatTitle(text) : chat.title,
            messages: [...chat.messages, userMessage],
            updatedAt: Date.now(),
          };
        }),
      );

      setActivePage("home");
      setIsLoading(true);

      // Placeholder only. Replace this with the real ModelNow AI API call.
      window.setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: createMessageId(),
          role: "assistant",
          content: createPlaceholderResponse(text),
        };

        setChats((previous) =>
          previous.map((chat) =>
            chat.id === targetChatId && !chat.archived
              ? {
                  ...chat,
                  messages: [...chat.messages, assistantMessage],
                  updatedAt: Date.now(),
                }
              : chat,
          ),
        );

        setIsLoading(false);
      }, 700);
    },
    [activeChatId, chats, isLoading],
  );

  /* ------------------------------ Edit message ---------------------------- */

  const editMessage = useCallback(
    (messageId: string, content: string) => {
      const updatedContent = content.trim();

      if (!updatedContent || !activeChatId) return;

      setChats((previous) =>
        previous.map((chat) => {
          if (chat.id !== activeChatId || chat.archived) return chat;

          const messageExists = chat.messages.some(
            (message) =>
              message.id === messageId && message.role === "user",
          );

          if (!messageExists) return chat;

          const updatedMessages = chat.messages.map((message) =>
            message.id === messageId && message.role === "user"
              ? { ...message, content: updatedContent }
              : message,
          );

          const firstUserMessage = updatedMessages.find(
            (message) => message.role === "user",
          );

          return {
            ...chat,
            title:
              firstUserMessage?.id === messageId
                ? getChatTitle(updatedContent)
                : chat.title,
            messages: updatedMessages,
            updatedAt: Date.now(),
          };
        }),
      );
    },
    [activeChatId],
  );

  /* ----------------------------- Pin a chat ------------------------------- */

  const togglePin = useCallback((chatId: string) => {
    setChats((previous) =>
      previous.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              pinned: !chat.pinned,
              updatedAt: Date.now(),
            }
          : chat,
      ),
    );
  }, []);

  /* ---------------------------- Rename a chat ----------------------------- */

  const renameChat = useCallback((chatId: string, title: string) => {
    const normalizedTitle = title.trim();

    if (!normalizedTitle) return;

    setChats((previous) =>
      previous.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              title: getChatTitle(normalizedTitle),
              updatedAt: Date.now(),
            }
          : chat,
      ),
    );
  }, []);

  /* --------------------------- Archive a chat ------------------------------ */

  const archiveChat = useCallback(
    (chatId: string) => {
      const chatToArchive = chats.find((chat) => chat.id === chatId);

      if (!chatToArchive || chatToArchive.archived) return;

      setChats((previous) =>
        previous.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                archived: true,
                pinned: false,
                updatedAt: Date.now(),
              }
            : chat,
        ),
      );

      if (activeChatId === chatId) {
        const nextChat = chats.find(
          (chat) => chat.id !== chatId && !chat.archived,
        );

        if (nextChat) {
          setActiveChatId(nextChat.id);
        } else {
          const newChat = createNewChat();

          setChats((previous) => [...previous, newChat]);
          setActiveChatId(newChat.id);
        }

        setIsLoading(false);
      }
    },
    [activeChatId, chats],
  );

  /* ---------------------------- Delete a chat ----------------------------- */

  const deleteChat = useCallback(
    (chatId: string) => {
      const chatToDelete = chats.find((chat) => chat.id === chatId);

      if (!chatToDelete) return;

      const confirmed = window.confirm(
        `Permanently delete "${chatToDelete.title}"? This action cannot be undone.`,
      );

      if (!confirmed) return;

      const remainingChats = chats.filter((chat) => chat.id !== chatId);

      if (activeChatId === chatId) {
        const nextChat = remainingChats.find((chat) => !chat.archived);

        if (nextChat) {
          setChats(remainingChats);
          setActiveChatId(nextChat.id);
        } else {
          const newChat = createNewChat();

          setChats([...remainingChats, newChat]);
          setActiveChatId(newChat.id);
        }

        setIsLoading(false);
      } else {
        setChats(remainingChats);
      }
    },
    [activeChatId, chats],
  );

  /* ---------------------------- Share a chat ------------------------------ */

  const shareActiveChat = useCallback(async () => {
    if (!activeChat) return;

    const conversationText = activeChat.messages
      .map(
        (message) =>
          `${message.role === "user" ? "You" : "AI"}: ${message.content}`,
      )
      .join("\n\n");

    const shareTitle = activeChat.title || "ModelNow conversation";
    const shareText =
      `${shareTitle}\n\n${conversationText || "No messages yet."}`;

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: shareTitle,
          text: conversationText || shareTitle,
        });
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Could not share conversation:", error);
        }
      }

      return;
    }

    try {
      await navigator.clipboard.writeText(shareText);
      window.alert("Conversation copied to clipboard.");
    } catch (error) {
      console.error("Could not copy conversation:", error);
      window.alert(
        "Could not share or copy the conversation. Check browser permissions.",
      );
    }
  }, [activeChat]);

  /* ------------------------------ Loading UI ------------------------------ */

  if (!loaded || !activeChat) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white text-slate-500">
        <div className="flex items-center gap-3 text-sm">
          <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400" />
          Loading ModelNow workspace...
        </div>
      </main>
    );
  }

  /* ------------------------------ Page state ------------------------------ */

  const isConversationView =
    activePage === "home" && activeChat.messages.length > 0;

  const isChatPage =
    activePage === "home" ||
    activePage === "pinned" ||
    activePage === "recents";

 const isWorkspacePage = (
  page: ActivePage,
): page is WorkspacePage =>
  page === "plugins" ||
  page === "schedule" ||
  page === "projects" ||
  page === "customize" ||
  page === "library" ||
  page === "plans" ||
  page === "profile";
    

  const listChats = chats
    .filter(
      (chat) =>
        !chat.archived &&
        (activePage === "recents" || chat.pinned),
    )
    .sort((a, b) => b.updatedAt - a.updatedAt);

  /* -------------------------------- Render -------------------------------- */

  return (
<main className="flex h-screen overflow-hidden bg-white text-slate-900">
      <HomeSidebar
        activePage={activePage}
        setActivePage={setActivePage}
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={selectChat}
        onNewChat={createAndOpenChat}
        onTogglePin={togglePin}
        onRenameChat={renameChat}
        onArchiveChat={archiveChat}
        onDeleteChat={deleteChat}
      />

   <section className="flex h-screen min-w-0 flex-1 flex-col overflow-y-auto">
 {isChatPage && (
  <WelcomeHeader
    chatTitle={activeChat.title}
    isPinned={activeChat.pinned}
    onTogglePin={() => togglePin(activeChat.id)}
    onShare={shareActiveChat}
    onArchive={() => archiveChat(activeChat.id)}
    onDelete={() => deleteChat(activeChat.id)}
  />
)}

        {activePage === "home" ? (
          isConversationView ? (
            <div className="min-h-0 flex-1">
              <MainChatComposer
                key={activeChat.id}
                chat={activeChat}
                onSendMessage={sendMessage}
                onEditMessage={editMessage}
                isLoading={isLoading}
                onNewChat={createAndOpenChat}
              />
            </div>
          ) : (
            <div className="flex min-h-screen flex-col items-center px-6 pb-12">
              <div className="flex w-full max-w-5xl flex-1 flex-col items-center justify-center">
                <div className="w-full max-w-3xl">
                  <MainChatComposer
                    key={activeChat.id}
                    chat={activeChat}
                    onSendMessage={sendMessage}
                    onEditMessage={editMessage}
                    isLoading={isLoading}
                    onNewChat={createAndOpenChat}
                  />
                </div>
              </div>

              <div className="w-full max-w-6xl">
                <PlatformCards />
              </div>
            </div>
          )
        ) : activePage === "pinned" || activePage === "recents" ? (
          <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-8">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">
                  {activePage === "pinned" ? "Pinned chats" : "Recent chats"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {listChats.length} conversations
                </p>
              </div>

              <button
                type="button"
                onClick={createAndOpenChat}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
              >
                <Plus size={16} />
                New chat
              </button>
            </div>

            {listChats.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title={
                  activePage === "pinned"
                    ? "No pinned chats"
                    : "No recent chats"
                }
                description={
                  activePage === "pinned"
                    ? "Pin a conversation from the sidebar to find it here."
                    : "Start a conversation to see it in your recent chats."
                }
              />
            ) : (
              <div className="space-y-2">
                {listChats.map((chat) => (
                  <button
                    key={chat.id}
                    type="button"
                    onClick={() => selectChat(chat.id)}
                    className={`block w-full rounded-xl border px-4 py-3 text-left transition hover:bg-slate-50 ${
                      chat.id === activeChatId
                        ? "border-slate-400 bg-slate-50"
                        : "border-slate-200"
                    }`}
                  >
                    <span className="block truncate text-sm font-medium">
                      {chat.title}
                    </span>

                    <span className="mt-1 block text-xs text-slate-500">
                      {chat.messages.length} messages · Updated{" "}
                      {new Date(chat.updatedAt).toLocaleString()}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : isWorkspacePage(activePage) ? (
          <WorkspaceSection
            key={activePage}
            page={activePage}
            chats={chats}
            onSelectChat={selectChat}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center px-6">
            <div className="max-w-md text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
                <Sparkles size={24} />
              </div>

              <h2 className="text-2xl font-semibold">New chat</h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Start a new conversation with ModelNow.
              </p>

              <button
                type="button"
                onClick={createAndOpenChat}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
              >
                <Play size={15} />
                Start chatting
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}