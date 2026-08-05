import type { PlatformCapabilities } from "../types";

/**
 * iOS and Android share one capability profile: both are touch phones with
 * a software keyboard and full Expo Router navigation, and no product
 * requirement distinguishes them capability-wise today.
 *
 * voiceInput and backgroundAudio are false not because the OS lacks them
 * (Siri/Google Assistant and background audio both exist on-device) but
 * because Motus integrates no speech or audio library — both are listed
 * out of scope in docs/motus/product-requirements.md §13, and
 * docs/motus/repository-audit.md confirms neither is installed. This is a
 * project-state fact, not a device limitation: revisit if either capability
 * is ever added.
 */
export const MOBILE_CAPABILITIES: PlatformCapabilities = {
  touchInput: true,
  rotaryInput: false,
  voiceInput: false,
  compactDisplay: false,
  automotive: false,
  textEntry: true,
  complexNavigation: true,
  backgroundAudio: false,
};
