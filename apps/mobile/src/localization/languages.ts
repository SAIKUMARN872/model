export interface Language {
  code: string;
  name: string;
  nativeName: string;
  enabled: boolean;
}

export const LANGUAGES: Language[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    enabled: true,
  },
  {
    code: "te",
    name: "Telugu",
    nativeName: "తెలుగు",
    enabled: true,
  },
  {
    code: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
    enabled: true,
  },
];

export const DEFAULT_LANGUAGE = "en";

export function getLanguage(
  code: string
): Language | undefined {
  return LANGUAGES.find(
    (language) =>
      language.code === code
  );
}

export function getEnabledLanguages(): Language[] {
  return LANGUAGES.filter(
    (language) => language.enabled
  );
}

export function isLanguageSupported(
  code: string
): boolean {
  return LANGUAGES.some(
    (language) =>
      language.code === code &&
      language.enabled
  );
}