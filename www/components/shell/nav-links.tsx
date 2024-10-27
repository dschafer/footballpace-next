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
      {Array.from(leagues).map(([leagueCode, league]) => (
        <ActiveNavLink
          label={league.name}
          key={leagueCode}
          prefixUrl={`/${leagueCode}/${year}`}
          leftSection={<>{league.flag}</>}
        >
          <ActiveNavLink
            href={`/pace/${leagueCode}/${year}`}
            label="Pace Table"
            pageUrl={`/pace/${leagueCode}/${year}`}
            leftSection={<IconRulerMeasure />}
          />
          <ActiveNavLink
            href={`/chart/${leagueCode}/${year}`}
            label="Pace Chart"
            pageUrl={`/chart/${leagueCode}/${year}`}
            leftSection={<IconChartLine />}
          />
          <ActiveNavLink
            href={`/matches/${leagueCode}/${year}`}
            label="Results"
            pageUrl={`/matches/${leagueCode}/${year}`}
            leftSection={<IconList />}
          />
          <TeamNavLinks league={leagueCode} year={year} />
        </ActiveNavLink>
      ))}
    </ScrollArea>
  );
}
