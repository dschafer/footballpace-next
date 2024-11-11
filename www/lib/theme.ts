"use client";

import { Inter } from "next/font/google";
import { createTheme } from "@mantine/core";

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
});

export default theme;
