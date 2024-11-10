import { Skeleton, Stack, Title } from "@mantine/core";
import PaceChartPlaceholder from "@/components/pace-chart/pace-chart-placeholder";

export default function ChartLoading() {
  return (
    <Stack>
      <Title order={2}>
        <Skeleton>English Premier League 2023</Skeleton>
      </Title>
      <PaceChartPlaceholder />
      <Skeleton
        ta="right"
        style={{
          alignSelf: "flex-end",
        }}
        width={100}
      >
        Pace Table »
      </Skeleton>
    </Stack>
  );
}
