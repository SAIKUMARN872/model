
"use client";

import { useEffect, useState } from "react";

type Delivery = "Push" | "Email" | "Push, Email" | "Off";

const notificationItems = [
  {
    id: "groupChats",
    title: "Group chats",
    description:
      "You'll receive notifications for new messages from group chats.",
    defaultValue: "Push" as Delivery,
  },
  {
    id: "health",
    title: "Health",
    description: "Get notified when your health data is ready.",
    defaultValue: "Push" as Delivery,
  },
  {
    id: "library",
    title: "Library",
    description:
      "Get notified about shared files, folders, and access requests in your Library.",
    defaultValue: "Email" as Delivery,
  },
  {
    id: "marketing",
    title: "Marketing",
    description:
      "Stay in the loop on new tools and features from ModelNow.",
    defaultValue: "Push, Email" as Delivery,
  },
  {
    id: "personalizedTips",
    title: "Personalized tips",
    description:
      "Get helpful recommendations based on your conversations with ModelNow.",
    defaultValue: "Push, Email" as Delivery,
  },
  {
    id: "projects",
    title: "Projects",
    description:
      "Get notified when you receive an email invitation to a shared project.",
    defaultValue: "Email" as Delivery,
  },
  {
    id: "responses",
    title: "Responses",
    description:
      "Get notified when ModelNow responds to requests that take time, like research or image generation.",
    defaultValue: "Push" as Delivery,
  },
  {
    id: "tasks",
    title: "Tasks",
    description:
      "Get notified when tasks you've created have updates.",
    defaultValue: "Push" as Delivery,
    link: "Manage tasks",
  },
];

const deliveryOptions: Delivery[] = [
  "Push",
  "Email",
  "Push, Email",
  "Off",
];

export default function NotificationsSettingsPage() {
  const [preferences, setPreferences] = useState<
    Record<string, Delivery>
  >(() =>
    Object.fromEntries(
      notificationItems.map((item) => [
        item.id,
        item.defaultValue,
      ])
    ) as Record<string, Delivery>
  );

  useEffect(() => {
    try {
      const saved = localStorage.getItem("modelnow-notifications");

      if (saved) {
        setPreferences((current) => ({
          ...current,
          ...JSON.parse(saved),
        }));
      }
    } catch {
      // Use default notification preferences.
    }
  }, []);

  function updatePreference(id: string, value: Delivery) {
    setPreferences((current) => {
      const next = { ...current, [id]: value };

      try {
        localStorage.setItem(
          "modelnow-notifications",
          JSON.stringify(next)
        );
      } catch {
        // Keep the updated preference in the current session.
      }

      return next;
    });
  }

  return (
    <main className="mx-auto w-full max-w-5xl pb-12 text-black">
      <h1 className="text-[28px] font-normal tracking-tight">
        Notifications
      </h1>

      <section className="mt-14">
        <h2 className="mb-5 text-lg font-semibold">
          ModelNow
        </h2>

        <div className="rounded-[21px] border border-[#dedede] px-5">
          {notificationItems.map((item, index) => (
            <div
              key={item.id}
              className={`flex min-h-[76px] items-center justify-between gap-4 py-4 ${
                index !== notificationItems.length - 1
                  ? "border-b border-[#dedede]"
                  : ""
              }`}
            >
              <div className="min-w-0">
                <h3 className="text-base font-semibold">
                  {item.title}
                </h3>

                <p className="mt-1 text-sm leading-5 text-gray-600">
                  {item.description}
                </p>

                {item.link && (
                  <a
                    href="/tasks"
                    className="mt-0.5 inline-block text-sm text-gray-600 underline underline-offset-2 hover:text-black"
                  >
                    {item.link}
                  </a>
                )}
              </div>

              <div className="relative shrink-0">
                <select
                  aria-label={`${item.title} notification delivery`}
                  value={
                    preferences[item.id] ?? item.defaultValue
                  }
                  onChange={(event) =>
                    updatePreference(
                      item.id,
                      event.target.value as Delivery
                    )
                  }
                  className="max-w-[160px] cursor-pointer appearance-none rounded-full border border-[#d8d8d8] bg-[#f5f5f5] py-2.5 pl-4 pr-9 text-base outline-none hover:bg-[#eeeeee] focus:border-gray-500"
                >
                  {deliveryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    d="m5.5 7.5 4.5 4.5 4.5-4.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-5 text-xs leading-5 text-gray-500">
        Notification preferences are saved in this browser.
        Actual push and email delivery requires notification
        service integration.
      </p>
    </main>
  );
}
