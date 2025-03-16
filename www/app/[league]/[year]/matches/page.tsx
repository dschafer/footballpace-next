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

export default async function MatchesPage(props: { params: Promise<LeagueYearParam> }) {
  const params = await props.params;
  const [leagueInfo, yearInt] = validateLeagueYear(params);
  return (
    <Stack>
      <Title order={2}>
        {leagueInfo.name} {yearInt}
      </Title>
      <SimpleGrid cols={{ base: 1, lg: 2 }}>
        <Matches league={params.league} year={yearInt} />
        <LeagueFixtures league={params.league} year={yearInt} />
      </SimpleGrid>
    </Stack>
  );
}
