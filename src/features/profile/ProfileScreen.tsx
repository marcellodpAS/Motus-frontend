import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "@/components/atoms/AppText";
import { Icon } from "@/components/atoms/Icon";
import { MotusHeader } from "@/components/organisms/MotusHeader";
import { KNOWN_FUEL_CATEGORIES } from "@/services/motus/fuelPreference";
import { useFuelPreferencesStore } from "@/stores/useFuelPreferencesStore";

/**
 * Tab "Profile" (Task 19, `stitch-implementation-gap.md` row 11):
 * `blocked-by-requirement` for an actual account — no authentication or
 * user identity exists in any source (`source-requirements-inventory.md`
 * §5). What *is* real and device-local is a preference setting (Task 19
 * follow-up: "vorrei almeno delle impostazioni di base, come il
 * carburante preferito") — selecting one or more fuel types here narrows
 * the price shown on every list/map screen to that preference, same
 * substring-match semantics the backend's own `carburante` filter already
 * uses (`fuelPreference.ts`). No fabricated account content is shown.
 */
export function ProfileScreen() {
  const fuels = useFuelPreferencesStore((state) => state.fuels);
  const toggle = useFuelPreferencesStore((state) => state.toggle);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <MotusHeader logoPosition="left" />
      <ScrollView className="flex-1 px-md py-md">
        <View className="mb-lg items-center gap-sm px-lg">
          <Icon name="person" color="outline" size={40} />
          <AppText
            accessibilityRole="header"
            variant="headlineMd"
            className="text-center"
          >
            Profilo non disponibile
          </AppText>
          <AppText color="muted" className="text-center">
            Motus non richiede ancora un account: nessuna autenticazione è
            prevista dalle specifiche del backend. Le preferenze qui sotto
            restano solo su questo dispositivo.
          </AppText>
        </View>

        <View className="gap-sm">
          <AppText variant="label">Carburante preferito</AppText>
          <AppText variant="bodyMd" color="muted">
            Seleziona uno o più carburanti: i prezzi mostrati nelle schermate di
            ricerca e sulla mappa verranno filtrati di conseguenza. Nessuna
            selezione = prezzo più conveniente tra tutti i carburanti
            (comportamento attuale).
          </AppText>
          <View className="flex-row flex-wrap gap-sm pt-sm">
            {KNOWN_FUEL_CATEGORIES.map((fuel) => {
              const selected = fuels.includes(fuel);
              return (
                <Pressable
                  key={fuel}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}
                  accessibilityLabel={fuel}
                  onPress={() => toggle(fuel)}
                  className={`min-h-touch-comfortable flex-row items-center gap-xs rounded-full border-hairline px-md ${
                    selected
                      ? "border-primary bg-selected"
                      : "border-border bg-surface"
                  }`}
                >
                  {selected ? (
                    <Icon name="check" color="primary" size={14} />
                  ) : null}
                  <AppText
                    variant="label"
                    color={selected ? "primary" : "foreground"}
                  >
                    {fuel}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
