import "@mantine/core/styles.css";
import {
  Anchor,
  AppShell,
  AppShellHeader,
  AppShellMain,
  AppShellNavbar,
  Box,
  ColorSchemeScript,
  Group,
  MantineProvider,
  Title,
} from "@mantine/core";
import { IconSoccerField } from "@tabler/icons-react";
import Link from "next/link";
import { NavLinks } from "./nav-links";
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
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider theme={theme}>
          <AppShell
            header={{ height: 72 }}
            navbar={{ width: 160, breakpoint: "sm" }}
            padding="xs"
          >
            <AppShellHeader p="xs">
              <Group h="100%">
                <IconSoccerField size="48" />
                <Anchor component={Link} size="inherit" href={`/`}>
                  <Title order={1}>Football Pace</Title>
                </Anchor>
              </Group>
            </AppShellHeader>
            <AppShellNavbar p="xs">
              <NavLinks />
            </AppShellNavbar>
            <AppShellMain>{children}</AppShellMain>
          </AppShell>
        </MantineProvider>
      </body>
    </html>
  );
}
