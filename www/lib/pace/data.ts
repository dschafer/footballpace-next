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
  leagueCacheTag,
  matchesCacheTag,
  paceSheetsCacheTag,
  targetPaceSheetsCacheTag,
} from "@/lib/cache-tags";
import { PRERENDER_SEASONS } from "@/lib/const/current";
import { connection } from "next/server";
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
  PRERENDER_SEASONS.flatMap(({ league, year }) => [
    `${league}:${year}`,
    `${league}:${Number(year) - 1}`,
  ]),
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

export async function fetchCachedMatches(
  league: string,
  year: number,
  args: MatchFindManyArgs = {},
): Promise<Match[]> {
  "use cache";
  cacheLife("max");
  cacheTag(leagueCacheTag(league, year), matchesCacheTag(league, year));

  return prisma.match.findMany({
    ...args,
    where: { AND: [{ league, year }, args.where ?? {}] },
  });
}

export async function fetchMatches(
  league: string,
  year: number,
  args: MatchFindManyArgs = {},
): Promise<Match[]> {
  if (!shouldCacheSeasonData(league, year)) {
    await connection();
  }
  return fetchCachedMatches(league, year, args);
}

export async function fetchCachedFixtures(
  league: string,
  year: number,
  args: FixtureFindManyArgs = {},
): Promise<Fixture[]> {
  "use cache";
  cacheLife("max");
  cacheTag(leagueCacheTag(league, year), fixturesCacheTag(league, year));

  return prisma.fixture.findMany({
    ...args,
    where: { AND: [{ league, year }, args.where ?? {}] },
  });
}

export async function fetchFixtures(
  league: string,
  year: number,
  args: FixtureFindManyArgs = {},
): Promise<Fixture[]> {
  if (!shouldCacheSeasonData(league, year)) {
    await connection();
  }
  return fetchCachedFixtures(league, year, args);
}

export async function fetchCachedPaceSheetEntries(
  league: string,
  year: number,
  targetFinish: number,
  args: PaceSheetEntryFindManyArgs = {},
): Promise<PaceSheetEntry[]> {
  "use cache";
  cacheLife("max");
  cacheTag(
    paceSheetsCacheTag(league, year),
    targetPaceSheetsCacheTag(league, year, targetFinish),
  );

  return prisma.paceSheetEntry.findMany({
    ...args,
    where: {
      AND: [{ league, year, teamFinish: targetFinish }, args.where ?? {}],
    },
  });
}

export async function fetchPaceSheetEntries(
  league: string,
  year: number,
  targetFinish: number,
  args: PaceSheetEntryFindManyArgs = {},
): Promise<PaceSheetEntry[]> {
  if (!shouldCachePaceSheetData(league, year, targetFinish)) {
    await connection();
  }
  return fetchCachedPaceSheetEntries(league, year, targetFinish, args);
}

async function fetchCachedTeamColors(): Promise<TeamColor[]> {
  "use cache";
  cacheLife("max");

  return prisma.teamColor.findMany();
}

export async function fetchTeamColors(): Promise<TeamColor[]> {
  return fetchCachedTeamColors();
}
