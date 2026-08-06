import { View } from "react-native";

/**
 * "You are here" dot: the standard blue disc with a white collar and a soft
 * halo, drawn at the device's own fix on the map ("quando l'utente viene
 * geolocalizzato, deve comparire il punto sulla mappa dove si trova").
 *
 * Non-interactive but *not* hidden from screen readers: it is the only thing
 * on the map conveying where the user is, and the surrounding screen never
 * states it — unlike a decorative icon inside an already-labelled button
 * (`Icon`), there is no other element carrying this meaning.
 */
export function UserLocationMarker() {
  return (
    <View
      pointerEvents="none"
      accessible
      accessibilityRole="image"
      accessibilityLabel="La tua posizione"
      className="h-10 w-10 items-center justify-center rounded-full bg-secondaryFixed"
    >
      <View className="h-5 w-5 items-center justify-center rounded-full bg-surface shadow-md">
        <View className="h-3.5 w-3.5 rounded-full bg-primary" />
      </View>
    </View>
  );
}
