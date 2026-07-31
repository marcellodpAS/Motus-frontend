import { AppText } from "@/components/atoms/AppText";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SetupScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="flex-1 items-center justify-center gap-sm bg-background px-md">
        <AppText
          accessibilityRole="header"
          className="text-title font-semibold text-primary"
        >
          Motus
        </AppText>
        <AppText className="text-center text-muted">Setup completato</AppText>
      </View>
    </SafeAreaView>
  );
}
