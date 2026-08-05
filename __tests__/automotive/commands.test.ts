import { canExecuteCommand, resolveCommandEffect } from "@/automotive/commands";
import type { AutomotiveCommand } from "@/automotive/commands";
import { ANDROID_AUTO_CAPABILITIES } from "@/platform/android-auto/capabilities";
import { MOBILE_CAPABILITIES } from "@/platform/mobile/capabilities";

describe("resolveCommandEffect", () => {
  it("maps refresh-nearby to fetch-nearby", () => {
    expect(resolveCommandEffect({ kind: "refresh-nearby" })).toEqual({
      type: "fetch-nearby",
    });
  });

  it("maps select-place to navigate-to-detail with the same idImpianto", () => {
    expect(
      resolveCommandEffect({ kind: "select-place", idImpianto: 57660 }),
    ).toEqual({ type: "navigate-to-detail", idImpianto: 57660 });
  });

  it("maps back to navigate-back", () => {
    expect(resolveCommandEffect({ kind: "back" })).toEqual({
      type: "navigate-back",
    });
  });

  it("maps voice-search to a voice-search effect carrying the transcript", () => {
    expect(
      resolveCommandEffect({
        kind: "voice-search",
        transcript: "benzina vicino a me",
      }),
    ).toEqual({ type: "voice-search", transcript: "benzina vicino a me" });
  });
});

describe("canExecuteCommand", () => {
  const nonVoiceCommands: AutomotiveCommand[] = [
    { kind: "refresh-nearby" },
    { kind: "select-place", idImpianto: 1 },
    { kind: "back" },
  ];

  it.each(nonVoiceCommands)(
    "allows %o on an automotive host regardless of voiceInput",
    (command) => {
      expect(canExecuteCommand(command, ANDROID_AUTO_CAPABILITIES)).toBe(true);
    },
  );

  it.each(nonVoiceCommands)(
    "refuses %o on a non-automotive host",
    (command) => {
      expect(canExecuteCommand(command, MOBILE_CAPABILITIES)).toBe(false);
    },
  );

  it("allows voice-search only where voiceInput is true", () => {
    expect(
      canExecuteCommand(
        { kind: "voice-search", transcript: "test" },
        ANDROID_AUTO_CAPABILITIES,
      ),
    ).toBe(true);
  });

  it("refuses voice-search on mobile, which has no voiceInput", () => {
    expect(
      canExecuteCommand(
        { kind: "voice-search", transcript: "test" },
        MOBILE_CAPABILITIES,
      ),
    ).toBe(false);
  });
});
