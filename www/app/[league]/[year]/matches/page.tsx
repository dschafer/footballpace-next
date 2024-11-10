import { Stack, Title } from "@mantine/core";
import Fixtures from "@/components/fixtures/fixtures";
import { LeagueYearParam } from "@/lib/const/current";
import Matches from "@/components/matches/matches";
import leagues from "@/lib/const/leagues";

export default function MatchesPage({ params }: { params: LeagueYearParam }) {
  const yearInt = parseInt(params.year);
  return (
    <Stack>
      <Title order={2}>
        {leagues.get(params.league)?.name} {yearInt}
      </Title>
      <Title order={3}>Results</Title>
      <Matches league={params.league} year={yearInt} />
      <Title order={3}>Fixtures</Title>
      <Fixtures league={params.league} year={yearInt} />
    </Stack>
  );
}
