import { useRouter } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "@/components/atoms/AppText";
import { Button } from "@/components/atoms/Button";

/**
 * Home / navigation shell (VS6, docs/motus/feature-backlog.md): the single
 * entry point that links the three independent screens (S01/S02/S04, all
 * built by this point in the backlog) to their common destination (S03).
 * ADR-0005: no tab bar/drawer — a plain Stack with one home route is the
 * simplest shell that satisfies "every entry point reachable, none
 * orphaned" without designing a definitive information architecture.
 */
export default function HomeRoute() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="flex-1 items-center justify-center gap-md bg-background px-md">
        <AppText
          accessibilityRole="header"
          className="text-title font-semibold text-primary"
        >
          Motus
        </AppText>
        <AppText className="text-center text-muted">
          Prezzi carburante in tempo reale
        </AppText>
        <View className="w-full gap-sm">
          <Button onPress={() => router.push("/stations")}>
            Cerca impianti
          </Button>
          <Button onPress={() => router.push("/prices")}>
            Cerca prezzi carburante
          </Button>
          <Button onPress={() => router.push("/nearby")}>
            Impianti vicini a me
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
