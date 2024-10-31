import { LeagueYearParam, currentSeasons } from "@/lib/const/current";
import { Stack, Title } from "@mantine/core";
import Matches from "@/components/matches/matches";
import leagues from "@/lib/const/leagues";

export function generateStaticParams(): LeagueYearParam[] {
  return currentSeasons;
}

export default function MatchesPage({ params }: { params: LeagueYearParam }) {
  const yearInt = parseInt(params.year);
  return (
    <Stack>
      <Title
        order={2}
        style={{
          alignSelf: "flex-start",
        }}
      >
        {leagues.get(params.league)?.name} {yearInt}
      </Title>
      <Matches league={params.league} year={yearInt} />
    </Stack>
  );
}
