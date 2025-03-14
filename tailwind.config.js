const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        skeleton: {
          "0%": {
            "background-position": "0%",
          },
          "100%": {
            "background-position": "-200%",
          },
        },
        wiggle: {
          "0%": {
            transform: "rotate(0)",
            "transform-origin": "bottom right",
          },
          "25%": {
            transform: "rotate(2deg)",
            "transform-origin": "bottom left",
          },
          "50%": {
            transform: "rotate(-2deg)",
            "transform-origin": "bottom right",
          },
          "75%": {
            transform: "rotate(2deg)",
            "transform-origin": "bottom left",
          },
          "100%": {
            transform: "rotate(0)",
          },
        },
      },
      animation: {
        skeleton: "skeleton 1.25s linear infinite",
        wiggle: "wiggle 0.75s linear",
      },
      screens: {
        xxl: "1680px",
      },
      boxShadow: {
        bottom: "0 1px 0 0 hsl(52deg 100% 50%)",
        "bottom-2": "0 2px 0 0 hsl(52deg 100% 50%)",
        header:
          "0 1px 0 hsl(0 calc( 1 * 0%) 0.8% / 0.2), 0 1.5px 0 hsl(240 calc( 1 * 7.7%) 2.5% / 0.05), 0 2px 0 hsl(0 calc( 1 * 0%) 0.8% / 0.05)",
        footer: "0 -1px 3px rgba(43, 45, 49, 0.6) 0px 1px 0px 0px inset",
      },
      fontFamily: {
        twemoji: "var(--twemoji)",
        code: `Consolas, Andale Mono WT, Andale Mono, Lucida Console,
      Lucida Sans Typewriter, DejaVu Sans Mono, Bitstream Vera Sans Mono,
      Liberation Mono, Nimbus Mono L, Monaco, Courier New, Courier, monospace`,
      },
      colors(utils) {
        return {
          ...utils.colors,
          blue: {
            ...utils.colors.blue,
            300: "hsl(214.42deg 100% 64.48%)",
            400: "hsl(214.42deg 84.07% 55.69%)",
            500: "hsl(234.935 85.556% 64.706%)",
          },
          black: {
            300: "#434a4a",
            430: "hsl(229 4.8% 44.9%)",
            450: "hsl(228 6.024% 32.549%)",
            500: "hsl(228 7.7% 27.5%)",
            560: "hsl(225 6.7% 23.5%)",
            600: "oklab(0.32 0 -0.01)",
            630: "oklab(0.296332 -0.000731647 -0.00768477)",
            660: "hsl(228 6.7% 14.7%)",
            700: "hsl(225 6.3% 12.5%)",
            800: "hsl(220 8.1% 7.3%)",
            900: "hsl(0 0% 0.784%)",
            1000: "black",
          },
          gray: {
            ...utils.colors.gray,
            150: "hsl(215 8.824% 73.333%)",
            200: "rgb(128, 132, 142)",
            240: "#4e5058",
            260: "#4d5055",
            300: "hsl(0deg 1.87% 64.04%)",
            330: "hsl(215 8.8% 73.3%)",
            360: "#949ba4",
            400: "hsl(213 7.4% 59.1%);",
            500: "#3C393F",
          },
          green: {
            ...utils.colors.green,
            500: "hsl(147.23deg 79.32% 38.28%)",
          },
          white: {
            0: "rgb(255,255,255)",
            500: "rgb(220, 220, 220)",
            700: "rgb(200, 200, 200)",
            950: "rgb(180, 180, 180)",
          },
          yellow: {
            ...utils.colors.yellow,
            500: "hsl(52deg 100% 50%)",
          },
        };
      },
    },
  },
  plugins: [],
};
export default config;
