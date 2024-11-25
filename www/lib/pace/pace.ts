import type { Fixture, Match } from "@prisma/client";
import { fetchProjectedStandings } from "./projections";
import prisma from "@/lib/prisma";

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
  league: string;
  year: number;
}

export async function fetchPaceTeams(
  league: string,
  year: number,
): Promise<PaceTeam[]> {
  const [projectedStandings, allMatches, paceSheetMap] = await Promise.all([
    fetchProjectedStandings(league, year),
    prisma.match.findMany({
      where: { league: league, year: year },
      orderBy: { date: "asc" },
    }),
    fetchPaceSheetMap(league, year),
  ]);

  const teamToFinish = new Map(
    projectedStandings.map(({ team }, i) => [team, i + 1]),
  );

  const paceTeams: PaceTeam[] = projectedStandings
    .map(({ team }) => {
      const teamFinish = teamToFinish.get(team)!;
      const paceMatches = [];
      let cumulativeExpectedPoints = 0;
      let cumulativeDelta = 0;
      let cumulativePoints = 0;
      for (const match of allMatches) {
        if (match.homeTeam != team && match.awayTeam != team) {
          continue;
        }
        const opponent =
          team == match.homeTeam ? match.awayTeam : match.homeTeam;
        const home = team == match.homeTeam;
        const opponentActualFinish = teamToFinish.get(opponent)!;
        const points =
          match.ftResult == "D"
            ? 1
            : (match.ftResult == "H" && home) ||
                (match.ftResult == "A" && !home)
              ? 3
              : 0;
        const opponentFinish =
          opponentActualFinish < teamFinish
            ? opponentActualFinish + 1
            : opponentActualFinish;
        const expectedPoints = paceSheetMap.get(`${opponentFinish}_${home}`)!;
        const delta = points - expectedPoints;
        cumulativePoints += points;
        cumulativeExpectedPoints += expectedPoints;
        cumulativeDelta += delta;
        paceMatches.push({
          match,
          team,
          opponent,
          home,
          opponentFinish,
          opponentActualFinish,
          points,
          cumulativePoints,
          expectedPoints,
          cumulativeExpectedPoints,
          delta,
          cumulativeDelta,
        });
      }

      const delta = paceMatches[paceMatches.length - 1].cumulativeDelta;
      const pace = paceMatches[paceMatches.length - 1].cumulativeExpectedPoints;
      const points = paceMatches[paceMatches.length - 1].cumulativePoints;
      return { team, paceMatches, points, pace, delta, league, year };
    })
    .sort((a, b) => b.delta - a.delta || b.points - a.points);

  return paceTeams;
}

export function matchDescription({ home, opponentFinish }: PaceMatch): string {
  return (home ? "Home vs " : "Away to ") + opponentFinish;
}

async function fetchPaceSheetMap(
  league: string,
  year: number,
): Promise<Map<string, number>> {
  const allPaceSheets = await prisma.paceSheetEntry.findMany({
    where: { league: league, year: year, teamFinish: 1 },
  });
  return new Map(
    allPaceSheets.map(({ opponentFinish, home, expectedPoints }) => [
      `${opponentFinish}_${home}`,
      expectedPoints,
    ]),
  );
}

export async function fetchPaceFixtures(
  league: string,
  year: number,
  team: string,
): Promise<PaceFixture[]> {
  const [projectedStandings, allFixtures, paceSheetMap] = await Promise.all([
    fetchProjectedStandings(league, year),
    prisma.fixture.findMany({
      where: { league: league, year: year },
      orderBy: { kickoffTime: "asc" },
    }),
    fetchPaceSheetMap(league, year),
  ]);

  const teamToFinish = new Map(
    projectedStandings.map(({ team }, i) => [team, i + 1]),
  );

  const teamFinish = teamToFinish.get(team)!;
  const paceFixtures: PaceFixture[] = [];
  let cumulativeExpectedPoints = 0;
  for (const fixture of allFixtures) {
    if (fixture.homeTeam != team && fixture.awayTeam != team) {
      continue;
    }
    const opponent =
      team == fixture.homeTeam ? fixture.awayTeam : fixture.homeTeam;
    const home = team == fixture.homeTeam;
    const opponentActualFinish = teamToFinish.get(opponent)!;
    const opponentFinish =
      opponentActualFinish < teamFinish
        ? opponentActualFinish + 1
        : opponentActualFinish;
    const expectedPoints = paceSheetMap.get(`${opponentFinish}_${home}`)!;
    cumulativeExpectedPoints += expectedPoints;
    paceFixtures.push({
      fixture,
      expectedPoints,
      cumulativeExpectedPoints,
      home,
      team,
      opponent,
      opponentFinish,
    });
  }
  return paceFixtures;
}
