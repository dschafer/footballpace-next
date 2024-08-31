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
});

export default theme;
