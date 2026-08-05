import { useRouter } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "@/components/atoms/AppText";
import { Button } from "@/components/atoms/Button";

export default function SetupScreen() {
  const router = useRouter();

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
        <Button onPress={() => router.push("/stations")} className="mt-md">
          Cerca impianti
        </Button>
      </View>
    </SafeAreaView>
  );
}
