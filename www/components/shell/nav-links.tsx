"use client";

import { IconChartCovariate, IconColumns, IconHome } from "@tabler/icons-react";

import Link from "next/link";
import { NavLink } from "@mantine/core";
import leagues from "@/lib/const/leagues";
import { usePathname } from "next/navigation";
import year from "@/lib/const/year";

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
      {Array.from(leagues).map(([league, name]) => (
        <NavLink
          label={name}
          key={league}
          active={pathname.includes(`/${league}/${year}`)}
        >
          <NavLink
            component={Link}
            href={`/pace/${league}/${year}`}
            label="Pace"
            active={pathname == `/pace/${league}/${year}`}
            leftSection={<IconChartCovariate />}
          />
          <NavLink
            component={Link}
            href={`/table/${league}/${year}`}
            label="Table"
            active={pathname == `/table/${league}/${year}`}
            leftSection={<IconColumns />}
          />
        </NavLink>
      ))}
    </>
  );
}
