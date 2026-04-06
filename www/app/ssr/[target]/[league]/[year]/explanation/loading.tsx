import { Skeleton, Stack, Text, Title } from "@mantine/core";

import HistoricalPaceTablePlaceholder from "@/components/explanation/historical-pace-table-placeholder";
import ProjectedStandingsTablePlaceholder from "@/components/explanation/projected-standings-table-placeholder";

export default function ExplanationLoading() {
  return (
    <Stack>
      <Title order={2}>
        <Skeleton>Historical Pace</Skeleton>
      </Title>
      <Skeleton>
        <Text>
          This table shows the target number of points a championship team would take from each match, based on historical data.
        </Text>
      </Skeleton>
      <HistoricalPaceTablePlaceholder teamCount={20} />
      <Title order={2}>
        <Skeleton>Estimated Standings</Skeleton>
      </Title>
      <Skeleton>
        <Text>
          This table shows the projected standings for the current year and explains the estimation approach.
        </Text>
      </Skeleton>
      <ProjectedStandingsTablePlaceholder rowCount={20} />
    </Stack>
  );
}

