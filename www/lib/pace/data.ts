import type {
  Fixture,
  Match,
  PaceSheetEntry,
  Prisma,
  TeamColor,
} from "@/prisma/generated/client";
import {
  fixturesCacheTag,
  globalDataCacheTag,
  leagueCacheTag,
  matchesCacheTag,
  paceSheetsCacheTag,
  targetPaceSheetsCacheTag,
  teamColorsCacheTag,
} from "@/lib/cache-tags";
import { cacheSeasonData } from "@/lib/cache-policy";
import { cacheTag } from "next/cache";
import currentYear from "@/lib/const/year";
import prisma from "@/lib/prisma";

type MatchFindManyArgs = Omit<
  Prisma.MatchFindManyArgs,
  "include" | "omit" | "select" | "where"
> & { where?: Prisma.MatchWhereInput };
type FixtureFindManyArgs = Omit<
  Prisma.FixtureFindManyArgs,
  "include" | "omit" | "select" | "where"
> & { where?: Prisma.FixtureWhereInput };
type PaceSheetEntryFindManyArgs = Omit<
  Prisma.PaceSheetEntryFindManyArgs,
  "include" | "omit" | "select" | "where"
> & { where?: Prisma.PaceSheetEntryWhereInput };

export async function fetchMatches(
  league: string,
  year: number,
  args: MatchFindManyArgs = {},
): Promise<Match[]> {
  "use cache";
  cacheSeasonData(year);
  cacheTag(
    globalDataCacheTag,
    leagueCacheTag(league, year),
    matchesCacheTag(league, year),
  );

  return prisma.match.findMany({
    ...args,
    where: { AND: [{ league, year }, args.where ?? {}] },
  });
}

export async function fetchFixtures(
  league: string,
  year: number,
  args: FixtureFindManyArgs = {},
): Promise<Fixture[]> {
  "use cache";
  cacheSeasonData(year);
  cacheTag(
    globalDataCacheTag,
    leagueCacheTag(league, year),
    fixturesCacheTag(league, year),
  );

  return prisma.fixture.findMany({
    ...args,
    where: { AND: [{ league, year }, args.where ?? {}] },
  });
}

export async function fetchPaceSheetEntries(
  league: string,
  year: number,
  targetFinish: number,
  args: PaceSheetEntryFindManyArgs = {},
): Promise<PaceSheetEntry[]> {
  "use cache";
  cacheSeasonData(year);
  cacheTag(
    globalDataCacheTag,
    paceSheetsCacheTag(league, year),
    targetPaceSheetsCacheTag(league, year, targetFinish),
  );

  return prisma.paceSheetEntry.findMany({
    ...args,
    where: { AND: [{ league, year, teamFinish: targetFinish }, args.where ?? {}] },
  });
}

export async function fetchTeamColors(): Promise<TeamColor[]> {
  "use cache";
  cacheSeasonData(currentYear);
  cacheTag(globalDataCacheTag, teamColorsCacheTag);

  return prisma.teamColor.findMany();
}
