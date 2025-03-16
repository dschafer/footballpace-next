import { defineConfig } from "eslint/config";
import reactCompiler from "eslint-plugin-react-compiler";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([{
    extends: compat.extends(
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended-type-checked",
        "plugin:@typescript-eslint/stylistic-type-checked",
        "next/core-web-vitals",
        "prettier",
    ),

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
            tsconfigRootDir: "www",
        },
    },

    rules: {
        "sort-imports": ["warn"],
        "react-compiler/react-compiler": ["warn"],
        "@typescript-eslint/consistent-type-exports": "warn",
        "@typescript-eslint/consistent-type-imports": "warn",
        "@typescript-eslint/no-unsafe-assignment": ["off"],
        "@typescript-eslint/no-unsafe-return": ["off"],

        "@typescript-eslint/no-unused-vars": ["warn", {
            args: "all",
            argsIgnorePattern: "^_",
            caughtErrors: "all",
            caughtErrorsIgnorePattern: "^_",
            destructuredArrayIgnorePattern: "^_",
            varsIgnorePattern: "^_",
            ignoreRestSiblings: true,
        }],

        "@typescript-eslint/require-await": ["off"],
    },
}]);