import { Linking } from "react-native";

/**
 * Opens the device's external maps app for turn-by-turn directions.
 * Stitch's "Navigate" action (Dettaglio Stazione, Mappa Motus) has no
 * defined target in the mockup itself — the universal Google Maps
 * directions URL is used because it resolves to the native Maps app on
 * both iOS and Android when installed, and to Google Maps in a browser
 * otherwise, without requiring a native maps SDK
 * (`stitch-implementation-gap.md` row 9).
 */
export function buildDirectionsUrl(
  latitude: number,
  longitude: number,
): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
}

export async function openExternalNavigation(
  latitude: number,
  longitude: number,
): Promise<void> {
  await Linking.openURL(buildDirectionsUrl(latitude, longitude));
}
