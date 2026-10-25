"use client";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Globe2,
  Lock,
  MoreHorizontal,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
} from "lucide-react";

type BrowserPreviewProps = {
  currentStep: number;
  isRunning: boolean;
  isPaused: boolean;
  task: string;
};

type PreviewData = {
  url: string;
  site: string;
  heading: string;
  description: string;
};

const previewData: PreviewData[] = [
  {
    url: "modelnow.local/start",
    site: "ModelNow",
    heading: "Analyzing your task",
    description:
      "ModelNow is analyzing the user's intent, goals, constraints, and preferences.",
  },
  {
    url: "modelnow.local/planning",
    site: "ModelNow Planning",
    heading: "Building an automation plan",
    description:
      "The workflow is being converted into executable browser actions.",
  },
  {
    url: "www.google.com",
    site: "Google",
    heading: "Finding relevant websites",
    description:
      "Searching the web for websites related to the requested task.",
  },
  {
    url: "www.example.com",
    site: "Example Website",
    heading: "Interacting with webpage",
    description:
      "ModelNow is navigating the page and examining available controls.",
  },
  {
    url: "www.google.com/search",
    site: "Google Search",
    heading: "Searching for options",
    description:
      "Reviewing search results and identifying relevant information.",
  },
  {
    url: "www.example.com/results",
    site: "Results",
    heading: "Selecting the best option",
    description:
      "Comparing available options against the user's requirements.",
  },
  {
    url: "www.example.com/checkout",
    site: "Example Checkout",
    heading: "Action prepared",
    description:
      "The requested action has been prepared and is ready for review.",
  },
  {
    url: "secure.example.com/approval",
    site: "Secure Approval",
    heading: "Waiting for your confirmation",
    description:
      "ModelNow is waiting for user approval before continuing.",
  },
  {
    url: "www.example.com/complete",
    site: "Verification",
    heading: "Checking the result",
    description:
      "ModelNow is verifying that the requested task was completed.",
  },
];

function getTaskType(task: string) {
  const value = task.toLowerCase();

  if (
    value.includes("movie") ||
    value.includes("film") ||
    value.includes("cinema") ||
    value.includes("showtime")
  ) {
    return "movie";
  }

  if (
    value.includes("laptop") ||
    value.includes("computer") ||
    value.includes("phone") ||
    value.includes("product") ||
    value.includes("shopping")
  ) {
    return "shopping";
  }

  if (
    value.includes("flight") ||
    value.includes("hotel") ||
    value.includes("trip") ||
    value.includes("travel")
  ) {
    return "travel";
  }

  if (
    value.includes("restaurant") ||
    value.includes("food") ||
    value.includes("order") ||
    value.includes("delivery")
  ) {
    return "food";
  }

  return "general";
}

function getActivityMessage({
  isRunning,
  isPaused,
  isApprovalState,
  isCompleted,
  description,
}: {
  isRunning: boolean;
  isPaused: boolean;
  isApprovalState: boolean;
  isCompleted: boolean;
  description: string;
}) {
  if (isCompleted) {
    return "ModelNow verified that the requested task was completed.";
  }

  if (isApprovalState) {
    return "ModelNow is waiting for your confirmation before continuing.";
  }

  if (isPaused) {
    return "Automation is paused. The browser session is preserved.";
  }

  if (isRunning) {
    return description;
  }

  return "Browser preview is ready for the next automation run.";
}

export default function BrowserPreview({
  currentStep,
  isRunning,
  isPaused,
  task,
}: BrowserPreviewProps) {
  const safeStep = Math.min(
    Math.max(currentStep, 0),
    previewData.length - 1,
  );

  const data = previewData[safeStep];
  const taskType = getTaskType(task);

  const isApprovalState =
    currentStep === 7 && !isRunning && !isPaused;

  const isCompleted =
    currentStep >= previewData.length - 1 &&
    !isRunning &&
    !isPaused;

  const isReady =
    currentStep === 0 &&
    !isRunning &&
    !isPaused &&
    !task.trim();

  const activityMessage = getActivityMessage({
    isRunning,
    isPaused,
    isApprovalState,
    isCompleted,
    description: data.description,
  });

  const statusTone = isCompleted
    ? "success"
    : isApprovalState
      ? "approval"
      : isPaused
        ? "paused"
        : isRunning
          ? "running"
          : "idle";

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Browser chrome */}
      <div className="border-b border-slate-200 bg-slate-50">
        {/* Top browser controls */}
        <div className="flex items-center gap-2 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-yellow-400" />
          <span className="h-3 w-3 rounded-full bg-green-400" />

          <div className="ml-3 flex items-center gap-3 text-slate-400">
            <ArrowLeft size={15} />
            <ArrowRight size={15} />
            <RefreshCw
              size={14}
              className={isRunning ? "animate-spin" : ""}
            />
          </div>

          <div className="ml-2 flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
            <Lock
              size={13}
              className="shrink-0 text-emerald-600"
            />

            <span className="truncate text-xs text-slate-500">
              https://{data.url}
            </span>
          </div>

          <MoreHorizontal
            size={17}
            className="shrink-0 text-slate-400"
          />
        </div>

        {/* Browser tab */}
        <div className="px-4 pb-3">
          <div className="flex max-w-[260px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <Globe2
              size={13}
              className="shrink-0 text-slate-400"
            />

            <span className="truncate text-xs font-medium text-slate-700">
              {data.site}
            </span>

            {isRunning && (
              <span className="ml-auto h-2 w-2 animate-pulse rounded-full bg-blue-500" />
            )}
          </div>
        </div>
      </div>

      {/* Browser page */}
      <div className="min-h-[430px] bg-white">
        {/* Page header */}
        <div className="border-b border-slate-100 px-5 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Sparkles
                  size={14}
                  className="text-blue-500"
                />

                <p className="text-xs font-medium text-slate-400">
                  {data.site}
                </p>
              </div>

              <h3 className="mt-1 text-lg font-semibold text-slate-900">
                {data.heading}
              </h3>

              <p className="mt-1 max-w-2xl text-sm leading-5 text-slate-500">
                {data.description}
              </p>
            </div>

            <PreviewStatus
              isReady={isReady}
              isRunning={isRunning}
              isPaused={isPaused}
              isApprovalState={isApprovalState}
              isCompleted={isCompleted}
            />
          </div>
        </div>

        {/* Current browser activity strip */}
        <div className="border-b border-slate-100 px-5 py-3">
          <div
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
              statusTone === "success"
                ? "border-emerald-100 bg-emerald-50"
                : statusTone === "approval"
                  ? "border-amber-100 bg-amber-50"
                  : statusTone === "paused"
                    ? "border-orange-100 bg-orange-50"
                    : statusTone === "running"
                      ? "border-blue-100 bg-blue-50"
                      : "border-slate-200 bg-slate-50"
            }`}
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                statusTone === "success"
                  ? "bg-emerald-100 text-emerald-700"
                  : statusTone === "approval"
                    ? "bg-amber-100 text-amber-700"
                    : statusTone === "paused"
                      ? "bg-orange-100 text-orange-700"
                      : statusTone === "running"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-200 text-slate-600"
              }`}
            >
              {statusTone === "success" ? (
                <CheckCircle2 size={16} />
              ) : statusTone === "approval" ? (
                <ShieldCheck size={16} />
              ) : (
                <Globe2 size={16} />
              )}
            </div>

            <div className="min-w-0">
              <p
                className={`text-xs font-semibold ${
                  statusTone === "success"
                    ? "text-emerald-900"
                    : statusTone === "approval"
                      ? "text-amber-900"
                      : statusTone === "paused"
                        ? "text-orange-900"
                        : statusTone === "running"
                          ? "text-blue-900"
                          : "text-slate-800"
                }`}
              >
                {isCompleted
                  ? "Automation complete"
                  : isApprovalState
                    ? "Confirmation required"
                    : isPaused
                      ? "Automation paused"
                      : isRunning
                        ? "Browser automation active"
                        : "Browser session ready"}
              </p>

              <p
                className={`mt-0.5 truncate text-xs ${
                  statusTone === "success"
                    ? "text-emerald-700"
                    : statusTone === "approval"
                      ? "text-amber-700"
                      : statusTone === "paused"
                        ? "text-orange-700"
                        : statusTone === "running"
                          ? "text-blue-700"
                          : "text-slate-500"
                }`}
              >
                {activityMessage}
              </p>
            </div>

            <div className="ml-auto shrink-0">
              {isRunning && (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              )}

              {isPaused && (
                <div className="flex gap-1">
                  <span className="h-4 w-1 rounded-full bg-orange-500" />
                  <span className="h-4 w-1 rounded-full bg-orange-500" />
                </div>
              )}

              {isCompleted && (
                <CheckCircle2
                  size={20}
                  className="text-emerald-600"
                />
              )}

              {isApprovalState && (
                <ShieldCheck
                  size={20}
                  className="text-amber-600"
                />
              )}
            </div>
          </div>
        </div>

        {/* Mock page content */}
        <div className="p-5">
          {safeStep === 0 && <IntentView task={task} />}

          {safeStep === 1 && (
            <PlanningView taskType={taskType} />
          )}

          {safeStep === 2 && (
            <SearchView taskType={taskType} />
          )}

          {safeStep === 3 && (
            <InteractionView taskType={taskType} />
          )}

          {safeStep === 4 && (
            <SearchResultsView taskType={taskType} />
          )}

          {safeStep === 5 && (
            <SelectionView taskType={taskType} />
          )}

          {safeStep === 6 && (
            <CheckoutView taskType={taskType} />
          )}

          {safeStep === 7 && (
            <ApprovalView taskType={taskType} />
          )}

          {safeStep === 8 && (
            <VerificationView taskType={taskType} />
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------- Status ---------- */

function PreviewStatus({
  isReady,
  isRunning,
  isPaused,
  isApprovalState,
  isCompleted,
}: {
  isReady: boolean;
  isRunning: boolean;
  isPaused: boolean;
  isApprovalState: boolean;
  isCompleted: boolean;
}) {
  if (isCompleted) {
    return (
      <span className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        Completed
      </span>
    );
  }

  if (isApprovalState) {
    return (
      <span className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
        <span className="h-2 w-2 rounded-full bg-amber-500" />
        Approval
      </span>
    );
  }

  if (isPaused) {
    return (
      <span className="flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700">
        <span className="h-2 w-2 rounded-full bg-orange-500" />
        Paused
      </span>
    );
  }

  if (isRunning) {
    return (
      <span className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">
        <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
        Live
      </span>
    );
  }

  if (isReady) {
    return (
      <span className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500">
        <span className="h-2 w-2 rounded-full bg-slate-400" />
        Ready
      </span>
    );
  }

  return (
    <span className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500">
      <span className="h-2 w-2 rounded-full bg-slate-400" />
      Standby
    </span>
  );
}

/* ---------- Preview states ---------- */

function IntentView({
  task,
}: {
  task: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
          <Search size={17} />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">
            Understanding user intent
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Analyzing task requirements...
          </p>
        </div>
      </div>

      {task.trim() && (
        <div className="mt-4 rounded-lg border border-blue-100 bg-white p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            User request
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-700">
            {task}
          </p>
        </div>
      )}

      <div className="mt-5 space-y-3">
        <SkeletonLine width="80%" />
        <SkeletonLine width="95%" />
        <SkeletonLine width="65%" />
      </div>
    </div>
  );
}

function PlanningView({
  taskType,
}: {
  taskType: string;
}) {
  const finalAction =
    taskType === "movie"
      ? "Prepare movie booking"
      : taskType === "shopping"
        ? "Prepare product checkout"
        : taskType === "travel"
          ? "Prepare travel selection"
          : taskType === "food"
            ? "Prepare food order"
            : "Prepare requested action";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-xs font-medium text-slate-400">
        ModelNow Planner
      </p>

      <div className="mt-4 space-y-3">
        <PlanRow number="1" text="Understand request" />
        <PlanRow number="2" text="Discover website" />
        <PlanRow number="3" text="Search information" />
        <PlanRow number="4" text="Compare options" />
        <PlanRow number="5" text={finalAction} />
      </div>
    </div>
  );
}

function SearchView({
  taskType,
}: {
  taskType: string;
}) {
  const searchLabel =
    taskType === "movie"
      ? "Searching for movies available tonight..."
      : taskType === "shopping"
        ? "Searching for suitable products..."
        : taskType === "travel"
          ? "Searching for flights and hotels..."
          : taskType === "food"
            ? "Searching for restaurants and food options..."
            : "Searching for relevant websites...";

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
        <Search size={16} className="text-slate-400" />

        <span className="text-xs text-slate-500">
          {searchLabel}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <WebsiteRow
          title="Search results"
          url="google.com"
        />

        <WebsiteRow
          title="Relevant website"
          url="example.com"
        />

        <WebsiteRow
          title="Candidate results"
          url="relevant-site.com"
        />
      </div>
    </div>
  );
}

function InteractionView({
  taskType,
}: {
  taskType: string;
}) {
  const title =
    taskType === "movie"
      ? "Movie listing page"
      : taskType === "shopping"
        ? "Product listing page"
        : taskType === "travel"
          ? "Travel results page"
          : taskType === "food"
            ? "Restaurant page"
            : "Web page";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {title}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Reading page structure and available controls
          </p>
        </div>

        <ExternalLink
          size={17}
          className="text-slate-400"
        />
      </div>

      <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <SkeletonLine width="70%" />

        <div className="mt-4 flex gap-3">
          <div className="h-9 flex-1 rounded-lg bg-white" />

          <div className="h-9 w-24 rounded-lg bg-slate-900" />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="h-16 rounded-lg bg-white" />
          <div className="h-16 rounded-lg bg-white" />
          <div className="h-16 rounded-lg bg-white" />
        </div>
      </div>
    </div>
  );
}

function SearchResultsView({
  taskType,
}: {
  taskType: string;
}) {
  const results =
    taskType === "movie"
      ? [
          {
            name: "Tonight's Featured Movie",
            info: "Available tonight · Multiple showtimes",
          },
          {
            name: "Popular Cinema Pick",
            info: "Available tonight · Premium seats",
          },
          {
            name: "New Release",
            info: "Available tonight · Standard seats",
          },
        ]
      : taskType === "shopping"
        ? [
            {
              name: "Laptop Pro",
              info: "$899 · 16GB RAM · 512GB SSD",
            },
            {
              name: "Laptop Air",
              info: "$949 · 16GB RAM · 512GB SSD",
            },
            {
              name: "Laptop Plus",
              info: "$799 · 16GB RAM · 256GB SSD",
            },
          ]
        : taskType === "travel"
          ? [
              {
                name: "Flight option",
                info: "Best available route · Flexible timing",
              },
              {
                name: "Hotel option",
                info: "Highly rated · Central location",
              },
              {
                name: "Alternative",
                info: "Lower price · Different schedule",
              },
            ]
          : taskType === "food"
            ? [
                {
                  name: "Restaurant A",
                  info: "Highly rated · Delivery available",
                },
                {
                  name: "Restaurant B",
                  info: "Popular nearby · Fast delivery",
                },
                {
                  name: "Restaurant C",
                  info: "Top rated · Multiple dishes",
                },
              ]
            : [
                {
                  name: "Option A",
                  info: "Relevant result discovered",
                },
                {
                  name: "Option B",
                  info: "Relevant result discovered",
                },
                {
                  name: "Option C",
                  info: "Relevant result discovered",
                },
              ];

  return (
    <div>
      <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
        <Search size={16} className="text-slate-400" />

        <span className="text-xs text-slate-500">
          Search results
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {results.map((result, index) => (
          <div
            key={result.name}
            className={`flex items-center justify-between rounded-xl border bg-white p-4 ${
              index === 0
                ? "border-blue-300 ring-2 ring-blue-50"
                : "border-slate-200"
            }`}
          >
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {result.name}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {result.info}
              </p>
            </div>

            {index === 0 && (
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
                Best match
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SelectionView({
  taskType,
}: {
  taskType: string;
}) {
  const title =
    taskType === "movie"
      ? "Selected movie"
      : taskType === "shopping"
        ? "Selected laptop"
        : taskType === "travel"
          ? "Selected travel option"
          : taskType === "food"
            ? "Selected restaurant"
            : "Selected option";

  const subtitle =
    taskType === "movie"
      ? "Best available movie for tonight"
      : taskType === "shopping"
        ? "Best match for your requirements"
        : taskType === "travel"
          ? "Best available travel option"
          : taskType === "food"
            ? "Best available restaurant option"
            : "Best matching result";

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-center gap-3">
        <CheckCircle2
          size={20}
          className="text-emerald-600"
        />

        <div>
          <p className="text-sm font-semibold text-slate-900">
            {title}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-blue-300 bg-white p-4 ring-2 ring-blue-50">
        <div className="h-20 rounded-lg bg-slate-100" />

        <p className="mt-3 text-sm font-semibold text-slate-900">
          Best match selected
        </p>

        <p className="mt-1 text-xs text-slate-500">
          ModelNow is preparing the next action.
        </p>
      </div>
    </div>
  );
}

function CheckoutView({
  taskType,
}: {
  taskType: string;
}) {
  const selectedLabel =
    taskType === "movie"
      ? "Movie"
      : taskType === "shopping"
        ? "Product"
        : taskType === "travel"
          ? "Travel option"
          : taskType === "food"
            ? "Restaurant"
            : "Selected option";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <ShoppingCart
          size={20}
          className="text-blue-600"
        />

        <div>
          <p className="text-sm font-semibold text-slate-900">
            Action prepared
          </p>

          <p className="mt-1 text-xs text-slate-500">
            The requested action is ready for review.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <CheckoutRow
          label={selectedLabel}
          value="Best match"
        />

        <CheckoutRow
          label="Status"
          value="Ready for review"
        />

        <CheckoutRow
          label="Confirmation"
          value="Required"
        />
      </div>
    </div>
  );
}

function ApprovalView({
  taskType,
}: {
  taskType: string;
}) {
  const action =
    taskType === "movie"
      ? "Movie booking"
      : taskType === "shopping"
        ? "Product checkout"
        : taskType === "travel"
          ? "Travel booking"
          : taskType === "food"
            ? "Food order"
            : "Requested action";

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
          <Lock size={17} />
        </div>

        <div>
          <p className="text-sm font-semibold text-amber-950">
            Approval required
          </p>

          <p className="mt-1 text-xs text-amber-800">
            {action} is ready and waiting for confirmation.
          </p>
        </div>
      </div>
    </div>
  );
}

function VerificationView({
  taskType,
}: {
  taskType: string;
}) {
  const message =
    taskType === "movie"
      ? "Checking the movie booking result."
      : taskType === "shopping"
        ? "Checking the product action result."
        : taskType === "travel"
          ? "Checking the travel action result."
          : taskType === "food"
            ? "Checking the food order result."
            : "Checking that the requested action completed successfully.";

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
      <div className="flex items-center gap-3">
        <CheckCircle2
          size={22}
          className="text-emerald-600"
        />

        <div>
          <p className="text-sm font-semibold text-emerald-900">
            Verifying result
          </p>

          <p className="mt-1 text-xs text-emerald-700">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------- Small components ---------- */

function SkeletonLine({
  width,
}: {
  width: string;
}) {
  return (
    <div
      className="h-3 rounded-full bg-slate-200"
      style={{ width }}
    />
  );
}

function PlanRow({
  number,
  text,
}: {
  number: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-semibold text-slate-500">
        {number}
      </span>

      <span className="text-xs font-medium text-slate-700">
        {text}
      </span>

      <span className="ml-auto h-2 w-2 rounded-full bg-blue-500" />
    </div>
  );
}

function WebsiteRow({
  title,
  url,
}: {
  title: string;
  url: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3">
      <div>
        <p className="text-xs font-semibold text-slate-800">
          {title}
        </p>

        <p className="mt-1 text-[11px] text-slate-400">
          {url}
        </p>
      </div>

      <ExternalLink
        size={14}
        className="text-slate-400"
      />
    </div>
  );
}

function CheckoutRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
      <span className="text-xs text-slate-500">
        {label}
      </span>

      <span className="text-xs font-semibold text-slate-800">
        {value}
      </span>
    </div>
  );
}