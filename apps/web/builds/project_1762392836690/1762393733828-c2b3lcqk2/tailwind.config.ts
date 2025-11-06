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
            background: {
                  light: "#F8F7F4",
                  dark: "#1A1D1A"
            },
            foreground: {
                  light: "#1A1D1A",
                  dark: "#E5E7E5"
            },
            surface: {
                  light: "#FFFFFF",
                  dark: "#242824"
            },
            primary: {
                  DEFAULT: "#2D5A27",
                  foreground: "#FFFFFF"
            },
            secondary: {
                  DEFAULT: "#8B4513",
                  foreground: "#FFFFFF"
            },
            accent: {
                  DEFAULT: "#FF5C38",
                  foreground: "#FFFFFF"
            },
            muted: {
                  DEFAULT: "#E6E4DE",
                  foreground: "#6B7280"
            },
            border: "#D2D0C8",
            ring: "#2D5A2733",
            destructive: {
                  DEFAULT: "#DC2626",
                  foreground: "#FFFFFF"
            }
      },
      fontFamily: {
            sans: [
                  "Inter",
                  "system-ui",
                  "-apple-system",
                  "sans-serif"
            ],
            mono: [
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
            sm: "0 2px 4px 0 rgba(45, 90, 39, 0.05)",
            md: "0 4px 6px -1px rgba(45, 90, 39, 0.08), 0 2px 4px -2px rgba(45, 90, 39, 0.06)",
            lg: "0 10px 15px -3px rgba(45, 90, 39, 0.08), 0 4px 6px -4px rgba(45, 90, 39, 0.06)",
            xl: "0 20px 25px -5px rgba(45, 90, 39, 0.08), 0 8px 10px -6px rgba(45, 90, 39, 0.06)"
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
