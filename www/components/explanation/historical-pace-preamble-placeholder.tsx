import { Skeleton, Stack, Text } from "@mantine/core";

export default function HistoricalPacePreamblePlaceholder() {
  return (
    <Stack>
      <Skeleton>
        <Text>
          This table shows the target number of points a championship team would
          take from each match, based on historical data.
        </Text>
      </Skeleton>
      <Skeleton>
        <Text>
          For example, the hardest match of the year for a championship team is
          away to the team that finishes 2nd.
        </Text>
      </Skeleton>
    </Stack>
  );
}
