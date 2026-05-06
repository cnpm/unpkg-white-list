import pluginJsonc from "eslint-plugin-jsonc";
import parserJsonc from "jsonc-eslint-parser";

export default [
  ...pluginJsonc.configs['flat/recommended-with-json'],
  {
    files: [
      "data/allowScopes{_draft,}.json",
      "data/allowLargeScopes{_draft,}.json",
      "data/blockSyncScopes{_draft,}.json",
      "data/blockSyncPackages{_draft,}.json",
    ],
    languageOptions: {
      parser: parserJsonc,
    },
    rules: {
      "jsonc/sort-array-values": [
        "error",
        {
          pathPattern: "^$",
          order: { type: "asc" },
        },
      ],
    },
  },
  {
    files: [
      "data/allowPackages{_draft,}.json",
      "data/allowLargePackages{_draft,}.json",
    ],
    languageOptions: {
      parser: parserJsonc,
    },
    rules: {
      "jsonc/sort-keys": [
        "error",
        {
          pathPattern: "^$",
          order: { type: "asc" },
        },
      ],
    },
  },
];
