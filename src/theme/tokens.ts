/**
 * Single source of truth for Motus design tokens.
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
 * Task 19: values below are derived from the real Motus Stitch project
 * (`assets/stitch_motus.zip`, catalogued in
 * `docs/motus/stitch-screen-inventory.md` §0), replacing the provisional
 * placeholder palette this file previously carried (flagged in the old
 * `tokens.js` as "temporary, replace after the Stitch design analysis" —
 * see `docs/motus/design-inputs.md` §2). The four exported `code.html`
 * files (Segnala Prezzo, Dettaglio Stazione, Previsioni Pro, Mappa Motus)
 * are the primary source for exact hex values — they are internally
 * consistent with each other and closer to the actual rendered screens
 * than `DESIGN.md`, which uses slightly different numbers for the same
 * token names (documented discrepancy, `stitch-screen-inventory.md` §0).
 */

/**
 * Primitive Stitch color scale. Intentionally not exposed to Tailwind:
 * components must consume the semantic `colors` below, never these raw
 * values, so a future palette/theme swap never requires touching component
 * code (`docs/motus/architecture.md` §4).
 */
const palette = {
  white: "#FFFFFF",
  background: "#F6FAFF",
  onSurface: "#171C20",
  onSurfaceVariant: "#414754",
  outline: "#727785",
  outlineVariant: "#C1C6D6",
  borderSubtle: "#DADCE0",
  mapBackground: "#F8F9FA",

  surfaceContainerLowest: "#FFFFFF",
  surfaceContainerLow: "#F0F4FA",
  surfaceContainer: "#EAEEF4",
  surfaceContainerHigh: "#E4E9EE",
  surfaceContainerHighest: "#DEE3E8",

  primary: "#005BBF",
  onPrimary: "#FFFFFF",
  primaryContainer: "#1A73E8",
  onPrimaryContainer: "#FFFFFF",

  secondary: "#0058BB",
  onSecondary: "#FFFFFF",
  secondaryContainer: "#1471E6",
  onSecondaryContainer: "#FEFCFF",
  secondaryFixed: "#D8E2FF",

  tertiary: "#9E4300",
  onTertiary: "#FFFFFF",
  tertiaryContainer: "#C55500",
  onTertiaryContainer: "#0E0200",
  tertiaryFixed: "#FFDBCB",

  error: "#BA1A1A",
  onError: "#FFFFFF",
  errorContainer: "#FFDAD6",
  onErrorContainer: "#93000A",

  /**
   * No Stitch/DESIGN.md value exists for a Material-style "warning" role —
   * none of the 4 exported screens render one (`stitch-screen-inventory.md`
   * §0 notes `semantic-error` itself is declared but unused). Kept as the
   * pre-existing standard, WCAG-checked amber-500 swatch rather than
   * inventing a Stitch-branded value with no source
   * (`docs/motus/brand-guidelines.md` §4 already flags this as open).
   */
  warning: "#F59E0B",

  semanticSuccess: "#188038",
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
    background: p.background,
    surface: p.surfaceContainerLowest,
    surfaceElevated: p.surfaceContainerLowest,
    foreground: p.onSurface,
    muted: p.onSurfaceVariant,

    border: p.borderSubtle,
    borderFocused: p.primary,

    primary: p.primary,
    onPrimary: p.onPrimary,
    /** Matches Stitch's own hover/press target for primary buttons (`hover:bg-primary-container`). */
    primaryPressed: p.primaryContainer,
    primaryDisabled: p.outlineVariant,
    primaryContainer: p.primaryContainer,
    onPrimaryContainer: p.onPrimaryContainer,

    secondary: p.secondary,
    onSecondary: p.onSecondary,
    secondaryContainer: p.secondaryContainer,
    onSecondaryContainer: p.onSecondaryContainer,
    secondaryFixed: p.secondaryFixed,

    tertiary: p.tertiary,
    onTertiary: p.onTertiary,
    tertiaryContainer: p.tertiaryContainer,
    onTertiaryContainer: p.onTertiaryContainer,
    tertiaryFixed: p.tertiaryFixed,

    danger: p.error,
    onDanger: p.onError,
    /** Stitch's `on-error-container` — a dark red, used as the pressed/darker error state. */
    dangerPressed: p.onErrorContainer,
    errorContainer: p.errorContainer,
    onErrorContainer: p.onErrorContainer,

    warning: p.warning,
    onWarning: p.onSurface,

    success: p.semanticSuccess,
    onSuccess: p.onPrimary,

    selected: p.surfaceContainerLow,
    onSelected: p.primary,

    disabled: p.surfaceContainerHighest,
    onDisabled: p.outline,

    loading: p.surfaceContainer,

    outline: p.outline,
    outlineVariant: p.outlineVariant,
    surfaceContainerLowest: p.surfaceContainerLowest,
    surfaceContainerLow: p.surfaceContainerLow,
    surfaceContainer: p.surfaceContainer,
    surfaceContainerHigh: p.surfaceContainerHigh,
    surfaceContainerHighest: p.surfaceContainerHighest,
    mapBackground: p.mapBackground,
  } as const;
}

/**
 * Semantic colors — the only public color API. Covers the required states
 * (default/pressed/focused/selected/disabled/loading/success/warning/error)
 * plus the Material-style "container" vocabulary the Stitch screens use
 * throughout (`primaryContainer`, `surfaceContainer*`, `tertiary*`, ...).
 */
export const colors = buildSemanticColors(palette);

export type ColorToken = keyof typeof colors;

// ---------------------------------------------------------------------------
// Typography: fontSize, fontWeight and lineHeight are kept as independent
// scales (each usable on its own, e.g. `font-semibold` without `text-title`),
// then composed — never retyped — into the `typography` Tailwind fontSize
// entries components actually use (`text-body`, `text-title`, ...).
//
// Font family: Stitch specifies "Inter" for every text role
// (`stitch-screen-inventory.md` §0) plus Material Symbols Outlined for
// icons (handled by `@expo/vector-icons`'s `MaterialSymbols`/`MaterialIcons`
// set, not a font token). `assets/fonts/` is still empty and Inter is not
// yet bundled/loaded via `expo-font` — components fall back to the system
// font until that's wired up; no native font name is guessed here.
// ---------------------------------------------------------------------------

export const fontSize = {
  labelSm: "11px",
  bodyMd: "14px",
  labelLg: "14px",
  labelMd: "12px",
  headlineMd: "18px",
  headlineLgMobile: "20px",
  bodyLg: "16px",
  headlineLg: "24px",
  displayLg: "32px",
} as const;

export const lineHeight = {
  labelSm: "16px",
  bodyMd: "20px",
  labelLg: "20px",
  labelMd: "16px",
  headlineMd: "24px",
  headlineLgMobile: "28px",
  bodyLg: "24px",
  headlineLg: "32px",
  displayLg: "40px",
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
 * Names kept from the pre-Stitch scale (`caption`/`body`/`label`/`title`/
 * `headline`) so existing components need no rename, each repointed to its
 * closest Stitch role (`label-sm`/`body-lg`/`label-lg`/`headline-lg`/
 * `display-lg`); 4 new roles Stitch uses that had no prior equivalent are
 * added alongside (`bodyMd`/`labelMd`/`headlineMd`/`headlineLgMobile`).
 * `body`/`label` are numerically identical to the previous provisional
 * tokens (Stitch's `body-lg`/`label-lg` already matched); `title`/`headline`
 * change weight and gain letter-spacing to match Stitch's `headline-lg`/
 * `display-lg` exactly.
 */
export const typography = {
  caption: [
    fontSize.labelSm,
    { lineHeight: lineHeight.labelSm, fontWeight: fontWeight.regular },
  ],
  body: [
    fontSize.bodyLg,
    { lineHeight: lineHeight.bodyLg, fontWeight: fontWeight.regular },
  ],
  bodyMd: [
    fontSize.bodyMd,
    { lineHeight: lineHeight.bodyMd, fontWeight: fontWeight.regular },
  ],
  label: [
    fontSize.labelLg,
    {
      lineHeight: lineHeight.labelLg,
      fontWeight: fontWeight.medium,
      letterSpacing: "0.1px",
    },
  ],
  labelMd: [
    fontSize.labelMd,
    {
      lineHeight: lineHeight.labelMd,
      fontWeight: fontWeight.medium,
      letterSpacing: "0.5px",
    },
  ],
  title: [
    fontSize.headlineLg,
    { lineHeight: lineHeight.headlineLg, fontWeight: fontWeight.medium },
  ],
  headlineMd: [
    fontSize.headlineMd,
    { lineHeight: lineHeight.headlineMd, fontWeight: fontWeight.medium },
  ],
  headlineLgMobile: [
    fontSize.headlineLgMobile,
    {
      lineHeight: lineHeight.headlineLgMobile,
      fontWeight: fontWeight.medium,
    },
  ],
  headline: [
    fontSize.displayLg,
    {
      lineHeight: lineHeight.displayLg,
      fontWeight: fontWeight.semibold,
      letterSpacing: "-0.02em",
    },
  ],
} as const;

export type TypographyToken = keyof typeof typography;

// ---------------------------------------------------------------------------
// Spacing, radius, border width — kept as the same 4px-rhythm scale already
// in use. Radius is extended to Stitch's fuller scale (cards use 16px,
// bottom sheets 24px — the previous 3-step scale had no room for either).
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
  lg: "12px",
  xl: "16px",
  "2xl": "24px",
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
//
// Values approximate Stitch's own elevation spec (`stitch-screen-inventory.md`
// §0, "Elevation & Depth"): Level 2 (cards/pins) is a dark neutral shadow at
// low opacity, not a color-tinted one — `colors.foreground` (`#171C20`) is
// used as the shadow color instead of Stitch's literal `rgba(60,64,67,…)`
// so the single source of truth stays the token file, not a second raw
// color. `sheet` is new: Stitch's Level 3 (bottom sheets) is the only
// upward-directed shadow in the system, which the pre-existing 3-level
// scale (all downward) had no slot for.
// ---------------------------------------------------------------------------

function withAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export type ShadowLevel = "none" | "sm" | "md" | "lg" | "sheet";

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
      shadowOpacity: 0.15,
      shadowRadius: 3,
    },
    android: { elevation: 2 },
    boxShadow: `0px 1px 2px ${withAlpha(colors.foreground, 0.3)}, 0px 1px 3px 1px ${withAlpha(colors.foreground, 0.15)}`,
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
  /** Upward shadow for bottom sheets/panels (Stitch Level 3). */
  sheet: {
    ios: {
      shadowColor: colors.foreground,
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
    },
    android: { elevation: 8 },
    boxShadow: `0px -2px 12px ${withAlpha(colors.foreground, 0.1)}`,
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
