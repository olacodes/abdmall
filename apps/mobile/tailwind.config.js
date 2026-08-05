/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // Ported from the web app's globals.css tokens (light commerce theme).
      colors: {
        paper: "#f6f3ec",
        surface: { DEFAULT: "#ffffff", 2: "#faf8f3" },
        brand: "#14110b",
        ink: "#1b1712",
        muted: "#635b4f",
        faint: "#726a5a",
        gold: {
          DEFAULT: "#b8860b",
          deep: "#7a5a16",
          bright: "#d8a72e",
          hi: "#f3d98b",
          soft: "#fbf2d9",
        },
        sale: "#e23b2e",
        success: "#1f8a4c",
        star: "#f6a417",
        line: { DEFAULT: "#e8e2d6", strong: "#d8cfbd" },
      },
      fontFamily: {
        display: ["Fraunces"],
        sans: ["HankenGrotesk"],
        "sans-medium": ["HankenGrotesk-Medium"],
        "sans-bold": ["HankenGrotesk-Bold"],
      },
    },
  },
  plugins: [],
};
