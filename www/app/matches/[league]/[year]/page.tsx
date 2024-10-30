import { Stack, Title } from "@mantine/core";
import Matches from "@/components/matches/matches";
import currentSeasons from "@/lib/const/current";
import leagues from "@/lib/const/leagues";

export function generateStaticParams() {
  return currentSeasons;
}

export default function MatchesPage({
  params,
}: {
  params: {
    league: string;
    year: string;
  };
}) {
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
