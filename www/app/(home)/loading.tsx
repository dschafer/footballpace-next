import { Skeleton, Stack, Text } from "@mantine/core";
import StandingsTablePlaceholder from "@/components/standings-table/standings-table-placeholder";
import leagues from "@/lib/leagues";

export default function Home() {
  return (
    <Stack>
      {Array.from(leagues).map(([league, _]) => (
        <Stack key={league}>
          <StandingsTablePlaceholder rowCount={5} key={league} />
          <Text ta="right">
            <Skeleton>Full Table »</Skeleton>
          </Text>
        </Stack>
      ))}
    </Stack>
  );
}
