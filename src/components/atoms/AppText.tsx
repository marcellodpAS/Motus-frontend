import type { ReactNode } from "react";
import { Text, type TextProps } from "react-native";

import type { ColorToken, TypographyToken } from "@/theme";

/**
 * Literal lookup (not template-literal interpolation): Tailwind/NativeWind
 * discovers utility classes by scanning source files for exact string
 * tokens, so `text-${variant}` would silently produce unstyled text for
 * every value never spelled out verbatim elsewhere in the scanned files.
 */
const VARIANT_CLASSNAMES: Record<TypographyToken, string> = {
  caption: "text-caption",
  body: "text-body",
  bodyMd: "text-bodyMd",
  label: "text-label",
  labelMd: "text-labelMd",
  title: "text-title",
  headlineMd: "text-headlineMd",
  headlineLgMobile: "text-headlineLgMobile",
  headline: "text-headline",
};

const COLOR_CLASSNAMES = {
  foreground: "text-foreground",
  muted: "text-muted",
  primary: "text-primary",
  onPrimary: "text-onPrimary",
  primaryContainer: "text-primaryContainer",
  onPrimaryContainer: "text-onPrimaryContainer",
  secondary: "text-secondary",
  onSecondary: "text-onSecondary",
  secondaryContainer: "text-secondaryContainer",
  onSecondaryContainer: "text-onSecondaryContainer",
  tertiary: "text-tertiary",
  onTertiary: "text-onTertiary",
  tertiaryContainer: "text-tertiaryContainer",
  onTertiaryContainer: "text-onTertiaryContainer",
  danger: "text-danger",
  onDanger: "text-onDanger",
  errorContainer: "text-errorContainer",
  onErrorContainer: "text-onErrorContainer",
  warning: "text-warning",
  onWarning: "text-onWarning",
  success: "text-success",
  onSuccess: "text-onSuccess",
  onSelected: "text-onSelected",
  onDisabled: "text-onDisabled",
  outline: "text-outline",
} as const satisfies Partial<Record<ColorToken, string>>;

export type AppTextColor = keyof typeof COLOR_CLASSNAMES;

export interface AppTextProps extends TextProps {
  children: ReactNode;
  /** Typography scale token (`@/theme`). Defaults to `"body"`. */
  variant?: TypographyToken;
  /** Semantic text color token (`@/theme`). Defaults to `"foreground"`. */
  color?: AppTextColor;
  className?: string;
}

/** Text primitive: typography/color come from semantic tokens only, no business logic. */
export function AppText({
  children,
  variant = "body",
  color = "foreground",
  className,
  ...props
}: AppTextProps) {
  return (
    <Text
      className={`${VARIANT_CLASSNAMES[variant]} ${COLOR_CLASSNAMES[color]} ${className ?? ""}`.trim()}
      {...props}
    >
      {children}
    </Text>
  );
}
