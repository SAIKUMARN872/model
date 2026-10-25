"use client";

import { useState } from "react";
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  ChevronRight,
  CircleAlert,
  CreditCard,
  FolderKanban,
  Mail,
  MessageSquare,
  Monitor,
  PlayCircle,
  RefreshCw,
  Save,
  Settings2,
  Smartphone,
  Sparkles,
  Timer,
  VolumeX,
  X,
} from "lucide-react";

type NotificationItem = {
  title: string;
  description: string;
  icon: React.ElementType;
};

type NotificationSection = {
  title: string;
  icon: React.ElementType;
  items: NotificationItem[];
};

const notificationSections: NotificationSection[] = [
  {
    title: "Notification Preferences",
    icon: Settings2,
    items: [
      {
        title: "Email Notifications",
        description: "Receive important notifications through email.",
        icon: Mail,
      },
      {
        title: "Push Notifications",
        description: "Receive notifications on your devices.",
        icon: Smartphone,
      },
      {
        title: "In-App Notifications",
        description: "Show notifications inside ModelNow.",
        icon: Bell,
      },
      {
        title: "Browser Notifications",
        description: "Allow ModelNow to send browser notifications.",
        icon: Monitor,
      },
    ],
  },
  {
    title: "Chat & AI",
    icon: Sparkles,
    items: [
      {
        title: "AI Task Completed",
        description: "Notify me when an AI task has completed.",
        icon: Check,
      },
      {
        title: "Long-Running Task Finished",
        description: "Notify me when a long-running task is finished.",
        icon: Timer,
      },
      {
        title: "Agent Requires Approval",
        description: "Notify me when an agent needs my approval.",
        icon: CircleAlert,
      },
      {
        title: "AI Task Failed",
        description: "Notify me when an AI task fails.",
        icon: X,
      },
    ],
  },
  {
    title: "Schedule",
    icon: PlayCircle,
    items: [
      {
        title: "Upcoming Scheduled Task",
        description: "Notify me before a scheduled task starts.",
        icon: Timer,
      },
      {
        title: "Task Completed",
        description: "Notify me when a scheduled task is completed.",
        icon: Check,
      },
      {
        title: "Task Failed",
        description: "Notify me when a scheduled task fails.",
        icon: CircleAlert,
      },
      {
        title: "Reminder",
        description: "Receive reminders for scheduled activities.",
        icon: Bell,
      },
    ],
  },
  {
    title: "Projects",
    icon: FolderKanban,
    items: [
      {
        title: "Project Invitations",
        description: "Notify me when someone invites me to a project.",
        icon: FolderKanban,
      },
      {
        title: "New Comments",
        description: "Notify me when new comments are added.",
        icon: MessageSquare,
      },
      {
        title: "File Processing Completed",
        description: "Notify me when project files finish processing.",
        icon: Check,
      },
      {
        title: "Project Updates",
        description: "Receive important project updates.",
        icon: RefreshCw,
      },
    ],
  },
  {
    title: "Billing",
    icon: CreditCard,
    items: [
      {
        title: "Payment Successful",
        description: "Notify me when a payment is successfully processed.",
        icon: Check,
      },
      {
        title: "Payment Failed",
        description: "Notify me when a payment fails.",
        icon: CircleAlert,
      },
      {
        title: "Credits Running Low",
        description: "Notify me when my available credits are running low.",
        icon: CreditCard,
      },
      {
        title: "Subscription Renewal",
        description: "Remind me about upcoming subscription renewals.",
        icon: RefreshCw,
      },
    ],
  },
];

const defaultPreferences: Record<string, boolean> = {
  "Email Notifications": true,
  "Push Notifications": true,
  "In-App Notifications": true,
  "Browser Notifications": false,

  "AI Task Completed": true,
  "Long-Running Task Finished": true,
  "Agent Requires Approval": true,
  "AI Task Failed": true,

  "Upcoming Scheduled Task": true,
  "Task Completed": true,
  "Task Failed": true,
  Reminder: true,

  "Project Invitations": true,
  "New Comments": true,
  "File Processing Completed": true,
  "Project Updates": true,

  "Payment Successful": true,
  "Payment Failed": true,
  "Credits Running Low": true,
  "Subscription Renewal": true,
};

export default function NotificationsPage() {
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [muted, setMuted] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleNotification = (title: string) => {
    setPreferences((current) => ({
      ...current,
      [title]: !current[title],
    }));

    setSaved(false);
  };

  const markAllAsRead = () => {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };

  const muteNotifications = () => {
    setMuted((current) => !current);
    setSaved(false);
  };

  const savePreferences = () => {
    localStorage.setItem(
      "modelnow-notification-preferences",
      JSON.stringify(preferences),
    );

    localStorage.setItem(
      "modelnow-notifications-muted",
      JSON.stringify(muted),
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#17181a]">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#e5e7eb] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center px-6">
          <div>
            <h1 className="text-lg font-semibold">Notifications</h1>
            <p className="text-xs text-[#73777d]">
              Manage how and when ModelNow notifies you
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="mx-auto max-w-5xl px-6 py-8">
        {/* Notification Overview */}
        <div className="mb-7 rounded-2xl border border-[#e5e7eb] bg-white p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f1f3f5]">
              <Bell size={23} />
            </div>

            <div className="flex-1">
              <h2 className="text-base font-semibold">
                Notification preferences
              </h2>

              <p className="mt-1 text-sm leading-6 text-[#73777d]">
                Choose which notifications you want to receive from ModelNow.
              </p>
            </div>

            <div
              className={`hidden rounded-full px-3 py-1 text-xs font-medium sm:block ${
                muted
                  ? "bg-[#fff1f1] text-[#b33a3a]"
                  : "bg-[#f1f5f1] text-[#3d6645]"
              }`}
            >
              {muted ? "Muted" : "Notifications On"}
            </div>
          </div>
        </div>

        {/* Notification Sections */}
        <div className="space-y-7">
          {notificationSections.map((section) => {
            const SectionIcon = section.icon;

            return (
              <section key={section.title}>
                <div className="mb-3 flex items-center gap-2 px-1">
                  <SectionIcon size={16} className="text-[#62676d]" />

                  <h2 className="text-sm font-semibold text-[#3d4146]">
                    {section.title}
                  </h2>
                </div>

                <div className="overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white">
                  {section.items.map((item, index) => {
                    const Icon = item.icon;
                    const enabled = preferences[item.title];

                    return (
                      <div
                        key={item.title}
                        className={`flex items-center gap-4 px-5 py-4 transition ${
                          index !== section.items.length - 1
                            ? "border-b border-[#eeeeef]"
                            : ""
                        } ${muted ? "opacity-60" : ""}`}
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f3f4f6]">
                          <Icon size={18} className="text-[#454a50]" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-[#25272a]">
                            {item.title}
                          </p>

                          <p className="mt-1 text-xs leading-5 text-[#80848a]">
                            {item.description}
                          </p>
                        </div>

                        <button
                          type="button"
                          disabled={muted}
                          onClick={() => toggleNotification(item.title)}
                          className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                            enabled ? "bg-[#17181a]" : "bg-[#d6d8dc]"
                          }`}
                          aria-label={`Toggle ${item.title}`}
                        >
                          <span
                            className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                              enabled ? "left-6" : "left-1"
                            }`}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        {/* Notification Management */}
        <section className="mt-7">
          <div className="mb-3 flex items-center gap-2 px-1">
            <Settings2 size={16} className="text-[#62676d]" />

            <h2 className="text-sm font-semibold text-[#3d4146]">
              Notification Management
            </h2>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white">
            {/* Mark All as Read */}
            <button
              type="button"
              onClick={markAllAsRead}
              className="flex w-full items-center gap-4 border-b border-[#eeeeef] px-5 py-4 text-left transition hover:bg-[#fafafa]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3f4f6]">
                <CheckCheck size={18} />
              </div>

              <div className="flex-1">
                <p className="text-sm font-medium">Mark All as Read</p>
                <p className="mt-1 text-xs text-[#80848a]">
                  Mark all unread notifications as read.
                </p>
              </div>

              <ChevronRight size={17} className="text-[#9a9da2]" />
            </button>

            {/* Mute Notifications */}
            <button
              type="button"
              onClick={muteNotifications}
              className="flex w-full items-center gap-4 border-b border-[#eeeeef] px-5 py-4 text-left transition hover:bg-[#fafafa]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3f4f6]">
                {muted ? (
                  <BellOff size={18} />
                ) : (
                  <VolumeX size={18} />
                )}
              </div>

              <div className="flex-1">
                <p className="text-sm font-medium">
                  {muted ? "Unmute Notifications" : "Mute Notifications"}
                </p>

                <p className="mt-1 text-xs text-[#80848a]">
                  {muted
                    ? "Turn notifications back on."
                    : "Temporarily pause notifications."}
                </p>
              </div>

              <div
                className={`relative h-6 w-11 rounded-full transition ${
                  muted ? "bg-[#17181a]" : "bg-[#d6d8dc]"
                }`}
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                    muted ? "left-6" : "left-1"
                  }`}
                />
              </div>
            </button>

            {/* Notification History */}
            <button
              type="button"
              onClick={() => setShowHistory(true)}
              className="flex w-full items-center gap-4 border-b border-[#eeeeef] px-5 py-4 text-left transition hover:bg-[#fafafa]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3f4f6]">
                <RefreshCw size={18} />
              </div>

              <div className="flex-1">
                <p className="text-sm font-medium">Notification History</p>

                <p className="mt-1 text-xs text-[#80848a]">
                  View your recent ModelNow notifications.
                </p>
              </div>

              <ChevronRight size={17} className="text-[#9a9da2]" />
            </button>

            {/* Save Preferences */}
            <button
              type="button"
              onClick={savePreferences}
              className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-[#fafafa]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3f4f6]">
                <Save size={18} />
              </div>

              <div className="flex-1">
                <p className="text-sm font-medium">
                  {saved ? "Preferences Saved" : "Save Preferences"}
                </p>

                <p className="mt-1 text-xs text-[#80848a]">
                  Save your notification preferences on this device.
                </p>
              </div>

              {saved ? (
                <div className="flex items-center gap-1 text-xs font-medium text-[#3d6645]">
                  <Check size={15} />
                  Saved
                </div>
              ) : (
                <ChevronRight size={17} className="text-[#9a9da2]" />
              )}
            </button>
          </div>
        </section>
      </section>

      {/* Notification History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5">
          <div className="w-full max-w-md rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold">
                  Notification History
                </h2>

                <p className="mt-1 text-xs text-[#80848a]">
                  Recent notification activity
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowHistory(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#777b81] hover:bg-[#f3f4f6]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 space-y-3">
              <div className="rounded-xl border border-[#e5e7eb] bg-[#fafafa] p-4">
                <div className="flex gap-3">
                  <Sparkles size={17} className="mt-0.5" />

                  <div>
                    <p className="text-sm font-medium">
                      AI Task Completed
                    </p>

                    <p className="mt-1 text-xs text-[#80848a]">
                      Your AI task was completed successfully.
                    </p>

                    <p className="mt-2 text-[11px] text-[#a0a3a7]">
                      Recently
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[#e5e7eb] bg-[#fafafa] p-4">
                <div className="flex gap-3">
                  <FolderKanban size={17} className="mt-0.5" />

                  <div>
                    <p className="text-sm font-medium">
                      Project Updated
                    </p>

                    <p className="mt-1 text-xs text-[#80848a]">
                      A project you are part of has been updated.
                    </p>

                    <p className="mt-2 text-[11px] text-[#a0a3a7]">
                      Recently
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[#e5e7eb] bg-[#fafafa] p-4">
                <div className="flex gap-3">
                  <Check size={17} className="mt-0.5" />

                  <div>
                    <p className="text-sm font-medium">
                      Payment Successful
                    </p>

                    <p className="mt-1 text-xs text-[#80848a]">
                      Your recent payment was processed successfully.
                    </p>

                    <p className="mt-2 text-[11px] text-[#a0a3a7]">
                      Recently
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowHistory(false)}
              className="mt-5 w-full rounded-xl bg-[#17181a] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#2b2d30]"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </main>
  );
}