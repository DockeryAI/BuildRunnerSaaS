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
                  "'SF Mono'",
                  "Consolas",
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
            4xl: "2.25rem"
      },
      fontWeight: {
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700
      },
      spacing: {
            0: "1px",
            1: "2px",
            2: "4px",
            3: "6px",
            4: "8px",
            5: "12px",
            6: "16px",
            7: "24px",
            8: "32px",
            9: "48px",
            10: "64px",
            11: "80px",
            12: "96px",
            13: "128px"
      },
      borderRadius: {
            sm: "0.375rem",
            md: "0.5rem",
            lg: "0.75rem",
            xl: "1rem",
            2xl: "1.5rem",
            full: "9999px"
      },
      boxShadow: {
            sm: "0 1px 3px 0 rgba(45, 90, 39, 0.1), 0 1px 2px 0 rgba(45, 90, 39, 0.06)",
            md: "0 4px 6px -1px rgba(45, 90, 39, 0.1), 0 2px 4px -1px rgba(45, 90, 39, 0.06)",
            lg: "0 10px 15px -3px rgba(45, 90, 39, 0.1), 0 4px 6px -2px rgba(45, 90, 39, 0.05)",
            xl: "0 20px 25px -5px rgba(45, 90, 39, 0.1), 0 10px 10px -5px rgba(45, 90, 39, 0.04)"
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
