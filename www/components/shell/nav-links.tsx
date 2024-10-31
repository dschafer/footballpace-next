import { Center, ScrollArea } from "@mantine/core";
import {
  IconChartLine,
  IconHome,
  IconInfoCircle,
  IconList,
  IconRulerMeasure,
} from "@tabler/icons-react";

import { ActiveNavLink } from "./active-nav-link";
import Link from "next/link";
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
          leftSection={
            <Center inline w={24}>
              {league.flag}
            </Center>
          }
        >
          <ActiveNavLink
            href={`/${leagueCode}/${year}`}
            label="Pace Table"
            pageUrl={`/${leagueCode}/${year}`}
            leftSection={<IconRulerMeasure />}
          />
          <ActiveNavLink
            href={`/${leagueCode}/${year}/chart`}
            label="Pace Chart"
            pageUrl={`/${leagueCode}/${year}/chart`}
            leftSection={<IconChartLine />}
          />
          <ActiveNavLink
            href={`/${leagueCode}/${year}/matches`}
            label="Results"
            pageUrl={`/${leagueCode}/${year}/matches`}
            leftSection={<IconList />}
          />
          <TeamNavLinks league={leagueCode} year={year} />
        </ActiveNavLink>
      ))}
      <ActiveNavLink
        component={Link}
        href="/about"
        label="About"
        pageUrl="/about"
        leftSection={<IconInfoCircle />}
      />
    </ScrollArea>
  );
}
