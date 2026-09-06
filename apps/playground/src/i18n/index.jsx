"use client";

const translations = {
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
    appName: "AI ప్లాట్‌ఫారమ్",
    welcome: "స్వాగతం",
    dashboard: "డ్యాష్‌బోర్డ్",
    models: "మోడల్స్",
    prompts: "ప్రాంప్ట్స్",
    agents: "ఏజెంట్స్",
    evaluation: "ఎవాల్యుయేషన్",
    history: "హిస్టరీ",
    settings: "సెట్టింగ్స్",
    chat: "చాట్",
    save: "సేవ్",
    cancel: "క్యాన్సల్",
    delete: "డిలీట్",
    loading: "లోడ్ అవుతోంది...",
    error: "ఏదో సమస్య వచ్చింది.",
    noData: "డేటా అందుబాటులో లేదు.",
  },
};

let currentLanguage = "en";

export function setLanguage(language) {
  if (translations[language]) {
    currentLanguage = language;
  }
}

export function getLanguage() {
  return currentLanguage;
}

export function t(key) {
  return (
    translations[currentLanguage]?.[key] ||
    translations.en[key] ||
    key
  );
}

export function getTranslations() {
  return translations[
    currentLanguage
  ];
}

export default {
  translations,
  setLanguage,
  getLanguage,
  t,
  getTranslations,
};