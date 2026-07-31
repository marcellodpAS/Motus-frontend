import tokens from "./tokens";

/** Temporary semantic colors, pending the Stitch token review. */
export const colors = tokens.colors;

export type ColorToken = keyof typeof colors;
