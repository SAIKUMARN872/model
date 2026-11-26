const messages = Object.freeze({
  en: Object.freeze({
    "app.name": "ModelNow",
    "common.loading": "Loading…",
    "common.retry": "Retry",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.signInRequired": "Sign-in is required to continue.",
    "common.permissionDenied": "You do not have permission to perform this action.",
    "common.unavailable": "This feature is currently unavailable.",
    "auth.notConfigured": "Authentication is not configured for this console.",
    "auth.sessionUnavailable": "The authenticated session could not be verified."
  })
});

export const DEFAULT_LOCALE = "en";
export const SUPPORTED_LOCALES = Object.freeze(Object.keys(messages));

export function normalizeLocale(locale) {
  if (typeof locale !== "string") return DEFAULT_LOCALE;
  const normalized = locale.trim().toLowerCase().split(/[-_]/)[0];
  return Object.hasOwn(messages, normalized) ? normalized : DEFAULT_LOCALE;
}

export function translate(key, values = {}, locale = DEFAULT_LOCALE) {
  const selected = normalizeLocale(locale);
  const template = messages[selected][key] ?? messages.en[key] ?? key;

  if (!values || typeof values !== "object" || Array.isArray(values)) {
    return template;
  }

  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, name) =>
    Object.hasOwn(values, name) ? String(values[name]) : match
  );
}

export const i18n = Object.freeze({ t: translate, normalizeLocale });
export default i18n;
