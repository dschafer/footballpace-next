import { Stack, Title } from "@mantine/core";
import {
  fetchFixtures,
  fetchMatches,
  shouldCacheSeasonData,
} from "@/lib/pace/data";
import { isUnplayedFixture, playedFixtureKeys } from "@/lib/pace/fixtures";
import Fixtures from "./fixtures";
import LeagueFixturesPlaceholder from "./league-fixtures-placeholder";
import { Suspense } from "react";

type LeagueFixturesProps = {
  league: string;
  year: number;
};

export default function LeagueFixtures(props: LeagueFixturesProps) {
  if (shouldCacheSeasonData(props.league, props.year)) {
    return <LeagueFixturesContent {...props} />;
  }
  return (
    <Suspense
      fallback={
        <LeagueFixturesPlaceholder
          monthCount={5}
          dayCount={10}
          matchCount={5}
        />
      }
    >
      <LeagueFixturesContent {...props} />
    </Suspense>
  );
}

async function LeagueFixturesContent({ league, year }: LeagueFixturesProps) {
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
