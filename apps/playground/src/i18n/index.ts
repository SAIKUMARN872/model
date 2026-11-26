export const translations = {
  en: {
    appName: "AI Platform",
    welcome: "Welcome",
    dashboard: "Dashboard",
    models: "Models",
    prompts: "Prompts",
    agents: "Agents",
    evaluation: "Evaluation",
    history: "History",
    settings: "Settings",
    chat: "Chat",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    loading: "Loading...",
    error: "Something went wrong.",
    noData: "No data available.",
  },

  te: {
    appName: "AI \u0C2A\u0C4D\u0C32\u0C3E\u0C1F\u0C4D\u200C\u0C2B\u0C3E\u0C30\u0C2E\u0C4D",
    welcome: "\u0C38\u0C4D\u0C35\u0C3E\u0C17\u0C24\u0C02",
    dashboard: "\u0C21\u0C4D\u0C2F\u0C3E\u0C37\u0C4D\u200C\u0C2C\u0C4B\u0C30\u0C4D\u0C21\u0C4D",
    models: "\u0C2E\u0C4B\u0C21\u0C32\u0C4D\u0C38\u0C4D",
    prompts: "\u0C2A\u0C4D\u0C30\u0C3E\u0C02\u0C2A\u0C4D\u0C1F\u0C4D\u200C\u0C32\u0C41",
    agents: "\u0C0F\u0C1C\u0C46\u0C02\u0C1F\u0C4D\u0C32\u0C41",
    evaluation: "\u0C2E\u0C42\u0C32\u0C4D\u0C2F\u0C3E\u0C02\u0C15\u0C28\u0C02",
    history: "\u0C1A\u0C30\u0C3F\u0C24\u0C4D\u0C30",
    settings: "\u0C38\u0C46\u0C1F\u0C4D\u0C1F\u0C3F\u0C02\u0C17\u0C41\u0C32\u0C41",
    chat: "\u0C1A\u0C3E\u0C1F\u0C4D",
    save: "\u0C38\u0C47\u0C35\u0C4D \u0C1A\u0C47\u0C2F\u0C3F",
    cancel: "\u0C30\u0C26\u0C4D\u0C26\u0C41 \u0C1A\u0C47\u0C2F\u0C3F",
    delete: "\u0C24\u0C4A\u0C32\u0C17\u0C3F\u0C02\u0C1A\u0C41",
    loading: "\u0C32\u0C4B\u0C21\u0C4D \u0C05\u0C35\u0C41\u0C24\u0C4B\u0C02\u0C26\u0C3F...",
    error: "\u0C0F\u0C26\u0C4B \u0C38\u0C2E\u0C38\u0C4D\u0C2F \u0C35\u0C1A\u0C4D\u0C1A\u0C3F\u0C02\u0C26\u0C3F.",
    noData: "\u0C21\u0C47\u0C1F\u0C3E \u0C05\u0C02\u0C26\u0C41\u0C2C\u0C3E\u0C1F\u0C41\u0C32\u0C4B \u0C32\u0C47\u0C26\u0C41.",
  },
} as const;

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;

let currentLanguage: Language = "en";

export function setLanguage(language: Language): void {
  currentLanguage = language;
}

export function getLanguage(): Language {
  return currentLanguage;
}

export function t(key: string): string {
  const selected = translations[currentLanguage];
  const translated = selected[key as TranslationKey];
  const fallback = translations.en[key as TranslationKey];

  return translated || fallback || key;
}

export function getTranslations() {
  return translations[currentLanguage];
}

export default {
  translations,
  setLanguage,
  getLanguage,
  t,
  getTranslations,
};