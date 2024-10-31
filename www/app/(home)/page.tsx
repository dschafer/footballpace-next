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

      <Spoiler maxHeight={80} showLabel="Read more" hideLabel="Hide">
        <Text>
          Football Pace is a version of the standings table that accounts for
          strength of schedule. It looks at historical data to see how a typical
          champion performs in each match, based on home/away and the opponent
          {"'"}s finishing position. It then presents a new version of the
          standings table, that shows how each team is doing compared to typical
          championship pace, given their schedule so far.
        </Text>
      </Spoiler>
      <SimpleGrid cols={{ base: 1, lg: 2 }}>
        {Array.from(leagues).map(([leagueCode, _]) => (
          <Stack key={leagueCode} p={{ base: 0, lg: "xs" }}>
            <Title
              order={2}
              style={{
                alignSelf: "flex-start",
              }}
            >
              {leagues.get(leagueCode)?.name} {year}
            </Title>
            <RecentPaceTable rowCount={5} league={leagueCode} year={year} />
            <Group
              style={{
                alignSelf: "flex-end",
              }}
            >
              <Breadcrumbs separator=" · ">
                <Anchor
                  component={Link}
                  href={`/${leagueCode}/${year}/chart`}
                  ta="right"
                >
                  Pace Chart »
                </Anchor>
                <Anchor
                  component={Link}
                  href={`/${leagueCode}/${year}`}
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
