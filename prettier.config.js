/** @type {import("prettier").Config} */
const config = {
  arrowParens: "always",
  endOfLine: "lf",
  printWidth: 80,
  semi: false,
  trailingComma: "none",

  plugins: ["prettier-plugin-tailwindcss"],

  // Configuration for TailwindCSS plugin
  tailwindFunctions: ["clsx", "tw", "cva", "cx"]
}

export default config
