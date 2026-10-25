
"use client";

import type { Dispatch, SetStateAction } from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Plus,
  Puzzle,
  CalendarDays,
  FolderKanban,
  SlidersHorizontal,
  Library,
  CreditCard,
  Pin,
  MoreHorizontal,
  Pencil,
  Archive,
  Trash2,
  PinOff,
  UserRound,
  Settings,
  CircleHelp,
  LogOut,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Download,
  Keyboard,
  FileText,
  LockKeyhole,
  Bug,
  ShieldCheck,
  X,
} from "lucide-react";

import type { ActivePage, Chat } from "../chat-types";

type NavigationPage =
  | "plugins"
  | "schedule"
  | "projects"
  | "customize"
  | "library"
  | "plans";

type ProfileActionIcon =
  | typeof UserRound
  | typeof Settings
  | typeof CircleHelp
  | typeof SlidersHorizontal;

type HomeSidebarProps = {
  activePage: ActivePage;
  setActivePage: Dispatch<SetStateAction<ActivePage>>;
  chats: Chat[];
  activeChatId: string;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onTogglePin: (chatId: string) => void;
  onRenameChat: (chatId: string, title: string) => void;
  onArchiveChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
};

const navigationItems = [
  { id: "plugins", label: "Plugins", icon: Puzzle },
  { id: "schedule", label: "Schedule", icon: CalendarDays },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "customize", label: "Customize", icon: SlidersHorizontal },
  { id: "library", label: "Library", icon: Library },
  { id: "plans", label: "Plans", icon: CreditCard },
] as const;

const helpItems = [
  { title: "Help Center", icon: CircleHelp, href: "/help" },
  { title: "Privacy Center", icon: ShieldCheck, href: "/privacy-center" },
  { title: "Release Notes", icon: Sparkles, href: "/release-notes" },
  { title: "Download Apps", icon: Download, href: "/download-apps" },
  {
    title: "Keyboard Shortcuts",
    icon: Keyboard,
    href: "/settings/keyboard-shortcuts",
  },
  { title: "Terms of Service", icon: FileText, href: "/terms" },
  { title: "Privacy Policy", icon: LockKeyhole, href: "/privacy-policy" },
  { title: "Report a Bug", icon: Bug, href: "/report-bug" },
];

export default function HomeSidebar({
  activePage,
  setActivePage,
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onTogglePin,
  onRenameChat,
  onArchiveChat,
  onDeleteChat,
}: HomeSidebarProps) {
  const router = useRouter();

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [renamingChatId, setRenamingChatId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const visibleChats = useMemo(
    () =>
      chats
        .filter((chat) => !chat.archived)
        .sort((a, b) => b.updatedAt - a.updatedAt),
    [chats],
  );

  const pinnedChats = visibleChats.filter((chat) => chat.pinned);
  const recentChats = visibleChats;

  function closeMenus() {
    setOpenMenuId(null);
    setProfileOpen(false);
    setHelpOpen(false);
  }

  function openChat(chatId: string) {
    onSelectChat(chatId);
    setActivePage("home");
    closeMenus();
  }

  function handleNewChat() {
    closeMenus();
    setRenamingChatId(null);
    setRenameValue("");
    setActivePage("home");
    onNewChat();
  }

  function handleNavigation(id: NavigationPage) {
    closeMenus();
    setActivePage(id);
  }

  function goHome() {
    closeMenus();
    setActivePage("home");
    router.push("/home");
  }

  function beginRename(chat: Chat) {
    setRenamingChatId(chat.id);
    setRenameValue(chat.title);
    setOpenMenuId(null);
  }

  function cancelRename() {
    setRenamingChatId(null);
    setRenameValue("");
  }

  function saveRename(chatId: string) {
    const title = renameValue.trim();

    if (title) {
      onRenameChat(chatId, title);
    }

    cancelRename();
  }

  function handleProfileAction(action: string) {
    if (action === "help") {
      setHelpOpen((previous) => !previous);
      return;
    }

    closeMenus();

    if (action === "profile") {
      setActivePage("profile");
      return;
    }

    const routes: Record<string, string> = {
      personalization: "/settings/personalization",
      settings: "/settings",
      logout: "/logout",
    };

    const route = routes[action];

    if (route) {
      router.push(route);
    }
  }

  function openHelpItem(href: string) {
    closeMenus();
    router.push(href);
  }

  function renderChatItem(chat: Chat, isPinnedSection = false) {
    const isActive = chat.id === activeChatId;
    const isRenaming = renamingChatId === chat.id;
    const isMenuOpen = openMenuId === chat.id;

    return (
      <div
        key={`${isPinnedSection ? "pinned" : "recent"}-${chat.id}`}
        className={`group relative flex items-center gap-1 rounded-lg px-2 py-1 transition ${
          isActive
            ? "bg-slate-100 text-slate-900"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        }`}
      >
        {isRenaming ? (
          <form
            className="min-w-0 flex-1"
            onSubmit={(event) => {
              event.preventDefault();
              saveRename(chat.id);
            }}
          >
            <input
              autoFocus
              value={renameValue}
              onChange={(event) => setRenameValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") cancelRename();
              }}
              maxLength={200}
              aria-label="Rename conversation"
              className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs outline-none focus:border-slate-500"
            />
          </form>
        ) : (
          <button
            type="button"
            onClick={() => openChat(chat.id)}
            title={chat.title}
            className="flex min-w-0 flex-1 items-center text-left text-[13px]"
          >
            <span className="truncate">{chat.title}</span>
          </button>
        )}

        {isRenaming ? (
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => saveRename(chat.id)}
              className="rounded px-1.5 py-1 text-[11px] font-medium hover:bg-slate-200"
            >
              Save
            </button>
            <button
              type="button"
              onClick={cancelRename}
              className="rounded px-1.5 py-1 text-[11px] hover:bg-slate-200"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="ml-1 flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              onClick={() => {
                onTogglePin(chat.id);
                setOpenMenuId(null);
              }}
              title={chat.pinned ? "Unpin chat" : "Pin chat"}
              aria-label={chat.pinned ? "Unpin chat" : "Pin chat"}
              className="rounded p-1 text-slate-400 opacity-0 transition hover:bg-slate-200 hover:text-slate-700 group-hover:opacity-100 focus:opacity-100"
            >
              {chat.pinned ? (
                <PinOff className="h-3.5 w-3.5" />
              ) : (
                <Pin className="h-3.5 w-3.5" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setOpenMenuId(isMenuOpen ? null : chat.id)}
              aria-label={`Options for ${chat.title}`}
              aria-expanded={isMenuOpen}
              className={`rounded p-1 hover:bg-slate-200 ${
                isMenuOpen
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100 focus:opacity-100"
              }`}
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {isMenuOpen && (
          <>
            <button
              type="button"
              aria-label="Close conversation menu"
              className="fixed inset-0 z-40 cursor-default"
              onClick={() => setOpenMenuId(null)}
            />

            <div className="absolute bottom-full right-1 z-50 mb-1 w-40 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
              {isPinnedSection ? (
                <button
                  type="button"
                  onClick={() => {
                    onTogglePin(chat.id);
                    setOpenMenuId(null);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50"
                >
                  <PinOff className="h-3.5 w-3.5" />
                  Unpin
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      onTogglePin(chat.id);
                      setOpenMenuId(null);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs hover:bg-slate-50"
                  >
                    {chat.pinned ? (
                      <PinOff className="h-3.5 w-3.5" />
                    ) : (
                      <Pin className="h-3.5 w-3.5" />
                    )}
                    {chat.pinned ? "Unpin chat" : "Pin chat"}
                  </button>

                  <button
                    type="button"
                    onClick={() => beginRename(chat)}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs hover:bg-slate-50"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Rename
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenuId(null);
                      onArchiveChat(chat.id);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs hover:bg-slate-50"
                  >
                    <Archive className="h-3.5 w-3.5" />
                    Archive
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenuId(null);
                      onDeleteChat(chat.id);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  function renderProfileItem(
    label: string,
    action: string,
    Icon: ProfileActionIcon,
  ) {
    return (
      <button
        key={action}
        type="button"
        onClick={() => handleProfileAction(action)}
        className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[13px] transition ${
          action === "help" && helpOpen
            ? "bg-slate-50 text-slate-900"
            : "text-slate-700 hover:bg-slate-50"
        }`}
      >
        <Icon className="h-4 w-4 shrink-0 text-slate-600" />
        <span className="flex-1">{label}</span>
        {action === "help" && (
          <ChevronRight
            className={`h-3.5 w-3.5 transition-transform ${
              helpOpen ? "translate-x-0.5" : ""
            }`}
          />
        )}
      </button>
    );
  }

  return (
    <aside className="relative flex min-h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center border-b border-slate-100 px-4">
        <button
          type="button"
          onClick={goHome}
          className="flex items-center gap-2.5 text-left"
          aria-label="ModelNow AI Platform home"
        >
        <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl">
  <Image
    src="/modelnow-logo.png"
    alt="ModelNow logo"
    fill
    sizes="40px"
    className="object-contain"
  />
</span>
          <span className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-slate-900">
              ModelNow
            </span>
            <span className="text-[11px] font-medium text-slate-500">
              AI Platform
            </span>
          </span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        <button
          type="button"
          onClick={handleNewChat}
          className="mb-3 flex w-full items-center gap-2 rounded-lg border border-black bg-black px-3 py-2.5 text-[13px] font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.99]"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          New Chat
        </button>

        <nav className="space-y-0.5" aria-label="Main navigation">
          {navigationItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => handleNavigation(id)}
              aria-current={activePage === id ? "page" : undefined}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-1.5 text-[13px] transition ${
                activePage === id
                  ? "bg-slate-100 font-medium text-slate-900"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>

        <section className="mt-5">
          <div className="mb-1.5 flex items-center justify-between px-2">
            <h2 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Pinned
            </h2>
          </div>

          {pinnedChats.length > 0 ? (
            <div className="space-y-0.5">
              {pinnedChats.map((chat) => renderChatItem(chat, true))}
            </div>
          ) : (
            <p className="px-2 py-1.5 text-[11px] text-slate-400">
              Your pinned chats will appear here.
            </p>
          )}
        </section>

        <section className="mt-4">
          <div className="mb-1.5 px-2">
            <h2 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Recent
            </h2>
          </div>

          {recentChats.length > 0 ? (
            <div className="space-y-0.5">
              {recentChats.map((chat) => renderChatItem(chat, false))}
            </div>
          ) : (
            <p className="px-2 py-1.5 text-[11px] text-slate-400">
              Your conversations will appear here.
            </p>
          )}
        </section>
      </div>

      <div className="relative border-t border-slate-100 px-2 py-1.5">
        {profileOpen && (
          <>
            <button
              type="button"
              aria-label="Close account menus"
              className="fixed inset-0 z-40 cursor-default"
              onClick={() => {
                setProfileOpen(false);
                setHelpOpen(false);
              }}
            />

            <div className="absolute bottom-[calc(100%-4px)] left-1 z-50 w-[230px] rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
              <div className="flex items-start justify-between px-2.5 pb-2 pt-1.5">
                <div>
                  <p className="text-[13px] font-semibold text-slate-900">
                    Account
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    ModelNow workspace
                  </p>
                </div>

                <button
                  type="button"
                  aria-label="Close account menu"
                  onClick={closeMenus}
                  className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {renderProfileItem(
                "Personalization",
                "personalization",
                SlidersHorizontal,
              )}
              {renderProfileItem("Profile", "profile", UserRound)}
              {renderProfileItem("Settings", "settings", Settings)}
              {renderProfileItem("Help", "help", CircleHelp)}

              <div className="my-1 border-t border-slate-100" />

              <button
                type="button"
                onClick={() => handleProfileAction("logout")}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[13px] text-slate-700 transition hover:bg-slate-50"
              >
                <LogOut className="h-4 w-4 text-slate-600" />
                <span>Log out</span>
              </button>
            </div>

            {helpOpen && (
              <div className="absolute bottom-1 left-full z-[60] ml-2 w-[250px] max-w-[calc(100vw-280px)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                <div className="max-h-[min(55vh,360px)] overflow-y-auto p-1.5">
                  {helpItems.map((item) => {
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.title}
                        type="button"
                        onClick={() => openHelpItem(item.href)}
                        className="group flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition hover:bg-slate-50"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-50 transition group-hover:bg-white">
                          <Icon className="h-4 w-4 text-slate-600" />
                        </span>

                        <span className="min-w-0 flex-1 text-[13px] font-medium text-slate-800">
                          {item.title}
                        </span>

                        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        <button
          type="button"
          onClick={() => {
            setProfileOpen((previous) => !previous);
            setHelpOpen(false);
            setOpenMenuId(null);
          }}
          aria-expanded={profileOpen}
          aria-label="Open user menu"
          className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition ${
            profileOpen ? "bg-slate-50" : "hover:bg-slate-50"
          }`}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-950 text-xs font-semibold text-white">
            N
          </span>

          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-medium text-slate-900">
              User
            </span>
            <span className="block truncate text-[11px] text-slate-500">
              ModelNow account
            </span>
          </span>

          <ChevronDown
            className={`h-3.5 w-3.5 text-slate-500 transition-transform ${
              profileOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>
    </aside>
  );
}
