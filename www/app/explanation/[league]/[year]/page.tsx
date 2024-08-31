import HistoricalPacePreamble from "@/components/explanation/historical-pace-preamble";
import HistoricalPaceTable from "@/components/explanation/historical-pace-table";
import { Title } from "@mantine/core";

export default function ExplanationPage({
  params,
}: {
  params: {
    league: string;
    year: string;
  };
}) {
  return (
    <>
      <Title order={2}>Historical Pace</Title>
      <HistoricalPacePreamble />
      <HistoricalPaceTable
        league={params.league}
        year={parseInt(params.year)}
      />
      <Title order={2}>Estimated Standings</Title>
    </>
  );
}
