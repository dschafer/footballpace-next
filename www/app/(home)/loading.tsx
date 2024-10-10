import { Skeleton, Stack, Text, Title } from "@mantine/core";
import RecentPaceTablePlaceholder from "@/components/recent-pace-table/recent-pace-table-placeholder";
import leagues from "@/lib/const/leagues";

export default function Home() {
  return (
    <Stack>
      <Title
        order={2}
        style={{
          alignSelf: "flex-start",
        }}
      >
        What is Football Pace?
      </Title>
      <Text>
        Football Pace is a version of the standings table that accounts for
        strength of schedule. It looks at historical data to see how a typical
        champion performs in each match, based on home/away and the opponent
        {"'"}s finishing position. It then presents a new version of the
        standings table, that shows how each team is doing compared to typical
        championship pace, given their schedule so far.
      </Text>
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
          <Stack style={{ maxWidth: "var(--mantine-breakpoint-md)" }}>
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
        </Stack>
      ))}
    </Stack>
  );
}
