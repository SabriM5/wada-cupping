import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2C4035",      // Vert profond
        secondary: "#D4AF37",    // Or / Champagne
        background: "#FAFAF7",   // Blanc cassé
        surface: "#FFFFFF",      // Blanc pur
        text: "#333333",         // Anthracite
        muted: "#7A7A7A",        // Gris moyen
        border: "#E5E5E0",       // Séparateurs
        accent: "#B08D57",       // Terracotta douce
      },
      fontFamily: {
        heading: ['var(--font-playfair)', 'serif'],
        body: ['var(--font-montserrat)', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(44, 64, 53, 0.08)',
      },
    },
  },
  plugins: [],
};
export default config;