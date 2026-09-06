export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

export const lightTheme: Theme = {
  name: "light",

  colors: {
    primary: "#2563EB",
    secondary: "#64748B",
    background: "#FFFFFF",
    surface: "#F8FAFC",
    text: "#0F172A",
    textSecondary: "#64748B",
    border: "#E2E8F0",
    success: "#16A34A",
    warning: "#F59E0B",
    error: "#DC2626",
    info: "#0284C7",
  },
};

export const darkTheme: Theme = {
  name: "dark",

  colors: {
    primary: "#60A5FA",
    secondary: "#94A3B8",
    background: "#0F172A",
    surface: "#1E293B",
    text: "#F8FAFC",
    textSecondary: "#CBD5E1",
    border: "#334155",
    success: "#4ADE80",
    warning: "#FBBF24",
    error: "#F87171",
    info: "#38BDF8",
  },
};

export function getTheme(
  themeName: "light" | "dark"
): Theme {
  return themeName === "dark"
    ? darkTheme
    : lightTheme;
}

export default lightTheme;