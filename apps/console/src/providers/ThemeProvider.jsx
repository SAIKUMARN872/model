import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

const ThemeContext = createContext(null);
const THEMES = Object.freeze(["light", "dark", "system"]);

function resolveTheme(theme) {
  if (theme === "system") {
    if (typeof window === "undefined" || !window.matchMedia) return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  return theme === "dark" ? "dark" : "light";
}

export function ThemeProvider({ children, defaultTheme = "system" }) {
  const [theme, setThemeState] = useState(
    THEMES.includes(defaultTheme) ? defaultTheme : "system"
  );

  const setTheme = useCallback(nextTheme => {
    if (!THEMES.includes(nextTheme)) {
      throw new TypeError("Theme must be light, dark, or system.");
    }
    setThemeState(nextTheme);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.theme = resolveTheme(theme);
    document.documentElement.style.colorScheme = resolveTheme(theme);
  }, [theme]);

  const value = useMemo(() => ({
    theme,
    resolvedTheme: resolveTheme(theme),
    setTheme,
    themes: THEMES
  }), [theme, setTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider.");
  }
  return context;
}

export default ThemeProvider;
