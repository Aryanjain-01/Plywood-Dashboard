import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#3b82f6",
          foreground: "#f8fbff"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        }
      },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1rem"
      },
      boxShadow: {
        glow: "0 0 30px rgba(59,130,246,0.2)",
        glass: "0 0 0 1px rgba(255,255,255,0.06), 0 20px 40px -24px rgba(59,130,246,0.45)"
      }
    }
  },
  plugins: []
}

export default config
