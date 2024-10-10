import {
  IconChartLine,
  IconColumns,
  IconHome,
  IconRulerMeasure,
} from "@tabler/icons-react";

import { ActiveNavLink } from "./active-nav-link";
import Link from "next/link";
import { ScrollArea } from "@mantine/core";
import { TeamNavLinks } from "./team-nav-links";
import leagues from "@/lib/const/leagues";
import year from "@/lib/const/year";

export function NavLinks() {
  return (
    <ScrollArea>
      <ActiveNavLink
        component={Link}
        href="/"
        label="Home"
        isActive={(pathname) => pathname == "/"}
        leftSection={<IconHome />}
      />
      {Array.from(leagues).map(([league, name]) => (
        <ActiveNavLink
          label={name}
          key={league}
          isActive={(pathname) => pathname.includes(`/${league}/${year}`)}
        >
          <ActiveNavLink
            href={`/pace/${league}/${year}`}
            label="Pace Table"
            isActive={(pathname) => pathname == `/pace/${league}/${year}`}
            leftSection={<IconRulerMeasure />}
          />
          <ActiveNavLink
            href={`/chart/${league}/${year}`}
            label="Pace Chart"
            isActive={(pathname) => pathname == `/chart/${league}/${year}`}
            leftSection={<IconChartLine />}
          />
          <TeamNavLinks league={league} year={year} />
        </ActiveNavLink>
      ))}
    </ScrollArea>
  );
}
