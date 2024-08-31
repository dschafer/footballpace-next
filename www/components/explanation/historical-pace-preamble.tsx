import { Text } from "@mantine/core";

export default function HistoricalPacePreamble() {
  return (
    <>
      <Text>
        This table shows the expected number of points a championship team would
        take from each match, based on historical data. To read, find the
        position of the opponent in the table along the top, then note whether
        the game was home or away. The value in that row and column is how many
        points we would expect to take from that match.
      </Text>
    </>
  );
}
