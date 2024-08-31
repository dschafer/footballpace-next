"use client";
import "@mantine/core/styles.css";
import {
  Anchor,
  AppShell,
  AppShellHeader,
  AppShellMain,
  AppShellNavbar,
  Burger,
  Group,
  Title,
} from "@mantine/core";
import { IconSoccerField } from "@tabler/icons-react";
import Link from "next/link";
import { NavLinks } from "./nav-links";
import { useDisclosure } from "@mantine/hooks";

export default function Shell({ children }: { children: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure();
  return (
    <AppShell
      header={{ height: 72 }}
      navbar={{
        width: 240,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="xs"
    >
      <AppShellHeader p="xs">
        <Group h="100%">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Anchor component={Link} size="inherit" href={`/`} c="black">
            <Title order={1}>Football Pace</Title>
          </Anchor>
          <IconSoccerField size="48" />
        </Group>
      </AppShellHeader>
      <AppShellNavbar p="xs">
        <NavLinks />
      </AppShellNavbar>
      <AppShellMain>{children}</AppShellMain>
    </AppShell>
  );
}
