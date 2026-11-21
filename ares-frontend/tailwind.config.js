/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ares: {
          bg: "#080F1B",
          sidebar: "#101C2B",
          panel: "#132438",
          elevated: "#172B40",
          border: "#263B50",
          borderLight: "#354E69",
          cyan: "#23B9D6",
          cyanHover: "#1BA2BD",
          cyanGlow: "rgba(35, 185, 214, 0.2)",
          critical: "#EF4444",
          warning: "#F59E0B",
          safe: "#22C55E",
          info: "#3B82F6",
          text: "#F1F5F9",
          secondary: "#94A3B8",
          muted: "#64748B",
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'panel': '0 4px 16px -2px rgba(0, 0, 0, 0.45)',
        'cyan-glow': '0 0 15px rgba(35, 185, 214, 0.35)',
        'red-glow': '0 0 15px rgba(239, 68, 68, 0.35)',
      }
    },
  },
  plugins: [],
}
