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
          This table shows the target number of points a championship team would
          take from each match, based on historical data. To read, find the row
          for the position of the opponent, then note whether the game was home
          or away and go to that column. The value in that row and column is how
          many points a typical championship team takes from that match.
        </Text>
      </Skeleton>
      <HistoricalPaceTablePlaceholder teamCount={20} />
      <Title order={2}>
        <Skeleton>Estimated Standings</Skeleton>
      </Title>
      <Skeleton>
        <Text>
          This table shows the projected standings for the current year. This
          accounts for the unpredicatability of the table during the early part
          of the season by adding in results from the previous season to make up
          the difference. More concretely:
        </Text>
      </Skeleton>
      <ProjectedStandingsTablePlaceholder rowCount={20} />
    </Stack>
  );
}
