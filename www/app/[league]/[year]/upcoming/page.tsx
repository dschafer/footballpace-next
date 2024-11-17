import { LeagueYearParam, currentSeasons } from "@/lib/const/current";
import { Stack, Title } from "@mantine/core";
import UpcomingTable from "@/components/upcoming-table/upcoming-table";
import { fetchPaceFixtures } from "@/lib/pace/pace";
import { fetchStandings } from "@/lib/pace/standings";
import leagues from "@/lib/const/leagues";

export function generateStaticParams(): LeagueYearParam[] {
  return currentSeasons.filter(({ league }) => leagues.get(league)?.fixtures);
}

export default async function UpcomingPage({
  params,
}: {
  params: LeagueYearParam;
}) {
  const yearInt = parseInt(params.year);
  const standings = (await fetchStandings(params.league, yearInt)).slice(0, 4);
  const fixtures = await Promise.all(
    standings.map(async ({ team }) => {
      const pfs = await fetchPaceFixtures(params.league, yearInt, team);
      return pfs
        .filter((pf) => pf.fixture.kickoffTime > new Date())
        .slice(0, 6);
    }),
  );

  return (
    <Stack>
      <Title order={2}>Upcoming Fixtures</Title>
      <UpcomingTable standings={standings} fixtures={fixtures} />
    </Stack>
  );
}
