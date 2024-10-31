import { Skeleton, Stack, Title } from "@mantine/core";
import HistoricalPacePreamble from "@/components/explanation/historical-pace-preamble";
import HistoricalPaceTablePlaceholder from "@/components/explanation/historical-pace-table-placeholder";
import ProjectedStandingsPreamble from "@/components/explanation/projected-standings-preamble";
import ProjectedStandingsTablePlaceholder from "@/components/explanation/projected-standings-table-placeholder";

export default function ExplanationLoading() {
  return (
    <Stack>
      <Title
        order={2}
        style={{
          alignSelf: "flex-start",
        }}
      >
        <Skeleton>Historical Pace</Skeleton>
      </Title>
      <Skeleton>
        <HistoricalPacePreamble />
      </Skeleton>
      <HistoricalPaceTablePlaceholder teamCount={20} />
      <Title
        order={2}
        style={{
          alignSelf: "flex-start",
        }}
      >
        <Skeleton>Estimated Standings</Skeleton>
      </Title>
      <Skeleton>
        <ProjectedStandingsPreamble />
      </Skeleton>
      <ProjectedStandingsTablePlaceholder rowCount={20} />
    </Stack>
  );
}