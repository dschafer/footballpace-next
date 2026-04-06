import { type SeasonPageParam, validateLeagueYear } from "@/lib/const/current";
import { Stack, Text, Title } from "@mantine/core";
import {
  TARGET_KEYS,
  type TargetKey,
  targetKeyToFinish,
} from "@/lib/pace/target-key";

import AnchorLink from "@/components/anchor-link/anchor-link";
import LinkableHeader from "@/components/header/linkable-header";
import type { Metadata } from "next/types";
import OpponentsTable from "@/components/opponents/opponents-table";
import PaceChart from "@/components/pace-chart/pace-chart";
import PaceTable from "@/components/pace-table/pace-table";
import ResultsTable from "@/components/results-table/results-table";
import TeamFixtures from "@/components/team-fixtures/team-fixtures";

import { fetchPaceTeams } from "@/lib/pace/pace";
import { fetchTeamColorMap } from "@/lib/color";
import prisma from "@/lib/prisma";
import year from "@/lib/const/year";

export async function generateStaticParams(): Promise<
  (SeasonPageParam & {
    target: TargetKey;
  })[]
> {
  const matches = await prisma.match.findMany({
    where: { year: year },
  });
  const params = new Set<SeasonPageParam>();
  for (const m of matches) {
    params.add({
      league: m.league,
      year: "" + m.year,
      team: m.homeTeam,
    });
    params.add({
      league: m.league,
      year: "" + m.year,
      team: m.awayTeam,
    });
  }
  return TARGET_KEYS.flatMap((target) =>
    Array.from(params).map((p) => ({ ...p, target })),
  );
}

export async function generateMetadata(
  props: PageProps<"/ssr/[target]/[league]/[year]/team/[team]">,
): Promise<Metadata> {
  const { league, year, team } = await props.params;
  return {
    alternates: {
      canonical: `/${league}/${year}/team/${encodeURIComponent(team)}`,
    },
  };
}

export default async function TeamSSR(
  props: PageProps<"/ssr/[target]/[league]/[year]/team/[team]">,
) {
  const { league, year, team, target } = await props.params;
  const [_leagueInfo, yearInt] = validateLeagueYear({ league, year });
  const teamDecoded = decodeURIComponent(team);
  const tf = targetKeyToFinish[target as TargetKey];
  const [paceTeams, teamColorMap] = await Promise.all([
    fetchPaceTeams(league, yearInt, tf),
    fetchTeamColorMap(),
  ]);
  const paceTeam = paceTeams.find((pt) => pt.team == teamDecoded)!;
  const pacePlace = paceTeams.findIndex((pt) => pt.team == teamDecoded);
  const previewMatches = Array.from(paceTeam.paceMatches).reverse().slice(0, 3);

  return (
    <Stack>
      <Title order={2}>{teamDecoded}</Title>
      <AnchorLink
        href={`/${league}/${yearInt}`}
        style={{ alignSelf: "flex-start" }}
      >
        <Text fs="italic">
          {league} {yearInt}
        </Text>
      </AnchorLink>
      <LinkableHeader order={3} title="Recent Matches" />
      <ResultsTable
        paceMatches={previewMatches}
        league={league}
        team={teamDecoded}
      />
      <LinkableHeader order={3} title="Table" />
      <PaceTable
        paceTeams={paceTeams.slice(
          Math.max(pacePlace - 2, 0),
          Math.min(pacePlace + 3, paceTeams.length),
        )}
        startPlace={Math.max(pacePlace - 2, 0)}
      />
      <LinkableHeader order={3} title="Pace Chart" />
      <PaceChart paceTeams={[paceTeam]} teamColorMap={teamColorMap} />
      <OpponentsTable
        league={league}
        year={yearInt}
        paceTeam={paceTeam}
        targetFinish={tf}
      />
      <LinkableHeader order={3} title="Full Results" />
      <ResultsTable
        paceMatches={paceTeam.paceMatches}
        league={league}
        team={teamDecoded}
      />
      <TeamFixtures
        league={league}
        year={yearInt}
        team={teamDecoded}
        targetFinish={tf}
      />
    </Stack>
  );
}
