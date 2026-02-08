import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        arena: {
          dark: '#0a0a0f',
          primary: '#6366f1',
          accent: '#f43f5e',
          win: '#22c55e',
          lose: '#ef4444',
        },
      },
    },
  },
  plugins: [],
}
export default config
