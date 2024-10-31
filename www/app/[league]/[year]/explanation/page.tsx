import { LeagueYearParam, currentSeasons } from "@/lib/const/current";
import { Stack, Title } from "@mantine/core";
import HistoricalPacePreamble from "@/components/explanation/historical-pace-preamble";
import HistoricalPaceTable from "@/components/explanation/historical-pace-table";
import ProjectedStandingsPreamble from "@/components/explanation/projected-standings-preamble";
import ProjectedStandingsTable from "@/components/explanation/projected-standings-table";

export function generateStaticParams(): LeagueYearParam[] {
  return currentSeasons;
}

export default function ExplanationPage({
  params,
}: {
  params: LeagueYearParam;
}) {
  return (
    <Stack>
      <Title
        order={2}
        style={{
          alignSelf: "flex-start",
        }}
      >
        Historical Pace
      </Title>
      <HistoricalPacePreamble />
      <HistoricalPaceTable
        league={params.league}
        year={parseInt(params.year)}
      />
      <Title
        order={2}
        style={{
          alignSelf: "flex-start",
        }}
      >
        Estimated Standings
      </Title>
      <ProjectedStandingsPreamble />
      <ProjectedStandingsTable
        league={params.league}
        year={parseInt(params.year)}
      />
    </Stack>
  );
}