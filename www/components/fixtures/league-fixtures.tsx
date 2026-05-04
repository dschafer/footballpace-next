import { Stack, Title } from "@mantine/core";
import { cacheLife, cacheTag } from "next/cache";
import {
  fixturesCacheTag,
  globalDataCacheTag,
  leagueCacheTag,
  matchesCacheTag,
} from "@/lib/cache-tags";
import { isUnplayedFixture, playedFixtureKeys } from "@/lib/pace/fixtures";
import Fixtures from "./fixtures";
import prisma from "@/lib/prisma";

export default async function LeagueFixtures({
  league,
  year,
}: {
  league: string;
  year: number;
}) {
  "use cache";
  cacheLife("max");
  cacheTag(
    globalDataCacheTag,
    leagueCacheTag(league, year),
    fixturesCacheTag(league, year),
    matchesCacheTag(league, year),
  );

  const [fixtures, matches] = await Promise.all([
    prisma.fixture.findMany({
      where: { league: league, year: year },
      orderBy: { kickoffTime: { sort: "asc", nulls: "last" } },
    }),
    prisma.match.findMany({ where: { league: league, year: year } }),
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
