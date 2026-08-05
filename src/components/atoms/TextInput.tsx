import { useState } from "react";
import {
  TextInput as RNTextInput,
  View,
  type TextInputProps as RNTextInputProps,
} from "react-native";

import { AppText } from "./AppText";

type FocusHandler = NonNullable<RNTextInputProps["onFocus"]>;
type BlurHandler = NonNullable<RNTextInputProps["onBlur"]>;

type FieldState = "default" | "focused" | "error" | "disabled";

const FIELD_STATE_CLASSNAMES: Record<FieldState, string> = {
  default: "border-hairline border-border bg-surface text-foreground",
  focused: "border-hairline border-borderFocused bg-surface text-foreground",
  error: "border-hairline border-danger bg-surface text-foreground",
  disabled: "border-hairline border-border bg-disabled text-onDisabled",
};

export interface TextInputProps extends Omit<RNTextInputProps, "editable"> {
  /** Visible caption rendered above the field. */
  label?: string;
  /** Validation message rendered below the field and folded into the accessible name. */
  error?: string;
  disabled?: boolean;
  className?: string;
}

/** Single-line text field atom: token-driven border/background per state, no form/validation logic. */
export function TextInput({
  label,
  error,
  disabled = false,
  className,
  onFocus,
  onBlur,
  accessibilityLabel,
  ...props
}: TextInputProps) {
  const [focused, setFocused] = useState(false);

  const state: FieldState = disabled
    ? "disabled"
    : error
      ? "error"
      : focused
        ? "focused"
        : "default";

  const handleFocus: FocusHandler = (event) => {
    setFocused(true);
    onFocus?.(event);
  };
  const handleBlur: BlurHandler = (event) => {
    setFocused(false);
    onBlur?.(event);
  };

  return (
    <View className="gap-xs">
      {label ? (
        <AppText variant="label" color="muted">
          {label}
        </AppText>
      ) : null}
      <RNTextInput
        editable={!disabled}
        onFocus={handleFocus}
        onBlur={handleBlur}
        accessibilityLabel={
          accessibilityLabel ??
          ([label, error].filter(Boolean).join(". ") || undefined)
        }
        accessibilityState={{ disabled }}
        className={`min-h-touch-comfortable rounded-md px-md text-body placeholder:text-muted ${FIELD_STATE_CLASSNAMES[state]} ${className ?? ""}`.trim()}
        {...props}
      />
      {error ? (
        <AppText variant="caption" color="danger">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}
