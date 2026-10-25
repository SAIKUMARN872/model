"use client";

import { useMemo, useState, type ElementType } from "react";
import {
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  CircleDollarSign,
  CloudSun,
  Dumbbell,
  Gift,
  Globe,
  Home,
  Newspaper,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Tag,
  Ticket,
  TrendingUp,
  Tv,
  Utensils,
  Watch,
} from "lucide-react";

import ScheduleSidebar from "./ScheduleSidebar";
import ScheduleTaskCard from "./ScheduleTaskCard";
import ScheduleEmptyState from "./ScheduleEmptyState";
import CreateScheduleModal from "./CreateScheduleModal";
import ScheduleDetails from "./ScheduleDetails";
import ScheduleChatWorkspace from "./ScheduleChatWorkspace";

import type {
  ApprovalMode,
  ScheduleConditions,
  ScheduleItem,
  ScheduleRecurrence,
  ScheduleSection,
  ScheduleTaskType,
} from "./types";

const initialSchedules: ScheduleItem[] = [];

type Recommendation = {
  id: number;
  title: string;
  description: string;
  taskType: ScheduleTaskType;
  icon: ElementType;
  iconColor: string;
  iconBackground: string;
};

const recommendations: Recommendation[] = [
  {
    id: 1,
    title: "Track company news",
    description: "Check daily and flag key news about my company.",
    taskType: "AI Task",
    icon: BriefcaseBusiness,
    iconColor: "text-blue-600",
    iconBackground: "bg-blue-50",
  },
  {
    id: 2,
    title: "News updates",
    description: "Send me a daily roundup of news on topics I care about.",
    taskType: "AI Task",
    icon: Newspaper,
    iconColor: "text-red-500",
    iconBackground: "bg-red-50",
  },
  {
    id: 3,
    title: "Price alerts",
    description: "Check prices daily and alert me when my item costs less.",
    taskType: "AI Task",
    icon: CircleDollarSign,
    iconColor: "text-green-600",
    iconBackground: "bg-green-50",
  },
  {
    id: 4,
    title: "Find weekend reads",
    description: "Send me a great article to read every Saturday.",
    taskType: "AI Task",
    icon: BookOpen,
    iconColor: "text-violet-600",
    iconBackground: "bg-violet-50",
  },
  {
    id: 5,
    title: "Plan weeknight dinners",
    description: "Plan five dinners and my grocery list each week.",
    taskType: "AI Task",
    icon: Utensils,
    iconColor: "text-orange-500",
    iconBackground: "bg-orange-50",
  },
  {
    id: 6,
    title: "Plan birthday gifts",
    description: "Help me plan gifts and celebrations weeks ahead.",
    taskType: "AI Task",
    icon: Gift,
    iconColor: "text-pink-500",
    iconBackground: "bg-pink-50",
  },
  {
    id: 7,
    title: "Plan my weekend",
    description: "Send me local weekend ideas every Thursday.",
    taskType: "AI Task",
    icon: CalendarDays,
    iconColor: "text-indigo-600",
    iconBackground: "bg-indigo-50",
  },
  {
    id: 8,
    title: "Follow a topic",
    description: "Alert me to big changes in a subject I care about.",
    taskType: "AI Task",
    icon: Search,
    iconColor: "text-cyan-600",
    iconBackground: "bg-cyan-50",
  },
  {
    id: 9,
    title: "What to watch",
    description: "Pick three movies or shows for me every Friday night.",
    taskType: "AI Task",
    icon: Tv,
    iconColor: "text-purple-600",
    iconBackground: "bg-purple-50",
  },
  {
    id: 10,
    title: "Compare products",
    description: "Check my product shortlist weekly and flag key changes.",
    taskType: "AI Task",
    icon: ShoppingBag,
    iconColor: "text-amber-600",
    iconBackground: "bg-amber-50",
  },
  {
    id: 11,
    title: "Plan workouts",
    description: "Plan my week's workouts around my goals and schedule.",
    taskType: "AI Task",
    icon: Dumbbell,
    iconColor: "text-emerald-600",
    iconBackground: "bg-emerald-50",
  },
  {
    id: 12,
    title: "Plan around weather",
    description: "Show me a three-day forecast each morning.",
    taskType: "AI Task",
    icon: CloudSun,
    iconColor: "text-sky-500",
    iconBackground: "bg-sky-50",
  },
  {
    id: 13,
    title: "Find discounts",
    description: "Find me coupons from my favorite stores each week.",
    taskType: "AI Task",
    icon: Tag,
    iconColor: "text-rose-500",
    iconBackground: "bg-rose-50",
  },
  {
    id: 14,
    title: "Find new research",
    description: "Send me new research on topics I care about every Friday.",
    taskType: "AI Task",
    icon: Search,
    iconColor: "text-teal-600",
    iconBackground: "bg-teal-50",
  },
  {
    id: 15,
    title: "Create a budget",
    description: "Send me a fresh, blank budget template each month.",
    taskType: "AI Task",
    icon: CircleDollarSign,
    iconColor: "text-lime-600",
    iconBackground: "bg-lime-50",
  },
  {
    id: 16,
    title: "Recommend a book",
    description: "Pick three books for me each month, based on my tastes.",
    taskType: "AI Task",
    icon: BookOpen,
    iconColor: "text-fuchsia-600",
    iconBackground: "bg-fuchsia-50",
  },
  {
    id: 17,
    title: "Track my competitors",
    description: "Alert me to key launches and changes.",
    taskType: "AI Task",
    icon: TrendingUp,
    iconColor: "text-blue-600",
    iconBackground: "bg-blue-50",
  },
  {
    id: 18,
    title: "Track industry news",
    description: "Explain what's changing in my industry every week.",
    taskType: "AI Task",
    icon: BriefcaseBusiness,
    iconColor: "text-slate-600",
    iconBackground: "bg-slate-50",
  },
  {
    id: 19,
    title: "Organize my home",
    description: "Suggest one 15-minute home task for me each Saturday.",
    taskType: "AI Task",
    icon: Home,
    iconColor: "text-amber-600",
    iconBackground: "bg-amber-50",
  },
  {
    id: 20,
    title: "Find concerts",
    description: "Check weekly for new concerts that match my taste.",
    taskType: "AI Task",
    icon: Ticket,
    iconColor: "text-red-600",
    iconBackground: "bg-red-50",
  },
  {
    id: 21,
    title: "Outfit ideas",
    description: "Pick an outfit from my clothes for each day's weather.",
    taskType: "AI Task",
    icon: Watch,
    iconColor: "text-purple-600",
    iconBackground: "bg-purple-50",
  },
  {
    id: 22,
    title: "Learn a language",
    description: "Send me a daily lesson at my level, under 10 minutes.",
    taskType: "AI Task",
    icon: Globe,
    iconColor: "text-indigo-600",
    iconBackground: "bg-indigo-50",
  },
];

export default function SchedulePage() {
  const [activeSection, setActiveSection] =
    useState<ScheduleSection>("Today");

  const [schedules, setSchedules] =
    useState<ScheduleItem[]>(initialSchedules);

  const [searchQuery, setSearchQuery] = useState("");

  const [showRecommendations, setShowRecommendations] =
    useState(false);

  const [showMySchedules, setShowMySchedules] =
    useState(false);

  const [showNewSchedule, setShowNewSchedule] =
    useState(false);

  const [showScheduleChat, setShowScheduleChat] =
    useState(false);

  const [selectedSchedule, setSelectedSchedule] =
    useState<ScheduleItem | null>(null);

  const [showScheduleDetails, setShowScheduleDetails] =
    useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [taskType, setTaskType] =
    useState<ScheduleTaskType>("AI Task");

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [timezone, setTimezone] =
    useState("Asia/Kolkata");

  const [recurrence, setRecurrence] =
    useState<ScheduleRecurrence>({
      type: "None",
    });

  const [conditions, setConditions] =
    useState<ScheduleConditions>({});

  const [notifications, setNotifications] = useState({
    onSuccess: true,
    onFailure: true,
    beforeExecution: false,
  });

  const [approval, setApproval] =
    useState<ApprovalMode>("Risky Actions");

  const filteredRecommendations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return recommendations;

    return recommendations.filter(
      (recommendation) =>
        recommendation.title.toLowerCase().includes(query) ||
        recommendation.description.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  const filteredSchedules = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return schedules.filter((schedule) => {
      if (schedule.type !== activeSection) return false;
      if (!query) return true;

      return (
        schedule.title.toLowerCase().includes(query) ||
        schedule.description.toLowerCase().includes(query) ||
        schedule.taskType.toLowerCase().includes(query)
      );
    });
  }, [schedules, activeSection, searchQuery]);

  const handleScheduleSearchFocus = () => {
    setShowRecommendations(true);
  };

  const handleScheduleSearchChange = (value: string) => {
    setSearchQuery(value);
    setShowRecommendations(true);
  };

  // Only the New Schedule button opens the creation modal.
  const openCreateSchedule = () => {
    setShowScheduleChat(false);
    setShowNewSchedule(true);
  };

  const closeCreateSchedule = () => {
    setShowNewSchedule(false);
  };

  // A recommendation opens chat, not the Create Schedule modal.
  const handleRecommendationClick = (
    recommendation: Recommendation,
  ) => {
    setTitle(recommendation.title);
    setDescription(recommendation.description);
    setTaskType(recommendation.taskType);

    setSearchQuery("");
    setShowRecommendations(false);
    setShowNewSchedule(false);
    setShowScheduleChat(true);
  };

  const openScheduleDetails = (schedule: ScheduleItem) => {
    setSelectedSchedule(schedule);
    setShowScheduleDetails(true);
  };

  const closeScheduleDetails = () => {
    setShowScheduleDetails(false);
    setSelectedSchedule(null);
  };

  const updateScheduleStatus = (
    id: number,
    status: ScheduleItem["status"],
    executionStatus: string,
  ) => {
    const currentTime = new Date().toLocaleString();

    setSchedules((currentSchedules) =>
      currentSchedules.map((schedule) =>
        schedule.id === id
          ? {
              ...schedule,
              status,
              executionStatus,
              lastRun:
                status === "Running"
                  ? currentTime
                  : schedule.lastRun,
            }
          : schedule,
      ),
    );

    setSelectedSchedule((currentSchedule) =>
      currentSchedule?.id === id
        ? {
            ...currentSchedule,
            status,
            executionStatus,
            lastRun:
              status === "Running"
                ? currentTime
                : currentSchedule.lastRun,
          }
        : currentSchedule,
    );
  };

  const handleRunNow = () => {
    if (!selectedSchedule) return;

    updateScheduleStatus(
      selectedSchedule.id,
      "Running",
      "Execution started.",
    );
  };

  const handlePause = () => {
    if (!selectedSchedule) return;

    updateScheduleStatus(
      selectedSchedule.id,
      "Paused",
      "Execution paused.",
    );
  };

  const handleResume = () => {
    if (!selectedSchedule) return;

    updateScheduleStatus(
      selectedSchedule.id,
      "Running",
      "Execution resumed.",
    );
  };

  const handleRetry = () => {
    if (!selectedSchedule) return;

    updateScheduleStatus(
      selectedSchedule.id,
      "Running",
      "Retry execution started.",
    );
  };

  const handleCancel = () => {
    if (!selectedSchedule) return;

    updateScheduleStatus(
      selectedSchedule.id,
      "Cancelled",
      "Schedule cancelled.",
    );
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setTaskType("AI Task");
    setDate("");
    setTime("");
    setTimezone("Asia/Kolkata");

    setRecurrence({
      type: "None",
    });

    setConditions({});

    setNotifications({
      onSuccess: true,
      onFailure: true,
      beforeExecution: false,
    });

    setApproval("Risky Actions");
  };

  const handleCreateSchedule = () => {
    const cleanTitle = title.trim();
    const cleanDescription = description.trim();

    if (!cleanTitle || !date || !time) return;

    const scheduleType: ScheduleSection =
      recurrence.type !== "None"
        ? "Recurring"
        : "Upcoming";

    const newSchedule: ScheduleItem = {
      id: Date.now(),
      title: cleanTitle,
      description:
        cleanDescription || "ModelNow scheduled task.",
      time,
      date,
      type: scheduleType,
      status: "Scheduled",
      taskType,
      timezone,
      recurrence,
      conditions,
      notifications,
      approval,
      nextRun: `${date}, ${time}`,
      executionStatus: "Waiting",
    };

    setSchedules((currentSchedules) => [
      ...currentSchedules,
      newSchedule,
    ]);

    setActiveSection(scheduleType);

    resetForm();
    closeCreateSchedule();

    setShowScheduleChat(true);
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="flex">
        <ScheduleSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onNewSchedule={openCreateSchedule}
        />

        <main className="min-w-0 flex-1">
          {showScheduleChat ? (
            <ScheduleChatWorkspace
              onBack={() => setShowScheduleChat(false)}
            />
          ) : (
            <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8 md:py-10">
              <section className="mb-8">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white shadow-sm">
                      <Sparkles size={21} strokeWidth={1.8} />
                    </div>

                    <div>
                      <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                        Schedule
                      </h1>

                      <p className="mt-1 text-sm text-gray-500">
                        Automate tasks and let ModelNow handle them on your schedule.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={openCreateSchedule}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800"
                  >
                    <Plus size={17} strokeWidth={2} />
                    New Schedule
                  </button>
                </div>

                <div className="relative">
                  <Search
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) =>
                      handleScheduleSearchChange(event.target.value)
                    }
                    onFocus={handleScheduleSearchFocus}
                    placeholder="What would you like to schedule?"
                    className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                  />
                </div>
              </section>

              <section className="mb-8">
                <button
                  type="button"
                  onClick={() =>
                    setShowRecommendations((current) => !current)
                  }
                  className="flex w-full items-center justify-between border-b border-gray-200 pb-4 text-left"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles
                      size={18}
                      className="text-gray-700"
                      strokeWidth={1.8}
                    />
                    <span className="text-base font-semibold text-gray-900">
                      Recommended
                    </span>
                  </div>

                  {showRecommendations ? (
                    <ChevronUp size={19} className="text-gray-500" />
                  ) : (
                    <ChevronDown size={19} className="text-gray-500" />
                  )}
                </button>

                {showRecommendations && (
                  <div className="mt-3">
                    {filteredRecommendations.length === 0 ? (
                      <div className="py-8 text-center text-sm text-gray-500">
                        No recommendations found.
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {filteredRecommendations.map((recommendation) => {
                          const Icon = recommendation.icon;

                          return (
                            <button
                              key={recommendation.id}
                              type="button"
                              onClick={() =>
                                handleRecommendationClick(recommendation)
                              }
                              className="group flex w-full items-start gap-3 rounded-xl px-3 py-3.5 text-left transition-colors hover:bg-gray-50"
                            >
                              <div
                                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${recommendation.iconBackground} ${recommendation.iconColor} transition-transform duration-200 group-hover:scale-105`}
                              >
                                <Icon size={18} strokeWidth={2} />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="text-[14px] font-medium leading-5 text-gray-900">
                                  {recommendation.title}
                                </div>

                                <p className="mt-0.5 text-[13px] leading-5 text-gray-400">
                                  {recommendation.description}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </section>

              <section className="mb-8">
                <button
                  type="button"
                  onClick={() =>
                    setShowMySchedules((current) => !current)
                  }
                  className="flex w-full items-center justify-between border-b border-gray-200 pb-4 text-left"
                >
                  <div className="flex items-center gap-2">
                    <CalendarDays
                      size={18}
                      className="text-gray-700"
                      strokeWidth={1.8}
                    />

                    <span className="text-base font-semibold text-gray-900">
                      My Schedules
                    </span>

                    {schedules.length > 0 && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                        {schedules.length}
                      </span>
                    )}
                  </div>

                  {showMySchedules ? (
                    <ChevronUp size={19} className="text-gray-500" />
                  ) : (
                    <ChevronDown size={19} className="text-gray-500" />
                  )}
                </button>

                {showMySchedules && (
                  <div className="mt-4">
                    {filteredSchedules.length === 0 ? (
                      <ScheduleEmptyState
                        section={activeSection}
                        onNewSchedule={openCreateSchedule}
                      />
                    ) : (
                      <div className="grid gap-4">
                        {filteredSchedules.map((schedule) => (
                          <ScheduleTaskCard
                            key={schedule.id}
                            schedule={schedule}
                            onOpen={() => openScheduleDetails(schedule)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </section>
            </div>
          )}
        </main>
      </div>

      <CreateScheduleModal
        open={showNewSchedule}
        title={title}
        description={description}
        taskType={taskType}
        date={date}
        time={time}
        timezone={timezone}
        recurrence={recurrence}
        conditions={conditions}
        notifications={notifications}
        approval={approval}
        onTitleChange={setTitle}
        onDescriptionChange={setDescription}
        onTaskTypeChange={setTaskType}
        onDateChange={setDate}
        onTimeChange={setTime}
        onTimezoneChange={setTimezone}
        onRecurrenceChange={setRecurrence}
        onConditionsChange={setConditions}
        onNotificationsChange={setNotifications}
        onApprovalChange={setApproval}
        onClose={closeCreateSchedule}
        onCreate={handleCreateSchedule}
      />

      <ScheduleDetails
        schedule={selectedSchedule}
        open={showScheduleDetails}
        onClose={closeScheduleDetails}
        onRunNow={handleRunNow}
        onPause={handlePause}
        onResume={handleResume}
        onRetry={handleRetry}
        onCancel={handleCancel}
      />
    </div>
  );
}