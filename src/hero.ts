import { heroui } from "@heroui/theme";

export default heroui({
  themes: {
    dark: {
      colors: {
        background: "hsl(220 30% 6%)",
        foreground: "hsl(44 20% 90%)",
        primary: {
          DEFAULT: "hsl(44 98% 39%)",
          foreground: "hsl(220 30% 6%)",
        },
        secondary: {
          DEFAULT: "hsl(0 100% 24%)",
          foreground: "hsl(44 20% 90%)",
        },
        success: {
          DEFAULT: "hsl(142 76% 36%)",
          foreground: "hsl(0 0% 100%)",
        },
        warning: {
          DEFAULT: "hsl(44 98% 39%)",
          foreground: "hsl(220 30% 6%)",
        },
        danger: {
          DEFAULT: "hsl(0 84% 60%)",
          foreground: "hsl(0 0% 100%)",
        },
      },
    },
  },
  layout: {
    radius: {
      small: "0.25rem",
      medium: "0.5rem",
      large: "0.75rem",
    },
  },
});
