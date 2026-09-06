import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

/**
 * Supported languages
 */
export const SUPPORTED_LANGUAGES = {
  EN: "en",
  HI: "hi",
  TE: "te",
};

/**
 * Default language
 */
export const DEFAULT_LANGUAGE = "en";

/**
 * Translation resources
 */
const translations = {
  en: {
    common: {
      appName: "AI Console",
      loading: "Loading...",
      save: "Save",
      cancel: "Cancel",
      close: "Close",
      delete: "Delete",
      edit: "Edit",
      create: "Create",
      update: "Update",
      refresh: "Refresh",
      search: "Search",
      filter: "Filter",
      clear: "Clear",
      reset: "Reset",
      submit: "Submit",
      confirm: "Confirm",
      back: "Back",
      next: "Next",
      previous: "Previous",
      actions: "Actions",
      status: "Status",
      active: "Active",
      inactive: "Inactive",
      enabled: "Enabled",
      disabled: "Disabled",
      success: "Success",
      error: "Error",
      warning: "Warning",
      noData: "No data available",
      noResults: "No results found",
      retry: "Retry",
    },

    navigation: {
      dashboard: "Dashboard",
      models: "Models",
      agents: "Agents",
      playground: "Playground",
      prompts: "Prompts",
      apiKeys: "API Keys",
      usage: "Usage",
      billing: "Billing",
      logs: "Logs",
      settings: "Settings",
    },

    dashboard: {
      title: "Dashboard",
      welcome: "Welcome to your AI Console",
      totalRequests: "Total Requests",
      totalTokens: "Total Tokens",
      totalCost: "Total Cost",
      averageLatency: "Average Latency",
      activeModels: "Active Models",
      activeUsers: "Active Users",
      recentActivity: "Recent Activity",
      systemHealth: "System Health",
    },

    models: {
      title: "Models",
      description: "Manage and monitor your AI models.",
      addModel: "Add Model",
      modelName: "Model Name",
      provider: "Provider",
      modelType: "Model Type",
      environment: "Environment",
      health: "Health",
      active: "Active",
      inactive: "Inactive",
      enable: "Enable",
      disable: "Disable",
      noModels: "No models available.",
    },

    playground: {
      title: "Playground",
      description: "Test and experiment with AI models.",
      selectModel: "Select a model",
      prompt: "Prompt",
      enterPrompt: "Enter your prompt...",
      response: "Response",
      parameters: "Parameters",
      temperature: "Temperature",
      maxTokens: "Maximum Tokens",
      send: "Send",
      stop: "Stop",
      clear: "Clear",
      reset: "Reset",
      generating: "Generating response...",
      noResponse: "No response yet.",
    },

    prompts: {
      title: "Prompts",
      description: "Manage reusable prompts.",
      createPrompt: "Create Prompt",
      promptName: "Prompt Name",
      content: "Prompt Content",
      version: "Version",
      published: "Published",
      draft: "Draft",
      noPrompts: "No prompts available.",
    },

    usage: {
      title: "Usage",
      description: "Monitor platform usage.",
      totalUsage: "Total Usage",
      totalRequests: "Total Requests",
      totalTokens: "Total Tokens",
      inputTokens: "Input Tokens",
      outputTokens: "Output Tokens",
      totalCost: "Total Cost",
      averageLatency: "Average Latency",
      successRate: "Success Rate",
      startDate: "Start Date",
      endDate: "End Date",
      model: "Model",
      provider: "Provider",
      environment: "Environment",
      noUsage: "No usage data available.",
    },

    billing: {
      title: "Billing",
      description: "Manage billing information.",
      currentPlan: "Current Plan",
      monthlyCost: "Monthly Cost",
      totalSpend: "Total Spend",
      invoices: "Invoices",
      paymentMethod: "Payment Method",
      amount: "Amount",
      dueDate: "Due Date",
      paid: "Paid",
      pending: "Pending",
      overdue: "Overdue",
    },

    logs: {
      title: "Logs",
      description: "Monitor application and system logs.",
      searchLogs: "Search logs",
      level: "Log Level",
      service: "Service",
      source: "Source",
      requestId: "Request ID",
      userId: "User ID",
      noLogs: "No logs available.",
      viewLog: "View Log",
      exportLogs: "Export Logs",
    },

    apiKeys: {
      title: "API Keys",
      description: "Manage API keys and credentials.",
      createKey: "Create API Key",
      keyName: "Key Name",
      key: "API Key",
      created: "Created",
      expires: "Expires",
      lastUsed: "Last Used",
      revoke: "Revoke",
      revoked: "Revoked",
      never: "Never",
    },

    agents: {
      title: "Agents",
      description: "Manage AI agents and workflows.",
      createAgent: "Create Agent",
      agentName: "Agent Name",
      descriptionText: "Description",
      model: "Model",
      status: "Status",
      active: "Active",
      inactive: "Inactive",
      noAgents: "No agents available.",
    },

    settings: {
      title: "Settings",
      description: "Manage your account and preferences.",
      account: "Account",
      profile: "Profile",
      security: "Security",
      notifications: "Notifications",
      appearance: "Appearance",
      language: "Language",
      theme: "Theme",
      light: "Light",
      dark: "Dark",
      system: "System",
    },

    errors: {
      generic: "Something went wrong.",
      network: "Network error. Please try again.",
      unauthorized: "You are not authorized.",
      forbidden: "You do not have permission.",
      notFound: "Resource not found.",
      server: "Server error occurred.",
      timeout: "Request timed out.",
      unknown: "An unexpected error occurred.",
    },

    messages: {
      saved: "Changes saved successfully.",
      created: "Created successfully.",
      updated: "Updated successfully.",
      deleted: "Deleted successfully.",
      copied: "Copied to clipboard.",
      operationFailed: "Operation failed.",
    },
  },

  hi: {
    common: {
      appName: "AI कंसोल",
      loading: "लोड हो रहा है...",
      save: "सहेजें",
      cancel: "रद्द करें",
      close: "बंद करें",
      delete: "हटाएं",
      edit: "संपादित करें",
      create: "बनाएं",
      update: "अपडेट करें",
      refresh: "रिफ्रेश करें",
      search: "खोजें",
      filter: "फ़िल्टर",
      clear: "साफ़ करें",
      reset: "रीसेट करें",
      submit: "जमा करें",
      confirm: "पुष्टि करें",
      back: "वापस",
      next: "अगला",
      previous: "पिछला",
      actions: "कार्रवाई",
      status: "स्थिति",
      active: "सक्रिय",
      inactive: "निष्क्रिय",
      success: "सफलता",
      error: "त्रुटि",
      warning: "चेतावनी",
      noData: "कोई डेटा उपलब्ध नहीं है",
      noResults: "कोई परिणाम नहीं मिला",
      retry: "पुनः प्रयास करें",
    },

    navigation: {
      dashboard: "डैशबोर्ड",
      models: "मॉडल",
      agents: "एजेंट",
      playground: "प्लेग्राउंड",
      prompts: "प्रॉम्प्ट",
      apiKeys: "API कुंजियां",
      usage: "उपयोग",
      billing: "बिलिंग",
      logs: "लॉग्स",
      settings: "सेटिंग्स",
    },

    dashboard: {
      title: "डैशबोर्ड",
      welcome: "आपके AI कंसोल में आपका स्वागत है",
      totalRequests: "कुल अनुरोध",
      totalTokens: "कुल टोकन",
      totalCost: "कुल लागत",
      averageLatency: "औसत विलंबता",
      activeModels: "सक्रिय मॉडल",
      activeUsers: "सक्रिय उपयोगकर्ता",
      recentActivity: "हाल की गतिविधि",
      systemHealth: "सिस्टम स्वास्थ्य",
    },

    usage: {
      title: "उपयोग",
      description: "प्लेटफ़ॉर्म उपयोग की निगरानी करें।",
      totalUsage: "कुल उपयोग",
      totalRequests: "कुल अनुरोध",
      totalTokens: "कुल टोकन",
      inputTokens: "इनपुट टोकन",
      outputTokens: "आउटपुट टोकन",
      totalCost: "कुल लागत",
      averageLatency: "औसत विलंबता",
      successRate: "सफलता दर",
      startDate: "आरंभ तिथि",
      endDate: "समाप्ति तिथि",
      model: "मॉडल",
      provider: "प्रदाता",
      environment: "पर्यावरण",
      noUsage: "कोई उपयोग डेटा उपलब्ध नहीं है।",
    },

    settings: {
      title: "सेटिंग्स",
      description: "अपने खाते और प्राथमिकताएं प्रबंधित करें।",
      account: "खाता",
      profile: "प्रोफ़ाइल",
      security: "सुरक्षा",
      notifications: "सूचनाएं",
      appearance: "दिखावट",
      language: "भाषा",
      theme: "थीम",
      light: "लाइट",
      dark: "डार्क",
      system: "सिस्टम",
    },
  },

  te: {
    common: {
      appName: "AI కన్సోల్",
      loading: "లోడ్ అవుతోంది...",
      save: "సేవ్ చేయండి",
      cancel: "రద్దు చేయండి",
      close: "మూసివేయండి",
      delete: "తొలగించండి",
      edit: "ఎడిట్ చేయండి",
      create: "సృష్టించండి",
      update: "అప్‌డేట్ చేయండి",
      refresh: "రిఫ్రెష్ చేయండి",
      search: "వెతకండి",
      filter: "ఫిల్టర్",
      clear: "క్లియర్ చేయండి",
      reset: "రీసెట్ చేయండి",
      submit: "సమర్పించండి",
      confirm: "నిర్ధారించండి",
      back: "వెనక్కి",
      next: "తదుపరి",
      previous: "మునుపటి",
      actions: "చర్యలు",
      status: "స్థితి",
      active: "యాక్టివ్",
      inactive: "ఇన్యాక్టివ్",
      success: "విజయం",
      error: "లోపం",
      warning: "హెచ్చరిక",
      noData: "డేటా అందుబాటులో లేదు",
      noResults: "ఫలితాలు కనుగొనబడలేదు",
      retry: "మళ్లీ ప్రయత్నించండి",
    },

    navigation: {
      dashboard: "డాష్‌బోర్డ్",
      models: "మోడల్స్",
      agents: "ఏజెంట్స్",
      playground: "ప్లేగ్రౌండ్",
      prompts: "ప్రాంప్ట్స్",
      apiKeys: "API కీలు",
      usage: "వినియోగం",
      billing: "బిల్లింగ్",
      logs: "లాగ్స్",
      settings: "సెట్టింగ్స్",
    },

    dashboard: {
      title: "డాష్‌బోర్డ్",
      welcome: "మీ AI కన్సోల్‌కు స్వాగతం",
      totalRequests: "మొత్తం రిక్వెస్టులు",
      totalTokens: "మొత్తం టోకెన్లు",
      totalCost: "మొత్తం ఖర్చు",
      averageLatency: "సగటు లేటెన్సీ",
      activeModels: "యాక్టివ్ మోడల్స్",
      activeUsers: "యాక్టివ్ యూజర్లు",
      recentActivity: "ఇటీవలి కార్యకలాపాలు",
      systemHealth: "సిస్టమ్ ఆరోగ్యం",
    },

    usage: {
      title: "వినియోగం",
      description: "ప్లాట్‌ఫారమ్ వినియోగాన్ని పర్యవేక్షించండి.",
      totalUsage: "మొత్తం వినియోగం",
      totalRequests: "మొత్తం రిక్వెస్టులు",
      totalTokens: "మొత్తం టోకెన్లు",
      inputTokens: "ఇన్‌పుట్ టోకెన్లు",
      outputTokens: "అవుట్‌పుట్ టోకెన్లు",
      totalCost: "మొత్తం ఖర్చు",
      averageLatency: "సగటు లేటెన్సీ",
      successRate: "విజయ శాతం",
      startDate: "ప్రారంభ తేదీ",
      endDate: "ముగింపు తేదీ",
      model: "మోడల్",
      provider: "ప్రొవైడర్",
      environment: "ఎన్విరాన్‌మెంట్",
      noUsage: "వినియోగ డేటా అందుబాటులో లేదు.",
    },

    settings: {
      title: "సెట్టింగ్స్",
      description: "మీ ఖాతా మరియు ప్రాధాన్యతలను నిర్వహించండి.",
      account: "ఖాతా",
      profile: "ప్రొఫైల్",
      security: "సెక్యూరిటీ",
      notifications: "నోటిఫికేషన్స్",
      appearance: "అపీరియన్స్",
      language: "భాష",
      theme: "థీమ్",
      light: "లైట్",
      dark: "డార్క్",
      system: "సిస్టమ్",
    },
  },
};

/**
 * Get nested translation.
 */
export const getTranslation = (
  language,
  key
) => {
  const languageData =
    translations[language] ||
    translations[DEFAULT_LANGUAGE];

  const result = key
    .split(".")
    .reduce(
      (current, part) =>
        current &&
        current[part],
      languageData
    );

  if (
    result !== undefined &&
    result !== null
  ) {
    return result;
  }

  const fallback = key
    .split(".")
    .reduce(
      (current, part) =>
        current &&
        current[part],
      translations[DEFAULT_LANGUAGE]
    );

  return fallback || key;
};

/**
 * Detect browser language.
 */
export const detectLanguage = () => {
  if (
    typeof window === "undefined"
  ) {
    return DEFAULT_LANGUAGE;
  }

  const browserLanguage =
    navigator.language || "en";

  const language =
    browserLanguage
      .split("-")[0]
      .toLowerCase();

  if (
    translations[language]
  ) {
    return language;
  }

  return DEFAULT_LANGUAGE;
};

/**
 * I18n Context.
 */
const I18nContext =
  createContext(null);

/**
 * I18n Provider.
 */
export const I18nProvider = ({
  children,
  initialLanguage = DEFAULT_LANGUAGE,
}) => {
  const [
    language,
    setLanguageState,
  ] = useState(
    initialLanguage
  );

  /**
   * Change language.
   */
  const setLanguage =
    useCallback(
      (newLanguage) => {
        if (
          !translations[newLanguage]
        ) {
          console.warn(
            `Unsupported language: ${newLanguage}`
          );

          return;
        }

        setLanguageState(
          newLanguage
        );

        if (
          typeof window !==
          "undefined"
        ) {
          try {
            localStorage.setItem(
              "console-language",
              newLanguage
            );
          } catch (error) {
            console.warn(
              "Unable to save language preference.",
              error
            );
          }
        }
      },
      []
    );

  /**
   * Translation function.
   */
  const t =
    useCallback(
      (key) => {
        return getTranslation(
          language,
          key
        );
      },
      [language]
    );

  /**
   * Context value.
   */
  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      supportedLanguages:
        Object.values(
          SUPPORTED_LANGUAGES
        ),
    }),
    [
      language,
      setLanguage,
      t,
    ]
  );

  return (
    <I18nContext.Provider
      value={value}
    >
      {children}
    </I18nContext.Provider>
  );
};

/**
 * useI18n hook.
 */
export const useI18n = () => {
  const context =
    useContext(I18nContext);

  if (!context) {
    throw new Error(
      "useI18n must be used inside I18nProvider"
    );
  }

  return context;
};

/**
 * useTranslation hook.
 */
export const useTranslation =
  () => {
    return useI18n();
  };

/**
 * Export translations.
 */
export {
  translations,
};

export default I18nProvider;