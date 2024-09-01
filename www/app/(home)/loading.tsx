import { Skeleton, Stack, Text, Title } from "@mantine/core";
import RecentPaceTablePlaceholder from "@/components/pace-table/recent-pace-table-placeholder";
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
          <RecentPaceTablePlaceholder rowCount={5} key={league} />
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
