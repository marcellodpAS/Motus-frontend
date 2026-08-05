/**
 * Single source of truth for Motus design tokens (Task 10).
 *
 * Consumed by three surfaces, all reading from this exact module — no value
 * below is ever retyped elsewhere:
 * - TypeScript: `import { colors, spacing, ... } from "@/theme"`.
 * - Tailwind/NativeWind: `tailwind.config.js` does `require("./src/theme/tokens")`.
 * - Platform adapter (`src/platform`): consumes `density` to size touch
 *   targets/icons per platform, and `shadow` via `./shadowStyle`.
 *
 * This file must stay framework-free (no `react-native` import): it is
 * loaded directly by Node (via tailwindcss's `jiti`-based config loader)
 * outside of any Metro/RN runtime, so any native import would break the
 * Tailwind build. Platform-dependent helpers live in `./shadowStyle.ts`
 * instead, which only app/test code imports.
 *
 * Previously `tokens.js` (runtime) duplicated its own shape by hand in a
 * parallel `tokens.d.ts` (flagged as debt in `docs/motus/architecture.md`
 * §4). A single typed `.ts` module removes that duplication outright.
 */

/**
 * Primitive color scale. Intentionally not exposed to Tailwind: components
 * must consume the semantic `colors` below, never these raw values, so a
 * future palette/theme swap never requires touching component code
 * (`docs/motus/architecture.md` §4).
 */
const palette = {
  white: "#FFFFFF",
  slate50: "#F8FAFC",
  slate100: "#F1F5F9",
  slate200: "#E2E8F0",
  slate300: "#CBD5E1",
  slate500: "#64748B",
  slate900: "#0F172A",
  blue50: "#EFF6FF",
  blue600: "#2563EB",
  blue700: "#1D4ED8",
  red600: "#DC2626",
  red700: "#B91C1C",
  amber500: "#F59E0B",
  green600: "#16A34A",
} as const;

type Palette = typeof palette;

/**
 * Builds the semantic color set from a primitive palette. Kept as a
 * function (not inlined) so a future dark mode is a second call —
 * `buildSemanticColors(darkPalette)` — not a rewrite. No global store is
 * introduced here: NativeWind already reads the OS color scheme via
 * `useColorScheme` (see `docs/motus/design-tokens.md`).
 */
function buildSemanticColors(p: Palette) {
  return {
    background: p.slate50,
    surface: p.white,
    surfaceElevated: p.white,
    foreground: p.slate900,
    muted: p.slate500,

    border: p.slate200,
    borderFocused: p.blue600,

    primary: p.blue600,
    onPrimary: p.white,
    primaryPressed: p.blue700,
    primaryDisabled: p.slate300,

    secondary: p.slate900,
    onSecondary: p.white,

    danger: p.red600,
    onDanger: p.white,
    dangerPressed: p.red700,

    warning: p.amber500,
    onWarning: p.slate900,

    success: p.green600,
    onSuccess: p.white,

    selected: p.blue50,
    onSelected: p.blue700,

    disabled: p.slate300,
    onDisabled: p.slate500,

    loading: p.slate200,
  } as const;
}

/**
 * Semantic colors — the only public color API. Covers the required states
 * (default/pressed/focused/selected/disabled/loading/success/warning/error):
 * pressed -> `primaryPressed`/`dangerPressed`, focused -> `borderFocused`,
 * selected -> `selected`/`onSelected`, disabled -> `disabled`/`onDisabled`/
 * `primaryDisabled`, loading -> `loading`, success/warning/error -> `success`
 * /`warning`/`danger` (error state === danger intent, one token, not two).
 *
 * `danger`/`warning`/`success` have no brand-approved values yet
 * (`docs/motus/brand-guidelines.md` §4 flags this open); the values above
 * are the standard, WCAG-contrast-checked Tailwind red-600/amber-500/
 * green-600 swatches, chosen the same way the pre-existing `primary`/
 * `foreground`/`background` values already happened to match Tailwind's
 * slate/blue scale. Replace in `palette` only, once product/design decides.
 */
export const colors = buildSemanticColors(palette);

export type ColorToken = keyof typeof colors;

// ---------------------------------------------------------------------------
// Typography: fontSize, fontWeight and lineHeight are kept as independent
// scales (each usable on its own, e.g. `font-semibold` without `text-title`),
// then composed — never retyped — into the `typography` Tailwind fontSize
// entries components actually use (`text-body`, `text-title`, ...).
//
// No `fontFamily` token: `assets/fonts/` is empty and no typeface has been
// licensed yet (`docs/motus/brand-guidelines.md` §5). React Native's `Text`
// takes a single native font name, not a CSS font stack, so guessing one
// here would be actively wrong at runtime, not just provisional — omitted
// until a real typeface is chosen.
// ---------------------------------------------------------------------------

export const fontSize = {
  xs: "12px",
  sm: "14px",
  base: "16px",
  lg: "18px",
  xl: "20px",
  "2xl": "24px",
  "3xl": "32px",
} as const;

export const lineHeight = {
  xs: "16px",
  sm: "20px",
  base: "24px",
  lg: "26px",
  xl: "28px",
  "2xl": "32px",
  "3xl": "40px",
} as const;

export const fontWeight = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;

/**
 * Composite Tailwind `fontSize` entries (`[size, { lineHeight, fontWeight }]`
 * tuples) — the API components actually consume via `text-*` classNames.
 * `body` and `title` keep the exact values the provisional tokens already
 * had, so no visual output changes for existing screens.
 */
export const typography = {
  caption: [
    fontSize.xs,
    { lineHeight: lineHeight.xs, fontWeight: fontWeight.regular },
  ],
  body: [
    fontSize.base,
    { lineHeight: lineHeight.base, fontWeight: fontWeight.regular },
  ],
  label: [
    fontSize.sm,
    { lineHeight: lineHeight.sm, fontWeight: fontWeight.medium },
  ],
  title: [
    fontSize["2xl"],
    { lineHeight: lineHeight["2xl"], fontWeight: fontWeight.semibold },
  ],
  headline: [
    fontSize["3xl"],
    { lineHeight: lineHeight["3xl"], fontWeight: fontWeight.bold },
  ],
} as const;

export type TypographyToken = keyof typeof typography;

// ---------------------------------------------------------------------------
// Spacing, radius, border width — kept as the same 4px-rhythm scale already
// in use, extended only where a new category needs it.
// ---------------------------------------------------------------------------

export const spacing = {
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
} as const;

export type SpacingToken = keyof typeof spacing;

export const radius = {
  sm: "4px",
  md: "8px",
  lg: "16px",
  full: "9999px",
} as const;

export type RadiusToken = keyof typeof radius;

/**
 * Border thickness only — border *color* is `colors.border`/
 * `colors.borderFocused`. Kept as a separate token so the two dimensions
 * (hue vs. thickness) of the "border" category can vary independently.
 */
export const borderWidth = {
  hairline: "1px",
  thick: "2px",
} as const;

export type BorderWidthToken = keyof typeof borderWidth;

// ---------------------------------------------------------------------------
// Icon size / touch target — plain numbers (unitless), the shape React
// Native style props and future Icon/Pressable components need directly.
// ---------------------------------------------------------------------------

export const iconSize = {
  sm: 16,
  md: 24,
  lg: 32,
} as const;

export type IconSizeToken = keyof typeof iconSize;

/**
 * Minimum tappable dimension. `comfortable` (48) satisfies both iOS HIG
 * (44pt minimum) and Material Design (48dp minimum) at once. `automotive`
 * (64) has no confirmed guideline in this repository (no official Android
 * Auto/CarPlay touch-target spec was extracted — `docs/motus/
 * automotive-feasibility.md`); it is a deliberately generous assumption for
 * glanceable, in-motion use, not a cited figure — revisit if/when Task 4/5's
 * scope reopens automotive UI.
 */
export const touchTarget = {
  comfortable: 48,
  automotive: 64,
} as const;

export type TouchTargetToken = keyof typeof touchTarget;

// ---------------------------------------------------------------------------
// Density — per-platform bundles of already-defined tokens above (touch
// target, icon size, spacing step). No new values are introduced here, only
// references, so density can never drift from the scales it names.
//
// Only "comfortable" (mobile) and "automotive" exist, matching the task
// brief ("density mobile", "density automotive"). `ComponentDensity`
// (`src/platform/types.ts`) also has a `"compact"` value, but
// `docs/motus/platform-capabilities.md` §4 documents it as intentionally
// never resolved: no design breakpoint exists for phones, and inventing one
// here would be exactly the undocumented heuristic Task 8 already ruled
// out. Adding a `compact` density profile is deferred for the same reason.
// ---------------------------------------------------------------------------

export type DensityKey = "comfortable" | "automotive";

export const density = {
  comfortable: {
    touchTarget: touchTarget.comfortable,
    iconSize: iconSize.md,
    padding: spacing.md,
  },
  automotive: {
    touchTarget: touchTarget.automotive,
    iconSize: iconSize.lg,
    padding: spacing.xl,
  },
} as const satisfies Record<DensityKey, unknown>;

// ---------------------------------------------------------------------------
// Shadow / elevation — React Native has no single cross-platform shadow API:
// iOS reads `shadowColor`/`shadowOffset`/`shadowOpacity`/`shadowRadius`,
// Android reads a numeric `elevation` instead. NativeWind's `shadow-*`
// classNames only translate `shadowColor`/`shadowRadius` (see
// `react-native-css-interop`'s `parseBoxShadow`) — never `elevation` — so a
// className alone under-renders on Android. `boxShadow` below is that
// partial Tailwind mapping; `getShadowStyle()` in `./shadowStyle.ts` is the
// full, correct cross-platform mapping and is the one components should
// prefer.
// ---------------------------------------------------------------------------

function withAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export type ShadowLevel = "none" | "sm" | "md" | "lg";

export const shadow: Record<
  ShadowLevel,
  {
    ios: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
    };
    android: { elevation: number };
    boxShadow: string;
  }
> = {
  none: {
    ios: {
      shadowColor: "transparent",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
    },
    android: { elevation: 0 },
    boxShadow: "none",
  },
  sm: {
    ios: {
      shadowColor: colors.foreground,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
    },
    android: { elevation: 2 },
    boxShadow: `0 1px 2px ${withAlpha(colors.foreground, 0.08)}`,
  },
  md: {
    ios: {
      shadowColor: colors.foreground,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 4,
    },
    android: { elevation: 4 },
    boxShadow: `0 2px 4px ${withAlpha(colors.foreground, 0.12)}`,
  },
  lg: {
    ios: {
      shadowColor: colors.foreground,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.16,
      shadowRadius: 8,
    },
    android: { elevation: 8 },
    boxShadow: `0 4px 8px ${withAlpha(colors.foreground, 0.16)}`,
  },
};

/**
 * No motion tokens: no animation/transition requirement exists anywhere in
 * `docs/motus/product-requirements.md` or `architecture.md`, and the task
 * brief itself marks motion as "only if necessary" — inventing a duration/
 * easing scale nothing consumes would be speculative token debt, not
 * preparation. Add here, composed the same way as the categories above,
 * the day a real interaction needs one.
 */
