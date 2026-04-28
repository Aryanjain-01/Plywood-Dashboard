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
        background: "#0d1117",
        foreground: "#e2e8f0",
        border: "rgba(255,255,255,0.07)",
        input: "rgba(255,255,255,0.06)",
        ring: "rgba(129,140,248,0.5)",
        primary: {
          DEFAULT: "#818cf8",
          foreground: "#ffffff"
        },
        secondary: {
          DEFAULT: "#1e2530",
          foreground: "#cbd5e1"
        },
        muted: {
          DEFAULT: "#1e2530",
          foreground: "#64748b"
        },
        accent: {
          DEFAULT: "#818cf8",
          foreground: "#ffffff"
        },
        destructive: {
          DEFAULT: "#f87171"
        },
        card: {
          DEFAULT: "#161b22",
          foreground: "#e2e8f0"
        },
        popover: {
          DEFAULT: "#161b22",
          foreground: "#e2e8f0"
        },
        sidebar: {
          DEFAULT: "#0f1318",
          foreground: "#e2e8f0",
          border: "rgba(255,255,255,0.06)"
        }
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.625rem",
        sm: "0.5rem",
        xl: "1rem",
        "2xl": "1.25rem"
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out"
      }
    }
  },
  plugins: []
}

export default config
