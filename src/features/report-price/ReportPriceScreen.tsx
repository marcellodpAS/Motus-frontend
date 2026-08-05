import { useRouter } from "expo-router";
import { useState } from "react";
import { Switch, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "@/components/atoms/AppText";
import { Button } from "@/components/atoms/Button";
import { Icon } from "@/components/atoms/Icon";
import { TextInput } from "@/components/atoms/TextInput";
import { LoadingPanel } from "@/components/organisms/LoadingPanel";
import { MotusHeader } from "@/components/organisms/MotusHeader";
import { useStationDetail } from "@/features/station-detail/useStationDetail";
import { stationTitle } from "@/services/motus/stationDisplay";
import { colors } from "@/theme";

export interface ReportPriceScreenProps {
  id: string;
}

/**
 * Reproduces Segnala Prezzo (`stitch-screen-inventory.md` §2, Stitch ID
 * `e0cd4605476d4da8b000e7366d0aff69`), reachable from Dettaglio Stazione's
 * "Report Price" action. The backend has **no write endpoint** — `POST`
 * returns `501` (`source-requirements-inventory.md` §4) — so submitting
 * cannot be faked as a network success (`stitch-implementation-gap.md`
 * row 7): the form validates and renders an explicit "not available yet"
 * outcome instead of pretending to persist anything.
 */
export function ReportPriceScreen({ id }: ReportPriceScreenProps) {
  const router = useRouter();
  const { status, station } = useStationDetail(id);

  const [petrol, setPetrol] = useState("");
  const [diesel, setDiesel] = useState("");
  const [lpg, setLpg] = useState("");
  const [mismatch, setMismatch] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const hasAnyValue = petrol.trim() || diesel.trim() || lpg.trim();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <MotusHeader title="Segnala Prezzo" onBack={() => router.back()} />
      <View className="flex-1 gap-md px-md py-md">
        {status === "loading" ? <LoadingPanel /> : null}

        {status === "success" && station ? (
          <View className="flex-row items-center gap-md rounded-xl border-hairline border-border bg-surface p-md">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-surfaceContainer">
              <Icon name="local-gas-station" color="primary" />
            </View>
            <View>
              <AppText variant="headlineMd">{stationTitle(station)}</AppText>
              <AppText variant="bodyMd" color="muted">
                {station.indirizzo ||
                  `${station.comune} (${station.provincia})`}
              </AppText>
            </View>
          </View>
        ) : null}

        <View className="gap-md rounded-xl border-hairline border-border bg-surface p-lg">
          <TextInput
            label="Benzina"
            value={petrol}
            onChangeText={setPetrol}
            placeholder="1.85"
            keyboardType="decimal-pad"
          />
          <TextInput
            label="Diesel"
            value={diesel}
            onChangeText={setDiesel}
            placeholder="1.92"
            keyboardType="decimal-pad"
          />
          <TextInput
            label="GPL"
            value={lpg}
            onChangeText={setLpg}
            placeholder="0.85"
            keyboardType="decimal-pad"
          />

          <View className="h-px bg-border" />

          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-md">
              <AppText variant="label">Prezzo non corretto</AppText>
              <AppText variant="bodyMd" color="muted">
                Segnala una discrepanza significativa
              </AppText>
            </View>
            <Switch
              value={mismatch}
              onValueChange={setMismatch}
              accessibilityLabel="Prezzo non corretto"
              accessibilityRole="switch"
              trackColor={{
                false: colors.surfaceContainerHigh,
                true: colors.primary,
              }}
              thumbColor={colors.surface}
            />
          </View>
        </View>

        {submitted ? (
          <View className="gap-xs rounded-xl border-hairline border-outlineVariant bg-surfaceContainerLow p-md">
            <AppText variant="label" color="foreground">
              Invio non disponibile in questa versione
            </AppText>
            <AppText variant="bodyMd" color="muted">
              Il backend di Motus non espone ancora un endpoint per ricevere
              segnalazioni di prezzo (nessuna route di scrittura esiste oggi).
              La segnalazione non è stata inviata da nessuna parte.
            </AppText>
          </View>
        ) : (
          <Button disabled={!hasAnyValue} onPress={() => setSubmitted(true)}>
            Invia segnalazione
          </Button>
        )}
      </View>
    </SafeAreaView>
  );
}
