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
            background: "#fbfdf9",
            foreground: "#191c1a",
            surface: "#fbfdf9",
            primary: {
                  DEFAULT: "#006c49",
                  foreground: "#ffffff"
            },
            secondary: {
                  DEFAULT: "#4d6357",
                  foreground: "#ffffff"
            },
            accent: {
                  DEFAULT: "#3d6473",
                  foreground: "#ffffff"
            },
            muted: {
                  DEFAULT: "#dce5dd",
                  foreground: "#404943"
            },
            border: "#c0c9c1",
            ring: "#006c49",
            destructive: {
                  DEFAULT: "#ba1a1a",
                  foreground: "#ffffff"
            }
      },
      fontFamily: {
            sans: [
                  "Inter",
                  "-apple-system",
                  "BlinkMacSystemFont",
                  "\"Segoe UI\"",
                  "Roboto",
                  "sans-serif"
            ],
            mono: [
                  "JetBrains Mono",
                  "\"Fira Code\"",
                  "Consolas",
                  "monospace"
            ]
      },
      fontSize: {
            xs: "0.6875rem",
            sm: "0.75rem",
            base: "0.875rem",
            lg: "1rem",
            xl: "1rem",
            2xl: "1.375rem",
            3xl: "1.5rem",
            4xl: "1.75rem",
            5xl: "2.25rem"
      },
      fontWeight: {
            regular: 400,
            medium: 500,
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
            10: "16px",
            11: "24px"
      },
      borderRadius: {
            none: "0",
            sm: "0.25rem",
            md: "0.5rem",
            lg: "0.75rem",
            xl: "1rem",
            2xl: "1.5rem",
            full: "9999px"
      },
      boxShadow: {
            none: "none",
            sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
            md: "0 2px 4px -1px rgb(0 0 0 / 0.06), 0 4px 6px -1px rgb(0 0 0 / 0.10)",
            lg: "0 4px 6px -2px rgb(0 0 0 / 0.05), 0 10px 15px -3px rgb(0 0 0 / 0.10)",
            xl: "0 10px 10px -5px rgb(0 0 0 / 0.04), 0 20px 25px -5px rgb(0 0 0 / 0.10)",
            2xl: "0 25px 50px -12px rgb(0 0 0 / 0.25)"
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
