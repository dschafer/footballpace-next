import { Skeleton, Stack, Text, Title } from "@mantine/core";
import PaceChartPlaceholder from "@/components/pace-chart/pace-chart-placeholder";
import PaceTablePlaceholder from "@/components/pace-table/pace-table-placeholder";
import ResultsTablePlaceholder from "@/components/results-table/results-table-placeholder";

export default function SeasonLoading() {
  return (
    <Stack>
      <Title order={2}>
        <Skeleton>Arsenal</Skeleton>
      </Title>
      <Text
        fs="italic"
        style={{
          alignSelf: "flex-start",
        }}
      >
        <Skeleton>English Premier League 2023</Skeleton>
      </Text>
      <Title order={3}>
        <Skeleton>Recent Matches</Skeleton>
      </Title>
      <ResultsTablePlaceholder rowCount={3} />
      <Title order={3}>
        <Skeleton>Table</Skeleton>
      </Title>
      <PaceTablePlaceholder rowCount={5} matchdayCount={38} />
      <Title order={3}>
        <Skeleton>Pace Chart</Skeleton>
      </Title>
      <PaceChartPlaceholder />
      <Title order={3}>
        <Skeleton>Full Schedule</Skeleton>
      </Title>
      <ResultsTablePlaceholder rowCount={38} />
    </Stack>
  );
}
