import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        telegram: {
          blue: "#0088cc",
          darkblue: "#006699",
          lightblue: "#64b5f6",
          bg: "#0f1419",
          sidebar: "#17212b",
          chat: "#212d3b",
          message: "#182533",
          hover: "#2b5278",
        },
      },
    },
  },
  plugins: [],
};
export default config;
