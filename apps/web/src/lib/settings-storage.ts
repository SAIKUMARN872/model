
export type Theme = "Light" | "Dark" | "System";

export type GeneralSettings = {
  theme: Theme;
  language: string;
  timezone: string;
  dateFormat: string;
};

export type SettingsData = {
  general: GeneralSettings;
  [section: string]: unknown;
};

export const SETTINGS_STORAGE_KEY = "modelnow-settings";

export const DEFAULT_GENERAL_SETTINGS: GeneralSettings = {
  theme: "System",
  language: "English",
  timezone: "Asia/Kolkata",
  dateFormat: "DD/MM/YYYY",
};

export function loadGeneralSettings(): GeneralSettings {
  if (typeof window === "undefined") {
    return DEFAULT_GENERAL_SETTINGS;
  }

  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);

    if (!raw) return DEFAULT_GENERAL_SETTINGS;

    const parsed: unknown = JSON.parse(raw);

    if (!parsed || typeof parsed !== "object") {
      return DEFAULT_GENERAL_SETTINGS;
    }

    const general = (parsed as { general?: Partial<GeneralSettings> }).general;

    return {
      ...DEFAULT_GENERAL_SETTINGS,
      ...general,
    };
  } catch {
    return DEFAULT_GENERAL_SETTINGS;
  }
}

export function saveGeneralSettings(
  general: GeneralSettings
): boolean {
  if (typeof window === "undefined") return false;

  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    let existing: Record<string, unknown> = {};

    if (raw) {
      const parsed: unknown = JSON.parse(raw);

      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        existing = parsed as Record<string, unknown>;
      }
    }

    const updated = {
      ...existing,
      general: {
        ...DEFAULT_GENERAL_SETTINGS,
        ...general,
      },
    };

    localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify(updated)
    );

    return true;
  } catch {
    return false;
  }
}

