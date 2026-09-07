"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const ThemeContext =
  createContext(null);

export function ThemeProvider({
  children,
  defaultTheme = "system",
}) {
  const [theme, setTheme] =
    useState(defaultTheme);

  const [resolvedTheme, setResolvedTheme] =
    useState("light");

  useEffect(() => {
    const savedTheme =
      localStorage.getItem(
        "app_theme"
      );

    if (
      savedTheme === "light" ||
      savedTheme === "dark" ||
      savedTheme === "system"
    ) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    const updateTheme = () => {
      if (theme === "system") {
        const isDark =
          window.matchMedia(
            "(prefers-color-scheme: dark)"
          ).matches;

        setResolvedTheme(
          isDark ? "dark" : "light"
        );
      } else {
        setResolvedTheme(theme);
      }
    };

    updateTheme();

    const mediaQuery =
      window.matchMedia(
        "(prefers-color-scheme: dark)"
      );

    mediaQuery.addEventListener(
      "change",
      updateTheme
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        updateTheme
      );
    };
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(
      "app_theme",
      theme
    );

    document.documentElement.dataset.theme =
      resolvedTheme;

    document.documentElement.classList.toggle(
      "dark",
      resolvedTheme === "dark"
    );
  }, [theme, resolvedTheme]);

  const toggleTheme = () => {
    setTheme((currentTheme) =>
      currentTheme === "dark"
        ? "light"
        : "dark"
    );
  };

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme,
      isDark:
        resolvedTheme === "dark",
      isLight:
        resolvedTheme === "light",
    }),
    [theme, resolvedTheme]
  );

  return (
    <ThemeContext.Provider
      value={value}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context =
    useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider."
    );
  }

  return context;
}

export default ThemeContext;