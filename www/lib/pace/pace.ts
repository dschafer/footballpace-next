import { Match } from "@prisma/client";
import { fetchProjectedStandings } from "./projections";
import leagues from "../const/leagues";
import prisma from "@/lib/prisma";

export type PaceMatch = {
  match: Match;
  dateString: string;
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
};

export type PaceTeam = {
  team: string;
  paceMatches: PaceMatch[];
  points: number;
  pace: number;
  delta: number;
  league: string;
  year: number;
};

export async function fetchPaceTeams(
  league: string,
  year: number,
): Promise<PaceTeam[]> {
  const [projectedStandings, allMatches, allPaceSheets] = await Promise.all([
    fetchProjectedStandings(league, year),
    prisma.match.findMany({
      where: { league: league, year: year },
      orderBy: { date: "asc" },
    }),
    prisma.paceSheetEntry.findMany({
      where: { league: league, year: year, teamFinish: 1 },
    }),
  ]);

  const teamToFinish = new Map(
    projectedStandings.map(({ team }, i) => [team, i + 1]),
  );
  const paceSheetMap = new Map(
    allPaceSheets.map(({ opponentFinish, home, expectedPoints }) => [
      `${opponentFinish}_${home}`,
      expectedPoints,
    ]),
  );

  let paceTeams: PaceTeam[] = projectedStandings
    .map(({ team }) => {
      const teamFinish = teamToFinish.get(team)!;
      let paceMatches = [];
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
        const dateString = match.date.toLocaleDateString([], {
          timeZone: leagues.get(league)?.tz,
        });
        paceMatches.push({
          match,
          dateString,
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
