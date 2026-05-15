/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#0a0a0f",
          darker: "#020206",
          primary: "#6366f1",
          accent: "#8b5cf6",
          cyan: "#06b6d4",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.6s ease-out forwards",
        "glow-pulse": "glowPulse 3s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        "float-delayed": "float 6s ease-in-out 3s infinite",
        "border-glow": "borderGlow 3s ease-in-out infinite",
        "text-shimmer": "textShimmer 3s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 30px rgba(99,102,241,0.15)" },
          "50%":      { boxShadow: "0 0 60px rgba(99,102,241,0.35)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-20px)" },
        },
        borderGlow: {
          "0%, 100%": { borderColor: "rgba(99,102,241,0.3)" },
          "50%":      { borderColor: "rgba(139,92,246,0.6)" },
        },
        textShimmer: {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":  "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      boxShadow: {
        "glow-sm":  "0 0 15px rgba(99,102,241,0.2)",
        "glow-md":  "0 0 30px rgba(99,102,241,0.25)",
        "glow-lg":  "0 0 60px rgba(99,102,241,0.3)",
        "glow-xl":  "0 0 80px rgba(99,102,241,0.4)",
        "glow-violet": "0 0 40px rgba(139,92,246,0.25)",
      },
    },
  },
  plugins: [],
};
