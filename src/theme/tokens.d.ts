declare const tokens: {
  readonly colors: {
    readonly background: "#F8FAFC";
    readonly surface: "#FFFFFF";
    readonly primary: "#2563EB";
    readonly foreground: "#0F172A";
    readonly muted: "#64748B";
    readonly border: "#E2E8F0";
  };
  readonly spacing: {
    readonly xs: "4px";
    readonly sm: "8px";
    readonly md: "16px";
    readonly lg: "24px";
    readonly xl: "32px";
  };
  readonly typography: {
    readonly body: readonly ["16px", { readonly lineHeight: "24px" }];
    readonly title: readonly [
      "24px",
      { readonly lineHeight: "32px"; readonly fontWeight: "600" },
    ];
  };
};

export = tokens;
