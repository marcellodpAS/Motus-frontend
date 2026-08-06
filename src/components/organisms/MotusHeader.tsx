import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "@/components/atoms/AppText";
import { Icon } from "@/components/atoms/Icon";
import { MotusLogo } from "@/components/atoms/MotusLogo";
import { HeaderIconButton } from "@/components/molecules/HeaderIconButton";

export interface MotusHeaderProps {
  /** Shown next to a small logo mark when a back action is present (Stitch "Standard Header": Dettaglio Stazione, Segnala Prezzo). */
  title?: string;
  onBack?: () => void;
  /** Renders a tappable search-bar placeholder (Stitch Previsioni Pro header) instead of a bare icon; both route to S01. */
  showSearchBar?: boolean;
  /** Renders a bare search icon button (Stitch Mappa Motus, Dettaglio Stazione, Segnala Prezzo headers). */
  showSearchIcon?: boolean;
  onProfilePress?: () => void;
}

/**
 * Shared top bar. Two layouts: "standard" (back + small logo mark + title,
 * e.g. Dettaglio Stazione) and "logo left" (wordmark, optional inline search
 * pill, trailing actions) — one organism, not two, since both share the same
 * trailing profile button and the same 56px bar.
 *
 * Stitch also showed the Map screen with a transparent bar and a centred logo
 * (`stitch-screen-inventory.md` §5). That variant is gone: on a real device
 * the Map header reading differently from every other screen's was reported
 * as inconsistent, and the centred mark could never actually sit on the
 * screen's centre — laid out between an empty leading slot and two trailing
 * buttons, it always drifted left by half the buttons' width.
 */
export function MotusHeader({
  title,
  onBack,
  showSearchBar = false,
  showSearchIcon = false,
  onProfilePress,
}: MotusHeaderProps) {
  const router = useRouter();
  const handleSearchPress = () => router.push("/stations");

  return (
    <SafeAreaView
      edges={[]}
      className="border-b-hairline border-border bg-surface px-md pb-sm shadow-sm"
    >
      <View className="min-h-touch-comfortable flex-row items-center gap-sm pt-sm">
        {onBack ? (
          <>
            <HeaderIconButton
              icon="arrow-back"
              accessibilityLabel="Indietro"
              onPress={onBack}
            />
            <MotusLogo markOnly size={20} />
            <AppText
              accessibilityRole="header"
              variant="headlineMd"
              numberOfLines={1}
              className="flex-1"
            >
              {title}
            </AppText>
          </>
        ) : (
          <>
            <MotusLogo size={20} />
            {showSearchBar ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cerca impianti di rifornimento"
                onPress={handleSearchPress}
                className="min-h-touch-comfortable flex-1 flex-row items-center gap-sm rounded-full bg-surfaceContainerLow px-md"
              >
                <Icon name="search" color="outline" size={20} />
                <AppText color="muted">Cerca impianti…</AppText>
              </Pressable>
            ) : (
              <View className="flex-1" />
            )}
            {showSearchIcon ? (
              <HeaderIconButton
                icon="search"
                accessibilityLabel="Cerca impianti"
                onPress={handleSearchPress}
              />
            ) : null}
          </>
        )}
        <HeaderIconButton
          icon="person"
          accessibilityLabel="Profilo"
          onPress={onProfilePress}
        />
      </View>
    </SafeAreaView>
  );
}
