import type { Metadata, ResolvingMetadata } from "next/types";
import {
  PRERENDER_TARGET_KEYS,
  type TargetKey,
  targetKeyToFinish,
} from "@/lib/pace/target-key";
import { type SeasonPageParam, validateLeagueYear } from "@/lib/const/current";
import { Stack, Text, Title } from "@mantine/core";

import AnchorLink from "@/components/anchor-link/anchor-link";
import TeamContent from "@/components/team-page/team-content";
import { fetchTeams } from "@/lib/pace/data";
import { socialImageMetadata } from "@/lib/metadata";
import { teamPath } from "@/lib/url/team-links";
import { validateTargetRoute } from "@/lib/pace/validate-target-route";
import year from "@/lib/const/year";

export const instant = false;

export async function generateStaticParams(): Promise<
  (SeasonPageParam & {
    target: TargetKey;
  })[]
> {
  // Only statically generate EPL champion pages since those are most used.
  const teams = await fetchTeams("E0", year, { orderBy: { team: "asc" } });
  const teamParams = teams.map(({ league, year, team }) => ({
    league,
    year: "" + year,
    team,
  }));

  return PRERENDER_TARGET_KEYS.flatMap((target) =>
    teamParams.map((p) => ({ ...p, target })),
  );
}

export async function generateMetadata(
  props: PageProps<"/ssr/[target]/[league]/[year]/team/[team]">,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { league, year, team } = await props.params;
  const [leagueInfo, yearInt] = validateLeagueYear({ league, year });
  return {
    ...socialImageMetadata(
      await parent,
      `${teamPath(league, year, team)}/opengraph-image/id`,
      `${leagueInfo.flag} ${decodeURIComponent(team)} ${yearInt}`,
    ),
    alternates: {
      canonical: teamPath(league, year, team),
    },
  };
}

export default async function TeamSSR(
  props: PageProps<"/ssr/[target]/[league]/[year]/team/[team]">,
) {
  const { league, year, team, target } = await props.params;
  const targetKey = validateTargetRoute(target);
  const [leagueInfo, yearInt] = validateLeagueYear({ league, year });
  const teamDecoded = decodeURIComponent(team);
  const tf = targetKeyToFinish(league)[targetKey];
  return (
    <Stack>
      <Title order={2}>{teamDecoded}</Title>
      <AnchorLink
        href={`/${league}/${yearInt}`}
        style={{ alignSelf: "flex-start" }}
      >
        <Text fs="italic">
          {leagueInfo.name} {yearInt}
        </Text>
      </AnchorLink>
      <TeamContent
        league={league}
        seasonYear={yearInt}
        team={teamDecoded}
        targetFinish={tf}
      />
    </Stack>
  );
}
