"use client";

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
      />
      <NavLink
        component={Link}
        href="/leagueyear/E0/2023"
        label="Standings"
        active={pathname == "/leagueyear/E0/2023"}
      />
      <NavLink
        component={Link}
        href="/pacesheet/E0/2023"
        label="Pace Sheet"
        active={pathname == "/pacesheet/E0/2023"}
      />
    </>
  );
}
