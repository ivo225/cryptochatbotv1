/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#111827',
        primary: '#3B82F6',
        secondary: '#1F2937',
        accent: '#10B981',
      },
    },
  },
  plugins: [],
}
