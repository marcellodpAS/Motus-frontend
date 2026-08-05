import {
  borderWidth,
  colors,
  density,
  fontWeight,
  iconSize,
  radius,
  shadow,
  spacing,
  touchTarget,
  typography,
} from "@/theme";

describe("colors — semantic API", () => {
  it("exposes the required semantic names from the task brief", () => {
    const required = [
      "background",
      "surface",
      "surfaceElevated",
      "foreground",
      "muted",
      "primary",
      "onPrimary",
      "secondary",
      "border",
      "danger",
      "warning",
      "success",
    ] as const;
    for (const name of required) {
      expect(colors).toHaveProperty(name);
      expect(colors[name]).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });

  it("covers pressed/focused/selected/disabled/loading states", () => {
    expect(colors.primaryPressed).not.toBe(colors.primary);
    expect(colors.dangerPressed).not.toBe(colors.danger);
    expect(colors.borderFocused).not.toBe(colors.border);
    expect(colors.selected).not.toBe(colors.background);
    expect(colors.onSelected).toBeDefined();
    expect(colors.disabled).toBeDefined();
    expect(colors.onDisabled).toBeDefined();
    expect(colors.loading).toBeDefined();
  });

  it("does not leak the internal hex palette as a differently-named export", () => {
    // "raw colors must not be the only public API": no export here should
    // expose a palette-style object (scale of numbered shades) directly.
    expect((colors as Record<string, unknown>).palette).toBeUndefined();
  });
});

describe("typography — composed from the atomic scales, not duplicated", () => {
  it("keeps body numerically identical to the previous provisional tokens (Stitch body-lg matches exactly)", () => {
    expect(typography.body).toEqual([
      "16px",
      { lineHeight: "24px", fontWeight: "400" },
    ]);
  });

  it("title matches Stitch's headline-lg (Task 19 — replaces the provisional value)", () => {
    expect(typography.title).toEqual([
      "24px",
      { lineHeight: "32px", fontWeight: "500" },
    ]);
  });

  it("every entry's fontWeight is one of the fontWeight scale's own values", () => {
    const validWeights = new Set(Object.values(fontWeight));
    for (const [, meta] of Object.values(typography)) {
      expect(validWeights.has(meta.fontWeight)).toBe(true);
    }
  });
});

describe("spacing / radius / borderWidth", () => {
  it("keeps the spacing scale unchanged (regression guard)", () => {
    expect(spacing).toEqual({
      xs: "4px",
      sm: "8px",
      md: "16px",
      lg: "24px",
      xl: "32px",
    });
  });

  it("defines a usable radius and borderWidth scale", () => {
    expect(radius.full).toBe("9999px");
    expect(borderWidth.hairline).toBe("1px");
  });
});

describe("density — bundles reference existing scales, automotive is the larger profile", () => {
  it("only defines comfortable and automotive (no invented compact breakpoint)", () => {
    expect(Object.keys(density).sort()).toEqual(["automotive", "comfortable"]);
  });

  it("automotive touch target and icon size are strictly larger than comfortable", () => {
    expect(density.automotive.touchTarget).toBeGreaterThan(
      density.comfortable.touchTarget,
    );
    expect(density.automotive.iconSize).toBeGreaterThan(
      density.comfortable.iconSize,
    );
  });

  it("density values are references into the touchTarget/iconSize/spacing scales, not new numbers", () => {
    expect(density.comfortable.touchTarget).toBe(touchTarget.comfortable);
    expect(density.automotive.touchTarget).toBe(touchTarget.automotive);
    expect(density.comfortable.iconSize).toBe(iconSize.md);
    expect(density.automotive.iconSize).toBe(iconSize.lg);
    expect(density.comfortable.padding).toBe(spacing.md);
    expect(density.automotive.padding).toBe(spacing.xl);
  });
});

describe("shadow table", () => {
  it("'none' has no visible effect on either platform", () => {
    expect(shadow.none.android.elevation).toBe(0);
    expect(shadow.none.ios.shadowOpacity).toBe(0);
  });

  it("elevation increases monotonically with level", () => {
    const levels = ["none", "sm", "md", "lg"] as const;
    const elevations = levels.map((level) => shadow[level].android.elevation);
    expect(elevations).toEqual([...elevations].sort((a, b) => a - b));
    expect(new Set(elevations).size).toBe(elevations.length);
  });
});

describe("Tailwind mapping — the single source of truth actually reaches tailwind.config.js", () => {
  // Loaded exactly the way the tailwindcss/NativeWind build pipeline loads
  // it (through its own jiti-based config loader), not a plain require —
  // this is the real integration point, not a re-implementation of it.
  const { loadConfig } = require("tailwindcss/lib/lib/load-config.js") as {
    loadConfig: (path: string) => {
      theme: { extend: Record<string, unknown> };
    };
  };
  const path = require("path") as typeof import("path");
  const config = loadConfig(
    path.resolve(__dirname, "../../tailwind.config.js"),
  );
  const extend = config.theme.extend;

  it("maps colors, spacing and typography verbatim from the token source", () => {
    expect(extend.colors).toEqual(colors);
    expect(extend.spacing).toEqual(spacing);
    expect(extend.fontSize).toEqual(typography);
  });

  it("maps radius, borderWidth and boxShadow", () => {
    expect(extend.borderRadius).toEqual(radius);
    expect(extend.borderWidth).toEqual(borderWidth);
    expect(extend).toHaveProperty("boxShadow.sm", shadow.sm.boxShadow);
  });

  it("maps icon size to width/height and touch target to minWidth/minHeight, prefixed", () => {
    expect(extend).toHaveProperty("width.icon-md", `${iconSize.md}px`);
    expect(extend).toHaveProperty("height.icon-md", `${iconSize.md}px`);
    expect(extend).toHaveProperty(
      "minWidth.touch-comfortable",
      `${touchTarget.comfortable}px`,
    );
    expect(extend).toHaveProperty(
      "minHeight.touch-automotive",
      `${touchTarget.automotive}px`,
    );
  });

  it("never exposes the internal hex palette as a Tailwind color key", () => {
    expect(extend.colors).not.toHaveProperty("palette");
    expect(extend.colors).not.toHaveProperty("slate900");
  });
});
