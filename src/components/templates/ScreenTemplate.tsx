import type { ReactNode } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppHeader } from "@/components/organisms/AppHeader";

export interface ScreenTemplateProps {
  title: string;
  onBack?: () => void;
  headerRight?: ReactNode;
  children: ReactNode;
  contentClassName?: string;
}

/** Base screen shell: safe area + AppHeader + a single non-scrolling content region. */
export function ScreenTemplate({
  title,
  onBack,
  headerRight,
  children,
  contentClassName = "px-md",
}: ScreenTemplateProps) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <AppHeader title={title} onBack={onBack} right={headerRight} />
      <View className={`flex-1 ${contentClassName}`.trim()}>{children}</View>
    </SafeAreaView>
  );
}
