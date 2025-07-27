import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-montserrat)', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Simple beige palette
        beige: {
          50: '#faf8f3',   // Very light beige background
          100: '#f5f1e8',  // Light beige for cards
          200: '#ede5d3',  // Beige borders
          300: '#e0d4bd',  // Medium beige
          400: '#d1c2a0',  // Darker beige
          500: '#c2b280',  // Base beige
          600: '#a69660',  // Dark beige
          700: '#8a7a4f',  // Very dark beige
          800: '#6f6340',  // Almost brown
          900: '#5a4f33',  // Dark brown-beige
        }
      },
    },
  },
  plugins: [],
} satisfies Config; 