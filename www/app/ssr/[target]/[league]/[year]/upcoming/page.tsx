import {
  type ExtendedStandingsRow,
  fetchStandings,
} from "@/lib/pace/standings";
import {
  type LeagueYearParam,
  currentSeasons,
  validateLeagueYear,
} from "@/lib/const/current";
import { Stack, Title } from "@mantine/core";

import {
  TARGET_KEYS,
  type TargetKey,
  targetKeyToFinish,
} from "@/lib/pace/target-key";
import { cacheLife, cacheTag } from "next/cache";

import {
  globalDataCacheTag,
  leagueCacheTag,
  matchesCacheTag,
} from "@/lib/cache-tags";
import { isUnplayedFixture, playedFixtureKeys } from "@/lib/pace/fixtures";
import type { Match } from "@/prisma/generated/client";
import type { Metadata } from "next/types";
import { type PaceFixture } from "@/lib/pace/pace-types";
import UpcomingTable from "@/components/upcoming-table/upcoming-table";
import { fetchPaceFixtures } from "@/lib/pace/pace";
import prisma from "@/lib/prisma";

async function fetchMatches(league: string, year: number): Promise<Match[]> {
  "use cache";
  cacheLife("max");
  cacheTag(
    globalDataCacheTag,
    leagueCacheTag(league, year),
    matchesCacheTag(league, year),
  );

  return prisma.match.findMany({ where: { league: league, year: year } });
}

export function generateStaticParams(): (LeagueYearParam & {
  target: TargetKey;
})[] {
  return TARGET_KEYS.flatMap((target) =>
    currentSeasons.map((p) => ({ ...p, target })),
  );
}

export async function generateMetadata(
  props: PageProps<"/ssr/[target]/[league]/[year]/upcoming">,
): Promise<Metadata> {
  const { league, year } = await props.params;
  return { alternates: { canonical: `/${league}/${year}/upcoming` } };
}

async function rowToFixtures(
  esr: ExtendedStandingsRow,
  tf: number,
  playedKeys: Set<string>,
): Promise<[string, PaceFixture[]]> {
  const pfs = await fetchPaceFixtures(esr.league, esr.year, esr.team, tf);
  return [
    esr.team,
    pfs.filter((pf) => isUnplayedFixture(pf.fixture, playedKeys)),
  ];
}

async function UpcomingFixtures({
  league,
  year,
  targetFinish,
}: {
  league: string;
  year: number;
  targetFinish: number;
}) {
  const [standings, matches] = await Promise.all([
    fetchStandings(league, year),
    fetchMatches(league, year),
  ]);

  const playedKeys = playedFixtureKeys(matches);
  const fixtures = await Promise.all(
    standings.map((esr) => rowToFixtures(esr, targetFinish, playedKeys)),
  );
  const fixturesMap = new Map(fixtures);
  return (
    <UpcomingTable
      standings={standings}
      fixtures={fixturesMap}
      targetFinish={targetFinish}
    />
  );
}

export default async function UpcomingSSR(
  props: PageProps<"/ssr/[target]/[league]/[year]/upcoming">,
) {
  const { league, year, target } = await props.params;
  const [_leagueInfo, yearInt] = validateLeagueYear({ league, year });
  const tf = targetKeyToFinish(league)[target as TargetKey];
  return (
    <Stack>
      <Title order={2}>Upcoming Fixtures</Title>
      <UpcomingFixtures league={league} year={yearInt} targetFinish={tf} />
    </Stack>
  );
}
