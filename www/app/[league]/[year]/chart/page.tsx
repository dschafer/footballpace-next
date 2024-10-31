import { Anchor, Stack, Title } from "@mantine/core";
import { LeagueYearParam, currentSeasons } from "@/lib/const/current";
import Link from "next/link";
import StandingsPaceChart from "@/components/pace-chart/standings-pace-chart";
import leagues from "@/lib/const/leagues";

export function generateStaticParams(): LeagueYearParam[] {
  return currentSeasons;
}

export default function ChartPage({ params }: { params: LeagueYearParam }) {
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
      <StandingsPaceChart league={params.league} year={yearInt} />
      <Anchor
        component={Link}
        href={`/${params.league}/${yearInt}`}
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
