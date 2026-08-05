/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  watchman: false,
  moduleNameMapper: {
    // Must precede the "@/" alias below: `src/app/_layout.tsx` imports the
    // real global.css (needed by Metro/NativeWind at runtime), which has no
    // JS-parseable syntax for Jest — only `expo-router/testing-library`'s
    // `renderRouter` ever loads `_layout.tsx` in tests.
    "\\.css$": "<rootDir>/__mocks__/styleMock.js",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};
