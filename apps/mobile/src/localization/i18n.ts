export type Language =
  | "en"
  | "te"
  | "hi";

export const DEFAULT_LANGUAGE: Language =
  "en";

export const SUPPORTED_LANGUAGES: Language[] = [
  "en",
  "te",
  "hi",
];

const translations: Record<
  Language,
  Record<string, string>
> = {
  en: {
    welcome: "Welcome",
    login: "Login",
    logout: "Logout",
    dashboard: "Dashboard",
    settings: "Settings",
    chat: "Chat",
    models: "Models",
    users: "Users",
    analytics: "Analytics",
    loading: "Loading...",
    error: "Something went wrong.",
  },

  te: {
    welcome: "స్వాగతం",
    login: "లాగిన్",
    logout: "లాగౌట్",
    dashboard: "డాష్‌బోర్డ్",
    settings: "సెట్టింగ్స్",
    chat: "చాట్",
    models: "మోడల్స్",
    users: "యూజర్లు",
    analytics: "అనలిటిక్స్",
    loading: "లోడ్ అవుతోంది...",
    error: "ఏదో తప్పు జరిగింది.",
  },

  hi: {
    welcome: "स्वागत है",
    login: "लॉगिन",
    logout: "लॉगआउट",
    dashboard: "डैशबोर्ड",
    settings: "सेटिंग्स",
    chat: "चैट",
    models: "मॉडल",
    users: "उपयोगकर्ता",
    analytics: "एनालिटिक्स",
    loading: "लोड हो रहा है...",
    error: "कुछ गलत हो गया।",
  },
};

export function translate(
  key: string,
  language: Language = DEFAULT_LANGUAGE
): string {
  return (
    translations[language]?.[key] ??
    translations[DEFAULT_LANGUAGE]?.[key] ??
    key
  );
}

export function getTranslations(
  language: Language = DEFAULT_LANGUAGE
): Record<string, string> {
  return {
    ...translations[DEFAULT_LANGUAGE],
    ...translations[language],
  };
}

export function isSupportedLanguage(
  language: string
): language is Language {
  return SUPPORTED_LANGUAGES.includes(
    language as Language
  );
}

export function getSupportedLanguages(): Language[] {
  return [...SUPPORTED_LANGUAGES];
}