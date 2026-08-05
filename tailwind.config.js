const {
  colors,
  spacing,
  typography,
  fontWeight,
  radius,
  borderWidth,
  iconSize,
  touchTarget,
  shadow,
} = require("./src/theme/tokens");

/** Formats a unitless token number as the px string Tailwind's theme expects. */
const px = (value) => `${value}px`;

/** `{ sm: 16 }` -> `{ "icon-sm": "16px" }`, reused for width/height/minWidth/minHeight below. */
const prefixedPx = (prefix, scale) =>
  Object.fromEntries(
    Object.entries(scale).map(([key, value]) => [
      `${prefix}-${key}`,
      px(value),
    ]),
  );

const boxShadow = Object.fromEntries(
  Object.entries(shadow).map(([level, value]) => [level, value.boxShadow]),
);

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/features/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors,
      spacing,
      fontSize: typography,
      fontWeight,
      borderRadius: radius,
      borderWidth,
      boxShadow,
      width: prefixedPx("icon", iconSize),
      height: prefixedPx("icon", iconSize),
      minWidth: prefixedPx("touch", touchTarget),
      minHeight: prefixedPx("touch", touchTarget),
    },
  },
  plugins: [],
};
