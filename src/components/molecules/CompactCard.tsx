import type { ReactNode } from "react";
import { View } from "react-native";

import { getShadowStyle } from "@/theme";

export interface CompactCardProps {
  children: ReactNode;
  className?: string;
}

/**
 * Generic elevated container. Combines the `shadow-sm` className with
 * `getShadowStyle()` because NativeWind's `shadow-*` classNames alone never
 * set Android `elevation` (see `src/theme/tokens.ts`).
 */
export function CompactCard({ children, className }: CompactCardProps) {
  return (
    <View
      style={getShadowStyle("sm")}
      className={`rounded-md border-hairline border-border bg-surface p-md shadow-sm ${className ?? ""}`.trim()}
    >
      {children}
    </View>
  );
}
