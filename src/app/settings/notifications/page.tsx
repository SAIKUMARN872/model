
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  Mail,
  Smartphone,
  Monitor,
  MessageSquare,
  Bot,
  CalendarDays,
  FolderKanban,
  CreditCard,
  Users,
  HeartPulse,
  Library,
  Lightbulb,
  Check,
  CheckCheck,
  Clock,
  Volume2,
  VolumeX,
  Settings,
  X,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

type Channel = "email" | "push" | "inApp" | "browser";
type Delivery = "Push + Email" | "Push" | "Email" | "Off";

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  defaultDelivery: Delivery;
};

type NotificationSection = {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  items: NotificationItem[];
};

type Preferences = {
  channels: Record<Channel, boolean>;
  topics: Record<string, Delivery>;
};

type HistoryItem = {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
};

const STORAGE_KEY = "modelnow-notification-preferences";
const MUTED_KEY = "modelnow-notifications-muted";
const HISTORY_KEY = "modelnow-notification-history";

const channels: {
  id: Channel;
  title: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    id: "email",
    title: "Email notifications",
    description: "Receive updates in your email inbox.",
    icon: Mail,
  },
  {
    id: "push",
    title: "Push notifications",
    description: "Receive notifications on supported devices.",
    icon: Smartphone,
  },
  {
    id: "inApp",
    title: "In-app notifications",
    description: "Show notifications inside ModelNow.",
    icon: Bell,
  },
  {
    id: "browser",
    title: "Browser notifications",
    description: "Receive notifications through your browser.",
    icon: Monitor,
  },
];

const sections: NotificationSection[] = [
  {
    id: "chat",
    title: "Chat & AI",
    description: "Updates about conversations and AI activities.",
    icon: Bot,
    items: [
      {
        id: "aiCompleted",
        title: "AI task completed",
        description: "When an AI task finishes successfully.",
        defaultDelivery: "Push + Email",
      },
      {
        id: "longRunning",
        title: "Long-running task finished",
        description: "When a task that takes longer is completed.",
        defaultDelivery: "Push",
      },
      {
        id: "agentApproval",
        title: "Agent requires approval",
        description: "When an AI agent needs your permission.",
        defaultDelivery: "Push + Email",
      },
      {
        id: "aiFailed",
        title: "AI task failed",
        description: "When an AI task encounters an error.",
        defaultDelivery: "Push + Email",
      },
      {
        id: "responses",
        title: "AI responses",
        description: "Updates related to AI-generated responses.",
        defaultDelivery: "Off",
      },
    ],
  },
  {
    id: "tasks",
    title: "Tasks & Schedule",
    description: "Stay informed about scheduled work and reminders.",
    icon: CalendarDays,
    items: [
      {
        id: "upcomingTask",
        title: "Upcoming scheduled task",
        description: "A reminder before a scheduled task starts.",
        defaultDelivery: "Push",
      },
      {
        id: "taskCompleted",
        title: "Task completed",
        description: "When a scheduled task is completed.",
        defaultDelivery: "Push",
      },
      {
        id: "taskFailed",
        title: "Task failed",
        description: "When a scheduled task fails.",
        defaultDelivery: "Push + Email",
      },
      {
        id: "taskReminder",
        title: "Task reminders",
        description: "Important reminders about your tasks.",
        defaultDelivery: "Push",
      },
    ],
  },
  {
    id: "projects",
    title: "Projects",
    description: "Activity and collaboration updates in your projects.",
    icon: FolderKanban,
    items: [
      {
        id: "projectInvitations",
        title: "Project invitations",
        description: "When someone invites you to a project.",
        defaultDelivery: "Push + Email",
      },
      {
        id: "projectComments",
        title: "New comments",
        description: "When someone comments on your project.",
        defaultDelivery: "Push",
      },
      {
        id: "fileProcessing",
        title: "File processing completed",
        description: "When uploaded files finish processing.",
        defaultDelivery: "Push",
      },
      {
        id: "projectUpdates",
        title: "Project updates",
        description: "Important changes in your projects.",
        defaultDelivery: "Email",
      },
    ],
  },
  {
    id: "collaboration",
    title: "Group Chats",
    description: "Messages and activity in group conversations.",
    icon: Users,
    items: [
      {
        id: "groupMessages",
        title: "Group chat messages",
        description: "When someone sends a message in a group.",
        defaultDelivery: "Push",
      },
      {
        id: "groupMentions",
        title: "Mentions",
        description: "When someone mentions you in a group.",
        defaultDelivery: "Push + Email",
      },
    ],
  },
  {
    id: "health",
    title: "Health",
    description: "Updates related to connected health features.",
    icon: HeartPulse,
    items: [
      {
        id: "healthUpdates",
        title: "Health updates",
        description: "Notifications from supported health features.",
        defaultDelivery: "Off",
      },
    ],
  },
  {
    id: "library",
    title: "Library",
    description: "Updates about your saved files and resources.",
    icon: Library,
    items: [
      {
        id: "libraryUpdates",
        title: "Library updates",
        description: "Important changes to your saved library items.",
        defaultDelivery: "Push",
      },
      {
        id: "fileUploads",
        title: "File uploads",
        description: "When a file upload or processing task finishes.",
        defaultDelivery: "Push",
      },
    ],
  },
  {
    id: "billing",
    title: "Billing & Subscription",
    description: "Payments, credits and subscription updates.",
    icon: CreditCard,
    items: [
      {
        id: "paymentSuccess",
        title: "Payment successful",
        description: "When a payment is completed.",
        defaultDelivery: "Email",
      },
      {
        id: "paymentFailed",
        title: "Payment failed",
        description: "When a payment cannot be processed.",
        defaultDelivery: "Push + Email",
      },
      {
        id: "creditsLow",
        title: "Credits running low",
        description: "When your available credits are running low.",
        defaultDelivery: "Push + Email",
      },
      {
        id: "subscriptionRenewal",
        title: "Subscription renewal",
        description: "Reminders about your upcoming renewal.",
        defaultDelivery: "Email",
      },
    ],
  },
  {
    id: "personalized",
    title: "Personalized Tips",
    description: "Suggestions and tips to help you use ModelNow.",
    icon: Lightbulb,
    items: [
      {
        id: "personalTips",
        title: "Personalized tips",
        description: "Recommendations based on your activity.",
        defaultDelivery: "Off",
      },
      {
        id: "productUpdates",
        title: "Product updates",
        description: "News about new features and improvements.",
        defaultDelivery: "Email",
      },
      {
        id: "marketing",
        title: "Marketing announcements",
        description: "Optional offers and promotional updates.",
        defaultDelivery: "Off",
      },
    ],
  },
];

const defaultPreferences: Preferences = {
  channels: {
    email: true,
    push: true,
    inApp: true,
    browser: false,
  },
  topics: Object.fromEntries(
    sections.flatMap((section) =>
      section.items.map((item) => [
        item.id,
        item.defaultDelivery,
      ])
    )
  ) as Record<string, Delivery>,
};

const defaultHistory: HistoryItem[] = [
  {
    id: 1,
    title: "AI task completed",
    message: "Your AI task has been completed successfully.",
    time: "Today",
    read: false,
  },
  {
    id: 2,
    title: "Project update",
    message: "A project activity update is available.",
    time: "Yesterday",
    read: false,
  },
  {
    id: 3,
    title: "Credits reminder",
    message: "Check your remaining ModelNow credits.",
    time: "Earlier",
    read: true,
  },
];

export default function NotificationsPage() {
  const [preferences, setPreferences] =
    useState<Preferences>(defaultPreferences);

  const [muted, setMuted] = useState(false);
  const [history, setHistory] =
    useState<HistoryItem[]>(defaultHistory);

  const [historyOpen, setHistoryOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    try {
      const savedPreferences = localStorage.getItem(STORAGE_KEY);
      const savedMuted = localStorage.getItem(MUTED_KEY);
      const savedHistory = localStorage.getItem(HISTORY_KEY);

      if (savedPreferences) {
        const parsed = JSON.parse(savedPreferences);

        setPreferences({
          channels: {
            ...defaultPreferences.channels,
            ...parsed.channels,
          },
          topics: {
            ...defaultPreferences.topics,
            ...parsed.topics,
          },
        });
      }

      if (savedMuted !== null) {
        setMuted(savedMuted === "true");
      }

      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch {
      console.error("Could not load notification preferences.");
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(preferences)
    );

    localStorage.setItem(MUTED_KEY, String(muted));

    localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify(history)
    );
  }, [preferences, muted, history, loaded]);

  const updateChannel = (channel: Channel) => {
    setPreferences((current) => ({
      ...current,
      channels: {
        ...current.channels,
        [channel]: !current.channels[channel],
      },
    }));
    setSavedMessage("Preferences updated");
  };

  const updateDelivery = (
    id: string,
    delivery: Delivery
  ) => {
    setPreferences((current) => ({
      ...current,
      topics: {
        ...current.topics,
        [id]: delivery,
      },
    }));
    setSavedMessage("Preferences updated");
  };

  const markAllAsRead = () => {
    setHistory((current) =>
      current.map((item) => ({
        ...item,
        read: true,
      }))
    );
  };

  const unreadCount = history.filter(
    (item) => !item.read
  ).length;

  return (
    <main className="w-full space-y-8 pb-12 text-gray-900">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm text-gray-500">
            <Link
              href="/settings"
              className="flex items-center gap-1 hover:text-blue-600"
            >
              <ArrowLeft size={15} />
              Settings
            </Link>
            <span>/</span>
            <span className="text-gray-900">
              Notifications
            </span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">
            Notifications
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
            Manage how and when ModelNow sends you
            notifications.
          </p>
        </div>

        <button
          onClick={() => setHistoryOpen(true)}
          className="flex w-fit items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium hover:bg-gray-50"
        >
          <Bell size={16} />
          Notification history
          {unreadCount > 0 && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* General controls */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              {muted ? (
                <VolumeX size={21} />
              ) : (
                <Volume2 size={21} />
              )}
            </div>

            <div>
              <h2 className="font-semibold">
                {muted
                  ? "Notifications are muted"
                  : "Notification status"}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {muted
                  ? "Your notification preferences are saved, but notifications are muted."
                  : "Your notification preferences are active."}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setMuted((value) => !value);
              setSavedMessage("Notification status updated");
            }}
            className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
              muted
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {muted ? "Unmute notifications" : "Mute notifications"}
          </button>
        </div>
      </section>

      {/* Delivery channels */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">
            Delivery channels
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Choose which notification channels you want to use.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {channels.map((channel) => {
            const Icon = channel.icon;
            const enabled =
              preferences.channels[channel.id];

            return (
              <div
                key={channel.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="rounded-xl bg-gray-100 p-2.5 text-gray-600">
                    <Icon size={19} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold">
                      {channel.title}
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      {channel.description}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={enabled}
                  aria-label={`Toggle ${channel.title}`}
                  onClick={() => updateChannel(channel.id)}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                    enabled ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                      enabled ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Individual notification preferences */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">
            Notification preferences
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Customize delivery for individual notification types.
          </p>
        </div>

        <div className="space-y-5">
          {sections.map((section) => {
            const Icon = section.icon;

            return (
              <div
                key={section.id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
              >
                <div className="flex items-start gap-3 border-b border-gray-100 p-5">
                  <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                    <Icon size={19} />
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      {section.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {section.description}
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-gray-100">
                  {section.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <h4 className="text-sm font-medium">
                          {item.title}
                        </h4>
                        <p className="mt-1 text-xs leading-5 text-gray-500">
                          {item.description}
                        </p>
                      </div>

                      <div className="w-full sm:w-44">
                        <label
                          htmlFor={`delivery-${item.id}`}
                          className="sr-only"
                        >
                          Delivery for {item.title}
                        </label>

                        <select
                          id={`delivery-${item.id}`}
                          value={
                            preferences.topics[item.id] ??
                            item.defaultDelivery
                          }
                          onChange={(event) =>
                            updateDelivery(
                              item.id,
                              event.target.value as Delivery
                            )
                          }
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                          <option value="Push + Email">
                            Push + Email
                          </option>
                          <option value="Push">Push</option>
                          <option value="Email">Email</option>
                          <option value="Off">Off</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Task management */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-gray-100 p-2.5 text-gray-600">
              <Clock size={20} />
            </div>

            <div>
              <h3 className="font-semibold">
                Scheduled tasks
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                View and manage your scheduled tasks and reminders.
              </p>
            </div>
          </div>

          <Link
            href="/tasks"
            className="flex w-fit items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium hover:bg-gray-50"
          >
            Manage tasks
            <ExternalLink size={14} />
          </Link>
        </div>
      </section>

      {/* Privacy note */}
      <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-4">
        <ShieldCheck
          size={19}
          className="mt-0.5 shrink-0 text-gray-500"
        />
        <p className="text-xs leading-5 text-gray-500">
          Your notification preferences are stored in this
          browser. Actual email, push and browser notification
          delivery requires the corresponding notification
          services and browser permissions to be configured.
        </p>
      </div>

      {/* Save status */}
      {savedMessage && (
        <div className="flex items-center gap-2 text-sm text-green-700">
          <Check size={16} />
          {savedMessage}
        </div>
      )}

      {/* History modal */}
      {historyOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setHistoryOpen(false)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <div>
                <h2 className="text-lg font-semibold">
                  Notification history
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Recent notification activity.
                </p>
              </div>

              <button
                onClick={() => setHistoryOpen(false)}
                aria-label="Close notification history"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={19} />
              </button>
            </div>

            <div className="max-h-[55vh] divide-y divide-gray-100 overflow-y-auto">
              {history.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell
                    size={28}
                    className="mx-auto text-gray-300"
                  />
                  <p className="mt-3 text-sm text-gray-500">
                    No notifications yet.
                  </p>
                </div>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    className={`flex gap-3 p-5 ${
                      item.read ? "bg-white" : "bg-blue-50/50"
                    }`}
                  >
                    <div className="mt-1 rounded-full bg-gray-100 p-2 text-gray-600">
                      <MessageSquare size={16} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold">
                          {item.title}
                        </h3>
                        {!item.read && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                        )}
                      </div>

                      <p className="mt-1 text-sm text-gray-500">
                        {item.message}
                      </p>

                      <p className="mt-2 text-xs text-gray-400">
                        {item.time}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-gray-100 p-4 sm:flex-row sm:justify-between">
              <button
                onClick={markAllAsRead}
                className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium hover:bg-gray-50"
              >
                <CheckCheck size={16} />
                Mark all as read
              </button>

              <button
                onClick={() => setHistoryOpen(false)}
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
