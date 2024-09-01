import { Stack, Title } from "@mantine/core";
import HistoricalPacePreamble from "@/components/explanation/historical-pace-preamble";
import HistoricalPaceTable from "@/components/explanation/historical-pace-table";

export default function ExplanationPage({
  params,
}: {
  params: {
    league: string;
    year: string;
  };
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
    </Stack>
  );
}
