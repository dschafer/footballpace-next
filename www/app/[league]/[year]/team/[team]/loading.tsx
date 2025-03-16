import { Skeleton, Stack, Title } from "@mantine/core";
import PaceChartPlaceholder from "@/components/pace-chart/pace-chart-placeholder";
import PaceTablePlaceholder from "@/components/pace-table/pace-table-placeholder";
import ResultsTablePlaceholder from "@/components/results-table/results-table-placeholder";
import TeamFixturesPlaceholder from "@/components/team-fixtures/team-fixtures-placeholder";

export default function SeasonLoading() {
  return (
    <Stack>
      <Title order={2}>
        <Skeleton>Arsenal</Skeleton>
      </Title>
      <Skeleton>English Premier League 2023</Skeleton>
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
      <ResultsTablePlaceholder rowCount={19} />
      <TeamFixturesPlaceholder matchCount={19} />
    </Stack>
  );
}
