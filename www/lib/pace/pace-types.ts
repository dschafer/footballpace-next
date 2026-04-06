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
