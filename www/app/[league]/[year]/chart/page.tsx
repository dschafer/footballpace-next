import { Anchor, Stack, Title } from "@mantine/core";
import {
  LeagueYearParam,
  currentSeasons,
  validateLeagueYear,
} from "@/lib/const/current";
import Link from "next/link";
import StandingsPaceChart from "@/components/pace-chart/standings-pace-chart";

export function generateStaticParams(): LeagueYearParam[] {
  return currentSeasons;
}

export default function ChartPage({ params }: { params: LeagueYearParam }) {
  const [leagueInfo, yearInt] = validateLeagueYear(params);
  return (
    <Stack>
      <Title order={2}>
        {leagueInfo.name} {yearInt}
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
