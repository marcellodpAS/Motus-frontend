import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "@/components/atoms/AppText";
import { Icon } from "@/components/atoms/Icon";
import { MotusHeader } from "@/components/organisms/MotusHeader";

/**
 * Tab "Profile" (Task 19, `stitch-implementation-gap.md` row 11):
 * `blocked-by-requirement` — no authentication or user identity exists in
 * any source (`source-requirements-inventory.md` §5, consistent with the
 * same conclusion already reached in `mobile-completion-matrix.md` Task
 * 18). The tab is reachable (matching every Stitch header's profile icon
 * and the bottom nav "Profile" tab), but its content is an explicit,
 * honest placeholder — never a fabricated user/account.
 */
export function ProfileScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <MotusHeader logoPosition="left" />
      <View className="flex-1 items-center justify-center gap-sm px-lg">
        <Icon name="person" color="outline" size={48} />
        <AppText
          accessibilityRole="header"
          variant="headlineMd"
          className="text-center"
        >
          Profilo non disponibile
        </AppText>
        <AppText color="muted" className="text-center">
          Motus non richiede ancora un account: nessuna autenticazione è
          prevista dalle specifiche del backend.
        </AppText>
      </View>
    </SafeAreaView>
  );
}
