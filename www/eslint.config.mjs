import { defineConfig, globalIgnores } from "eslint/config";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import reactCompiler from "eslint-plugin-react-compiler";
import tsParser from "@typescript-eslint/parser";
import tseslint from "typescript-eslint";
import typescriptEslint from "@typescript-eslint/eslint-plugin";

const compat = new FlatCompat();

export default defineConfig([
  js.configs.recommended,
  tseslint.configs.recommended,
  tseslint.configs.stylistic,
  ...compat.extends("next/core-web-vitals"),
  ...compat.extends("prettier"),
  {
    plugins: {
      "react-compiler": reactCompiler,
      "@typescript-eslint": typescriptEslint,
    },

    languageOptions: {
      parser: tsParser,
      ecmaVersion: 5,
      sourceType: "script",

      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },

    rules: {
      "sort-imports": ["warn"],
      "react-compiler/react-compiler": ["warn"],
      "@typescript-eslint/consistent-type-exports": "warn",
      "@typescript-eslint/consistent-type-imports": "warn",
      "@typescript-eslint/no-unsafe-assignment": ["off"],
      "@typescript-eslint/no-unsafe-return": ["off"],

      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],

      "@typescript-eslint/require-await": ["off"],
    },
  },
  globalIgnores([
    "next.config.js",
    "node_modules/**",
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);
