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
                  "system-ui",
                  "sans-serif"
            ],
            mono: [
                  "SF Mono",
                  "JetBrains Mono",
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
            0: "0.25px",
            1: "0.5px",
            2: "1px",
            3: "1.5px",
            4: "2px",
            5: "3px",
            6: "4px",
            7: "6px",
            8: "8px",
            9: "12px",
            10: "16px"
      },
      borderRadius: {
            sm: "0.375rem",
            md: "0.5rem",
            lg: "0.75rem",
            xl: "1rem",
            full: "9999px"
      },
      boxShadow: {
            sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
            md: "0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            lg: "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            xl: "0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
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
