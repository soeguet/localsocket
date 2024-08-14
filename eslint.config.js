import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginPromise from "eslint-plugin-promise";

export default [
    { files: ["**/*.{js,mjs,cjs,ts}"] },
    { languageOptions: { globals: globals.browser } },
    {
        rules: {
            "no-unused-vars": "error",
            "no-undef": "error",
            "require-await": "warn",
            "promise/prefer-await-to-callbacks": "warn",
            "promise/prefer-await-to-then": "warn",
        },
    },
    pluginPromise.configs["flat/recommended"],
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
];
