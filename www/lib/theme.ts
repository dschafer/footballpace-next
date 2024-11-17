"use client";

import { colorsTuple, createTheme, virtualColor } from "@mantine/core";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
});

const theme = createTheme({
  fontFamily: inter.style.fontFamily,
  white: "#fcfcfc",
  black: "#161616",
  spacing: {
    xs: "calc(0.5rem * var(--mantine-scale))",
    sm: "calc(0.625rem * var(--mantine-scale))",
    md: "calc(.75rem * var(--mantine-scale))",
    lg: "calc(1rem * var(--mantine-scale))",
    xl: "calc(1.5rem * var(--mantine-scale))",
  },
  colors: {
    "summary-row-light": colorsTuple("#868e96"), // gray.6
    "summary-row-dark": colorsTuple("#343a40"), // gray.8
    "summary-row": virtualColor({
      name: "summary-row",
      dark: "summary-row-dark",
      light: "summary-row-light",
    }),
  },
});

export default theme;
