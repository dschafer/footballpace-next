import { Stack, Title } from "@mantine/core";
import {
  fetchFixtures,
  fetchMatches,
} from "@/lib/pace/data";
import { isUnplayedFixture, playedFixtureKeys } from "@/lib/pace/fixtures";
import Fixtures from "./fixtures";

export default async function LeagueFixtures({
  league,
  year,
}: {
  league: string;
  year: number;
}) {
  const [fixtures, matches] = await Promise.all([
    fetchFixtures(league, year, {
      orderBy: { kickoffTime: { sort: "asc", nulls: "last" } },
    }),
    fetchMatches(league, year),
  ]);
  const playedKeys = playedFixtureKeys(matches);
  const unplayedFixtures = fixtures.filter((fixture) =>
    isUnplayedFixture(fixture, playedKeys),
  );
  if (unplayedFixtures.length == 0) {
    return null;
  }
  return (
    <Stack>
      <Title order={3}>Fixtures</Title>
      <Fixtures
        league={league}
        fixtures={unplayedFixtures}
        dateHeadings={true}
      />
    </Stack>
  );
}
