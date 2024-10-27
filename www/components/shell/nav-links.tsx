import {
  IconChartLine,
  IconHome,
  IconList,
  IconRulerMeasure,
} from "@tabler/icons-react";

import { ActiveNavLink } from "./active-nav-link";
import Link from "next/link";
import { ScrollArea } from "@mantine/core";
import { TeamNavLinks } from "./team-nav-links";
import leagues from "@/lib/const/leagues";
import year from "@/lib/const/year";

export default function NavLinks() {
  return (
    <ScrollArea>
      <ActiveNavLink
        component={Link}
        href="/"
        label="Home"
        pageUrl="/"
        leftSection={<IconHome />}
      />
      {Array.from(leagues).map(([league, name]) => (
        <ActiveNavLink
          label={name}
          key={league}
          prefixUrl={`/${league}/${year}`}
        >
          <ActiveNavLink
            href={`/pace/${league}/${year}`}
            label="Pace Table"
            pageUrl={`/pace/${league}/${year}`}
            leftSection={<IconRulerMeasure />}
          />
          <ActiveNavLink
            href={`/chart/${league}/${year}`}
            label="Pace Chart"
            pageUrl={`/chart/${league}/${year}`}
            leftSection={<IconChartLine />}
          />
          <ActiveNavLink
            href={`/matches/${league}/${year}`}
            label="Results"
            pageUrl={`/matches/${league}/${year}`}
            leftSection={<IconList />}
          />
          <TeamNavLinks league={league} year={year} />
        </ActiveNavLink>
      ))}
    </ScrollArea>
  );
}
