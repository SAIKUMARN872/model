import React, {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

import {
  languages,
  defaultLanguage,
} from "./languages";

const I18nContext = createContext(null);

const translations = {
  en: {
    common: {
      dashboard: "Dashboard",
      users: "Users",
      organizations: "Organizations",
      settings: "Settings",
      security: "Security",
      governance: "Governance",
      compliance: "Compliance",
      billing: "Billing",
      auditLogs: "Audit Logs",
      analytics: "Analytics",
      notifications: "Notifications",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      create: "Create",
      search: "Search",
      loading: "Loading...",
      noData: "No data available",
      success: "Success",
      error: "Error",
      close: "Close",
      confirm: "Confirm",
    },

    dashboard: {
      title: "Dashboard",
      welcome:
        "Welcome back. Here's an overview of your platform.",
      totalUsers: "Total Users",
      activeOrganizations:
        "Active Organizations",
      apiRequests: "API Requests",
      totalCost: "Total Cost",
      recentActivity: "Recent Activity",
      systemHealth: "System Health",
      aiModelUsage: "AI Model Usage",
    },

    settings: {
      title: "Settings",
      language: "Language",
      theme: "Theme",
      notifications: "Notifications",
      account: "Account",
      preferences: "Preferences",
    },
  },

  te: {
    common: {
      dashboard: "డ్యాష్‌బోర్డ్",
      users: "వినియోగదారులు",
      organizations: "సంస్థలు",
      settings: "సెట్టింగ్స్",
      security: "భద్రత",
      governance: "పాలన",
      compliance: "అనుసరణ",
      billing: "బిల్లింగ్",
      auditLogs: "ఆడిట్ లాగ్స్",
      analytics: "విశ్లేషణలు",
      notifications: "నోటిఫికేషన్లు",
      save: "సేవ్ చేయండి",
      cancel: "రద్దు చేయండి",
      delete: "తొలగించండి",
      edit: "సవరించండి",
      create: "సృష్టించండి",
      search: "వెతకండి",
      loading: "లోడ్ అవుతోంది...",
      noData: "డేటా అందుబాటులో లేదు",
      success: "విజయం",
      error: "లోపం",
      close: "మూసివేయండి",
      confirm: "నిర్ధారించండి",
    },

    dashboard: {
      title: "డ్యాష్‌బోర్డ్",
      welcome:
        "తిరిగి స్వాగతం. మీ ప్లాట్‌ఫారమ్ యొక్క అవలోకనం ఇక్కడ ఉంది.",
      totalUsers: "మొత్తం వినియోగదారులు",
      activeOrganizations:
        "క్రియాశీల సంస్థలు",
      apiRequests: "API అభ్యర్థనలు",
      totalCost: "మొత్తం ఖర్చు",
      recentActivity: "ఇటీవలి కార్యకలాపాలు",
      systemHealth: "సిస్టమ్ ఆరోగ్యం",
      aiModelUsage:
        "AI మోడల్ వినియోగం",
    },

    settings: {
      title: "సెట్టింగ్స్",
      language: "భాష",
      theme: "థీమ్",
      notifications: "నోటిఫికేషన్లు",
      account: "ఖాతా",
      preferences: "ప్రాధాన్యతలు",
    },
  },

  hi: {
    common: {
      dashboard: "डैशबोर्ड",
      users: "उपयोगकर्ता",
      organizations: "संगठन",
      settings: "सेटिंग्स",
      security: "सुरक्षा",
      governance: "शासन",
      compliance: "अनुपालन",
      billing: "बिलिंग",
      auditLogs: "ऑडिट लॉग्स",
      analytics: "विश्लेषण",
      notifications: "सूचनाएं",
      save: "सहेजें",
      cancel: "रद्द करें",
      delete: "हटाएं",
      edit: "संपादित करें",
      create: "बनाएं",
      search: "खोजें",
      loading: "लोड हो रहा है...",
      noData: "कोई डेटा उपलब्ध नहीं है",
      success: "सफलता",
      error: "त्रुटि",
      close: "बंद करें",
      confirm: "पुष्टि करें",
    },

    dashboard: {
      title: "डैशबोर्ड",
      welcome:
        "वापसी पर स्वागत है। यहां आपके प्लेटफ़ॉर्म का अवलोकन है।",
      totalUsers: "कुल उपयोगकर्ता",
      activeOrganizations:
        "सक्रिय संगठन",
      apiRequests: "API अनुरोध",
      totalCost: "कुल लागत",
      recentActivity:
        "हाल की गतिविधि",
      systemHealth:
        "सिस्टम स्वास्थ्य",
      aiModelUsage:
        "AI मॉडल उपयोग",
    },

    settings: {
      title: "सेटिंग्स",
      language: "भाषा",
      theme: "थीम",
      notifications: "सूचनाएं",
      account: "खाता",
      preferences: "प्राथमिकताएं",
    },
  },
};

function getNestedValue(
  object,
  path
) {
  return path
    .split(".")
    .reduce(
      (current, key) =>
        current?.[key],
      object
    );
}

function interpolate(
  text,
  variables = {}
) {
  if (
    typeof text !== "string"
  ) {
    return text;
  }

  return text.replace(
    /\{\{(.*?)\}\}/g,
    (_, key) =>
      variables[
        key.trim()
      ] ?? `{{${key}}}`
  );
}

export function I18nProvider({
  children,
}) {
  const [locale, setLocaleState] =
    useState(() => {
      try {
        const savedLanguage =
          localStorage.getItem(
            "admin_language"
          );

        return (
          savedLanguage ||
          defaultLanguage ||
          "en"
        );
      } catch {
        return (
          defaultLanguage ||
          "en"
        );
      }
    });

  const setLocale = (newLocale) => {
    const supportedLanguage =
      languages?.some(
        (language) =>
          language.code ===
          newLocale
      );

    if (
      !supportedLanguage &&
      !translations[newLocale]
    ) {
      console.warn(
        `Unsupported language: ${newLocale}`
      );

      return;
    }

    setLocaleState(newLocale);

    try {
      localStorage.setItem(
        "admin_language",
        newLocale
      );
    } catch (error) {
      console.warn(
        "Unable to save language preference:",
        error
      );
    }

    document.documentElement.lang =
      newLocale;
  };

  const t = (
    key,
    variables = {}
  ) => {
    const currentTranslations =
      translations[locale] ||
      translations.en;

    const englishTranslations =
      translations.en;

    const value =
      getNestedValue(
        currentTranslations,
        key
      ) ??
      getNestedValue(
        englishTranslations,
        key
      ) ??
      key;

    return interpolate(
      value,
      variables
    );
  };

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      languages:
        languages || [],
    }),
    [locale]
  );

  return (
    <I18nContext.Provider
      value={value}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context =
    useContext(I18nContext);

  if (!context) {
    throw new Error(
      "useI18n must be used inside I18nProvider"
    );
  }

  return context;
}

export function useTranslation() {
  return useI18n();
}

export function translate(
  key,
  locale = defaultLanguage ||
    "en",
  variables = {}
) {
  const currentTranslations =
    translations[locale] ||
    translations.en;

  const englishTranslations =
    translations.en;

  const value =
    getNestedValue(
      currentTranslations,
      key
    ) ??
    getNestedValue(
      englishTranslations,
      key
    ) ??
    key;

  return interpolate(
    value,
    variables
  );
}

export function LanguageSelector({
  className = "",
}) {
  const {
    locale,
    setLocale,
    languages: availableLanguages,
  } = useI18n();

  return (
    <select
      className={className}
      value={locale}
      onChange={(event) =>
        setLocale(
          event.target.value
        )
      }
      aria-label="Select language"
    >
      {availableLanguages.map(
        (language) => (
          <option
            key={language.code}
            value={
              language.code
            }
          >
            {language.name}
          </option>
        )
      )}
    </select>
  );
}

export {
  I18nContext,
  translations,
};

export default I18nProvider;