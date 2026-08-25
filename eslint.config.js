// ESLint flat config (v9+).
// Migrated from .eslintrc.json to unblock ESLint 10+ upgrades (fixes #67).
// Mirrors the legacy .eslintrc.json rules so the lint output is identical
// under both configs. The legacy .eslintrc.json is kept for now so ESLint 8
// (pinned for unrelated dependabot PRs) still works; remove it once the
// floor moves to ESLint 9+.

const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2020,
            sourceType: "module",
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        rules: {
            "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
            "no-undef": "warn",
            // Match legacy .eslintrc.json behaviour (no `eslint:recommended`
            // defaults were applied historically). Re-evaluate these on a
            // future cleanup PR rather than expanding scope here.
            "no-useless-assignment": "off",
            "no-unassigned-vars": "off",
        },
    },
];
