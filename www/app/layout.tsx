import "@mantine/core/styles.css";
import "@mantine/charts/styles.css";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import { Analytics } from "@vercel/analytics/react";
import NavLinks from "@/components/shell/nav-links";
import Shell from "@/components/shell/shell";
import { SpeedInsights } from "@vercel/speed-insights/next";
import theme from "@/lib/theme";

export const metadata = {
  metadataBase: new URL("https://www.footballpace.com/"),
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
    "Strength",
    "Schedule",
  ],
  authors: ["Dan Schafer"],
  openGraph: {
    type: "website",
    title: "Football Pace",
    description:
      "Reimagining football tables using historical championship pace",
    url: "https://www.footballpace.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Football Pace",
    description:
      "Reimagining football tables using historical championship pace",
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
    <html lang="en">
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
