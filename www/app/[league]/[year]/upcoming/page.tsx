import {
  type ExtendedStandingsRow,
  fetchStandings,
} from "@/lib/pace/standings";
import {
  type LeagueYearParam,
  currentSeasons,
  validateLeagueYear,
} from "@/lib/const/current";
import { type PaceFixture, fetchPaceFixtures } from "@/lib/pace/pace";
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

export default async function UpcomingPage(
  props: {
    params: Promise<LeagueYearParam>;
  }
) {
  const params = await props.params;
  const [_leagueInfo, yearInt] = validateLeagueYear(params);
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
