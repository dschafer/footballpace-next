"use client";
import "@mantine/core/styles.css";
import {
  AppShell,
  AppShellHeader,
  AppShellMain,
  AppShellNavbar,
  Burger,
  Group,
  Title,
} from "@mantine/core";
import AnchorLink from "@/components/anchor-link/anchor-link";
import { IconSoccerField } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Shell({
  navLinks,
  children,
}: {
  navLinks: React.ReactNode;
  children: React.ReactNode;
}) {
  const [opened, { close, toggle }] = useDisclosure();
  const pathname = usePathname();

  useEffect(() => {
    close();
  }, [close, pathname]);
  return (
    <AppShell
      header={{ height: "4rem" }}
      navbar={{
        width: "15rem",
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="xs"
    >
      <AppShellHeader p="xs">
        <Group h="100%">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <AnchorLink
            size="inherit"
            href={`/`}
            underline="never"
            c="var(--mantine-color-text)"
          >
            <Title order={1}>Football Pace</Title>
          </AnchorLink>
          <IconSoccerField size="2rem" />
        </Group>
      </AppShellHeader>
      <AppShellNavbar p="xs">{navLinks}</AppShellNavbar>
      <AppShellMain>{children}</AppShellMain>
    </AppShell>
  );
}
