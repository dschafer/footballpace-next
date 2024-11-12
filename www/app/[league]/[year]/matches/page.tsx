import { LeagueYearParam, currentSeasons } from "@/lib/const/current";
import { SimpleGrid, Stack, Title } from "@mantine/core";
import LeagueFixtures from "@/components/fixtures/league-fixtures";
import Matches from "@/components/matches/matches";
import leagues from "@/lib/const/leagues";

export function generateStaticParams(): LeagueYearParam[] {
  return currentSeasons;
}

export default function MatchesPage({ params }: { params: LeagueYearParam }) {
  const yearInt = parseInt(params.year);
  return (
    <Stack>
      <Title order={2}>
        {leagues.get(params.league)?.name} {yearInt}
      </Title>
      <SimpleGrid cols={{ base: 1, lg: 2 }}>
        <Matches league={params.league} year={yearInt} />
        <LeagueFixtures league={params.league} year={yearInt} />
      </SimpleGrid>
    </Stack>
  );
}
