import { Center, ScrollArea } from "@mantine/core";
import {
  IconChartLine,
  IconHome,
  IconInfoCircle,
  IconList,
  IconRulerMeasure,
  IconVersions,
} from "@tabler/icons-react";

import { ActiveNavLink } from "./active-nav-link";
import Image from "next/image";
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
              <Image
                src={league.flagImage}
                alt={league.name}
                width={24}
                height={24}
              />
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
          <ActiveNavLink
            href={`/${leagueCode}/${year}/upcoming`}
            label="Upcoming"
            pageUrl={`/${leagueCode}/${year}/upcoming`}
            leftSection={<IconVersions />}
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
