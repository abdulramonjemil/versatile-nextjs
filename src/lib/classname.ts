/**
 * Serves as a convenience function for enabling better experience defining
 * TailwindCSS class names. It doesn't do anything special, just that it is set
 * up in .vscode/settings.json to allow autocomplete for tailwind classes.
 */
export function tw(...params: Parameters<typeof String.raw>) {
  return String.raw(...params)
}
