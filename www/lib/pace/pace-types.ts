import type { Fixture, Match } from "@/prisma/generated/client";

export interface PaceFixture {
  fixture: Fixture;
  expectedPoints: number;
  cumulativeExpectedPoints: number;
  home: boolean;
  team: string;
  opponent: string;
  opponentFinish: number;
}

export interface PaceMatch {
  match: Match;
  delta: number;
  cumulativeDelta: number;
  points: number;
  cumulativePoints: number;
  expectedPoints: number;
  cumulativeExpectedPoints: number;
  home: boolean;
  team: string;
  opponent: string;
  opponentFinish: number;
}

export interface PaceTeam {
  team: string;
  paceMatches: PaceMatch[];
  points: number;
  pace: number;
  delta: number;
  gap: { gapAmount: number; gapTeam: string } | null;
  interval: { intervalAmount: number; intervalTeam: string } | null;
  league: string;
  year: number;
}

export function matchDescription({ home, opponentFinish }: PaceMatch): string {
  return (home ? "Home vs " : "Away to ") + opponentFinish;
}

export function slicePaceTeamsStart<T>(
  paceTeams: T[],
  teamCount: number,
  targetFinish: number,
): number {
  if (targetFinish - teamCount < 0) {
    return 0;
  } else if (targetFinish + teamCount > paceTeams.length) {
    return paceTeams.length - teamCount;
  } else {
    return targetFinish - teamCount / 2;
  }
}

export function slicePaceTeams<T>(
  paceTeams: T[],
  teamCount: number,
  targetFinish: number,
): T[] {
  const start = slicePaceTeamsStart(paceTeams, teamCount, targetFinish);
  return paceTeams.slice(start, start + teamCount);
}
