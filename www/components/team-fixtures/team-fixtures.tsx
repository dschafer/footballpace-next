import {
  NumberFormatter,
  Stack,
  Table,
  TableScrollContainer,
  TableTbody,
  TableTd,
  TableTfoot,
  TableTh,
  TableThead,
  TableTr,
} from "@mantine/core";
import { cacheLife, cacheTag } from "next/cache";
import {
  globalDataCacheTag,
  leagueCacheTag,
  matchesCacheTag,
} from "@/lib/cache-tags";
import { isUnplayedFixture, playedFixtureKeys } from "@/lib/pace/fixtures";
import FixtureDifficultyCell from "../pace-display/fixture-difficulty-cell";
import LinkableHeader from "../header/linkable-header";
import type { Match } from "@/prisma/generated/client";
import { fetchPaceFixtures } from "@/lib/pace/pace";
import leagues from "@/lib/const/leagues";
import prisma from "@/lib/prisma";

async function fetchMatches(league: string, year: number): Promise<Match[]> {
  "use cache";
  cacheLife("max");
  cacheTag(
    globalDataCacheTag,
    leagueCacheTag(league, year),
    matchesCacheTag(league, year),
  );

  return prisma.match.findMany({ where: { league: league, year: year } });
}

export default async function TeamFixtures({
  league,
  year,
  team,
  targetFinish = 1,
}: {
  league: string;
  year: number;
  team: string;
  targetFinish?: number;
}) {
  const [fixtures, matches] = await Promise.all([
    fetchPaceFixtures(league, year, team, targetFinish),
    fetchMatches(league, year),
  ]);
  const playedKeys = playedFixtureKeys(matches);
  const upcomingFixtures = fixtures.filter((f) =>
    isUnplayedFixture(f.fixture, playedKeys),
  );
  if (fixtures.length == 0) {
    return null;
  }
  const dateTimeFormat = Intl.DateTimeFormat(undefined, {
    timeZone: leagues.get(league)?.tz,
    dateStyle: "short",
    timeStyle: "short",
  });
  return (
    <Stack>
      <LinkableHeader order={3} title="Fixtures" />
      <TableScrollContainer minWidth={0}>
        <Table stickyHeader striped>
          <TableThead>
            <TableTr>
              <TableTh ta="right">Date</TableTh>
              <TableTh ta="right">Match</TableTh>
              <TableTh ta="right">Target Pace</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {upcomingFixtures.map((pf, i) => (
              <TableTr key={i}>
                <TableTd ta="right">
                  {pf.fixture.kickoffTime
                    ? dateTimeFormat.format(pf.fixture.kickoffTime)
                    : "Rescheduled"}
                </TableTd>
                <TableTd ta="right">
                  {pf.home ? "vs " + pf.opponent : "at " + pf.opponent}
                </TableTd>
                <FixtureDifficultyCell ta="right" val={pf.expectedPoints}>
                  <NumberFormatter
                    value={pf.expectedPoints}
                    decimalScale={2}
                    fixedDecimalScale
                  />
                </FixtureDifficultyCell>
              </TableTr>
            ))}
          </TableTbody>
          <TableTfoot fw={700}>
            <TableTr>
              <TableTd ta="right"></TableTd>
              <TableTd ta="right">{upcomingFixtures.length} matches</TableTd>
              <TableTd ta="right">
                <NumberFormatter
                  value={upcomingFixtures.reduce(
                    (a, uf) => a + uf.expectedPoints,
                    0,
                  )}
                  decimalScale={2}
                  fixedDecimalScale
                />
              </TableTd>
            </TableTr>
          </TableTfoot>
        </Table>
      </TableScrollContainer>
    </Stack>
  );
}
