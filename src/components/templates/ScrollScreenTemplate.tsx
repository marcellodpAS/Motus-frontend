import type { ReactNode } from "react";
import { ScrollView, View } from "react-native";

import {
  ScreenTemplate,
  type ScreenTemplateProps,
} from "@/components/templates/ScreenTemplate";

export interface ScrollScreenTemplateProps extends Omit<
  ScreenTemplateProps,
  "contentClassName" | "children"
> {
  children: ReactNode;
}

/** ScreenTemplate variant for content taller than the viewport (e.g. station detail, S03). */
export function ScrollScreenTemplate({
  children,
  ...screenProps
}: ScrollScreenTemplateProps) {
  return (
    <ScreenTemplate {...screenProps} contentClassName="">
      <ScrollView className="flex-1">
        <View className="gap-md px-md py-md">{children}</View>
      </ScrollView>
    </ScreenTemplate>
  );
}
