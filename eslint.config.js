import path from "node:path"
import url from "node:url"

/* eslint-disable import/no-extraneous-dependencies */
import { FlatCompat } from "@eslint/eslintrc"
import tseslint from "typescript-eslint"
import eslintConfigPrettier from "eslint-config-prettier"
/* eslint-enable import/no-extraneous-dependencies */

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname
})

export default tseslint.config(
  // File ignore list
  { ignores: ["node_modules/*", ".next/*"] },

  // Extended configs
  ...compat.extends("airbnb"),
  ...compat.extends("next/core-web-vitals"),
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  eslintConfigPrettier,

  {
    files: ["**/*.{js,ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": ["error", { ignoreRestArgs: true }],

      "arrow-body-style": "off",
      "import/extensions": [
        "error",
        "ignorePackages",
        { js: "never", ts: "never", tsx: "never" }
      ],

      "import/prefer-default-export": "off",
      "no-underscore-dangle": "off",

      "react/destructuring-assignment": "off",
      "react/jsx-filename-extension": [
        "error",
        { extensions: [".jsx", ".tsx"] }
      ]
    }
  },

  {
    languageOptions: {
      parserOptions: {
        projectService: true
      }
    },

    linterOptions: {
      noInlineConfig: false,
      reportUnusedDisableDirectives: true
    },

    settings: {
      "import/resolver": {
        "eslint-import-resolver-alias": {
          map: [["@", "./src"]],
          extensions: [".js", ".ts", ".tsx"]
        }
      }
    }
  }
)
