/** @type {import('jest').Config} */
const config = {
  preset: "ts-jest/presets/js-with-ts-esm",
  testEnvironment: "node",
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(node-fetch|fetch-blob|formdata-polyfill|data-uri-to-buffer|web-streams-polyfill)/)",
  ],
  extensionsToTreatAsEsm: [".ts"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },
};

export default config;
