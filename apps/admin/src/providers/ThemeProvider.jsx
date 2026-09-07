import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/**
 * ThemeProvider
 *
 * Responsibilities:
 * - Light / Dark / System theme
 * - Theme persistence
 * - System preference detection
 * - CSS class management
 * - Document theme attributes
 * - Theme toggle
 * - Theme-aware CSS variables
 */

/* -------------------------------------------------
   Theme Constants
------------------------------------------------- */

export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
};

const STORAGE_KEY =
  "admin_theme";

/* -------------------------------------------------
   Theme Context
------------------------------------------------- */

const ThemeContext =
  createContext(null);

/* -------------------------------------------------
   Get System Theme
------------------------------------------------- */

function getSystemTheme() {
  if (
    typeof window ===
      "undefined" ||
    !window.matchMedia
  ) {
    return THEMES.LIGHT;
  }

  return window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches
    ? THEMES.DARK
    : THEMES.LIGHT;
}

/* -------------------------------------------------
   Get Stored Theme
------------------------------------------------- */

function getStoredTheme() {
  if (
    typeof window ===
    "undefined"
  ) {
    return THEMES.SYSTEM;
  }

  try {
    const storedTheme =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (
      Object.values(
        THEMES
      ).includes(
        storedTheme
      )
    ) {
      return storedTheme;
    }

    return THEMES.SYSTEM;
  } catch (error) {
    console.warn(
      "Unable to read stored theme:",
      error
    );

    return THEMES.SYSTEM;
  }
}

/* -------------------------------------------------
   Theme Provider
------------------------------------------------- */

export function ThemeProvider({
  children,

  defaultTheme =
    THEMES.SYSTEM,

  storageKey =
    STORAGE_KEY,
}) {
  const [
    theme,
    setThemeState,
  ] = useState(() => {
    if (
      typeof window ===
      "undefined"
    ) {
      return defaultTheme;
    }

    try {
      const storedTheme =
        localStorage.getItem(
          storageKey
        );

      if (
        Object.values(
          THEMES
        ).includes(
          storedTheme
        )
      ) {
        return storedTheme;
      }
    } catch (error) {
      console.warn(
        "Unable to load theme:",
        error
      );
    }

    return defaultTheme;
  });

  const [
    resolvedTheme,
    setResolvedTheme,
  ] = useState(() => {
    if (
      theme ===
      THEMES.SYSTEM
    ) {
      return getSystemTheme();
    }

    return theme;
  });

  /* -------------------------------------------------
     Resolve Theme
  ------------------------------------------------- */

  const resolveTheme =
    useCallback(
      (selectedTheme) => {
        if (
          selectedTheme ===
          THEMES.SYSTEM
        ) {
          return getSystemTheme();
        }

        return selectedTheme;
      },
      []
    );

  /* -------------------------------------------------
     Apply Theme
  ------------------------------------------------- */

  const applyTheme =
    useCallback(
      (selectedTheme) => {
        const resolved =
          resolveTheme(
            selectedTheme
          );

        setResolvedTheme(
          resolved
        );

        if (
          typeof document ===
          "undefined"
        ) {
          return;
        }

        const root =
          document.documentElement;

        /* Remove previous theme */
        root.classList.remove(
          THEMES.LIGHT,
          THEMES.DARK
        );

        /* Add current theme */
        root.classList.add(
          resolved
        );

        /* Data attributes */
        root.setAttribute(
          "data-theme",
          resolved
        );

        root.setAttribute(
          "data-theme-mode",
          selectedTheme
        );

        /* Browser UI theme */
        root.style.colorScheme =
          resolved;
      },
      [resolveTheme]
    );

  /* -------------------------------------------------
     Set Theme
  ------------------------------------------------- */

  const setTheme =
    useCallback(
      (newTheme) => {
        if (
          !Object.values(
            THEMES
          ).includes(
            newTheme
          )
        ) {
          console.warn(
            `Invalid theme: ${newTheme}`
          );

          return;
        }

        setThemeState(
          newTheme
        );

        try {
          localStorage.setItem(
            storageKey,
            newTheme
          );
        } catch (error) {
          console.warn(
            "Unable to save theme:",
            error
          );
        }

        applyTheme(
          newTheme
        );
      },
      [
        storageKey,
        applyTheme,
      ]
    );

  /* -------------------------------------------------
     Toggle Theme
  ------------------------------------------------- */

  const toggleTheme =
    useCallback(() => {
      const currentTheme =
        resolvedTheme;

      const nextTheme =
        currentTheme ===
        THEMES.DARK
          ? THEMES.LIGHT
          : THEMES.DARK;

      setTheme(
        nextTheme
      );
    }, [
      resolvedTheme,
      setTheme,
    ]);

  /* -------------------------------------------------
     Initialize Theme
  ------------------------------------------------- */

  useEffect(() => {
    applyTheme(theme);
  }, [
    theme,
    applyTheme,
  ]);

  /* -------------------------------------------------
     Listen For System Theme Changes
  ------------------------------------------------- */

  useEffect(() => {
    if (
      theme !==
      THEMES.SYSTEM
    ) {
      return undefined;
    }

    if (
      typeof window ===
        "undefined" ||
      !window.matchMedia
    ) {
      return undefined;
    }

    const mediaQuery =
      window.matchMedia(
        "(prefers-color-scheme: dark)"
      );

    const handleChange =
      () => {
        const systemTheme =
          getSystemTheme();

        setResolvedTheme(
          systemTheme
        );

        applyTheme(
          THEMES.SYSTEM
        );
      };

    if (
      mediaQuery.addEventListener
    ) {
      mediaQuery.addEventListener(
        "change",
        handleChange
      );
    } else {
      mediaQuery.addListener(
        handleChange
      );
    }

    return () => {
      if (
        mediaQuery.removeEventListener
      ) {
        mediaQuery.removeEventListener(
          "change",
          handleChange
        );
      } else {
        mediaQuery.removeListener(
          handleChange
        );
      }
    };
  }, [
    theme,
    applyTheme,
  ]);

  /* -------------------------------------------------
     Theme State
  ------------------------------------------------- */

  const isLight =
    resolvedTheme ===
    THEMES.LIGHT;

  const isDark =
    resolvedTheme ===
    THEMES.DARK;

  const isSystem =
    theme ===
    THEMES.SYSTEM;

  /* -------------------------------------------------
     Context Value
  ------------------------------------------------- */

  const value =
    useMemo(
      () => ({
        /* Current theme mode */
        theme,

        /* Actual applied theme */
        resolvedTheme,

        /* Available themes */
        themes: THEMES,

        /* Theme states */
        isLight,

        isDark,

        isSystem,

        /* Actions */
        setTheme,

        toggleTheme,

        /* System theme */
        systemTheme:
          getSystemTheme(),
      }),
      [
        theme,
        resolvedTheme,
        isLight,
        isDark,
        isSystem,
        setTheme,
        toggleTheme,
      ]
    );

  return (
    <ThemeContext.Provider
      value={value}
    >
      {children}
    </ThemeContext.Provider>
  );
}

/* -------------------------------------------------
   Theme Hook
------------------------------------------------- */

export function useTheme() {
  const context =
    useContext(
      ThemeContext
    );

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider."
    );
  }

  return context;
}

/* -------------------------------------------------
   Theme Toggle Component
------------------------------------------------- */

export function ThemeToggle() {
  const {
    resolvedTheme,
    toggleTheme,
  } = useTheme();

  return (
    <button
      type="button"
      onClick={
        toggleTheme
      }
      aria-label={
        `Switch to ${
          resolvedTheme ===
          THEMES.DARK
            ? "light"
            : "dark"
        } theme`
      }
      title={
        `Switch to ${
          resolvedTheme ===
          THEMES.DARK
            ? "light"
            : "dark"
        } theme`
      }
    >
      {resolvedTheme ===
      THEMES.DARK
        ? "☀️"
        : "🌙"}
    </button>
  );
}

/* -------------------------------------------------
   Theme Selector
------------------------------------------------- */

export function ThemeSelector() {
  const {
    theme,
    setTheme,
  } = useTheme();

  return (
    <select
      value={theme}
      onChange={(event) =>
        setTheme(
          event.target.value
        )
      }
      aria-label="Select theme"
    >
      <option
        value={THEMES.LIGHT}
      >
        Light
      </option>

      <option
        value={THEMES.DARK}
      >
        Dark
      </option>

      <option
        value={THEMES.SYSTEM}
      >
        System
      </option>
    </select>
  );
}

/* -------------------------------------------------
   Default Export
------------------------------------------------- */

export default ThemeProvider;