# Fonts

This directory contains all custom fonts used by the application.

## Supported Formats

- .woff2 (Recommended)
- .woff
- .ttf
- .otf

## Example Structure

```text
fonts/
├── Inter-Regular.ttf
├── Inter-Medium.ttf
├── Inter-Bold.ttf
└── Roboto-Regular.ttf
```

## Usage

Fonts can be loaded using CSS.

Example:

```css
@font-face {
  font-family: "Inter";
  src: url("/fonts/Inter-Regular.ttf") format("truetype");
  font-weight: 400;
  font-style: normal;
}
```

Use these fonts consistently throughout the application to maintain a unified design.