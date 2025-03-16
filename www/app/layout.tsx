import "@mantine/core/styles.css";
import "@mantine/charts/styles.css";
import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from "@mantine/core";
import { openGraphMetadata, twitterMetadata } from "@/lib/metadata";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next/types";
import NavLinks from "@/components/shell/nav-links";
import Shell from "@/components/shell/shell";
import { SpeedInsights } from "@vercel/speed-insights/next";

import theme from "@/lib/theme";

export const metadata: Metadata = {
  metadataBase: new URL("https://footballpace.com/"),
  title: {
    default: "Football Pace",
    template: "%s | Football Pace",
  },
  description: "Reimagining football tables using historical championship pace",
  keywords: [
    "Football",
    "Soccer",
    "Standings",
    "Table",
    "Pace",
    "Expected",
    "Target",
    "Strength",
    "Schedule",
  ],
  authors: [{ name: "Dan Schafer" }],
  openGraph: openGraphMetadata,
  twitter: twitterMetadata,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      style={{
        scrollPaddingTop: "4rem",
      }}
      {...mantineHtmlProps}
    >
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <Analytics />
        <SpeedInsights />
        <MantineProvider theme={theme} defaultColorScheme="auto">
          <Shell navLinks={<NavLinks />}>{children}</Shell>
        </MantineProvider>
      </body>
    </html>
  );
}
