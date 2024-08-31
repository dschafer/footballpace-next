import { Skeleton, Title } from "@mantine/core";
import HistoricalPacePreamble from "@/components/explanation/historical-pace-preamble";
import HistoricalPaceTablePlaceholder from "@/components/explanation/historical-pace-table-placeholder";

export default function ExplanationLoading() {
  return (
    <>
      <Title order={2}>
        <Skeleton>Historical Pace</Skeleton>
      </Title>
      <Skeleton>
        <HistoricalPacePreamble />
      </Skeleton>
      <HistoricalPaceTablePlaceholder teamCount={20} />
      <Title order={2}>
        <Skeleton>Estimated Standings</Skeleton>
      </Title>
    </>
  );
}
