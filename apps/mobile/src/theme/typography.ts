export interface TypographyStyle {
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing?: number;
}

export const TYPOGRAPHY = {
  h1: {
    fontSize: 32,
    fontWeight: 700,
    lineHeight: 1.2,
  },

  h2: {
    fontSize: 28,
    fontWeight: 700,
    lineHeight: 1.25,
  },

  h3: {
    fontSize: 24,
    fontWeight: 600,
    lineHeight: 1.3,
  },

  h4: {
    fontSize: 20,
    fontWeight: 600,
    lineHeight: 1.35,
  },

  body: {
    fontSize: 16,
    fontWeight: 400,
    lineHeight: 1.5,
  },

  bodySmall: {
    fontSize: 14,
    fontWeight: 400,
    lineHeight: 1.5,
  },

  caption: {
    fontSize: 12,
    fontWeight: 400,
    lineHeight: 1.4,
  },

  button: {
    fontSize: 14,
    fontWeight: 600,
    lineHeight: 1.4,
  },
} as const;

export type TypographyName =
  keyof typeof TYPOGRAPHY;

export function getTypography(
  name: TypographyName
) {
  return TYPOGRAPHY[name];
}

export default TYPOGRAPHY;