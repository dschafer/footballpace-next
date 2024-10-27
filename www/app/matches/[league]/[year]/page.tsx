import { Stack, Title } from "@mantine/core";
import Matches from "@/components/matches/matches";
import leagues from "@/lib/const/leagues";

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
        {leagues.get(params.league)} {yearInt}
      </Title>
      <Matches league={params.league} year={yearInt} />
    </Stack>
  );
}
