jest.mock(
  "@react-native-async-storage/async-storage",
  () => require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

Object.defineProperty(global, "confirm", {
  configurable: true,
  writable: true,
  value: jest.fn(() => true),
});
