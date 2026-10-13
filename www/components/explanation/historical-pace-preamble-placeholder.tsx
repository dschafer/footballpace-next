import { Skeleton, Stack, Text } from "@mantine/core";

export default function HistoricalPacePreamblePlaceholder() {
  return (
    <Stack>
      <Skeleton>
        <Text>
          This table shows the target number of points a team would take from
          each match, based on historical data and the pace target.
        </Text>
      </Skeleton>
      <Skeleton>
        <Text>
          For example, consider an away match against the highest-finishing
          opponent (note that if the pace target is the championship, the
          highest-finished opponent would be projected to finish 2nd, even if in
          reality they finished 1st).
        </Text>
      </Skeleton>
    </Stack>
  );
}
