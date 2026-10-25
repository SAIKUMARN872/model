
"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import {
  User,
  Mail,
  Phone,
  AtSign,
  CalendarDays,
  ShieldCheck,
  CircleCheck,
  Globe2,
  Clock3,
  MapPin,
  Download,
  UserX,
  Trash2,
  Camera,
  ArrowLeft,
  Copy,
  Check,
  AlertTriangle,
  X,
} from "lucide-react";

type Profile = {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  bio: string;
};

type Preferences = {
  language: string;
  timezone: string;
  country: string;
};

type StoredAccountSettings = {
  profile: Profile;
  preferences: Preferences;
  profileImage: string;
};

const INITIAL_PROFILE: Profile = {
  fullName: "Pujitha",
  username: "@pujitha",
  email: "pujitha@example.com",
  phone: "+91 98765 43210",
  bio: "Building AI-powered products and exploring modern technology.",
};

const INITIAL_PREFERENCES: Preferences = {
  language: "English",
  timezone: "Asia/Kolkata",
  country: "India",
};

const ACCOUNT_STORAGE_KEY = "modelnow-account-settings-v1";

const ACCOUNT_INFO = {
  accountId: "MN-2026-PUJ-7311",
  dateJoined: "January 03, 2026",
  accountType: "Pro",
  accountStatus: "Active",
};

function isProfile(value: unknown): value is Profile {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;

  return (
    typeof item.fullName === "string" &&
    typeof item.username === "string" &&
    typeof item.email === "string" &&
    typeof item.phone === "string" &&
    typeof item.bio === "string"
  );
}

function isPreferences(value: unknown): value is Preferences {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;

  return (
    typeof item.language === "string" &&
    typeof item.timezone === "string" &&
    typeof item.country === "string"
  );
}

function isStoredSettings(value: unknown): value is StoredAccountSettings {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;

  return (
    isProfile(item.profile) &&
    isPreferences(item.preferences) &&
    typeof item.profileImage === "string"
  );
}

export default function AccountPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Profile>(INITIAL_PROFILE);
  const [savedProfile, setSavedProfile] = useState<Profile>(INITIAL_PROFILE);
  const [preferences, setPreferences] =
    useState<Preferences>(INITIAL_PREFERENCES);
  const [savedPreferences, setSavedPreferences] =
    useState<Preferences>(INITIAL_PREFERENCES);

  const [profileImage, setProfileImage] = useState("");
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [storageReady, setStorageReady] = useState(false);
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(ACCOUNT_STORAGE_KEY);

      if (stored) {
        const parsed: unknown = JSON.parse(stored);

        if (isStoredSettings(parsed)) {
          setProfile(parsed.profile);
          setSavedProfile(parsed.profile);
          setPreferences(parsed.preferences);
          setSavedPreferences(parsed.preferences);
          setProfileImage(parsed.profileImage);
        }
      }
    } catch {
      setError("Saved settings could not be loaded from this browser.");
    } finally {
      setStorageReady(true);
    }
  }, []);

  function clearMessages() {
    setNotice("");
    setError("");
  }

  function updateProfile<K extends keyof Profile>(
    key: K,
    value: Profile[K]
  ) {
    setProfile((current) => ({ ...current, [key]: value }));
    clearMessages();
  }

  function updatePreference<K extends keyof Preferences>(
    key: K,
    value: Preferences[K]
  ) {
    setPreferences((current) => ({ ...current, [key]: value }));
    clearMessages();
  }

  function handleProfileImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      setNotice("");
      event.target.value = "";
      return;
    }

    if (file.size > 1024 * 1024) {
      setError("Choose an image smaller than 1 MB.");
      setNotice("");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setError("Unable to read the image. Please try another file.");
        setNotice("");
        return;
      }

      setProfileImage(reader.result);
      clearMessages();
    };

    reader.onerror = () => {
      setError("Unable to read the image. Please try another file.");
      setNotice("");
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  }

  async function copyAccountId() {
    try {
      await navigator.clipboard.writeText(ACCOUNT_INFO.accountId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Unable to copy the account ID.");
      setNotice("");
    }
  }

  function validateProfile(): string | null {
    if (!profile.fullName.trim()) {
      return "Please enter your full name.";
    }

    if (!profile.username.trim()) {
      return "Please enter a username.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())) {
      return "Please enter a valid email address.";
    }

    if (
      profile.phone.trim() &&
      !/^\+?[0-9\s()-]{7,20}$/.test(profile.phone.trim())
    ) {
      return "Please enter a valid phone number.";
    }

    return null;
  }

  function saveChanges() {
    clearMessages();

    const validationError = validateProfile();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (!storageReady) {
      setError("Please wait until your saved settings finish loading.");
      return;
    }

    setSaving(true);

    const settings: StoredAccountSettings = {
      profile: {
        ...profile,
        fullName: profile.fullName.trim(),
        username: profile.username.trim(),
        email: profile.email.trim(),
        phone: profile.phone.trim(),
        bio: profile.bio.trim(),
      },
      preferences: { ...preferences },
      profileImage,
    };

    try {
      const serialized = JSON.stringify(settings);

      window.localStorage.setItem(ACCOUNT_STORAGE_KEY, serialized);

      // Verify the saved value can be read back.
      const savedValue = window.localStorage.getItem(ACCOUNT_STORAGE_KEY);

      if (savedValue !== serialized) {
        throw new Error("Save verification failed.");
      }

      setProfile(settings.profile);
      setSavedProfile(settings.profile);
      setPreferences(settings.preferences);
      setSavedPreferences(settings.preferences);

      setNotice("Changes saved successfully!");
      setError("");
    } catch {
      setNotice("");
      setError(
        "Your changes could not be saved. Try removing the profile picture or freeing browser storage."
      );
    } finally {
      setSaving(false);
    }
  }

  function exportAccountData() {
    try {
      const data = {
        profile: savedProfile,
        accountInformation: ACCOUNT_INFO,
        preferences: savedPreferences,
        exportCreatedAt: new Date().toISOString(),
        note:
          "This export contains browser-saved preview data, not a server backup.",
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "modelnow-account-data.json";
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setNotice("");
      setError("Unable to export account data.");
    }
  }

  function requestDeactivation() {
    setShowDeactivate(false);
    setNotice("Deactivation is not connected. No account status was changed.");
    setError("");
  }

  function requestDeletion() {
    setShowDelete(false);
    setNotice("Deletion is not connected. No account data was deleted.");
    setError("");
  }

  return (
    <main className="min-h-screen bg-white text-[#171717]">
      <header className="border-b border-black/[0.08] bg-white">
        <div className="mx-auto flex h-[68px] w-full max-w-[560px] items-center px-5">
          <button
            type="button"
            onClick={() => window.history.back()}
            aria-label="Go back"
            className="mr-5 flex h-8 w-8 items-center justify-center rounded-md text-[#64748b] transition hover:bg-[#f5f5f5] hover:text-black"
          >
            <ArrowLeft size={19} strokeWidth={1.8} />
          </button>
          <h1 className="text-[20px] font-medium tracking-[-0.02em]">
            Account
          </h1>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[560px] px-5 pb-16 pt-12">
        {(notice || error) && (
          <div
            role={error ? "alert" : "status"}
            aria-live="polite"
            className={`mb-6 flex items-start gap-3 rounded-xl border p-4 text-sm leading-6 ${
              error
                ? "border-red-300 bg-red-50 text-red-900"
                : "border-green-300 bg-green-50 text-green-900"
            }`}
          >
            {error ? (
              <AlertTriangle size={21} className="mt-0.5 shrink-0" />
            ) : (
              <CircleCheck size={21} className="mt-0.5 shrink-0" />
            )}

            <div className="min-w-0 flex-1">
              <p className="font-semibold">
                {error ? "Save failed" : "Saved successfully"}
              </p>
              <p>{error || notice}</p>

              {!error && notice === "Changes saved successfully!" && (
                <p className="mt-1 text-xs">
                  Saved in this browser only. It is not synced to a database.
                </p>
              )}
            </div>

            <button
              type="button"
              aria-label="Dismiss message"
              onClick={clearMessages}
              className="rounded p-1 opacity-70 hover:bg-black/5 hover:opacity-100"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {!storageReady && (
          <p className="mb-5 text-sm text-[#64748b]">
            Loading saved account settings…
          </p>
        )}

        <section>
          <SectionHeading
            icon={<User size={22} strokeWidth={1.7} />}
            title="Profile"
            description={<>Manage your personal<br />profile information.</>}
          />

          <div className="overflow-hidden rounded-[16px] border border-[#e5e7eb] bg-white">
            <div className="px-7 py-7">
              <div className="grid grid-cols-[105px_1fr] items-center gap-5">
                <div className="relative flex justify-center">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile preview"
                      className="h-[100px] w-[100px] rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-[100px] w-[100px] items-center justify-center rounded-full bg-[#111827] text-[27px] font-medium text-white">
                      {profile.fullName.trim().charAt(0).toUpperCase() || "?"}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Change profile picture"
                    className="absolute bottom-[-2px] right-[-1px] flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-white bg-black text-white"
                  >
                    <Camera size={15} />
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={handleProfileImage}
                    className="hidden"
                  />
                </div>

                <div>
                  <h3 className="text-[17px] font-medium">Profile Picture</h3>
                  <p className="mt-2 text-[14px] leading-5 text-[#64748b]">
                    Upload an image to personalize your account. Maximum size:
                    1 MB for browser storage.
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-3 rounded-[10px] border border-[#dfe3e8] bg-white px-4 py-2 text-[15px] font-medium transition hover:bg-[#f8fafc]"
                  >
                    Change picture
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-[#e5e7eb] px-7 py-7">
              <div className="grid grid-cols-1 gap-x-6 gap-y-7 sm:grid-cols-2">
                <CompactField
                  icon={<User size={17} />}
                  label="Full Name"
                  value={profile.fullName}
                  onChange={(value) => updateProfile("fullName", value)}
                  required
                />
                <CompactField
                  icon={<AtSign size={17} />}
                  label="Username"
                  value={profile.username}
                  onChange={(value) => updateProfile("username", value)}
                  required
                />
                <CompactField
                  icon={<Mail size={17} />}
                  label="Email Address"
                  value={profile.email}
                  onChange={(value) => updateProfile("email", value)}
                  required
                  inputType="email"
                />
                <CompactField
                  icon={<Phone size={17} />}
                  label="Phone Number"
                  value={profile.phone}
                  onChange={(value) => updateProfile("phone", value)}
                  inputType="tel"
                />
              </div>

              <div className="mt-7">
                <label
                  htmlFor="account-bio"
                  className="mb-2 block text-[16px] font-medium"
                >
                  Bio
                </label>
                <textarea
                  id="account-bio"
                  value={profile.bio}
                  onChange={(event) => updateProfile("bio", event.target.value)}
                  rows={3}
                  maxLength={500}
                  className="w-full resize-none rounded-[10px] border border-[#dfe3e8] px-3.5 py-3 text-[15px] outline-none focus:border-[#9ca3af]"
                />
                <p className="mt-1 text-right text-xs text-[#64748b]">
                  {profile.bio.length}/500
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-[#e5e7eb] px-7 py-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-[#64748b]">
                Remember to save your profile and preferences.
              </p>

              <button
                type="button"
                onClick={saveChanges}
                disabled={saving || !storageReady}
                className="inline-flex min-w-[160px] items-center justify-center gap-2 rounded-[10px] bg-[#111827] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#374151] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <SectionHeading
            icon={<ShieldCheck size={22} strokeWidth={1.7} />}
            title="Account Information"
            description={<>View information associated with<br />your ModelNow account.</>}
          />
          <div className="overflow-hidden rounded-[16px] border border-[#e5e7eb] bg-white">
            <AccountInfoRow
              icon={<ShieldCheck size={17} />}
              label="Account ID"
              value={
                <div className="flex items-center gap-1">
                  <span>{ACCOUNT_INFO.accountId}</span>
                  <button
                    type="button"
                    onClick={copyAccountId}
                    aria-label="Copy account ID"
                    className="rounded-md p-1 text-[#64748b] hover:bg-[#f5f5f5]"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              }
            />
            <AccountInfoRow
              icon={<CalendarDays size={17} />}
              label="Date Joined"
              value={ACCOUNT_INFO.dateJoined}
            />
            <AccountInfoRow
              icon={<User size={17} />}
              label="Account Type"
              value={
                <span className="rounded-full bg-[#f1f5f9] px-3 py-1 text-xs font-medium">
                  {ACCOUNT_INFO.accountType}
                </span>
              }
            />
            <AccountInfoRow
              icon={<CircleCheck size={17} />}
              label="Account Status"
              value={
                <span className="flex items-center gap-2 text-green-700">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  {ACCOUNT_INFO.accountStatus}
                </span>
              }
              last
            />
          </div>
        </section>

        <section className="mt-12">
          <SectionHeading
            icon={<Globe2 size={22} strokeWidth={1.7} />}
            title="Preferences"
            description={<>Choose your default language,<br />timezone, and country.</>}
          />
          <div className="overflow-hidden rounded-[16px] border border-[#e5e7eb] bg-white">
            <PreferenceRow
              icon={<Globe2 size={17} />}
              label="Default Language"
              value={preferences.language}
              onChange={(value) => updatePreference("language", value)}
              options={["English", "Telugu", "Hindi"]}
            />
            <PreferenceRow
              icon={<Clock3 size={17} />}
              label="Timezone"
              value={preferences.timezone}
              onChange={(value) => updatePreference("timezone", value)}
              options={[
                "Asia/Kolkata",
                "Asia/Dubai",
                "Europe/London",
                "America/New_York",
              ]}
            />
            <PreferenceRow
              icon={<MapPin size={17} />}
              label="Country"
              value={preferences.country}
              onChange={(value) => updatePreference("country", value)}
              options={["India", "United States", "United Kingdom", "UAE"]}
              last
            />
          </div>
          <p className="mt-3 text-xs leading-5 text-[#64748b]">
            Preferences are saved to this browser when you select Save Changes.
            They are not synced to the backend.
          </p>
        </section>

        <section className="mt-12">
          <SectionHeading
            icon={<ShieldCheck size={22} strokeWidth={1.7} />}
            title="Account Management"
            description={<>Manage your account data and<br />account lifecycle.</>}
          />
          <div className="overflow-hidden rounded-[16px] border border-[#e5e7eb] bg-white">
            <ManagementRow
              icon={<Download size={18} />}
              title="Export Account Data"
              description="Download a copy of the currently saved account preview."
              action={
                <button
                  type="button"
                  onClick={exportAccountData}
                  className="rounded-[9px] border border-[#dfe3e8] px-3.5 py-2 text-sm font-medium hover:bg-[#f8fafc]"
                >
                  Export
                </button>
              }
            />
            <ManagementRow
              icon={<UserX size={18} />}
              title="Deactivate Account"
              description="Backend support is required to deactivate your account."
              action={
                <button
                  type="button"
                  onClick={() => setShowDeactivate(true)}
                  className="rounded-[9px] border border-[#dfe3e8] px-3.5 py-2 text-sm font-medium hover:bg-[#f8fafc]"
                >
                  Deactivate
                </button>
              }
            />
            <ManagementRow
              icon={<Trash2 size={18} />}
              title="Delete Account"
              description="Backend support is required to permanently delete your account."
              action={
                <button
                  type="button"
                  onClick={() => setShowDelete(true)}
                  className="rounded-[9px] bg-red-50 px-3.5 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                >
                  Delete
                </button>
              }
              last
            />
          </div>
        </section>

        <div className="mt-8 flex gap-3 rounded-[16px] border border-[#e5e7eb] bg-white p-5">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-[#64748b]" />
          <div>
            <p className="text-[15px] font-medium">Account security</p>
            <p className="mt-1 text-[13px] leading-5 text-[#64748b]">
              This page uses browser-side preview storage. Authentication,
              secure server-side storage, profile-image hosting, and account
              deactivation or deletion must be implemented in the backend
              before production use.
            </p>
          </div>
        </div>
      </div>

      {showDeactivate && (
        <ConfirmationModal
          title="Deactivate account?"
          description="This preview cannot deactivate your account yet. No account changes will occur."
          confirmText="Got it"
          onCancel={() => setShowDeactivate(false)}
          onConfirm={requestDeactivation}
          danger={false}
        />
      )}

      {showDelete && (
        <ConfirmationModal
          title="Delete account?"
          description="Account deletion is not connected. No account or data will be deleted by this preview."
          confirmText="Got it"
          onCancel={() => setShowDelete(false)}
          onConfirm={requestDeletion}
          danger
        />
      )}
    </main>
  );
}

function SectionHeading({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: ReactNode;
}) {
  return (
    <div className="mb-7 flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f7f7f8] text-[#475569]">
        {icon}
      </div>
      <div>
        <h2 className="text-[18px] font-semibold">{title}</h2>
        <p className="mt-1 text-[16px] leading-6 text-[#64748b]">
          {description}
        </p>
      </div>
    </div>
  );
}

function CompactField({
  icon,
  label,
  value,
  onChange,
  required = false,
  inputType = "text",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  inputType?: string;
}) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 flex items-start gap-2 text-[15px] font-medium"
      >
        <span className="mt-0.5 text-[#64748b]">{icon}</span>
        <span>
          {label}
          {required ? " *" : ""}
        </span>
      </label>
      <input
        id={id}
        type={inputType}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="h-[50px] w-full rounded-[10px] border border-[#dfe3e8] bg-white px-3.5 text-[15px] outline-none transition focus:border-[#9ca3af]"
      />
    </div>
  );
}

function AccountInfoRow({
  icon,
  label,
  value,
  last = false,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 px-6 py-5 ${
        last ? "" : "border-b border-[#e5e7eb]"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-[#64748b]">{icon}</span>
        <span className="text-[14px] text-[#64748b]">{label}</span>
      </div>
      <div className="break-all text-right text-[14px] font-medium">
        {value}
      </div>
    </div>
  );
}

function PreferenceRow({
  icon,
  label,
  value,
  onChange,
  options,
  last = false,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  last?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between ${
        last ? "" : "border-b border-[#e5e7eb]"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-[#64748b]">{icon}</span>
        <span className="text-[14px] font-medium">{label}</span>
      </div>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-[45px] w-full rounded-[10px] border border-[#dfe3e8] bg-white px-3 text-[14px] outline-none focus:border-[#9ca3af] sm:max-w-[210px]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function ManagementRow({
  icon,
  title,
  description,
  action,
  last = false,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action: ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-5 px-6 py-5 ${
        last ? "" : "border-b border-[#e5e7eb]"
      }`}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 shrink-0 text-[#64748b]">{icon}</span>
        <div className="min-w-0">
          <p className="text-[14px] font-medium">{title}</p>
          <p className="mt-1 text-[12px] leading-5 text-[#64748b]">
            {description}
          </p>
        </div>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}

function ConfirmationModal({
  title,
  description,
  confirmText,
  onCancel,
  onConfirm,
  danger,
}: {
  title: string;
  description: string;
  confirmText: string;
  onCancel: () => void;
  onConfirm: () => void;
  danger: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${
            danger
              ? "bg-red-50 text-red-600"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          <AlertTriangle size={20} />
        </div>
        <h3 id="confirmation-title" className="mt-5 text-lg font-semibold">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-gray-500">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-black/[0.1] px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
              danger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-black hover:bg-gray-800"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
