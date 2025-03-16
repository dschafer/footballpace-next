import {
  type LeagueYearParam,
  currentSeasons,
  validateLeagueYear,
} from "@/lib/const/current";
import { SimpleGrid, Stack, Title } from "@mantine/core";
import LeagueFixtures from "@/components/fixtures/league-fixtures";
import Matches from "@/components/matches/matches";

export function generateStaticParams(): LeagueYearParam[] {
  return currentSeasons;
}

export default async function MatchesPage({
  params,
}: {
  params: Promise<LeagueYearParam>;
}) {
  const { league, year } = await params;
  const [leagueInfo, yearInt] = validateLeagueYear({ league, year });
  return (
    <Stack>
      <Title order={2}>
        {leagueInfo.name} {yearInt}
      </Title>
      <SimpleGrid cols={{ base: 1, lg: 2 }}>
        <Matches league={league} year={yearInt} />
        <LeagueFixtures league={league} year={yearInt} />
      </SimpleGrid>
    </Stack>
  );
}
