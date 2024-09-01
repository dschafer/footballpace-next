import { Skeleton, Stack, Text, Title } from "@mantine/core";
import StandingsTablePlaceholder from "@/components/standings-table/standings-table-placeholder";
import leagues from "@/lib/const/leagues";

export default function Home() {
  return (
    <Stack>
      {Array.from(leagues).map(([league, _]) => (
        <Stack key={league}>
          <Title
            order={2}
            style={{
              alignSelf: "flex-start",
            }}
          >
            <Skeleton>English Premier League 2023</Skeleton>
          </Title>
          <StandingsTablePlaceholder rowCount={5} key={league} />
          <Skeleton
            ta="right"
            style={{
              alignSelf: "flex-end",
            }}
            width={100}
          >
            Full Table »
          </Skeleton>
        </Stack>
      ))}
    </Stack>
  );
}
