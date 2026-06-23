import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // Inter Tight carries all UI chrome; Fraunces is the magazine masthead;
        // Newsreader sets editorial running copy; Azeret Mono is the ticket-stub
        // texture reserved for issue/plate numbers and prices.
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        // Warm press-stock palette. All channels are CSS vars so the Night
        // Edition can invert paper↔ink by overriding :root under [data-theme].
        paper: {
          DEFAULT: "rgb(var(--c-paper) / <alpha-value>)",
          2: "rgb(var(--c-paper-2) / <alpha-value>)",
        },
        ink: {
          DEFAULT: "rgb(var(--c-ink) / <alpha-value>)",
          60: "rgb(var(--c-ink-60) / <alpha-value>)",
          30: "rgb(var(--c-ink-30) / <alpha-value>)",
        },
        rule: "rgb(var(--c-rule) / <alpha-value>)",
        // The single rationed accent — masthead red, used like Vogue uses it.
        vermilion: {
          DEFAULT: "rgb(var(--c-vermilion) / <alpha-value>)",
          ink: "rgb(var(--c-vermilion-ink) / <alpha-value>)",
        },
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-18px)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.4s linear infinite",
        "fade-up": "fade-up 0.45s ease-out both",
        float: "float 13s ease-in-out infinite",
        "float-slow": "float 18s ease-in-out infinite",
        marquee: "marquee 32s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
