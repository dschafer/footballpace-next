import { Anchor, Stack, Title } from "@mantine/core";
import Link from "next/link";
import StandingsPaceChart from "@/components/pace-chart/standings-pace-chart";
import leagues from "@/lib/const/leagues";

export default function ChartPage({
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
      <StandingsPaceChart league={params.league} year={yearInt} />
      <Anchor
        component={Link}
        href={`/pace/${params.league}/${yearInt}`}
        ta="right"
        style={{
          alignSelf: "flex-end",
        }}
      >
        Pace Table »
      </Anchor>
    </Stack>
  );
}
