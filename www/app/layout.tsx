import "@mantine/core/styles.css";
import "@mantine/charts/styles.css";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import { Analytics } from "@vercel/analytics/react";
import NavLinks from "@/components/shell/nav-links";
import Shell from "@/components/shell/shell";
import { SpeedInsights } from "@vercel/speed-insights/next";
import theme from "@/lib/theme";

export const metadata = {
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
  authors: ["Dan Schafer"],
  openGraph: {
    type: "website",
    title: "Football Pace",
    description:
      "Reimagining football tables using historical championship pace",
    url: "https://footballpace.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Football Pace",
    description:
      "Reimagining football tables using historical championship pace",
    site: "@fballpace",
    siteId: "1856718770712236032",
    creator: "@dlschafer",
    creatorId: "69042390",
  },
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
