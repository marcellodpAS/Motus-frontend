import { useState } from "react";
import {
  Pressable,
  type GestureResponderEvent,
  type PressableProps,
} from "react-native";

import { AppText, type AppTextColor } from "./AppText";
import { Spinner } from "./Spinner";

export type ButtonVariant = "primary" | "danger";

/**
 * Literal per-variant class names (see `AppText`'s note on why these are
 * spelled out rather than built with a template literal). Only variants
 * backed by a real pressed-state token (`primaryPressed`/`dangerPressed`
 * in `@/theme`) are offered — a "secondary" variant would have no pressed
 * token to render and would be guessing.
 */
const CONTAINER_CLASSNAMES: Record<ButtonVariant, string> = {
  primary: "bg-primary",
  danger: "bg-danger",
};
const CONTAINER_PRESSED_CLASSNAMES: Record<ButtonVariant, string> = {
  primary: "bg-primaryPressed",
  danger: "bg-dangerPressed",
};
// Only `primaryDisabled` exists in @/theme; both variants fall back to the
// generic `disabled` token rather than inventing a `dangerDisabled` value.
const CONTAINER_DISABLED_CLASSNAME = "bg-disabled";

const LABEL_COLOR: Record<ButtonVariant, AppTextColor> = {
  primary: "onPrimary",
  danger: "onDanger",
};
const LABEL_DISABLED_COLOR: AppTextColor = "onDisabled";

export interface ButtonProps extends Omit<
  PressableProps,
  "children" | "disabled"
> {
  children: string;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

/** Pressable action atom: solid fill per semantic variant, no business logic. */
export function Button({
  children,
  variant = "primary",
  disabled = false,
  loading = false,
  className,
  onPressIn,
  onPressOut,
  ...props
}: ButtonProps) {
  const [pressed, setPressed] = useState(false);
  const isDisabled = disabled || loading;

  const containerClassName = isDisabled
    ? CONTAINER_DISABLED_CLASSNAME
    : pressed
      ? CONTAINER_PRESSED_CLASSNAMES[variant]
      : CONTAINER_CLASSNAMES[variant];
  const labelColor = isDisabled ? LABEL_DISABLED_COLOR : LABEL_COLOR[variant];

  const handlePressIn = (event: GestureResponderEvent) => {
    setPressed(true);
    onPressIn?.(event);
  };
  const handlePressOut = (event: GestureResponderEvent) => {
    setPressed(false);
    onPressOut?.(event);
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      className={`min-h-touch-comfortable min-w-touch-comfortable flex-row items-center justify-center gap-sm rounded-full px-md ${containerClassName} ${className ?? ""}`.trim()}
      {...props}
    >
      {loading ? <Spinner size="sm" color={labelColor} /> : null}
      <AppText variant="label" color={labelColor}>
        {children}
      </AppText>
    </Pressable>
  );
}
