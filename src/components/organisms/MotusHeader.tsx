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
  /** Where the logo sits when there's no back button: "left" (Previsioni Pro) or "center" (Mappa Motus). */
  logoPosition?: "left" | "center";
  /** Mappa Motus header floats over the map with no opaque background/border. */
  transparent?: boolean;
}

/**
 * Shared top bar reproducing the 3 header layouts observed across all 4
 * Stitch screens (`stitch-screen-inventory.md`): "standard" (back + small
 * logo mark + title, e.g. Dettaglio Stazione), "search-bar" (logo left +
 * inline search pill, e.g. Previsioni Pro) and "overlay" (transparent,
 * centered logo, e.g. Mappa Motus). One organism, not three, since all
 * three share the same trailing profile button and the same 56px bar.
 */
export function MotusHeader({
  title,
  onBack,
  showSearchBar = false,
  showSearchIcon = false,
  onProfilePress,
  logoPosition = "left",
  transparent = false,
}: MotusHeaderProps) {
  const router = useRouter();
  const handleSearchPress = () => router.push("/stations");

  const containerClassName = transparent
    ? "absolute top-0 left-0 right-0 z-10 px-md pb-sm"
    : "border-b-hairline border-border bg-surface px-md pb-sm shadow-sm";

  return (
    <SafeAreaView
      edges={transparent ? ["top"] : []}
      className={containerClassName}
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
            {logoPosition === "left" ? <MotusLogo size={20} /> : null}
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
              <View className="flex-1 flex-row justify-center">
                {logoPosition === "center" ? <MotusLogo size={20} /> : null}
              </View>
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
