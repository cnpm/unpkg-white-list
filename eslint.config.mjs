import pluginJsonc from "eslint-plugin-jsonc";
import parserJsonc from "jsonc-eslint-parser";

export default [
  ...pluginJsonc.configs['flat/recommended-with-json'],
  {
    files: ["package{_draft,}.json"],
    languageOptions: {
      parser: parserJsonc,
    },
    rules: {
      "jsonc/sort-array-values": [
        "error",
        {
          pathPattern: 'allowScopes',
          order: { type: "asc" },
        },
      ],
      "jsonc/sort-keys": [
        "error",
        {
          pathPattern: 'allowPackages',
          order: { type: "asc" },
        }
      ],
    },
  }
];