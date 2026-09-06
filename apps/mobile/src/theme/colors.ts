export const COLORS = {
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
  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
} as const;

export type ColorName =
  keyof typeof COLORS;

export function getColor(
  name: ColorName
): string {
  return COLORS[name];
}

export default COLORS;