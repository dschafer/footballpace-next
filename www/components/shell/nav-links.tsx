"use client";

import {
  IconChartLine,
  IconColumns,
  IconHome,
  IconRulerMeasure,
} from "@tabler/icons-react";

import Link from "next/link";
import { NavLink } from "@mantine/core";
import leagues from "@/lib/const/leagues";
import { usePathname } from "next/navigation";
import year from "@/lib/const/year";

export function NavLinks({ onNav }: { onNav: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <NavLink
        component={Link}
        href="/"
        label="Home"
        active={pathname == "/"}
        leftSection={<IconHome />}
        onClick={onNav}
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
            label="Pace Table"
            active={pathname == `/pace/${league}/${year}`}
            leftSection={<IconRulerMeasure />}
            onClick={onNav}
          />
          <NavLink
            component={Link}
            href={`/chart/${league}/${year}`}
            label="Pace Chart"
            active={pathname == `/chart/${league}/${year}`}
            leftSection={<IconChartLine />}
            onClick={onNav}
          />
          <NavLink
            component={Link}
            href={`/table/${league}/${year}`}
            label="League Table"
            active={pathname == `/table/${league}/${year}`}
            leftSection={<IconColumns />}
            onClick={onNav}
          />
        </NavLink>
      ))}
    </>
  );
}
