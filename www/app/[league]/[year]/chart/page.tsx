import {
  type LeagueYearParam,
  currentSeasons,
  validateLeagueYear,
} from "@/lib/const/current";
import { Stack, Title } from "@mantine/core";
import AnchorLink from "@/components/anchor-link/anchor-link";
import StandingsPaceChart from "@/components/pace-chart/standings-pace-chart";

export function generateStaticParams(): LeagueYearParam[] {
  return currentSeasons;
}

export default async function ChartPage({
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
      <StandingsPaceChart league={league} year={yearInt} />
      <AnchorLink
        href={`/${league}/${yearInt}`}
        ta="right"
        style={{
          alignSelf: "flex-end",
        }}
      >
        Pace Table »
      </AnchorLink>
    </Stack>
  );
}
