import { Pressable } from "react-native";

import { AppText, type AppTextColor } from "@/components/atoms/AppText";
import { Icon, type IconName } from "@/components/atoms/Icon";

export type ActionPillVariant = "filled" | "outline";

export interface ActionPillProps {
  icon: IconName;
  label: string;
  onPress?: () => void;
  variant?: ActionPillVariant;
  disabled?: boolean;
}

const VARIANT_CLASSNAMES: Record<ActionPillVariant, string> = {
  filled: "bg-primaryContainer",
  outline: "border-hairline border-border bg-surface",
};

const VARIANT_TEXT_COLOR: Record<ActionPillVariant, AppTextColor> = {
  filled: "onPrimaryContainer",
  outline: "primary",
};

/** Pill-shaped action button (Stitch's Navigate/Report Price/Save row, `stitch-screen-inventory.md` §3). A real `Pressable`, not clickable text, so the whole pill is the hit target. */
export function ActionPill({
  icon,
  label,
  onPress,
  variant = "outline",
  disabled = false,
}: ActionPillProps) {
  const color = disabled ? "onDisabled" : VARIANT_TEXT_COLOR[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className={`min-h-touch-comfortable flex-1 flex-row items-center justify-center gap-xs rounded-full px-sm ${
        disabled ? "bg-disabled" : VARIANT_CLASSNAMES[variant]
      }`}
    >
      <Icon name={icon} color={color} size={18} />
      <AppText variant="label" color={color} numberOfLines={1}>
        {label}
      </AppText>
    </Pressable>
  );
}
