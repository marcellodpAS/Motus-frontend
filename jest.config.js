/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  watchman: false,
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};
