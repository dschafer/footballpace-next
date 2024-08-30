import { Skeleton, Stack, Text, Title } from "@mantine/core";
import StandingsTablePlaceholder from "@/components/standings-table/standings-table-placeholder";
import leagues from "@/lib/leagues";

export default function Home() {
  return (
    <Stack>
      {Array.from(leagues).map(([league, _]) => (
        <Stack key={league}>
          <Title order={2}>
            <Skeleton>English Premier League 2023</Skeleton>
          </Title>
          <StandingsTablePlaceholder rowCount={5} key={league} />
          <Text ta="right">
            <Skeleton>Full Table »</Skeleton>
          </Text>
        </Stack>
      ))}
    </Stack>
  );
}
