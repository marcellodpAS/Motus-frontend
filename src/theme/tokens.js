/**
 * Temporary technical tokens. Replace these values after the Stitch design
 * analysis; this file is the single source consumed by TypeScript and Tailwind.
 */
const colors = {
  background: "#F8FAFC",
  surface: "#FFFFFF",
  primary: "#2563EB",
  foreground: "#0F172A",
  muted: "#64748B",
  border: "#E2E8F0",
};

const spacing = {
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
};

const typography = {
  body: ["16px", { lineHeight: "24px" }],
  title: ["24px", { lineHeight: "32px", fontWeight: "600" }],
};

module.exports = { colors, spacing, typography };
