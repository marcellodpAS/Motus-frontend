import type { ReactNode } from "react";
import { Text, type TextProps } from "react-native";

type AppTextProps = TextProps & {
  children: ReactNode;
  className?: string;
};

/** A minimal, reusable text primitive with semantic default styling. */
export function AppText({ children, className, ...props }: AppTextProps) {
  return (
    <Text className={`text-body text-foreground ${className ?? ""}`} {...props}>
      {children}
    </Text>
  );
}
