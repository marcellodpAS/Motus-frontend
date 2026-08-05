import { useRouter } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "@/components/atoms/AppText";
import { Button } from "@/components/atoms/Button";
import { Icon } from "@/components/atoms/Icon";
import { MotusHeader } from "@/components/organisms/MotusHeader";

/**
 * Tab "Pro" (Task 19): reproduces the header/title/shell of Previsioni Pro
 * (`stitch-screen-inventory.md` §4, Stitch ID
 * `0acf7ae776d74a5ba6763b0dd3a20fd2`), but **not** its recommendation card,
 * trend chart or predicted-station list — `stitch-implementation-gap.md`
 * row 8: the backend deletes and re-inserts `prices` on every import
 * (`source-requirements-inventory.md` §2), so no price history is ever
 * persisted and no prediction endpoint exists. Rendering Stitch's example
 * numbers ("-$0.12/gallon", "Wait to Fuel Up") as if real would violate
 * the same "never fabricate data" rule `StationDetailScreen` already
 * follows — shown here as an explicit unavailable state instead.
 */
export function ProPredictionsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <MotusHeader showSearchBar />
      <View className="flex-1 px-md pt-sm">
        <View className="mb-md flex-row items-center gap-xs px-xs">
          <Icon name="insights" color="primaryContainer" />
          <AppText accessibilityRole="header" variant="headlineLgMobile">
            Analisi predittiva
          </AppText>
        </View>

        <View className="items-center gap-md rounded-xl border-hairline border-border bg-surface p-lg">
          <Icon name="trending-down" color="outline" size={40} />
          <AppText variant="headlineMd" className="text-center">
            Previsioni non ancora disponibili
          </AppText>
          <AppText color="muted" className="text-center">
            Il backend non conserva ancora uno storico dei prezzi (ogni
            importazione giornaliera sostituisce i prezzi precedenti): senza
            dati storici non è possibile calcolare una tendenza o una
            raccomandazione reale. Questa sezione mostrerà previsioni appena il
            backend fornirà uno storico prezzi.
          </AppText>
          <Button onPress={() => router.push("/")}>Vai alla mappa</Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
