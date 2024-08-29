"use client";

import { IconColumns, IconHome, IconStopwatch } from "@tabler/icons-react";
import Link from "next/link";
import { NavLink } from "@mantine/core";
import { usePathname } from "next/navigation";

export function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      <NavLink
        component={Link}
        href="/"
        label="Home"
        active={pathname == "/"}
        leftSection={<IconHome />}
      />
      <NavLink
        component={Link}
        href="/leagueyear/E0/2023"
        label="Standings"
        active={pathname == "/leagueyear/E0/2023"}
        leftSection={<IconColumns />}
      />
      <NavLink
        component={Link}
        href="/pacesheet/E0/2023"
        label="Pace Sheet"
        active={pathname == "/pacesheet/E0/2023"}
        leftSection={<IconStopwatch />}
      />
    </>
  );
}
