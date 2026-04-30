import type { Fixture, Match } from "@/prisma/generated/client";

type FixtureMatchKeyParts = Pick<
  Fixture | Match,
  "awayTeam" | "homeTeam" | "league" | "year"
>;

function fixtureMatchKey({
  awayTeam,
  homeTeam,
  league,
  year,
}: FixtureMatchKeyParts): string {
  return `${league}/${year}/${homeTeam}/${awayTeam}`;
}

export function playedFixtureKeys(matches: Match[]): Set<string> {
  return new Set(matches.map(fixtureMatchKey));
}

export function isUnplayedFixture(
  fixture: Fixture,
  playedKeys: Set<string>,
): boolean {
  return !playedKeys.has(fixtureMatchKey(fixture));
}
