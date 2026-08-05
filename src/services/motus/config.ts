import { Platform } from "react-native";

import { ApiConfigError } from "./errors";

const DEFAULT_TIMEOUT_MS = 10_000;

export const apiConfig = {
  timeoutMs: DEFAULT_TIMEOUT_MS,
} as const;

/**
 * Setup hints differ by platform because "localhost" resolves to different
 * hosts: the simulator/device itself on iOS, the emulator's own loopback
 * (not the dev machine) on Android.
 */
export function platformSetupHint(os: string): string {
  switch (os) {
    case "android":
      return 'Android Emulator: usa "http://10.0.2.2:<porta>" per raggiungere l\'host. Dispositivo fisico Android: usa l\'IP LAN della macchina di sviluppo, mai "localhost".';
    case "ios":
      return 'iOS Simulator: "http://localhost:<porta>" raggiunge l\'host. Dispositivo fisico iOS: usa l\'IP LAN della macchina di sviluppo, mai "localhost".';
    default:
      return "Imposta un URL raggiungibile dalla piattaforma corrente.";
  }
}

/**
 * Reads EXPO_PUBLIC_API_URL lazily (not at module load) so tests can set
 * process.env per case, and so a missing/invalid value only fails the call
 * that actually needs it.
 */
export function getApiBaseUrl(os: string = Platform.OS): string {
  const raw = process.env.EXPO_PUBLIC_API_URL;

  if (!raw || raw.trim().length === 0) {
    throw new ApiConfigError(
      `EXPO_PUBLIC_API_URL non configurato. Impostalo in .env (vedi .env.example). ${platformSetupHint(os)}`,
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new ApiConfigError(
      `EXPO_PUBLIC_API_URL non è un URL valido: "${raw}".`,
    );
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new ApiConfigError(
      `EXPO_PUBLIC_API_URL deve usare http o https, ricevuto: "${raw}".`,
    );
  }

  return raw.replace(/\/+$/, "");
}
