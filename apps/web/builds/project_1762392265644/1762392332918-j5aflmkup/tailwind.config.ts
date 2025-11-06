import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
  "./app/**/*.{js,ts,jsx,tsx,mdx}",
  "./components/**/*.{js,ts,jsx,tsx,mdx}",
  "./pages/**/*.{js,ts,jsx,tsx,mdx}"
],
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
            background: "#FFFFFF",
            foreground: "#111827",
            surface: "#F9FAFB",
            primary: {
                  DEFAULT: "#6366F1",
                  foreground: "#FFFFFF"
            },
            secondary: {
                  DEFAULT: "#8B5CF6",
                  foreground: "#FFFFFF"
            },
            accent: {
                  DEFAULT: "#6366F1",
                  foreground: "#FFFFFF"
            },
            muted: {
                  DEFAULT: "#F3F4F6",
                  foreground: "#6B7280"
            },
            border: "#E5E7EB",
            ring: "#6366F1",
            destructive: {
                  DEFAULT: "#EF4444",
                  foreground: "#FFFFFF"
            }
      },
      fontFamily: {
            sans: [
                  "Inter",
                  "-apple-system",
                  "BlinkMacSystemFont",
                  "'Segoe UI'",
                  "Roboto",
                  "sans-serif"
            ],
            mono: [
                  "JetBrains Mono",
                  "'Fira Code'",
                  "monospace"
            ]
      },
      fontSize: {
            xs: "0.75rem",
            sm: "0.875rem",
            base: "1rem",
            lg: "1.125rem",
            xl: "1.25rem",
            2xl: "1.5rem",
            3xl: "1.875rem",
            4xl: "2.25rem",
            5xl: "3rem"
      },
      fontWeight: {
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
            extrabold: 800
      },
      spacing: {
            0: "1px",
            1: "2px",
            2: "3px",
            3: "4px",
            4: "5px",
            5: "6px",
            6: "8px",
            7: "10px",
            8: "12px",
            9: "16px",
            10: "20px",
            11: "24px",
            12: "32px",
            13: "40px",
            14: "48px",
            15: "64px",
            16: "80px",
            17: "96px",
            18: "128px"
      },
      borderRadius: {
            none: "0",
            sm: "0.375rem",
            md: "0.5rem",
            lg: "0.75rem",
            xl: "1rem",
            2xl: "1.5rem",
            full: "9999px"
      },
      boxShadow: {
            sm: "0 2px 4px 0 rgba(45, 80, 22, 0.08)",
            md: "0 4px 8px 0 rgba(45, 80, 22, 0.12), 0 2px 4px 0 rgba(45, 80, 22, 0.06)",
            lg: "0 8px 16px 0 rgba(45, 80, 22, 0.15), 0 4px 8px 0 rgba(45, 80, 22, 0.08)",
            xl: "0 16px 32px 0 rgba(45, 80, 22, 0.2), 0 8px 16px 0 rgba(45, 80, 22, 0.1)",
            inner: "inset 0 2px 4px 0 rgba(45, 80, 22, 0.06)",
            glow: "0 0 20px rgba(255, 107, 53, 0.3)"
      },
      backdropBlur: {
            xs: "2px",
            sm: "4px",
            md: "8px",
            lg: "12px",
            xl: "16px",
            2xl: "24px",
            3xl: "40px"
      }
},
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}

export default config
