import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import ts from "@typescript-eslint/eslint-plugin";
import parser from "@typescript-eslint/parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([globalIgnores([".history/*", "lib/**", "types/**"]), {
    extends: compat.extends("eslint:recommended"),
    languageOptions: {
        globals: {
            ...globals.node,
            ...globals.browser,
            globalThis: "writable",
        },
        ecmaVersion: 2024,
        sourceType: "module",
    },

    rules: {
        "no-unused-vars": "error",
        "arrow-spacing": ["warn", {
            before: true,
            after: true,
        }],
        "brace-style": ["error", "1tbs", {
            allowSingleLine: true,
        }],
        "comma-dangle": ["error", "always-multiline"],
        "comma-spacing": "error",
        "comma-style": "error",
        curly: ["error", "multi-line", "consistent"],
        "dot-location": ["error", "property"],
        "handle-callback-err": "off",
        indent: ["error", "tab"],
        "keyword-spacing": "error",
        "max-nested-callbacks": ["error", {
            max: 5,
        }],
        "max-statements-per-line": ["error", {
            max: 3,
        }],
        "no-console": "off",
        "no-empty-function": "error",
        "no-floating-decimal": "error",
        "no-lonely-if": "error",
        "no-multi-spaces": "error",
        "no-multiple-empty-lines": ["error", {
            max: 2,
            maxEOF: 1,
            maxBOF: 0,
        }],
        "no-shadow": ["error", {
            allow: ["err", "resolve", "reject"],
        }],
        "no-trailing-spaces": ["error"],
        "no-var": "error",
        "object-curly-spacing": ["error", "always"],
        "prefer-const": "error",
        quotes: ["error", "single"],
        semi: ["error", "always"],
        "no-control-regex": "off",
        "space-before-blocks": "error",
        "space-before-function-paren": ["error", {
            anonymous: "never",
            named: "never",
            asyncArrow: "always",
        }],
        "space-in-parens": "error",
        "space-infix-ops": "error",
        "space-unary-ops": "error",
        "spaced-comment": "error",
        yoda: "error",
    },
	ignores: [
		'**/eslint.config.mjs',
		'.history/*'
	]
}, {
	files: ["src/**/*.ts"],
	languageOptions: {
		parser,
		parserOptions: {
			ecmaVersion: 2024,
			sourceType: "module",
			project: "./tsconfig.base.json"
		},
		globals: {
			...globals.node,
			...globals.browser,
			globalThis: "writable",
		}
	},
	plugins: {
		"@typescript-eslint": ts
	},
	rules: {
		...ts.configs.recommended.rules,
		"@typescript-eslint/no-unused-vars": "error",
		"no-unused-vars": "off"
	}
}]);