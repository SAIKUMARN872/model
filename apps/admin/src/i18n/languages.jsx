export const languages = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    direction: "ltr",
    enabled: true,
  },
  {
    code: "te",
    name: "Telugu",
    nativeName: "తెలుగు",
    direction: "ltr",
    enabled: true,
  },
  {
    code: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
    direction: "ltr",
    enabled: true,
  },
];

export const defaultLanguage = "en";

export const supportedLanguages =
  languages.filter(
    (language) => language.enabled
  );

export const languageCodes =
  supportedLanguages.map(
    (language) => language.code
  );

export function getLanguageByCode(
  code
) {
  return (
    languages.find(
      (language) =>
        language.code === code
    ) || null
  );
}

export function isLanguageSupported(
  code
) {
  return languageCodes.includes(code);
}

export function getLanguageName(
  code
) {
  const language =
    getLanguageByCode(code);

  return (
    language?.name ||
    code
  );
}

export function getNativeLanguageName(
  code
) {
  const language =
    getLanguageByCode(code);

  return (
    language?.nativeName ||
    code
  );
}

export function getLanguageDirection(
  code
) {
  const language =
    getLanguageByCode(code);

  return (
    language?.direction ||
    "ltr"
  );
}

export function getBrowserLanguage() {
  if (
    typeof navigator ===
    "undefined"
  ) {
    return defaultLanguage;
  }

  const browserLanguage =
    navigator.language
      ?.split("-")[0]
      ?.toLowerCase();

  return isLanguageSupported(
    browserLanguage
  )
    ? browserLanguage
    : defaultLanguage;
}

export function getStoredLanguage() {
  if (
    typeof window ===
    "undefined"
  ) {
    return null;
  }

  try {
    const storedLanguage =
      localStorage.getItem(
        "admin_language"
      );

    return isLanguageSupported(
      storedLanguage
    )
      ? storedLanguage
      : null;
  } catch {
    return null;
  }
}

export function getInitialLanguage() {
  return (
    getStoredLanguage() ||
    getBrowserLanguage() ||
    defaultLanguage
  );
}

export default languages;