import type {
  Fixture,
  Match,
  PaceSheetEntry,
  Prisma,
  TeamColor,
} from "@/prisma/generated/client";
import { cacheLife, cacheTag } from "next/cache";
import {
  fixturesCacheTag,
  globalDataCacheTag,
  leagueCacheTag,
  matchesCacheTag,
  paceSheetsCacheTag,
  targetPaceSheetsCacheTag,
} from "@/lib/cache-tags";
import { PRERENDER_SEASONS } from "@/lib/const/current";
import prisma from "@/lib/prisma";
import { targetKeyToFinish } from "@/lib/pace/target-key";

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

const prerenderSeasonKeys = new Set(
  PRERENDER_SEASONS.map(({ league, year }) => `${league}:${year}`),
);

function shouldCacheSeasonData(league: string, year: number): boolean {
  return prerenderSeasonKeys.has(`${league}:${year}`);
}

function shouldCachePaceSheetData(
  league: string,
  year: number,
  targetFinish: number,
): boolean {
  return (
    shouldCacheSeasonData(league, year) &&
    targetKeyToFinish(league).champion === targetFinish
  );
}

async function findMatches(
  league: string,
  year: number,
  args: MatchFindManyArgs,
): Promise<Match[]> {
  return prisma.match.findMany({
    ...args,
    where: { AND: [{ league, year }, args.where ?? {}] },
  });
}

async function fetchCachedMatches(
  league: string,
  year: number,
  args: MatchFindManyArgs = {},
): Promise<Match[]> {
  "use cache";
  cacheLife("max");
  cacheTag(
    globalDataCacheTag,
    leagueCacheTag(league, year),
    matchesCacheTag(league, year),
  );

  return findMatches(league, year, args);
}

export async function fetchMatches(
  league: string,
  year: number,
  args: MatchFindManyArgs = {},
): Promise<Match[]> {
  if (shouldCacheSeasonData(league, year)) {
    return fetchCachedMatches(league, year, args);
  }
  return findMatches(league, year, args);
}

async function findFixtures(
  league: string,
  year: number,
  args: FixtureFindManyArgs,
): Promise<Fixture[]> {
  return prisma.fixture.findMany({
    ...args,
    where: { AND: [{ league, year }, args.where ?? {}] },
  });
}

async function fetchCachedFixtures(
  league: string,
  year: number,
  args: FixtureFindManyArgs = {},
): Promise<Fixture[]> {
  "use cache";
  cacheLife("max");
  cacheTag(
    globalDataCacheTag,
    leagueCacheTag(league, year),
    fixturesCacheTag(league, year),
  );

  return findFixtures(league, year, args);
}

export async function fetchFixtures(
  league: string,
  year: number,
  args: FixtureFindManyArgs = {},
): Promise<Fixture[]> {
  if (shouldCacheSeasonData(league, year)) {
    return fetchCachedFixtures(league, year, args);
  }
  return findFixtures(league, year, args);
}

async function findPaceSheetEntries(
  league: string,
  year: number,
  targetFinish: number,
  args: PaceSheetEntryFindManyArgs,
): Promise<PaceSheetEntry[]> {
  return prisma.paceSheetEntry.findMany({
    ...args,
    where: {
      AND: [{ league, year, teamFinish: targetFinish }, args.where ?? {}],
    },
  });
}

async function fetchCachedPaceSheetEntries(
  league: string,
  year: number,
  targetFinish: number,
  args: PaceSheetEntryFindManyArgs = {},
): Promise<PaceSheetEntry[]> {
  "use cache";
  cacheLife("max");
  cacheTag(
    globalDataCacheTag,
    paceSheetsCacheTag(league, year),
    targetPaceSheetsCacheTag(league, year, targetFinish),
  );

  return findPaceSheetEntries(league, year, targetFinish, args);
}

export async function fetchPaceSheetEntries(
  league: string,
  year: number,
  targetFinish: number,
  args: PaceSheetEntryFindManyArgs = {},
): Promise<PaceSheetEntry[]> {
  if (shouldCachePaceSheetData(league, year, targetFinish)) {
    return fetchCachedPaceSheetEntries(league, year, targetFinish, args);
  }
  return findPaceSheetEntries(league, year, targetFinish, args);
}

export async function fetchTeamColors(): Promise<TeamColor[]> {
  return prisma.teamColor.findMany();
}
