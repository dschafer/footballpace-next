import "@mantine/core/styles.css";
import "@mantine/charts/styles.css";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import { Analytics } from "@vercel/analytics/react";
import NavLinks from "@/components/shell/nav-links";
import Shell from "@/components/shell/shell";
import { SpeedInsights } from "@vercel/speed-insights/next";
import theme from "@/lib/theme";

export const metadata = {
  metadataBase: new URL("https://footballpace-next.vercel.app/"),
  title: "Football Pace",
  description: "Tracking the pace of football clubs towards the championship",
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
