// Jest manual mock for a node_modules package (auto-applied, no jest.mock()
// call needed) — the native module has no implementation in the Jest/Node
// environment (docs/motus/testing-strategy.md §2 applies to this native
// dependency the same way it applies to `expo-location`).
module.exports = require("@react-native-async-storage/async-storage/jest/async-storage-mock");
