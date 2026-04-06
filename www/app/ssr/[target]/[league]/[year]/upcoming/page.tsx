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
import type { Metadata } from "next/types";
import { type PaceFixture } from "@/lib/pace/pace-types";
import UpcomingTable from "@/components/upcoming-table/upcoming-table";
import { fetchPaceFixtures } from "@/lib/pace/pace";

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
): Promise<[string, PaceFixture[]]> {
  const pfs = await fetchPaceFixtures(esr.league, esr.year, esr.team, tf);
  return [esr.team, pfs.filter((pf) => pf.fixture.kickoffTime > new Date())];
}

export default async function UpcomingSSR(
  props: PageProps<"/ssr/[target]/[league]/[year]/upcoming">,
) {
  const { league, year, target } = await props.params;
  const [_leagueInfo, yearInt] = validateLeagueYear({ league, year });
  const tf = targetKeyToFinish[target as TargetKey];
  const standings = await fetchStandings(league, yearInt);
  const fixtures = await Promise.all(
    standings.map((esr) => rowToFixtures(esr, tf)),
  );
  const fixturesMap = new Map(fixtures);
  return (
    <Stack>
      <Title order={2}>Upcoming Fixtures</Title>
      <UpcomingTable standings={standings} fixtures={fixturesMap} />
    </Stack>
  );
}
