"use client";

import { useEffect, useState } from "react";
import {
  Languages,
  Globe,
  Clock3,
  CalendarDays,
  DollarSign,
  Check,
  RefreshCw,
  Search,
  Save,
  ChevronDown,
  CheckCircle2,
  CircleAlert,
  MapPin,
  Monitor,
  Users,
  ArrowRight,
  X,
} from "lucide-react";

type Locale = {
  code: string;
  name: string;
  nativeName: string;
  region: string;
  direction: "LTR" | "RTL";
  enabled: boolean;
  defaultLocale: boolean;
};

const INITIAL_LOCALES: Locale[] = [
  { code: "en-US", name: "English (United States)", nativeName: "English", region: "United States", direction: "LTR", enabled: true, defaultLocale: true },
  { code: "en-GB", name: "English (United Kingdom)", nativeName: "English", region: "United Kingdom", direction: "LTR", enabled: true, defaultLocale: false },
  { code: "en-IN", name: "English (India)", nativeName: "English", region: "India", direction: "LTR", enabled: true, defaultLocale: false },
  { code: "te-IN", name: "Telugu", nativeName: "తెలుగు", region: "India", direction: "LTR", enabled: true, defaultLocale: false },
  { code: "hi-IN", name: "Hindi", nativeName: "हिन्दी", region: "India", direction: "LTR", enabled: true, defaultLocale: false },
  { code: "es-ES", name: "Spanish", nativeName: "Español", region: "Spain", direction: "LTR", enabled: false, defaultLocale: false },
  { code: "fr-FR", name: "French", nativeName: "Français", region: "France", direction: "LTR", enabled: false, defaultLocale: false },
  { code: "de-DE", name: "German", nativeName: "Deutsch", region: "Germany", direction: "LTR", enabled: false, defaultLocale: false },
  { code: "ja-JP", name: "Japanese", nativeName: "日本語", region: "Japan", direction: "LTR", enabled: false, defaultLocale: false },
  { code: "ar-SA", name: "Arabic", nativeName: "العربية", region: "Saudi Arabia", direction: "RTL", enabled: false, defaultLocale: false },
  { code: "pt-BR", name: "Portuguese", nativeName: "Português", region: "Brazil", direction: "LTR", enabled: false, defaultLocale: false },
  { code: "zh-CN", name: "Chinese (Simplified)", nativeName: "简体中文", region: "China", direction: "LTR", enabled: false, defaultLocale: false },
];

const TABS = [
  "Overview",
  "Languages",
  "Regional Formats",
  "Time & Calendar",
  "Translation Management",
] as const;

type Tab = (typeof TABS)[number];

const INITIAL_SETTINGS = {
  defaultLocale: "en-US",
  fallbackLocale: "en-US",
  defaultTimezone: "Asia/Kolkata",
  dateFormat: "DD MMM YYYY",
  timeFormat: "12-hour",
  firstDayOfWeek: "Monday",
  numberFormat: "en-US",
  currency: "INR",
  currencyDisplay: "symbol",
  measurementSystem: "metric",
  automaticTimezone: true,
  automaticLanguage: false,
  showLanguageSelector: true,
  useBrowserLocale: true,
  enableTranslations: true,
  notifyMissingTranslations: true,
  allowUserOverride: true,
};

const TIMEZONES = [
  "Asia/Kolkata",
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Dubai",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
];

const CURRENCIES = [
  { code: "INR", label: "Indian Rupee (₹)" },
  { code: "USD", label: "US Dollar ($)" },
  { code: "EUR", label: "Euro (€)" },
  { code: "GBP", label: "British Pound (£)" },
  { code: "JPY", label: "Japanese Yen (¥)" },
  { code: "AED", label: "UAE Dirham (د.إ)" },
  { code: "SGD", label: "Singapore Dollar (S$)" },
];

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      className={`loc-toggle ${checked ? "on" : ""}`}
      onClick={() => onChange(!checked)}
      aria-label={label}
      aria-pressed={checked}
    >
      <span />
    </button>
  );
}

function Field({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="loc-field">
      <label>{label}</label>
      {children}
      {description && <p className="loc-help">{description}</p>}
    </div>
  );
}

export default function LocalizationSettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [locales, setLocales] = useState<Locale[]>(INITIAL_LOCALES);
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [search, setSearch] = useState("");
  const [languageFilter, setLanguageFilter] = useState("All languages");
  const [notice, setNotice] = useState("");
  const [saved, setSaved] = useState(false);
  const [translationSearch, setTranslationSearch] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("modelnow-admin-localization-v1");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.settings) setSettings({ ...INITIAL_SETTINGS, ...parsed.settings });
        if (Array.isArray(parsed.locales)) setLocales(parsed.locales);
      }
    } catch {
      // Ignore invalid local demo data.
    }
  }, []);

  const enabledLocales = locales.filter((locale) => locale.enabled);
  const rtlLocales = enabledLocales.filter((locale) => locale.direction === "RTL");

  const filteredLocales = locales.filter((locale) => {
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      locale.name.toLowerCase().includes(query) ||
      locale.nativeName.toLowerCase().includes(query) ||
      locale.code.toLowerCase().includes(query) ||
      locale.region.toLowerCase().includes(query);

    const matchesFilter =
      languageFilter === "All languages" ||
      (languageFilter === "Enabled" && locale.enabled) ||
      (languageFilter === "Disabled" && !locale.enabled) ||
      (languageFilter === "RTL" && locale.direction === "RTL");

    return matchesSearch && matchesFilter;
  });

  function updateSetting<K extends keyof typeof INITIAL_SETTINGS>(
    key: K,
    value: (typeof INITIAL_SETTINGS)[K],
  ) {
    setSettings((previous) => ({ ...previous, [key]: value }));
    setSaved(false);
  }

  function toggleLocale(code: string) {
    const locale = locales.find((item) => item.code === code);
    if (!locale) return;

    if (locale.defaultLocale && locale.enabled) {
      setNotice("Choose another default language before disabling this locale.");
      return;
    }

    setLocales((previous) =>
      previous.map((item) =>
        item.code === code ? { ...item, enabled: !item.enabled } : item,
      ),
    );
    setSaved(false);
  }

  function makeDefaultLocale(code: string) {
    const selected = locales.find((item) => item.code === code);
    if (!selected?.enabled) {
      setNotice("Enable this language before setting it as the default.");
      return;
    }

    setLocales((previous) =>
      previous.map((item) => ({
        ...item,
        defaultLocale: item.code === code,
      })),
    );
    setSettings((previous) => ({ ...previous, defaultLocale: code }));
    setSaved(false);
    setNotice(`${selected.name} selected as the default locale.`);
  }

  function saveSettings() {
    if (!enabledLocales.some((locale) => locale.code === settings.defaultLocale)) {
      setNotice("The default locale must be enabled.");
      return;
    }

    try {
      localStorage.setItem(
        "modelnow-admin-localization-v1",
        JSON.stringify({ settings, locales }),
      );
      setSaved(true);
      setNotice("Localization settings saved in this browser.");
    } catch {
      setNotice("Could not save settings to browser storage.");
    }
  }

  function resetSettings() {
    setSettings(INITIAL_SETTINGS);
    setLocales(INITIAL_LOCALES);
    try {
      localStorage.removeItem("modelnow-admin-localization-v1");
    } catch {
      // Ignore unavailable browser storage.
    }
    setSaved(false);
    setNotice("Localization settings reset to demo defaults.");
  }

  const translationItems = [
    { key: "dashboard.title", english: "Dashboard", te: "డాష్‌బోర్డ్", hi: "डैशबोर्ड", status: "Translated" },
    { key: "navigation.settings", english: "Settings", te: "సెట్టింగ్‌లు", hi: "सेटिंग्स", status: "Translated" },
    { key: "chat.new", english: "New chat", te: "కొత్త చాట్", hi: "नई चैट", status: "Translated" },
    { key: "chat.send", english: "Send message", te: "సందేశం పంపండి", hi: "संदेश भेजें", status: "Translated" },
    { key: "files.upload", english: "Upload file", te: "ఫైల్ అప్‌లోడ్ చేయండి", hi: "फ़ाइल अपलोड करें", status: "Translated" },
    { key: "billing.usage", english: "Usage and billing", te: "", hi: "", status: "Missing" },
    { key: "errors.generic", english: "Something went wrong", te: "", hi: "", status: "Missing" },
    { key: "account.signout", english: "Sign out", te: "సైన్ అవుట్", hi: "साइन आउट", status: "Translated" },
  ];

  const filteredTranslations = translationItems.filter((item) => {
    const query = translationSearch.trim().toLowerCase();
    return (
      !query ||
      item.key.toLowerCase().includes(query) ||
      item.english.toLowerCase().includes(query)
    );
  });

  const translatedCount = translationItems.filter((item) => item.status === "Translated").length;
  const translationCoverage = Math.round((translatedCount / translationItems.length) * 100);

  const exampleDate = new Date("2026-11-04T15:30:00+05:30");
  let formattedDate = "";
  let formattedTime = "";
  let formattedNumber = "";
  let formattedCurrency = "";

  try {
    const locale = settings.defaultLocale;
    formattedDate = new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: settings.defaultTimezone,
    }).format(exampleDate);

    formattedTime = new Intl.DateTimeFormat(locale, {
      hour: "numeric",
      minute: "2-digit",
      hour12: settings.timeFormat === "12-hour",
      timeZone: settings.defaultTimezone,
    }).format(exampleDate);

    formattedNumber = new Intl.NumberFormat(settings.numberFormat).format(1234567.89);
    formattedCurrency = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: settings.currency,
      currencyDisplay: settings.currencyDisplay === "code" ? "code" : "symbol",
      maximumFractionDigits: 2,
    }).format(12345.67);
  } catch {
    formattedDate = "04 Nov 2026";
    formattedTime = "3:30 PM";
    formattedNumber = "1,234,567.89";
    formattedCurrency = "₹12,345.67";
  }

  return (
    <main className="localization-page">
      <style>{`
        .localization-page {
          --loc-bg:#f7f8fc;--loc-card:#fff;--loc-text:#182235;--loc-muted:#778195;
          --loc-border:#e5e9f1;--loc-blue:#315bea;--loc-blue-soft:#edf2ff;
          min-height:100vh;padding:30px;background:var(--loc-bg);color:var(--loc-text);
          font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
        }
        .localization-page *{box-sizing:border-box}
        .loc-shell{max-width:1480px;margin:0 auto}
        .loc-breadcrumb{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--loc-muted);margin-bottom:20px}
        .loc-breadcrumb strong{color:#354056}
        .loc-header{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap;margin-bottom:24px}
        .loc-heading{display:flex;align-items:flex-start;gap:14px}
        .loc-heading-icon{width:47px;height:47px;display:grid;place-items:center;border-radius:14px;background:#eaf0ff;color:var(--loc-blue)}
        .loc-title{font-size:27px;letter-spacing:-.8px;font-weight:760;margin:0 0 7px}
        .loc-subtitle{font-size:13px;line-height:1.65;color:var(--loc-muted);margin:0;max-width:700px}
        .loc-actions{display:flex;align-items:center;gap:9px;flex-wrap:wrap}
        .loc-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:1px solid var(--loc-border);background:#fff;color:#39445a;border-radius:9px;padding:10px 13px;font-size:12px;font-weight:650;cursor:pointer;transition:.15s}
        .loc-btn:hover{background:#f8faff;border-color:#bdcafa}
        .loc-btn.primary{background:var(--loc-blue);color:#fff;border-color:var(--loc-blue)}
        .loc-btn.primary:hover{background:#244bd1}
        .loc-notice{display:flex;align-items:flex-start;gap:9px;padding:12px 14px;border:1px solid #cbd9ff;background:#f0f4ff;color:#2847a3;border-radius:10px;font-size:12px;margin-bottom:18px}
        .loc-notice button{margin-left:auto;border:0;background:transparent;color:inherit;cursor:pointer}
        .loc-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:20px}
        .loc-stat{background:#fff;border:1px solid var(--loc-border);border-radius:13px;padding:17px 18px;min-width:0}
        .loc-stat-top{display:flex;justify-content:space-between;align-items:center;gap:10px;font-size:12px;color:var(--loc-muted)}
        .loc-stat-icon{width:34px;height:34px;display:grid;place-items:center;border-radius:10px;background:#f0f3f9;color:#59677f}
        .loc-stat-value{font-size:27px;font-weight:760;letter-spacing:-.6px;margin-top:13px}
        .loc-stat-note{font-size:11px;color:var(--loc-muted);margin-top:5px}
        .loc-card{background:#fff;border:1px solid var(--loc-border);border-radius:14px;overflow:hidden;margin-bottom:18px}
        .loc-card-head{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;padding:17px 19px;border-bottom:1px solid var(--loc-border)}
        .loc-card-title{font-size:14px;font-weight:730;margin:0 0 5px}
        .loc-card-subtitle{font-size:11px;line-height:1.5;color:var(--loc-muted);margin:0}
        .loc-tabs{display:flex;gap:5px;padding:6px;border:1px solid var(--loc-border);border-radius:11px;background:#fff;margin-bottom:18px;overflow-x:auto}
        .loc-tab{white-space:nowrap;border:0;background:transparent;border-radius:8px;padding:10px 14px;font-size:12px;font-weight:650;color:#68748a;cursor:pointer}
        .loc-tab.active{background:var(--loc-blue-soft);color:var(--loc-blue)}
        .loc-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
        .loc-field{display:flex;flex-direction:column;gap:7px;min-width:0}
        .loc-field label{font-size:11px;font-weight:700;color:#48536a}
        .loc-field input,.loc-field select{width:100%;border:1px solid #dfe4ed;border-radius:8px;padding:11px 12px;font-size:12px;outline:none;background:#fff;color:#273248}
        .loc-field input:focus,.loc-field select:focus{border-color:#8ea5fb;box-shadow:0 0 0 3px #315bea12}
        .loc-help{font-size:10px;line-height:1.5;color:var(--loc-muted);margin:0}
        .loc-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:15px;padding:19px}
        .loc-setting-row{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px 19px;border-bottom:1px solid #eef0f5}
        .loc-setting-row:last-child{border-bottom:0}
        .loc-setting-title{font-size:12px;font-weight:700;margin-bottom:5px}
        .loc-setting-description{font-size:11px;line-height:1.55;color:var(--loc-muted);max-width:620px}
        .loc-toggle{width:39px;height:22px;border:0;border-radius:20px;background:#cbd1dd;padding:3px;cursor:pointer;flex-shrink:0;transition:.15s}
        .loc-toggle span{display:block;width:16px;height:16px;border-radius:50%;background:#fff;box-shadow:0 1px 3px #0002;transition:transform .15s}
        .loc-toggle.on{background:var(--loc-blue)}
        .loc-toggle.on span{transform:translateX(17px)}
        .loc-search{display:flex;align-items:center;gap:8px;border:1px solid var(--loc-border);border-radius:8px;background:#fff;padding:0 10px;min-width:220px;max-width:350px;flex:1}
        .loc-search input{width:100%;border:0;outline:none;padding:10px 0;font-size:12px;background:transparent;color:var(--loc-text)}
        .loc-select{border:1px solid var(--loc-border);border-radius:8px;padding:10px 30px 10px 11px;font-size:12px;color:#465168;background:#fff;outline:none;max-width:100%}
        .loc-filter-row{display:flex;align-items:center;gap:9px;flex-wrap:wrap;padding:15px 17px;border-bottom:1px solid var(--loc-border)}
        .loc-table-wrap{width:100%;overflow-x:auto}
        .loc-table{width:100%;border-collapse:collapse;text-align:left;min-width:720px}
        .loc-table th{font-size:10px;letter-spacing:.45px;text-transform:uppercase;color:#8490a3;font-weight:750;background:#fafbfe;padding:12px 16px;border-bottom:1px solid var(--loc-border);white-space:nowrap}
        .loc-table td{font-size:12px;padding:14px 16px;border-bottom:1px solid #eef0f5;color:#39445a;vertical-align:middle}
        .loc-table tbody tr:hover{background:#fbfcff}
        .loc-table tr:last-child td{border-bottom:0}
        .loc-language-cell{display:flex;align-items:center;gap:11px}
        .loc-language-code{width:39px;height:36px;border-radius:9px;background:#eff3ff;color:#365bd0;display:grid;place-items:center;font-size:10px;font-weight:800;flex-shrink:0}
        .loc-language-name{font-size:12px;font-weight:700;color:#263249}
        .loc-language-native{font-size:11px;color:var(--loc-muted);margin-top:3px}
        .loc-pill{display:inline-flex;align-items:center;gap:5px;padding:5px 8px;border-radius:20px;font-size:10px;font-weight:700;white-space:nowrap}
        .loc-pill.success{background:#e9f8ef;color:#17834c}
        .loc-pill.warning{background:#fff4df;color:#a96b08}
        .loc-pill.neutral{background:#eff1f5;color:#68748a}
        .loc-pill.blue{background:#edf2ff;color:#315bea}
        .loc-preview{padding:20px}
        .loc-preview-box{border:1px solid var(--loc-border);border-radius:12px;padding:17px;background:#fbfcff}
        .loc-preview-label{font-size:10px;color:var(--loc-muted);text-transform:uppercase;letter-spacing:.5px;font-weight:750;margin-bottom:10px}
        .loc-preview-value{font-size:17px;font-weight:750;overflow-wrap:anywhere}
        .loc-preview-sub{font-size:11px;color:var(--loc-muted);margin-top:6px}
        .loc-bar{height:7px;border-radius:20px;background:#edf0f5;overflow:hidden}
        .loc-bar-fill{height:100%;background:var(--loc-blue);border-radius:20px}
        .loc-coverage{padding:20px}
        .loc-coverage-top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}
        .loc-coverage-number{font-size:24px;font-weight:760}
        .loc-coverage-caption{font-size:11px;color:var(--loc-muted)}
        .loc-empty{padding:38px 16px;text-align:center;color:var(--loc-muted);font-size:12px}
        .loc-empty-icon{width:44px;height:44px;border-radius:12px;display:grid;place-items:center;background:#f1f4fa;margin:0 auto 12px}
        .loc-note{display:flex;align-items:flex-start;gap:9px;padding:12px 14px;border:1px solid #f0dfb9;background:#fff9eb;color:#875b13;border-radius:10px;font-size:11px;line-height:1.55;margin:17px 19px}
        .loc-modal-backdrop{position:fixed;inset:0;background:#10182870;z-index:50;display:flex;align-items:center;justify-content:center;padding:18px}
        .loc-modal{width:100%;max-width:500px;background:white;border-radius:16px;box-shadow:0 24px 80px #10182830;overflow:hidden}
        .loc-modal-head{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;padding:20px;border-bottom:1px solid var(--loc-border)}
        .loc-modal-title{font-size:17px;font-weight:760;margin:0 0 6px}
        .loc-modal-subtitle{font-size:11px;color:var(--loc-muted);line-height:1.5;margin:0}
        .loc-modal-body{padding:20px}
        .loc-modal-footer{display:flex;justify-content:flex-end;gap:9px;padding:15px 20px;border-top:1px solid var(--loc-border)}
        .loc-close{width:30px;height:30px;border:0;border-radius:8px;background:#f3f5f9;display:grid;place-items:center;cursor:pointer;color:#657087}
        .loc-translation-status{display:inline-flex;padding:5px 8px;border-radius:20px;font-size:10px;font-weight:700}
        .loc-translation-status.done{background:#e9f8ef;color:#17834c}
        .loc-translation-status.missing{background:#fff4df;color:#a96b08}
        @media(max-width:1000px){.loc-stats{grid-template-columns:repeat(2,minmax(0,1fr))}}
        @media(max-width:700px){.localization-page{padding:17px}.loc-title{font-size:23px}.loc-grid,.loc-form-grid{grid-template-columns:1fr}.loc-tabs{margin-right:-2px}.loc-tab{padding:10px}.loc-search{min-width:100%;max-width:none}.loc-filter-row .loc-select{flex:1}.loc-header .loc-actions{width:100%}.loc-header .loc-actions .loc-btn{flex:1}.loc-stat-value{font-size:24px}}
      `}</style>

      <div className="loc-shell">
        <div className="loc-breadcrumb">
          <span>Admin</span><span>/</span><span>Settings</span><span>/</span>
          <strong>Localization Settings</strong>
        </div>

        <header className="loc-header">
          <div className="loc-heading">
            <div className="loc-heading-icon"><Languages size={23} /></div>
            <div>
              <h1 className="loc-title">Localization Settings</h1>
              <p className="loc-subtitle">
                Configure supported languages, regional formats, time zones, currencies,
                and translation preferences across ModelNow.
              </p>
            </div>
          </div>
          <div className="loc-actions">
            <button className="loc-btn" onClick={resetSettings}><RefreshCw size={14} /> Reset demo</button>
            <button className="loc-btn primary" onClick={saveSettings}>
              {saved ? <Check size={14} /> : <Save size={14} />}
              {saved ? "Saved" : "Save settings"}
            </button>
          </div>
        </header>

        {notice && (
          <div className="loc-notice">
            <CircleAlert size={16} />
            <span>{notice}</span>
            <button onClick={() => setNotice("")} aria-label="Dismiss notice"><X size={15} /></button>
          </div>
        )}

        <section className="loc-stats">
          <div className="loc-stat">
            <div className="loc-stat-top">Enabled languages <span className="loc-stat-icon"><Languages size={17} /></span></div>
            <div className="loc-stat-value">{enabledLocales.length}</div>
            <div className="loc-stat-note">Of {locales.length} configured locales</div>
          </div>
          <div className="loc-stat">
            <div className="loc-stat-top">Default language <span className="loc-stat-icon"><Globe size={17} /></span></div>
            <div className="loc-stat-value" style={{ fontSize: 23 }}>{settings.defaultLocale}</div>
            <div className="loc-stat-note">Primary platform locale</div>
          </div>
          <div className="loc-stat">
            <div className="loc-stat-top">Translation coverage <span className="loc-stat-icon"><CheckCircle2 size={17} /></span></div>
            <div className="loc-stat-value">{translationCoverage}%</div>
            <div className="loc-stat-note">Sample translation inventory</div>
          </div>
          <div className="loc-stat">
            <div className="loc-stat-top">RTL languages <span className="loc-stat-icon"><ArrowRight size={17} /></span></div>
            <div className="loc-stat-value">{rtlLocales.length}</div>
            <div className="loc-stat-note">Enabled right-to-left locales</div>
          </div>
        </section>

        <nav className="loc-tabs" aria-label="Localization settings sections">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`loc-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>

        {activeTab === "Overview" && (
          <>
            <div className="loc-grid">
              <section className="loc-card">
                <div className="loc-card-head">
                  <div>
                    <h2 className="loc-card-title">Default locale</h2>
                    <p className="loc-card-subtitle">Choose the primary language used by the platform.</p>
                  </div>
                  <Globe size={19} color="#778195" />
                </div>
                <div className="loc-form-grid">
                  <Field label="Default language" description="Used when a user has no saved language preference.">
                    <select
                      value={settings.defaultLocale}
                      onChange={(event) => updateSetting("defaultLocale", event.target.value)}
                    >
                      {enabledLocales.map((locale) => (
                        <option key={locale.code} value={locale.code}>{locale.name} ({locale.code})</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Fallback language" description="Used when a translation is unavailable.">
                    <select
                      value={settings.fallbackLocale}
                      onChange={(event) => updateSetting("fallbackLocale", event.target.value)}
                    >
                      {enabledLocales.map((locale) => (
                        <option key={locale.code} value={locale.code}>{locale.name} ({locale.code})</option>
                      ))}
                    </select>
                  </Field>
                </div>
                <div className="loc-setting-row">
                  <div>
                    <div className="loc-setting-title">Show language selector</div>
                    <div className="loc-setting-description">Let users choose from enabled languages in the app.</div>
                  </div>
                  <Toggle checked={settings.showLanguageSelector} onChange={(value) => updateSetting("showLanguageSelector", value)} label="Show language selector" />
                </div>
                <div className="loc-setting-row">
                  <div>
                    <div className="loc-setting-title">Allow user language override</div>
                    <div className="loc-setting-description">Allow individual users to save their own locale preference.</div>
                  </div>
                  <Toggle checked={settings.allowUserOverride} onChange={(value) => updateSetting("allowUserOverride", value)} label="Allow user language override" />
                </div>
              </section>

              <section className="loc-card">
                <div className="loc-card-head">
                  <div>
                    <h2 className="loc-card-title">Regional preview</h2>
                    <p className="loc-card-subtitle">Example output based on the current locale settings.</p>
                  </div>
                  <Monitor size={19} color="#778195" />
                </div>
                <div className="loc-preview">
                  <div className="loc-grid">
                    <div className="loc-preview-box">
                      <div className="loc-preview-label">Date</div>
                      <div className="loc-preview-value">{formattedDate}</div>
                      <div className="loc-preview-sub">{settings.dateFormat}</div>
                    </div>
                    <div className="loc-preview-box">
                      <div className="loc-preview-label">Time</div>
                      <div className="loc-preview-value">{formattedTime}</div>
                      <div className="loc-preview-sub">{settings.defaultTimezone}</div>
                    </div>
                    <div className="loc-preview-box">
                      <div className="loc-preview-label">Number</div>
                      <div className="loc-preview-value">{formattedNumber}</div>
                      <div className="loc-preview-sub">{settings.numberFormat}</div>
                    </div>
                    <div className="loc-preview-box">
                      <div className="loc-preview-label">Currency</div>
                      <div className="loc-preview-value">{formattedCurrency}</div>
                      <div className="loc-preview-sub">{settings.currency}</div>
                    </div>
                  </div>
                  <div className="loc-note" style={{ margin: "16px 0 0" }}>
                    <CircleAlert size={15} />
                    Preview values are generated in the browser. Production formatting must use the saved locale settings in your application and backend.
                  </div>
                </div>
              </section>
            </div>

            <section className="loc-card">
              <div className="loc-card-head">
                <div>
                  <h2 className="loc-card-title">Enabled languages</h2>
                  <p className="loc-card-subtitle">Languages currently available in this demo configuration.</p>
                </div>
                <button className="loc-btn" onClick={() => setActiveTab("Languages")}>Manage languages <ArrowRight size={14} /></button>
              </div>
              <div className="loc-table-wrap">
                <table className="loc-table">
                  <thead>
                    <tr><th>Language</th><th>Locale</th><th>Region</th><th>Direction</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {enabledLocales.map((locale) => (
                      <tr key={locale.code}>
                        <td>
                          <div className="loc-language-cell">
                            <div className="loc-language-code">{locale.code.split("-")[0].toUpperCase()}</div>
                            <div><div className="loc-language-name">{locale.name}</div><div className="loc-language-native">{locale.nativeName}</div></div>
                          </div>
                        </td>
                        <td>{locale.code}</td>
                        <td>{locale.region}</td>
                        <td>{locale.direction}</td>
                        <td><span className={`loc-pill ${locale.defaultLocale ? "blue" : "success"}`}>{locale.defaultLocale ? "Default" : "Enabled"}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {activeTab === "Languages" && (
          <section className="loc-card">
            <div className="loc-card-head">
              <div>
                <h2 className="loc-card-title">Language management</h2>
                <p className="loc-card-subtitle">Enable supported languages and choose the default locale.</p>
              </div>
              <span className="loc-pill blue">{enabledLocales.length} enabled</span>
            </div>
            <div className="loc-filter-row">
              <div className="loc-search">
                <Search size={15} color="#8a94a6" />
                <input placeholder="Search languages or locale codes..." value={search} onChange={(event) => setSearch(event.target.value)} />
                {search && <button onClick={() => setSearch("")} aria-label="Clear search" style={{ border: 0, background: "transparent", cursor: "pointer" }}><X size={14} /></button>}
              </div>
              <select className="loc-select" value={languageFilter} onChange={(event) => setLanguageFilter(event.target.value)}>
                <option>All languages</option>
                <option>Enabled</option>
                <option>Disabled</option>
                <option>RTL</option>
              </select>
            </div>
            <div className="loc-table-wrap">
              <table className="loc-table">
                <thead><tr><th>Language</th><th>Locale</th><th>Region</th><th>Direction</th><th>Default</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredLocales.map((locale) => (
                    <tr key={locale.code}>
                      <td>
                        <div className="loc-language-cell">
                          <div className="loc-language-code">{locale.code.split("-")[0].toUpperCase()}</div>
                          <div><div className="loc-language-name">{locale.name}</div><div className="loc-language-native">{locale.nativeName}</div></div>
                        </div>
                      </td>
                      <td>{locale.code}</td>
                      <td>{locale.region}</td>
                      <td>{locale.direction}</td>
                      <td>{locale.defaultLocale ? <span className="loc-pill blue">Default</span> : "—"}</td>
                      <td><span className={`loc-pill ${locale.enabled ? "success" : "neutral"}`}>{locale.enabled ? "Enabled" : "Disabled"}</span></td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <Toggle checked={locale.enabled} onChange={() => toggleLocale(locale.code)} label={`Toggle ${locale.name}`} />
                          {locale.enabled && !locale.defaultLocale && (
                            <button className="loc-btn" style={{ padding: "7px 9px" }} onClick={() => makeDefaultLocale(locale.code)}>Set default</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredLocales.length === 0 && <div className="loc-empty"><Search size={22} /><p>No matching languages found.</p></div>}
            </div>
            <div className="loc-note">
              <CircleAlert size={15} />
              Enabling a locale here updates the local demo state only. Complete UI translations and backend locale handling are still required for full language support.
            </div>
          </section>
        )}

        {activeTab === "Regional Formats" && (
          <>
            <section className="loc-card">
              <div className="loc-card-head">
                <div>
                  <h2 className="loc-card-title">Regional formats</h2>
                  <p className="loc-card-subtitle">Choose how dates, numbers, currencies, and measurements are displayed.</p>
                </div>
                <MapPin size={19} color="#778195" />
              </div>
              <div className="loc-form-grid">
                <Field label="Date format" description="Controls the preferred date pattern across the platform.">
                  <select value={settings.dateFormat} onChange={(event) => updateSetting("dateFormat", event.target.value)}>
                    <option value="DD MMM YYYY">04 Nov 2026</option>
                    <option value="MM/DD/YYYY">11/04/2026</option>
                    <option value="DD/MM/YYYY">04/11/2026</option>
                    <option value="YYYY-MM-DD">2026-11-04</option>
                    <option value="MMMM D, YYYY">November 4, 2026</option>
                  </select>
                </Field>
                <Field label="Number locale" description="Controls decimal and thousands separators.">
                  <select value={settings.numberFormat} onChange={(event) => updateSetting("numberFormat", event.target.value)}>
                    <option value="en-US">English (United States) — 1,234,567.89</option>
                    <option value="en-IN">English (India) — 12,34,567.89</option>
                    <option value="de-DE">German — 1.234.567,89</option>
                    <option value="fr-FR">French — 1 234 567,89</option>
                    <option value="ja-JP">Japanese — 1,234,567.89</option>
                  </select>
                </Field>
                <Field label="Currency" description="Default currency for display and reports. This does not convert amounts.">
                  <select value={settings.currency} onChange={(event) => updateSetting("currency", event.target.value)}>
                    {CURRENCIES.map((currency) => <option key={currency.code} value={currency.code}>{currency.label}</option>)}
                  </select>
                </Field>
                <Field label="Currency display" description="Choose whether currency uses a symbol or code.">
                  <select value={settings.currencyDisplay} onChange={(event) => updateSetting("currencyDisplay", event.target.value)}>
                    <option value="symbol">Currency symbol (₹)</option>
                    <option value="code">Currency code (INR)</option>
                  </select>
                </Field>
                <Field label="Measurement system" description="Preferred units for distance, weight, and related values.">
                  <select value={settings.measurementSystem} onChange={(event) => updateSetting("measurementSystem", event.target.value)}>
                    <option value="metric">Metric (km, kg, °C)</option>
                    <option value="imperial">Imperial (mi, lb, °F)</option>
                  </select>
                </Field>
                <Field label="Default region" description="The region associated with the platform's primary locale.">
                  <select
                    value={settings.defaultLocale}
                    onChange={(event) => updateSetting("defaultLocale", event.target.value)}
                  >
                    {enabledLocales.map((locale) => <option key={locale.code} value={locale.code}>{locale.name} ({locale.code})</option>)}
                  </select>
                </Field>
              </div>
            </section>

            <section className="loc-card">
              <div className="loc-card-head">
                <div><h2 className="loc-card-title">Format preview</h2><p className="loc-card-subtitle">Example values using the current regional settings.</p></div>
                <Monitor size={18} color="#778195" />
              </div>
              <div className="loc-preview">
                <div className="loc-grid">
                  <div className="loc-preview-box"><div className="loc-preview-label">Date</div><div className="loc-preview-value">{formattedDate}</div></div>
                  <div className="loc-preview-box"><div className="loc-preview-label">Number</div><div className="loc-preview-value">{formattedNumber}</div></div>
                  <div className="loc-preview-box"><div className="loc-preview-label">Currency</div><div className="loc-preview-value">{formattedCurrency}</div></div>
                  <div className="loc-preview-box"><div className="loc-preview-label">Measurement</div><div className="loc-preview-value">{settings.measurementSystem === "metric" ? "12.5 km · 4.2 kg" : "7.8 mi · 9.3 lb"}</div></div>
                </div>
              </div>
            </section>
          </>
        )}

        {activeTab === "Time & Calendar" && (
          <>
            <section className="loc-card">
              <div className="loc-card-head">
                <div><h2 className="loc-card-title">Time zone & calendar</h2><p className="loc-card-subtitle">Configure platform time display and calendar conventions.</p></div>
                <Clock3 size={19} color="#778195" />
              </div>
              <div className="loc-form-grid">
                <Field label="Default time zone" description="Used for scheduled jobs, audit displays, and platform dates unless overridden.">
                  <select value={settings.defaultTimezone} onChange={(event) => updateSetting("defaultTimezone", event.target.value)}>
                    {TIMEZONES.map((timezone) => <option key={timezone}>{timezone}</option>)}
                  </select>
                </Field>
                <Field label="Time format" description="Choose between 12-hour and 24-hour time.">
                  <select value={settings.timeFormat} onChange={(event) => updateSetting("timeFormat", event.target.value)}>
                    <option value="12-hour">12-hour (3:30 PM)</option>
                    <option value="24-hour">24-hour (15:30)</option>
                  </select>
                </Field>
                <Field label="First day of the week" description="Used by calendar views and date pickers.">
                  <select value={settings.firstDayOfWeek} onChange={(event) => updateSetting("firstDayOfWeek", event.target.value)}>
                    <option>Monday</option>
                    <option>Sunday</option>
                    <option>Saturday</option>
                  </select>
                </Field>
              </div>
              <div className="loc-setting-row">
                <div><div className="loc-setting-title">Detect time zone automatically</div><div className="loc-setting-description">Allow the client application to suggest a time zone from the user's device.</div></div>
                <Toggle checked={settings.automaticTimezone} onChange={(value) => updateSetting("automaticTimezone", value)} label="Detect time zone automatically" />
              </div>
              <div className="loc-setting-row">
                <div><div className="loc-setting-title">Use browser locale when available</div><div className="loc-setting-description">Use browser language preferences when a user has no saved language choice.</div></div>
                <Toggle checked={settings.useBrowserLocale} onChange={(value) => updateSetting("useBrowserLocale", value)} label="Use browser locale" />
              </div>
            </section>

            <section className="loc-card">
              <div className="loc-card-head">
                <div><h2 className="loc-card-title">Time preview</h2><p className="loc-card-subtitle">Sample timestamp formatted using your selected time zone.</p></div>
                <CalendarDays size={19} color="#778195" />
              </div>
              <div className="loc-preview">
                <div className="loc-grid">
                  <div className="loc-preview-box"><div className="loc-preview-label">Formatted time</div><div className="loc-preview-value">{formattedTime}</div></div>
                  <div className="loc-preview-box"><div className="loc-preview-label">Selected time zone</div><div className="loc-preview-value" style={{ fontSize: 15 }}>{settings.defaultTimezone}</div></div>
                  <div className="loc-preview-box"><div className="loc-preview-label">Calendar starts on</div><div className="loc-preview-value">{settings.firstDayOfWeek}</div></div>
                  <div className="loc-preview-box"><div className="loc-preview-label">Time display</div><div className="loc-preview-value">{settings.timeFormat}</div></div>
                </div>
              </div>
            </section>
          </>
        )}

        {activeTab === "Translation Management" && (
          <>
            <section className="loc-card">
              <div className="loc-card-head">
                <div><h2 className="loc-card-title">Translation coverage</h2><p className="loc-card-subtitle">Review the sample translation catalog for enabled languages.</p></div>
                <span className="loc-pill blue">{translationCoverage}% complete</span>
              </div>
              <div className="loc-coverage">
                <div className="loc-coverage-top">
                  <div><div className="loc-coverage-number">{translatedCount} / {translationItems.length}</div><div className="loc-coverage-caption">Sample keys translated in the catalog</div></div>
                  <Languages size={24} color="#315bea" />
                </div>
                <div className="loc-bar"><div className="loc-bar-fill" style={{ width: `${translationCoverage}%` }} /></div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 9, fontSize: 11, color: "#778195" }}>
                  <span>{translationItems.length - translatedCount} keys need translation</span><span>{translationCoverage}%</span>
                </div>
              </div>
              <div className="loc-setting-row">
                <div><div className="loc-setting-title">Enable localized application content</div><div className="loc-setting-description">Allow the application to use translation resources for supported locales.</div></div>
                <Toggle checked={settings.enableTranslations} onChange={(value) => updateSetting("enableTranslations", value)} label="Enable translations" />
              </div>
              <div className="loc-setting-row">
                <div><div className="loc-setting-title">Notify on missing translations</div><div className="loc-setting-description">Flag untranslated keys for review by the localization team.</div></div>
                <Toggle checked={settings.notifyMissingTranslations} onChange={(value) => updateSetting("notifyMissingTranslations", value)} label="Notify on missing translations" />
              </div>
            </section>

            <section className="loc-card">
              <div className="loc-card-head">
                <div><h2 className="loc-card-title">Translation catalog</h2><p className="loc-card-subtitle">Example keys, English source text, and sample translations.</p></div>
                <div className="loc-search">
                  <Search size={15} color="#8a94a6" />
                  <input placeholder="Search translation keys..." value={translationSearch} onChange={(event) => setTranslationSearch(event.target.value)} />
                </div>
              </div>
              <div className="loc-table-wrap">
                <table className="loc-table">
                  <thead><tr><th>Translation key</th><th>English source</th><th>Telugu</th><th>Hindi</th><th>Status</th></tr></thead>
                  <tbody>
                    {filteredTranslations.map((item) => (
                      <tr key={item.key}>
                        <td style={{ fontWeight: 700 }}>{item.key}</td>
                        <td>{item.english}</td>
                        <td>{item.te || "—"}</td>
                        <td>{item.hi || "—"}</td>
                        <td><span className={`loc-translation-status ${item.status === "Translated" ? "done" : "missing"}`}>{item.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredTranslations.length === 0 && <div className="loc-empty">No matching translation keys.</div>}
              </div>
              <div className="loc-note">
                <CircleAlert size={15} />
                Translation entries are illustrative sample data. Connect a translation service or your application's locale resource files to manage production translations.
              </div>
            </section>
          </>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 9, marginTop: 8, marginBottom: 20 }}>
          <button className="loc-btn" onClick={resetSettings}><RefreshCw size={14} /> Reset</button>
          <button className="loc-btn primary" onClick={saveSettings}><Save size={14} /> Save localization settings</button>
        </div>
      </div>
    </main>
  );
}