import { ExtendedStandingsRow, fetchStandings } from "@/lib/pace/standings";
import { LeagueYearParam, currentSeasons } from "@/lib/const/current";
import { PaceFixture, fetchPaceFixtures } from "@/lib/pace/pace";
import { Stack, Title } from "@mantine/core";
import UpcomingTable from "@/components/upcoming-table/upcoming-table";
import leagues from "@/lib/const/leagues";

export function generateStaticParams(): LeagueYearParam[] {
  return currentSeasons.filter(({ league }) => leagues.get(league)?.fixtures);
}

async function standingsRowToFixturesMapEntry(
  esr: ExtendedStandingsRow,
): Promise<[string, PaceFixture[]]> {
  const team = esr.team;
  const pfs = await fetchPaceFixtures(esr.league, esr.year, team);
  return [team, pfs.filter((pf) => pf.fixture.kickoffTime > new Date())];
}

export default async function UpcomingPage({
  params,
}: {
  params: LeagueYearParam;
}) {
  const yearInt = parseInt(params.year);
  const standings = await fetchStandings(params.league, yearInt);
  const fixtures = await Promise.all(
    standings.map(standingsRowToFixturesMapEntry),
  );
  const fixturesMap = new Map(fixtures);

  return (
    <Stack>
      <Title order={2}>Upcoming Fixtures</Title>
      <UpcomingTable standings={standings} fixtures={fixturesMap} />
    </Stack>
  );
}
