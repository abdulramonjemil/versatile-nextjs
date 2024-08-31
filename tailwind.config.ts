import type { Config } from "tailwindcss"

const config: Config = {
  // @todo starter::Change this if you use different file conventions
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/client/**/*.{tsx}",
    "./src/server/**/*.{tsx}",
    "./src/shared/**/*.{tsx}"
  ],

  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",

        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",

        popover: "hsl(var(--popover))",
        "popover-foreground": "hsl(var(--popover-foreground))",

        border: "hsl(var(--border))",

        input: "hsl(var(--input))",
        concentrated: "hsl(var(--concentrated))",

        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",

        secondary: "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",

        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",

        destructive: "hsl(var(--destructive))",
        "destructive-foreground": "hsl(var(--destructive-foreground))",

        ring: "hsl(var(--ring))",

        radius: "hsl(var(--radius))"
      }
    }
  },

  plugins: []
}

export default config
