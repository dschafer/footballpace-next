import { Skeleton, Stack, Text, Title } from "@mantine/core";
import FixturesTablePlaceholder from "@/components/fixtures-table/fixtures-table-placeholder";
import PaceChartPlaceholder from "@/components/pace-chart/pace-chart-placeholder";

export default function SeasonLoading() {
  return (
    <Stack>
      <Title
        order={2}
        style={{
          alignSelf: "flex-start",
        }}
      >
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
      <Title
        order={3}
        style={{
          alignSelf: "flex-start",
        }}
      >
        <Skeleton>Recent Matches</Skeleton>
      </Title>
      <FixturesTablePlaceholder rowCount={3} />
      <Title
        order={3}
        style={{
          alignSelf: "flex-start",
        }}
      >
        <Skeleton>Pace Chart</Skeleton>
      </Title>
      <PaceChartPlaceholder />
      <Title
        order={3}
        style={{
          alignSelf: "flex-start",
        }}
      >
        <Skeleton>Full Schedule</Skeleton>
      </Title>
      <FixturesTablePlaceholder rowCount={38} />
    </Stack>
  );
}
