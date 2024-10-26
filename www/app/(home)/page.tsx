import {
  Anchor,
  Breadcrumbs,
  Group,
  Paper,
  SimpleGrid,
  Spoiler,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import Link from "next/link";
import RecentPaceTable from "@/components/recent-pace-table/recent-pace-table";
import leagues from "@/lib/const/leagues";
import year from "@/lib/const/year";

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
        <Spoiler maxHeight={80} showLabel="Read more" hideLabel="Hide">
          Football Pace is a version of the standings table that accounts for
          strength of schedule. It looks at historical data to see how a typical
          champion performs in each match, based on home/away and the opponent
          {"'"}s finishing position. It then presents a new version of the
          standings table, that shows how each team is doing compared to typical
          championship pace, given their schedule so far.
        </Spoiler>
      </Text>
      <SimpleGrid cols={{ base: 1, lg: 2 }}>
        {Array.from(leagues).map(([league, _]) => (
          <Stack key={league} p={{ base: 0, lg: "xs" }}>
            <Title
              order={2}
              style={{
                alignSelf: "flex-start",
              }}
            >
              {leagues.get(league)} {year}
            </Title>
            <RecentPaceTable rowCount={5} league={league} year={year} />
            <Group
              style={{
                alignSelf: "flex-end",
              }}
            >
              <Breadcrumbs separator=" · ">
                <Anchor
                  component={Link}
                  href={`/chart/${league}/${year}`}
                  ta="right"
                >
                  Pace Chart »
                </Anchor>
                <Anchor
                  component={Link}
                  href={`/pace/${league}/${year}`}
                  ta="right"
                >
                  Full Pace Table »
                </Anchor>
              </Breadcrumbs>
            </Group>
          </Stack>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
