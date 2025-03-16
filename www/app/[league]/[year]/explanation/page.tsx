import {
  type LeagueYearParam,
  currentSeasons,
  validateLeagueYear,
} from "@/lib/const/current";
import { Stack, Title } from "@mantine/core";
import HistoricalPacePreamble from "@/components/explanation/historical-pace-preamble";
import HistoricalPaceTable from "@/components/explanation/historical-pace-table";
import ProjectedStandingsPreamble from "@/components/explanation/projected-standings-preamble";
import ProjectedStandingsTable from "@/components/explanation/projected-standings-table";

export function generateStaticParams(): LeagueYearParam[] {
  return currentSeasons;
}

export default async function ExplanationPage({
  params,
}: {
  params: Promise<LeagueYearParam>;
}) {
  const { league, year } = await params;
  const [_leagueInfo, yearInt] = validateLeagueYear({ league, year });
  return (
    <Stack>
      <Title order={2}>Historical Pace</Title>
      <HistoricalPacePreamble league={league} year={yearInt} />
      <HistoricalPaceTable league={league} year={yearInt} />
      <Title order={2}>Estimated Standings</Title>
      <ProjectedStandingsPreamble />
      <ProjectedStandingsTable league={league} year={yearInt} />
    </Stack>
  );
}
