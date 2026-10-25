"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  UserRound,
  ChartNoAxesCombined,
  Puzzle,
  Lightbulb,
  Settings2,
  Pencil,
  Share2,
  LockKeyhole,
  Globe,
  Check,
  X,
  CalendarDays,
  Zap,
  Activity,
  Sparkles,
  Clock3,
  ShieldCheck,
  Copy,
} from "lucide-react";

type Visibility = "Private" | "Public";
type ActivityPeriod = "Daily" | "Weekly" | "Cumulative";
type ProfileSection =
  | "profile"
  | "activity"
  | "plugins"
  | "insights"
  | "preferences";

type Profile = {
  name: string;
  handle: string;
  visibility: Visibility;
};

type Props = {
  embedded?: boolean;
};

const STORAGE_KEY = "modelnow-profile";

const DEFAULT_PROFILE: Profile = {
  name: "pujitha",
  handle: "@pujithamarikanti",
  visibility: "Private",
};

const NAVIGATION = [
  { id: "profile" as const, label: "Personal details", icon: UserRound },
  {
    id: "activity" as const,
    label: "Token Activity",
    icon: ChartNoAxesCombined,
  },
  { id: "plugins" as const, label: "Top Plugins", icon: Puzzle },
  { id: "insights" as const, label: "Insights", icon: Lightbulb },
  { id: "preferences" as const, label: "Preferences", icon: Settings2 },
];

const EMPTY_ACTIVITY = [0, 0, 0, 0, 0, 0, 0];

export default function ProfileSettingsPage({
  embedded = false,
}: Props) {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [nameInput, setNameInput] = useState(DEFAULT_PROFILE.name);
  const [handleInput, setHandleInput] = useState(
    DEFAULT_PROFILE.handle.replace(/^@/, "")
  );
  const [activeSection, setActiveSection] =
    useState<ProfileSection>("profile");
  const [activityPeriod, setActivityPeriod] =
    useState<ActivityPeriod>("Weekly");
  const [editing, setEditing] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved) as Partial<Profile>;

        const next: Profile = {
          name: String(parsed.name ?? DEFAULT_PROFILE.name),
          handle: String(parsed.handle ?? DEFAULT_PROFILE.handle),
          visibility:
            parsed.visibility === "Public" ? "Public" : "Private",
        };

        setProfile(next);
        setNameInput(next.name);
        setHandleInput(next.handle.replace(/^@/, ""));
      }
    } catch {
      // Keep the default profile if saved data is invalid.
    } finally {
      setLoaded(true);
    }
  }, []);

  function notify(text: string) {
    setMessage(text);
  }

  function persist(next: Profile) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setProfile(next);
      return true;
    } catch {
      notify("Unable to save changes in this browser.");
      return false;
    }
  }

  function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = nameInput.trim();
    const username = handleInput.trim().replace(/^@+/, "");

    if (!name || !username) {
      notify("Please enter both your name and username.");
      return;
    }

    const next: Profile = {
      ...profile,
      name,
      handle: `@${username}`,
    };

    if (persist(next)) {
      setNameInput(next.name);
      setHandleInput(next.handle.replace(/^@/, ""));
      setEditing(false);
      notify("Profile saved successfully.");
    }
  }

  function cancelEditing() {
    setNameInput(profile.name);
    setHandleInput(profile.handle.replace(/^@/, ""));
    setEditing(false);
    setMessage("");
  }

  function changeVisibility() {
    const next: Profile = {
      ...profile,
      visibility:
        profile.visibility === "Private" ? "Public" : "Private",
    };

    if (persist(next)) {
      notify(`Profile visibility set to ${next.visibility}.`);
    }
  }

  async function shareProfile() {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${profile.name} · ModelNow`,
          url,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        notify("Page link copied.");
        window.setTimeout(() => setCopied(false), 1800);
      } else {
        notify("Copy the page URL from your browser address bar.");
      }
    } catch {
      // Sharing was cancelled or unavailable.
    }
  }

  function selectSection(section: ProfileSection) {
    setActiveSection(section);
    setMessage("");
  }

  const initials =
    profile.name.trim().slice(0, 2).toUpperCase() || "PU";

  if (!loaded) {
    return (
      <div className="flex min-h-64 items-center justify-center bg-white text-sm text-slate-500">
        Loading profile…
      </div>
    );
  }

  return (
    <main className="min-h-full w-full bg-white text-[#202123]">
      <div
        className={
          embedded
            ? "w-full px-5 py-6 sm:px-8"
            : "mx-auto w-full max-w-6xl px-5 py-8 sm:px-8"
        }
      >
        {/* Header */}
        <header className="mb-8 flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            {!embedded && (
              <button
                type="button"
               onClick={() => router.push("/home")}
                aria-label="Go back"
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}

            <div>
              {!embedded && (
                <p className="mb-1 text-xs font-medium text-slate-500">
                  ModelNow
                </p>
              )}
              <h1 className="text-2xl font-semibold tracking-tight">
                Profile
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage your account profile and activity.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={shareProfile}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium hover:bg-slate-50"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
            {copied ? "Copied" : "Share"}
          </button>
        </header>

        {/* Status message */}
        {message && (
          <div
            role="status"
            className="mb-6 flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
          >
            <span>{message}</span>
            <button
              type="button"
              onClick={() => setMessage("")}
              aria-label="Dismiss message"
              className="text-slate-500 hover:text-slate-900"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 md:grid-cols-[220px_minmax(0,1fr)]">
          {/* Settings navigation */}
          <aside className="min-w-0">
            <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#D9E6F2] text-sm font-semibold text-[#243B53]">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {profile.name}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {profile.handle}
                </p>
              </div>
            </div>

            <p className="mb-2 px-3 text-xs font-medium text-slate-500">
              Account
            </p>

            <nav className="space-y-1" aria-label="Profile settings">
              {NAVIGATION.map(({ id, label, icon: Icon }) => {
                const active = activeSection === id;

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => selectSection(id)}
                    aria-current={active ? "page" : undefined}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                      active
                        ? "bg-slate-100 font-medium text-[#202123]"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main settings panel */}
          <section className="min-w-0 border-t border-slate-200 pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
            {activeSection === "profile" && (
              <div className="space-y-8">
                <SectionTitle
                  title="Personal details"
                  description="Manage the personal information associated with your profile."
                />

                <div className="border-b border-slate-200 pb-7">
                  <div className="flex flex-wrap items-center gap-5">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#D9E6F2] text-2xl font-semibold text-[#243B53]">
                      {initials}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2 className="break-words text-xl font-semibold">
                        {profile.name}
                      </h2>
                      <p className="mt-1 break-all text-sm text-slate-500">
                        {profile.handle}
                      </p>
                      <span className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-500">
                        {profile.visibility === "Private" ? (
                          <LockKeyhole className="h-3.5 w-3.5" />
                        ) : (
                          <Globe className="h-3.5 w-3.5" />
                        )}
                        {profile.visibility} profile
                      </span>
                    </div>

                    {!editing && (
                      <button
                        type="button"
                        onClick={() => {
                          setNameInput(profile.name);
                          setHandleInput(profile.handle.replace(/^@/, ""));
                          setEditing(true);
                          setMessage("");
                        }}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </button>
                    )}
                  </div>

                  {editing && (
                    <form
                      onSubmit={saveProfile}
                      className="mt-7 max-w-lg space-y-5"
                    >
                      <Field label="Name">
                        <input
                          value={nameInput}
                          onChange={(event) =>
                            setNameInput(event.target.value)
                          }
                          maxLength={80}
                          required
                          className={inputClass}
                          placeholder="Your name"
                        />
                      </Field>

                      <Field label="Username">
                        <div className="flex items-center rounded-lg border border-slate-300 px-3 focus-within:border-slate-500">
                          <span className="text-sm text-slate-500">@</span>
                          <input
                            value={handleInput.replace(/^@+/, "")}
                            onChange={(event) =>
                              setHandleInput(event.target.value)
                            }
                            maxLength={60}
                            required
                            className="w-full px-2 py-2.5 text-sm outline-none"
                            placeholder="username"
                          />
                        </div>
                      </Field>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="submit"
                          className="rounded-lg bg-[#202123] px-4 py-2.5 text-sm font-medium text-white hover:bg-black"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                <div>
                  <SectionTitle
                    title="Profile visibility"
                    description="Choose the visibility setting for your ModelNow profile."
                  />

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                      {profile.visibility === "Private" ? (
                        <LockKeyhole className="h-5 w-5 text-slate-500" />
                      ) : (
                        <Globe className="h-5 w-5 text-slate-500" />
                      )}
                      <div>
                        <p className="text-sm font-medium">
                          {profile.visibility}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Saved in this browser
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={changeVisibility}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
                    >
                      Make {profile.visibility === "Private" ? "Public" : "Private"}
                    </button>
                  </div>
                </div>

                <div>
                  <SectionTitle
                    title="Showcase"
                    description="A place for projects and work you want to share."
                  />
                  <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-8 text-center">
                    <Globe className="mx-auto h-7 w-7 text-slate-400" />
                    <p className="mt-3 text-sm font-medium">
                      Your showcase is empty
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Showcase editing has not been connected yet.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "activity" && (
              <div className="space-y-6">
                <SectionTitle
                  title="Token Activity"
                  description="Explore token usage over time."
                />

                <div className="inline-flex flex-wrap rounded-lg bg-slate-100 p-1">
                  {(
                    ["Daily", "Weekly", "Cumulative"] as ActivityPeriod[]
                  ).map((period) => (
                    <button
                      key={period}
                      type="button"
                      onClick={() => setActivityPeriod(period)}
                      className={`rounded-md px-3 py-2 text-sm ${
                        activityPeriod === period
                          ? "bg-white font-medium text-slate-900 shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <Metric icon={Zap} label="Total tokens" value="0" />
                  <Metric icon={CalendarDays} label="Active days" value="0" />
                  <Metric icon={Activity} label="Usage sessions" value="0" />
                </div>

                <div className="rounded-xl border border-slate-200 p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold">
                      {activityPeriod} usage
                    </h3>
                    <span className="text-xs text-slate-500">Token count</span>
                  </div>

                  <div className="mt-6 flex h-40 items-end gap-3 border-b border-l border-slate-200 px-3">
                    {EMPTY_ACTIVITY.map((value, index) => (
                      <div
                        key={`${activityPeriod}-${index}`}
                        className="flex h-full flex-1 items-end"
                      >
                        <div
                          className="w-full rounded-t bg-slate-200"
                          style={{ height: `${Math.max(value, 2)}%` }}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex justify-between text-xs text-slate-500">
                    {(activityPeriod === "Daily"
                      ? ["12 AM", "4 AM", "8 AM", "12 PM", "4 PM", "Now"]
                      : activityPeriod === "Weekly"
                        ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
                        : ["1", "2", "3", "4", "5", "6", "7"]
                    ).map((label) => (
                      <span key={label}>{label}</span>
                    ))}
                  </div>

                  <p className="mt-5 text-center text-sm text-slate-500">
                    Real token usage data is not connected yet.
                  </p>
                </div>
              </div>
            )}

            {activeSection === "plugins" && (
              <div className="space-y-6">
                <SectionTitle
                  title="Top Plugins"
                  description="Review your most-used ModelNow plugins."
                />
                <EmptyState
                  icon={Puzzle}
                  title="No plugin activity yet"
                  description="Plugin usage statistics will appear here after activity tracking is connected."
                />
                <button
                  type="button"
                  onClick={() => router.push("/home")}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50"
                >
                  Explore ModelNow
                </button>
              </div>
            )}

            {activeSection === "insights" && (
              <div className="space-y-6">
                <SectionTitle
                  title="Insights"
                  description="Understand your AI usage patterns."
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoCard
                    icon={ChartNoAxesCombined}
                    title="Usage patterns"
                    description="Review activity trends when token analytics are connected."
                  />
                  <InfoCard
                    icon={Clock3}
                    title="Productivity"
                    description="Explore session and activity summaries."
                  />
                  <InfoCard
                    icon={Zap}
                    title="Efficiency"
                    description="Compare model usage when real metrics are available."
                  />
                  <InfoCard
                    icon={Sparkles}
                    title="Recommendations"
                    description="Personalized recommendations can appear here as activity grows."
                  />
                </div>
              </div>
            )}

            {activeSection === "preferences" && (
              <div className="space-y-6">
                <SectionTitle
                  title="Preferences"
                  description="Manage profile visibility and privacy information."
                />

                <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 text-slate-500" />
                    <div>
                      <p className="text-sm font-medium">
                        Profile visibility
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Current setting: {profile.visibility}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={changeVisibility}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
                  >
                    Change
                  </button>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <h3 className="text-sm font-medium">Privacy information</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    These profile preferences are stored locally in this
                    browser. Server-side account synchronization and access
                    controls must be implemented separately.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500";

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Zap;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-slate-500">{label}</span>
        <Icon className="h-4 w-4 text-slate-400" />
      </div>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Lightbulb;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
        <Icon className="h-4 w-4 text-slate-600" />
      </div>
      <h3 className="mt-3 text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Puzzle;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 px-5 py-8 text-center">
      <Icon className="h-8 w-8 text-slate-400" />
      <h3 className="mt-3 text-sm font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}