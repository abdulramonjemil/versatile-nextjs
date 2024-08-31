/**
 * Creates a simple multiline command string that can be read easily in the
 * terminal. This makes it easier to see what's going on.
 *
 * @param {string[]} array
 */
function formatMultilineCommand(array, spaceIndentCount = 4) {
  const spaceIndent = " ".repeat(spaceIndentCount)
  const lines = array.map((item, index) => {
    if (index === 0) return `${item}`
    return `${spaceIndent}${item}` // Prepend an indent
  })
  return lines.join("\n")
}

/** @type {import("lint-staged").Config} */
const config = {
  "*.{json,md}": ["prettier --check"],

  "*.{js,ts,tsx}": (filePaths) => {
    const paths = filePaths.map((filePath) => JSON.stringify(filePath))

    const formatCheckCommand = formatMultilineCommand([
      "prettier --check",
      ...paths
    ])

    // Run tsc on whole project
    const typeCheckCommand = "tsc -p tsconfig.json --noEmit"
    const lintCheckCommand = formatMultilineCommand(["eslint", ...paths])

    return [lintCheckCommand, formatCheckCommand, typeCheckCommand]
  }
}

export default config
