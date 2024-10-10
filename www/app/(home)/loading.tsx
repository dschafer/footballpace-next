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
        strength of schedule. Fans intuitively know that some matches are harder
        than others. A championship contender expects to win against the worst
        team in the league at home. They{"'"}re probably content with a draw to
        a championship rival.
      </Text>
      <Text>
        Football Pace looks at historical data for a league to see how many
        points a typical champion takes from each match, based on home/away and
        finishing position. Using that, it then creates a new version of the
        standings table, that shows how each team is doing compared to the
        {'"'}championship pace{'"'}, given their schedule so far.
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
